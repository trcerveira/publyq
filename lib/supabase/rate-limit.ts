import { createServerClient } from "@/lib/supabase/server";

// ============================================================
// Rate Limiting — Claude API consumption control
// DB-based (Supabase) to work in serverless environments
// ============================================================

// Per-user daily limits (UTC)
const DAILY_LIMITS: Record<string, number> = {
  "brand-dna":   5,   // AI-intensive, one-time setup
  "voice-dna":   5,   // AI-intensive, one-time setup
  "editorial":   5,   // AI-intensive, one-time setup
  "carousel":    20,  // Core feature, batch creation
  "kaizen":      10,  // Analysis endpoint
  "waitlist":     5,  // Public, spam prevention
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: string;
}

function getTodayWindowStart(): string {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  return now.toISOString();
}

function getTodayWindowEnd(): string {
  const now = new Date();
  now.setUTCHours(23, 59, 59, 999);
  return now.toISOString();
}

export async function checkAndConsumeRateLimit(
  userId: string,
  endpoint: string
): Promise<RateLimitResult> {
  const limit = DAILY_LIMITS[endpoint] ?? 10;
  const windowStart = getTodayWindowStart();

  const supabase = createServerClient();

  try {
    const { count, error: countError } = await supabase
      .from("rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("endpoint", endpoint)
      .gte("created_at", windowStart);

    if (countError) {
      console.error("Error checking rate limit:", countError);
      return { allowed: true, remaining: limit, limit, resetAt: getTodayWindowEnd() };
    }

    const used = count ?? 0;

    if (used >= limit) {
      return {
        allowed: false,
        remaining: 0,
        limit,
        resetAt: getTodayWindowEnd(),
      };
    }

    await supabase
      .from("rate_limits")
      .insert({ user_id: userId, endpoint });

    return {
      allowed: true,
      remaining: limit - used - 1,
      limit,
      resetAt: getTodayWindowEnd(),
    };
  } catch (error) {
    console.error("Unexpected error in rate limiter:", error);
    return { allowed: true, remaining: limit, limit, resetAt: getTodayWindowEnd() };
  }
}

export function rateLimitResponse(result: RateLimitResult) {
  return {
    error: `Limite diário atingido. Tens ${result.limit} por dia. Tenta amanhã.`,
    limit: result.limit,
    remaining: 0,
    resetAt: result.resetAt,
  };
}
