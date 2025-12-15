-- ====================
-- RLS Policies for ds-apps
-- ====================
-- 
-- Run this in Supabase SQL Editor to secure tables
-- while still allowing contributor access via anon key.
--
-- Philosophy:
-- - anon can READ all data (for notebooks/analysis)
-- - anon can INSERT to likes (via function)
-- - anon CANNOT delete or update anything
-- - service_role bypasses all (for GitHub Actions)
--
-- ====================


-- ====================
-- 1. Enable RLS on all tables
-- ====================

ALTER TABLE posthog_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE posthog_batch_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_run_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;


-- ====================
-- 2. posthog_events (main analytics data)
-- ====================
-- Contributors can read for analysis, but not modify

CREATE POLICY "anon_select_posthog_events"
  ON posthog_events
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "service_all_posthog_events"
  ON posthog_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ====================
-- 3. posthog_batch_events (raw batches)
-- ====================
-- Read-only for anon

CREATE POLICY "anon_select_posthog_batch_events"
  ON posthog_batch_events
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "service_all_posthog_batch_events"
  ON posthog_batch_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ====================
-- 4. likes (user reactions)
-- ====================
-- anon can SELECT and INSERT (for the toggle_like function)
-- but cannot UPDATE or DELETE directly

CREATE POLICY "anon_select_likes"
  ON likes
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "anon_insert_likes"
  ON likes
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Note: toggle_like function uses SECURITY DEFINER, 
-- so it can delete even though anon can't directly

CREATE POLICY "service_all_likes"
  ON likes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ====================
-- 5. analytics_run_log (notebook run history)
-- ====================
-- Read-only for contributors, service_role writes

CREATE POLICY "anon_select_analytics_run_log"
  ON analytics_run_log
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "service_all_analytics_run_log"
  ON analytics_run_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ====================
-- 6. events (legacy/generic events)
-- ====================
-- Read-only for anon

CREATE POLICY "anon_select_events"
  ON events
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "service_all_events"
  ON events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ====================
-- 7. experiments (A/B test configs)
-- ====================
-- Read-only for anon

CREATE POLICY "anon_select_experiments"
  ON experiments
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "service_all_experiments"
  ON experiments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ====================
-- 8. Update function security
-- ====================
-- Ensure toggle_like can still delete (uses SECURITY DEFINER)

CREATE OR REPLACE FUNCTION toggle_like(p_path TEXT, p_fingerprint TEXT)
RETURNS BIGINT AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM likes WHERE page_path = p_path AND user_fingerprint = p_fingerprint
  ) INTO v_exists;
  
  IF v_exists THEN
    DELETE FROM likes WHERE page_path = p_path AND user_fingerprint = p_fingerprint;
  ELSE
    INSERT INTO likes (page_path, user_fingerprint) VALUES (p_path, p_fingerprint);
  END IF;
  
  RETURN (SELECT COUNT(*) FROM likes WHERE page_path = p_path);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ====================
-- Verification Query
-- ====================
-- Run this to confirm policies are active:
--
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd
-- FROM pg_policies 
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
