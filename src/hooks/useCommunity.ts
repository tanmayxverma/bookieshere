import { useCallback, useEffect, useState } from 'react';
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
  image_url: string | null;
  created_at: string;
  author?: { display_name: string; avatar_url: string | null };
  reactions: { emoji: ReactionKey; count: number }[];
  my_reaction: ReactionKey | null;
  comment_count: number;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  profile_id: string;
  body: string;
  created_at: string;
  author?: { display_name: string; avatar_url: string | null };
}

type Sort = 'recent' | 'trending';

export function useCommunity(sort: Sort = 'recent') {
  const { profile, isAuthenticated, user } = useProfile();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: rows } = await (supabase as any)
      .from('community_posts')
      .select('*, author:profiles!community_posts_profile_id_fkey(display_name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(200);
    const ids = (rows ?? []).map((r: any) => r.id);
    let reactions: any[] = [];
    let comments: any[] = [];
    if (ids.length) {
      const { data: r } = await (supabase as any).from('community_reactions').select('*').in('post_id', ids);
      const { data: c } = await (supabase as any).from('community_comments').select('post_id').in('post_id', ids);
      reactions = r ?? []; comments = c ?? [];
    }
    const uid = user?.id ?? null;
    const byPost = new Map<string, any[]>();
    reactions.forEach((r: any) => {
      const arr = byPost.get(r.post_id) ?? []; arr.push(r); byPost.set(r.post_id, arr);
    });
    const cCount = new Map<string, number>();
    comments.forEach((c: any) => cCount.set(c.post_id, (cCount.get(c.post_id) ?? 0) + 1));

    const shaped: CommunityPost[] = (rows ?? []).map((row: any) => {
      const rs = byPost.get(row.id) ?? [];
      const counts = new Map<ReactionKey, number>();
      let mine: ReactionKey | null = null;
      rs.forEach((r: any) => {
        counts.set(r.emoji, (counts.get(r.emoji) ?? 0) + 1);
        if (uid && r.user_id === uid) mine = r.emoji;
      });
      return {
        ...row,
        author: row.author ?? undefined,
        reactions: Array.from(counts.entries()).map(([emoji, count]) => ({ emoji, count })),
        my_reaction: mine,
        comment_count: cCount.get(row.id) ?? 0,
      };
    });
    if (sort === 'trending') {
      const since = Date.now() - 48 * 60 * 60 * 1000;
      shaped.sort((a, b) => {
        const score = (p: CommunityPost) => {
          const recent = new Date(p.created_at).getTime() > since ? 1 : 0.4;
          const rx = p.reactions.reduce((s, r) => s + r.count, 0);
          return (rx * 3 + p.comment_count * 2) * recent;
        };
        return score(b) - score(a);
      });
    }
    setPosts(shaped);
    setLoading(false);
  }, [user?.id, sort]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  useEffect(() => {
    const ch = supabase.channel('community-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_reactions' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_comments' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const createPost = useCallback(async (input: { subject: string; body: string; image_url?: string | null }) => {
    if (!isAuthenticated || !user || !profile) throw new Error('Sign in with Google to post.');
    const { data, error } = await (supabase as any).from('community_posts').insert({
      user_id: user.id, profile_id: profile.id,
      subject: input.subject, body: input.body, image_url: input.image_url ?? null,
    }).select().single();
    if (error) throw error;
    return data;
  }, [isAuthenticated, user, profile]);

  const deletePost = useCallback(async (id: string) => {
    const { error } = await (supabase as any).from('community_posts').delete().eq('id', id);
    if (error) throw error;
  }, []);

  const setReaction = useCallback(async (postId: string, emoji: ReactionKey | null) => {
    if (!isAuthenticated || !user) throw new Error('Sign in to react.');
    // Optimistic update
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const prevEmoji = p.my_reaction;
      const counts = new Map(p.reactions.map(r => [r.emoji, r.count] as const));
      if (prevEmoji) counts.set(prevEmoji, Math.max(0, (counts.get(prevEmoji) ?? 0) - 1));
      if (emoji) counts.set(emoji, (counts.get(emoji) ?? 0) + 1);
      const reactions = Array.from(counts.entries())
        .filter(([, c]) => c > 0)
        .map(([e, c]) => ({ emoji: e as ReactionKey, count: c }));
      return { ...p, reactions, my_reaction: emoji };
    }));
    if (emoji === null) {
      const { error } = await (supabase as any).from('community_reactions').delete().eq('post_id', postId).eq('user_id', user.id);
      if (error) throw error;
      return;
    }
    // upsert
    const { error } = await (supabase as any).from('community_reactions')
      .upsert({ post_id: postId, user_id: user.id, emoji }, { onConflict: 'post_id,user_id' });
    if (error) throw error;
  }, [isAuthenticated, user]);

  return { posts, loading, createPost, deletePost, setReaction, canPost: isAuthenticated && !!user };
}

export function useComments(postId: string | null) {
  const { profile, user, isAuthenticated } = useProfile();
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!postId) return;
    const { data } = await (supabase as any).from('community_comments')
      .select('*, author:profiles!community_comments_profile_id_fkey(display_name, avatar_url)')
      .eq('post_id', postId)
      .order('created_at');
    setComments((data as any[]) ?? []);
    setLoading(false);
  }, [postId]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  useEffect(() => {
    if (!postId) return;
    const ch = supabase.channel(`comments-${postId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_comments', filter: `post_id=eq.${postId}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [postId, load]);

  const addComment = useCallback(async (body: string) => {
    if (!isAuthenticated || !user || !profile || !postId) throw new Error('Sign in to comment.');
    const { error } = await (supabase as any).from('community_comments').insert({
      post_id: postId, user_id: user.id, profile_id: profile.id, body,
    });
    if (error) throw error;
  }, [isAuthenticated, user, profile, postId]);

  const deleteComment = useCallback(async (commentId: string) => {
    if (!isAuthenticated || !user) throw new Error('Sign in required.');
    const { error } = await (supabase as any).from('community_comments').delete().eq('id', commentId);
    if (error) throw error;
  }, [isAuthenticated, user]);

  return { comments, loading, addComment, deleteComment };
}