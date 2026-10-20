-- Migration: 20261020000001_cleanup_jobs_cron.sql
-- Description: Server-side cleanup functions and pg_cron schedule to eliminate client-driven DB maintenance.
-- User amendment 2 & 3 & 4:
-- - Grace period = 300s (background tabs throttled)
-- - Compute study duration from started_at / last_heartbeat timestamps
-- - Run cleanup every 5 minutes on server via pg_cron (written, not applied)
-- - cleanup_old_messages left exactly as written

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

-- 2. Server-side room message cleanup (older than 24 hours - left exactly as written)
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

-- 3. Server-side stale room member cleanup
-- Activity-based cleanup: only deletes members with no active study session AND no activity for > 4 hours
CREATE OR REPLACE FUNCTION public.cleanup_stale_room_members()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.ypt_room_members rm
  WHERE rm.joined_at < now() - interval '4 hours'
    AND NOT EXISTS (
      SELECT 1 FROM public.study_sessions s 
      WHERE s.ypt_user_id = rm.ypt_user_id 
        AND s.status = 'active'
        AND COALESCE(s.last_heartbeat, s.started_at) > now() - interval '300 seconds'
    );
END;
$$;

-- 4. pg_cron schedule
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
  ELSE
    RAISE NOTICE 'pg_cron extension is not enabled in this database. Enable it with: CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;';
  END IF;
END $$;
