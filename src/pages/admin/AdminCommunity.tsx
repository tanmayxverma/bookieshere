import { useEffect, useState } from 'react';
import { AdminGuard } from '@/components/Admin/AdminGuard';
import { AdminShell } from '@/components/Admin/AdminShell';
import { useAdminSession } from '@/hooks/useAdminSession';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Trash2, MicOff, Mic, Ban, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

type Row = {
  id: string;
  body: string;
  subject?: string | null;
  image_url?: string | null;
  created_at: string;
  profile_id: string;
  profiles?: {
    id: string; display_name: string | null; avatar_url: string | null;
    is_banned?: boolean | null; is_muted?: boolean | null; muted_until?: string | null;
  } | null;
};

type Tab = 'posts' | 'comments' | 'restricted';

export default function AdminCommunity() {
  const { call } = useAdminSession();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('posts');
  const [posts, setPosts] = useState<Row[]>([]);
  const [comments, setComments] = useState<Row[]>([]);
  const [restricted, setRestricted] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [c, m] = await Promise.all([call('community.list'), call('moderation.list')]);
      setPosts(c.posts ?? []);
      setComments(c.comments ?? []);
      setRestricted(m.items ?? []);
    } catch (e: any) {
      toast({ title: 'Could not load community data', description: e?.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []); // eslint-disable-line

  const remove = async (kind: 'post' | 'comment', id: string) => {
    setBusy(id);
    try {
      await call(kind === 'post' ? 'community.delete_post' : 'community.delete_comment', { id });
      if (kind === 'post') setPosts(p => p.filter(x => x.id !== id));
      else setComments(p => p.filter(x => x.id !== id));
      toast({ title: `${kind === 'post' ? 'Post' : 'Comment'} deleted` });
    } catch (e: any) {
      toast({ title: 'Delete failed', description: e?.message, variant: 'destructive' });
    } finally { setBusy(null); }
  };

  const moderate = async (profile_id: string, patch: Record<string, unknown>, label: string) => {
    setBusy(profile_id);
    try {
      await call('moderation.set', { profile_id, ...patch });
      toast({ title: label });
      await load();
    } catch (e: any) {
      toast({ title: 'Action failed', description: e?.message, variant: 'destructive' });
    } finally { setBusy(null); }
  };

  const RowCard = ({ r, kind }: { r: Row; kind: 'post' | 'comment' }) => {
    const p = r.profiles;
    return (
      <div className="rounded-xl border border-border/40 bg-card/40 p-3.5">
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={p?.avatar_url ?? undefined} />
            <AvatarFallback>{(p?.display_name ?? 'A').slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold">{p?.display_name ?? 'Unknown'}</span>
              {p?.is_banned && <Badge variant="destructive" className="text-[10px]">banned</Badge>}
              {p?.is_muted && <Badge variant="secondary" className="text-[10px]">muted</Badge>}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
              </span>
            </div>
            {r.subject && <div className="text-xs text-primary mt-0.5">{r.subject}</div>}
            <p className="text-sm mt-1 whitespace-pre-wrap break-words">{r.body}</p>
            {r.image_url && <img src={r.image_url} alt="Community attachment" loading="lazy" className="mt-2 max-h-48 rounded-lg border border-border/40" />}
            <div className="flex flex-wrap gap-2 mt-3">
              <Button size="sm" variant="outline" className="gap-1.5" disabled={busy === r.id}
                onClick={() => remove(kind, r.id)}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
              {p?.is_muted ? (
                <Button size="sm" variant="outline" className="gap-1.5" disabled={busy === p.id}
                  onClick={() => moderate(p.id, { is_muted: false }, 'User unmuted')}>
                  <Mic className="h-3.5 w-3.5" /> Unmute
                </Button>
              ) : (
                <Button size="sm" variant="outline" className="gap-1.5" disabled={!p || busy === p?.id}
                  onClick={() => p && moderate(p.id, { is_muted: true, mute_hours: 24 }, 'User muted for 24h')}>
                  <MicOff className="h-3.5 w-3.5" /> Mute 24h
                </Button>
              )}
              {p?.is_banned ? (
                <Button size="sm" variant="outline" className="gap-1.5" disabled={busy === p.id}
                  onClick={() => moderate(p.id, { is_banned: false }, 'User unbanned')}>
                  <ShieldCheck className="h-3.5 w-3.5" /> Unban
                </Button>
              ) : (
                <Button size="sm" variant="destructive" className="gap-1.5" disabled={!p || busy === p?.id}
                  onClick={() => p && moderate(p.id, { is_banned: true }, 'User banned')}>
                  <Ban className="h-3.5 w-3.5" /> Ban
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdminGuard>
      <AdminShell title="Community moderation">
        <div className="inline-flex rounded-full border border-border/40 p-1 mb-5">
          {(['posts', 'comments', 'restricted'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-sm rounded-full capitalize transition ${tab === t ? 'bg-primary/15 border border-primary/30' : 'text-muted-foreground'}`}>
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-6"><Loader2 className="h-4 w-4 animate-spin" /></div>
        ) : tab === 'restricted' ? (
          <div className="space-y-3">
            {restricted.length === 0 && <p className="text-sm text-muted-foreground">No banned or muted users.</p>}
            {restricted.map(u => (
              <div key={u.id} className="rounded-xl border border-border/40 bg-card/40 p-3.5 flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={u.avatar_url ?? undefined} />
                  <AvatarFallback>{(u.display_name ?? 'A').slice(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold flex items-center gap-2">
                    {u.display_name ?? 'Unknown'}
                    {u.is_banned && <Badge variant="destructive" className="text-[10px]">banned</Badge>}
                    {u.is_muted && <Badge variant="secondary" className="text-[10px]">muted</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {u.muted_until ? `Muted until ${new Date(u.muted_until).toLocaleString()}` : u.moderation_note || '—'}
                  </div>
                </div>
                {u.is_muted && (
                  <Button size="sm" variant="outline" disabled={busy === u.id}
                    onClick={() => moderate(u.id, { is_muted: false }, 'User unmuted')}>Unmute</Button>
                )}
                {u.is_banned && (
                  <Button size="sm" variant="outline" disabled={busy === u.id}
                    onClick={() => moderate(u.id, { is_banned: false }, 'User unbanned')}>Unban</Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {(tab === 'posts' ? posts : comments).length === 0 && (
              <p className="text-sm text-muted-foreground">Nothing here yet.</p>
            )}
            {(tab === 'posts' ? posts : comments).map(r => (
              <RowCard key={r.id} r={r} kind={tab === 'posts' ? 'post' : 'comment'} />
            ))}
          </div>
        )}
      </AdminShell>
    </AdminGuard>
  );
}