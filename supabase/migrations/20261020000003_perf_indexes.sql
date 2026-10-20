-- Migration: 20261020000003_perf_indexes.sql
-- Description: Indexes for unindexed foreign keys and hot queries.
-- Per amendment 5: Plain CREATE INDEX IF NOT EXISTS (no CONCURRENTLY so it succeeds in transactions).
-- Does NOT index the high-churn heartbeat column.
-- Verified: All table and column names validated against live PostgreSQL information_schema.

-- 1. Study sessions hot queries (streak, stats, leaderboard, user sessions)
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_status_started 
  ON public.study_sessions (ypt_user_id, status, started_at);

CREATE INDEX IF NOT EXISTS idx_study_sessions_status_started 
  ON public.study_sessions (status, started_at);

-- 2. Room messages (chat load by room and author queries)
CREATE INDEX IF NOT EXISTS idx_room_messages_room_created 
  ON public.room_messages (room_id, created_at);

CREATE INDEX IF NOT EXISTS idx_room_messages_ypt_user_id 
  ON public.room_messages (ypt_user_id);

-- 3. Room members
CREATE INDEX IF NOT EXISTS idx_ypt_room_members_room_id 
  ON public.ypt_room_members (room_id);

CREATE INDEX IF NOT EXISTS idx_ypt_room_members_user_id 
  ON public.ypt_room_members (ypt_user_id);

-- 4. Todos
CREATE INDEX IF NOT EXISTS idx_ypt_todos_user_date 
  ON public.ypt_todos (ypt_user_id, created_date);

-- 5. Community comments and reactions
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id 
  ON public.community_comments (post_id);

CREATE INDEX IF NOT EXISTS idx_community_comments_profile_id 
  ON public.community_comments (profile_id);

CREATE INDEX IF NOT EXISTS idx_community_reactions_post_id 
  ON public.community_reactions (post_id);

CREATE INDEX IF NOT EXISTS idx_community_reactions_user_id 
  ON public.community_reactions (user_id);

-- 6. Notifications reads
CREATE INDEX IF NOT EXISTS idx_notification_reads_notification_id 
  ON public.notification_reads (notification_id);

CREATE INDEX IF NOT EXISTS idx_notification_reads_profile_id 
  ON public.notification_reads (profile_id);

-- 7. Syllabus progress
CREATE INDEX IF NOT EXISTS idx_syllabus_progress_profile_id 
  ON public.syllabus_progress (profile_id);

-- 8. Tickets and Ticket messages
CREATE INDEX IF NOT EXISTS idx_tickets_profile_id 
  ON public.tickets (profile_id);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id 
  ON public.ticket_messages (ticket_id);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_author_profile_id 
  ON public.ticket_messages (author_profile_id);

-- 9. Support messages
CREATE INDEX IF NOT EXISTS idx_support_messages_chat_id 
  ON public.support_messages (chat_id);
