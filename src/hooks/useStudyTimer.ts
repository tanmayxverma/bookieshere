import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TIMER_STORAGE_KEY, type TimerState } from '@/types/ypt';

const THREE_HOURS = 3 * 60 * 60;

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
  const intervalRef = useRef<number | null>(null);

  const calcElapsed = useCallback((state: TimerState | null) => {
    if (!state) return 0;
    const now = state.pausedAt || Date.now();
    return Math.max(0, Math.floor((now - state.startedAt - state.totalPausedMs) / 1000));
  }, []);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (timerState && !timerState.pausedAt) {
      const tick = () => {
        const elapsed = calcElapsed(timerState);
        setElapsedSeconds(elapsed);
        if (elapsed >= THREE_HOURS && !showInactivityModal) {
          setShowInactivityModal(true);
        }
      };
      tick();
      intervalRef.current = window.setInterval(tick, 1000);
    } else {
      setElapsedSeconds(calcElapsed(timerState));
    }

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerState, calcElapsed, showInactivityModal]);

  const startSession = async (subject: string) => {
    if (!yptUserId) return;
    const { data } = await (supabase as any)
      .from('study_sessions')
      .insert({ ypt_user_id: yptUserId, subject, status: 'active' })
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
    if (!timerState) return;
    const duration = calcElapsed(timerState);
    await (supabase as any)
      .from('study_sessions')
      .update({
        ended_at: new Date().toISOString(),
        duration_seconds: duration,
        status: 'completed',
      })
      .eq('id', timerState.sessionId);
    saveTimerState(null);
    setTimerStateLocal(null);
    setElapsedSeconds(0);
    setShowInactivityModal(false);
  };

  const dismissInactivity = () => setShowInactivityModal(false);

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
    dismissInactivity,
  };
}
