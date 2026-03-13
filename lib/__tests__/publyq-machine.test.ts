import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  BatchWeekSchema,
  BatchDaySchema,
  BatchResponseSchema,
  CarouselSlideSchema,
} from "@/lib/validators";
import { BATCH_SEQUENCE, buildBatchPrompt } from "@/lib/prompts/carousel-batch";
import type { BrandDNACard, VoiceDNACard, EditorialLine } from "@/lib/supabase/types";

// ============================================================
// PUBLYQ Machine — Comprehensive Test Suite
// Batch 7-day carousel generation
// ============================================================

// ── Test Fixtures ─────────────────────────────────────────────

const mockBrandCard: BrandDNACard = {
  clienteIdeal: {
    perfil: "Coaches e consultores com 3+ anos de experiência",
    dores: ["Invisibilidade online", "Sem tempo para conteúdo"],
    desejos: ["Autoridade no nicho", "Clientes orgânicos"],
    linguagem: ["transformar", "escalar"],
  },
  personagem: {
    historia: "De freelancer a referência do mercado",
    superpoder: "Simplificar o complexo",
    defeito: "Impaciente com desculpas",
    voz: "Directa e sem filtros",
  },
  bigIdea: {
    frase: "Um negócio de uma pessoa com impacto de dez",
    explicacao: "Alavancagem através de sistemas e AI",
  },
  inimigo: {
    quem: "Os gurus do marketing que vendem fórmulas mágicas",
    porque: "Criam dependência em vez de autonomia",
  },
  causaFutura: {
    movimento: "Solopreneurs autónomos e lucrativos",
    visao10anos: "1 milhão de solopreneurs a viver do que amam",
  },
  commandersIntent: "Tornar cada solopreneur visível e rentável em 90 dias",
  novaOportunidade: {
    diferencial: "AI + método comprovado = conteúdo na voz do cliente",
    reframe: "Não precisas de equipa, precisas de sistema",
  },
};

const mockVoiceCard: VoiceDNACard = {
  arquetipo: "O Mentor Pragmático",
  descricaoArquetipo: "Guia experiente que mostra o caminho sem rodeios",
  tomEmTresPalavras: ["directo", "prático", "provocador"],
  vocabularioActivo: ["sistema", "escalar", "construir", "transformar"],
  vocabularioProibido: ["impossível", "difícil", "talvez", "tentar"],
  frasesAssinatura: ["Faz o simples. Repete. Escala.", "Resultados, não desculpas."],
  regrasEstilo: ["Frases curtas", "Sem jargões", "Exemplos reais"],
};

const mockEditorialLines: EditorialLine[] = [
  { id: "pilar-1", nome: "Autoridade", descricao: "Posicionar como especialista", temas: ["dicas", "frameworks", "erros comuns"], percentagem: 30 },
  { id: "pilar-2", nome: "Bastidores", descricao: "Humanizar a marca", temas: ["processo", "rotina", "ferramentas"], percentagem: 20 },
  { id: "pilar-3", nome: "Educação", descricao: "Ensinar e dar valor", temas: ["tutoriais", "how-to", "checklists"], percentagem: 25 },
  { id: "pilar-4", nome: "Provocação", descricao: "Desafiar crenças", temas: ["mitos", "verdades incómodas"], percentagem: 15 },
  { id: "pilar-5", nome: "Prova Social", descricao: "Mostrar resultados", temas: ["casos", "testemunhos", "antes/depois"], percentagem: 10 },
];

// Helper: builds a valid 7-day batch response matching the expected format
function buildValidBatchResponse() {
  return {
    semana: BATCH_SEQUENCE.map((seq) => ({
      dia: seq.day,
      sequencia: seq.label,
      pilar: "Autoridade",
      angulo: seq.angulo,
      template: seq.template,
      tema: `Tema do dia ${seq.day}`,
      slides: Array.from({ length: 7 }, (_, i) => ({
        slideNumber: i + 1,
        headline: `Headline slide ${i + 1}`,
        body: `Body text for slide ${i + 1}`,
        imageQuery: "business coaching",
      })),
    })),
  };
}

// ============================================================
// 1) INPUT VALIDATION — Psychological Sequence + Pilar × Template × Ângulo
// ============================================================

describe("BatchWeekSchema — input validation", () => {
  it("accepts valid weekTheme", () => {
    const result = BatchWeekSchema.safeParse({ weekTheme: "Marca pessoal para coaches" });
    expect(result.success).toBe(true);
  });

  it("trims whitespace from weekTheme", () => {
    const result = BatchWeekSchema.safeParse({ weekTheme: "  Tema com espaços  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.weekTheme).toBe("Tema com espaços");
    }
  });

  it("rejects weekTheme shorter than 3 characters", () => {
    const result = BatchWeekSchema.safeParse({ weekTheme: "ab" });
    expect(result.success).toBe(false);
  });

  it("rejects weekTheme longer than 500 characters", () => {
    const result = BatchWeekSchema.safeParse({ weekTheme: "x".repeat(501) });
    expect(result.success).toBe(false);
  });

  it("rejects missing weekTheme", () => {
    const result = BatchWeekSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty string weekTheme", () => {
    const result = BatchWeekSchema.safeParse({ weekTheme: "" });
    expect(result.success).toBe(false);
  });
});

describe("BATCH_SEQUENCE — psychological sequence integrity", () => {
  it("has exactly 7 days", () => {
    expect(BATCH_SEQUENCE).toHaveLength(7);
  });

  it("days are numbered 1 through 7", () => {
    const days = BATCH_SEQUENCE.map((s) => s.day);
    expect(days).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("follows the correct psychological sequence", () => {
    const labels = BATCH_SEQUENCE.map((s) => s.label);
    expect(labels).toEqual([
      "Dor",
      "Inimigo",
      "Quebra de crença",
      "Solução",
      "Demonstração",
      "Prova social",
      "Convite",
    ]);
  });

  it("each day has a valid template", () => {
    const validTemplates = ["uncomfortable-truth", "invisible-mistake", "simple-system"];
    for (const day of BATCH_SEQUENCE) {
      expect(validTemplates).toContain(day.template);
    }
  });

  it("each day has a non-empty intent", () => {
    for (const day of BATCH_SEQUENCE) {
      expect(day.intent.length).toBeGreaterThan(10);
    }
  });

  it("each day has a valid CTA type", () => {
    const validCtas = ["comment", "send-friend", "link-bio"];
    for (const day of BATCH_SEQUENCE) {
      expect(validCtas).toContain(day.cta);
    }
  });

  it("each day has an angulo", () => {
    for (const day of BATCH_SEQUENCE) {
      expect(day.angulo.length).toBeGreaterThan(0);
    }
  });

  it("uses all 3 template types across the week", () => {
    const templates = new Set(BATCH_SEQUENCE.map((s) => s.template));
    expect(templates.size).toBe(3);
    expect(templates.has("uncomfortable-truth")).toBe(true);
    expect(templates.has("invisible-mistake")).toBe(true);
    expect(templates.has("simple-system")).toBe(true);
  });

  it("uses all 3 CTA types across the week", () => {
    const ctas = new Set(BATCH_SEQUENCE.map((s) => s.cta));
    expect(ctas.size).toBe(3);
    expect(ctas.has("comment")).toBe(true);
    expect(ctas.has("send-friend")).toBe(true);
    expect(ctas.has("link-bio")).toBe(true);
  });

  it("template distribution: simple-system appears most (3x)", () => {
    const count = BATCH_SEQUENCE.filter((s) => s.template === "simple-system").length;
    expect(count).toBe(3);
  });

  it("template distribution: uncomfortable-truth appears 2x", () => {
    const count = BATCH_SEQUENCE.filter((s) => s.template === "uncomfortable-truth").length;
    expect(count).toBe(2);
  });

  it("template distribution: invisible-mistake appears 2x", () => {
    const count = BATCH_SEQUENCE.filter((s) => s.template === "invisible-mistake").length;
    expect(count).toBe(2);
  });
});

// ============================================================
// 2) BATCH RESPONSE VALIDATION — Claude output structure
// ============================================================

describe("BatchResponseSchema — Claude output validation", () => {
  it("accepts a valid 7-day batch", () => {
    const batch = buildValidBatchResponse();
    const result = BatchResponseSchema.safeParse(batch);
    expect(result.success).toBe(true);
  });

  it("rejects batch with fewer than 7 days", () => {
    const batch = buildValidBatchResponse();
    batch.semana = batch.semana.slice(0, 6);
    const result = BatchResponseSchema.safeParse(batch);
    expect(result.success).toBe(false);
  });

  it("rejects batch with more than 7 days", () => {
    const batch = buildValidBatchResponse();
    batch.semana.push({ ...batch.semana[0], dia: 8 });
    const result = BatchResponseSchema.safeParse(batch);
    expect(result.success).toBe(false);
  });

  it("rejects empty semana array", () => {
    const result = BatchResponseSchema.safeParse({ semana: [] });
    expect(result.success).toBe(false);
  });

  it("rejects missing semana field", () => {
    const result = BatchResponseSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("BatchDaySchema — individual day validation", () => {
  const validDay = {
    dia: 1,
    sequencia: "Dor",
    pilar: "Autoridade",
    angulo: "Confronto",
    template: "uncomfortable-truth",
    tema: "Porque 90% dos coaches são invisíveis online",
    slides: Array.from({ length: 7 }, (_, i) => ({
      slideNumber: i + 1,
      headline: `Headline ${i + 1}`,
      body: `Body ${i + 1}`,
    })),
  };

  it("accepts a valid day", () => {
    const result = BatchDaySchema.safeParse(validDay);
    expect(result.success).toBe(true);
  });

  it("rejects dia below 1", () => {
    const result = BatchDaySchema.safeParse({ ...validDay, dia: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects dia above 7", () => {
    const result = BatchDaySchema.safeParse({ ...validDay, dia: 8 });
    expect(result.success).toBe(false);
  });

  it("rejects empty sequencia", () => {
    const result = BatchDaySchema.safeParse({ ...validDay, sequencia: "" });
    expect(result.success).toBe(false);
  });

  it("rejects empty pilar", () => {
    const result = BatchDaySchema.safeParse({ ...validDay, pilar: "" });
    expect(result.success).toBe(false);
  });

  it("rejects empty angulo", () => {
    const result = BatchDaySchema.safeParse({ ...validDay, angulo: "" });
    expect(result.success).toBe(false);
  });

  it("rejects empty template", () => {
    const result = BatchDaySchema.safeParse({ ...validDay, template: "" });
    expect(result.success).toBe(false);
  });

  it("rejects empty tema", () => {
    const result = BatchDaySchema.safeParse({ ...validDay, tema: "" });
    expect(result.success).toBe(false);
  });

  it("rejects fewer than 5 slides", () => {
    const slides = Array.from({ length: 4 }, (_, i) => ({
      slideNumber: i + 1,
      headline: `H${i}`,
    }));
    const result = BatchDaySchema.safeParse({ ...validDay, slides });
    expect(result.success).toBe(false);
  });

  it("rejects more than 10 slides", () => {
    const slides = Array.from({ length: 11 }, (_, i) => ({
      slideNumber: i + 1,
      headline: `H${i}`,
    }));
    const result = BatchDaySchema.safeParse({ ...validDay, slides });
    expect(result.success).toBe(false);
  });

  it("accepts 7 slides (standard carousel)", () => {
    const result = BatchDaySchema.safeParse(validDay);
    expect(result.success).toBe(true);
  });

  it("validates each slide has headline", () => {
    const badSlides = [...validDay.slides];
    badSlides[0] = { ...badSlides[0], headline: "" };
    const result = BatchDaySchema.safeParse({ ...validDay, slides: badSlides });
    expect(result.success).toBe(false);
  });
});

// ============================================================
// 3) CAROUSEL STRUCTURE — Hook, Slides, CTA
// ============================================================

describe("Carousel slide structure", () => {
  it("slide 1 (hook) must have headline", () => {
    const result = CarouselSlideSchema.safeParse({
      slideNumber: 1,
      headline: "O maior erro que 90% dos coaches cometem",
      body: "E como corrigi-lo em 7 slides",
    });
    expect(result.success).toBe(true);
  });

  it("body defaults to empty string when omitted", () => {
    const result = CarouselSlideSchema.safeParse({
      slideNumber: 1,
      headline: "Hook headline",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.body).toBe("");
    }
  });

  it("imageQuery is optional", () => {
    const result = CarouselSlideSchema.safeParse({
      slideNumber: 5,
      headline: "Middle slide",
      body: "Supporting text",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.imageQuery).toBeUndefined();
    }
  });

  it("slideNumber must be a positive integer", () => {
    const result = CarouselSlideSchema.safeParse({
      slideNumber: -1,
      headline: "Invalid",
    });
    expect(result.success).toBe(false);
  });

  it("accepts standard 7-slide carousel structure", () => {
    const slides = [
      { slideNumber: 1, headline: "HOOK: O problema que ignoras", body: "Descobre em 7 slides", imageQuery: "attention hook" },
      { slideNumber: 2, headline: "O que toda a gente acredita", body: "E porque está errado" },
      { slideNumber: 3, headline: "O problema real", body: "A verdade que ninguém te diz" },
      { slideNumber: 4, headline: "O sistema errado", body: "O que as pessoas fazem" },
      { slideNumber: 5, headline: "O sistema certo", body: "A alternativa que funciona" },
      { slideNumber: 6, headline: "Porquê funciona", body: "A razão profunda" },
      { slideNumber: 7, headline: "CTA: Envia a um amigo", body: "Partilha com quem precisa" },
    ];
    for (const slide of slides) {
      const result = CarouselSlideSchema.safeParse(slide);
      expect(result.success).toBe(true);
    }
  });
});

describe("Full batch carousel structure validation", () => {
  it("all 7 days have exactly 7 slides", () => {
    const batch = buildValidBatchResponse();
    const result = BatchResponseSchema.safeParse(batch);
    expect(result.success).toBe(true);
    if (result.success) {
      for (const day of result.data.semana) {
        expect(day.slides).toHaveLength(7);
      }
    }
  });

  it("each day slide 1 is the hook (slideNumber=1)", () => {
    const batch = buildValidBatchResponse();
    const result = BatchResponseSchema.safeParse(batch);
    expect(result.success).toBe(true);
    if (result.success) {
      for (const day of result.data.semana) {
        expect(day.slides[0].slideNumber).toBe(1);
      }
    }
  });

  it("each day slide 7 is the CTA (slideNumber=7)", () => {
    const batch = buildValidBatchResponse();
    const result = BatchResponseSchema.safeParse(batch);
    expect(result.success).toBe(true);
    if (result.success) {
      for (const day of result.data.semana) {
        expect(day.slides[6].slideNumber).toBe(7);
      }
    }
  });

  it("slides are numbered sequentially within each day", () => {
    const batch = buildValidBatchResponse();
    const result = BatchResponseSchema.safeParse(batch);
    expect(result.success).toBe(true);
    if (result.success) {
      for (const day of result.data.semana) {
        const numbers = day.slides.map((s) => s.slideNumber);
        expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7]);
      }
    }
  });

  it("total slides across week = 49 (7 days × 7 slides)", () => {
    const batch = buildValidBatchResponse();
    const result = BatchResponseSchema.safeParse(batch);
    expect(result.success).toBe(true);
    if (result.success) {
      const total = result.data.semana.reduce((sum, d) => sum + d.slides.length, 0);
      expect(total).toBe(49);
    }
  });
});

// ============================================================
// 4) PROMPT BUILDING — Pilar × Template × Ângulo injection
// ============================================================

describe("buildBatchPrompt — prompt construction", () => {
  it("returns a non-empty string", () => {
    const prompt = buildBatchPrompt(mockBrandCard, mockVoiceCard, mockEditorialLines, "Marca pessoal");
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(100);
  });

  it("includes the week theme", () => {
    const prompt = buildBatchPrompt(mockBrandCard, mockVoiceCard, mockEditorialLines, "Produtividade");
    expect(prompt).toContain("Produtividade");
  });

  it("includes Brand DNA fields", () => {
    const prompt = buildBatchPrompt(mockBrandCard, mockVoiceCard, mockEditorialLines, "Tema");
    expect(prompt).toContain(mockBrandCard.commandersIntent);
    expect(prompt).toContain(mockBrandCard.bigIdea.frase);
    expect(prompt).toContain(mockBrandCard.clienteIdeal.perfil);
    expect(prompt).toContain(mockBrandCard.inimigo.quem);
    expect(prompt).toContain(mockBrandCard.novaOportunidade.diferencial);
  });

  it("includes Voice DNA fields", () => {
    const prompt = buildBatchPrompt(mockBrandCard, mockVoiceCard, mockEditorialLines, "Tema");
    expect(prompt).toContain(mockVoiceCard.arquetipo);
    expect(prompt).toContain("directo");
    expect(prompt).toContain("sistema");
    expect(prompt).toContain("impossível");
  });

  it("includes all editorial line names", () => {
    const prompt = buildBatchPrompt(mockBrandCard, mockVoiceCard, mockEditorialLines, "Tema");
    for (const line of mockEditorialLines) {
      expect(prompt).toContain(line.nome);
    }
  });

  it("includes editorial percentages", () => {
    const prompt = buildBatchPrompt(mockBrandCard, mockVoiceCard, mockEditorialLines, "Tema");
    expect(prompt).toContain("30%");
    expect(prompt).toContain("20%");
    expect(prompt).toContain("25%");
    expect(prompt).toContain("15%");
    expect(prompt).toContain("10%");
  });

  it("includes all 7 psychological sequence labels", () => {
    const prompt = buildBatchPrompt(mockBrandCard, mockVoiceCard, mockEditorialLines, "Tema");
    expect(prompt).toContain("DOR");
    expect(prompt).toContain("INIMIGO");
    expect(prompt).toContain("QUEBRA DE CRENÇA");
    expect(prompt).toContain("SOLUÇÃO");
    expect(prompt).toContain("DEMONSTRAÇÃO");
    expect(prompt).toContain("PROVA SOCIAL");
    expect(prompt).toContain("CONVITE");
  });

  it("includes template names in the prompt", () => {
    const prompt = buildBatchPrompt(mockBrandCard, mockVoiceCard, mockEditorialLines, "Tema");
    expect(prompt).toContain("Verdade Desconfortável");
    expect(prompt).toContain("Erro Invisível");
    expect(prompt).toContain("Sistema Simples");
  });

  it("includes CTA labels", () => {
    const prompt = buildBatchPrompt(mockBrandCard, mockVoiceCard, mockEditorialLines, "Tema");
    expect(prompt).toContain("COMENTAR");
    expect(prompt).toContain("ENVIAR");
    expect(prompt).toContain("LINK DA BIO");
  });

  it("requests JSON output format", () => {
    const prompt = buildBatchPrompt(mockBrandCard, mockVoiceCard, mockEditorialLines, "Tema");
    expect(prompt).toContain("OUTPUT FORMAT (JSON)");
    expect(prompt).toContain('"semana"');
    expect(prompt).toContain('"slides"');
  });

  it("requests exactly 7 days and 7 slides", () => {
    const prompt = buildBatchPrompt(mockBrandCard, mockVoiceCard, mockEditorialLines, "Tema");
    expect(prompt).toContain("Exactamente 7 dias");
    expect(prompt).toContain("7 slides por dia");
  });

  it("mentions Pilar × Template × Ângulo formula", () => {
    const prompt = buildBatchPrompt(mockBrandCard, mockVoiceCard, mockEditorialLines, "Tema");
    expect(prompt).toContain("PILAR × TEMPLATE × ÂNGULO");
  });
});

// ============================================================
// 5) RATE LIMITING — carousel-batch endpoint
// ============================================================

const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null });
const mockGte = vi.fn().mockResolvedValue({ count: 0, error: null });
const mockEq = vi.fn((): Record<string, unknown> => ({
  maybeSingle: mockMaybeSingle,
  eq: mockEq,
  gte: mockGte,
  select: mockSelect,
}));
const mockSelect = vi.fn(() => ({ eq: mockEq }));
const mockInsert = vi.fn().mockResolvedValue({ error: null });
const mockUpdate = vi.fn(() => ({ eq: mockEq }));

const mockFrom = vi.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({ from: mockFrom }),
}));

const { checkAndConsumeRateLimit } = await import("@/lib/supabase/rate-limit");

describe("Rate limiting — carousel-batch endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGte.mockResolvedValue({ count: 0, error: null });
    mockInsert.mockResolvedValue({ error: null });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ eq: mockEq, maybeSingle: mockMaybeSingle, gte: mockGte, select: mockSelect });
  });

  it("carousel-batch has a limit of 3/day", async () => {
    mockGte.mockResolvedValue({ count: 0, error: null });

    const result = await checkAndConsumeRateLimit("user_test", "carousel-batch");

    expect(result.limit).toBe(3);
  });

  it("allows first batch of the day", async () => {
    mockGte.mockResolvedValue({ count: 0, error: null });

    const result = await checkAndConsumeRateLimit("user_test", "carousel-batch");

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("allows second batch", async () => {
    mockGte.mockResolvedValue({ count: 1, error: null });

    const result = await checkAndConsumeRateLimit("user_test", "carousel-batch");

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it("allows third batch (last allowed)", async () => {
    mockGte.mockResolvedValue({ count: 2, error: null });

    const result = await checkAndConsumeRateLimit("user_test", "carousel-batch");

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it("blocks fourth batch (over the limit)", async () => {
    mockGte.mockResolvedValue({ count: 3, error: null });

    const result = await checkAndConsumeRateLimit("user_limited", "carousel-batch");

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("carousel-batch is separate from single carousel limit", async () => {
    mockGte.mockResolvedValue({ count: 0, error: null });

    const batchResult = await checkAndConsumeRateLimit("user_test", "carousel-batch");
    const singleResult = await checkAndConsumeRateLimit("user_test", "carousel");

    expect(batchResult.limit).toBe(3);
    expect(singleResult.limit).toBe(20);
  });
});

// ============================================================
// 6) PIPELINE GATING — Batch blocked without editorial confirmed
// ============================================================

const { getUserProgress } = await import("@/lib/supabase/user-profiles");

describe("Pipeline gating — batch requires all 3 prerequisites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("batch blocked: brand DNA incomplete", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { brand_dna_complete: false, voz_dna_complete: true, editorial_complete: true },
    });

    const progress = await getUserProgress("user_no_brand");

    const batchGated =
      !progress.brandDnaComplete || !progress.voiceDnaComplete || !progress.editorialComplete;
    expect(batchGated).toBe(true);
  });

  it("batch blocked: voice DNA incomplete", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { brand_dna_complete: true, voz_dna_complete: false, editorial_complete: true },
    });

    const progress = await getUserProgress("user_no_voice");

    const batchGated =
      !progress.brandDnaComplete || !progress.voiceDnaComplete || !progress.editorialComplete;
    expect(batchGated).toBe(true);
  });

  it("batch blocked: editorial lines not confirmed", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { brand_dna_complete: true, voz_dna_complete: true, editorial_complete: false },
    });

    const progress = await getUserProgress("user_no_editorial");

    const batchGated =
      !progress.brandDnaComplete || !progress.voiceDnaComplete || !progress.editorialComplete;
    expect(batchGated).toBe(true);
  });

  it("batch blocked: nothing complete", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { brand_dna_complete: false, voz_dna_complete: false, editorial_complete: false },
    });

    const progress = await getUserProgress("user_fresh");

    const batchGated =
      !progress.brandDnaComplete || !progress.voiceDnaComplete || !progress.editorialComplete;
    expect(batchGated).toBe(true);
  });

  it("batch ALLOWED: all three complete", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { brand_dna_complete: true, voz_dna_complete: true, editorial_complete: true },
    });

    const progress = await getUserProgress("user_ready");

    const batchGated =
      !progress.brandDnaComplete || !progress.voiceDnaComplete || !progress.editorialComplete;
    expect(batchGated).toBe(false);
  });

  it("gating condition matches the API route exactly", async () => {
    // The API route at carousel-batch/route.ts line 33-37 checks:
    // !progress.brandDnaComplete || !progress.voiceDnaComplete || !progress.editorialComplete
    mockMaybeSingle.mockResolvedValue({
      data: { brand_dna_complete: true, voz_dna_complete: true, editorial_complete: false },
    });

    const progress = await getUserProgress("user_partial");

    // This is the exact condition from the API route
    const shouldReturn403 =
      !progress.brandDnaComplete || !progress.voiceDnaComplete || !progress.editorialComplete;
    expect(shouldReturn403).toBe(true);
    // Specifically editorial is the blocker
    expect(progress.editorialComplete).toBe(false);
  });
});
