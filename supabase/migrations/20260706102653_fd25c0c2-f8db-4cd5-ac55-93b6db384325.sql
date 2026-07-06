
CREATE TABLE public.syllabus_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  chapter_key text NOT NULL,
  stars smallint NOT NULL DEFAULT 0 CHECK (stars >= 0 AND stars <= 3),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, chapter_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.syllabus_progress TO authenticated;
GRANT ALL ON public.syllabus_progress TO service_role;

ALTER TABLE public.syllabus_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own syllabus progress"
ON public.syllabus_progress
FOR ALL
TO authenticated
USING (
  profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
)
WITH CHECK (
  profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE TRIGGER update_syllabus_progress_updated_at
BEFORE UPDATE ON public.syllabus_progress
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_syllabus_progress_profile ON public.syllabus_progress(profile_id);

-- Guest RPCs (device-based access)
CREATE OR REPLACE FUNCTION public.guest_list_syllabus_progress(_device_id text)
RETURNS SETOF public.syllabus_progress
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.* FROM public.syllabus_progress s
  JOIN public.profiles p ON p.id = s.profile_id
  WHERE p.device_id = _device_id AND p.user_id IS NULL;
$$;

CREATE OR REPLACE FUNCTION public.guest_upsert_syllabus_progress(_device_id text, _chapter_key text, _stars smallint)
RETURNS public.syllabus_progress
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _pid uuid;
  _row public.syllabus_progress;
BEGIN
  SELECT id INTO _pid FROM public.profiles WHERE device_id = _device_id AND user_id IS NULL LIMIT 1;
  IF _pid IS NULL THEN RAISE EXCEPTION 'guest profile not found'; END IF;
  INSERT INTO public.syllabus_progress (profile_id, chapter_key, stars)
    VALUES (_pid, _chapter_key, GREATEST(0, LEAST(3, _stars)))
    ON CONFLICT (profile_id, chapter_key) DO UPDATE
      SET stars = EXCLUDED.stars, updated_at = now()
    RETURNING * INTO _row;
  RETURN _row;
END;
$$;

CREATE OR REPLACE FUNCTION public.guest_reset_syllabus_progress(_device_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _pid uuid;
BEGIN
  SELECT id INTO _pid FROM public.profiles WHERE device_id = _device_id AND user_id IS NULL LIMIT 1;
  IF _pid IS NULL THEN RETURN; END IF;
  DELETE FROM public.syllabus_progress WHERE profile_id = _pid;
END;
$$;
