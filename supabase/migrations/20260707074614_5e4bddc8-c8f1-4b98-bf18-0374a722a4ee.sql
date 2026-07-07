
ALTER TABLE public.ypt_rooms
  ADD COLUMN IF NOT EXISTS is_locked boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pin_hash text;

CREATE OR REPLACE FUNCTION public.verify_room_pin(_room_id uuid, _pin text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.ypt_rooms
    WHERE id = _room_id
      AND (pin_hash IS NULL OR pin_hash = encode(extensions.digest(_pin, 'sha256'), 'hex'))
  );
$$;

CREATE OR REPLACE FUNCTION public.set_room_lock(_room_id uuid, _creator uuid, _is_locked boolean, _pin text, _max integer)
RETURNS public.ypt_rooms
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  _row public.ypt_rooms;
BEGIN
  UPDATE public.ypt_rooms
    SET is_locked = _is_locked,
        pin_hash = CASE
          WHEN _pin IS NULL OR length(_pin) = 0 THEN NULL
          ELSE encode(extensions.digest(_pin, 'sha256'), 'hex')
        END,
        max_participants = _max
    WHERE id = _room_id AND created_by = _creator AND is_permanent = false
    RETURNING * INTO _row;
  IF _row.id IS NULL THEN RAISE EXCEPTION 'not authorized or room not found'; END IF;
  RETURN _row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_room_pin(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_room_lock(uuid, uuid, boolean, text, integer) TO anon, authenticated;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='materials'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.materials';
  END IF;
END $$;
