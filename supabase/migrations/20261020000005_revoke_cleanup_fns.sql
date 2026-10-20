-- Migration: 20261020000005_revoke_cleanup_fns.sql
-- Description: Revoke execution of maintenance functions from public, anon, and authenticated roles.
-- Apply this migration LAST, after new frontend code is live and all client cleanup calls are eliminated.

-- Revoke execute from PUBLIC, anon, and authenticated
REVOKE EXECUTE ON FUNCTION public.cleanup_stale_sessions() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_messages() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_stale_room_members() FROM PUBLIC, anon, authenticated;
