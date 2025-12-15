-- Fix v_conversion_funnel to match variant_overview filter
-- Add feature_flag_response IS NOT NULL to all CTEs

CREATE OR REPLACE VIEW public.v_conversion_funnel AS
WITH started_events AS (
  SELECT
    variant,
    'Started'::text AS stage,
    count(*) AS event_count,
    count(DISTINCT distinct_id) AS unique_users,
    1 AS stage_order
  FROM public.posthog_events
  WHERE event = 'puzzle_started'
    AND variant IS NOT NULL
    AND feature_flag_response IS NOT NULL
    AND session_id IS NOT NULL
  GROUP BY variant
),
completed_events AS (
  SELECT
    variant,
    'Completed'::text AS stage,
    count(*) AS event_count,
    count(DISTINCT distinct_id) AS unique_users,
    2 AS stage_order
  FROM public.posthog_events
  WHERE event = 'puzzle_completed'
    AND variant IS NOT NULL
    AND feature_flag_response IS NOT NULL
    AND session_id IS NOT NULL
  GROUP BY variant
),
repeated_events AS (
  SELECT
    variant,
    'Repeated'::text AS stage,
    count(*) AS event_count,
    count(DISTINCT distinct_id) AS unique_users,
    3 AS stage_order
  FROM public.posthog_events
  WHERE event = 'puzzle_repeated'
    AND variant IS NOT NULL
    AND feature_flag_response IS NOT NULL
    AND session_id IS NOT NULL
  GROUP BY variant
),
failed_events AS (
  SELECT
    variant,
    'Failed'::text AS stage,
    count(*) AS event_count,
    count(DISTINCT distinct_id) AS unique_users,
    4 AS stage_order
  FROM public.posthog_events
  WHERE event = 'puzzle_failed'
    AND variant IS NOT NULL
    AND feature_flag_response IS NOT NULL
    AND session_id IS NOT NULL
  GROUP BY variant
)
SELECT variant, stage, event_count, unique_users, stage_order
FROM (
  SELECT * FROM started_events
  UNION ALL
  SELECT * FROM completed_events
  UNION ALL
  SELECT * FROM repeated_events
  UNION ALL
  SELECT * FROM failed_events
) funnel_stages
ORDER BY variant, stage_order;
