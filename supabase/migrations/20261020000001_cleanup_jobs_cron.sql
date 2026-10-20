-- Migration: 20261020000001_cleanup_jobs_cron.sql
-- Description: Server-side cleanup functions and pg_cron schedule to eliminate client-driven DB maintenance.
-- User amendment 2 & 3 & 4:
-- - Grace period = 300s (background tabs throttled)
-- - Compute study duration from started_at / last_heartbeat timestamps
-- - Run cleanup every 5 minutes on server via pg_cron (written, not applied)
-- - Revoke client execution to stop 403 / unauthenticated spam

-- 1. Server-side stale session cleanup (5-minute / 300s grace period)
CREATE OR REPLACE FUNCTION public.cleanup_stale_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.study_sessions
  SET status = 'completed',
      ended_at = COALESCE(last_heartbeat, started_at),
      duration_seconds = GREATEST(0, EXTRACT(EPOCH FROM (COALESCE(last_heartbeat, started_at) - started_at))::integer)
  WHERE status = 'active'
    AND COALESCE(last_heartbeat, started_at) < now() - interval '300 seconds';
END;
$$;

-- 2. Server-side room message cleanup (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_messages()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.room_messages
  WHERE created_at < now() - interval '24 hours';
END;
$$;

-- 3. Server-side stale room member cleanup (older than 2 hours)
CREATE OR REPLACE FUNCTION public.cleanup_stale_room_members()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.ypt_room_members
  WHERE joined_at < now() - interval '2 hours';
END;
$$;

-- 4. Revoke client execution so anon/authenticated users do not invoke table maintenance
REVOKE EXECUTE ON FUNCTION public.cleanup_stale_sessions() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_messages() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_stale_room_members() FROM anon, authenticated;

-- 5. pg_cron schedule (runs only if pg_cron is enabled in the database)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Cleanup stale sessions every 5 minutes
    PERFORM cron.unschedule('cleanup-stale-sessions') WHERE EXISTS (
      SELECT 1 FROM cron.job WHERE jobname = 'cleanup-stale-sessions'
    );
    PERFORM cron.schedule('cleanup-stale-sessions', '*/5 * * * *', 'SELECT public.cleanup_stale_sessions()');

    -- Cleanup old messages every 15 minutes
    PERFORM cron.unschedule('cleanup-old-messages') WHERE EXISTS (
      SELECT 1 FROM cron.job WHERE jobname = 'cleanup-old-messages'
    );
    PERFORM cron.schedule('cleanup-old-messages', '*/15 * * * *', 'SELECT public.cleanup_old_messages()');

    -- Cleanup stale room members every 30 minutes
    PERFORM cron.unschedule('cleanup-stale-room-members') WHERE EXISTS (
      SELECT 1 FROM cron.job WHERE jobname = 'cleanup-stale-room-members'
    );
    PERFORM cron.schedule('cleanup-stale-room-members', '*/30 * * * *', 'SELECT public.cleanup_stale_room_members()');
  END IF;
END $$;
