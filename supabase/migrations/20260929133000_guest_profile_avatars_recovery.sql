-- Migration to enable guest avatar storage, auto-confirm email users, and sync guest profiles
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Public avatars select" ON storage.objects;
  DROP POLICY IF EXISTS "Public avatars insert" ON storage.objects;
  DROP POLICY IF EXISTS "Public avatars update" ON storage.objects;
  DROP POLICY IF EXISTS "Public avatars delete" ON storage.objects;
END $$;

CREATE POLICY "Public avatars select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Public avatars insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Public avatars update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars');

CREATE POLICY "Public avatars delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars');

-- Auto confirm trigger for email users so registration is never blocked
CREATE OR REPLACE FUNCTION public.auto_confirm_new_users()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_auto_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_new_users();
