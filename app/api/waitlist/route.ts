import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { WaitlistSchema, validateInput } from "@/lib/validators";
import { checkAndConsumeRateLimit } from "@/lib/supabase/rate-limit";
import { logAudit } from "@/lib/supabase/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = validateInput(WaitlistSchema, body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error },
        { status: 400 }
      );
    }

    // Rate limit by IP (no auth needed for waitlist)
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const allowed = await checkAndConsumeRateLimit(ip, "waitlist");
    if (!allowed) {
      return NextResponse.json(
        { error: "Muitos pedidos. Tenta novamente amanhã." },
        { status: 429 }
      );
    }

    const supabase = createServerClient();
    const { error } = await supabase
      .from("waitlist")
      .insert({ email: parsed.data.email });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Este email já está na lista!" },
          { status: 409 }
        );
      }
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Erro ao guardar. Tenta novamente." },
        { status: 500 }
      );
    }

    logAudit({
      action: "waitlist.join",
      userId: ip,
      metadata: { email: parsed.data.email },
    });

    return NextResponse.json(
      { message: "Estás na lista! Avisamos quando lançarmos." },
      { status: 200 }
    );
  } catch (err) {
    console.error("Waitlist error:", err);
    return NextResponse.json(
      { error: "Erro interno. Tenta novamente." },
      { status: 500 }
    );
  }
}
