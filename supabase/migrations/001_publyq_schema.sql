-- ============================================================
-- PUBLYQ MVP Schema — v1.0
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. WAITLIST (beta signups)
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "block_direct_access" ON waitlist FOR ALL USING (false);

-- 2. USER PROFILES (synced from Clerk on each dashboard load)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  brand_dna_complete BOOLEAN DEFAULT false,
  voice_dna_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "block_direct_access" ON user_profiles FOR ALL USING (false);

-- 3. BRAND PROFILES (Brand DNA answers — one per user)
CREATE TABLE IF NOT EXISTS brand_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  -- Block 1: Identity
  business_name TEXT,
  industry TEXT,
  years_active TEXT,
  one_sentence TEXT,
  -- Block 2: Audience
  ideal_client TEXT,
  client_pain TEXT,
  client_dream TEXT,
  why_you TEXT,
  -- Block 3: Positioning
  competitors TEXT,
  differentiator TEXT,
  price_range TEXT,
  brand_promise TEXT,
  -- Block 4: Personality
  brand_adjectives TEXT,
  brand_values TEXT,
  brand_tone TEXT,
  brand_hero TEXT,
  brand_enemy TEXT,
  -- Generated card (JSON from Claude)
  brand_card JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "block_direct_access" ON brand_profiles FOR ALL USING (false);

-- 4. VOICE PROFILES (Voice DNA answers — one per user)
CREATE TABLE IF NOT EXISTS voice_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  -- Voice questions
  writing_sample TEXT,
  tone_description TEXT,
  words_love TEXT,
  words_hate TEXT,
  signature_phrases TEXT,
  communication_style TEXT,
  humor_level TEXT,
  formality_level TEXT,
  -- Generated card (JSON from Claude)
  voice_card JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE voice_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "block_direct_access" ON voice_profiles FOR ALL USING (false);

-- 5. GENERATED CAROUSELS (batches of 7)
CREATE TABLE IF NOT EXISTS generated_carousels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT NOT NULL,
  batch_id UUID NOT NULL,
  day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 7),
  week_theme TEXT,
  topic TEXT,
  hook TEXT,
  slides JSONB NOT NULL DEFAULT '[]',
  cta TEXT,
  caption TEXT,
  hashtags TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE generated_carousels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "block_direct_access" ON generated_carousels FOR ALL USING (false);

CREATE INDEX idx_carousels_clerk_id ON generated_carousels(clerk_id);
CREATE INDEX idx_carousels_batch_id ON generated_carousels(batch_id);

-- 6. CAROUSEL METRICS (for Kaizen loop)
CREATE TABLE IF NOT EXISTS carousel_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT NOT NULL,
  carousel_id UUID NOT NULL REFERENCES generated_carousels(id),
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE carousel_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "block_direct_access" ON carousel_metrics FOR ALL USING (false);

CREATE INDEX idx_metrics_clerk_id ON carousel_metrics(clerk_id);
CREATE INDEX idx_metrics_carousel_id ON carousel_metrics(carousel_id);

-- 7. RATE LIMITS (DB-based, works in serverless)
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_key TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_key, endpoint)
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "block_direct_access" ON rate_limits FOR ALL USING (false);

-- 8. AUDIT LOG (fire-and-forget)
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  user_id TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "block_direct_access" ON audit_log FOR ALL USING (false);

CREATE INDEX idx_audit_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_action ON audit_log(action);
