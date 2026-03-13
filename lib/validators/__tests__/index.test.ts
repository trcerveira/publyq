import { describe, it, expect } from "vitest";
import {
  BrandDNAAnswersSchema,
  VoiceDNAAnswersSchema,
  EditorialLineSchema,
  EditorialConfirmSchema,
  EditorialUpdateSchema,
  EditorialProfileSchema,
  CarouselBatchSchema,
  CarouselTemplateEnum,
  CarouselCtaEnum,
  CarouselSlideSchema,
  CarouselSlidesResponseSchema,
  WaitlistSchema,
  validateInput,
} from "../index";

// ============================================================
// Tests for PUBLYQ Validation Schemas (Zod v4)
// ============================================================

// ── Brand DNA Answers ─────────────────────────────────────────

describe("BrandDNAAnswersSchema", () => {
  const validAnswers = {
    answers: {
      oqueFazParaQuem: "Ajudo solopreneurs a criar conteúdo",
      transformacao: "De invisível online a autoridade reconhecida",
      irritacoes: "Gurus que vendem fórmulas mágicas sem resultados reais",
      clienteIdeal: "Coaches e consultores com experiência mas sem presença",
      crencas: "Consistência bate talento. Autenticidade bate perfeição.",
      porque: "Porque vi demasiadas pessoas boas ficarem invisíveis",
    },
  };

  it("accepts valid brand DNA answers", () => {
    const result = BrandDNAAnswersSchema.safeParse(validAnswers);
    expect(result.success).toBe(true);
  });

  it("rejects answer shorter than 10 characters", () => {
    const result = BrandDNAAnswersSchema.safeParse({
      answers: { ...validAnswers.answers, oqueFazParaQuem: "short" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects answer longer than 3000 characters", () => {
    const result = BrandDNAAnswersSchema.safeParse({
      answers: { ...validAnswers.answers, oqueFazParaQuem: "a".repeat(3001) },
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing field (porque)", () => {
    const { porque, ...rest } = validAnswers.answers;
    const result = BrandDNAAnswersSchema.safeParse({ answers: rest });
    expect(result.success).toBe(false);
  });

  it("rejects missing answers object", () => {
    const result = BrandDNAAnswersSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("validates all 6 required fields", () => {
    const fields = [
      "oqueFazParaQuem",
      "transformacao",
      "irritacoes",
      "clienteIdeal",
      "crencas",
      "porque",
    ];
    for (const field of fields) {
      const answers = { ...validAnswers.answers, [field]: "tiny" };
      const result = BrandDNAAnswersSchema.safeParse({ answers });
      expect(result.success).toBe(false);
    }
  });
});

// ── Voice DNA Answers ─────────────────────────────────────────

describe("VoiceDNAAnswersSchema", () => {
  const validAnswers = {
    answers: {
      tom: "Directo, sem rodeios, com humor seco",
      personagem: "Seria o Anthony Bourdain — sem filtros, autêntico",
      vocabulario: "Uso: construir, sistema, escalar. Nunca: impossível, difícil",
      frasesAssinatura: "Faz o simples. Repete. Escala.",
      posicao: "Sou o mentor pragmático que já fez o caminho",
    },
  };

  it("accepts valid voice DNA answers", () => {
    const result = VoiceDNAAnswersSchema.safeParse(validAnswers);
    expect(result.success).toBe(true);
  });

  it("rejects answer shorter than 5 characters", () => {
    const result = VoiceDNAAnswersSchema.safeParse({
      answers: { ...validAnswers.answers, tom: "abc" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects answer longer than 2000 characters", () => {
    const result = VoiceDNAAnswersSchema.safeParse({
      answers: { ...validAnswers.answers, tom: "x".repeat(2001) },
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing field (posicao)", () => {
    const { posicao, ...rest } = validAnswers.answers;
    const result = VoiceDNAAnswersSchema.safeParse({ answers: rest });
    expect(result.success).toBe(false);
  });

  it("validates all 5 required fields", () => {
    const fields = ["tom", "personagem", "vocabulario", "frasesAssinatura", "posicao"];
    for (const field of fields) {
      const answers = { ...validAnswers.answers, [field]: "ab" };
      const result = VoiceDNAAnswersSchema.safeParse({ answers });
      expect(result.success).toBe(false);
    }
  });
});

// ── Editorial Lines ───────────────────────────────────────────

describe("EditorialLineSchema", () => {
  const validLine = {
    id: "pilar-1",
    nome: "Autoridade",
    descricao: "Posicionar como especialista no nicho",
    temas: ["dicas práticas", "case studies", "bastidores"],
    percentagem: 30,
  };

  it("accepts a valid editorial line", () => {
    const result = EditorialLineSchema.safeParse(validLine);
    expect(result.success).toBe(true);
  });

  it("rejects empty nome", () => {
    const result = EditorialLineSchema.safeParse({ ...validLine, nome: "" });
    expect(result.success).toBe(false);
  });

  it("rejects nome longer than 100 characters", () => {
    const result = EditorialLineSchema.safeParse({ ...validLine, nome: "a".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("rejects empty temas array", () => {
    const result = EditorialLineSchema.safeParse({ ...validLine, temas: [] });
    expect(result.success).toBe(false);
  });

  it("rejects temas with more than 10 items", () => {
    const temas = Array.from({ length: 11 }, (_, i) => `tema-${i}`);
    const result = EditorialLineSchema.safeParse({ ...validLine, temas });
    expect(result.success).toBe(false);
  });

  it("rejects percentagem below 0", () => {
    const result = EditorialLineSchema.safeParse({ ...validLine, percentagem: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects percentagem above 100", () => {
    const result = EditorialLineSchema.safeParse({ ...validLine, percentagem: 150 });
    expect(result.success).toBe(false);
  });
});

describe("EditorialConfirmSchema", () => {
  const validPayload = {
    lines: [
      {
        id: "pilar-1",
        nome: "Autoridade",
        descricao: "Content about expertise",
        temas: ["tips", "cases"],
        percentagem: 40,
      },
      {
        id: "pilar-2",
        nome: "Bastidores",
        descricao: "Behind the scenes",
        temas: ["process", "team"],
        percentagem: 60,
      },
    ],
    resumo: "Estratégia focada em autoridade e humanização.",
  };

  it("accepts valid confirm payload", () => {
    const result = EditorialConfirmSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejects empty lines array", () => {
    const result = EditorialConfirmSchema.safeParse({ ...validPayload, lines: [] });
    expect(result.success).toBe(false);
  });

  it("rejects missing resumo", () => {
    const { resumo, ...rest } = validPayload;
    const result = EditorialConfirmSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects empty resumo", () => {
    const result = EditorialConfirmSchema.safeParse({ ...validPayload, resumo: "" });
    expect(result.success).toBe(false);
  });

  it("rejects more than 10 lines", () => {
    const lines = Array.from({ length: 11 }, (_, i) => ({
      id: `pilar-${i}`,
      nome: `Pilar ${i}`,
      descricao: "Desc",
      temas: ["tema"],
      percentagem: 9,
    }));
    const result = EditorialConfirmSchema.safeParse({ lines, resumo: "Summary" });
    expect(result.success).toBe(false);
  });
});

describe("EditorialUpdateSchema", () => {
  it("accepts lines without resumo (optional)", () => {
    const result = EditorialUpdateSchema.safeParse({
      lines: [
        { id: "p1", nome: "Test", descricao: "Desc", temas: ["a"], percentagem: 100 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts lines with resumo", () => {
    const result = EditorialUpdateSchema.safeParse({
      lines: [
        { id: "p1", nome: "Test", descricao: "Desc", temas: ["a"], percentagem: 100 },
      ],
      resumo: "A short summary here",
    });
    expect(result.success).toBe(true);
  });
});

describe("EditorialProfileSchema", () => {
  it("accepts valid AI response structure", () => {
    const result = EditorialProfileSchema.safeParse({
      linhas: [
        { id: "pilar-1", nome: "Autoridade", descricao: "Desc", temas: ["a", "b"], percentagem: 50 },
        { id: "pilar-2", nome: "Educação", descricao: "Desc", temas: ["c"], percentagem: 50 },
      ],
      resumo: "Strategy summary",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty linhas array", () => {
    const result = EditorialProfileSchema.safeParse({
      linhas: [],
      resumo: "Summary",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing resumo", () => {
    const result = EditorialProfileSchema.safeParse({
      linhas: [{ id: "p1", nome: "A", descricao: "B", temas: ["c"], percentagem: 100 }],
    });
    expect(result.success).toBe(false);
  });
});

// ── Carousel ──────────────────────────────────────────────────

describe("CarouselBatchSchema", () => {
  it("accepts valid carousel input", () => {
    const result = CarouselBatchSchema.safeParse({
      weekTheme: "Marca pessoal para coaches",
      template: "simple-system",
      cta: "send-friend",
    });
    expect(result.success).toBe(true);
  });

  it("accepts all valid templates", () => {
    const templates = ["simple-system", "uncomfortable-truth", "invisible-mistake"];
    for (const template of templates) {
      const result = CarouselBatchSchema.safeParse({
        weekTheme: "Test theme",
        template,
        cta: "comment",
      });
      expect(result.success).toBe(true);
    }
  });

  it("accepts all valid CTAs", () => {
    const ctas = ["send-friend", "comment", "link-bio", "other", "none"];
    for (const cta of ctas) {
      const result = CarouselBatchSchema.safeParse({
        weekTheme: "Test theme",
        template: "simple-system",
        cta,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid template", () => {
    const result = CarouselBatchSchema.safeParse({
      weekTheme: "Theme",
      template: "non-existent-template",
      cta: "comment",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid CTA", () => {
    const result = CarouselBatchSchema.safeParse({
      weekTheme: "Theme",
      template: "simple-system",
      cta: "buy-now",
    });
    expect(result.success).toBe(false);
  });

  it("rejects weekTheme shorter than 3 characters", () => {
    const result = CarouselBatchSchema.safeParse({
      weekTheme: "ab",
      template: "simple-system",
      cta: "comment",
    });
    expect(result.success).toBe(false);
  });

  it("rejects weekTheme longer than 500 characters", () => {
    const result = CarouselBatchSchema.safeParse({
      weekTheme: "a".repeat(501),
      template: "simple-system",
      cta: "comment",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional topics array", () => {
    const result = CarouselBatchSchema.safeParse({
      weekTheme: "Theme",
      template: "simple-system",
      cta: "none",
      topics: ["Topic 1", "Topic 2"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects topics with more than 7 items", () => {
    const topics = Array.from({ length: 8 }, (_, i) => `Topic ${i}`);
    const result = CarouselBatchSchema.safeParse({
      weekTheme: "Theme",
      template: "simple-system",
      cta: "none",
      topics,
    });
    expect(result.success).toBe(false);
  });
});

describe("CarouselSlideSchema", () => {
  it("accepts valid slide", () => {
    const result = CarouselSlideSchema.safeParse({
      slideNumber: 1,
      headline: "Hook headline",
      body: "Supporting text",
      imageQuery: "personal branding",
    });
    expect(result.success).toBe(true);
  });

  it("accepts slide without body (defaults to empty string)", () => {
    const result = CarouselSlideSchema.safeParse({
      slideNumber: 3,
      headline: "Headline only",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.body).toBe("");
    }
  });

  it("rejects slideNumber below 1", () => {
    const result = CarouselSlideSchema.safeParse({
      slideNumber: 0,
      headline: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty headline", () => {
    const result = CarouselSlideSchema.safeParse({
      slideNumber: 1,
      headline: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("CarouselSlidesResponseSchema", () => {
  const makeSlides = (count: number) =>
    Array.from({ length: count }, (_, i) => ({
      slideNumber: i + 1,
      headline: `Slide ${i + 1}`,
      body: "Text",
    }));

  it("accepts 7 slides (standard carousel)", () => {
    const result = CarouselSlidesResponseSchema.safeParse(makeSlides(7));
    expect(result.success).toBe(true);
  });

  it("accepts 1 slide (minimum)", () => {
    const result = CarouselSlidesResponseSchema.safeParse(makeSlides(1));
    expect(result.success).toBe(true);
  });

  it("rejects empty array", () => {
    const result = CarouselSlidesResponseSchema.safeParse([]);
    expect(result.success).toBe(false);
  });

  it("rejects more than 15 slides", () => {
    const result = CarouselSlidesResponseSchema.safeParse(makeSlides(16));
    expect(result.success).toBe(false);
  });
});

// ── Waitlist ──────────────────────────────────────────────────

describe("WaitlistSchema", () => {
  it("accepts valid email", () => {
    const result = WaitlistSchema.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(true);
  });

  it("normalises email to lowercase", () => {
    const result = WaitlistSchema.safeParse({ email: "USER@EXAMPLE.COM" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
    }
  });

  it("rejects invalid email", () => {
    const result = WaitlistSchema.safeParse({ email: "not-email" });
    expect(result.success).toBe(false);
  });
});

// ── validateInput helper ──────────────────────────────────────

describe("validateInput helper", () => {
  it("returns success with parsed data for valid input", () => {
    const result = validateInput(WaitlistSchema, { email: "a@b.com" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("a@b.com");
    }
  });

  it("returns error string for invalid input", () => {
    const result = validateInput(WaitlistSchema, { email: "bad" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(typeof result.error).toBe("string");
      expect(result.error.length).toBeGreaterThan(0);
    }
  });
});
