
DROP POLICY IF EXISTS "msgs owner insert" ON public.support_messages;
CREATE POLICY "msgs owner insert" ON public.support_messages FOR INSERT TO authenticated WITH CHECK (
  author_role = 'user' AND EXISTS(
    SELECT 1 FROM public.support_chats c JOIN public.profiles p ON p.id = c.profile_id
    WHERE c.id = chat_id AND p.user_id = auth.uid() AND c.status <> 'rejected'
  )
);

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
  IF _status = 'rejected' THEN RAISE EXCEPTION 'chat rejected'; END IF;
  INSERT INTO public.support_messages(chat_id, author_role, body, image_url)
    VALUES (_cid, 'user', _body, _image_url) RETURNING * INTO _row;
  RETURN _row;
END $$;
