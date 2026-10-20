import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ActiveStudyUser } from '@/types/ypt';

export function useYPTPresence(userId?: string, userName?: string, jeeYear?: string, currentSubject?: string) {
  const [onlineCount, setOnlineCount] = useState(1);
  const [activeUsers, setActiveUsers] = useState<ActiveStudyUser[]>([]);
  const channelRef = useRef<any>(null);
  const lastTrackedRef = useRef<{ time: number; key: string }>({ time: 0, key: '' });
  const pendingTrackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const performTrack = useCallback(async (channel: any, key: string, payload: { user_id: string; name: string; jee_year: string; subject?: string }) => {
    const now = Date.now();
    const payloadStr = JSON.stringify(payload);
    // Throttle presence updates (5s minimum) as requested by amendment 1
    if (now - lastTrackedRef.current.time < 5000 && lastTrackedRef.current.key === payloadStr) {
      return;
    }

    if (now - lastTrackedRef.current.time < 5000) {
      if (pendingTrackTimer.current) clearTimeout(pendingTrackTimer.current);
      pendingTrackTimer.current = setTimeout(async () => {
        try {
          await channel.track(payload);
          lastTrackedRef.current = { time: Date.now(), key: payloadStr };
        } catch {}
      }, 5000 - (now - lastTrackedRef.current.time));
      return;
    }

    try {
      await channel.track(payload);
      lastTrackedRef.current = { time: now, key: payloadStr };
    } catch {}
  }, []);

  useEffect(() => {
    const presenceKey = userId || 'anon-' + Math.random().toString(36).slice(2);

    const presenceChannel = supabase.channel('ypt_online', {
      config: { presence: { key: presenceKey } },
    });
    channelRef.current = presenceChannel;

    const syncPresence = () => {
      const state = presenceChannel.presenceState();
      const count = Object.keys(state).length;
      setOnlineCount(Math.max(count, 1));

      // Derive active users directly from presence state without hitting Postgres
      const active: ActiveStudyUser[] = [];
      Object.values(state).forEach((presences: any) => {
        presences.forEach((p: any) => {
          if (p.subject) {
            active.push({
              name: p.name || 'Aspirant',
              subject: p.subject,
              jee_focus_year: p.jee_year || '',
            });
          }
        });
      });
      setActiveUsers(active);
    };

    const trackPayload = {
      user_id: userId || presenceKey,
      name: userName || 'Visitor',
      jee_year: jeeYear || '',
      subject: currentSubject || '',
    };

    presenceChannel
      .on('presence', { event: 'sync' }, syncPresence)
      .on('presence', { event: 'join' }, syncPresence)
      .on('presence', { event: 'leave' }, syncPresence)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await performTrack(presenceChannel, presenceKey, trackPayload);
        }
      });

    let untrackTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleVisibility = async () => {
      if (document.visibilityState === 'hidden') {
        untrackTimeout = setTimeout(async () => {
          try { await presenceChannel.untrack(); } catch {}
        }, 30000);
      } else {
        if (untrackTimeout) {
          clearTimeout(untrackTimeout);
          untrackTimeout = null;
        }
        await performTrack(presenceChannel, presenceKey, trackPayload);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (pendingTrackTimer.current) clearTimeout(pendingTrackTimer.current);
      if (untrackTimeout) clearTimeout(untrackTimeout);
      document.removeEventListener('visibilitychange', handleVisibility);
      supabase.removeChannel(presenceChannel);
      channelRef.current = null;
    };
  }, [userId, userName, jeeYear, currentSubject, performTrack]);

  return { onlineCount, activeUsers };
}
