import { useEffect, useMemo, useState } from 'react';
import { AdminGuard } from '@/components/Admin/AdminGuard';
import { AdminShell } from '@/components/Admin/AdminShell';
import { useAdminSession } from '@/hooks/useAdminSession';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Pencil, Loader2, Pin, Clock, AlertTriangle, Sparkles, RefreshCw, Calendar, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TYPES = ['announcement', 'update', 'material', 'maintenance', 'feature', 'alert'];
const PRIORITIES = ['low', 'normal', 'high', 'critical'];

export const EXPIRY_PRESETS: { value: string; label: string; durationMs: number | null }[] = [
  { value: 'never', label: 'Never (Keep indefinitely)', durationMs: null },
  { value: '10m', label: '10 Minutes', durationMs: 10 * 60 * 1000 },
  { value: '30m', label: '30 Minutes', durationMs: 30 * 60 * 1000 },
  { value: '1h', label: '1 Hour', durationMs: 60 * 60 * 1000 },
  { value: '6h', label: '6 Hours', durationMs: 6 * 60 * 60 * 1000 },
  { value: '12h', label: '12 Hours', durationMs: 12 * 60 * 60 * 1000 },
  { value: '24h', label: '24 Hours (1 Day)', durationMs: 24 * 60 * 60 * 1000 },
  { value: '3d', label: '3 Days', durationMs: 3 * 24 * 60 * 60 * 1000 },
  { value: '7d', label: '7 Days', durationMs: 7 * 24 * 60 * 60 * 1000 },
  { value: '30d', label: '30 Days', durationMs: 30 * 24 * 60 * 60 * 1000 },
  { value: 'custom', label: 'Custom Date & Time…', durationMs: null },
];

function formatExpiryTime(isoStr?: string | null): { text: string; isExpired: boolean } {
  if (!isoStr) return { text: 'No auto-delete', isExpired: false };
  try {
    const target = new Date(isoStr);
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    if (diffMs <= 0) {
      return { text: 'Expired', isExpired: true };
    }
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) {
      return { text: `Deletes in ${diffMins}m`, isExpired: false };
    }
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      const remainingMins = diffMins % 60;
      return { text: `Deletes in ${diffHours}h ${remainingMins > 0 ? `${remainingMins}m` : ''}`, isExpired: false };
    }
    const diffDays = Math.floor(diffHours / 24);
    return {
      text: `Deletes in ${diffDays}d (${target.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})`,
      isExpired: false,
    };
  } catch {
    return { text: 'Invalid date', isExpired: false };
  }
}

export default function AdminNotifications() {
  const { call } = useAdminSession();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [purging, setPurging] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await call('notification.list');
      const list = r?.items ?? [];
      setItems(list);

      // Automatic safety cleanup: check if any notification is expired and auto-delete
      const now = Date.now();
      const expiredList = list.filter((n: any) => n?.expires_at && new Date(n.expires_at).getTime() <= now);
      if (expiredList.length > 0) {
        // Asynchronously delete expired notifications
        Promise.all(expiredList.map((n: any) => call('notification.delete', { id: n.id }))).then(() => {
          setItems((prev) => prev.filter((p) => !expiredList.some((e: any) => e.id === p.id)));
        }).catch((err) => {
          console.warn('Auto-cleanup expired notifications warning:', err);
        });
      }
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error loading notifications', description: e?.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line

  const purgeExpired = async () => {
    setPurging(true);
    try {
      const now = Date.now();
      const expired = items.filter((n: any) => n?.expires_at && new Date(n.expires_at).getTime() <= now);
      if (expired.length === 0) {
        toast({ title: 'No expired notifications to purge' });
        return;
      }
      for (const n of expired) {
        await call('notification.delete', { id: n.id });
      }
      toast({ title: 'Purged', description: `Successfully removed ${expired.length} expired notification(s).` });
      load();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Purge failed', description: e?.message });
    } finally {
      setPurging(false);
    }
  };

  const save = async (form: any) => {
    try {
      if (editing?.id) {
        await call('notification.update', { id: editing.id, ...form });
      } else {
        await call('notification.create', form);
      }
      setOpen(false);
      setEditing(null);
      load();
      toast({ title: editing?.id ? 'Notification updated' : 'Notification published' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e?.message });
    }
  };

  const expiredCount = useMemo(() => {
    const now = Date.now();
    return items.filter((n) => n?.expires_at && new Date(n.expires_at).getTime() <= now).length;
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (n) =>
        (n?.title || '').toLowerCase().includes(q) ||
        (n?.body || '').toLowerCase().includes(q) ||
        (n?.type || '').toLowerCase().includes(q)
    );
  }, [items, filterQuery]);

  return (
    <AdminGuard>
      <AdminShell title="Notifications">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications…"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            {expiredCount > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={purgeExpired}
                disabled={purging}
                className="gap-1.5 text-xs font-semibold"
              >
                {purging ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                Purge {expiredCount} Expired
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={load} className="gap-1.5 text-xs">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
            <Button
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" /> New Notification
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading notifications…
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
              {filterQuery ? 'No notifications match your search.' : 'No notifications found. Click "New Notification" to create one.'}
            </div>
          ) : (
            filteredItems.map((n) => {
              const { text: expiryText, isExpired } = formatExpiryTime(n?.expires_at);
              return (
                <div
                  key={n?.id}
                  className={`rounded-xl border transition-all p-4 flex items-start gap-4 ${
                    isExpired
                      ? 'border-destructive/40 bg-destructive/5'
                      : n?.is_pinned
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-border/40 bg-card/40'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {n?.is_pinned && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                          <Pin className="h-3 w-3" /> Pinned
                        </span>
                      )}
                      <span className="font-semibold text-foreground truncate max-w-md">{n?.title}</span>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                        {n?.type || 'announcement'}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-bold tracking-wider ${
                          n?.priority === 'critical'
                            ? 'border-destructive/60 text-destructive bg-destructive/10'
                            : n?.priority === 'high'
                            ? 'border-amber-500/60 text-amber-500 bg-amber-500/10'
                            : ''
                        }`}
                      >
                        {n?.priority || 'normal'}
                      </Badge>

                      {!n?.is_active && (
                        <Badge variant="outline" className="text-[10px] uppercase border-destructive/40 text-destructive">
                          Inactive
                        </Badge>
                      )}

                      {/* Expiry / Auto-Delete Badge */}
                      {n?.expires_at ? (
                        isExpired ? (
                          <Badge variant="destructive" className="text-[10px] gap-1 font-bold">
                            <AlertTriangle className="h-3 w-3" /> Expired (Auto-deleting)
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] gap-1 font-semibold border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10"
                          >
                            <Clock className="h-3 w-3" /> {expiryText}
                          </Badge>
                        )
                      ) : (
                        <span className="text-[10px] text-muted-foreground/70 font-mono">No auto-delete</span>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{n?.body}</p>

                    <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground">
                      <span>Created: {n?.created_at ? new Date(n.created_at).toLocaleString() : 'N/A'}</span>
                      {n?.expires_at && (
                        <span className={isExpired ? 'text-destructive font-semibold' : 'text-amber-600 dark:text-amber-400'}>
                          Auto-delete at: {new Date(n.expires_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-center">
                    <div className="flex items-center gap-1.5 mr-2">
                      <Label htmlFor={`active-${n.id}`} className="text-xs text-muted-foreground sr-only">
                        Active
                      </Label>
                      <Switch
                        id={`active-${n.id}`}
                        checked={!!n?.is_active}
                        onCheckedChange={async () => {
                          await call('notification.toggle', { id: n.id });
                          load();
                        }}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Edit"
                      onClick={() => {
                        setEditing(n);
                        setOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Delete"
                      onClick={async () => {
                        if (confirm('Delete this notification permanently?')) {
                          await call('notification.delete', { id: n.id });
                          load();
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <NotifDialog open={open} onOpenChange={setOpen} initial={editing} onSubmit={save} />
      </AdminShell>
    </AdminGuard>
  );
}

function NotifDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: any | null;
  onSubmit: (form: any) => Promise<void>;
}) {
  const [form, setForm] = useState<any>({
    title: '',
    body: '',
    type: 'announcement',
    priority: 'normal',
    is_pinned: false,
    is_active: true,
  });

  const [expiryPreset, setExpiryPreset] = useState<string>('never');
  const [customDateTime, setCustomDateTime] = useState<string>('');

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || '',
        body: initial.body || '',
        type: initial.type || 'announcement',
        priority: initial.priority || 'normal',
        is_pinned: !!initial.is_pinned,
        is_active: initial.is_active !== false,
      });

      if (initial.expires_at) {
        setExpiryPreset('custom');
        try {
          const d = new Date(initial.expires_at);
          // Format as YYYY-MM-DDTHH:mm for datetime-local
          const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
          setCustomDateTime(localIso);
        } catch {
          setCustomDateTime('');
        }
      } else {
        setExpiryPreset('never');
        setCustomDateTime('');
      }
    } else {
      setForm({
        title: '',
        body: '',
        type: 'announcement',
        priority: 'normal',
        is_pinned: false,
        is_active: true,
      });
      setExpiryPreset('never');
      setCustomDateTime('');
    }
  }, [initial, open]);

  const handleSubmit = () => {
    let computedExpiresAt: string | null = null;

    if (expiryPreset === 'custom') {
      if (customDateTime) {
        computedExpiresAt = new Date(customDateTime).toISOString();
      } else {
        computedExpiresAt = null;
      }
    } else if (expiryPreset !== 'never') {
      const match = EXPIRY_PRESETS.find((p) => p.value === expiryPreset);
      if (match?.durationMs) {
        computedExpiresAt = new Date(Date.now() + match.durationMs).toISOString();
      }
    }

    const payload = {
      ...form,
      expires_at: computedExpiresAt,
    };

    onSubmit(payload);
  };

  // Min date-time for datetime-local is current time
  const currentLocalMin = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial?.id ? 'Edit Notification' : 'New Notification'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Server Maintenance at 11 PM"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Body / Message *</Label>
            <Textarea
              rows={4}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Detailed message or announcement text..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* New Custom Time to Delete Feature */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <Label className="text-xs font-bold text-amber-700 dark:text-amber-300">
                Auto-Delete Timer (Expiry)
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Configure notification to automatically delete and disappear after a specific time.
            </p>

            <div className="space-y-2">
              <Select value={expiryPreset} onValueChange={(v) => setExpiryPreset(v)}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPIRY_PRESETS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {expiryPreset === 'custom' && (
                <div className="space-y-1.5 pt-1">
                  <Label className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" /> Pick exact deletion date & time:
                  </Label>
                  <Input
                    type="datetime-local"
                    min={currentLocalMin}
                    value={customDateTime}
                    onChange={(e) => setCustomDateTime(e.target.value)}
                    className="bg-background"
                  />
                </div>
              )}

              {expiryPreset !== 'never' && (
                <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 pt-0.5">
                  <Sparkles className="h-3 w-3" />
                  {expiryPreset === 'custom' && customDateTime
                    ? `Will automatically delete on: ${new Date(customDateTime).toLocaleString()}`
                    : expiryPreset !== 'custom'
                    ? `Will automatically delete ${EXPIRY_PRESETS.find((p) => p.value === expiryPreset)?.label} after publish.`
                    : 'Please select a deletion date & time.'}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border/40">
            <div className="flex items-center gap-2">
              <Switch
                id="is_pinned"
                checked={!!form.is_pinned}
                onCheckedChange={(v) => setForm({ ...form, is_pinned: v })}
              />
              <Label htmlFor="is_pinned" className="text-xs cursor-pointer">
                Pin to top of feed
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={!!form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
              <Label htmlFor="is_active" className="text-xs cursor-pointer">
                Active
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/40">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!form.title?.trim() || !form.body?.trim()}>
            {initial?.id ? 'Save Changes' : 'Publish Notification'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
