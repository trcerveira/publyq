import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { syncUserProfile } from "@/lib/supabase/user-profiles";
import { logAudit } from "@/lib/supabase/audit";

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("CLERK_WEBHOOK_SECRET not set");
    return new Response("Server misconfigured", { status: 500 });
  }

  // Read headers required by Svix
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.text();

  // Verify signature
  let evt: WebhookEvent;
  try {
    const wh = new Webhook(secret);
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  // Handle user.created and user.updated
  if (evt.type === "user.created" || evt.type === "user.updated") {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses?.[0]?.email_address;

    if (!email) {
      console.error("Webhook event missing email:", id);
      return new Response("Missing email", { status: 400 });
    }

    const name = [first_name, last_name].filter(Boolean).join(" ") || null;

    const result = await syncUserProfile({
      userId: id,
      email,
      name,
    });

    // Fire-and-forget audit
    logAudit({
      userId: id,
      action: "user.sync",
      metadata: { event: evt.type, email },
      success: !!result,
    });
  }

  return new Response("OK", { status: 200 });
}
