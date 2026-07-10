import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';

const SUPPORT_EVENTS_CHANNEL = 'support-events';

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
  const { profile, deviceId, isAuthenticated } = useProfile();
  const [chat, setChat] = useState<SupportChat | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile) { setLoading(false); return; }
    try {
      setError(null);
      if (isAuthenticated) {
        // Read-only fetch — do NOT auto-create. Chat is created on first send.
        const { data: c, error: chatError } = await (supabase as any)
          .from('support_chats').select('*').eq('profile_id', profile.id).maybeSingle();
        if (chatError) throw chatError;
        const chatRow = c ?? null;
        setChat(chatRow);
        if (chatRow?.id) {
          const { data: m, error: msgError } = await (supabase as any).from('support_messages').select('*').eq('chat_id', chatRow.id).order('created_at');
          if (msgError) throw msgError;
          setMessages((m as SupportMessage[]) ?? []);
        } else {
          setMessages([]);
        }
      } else {
        // Read-only fetch — do NOT auto-create for guests either.
        const { data: c, error: chatError } = await (supabase as any).rpc('guest_get_support_chat', { _device_id: deviceId });
        if (chatError) throw chatError;
        const chatRow = Array.isArray(c) ? c[0] : c;
        setChat(chatRow ?? null);
        if (chatRow?.id) {
          const { data: m, error: msgError } = await (supabase as any).rpc('guest_list_support_messages', { _device_id: deviceId });
          if (msgError) throw msgError;
          setMessages((m as SupportMessage[]) ?? []);
        } else {
          setMessages([]);
        }
      }
    } catch (e: any) {
      setError(e?.message || 'Support chat could not load.');
    } finally {
      setLoading(false);
    }
  }, [profile, isAuthenticated, deviceId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!chat?.id) return;
    const ch = supabase.channel(`support-${chat.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_messages', filter: `chat_id=eq.${chat.id}` }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_chats', filter: `id=eq.${chat.id}` }, () => load())
      .subscribe();
    const events = supabase.channel(SUPPORT_EVENTS_CHANNEL)
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        if (!payload?.chat_id || payload.chat_id === chat.id) load();
      })
      .subscribe();
    // Poll every 4s as a fallback (guests / anon RLS blocks realtime SELECT)
    const t = setInterval(() => { load(); }, 4000);
    return () => { supabase.removeChannel(ch); supabase.removeChannel(events); clearInterval(t); };
  }, [chat?.id, load]);

  const broadcastChange = useCallback(async (chatId: string) => {
    const channel = supabase.channel(SUPPORT_EVENTS_CHANNEL);
    await new Promise<void>((resolve) => {
      const timer = window.setTimeout(resolve, 1200);
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          window.clearTimeout(timer);
          resolve();
        }
      });
    });
    await channel.send({ type: 'broadcast', event: 'message', payload: { chat_id: chatId } });
    supabase.removeChannel(channel);
  }, []);

  const send = useCallback(async (body: string, image_url?: string | null) => {
    let chatId = chat?.id ?? null;
    if (isAuthenticated) {
      // Create the chat on first send only.
      if (!chatId) {
        const { data: c, error: cErr } = await (supabase as any).rpc('auth_get_or_create_support_chat');
        if (cErr) throw cErr;
        const row = Array.isArray(c) ? c[0] : c;
        chatId = row?.id ?? null;
        if (row) setChat(row);
      }
      if (!chatId) throw new Error('Could not open chat');
      const { error } = await (supabase as any).from('support_messages').insert({
        chat_id: chatId, author_role: 'user', body: body || null, image_url: image_url ?? null,
      });
      if (error) throw error;
    } else {
      // guest_send_support_message creates the chat on first send server-side.
      const { error } = await (supabase as any).rpc('guest_send_support_message', {
        _device_id: deviceId, _body: body || null, _image_url: image_url ?? null,
      });
      if (error) throw error;
    }
    await load();
    if (chatId) await broadcastChange(chatId);
  }, [chat, isAuthenticated, deviceId, load, broadcastChange]);

  return { chat, messages, loading, error, send, refetch: load };
}