
-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================================
-- NOTIFICATIONS
-- =========================================================
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  type text NOT NULL DEFAULT 'announcement' CHECK (type IN ('announcement','update','material','maintenance','feature','alert')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','critical')),
  is_pinned boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  publish_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.notifications TO anon, authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "active notifications visible to all"
  ON public.notifications FOR SELECT
  TO anon, authenticated
  USING (is_active = true AND publish_at <= now() AND (expires_at IS NULL OR expires_at > now()));

CREATE INDEX notifications_active_idx ON public.notifications (is_active, publish_at DESC);
CREATE TRIGGER trg_notifications_updated_at BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- NOTIFICATION READS
-- =========================================================
CREATE TABLE public.notification_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (notification_id, profile_id)
);
GRANT SELECT, INSERT, DELETE ON public.notification_reads TO authenticated;
GRANT ALL ON public.notification_reads TO service_role;
ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own notification reads"
  ON public.notification_reads FOR SELECT
  TO authenticated
  USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "users insert own notification reads"
  ON public.notification_reads FOR INSERT
  TO authenticated
  WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE INDEX notification_reads_profile_idx ON public.notification_reads (profile_id);

-- =========================================================
-- TICKETS
-- =========================================================
CREATE TABLE public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject text NOT NULL,
  category text NOT NULL CHECK (category IN ('bug','help','feature','feedback','content_report','technical')),
  description text NOT NULL,
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','under_review','accepted','rejected','in_progress','resolved','closed','reopened')),
  rejection_reason text,
  assigned_admin text,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.tickets TO authenticated;
GRANT ALL ON public.tickets TO service_role;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own tickets"
  ON public.tickets FOR SELECT
  TO authenticated
  USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "users create own tickets"
  ON public.tickets FOR INSERT
  TO authenticated
  WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE INDEX tickets_profile_idx ON public.tickets (profile_id, last_message_at DESC);
CREATE INDEX tickets_status_idx ON public.tickets (status, last_message_at DESC);
CREATE TRIGGER trg_tickets_updated_at BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- TICKET MESSAGES
-- =========================================================
CREATE TABLE public.ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  author_role text NOT NULL CHECK (author_role IN ('user','admin','system')),
  author_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  body text NOT NULL,
  read_by_user_at timestamptz,
  read_by_admin_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.ticket_messages TO authenticated;
GRANT ALL ON public.ticket_messages TO service_role;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read messages of own tickets"
  ON public.ticket_messages FOR SELECT
  TO authenticated
  USING (
    ticket_id IN (
      SELECT id FROM public.tickets
      WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "users send messages on own tickets"
  ON public.ticket_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    author_role = 'user'
    AND ticket_id IN (
      SELECT id FROM public.tickets
      WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        AND status NOT IN ('closed','rejected')
    )
  );

CREATE INDEX ticket_messages_ticket_idx ON public.ticket_messages (ticket_id, created_at);

-- Bump tickets.last_message_at on new message
CREATE OR REPLACE FUNCTION public.touch_ticket_last_message()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  UPDATE public.tickets SET last_message_at = NEW.created_at, updated_at = now()
    WHERE id = NEW.ticket_id;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_ticket_messages_touch AFTER INSERT ON public.ticket_messages
  FOR EACH ROW EXECUTE FUNCTION public.touch_ticket_last_message();

-- =========================================================
-- GUEST HELPER RPCs (security-definer for ticket/notification access)
-- =========================================================
CREATE OR REPLACE FUNCTION public.guest_list_tickets(_device_id text)
RETURNS SETOF public.tickets
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT t.* FROM public.tickets t
  JOIN public.profiles p ON p.id = t.profile_id
  WHERE p.device_id = _device_id AND p.user_id IS NULL
  ORDER BY t.last_message_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.guest_get_ticket(_device_id text, _ticket_id uuid)
RETURNS SETOF public.tickets
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT t.* FROM public.tickets t
  JOIN public.profiles p ON p.id = t.profile_id
  WHERE p.device_id = _device_id AND p.user_id IS NULL AND t.id = _ticket_id;
$$;

CREATE OR REPLACE FUNCTION public.guest_create_ticket(
  _device_id text, _subject text, _category text, _description text, _priority text
) RETURNS public.tickets
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _profile_id uuid;
  _row public.tickets;
BEGIN
  SELECT id INTO _profile_id FROM public.profiles
    WHERE device_id = _device_id AND user_id IS NULL LIMIT 1;
  IF _profile_id IS NULL THEN RAISE EXCEPTION 'guest profile not found'; END IF;
  INSERT INTO public.tickets (profile_id, subject, category, description, priority)
    VALUES (_profile_id, _subject, _category, _description, COALESCE(_priority,'normal'))
    RETURNING * INTO _row;
  RETURN _row;
END;
$$;

CREATE OR REPLACE FUNCTION public.guest_list_messages(_device_id text, _ticket_id uuid)
RETURNS SETOF public.ticket_messages
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.* FROM public.ticket_messages m
  JOIN public.tickets t ON t.id = m.ticket_id
  JOIN public.profiles p ON p.id = t.profile_id
  WHERE p.device_id = _device_id AND p.user_id IS NULL AND m.ticket_id = _ticket_id
  ORDER BY m.created_at;
$$;

CREATE OR REPLACE FUNCTION public.guest_send_message(_device_id text, _ticket_id uuid, _body text)
RETURNS public.ticket_messages
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _profile_id uuid;
  _row public.ticket_messages;
BEGIN
  SELECT p.id INTO _profile_id FROM public.profiles p
    JOIN public.tickets t ON t.profile_id = p.id
    WHERE p.device_id = _device_id AND p.user_id IS NULL
      AND t.id = _ticket_id AND t.status NOT IN ('closed','rejected') LIMIT 1;
  IF _profile_id IS NULL THEN RAISE EXCEPTION 'ticket not found or closed'; END IF;
  INSERT INTO public.ticket_messages (ticket_id, author_role, author_profile_id, body)
    VALUES (_ticket_id, 'user', _profile_id, _body)
    RETURNING * INTO _row;
  RETURN _row;
END;
$$;

CREATE OR REPLACE FUNCTION public.guest_mark_notification_read(_device_id text, _notification_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _pid uuid;
BEGIN
  SELECT id INTO _pid FROM public.profiles WHERE device_id = _device_id AND user_id IS NULL LIMIT 1;
  IF _pid IS NULL THEN RETURN; END IF;
  INSERT INTO public.notification_reads (notification_id, profile_id)
    VALUES (_notification_id, _pid)
    ON CONFLICT DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.guest_list_notification_reads(_device_id text)
RETURNS SETOF public.notification_reads
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.* FROM public.notification_reads r
  JOIN public.profiles p ON p.id = r.profile_id
  WHERE p.device_id = _device_id AND p.user_id IS NULL;
$$;

GRANT EXECUTE ON FUNCTION public.guest_list_tickets(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.guest_get_ticket(text, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.guest_create_ticket(text, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.guest_list_messages(text, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.guest_send_message(text, uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.guest_mark_notification_read(text, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.guest_list_notification_reads(text) TO anon, authenticated;

-- =========================================================
-- ADMIN TABLES (no client access)
-- =========================================================
CREATE TABLE public.admin_credentials (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  password_hash_1 text NOT NULL,
  password_hash_2 text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.admin_credentials TO service_role;
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  device_id text,
  expires_at timestamptz NOT NULL,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.admin_sessions TO service_role;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
CREATE INDEX admin_sessions_token_idx ON public.admin_sessions (token);

CREATE TABLE public.admin_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text,
  ip_hash text,
  success boolean NOT NULL DEFAULT false,
  attempted_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.admin_login_attempts TO service_role;
ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;
CREATE INDEX admin_login_attempts_recent_idx ON public.admin_login_attempts (device_id, attempted_at DESC);

CREATE TABLE public.admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  target_table text,
  target_id text,
  session_id uuid REFERENCES public.admin_sessions(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.admin_logs TO service_role;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX admin_logs_recent_idx ON public.admin_logs (created_at DESC);

-- =========================================================
-- REALTIME PUBLICATION
-- =========================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notification_reads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_messages;
