
-- Rooms table
CREATE TABLE public.ypt_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  emoji TEXT DEFAULT '📖',
  is_permanent BOOLEAN NOT NULL DEFAULT false,
  max_participants INTEGER,
  created_by UUID REFERENCES public.ypt_users(id) ON DELETE CASCADE,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Room members table
CREATE TABLE public.ypt_room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.ypt_rooms(id) ON DELETE CASCADE,
  ypt_user_id UUID NOT NULL REFERENCES public.ypt_users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id, ypt_user_id)
);

-- Enable RLS
ALTER TABLE public.ypt_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ypt_room_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for rooms
CREATE POLICY "Public read rooms" ON public.ypt_rooms FOR SELECT TO public USING (true);
CREATE POLICY "Public insert rooms" ON public.ypt_rooms FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public update rooms" ON public.ypt_rooms FOR UPDATE TO public USING (true);
CREATE POLICY "Public delete rooms" ON public.ypt_rooms FOR DELETE TO public USING (true);

-- RLS policies for room members
CREATE POLICY "Public read room_members" ON public.ypt_room_members FOR SELECT TO public USING (true);
CREATE POLICY "Public insert room_members" ON public.ypt_room_members FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public delete room_members" ON public.ypt_room_members FOR DELETE TO public USING (true);

-- Enable realtime for rooms
ALTER PUBLICATION supabase_realtime ADD TABLE public.ypt_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ypt_room_members;

-- Insert permanent rooms
INSERT INTO public.ypt_rooms (name, description, emoji, is_permanent) VALUES
  ('JEE 2027', 'Study room for JEE 2027 aspirants', '🎯', true),
  ('JEE 2028', 'Study room for JEE 2028 aspirants', '🚀', true);

-- Add priority column to ypt_todos
ALTER TABLE public.ypt_todos ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';

-- Function to clean up inactive custom rooms (1 hour inactivity)
CREATE OR REPLACE FUNCTION public.cleanup_inactive_rooms()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  DELETE FROM public.ypt_rooms
  WHERE is_permanent = false
    AND last_activity_at < now() - interval '1 hour';
$$;
