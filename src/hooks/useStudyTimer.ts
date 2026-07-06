import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TIMER_STORAGE_KEY, type TimerState } from '@/types/ypt';

const THREE_HOURS = 3 * 60 * 60;
const HEARTBEAT_INTERVAL = 30_000; // 30s
const INACTIVITY_COUNTDOWN = 15; // seconds

function getTimerState(): TimerState | null {
  const raw = localStorage.getItem(TIMER_STORAGE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function saveTimerState(state: TimerState | null) {
  if (state) localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
  else localStorage.removeItem(TIMER_STORAGE_KEY);
}

export function useStudyTimer(yptUserId: string | undefined) {
  const [timerState, setTimerStateLocal] = useState<TimerState | null>(getTimerState);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [inactivityCountdown, setInactivityCountdown] = useState(INACTIVITY_COUNTDOWN);
  const intervalRef = useRef<number | null>(null);
  const heartbeatRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  const calcElapsed = useCallback((state: TimerState | null) => {
    if (!state) return 0;
    const now = state.pausedAt || Date.now();
    return Math.max(0, Math.floor((now - state.startedAt - state.totalPausedMs) / 1000));
  }, []);

  // End session helper (used by auto-stop and manual end)
  const endSessionNow = useCallback(async (state: TimerState | null) => {
    if (!state) return;
    const duration = Math.max(0, Math.floor(((state.pausedAt || Date.now()) - state.startedAt - state.totalPausedMs) / 1000));
    await (supabase as any)
      .from('study_sessions')
      .update({
        ended_at: new Date().toISOString(),
        duration_seconds: duration,
        status: 'completed',
      })
      .eq('id', state.sessionId);
    saveTimerState(null);
    setTimerStateLocal(null);
    setElapsedSeconds(0);
    setShowInactivityModal(false);
    setInactivityCountdown(INACTIVITY_COUNTDOWN);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  // Heartbeat: periodically update last_heartbeat + duration in DB
  useEffect(() => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);

    if (timerState && !timerState.pausedAt) {
      const sendHeartbeat = async () => {
        const duration = calcElapsed(timerState);
        await (supabase as any)
          .from('study_sessions')
          .update({
            last_heartbeat: new Date().toISOString(),
            duration_seconds: duration,
          })
          .eq('id', timerState.sessionId);
      };
      sendHeartbeat(); // immediate
      heartbeatRef.current = window.setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
    }

    return () => { if (heartbeatRef.current) clearInterval(heartbeatRef.current); };
  }, [timerState, calcElapsed]);

  // Timer tick
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (timerState && !timerState.pausedAt) {
      const tick = () => {
        const elapsed = calcElapsed(timerState);
        setElapsedSeconds(elapsed);
        if (elapsed >= THREE_HOURS && !showInactivityModal) {
          setShowInactivityModal(true);
          setInactivityCountdown(INACTIVITY_COUNTDOWN);
        }
      };
      tick();
      intervalRef.current = window.setInterval(tick, 1000);
    } else {
      setElapsedSeconds(calcElapsed(timerState));
    }

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerState, calcElapsed, showInactivityModal]);

  // Inactivity countdown - auto-end after 15 seconds
  useEffect(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);

    if (showInactivityModal && timerState) {
      setInactivityCountdown(INACTIVITY_COUNTDOWN);
      countdownRef.current = window.setInterval(() => {
        setInactivityCountdown((prev) => {
          if (prev <= 1) {
            // Auto-end session
            endSessionNow(timerState);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [showInactivityModal, timerState, endSessionNow]);

  // Reliable end on real tab/app close via sendBeacon → edge function.
  // Note: visibilitychange alone is NOT treated as end — user can switch tabs.
  useEffect(() => {
    const fireEnd = () => {
      const state = getTimerState();
      if (!state) return;
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/end-study-session`;
      const body = new Blob(
        [JSON.stringify({ sessionId: state.sessionId })],
        { type: 'application/json' },
      );
      try { navigator.sendBeacon(url, body); } catch {}
      saveTimerState(null);
    };

    const handleOffline = () => {
      const state = getTimerState();
      if (state) {
        endSessionNow(state);
      }
    };

    // pagehide fires reliably on mobile Safari + tab close; beforeunload as fallback
    window.addEventListener('pagehide', fireEnd);
    window.addEventListener('beforeunload', fireEnd);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('pagehide', fireEnd);
      window.removeEventListener('beforeunload', fireEnd);
      window.removeEventListener('offline', handleOffline);
    };
  }, [endSessionNow]);

  // On mount: check if there's a stale session from a previous tab close
  useEffect(() => {
    const state = getTimerState();
    if (state && yptUserId) {
      // Check if session is still active in DB
      (supabase as any)
        .from('study_sessions')
        .select('status')
        .eq('id', state.sessionId)
        .maybeSingle()
        .then(({ data }: any) => {
          if (!data || data.status !== 'active') {
            // Session was already ended (by heartbeat cleanup or beforeunload)
            saveTimerState(null);
            setTimerStateLocal(null);
            setElapsedSeconds(0);
          }
        });
    }
  }, [yptUserId]);

  const startSession = async (subject: string) => {
    if (!yptUserId) return;
    // First, clean up stale sessions
    await (supabase as any).rpc('cleanup_stale_sessions');
    
    const { data } = await (supabase as any)
      .from('study_sessions')
      .insert({ ypt_user_id: yptUserId, subject, status: 'active', last_heartbeat: new Date().toISOString() })
      .select()
      .single();
    if (data) {
      const state: TimerState = {
        sessionId: data.id,
        subject,
        startedAt: Date.now(),
        pausedAt: null,
        totalPausedMs: 0,
        yptUserId,
      };
      saveTimerState(state);
      setTimerStateLocal(state);
    }
  };

  const pauseSession = () => {
    if (!timerState || timerState.pausedAt) return;
    const updated = { ...timerState, pausedAt: Date.now() };
    saveTimerState(updated);
    setTimerStateLocal(updated);
  };

  const resumeSession = () => {
    if (!timerState || !timerState.pausedAt) return;
    const pauseDuration = Date.now() - timerState.pausedAt;
    const updated = { ...timerState, pausedAt: null, totalPausedMs: timerState.totalPausedMs + pauseDuration };
    saveTimerState(updated);
    setTimerStateLocal(updated);
  };

  const endSession = async () => {
    await endSessionNow(timerState);
  };

  const dismissInactivity = () => {
    setShowInactivityModal(false);
    setInactivityCountdown(INACTIVITY_COUNTDOWN);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  return {
    isActive: !!timerState,
    isPaused: !!timerState?.pausedAt,
    subject: timerState?.subject || null,
    sessionId: timerState?.sessionId || null,
    elapsedSeconds,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    showInactivityModal,
    inactivityCountdown,
    dismissInactivity,
  };
}
