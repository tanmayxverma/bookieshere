
-- ============ profiles table ============
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id text UNIQUE,
  account_type text NOT NULL DEFAULT 'guest' CHECK (account_type IN ('guest','google','email')),
  display_name text NOT NULL DEFAULT 'Aspirant',
  avatar_url text,
  target_category text NOT NULL DEFAULT 'JEE 2027',
  onboarded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_owner_present CHECK (user_id IS NOT NULL OR device_id IS NOT NULL)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Public can read all profiles (display name + avatar are public on leaderboards etc.)
CREATE POLICY "Profiles are publicly readable"
  ON public.profiles FOR SELECT
  USING (true);

-- Authenticated users manage their own profile
CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own profile"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- updated_at trigger
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ guest profile RPCs ============
CREATE OR REPLACE FUNCTION public.get_guest_profile(_device_id text)
RETURNS SETOF public.profiles
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.profiles WHERE device_id = _device_id AND user_id IS NULL LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.upsert_guest_profile(
  _device_id text,
  _display_name text,
  _target_category text,
  _avatar_url text DEFAULT NULL
)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.profiles;
BEGIN
  IF _device_id IS NULL OR length(_device_id) < 8 THEN
    RAISE EXCEPTION 'invalid device id';
  END IF;

  INSERT INTO public.profiles (device_id, account_type, display_name, avatar_url, target_category, onboarded_at)
  VALUES (_device_id, 'guest', COALESCE(NULLIF(trim(_display_name), ''), 'Aspirant'),
          _avatar_url, COALESCE(NULLIF(trim(_target_category), ''), 'JEE 2027'), now())
  ON CONFLICT (device_id) DO UPDATE
    SET display_name = EXCLUDED.display_name,
        avatar_url = EXCLUDED.avatar_url,
        target_category = EXCLUDED.target_category,
        onboarded_at = COALESCE(public.profiles.onboarded_at, now()),
        updated_at = now()
  RETURNING * INTO result;
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_guest_profile(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_guest_profile(text, text, text, text) TO anon, authenticated;

-- ============ auto-create profile on signup ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  is_google boolean := COALESCE(NEW.raw_app_meta_data->>'provider', '') = 'google';
  display text := COALESCE(
    meta->>'full_name',
    meta->>'name',
    split_part(NEW.email, '@', 1),
    'Aspirant'
  );
  avatar text := COALESCE(meta->>'avatar_url', meta->>'picture');
BEGIN
  INSERT INTO public.profiles (user_id, account_type, display_name, avatar_url)
  VALUES (
    NEW.id,
    CASE WHEN is_google THEN 'google' ELSE 'email' END,
    display,
    avatar
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ storage policies for avatars bucket ============
-- Bucket itself created via storage_create_bucket tool. Policies below.
CREATE POLICY "Avatars are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Authenticated users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Authenticated users can delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Guests can upload guest avatars"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = 'guest'
  );

CREATE POLICY "Guests can update guest avatars"
  ON storage.objects FOR UPDATE
  TO anon
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = 'guest'
  );
