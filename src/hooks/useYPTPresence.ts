import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ActiveStudyUser } from '@/types/ypt';

export function useYPTPresence(userId?: string, userName?: string, jeeYear?: string) {
  const [onlineCount, setOnlineCount] = useState(0);
  const [activeUsers, setActiveUsers] = useState<ActiveStudyUser[]>([]);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    const presenceKey = userId || 'anon-' + Math.random().toString(36).slice(2);

    const presenceChannel = supabase.channel('ypt_online', {
      config: { presence: { key: presenceKey } },
    });
    channelRef.current = presenceChannel;

    const updateCount = () => {
      const state = presenceChannel.presenceState();
      setOnlineCount(Math.max(Object.keys(state).length, 1));
    };

    presenceChannel
      .on('presence', { event: 'sync' }, updateCount)
      .on('presence', { event: 'join' }, updateCount)
      .on('presence', { event: 'leave' }, updateCount)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: userId || presenceKey,
            name: userName || 'Visitor',
            jee_year: jeeYear || '',
            online_at: new Date().toISOString(),
          });
        }
      });

    // Handle visibility change — track/untrack based on tab visibility
    // Not too strict: we keep them online if tab is in background (visibilitychange fires on minimize too)
    // Only untrack if page is actually hidden AND after a grace period
    let untrackTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleVisibility = async () => {
      if (document.visibilityState === 'hidden') {
        // Grace period of 30s — if they come back within 30s, stay online
        untrackTimeout = setTimeout(async () => {
          try { await presenceChannel.untrack(); } catch {}
        }, 30000);
      } else {
        // Came back — cancel untrack and re-track
        if (untrackTimeout) {
          clearTimeout(untrackTimeout);
          untrackTimeout = null;
        }
        try {
          await presenceChannel.track({
            user_id: userId || presenceKey,
            name: userName || 'Visitor',
            jee_year: jeeYear || '',
            online_at: new Date().toISOString(),
          });
        } catch {}
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    // Active study sessions
    const fetchActive = async () => {
      const { data } = await (supabase as any)
        .from('study_sessions')
        .select('subject, ypt_users(name, jee_focus_year)')
        .eq('status', 'active');

      if (data) {
        setActiveUsers(
          data.map((s: any) => ({
            name: s.ypt_users?.name || 'Unknown',
            subject: s.subject,
            jee_focus_year: s.ypt_users?.jee_focus_year || '',
          }))
        );
      }
    };

    fetchActive();

    // Coalesce refetches to at most one per 30s. This channel hears EVERY
    // study_sessions change — including every timer heartbeat update from
    // every studying user — and fetchActive only reads subject + user, which
    // heartbeats never change. Refetching on each event multiplied into
    // thousands of needless requests (and server log lines) per hour.
    // Starts/stops still appear within 30s, which is fine for this list.
    let lastFetchAt = Date.now();
    let trailingTimer: ReturnType<typeof setTimeout> | null = null;
    const fetchActiveCoalesced = () => {
      if (document.visibilityState === 'hidden') return;
      const wait = 30_000 - (Date.now() - lastFetchAt);
      if (wait <= 0) {
        lastFetchAt = Date.now();
        fetchActive();
      } else if (!trailingTimer) {
        trailingTimer = setTimeout(() => {
          trailingTimer = null;
          lastFetchAt = Date.now();
          fetchActive();
        }, wait);
      }
    };

    const sessionsChannelName = `ypt_sessions_${Math.random().toString(36).substring(2, 9)}`;
    const sessionsChannel = supabase
      .channel(sessionsChannelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'study_sessions' },
        () => { fetchActiveCoalesced(); }
      )
      .subscribe();

    return () => {
      if (untrackTimeout) clearTimeout(untrackTimeout);
      if (trailingTimer) clearTimeout(trailingTimer);
      document.removeEventListener('visibilitychange', handleVisibility);
      supabase.removeChannel(presenceChannel);
      supabase.removeChannel(sessionsChannel);
    };
  }, [userId, userName, jeeYear]);

  const displayOnlineCount = Math.max(onlineCount, activeUsers.length, 1);
  return { onlineCount: displayOnlineCount, activeUsers };
}
