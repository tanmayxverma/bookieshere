import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { SUBJECTS, formatTime, formatHours, getISTTodayStartUTC, getISTDate, getISTDateString, POMODORO_PRESETS, type TimerMode } from '@/types/ypt';
import { supabase } from '@/integrations/supabase/client';
import { TimerRing } from '@/components/YPT/TimerRing';
import {
  Play, Pause, Square, Clock, TrendingUp, Flame, Zap, Maximize2, Minimize2,
  Pencil, Check, Target, Plus, ListTodo, ArrowRight, BarChart3, Users, Trophy,
  CalendarDays, Sparkles, ChevronRight, Brain, ArrowUpRight,
} from 'lucide-react';
import type { YPTUser } from '@/types/ypt';
import { FormulaFlashcards } from '@/components/FormulaFlashcards';

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

const SUBJECT_TINT: Record<string, string> = {
  Physics: 'bg-foreground/85',
  Chemistry: 'bg-foreground/65',
  Mathematics: 'bg-foreground/45',
  'Self Study': 'bg-foreground/25',
};

export function V2StudyTab({ user, timer, onNavigate }: Props) {
  const [showSubjectSelect, setShowSubjectSelect] = useState(false);
  const [pendingMode, setPendingMode] = useState<TimerMode>('stopwatch');
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
    saveGoals(ng); setGoalsState(ng); setEditingGoals(false);
  };

  // Esc to exit focus
  useEffect(() => {
    if (!focusMode) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFocusMode(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focusMode]);

  // Rotating quote in focus mode
  useEffect(() => {
    if (!focusMode) return;
    const id = setInterval(() => setQuoteIndex(p => (p + 1) % MOTIVATIONAL_QUOTES.length), 30000);
    return () => clearInterval(id);
  }, [focusMode]);

  // Aggregate stats + weekly + subject mix
  useEffect(() => {
    const fetchStats = async () => {
      const todayStartUTC = getISTTodayStartUTC();
      const weekStart = new Date(new Date(todayStartUTC).getTime() - 6 * 86400000).toISOString();
      const yearAgo = new Date();
      yearAgo.setDate(yearAgo.getDate() - 365);

      const { data } = await (supabase as any)
        .from('study_sessions')
        .select('duration_seconds, started_at, status, subject')
        .eq('ypt_user_id', user.id)
        .eq('status', 'completed')
        .gte('started_at', yearAgo.toISOString());

      if (!data) return;

      const todayStartTime = new Date(todayStartUTC).getTime();
      const weekStartTime = new Date(weekStart).getTime();

      const todaySessions = data.filter((s: any) => new Date(s.started_at).getTime() >= todayStartTime);
      const todaySecs = todaySessions.reduce((sum: number, s: any) => sum + (s.duration_seconds || 0), 0);
      const weekSessions = data.filter((s: any) => new Date(s.started_at).getTime() >= weekStartTime);
      const weekSecs = weekSessions.reduce((sum: number, s: any) => sum + (s.duration_seconds || 0), 0);
      setTodaySeconds(todaySecs);
      setWeekSeconds(weekSecs);
      setSessionCount(todaySessions.filter((s: any) => s.status === 'completed').length);

      const dayMap: Record<string, number> = {};
      const subjMap: Record<string, number> = {};
      data.forEach((s: any) => {
        const key = getISTDateString(s.started_at);
        dayMap[key] = (dayMap[key] || 0) + (s.duration_seconds || 0);
        if (new Date(s.started_at).getTime() >= weekStartTime) {
          const sub = s.subject || 'Self Study';
          subjMap[sub] = (subjMap[sub] || 0) + (s.duration_seconds || 0);
        }
      });

      // Streak
      let st = 0;
      for (let i = 0; i < 365; i++) {
        const d = getISTDate();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        let secs = dayMap[key] || 0;
        if (i === 0) secs += (timer.isActive ? timer.elapsedSeconds : 0);
        if (secs >= 900) st++;
        else break;
      }
      setStreak(st);

      const sortedDays = Object.entries(dayMap).filter(([, v]) => v >= 900).map(([k]) => k).sort();
      let longest = 0, current = 1;
      for (let i = 1; i < sortedDays.length; i++) {
        const prev = new Date(sortedDays[i - 1] + 'T00:00:00');
        const curr = new Date(sortedDays[i] + 'T00:00:00');
        if ((curr.getTime() - prev.getTime()) / 86400000 === 1) current++;
        else { longest = Math.max(longest, current); current = 1; }
      }
      longest = Math.max(longest, current, st);
      setLongestStreak(sortedDays.length > 0 ? longest : 0);

      // Last 7 days bars
      const week: { day: string; secs: number; isToday: boolean }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = getISTDate();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        let secs = dayMap[key] || 0;
        if (i === 0) secs += (timer.isActive ? timer.elapsedSeconds : 0);
        week.push({
          day: d.toLocaleDateString('en', { weekday: 'short' })[0],
          secs,
          isToday: i === 0,
        });
      }
      setWeeklyData(week);

      const mix = Object.entries(subjMap)
        .map(([name, secs]) => ({ name, secs: secs as number }))
        .sort((a, b) => b.secs - a.secs);
      setSubjectMix(mix);
    };
    fetchStats();
  }, [user.id, timer.isActive, timer.elapsedSeconds]);

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
  useEffect(() => { fetchTodos(); }, [user.id]);

  const liveTodaySeconds = todaySeconds + (timer.isActive ? timer.elapsedSeconds : 0);
  const liveWeekSeconds = weekSeconds + (timer.isActive ? timer.elapsedSeconds : 0);
  const dailyProgress = Math.min(100, (liveTodaySeconds / (DAILY_GOAL_HOURS * 3600)) * 100);
  const weeklyProgress = Math.min(100, (liveWeekSeconds / (WEEKLY_GOAL_HOURS * 3600)) * 100);

  const greeting = useMemo(() => {
    const h = getISTDate().getHours();
    if (h < 5) return 'Burning the midnight oil';
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    if (h < 21) return 'Good evening';
    return 'Late night grind';
  }, []);

  const todayLabel = useMemo(() => {
    return getISTDate().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
  }, []);

  const handleStart = async (subject: string) => {
    setShowSubjectSelect(false);
    if (pendingMode === 'countdown') {
      const p = POMODORO_PRESETS[presetIndex];
      await timer.startSession(subject, {
        mode: 'countdown',
        targetSeconds: p.work * 60,
        breakSeconds: p.break * 60,
        phase: 'work',
      });
    } else {
      await timer.startSession(subject, { mode: 'stopwatch' });
    }
  };

  const addQuickTask = async () => {
    const t = quickTask.trim();
    if (!t || quickAdding) return;
    setQuickAdding(true);
    const maxOrder = todos.length > 0 ? Math.max(...todos.map(x => x.sort_order ?? 0)) + 1 : 0;
    await (supabase as any).from('ypt_todos').insert({
      ypt_user_id: user.id,
      text: t,
      created_date: todayDateKey,
      priority: 'normal',
      subject: timer.subject || 'Self Study',
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

  const incompleteTasks = todos.filter(t => !t.completed);
  const completedTasksCount = todos.filter(t => t.completed).length;
  const taskProgress = todos.length > 0 ? (completedTasksCount / todos.length) * 100 : 0;
  const previewTasks = incompleteTasks.slice(0, 4);

  const maxBar = Math.max(...weeklyData.map(d => d.secs), 1);
  const totalMix = subjectMix.reduce((s, x) => s + x.secs, 0) || 1;

  // Timer display: countdown shows time left, stopwatch shows time elapsed.
  const isCountdown = timer.mode === 'countdown' && timer.targetSeconds != null;
  const displaySeconds = isCountdown ? (timer.remainingSeconds ?? 0) : timer.elapsedSeconds;
  const ringProgress = isCountdown
    ? timer.elapsedSeconds / (timer.targetSeconds || 1)
    : (timer.elapsedSeconds % 3600) / 3600;
  const ringLabel = isCountdown
    ? (timer.phase === 'break' ? 'Break' : 'Focus block')
    : 'Stopwatch';

  // ============ FOCUS MODE ============
  if (focusMode && timer.isActive) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-foreground/5 blur-[120px] breathing-glow" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-8 pop-in">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full liquid-glass-subtle">
            <span className="w-2.5 h-2.5 rounded-full bg-foreground animate-pulse" />
            <span className="text-base font-medium text-muted-foreground">{timer.subject}</span>
          </div>
          <TimerRing
            progress={ringProgress}
            seconds={displaySeconds}
            label={ringLabel}
            sublabel={timer.isPaused ? 'Paused' : undefined}
            paused={timer.isPaused}
            size={340}
          />
          <p className="text-sm text-muted-foreground/60 italic font-medium h-5">
            "{MOTIVATIONAL_QUOTES[quoteIndex]}"
          </p>
          <div className="w-72 space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground/60 uppercase tracking-wider">
              <span>Today</span>
              <span>{formatHours(liveTodaySeconds)} / {DAILY_GOAL_HOURS}h</span>
            </div>
            <Progress value={dailyProgress} className="h-1.5" />
          </div>
          <div className="flex items-center gap-3">
            {timer.isPaused ? (
              <Button onClick={timer.resumeSession} size="lg" className="px-8 h-12 text-base">
                <Play className="h-5 w-5 mr-2" /> Resume
              </Button>
            ) : (
              <Button onClick={timer.pauseSession} variant="secondary" size="lg" className="px-8 h-12 text-base">
                <Pause className="h-5 w-5 mr-2" /> Pause
              </Button>
            )}
            <Button onClick={timer.endSession} variant="destructive" size="lg" className="px-8 h-12 text-base">
              <Square className="h-5 w-5 mr-2" /> Stop
            </Button>
          </div>
          <button onClick={() => setFocusMode(false)} className="flex items-center gap-2 text-sm text-muted-foreground/40 hover:text-muted-foreground transition-colors mt-4">
            <Minimize2 className="h-4 w-4" /> Press ESC to exit focus mode
          </button>
        </div>
        <AlertDialog open={timer.showInactivityModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you still studying?</AlertDialogTitle>
              <AlertDialogDescription>3 hours straight — session auto-ends in {timer.inactivityCountdown}s.</AlertDialogDescription>
            </AlertDialogHeader>
            <Progress value={(timer.inactivityCountdown / 15) * 100} className="h-2" />
            <AlertDialogFooter>
              <AlertDialogCancel onClick={timer.endSession}>End Session</AlertDialogCancel>
              <AlertDialogAction onClick={timer.dismissInactivity}>Yes, continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // ============ COMMAND HUB ============
  return (
    <div className="space-y-5 pop-in">
      {/* Greeting strip */}
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs font-bold text-muted-foreground/70 uppercase tracking-[0.18em] flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" /> {todayLabel}
          </p>
          <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight mt-1">
            {greeting},{' '}
            <span className="text-muted-foreground italic font-medium">{user.name}</span>
          </h2>
        </div>
        {streak > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/60 liquid-glass-subtle">
            <Flame className="h-4 w-4 text-foreground" />
            <span className="text-sm font-bold tabular-nums">{streak}-day streak</span>
            {longestStreak > streak && (
              <span className="text-xs text-muted-foreground">· best {longestStreak}</span>
            )}
          </div>
        )}
      </div>

      {/* HERO TIMER */}
      <Card className="relative overflow-hidden liquid-glass shine-card">
        {/* Always-on ambient aurora gradient */}
        <div className="absolute inset-0 aurora-bg opacity-70 pointer-events-none" />
        <div className="absolute -top-16 -right-10 w-60 h-60 rounded-full bg-primary/15 blur-3xl blob-a pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-[hsl(195_85%_55%_/_0.14)] blur-3xl blob-b pointer-events-none" />
        {timer.isActive && !timer.isPaused && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[260px] rounded-full bg-primary/10 blur-[90px] breathing-glow" />
          </div>
        )}
        <div className="relative p-7 md:p-9 text-center">
          {timer.isActive ? (
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-border/60 bg-background/50 text-foreground text-sm font-semibold">
                <span className={`w-2.5 h-2.5 rounded-full ${timer.isPaused ? 'bg-muted-foreground' : 'bg-foreground animate-pulse'}`} />
                {timer.subject}
                {timer.isPaused && <span className="text-muted-foreground font-normal">· paused</span>}
              </div>
              <p className="text-6xl md:text-7xl font-mono font-bold tracking-tight tabular-nums select-none">
                {formatTime(timer.elapsedSeconds)}
              </p>
              <div className="flex justify-center gap-2.5 flex-wrap">
                {timer.isPaused ? (
                  <Button onClick={timer.resumeSession} size="lg" className="px-7 h-12 text-base btn-lift">
                    <Play className="h-5 w-5 mr-2" /> Resume
                  </Button>
                ) : (
                  <Button onClick={timer.pauseSession} variant="secondary" size="lg" className="px-7 h-12 text-base">
                    <Pause className="h-5 w-5 mr-2" /> Pause
                  </Button>
                )}
                <Button onClick={timer.endSession} variant="destructive" size="lg" className="px-7 h-12 text-base">
                  <Square className="h-5 w-5 mr-2" /> Stop
                </Button>
                <Button onClick={() => setFocusMode(true)} variant="outline" size="lg" className="px-4 h-12" title="Focus Mode">
                  <Maximize2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <p className="text-xs uppercase tracking-[0.22em] font-bold text-muted-foreground/70">Ready when you are</p>
              <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">Start a study session</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Pick a subject. Lock in. Your time, streaks, and focus all start with one tap.
              </p>
              <div className="flex justify-center gap-2.5 flex-wrap pt-2">
                <Button size="lg" className="text-base px-8 h-12 btn-lift" onClick={() => setShowSubjectSelect(true)}>
                  <Play className="h-5 w-5 mr-2" /> Start studying
                </Button>
                {SUBJECTS.slice(0, 3).map(s => (
                  <Button
                    key={s}
                    variant="outline"
                    size="lg"
                    className="h-12 px-4 text-sm font-medium"
                    onClick={() => handleStart(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* VITAL STATS STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<Clock className="h-4 w-4" />} label="Today" value={formatHours(liveTodaySeconds)} sub={`of ${DAILY_GOAL_HOURS}h goal`} />
        <StatCard icon={<TrendingUp className="h-4 w-4" />} label="This week" value={formatHours(liveWeekSeconds)} sub={`of ${WEEKLY_GOAL_HOURS}h goal`} />
        <StatCard icon={<Flame className="h-4 w-4" />} label="Streak" value={`${streak}d`} sub={longestStreak > 0 ? `Best ${longestStreak}d` : 'Start today'} highlight={streak > 0} />
        <StatCard icon={<Zap className="h-4 w-4" />} label="Sessions" value={`${sessionCount}`} sub="completed today" />
      </div>

      {/* TWO-COLUMN HUB */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* LEFT — Tasks + Weekly graph */}
        <div className="lg:col-span-2 space-y-4">
          {/* Today's tasks widget */}
          <Card className="p-5 border-border/60">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-foreground/10 flex items-center justify-center">
                  <Target className="h-4.5 w-4.5 text-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider">Today's tasks</h3>
                  <p className="text-xs text-muted-foreground">
                    {todos.length === 0 ? 'Plan your day' : `${completedTasksCount}/${todos.length} done`}
                  </p>
                </div>
              </div>
              {todos.length > 0 && (
                <span className="text-xl font-bold tabular-nums">{Math.round(taskProgress)}%</span>
              )}
            </div>

            {todos.length > 0 && <Progress value={taskProgress} className="h-1.5 mb-3" />}

            {/* Quick add */}
            <form
              onSubmit={(e) => { e.preventDefault(); addQuickTask(); }}
              className="flex items-center gap-2 mb-3"
            >
              <Input
                value={quickTask}
                onChange={(e) => setQuickTask(e.target.value)}
                placeholder="Add a quick task for today…"
                maxLength={100}
                className="h-10 text-sm"
              />
              <Button type="submit" size="icon" className="h-10 w-10 shrink-0" disabled={!quickTask.trim() || quickAdding}>
                <Plus className="h-4 w-4" />
              </Button>
            </form>

            {/* Task previews */}
            {previewTasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/60 px-4 py-6 text-center">
                <ListTodo className="h-6 w-6 mx-auto text-muted-foreground/40 mb-1.5" />
                <p className="text-xs text-muted-foreground">
                  {todos.length === 0 ? 'No tasks yet — add your first above' : 'All tasks done. Beast mode 🚀'}
                </p>
              </div>
            ) : (
              <ul className="space-y-1.5">
                {previewTasks.map((t) => (
                  <li
                    key={t.id}
                    className="group flex items-center gap-3 px-3 py-2 rounded-lg border border-border/40 hover:border-border/80 hover:bg-muted/40 transition-colors"
                  >
                    <Checkbox
                      checked={false}
                      onCheckedChange={() => toggleTodo(t.id, t.completed)}
                      className="h-5 w-5 rounded shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t.text}</p>
                      {(t.subject || t.time_allotted) && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                          {t.subject && <span>{t.subject}</span>}
                          {t.time_allotted && <span>· {t.time_allotted}m</span>}
                        </p>
                      )}
                    </div>
                    {!timer.isActive && t.subject && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => timer.startSession(t.subject)}
                        title="Start studying this"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {(incompleteTasks.length > previewTasks.length || todos.length > 0) && onNavigate && (
              <button
                onClick={() => onNavigate('tasks')}
                className="mt-3 w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Open full task board
                {incompleteTasks.length > previewTasks.length && (
                  <span className="text-muted-foreground/60">· +{incompleteTasks.length - previewTasks.length} more</span>
                )}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </Card>

          {/* Weekly mini graph */}
          <Card className="p-5 border-border/60">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Last 7 days</h3>
              </div>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('stats')}
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-medium"
                >
                  Full stats <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>
            <div className="flex items-end justify-between gap-2 h-28">
              {weeklyData.map((d, i) => {
                const h = Math.max(4, (d.secs / maxBar) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                    <div className="w-full flex items-end justify-center h-full">
                      <div
                        className={`w-full rounded-t-md transition-all duration-500 ${d.isToday ? 'bg-foreground' : 'bg-foreground/30'} ${d.secs === 0 ? 'opacity-40' : ''}`}
                        style={{ height: `${h}%` }}
                        title={formatHours(d.secs)}
                      />
                    </div>
                    <span className={`text-[10px] font-bold uppercase ${d.isToday ? 'text-foreground' : 'text-muted-foreground/70'}`}>{d.day}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* RIGHT — Goals + Subject mix + Quick nav */}
        <div className="space-y-4">
          {/* Goals */}
          <Card className="p-5 border-border/60">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" /> Goals
              </h3>
              {editingGoals ? (
                <button onClick={saveEditedGoals} className="p-1.5 rounded-md hover:bg-muted transition-colors"><Check className="h-4 w-4" /></button>
              ) : (
                <button onClick={() => { setEditDaily(String(goals.daily)); setEditWeekly(String(goals.weekly)); setEditingGoals(true); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
              )}
            </div>
            {editingGoals ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase">Daily (h)</label>
                  <Input type="number" value={editDaily} onChange={e => setEditDaily(e.target.value)} min={0.5} max={24} step={0.5} className="h-9" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase">Weekly (h)</label>
                  <Input type="number" value={editWeekly} onChange={e => setEditWeekly(e.target.value)} min={1} max={168} step={1} className="h-9" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-muted-foreground">Daily</span>
                    <span className="tabular-nums">{formatHours(liveTodaySeconds)} / {DAILY_GOAL_HOURS}h</span>
                  </div>
                  <Progress value={dailyProgress} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-muted-foreground">Weekly</span>
                    <span className="tabular-nums">{formatHours(liveWeekSeconds)} / {WEEKLY_GOAL_HOURS}h</span>
                  </div>
                  <Progress value={weeklyProgress} className="h-2" />
                </div>
              </div>
            )}
          </Card>

          {/* Subject mix */}
          <Card className="p-5 border-border/60">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Subject mix · 7d</h3>
            {subjectMix.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3">No sessions this week yet.</p>
            ) : (
              <>
                <div className="flex h-2 rounded-full overflow-hidden bg-muted/40 mb-3">
                  {subjectMix.map((s) => (
                    <div
                      key={s.name}
                      className={SUBJECT_TINT[s.name] || 'bg-foreground/40'}
                      style={{ width: `${(s.secs / totalMix) * 100}%` }}
                      title={`${s.name} · ${formatHours(s.secs)}`}
                    />
                  ))}
                </div>
                <ul className="space-y-1.5">
                  {subjectMix.map(s => (
                    <li key={s.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-sm ${SUBJECT_TINT[s.name] || 'bg-foreground/40'}`} />
                        <span className="font-medium">{s.name}</span>
                      </span>
                      <span className="text-muted-foreground tabular-nums">{formatHours(s.secs)}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card>

          {/* Quick nav */}
          {onNavigate && (
            <Card className="p-3 border-border/60">
              <div className="grid grid-cols-3 gap-1.5">
                <NavTile icon={<Users className="h-4 w-4" />} label="Rooms" onClick={() => onNavigate('rooms')} />
                <NavTile icon={<BarChart3 className="h-4 w-4" />} label="Stats" onClick={() => onNavigate('stats')} />
                <NavTile icon={<Trophy className="h-4 w-4" />} label="Board" onClick={() => onNavigate('leaderboard')} />
              </div>
            </Card>
          )}

          {/* Formula flashcards — lightweight revision tool */}
          <FormulaFlashcards />

          {/* Personal AI Tutor promo */}
          <a
            href="https://www.acrolly.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            <Card className="relative overflow-hidden p-5 border-border/60 hover:border-foreground/30 transition-all">
              <div aria-hidden className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
              <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-[hsl(195_85%_55%_/_0.18)] blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-foreground" /> AI Tutor
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-foreground/10 flex items-center justify-center shrink-0">
                    <Brain className="h-5 w-5 text-foreground" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold leading-tight">Personal AI Tutor</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">for JEE Main &amp; Advanced</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground/90 leading-relaxed mt-3">
                  Doubt-solving, concept walkthroughs and instant explanations — built for JEE aspirants.
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-2 truncate">acrolly.com</p>
              </div>
            </Card>
          </a>
        </div>
      </div>

      {/* Subject pick dialog */}
      <Dialog open={showSubjectSelect} onOpenChange={setShowSubjectSelect}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">What are you studying?</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 pt-2">
            {SUBJECTS.map((s) => (
              <Button
                key={s}
                variant="outline"
                className="h-16 text-base font-semibold card-glow active:scale-95 transition-transform"
                onClick={() => handleStart(s)}
              >
                {s}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Inactivity */}
      <AlertDialog open={timer.showInactivityModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you still studying?</AlertDialogTitle>
            <AlertDialogDescription>3 hours straight — session auto-ends in {timer.inactivityCountdown}s.</AlertDialogDescription>
          </AlertDialogHeader>
          <Progress value={(timer.inactivityCountdown / 15) * 100} className="h-2" />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={timer.endSession}>End Session</AlertDialogCancel>
            <AlertDialogAction onClick={timer.dismissInactivity}>Yes, continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCard({ icon, label, value, sub, highlight }: { icon: React.ReactNode; label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <Card className={`p-4 liquid-glass-subtle ${highlight ? 'border-foreground/20' : 'border-border/60'}`}>
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-[0.16em]">{label}</span>
      </div>
      <p className="text-2xl font-bold tabular-nums leading-none">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground/80 mt-1.5">{sub}</p>}
    </Card>
  );
}

function NavTile({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center justify-center gap-1.5 py-3 rounded-lg hover:bg-muted/60 transition-colors"
    >
      <span className="text-muted-foreground group-hover:text-foreground transition-colors">{icon}</span>
      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
    </button>
  );
}
