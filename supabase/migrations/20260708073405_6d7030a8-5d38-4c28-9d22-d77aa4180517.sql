
-- COMMUNITY
CREATE TABLE public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject text NOT NULL CHECK (char_length(subject) BETWEEN 1 AND 120),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 300),
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX community_posts_created_idx ON public.community_posts(created_at DESC);
CREATE INDEX community_posts_user_idx ON public.community_posts(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_posts TO authenticated;
GRANT SELECT ON public.community_posts TO anon;
GRANT ALL ON public.community_posts TO service_role;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts readable" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "posts insert own" ON public.community_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts delete own or admin" ON public.community_posts FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "posts update own" ON public.community_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.enforce_community_post_rate()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE _c int;
BEGIN
  SELECT count(*) INTO _c FROM public.community_posts
    WHERE user_id = NEW.user_id AND created_at > now() - interval '24 hours';
  IF _c >= 10 THEN RAISE EXCEPTION 'Post limit reached: 10 posts per 24 hours'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER community_posts_rate BEFORE INSERT ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.enforce_community_post_rate();
CREATE TRIGGER community_posts_touch BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX community_comments_post_idx ON public.community_comments(post_id, created_at);
GRANT SELECT, INSERT, DELETE ON public.community_comments TO authenticated;
GRANT SELECT ON public.community_comments TO anon;
GRANT ALL ON public.community_comments TO service_role;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments readable" ON public.community_comments FOR SELECT USING (true);
CREATE POLICY "comments insert" ON public.community_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments delete" ON public.community_comments FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.community_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  emoji text NOT NULL CHECK (emoji IN ('heart','laugh','like','fire','rocket','hundred','celeb')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);
CREATE INDEX community_reactions_post_idx ON public.community_reactions(post_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_reactions TO authenticated;
GRANT SELECT ON public.community_reactions TO anon;
GRANT ALL ON public.community_reactions TO service_role;
ALTER TABLE public.community_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reactions readable" ON public.community_reactions FOR SELECT USING (true);
CREATE POLICY "reactions insert" ON public.community_reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reactions update" ON public.community_reactions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reactions delete" ON public.community_reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_reactions;

-- SUPPORT V2
CREATE TABLE public.support_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  last_message_at timestamptz NOT NULL DEFAULT now(),
  last_user_read_at timestamptz,
  last_admin_read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX support_chats_last_msg_idx ON public.support_chats(last_message_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_chats TO authenticated;
GRANT ALL ON public.support_chats TO service_role;
ALTER TABLE public.support_chats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chats owner select" ON public.support_chats FOR SELECT TO authenticated USING (
  EXISTS(SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND p.user_id = auth.uid())
);
CREATE POLICY "chats owner update" ON public.support_chats FOR UPDATE TO authenticated USING (
  EXISTS(SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND p.user_id = auth.uid())
) WITH CHECK (
  EXISTS(SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND p.user_id = auth.uid())
);
CREATE TRIGGER support_chats_touch BEFORE UPDATE ON public.support_chats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.touch_support_chat()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  UPDATE public.support_chats SET last_message_at = NEW.created_at, updated_at = now()
    WHERE id = NEW.chat_id;
  RETURN NEW;
END $$;

CREATE TABLE public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL REFERENCES public.support_chats(id) ON DELETE CASCADE,
  author_role text NOT NULL CHECK (author_role IN ('user','admin','system')),
  body text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (body IS NOT NULL OR image_url IS NOT NULL)
);
CREATE INDEX support_messages_chat_idx ON public.support_messages(chat_id, created_at);
GRANT SELECT, INSERT, DELETE ON public.support_messages TO authenticated;
GRANT ALL ON public.support_messages TO service_role;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msgs owner select" ON public.support_messages FOR SELECT TO authenticated USING (
  EXISTS(SELECT 1 FROM public.support_chats c JOIN public.profiles p ON p.id = c.profile_id
         WHERE c.id = chat_id AND p.user_id = auth.uid())
);
CREATE POLICY "msgs owner insert" ON public.support_messages FOR INSERT TO authenticated WITH CHECK (
  author_role = 'user' AND EXISTS(
    SELECT 1 FROM public.support_chats c JOIN public.profiles p ON p.id = c.profile_id
    WHERE c.id = chat_id AND p.user_id = auth.uid() AND c.status = 'accepted'
  )
);
CREATE TRIGGER support_touch_chat AFTER INSERT ON public.support_messages
  FOR EACH ROW EXECUTE FUNCTION public.touch_support_chat();

ALTER PUBLICATION supabase_realtime ADD TABLE public.support_chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;

-- Guest RPCs
CREATE OR REPLACE FUNCTION public.guest_get_or_create_support_chat(_device_id text)
RETURNS public.support_chats LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _pid uuid; _row public.support_chats;
BEGIN
  SELECT id INTO _pid FROM public.profiles WHERE device_id = _device_id AND user_id IS NULL LIMIT 1;
  IF _pid IS NULL THEN RAISE EXCEPTION 'guest profile not found'; END IF;
  SELECT * INTO _row FROM public.support_chats WHERE profile_id = _pid;
  IF _row.id IS NULL THEN INSERT INTO public.support_chats(profile_id) VALUES(_pid) RETURNING * INTO _row; END IF;
  RETURN _row;
END $$;

CREATE OR REPLACE FUNCTION public.auth_get_or_create_support_chat()
RETURNS public.support_chats LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _pid uuid; _row public.support_chats;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT id INTO _pid FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
  IF _pid IS NULL THEN RAISE EXCEPTION 'profile not found'; END IF;
  SELECT * INTO _row FROM public.support_chats WHERE profile_id = _pid;
  IF _row.id IS NULL THEN INSERT INTO public.support_chats(profile_id) VALUES(_pid) RETURNING * INTO _row; END IF;
  RETURN _row;
END $$;

CREATE OR REPLACE FUNCTION public.guest_send_support_message(_device_id text, _body text, _image_url text DEFAULT NULL)
RETURNS public.support_messages LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _pid uuid; _cid uuid; _status text; _row public.support_messages;
BEGIN
  SELECT id INTO _pid FROM public.profiles WHERE device_id = _device_id AND user_id IS NULL LIMIT 1;
  IF _pid IS NULL THEN RAISE EXCEPTION 'guest profile not found'; END IF;
  SELECT id, status INTO _cid, _status FROM public.support_chats WHERE profile_id = _pid;
  IF _cid IS NULL THEN
    INSERT INTO public.support_chats(profile_id) VALUES(_pid) RETURNING id, status INTO _cid, _status;
  END IF;
  IF _status <> 'accepted' THEN RAISE EXCEPTION 'chat not accepted yet'; END IF;
  INSERT INTO public.support_messages(chat_id, author_role, body, image_url)
    VALUES (_cid, 'user', _body, _image_url) RETURNING * INTO _row;
  RETURN _row;
END $$;

CREATE OR REPLACE FUNCTION public.guest_list_support_messages(_device_id text)
RETURNS SETOF public.support_messages LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.* FROM public.support_messages m
  JOIN public.support_chats c ON c.id = m.chat_id
  JOIN public.profiles p ON p.id = c.profile_id
  WHERE p.device_id = _device_id AND p.user_id IS NULL
  ORDER BY m.created_at;
$$;

CREATE OR REPLACE FUNCTION public.guest_get_support_chat(_device_id text)
RETURNS SETOF public.support_chats LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT c.* FROM public.support_chats c
  JOIN public.profiles p ON p.id = c.profile_id
  WHERE p.device_id = _device_id AND p.user_id IS NULL;
$$;

-- Migrate old tickets into one chat per profile
DO $$
DECLARE _p record; _chat_id uuid;
BEGIN
  FOR _p IN SELECT DISTINCT profile_id FROM public.tickets LOOP
    INSERT INTO public.support_chats(profile_id, status)
      VALUES (_p.profile_id, 'accepted')
      ON CONFLICT (profile_id) DO UPDATE SET status = 'accepted'
      RETURNING id INTO _chat_id;
    INSERT INTO public.support_messages(chat_id, author_role, body, created_at)
    SELECT _chat_id, 'system', '#'||substr(t.id::text,1,8)||' — '||t.subject, t.created_at
    FROM public.tickets t WHERE t.profile_id = _p.profile_id;
    INSERT INTO public.support_messages(chat_id, author_role, body, created_at)
    SELECT _chat_id, m.author_role, m.body, m.created_at
    FROM public.ticket_messages m
    JOIN public.tickets t ON t.id = m.ticket_id
    WHERE t.profile_id = _p.profile_id AND m.author_role IN ('user','admin');
  END LOOP;
END $$;
