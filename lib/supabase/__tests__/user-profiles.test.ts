import { describe, it, expect, vi, beforeEach } from "vitest";

// ============================================================
// Tests for user-profiles (getUserProgress, editorial functions)
// ============================================================

// Chainable Supabase mock
const mockSingle = vi.fn().mockResolvedValue({ data: null });
const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null });
const mockIs = vi.fn(() => ({ order: mockOrder }));
const mockOrder = vi.fn(() => ({ data: [] }));
const mockEq = vi.fn((): Record<string, unknown> => ({
  maybeSingle: mockMaybeSingle,
  single: mockSingle,
  eq: mockEq,
  select: mockSelect,
  is: mockIs,
}));
const mockSelect = vi.fn(() => ({ eq: mockEq, single: mockSingle }));
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

const {
  getUserProgress,
  markBrandDnaComplete,
  markVoiceDnaComplete,
  markEditorialComplete,
  saveEditorialLines,
  getEditorialLines,
} = await import("../user-profiles");

describe("getUserProgress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMaybeSingle.mockResolvedValue({ data: null });
  });

  it("returns all three progress flags", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        brand_dna_complete: true,
        voz_dna_complete: true,
        editorial_complete: false,
      },
    });

    const progress = await getUserProgress("user_abc123");

    expect(progress).toEqual({
      brandDnaComplete: true,
      voiceDnaComplete: true,
      editorialComplete: false,
    });
  });

  it("returns all false when no profile exists", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null });

    const progress = await getUserProgress("user_nonexistent");

    expect(progress).toEqual({
      brandDnaComplete: false,
      voiceDnaComplete: false,
      editorialComplete: false,
    });
  });

  it("returns editorialComplete true when DB flag is true", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        brand_dna_complete: true,
        voz_dna_complete: true,
        editorial_complete: true,
      },
    });

    const progress = await getUserProgress("user_full");

    expect(progress.editorialComplete).toBe(true);
  });

  it("queries the user_profiles table", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null });

    await getUserProgress("user_test");

    expect(mockFrom).toHaveBeenCalledWith("user_profiles");
  });

  it("filters by the correct user_id", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null });

    await getUserProgress("user_specific");

    expect(mockEq).toHaveBeenCalledWith("user_id", "user_specific");
  });
});

describe("markBrandDnaComplete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates existing user_profiles row with brand_dna_complete true", async () => {
    mockMaybeSingle.mockResolvedValue({ data: { user_id: "user_brand" } });
    await markBrandDnaComplete("user_brand");

    expect(mockFrom).toHaveBeenCalledWith("user_profiles");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ brand_dna_complete: true })
    );
  });

  it("inserts new row if user_profiles does not exist", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null });
    await markBrandDnaComplete("user_new");

    expect(mockFrom).toHaveBeenCalledWith("user_profiles");
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: "user_new", brand_dna_complete: true })
    );
  });
});

describe("markVoiceDnaComplete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates existing user_profiles row with voz_dna_complete true", async () => {
    mockMaybeSingle.mockResolvedValue({ data: { user_id: "user_voice" } });
    await markVoiceDnaComplete("user_voice");

    expect(mockFrom).toHaveBeenCalledWith("user_profiles");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ voz_dna_complete: true })
    );
  });

  it("inserts new row if user_profiles does not exist", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null });
    await markVoiceDnaComplete("user_new");

    expect(mockFrom).toHaveBeenCalledWith("user_profiles");
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: "user_new", voz_dna_complete: true })
    );
  });
});

describe("markEditorialComplete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates existing user_profiles row with editorial_complete true", async () => {
    mockMaybeSingle.mockResolvedValue({ data: { user_id: "user_edit" } });
    await markEditorialComplete("user_edit");

    expect(mockFrom).toHaveBeenCalledWith("user_profiles");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ editorial_complete: true })
    );
  });

  it("inserts new row if user_profiles does not exist", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null });
    await markEditorialComplete("user_new");

    expect(mockFrom).toHaveBeenCalledWith("user_profiles");
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: "user_new", editorial_complete: true })
    );
  });
});

describe("saveEditorialLines", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMaybeSingle.mockResolvedValue({ data: null });
  });

  it("inserts new editorial lines when none exist", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null });

    const lines = [{ id: "p1", nome: "Test", proposito: "D", funcao: "educar", emocao: "curiosidade", temas: ["a"], percentagem: 100 }];
    await saveEditorialLines("user_new", lines, "Summary", "draft");

    expect(mockFrom).toHaveBeenCalledWith("editorial_lines");
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user_new",
        lines,
        resumo: "Summary",
        status: "draft",
      })
    );
  });

  it("updates existing editorial lines when record exists", async () => {
    mockMaybeSingle.mockResolvedValue({ data: { id: "uuid-1", version: 2 } });

    const lines = [{ id: "p1", nome: "Updated", proposito: "D", funcao: "educar", emocao: "curiosidade", temas: ["b"], percentagem: 100 }];
    await saveEditorialLines("user_existing", lines, "Updated summary", "draft");

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        lines,
        resumo: "Updated summary",
        status: "draft",
        version: 3,
      })
    );
  });

  it("calls markEditorialComplete when status is confirmed", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null });

    const lines = [{ id: "p1", nome: "Final", proposito: "D", funcao: "educar", emocao: "curiosidade", temas: ["x"], percentagem: 100 }];
    await saveEditorialLines("user_confirm", lines, "Final", "confirmed");

    // Should have been called with user_profiles to mark complete
    const userProfilesCalls = mockFrom.mock.calls.filter(
      (call: string[]) => call[0] === "user_profiles"
    );
    expect(userProfilesCalls.length).toBeGreaterThan(0);
  });

  it("does NOT call markEditorialComplete when status is draft", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null });

    const lines = [{ id: "p1", nome: "Draft", proposito: "D", funcao: "educar", emocao: "curiosidade", temas: ["y"], percentagem: 100 }];
    await saveEditorialLines("user_draft", lines, "Draft", "draft");

    // Only editorial_lines should be called, not user_profiles for marking complete
    const calls = mockFrom.mock.calls.map((call: string[]) => call[0]);
    // First call is editorial_lines (select), second is editorial_lines (insert)
    // There should be NO user_profiles call for markEditorialComplete
    const userProfilesCalls = calls.filter((c: string) => c === "user_profiles");
    expect(userProfilesCalls.length).toBe(0);
  });
});

describe("getEditorialLines", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMaybeSingle.mockResolvedValue({ data: null });
  });

  it("returns null when no editorial lines exist", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null });

    const result = await getEditorialLines("user_empty");

    expect(result).toBeNull();
  });

  it("returns the record when editorial lines exist", async () => {
    const record = {
      id: "uuid-1",
      user_id: "user_has",
      lines: [{ id: "p1", nome: "Test", proposito: "D", funcao: "educar", emocao: "curiosidade", temas: ["a"], percentagem: 100 }],
      resumo: "Summary",
      status: "confirmed",
    };
    mockMaybeSingle.mockResolvedValue({ data: record });

    const result = await getEditorialLines("user_has");

    expect(result).toEqual(record);
  });

  it("queries the editorial_lines table", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null });

    await getEditorialLines("user_query");

    expect(mockFrom).toHaveBeenCalledWith("editorial_lines");
  });
});
