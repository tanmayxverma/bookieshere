import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

async function validateSession(token: string | undefined) {
  if (!token) return null;
  const { data } = await supabase
    .from('admin_sessions')
    .select('id, expires_at')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();
  if (!data) return null;
  const newExpiry = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  await supabase.from('admin_sessions').update({ expires_at: newExpiry, last_seen_at: new Date().toISOString() }).eq('id', data.id);
  return data.id as string;
}

async function log(sessionId: string | null, action: string, metadata: Record<string, unknown> = {}) {
  await supabase.from('admin_logs').insert({ session_id: sessionId, action, metadata });
}

function jr(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { token, op, payload } = await req.json();
    const sessionId = await validateSession(token);
    if (!sessionId) return jr({ error: 'unauthorized' }, 401);

    switch (op) {
      case 'stats.overview': {
        const [{ count: users }, { count: notifs }, { count: openTickets }, { count: resolvedTickets }] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('notifications').select('id', { count: 'exact', head: true }),
          supabase.from('tickets').select('id', { count: 'exact', head: true }).in('status', ['open','under_review','accepted','in_progress','reopened']),
          supabase.from('tickets').select('id', { count: 'exact', head: true }).in('status', ['resolved','closed']),
        ]);
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { count: activeUsers } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('updated_at', since);
        const { data: recent } = await supabase.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(15);
        return jr({ users, activeUsers, notifs, openTickets, resolvedTickets, recent }, 200);
      }

      case 'notification.list': {
        const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(200);
        return jr({ items: data ?? [] }, 200);
      }
      case 'notification.create': {
        const { data, error } = await supabase.from('notifications').insert(payload).select().single();
        if (error) return jr({ error: error.message }, 400);
        await log(sessionId, 'notification.create', { id: data.id });
        return jr({ item: data }, 200);
      }
      case 'notification.update': {
        const { id, ...patch } = payload;
        const { data, error } = await supabase.from('notifications').update(patch).eq('id', id).select().single();
        if (error) return jr({ error: error.message }, 400);
        await log(sessionId, 'notification.update', { id });
        return jr({ item: data }, 200);
      }
      case 'notification.delete': {
        await supabase.from('notifications').delete().eq('id', payload.id);
        await log(sessionId, 'notification.delete', { id: payload.id });
        return jr({ ok: true }, 200);
      }
      case 'notification.toggle': {
        const { data: row } = await supabase.from('notifications').select('is_active').eq('id', payload.id).single();
        const { data, error } = await supabase.from('notifications').update({ is_active: !row?.is_active }).eq('id', payload.id).select().single();
        if (error) return jr({ error: error.message }, 400);
        await log(sessionId, 'notification.toggle', { id: payload.id, is_active: data.is_active });
        return jr({ item: data }, 200);
      }

      case 'ticket.list': {
        const status = payload?.status as string | undefined;
        const search = (payload?.search as string | undefined)?.trim();
        let q = supabase.from('tickets').select('*, profiles(display_name, account_type, avatar_url)').order('last_message_at', { ascending: false }).limit(200);
        if (status && status !== 'all') q = q.eq('status', status);
        if (search) q = q.ilike('subject', `%${search}%`);
        const { data } = await q;
        return jr({ items: data ?? [] }, 200);
      }
      case 'ticket.detail': {
        const { data: ticket } = await supabase.from('tickets').select('*, profiles(display_name, account_type, avatar_url)').eq('id', payload.id).single();
        const { data: messages } = await supabase.from('ticket_messages').select('*').eq('ticket_id', payload.id).order('created_at');
        await supabase.from('ticket_messages').update({ read_by_admin_at: new Date().toISOString() }).eq('ticket_id', payload.id).eq('author_role', 'user').is('read_by_admin_at', null);
        return jr({ ticket, messages: messages ?? [] }, 200);
      }
      case 'ticket.update': {
        const { id, ...patch } = payload;
        const { data, error } = await supabase.from('tickets').update(patch).eq('id', id).select().single();
        if (error) return jr({ error: error.message }, 400);
        await log(sessionId, 'ticket.update', { id, patch });
        return jr({ item: data }, 200);
      }
      case 'ticket.reply': {
        const { ticket_id, body } = payload;
        const { data: msg, error } = await supabase.from('ticket_messages').insert({
          ticket_id, author_role: 'admin', body, read_by_admin_at: new Date().toISOString(),
        }).select().single();
        if (error) return jr({ error: error.message }, 400);
        await supabase.from('tickets').update({ status: 'in_progress' }).eq('id', ticket_id).eq('status', 'accepted');
        await log(sessionId, 'ticket.reply', { ticket_id });
        return jr({ item: msg }, 200);
      }

      case 'user.list': {
        const { data } = await supabase.from('profiles').select('id, display_name, account_type, target_category, avatar_url, created_at, updated_at, onboarded_at').order('created_at', { ascending: false }).limit(200);
        return jr({ items: data ?? [] }, 200);
      }

      case 'material.list': {
        const { data } = await supabase.from('materials').select('*').order('created_at', { ascending: false }).limit(500);
        return jr({ items: data ?? [] }, 200);
      }
      case 'material.create': {
        const { data, error } = await supabase.from('materials').insert({ ...payload, popularity: payload.popularity ?? 0 }).select().single();
        if (error) return jr({ error: error.message }, 400);
        await log(sessionId, 'material.create', { id: data.id, name: data.name });
        return jr({ item: data }, 200);
      }
      case 'material.update': {
        const { id, ...patch } = payload;
        const { data, error } = await supabase.from('materials').update(patch).eq('id', id).select().single();
        if (error) return jr({ error: error.message }, 400);
        await log(sessionId, 'material.update', { id });
        return jr({ item: data }, 200);
      }
      case 'material.delete': {
        await supabase.from('materials').delete().eq('id', payload.id);
        await log(sessionId, 'material.delete', { id: payload.id });
        return jr({ ok: true }, 200);
      }

      case 'support.list': {
        const filter = payload?.status as string | undefined;
        let q = supabase.from('support_chats')
          .select('*, profiles(display_name, account_type, avatar_url)')
          .order('last_message_at', { ascending: false }).limit(300);
        if (filter === 'flagged') q = q.eq('is_flagged', true);
        else if (filter && filter !== 'all') q = q.eq('status', filter);
        const { data, error } = await q;
        if (error) return jr({ error: error.message }, 400);
        // last message preview
        const ids = (data ?? []).map((c: any) => c.id);
        let lasts: Record<string, any> = {};
        if (ids.length) {
          const { data: msgs, error: msgError } = await supabase.from('support_messages').select('chat_id, body, image_url, author_role, created_at').in('chat_id', ids).order('created_at', { ascending: false });
          if (msgError) return jr({ error: msgError.message }, 400);
          (msgs ?? []).forEach((m: any) => { if (!lasts[m.chat_id]) lasts[m.chat_id] = m; });
        }
        const items = (data ?? []).map((c: any) => ({ ...c, last_message: lasts[c.id] ?? null }));
        return jr({ items }, 200);
      }
      case 'support.detail': {
        const { data: chat, error: chatError } = await supabase.from('support_chats')
          .select('*, profiles(display_name, account_type, avatar_url)').eq('id', payload.id).single();
        if (chatError) return jr({ error: chatError.message }, 400);
        const { data: messages, error: messagesError } = await supabase.from('support_messages').select('*').eq('chat_id', payload.id).order('created_at');
        if (messagesError) return jr({ error: messagesError.message }, 400);
        await supabase.from('support_chats').update({ last_admin_read_at: new Date().toISOString() }).eq('id', payload.id);
        return jr({ chat, messages: messages ?? [] }, 200);
      }
      case 'support.accept': {
        const { data, error } = await supabase.from('support_chats').update({ status: 'accepted' }).eq('id', payload.id).select().single();
        if (error) return jr({ error: error.message }, 400);
        await log(sessionId, 'support.accept', { id: payload.id });
        return jr({ item: data }, 200);
      }
      case 'support.reject': {
        const { data, error } = await supabase.from('support_chats').update({ status: 'rejected' }).eq('id', payload.id).select().single();
        if (error) return jr({ error: error.message }, 400);
        await log(sessionId, 'support.reject', { id: payload.id });
        return jr({ item: data }, 200);
      }
      case 'support.flag': {
        const flagged = !!payload?.flagged;
        const { data, error } = await supabase.from('support_chats')
          .update({ is_flagged: flagged }).eq('id', payload.id).select().single();
        if (error) return jr({ error: error.message }, 400);
        await log(sessionId, 'support.flag', { id: payload.id, flagged });
        return jr({ item: data }, 200);
      }
      case 'support.reject_legacy': {
        const { data, error } = await supabase.from('support_chats').update({ status: 'rejected' }).eq('id', payload.id).select().single();
        if (error) return jr({ error: error.message }, 400);
        await log(sessionId, 'support.reject', { id: payload.id });
        return jr({ item: data }, 200);
      }
      case 'support.delete': {
        await supabase.from('support_chats').delete().eq('id', payload.id);
        await log(sessionId, 'support.delete', { id: payload.id });
        return jr({ ok: true }, 200);
      }
      case 'support.reply': {
        const { chat_id, body } = payload;
        if (!body || !String(body).trim()) return jr({ error: 'empty message' }, 400);
        // Accept-as-you-message: replying to a pending chat auto-accepts it first.
        const { data: existing } = await supabase.from('support_chats').select('status').eq('id', chat_id).maybeSingle();
        if (existing?.status === 'pending') {
          await supabase.from('support_chats').update({ status: 'accepted' }).eq('id', chat_id);
          await log(sessionId, 'support.accept', { id: chat_id, auto: true });
        }
        const { data: msg, error } = await supabase.from('support_messages').insert({
          chat_id, author_role: 'admin', body: String(body),
        }).select().single();
        if (error) return jr({ error: error.message }, 400);
        await supabase.from('support_chats').update({ last_admin_read_at: new Date().toISOString() }).eq('id', chat_id);
        await log(sessionId, 'support.reply', { chat_id });
        return jr({ item: msg }, 200);
      }

      case 'community.list': {
        const { data: posts } = await supabase
          .from('community_posts')
          .select('*, profiles!community_posts_profile_id_fkey(id, display_name, avatar_url, is_banned, is_muted, muted_until)')
          .order('created_at', { ascending: false }).limit(100);
        const { data: comments } = await supabase
          .from('community_comments')
          .select('*, profiles!community_comments_profile_id_fkey(id, display_name, avatar_url, is_banned, is_muted, muted_until)')
          .order('created_at', { ascending: false }).limit(100);
        return jr({ posts: posts ?? [], comments: comments ?? [] }, 200);
      }
      case 'community.delete_post': {
        const { error } = await supabase.from('community_posts').delete().eq('id', payload.id);
        if (error) return jr({ error: error.message }, 400);
        await log(sessionId, 'community.delete_post', { id: payload.id });
        return jr({ ok: true }, 200);
      }
      case 'community.delete_comment': {
        const { error } = await supabase.from('community_comments').delete().eq('id', payload.id);
        if (error) return jr({ error: error.message }, 400);
        await log(sessionId, 'community.delete_comment', { id: payload.id });
        return jr({ ok: true }, 200);
      }
      case 'moderation.list': {
        const { data } = await supabase.from('profiles')
          .select('id, display_name, avatar_url, account_type, is_banned, is_muted, muted_until, moderation_note')
          .or('is_banned.eq.true,is_muted.eq.true')
          .order('updated_at', { ascending: false }).limit(200);
        return jr({ items: data ?? [] }, 200);
      }
      case 'moderation.set': {
        const { profile_id, is_banned, is_muted, mute_hours, note } = payload ?? {};
        if (!profile_id) return jr({ error: 'profile_id required' }, 400);
        const patch: Record<string, unknown> = {};
        if (typeof is_banned === 'boolean') patch.is_banned = is_banned;
        if (typeof is_muted === 'boolean') {
          patch.is_muted = is_muted;
          patch.muted_until = is_muted && mute_hours
            ? new Date(Date.now() + Number(mute_hours) * 3600 * 1000).toISOString()
            : null;
        }
        if (note !== undefined) patch.moderation_note = note;
        if (!Object.keys(patch).length) return jr({ error: 'nothing to update' }, 400);
        const { data, error } = await supabase.from('profiles').update(patch).eq('id', profile_id)
          .select('id, display_name, is_banned, is_muted, muted_until, moderation_note').single();
        if (error) return jr({ error: error.message }, 400);
        await log(sessionId, 'moderation.set', { profile_id, patch });
        return jr({ item: data }, 200);
      }

      default:
        return jr({ error: 'unknown op' }, 400);
    }
  } catch (e) {
    return jr({ error: String((e as Error).message ?? e) }, 500);
  }
});