import { useEffect, useMemo, useState } from 'react';
import { AdminGuard } from '@/components/Admin/AdminGuard';
import { AdminShell } from '@/components/Admin/AdminShell';
import { useAdminSession } from '@/hooks/useAdminSession';
import { usePortals } from '@/hooks/usePortals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Trash2,
  Pencil,
  Loader2,
  ExternalLink,
  Search,
  Globe,
  Link as LinkIcon,
  Sparkles,
  RotateCcw,
  Layers,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { InstituteLogo } from '@/components/common/InstituteLogo';
import type { Portal, PortalLink } from '@/data/portals';

const ACCENT_PRESETS: { label: string; value: string; preview: string }[] = [
  { label: 'Dark Slate', value: 'from-slate-700/30 to-slate-900/40', preview: 'bg-gradient-to-r from-slate-700 to-slate-900' },
  { label: 'Blue / Indigo', value: 'from-blue-600/25 to-indigo-900/40', preview: 'bg-gradient-to-r from-blue-600 to-indigo-900' },
  { label: 'Amber / Rose', value: 'from-amber-500/20 to-rose-500/20', preview: 'bg-gradient-to-r from-amber-500 to-rose-500' },
  { label: 'Red / Zinc', value: 'from-red-500/25 to-zinc-900/40', preview: 'bg-gradient-to-r from-red-500 to-zinc-900' },
  { label: 'Blue / Emerald', value: 'from-blue-500/20 to-emerald-500/20', preview: 'bg-gradient-to-r from-blue-500 to-emerald-500' },
  { label: 'Cyan / Red', value: 'from-cyan-500/20 to-red-500/20', preview: 'bg-gradient-to-r from-cyan-500 to-red-500' },
  { label: 'Zinc / Dark', value: 'from-zinc-700/30 to-zinc-900/40', preview: 'bg-gradient-to-r from-zinc-700 to-zinc-900' },
  { label: 'Sky / Fuchsia', value: 'from-sky-500/25 to-fuchsia-500/20', preview: 'bg-gradient-to-r from-sky-500 to-fuchsia-500' },
  { label: 'Orange / Amber', value: 'from-orange-500/20 to-amber-500/20', preview: 'bg-gradient-to-r from-orange-500 to-amber-500' },
  { label: 'Violet / Purple', value: 'from-violet-500/20 to-purple-600/30', preview: 'bg-gradient-to-r from-violet-500 to-purple-600' },
];

const emptyPortalForm: Portal = {
  id: '',
  name: '',
  tagline: '',
  logo: '',
  accent: 'from-blue-600/25 to-indigo-900/40',
  links: [{ label: 'Main Portal', url: 'https://', note: '' }],
  instructions: '',
};

export default function AdminPortals() {
  const { call } = useAdminSession();
  const { portals, loading, savePortal, deletePortal } = usePortals();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editingPortal, setEditingPortal] = useState<Portal>(emptyPortalForm);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditingPortal({
      ...emptyPortalForm,
      links: [{ label: 'Main Portal', url: 'https://', note: '' }],
    });
    setOpen(true);
  };

  const openEdit = (p: Portal) => {
    setEditingPortal({
      id: p.id,
      name: p.name,
      tagline: p.tagline || '',
      logo: p.logo || '',
      accent: p.accent || 'from-slate-700/30 to-slate-900/40',
      links: Array.isArray(p.links) && p.links.length > 0 ? p.links.map((l) => ({ ...l })) : [{ label: 'Main Portal', url: 'https://', note: '' }],
      instructions: p.instructions || '',
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!editingPortal.name?.trim()) {
      toast({ variant: 'destructive', title: 'Missing Name', description: 'Portal name is required.' });
      return;
    }

    const validLinks = (editingPortal.links || []).filter(
      (l) => l?.label?.trim() && l?.url?.trim() && l.url.trim() !== 'https://'
    );

    if (validLinks.length === 0) {
      toast({ variant: 'destructive', title: 'Missing Links', description: 'At least one valid link is required.' });
      return;
    }

    setSaving(true);
    try {
      const sanitized: Portal = {
        id: editingPortal.id?.trim() || editingPortal.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
        name: editingPortal.name.trim(),
        tagline: (editingPortal.tagline || '').trim(),
        logo: (editingPortal.logo || '').trim(),
        accent: editingPortal.accent || 'from-blue-600/25 to-indigo-900/40',
        links: validLinks,
        instructions: (editingPortal.instructions || '').trim() || undefined,
      };

      // Save via reactive portal store
      await savePortal(sanitized);

      // Best effort backend sync via admin session
      try {
        await call('portal.create', sanitized);
      } catch {
        // Safe fallback: local reactive store handles immediate persistence
      }

      setOpen(false);
      toast({ title: editingPortal.id ? 'Portal updated' : 'Portal created', description: 'Changes are live across the site.' });
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Save failed', description: err instanceof Error ? err.message : 'Could not save portal' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await deletePortal(id);

      // Best effort backend sync
      try {
        await call('portal.delete', { id });
      } catch {
        // Safe fallback
      }

      toast({ title: 'Deleted', description: `Portal "${name}" removed.` });
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Delete failed', description: err instanceof Error ? err.message : 'Failed to delete' });
    }
  };

  const filteredPortals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return portals;
    return portals.filter(
      (p) =>
        (p?.name || '').toLowerCase().includes(q) ||
        (p?.tagline || '').toLowerCase().includes(q) ||
        (p?.id || '').toLowerCase().includes(q)
    );
  }, [portals, searchQuery]);

  return (
    <AdminGuard>
      <AdminShell title="Portals">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search portals…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={openNew} className="gap-1.5 shrink-0">
              <Plus className="h-4 w-4" /> New Portal
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading portals…
          </div>
        ) : filteredPortals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
            {searchQuery ? 'No portals match your search.' : 'No portals found. Click "New Portal" to add one.'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPortals.map((portal) => (
              <div
                key={portal.id}
                className="rounded-xl border border-border/40 bg-card/40 p-4 flex items-start gap-4 transition-all hover:border-border/80"
              >
                <InstituteLogo
                  id={portal.id}
                  name={portal.name}
                  logo={portal.logo}
                  accent={portal.accent}
                  size={52}
                  className="rounded-xl border-2 border-slate-900 shadow-sm shrink-0 mt-0.5"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-foreground text-base">{portal.name}</span>
                    <Badge variant="outline" className="text-[10px] font-mono uppercase">
                      ID: {portal.id}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-primary border-primary/30">
                      {portal.links?.length || 0} {(portal.links?.length || 0) === 1 ? 'Link' : 'Links'}
                    </Badge>
                  </div>

                  {portal.tagline && <p className="text-sm text-muted-foreground line-clamp-1">{portal.tagline}</p>}

                  <div className="flex items-center gap-2 flex-wrap mt-2">
                    {(portal.links || []).slice(0, 3).map((l, i) => (
                      <a
                        key={i}
                        href={l.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-surface-1 border border-border/50 text-foreground/80 hover:text-primary transition-colors max-w-[180px] truncate"
                      >
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        <span className="truncate">{l.label}</span>
                      </a>
                    ))}
                    {(portal.links?.length || 0) > 3 && (
                      <span className="text-[11px] text-muted-foreground">
                        +{(portal.links?.length || 0) - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 self-center">
                  <a
                    href={`/portals/${portal.id}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-surface-2 text-muted-foreground hover:text-foreground transition-colors"
                    title="View Public Portal Page"
                  >
                    <Globe className="h-4 w-4" />
                  </a>
                  <Button variant="ghost" size="icon" title="Edit" onClick={() => openEdit(portal)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Delete"
                    onClick={() => handleDelete(portal.id, portal.name)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Portal Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPortal.id ? 'Edit Portal' : 'Add New Portal'}</DialogTitle>
            </DialogHeader>

            <div className="grid md:grid-cols-2 gap-5 py-2">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Portal Name *</Label>
                  <Input
                    value={editingPortal.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setEditingPortal({
                        ...editingPortal,
                        name,
                        id: editingPortal.id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30),
                      });
                    }}
                    placeholder="e.g. Physics Wallah"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Unique Slug / ID *</Label>
                  <Input
                    value={editingPortal.id}
                    onChange={(e) => setEditingPortal({ ...editingPortal, id: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') })}
                    placeholder="e.g. pw"
                  />
                  <p className="text-[11px] text-muted-foreground">Used in URL: /portals/{editingPortal.id || 'slug'}</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Tagline</Label>
                  <Input
                    value={editingPortal.tagline}
                    onChange={(e) => setEditingPortal({ ...editingPortal, tagline: e.target.value })}
                    placeholder="e.g. Lectures, notes & mirrors"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Logo Image URL</Label>
                  <Input
                    value={editingPortal.logo}
                    onChange={(e) => setEditingPortal({ ...editingPortal, logo: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Accent Gradient Theme</Label>
                  <Select
                    value={editingPortal.accent}
                    onValueChange={(v) => setEditingPortal({ ...editingPortal, accent: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCENT_PRESETS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          <div className="flex items-center gap-2">
                            <span className={`w-3.5 h-3.5 rounded-full ${p.preview}`} />
                            <span>{p.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Instructions / Notice (Optional)</Label>
                  <Textarea
                    rows={2}
                    value={editingPortal.instructions || ''}
                    onChange={(e) => setEditingPortal({ ...editingPortal, instructions: e.target.value })}
                    placeholder="Optional tips for accessing this portal (e.g. How to use bot, VPN note...)"
                  />
                </div>
              </div>

              {/* Links & Preview Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold flex items-center gap-1.5">
                      <LinkIcon className="h-3.5 w-3.5" /> Portal Links ({editingPortal.links?.length || 0}) *
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => {
                        setEditingPortal({
                          ...editingPortal,
                          links: [...(editingPortal.links || []), { label: `Mirror ${(editingPortal.links?.length || 0) + 1}`, url: 'https://', note: '' }],
                        });
                      }}
                    >
                      <Plus className="h-3 w-3" /> Add Link
                    </Button>
                  </div>

                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {(editingPortal.links || []).map((link, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg border border-border/50 bg-background/50 space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Label (e.g. Mirror 1)"
                            value={link.label}
                            onChange={(e) => {
                              const newLinks = [...editingPortal.links];
                              newLinks[idx] = { ...newLinks[idx], label: e.target.value };
                              setEditingPortal({ ...editingPortal, links: newLinks });
                            }}
                            className="h-8 text-xs flex-1"
                          />
                          {(editingPortal.links?.length || 0) > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive shrink-0"
                              onClick={() => {
                                const newLinks = editingPortal.links.filter((_, i) => i !== idx);
                                setEditingPortal({ ...editingPortal, links: newLinks });
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                        <Input
                          placeholder="URL (https://...)"
                          value={link.url}
                          onChange={(e) => {
                            const newLinks = [...editingPortal.links];
                            newLinks[idx] = { ...newLinks[idx], url: e.target.value };
                            setEditingPortal({ ...editingPortal, links: newLinks });
                          }}
                          className="h-8 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Preview */}
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-primary" /> Card Preview
                  </div>
                  <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <InstituteLogo
                        id={editingPortal.id || 'preview'}
                        name={editingPortal.name || 'Portal Name'}
                        logo={editingPortal.logo}
                        accent={editingPortal.accent}
                        size={48}
                        className="rounded-xl border-2 border-slate-900 shadow-sm shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-foreground truncate">
                          {editingPortal.name || 'Portal Title'}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {editingPortal.tagline || 'Tagline description will appear here.'}
                        </div>
                        <div className="text-[11px] text-primary mt-1 font-semibold">
                          {(editingPortal.links || []).filter((l) => l.label && l.url).length} link(s) available
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-border/40">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving || !editingPortal.name?.trim()}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                {editingPortal.id ? 'Save Changes' : 'Publish Portal'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminShell>
    </AdminGuard>
  );
}
