// ============================================================
// PUBLYQ — TypeScript types for Supabase tables
// ============================================================

// ── Audit Actions ───────────────────────────────────────────

export type AuditAction =
  | "brand_dna.generate"
  | "brand_dna.save"
  | "voice_dna.generate"
  | "voice_dna.save"
  | "carousel.generate"
  | "carousel.batch"
  | "kaizen.analyze"
  | "kaizen.save_metrics"
  | "profile.update"
  | "waitlist.join"
;

// ── Table: user_profiles ────────────────────────────────────

export interface UserProfile {
  id:                string;
  clerk_id:          string;
  email:             string;
  name:              string | null;
  brand_dna_complete: boolean;
  voice_dna_complete: boolean;
  created_at:        string;
  updated_at:        string;
}

// ── Table: brand_profiles ───────────────────────────────────

export interface BrandProfile {
  id:         string;
  clerk_id:   string;
  answers:    Record<string, string>;
  brand_card: BrandDNACard | null;
  created_at: string;
  updated_at: string;
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
  clerk_id:   string;
  answers:    Record<string, string>;
  voice_card: VoiceDNACard | null;
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
  id:           string;
  clerk_id:     string;
  batch_id:     string;       // groups 7 carousels together
  day_of_week:  number;       // 1=Mon, 2=Tue, ..., 7=Sun
  topic:        string;
  slides:       CarouselSlide[];
  caption:      string | null;
  hashtags:     string[] | null;
  created_at:   string;
}

export interface CarouselSlide {
  slideNumber: number;
  headline:    string;
  body:        string;
  imageQuery?: string;
  imageUrl?:   string;
}

// ── Table: carousel_metrics (Kaizen) ────────────────────────

export interface CarouselMetrics {
  id:           string;
  carousel_id:  string;
  likes:        number;
  comments:     number;
  saves:        number;
  shares:       number;
  reach:        number;
  recorded_at:  string;
  created_at:   string;
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
