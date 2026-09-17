import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  SUBJECTS, formatTime, formatHours, getISTTodayStartUTC, getISTDate, getISTDateString,
  POMODORO_PRESETS, type TimerMode, type YPTUser
} from '@/types/ypt';
import { supabase } from '@/integrations/supabase/client';
import { calculateStreak } from '@/hooks/useUserStreak';
import { FormulaFlashcards } from '@/components/FormulaFlashcards';
import {
  Play, Pause, Square, Clock, TrendingUp, Flame, Zap, Maximize2, Minimize2,
  Pencil, Check, Target, Plus, ListTodo, ArrowRight, BarChart3,
  CalendarDays, Sparkles, ChevronRight, RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimerControls {
  isActive: boolean;
  isPaused: boolean;
  subject: string | null;
  elapsedSeconds: number;
  mode: TimerMode;
  phase: 'work' | 'break';
  targetSeconds: number | null;
  remainingSeconds: number | null;
  startSession: (
    subject: string,
    opts?: { mode?: TimerMode; targetSeconds?: number; breakSeconds?: number; phase?: 'work' | 'break' },
  ) => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => Promise<void>;
  showInactivityModal: boolean;
  inactivityCountdown: number;
  dismissInactivity: () => void;
  countdownDone: null | { phase: 'work' | 'break'; breakSeconds: number };
  dismissCountdownDone: () => void;
  startBreak: (subject: string, breakSeconds: number) => Promise<void>;
}

interface Props {
  user: YPTUser;
  timer: TimerControls;
  onNavigate?: (tab: 'stats' | 'rooms' | 'tasks' | 'leaderboard') => void;
}

const GOALS_STORAGE_KEY = 'ypt_study_goals';

function getGoals(): { daily: number; weekly: number } {
  try {
    const raw = localStorage.getItem(GOALS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { daily: 6, weekly: 35 };
}

function saveGoals(g: { daily: number; weekly: number }) {
  localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(g));
}

const MOTIVATIONAL_QUOTES = [
  "Discipline > Motivation",
  "AIR 1 is built here",
  "Consistency beats intensity",
  "Every second counts",
  "Focus is your superpower",
  "The grind never lies",
  "Silence the noise. Study.",
];

interface SubjectMeta {
  name: string;
  icon: string;
  color: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
}

const SUBJECT_CONFIG: Record<string, SubjectMeta> = {
  Physics: {
    name: 'Physics',
    icon: '⚡',
    color: '#0062ff',
    borderColor: 'border-blue-500',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/60',
    badgeText: 'text-blue-600 dark:text-blue-400',
  },
  Chemistry: {
    name: 'Chemistry',
    icon: '🧪',
    color: '#f59e0b',
    borderColor: 'border-amber-500',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/60',
    badgeText: 'text-amber-600 dark:text-amber-400',
  },
  Mathematics: {
    name: 'Mathematics',
    icon: '📐',
    color: '#10b981',
    borderColor: 'border-emerald-500',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
  },
  'Self Study': {
    name: 'Self Study',
    icon: '📖',
    color: '#8b5cf6',
    borderColor: 'border-purple-500',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/60',
    badgeText: 'text-purple-600 dark:text-purple-400',
  },
};

export function V2StudyTab({ user, timer, onNavigate }: Props) {
  const [selectedSubject, setSelectedSubject] = useState<string>('Physics');
  const [showSubjectSelect, setShowSubjectSelect] = useState(false);
  const [timerMode, setTimerMode] = useState<TimerMode>('stopwatch');
  const [presetIndex, setPresetIndex] = useState(0);

  const [todaySeconds, setTodaySeconds] = useState(0);
  const [weekSeconds, setWeekSeconds] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [focusMode, setFocusMode] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));

  const [goals, setGoalsState] = useState(getGoals);
  const [editingGoals, setEditingGoals] = useState(false);
  const [editDaily, setEditDaily] = useState(String(goals.daily));
  const [editWeekly, setEditWeekly] = useState(String(goals.weekly));

  const [weeklyData, setWeeklyData] = useState<{ day: string; secs: number; isToday: boolean }[]>([]);
  const [subjectMix, setSubjectMix] = useState<{ name: string; secs: number }[]>([]);
  const [todos, setTodos] = useState<any[]>([]);
  const [quickTask, setQuickTask] = useState('');
  const [quickAdding, setQuickAdding] = useState(false);

  const DAILY_GOAL_HOURS = goals.daily;
  const WEEKLY_GOAL_HOURS = goals.weekly;
  const todayDateKey = new Date().toISOString().split('T')[0];

  const saveEditedGoals = () => {
    const d = Math.max(0.5, Math.min(24, parseFloat(editDaily) || 6));
    const w = Math.max(1, Math.min(168, parseFloat(editWeekly) || 35));
    const ng = { daily: d, weekly: w };
    saveGoals(ng);
    setGoalsState(ng);
    setEditingGoals(false);
  };

  // Sync mode with timer if timer is active
  useEffect(() => {
    if (timer.isActive) {
      setTimerMode(timer.mode);
      if (timer.subject) setSelectedSubject(timer.subject);
    }
  }, [timer.isActive, timer.mode, timer.subject]);

  // Esc to exit focus mode
  useEffect(() => {
    if (!focusMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFocusMode(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focusMode]);

  // Rotating quote in focus mode
  useEffect(() => {
    if (!focusMode) return;
    const id = setInterval(() => setQuoteIndex((p) => (p + 1) % MOTIVATIONAL_QUOTES.length), 30000);
    return () => clearInterval(id);
  }, [focusMode]);

  // Aggregate stats + weekly + subject mix
  useEffect(() => {
    let isCancelled = false;

    const fetchStats = async () => {
      const todayStartUTC = getISTTodayStartUTC();
      const weekStart = new Date(new Date(todayStartUTC).getTime() - 6 * 86400000).toISOString();

      const { data } = await (supabase as any)
        .from('study_sessions')
        .select('duration_seconds, started_at, status, subject')
        .eq('ypt_user_id', user.id)
        .eq('status', 'completed')
        .gte('started_at', weekStart);

      if (isCancelled) return;

      const rows = data || [];
      const todayRows = rows.filter((r: any) => new Date(r.started_at) >= new Date(todayStartUTC));
      const todaySum = todayRows.reduce((acc: number, r: any) => acc + (r.duration_seconds || 0), 0);
      const weekSum = rows.reduce((acc: number, r: any) => acc + (r.duration_seconds || 0), 0);

      setTodaySeconds(todaySum);
      setWeekSeconds(weekSum);
      setSessionCount(todayRows.length);

      // Streak calculation
      const { data: allDates } = await (supabase as any)
        .from('study_sessions')
        .select('started_at')
        .eq('ypt_user_id', user.id)
        .eq('status', 'completed')
        .order('started_at', { ascending: false });

      if (isCancelled) return;

      if (allDates && allDates.length > 0) {
        const curStreak = calculateStreak(allDates.map((r: any) => r.started_at));
        setStreak(curStreak);
        setLongestStreak((prev) => Math.max(prev, curStreak));
      } else {
        setStreak(0);
        setLongestStreak(0);
      }

      // 7-day breakdown based on 3:00 AM IST cutoff
      const week: { day: string; secs: number; isToday: boolean }[] = [];
      const subjMap: Record<string, number> = {};
      const todayKey = getISTDateString(new Date());

      for (let i = 6; i >= 0; i--) {
        const checkD = getISTDate();
        checkD.setDate(checkD.getDate() - i);
        const dayStr = getISTDateString(checkD);
        const dayRows = rows.filter((r: any) => getISTDateString(r.started_at) === dayStr);
        const secs = dayRows.reduce((s: number, r: any) => s + (r.duration_seconds || 0), 0);

        dayRows.forEach((r: any) => {
          const sName = r.subject || 'Self Study';
          subjMap[sName] = (subjMap[sName] || 0) + (r.duration_seconds || 0);
        });

        week.push({
          day: checkD.toLocaleDateString('en-IN', { weekday: 'short' }),
          secs,
          isToday: dayStr === todayKey,
        });
      }
      setWeeklyData(week);

      const mix = Object.entries(subjMap)
        .map(([name, secs]) => ({ name, secs: secs as number }))
        .sort((a, b) => b.secs - a.secs);
      setSubjectMix(mix);
    };

    fetchStats();

    const onSessionEnded = () => fetchStats();
    window.addEventListener('study-session-ended', onSessionEnded);

    return () => {
      isCancelled = true;
      window.removeEventListener('study-session-ended', onSessionEnded);
    };
  }, [user.id, timer.isActive]);

  // Tasks
  const fetchTodos = async () => {
    const { data } = await (supabase as any)
      .from('ypt_todos')
      .select('*')
      .eq('ypt_user_id', user.id)
      .eq('created_date', todayDateKey)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    setTodos(data || []);
  };

  useEffect(() => {
    fetchTodos();
  }, [user.id]);

  const liveTodaySeconds = todaySeconds + (timer.isActive ? timer.elapsedSeconds : 0);
  const liveWeekSeconds = weekSeconds + (timer.isActive ? timer.elapsedSeconds : 0);
  const dailyTargetSecs = Math.max(1, (goals.daily || 6) * 3600);
  const weeklyTargetSecs = Math.max(1, (goals.weekly || 42) * 3600);
  const dailyProgress = Math.min(100, Math.max(0, (liveTodaySeconds / dailyTargetSecs) * 100));
  const weeklyProgress = Math.min(100, Math.max(0, (liveWeekSeconds / weeklyTargetSecs) * 100));

  const greeting = useMemo(() => {
    const h = getISTDate().getHours();
    if (h < 5) return 'Late night grind';
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    if (h < 21) return 'Good evening';
    return 'Night focus session';
  }, []);

  const todayLabel = useMemo(() => {
    return getISTDate().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
  }, []);

  const handleStart = async (customSubject?: string) => {
    setShowSubjectSelect(false);
    const subj = customSubject || selectedSubject || 'Physics';
    if (timerMode === 'countdown') {
      const p = POMODORO_PRESETS[presetIndex];
      await timer.startSession(subj, {
        mode: 'countdown',
        targetSeconds: p.work * 60,
        breakSeconds: p.break * 60,
        phase: 'work',
      });
    } else {
      await timer.startSession(subj, { mode: 'stopwatch' });
    }
  };

  const addQuickTask = async () => {
    const t = quickTask.trim();
    if (!t || quickAdding) return;
    setQuickAdding(true);
    const maxOrder = todos.length > 0 ? Math.max(...todos.map((x) => x.sort_order ?? 0)) + 1 : 0;
    await (supabase as any).from('ypt_todos').insert({
      ypt_user_id: user.id,
      text: t,
      created_date: todayDateKey,
      priority: 'normal',
      subject: timer.subject || selectedSubject || 'Self Study',
      sort_order: maxOrder,
    });
    setQuickTask('');
    await fetchTodos();
    setQuickAdding(false);
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    await (supabase as any).from('ypt_todos').update({ completed: !completed }).eq('id', id);
    fetchTodos();
  };

  const incompleteTasks = todos.filter((t) => !t.completed);
  const completedTasksCount = todos.filter((t) => t.completed).length;
  const taskProgress = todos.length > 0 ? (completedTasksCount / todos.length) * 100 : 0;
  const previewTasks = incompleteTasks.slice(0, 4);

  // Chart max scaling: anchored to daily target hours or highest day to prevent tiny spikes
  const highestWeeklySecs = Math.max(
    ...weeklyData.map((d) => (d.isToday ? d.secs + (timer.isActive ? timer.elapsedSeconds : 0) : d.secs)),
    0
  );
  const maxBar = Math.max(highestWeeklySecs, dailyTargetSecs);

  // Active subject info
  const activeSubjectName = timer.isActive ? timer.subject || 'Physics' : selectedSubject;
  const activeSubject = SUBJECT_CONFIG[activeSubjectName] || SUBJECT_CONFIG['Self Study'];

  // Smooth live subject mix updated locally
  const liveSubjectMix = useMemo(() => {
    const map: Record<string, number> = {};
    subjectMix.forEach((s) => { map[s.name] = (map[s.name] || 0) + s.secs; });
    if (timer.isActive && timer.elapsedSeconds > 0) {
      map[activeSubjectName] = (map[activeSubjectName] || 0) + timer.elapsedSeconds;
    }
    return Object.entries(map)
      .map(([name, secs]) => ({ name, secs }))
      .sort((a, b) => b.secs - a.secs);
  }, [subjectMix, timer.isActive, timer.elapsedSeconds, activeSubjectName]);

  const totalMix = liveSubjectMix.reduce((s, x) => s + x.secs, 0) || 1;

  // Timer Calculations
  const isCountdown = (timer.isActive ? timer.mode : timerMode) === 'countdown';
  const targetSecs = timer.isActive
    ? timer.targetSeconds ?? POMODORO_PRESETS[presetIndex].work * 60
    : POMODORO_PRESETS[presetIndex].work * 60;

  const displaySeconds = timer.isActive
    ? isCountdown
      ? (timer.remainingSeconds ?? 0)
      : timer.elapsedSeconds
    : isCountdown
    ? targetSecs
    : 0;

  // Progress percentage for visual ring
  const ringProgress = timer.isActive && isCountdown
    ? Math.min(1, Math.max(0, timer.elapsedSeconds / (timer.targetSeconds || 1)))
    : 0;

  // ============ FULLSCREEN FOCUS MODE ============
  if (focusMode && timer.isActive) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full blur-[140px] opacity-20"
            style={{ backgroundColor: activeSubject.color }}
          />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-8 max-w-lg w-full text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant/60 bg-surface-container-lowest/80 backdrop-blur-md shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: activeSubject.color }} />
            <span className="text-sm font-bold">{activeSubject.icon} {timer.subject}</span>
            <span className="text-xs font-mono text-on-surface-variant">• {timer.isPaused ? 'Paused' : 'Active'}</span>
          </div>

          <div className="relative flex flex-col items-center justify-center">
            <div className="text-6xl sm:text-8xl font-black font-mono tracking-tight tabular-nums select-none text-on-surface">
              {formatTime(displaySeconds)}
            </div>
            <p className="text-sm font-mono text-on-surface-variant mt-3">
              {isCountdown
                ? `${formatTime(timer.elapsedSeconds)} elapsed · ${formatTime(displaySeconds)} remaining`
                : `${formatHours(liveTodaySeconds)} total logged today`}
            </p>
          </div>

          <p className="text-sm text-on-surface-variant italic font-medium h-6">
            "{MOTIVATIONAL_QUOTES[quoteIndex]}"
          </p>

          <div className="flex items-center gap-4">
            {timer.isPaused ? (
              <Button onClick={timer.resumeSession} size="lg" className="px-8 h-12 text-base font-bold rounded-full">
                <Play className="h-5 w-5 mr-2" /> Resume Session
              </Button>
            ) : (
              <Button onClick={timer.pauseSession} variant="secondary" size="lg" className="px-8 h-12 text-base font-bold rounded-full">
                <Pause className="h-5 w-5 mr-2" /> Pause
              </Button>
            )}
            <Button onClick={timer.endSession} variant="destructive" size="lg" className="px-8 h-12 text-base font-bold rounded-full">
              <Square className="h-5 w-5 mr-2" /> Stop &amp; Save
            </Button>
          </div>

          <button
            onClick={() => setFocusMode(false)}
            className="flex items-center gap-2 text-xs font-mono text-on-surface-variant hover:text-on-surface transition-colors mt-2"
          >
            <Minimize2 className="h-4 w-4" /> Press ESC or click here to return
          </button>
        </div>
      </div>
    );
  }

  // ============ MAIN STUDY COCKPIT ============
  return (
    <div className="space-y-6">
      {/* Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider">
            <CalendarDays className="h-3.5 w-3.5 text-primary" />
            <span>{todayLabel}</span>
            <span>•</span>
            <span className="text-primary">COCKPIT LIVE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight mt-1 text-on-surface">
            {greeting}, <span className="text-primary italic">{user.name}</span>
          </h2>
        </div>

        {streak > 0 && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 self-start sm:self-auto shadow-xs">
            <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span className="text-xs font-mono font-bold">{streak}-day streak</span>
            <span className="text-[11px] text-amber-700/80 dark:text-amber-400 font-mono">(best {longestStreak}d)</span>
          </div>
        )}
      </div>

      {/* ───── CLEAN HERO STUDY TIMER CARD ───── */}
      <div className="relative bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border-2 border-slate-900/80 shadow-[4px_4px_0px_0px_rgba(15,23,42,0.9)] overflow-hidden">
        {/* Subtle Blueprint Grid pattern inside timer card */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,102,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,102,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto text-center space-y-6">
          
          {/* Top Control Bar: Mode Toggle & Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 w-full border-b border-outline-variant/30 pb-4">
            {/* Mode Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-surface-container-low rounded-full border border-outline-variant/40">
              <button
                type="button"
                disabled={timer.isActive}
                onClick={() => setTimerMode('stopwatch')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5",
                  timerMode === 'stopwatch'
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Stopwatch</span>
              </button>
              <button
                type="button"
                disabled={timer.isActive}
                onClick={() => setTimerMode('countdown')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5",
                  timerMode === 'countdown'
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Pomodoro</span>
              </button>
            </div>

            {/* Live State Badge */}
            <div className="flex items-center gap-2">
              {timer.isActive ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-primary border border-blue-200 dark:border-blue-900">
                  <span className={cn("w-2 h-2 rounded-full", timer.isPaused ? "bg-amber-500" : "bg-primary animate-pulse")} />
                  <span>{timer.isPaused ? "PAUSED" : "IN SESSION"}</span>
                </div>
              ) : (
                <span className="text-xs font-mono text-on-surface-variant flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  READY TO STUDY
                </span>
              )}
            </div>
          </div>

          {/* Pomodoro Presets Bar (Shown when countdown mode is active) */}
          {timerMode === 'countdown' && !timer.isActive && (
            <div className="flex flex-wrap items-center justify-center gap-2 animate-in fade-in duration-200">
              {POMODORO_PRESETS.map((p, idx) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setPresetIndex(idx)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border",
                    presetIndex === idx
                      ? "bg-primary text-on-primary border-primary shadow-xs"
                      : "bg-surface-container-low text-on-surface-variant hover:text-on-surface border-outline-variant/30"
                  )}
                >
                  <span className="font-mono">{p.work}m focus</span>
                  <span className="opacity-70 text-[10px] ml-1">/ {p.break}m break</span>
                </button>
              ))}
            </div>
          )}

          {/* Subject Selection Pills */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">
              {timer.isActive ? "ACTIVE SUBJECT" : "TARGET SUBJECT"}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {Object.values(SUBJECT_CONFIG).map((sub) => {
                const isSelected = activeSubjectName === sub.name;
                return (
                  <button
                    key={sub.name}
                    type="button"
                    disabled={timer.isActive}
                    onClick={() => setSelectedSubject(sub.name)}
                    className={cn(
                      "px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border",
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm scale-105"
                        : "bg-surface-container-low hover:bg-surface-container text-on-surface-variant border-outline-variant/30"
                    )}
                  >
                    <span>{sub.icon}</span>
                    <span>{sub.name}</span>
                  </button>
                );
              })}
              {!timer.isActive && (
                <button
                  type="button"
                  onClick={() => setShowSubjectSelect(true)}
                  className="px-3 py-2 rounded-full text-xs font-bold text-on-surface-variant hover:text-on-surface border border-dashed border-outline-variant hover:border-primary transition-colors"
                >
                  + Custom
                </button>
              )}
            </div>
          </div>

          {/* Central Timer Dial Display */}
          <div className="relative my-2 py-4 flex flex-col items-center justify-center">
            {/* Circular Meter Accent Ring */}
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full border-4 border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center shadow-inner bg-surface-container-low/40">
              
              {/* Dynamic SVG Progress Ring for Countdown */}
              {isCountdown && (
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="46%"
                    fill="none"
                    stroke={activeSubject.color}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray="100 100"
                    pathLength="100"
                    strokeDashoffset={100 - ringProgress * 100}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
              )}

              {/* Stopwatch Active Animated Sweep Ring */}
              {!isCountdown && timer.isActive && !timer.isPaused && (
                <div className="absolute inset-2 rounded-full border-2 border-primary/40 animate-ping opacity-25 pointer-events-none" />
              )}

              {/* Digits Display */}
              <div className="text-4xl sm:text-5xl font-mono font-black tracking-tight text-slate-900 dark:text-white tabular-nums select-none">
                {formatTime(displaySeconds)}
              </div>

              {/* Sub-label under digits */}
              <div className="mt-2 text-xs font-mono font-bold text-on-surface-variant flex items-center gap-1.5">
                <span>{activeSubject.icon}</span>
                <span>{activeSubjectName}</span>
                {timer.isActive && (
                  <>
                    <span>•</span>
                    <span className="text-primary font-bold">
                      {isCountdown
                        ? `${Math.round((timer.remainingSeconds ?? 0) / 60)}m left`
                        : `${formatHours(liveTodaySeconds)} today`}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 w-full">
            {!timer.isActive ? (
              <button
                type="button"
                onClick={() => handleStart()}
                className="w-full sm:w-auto min-w-[240px] px-8 py-4 bg-brand-blue hover:bg-blue-600 text-white font-display font-black text-base uppercase tracking-wider rounded-full shadow-brutal-blue hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Start {activeSubjectName} Session</span>
              </button>
            ) : (
              <div className="flex items-center gap-3 flex-wrap justify-center">
                {timer.isPaused ? (
                  <button
                    type="button"
                    onClick={timer.resumeSession}
                    className="px-7 py-3.5 bg-brand-blue hover:bg-blue-600 text-white font-bold text-sm rounded-full shadow-brutal-blue active:translate-y-0.5 transition-all flex items-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Resume Focus</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={timer.pauseSession}
                    className="px-7 py-3.5 bg-white text-slate-900 hover:bg-slate-50 font-bold text-sm rounded-full border-2 border-slate-900 shadow-brutal active:translate-y-0.5 transition-all flex items-center gap-2"
                  >
                    <Pause className="w-4 h-4" />
                    <span>Pause</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={timer.endSession}
                  className="px-7 py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-sm rounded-full border-2 border-rose-300 active:translate-y-0.5 transition-all flex items-center gap-2"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop &amp; Log</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFocusMode(true)}
                  className="p-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
                  title="Fullscreen Focus Mode"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ───── 4 VITAL METRICS BENTO GRID ───── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today */}
        <div className="bg-surface-container-lowest rounded-2xl p-4.5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant uppercase">
            <span className="flex items-center gap-1.5 font-bold">
              <Clock className="w-3.5 h-3.5 text-primary" /> Today
            </span>
            <span className="text-[11px] font-bold text-primary bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
              {Math.round(dailyProgress)}%
            </span>
          </div>
          <div className="my-2.5">
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-on-surface">
              {formatHours(liveTodaySeconds)}
            </div>
            <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">
              Goal: {DAILY_GOAL_HOURS}h • {Math.max(0, DAILY_GOAL_HOURS - liveTodaySeconds / 3600).toFixed(1)}h left
            </p>
          </div>
          <Progress value={dailyProgress} className="h-1.5" />
        </div>

        {/* This Week */}
        <div className="bg-surface-container-lowest rounded-2xl p-4.5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant uppercase">
            <span className="flex items-center gap-1.5 font-bold">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> This Week
            </span>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
              {Math.round(weeklyProgress)}%
            </span>
          </div>
          <div className="my-2.5">
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-on-surface">
              {formatHours(liveWeekSeconds)}
            </div>
            <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">
              Goal: {WEEKLY_GOAL_HOURS}h • Pace: {(liveWeekSeconds / 3600 / 7).toFixed(1)}h/day
            </p>
          </div>
          <Progress value={weeklyProgress} className="h-1.5" />
        </div>

        {/* Streak */}
        <div className="bg-surface-container-lowest rounded-2xl p-4.5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant uppercase">
            <span className="flex items-center gap-1.5 font-bold text-amber-600">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Streak
            </span>
            <span className="text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded">
              Active
            </span>
          </div>
          <div className="my-2.5">
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-on-surface">
              {streak} <span className="text-sm font-bold text-on-surface-variant">days</span>
            </div>
            <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">
              Personal Best: {longestStreak} days
            </p>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-600">
            <span>🛡️ Streak protected</span>
          </div>
        </div>

        {/* Sessions */}
        <div className="bg-surface-container-lowest rounded-2xl p-4.5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant uppercase">
            <span className="flex items-center gap-1.5 font-bold text-purple-600">
              <Zap className="w-3.5 h-3.5 text-purple-600" /> Sessions
            </span>
            <span className="text-[11px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded">
              Today
            </span>
          </div>
          <div className="my-2.5">
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-on-surface">
              {sessionCount} <span className="text-sm font-bold text-on-surface-variant">done</span>
            </div>
            <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">
              Avg session: ~{sessionCount > 0 ? Math.round(liveTodaySeconds / 60 / sessionCount) : 45} mins
            </p>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((dot) => (
              <span
                key={dot}
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  dot <= sessionCount ? "bg-primary" : "bg-surface-container"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ───── TWO-COLUMN BALANCED WORKSPACE ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN (Tasks & Weekly Chart - 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Today's Focus Tasks Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-primary flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-display uppercase tracking-wider text-on-surface">Today's Focus Tasks</h3>
                  <p className="text-xs text-on-surface-variant">
                    {todos.length === 0 ? 'Plan high-yield goals for today' : `${completedTasksCount} of ${todos.length} tasks completed`}
                  </p>
                </div>
              </div>
              {todos.length > 0 && (
                <span className="text-sm font-mono font-bold text-primary">{Math.round(taskProgress)}%</span>
              )}
            </div>

            {todos.length > 0 && <Progress value={taskProgress} className="h-1.5" />}

            {/* Quick Add Form */}
            <form
              onSubmit={(e) => { e.preventDefault(); addQuickTask(); }}
              className="flex items-center gap-2"
            >
              <Input
                value={quickTask}
                onChange={(e) => setQuickTask(e.target.value)}
                placeholder="Add high-yield study task (e.g. HC Verma kinematics Ex-2)…"
                maxLength={100}
                className="h-10 text-xs sm:text-sm rounded-xl"
              />
              <Button type="submit" size="icon" className="h-10 w-10 shrink-0 rounded-xl" disabled={!quickTask.trim() || quickAdding}>
                <Plus className="h-4 w-4" />
              </Button>
            </form>

            {/* Tasks list */}
            {previewTasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-outline-variant/40 p-5 text-center">
                <ListTodo className="h-6 w-6 mx-auto text-on-surface-variant/40 mb-1" />
                <p className="text-xs text-on-surface-variant">
                  {todos.length === 0 ? 'No tasks added yet. Drop in your first task above!' : 'All tasks completed for today! 🚀'}
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {previewTasks.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-surface-container-low/50 hover:bg-surface-container-low transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Checkbox
                        checked={false}
                        onCheckedChange={() => toggleTodo(t.id, t.completed)}
                        className="rounded"
                      />
                      <span className="text-xs sm:text-sm font-medium text-on-surface truncate">{t.text}</span>
                    </div>
                    {t.subject && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-surface-container text-on-surface-variant shrink-0">
                        {t.subject}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('tasks')}
                className="w-full text-center text-xs font-mono font-bold text-primary hover:underline pt-1 flex items-center justify-center gap-1"
              >
                <span>View Full Task Board</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Weekly Study Rhythm Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold font-display uppercase tracking-wider text-on-surface">Weekly Study Rhythm</h3>
              </div>
              <span className="text-xs font-mono font-bold bg-surface-container px-2 py-0.5 rounded text-on-surface">
                Total: {formatHours(liveWeekSeconds)}
              </span>
            </div>

            {/* Bar Visual */}
            <div className="h-36 flex items-end justify-between gap-2 sm:gap-3 pt-2 px-1">
              {weeklyData.map((d, i) => {
                const displaySecs = d.isToday ? d.secs + (timer.isActive ? timer.elapsedSeconds : 0) : d.secs;
                const heightPercent = displaySecs > 0 ? Math.min(100, Math.max(5, (displaySecs / maxBar) * 100)) : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div className="text-[10px] font-mono text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatHours(displaySecs)}
                    </div>
                    <div className="w-full h-full flex items-end justify-center">
                      <div
                        style={{ height: displaySecs > 0 ? `${heightPercent}%` : '2px' }}
                        className={cn(
                          "w-full transition-all duration-300",
                          displaySecs === 0
                            ? "bg-slate-300 dark:bg-slate-700/60 rounded-xs"
                            : d.isToday
                              ? "bg-primary rounded-t-lg shadow-xs"
                              : "bg-blue-300 dark:bg-blue-900/60 hover:bg-blue-400 rounded-t-lg"
                        )}
                      />
                    </div>
                    <span className={cn("text-[11px] font-mono font-bold", d.isToday ? "text-primary" : "text-on-surface-variant")}>
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (Goals & Subject Mix & Flashcards - 5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Target Goals Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> Study Targets
              </h3>
              {editingGoals ? (
                <button
                  type="button"
                  onClick={saveEditedGoals}
                  className="p-1 rounded bg-primary text-on-primary text-xs font-bold flex items-center gap-1 px-2"
                >
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setEditDaily(String(goals.daily)); setEditWeekly(String(goals.weekly)); setEditingGoals(true); }}
                  className="text-xs font-mono font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <Pencil className="w-3 h-3" /> Edit Targets
                </button>
              )}
            </div>

            {editingGoals ? (
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-on-surface-variant">Daily Goal (Hours)</label>
                  <Input type="number" value={editDaily} onChange={(e) => setEditDaily(e.target.value)} min={0.5} max={24} step={0.5} className="h-9 rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-on-surface-variant">Weekly Goal (Hours)</label>
                  <Input type="number" value={editWeekly} onChange={(e) => setEditWeekly(e.target.value)} min={1} max={168} step={1} className="h-9 rounded-xl" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-mono font-bold mb-1.5">
                    <span className="text-on-surface-variant">Daily Target</span>
                    <span>{formatHours(liveTodaySeconds)} / {goals.daily || 6}h</span>
                  </div>
                  <Progress value={dailyProgress} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-mono font-bold mb-1.5">
                    <span className="text-on-surface-variant">Weekly Target</span>
                    <span>{formatHours(liveWeekSeconds)} / {goals.weekly || 42}h</span>
                  </div>
                  <Progress value={weeklyProgress} className="h-2" />
                </div>
              </div>
            )}
          </div>

          {/* Subject Mix Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-on-surface">Subject Balance (7 Days)</h3>
            
            {liveSubjectMix.length === 0 ? (
              <p className="text-xs text-on-surface-variant py-2">No study sessions logged this week yet.</p>
            ) : (
              <div className="space-y-3">
                {/* Horizontal Segmented Bar */}
                <div className="h-2.5 w-full bg-surface-container rounded-full overflow-hidden flex">
                  {liveSubjectMix.map((s) => {
                    const cfg = SUBJECT_CONFIG[s.name] || SUBJECT_CONFIG['Self Study'];
                    const widthPct = (s.secs / totalMix) * 100;
                    return (
                      <div
                        key={s.name}
                        style={{ width: `${widthPct}%`, backgroundColor: cfg.color }}
                        title={`${s.name}: ${formatHours(s.secs)}`}
                      />
                    );
                  })}
                </div>

                {/* Legend list */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {liveSubjectMix.map((s) => {
                    const cfg = SUBJECT_CONFIG[s.name] || SUBJECT_CONFIG['Self Study'];
                    return (
                      <div key={s.name} className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low text-xs">
                        <span className="font-bold flex items-center gap-1.5 text-on-surface">
                          <span>{cfg.icon}</span>
                          <span>{s.name}</span>
                        </span>
                        <span className="font-mono text-on-surface-variant">{formatHours(s.secs)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Formula Flashcards Deck */}
          <FormulaFlashcards />
        </div>
      </div>

      {/* ───── CUSTOM SUBJECT PICK DIALOG ───── */}
      <Dialog open={showSubjectSelect} onOpenChange={setShowSubjectSelect}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black font-display">Select Target Topic</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            {SUBJECTS.map((s) => {
              const cfg = SUBJECT_CONFIG[s] || SUBJECT_CONFIG['Self Study'];
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setSelectedSubject(s); setShowSubjectSelect(false); }}
                  className="p-3.5 rounded-xl border border-outline-variant/40 hover:border-primary bg-surface-container-low hover:bg-surface-container text-left font-bold text-xs flex items-center gap-2 transition-all"
                >
                  <span className="text-base">{cfg.icon}</span>
                  <span>{s}</span>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* ───── INACTIVITY PROMPT DIALOG ───── */}
      <AlertDialog open={timer.showInactivityModal}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display font-black">Are you still in the flow?</AlertDialogTitle>
            <AlertDialogDescription>
              3 hours of continuous study detected. Session auto-ends in {timer.inactivityCountdown} seconds to prevent phantom time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Progress value={(timer.inactivityCountdown / 15) * 100} className="h-2 my-2" />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={timer.endSession}>End &amp; Log Time</AlertDialogCancel>
            <AlertDialogAction onClick={timer.dismissInactivity}>Yes, Still Studying</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ───── POMODORO COMPLETE DIALOG ───── */}
      <AlertDialog open={!!timer.countdownDone}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display font-black">
              {timer.countdownDone?.phase === 'break' ? 'Break Over!' : 'Focus Interval Complete!'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {timer.countdownDone?.phase === 'break'
                ? 'Recharged? Lock in for your next focus session.'
                : `Focus logged! Take a ${Math.round((timer.countdownDone?.breakSeconds || 300) / 60)}-minute breather to let concepts consolidate.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={timer.dismissCountdownDone}>Done For Now</AlertDialogCancel>
            {timer.countdownDone?.phase === 'work' ? (
              <AlertDialogAction
                onClick={() => timer.startBreak(selectedSubject, timer.countdownDone?.breakSeconds || 300)}
              >
                Start Break
              </AlertDialogAction>
            ) : (
              <AlertDialogAction
                onClick={() => { timer.dismissCountdownDone(); handleStart(); }}
              >
                Next Focus Block
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
