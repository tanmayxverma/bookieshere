import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';

export interface Ticket {
  id: string;
  profile_id: string;
  subject: string;
  category: 'bug'|'help'|'feature'|'feedback'|'content_report'|'technical';
  description: string;
  priority: 'low'|'normal'|'high'|'urgent';
  status: 'open'|'under_review'|'accepted'|'rejected'|'in_progress'|'resolved'|'closed'|'reopened';
  rejection_reason: string | null;
  assigned_admin: string | null;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  author_role: 'user'|'admin'|'system';
  body: string;
  created_at: string;
  read_by_user_at: string | null;
  read_by_admin_at: string | null;
}

export function useTickets() {
  const { profile, deviceId, isAuthenticated } = useProfile();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile) { setTickets([]); setLoading(false); return; }
    if (isAuthenticated) {
      const { data } = await supabase.from('tickets').select('*').eq('profile_id', profile.id).order('last_message_at', { ascending: false });
      setTickets((data as Ticket[]) ?? []);
    } else {
      const { data } = await (supabase as any).rpc('guest_list_tickets', { _device_id: deviceId });
      setTickets((data as Ticket[]) ?? []);
    }
    setLoading(false);
  }, [profile, deviceId, isAuthenticated]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const ch = supabase.channel('tickets-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const createTicket = useCallback(async (input: { subject: string; category: Ticket['category']; description: string; priority: Ticket['priority'] }) => {
    if (!profile) throw new Error('profile required');
    if (isAuthenticated) {
      const { data, error } = await supabase.from('tickets').insert({ ...input, profile_id: profile.id }).select().single();
      if (error) throw error;
      load();
      return data as Ticket;
    } else {
      const { data, error } = await (supabase as any).rpc('guest_create_ticket', {
        _device_id: deviceId,
        _subject: input.subject,
        _category: input.category,
        _description: input.description,
        _priority: input.priority,
      });
      if (error) throw error;
      load();
      return data as Ticket;
    }
  }, [profile, deviceId, isAuthenticated, load]);

  return { tickets, loading, createTicket, refetch: load };
}

export function useTicket(ticketId: string | null) {
  const { profile, deviceId, isAuthenticated } = useProfile();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!ticketId || !profile) { setLoading(false); return; }
    if (isAuthenticated) {
      const { data: t } = await supabase.from('tickets').select('*').eq('id', ticketId).maybeSingle();
      const { data: m } = await supabase.from('ticket_messages').select('*').eq('ticket_id', ticketId).order('created_at');
      setTicket((t as Ticket) ?? null);
      setMessages((m as TicketMessage[]) ?? []);
    } else {
      const { data: t } = await (supabase as any).rpc('guest_get_ticket', { _device_id: deviceId, _ticket_id: ticketId });
      const { data: m } = await (supabase as any).rpc('guest_list_messages', { _device_id: deviceId, _ticket_id: ticketId });
      const row = Array.isArray(t) ? t[0] : t;
      setTicket((row as Ticket) ?? null);
      setMessages((m as TicketMessage[]) ?? []);
    }
    setLoading(false);
  }, [ticketId, profile, deviceId, isAuthenticated]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  useEffect(() => {
    if (!ticketId) return;
    const ch = supabase.channel(`ticket-${ticketId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ticket_messages', filter: `ticket_id=eq.${ticketId}` }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets', filter: `id=eq.${ticketId}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [ticketId, load]);

  const sendMessage = useCallback(async (body: string) => {
    if (!ticketId || !profile) throw new Error('not ready');
    if (isAuthenticated) {
      const { error } = await supabase.from('ticket_messages').insert({
        ticket_id: ticketId, author_role: 'user', author_profile_id: profile.id, body,
      });
      if (error) throw error;
    } else {
      const { error } = await (supabase as any).rpc('guest_send_message', { _device_id: deviceId, _ticket_id: ticketId, _body: body });
      if (error) throw error;
    }
    load();
  }, [ticketId, profile, deviceId, isAuthenticated, load]);

  return { ticket, messages, loading, sendMessage, refetch: load };
}