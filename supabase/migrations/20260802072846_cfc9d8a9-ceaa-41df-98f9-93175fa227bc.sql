
GRANT SELECT (id, name, description, emoji, is_permanent, max_participants, created_by, created_at, last_activity_at, is_locked)
  ON public.ypt_rooms TO anon, authenticated;

ALTER TABLE public.study_sessions
  ADD COLUMN IF NOT EXISTS flagged boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS flag_reason text;

CREATE INDEX IF NOT EXISTS idx_study_sessions_user_started
  ON public.study_sessions (ypt_user_id, started_at DESC);
