-- Migration: 20261020000000_quota_realtime_publication.sql
-- Description: Drop high-frequency and static tables from supabase_realtime publication.
-- Verified: Zero frontend/backend subscribers remain for these tables.
-- Safe: Does NOT delete data. Only stops Postgres WAL replication to Realtime WebSocket servers.

DO $$
BEGIN
  -- 1. study_sessions (Timer heartbeats previously generated ~4.9M WAL evaluations)
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'study_sessions'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.study_sessions;
  END IF;

  -- 2. materials (Static content cached via React Query)
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'materials'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.materials;
  END IF;

  -- 3. notification_reads (High-frequency per-user read markers)
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notification_reads'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.notification_reads;
  END IF;

  -- 4. ypt_rooms (Room list polled on demand / visibility; room_messages remains realtime)
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'ypt_rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.ypt_rooms;
  END IF;
END $$;
