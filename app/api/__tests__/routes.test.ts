import { describe, it, expect, vi, beforeEach } from "vitest";

// ============================================================
// Tests for API route input validation, auth checks, and rate limiting
// Tests the building blocks used by all API routes
// ============================================================

// ── Mock Supabase ─────────────────────────────────────────────

const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null });
const mockHead = vi.fn().mockResolvedValue({ count: 0, error: null });
const mockEq = vi.fn((): Record<string, unknown> => ({
  maybeSingle: mockMaybeSingle,
  eq: mockEq,
  gte: mockGte,
  head: mockHead,
}));
const mockGte = vi.fn(() => ({ head: mockHead }));
const mockSelect = vi.fn(() => ({ eq: mockEq, count: "exact" }));
const mockInsert = vi.fn().mockResolvedValue({ error: null });

const mockFrom = vi.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({ from: mockFrom }),
}));

// ── Rate Limiting Tests ───────────────────────────────────────

const { checkAndConsumeRateLimit } = await import("@/lib/supabase/rate-limit");

describe("checkAndConsumeRateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset chain: select → eq → eq → gte returns count via head-like mock
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ eq: mockEq, maybeSingle: mockMaybeSingle, gte: mockGte });
    mockGte.mockReturnValue({ count: 0, error: null });
    mockInsert.mockResolvedValue({ error: null });
  });

  it("allows request when under the limit", async () => {
    // count = 0, within the limit
    mockGte.mockResolvedValue({ count: 0, error: null });

    const result = await checkAndConsumeRateLimit("user_test", "editorial");

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBeGreaterThanOrEqual(0);
  });

  it("blocks request when at the daily limit", async () => {
    // Simulate count = 5 for editorial (limit is 5)
    mockGte.mockResolvedValue({ count: 5, error: null });

    const result = await checkAndConsumeRateLimit("user_limited", "editorial");

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("returns correct limit for brand-dna (5/day)", async () => {
    mockGte.mockResolvedValue({ count: 0, error: null });

    const result = await checkAndConsumeRateLimit("user_test", "brand-dna");

    expect(result.limit).toBe(5);
  });

  it("returns correct limit for voice-dna (5/day)", async () => {
    mockGte.mockResolvedValue({ count: 0, error: null });

    const result = await checkAndConsumeRateLimit("user_test", "voice-dna");

    expect(result.limit).toBe(5);
  });

  it("returns correct limit for editorial (5/day)", async () => {
    mockGte.mockResolvedValue({ count: 0, error: null });

    const result = await checkAndConsumeRateLimit("user_test", "editorial");

    expect(result.limit).toBe(5);
  });

  it("returns correct limit for carousel (20/day)", async () => {
    mockGte.mockResolvedValue({ count: 0, error: null });

    const result = await checkAndConsumeRateLimit("user_test", "carousel");

    expect(result.limit).toBe(20);
  });

  it("defaults to 10/day for unknown endpoint", async () => {
    mockGte.mockResolvedValue({ count: 0, error: null });

    const result = await checkAndConsumeRateLimit("user_test", "unknown-endpoint");

    expect(result.limit).toBe(10);
  });

  it("returns a resetAt timestamp", async () => {
    mockGte.mockResolvedValue({ count: 0, error: null });

    const result = await checkAndConsumeRateLimit("user_test", "editorial");

    expect(result.resetAt).toBeTruthy();
    // Should be a valid ISO date string
    expect(new Date(result.resetAt).toISOString()).toBe(result.resetAt);
  });

  it("allows request when Supabase returns an error (fail-open)", async () => {
    mockGte.mockResolvedValue({ count: null, error: new Error("DB error") });

    const result = await checkAndConsumeRateLimit("user_err", "editorial");

    // Fail-open: allow the request
    expect(result.allowed).toBe(true);
  });
});

// ── Audit Logging Tests ───────────────────────────────────────

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({ from: mockFrom }),
}));

const { logAudit } = await import("@/lib/supabase/audit");

describe("logAudit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
  });

  it("inserts audit entry into audit_log table", async () => {
    await logAudit({
      userId: "user_audit",
      action: "editorial.generate",
      metadata: { linesCount: 5 },
    });

    expect(mockFrom).toHaveBeenCalledWith("audit_log");
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user_audit",
        action: "editorial.generate",
        metadata: { linesCount: 5 },
        success: true,
      })
    );
  });

  it("logs failure with error message", async () => {
    await logAudit({
      userId: "user_fail",
      action: "editorial.confirm",
      success: false,
      errorMsg: "Something went wrong",
    });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error_msg: "Something went wrong",
      })
    );
  });

  it("does not throw when Supabase insert fails", async () => {
    mockInsert.mockRejectedValue(new Error("Insert failed"));

    await expect(
      logAudit({
        userId: "user_err",
        action: "carousel.generate",
      })
    ).resolves.not.toThrow();
  });

  it("defaults success to true when not provided", async () => {
    await logAudit({
      userId: "user_default",
      action: "brand_dna.generate",
    });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  it("defaults metadata to null when not provided", async () => {
    await logAudit({
      userId: "user_nometa",
      action: "voice_dna.save",
    });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: null })
    );
  });
});
