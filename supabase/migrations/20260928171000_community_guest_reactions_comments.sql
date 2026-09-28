-- Allow both authenticated and guest profiles to react and comment
GRANT SELECT ON public.profiles TO anon;
GRANT INSERT, UPDATE, DELETE ON public.community_reactions TO anon;
GRANT INSERT, DELETE ON public.community_comments TO anon;

GRANT ALL ON public.community_reactions TO anon, authenticated;

DROP POLICY IF EXISTS "reactions insert" ON public.community_reactions;
DROP POLICY IF EXISTS "reactions update" ON public.community_reactions;
DROP POLICY IF EXISTS "reactions delete" ON public.community_reactions;

CREATE POLICY "reactions insert" ON public.community_reactions FOR INSERT TO public
  WITH CHECK (user_id IS NOT NULL);

CREATE POLICY "reactions update" ON public.community_reactions FOR UPDATE TO public
  USING (user_id IS NOT NULL)
  WITH CHECK (user_id IS NOT NULL);

CREATE POLICY "reactions delete" ON public.community_reactions FOR DELETE TO public
  USING (user_id IS NOT NULL);

DROP POLICY IF EXISTS "comments insert" ON public.community_comments;
DROP POLICY IF EXISTS "comments delete" ON public.community_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.community_comments;

CREATE POLICY "comments insert" ON public.community_comments FOR INSERT TO public
  WITH CHECK ((auth.uid() IS NOT NULL AND auth.uid() = user_id) OR (profile_id IN (SELECT id FROM profiles WHERE user_id IS NULL)));

CREATE POLICY "comments delete" ON public.community_comments FOR DELETE TO public
  USING ((auth.uid() IS NOT NULL AND auth.uid() = user_id) OR (profile_id IN (SELECT id FROM profiles WHERE user_id IS NULL)) OR has_role(auth.uid(), 'admin'::app_role));
