import { useEffect, useState } from 'react';
import { AdminGuard } from '@/components/Admin/AdminGuard';
import { AdminShell } from '@/components/Admin/AdminShell';
import { useAdminSession } from '@/hooks/useAdminSession';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Pencil, Loader2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MaterialCard } from '@/components/MaterialCard';
import type { Material, ExamType, SubjectType, ResourceType, BadgeType } from '@/types/materials';
import { examLabels, subjectLabels, resourceLabels } from '@/types/materials';

const BADGES: BadgeType[] = [null, 'premium', 'air', 'core', 'new', 'updated'];

type FormState = {
  id?: string;
  name: string;
  description: string;
  exam: ExamType;
  subject: SubjectType;
  resource_type: ResourceType;
  download_link: string;
  badge: BadgeType;
  popularity: number;
};

const empty: FormState = {
  name: '', description: '', exam: 'jee', subject: 'physics',
  resource_type: 'books', download_link: '', badge: null, popularity: 0,
};

export default function AdminMaterials() {
  const { call } = useAdminSession();
  const { toast } = useToast();
  const [items, setItems] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [q, setQ] = useState('');

  const load = async () => {
    setLoading(true);
    try { const r = await call('material.list'); setItems(r.items ?? []); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []); // eslint-disable-line

  const openNew = () => { setForm(empty); setOpen(true); };
  const openEdit = (m: Material) => {
    setForm({
      id: m.id, name: m.name, description: m.description ?? '',
      exam: m.exam, subject: m.subject, resource_type: m.resource_type,
      download_link: m.download_link, badge: m.badge ?? null, popularity: m.popularity ?? 0,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.download_link.trim()) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Title and link are required.' });
      return;
    }
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        exam: form.exam,
        subject: form.subject,
        resource_type: form.resource_type,
        download_link: form.download_link.trim(),
        badge: form.badge,
        popularity: Number(form.popularity) || 0,
      };
      if (form.id) await call('material.update', { id: form.id, ...payload });
      else await call('material.create', payload);
      setOpen(false); load();
      toast({ title: form.id ? 'Material updated' : 'Material added — live now' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this material?')) return;
    try { await call('material.delete', { id }); load(); toast({ title: 'Deleted' }); }
    catch (e: any) { toast({ variant: 'destructive', title: 'Error', description: e.message }); }
  };

  const filtered = items.filter(m =>
    !q.trim() ||
    (m.name || '').toLowerCase().includes(q.toLowerCase()) ||
    (m.description ?? '').toLowerCase().includes(q.toLowerCase())
  );

  // Live preview material for the dialog — same MaterialCard the library uses
  const previewMaterial: Material = {
    id: form.id ?? 'preview',
    name: form.name || 'Material title',
    description: form.description || 'Short description shown on the card.',
    exam: form.exam,
    subject: form.subject,
    resource_type: form.resource_type,
    download_link: form.download_link || '#',
    popularity: form.popularity,
    badge: form.badge,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <AdminGuard>
      <AdminShell title="Materials">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-5">
          <Input
            placeholder="Search materials…"
            value={q}
            onChange={e => setQ(e.target.value)}
            className="sm:max-w-xs"
          />
          <Button onClick={openNew} className="gap-1.5 shrink-0"><Plus className="h-4 w-4" /> New material</Button>
        </div>

        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground">No materials yet. Add one — it will appear instantly in the site's Materials Library.</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(m => (
              <div key={m.id} className="rounded-xl border border-border/40 bg-card/40 p-4 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold truncate">{m.name}</span>
                    <Badge variant="outline" className="text-[10px] uppercase">{examLabels[m.exam]}</Badge>
                    <Badge variant="outline" className="text-[10px] uppercase">{subjectLabels[m.subject]}</Badge>
                    <Badge variant="outline" className="text-[10px] uppercase">{resourceLabels[m.resource_type]}</Badge>
                    {m.badge && <Badge variant="outline" className="text-[10px] uppercase border-primary/40 text-primary">{m.badge}</Badge>}
                  </div>
                  {m.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{m.description}</p>}
                  <a href={m.download_link} target="_blank" rel="noreferrer noopener"
                    className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline break-all">
                    <ExternalLink className="h-3 w-3" /> {m.download_link}
                  </a>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(m)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => del(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{form.id ? 'Edit material' : 'Add new material'}</DialogTitle>
            </DialogHeader>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Title *</Label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. HC Verma Vol. 1" />
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short bio for the card" />
                </div>
                <div className="space-y-1.5">
                  <Label>Link (auto-creates the Access button) *</Label>
                  <Input value={form.download_link} onChange={e => setForm({ ...form, download_link: e.target.value })} placeholder="https://…" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Exam</Label>
                    <Select value={form.exam} onValueChange={(v) => setForm({ ...form, exam: v as ExamType })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(examLabels) as ExamType[]).map(k => <SelectItem key={k} value={k}>{examLabels[k]}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Subject</Label>
                    <Select value={form.subject} onValueChange={(v) => setForm({ ...form, subject: v as SubjectType })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(subjectLabels) as SubjectType[]).map(k => <SelectItem key={k} value={k}>{subjectLabels[k]}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Resource type</Label>
                    <Select value={form.resource_type} onValueChange={(v) => setForm({ ...form, resource_type: v as ResourceType })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(resourceLabels) as ResourceType[]).map(k => <SelectItem key={k} value={k}>{resourceLabels[k]}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Badge</Label>
                    <Select value={form.badge ?? 'none'} onValueChange={(v) => setForm({ ...form, badge: v === 'none' ? null : (v as BadgeType) })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {BADGES.map(b => <SelectItem key={b ?? 'none'} value={b ?? 'none'}>{b ?? 'None'}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Popularity boost</Label>
                  <Input type="number" value={form.popularity} onChange={e => setForm({ ...form, popularity: Number(e.target.value) || 0 })} />
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">Live preview</div>
                <div className="rounded-2xl border border-border/40 bg-surface-1/40 p-4">
                  <MaterialCard material={previewMaterial} />
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  This is exactly how the card appears in the Materials Library. Saves publish instantly.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save}>{form.id ? 'Save changes' : 'Publish'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminShell>
    </AdminGuard>
  );
}