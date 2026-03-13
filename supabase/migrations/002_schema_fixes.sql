-- ============================================================
-- PUBLYQ Schema Fixes — v1.1
-- Run AFTER 001_publyq_schema.sql in Supabase SQL Editor
-- ============================================================

-- 1. brand_profiles: add generic answers + brand_card columns
-- (code stores answers as JSONB, not individual columns)
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS answers JSONB;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS brand_card JSONB;

-- 2. voice_profiles: add generic answers + voice_card columns
ALTER TABLE voice_profiles ADD COLUMN IF NOT EXISTS answers JSONB;
ALTER TABLE voice_profiles ADD COLUMN IF NOT EXISTS voice_card JSONB;

-- 3. audit_log: add success + error_msg columns
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS success BOOLEAN DEFAULT true;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS error_msg TEXT;

-- 4. rate_limits: code uses simple insert-per-request pattern
-- Drop old UNIQUE constraint and add user_id column alias
-- NOTE: If rate_limits has data, back it up first
DO $$
BEGIN
  -- Add user_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rate_limits' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE rate_limits ADD COLUMN user_id TEXT;
    -- Copy existing data from user_key
    UPDATE rate_limits SET user_id = user_key WHERE user_id IS NULL;
  END IF;
END $$;

-- Add index for rate limit queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint_date
  ON rate_limits(user_id, endpoint, created_at);
