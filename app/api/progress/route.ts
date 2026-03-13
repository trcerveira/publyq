import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserProgress, syncUserProfile } from "@/lib/supabase/user-profiles";

export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Sync profile on every dashboard load
    const email = (sessionClaims?.email as string) ?? "";
    const name = (sessionClaims?.name as string) ?? null;
    await syncUserProfile({ userId, email, name });

    const progress = await getUserProgress(userId);

    return NextResponse.json(progress);
  } catch (err) {
    console.error("Progress error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
