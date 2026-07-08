import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';

export interface SupportChat {
  id: string;
  profile_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  last_message_at: string;
  created_at: string;
  updated_at: string;
}
export interface SupportMessage {
  id: string;
  chat_id: string;
  author_role: 'user' | 'admin' | 'system';
  body: string | null;
  image_url: string | null;
  created_at: string;
}

export function useSupportChat() {
  const { profile, deviceId, isAuthenticated, user } = useProfile();
  const [chat, setChat] = useState<SupportChat | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile) { setLoading(false); return; }
    if (isAuthenticated) {
      const { data: c } = await (supabase as any).rpc('auth_get_or_create_support_chat');
      const chatRow = Array.isArray(c) ? c[0] : c;
      setChat(chatRow ?? null);
      if (chatRow?.id) {
        const { data: m } = await supabase.from('support_messages').select('*').eq('chat_id', chatRow.id).order('created_at');
        setMessages((m as SupportMessage[]) ?? []);
      }
    } else {
      const { data: c } = await (supabase as any).rpc('guest_get_or_create_support_chat', { _device_id: deviceId });
      const chatRow = Array.isArray(c) ? c[0] : c;
      setChat(chatRow ?? null);
      const { data: m } = await (supabase as any).rpc('guest_list_support_messages', { _device_id: deviceId });
      setMessages((m as SupportMessage[]) ?? []);
    }
    setLoading(false);
  }, [profile, isAuthenticated, deviceId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!chat?.id) return;
    const ch = supabase.channel(`support-${chat.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_messages', filter: `chat_id=eq.${chat.id}` }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_chats', filter: `id=eq.${chat.id}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [chat?.id, load]);

  const send = useCallback(async (body: string, image_url?: string | null) => {
    if (!chat) throw new Error('no chat');
    if (isAuthenticated) {
      const { error } = await supabase.from('support_messages').insert({
        chat_id: chat.id, author_role: 'user', body: body || null, image_url: image_url ?? null,
      });
      if (error) throw error;
    } else {
      const { error } = await (supabase as any).rpc('guest_send_support_message', {
        _device_id: deviceId, _body: body || null, _image_url: image_url ?? null,
      });
      if (error) throw error;
    }
  }, [chat, isAuthenticated, deviceId]);

  return { chat, messages, loading, send, refetch: load };
}