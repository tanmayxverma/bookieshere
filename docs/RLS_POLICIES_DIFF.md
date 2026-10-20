# RLS Policies Optimization Diff

This document details the exact before-and-after definitions for all PostgreSQL Row Level Security (RLS) policies rewritten in migration `20261020000004_rls_subquery_auth.sql`.

## Rationale
In PostgreSQL, calling volatile functions like `auth.uid()` directly inside RLS policies forces the database engine to evaluate the function row-by-row during sequential and index scans. Wrapping the call in a scalar subquery `(select auth.uid())` allows PostgreSQL to evaluate the function once per query execution and cache the result across all scanned rows.

**Logic Change:** ZERO. The permissions, roles, filters, and access rules remain 100% identical.

---

## Policies Diff

```diff
-- ==============================================================================
-- 1. community_comments
-- ==============================================================================
POLICY "comments delete" ON public.community_comments FOR DELETE TO public
- USING ((((auth.uid() IS NOT NULL) AND (auth.uid() = user_id)) OR (profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id IS NULL)) OR has_role(auth.uid(), 'admin'::app_role)))
+ USING (((((select auth.uid()) IS NOT NULL) AND ((select auth.uid()) = user_id)) OR (profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id IS NULL)) OR has_role((select auth.uid()), 'admin'::app_role)))

POLICY "comments insert" ON public.community_comments FOR INSERT TO public
- WITH CHECK ((((auth.uid() IS NOT NULL) AND (auth.uid() = user_id)) OR (profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id IS NULL))))
+ WITH CHECK (((((select auth.uid()) IS NOT NULL) AND ((select auth.uid()) = user_id)) OR (profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id IS NULL))))

-- ==============================================================================
-- 2. community_posts
-- ==============================================================================
POLICY "posts delete own or admin" ON public.community_posts FOR DELETE TO authenticated
- USING (((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role)))
+ USING ((((select auth.uid()) = user_id) OR has_role((select auth.uid()), 'admin'::app_role)))

POLICY "posts insert own" ON public.community_posts FOR INSERT TO authenticated
- WITH CHECK ((auth.uid() = user_id))
+ WITH CHECK (((select auth.uid()) = user_id))

POLICY "posts update own" ON public.community_posts FOR UPDATE TO authenticated
- USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id))
+ USING (((select auth.uid()) = user_id)) WITH CHECK (((select auth.uid()) = user_id))

-- ==============================================================================
-- 3. materials
-- ==============================================================================
POLICY "Admins can delete materials" ON public.materials FOR DELETE TO authenticated
- USING (has_role(auth.uid(), 'admin'::app_role))
+ USING (has_role((select auth.uid()), 'admin'::app_role))

POLICY "Admins can insert materials" ON public.materials FOR INSERT TO authenticated
- WITH CHECK (has_role(auth.uid(), 'admin'::app_role))
+ WITH CHECK (has_role((select auth.uid()), 'admin'::app_role))

POLICY "Admins can update materials" ON public.materials FOR UPDATE TO authenticated
- USING (has_role(auth.uid(), 'admin'::app_role))
+ USING (has_role((select auth.uid()), 'admin'::app_role))

-- ==============================================================================
-- 4. notification_reads
-- ==============================================================================
POLICY "users insert own notification reads" ON public.notification_reads FOR INSERT TO authenticated
- WITH CHECK (profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()))
+ WITH CHECK (profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = (select auth.uid())))

POLICY "users read own notification reads" ON public.notification_reads FOR SELECT TO authenticated
- USING (profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()))
+ USING (profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = (select auth.uid())))

-- ==============================================================================
-- 5. profiles
-- ==============================================================================
POLICY "Users delete own profile" ON public.profiles FOR DELETE TO authenticated
- USING ((auth.uid() = user_id))
+ USING (((select auth.uid()) = user_id))

POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated
- WITH CHECK ((auth.uid() = user_id))
+ WITH CHECK (((select auth.uid()) = user_id))

POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated
- USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id))
+ USING (((select auth.uid()) = user_id)) WITH CHECK (((select auth.uid()) = user_id))

-- ==============================================================================
-- 6. support_chats
-- ==============================================================================
POLICY "chats owner select" ON public.support_chats FOR SELECT TO authenticated
- USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = support_chats.profile_id AND p.user_id = auth.uid()))
+ USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = support_chats.profile_id AND p.user_id = (select auth.uid())))

POLICY "chats owner update" ON public.support_chats FOR UPDATE TO authenticated
- USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = support_chats.profile_id AND p.user_id = auth.uid()))
- WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = support_chats.profile_id AND p.user_id = auth.uid()))
+ USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = support_chats.profile_id AND p.user_id = (select auth.uid())))
+ WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = support_chats.profile_id AND p.user_id = (select auth.uid())))

-- ==============================================================================
-- 7. support_messages
-- ==============================================================================
POLICY "msgs owner insert" ON public.support_messages FOR INSERT TO authenticated
- WITH CHECK ((author_role = 'user'::text) AND EXISTS (SELECT 1 FROM support_chats c JOIN profiles p ON p.id = c.profile_id WHERE c.id = support_messages.chat_id AND p.user_id = auth.uid() AND c.status <> 'rejected'::text))
+ WITH CHECK ((author_role = 'user'::text) AND EXISTS (SELECT 1 FROM support_chats c JOIN profiles p ON p.id = c.profile_id WHERE c.id = support_messages.chat_id AND p.user_id = (select auth.uid()) AND c.status <> 'rejected'::text))

POLICY "msgs owner select" ON public.support_messages FOR SELECT TO authenticated
- USING (EXISTS (SELECT 1 FROM support_chats c JOIN profiles p ON p.id = c.profile_id WHERE c.id = support_messages.chat_id AND p.user_id = auth.uid()))
+ USING (EXISTS (SELECT 1 FROM support_chats c JOIN profiles p ON p.id = c.profile_id WHERE c.id = support_messages.chat_id AND p.user_id = (select auth.uid())))

-- ==============================================================================
-- 8. syllabus_progress
-- ==============================================================================
POLICY "Users manage own syllabus progress" ON public.syllabus_progress FOR ALL TO authenticated
- USING (profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()))
- WITH CHECK (profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()))
+ USING (profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = (select auth.uid())))
+ WITH CHECK (profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = (select auth.uid())))

-- ==============================================================================
-- 9. test_questions
-- ==============================================================================
POLICY "Users can view questions of completed own tests" ON public.test_questions FOR SELECT TO authenticated
- USING (EXISTS (SELECT 1 FROM tests t WHERE t.id = test_questions.test_id AND t.user_id = auth.uid() AND t.status = 'completed'::test_status))
+ USING (EXISTS (SELECT 1 FROM tests t WHERE t.id = test_questions.test_id AND t.user_id = (select auth.uid()) AND t.status = 'completed'::test_status))

-- ==============================================================================
-- 10. tests
-- ==============================================================================
POLICY "Users can create own tests" ON public.tests FOR INSERT TO authenticated
- WITH CHECK (user_id = auth.uid())
+ WITH CHECK (user_id = (select auth.uid()))

POLICY "Users can delete own tests" ON public.tests FOR DELETE TO authenticated
- USING (user_id = auth.uid())
+ USING (user_id = (select auth.uid()))

POLICY "Users can update own tests" ON public.tests FOR UPDATE TO authenticated
- USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())
+ USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()))

POLICY "Users can view own tests" ON public.tests FOR SELECT TO authenticated
- USING (user_id = auth.uid())
+ USING (user_id = (select auth.uid()))

-- ==============================================================================
-- 11. ticket_messages
-- ==============================================================================
POLICY "users read messages of own tickets" ON public.ticket_messages FOR SELECT TO authenticated
- USING (ticket_id IN (SELECT tickets.id FROM tickets WHERE tickets.profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid())))
+ USING (ticket_id IN (SELECT tickets.id FROM tickets WHERE tickets.profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = (select auth.uid()))))

POLICY "users send messages on own tickets" ON public.ticket_messages FOR INSERT TO authenticated
- WITH CHECK ((author_role = 'user'::text) AND ticket_id IN (SELECT tickets.id FROM tickets WHERE tickets.profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()) AND tickets.status <> ALL (ARRAY['closed'::text, 'rejected'::text])))
+ WITH CHECK ((author_role = 'user'::text) AND ticket_id IN (SELECT tickets.id FROM tickets WHERE tickets.profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = (select auth.uid())) AND tickets.status <> ALL (ARRAY['closed'::text, 'rejected'::text])))

-- ==============================================================================
-- 12. tickets
-- ==============================================================================
POLICY "users create own tickets" ON public.tickets FOR INSERT TO authenticated
- WITH CHECK (profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()))
+ WITH CHECK (profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = (select auth.uid())))

POLICY "users read own tickets" ON public.tickets FOR SELECT TO authenticated
- USING (profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()))
+ USING (profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = (select auth.uid())))

-- ==============================================================================
-- 13. user_roles
-- ==============================================================================
POLICY "Admins can manage all roles" ON public.user_roles FOR ALL TO authenticated
- USING (has_role(auth.uid(), 'admin'::app_role))
+ USING (has_role((select auth.uid()), 'admin'::app_role))

POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated
- USING (auth.uid() = user_id)
+ USING ((select auth.uid()) = user_id)
```
