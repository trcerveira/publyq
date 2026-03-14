import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserProgress, syncUserProfile, repairProgressFlags } from "@/lib/supabase/user-profiles";

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

    // Auto-repair flags for users who completed steps before pipeline fix
    await repairProgressFlags(userId);

    const progress = await getUserProgress(userId);

    return NextResponse.json(progress);
  } catch (err) {
    console.error("Progress error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
