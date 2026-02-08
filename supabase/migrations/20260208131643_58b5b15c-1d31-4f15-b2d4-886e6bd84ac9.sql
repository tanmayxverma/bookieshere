
-- Add name change tracking to ypt_users
ALTER TABLE public.ypt_users
ADD COLUMN IF NOT EXISTS name_change_history jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Add heartbeat column to study_sessions for anti-cheat
ALTER TABLE public.study_sessions
ADD COLUMN IF NOT EXISTS last_heartbeat timestamp with time zone DEFAULT now();

-- Create a function to clean up stale sessions (no heartbeat for 60 seconds)
CREATE OR REPLACE FUNCTION public.cleanup_stale_sessions()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.study_sessions
  SET status = 'completed',
      ended_at = last_heartbeat,
      duration_seconds = EXTRACT(EPOCH FROM (last_heartbeat - started_at))::integer
  WHERE status = 'active'
    AND last_heartbeat < now() - interval '60 seconds';
$$;

-- Delete old session history (older than 7 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_sessions()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.study_sessions
  WHERE status = 'completed'
    AND started_at < now() - interval '7 days';
$$;
