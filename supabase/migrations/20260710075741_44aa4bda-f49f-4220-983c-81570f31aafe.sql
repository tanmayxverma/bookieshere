
GRANT EXECUTE ON FUNCTION public.cleanup_inactive_rooms() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_messages()   TO anon, authenticated;

DROP POLICY IF EXISTS "Update non-permanent rooms" ON public.ypt_rooms;
CREATE POLICY "Update rooms activity" ON public.ypt_rooms
  FOR UPDATE USING (true) WITH CHECK (true);

REVOKE SELECT ON public.ypt_rooms FROM anon, authenticated;
GRANT SELECT (id, name, description, emoji, is_permanent, max_participants, created_by, last_activity_at, created_at, is_locked)
  ON public.ypt_rooms TO anon, authenticated;

DROP POLICY IF EXISTS "Users can delete their own comments" ON public.community_comments;
CREATE POLICY "Users can delete their own comments" ON public.community_comments
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
