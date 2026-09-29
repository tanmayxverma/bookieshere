import { useEffect, useMemo, useState } from 'react';
import { AdminGuard } from '@/components/Admin/AdminGuard';
import { AdminShell } from '@/components/Admin/AdminShell';
import { useAdminSession } from '@/hooks/useAdminSession';
import { useTestSeries } from '@/hooks/useTestSeries';
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
  FileText,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { InstituteLogo } from '@/components/common/InstituteLogo';
import type { TestSeriesProvider, TestSeriesResource } from '@/data/testSeries';

const ACCENT_PRESETS: { label: string; value: string; preview: string }[] = [
  { label: 'Blue / Indigo', value: 'from-blue-600/25 to-indigo-900/40', preview: 'bg-gradient-to-r from-blue-600 to-indigo-900' },
  { label: 'Violet / Fuchsia', value: 'from-violet-500/25 to-fuchsia-500/20', preview: 'bg-gradient-to-r from-violet-500 to-fuchsia-500' },
  { label: 'Primary / Blue', value: 'from-primary/25 to-blue-500/20', preview: 'bg-gradient-to-r from-blue-600 to-cyan-500' },
  { label: 'Slate / Dark', value: 'from-slate-700/25 to-slate-900/40', preview: 'bg-gradient-to-r from-slate-700 to-slate-900' },
  { label: 'Yellow / Red', value: 'from-yellow-400/25 to-red-500/20', preview: 'bg-gradient-to-r from-yellow-400 to-red-500' },
  { label: 'Blue / Amber', value: 'from-blue-600/25 to-amber-400/25', preview: 'bg-gradient-to-r from-blue-600 to-amber-400' },
  { label: 'Orange / Blue', value: 'from-orange-500/25 to-blue-600/25', preview: 'bg-gradient-to-r from-orange-500 to-blue-600' },
  { label: 'Cyan / Indigo', value: 'from-cyan-500/25 to-indigo-600/25', preview: 'bg-gradient-to-r from-cyan-500 to-indigo-600' },
  { label: 'Emerald / Slate', value: 'from-emerald-500/25 to-slate-800/30', preview: 'bg-gradient-to-r from-emerald-500 to-slate-800' },
];

const RESOURCE_BADGES = ['None', 'New', 'Featured', 'AITS', 'Verified', 'Official', 'Mock'];

const emptyTestForm: TestSeriesProvider = {
  id: '',
  name: '',
  description: '',
  logo: '',
  accent: 'from-blue-600/25 to-indigo-900/40',
  resources: [{ name: 'Test Series 2026', url: 'https://', badge: 'Featured' }],
};

export default function AdminTests() {
  const { call } = useAdminSession();
  const { testSeries, loading, saveTestSeries, deleteTestSeries } = useTestSeries();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<TestSeriesProvider>(emptyTestForm);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditingTest({
      ...emptyTestForm,
      resources: [{ name: 'Test Series 2026', url: 'https://', badge: 'Featured' }],
    });
    setOpen(true);
  };

  const openEdit = (t: TestSeriesProvider) => {
    setEditingTest({
      id: t.id,
      name: t.name,
      description: t.description || '',
      logo: t.logo || '',
      accent: t.accent || 'from-blue-600/25 to-indigo-900/40',
      resources:
        Array.isArray(t.resources) && t.resources.length > 0
          ? t.resources.map((r) => ({ ...r }))
          : [{ name: 'Test Series 2026', url: 'https://', badge: 'Featured' }],
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!editingTest.name?.trim()) {
      toast({ variant: 'destructive', title: 'Missing Name', description: 'Provider / Test series name is required.' });
      return;
    }

    const validResources = (editingTest.resources || []).filter(
      (r) => r?.name?.trim() && r?.url?.trim() && r.url.trim() !== 'https://'
    );

    if (validResources.length === 0) {
      toast({ variant: 'destructive', title: 'Missing Resources', description: 'At least one valid test link is required.' });
      return;
    }

    setSaving(true);
    try {
      const sanitized: TestSeriesProvider = {
        id: editingTest.id?.trim() || editingTest.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
        name: editingTest.name.trim(),
        description: (editingTest.description || '').trim(),
        logo: (editingTest.logo || '').trim(),
        accent: editingTest.accent || 'from-blue-600/25 to-indigo-900/40',
        resources: validResources.map((r) => ({
          name: r.name.trim(),
          url: r.url.trim(),
          badge: r.badge && r.badge !== 'None' ? r.badge.trim() : undefined,
        })),
      };

      // Save locally & reactively
      await saveTestSeries(sanitized);

      // Best effort backend sync
      try {
        await call('test.create', sanitized);
      } catch {
        // Safe fallback
      }

      setOpen(false);
      toast({ title: editingTest.id ? 'Test series updated' : 'Test series added', description: 'Changes are live across the site.' });
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Save failed', description: err instanceof Error ? err.message : 'Could not save test series' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete test series "${name}"?`)) return;

    try {
      await deleteTestSeries(id);

      // Best effort backend sync
      try {
        await call('test.delete', { id });
      } catch {
        // Safe fallback
      }

      toast({ title: 'Deleted', description: `Test series "${name}" removed.` });
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Delete failed', description: err instanceof Error ? err.message : 'Failed to delete' });
    }
  };

  const filteredTestSeries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return testSeries;
    return testSeries.filter(
      (t) =>
        (t?.name || '').toLowerCase().includes(q) ||
        (t?.description || '').toLowerCase().includes(q) ||
        (t?.id || '').toLowerCase().includes(q)
    );
  }, [testSeries, searchQuery]);

  return (
    <AdminGuard>
      <AdminShell title="Tests & Test Series">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tests & test series…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={openNew} className="gap-1.5 shrink-0">
              <Plus className="h-4 w-4" /> New Test Series
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading tests…
          </div>
        ) : filteredTestSeries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
            {searchQuery ? 'No test series match your search.' : 'No test series found. Click "New Test Series" to create one.'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTestSeries.map((t) => (
              <div
                key={t.id}
                className="rounded-xl border border-border/40 bg-card/40 p-4 flex items-start gap-4 transition-all hover:border-border/80"
              >
                <InstituteLogo
                  id={t.id}
                  name={t.name}
                  logo={t.logo}
                  accent={t.accent}
                  size={52}
                  className="rounded-xl border-2 border-slate-900 shadow-sm shrink-0 mt-0.5"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-foreground text-base">{t.name}</span>
                    <Badge variant="outline" className="text-[10px] font-mono uppercase">
                      ID: {t.id}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-primary border-primary/30">
                      {t.resources?.length || 0} {(t.resources?.length || 0) === 1 ? 'Resource' : 'Resources'}
                    </Badge>
                  </div>

                  {t.description && <p className="text-sm text-muted-foreground line-clamp-1">{t.description}</p>}

                  <div className="flex items-center gap-2 flex-wrap mt-2">
                    {(t.resources || []).slice(0, 3).map((r, i) => (
                      <a
                        key={i}
                        href={r.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-surface-1 border border-border/50 text-foreground/80 hover:text-primary transition-colors max-w-[200px] truncate"
                      >
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        <span className="truncate">{r.name}</span>
                        {r.badge && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-primary/10 text-primary font-bold">
                            {r.badge}
                          </span>
                        )}
                      </a>
                    ))}
                    {(t.resources?.length || 0) > 3 && (
                      <span className="text-[11px] text-muted-foreground">
                        +{(t.resources?.length || 0) - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 self-center">
                  <a
                    href={`/test-series/${t.id}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-surface-2 text-muted-foreground hover:text-foreground transition-colors"
                    title="View Public Test Series Page"
                  >
                    <Globe className="h-4 w-4" />
                  </a>
                  <Button variant="ghost" size="icon" title="Edit" onClick={() => openEdit(t)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Delete"
                    onClick={() => handleDelete(t.id, t.name)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Test Series Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTest.id ? 'Edit Test Series' : 'Add New Test Series'}</DialogTitle>
            </DialogHeader>

            <div className="grid md:grid-cols-2 gap-5 py-2">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Provider / Series Name *</Label>
                  <Input
                    value={editingTest.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setEditingTest({
                        ...editingTest,
                        name,
                        id: editingTest.id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30),
                      });
                    }}
                    placeholder="e.g. ALLEN, FIITJEE, MathonGo"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Unique Slug / ID *</Label>
                  <Input
                    value={editingTest.id}
                    onChange={(e) => setEditingTest({ ...editingTest, id: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') })}
                    placeholder="e.g. allen"
                  />
                  <p className="text-[11px] text-muted-foreground">Used in URL: /test-series/{editingTest.id || 'slug'}</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Description</Label>
                  <Textarea
                    rows={2}
                    value={editingTest.description}
                    onChange={(e) => setEditingTest({ ...editingTest, description: e.target.value })}
                    placeholder="e.g. Enthusiast, Leader, LN, Score series & online tests."
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Logo Image URL</Label>
                  <Input
                    value={editingTest.logo}
                    onChange={(e) => setEditingTest({ ...editingTest, logo: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Accent Gradient Theme</Label>
                  <Select
                    value={editingTest.accent}
                    onValueChange={(v) => setEditingTest({ ...editingTest, accent: v })}
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
              </div>

              {/* Resources & Preview Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" /> Test Resources ({editingTest.resources?.length || 0}) *
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => {
                        setEditingTest({
                          ...editingTest,
                          resources: [
                            ...(editingTest.resources || []),
                            { name: `Series ${(editingTest.resources?.length || 0) + 1}`, url: 'https://', badge: 'New' },
                          ],
                        });
                      }}
                    >
                      <Plus className="h-3 w-3" /> Add Resource
                    </Button>
                  </div>

                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {(editingTest.resources || []).map((resource, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg border border-border/50 bg-background/50 space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Resource Name (e.g. Score Advanced)"
                            value={resource.name}
                            onChange={(e) => {
                              const newRes = [...editingTest.resources];
                              newRes[idx] = { ...newRes[idx], name: e.target.value };
                              setEditingTest({ ...editingTest, resources: newRes });
                            }}
                            className="h-8 text-xs flex-1"
                          />
                          <Select
                            value={resource.badge || 'None'}
                            onValueChange={(b) => {
                              const newRes = [...editingTest.resources];
                              newRes[idx] = { ...newRes[idx], badge: b === 'None' ? undefined : b };
                              setEditingTest({ ...editingTest, resources: newRes });
                            }}
                          >
                            <SelectTrigger className="h-8 w-24 text-[11px]">
                              <SelectValue placeholder="Badge" />
                            </SelectTrigger>
                            <SelectContent>
                              {RESOURCE_BADGES.map((b) => (
                                <SelectItem key={b} value={b} className="text-xs">
                                  {b}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {(editingTest.resources?.length || 0) > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive shrink-0"
                              onClick={() => {
                                const newRes = editingTest.resources.filter((_, i) => i !== idx);
                                setEditingTest({ ...editingTest, resources: newRes });
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                        <Input
                          placeholder="URL / Drive Link (https://...)"
                          value={resource.url}
                          onChange={(e) => {
                            const newRes = [...editingTest.resources];
                            newRes[idx] = { ...newRes[idx], url: e.target.value };
                            setEditingTest({ ...editingTest, resources: newRes });
                          }}
                          className="h-8 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Card Preview */}
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-primary" /> Card Preview
                  </div>
                  <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <InstituteLogo
                        id={editingTest.id || 'preview'}
                        name={editingTest.name || 'Test Series Name'}
                        logo={editingTest.logo}
                        accent={editingTest.accent}
                        size={48}
                        className="rounded-xl border-2 border-slate-900 shadow-sm shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-foreground truncate">
                          {editingTest.name || 'Test Provider'}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {editingTest.description || 'Description of test series and coverage.'}
                        </div>
                        <div className="text-[11px] text-primary mt-1 font-semibold">
                          {(editingTest.resources || []).filter((r) => r.name && r.url).length} resource(s) attached
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
              <Button onClick={handleSave} disabled={saving || !editingTest.name?.trim()}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                {editingTest.id ? 'Save Changes' : 'Publish Test Series'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminShell>
    </AdminGuard>
  );
}
