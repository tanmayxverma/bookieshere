/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCommunity, useComments, REACTION_EMOJIS, type ReactionKey, type CommunityPost } from '@/hooks/useCommunity';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { moderate } from '@/lib/moderation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, format } from 'date-fns';
import { ArrowLeft, BadgeCheck, MessageCircle, Plus, Send, Smile, X, Image as ImageIcon, Loader2, Trash2, Flame, Clock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const REACTION_ORDER: ReactionKey[] = ['heart', 'laugh', 'like', 'fire', 'rocket', 'hundred', 'celeb'];

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.9 1.5l2.7-2.6C16.9 3.3 14.7 2.4 12 2.4 6.6 2.4 2.2 6.8 2.2 12.1s4.4 9.7 9.8 9.7c5.7 0 9.4-4 9.4-9.6 0-.6-.1-1.1-.2-1.5H12z"/>
  </svg>
);

export default function CommunityPage() {
  const [sort, setSort] = useState<'recent' | 'trending'>('recent');
  const { posts, loading, createPost, deletePost, setReaction, canPost } = useCommunity(sort);
  const { user } = useProfile();
  const { signInWithGoogle } = useAuth();
  const [creating, setCreating] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGoogleAuth = async () => {
    setAuthBusy(true);
    const r = await signInWithGoogle();
    if (r.error) {
      setAuthBusy(false);
      toast({ variant: 'destructive', title: 'Google sign-in failed', description: String(r.error?.message || r.error) });
    }
  };

  return (
    <Layout>
      <div className="w-full bg-background blueprint-grid text-on-surface min-h-screen pb-24">
        {/* Funky Top Header */}
        <div className="border-b-2 border-slate-900/10 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md sticky top-0 z-20">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="h-10 w-10 rounded-xl flex items-center justify-center bg-white dark:bg-slate-900 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(19,27,46,1)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
                aria-label="Go back"
              >
                <ArrowLeft className="h-4 w-4 text-slate-900 dark:text-slate-100" />
              </button>

              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-brand-blue text-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(19,27,46,1)] flex items-center justify-center font-display font-black text-lg">
                  B
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className="font-display text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
                      Bookie Community
                    </h1>
                    <BadgeCheck className="h-4 w-4 text-brand-blue fill-blue-100" />
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 font-bold">
                    ⚡ Aspirants Only • Zero Fluff
                  </p>
                </div>
              </div>
            </div>

            <NewPostDialog
              open={creating}
              onOpenChange={setCreating}
              onCreate={createPost}
              canPost={canPost}
            />
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {/* Controls Bar: Sort Pills & Counter */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="inline-flex rounded-xl border-2 border-slate-900 bg-white dark:bg-slate-900 p-1 shadow-[2px_2px_0px_0px_rgba(19,27,46,1)]">
              <button
                onClick={() => setSort('recent')}
                className={`px-3.5 py-1 text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  sort === 'recent'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Clock className="h-3 w-3" />
                <span>Recent</span>
              </button>
              <button
                onClick={() => setSort('trending')}
                className={`px-3.5 py-1 text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  sort === 'trending'
                    ? 'bg-brand-blue text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Flame className="h-3 w-3" />
                <span>Trending</span>
              </button>
            </div>

            <div className="px-3 py-1 rounded-full bg-slate-200/70 dark:bg-slate-800 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-300/80">
              💬 {posts?.length || 0} Discussions
            </div>
          </div>

          {/* Guest Sign-in Banner */}
          {!canPost && (
            <div className="relative rounded-2xl border-2 border-slate-900 bg-brand-softYellow p-4 shadow-[4px_4px_0px_0px_rgba(19,27,46,1)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">🔥</span>
                <div>
                  <div className="font-mono text-xs font-extrabold text-amber-950 uppercase tracking-wide">
                    Google-Verified Aspirants Only
                  </div>
                  <p className="text-xs text-amber-900 font-medium mt-0.5">
                    Reading is open to all. To post questions, reply to peers, or react, sign in with Google.
                  </p>
                </div>
              </div>
              <button
                onClick={handleGoogleAuth}
                disabled={authBusy}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(19,27,46,1)] hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all shrink-0"
              >
                {authBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
                <span>Sign in with Google</span>
              </button>
            </div>
          )}

          {/* Feed List */}
          {loading ? (
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border-2 border-slate-900/40 bg-white dark:bg-slate-900 p-5 shadow-[3px_3px_0px_0px_rgba(19,27,46,0.15)] animate-pulse space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-2.5 w-16 bg-slate-100 dark:bg-slate-800/60 rounded" />
                    </div>
                  </div>
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800/60 rounded" />
                  <div className="h-3 w-5/6 bg-slate-100 dark:bg-slate-800/60 rounded" />
                </div>
              ))}
            </div>
          ) : !posts || posts.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-400 bg-white/60 dark:bg-slate-900/60 text-center py-16 px-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-softYellow border-2 border-slate-900 flex items-center justify-center mx-auto mb-3 shadow-[2px_2px_0px_0px_rgba(19,27,46,1)] text-xl">
                ☕
              </div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-slate-100">
                Pin-drop silence...
              </h3>
              <p className="text-xs font-mono text-slate-500 max-w-sm mx-auto mt-1">
                Everyone must be grinding mocks or revision right now. Be the first to drop a question or doubt!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {(posts || []).map((p) => (
                <PostCard
                  key={p.id}
                  post={p}
                  currentUserId={user?.id ?? null}
                  onReact={(e) => setReaction(p.id, e)}
                  onDelete={() => deletePost(p.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function PostCard({
  post,
  currentUserId,
  onReact,
  onDelete,
}: {
  post: CommunityPost;
  currentUserId: string | null;
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
    try {
      await onDelete();
      toast({ title: 'Post deleted' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Failed', description: e.message });
    } finally {
      setBusy(false);
    }
  };

  const initials = (post.author?.display_name ?? 'B').slice(0, 2).toUpperCase();

  return (
    <article className="rounded-2xl border-2 border-slate-900 bg-white dark:bg-slate-900 shadow-[3px_3px_0px_0px_rgba(19,27,46,1)] hover:shadow-[5px_5px_0px_0px_rgba(19,27,46,1)] hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      <div className="p-4 sm:p-5">
        {/* Author Header */}
        <header className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-10 w-10 border-2 border-slate-900 rounded-xl overflow-hidden shadow-sm">
              {post.author?.avatar_url && <AvatarImage src={post.author.avatar_url} />}
              <AvatarFallback className="bg-brand-softYellow font-display font-bold text-slate-900 text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                  {post.author?.display_name ?? 'Aspirant'}
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800">
                  ASPIRANT
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-500">
                {format(new Date(post.created_at), 'MMM d, yyyy • h:mm a')}
              </div>
            </div>
          </div>

          {isMine && (
            <button
              onClick={remove}
              disabled={busy}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition p-1"
              aria-label="Delete post"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
          )}
        </header>

        {/* Content */}
        <h3 className="font-display font-bold text-[16px] mb-2 text-slate-900 dark:text-slate-100 leading-snug">
          {post.subject}
        </h3>
        <p className="text-[14px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
          {post.body}
        </p>

        {post.image_url && (
          <div className="mt-3.5 rounded-xl overflow-hidden border-2 border-slate-900 shadow-sm bg-slate-100 dark:bg-slate-800">
            <img src={post.image_url} alt="" className="w-full max-h-[500px] object-cover" loading="lazy" />
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="px-4 sm:px-5 py-3 border-t-2 border-slate-900/10 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {!post.reactions || post.reactions.length === 0
            ? null
            : post.reactions.map((r) => (
                <button
                  key={r.emoji}
                  onClick={() => react(r.emoji)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border-2 px-2.5 py-1 text-xs font-mono font-bold transition-transform hover:scale-105 active:scale-95 ${
                    post.my_reaction === r.emoji
                      ? 'border-brand-blue bg-blue-50 text-brand-blue dark:bg-blue-950 dark:border-blue-400 shadow-sm'
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  <span className="text-sm">{REACTION_EMOJIS[r.emoji]}</span>
                  <span>{r.count}</span>
                </button>
              ))}

          <div className="relative">
            <button
              onClick={() => setPicker((p) => !p)}
              className="inline-flex items-center justify-center h-7 w-7 rounded-lg border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-400 text-slate-600 dark:text-slate-300 hover:scale-105 active:scale-95 transition-all shadow-xs"
              title="Add reaction"
            >
              <Smile className="h-3.5 w-3.5" />
            </button>

            {picker && (
              <div className="absolute bottom-full mb-2 left-0 z-20 rounded-xl border-2 border-slate-900 bg-white dark:bg-slate-900 shadow-[3px_3px_0px_0px_rgba(19,27,46,1)] p-1.5 flex gap-1 animate-in fade-in zoom-in-95">
                {REACTION_ORDER.map((e) => (
                  <button
                    key={e}
                    onClick={() => react(e)}
                    className="text-lg hover:scale-125 active:scale-90 transition p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {REACTION_EMOJIS[e]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className={`inline-flex items-center gap-1.5 rounded-lg border-2 px-3 py-1 text-xs font-mono font-bold transition-all ${
            expanded
              ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
          }`}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          <span>{post.comment_count} {post.comment_count === 1 ? 'Reply' : 'Replies'}</span>
        </button>
      </div>

      {expanded && <CommentsSection postId={post.id} />}
    </article>
  );
}

function CommentsSection({ postId }: { postId: string }) {
  const { comments, addComment, loading, deleteComment } = useComments(postId);
  const { user } = useProfile();
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = draft.trim();
    if (!v) return;
    const m = moderate(v);
    if (!m.ok) {
      toast({ variant: 'destructive', title: 'Blocked', description: m.reason });
      return;
    }
    setBusy(true);
    try {
      await addComment(v);
      setDraft('');
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Failed', description: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border-t-2 border-slate-900/10 bg-slate-50/90 dark:bg-slate-950/60 p-4 space-y-3">
      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {loading ? (
          <div className="text-center text-xs font-mono text-slate-500 py-3">Loading replies…</div>
        ) : !comments || comments.length === 0 ? (
          <div className="text-center text-xs font-mono text-slate-500 py-3">No replies yet. Speak your mind!</div>
        ) : null}

        {(comments || []).map((c) => (
          <div
            key={c.id}
            className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
          >
            <Avatar className="h-7 w-7 border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden shrink-0 mt-0.5">
              {c.author?.avatar_url && <AvatarImage src={c.author.avatar_url} />}
              <AvatarFallback className="text-[10px] font-mono font-bold bg-slate-100">
                {(c.author?.display_name ?? 'A').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {c.author?.display_name ?? 'Aspirant'}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                </span>
              </div>
              <div className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap mt-0.5 leading-relaxed">
                {c.body}
              </div>
            </div>
            {user && c.user_id === user.id && (
              <button
                onClick={async () => {
                  if (!confirm('Delete this reply?')) return;
                  try {
                    await deleteComment(c.id);
                  } catch (e: any) {
                    toast({ variant: 'destructive', title: 'Failed', description: e.message });
                  }
                }}
                className="text-slate-400 hover:text-red-500 transition p-1 shrink-0"
                aria-label="Delete reply"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="pt-2 flex items-center gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={user ? 'Write a quick reply...' : 'Sign in with Google to reply'}
          maxLength={500}
          disabled={!user}
          className="rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-xs focus-visible:ring-0 focus-visible:border-slate-900"
        />
        <button
          type="submit"
          disabled={busy || !draft.trim() || !user}
          className="h-9 w-9 shrink-0 rounded-xl bg-brand-blue text-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(19,27,46,1)] hover:bg-blue-600 active:translate-y-0.5 active:shadow-none flex items-center justify-center transition disabled:opacity-40"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}

function NewPostDialog({
  open,
  onOpenChange,
  onCreate,
  canPost,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
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
    if (!image) {
      setPreview(null);
      return;
    }
    const u = URL.createObjectURL(image);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [image]);

  const reset = () => {
    setSubject('');
    setBody('');
    setImage(null);
  };

  const submit = async () => {
    if (!subject.trim() || !body.trim()) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Please enter both subject and body.' });
      return;
    }
    if (body.length > 300) {
      toast({ variant: 'destructive', title: 'Body too long', description: 'Max 300 characters.' });
      return;
    }
    const sm = moderate(subject);
    const bm = moderate(body);
    if (!sm.ok) {
      toast({ variant: 'destructive', title: 'Subject blocked', description: sm.reason });
      return;
    }
    if (!bm.ok) {
      toast({ variant: 'destructive', title: 'Post blocked', description: bm.reason });
      return;
    }
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
      toast({ title: 'Posted', description: 'Your post is now live.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Failed', description: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          disabled={!canPost}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-blue text-white font-bold text-xs border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(19,27,46,1)] hover:bg-blue-600 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          <Plus className="h-4 w-4" />
          <span>New Post</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(19,27,46,1)] rounded-2xl bg-white dark:bg-slate-900">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">✍️</span>
            <DialogTitle className="font-display font-black text-xl">Create Community Post</DialogTitle>
          </div>
          <DialogDescription className="text-xs font-mono text-slate-500">
            Keep it relevant to JEE prep, mocks, or strategy. No links or spam.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 pt-2">
          <div>
            <Input
              placeholder="Post subject or topic (e.g. Rotational Motion Doubt, MathonGo FT-4)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={120}
              className="border-2 border-slate-300 focus-visible:border-slate-900 rounded-xl text-sm"
            />
          </div>

          <div>
            <Textarea
              placeholder="What's your question, tip, or thought? (max 300 characters)"
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value.slice(0, 300))}
              maxLength={300}
              className="border-2 border-slate-300 focus-visible:border-slate-900 rounded-xl text-sm leading-relaxed"
            />
            <div className="flex items-center justify-between mt-1 text-[11px] font-mono text-slate-500">
              <span>💡 Mention your batch or target exam for better answers</span>
              <span className={body.length > 270 ? 'text-amber-600 font-bold' : ''}>
                {body.length}/300
              </span>
            </div>
          </div>

          {preview && (
            <div className="relative rounded-xl overflow-hidden border-2 border-slate-900 shadow-sm">
              <img src={preview} alt="" className="w-full max-h-56 object-cover" />
              <button
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-900 transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              className="gap-2 border-2 border-slate-300 rounded-xl hover:border-slate-900 text-xs font-mono font-bold"
            >
              <ImageIcon className="h-4 w-4 text-slate-500" />
              <span>{image ? 'Change Attached Image' : 'Attach Image (optional)'}</span>
            </Button>
          </div>
        </div>

        <DialogFooter className="pt-3 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border-2 border-slate-300 text-xs font-bold"
          >
            Cancel
          </Button>
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-brand-blue text-white font-bold text-xs border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(19,27,46,1)] hover:bg-blue-600 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>Publish Post 🚀</span>
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

