import { useEffect, useState } from 'react';
import { AdminGuard } from '@/components/Admin/AdminGuard';
import { AdminShell } from '@/components/Admin/AdminShell';
import { useAdminSession } from '@/hooks/useAdminSession';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Pencil, Loader2, Pin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TYPES = ['announcement','update','material','maintenance','feature','alert'];
const PRIORITIES = ['low','normal','high','critical'];

export default function AdminNotifications() {
  const { call } = useAdminSession();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await call('notification.list'); setItems(r.items ?? []); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []); // eslint-disable-line

  const save = async (form: any) => {
    try {
      if (editing?.id) await call('notification.update', { id: editing.id, ...form });
      else await call('notification.create', form);
      setOpen(false); setEditing(null); load();
      toast({ title: 'Saved' });
    } catch (e: any) { toast({ variant: 'destructive', title: 'Error', description: e.message }); }
  };

  return (
    <AdminGuard>
      <AdminShell title="Notifications">
        <div className="flex justify-end mb-4">
          <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-1.5"><Plus className="h-4 w-4" /> New</Button>
        </div>
        <div className="space-y-2">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> :
            items.length === 0 ? <div className="text-sm text-muted-foreground">No notifications yet.</div> :
            items.map(n => (
              <div key={n.id} className="rounded-xl border border-border/40 bg-card/40 p-4 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {n.is_pinned && <Pin className="h-3 w-3 text-primary" />}
                    <span className="font-semibold">{n.title}</span>
                    <Badge variant="outline" className="text-[10px] uppercase">{n.type}</Badge>
                    <Badge variant="outline" className="text-[10px] uppercase">{n.priority}</Badge>
                    {!n.is_active && <Badge variant="outline" className="text-[10px] uppercase border-destructive/40 text-destructive">disabled</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{n.body}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Switch checked={n.is_active} onCheckedChange={async () => { await call('notification.toggle', { id: n.id }); load(); }} />
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(n); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={async () => { if (confirm('Delete?')) { await call('notification.delete', { id: n.id }); load(); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
        </div>

        <NotifDialog open={open} onOpenChange={setOpen} initial={editing} onSubmit={save} />
      </AdminShell>
    </AdminGuard>
  );
}

function NotifDialog({ open, onOpenChange, initial, onSubmit }: any) {
  const [form, setForm] = useState<any>({ title: '', body: '', type: 'announcement', priority: 'normal', is_pinned: false, is_active: true });
  useEffect(() => { setForm(initial ?? { title: '', body: '', type: 'announcement', priority: 'normal', is_pinned: false, is_active: true }); }, [initial, open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{initial?.id ? 'Edit notification' : 'New notification'}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Body</Label><Textarea rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm"><Switch checked={!!form.is_pinned} onCheckedChange={(v) => setForm({ ...form, is_pinned: v })} /> Pinned</label>
            <label className="flex items-center gap-2 text-sm"><Switch checked={!!form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /> Active</label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onSubmit(form)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
