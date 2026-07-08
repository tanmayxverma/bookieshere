import { useState, useMemo, useRef, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCommunity, useComments, REACTION_EMOJIS, type ReactionKey, type CommunityPost } from '@/hooks/useCommunity';
import { useProfile } from '@/hooks/useProfile';
import { moderate } from '@/lib/moderation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, format } from 'date-fns';
import { ArrowLeft, BadgeCheck, MessageCircle, Plus, Send, Smile, X, Image as ImageIcon, Loader2, Trash2, LogIn } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const REACTION_ORDER: ReactionKey[] = ['heart','laugh','like','fire','rocket','hundred','celeb'];

export default function CommunityPage() {
  const [sort, setSort] = useState<'recent'|'trending'>('recent');
  const { posts, loading, createPost, deletePost, setReaction, canPost } = useCommunity(sort);
  const { user, profile } = useProfile();
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  return (
    <Layout>
      {/* Channel header */}
      <div className="bg-gradient-to-b from-primary/15 via-primary/5 to-transparent border-b border-border/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="h-9 w-9 rounded-full flex items-center justify-center bg-background/60 border border-border/40 hover:bg-background/80 transition">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="h-12 w-12 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center font-display font-bold text-primary">B</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h1 className="font-display text-xl font-bold tracking-tight">Bookie Community</h1>
                <BadgeCheck className="h-4 w-4 text-primary fill-primary/20" />
              </div>
              <p className="text-xs text-muted-foreground">Bookie Community Channel · JEE aspirants only</p>
            </div>
            <NewPostDialog open={creating} onOpenChange={setCreating}
              onCreate={createPost} canPost={canPost} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Sort tabs */}
        <div className="inline-flex rounded-full border border-border/40 bg-background/60 backdrop-blur p-1 mb-5">
          {(['recent','trending'] as const).map(s => (
            <button key={s} onClick={() => setSort(s)}
              className={`px-4 py-1.5 text-sm rounded-full transition ${sort === s ? 'bg-primary/15 text-foreground border border-primary/30' : 'text-muted-foreground'}`}>
              {s === 'recent' ? 'Recent' : 'Trending'}
            </button>
          ))}
        </div>

        {!canPost && (
          <div className="mb-5 rounded-2xl border border-border/40 bg-card/40 p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center"><LogIn className="h-4 w-4 text-primary" /></div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Sign in with Google to post</div>
              <div className="text-xs text-muted-foreground">Reading is open to everyone. Only Gmail-verified aspirants can post & react.</div>
            </div>
            <Link to="/auth"><Button size="sm">Sign in</Button></Link>
          </div>
        )}

        {loading ? (
          <div className="text-center py-10 text-sm text-muted-foreground">Loading feed…</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-sm text-muted-foreground">
            <MessageCircle className="mx-auto h-8 w-8 mb-3 opacity-40" />
            No posts yet. Be the first.
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(p => (
              <PostCard key={p.id} post={p} currentUserId={user?.id ?? null}
                onReact={(e) => setReaction(p.id, e)}
                onDelete={() => deletePost(p.id)} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

function PostCard({ post, currentUserId, onReact, onDelete }: {
  post: CommunityPost; currentUserId: string | null;
  onReact: (e: ReactionKey | null) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [picker, setPicker] = useState(false);
  const [busy, setBusy] = useState(false);
  const isMine = currentUserId && post.user_id === currentUserId;

  const react = async (e: ReactionKey) => {
    setPicker(false);
    try {
      const next = post.my_reaction === e ? null : e;
      await onReact(next);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Could not react', description: err.message });
    }
  };

  const remove = async () => {
    if (!confirm('Delete this post?')) return;
    setBusy(true);
    try { await onDelete(); toast({ title: 'Post deleted' }); }
    catch (e: any) { toast({ variant: 'destructive', title: 'Failed', description: e.message }); }
    finally { setBusy(false); }
  };

  const initials = (post.author?.display_name ?? 'B').slice(0,2).toUpperCase();

  return (
    <article className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
      <div className="p-4">
        <header className="flex items-start gap-3 mb-3">
          <Avatar className="h-10 w-10 border border-border/40">
            {post.author?.avatar_url && <AvatarImage src={post.author.avatar_url} />}
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold leading-tight">{post.author?.display_name ?? 'Aspirant'}</div>
            <div className="text-[11px] text-muted-foreground">
              {format(new Date(post.created_at), 'MMM d, yyyy · h:mm a')}
            </div>
          </div>
          {isMine && (
            <button onClick={remove} disabled={busy} className="text-muted-foreground hover:text-destructive transition p-1" aria-label="Delete">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
          )}
        </header>

        <h3 className="font-semibold text-[15px] mb-1.5 leading-snug">{post.subject}</h3>
        <p className="text-sm text-foreground/85 whitespace-pre-wrap leading-relaxed">{post.body}</p>

        {post.image_url && (
          <div className="mt-3 rounded-xl overflow-hidden border border-border/40 bg-surface-2/40">
            <img src={post.image_url} alt="" className="w-full max-h-[520px] object-cover" loading="lazy" />
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="px-4 pb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {post.reactions.length === 0 ? null : post.reactions.map(r => (
            <button key={r.emoji} onClick={() => react(r.emoji)}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition ${
                post.my_reaction === r.emoji ? 'border-primary/50 bg-primary/10' : 'border-border/50 bg-surface-2/50 hover:bg-surface-2/80'
              }`}>
              <span>{REACTION_EMOJIS[r.emoji]}</span>
              <span className="font-medium">{r.count}</span>
            </button>
          ))}
          <div className="relative">
            <button onClick={() => setPicker(p => !p)}
              className="inline-flex items-center justify-center h-7 w-7 rounded-full border border-border/50 bg-surface-2/50 hover:bg-surface-2/80 text-muted-foreground transition">
              <Smile className="h-3.5 w-3.5" />
            </button>
            {picker && (
              <div className="absolute bottom-full mb-2 left-0 z-10 rounded-full border border-border/60 bg-background shadow-lg px-2 py-1.5 flex gap-1">
                {REACTION_ORDER.map(e => (
                  <button key={e} onClick={() => react(e)} className="text-lg hover:scale-125 transition p-1">
                    {REACTION_EMOJIS[e]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <button onClick={() => setExpanded(v => !v)}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-surface-2/50 transition">
          <MessageCircle className="h-3.5 w-3.5" />
          {post.comment_count}
        </button>
      </div>

      {expanded && (
        <CommentsSection postId={post.id} />
      )}
    </article>
  );
}

function CommentsSection({ postId }: { postId: string }) {
  const { comments, addComment } = useComments(postId);
  const { canPost } = { canPost: true } as any;
  const { user } = useProfile();
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = draft.trim(); if (!v) return;
    const m = moderate(v);
    if (!m.ok) { toast({ variant: 'destructive', title: 'Blocked', description: m.reason }); return; }
    setBusy(true);
    try { await addComment(v); setDraft(''); }
    catch (e: any) { toast({ variant: 'destructive', title: 'Failed', description: e.message }); }
    finally { setBusy(false); }
  };

  return (
    <div className="border-t border-border/40 bg-surface-2/20">
      <div className="p-3 space-y-2 max-h-72 overflow-y-auto">
        {comments.length === 0 && <div className="text-center text-xs text-muted-foreground py-3">No comments yet</div>}
        {comments.map(c => (
          <div key={c.id} className="flex items-start gap-2">
            <Avatar className="h-7 w-7 border border-border/40">
              {c.author?.avatar_url && <AvatarImage src={c.author.avatar_url} />}
              <AvatarFallback className="text-[10px]">{(c.author?.display_name ?? 'A').slice(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold">{c.author?.display_name ?? 'Aspirant'}</span>
                <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span>
              </div>
              <div className="text-sm text-foreground/85 whitespace-pre-wrap">{c.body}</div>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={submit} className="p-2 border-t border-border/40 flex items-center gap-2">
        <Input value={draft} onChange={e => setDraft(e.target.value)} placeholder="Write a comment..." maxLength={500}
          disabled={!user} className="rounded-full bg-background border-border/50" />
        <button type="submit" disabled={busy || !draft.trim() || !user}
          className="h-9 w-9 shrink-0 rounded-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center transition disabled:opacity-40">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}

function NewPostDialog({ open, onOpenChange, onCreate, canPost }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  onCreate: (i: { subject: string; body: string; image_url?: string | null }) => Promise<any>;
  canPost: boolean;
}) {
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!image) { setPreview(null); return; }
    const u = URL.createObjectURL(image); setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [image]);

  const reset = () => { setSubject(''); setBody(''); setImage(null); };

  const submit = async () => {
    if (!subject.trim() || !body.trim()) { toast({ variant: 'destructive', title: 'Missing fields' }); return; }
    if (body.length > 300) { toast({ variant: 'destructive', title: 'Body too long', description: 'Max 300 characters.' }); return; }
    const sm = moderate(subject); const bm = moderate(body);
    if (!sm.ok) { toast({ variant: 'destructive', title: 'Subject blocked', description: sm.reason }); return; }
    if (!bm.ok) { toast({ variant: 'destructive', title: 'Post blocked', description: bm.reason }); return; }
    setBusy(true);
    try {
      let image_url: string | null = null;
      if (image) {
        const ext = image.name.split('.').pop() || 'jpg';
        const path = `community/${crypto.randomUUID()}.${ext}`;
        const up = await supabase.storage.from('room-images').upload(path, image, { cacheControl: '3600', upsert: false });
        if (up.error) throw up.error;
        const { data: pub } = supabase.storage.from('room-images').getPublicUrl(path);
        image_url = pub.publicUrl;
      }
      await onCreate({ subject: subject.trim(), body: body.trim(), image_url });
      reset();
      onOpenChange(false);
      toast({ title: 'Posted', description: 'Your post is live.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Failed', description: e.message });
    } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={!canPost} className="gap-1.5"><Plus className="h-4 w-4" /> Post</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Share with the community</DialogTitle>
          <DialogDescription>Max 10 posts per day. No links. Keep it kind.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} maxLength={120} />
          <div>
            <Textarea placeholder="What's on your mind? (max 300)" rows={5} value={body}
              onChange={e => setBody(e.target.value.slice(0, 300))} maxLength={300} />
            <div className="text-right text-[10px] text-muted-foreground mt-1">{body.length}/300</div>
          </div>
          {preview && (
            <div className="relative rounded-xl overflow-hidden border border-border/40">
              <img src={preview} alt="" className="w-full max-h-60 object-cover" />
              <button onClick={() => setImage(null)} className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => setImage(e.target.files?.[0] ?? null)} />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-1.5">
            <ImageIcon className="h-3.5 w-3.5" /> {image ? 'Change image' : 'Add image (optional)'}
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}Post</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}