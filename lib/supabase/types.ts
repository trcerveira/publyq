// ============================================================
// PUBLYQ — TypeScript types for Supabase tables
// Matches migration 011_publyq_schema.sql
// ============================================================

// ── Audit Actions ───────────────────────────────────────────

export type AuditAction =
  | "brand_dna.generate"
  | "brand_dna.save"
  | "voice_dna.generate"
  | "voice_dna.save"
  | "editorial.generate"
  | "editorial.confirm"
  | "carousel.generate"
  | "carousel.export"
  | "batch.generate"
  | "profile.update"
  | "user.sync"
  | "waitlist.join"
;

// ── Table: user_profiles (PK = user_id TEXT) ────────────────

export interface UserProfile {
  user_id:            string;   // Clerk ID (user_xxxxxxx)
  email:              string;
  name:               string | null;
  brand_dna_complete: boolean;
  voice_dna_complete: boolean;  // = voz_dna_complete in DB
  brand_bg:           string | null;
  brand_surface:      string | null;
  brand_accent:       string | null;
  brand_text:         string | null;
  created_at:         string;
  updated_at:         string;
}

// ── Table: brand_profiles ───────────────────────────────────

export interface BrandProfile {
  id:               string;
  user_id:          string;
  brand_name:       string | null;
  mission:          string | null;
  values:           string[] | null;
  target_audience:  string | null;
  positioning:      string | null;
  personality:      BrandPersonality | null;
  differentiator:   string | null;
  brand_dna_output: BrandDNACard | null;
  version:          number;
  created_at:       string;
  updated_at:       string;
}

export interface BrandPersonality {
  tone:       string;
  energy:     string;
  formality:  string;
}

export interface BrandDNACard {
  clienteIdeal: {
    perfil:    string;
    dores:     string[];
    desejos:   string[];
    linguagem: string[];
  };
  personagem: {
    historia:   string;
    superpoder: string;
    defeito:    string;
    voz:        string;
  };
  bigIdea: {
    frase:      string;
    explicacao: string;
  };
  inimigo: {
    quem:   string;
    porque: string;
  };
  causaFutura: {
    movimento:   string;
    visao10anos: string;
  };
  commandersIntent: string;
  novaOportunidade: {
    diferencial: string;
    reframe:     string;
  };
}

// ── Table: voice_profiles ───────────────────────────────────

export interface VoiceProfile {
  id:         string;
  user_id:    string;
  answers:    Record<string, string>;
  voice_dna:  VoiceDNACard | null;
  version:    number;
  created_at: string;
  updated_at: string;
}

export interface VoiceDNACard {
  arquetipo:           string;
  descricaoArquetipo?: string;
  tomEmTresPalavras:   string[];
  vocabularioActivo:   string[];
  vocabularioProibido: string[];
  frasesAssinatura:    string[];
  regrasEstilo:        string[];
}

// ── Table: generated_carousels ──────────────────────────────

export interface GeneratedCarousel {
  id:          string;
  user_id:     string;
  topic:       string;
  slides:      CarouselSlide[];
  keywords:    string[] | null;
  palette:     CarouselPalette | null;
  status:      "draft" | "exported" | "published";
  exported_at: string | null;
  deleted_at:  string | null;
  created_at:  string;
}

export interface CarouselSlide {
  slideNumber: number;
  headline:    string;
  body:        string;
  imageQuery?: string;
  imageUrl?:   string;
}

export interface CarouselPalette {
  bg:      string;
  surface: string;
  accent:  string;
  text:    string;
}

// ── Table: editorial_lines ────────────────────────────────────

export interface EditorialLinesRecord {
  id:         string;
  user_id:    string;
  lines:      EditorialLine[];
  resumo:     string | null;
  status:     "draft" | "confirmed";
  version:    number;
  created_at: string;
  updated_at: string;
}

export interface EditorialLine {
  id:           string;   // pilar-1, pilar-2, etc.
  nome:         string;
  descricao:    string;
  temas:        string[];
  percentagem:  number;
}

export interface EditorialProfile {
  linhas:  EditorialLine[];
  resumo:  string;
}

// ── Table: waitlist ─────────────────────────────────────────

export interface WaitlistEntry {
  id:         string;
  email:      string;
  nome:       string | null;
  created_at: string;
}

// ── Table: rate_limits ──────────────────────────────────────

export interface RateLimit {
  id:         string;
  user_id:    string;
  endpoint:   string;
  created_at: string;
}

// ── Table: audit_log ────────────────────────────────────────

export interface AuditLog {
  id:         string;
  user_id:    string;
  action:     AuditAction;
  metadata:   Record<string, unknown> | null;
  success:    boolean;
  error_msg:  string | null;
  created_at: string;
}
