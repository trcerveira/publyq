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

// ── POST /api/brand-dna (answers → Claude) ─────────────────

const brandField = z.string().min(10, "Mínimo 10 caracteres").max(3000);

export const BrandDNAAnswersSchema = z.object({
  answers: z.object({
    // Block 1 — Who you serve
    clienteIdeal:       brandField,
    tentativasFalhadas: brandField,
    linguagemCliente:   brandField,
    vidaIdeal:          brandField,
    // Block 2 — Who you are
    especialidade:      brandField,
    personalidade:      brandField,
    piorMomento:        brandField,
    erroQueEnsina:      brandField,
    // Block 3 — What you stand for
    irritacoes:         brandField,
    crencas:            brandField,
    bigIdea:            brandField,
    proposito:          brandField,
    visao:              brandField,
    // Block 4 — Your promise
    transformacao:      brandField,
    resultados:         brandField,
    diferencaFundamental: brandField,
    commandersIntent:   brandField,
  }),
});

// ── POST /api/voice-dna (answers → Claude) ─────────────────

export const VoiceDNAAnswersSchema = z.object({
  answers: z.object({
    tom:                 z.string().min(1, "Campo obrigatório").max(1000),
    personagem:          z.string().min(1, "Campo obrigatório").max(1000),
    emocao:              z.string().min(1, "Campo obrigatório").max(1000),
    vocabularioActivo:   z.string().min(1, "Campo obrigatório").max(1000),
    vocabularioProibido: z.string().min(1, "Campo obrigatório").max(1000),
    frasesAssinatura:    z.string().min(1, "Campo obrigatório").max(1000),
    estrutura:           z.string().min(1, "Campo obrigatório").max(1000),
    posicao:             z.string().min(1, "Campo obrigatório").max(1000),
  }),
});

// ── POST /api/carousel (generate 7 carousels) ─────────────

export const CarouselBatchSchema = z.object({
  weekTheme: z
    .string()
    .min(3, "Tema deve ter pelo menos 3 caracteres")
    .max(500)
    .trim(),
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

// ── Inferred types ─────────────────────────────────────────

export type WaitlistInput        = z.infer<typeof WaitlistSchema>;
export type BrandDNAAnswersInput = z.infer<typeof BrandDNAAnswersSchema>;
export type VoiceDNAAnswersInput = z.infer<typeof VoiceDNAAnswersSchema>;
export type CarouselBatchInput   = z.infer<typeof CarouselBatchSchema>;
export type KaizenMetricsInput   = z.infer<typeof KaizenMetricsSchema>;
export type KaizenAnalyzeInput   = z.infer<typeof KaizenAnalyzeSchema>;

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
