import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';
import { getISTDateString } from '@/types/ypt';

const STREAK_CACHE_KEY = 'bookie_user_streak';

/**
 * Calculates current contiguous study streak in days based on 3:00 AM IST cutoff.
 * If user studied today, streak is counted from today backwards.
 * If user hasn't studied yet today, streak is checked from yesterday backwards so active streaks aren't prematurely broken.
 * If user missed yesterday and today, streak is 0.
 */
export function calculateStreak(sessionDates: (string | Date)[]): number {
  if (!sessionDates || sessionDates.length === 0) return 0;

  const uniqueDays = new Set<string>();
  for (const dateVal of sessionDates) {
    if (!dateVal) continue;
    uniqueDays.add(getISTDateString(dateVal));
  }

  if (uniqueDays.size === 0) return 0;

  const todayStr = getISTDateString(new Date());
  const [y, m, d] = todayStr.split('-').map(Number);
  const check = new Date(y, m - 1, d);

  const toStr = (date: Date) => {
    const yr = date.getFullYear();
    const mo = String(date.getMonth() + 1).padStart(2, '0');
    const da = String(date.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${da}`;
  };

  let curStreak = 0;
  if (uniqueDays.has(todayStr)) {
    curStreak = 1;
    check.setDate(check.getDate() - 1);
  } else {
    // Check if they studied yesterday
    check.setDate(check.getDate() - 1);
    if (uniqueDays.has(toStr(check))) {
      curStreak = 1;
      check.setDate(check.getDate() - 1);
    } else {
      return 0;
    }
  }

  while (uniqueDays.has(toStr(check))) {
    curStreak++;
    check.setDate(check.getDate() - 1);
  }

  return curStreak;
}

export function useUserStreak() {
  const { session, deviceId } = useProfile();
  const [streak, setStreak] = useState<number>(() => {
    try {
      const cached = localStorage.getItem(STREAK_CACHE_KEY);
      return cached !== null ? parseInt(cached, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [loading, setLoading] = useState(true);

  const fetchStreak = useCallback(async () => {
    try {
      let yptUserId: string | null = null;

      // 1. Resolve YPT user record for authenticated user or device
      if (session?.user?.id) {
        const { data: userByAuth } = await (supabase as any)
          .from('ypt_users')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();
        if (userByAuth) yptUserId = userByAuth.id;
      }

      if (!yptUserId && deviceId) {
        const { data: userByDevice } = await (supabase as any)
          .from('ypt_users')
          .select('id, user_id')
          .eq('device_id', deviceId)
          .maybeSingle();
        if (userByDevice) {
          yptUserId = userByDevice.id;
          // Associate user_id if logged in
          if (session?.user?.id && !userByDevice.user_id) {
            (supabase as any)
              .from('ypt_users')
              .update({ user_id: session.user.id })
              .eq('id', userByDevice.id)
              .then(() => {});
          }
        }
      }

      if (!yptUserId) {
        setStreak(0);
        try { localStorage.setItem(STREAK_CACHE_KEY, '0'); } catch {}
        setLoading(false);
        return;
      }

      // 2. Fetch completed study sessions
      const { data: sessions, error } = await (supabase as any)
        .from('study_sessions')
        .select('started_at')
        .eq('ypt_user_id', yptUserId)
        .eq('status', 'completed')
        .order('started_at', { ascending: false })
        .limit(400);

      if (error || !sessions) {
        setLoading(false);
        return;
      }

      const calculated = calculateStreak(sessions.map((s: any) => s.started_at));
      setStreak(calculated);
      try { localStorage.setItem(STREAK_CACHE_KEY, calculated.toString()); } catch {}
    } catch (err) {
      console.warn('[useUserStreak] error calculating streak:', err);
    } finally {
      setLoading(false);
    }
  }, [session, deviceId]);

  useEffect(() => {
    fetchStreak();

    // Listen for local study-session-ended event
    const onSessionEnd = () => fetchStreak();
    window.addEventListener('study-session-ended', onSessionEnd);

    // Subscribe to realtime database changes on study_sessions
    const channel = supabase
      .channel('realtime:user_streak')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'study_sessions' },
        () => {
          fetchStreak();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('study-session-ended', onSessionEnd);
      supabase.removeChannel(channel);
    };
  }, [fetchStreak]);

  return { streak, loading, refetch: fetchStreak };
}
