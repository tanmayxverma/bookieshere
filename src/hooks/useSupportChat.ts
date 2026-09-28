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

  // Merge a single message into state without re-rendering the whole thread.
  const mergeMessage = useCallback((m: SupportMessage | null | undefined) => {
    if (!m?.id) return;
    setMessages(prev => (prev.some(x => x.id === m.id) ? prev : [...prev, m]
      .sort((a, b) => a.created_at.localeCompare(b.created_at))));
  }, []);

  // Fetch only messages (no loading flash, no chat re-fetch).
  const syncMessages = useCallback(async (chatId: string) => {
    try {
      if (isAuthenticated) {
        const { data } = await (supabase as any).from('support_messages').select('*').eq('chat_id', chatId).order('created_at');
        if (data) setMessages(prev => (prev.length === data.length ? prev : (data as SupportMessage[])));
      } else {
        const { data } = await (supabase as any).rpc('guest_list_support_messages', { _device_id: deviceId });
        const rows = (data as SupportMessage[]) ?? [];
        setMessages(prev => (prev.length === rows.length ? prev : rows));
      }
    } catch { /* fallback interval will retry */ }
  }, [isAuthenticated, deviceId]);

  useEffect(() => {
    const chatId = chat?.id;
    if (!chatId) return;
    const chName = `support-${chatId}-${Math.random().toString(36).substring(2, 9)}`;
    const ch = supabase.channel(chName)
      // Targeted: append the new message only.
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `chat_id=eq.${chatId}` },
        ({ new: row }) => mergeMessage(row as SupportMessage))
      // Targeted: patch the changed chat row (status etc.).
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'support_chats', filter: `id=eq.${chatId}` },
        ({ new: row }) => setChat(prev => ({ ...(prev as SupportChat), ...(row as SupportChat) })))
      .subscribe();
    const events = supabase.channel(SUPPORT_EVENTS_CHANNEL)
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        if (payload?.chat_id && payload.chat_id !== chatId) return;
        if (payload?.message) mergeMessage(payload.message as SupportMessage);
        else syncMessages(chatId);
      })
      .subscribe();
    // Safety net only — realtime is the primary path.
    const t = setInterval(() => { syncMessages(chatId); }, 45000);
    return () => { supabase.removeChannel(ch); supabase.removeChannel(events); clearInterval(t); };
  }, [chat?.id, mergeMessage, syncMessages]);

  const broadcastChange = useCallback(async (chatId: string, message?: SupportMessage | null) => {
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
    await channel.send({ type: 'broadcast', event: 'message', payload: { chat_id: chatId, message: message ?? null } });
    supabase.removeChannel(channel);
  }, []);

  const send = useCallback(async (body: string, image_url?: string | null) => {
    let chatId = chat?.id ?? null;
    let inserted: SupportMessage | null = null;
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
      const { data, error } = await (supabase as any).from('support_messages').insert({
        chat_id: chatId, author_role: 'user', body: body || null, image_url: image_url ?? null,
      }).select().single();
      if (error) throw error;
      inserted = data as SupportMessage;
    } else {
      // guest_send_support_message creates the chat on first send server-side.
      const { data, error } = await (supabase as any).rpc('guest_send_support_message', {
        _device_id: deviceId, _body: body || null, _image_url: image_url ?? null,
      });
      if (error) throw error;
      inserted = (Array.isArray(data) ? data[0] : data) as SupportMessage;
      if (!chatId && inserted?.chat_id) chatId = inserted.chat_id;
    }
    if (inserted) mergeMessage(inserted);
    if (!chat?.id) await load(); // first message: pull the newly created chat row
    if (chatId) await broadcastChange(chatId, inserted);
  }, [chat, isAuthenticated, deviceId, load, broadcastChange, mergeMessage]);

  return { chat, messages, loading, error, send, refetch: load };
}