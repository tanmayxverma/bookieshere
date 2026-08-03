
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_banned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_muted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS muted_until timestamptz,
  ADD COLUMN IF NOT EXISTS moderation_note text;

CREATE OR REPLACE FUNCTION public.is_user_banned(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT is_banned FROM public.profiles WHERE user_id = _user_id LIMIT 1), false);
$$;

CREATE OR REPLACE FUNCTION public.is_user_muted(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((
    SELECT is_banned OR (is_muted AND (muted_until IS NULL OR muted_until > now()))
    FROM public.profiles WHERE user_id = _user_id LIMIT 1
  ), false);
$$;

REVOKE EXECUTE ON FUNCTION public.is_user_banned(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_user_muted(uuid) FROM anon;

CREATE OR REPLACE FUNCTION public.block_muted_authors()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.is_user_muted(NEW.user_id) THEN
    RAISE EXCEPTION 'You are currently restricted from posting in the community.';
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.block_banned_authors()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.is_user_banned(NEW.user_id) THEN
    RAISE EXCEPTION 'Your account is banned from the community.';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS community_posts_block_muted ON public.community_posts;
CREATE TRIGGER community_posts_block_muted BEFORE INSERT ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.block_muted_authors();

DROP TRIGGER IF EXISTS community_comments_block_muted ON public.community_comments;
CREATE TRIGGER community_comments_block_muted BEFORE INSERT ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.block_muted_authors();

DROP TRIGGER IF EXISTS community_reactions_block_banned ON public.community_reactions;
CREATE TRIGGER community_reactions_block_banned BEFORE INSERT ON public.community_reactions
  FOR EACH ROW EXECUTE FUNCTION public.block_banned_authors();

CREATE OR REPLACE FUNCTION public.support_reopen_on_user_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.author_role = 'user' THEN
    UPDATE public.support_chats
      SET status = 'pending', updated_at = now()
      WHERE id = NEW.chat_id AND status <> 'pending';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS support_messages_reopen ON public.support_messages;
CREATE TRIGGER support_messages_reopen AFTER INSERT ON public.support_messages
  FOR EACH ROW EXECUTE FUNCTION public.support_reopen_on_user_message();
