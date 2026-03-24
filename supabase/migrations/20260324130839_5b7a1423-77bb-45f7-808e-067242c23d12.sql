
CREATE TABLE public.room_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.ypt_rooms(id) ON DELETE CASCADE,
  ypt_user_id uuid NOT NULL REFERENCES public.ypt_users(id) ON DELETE CASCADE,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.room_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read room_messages" ON public.room_messages FOR SELECT TO public USING (true);
CREATE POLICY "Public insert room_messages" ON public.room_messages FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public delete room_messages" ON public.room_messages FOR DELETE TO public USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.room_messages;

CREATE OR REPLACE FUNCTION public.cleanup_old_messages()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  DELETE FROM public.room_messages
  WHERE created_at < now() - interval '1 hour';
$$;
