import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useYPTUser } from './useYPTUser';
import { calculateStudyStreak, getISTDateString, getISTStudyDayString } from '@/types/ypt';

const CACHE_KEY = 'bookie_user_streak';

export function useUserStreak() {
  const { user } = useYPTUser();
  const [streak, setStreak] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw).streak || 0 : 0;
    } catch {
      return 0;
    }
  });
  const [longestStreak, setLongestStreak] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw).longestStreak || 0 : 0;
    } catch {
      return 0;
    }
  });
  const [todaySeconds, setTodaySeconds] = useState(0);
  const [isAliveToday, setIsAliveToday] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshStreak = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await (supabase as any)
        .from('study_sessions')
        .select('started_at, duration_seconds, status')
        .eq('ypt_user_id', user.id)
        .eq('status', 'completed');

      if (error) throw error;

      const dayMap: Record<string, number> = {};
      const todayKey = getISTStudyDayString();
      let todaySum = 0;

      (data || []).forEach((row: any) => {
        if (!row.started_at) return;
        const dayKey = getISTDateString(row.started_at);
        const dur = row.duration_seconds || 0;
        dayMap[dayKey] = (dayMap[dayKey] || 0) + dur;
        if (dayKey === todayKey) {
          todaySum += dur;
        }
      });

      // Also check if an active timer is running in localStorage
      let liveElapsed = 0;
      try {
        const rawTimer = localStorage.getItem('ypt_active_timer');
        if (rawTimer) {
          const parsed = JSON.parse(rawTimer);
          if (parsed && !parsed.pausedAt && parsed.startTime) {
            liveElapsed = Math.floor((Date.now() - parsed.startTime) / 1000);
          }
        }
      } catch {}

      const calculated = calculateStudyStreak(dayMap, liveElapsed);
      setStreak(calculated.streak);
      setLongestStreak(calculated.longestStreak);
      setTodaySeconds(todaySum + liveElapsed);
      setIsAliveToday(calculated.isAliveToday);

      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            streak: calculated.streak,
            longestStreak: calculated.longestStreak,
            updatedAt: Date.now(),
          })
        );
      } catch {}
    } catch (err) {
      console.warn('Could not compute streak:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshStreak();
  }, [refreshStreak]);

  // Refresh streak on session end or when tab becomes visible
  useEffect(() => {
    if (!user?.id) return;

    const onSessionEnd = () => refreshStreak();
    window.addEventListener('study-session-ended', onSessionEnd);

    let lastFetched = Date.now();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastFetched > 60_000) {
        lastFetched = Date.now();
        refreshStreak();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('study-session-ended', onSessionEnd);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [user?.id, refreshStreak]);

  return {
    streak,
    longestStreak,
    todaySeconds,
    isAliveToday,
    loading,
    refetch: refreshStreak,
  };
}
