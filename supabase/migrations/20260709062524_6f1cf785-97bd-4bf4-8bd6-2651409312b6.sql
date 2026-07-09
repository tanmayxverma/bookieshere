
-- 1. Profiles: keep public reads for display fields, hide user_id + device_id from anon.
REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (id, account_type, display_name, avatar_url, target_category, onboarded_at, created_at, updated_at)
  ON public.profiles TO anon;

-- 2. YPT rooms: hide pin_hash from clients entirely (verify_room_pin RPC still checks it).
REVOKE SELECT ON public.ypt_rooms FROM anon, authenticated;
GRANT SELECT (id, name, description, emoji, is_permanent, max_participants, created_by, last_activity_at, created_at, is_locked)
  ON public.ypt_rooms TO anon, authenticated;
GRANT SELECT ON public.ypt_rooms TO service_role;

-- 3. Replace overly-permissive USING/WITH CHECK (true) on ypt_rooms.
DROP POLICY IF EXISTS "Public insert rooms" ON public.ypt_rooms;
DROP POLICY IF EXISTS "Public update rooms" ON public.ypt_rooms;
DROP POLICY IF EXISTS "Public delete rooms" ON public.ypt_rooms;

CREATE POLICY "Insert non-permanent rooms" ON public.ypt_rooms
  FOR INSERT WITH CHECK (is_permanent = false AND created_by IS NOT NULL);
CREATE POLICY "Update non-permanent rooms" ON public.ypt_rooms
  FOR UPDATE USING (is_permanent = false) WITH CHECK (is_permanent = false);
CREATE POLICY "Delete non-permanent rooms" ON public.ypt_rooms
  FOR DELETE USING (is_permanent = false);

-- 4. Storage: room-images bucket hardening.
DROP POLICY IF EXISTS "Public read room images" ON storage.objects;
DROP POLICY IF EXISTS "Public upload room images" ON storage.objects;
DROP POLICY IF EXISTS "Public delete room images" ON storage.objects;

-- Uploads restricted to known folder prefixes and to real image MIME types <= 5 MB.
CREATE POLICY "Room images scoped insert" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'room-images'
    AND (name LIKE 'community/%' OR name LIKE 'support/%' OR name LIKE 'rooms/%')
    AND COALESCE((metadata->>'size')::bigint, 0) <= 5242880
    AND COALESCE(metadata->>'mimetype','') IN ('image/jpeg','image/png','image/webp','image/gif')
  );

-- Only authenticated owners may delete files they uploaded.
CREATE POLICY "Room images owner delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'room-images' AND owner = auth.uid());

-- No SELECT policy for room-images: the bucket stays public for direct URL fetches,
-- but list()/enumeration through the Data API is disabled.

-- 5. Revoke EXECUTE on internal SECURITY DEFINER helpers (triggers / cron only).
REVOKE EXECUTE ON FUNCTION public.handle_new_user()               FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_ticket_last_message()     FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_support_chat()            FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column()      FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_community_post_rate()   FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_inactive_rooms()        FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_messages()          FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_sessions()          FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_stale_sessions()        FROM anon, authenticated;
