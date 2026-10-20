-- Migration: 20261020000004_rls_subquery_auth.sql
-- Description: RLS Performance Optimization - wrap auth.uid() in (select auth.uid())
-- Prevents re-evaluating volatile auth functions for every single row scanned.
-- ZERO logic changes: Only wraps auth calls in scalar subqueries.

BEGIN;

-- 1. community_comments
DROP POLICY IF EXISTS "comments delete" ON public.community_comments;
CREATE POLICY "comments delete" ON public.community_comments
  FOR DELETE TO public
  USING (
    (((select auth.uid()) IS NOT NULL) AND ((select auth.uid()) = user_id))
    OR (profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id IS NULL))
    OR has_role((select auth.uid()), 'admin'::app_role)
  );

DROP POLICY IF EXISTS "comments insert" ON public.community_comments;
CREATE POLICY "comments insert" ON public.community_comments
  FOR INSERT TO public
  WITH CHECK (
    (((select auth.uid()) IS NOT NULL) AND ((select auth.uid()) = user_id))
    OR (profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id IS NULL))
  );

-- 2. community_posts
DROP POLICY IF EXISTS "posts delete own or admin" ON public.community_posts;
CREATE POLICY "posts delete own or admin" ON public.community_posts
  FOR DELETE TO authenticated
  USING (
    ((select auth.uid()) = user_id)
    OR has_role((select auth.uid()), 'admin'::app_role)
  );

DROP POLICY IF EXISTS "posts insert own" ON public.community_posts;
CREATE POLICY "posts insert own" ON public.community_posts
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "posts update own" ON public.community_posts;
CREATE POLICY "posts update own" ON public.community_posts
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- 3. materials
DROP POLICY IF EXISTS "Admins can delete materials" ON public.materials;
CREATE POLICY "Admins can delete materials" ON public.materials
  FOR DELETE TO authenticated
  USING (has_role((select auth.uid()), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can insert materials" ON public.materials;
CREATE POLICY "Admins can insert materials" ON public.materials
  FOR INSERT TO authenticated
  WITH CHECK (has_role((select auth.uid()), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update materials" ON public.materials;
CREATE POLICY "Admins can update materials" ON public.materials
  FOR UPDATE TO authenticated
  USING (has_role((select auth.uid()), 'admin'::app_role));

-- 4. notification_reads
DROP POLICY IF EXISTS "users insert own notification reads" ON public.notification_reads;
CREATE POLICY "users insert own notification reads" ON public.notification_reads
  FOR INSERT TO authenticated
  WITH CHECK (profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = (select auth.uid())));

DROP POLICY IF EXISTS "users read own notification reads" ON public.notification_reads;
CREATE POLICY "users read own notification reads" ON public.notification_reads
  FOR SELECT TO authenticated
  USING (profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = (select auth.uid())));

-- 5. profiles
DROP POLICY IF EXISTS "Users delete own profile" ON public.profiles;
CREATE POLICY "Users delete own profile" ON public.profiles
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- 6. support_chats
DROP POLICY IF EXISTS "chats owner select" ON public.support_chats;
CREATE POLICY "chats owner select" ON public.support_chats
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = support_chats.profile_id AND p.user_id = (select auth.uid())));

DROP POLICY IF EXISTS "chats owner update" ON public.support_chats;
CREATE POLICY "chats owner update" ON public.support_chats
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = support_chats.profile_id AND p.user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = support_chats.profile_id AND p.user_id = (select auth.uid())));

-- 7. support_messages
DROP POLICY IF EXISTS "msgs owner insert" ON public.support_messages;
CREATE POLICY "msgs owner insert" ON public.support_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    author_role = 'user'::text
    AND EXISTS (
      SELECT 1 FROM support_chats c
      JOIN profiles p ON p.id = c.profile_id
      WHERE c.id = support_messages.chat_id
        AND p.user_id = (select auth.uid())
        AND c.status <> 'rejected'::text
    )
  );

DROP POLICY IF EXISTS "msgs owner select" ON public.support_messages;
CREATE POLICY "msgs owner select" ON public.support_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM support_chats c
      JOIN profiles p ON p.id = c.profile_id
      WHERE c.id = support_messages.chat_id
        AND p.user_id = (select auth.uid())
    )
  );

-- 8. syllabus_progress
DROP POLICY IF EXISTS "Users manage own syllabus progress" ON public.syllabus_progress;
CREATE POLICY "Users manage own syllabus progress" ON public.syllabus_progress
  FOR ALL TO authenticated
  USING (profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = (select auth.uid())))
  WITH CHECK (profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = (select auth.uid())));

-- 9. test_questions
DROP POLICY IF EXISTS "Users can view questions of completed own tests" ON public.test_questions;
CREATE POLICY "Users can view questions of completed own tests" ON public.test_questions
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM tests t
    WHERE t.id = test_questions.test_id
      AND t.user_id = (select auth.uid())
      AND t.status = 'completed'::test_status
  ));

-- 10. tests
DROP POLICY IF EXISTS "Users can create own tests" ON public.tests;
CREATE POLICY "Users can create own tests" ON public.tests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own tests" ON public.tests;
CREATE POLICY "Users can delete own tests" ON public.tests
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own tests" ON public.tests;
CREATE POLICY "Users can update own tests" ON public.tests
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own tests" ON public.tests;
CREATE POLICY "Users can view own tests" ON public.tests
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- 11. ticket_messages
DROP POLICY IF EXISTS "users read messages of own tickets" ON public.ticket_messages;
CREATE POLICY "users read messages of own tickets" ON public.ticket_messages
  FOR SELECT TO authenticated
  USING (ticket_id IN (
    SELECT tickets.id FROM tickets
    WHERE tickets.profile_id IN (
      SELECT profiles.id FROM profiles WHERE profiles.user_id = (select auth.uid())
    )
  ));

DROP POLICY IF EXISTS "users send messages on own tickets" ON public.ticket_messages;
CREATE POLICY "users send messages on own tickets" ON public.ticket_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    author_role = 'user'::text
    AND ticket_id IN (
      SELECT tickets.id FROM tickets
      WHERE tickets.profile_id IN (
        SELECT profiles.id FROM profiles WHERE profiles.user_id = (select auth.uid())
      )
      AND tickets.status <> ALL (ARRAY['closed'::text, 'rejected'::text])
    )
  );

-- 12. tickets
DROP POLICY IF EXISTS "users create own tickets" ON public.tickets;
CREATE POLICY "users create own tickets" ON public.tickets
  FOR INSERT TO authenticated
  WITH CHECK (profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = (select auth.uid())));

DROP POLICY IF EXISTS "users read own tickets" ON public.tickets;
CREATE POLICY "users read own tickets" ON public.tickets
  FOR SELECT TO authenticated
  USING (profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = (select auth.uid())));

-- 13. user_roles
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (has_role((select auth.uid()), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

COMMIT;
