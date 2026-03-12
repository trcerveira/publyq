import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase not configured");
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email?.trim()?.toLowerCase();

    if (!email || !email.includes("@") || !email.includes(".")) {
      return NextResponse.json(
        { error: "Invalid email." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { error } = await supabase
      .from("waitlist")
      .insert({ email });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "This email is already on the list!" },
          { status: 409 }
        );
      }
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to save. Try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Added to the waitlist!" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Waitlist error:", err);
    return NextResponse.json(
      { error: "Internal error. Try again." },
      { status: 500 }
    );
  }
}
