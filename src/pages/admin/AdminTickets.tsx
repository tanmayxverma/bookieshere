import { useEffect, useState, useRef } from 'react';
import { AdminGuard } from '@/components/Admin/AdminGuard';
import { AdminShell } from '@/components/Admin/AdminShell';
import { useAdminSession } from '@/hooks/useAdminSession';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Send, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const STATUSES = ['all','open','under_review','accepted','rejected','in_progress','resolved','closed','reopened'];

export default function AdminTickets() {
  const { call } = useAdminSession();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const r = await call('ticket.list', { status, search }); setItems(r.items ?? []); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status]);

  return (
    <AdminGuard>
      <AdminShell title="Tickets">
        <div className="grid md:grid-cols-[360px_1fr] gap-4">
          <aside className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search subject" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace('_',' ')}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="rounded-xl border border-border/40 max-h-[70vh] overflow-y-auto">
              {loading ? <div className="p-4"><Loader2 className="h-4 w-4 animate-spin" /></div> :
                items.length === 0 ? <div className="p-6 text-sm text-muted-foreground">No tickets.</div> :
                items.map(t => (
                  <button key={t.id} onClick={() => setSelected(t.id)}
                    className={`block w-full text-left p-3 border-b border-border/30 last:border-0 transition-colors ${selected === t.id ? 'bg-primary/10' : 'hover:bg-surface-2/50'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium text-sm line-clamp-1">{t.subject}</div>
                      <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(t.last_message_at), { addSuffix: true })}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge variant="outline" className="text-[10px] uppercase">{t.status.replace('_',' ')}</Badge>
                      <Badge variant="outline" className="text-[10px] uppercase">{t.priority}</Badge>
                      <span className="text-[10px] text-muted-foreground ml-auto truncate">{t.profiles?.display_name ?? 'Unknown'}</span>
                    </div>
                  </button>
                ))}
            </div>
          </aside>
          <section className="rounded-xl border border-border/40 min-h-[70vh]">
            {selected ? <AdminTicketView id={selected} onChange={load} /> :
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground p-10">Select a ticket.</div>}
          </section>
        </div>
      </AdminShell>
    </AdminGuard>
  );
}

function AdminTicketView({ id, onChange }: { id: string; onChange: () => void }) {
  const { call } = useAdminSession();
  const { toast } = useToast();
  const [ticket, setTicket] = useState<any>(null);
  const [msgs, setMsgs] = useState<any[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const r = await call('ticket.detail', { id });
    setTicket(r.ticket); setMsgs(r.messages ?? []);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);
  useEffect(() => { if (scrollerRef.current) scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight; }, [msgs.length]);

  const updateStatus = async (status: string, extra: any = {}) => {
    try { await call('ticket.update', { id, status, ...extra }); await load(); onChange(); }
    catch (e: any) { toast({ variant: 'destructive', title: 'Error', description: e.message }); }
  };

  const reply = async () => {
    const v = draft.trim(); if (!v) return;
    setBusy(true);
    try { await call('ticket.reply', { ticket_id: id, body: v }); setDraft(''); await load(); onChange(); }
    catch (e: any) { toast({ variant: 'destructive', title: 'Error', description: e.message }); }
    finally { setBusy(false); }
  };

  if (!ticket) return <div className="p-6"><Loader2 className="h-4 w-4 animate-spin" /></div>;

  return (
    <div className="flex flex-col h-[70vh]">
      <header className="p-4 border-b border-border/40">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <Badge variant="outline" className="text-[10px] uppercase">{ticket.status.replace('_',' ')}</Badge>
          <Badge variant="outline" className="text-[10px] uppercase">{ticket.category.replace('_',' ')}</Badge>
          <Badge variant="outline" className="text-[10px] uppercase">{ticket.priority}</Badge>
          <span className="text-xs text-muted-foreground ml-auto">{ticket.profiles?.display_name ?? 'Unknown'} · {ticket.profiles?.account_type}</span>
        </div>
        <div className="font-semibold">{ticket.subject}</div>
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {ticket.status === 'open' && <>
            <Button size="sm" onClick={() => updateStatus('accepted')}>Accept</Button>
            <Button size="sm" variant="outline" onClick={() => { const r = prompt('Reason'); if (r) updateStatus('rejected', { rejection_reason: r }); }}>Reject</Button>
            <Button size="sm" variant="outline" onClick={() => updateStatus('under_review')}>Under review</Button>
          </>}
          {ticket.status !== 'closed' && ticket.status !== 'rejected' && (
            <>
              <Button size="sm" variant="outline" onClick={() => updateStatus('resolved')}>Resolved</Button>
              <Button size="sm" variant="outline" onClick={() => updateStatus('closed')}>Close</Button>
            </>
          )}
          {(ticket.status === 'closed' || ticket.status === 'rejected') && (
            <Button size="sm" variant="outline" onClick={() => updateStatus('reopened', { rejection_reason: null })}>Reopen</Button>
          )}
          <Select value={ticket.priority} onValueChange={(p) => updateStatus(ticket.status, { priority: p })}>
            <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="normal">Normal</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent>
          </Select>
        </div>
      </header>
      <div ref={scrollerRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="rounded-xl border border-border/40 bg-surface-2/40 p-3 text-sm">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Original request</div>
          <div className="whitespace-pre-wrap">{ticket.description}</div>
        </div>
        {msgs.map(m => (
          <div key={m.id} className={`flex ${m.author_role === 'admin' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm border ${m.author_role === 'admin' ? 'bg-primary/10 border-primary/25' : 'bg-surface-2/60 border-border/40'}`}>
              <div className="whitespace-pre-wrap">{m.body}</div>
              <div className="text-[10px] text-muted-foreground mt-1">{formatDistanceToNow(new Date(m.created_at), { addSuffix: true })} · {m.author_role}</div>
            </div>
          </div>
        ))}
      </div>
      <form className="p-3 border-t border-border/40 flex gap-2" onSubmit={(e) => { e.preventDefault(); reply(); }}>
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Reply to user…" maxLength={4000} />
        <Button type="submit" disabled={busy || !draft.trim()} className="gap-1.5">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send</Button>
      </form>
    </div>
  );
}
