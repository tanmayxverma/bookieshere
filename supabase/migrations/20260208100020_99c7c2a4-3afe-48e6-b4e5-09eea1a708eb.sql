
-- YPT Users (device-based identity, no auth required)
CREATE TABLE public.ypt_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  jee_focus_year TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ypt_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read ypt_users" ON public.ypt_users FOR SELECT USING (true);
CREATE POLICY "Public insert ypt_users" ON public.ypt_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update ypt_users" ON public.ypt_users FOR UPDATE USING (true);

-- Study Sessions
CREATE TABLE public.study_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ypt_user_id UUID NOT NULL REFERENCES public.ypt_users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read study_sessions" ON public.study_sessions FOR SELECT USING (true);
CREATE POLICY "Public insert study_sessions" ON public.study_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update study_sessions" ON public.study_sessions FOR UPDATE USING (true);

-- YPT Todos (session-based checklist)
CREATE TABLE public.ypt_todos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ypt_user_id UUID NOT NULL REFERENCES public.ypt_users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ypt_todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read ypt_todos" ON public.ypt_todos FOR SELECT USING (true);
CREATE POLICY "Public insert ypt_todos" ON public.ypt_todos FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update ypt_todos" ON public.ypt_todos FOR UPDATE USING (true);
CREATE POLICY "Public delete ypt_todos" ON public.ypt_todos FOR DELETE USING (true);

-- Enable realtime for live presence
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_sessions;
