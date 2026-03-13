-- ============================================================
-- PUBLYQ — Fix rate_limits table (QA C1)
-- Migration 001 created rate_limits as counter pattern
-- but code uses event-log pattern (1 row per request).
-- This migration drops and recreates to match the code.
-- Run AFTER 001 + 002 in Supabase SQL Editor
-- ============================================================

-- Drop the incompatible table
DROP TABLE IF EXISTS rate_limits;

-- Recreate as event-log pattern (1 row per request)
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "block_direct_access" ON rate_limits FOR ALL USING (false);

CREATE INDEX idx_rate_limits_lookup
  ON rate_limits(user_id, endpoint, created_at);
