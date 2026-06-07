import { useState, useMemo, useEffect, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTickets, useTicket, type Ticket } from '@/hooks/useTickets';
import { useProfile } from '@/hooks/useProfile';
import { Plus, Send, MessageSquare, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { z } from 'zod';
import { formatDistanceToNow } from 'date-fns';

const CATEGORIES: { value: Ticket['category']; label: string }[] = [
  { value: 'bug', label: 'Report a bug' },
  { value: 'help', label: 'Request help' },
  { value: 'feature', label: 'Feature request' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'content_report', label: 'Content report' },
  { value: 'technical', label: 'Technical issue' },
];

const STATUS_COLOR: Record<Ticket['status'], string> = {
  open: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  under_review: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
  accepted: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  rejected: 'bg-destructive/15 text-destructive border-destructive/30',
  in_progress: 'bg-primary/15 text-primary border-primary/30',
  resolved: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  closed: 'bg-muted text-muted-foreground border-border',
  reopened: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
};

const ticketSchema = z.object({
  subject: z.string().trim().min(3, 'At least 3 characters').max(120),
  category: z.enum(['bug','help','feature','feedback','content_report','technical']),
  description: z.string().trim().min(10, 'Tell us a bit more').max(2000),
  priority: z.enum(['low','normal','high','urgent']),
});

export default function SupportPage() {
  const { profile } = useProfile();
  const { tickets, loading, createTicket } = useTickets();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!selectedId && tickets[0]) setSelectedId(tickets[0].id);
  }, [tickets, selectedId]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
              <Sparkles className="h-3 w-3 text-primary" /> Support Center
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-black tracking-tight">Help & Support</h1>
            <p className="text-sm text-muted-foreground mt-1">Open a ticket and chat with the team — no Telegram needed.</p>
          </div>
          <NewTicketDialog open={creating} onOpenChange={setCreating} onCreate={async (input) => {
            const t = await createTicket(input);
            setSelectedId(t.id);
            setCreating(false);
          }} disabled={!profile} />
        </div>

        <div className="grid md:grid-cols-[320px_1fr] gap-4 min-h-[60vh]">
          {/* Sidebar */}
          <aside className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl p-2 max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="p-6 text-sm text-muted-foreground">Loading…</div>
            ) : tickets.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <MessageSquare className="mx-auto h-8 w-8 mb-3 opacity-50" />
                No tickets yet. Create one to get started.
              </div>
            ) : tickets.map(t => {
              const active = t.id === selectedId;
              return (
                <button key={t.id} onClick={() => setSelectedId(t.id)}
                  className={`w-full text-left p-3 rounded-xl mb-1 transition-colors ${active ? 'bg-primary/10 border border-primary/30' : 'hover:bg-surface-2/50 border border-transparent'}`}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="text-sm font-semibold line-clamp-1">{t.subject}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${STATUS_COLOR[t.status]}`}>{t.status.replace('_',' ')}</Badge>
                    <span className="text-[10px] text-muted-foreground ml-auto">{formatDistanceToNow(new Date(t.last_message_at), { addSuffix: true })}</span>
                  </div>
                </button>
              );
            })}
          </aside>

          {/* Detail */}
          <section className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl overflow-hidden">
            {selectedId ? <TicketView id={selectedId} onClose={() => setSelectedId(null)} /> :
              <div className="h-full flex items-center justify-center p-10 text-center text-sm text-muted-foreground">
                Select a ticket or create a new one.
              </div>
            }
          </section>
        </div>
      </div>
    </Layout>
  );
}

function TicketView({ id, onClose }: { id: string; onClose: () => void }) {
  const { ticket, messages, loading, sendMessage } = useTicket(id);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollerRef.current) scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
  }, [messages.length]);

  if (loading || !ticket) return <div className="p-10 text-sm text-muted-foreground">Loading ticket…</div>;

  const canSend = !['closed','rejected'].includes(ticket.status);

  return (
    <div className="flex flex-col h-[70vh]">
      <header className="px-5 py-4 border-b border-border/40 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <button className="md:hidden" onClick={onClose}><ArrowLeft className="h-4 w-4" /></button>
            <Badge variant="outline" className={`text-[10px] uppercase ${STATUS_COLOR[ticket.status]}`}>{ticket.status.replace('_',' ')}</Badge>
            <Badge variant="outline" className="text-[10px] uppercase">{ticket.category.replace('_',' ')}</Badge>
            <Badge variant="outline" className="text-[10px] uppercase">{ticket.priority}</Badge>
          </div>
          <h2 className="font-display text-lg font-bold line-clamp-1">{ticket.subject}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Opened {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</p>
        </div>
      </header>
      <div ref={scrollerRef} className="flex-1 overflow-y-auto p-5 space-y-3">
        {/* Original description as first message */}
        <Bubble side="user" body={ticket.description} time={ticket.created_at} system label="Your request" />
        {ticket.status === 'open' && <div className="text-center text-xs text-muted-foreground italic">Awaiting admin review…</div>}
        {ticket.status === 'rejected' && ticket.rejection_reason && (
          <div className="text-center text-xs text-destructive border border-destructive/30 bg-destructive/5 rounded-xl p-3">Rejected: {ticket.rejection_reason}</div>
        )}
        {messages.map(m => (
          <Bubble key={m.id} side={m.author_role === 'admin' ? 'admin' : 'user'} body={m.body} time={m.created_at} />
        ))}
      </div>
      <form className="p-3 border-t border-border/40 flex gap-2" onSubmit={async (e) => {
        e.preventDefault();
        const v = draft.trim();
        if (!v || sending || !canSend) return;
        setSending(true);
        try { await sendMessage(v); setDraft(''); } finally { setSending(false); }
      }}>
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={canSend ? 'Type a reply…' : 'This ticket is closed'} disabled={!canSend} maxLength={2000} />
        <Button type="submit" disabled={!canSend || sending || !draft.trim()} className="gap-1.5">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send
        </Button>
      </form>
    </div>
  );
}

function Bubble({ side, body, time, system, label }: { side: 'user'|'admin'; body: string; time: string; system?: boolean; label?: string }) {
  const isUser = side === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed border ${
        isUser ? 'bg-primary/10 border-primary/25 rounded-br-sm' : 'bg-surface-2/60 border-border/40 rounded-bl-sm'
      }`}>
        {label && <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>}
        <div className="whitespace-pre-wrap text-foreground">{body}</div>
        <div className="text-[10px] text-muted-foreground mt-1">{formatDistanceToNow(new Date(time), { addSuffix: true })}{!isUser && ' · Bookie team'}</div>
      </div>
    </div>
  );
}

function NewTicketDialog({ open, onOpenChange, onCreate, disabled }: { open: boolean; onOpenChange: (v: boolean) => void; onCreate: (i: any) => Promise<void>; disabled?: boolean }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ subject: '', category: 'help' as Ticket['category'], description: '', priority: 'normal' as Ticket['priority'] });
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const parsed = ticketSchema.safeParse(form);
    if (!parsed.success) {
      toast({ variant: 'destructive', title: 'Check your input', description: parsed.error.errors[0]?.message });
      return;
    }
    setBusy(true);
    try {
      await onCreate(parsed.data);
      setForm({ subject: '', category: 'help', description: '', priority: 'normal' });
      toast({ title: 'Ticket created', description: 'A team member will reply shortly.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Could not create ticket', description: e.message });
    } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={disabled} className="gap-2"><Plus className="h-4 w-4" /> New ticket</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create support ticket</DialogTitle>
          <DialogDescription>Tell us what's going on. We typically reply within a day.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Input maxLength={120} value={form.subject} onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Short summary" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm(f => ({ ...f, priority: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea maxLength={2000} rows={5} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What happened? Include steps to reproduce if relevant." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={busy} className="gap-1.5">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
