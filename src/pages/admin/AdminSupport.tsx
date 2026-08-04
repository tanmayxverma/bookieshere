import { useEffect, useState, useRef } from 'react';
import { AdminGuard } from '@/components/Admin/AdminGuard';
import { AdminShell } from '@/components/Admin/AdminShell';
import { useAdminSession } from '@/hooks/useAdminSession';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Trash2, Check, X, Flag } from 'lucide-react';
import { format, formatDistanceToNow, isSameDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const FILTERS = ['all','pending','accepted','rejected','flagged'];

export default function AdminSupport() {
  const { call } = useAdminSession();
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      setError(null);
      const r = await call('support.list', { status });
      setItems(r.items ?? []);
    }
    catch (e: any) {
      setError(e?.message || 'Support inbox could not load.');
      setItems([]);
    }
    finally { setLoading(false); }
  };
  useEffect(() => { load(true); /* eslint-disable-next-line */ }, [status]);

  // Targeted list updates — patch the affected row instead of reloading everything.
  const patchChat = (row: any) => {
    setItems(prev => {
      const idx = prev.findIndex(c => c.id === row.id);
      if (idx === -1) return prev; // unknown chat -> safety-net refresh handles it
      const next = [...prev];
      next[idx] = { ...next[idx], ...row };
      return next;
    });
  };
  const patchLastMessage = (m: any) => {
    setItems(prev => {
      const idx = prev.findIndex(c => c.id === m.chat_id);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], last_message: m, last_message_at: m.created_at };
      return next;
    });
  };

  useEffect(() => {
    const ch = supabase.channel('admin-support')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'support_chats' }, ({ new: row }) => patchChat(row))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_chats' }, () => load())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages' }, ({ new: row }) => patchLastMessage(row))
      .subscribe();
    const events = supabase.channel('support-events')
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        if (payload?.message) patchLastMessage(payload.message);
        else load();
      })
      .subscribe();
    // Safety net only (realtime is primary): silent, no spinner.
    const t = setInterval(() => { load(); }, 60000);
    return () => { supabase.removeChannel(ch); supabase.removeChannel(events); clearInterval(t); };
    // eslint-disable-next-line
  }, [status]);

  return (
    <AdminGuard>
      <AdminShell title="Support">
        <div className="grid md:grid-cols-[360px_1fr] gap-4">
          <aside className="space-y-3">
            <div className="inline-flex rounded-full border border-border/40 bg-background/60 p-1">
              {FILTERS.map(f => (
                <button key={f} onClick={() => setStatus(f)}
                  className={`text-xs px-3 py-1 rounded-full ${status === f ? 'bg-primary/15 border border-primary/30 text-foreground' : 'text-muted-foreground'}`}>
                  {f}
                </button>
              ))}
            </div>
            <div className="rounded-xl border border-border/40 max-h-[70vh] overflow-y-auto">
              {loading ? <div className="p-4"><Loader2 className="h-4 w-4 animate-spin" /></div> :
                error ? <div className="p-6 space-y-3 text-sm"><div className="text-destructive">{error}</div><Button size="sm" variant="outline" onClick={() => load(true)}>Retry</Button></div> :
                items.length === 0 ? <div className="p-6 text-sm text-muted-foreground">No chats.</div> :
                items.map((c) => {
                  const name = c.profiles?.display_name ?? 'Unknown';
                  const preview = c.last_message ? (c.last_message.body ?? '📎 image') : '—';
                  return (
                    <button key={c.id} onClick={() => setSelected(c.id)}
                      className={`block w-full text-left p-3 border-b border-border/30 last:border-0 transition ${selected === c.id ? 'bg-primary/10' : 'hover:bg-surface-2/50'}`}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-medium text-sm">{name}</div>
                        <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(c.last_message_at), { addSuffix: true })}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge variant="outline" className={`text-[10px] uppercase ${
                          c.status === 'pending' ? 'border-amber-500/40 text-amber-600' :
                          c.status === 'accepted' ? 'border-emerald-500/40 text-emerald-600' :
                          'border-destructive/40 text-destructive'
                        }`}>{c.status}</Badge>
                        <span className="text-xs text-muted-foreground truncate flex-1">{preview}</span>
                      </div>
                    </button>
                  );
                })}
            </div>
          </aside>
          <section className="rounded-xl border border-border/40 min-h-[70vh]">
            {selected ? <ChatView key={selected} id={selected} onChange={() => { load(); }} onFlag={patchChat} onDeleted={() => { setSelected(null); load(); }} /> :
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground p-10">Select a conversation.</div>}
          </section>
        </div>
      </AdminShell>
    </AdminGuard>
  );
}

function ChatView({ id, onChange, onDeleted }: { id: string; onChange: () => void; onDeleted: () => void }) {
  const { call } = useAdminSession();
  const { toast } = useToast();
  const [chat, setChat] = useState<any>(null);
  const [msgs, setMsgs] = useState<any[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      setError(null);
      const r = await call('support.detail', { id });
      setChat(r.chat); setMsgs(r.messages ?? []);
    } catch (e: any) {
      setError(e?.message || 'Support chat could not load.');
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);
  useEffect(() => {
    const mergeMsg = (m: any) => {
      if (!m?.id || m.chat_id !== id) return;
      setMsgs(prev => (prev.some(x => x.id === m.id) ? prev : [...prev, m].sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))));
    };
    const ch = supabase.channel(`admin-support-${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `chat_id=eq.${id}` },
        ({ new: row }) => mergeMsg(row))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'support_chats', filter: `id=eq.${id}` },
        ({ new: row }) => setChat((prev: any) => ({ ...prev, ...(row as any) })))
      .subscribe();
    const events = supabase.channel('support-events')
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        if (payload?.chat_id && payload.chat_id !== id) return;
        if (payload?.message) mergeMsg(payload.message);
        else load();
      })
      .subscribe();
    // Safety net only — realtime handles the live updates.
    const t = setInterval(() => { load(); }, 45000);
    return () => { supabase.removeChannel(ch); supabase.removeChannel(events); clearInterval(t); };
    // eslint-disable-next-line
  }, [id]);
  // Only auto-scroll when the admin is already near the bottom (preserves scroll-back reading).
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 160;
    if (nearBottom) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [msgs.length]);

  const accept = async () => { await call('support.accept', { id }); load(); onChange(); };
  const reject = async () => { if (!confirm('Reject this chat?')) return; await call('support.reject', { id }); load(); onChange(); };
  const del = async () => { if (!confirm('Delete this entire chat forever?')) return; await call('support.delete', { id }); onDeleted(); };

  const reply = async () => {
    const v = draft.trim(); if (!v) return;
    setBusy(true);
    try {
      // Server auto-accepts a pending chat as part of this call.
      const res = await call<{ item: any }>('support.reply', { chat_id: id, body: v });
      setDraft('');
      if (res?.item) setMsgs(prev => (prev.some(x => x.id === res.item.id) ? prev : [...prev, res.item]));
      if (chat?.status === 'pending') setChat((prev: any) => ({ ...prev, status: 'accepted' }));
      const events = supabase.channel('support-events');
      await new Promise<void>((resolve) => {
        const timer = window.setTimeout(resolve, 1200);
        events.subscribe((status) => {
          if (status === 'SUBSCRIBED') { window.clearTimeout(timer); resolve(); }
        });
      });
      await events.send({ type: 'broadcast', event: 'message', payload: { chat_id: id, message: res?.item ?? null } });
      supabase.removeChannel(events);
      onChange();
    }
    catch (e: any) { toast({ variant: 'destructive', title: 'Failed', description: e.message }); }
    finally { setBusy(false); }
  };

  if (error) return <div className="p-6 space-y-3 text-sm"><div className="text-destructive">{error}</div><Button size="sm" variant="outline" onClick={load}>Retry</Button></div>;
  if (!chat) return <div className="p-6"><Loader2 className="h-4 w-4 animate-spin" /></div>;

  const name = chat.profiles?.display_name ?? 'Unknown';

  return (
    <div className="flex flex-col h-[75vh]">
      <header className="p-4 border-b border-border/40 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center font-bold">{name.slice(0,1).toUpperCase()}</div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">{name}</div>
          <div className="text-[11px] text-muted-foreground">{chat.profiles?.account_type} · {chat.status}</div>
        </div>
        {chat.status === 'pending' && (
          <>
            <Button size="sm" className="gap-1.5" onClick={accept}><Check className="h-3.5 w-3.5" />Accept</Button>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={reject}><X className="h-3.5 w-3.5" />Reject</Button>
          </>
        )}
        <Button size="sm" variant="outline" className="gap-1.5 text-destructive" onClick={del}><Trash2 className="h-3.5 w-3.5" />Delete</Button>
      </header>
      <div ref={scrollerRef} className="flex-1 overflow-y-auto bg-muted/20 p-4 space-y-2">
        {msgs.length === 0 && <div className="text-center text-sm text-muted-foreground py-10">No messages yet.</div>}
        {msgs.map((m, i) => {
          const prev = msgs[i-1];
          const showDate = !prev || !isSameDay(new Date(prev.created_at), new Date(m.created_at));
          if (m.author_role === 'system') return <div key={m.id} className="text-center my-2 text-[11px] italic text-muted-foreground">{m.body}</div>;
          const isMine = m.author_role === 'admin';
          return (
            <div key={m.id}>
              {showDate && <div className="text-center my-3"><span className="text-[10px] uppercase tracking-wider bg-background/70 border border-border/40 rounded-full px-2.5 py-0.5 text-muted-foreground">{format(new Date(m.created_at), 'MMM d, yyyy')}</span></div>}
              <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${isMine ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-background border border-border/50 rounded-bl-sm'}`}>
                  {m.image_url && <a href={m.image_url} target="_blank" rel="noreferrer" className="block mb-1.5"><img src={m.image_url} alt="" className="max-h-64 rounded-lg" /></a>}
                  {m.body && <div className="whitespace-pre-wrap break-words">{m.body}</div>}
                  <div className={`text-[10px] mt-0.5 ${isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{format(new Date(m.created_at), 'h:mm a')}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-t border-border/40 bg-background px-4 pt-2 text-[11px] text-muted-foreground">
        Only send a message if it's actually important — don't waste the admin's time with hi/hello.
      </div>
      <form onSubmit={(e) => { e.preventDefault(); reply(); }} className="bg-background p-2.5 flex items-center gap-2">
        <input value={draft} onChange={e => setDraft(e.target.value)} maxLength={4000}
          disabled={chat.status === 'rejected'}
          placeholder={chat.status === 'rejected' ? 'Chat rejected' : chat.status === 'pending' ? 'Reply (auto-accepts this chat)…' : 'Reply as Owner…'}
          className="flex-1 h-10 rounded-full bg-muted/60 px-4 text-sm outline-none border border-transparent focus:border-primary/30 focus:bg-background transition disabled:opacity-50" />
        <button type="submit" disabled={busy || !draft.trim() || chat.status === 'rejected'}
          className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}