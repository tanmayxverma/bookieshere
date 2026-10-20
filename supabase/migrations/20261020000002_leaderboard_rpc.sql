-- Migration: 20261020000002_leaderboard_rpc.sql
-- Description: Server-side aggregated RPCs for leaderboard rankings.
-- Replaces fetching raw unaggregated study_sessions rows over PostgREST.
-- Computes aggregated study seconds grouped by user in IST timezone.

CREATE OR REPLACE FUNCTION public.get_leaderboard_today(top_n int DEFAULT 50)
RETURNS TABLE (
  user_id uuid,
  name text,
  jee_year text,
  total_seconds bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    s.ypt_user_id AS user_id,
    COALESCE(u.name, 'Aspirant') AS name,
    COALESCE(u.jee_focus_year, 'JEE') AS jee_year,
    SUM(COALESCE(s.duration_seconds, 0))::bigint AS total_seconds
  FROM public.study_sessions s
  LEFT JOIN public.ypt_users u ON u.id = s.ypt_user_id
  WHERE s.status IN ('completed', 'active')
    AND s.started_at >= (timezone('Asia/Kolkata', now())::date AT TIME ZONE 'Asia/Kolkata')
  GROUP BY s.ypt_user_id, u.name, u.jee_focus_year
  ORDER BY total_seconds DESC
  LIMIT top_n;
$$;

CREATE OR REPLACE FUNCTION public.get_leaderboard_week(top_n int DEFAULT 100)
RETURNS TABLE (
  user_id uuid,
  name text,
  jee_year text,
  total_seconds bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    s.ypt_user_id AS user_id,
    COALESCE(u.name, 'Aspirant') AS name,
    COALESCE(u.jee_focus_year, 'JEE') AS jee_year,
    SUM(COALESCE(s.duration_seconds, 0))::bigint AS total_seconds
  FROM public.study_sessions s
  LEFT JOIN public.ypt_users u ON u.id = s.ypt_user_id
  WHERE s.status IN ('completed', 'active')
    AND s.started_at >= ((timezone('Asia/Kolkata', now())::date - interval '6 days') AT TIME ZONE 'Asia/Kolkata')
  GROUP BY s.ypt_user_id, u.name, u.jee_focus_year
  ORDER BY total_seconds DESC
  LIMIT top_n;
$$;

GRANT EXECUTE ON FUNCTION public.get_leaderboard_today(int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_leaderboard_week(int) TO anon, authenticated;
