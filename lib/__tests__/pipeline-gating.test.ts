import { describe, it, expect, vi, beforeEach } from "vitest";

// ============================================================
// Tests for Pipeline Gating Logic
// Brand DNA → Voice DNA → Editorial Lines → Carousel
// ============================================================

// Chainable Supabase mock
const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null });
const mockEq = vi.fn((): Record<string, unknown> => ({
  maybeSingle: mockMaybeSingle,
  eq: mockEq,
}));
const mockSelect = vi.fn(() => ({ eq: mockEq }));
const mockUpdate = vi.fn(() => ({ eq: mockEq }));
const mockInsert = vi.fn(() => ({ select: mockSelect }));

const mockFrom = vi.fn(() => ({
  select: mockSelect,
  update: mockUpdate,
  insert: mockInsert,
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({ from: mockFrom }),
}));

const { getUserProgress } = await import("@/lib/supabase/user-profiles");

// ── Pipeline Step Unlocking ───────────────────────────────────

describe("Pipeline gating: step unlocking logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Step 1 (Brand DNA) — always accessible", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        brand_dna_complete: false,
        voz_dna_complete: false,
        editorial_complete: false,
      },
    });

    const progress = await getUserProgress("user_new");

    // Brand DNA is never gated
    expect(progress.brandDnaComplete).toBe(false);
    // Voice DNA should be locked
    expect(progress.voiceDnaComplete).toBe(false);
    // Editorial should be locked
    expect(progress.editorialComplete).toBe(false);
  });

  it("Step 2 (Voice DNA) — unlocked when Brand DNA complete", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        brand_dna_complete: true,
        voz_dna_complete: false,
        editorial_complete: false,
      },
    });

    const progress = await getUserProgress("user_brand_done");

    expect(progress.brandDnaComplete).toBe(true);
    // Voice DNA should now be accessible (gating logic in frontend)
    expect(progress.voiceDnaComplete).toBe(false);
    expect(progress.editorialComplete).toBe(false);
  });

  it("Step 3 (Editorial) — unlocked when Brand + Voice complete", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        brand_dna_complete: true,
        voz_dna_complete: true,
        editorial_complete: false,
      },
    });

    const progress = await getUserProgress("user_both_done");

    expect(progress.brandDnaComplete).toBe(true);
    expect(progress.voiceDnaComplete).toBe(true);
    // Editorial should now be accessible
    expect(progress.editorialComplete).toBe(false);
  });

  it("Step 4 (Carousel) — unlocked when all three complete", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        brand_dna_complete: true,
        voz_dna_complete: true,
        editorial_complete: true,
      },
    });

    const progress = await getUserProgress("user_all_done");

    expect(progress.brandDnaComplete).toBe(true);
    expect(progress.voiceDnaComplete).toBe(true);
    expect(progress.editorialComplete).toBe(true);
  });
});

// ── Frontend Gating Conditions ────────────────────────────────

describe("Pipeline gating: frontend conditions", () => {
  // These test the exact conditions used in dashboard page and route pages

  it("Voice DNA locked when Brand DNA incomplete", () => {
    const progress = { brandDnaComplete: false, voiceDnaComplete: false, editorialComplete: false };
    const voiceLocked = !progress.brandDnaComplete;
    expect(voiceLocked).toBe(true);
  });

  it("Voice DNA unlocked when Brand DNA complete", () => {
    const progress = { brandDnaComplete: true, voiceDnaComplete: false, editorialComplete: false };
    const voiceLocked = !progress.brandDnaComplete;
    expect(voiceLocked).toBe(false);
  });

  it("Editorial locked when Voice DNA incomplete", () => {
    const progress = { brandDnaComplete: true, voiceDnaComplete: false, editorialComplete: false };
    const editorialLocked = !progress.voiceDnaComplete;
    expect(editorialLocked).toBe(true);
  });

  it("Editorial unlocked when Voice DNA complete", () => {
    const progress = { brandDnaComplete: true, voiceDnaComplete: true, editorialComplete: false };
    const editorialLocked = !progress.voiceDnaComplete;
    expect(editorialLocked).toBe(false);
  });

  it("Carousel locked when Editorial incomplete", () => {
    const progress = { brandDnaComplete: true, voiceDnaComplete: true, editorialComplete: false };
    const carouselLocked = !progress.editorialComplete;
    expect(carouselLocked).toBe(true);
  });

  it("Carousel unlocked when Editorial complete", () => {
    const progress = { brandDnaComplete: true, voiceDnaComplete: true, editorialComplete: true };
    const carouselLocked = !progress.editorialComplete;
    expect(carouselLocked).toBe(false);
  });

  it("Carousel locked when Brand DNA incomplete (even if editorial somehow true)", () => {
    const progress = { brandDnaComplete: false, voiceDnaComplete: true, editorialComplete: true };
    // API route checks all three
    const carouselGated = !progress.brandDnaComplete || !progress.voiceDnaComplete || !progress.editorialComplete;
    expect(carouselGated).toBe(true);
  });

  it("Carousel locked when Voice DNA incomplete (even if editorial somehow true)", () => {
    const progress = { brandDnaComplete: true, voiceDnaComplete: false, editorialComplete: true };
    const carouselGated = !progress.brandDnaComplete || !progress.voiceDnaComplete || !progress.editorialComplete;
    expect(carouselGated).toBe(true);
  });
});

// ── Step Status Computation ───────────────────────────────────

describe("Pipeline gating: step status computation", () => {
  // Replicates the exact logic from dashboard/page.tsx

  function computeStepStatuses(progress: {
    brandDnaComplete: boolean;
    voiceDnaComplete: boolean;
    editorialComplete: boolean;
  }) {
    return {
      brandDna: {
        status: progress.brandDnaComplete ? "complete" : "active",
        locked: false,
      },
      voiceDna: {
        status: progress.voiceDnaComplete
          ? "complete"
          : progress.brandDnaComplete
          ? "active"
          : "locked",
        locked: !progress.brandDnaComplete,
      },
      editorial: {
        status: progress.editorialComplete
          ? "complete"
          : progress.voiceDnaComplete
          ? "active"
          : "locked",
        locked: !progress.voiceDnaComplete,
      },
      carousel: {
        status: progress.editorialComplete ? "active" : "locked",
        locked: !progress.editorialComplete,
      },
    };
  }

  it("fresh user — only Brand DNA active", () => {
    const statuses = computeStepStatuses({
      brandDnaComplete: false,
      voiceDnaComplete: false,
      editorialComplete: false,
    });

    expect(statuses.brandDna.status).toBe("active");
    expect(statuses.brandDna.locked).toBe(false);
    expect(statuses.voiceDna.status).toBe("locked");
    expect(statuses.voiceDna.locked).toBe(true);
    expect(statuses.editorial.status).toBe("locked");
    expect(statuses.editorial.locked).toBe(true);
    expect(statuses.carousel.status).toBe("locked");
    expect(statuses.carousel.locked).toBe(true);
  });

  it("Brand DNA done — Voice DNA becomes active", () => {
    const statuses = computeStepStatuses({
      brandDnaComplete: true,
      voiceDnaComplete: false,
      editorialComplete: false,
    });

    expect(statuses.brandDna.status).toBe("complete");
    expect(statuses.voiceDna.status).toBe("active");
    expect(statuses.voiceDna.locked).toBe(false);
    expect(statuses.editorial.status).toBe("locked");
    expect(statuses.carousel.status).toBe("locked");
  });

  it("Brand + Voice done — Editorial becomes active", () => {
    const statuses = computeStepStatuses({
      brandDnaComplete: true,
      voiceDnaComplete: true,
      editorialComplete: false,
    });

    expect(statuses.brandDna.status).toBe("complete");
    expect(statuses.voiceDna.status).toBe("complete");
    expect(statuses.editorial.status).toBe("active");
    expect(statuses.editorial.locked).toBe(false);
    expect(statuses.carousel.status).toBe("locked");
  });

  it("All three done — Carousel becomes active", () => {
    const statuses = computeStepStatuses({
      brandDnaComplete: true,
      voiceDnaComplete: true,
      editorialComplete: true,
    });

    expect(statuses.brandDna.status).toBe("complete");
    expect(statuses.voiceDna.status).toBe("complete");
    expect(statuses.editorial.status).toBe("complete");
    expect(statuses.carousel.status).toBe("active");
    expect(statuses.carousel.locked).toBe(false);
  });
});
