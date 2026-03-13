import { z } from "zod";

// ============================================================
// PUBLYQ — Validation Schemas (Zod v4)
// ============================================================

// ── POST /api/waitlist ─────────────────────────────────────

export const WaitlistSchema = z.object({
  email: z
    .string()
    .email("Email inválido")
    .toLowerCase()
    .trim(),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").trim().optional(),
});

// ── POST /api/brand-dna (6 questions → Claude) ──────────────

const brandField = z.string().min(10, "Mínimo 10 caracteres").max(3000);

export const BrandDNAAnswersSchema = z.object({
  answers: z.object({
    oqueFazParaQuem: brandField,
    transformacao:   brandField,
    irritacoes:      brandField,
    clienteIdeal:    brandField,
    crencas:         brandField,
    porque:          brandField,
  }),
});

// ── POST /api/voice-dna (5 questions → Claude) ──────────────

const voiceField = z.string().min(5, "Mínimo 5 caracteres").max(2000);

export const VoiceDNAAnswersSchema = z.object({
  answers: z.object({
    tom:              voiceField,
    personagem:       voiceField,
    vocabulario:      voiceField,
    frasesAssinatura: voiceField,
    posicao:          voiceField,
  }),
});

// ── POST /api/editorial (generate editorial lines) ──────────

export const EditorialGenerateSchema = z.object({
  // No user input needed — generated from Brand DNA + Voice DNA
});

export const EditorialLineSchema = z.object({
  id:          z.string().min(1),
  nome:        z.string().min(1).max(100),
  descricao:   z.string().min(1).max(500),
  temas:       z.array(z.string().min(1).max(200)).min(1).max(10),
  percentagem: z.number().min(0).max(100),
});

export const EditorialUpdateSchema = z.object({
  lines:  z.array(EditorialLineSchema).min(1).max(10),
  resumo: z.string().min(1).max(1000).optional(),
});

export const EditorialConfirmSchema = z.object({
  lines:  z.array(EditorialLineSchema).min(1).max(10),
  resumo: z.string().min(1).max(1000),
});

export const EditorialProfileSchema = z.object({
  linhas: z.array(EditorialLineSchema).min(1).max(10),
  resumo: z.string().min(1),
});

// ── POST /api/carousel (generate 7 carousels) ─────────────

export const CarouselTemplateEnum = z.enum([
  "simple-system",
  "uncomfortable-truth",
  "invisible-mistake",
]);

export const CarouselCtaEnum = z.enum([
  "send-friend",
  "comment",
  "link-bio",
  "other",
  "none",
]);

export const CarouselBatchSchema = z.object({
  weekTheme: z
    .string()
    .min(3, "Tema deve ter pelo menos 3 caracteres")
    .max(500)
    .trim(),
  template: CarouselTemplateEnum,
  cta: CarouselCtaEnum,
  topics: z
    .array(z.string().min(3).max(200))
    .min(1)
    .max(7)
    .optional(),
});

// ── POST /api/kaizen (save metrics) ────────────────────────

export const KaizenMetricsSchema = z.object({
  carouselId: z.string().uuid("ID inválido"),
  likes:      z.number().int().min(0),
  comments:   z.number().int().min(0),
  saves:      z.number().int().min(0),
  shares:     z.number().int().min(0),
  reach:      z.number().int().min(0).optional().default(0),
});

// ── POST /api/kaizen/analyze (analyze metrics) ─────────────

export const KaizenAnalyzeSchema = z.object({
  batchId: z.string().uuid("Batch ID inválido"),
});

// ── Claude response validation (carousel slides) ────────────

export const CarouselSlideSchema = z.object({
  slideNumber: z.number().int().min(1),
  headline:    z.string().min(1),
  body:        z.string().optional().default(""),
  imageQuery:  z.string().optional(),
});

export const CarouselSlidesResponseSchema = z
  .array(CarouselSlideSchema)
  .min(1, "Nenhum slide gerado")
  .max(15, "Máximo 15 slides");

// ── Inferred types ─────────────────────────────────────────

export type WaitlistInput         = z.infer<typeof WaitlistSchema>;
export type BrandDNAAnswersInput  = z.infer<typeof BrandDNAAnswersSchema>;
export type VoiceDNAAnswersInput  = z.infer<typeof VoiceDNAAnswersSchema>;
export type EditorialUpdateInput  = z.infer<typeof EditorialUpdateSchema>;
export type EditorialConfirmInput = z.infer<typeof EditorialConfirmSchema>;
export type CarouselBatchInput    = z.infer<typeof CarouselBatchSchema>;
export type KaizenMetricsInput    = z.infer<typeof KaizenMetricsSchema>;
export type KaizenAnalyzeInput    = z.infer<typeof KaizenAnalyzeSchema>;

// ── Helper function ────────────────────────────────────────

export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  // Zod v4: uses .issues instead of .errors
  const firstError = result.error.issues[0];
  return { success: false, error: firstError?.message ?? "Input inválido" };
}
