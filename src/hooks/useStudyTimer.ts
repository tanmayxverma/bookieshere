import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TIMER_STORAGE_KEY, type TimerState, type TimerMode } from '@/types/ypt';

const THREE_HOURS = 3 * 60 * 60;
const HEARTBEAT_INTERVAL = 120_000; // 120s — safe since cleanup_stale_sessions now allows 180s of silence (egress SQL pack, Nov 2026). Was 60s, halved again for log ingestion (Nov 2026)
const INACTIVITY_COUNTDOWN = 15; // seconds
const STALE_CLEANUP_INTERVAL = 5 * 60_000; // 5 min
/** Wall-clock vs monotonic-clock divergence (ms) treated as impossible */
const CLOCK_JUMP_TOLERANCE_MS = 120_000;

function getTimerState(): TimerState | null {
  const raw = localStorage.getItem(TIMER_STORAGE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function saveTimerState(state: TimerState | null) {
  if (state) localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
  else localStorage.removeItem(TIMER_STORAGE_KEY);
}

/** Subtle chime when a countdown hits zero */
function playChime() {
  try {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    [880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.28;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.18, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.3);
    });
    setTimeout(() => { try { ctx.close(); } catch {} }, 1500);
  } catch {}
}

function notify(title: string, body: string) {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  } catch {}
}

export function useStudyTimer(yptUserId: string | undefined) {
  const [timerState, setTimerStateLocal] = useState<TimerState | null>(getTimerState);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [inactivityCountdown, setInactivityCountdown] = useState(INACTIVITY_COUNTDOWN);
  const [countdownDone, setCountdownDone] = useState<null | { phase: 'work' | 'break'; breakSeconds: number }>(null);
  const intervalRef = useRef<number | null>(null);
  const heartbeatRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  const doneFiredRef = useRef(false);

  // ---- Monotonic clock guard (anti clock-tampering / clock drift) ----
  // Anchors are re-established whenever the timer state changes (start/pause/resume/reload).
  const anchorRef = useRef<{ wall: number; mono: number; base: number } | null>(null);
  const driftMsRef = useRef(0);      // wall-clock time we refuse to count
  const flaggedRef = useRef(false);  // reported to server, never shown to the student

  const resetAnchor = useCallback((state: TimerState | null) => {
    if (!state || state.pausedAt) { anchorRef.current = null; return; }
    const raw = Date.now() - state.startedAt - state.totalPausedMs - driftMsRef.current;
    // Clock skew: the row's started_at comes from the server, so a client clock
    // running behind makes the elapsed time negative and freezes the display at
    // 00:00:00. Absorb that constant offset into the drift so the very first
    // tick starts moving. This is skew, not tampering — do NOT flag it.
    if (raw < 0) driftMsRef.current += raw;
    const base = Math.max(0, Date.now() - state.startedAt - state.totalPausedMs - driftMsRef.current);
    anchorRef.current = { wall: Date.now(), mono: performance.now(), base };
  }, []);

  const calcElapsed = useCallback((state: TimerState | null) => {
    if (!state) return 0;
    if (state.accumulatedSeconds !== undefined) {
      return Math.max(0, Math.floor(state.accumulatedSeconds));
    }
    if (state.pausedAt) {
      return Math.max(0, Math.floor((state.pausedAt - state.startedAt - state.totalPausedMs - driftMsRef.current) / 1000));
    }
    const wallElapsedMs = Date.now() - state.startedAt - state.totalPausedMs - driftMsRef.current;
    const a = anchorRef.current;
    if (a) {
      const monoElapsedMs = a.base + (performance.now() - a.mono);
      const divergence = wallElapsedMs - monoElapsedMs;
      if (Math.abs(divergence) > CLOCK_JUMP_TOLERANCE_MS) {
        driftMsRef.current += divergence;
        flaggedRef.current = true;
        return Math.max(0, Math.floor(monoElapsedMs / 1000));
      }
    }
    return Math.max(0, Math.floor(wallElapsedMs / 1000));
  }, []);

  /** Server-authoritative end: the edge function recomputes duration from DB timestamps. */
  const endSessionNow = useCallback(async (state: TimerState | null) => {
    if (!state) return;
    const clientDuration = calcElapsed(state);
    // Final heartbeat so the server has an accurate "last known alive" timestamp
    try {
      await (supabase as any)
        .from('study_sessions')
        .update({
          status: 'completed',
          ended_at: new Date(state.lastActiveAt || Date.now()).toISOString(),
          last_heartbeat: new Date(state.lastActiveAt || Date.now()).toISOString(),
          duration_seconds: clientDuration,
        })
        .eq('id', state.sessionId);
    } catch {}
    try {
      await supabase.functions.invoke('end-study-session', {
        body: {
          sessionId: state.sessionId,
          clientDuration,
          clientFlagged: flaggedRef.current,
        },
      });
    } catch {
      // Offline / function unreachable — cleanup_stale_sessions will finalise it server-side.
    }
    driftMsRef.current = 0;
    flaggedRef.current = false;
    anchorRef.current = null;
    doneFiredRef.current = false;
    saveTimerState(null);
    setTimerStateLocal(null);
    setElapsedSeconds(0);
    setShowInactivityModal(false);
    setInactivityCountdown(INACTIVITY_COUNTDOWN);
    if (countdownRef.current) clearInterval(countdownRef.current);
    try {
      window.dispatchEvent(new CustomEvent('study-session-ended'));
    } catch {}
  }, [calcElapsed]);

  // Latest timer state in a ref, so the heartbeat effect below does NOT
  // have to depend on timerState itself.
  const timerStateRef = useRef<TimerState | null>(null);
  useEffect(() => { timerStateRef.current = timerState; }, [timerState]);

  // Heartbeat: last_heartbeat is the server's source of truth for real duration.
  // This effect must depend ONLY on sessionId + paused, never on the whole
  // timerState object: the 1s tick replaces timerState every second, so the
  // old [timerState] dependency tore down and re-ran this effect every
  // second — and sendHeartbeat() on every run turned the intended 60s
  // heartbeat into a ~1 PATCH/second loop per studying user. Each PATCH
  // also fired realtime refetches in the streak/stats hooks, multiplying
  // into ~57k study_sessions requests/day (log-ingestion blowout, Nov 2026).
  const heartbeatSessionId = timerState?.sessionId;
  const heartbeatPaused = !!timerState?.pausedAt;
  useEffect(() => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    if (!heartbeatSessionId || heartbeatPaused) return;

    const sendHeartbeat = async () => {
      const state = timerStateRef.current;
      if (!state || state.pausedAt || state.sessionId !== heartbeatSessionId) return;
      await (supabase as any)
        .from('study_sessions')
        .update({
          last_heartbeat: new Date().toISOString(),
          duration_seconds: calcElapsed(state),
        })
        .eq('id', heartbeatSessionId);
    };
    sendHeartbeat();
    heartbeatRef.current = window.setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    return () => { if (heartbeatRef.current) clearInterval(heartbeatRef.current); };
  }, [heartbeatSessionId, heartbeatPaused, calcElapsed]);

  // Re-anchor the monotonic guard on every state transition
  useEffect(() => { resetAnchor(timerState); }, [timerState, resetAnchor]);

  // Periodically finalise stale sessions so totals never include dangling rows
  useEffect(() => {
    if (!yptUserId) return;
    const run = () => { (supabase as any).rpc('cleanup_stale_sessions'); };
    run();
    const id = window.setInterval(run, STALE_CLEANUP_INTERVAL);
    return () => clearInterval(id);
  }, [yptUserId]);

  // Strict Anti-Cheat Timer tick:
  // ONLY collects time while the site is actively ON or working in background tab.
  // If tab was closed or computer slept (gap >= 45s), automatically closes the session without adding fake time.
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (timerState && !timerState.pausedAt) {
      const tick = () => {
        const now = Date.now();
        const lastActive = timerState.lastActiveAt || timerState.startedAt;
        const gapMs = now - lastActive;

        // If site was closed or inactive for >= 45s, auto-end session immediately
        if (gapMs >= 45_000) {
          endSessionNow(timerState);
          return;
        }

        // Add real active seconds (capped at gapMs to handle background tab throttling)
        const deltaSec = Math.max(0, gapMs / 1000);
        const currentAcc = timerState.accumulatedSeconds ?? calcElapsed(timerState);
        const nextAcc = currentAcc + deltaSec;

        const updatedState: TimerState = {
          ...timerState,
          lastActiveAt: now,
          accumulatedSeconds: nextAcc,
        };

        saveTimerState(updatedState);
        setTimerStateLocal(updatedState);

        const elapsed = Math.floor(nextAcc);
        setElapsedSeconds(elapsed);

        // Countdown completion
        if (
          timerState.mode === 'countdown' &&
          timerState.targetSeconds &&
          elapsed >= timerState.targetSeconds &&
          !doneFiredRef.current
        ) {
          doneFiredRef.current = true;
          playChime();
          const phase = timerState.phase === 'break' ? 'break' : 'work';
          notify(
            phase === 'break' ? 'Break over' : 'Session complete',
            phase === 'break' ? 'Back to work — start your next block.' : 'Nice work. Time for a break.',
          );
          setCountdownDone({ phase, breakSeconds: timerState.breakSeconds || 300 });
          endSessionNow(updatedState);
          return;
        }

        if (elapsed >= THREE_HOURS && !showInactivityModal) {
          setShowInactivityModal(true);
          setInactivityCountdown(INACTIVITY_COUNTDOWN);
        }
      };

      intervalRef.current = window.setInterval(tick, 1000);
    } else {
      setElapsedSeconds(calcElapsed(timerState));
    }

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerState, calcElapsed, showInactivityModal, endSessionNow]);

  // Inactivity countdown - auto-end after 15 seconds
  useEffect(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);

    if (showInactivityModal && timerState) {
      setInactivityCountdown(INACTIVITY_COUNTDOWN);
      countdownRef.current = window.setInterval(() => {
        setInactivityCountdown((prev) => {
          if (prev <= 1) {
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
      if (state) endSessionNow(state);
    };

    window.addEventListener('pagehide', fireEnd);
    window.addEventListener('beforeunload', fireEnd);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('pagehide', fireEnd);
      window.removeEventListener('beforeunload', fireEnd);
      window.removeEventListener('offline', handleOffline);
    };
  }, [endSessionNow]);

  // On mount: reconcile the cached timer with the DB (source of truth).
  // If the browser was closed or inactive for > 45 seconds, finalize it immediately — do not resume!
  useEffect(() => {
    const state = getTimerState();
    if (state) {
      const lastActive = state.lastActiveAt || state.startedAt;
      const gapMs = Date.now() - lastActive;

      if (gapMs >= 45_000) {
        // Site was closed/off. Auto-finalize at the exact time it went off.
        const verifiedSeconds = Math.max(
          0,
          Math.floor(state.accumulatedSeconds ?? (lastActive - state.startedAt - state.totalPausedMs) / 1000)
        );
        (supabase as any)
          .from('study_sessions')
          .update({
            status: 'completed',
            ended_at: new Date(lastActive).toISOString(),
            last_heartbeat: new Date(lastActive).toISOString(),
            duration_seconds: verifiedSeconds,
          })
          .eq('id', state.sessionId)
          .then(() => {
            try { window.dispatchEvent(new CustomEvent('study-session-ended')); } catch {}
          });
        saveTimerState(null);
        setTimerStateLocal(null);
        setElapsedSeconds(0);
        return;
      }
    }

    if (state && yptUserId) {
      (supabase as any)
        .from('study_sessions')
        .select('status, started_at')
        .eq('id', state.sessionId)
        .maybeSingle()
        .then(({ data }: any) => {
          if (!data || data.status !== 'active') {
            saveTimerState(null);
            setTimerStateLocal(null);
            setElapsedSeconds(0);
            return;
          }
          // Realign the local start time to the server's started_at if drift is detected
          const serverStart = new Date(data.started_at).getTime();
          if (Math.abs(serverStart - state.startedAt) > 5000) {
            const fixed = { ...state, startedAt: serverStart };
            saveTimerState(fixed);
            setTimerStateLocal(fixed);
          }
        });
    }
  }, [yptUserId]);

  const startSession = async (
    subject: string,
    opts?: { mode?: TimerMode; targetSeconds?: number; breakSeconds?: number; phase?: 'work' | 'break' },
  ) => {
    if (!yptUserId) return;
    await (supabase as any).rpc('cleanup_stale_sessions');
    if ('Notification' in window && Notification.permission === 'default') {
      try { Notification.requestPermission(); } catch {}
    }

    const { data, error } = await (supabase as any)
      .from('study_sessions')
      .insert({ ypt_user_id: yptUserId, subject, status: 'active', last_heartbeat: new Date().toISOString() })
      .select('id, started_at')
      .single();
    if (error) {
      console.error('[studyTimer] failed to start session:', error);
      throw error;
    }
    if (data) {
      driftMsRef.current = 0;
      flaggedRef.current = false;
      doneFiredRef.current = false;
      const now = Date.now();
      const state: TimerState = {
        sessionId: data.id,
        subject,
        startedAt: new Date(data.started_at).getTime(),
        pausedAt: null,
        totalPausedMs: 0,
        yptUserId,
        mode: opts?.mode || 'stopwatch',
        targetSeconds: opts?.targetSeconds,
        breakSeconds: opts?.breakSeconds,
        phase: opts?.phase || 'work',
        lastActiveAt: now,
        accumulatedSeconds: 0,
      };
      saveTimerState(state);
      setTimerStateLocal(state);
      setElapsedSeconds(0);
      setCountdownDone(null);
    }
  };

  const pauseSession = () => {
    if (!timerState || timerState.pausedAt) return;
    const now = Date.now();
    const lastActive = timerState.lastActiveAt || timerState.startedAt;
    const gapMs = Math.min(now - lastActive, 45_000);
    const acc = (timerState.accumulatedSeconds ?? 0) + Math.max(0, gapMs / 1000);
    const updated: TimerState = {
      ...timerState,
      pausedAt: now,
      lastActiveAt: now,
      accumulatedSeconds: acc,
    };
    saveTimerState(updated);
    setTimerStateLocal(updated);
  };

  const resumeSession = () => {
    if (!timerState || !timerState.pausedAt) return;
    const now = Date.now();
    const pauseDuration = Math.max(0, now - timerState.pausedAt);
    const updated: TimerState = {
      ...timerState,
      pausedAt: null,
      totalPausedMs: timerState.totalPausedMs + pauseDuration,
      lastActiveAt: now,
    };
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

  const dismissCountdownDone = () => setCountdownDone(null);

  /** Start the break block after a completed pomodoro work block */
  const startBreak = async (subject: string, breakSeconds: number) => {
    setCountdownDone(null);
    await startSession(subject, {
      mode: 'countdown',
      targetSeconds: breakSeconds,
      breakSeconds,
      phase: 'break',
    });
  };

  const targetSeconds = timerState?.targetSeconds;
  const remainingSeconds = timerState?.mode === 'countdown' && targetSeconds
    ? Math.max(0, targetSeconds - elapsedSeconds)
    : null;

  return {
    isActive: !!timerState,
    isPaused: !!timerState?.pausedAt,
    subject: timerState?.subject || null,
    sessionId: timerState?.sessionId || null,
    mode: (timerState?.mode || 'stopwatch') as TimerMode,
    phase: timerState?.phase || 'work',
    targetSeconds: targetSeconds ?? null,
    remainingSeconds,
    elapsedSeconds,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    showInactivityModal,
    inactivityCountdown,
    dismissInactivity,
    countdownDone,
    dismissCountdownDone,
    startBreak,
  };
}
