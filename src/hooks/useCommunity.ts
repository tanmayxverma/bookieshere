import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';

export const REACTION_EMOJIS = {
  heart: '❤️',
  laugh: '😂',
  like: '👍',
  fire: '🔥',
  rocket: '🚀',
  hundred: '💯',
  celeb: '🎉',
} as const;
export type ReactionKey = keyof typeof REACTION_EMOJIS;

export interface CommunityPost {
  id: string;
  user_id: string;
  profile_id: string;
  subject: string;
  body: string;
  title: string;
  content: string;
  author_name: string;
  author_avatar: string | null;
  category_id?: string;
  image_url: string | null;
  created_at: string;
  author?: { display_name: string; avatar_url: string | null; target_category?: string };
  reactions: Record<string, string[]>;
  my_reaction: ReactionKey | null;
  comment_count: number;
  comments_count: number;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  profile_id: string;
  body: string;
  author_name?: string;
  created_at: string;
  author?: { display_name: string; avatar_url: string | null; target_category?: string };
}

type Sort = 'recent' | 'trending';

// The feed loads one page at a time instead of the newest 200 posts at once:
// far less data per visit (Supabase egress) and far fewer cards to render.
export const FEED_PAGE_SIZE = 25;

export function useCommunity(sort: Sort = 'recent') {
  const { profile, isAuthenticated, user, deviceId } = useProfile();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const loadedCountRef = useRef(0);
  const refreshInFlightRef = useRef(false);
  const refreshQueuedRef = useRef(false);
  const loadMoreInFlightRef = useRef(false);

  const myId = user?.id || profile?.user_id || profile?.id || deviceId || null;

  const shapeRows = useCallback(async (rows: any[]): Promise<CommunityPost[]> => {
    const ids = (rows ?? []).map((r: any) => r.id);
    let reactions: any[] = [];
    let comments: any[] = [];
    if (ids.length) {
      const { data: r } = await (supabase as any).from('community_reactions').select('*').in('post_id', ids);
      const { data: c } = await (supabase as any).from('community_comments').select('post_id').in('post_id', ids);
      reactions = r ?? [];
      comments = c ?? [];
    }

    const byPost = new Map<string, any[]>();
    reactions.forEach((r: any) => {
      const arr = byPost.get(r.post_id) ?? [];
      arr.push(r);
      byPost.set(r.post_id, arr);
    });
    const cCount = new Map<string, number>();
    comments.forEach((c: any) => cCount.set(c.post_id, (cCount.get(c.post_id) ?? 0) + 1));

    const shaped: CommunityPost[] = (rows ?? []).map((row: any) => {
      const rs = byPost.get(row.id) ?? [];
      const rxMap: Record<string, string[]> = {};
      let mine: ReactionKey | null = null;
      rs.forEach((r: any) => {
        if (!rxMap[r.emoji]) rxMap[r.emoji] = [];
        rxMap[r.emoji].push(r.user_id);
        if (myId && (r.user_id === myId || r.user_id === profile?.id || r.user_id === profile?.user_id)) {
          mine = r.emoji;
        }
      });

      const subject = row.subject || row.title || '';
      const body = row.body || row.content || '';
      const commentCount = cCount.get(row.id) ?? 0;

      return {
        ...row,
        subject,
        body,
        title: subject,
        content: body,
        author_name: row.author?.display_name || 'Anonymous Aspirant',
        author_avatar: row.author?.avatar_url || null,
        category_id: row.category_id || undefined,
        author: row.author ?? undefined,
        reactions: rxMap,
        my_reaction: mine,
        comment_count: commentCount,
        comments_count: commentCount,
      };
    });

    if (sort === 'trending') {
      const since = Date.now() - 48 * 60 * 60 * 1000;
      shaped.sort((a, b) => {
        const score = (p: CommunityPost) => {
          const recent = new Date(p.created_at).getTime() > since ? 1 : 0.4;
          const rxCount = Object.values(p.reactions).reduce((acc, u) => acc + u.length, 0);
          return (rxCount * 3 + p.comment_count * 2) * recent;
        };
        return score(b) - score(a);
      });
    }
    return shaped;
  }, [myId, profile?.id, profile?.user_id, sort]);

  const fetchRange = useCallback(async (from: number, count: number) => {
    const { data: rows } = await (supabase as any)
      .from('community_posts')
      .select('*, author:profiles!community_posts_profile_id_fkey(display_name, avatar_url, target_category)')
      .order('created_at', { ascending: false })
      .range(from, from + count - 1);
    const list = rows ?? [];
    return { list, shaped: await shapeRows(list) };
  }, [shapeRows]);

  // Refresh only the window the user has already loaded (first page at
  // minimum), and coalesce bursts of realtime events into one refetch.
  const load = useCallback(async () => {
    if (refreshInFlightRef.current) { refreshQueuedRef.current = true; return; }
    refreshInFlightRef.current = true;
    try {
      const count = Math.max(FEED_PAGE_SIZE, loadedCountRef.current);
      const { list, shaped } = await fetchRange(0, count);
      loadedCountRef.current = list.length;
      setHasMore(list.length >= count);
      setPosts(shaped);
    } finally {
      refreshInFlightRef.current = false;
      setLoading(false);
      if (refreshQueuedRef.current) { refreshQueuedRef.current = false; load(); }
    }
  }, [fetchRange]);

  const loadMore = useCallback(async () => {
    if (loadMoreInFlightRef.current || loadingMore || !hasMore) return;
    loadMoreInFlightRef.current = true;
    setLoadingMore(true);
    try {
      const from = loadedCountRef.current;
      const { list, shaped } = await fetchRange(from, FEED_PAGE_SIZE);
      loadedCountRef.current = from + list.length;
      setHasMore(list.length >= FEED_PAGE_SIZE);
      if (shaped.length) {
        setPosts(prev => {
          const seen = new Set(prev.map(p => p.id));
          return [...prev, ...shaped.filter(p => !seen.has(p.id))];
        });
      }
    } finally {
      loadMoreInFlightRef.current = false;
      setLoadingMore(false);
    }
  }, [fetchRange, hasMore, loadingMore]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  useEffect(() => {
    const chName = `community-feed-${Math.random().toString(36).substring(2, 9)}`;
    const ch = supabase.channel(chName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_reactions' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_comments' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const createPost = useCallback(async (
    inputOrTitle: string | { subject?: string; title?: string; body?: string; content?: string; image_url?: string | null },
    bodyArg?: string,
    _categoryId?: string,
    imageUrlArg?: string
  ) => {
    const actorId = user?.id || profile?.user_id || profile?.id;
    const profileId = profile?.id;
    if (!profileId || !actorId) throw new Error('Please sign in to create a post.');

    let subject = '';
    let body = '';
    let image_url: string | null = null;

    if (typeof inputOrTitle === 'object' && inputOrTitle !== null) {
      subject = inputOrTitle.subject || inputOrTitle.title || '';
      body = inputOrTitle.body || inputOrTitle.content || '';
      image_url = inputOrTitle.image_url ?? null;
    } else {
      subject = typeof inputOrTitle === 'string' ? inputOrTitle : '';
      body = bodyArg || '';
      image_url = imageUrlArg ?? null;
    }

    const { data, error } = await (supabase as any).from('community_posts').insert({
      user_id: actorId,
      profile_id: profileId,
      subject,
      body,
      image_url,
    }).select().single();
    if (error) throw error;
    load();
    return data;
  }, [user?.id, profile?.id, profile?.user_id, load]);

  const deletePost = useCallback(async (id: string) => {
    const { error } = await (supabase as any).from('community_posts').delete().eq('id', id);
    if (error) throw error;
    setPosts(prev => prev.filter(p => p.id !== id));
  }, []);

  const setReaction = useCallback(async (postId: string, emoji: ReactionKey | null) => {
    const actorId = user?.id || profile?.user_id || profile?.id || deviceId;
    if (!actorId) return;

    // Optimistic local update for instant feedback
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const newRx: Record<string, string[]> = {};
      Object.entries(p.reactions || {}).forEach(([k, arr]) => {
        newRx[k] = [...arr];
      });

      // Remove current user from all reactions for this post
      Object.keys(newRx).forEach(k => {
        newRx[k] = newRx[k].filter(id => id !== actorId && id !== profile?.id && id !== profile?.user_id && id !== deviceId);
      });

      // Add to new reaction if clicked
      if (emoji) {
        if (!newRx[emoji]) newRx[emoji] = [];
        newRx[emoji].push(actorId);
      }
      return { ...p, reactions: newRx, my_reaction: emoji };
    }));

    try {
      // Clean up previous reactions by user on this post
      await (supabase as any)
        .from('community_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', actorId);

      if (emoji !== null) {
        const { error } = await (supabase as any)
          .from('community_reactions')
          .insert({ post_id: postId, user_id: actorId, emoji });
        if (error) {
          console.warn('Reaction insert error:', error);
          load();
        }
      }
    } catch (e) {
      console.error('Reaction sync failed:', e);
      load();
    }
  }, [user?.id, profile?.id, profile?.user_id, deviceId, load]);

  const toggleReaction = useCallback(async (postId: string, emoji: ReactionKey) => {
    const actorId = user?.id || profile?.user_id || profile?.id || deviceId;
    if (!actorId) return;
    const post = posts.find(p => p.id === postId);
    const users = post?.reactions?.[emoji];
    const alreadyReacted = post?.my_reaction === emoji || (Array.isArray(users) && (
      users.includes(actorId) ||
      (profile?.id && users.includes(profile.id)) ||
      (profile?.user_id && users.includes(profile.user_id)) ||
      (deviceId && users.includes(deviceId))
    ));
    return setReaction(postId, alreadyReacted ? null : emoji);
  }, [user?.id, profile?.id, profile?.user_id, deviceId, posts, setReaction]);

  return {
    posts,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    createPost,
    deletePost,
    setReaction,
    toggleReaction,
    canPost: !!(profile?.id || user?.id),
  };
}

export function useComments(postId: string | null) {
  const { profile, user } = useProfile();
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!postId) return;
    const { data } = await (supabase as any).from('community_comments')
      .select('*, author:profiles!community_comments_profile_id_fkey(display_name, avatar_url, target_category)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    const mapped = (data as any[] ?? []).map(c => ({
      ...c,
      author_name: c.author?.display_name || 'Aspirant',
      author_avatar: c.author?.avatar_url || null,
      target_category: c.author?.target_category || null,
    }));
    setComments(mapped);
    setLoading(false);
  }, [postId]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  useEffect(() => {
    if (!postId) return;
    const chName = `comments-${postId}-${Math.random().toString(36).substring(2, 9)}`;
    const ch = supabase.channel(chName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_comments', filter: `post_id=eq.${postId}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [postId, load]);

  const addComment = useCallback(async (body: string) => {
    const actorId = user?.id || profile?.user_id || profile?.id;
    const profileId = profile?.id;
    if (!profileId || !actorId || !postId) throw new Error('Sign in to leave a reply.');
    const { error } = await (supabase as any).from('community_comments').insert({
      post_id: postId, user_id: actorId, profile_id: profileId, body,
    });
    if (error) throw error;
    load();
  }, [user?.id, profile?.id, profile?.user_id, postId, load]);

  const deleteComment = useCallback(async (commentId: string) => {
    const { error } = await (supabase as any).from('community_comments').delete().eq('id', commentId);
    if (error) throw error;
    setComments(prev => prev.filter(c => c.id !== commentId));
  }, []);

  return { comments, loading, addComment, deleteComment };
}