import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';
import { calculateStudyStreak, getISTDateString } from '@/types/ypt';

export interface UserStudyStats {
  todaySeconds: number;
  totalSeconds: number;
  todaySessionsCount: number;
  streak: number;
  loading: boolean;
  refetch: () => Promise<void>;
}

export function formatStudyTime(totalSecs: number): { formatted: string; hours: number; minutes: number } {
  if (!totalSecs || totalSecs <= 0) return { formatted: '0h 0m', hours: 0, minutes: 0 };
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  if (h === 0) return { formatted: `${m}m`, hours: 0, minutes: m };
  return { formatted: `${h}h ${m}m`, hours: h, minutes: m };
}

export function useUserStudyStats(): UserStudyStats {
  const { session, deviceId } = useProfile();
  const [todaySeconds, setTodaySeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [todaySessionsCount, setTodaySessionsCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
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
        setTodaySeconds(0);
        setTotalSeconds(0);
        setTodaySessionsCount(0);
        setStreak(0);
        setLoading(false);
        return;
      }

      // 2. Fetch completed sessions
      const { data: sessions, error } = await (supabase as any)
        .from('study_sessions')
        .select('started_at, duration_seconds')
        .eq('ypt_user_id', yptUserId)
        .eq('status', 'completed')
        .order('started_at', { ascending: false });

      if (error || !sessions) {
        setLoading(false);
        return;
      }

      // Calculate today's date in IST with 3:00 AM cutoff (YYYY-MM-DD)
      const todayDateStr = getISTDateString(new Date());

      let todaySecs = 0;
      let totalSecs = 0;
      let todayCount = 0;

      for (const row of sessions) {
        const sec = Number(row.duration_seconds) || 0;
        totalSecs += sec;

        if (row.started_at) {
          const rowDayStr = getISTDateString(row.started_at);
          if (rowDayStr === todayDateStr) {
            todaySecs += sec;
            todayCount += 1;
          }
        }
      }

      setTodaySeconds(todaySecs);
      setTotalSeconds(totalSecs);
      setTodaySessionsCount(todayCount);

      const dayMap: Record<string, number> = {};
      for (const row of sessions) {
        if (!row.started_at) continue;
        const dayKey = getISTDateString(row.started_at);
        dayMap[dayKey] = (dayMap[dayKey] || 0) + (Number(row.duration_seconds) || 0);
      }
      const streakResult = calculateStudyStreak(dayMap);
      setStreak(streakResult.streak);
    } catch (err) {
      console.warn('[useUserStudyStats] error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }, [session, deviceId]);

  useEffect(() => {
    fetchStats();

    const onSessionEnd = () => fetchStats();
    window.addEventListener('study-session-ended', onSessionEnd);

    const channel = supabase
      .channel('realtime:study_stats')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'study_sessions' },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('study-session-ended', onSessionEnd);
      supabase.removeChannel(channel);
    };
  }, [fetchStats]);

  return {
    todaySeconds,
    totalSeconds,
    todaySessionsCount,
    streak,
    loading,
    refetch: fetchStats,
  };
}
