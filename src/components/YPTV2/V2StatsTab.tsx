import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatHours, getISTDate, getISTDateString, getISTStudyDayString, calculateStudyStreak, SUBJECTS } from '@/types/ypt';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  Clock, Flame, TrendingUp, Calendar as CalendarIcon, BarChart3, Brain,
  Plus, Check, Sparkles, ChevronLeft, ChevronRight, Trophy, Target, BookOpen, Layers
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { YPTContentSkeleton } from '@/components/YPT/YPTSkeletons';

interface Props {
  userId: string;
  liveElapsed?: number;
}

const SUBJECT_COLORS: Record<string, string> = {
  'Physics': '#0062ff',
  'Chemistry': '#f59e0b',
  'Mathematics': '#10b981',
  'Self Study': '#8b5cf6',
};

const SUBJECT_EMOJIS: Record<string, string> = {
  'Physics': '⚡',
  'Chemistry': '🧪',
  'Mathematics': '📐',
  'Self Study': '📖',
};

const GOALS_STORAGE_KEY = 'ypt_study_goals';

function getStoredDailyGoal(): number {
  try {
    const raw = localStorage.getItem(GOALS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed?.daily === 'number' && parsed.daily > 0) return parsed.daily;
    }
  } catch {}
  return 6;
}

function saveStoredDailyGoal(daily: number) {
  try {
    const raw = localStorage.getItem(GOALS_STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : { daily: 6, weekly: 35 };
    existing.daily = daily;
    existing.weekly = Math.round(daily * 6);
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(existing));
    window.dispatchEvent(new Event('ypt_goals_updated'));
  } catch {}
}

export function V2StatsTab({ userId, liveElapsed = 0 }: Props) {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Daily study goal state
  const [dailyGoalHours, setDailyGoalHours] = useState<number>(getStoredDailyGoal);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [goalInput, setGoalInput] = useState(String(dailyGoalHours));

  useEffect(() => {
    const handleGoalsUpdated = () => {
      setDailyGoalHours(getStoredDailyGoal());
    };
    window.addEventListener('ypt_goals_updated', handleGoalsUpdated);
    return () => window.removeEventListener('ypt_goals_updated', handleGoalsUpdated);
  }, []);

  // Manual study log dialog state
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [logDate, setLogDate] = useState<string>(() => getISTDate().toISOString().split('T')[0]);
  const [logSubject, setLogSubject] = useState<string>('Physics');
  const [logHours, setLogHours] = useState<number>(1);
  const [logMinutes, setLogMinutes] = useState<number>(30);
  const [logNotes, setLogNotes] = useState<string>('');
  const [savingLog, setSavingLog] = useState<boolean>(false);

  // Calendar selected date for inspecting sessions
  const [selectedDateKey, setSelectedDateKey] = useState<string>(() => getISTDate().toISOString().split('T')[0]);

  // Calendar month view offset (0 = current month, -1 = last month, +1 = next)
  const [monthOffset, setMonthOffset] = useState<number>(0);

  const fetchSessions = async () => {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const { data } = await (supabase as any)
      .from('study_sessions')
      .select('*')
      .eq('ypt_user_id', userId)
      .eq('status', 'completed')
      .gte('started_at', ninetyDaysAgo.toISOString())
      .order('started_at', { ascending: false });
    setSessions(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, [userId]);

  if (loading) return <YPTContentSkeleton />;

  const istTodayStr = getISTDate().toISOString().split('T')[0];

  const dayMap: Record<string, number> = {};
  const subjectMap: Record<string, number> = {};
  const hourMap: Record<number, number> = {};

  sessions.forEach((s) => {
    const dateStr = getISTDateString(s.started_at);
    dayMap[dateStr] = (dayMap[dateStr] || 0) + (s.duration_seconds || 0);
    const subject = s.subject || 'Self Study';
    subjectMap[subject] = (subjectMap[subject] || 0) + (s.duration_seconds || 0);
    const ist = getISTDate(new Date(s.started_at));
    const hour = ist.getHours();
    hourMap[hour] = (hourMap[hour] || 0) + (s.duration_seconds || 0);
  });

  const todaySeconds = (dayMap[istTodayStr] || 0) + liveElapsed;

  let weekSeconds = 0;
  for (let i = 0; i < 7; i++) {
    const d = getISTDate();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    weekSeconds += dayMap[key] || 0;
  }
  weekSeconds += liveElapsed;

  const monthSeconds = Object.values(dayMap).reduce((a, b) => a + b, 0) + liveElapsed;

  // Streak calculation (with 3:00 AM IST daily rollover)
  const { streak } = calculateStudyStreak(dayMap, liveElapsed);

  // Daily 7-day bar chart data
  const dailyData = [];
  for (let i = 6; i >= 0; i--) {
    const d = getISTDate();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    let secs = dayMap[key] || 0;
    if (i === 0) secs += liveElapsed;
    dailyData.push({
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      hours: +(secs / 3600).toFixed(1),
      isToday: i === 0,
    });
  }

  const subjectData = Object.entries(subjectMap).map(([name, secs]) => ({
    name,
    hours: +(secs / 3600).toFixed(1),
    color: SUBJECT_COLORS[name] || '#8b5cf6',
  }));

  const dayEntries = Object.entries(dayMap).map(([k, v]) => ({
    date: k,
    seconds: k === istTodayStr ? v + liveElapsed : v,
  }));
  const bestDay = dayEntries.sort((a, b) => b.seconds - a.seconds)[0];
  const bestDayName = bestDay
    ? new Date(bestDay.date + 'T00:00:00').toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })
    : 'N/A';

  const peakHour = Object.entries(hourMap).sort((a, b) => b[1] - a[1])[0];
  const peakHourStr = peakHour ? `${parseInt(peakHour[0])}:00 – ${parseInt(peakHour[0]) + 1}:00` : 'N/A';

  const activeDays = Object.keys(dayMap).length || 1;
  const avgDaily = monthSeconds / activeDays;

  // 24-hour heatmap
  const heatmapData = [];
  for (let h = 0; h < 24; h++) {
    heatmapData.push({ hour: h, seconds: hourMap[h] || 0 });
  }
  const maxHourSecs = Math.max(...heatmapData.map((d) => d.seconds), 1);

  // Calendar calculations based on monthOffset
  const displayDate = getISTDate();
  displayDate.setMonth(displayDate.getMonth() + monthOffset);
  const currentMonth = displayDate.getMonth();
  const currentYear = displayDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const calendarData = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    let secs = dayMap[key] || 0;
    if (key === istTodayStr) secs += liveElapsed;
    const isFuture = new Date(key) > new Date(istTodayStr);
    calendarData.push({
      day,
      dateKey: key,
      seconds: secs,
      isFuture,
      isToday: key === istTodayStr,
      isSelected: key === selectedDateKey,
    });
  }
  const monthName = displayDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  // Sessions on the currently selected day
  const selectedDaySessions = sessions.filter((s) => getISTDateString(s.started_at) === selectedDateKey);
  const selectedDayTotalSecs =
    (dayMap[selectedDateKey] || 0) + (selectedDateKey === istTodayStr ? liveElapsed : 0);

  // Quick preset buttons for log dialog
  const setQuickDuration = (h: number, m: number) => {
    setLogHours(h);
    setLogMinutes(m);
  };

  // Submit manual log to Supabase
  const handleSaveManualLog = async () => {
    const durationSecs = logHours * 3600 + logMinutes * 60;
    if (durationSecs <= 0) {
      toast({ variant: 'destructive', title: 'Invalid duration', description: 'Please enter a duration greater than 0.' });
      return;
    }

    setSavingLog(true);
    try {
      const startedAt = new Date(`${logDate}T12:00:00.000Z`).toISOString();
      const endedAt = new Date(new Date(startedAt).getTime() + durationSecs * 1000).toISOString();

      const { data: newSession, error } = await (supabase as any)
        .from('study_sessions')
        .insert({
          ypt_user_id: userId,
          subject: logSubject,
          started_at: startedAt,
          ended_at: endedAt,
          duration_seconds: durationSecs,
          status: 'completed',
        })
        .select()
        .single();

      if (error) throw error;

      // Optimistically update sessions list
      const created = newSession || {
        id: `local-${Date.now()}`,
        ypt_user_id: userId,
        subject: logSubject,
        started_at: startedAt,
        ended_at: endedAt,
        duration_seconds: durationSecs,
        status: 'completed',
      };
      setSessions((prev) => [created, ...prev]);
      setSelectedDateKey(logDate);

      toast({
        title: 'Study Log Added! 🎯',
        description: `Logged ${formatHours(durationSecs)} of ${logSubject} on ${logDate}`,
      });

      setLogDialogOpen(false);
      setLogNotes('');
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Could not save log',
        description: err.message || 'Please check your connection and try again.',
      });
    } finally {
      setSavingLog(false);
    }
  };

  const openLogForDay = (dateStr: string) => {
    setLogDate(dateStr);
    setSelectedDateKey(dateStr);
    setLogDialogOpen(true);
  };

  const todaySessionsCount = sessions.filter((s) => getISTDateString(s.started_at) === istTodayStr).length;

  return (
    <div className="space-y-6 pop-in">
      {/* ───── PERFORMANCE METRIC CARDS (STITCH SCREEN 03) ───── */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-7 shadow-xs relative overflow-hidden space-y-6">
        {/* Header section inside card */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-[11px] font-semibold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5" />
              <span>DAILY STUDY METRIC</span>
            </div>
            <h3 className="text-2xl sm:text-[28px] font-bold font-display tracking-tight text-foreground mt-1.5">
              Today's Study Performance
            </h3>
            <p className="font-mono text-xs text-muted-foreground mt-0.5">
              Measured live across YPT study sessions, active timers and manual logs
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setGoalInput(String(dailyGoalHours));
              setShowGoalDialog(true);
            }}
            className="px-4 py-2 rounded-xl text-foreground font-mono font-semibold text-xs border border-border/60 transition-all flex items-center gap-2 self-start sm:self-center shadow-xs cursor-pointer"
          >
            <Target className="w-4 h-4 text-primary" />
            <span>Daily Goal: <strong className="font-bold text-foreground">{dailyGoalHours}h</strong></span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold ml-0.5">
              Change
            </span>
          </Button>
        </div>

        {/* 4 Cards Grid (Editorial Ink Layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Today Studied */}
          <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs flex flex-col justify-between min-h-[125px]">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>TODAY STUDIED</span>
            </div>
            <div className="font-mono font-bold text-3xl sm:text-[34px] tracking-tight text-foreground my-1">
              {formatHours(todaySeconds)}
            </div>
            <p className="text-[11px] font-mono text-muted-foreground font-medium">
              {todaySessionsCount} sessions logged today
            </p>
          </div>

          {/* Card 2: Study Streak */}
          <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs flex flex-col justify-between min-h-[125px]">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>STUDY STREAK</span>
            </div>
            <div className="font-mono font-bold text-3xl sm:text-[34px] tracking-tight text-foreground my-1">
              {streak} <span className="text-xl font-medium">days</span>
            </div>
            <p className="text-[11px] font-mono text-muted-foreground font-medium flex items-center gap-1">
              <span>🔥</span>
              <span>{streak > 0 ? 'Streak alive' : 'Start streak today'}</span>
            </p>
          </div>

          {/* Card 3: Daily Goal */}
          <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs flex flex-col justify-between min-h-[125px]">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              <Target className="w-3.5 h-3.5 text-emerald-500" />
              <span>DAILY GOAL ({dailyGoalHours}H)</span>
            </div>
            <div className="font-mono font-bold text-3xl sm:text-[34px] tracking-tight text-foreground my-1">
              {Math.min(100, Math.round((todaySeconds / (dailyGoalHours * 3600)) * 100))}%
            </div>
            <p className="text-[11px] font-mono text-muted-foreground font-medium">
              {(todaySeconds / 3600).toFixed(1)}h of {dailyGoalHours}h completed
            </p>
          </div>

          {/* Card 4: Total Focus */}
          <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs flex flex-col justify-between min-h-[125px]">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>TOTAL HOURS</span>
            </div>
            <div className="font-mono font-bold text-3xl sm:text-[34px] tracking-tight text-foreground my-1">
              {formatHours(monthSeconds)}
            </div>
            <p className="text-[11px] font-mono text-muted-foreground font-medium">
              This month: {formatHours(monthSeconds)}
            </p>
          </div>
        </div>

        {/* Bottom Target Gauge Horizontal Meter */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-mono font-semibold text-foreground">
            <span>Daily {dailyGoalHours}-Hour Target Progress</span>
            <span>
              {Math.min(100, Math.round((todaySeconds / (dailyGoalHours * 3600)) * 100))}% ({formatHours(todaySeconds)} / {dailyGoalHours}h)
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(1, (todaySeconds / (dailyGoalHours * 3600)) * 100))}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-muted-foreground font-mono text-[10px] mt-1">
            <span>00:00 (START)</span>
            <span>02:00 (SLOT 1)</span>
            <span>04:00 (SLOT 2)</span>
            <span>06:00 (DAILY TARGET)</span>
          </div>
        </div>
      </div>

      {/* ───── INTERACTIVE STUDY CALENDAR WITH DIRECT MANUAL LOG (STITCH SCREEN 03) ───── */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" />
              <h3 className="text-base sm:text-lg font-bold font-display uppercase tracking-wider text-foreground">
                {monthName}
              </h3>
              <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Auto-Logs Live Sessions
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-muted text-muted-foreground font-mono text-[10px] rounded-full">
                IST (UTC+05:30)
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              Live stopwatch & room sessions <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">auto-log</strong> here · <span className="text-primary font-semibold">Click any date</span> to add or inspect custom offline/coaching logs.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMonthOffset((p) => p - 1)}
              className="h-8 w-8 p-0 rounded-xl"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMonthOffset(0)}
              className="h-8 px-2.5 text-xs font-mono font-semibold rounded-xl"
            >
              Current
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMonthOffset((p) => p + 1)}
              className="h-8 w-8 p-0 rounded-xl"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => openLogForDay(selectedDateKey)}
              className="h-8 px-3 text-xs font-mono font-semibold rounded-xl bg-primary text-primary-foreground shadow-xs flex items-center gap-1.5 ml-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Time</span>
            </Button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <span
              key={d}
              className="text-[11px] font-mono font-semibold text-center text-muted-foreground uppercase tracking-wider py-1"
            >
              {d}
            </span>
          ))}
        </div>

        {/* Grid Cells */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square rounded-xl bg-muted/20" />
          ))}

          {calendarData.map((d) => {
            const intensity = d.isFuture
              ? -1
              : d.seconds === 0
              ? 0
              : d.seconds < 1800
              ? 1
              : d.seconds < 3600
              ? 2
              : d.seconds < 7200
              ? 3
              : 4;

            const bgClass =
              intensity === -1
                ? 'bg-muted/10 opacity-30 cursor-not-allowed'
                : intensity === 0
                ? 'bg-muted/30 hover:bg-muted/60 text-muted-foreground'
                : intensity === 1
                ? 'bg-primary/10 text-primary font-medium'
                : intensity === 2
                ? 'bg-primary/20 text-primary font-semibold'
                : intensity === 3
                ? 'bg-primary/35 text-foreground font-bold'
                : 'bg-primary text-primary-foreground font-bold shadow-2xs';

            return (
              <button
                key={d.day}
                type="button"
                onClick={() => setSelectedDateKey(d.dateKey)}
                className={cn(
                  'aspect-square rounded-xl p-1.5 sm:p-2 flex flex-col items-center justify-between transition-all duration-150 relative text-left group border border-border/30 cursor-pointer',
                  bgClass,
                  d.isToday && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                  d.isSelected && 'border-2 border-foreground shadow-xs scale-[1.03]'
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={cn(
                      'text-xs font-mono font-semibold leading-none',
                      d.isFuture ? 'text-muted-foreground/40' : ''
                    )}
                  >
                    {d.day}
                  </span>
                  {d.isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                  )}
                </div>

                {!d.isFuture && d.seconds > 0 ? (
                  <span className="text-[10px] sm:text-[11px] font-mono font-semibold leading-none tabular-nums px-1 py-0.5 rounded">
                    {(d.seconds / 3600).toFixed(1)}h
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-muted-foreground/50 leading-none group-hover:opacity-100 opacity-0 transition-opacity">
                    +log
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Day Inspector Panel */}
        <div className="bg-muted/20 rounded-2xl p-4 sm:p-5 border border-border/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-muted-foreground uppercase">
                Selected Day Overview:
              </span>
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                {selectedDateKey} {selectedDateKey === istTodayStr ? '(Today)' : ''}
              </span>
            </div>
            <p className="text-lg font-bold font-display text-foreground">
              {formatHours(selectedDayTotalSecs)}{' '}
              <span className="text-xs font-mono font-normal text-muted-foreground">
                ({selectedDaySessions.length} sessions logged)
              </span>
            </p>

            {/* Quick list of subjects studied on this date */}
            {selectedDaySessions.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedDaySessions.map((s, idx) => (
                  <div
                    key={s.id || idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card text-xs font-mono border border-border/60 shadow-2xs"
                  >
                    <span>{SUBJECT_EMOJIS[s.subject] || '📖'}</span>
                    <span className="font-semibold text-foreground">{s.subject}</span>
                    <span className="text-muted-foreground">({formatHours(s.duration_seconds || 0)})</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground font-mono">
                No sessions recorded on this day. Click button to log study hours!
              </p>
            )}
          </div>

          <Button
            type="button"
            onClick={() => openLogForDay(selectedDateKey)}
            className="rounded-xl px-4 py-2 font-mono font-semibold text-xs bg-primary text-primary-foreground shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Log for {selectedDateKey}</span>
          </Button>
        </div>
      </div>

      {/* ───── INSIGHT CARDS ───── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl p-5 border border-border/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xl shrink-0 border border-amber-500/20">
            🔥
          </div>
          <div>
            <span className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">
              Best Day Record
            </span>
            <p className="text-base font-bold font-display text-foreground mt-0.5">
              {bestDay ? `${bestDayName} (${formatHours(bestDay.seconds)})` : 'No logs yet'}
            </p>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shrink-0 border border-primary/20">
            🧠
          </div>
          <div>
            <span className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">
              Peak Study Hour
            </span>
            <p className="text-base font-bold font-display text-foreground mt-0.5">
              {peakHourStr} (IST)
            </p>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl shrink-0 border border-emerald-500/20">
            📈
          </div>
          <div>
            <span className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">
              Average Daily Pace
            </span>
            <p className="text-base font-bold font-display text-foreground mt-0.5">
              {formatHours(avgDaily)} / active day
            </p>
          </div>
        </div>
      </div>

      {/* ───── WEEKLY OVERVIEW GRAPH & SUBJECT MIX ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Weekly Study Rhythm (7 cols) */}
        <div className="lg:col-span-7 bg-card rounded-2xl p-5 sm:p-6 border border-border/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-foreground">
                Weekly Study Overview
              </h3>
            </div>
            <span className="text-xs font-mono font-semibold bg-muted px-2.5 py-1 rounded-lg text-foreground">
              Past 7 Days: {formatHours(weekSeconds)}
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fontWeight: 600 }}
                  stroke="hsl(var(--muted-foreground))"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                  unit="h"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(144, 74, 67, 0.05)' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                  formatter={(val: number) => [`${val} hours`, 'Study Time']}
                />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Distribution (5 cols) */}
        <div className="lg:col-span-5 bg-card rounded-2xl p-5 sm:p-6 border border-border/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-foreground">
                Subject Distribution
              </h3>
            </div>
          </div>

          {subjectData.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center font-mono">
              No study sessions logged yet. Add your first session!
            </p>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectData}
                      dataKey="hours"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      strokeWidth={2}
                      stroke="hsl(var(--card))"
                    >
                      {subjectData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: 600,
                      }}
                      formatter={(val: number) => [`${val}h`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full">
                {subjectData.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/40 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base">{SUBJECT_EMOJIS[s.name] || '📖'}</span>
                      <span className="font-semibold text-foreground truncate">{s.name}</span>
                    </div>
                    <span className="font-mono font-semibold text-muted-foreground ml-2">{s.hours}h</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ───── PEAK STUDY HOURS HEATMAP ───── */}
      <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-foreground">
              Peak Focus Hours (24-Hour IST Rhythm)
            </h3>
          </div>
          <span className="text-xs text-muted-foreground font-mono">Darker = higher focus density</span>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 pt-1">
          {heatmapData.map((d) => {
            const intensity = d.seconds / maxHourSecs;
            const opacity = d.seconds === 0 ? 0.08 : 0.2 + intensity * 0.75;
            return (
              <div
                key={d.hour}
                className="aspect-square rounded-xl flex flex-col items-center justify-center p-1 text-xs font-mono font-semibold transition-transform hover:scale-105 border border-border/30"
                style={{ backgroundColor: `hsl(var(--primary) / ${opacity})` }}
                title={`${d.hour}:00 IST – ${formatHours(d.seconds)} logged`}
              >
                <span className={d.seconds > 0 ? 'text-primary-foreground' : 'text-muted-foreground'}>
                  {d.hour}h
                </span>
                {d.seconds > 0 && (
                  <span className="text-[9px] text-primary-foreground/90 leading-none">
                    {(d.seconds / 3600).toFixed(1)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ───── MANUAL STUDY LOG DIALOG MODAL ───── */}
      <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border border-border/80 shadow-sm bg-card p-6">
          <DialogHeader>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-mono text-[11px] font-semibold uppercase tracking-wider mb-1 w-fit border border-primary/20">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>MANUAL LOG ENTRY</span>
            </div>
            <DialogTitle className="text-xl font-bold font-display text-foreground">Log Study Time to Calendar</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-mono">
              Add offline coaching hours, library study, or self-study sessions directly to your cockpit.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Date Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">
                Study Date
              </label>
              <Input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="h-10 rounded-xl font-mono text-xs border border-border/60"
              />
            </div>

            {/* Subject Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">
                Select Subject
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SUBJECTS.map((subj) => {
                  const isSelected = logSubject === subj;
                  return (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => setLogSubject(subj)}
                      className={cn(
                        'flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer',
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary shadow-xs'
                          : 'border-border/50 bg-muted/20 hover:bg-muted/50 text-foreground'
                      )}
                    >
                      <span className="text-base">{SUBJECT_EMOJIS[subj] || '📖'}</span>
                      <span>{subj}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration Input & Quick Chips */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">
                  Duration
                </label>
                <span className="text-xs font-mono font-bold text-primary">
                  Total: {logHours}h {logMinutes}m ({logHours + +(logMinutes / 60).toFixed(1)}h)
                </span>
              </div>

              {/* Quick Chips */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '30m', h: 0, m: 30 },
                  { label: '45m', h: 0, m: 45 },
                  { label: '1h', h: 1, m: 0 },
                  { label: '1.5h', h: 1, m: 30 },
                  { label: '2h', h: 2, m: 0 },
                  { label: '3h', h: 3, m: 0 },
                  { label: '4h', h: 4, m: 0 },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => setQuickDuration(chip.h, chip.m)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border transition-colors cursor-pointer',
                      logHours === chip.h && logMinutes === chip.m
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                        : 'bg-muted/30 border-border/50 hover:bg-muted text-muted-foreground'
                    )}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-muted-foreground">Hours</span>
                  <Input
                    type="number"
                    min={0}
                    max={24}
                    value={logHours}
                    onChange={(e) => setLogHours(Math.max(0, parseInt(e.target.value) || 0))}
                    className="h-10 rounded-xl font-mono text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-muted-foreground">Minutes</span>
                  <Input
                    type="number"
                    min={0}
                    max={59}
                    value={logMinutes}
                    onChange={(e) => setLogMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    className="h-10 rounded-xl font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Optional Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">
                Topic / Chapter Note (Optional)
              </label>
              <Input
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                placeholder="e.g. HC Verma Optics Ch-3, Kota Test Revision..."
                maxLength={80}
                className="h-10 rounded-xl text-xs"
              />
            </div>
          </div>

          <DialogFooter className="mt-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLogDialogOpen(false)}
              className="rounded-xl font-mono text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={savingLog || (logHours === 0 && logMinutes === 0)}
              onClick={handleSaveManualLog}
              className="rounded-xl font-mono font-semibold text-xs bg-primary text-primary-foreground shadow-xs cursor-pointer"
            >
              {savingLog ? 'Saving to Calendar...' : 'Save to Calendar 📅'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ───── EDIT DAILY GOAL DIALOG ───── */}
      <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
        <DialogContent className="sm:max-w-md bg-card border border-border/80 rounded-2xl p-6 shadow-sm">
          <DialogHeader>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold font-display text-foreground">
                  Set Daily Study Goal
                </DialogTitle>
                <DialogDescription className="text-xs font-mono text-muted-foreground">
                  Customize your daily target focus hours
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <label className="text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Quick Presets
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[4, 6, 8, 10, 12, 14].map((hours) => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => setGoalInput(String(hours))}
                    className={cn(
                      "py-2 rounded-xl text-xs font-mono font-semibold border transition-all active:scale-95 cursor-pointer",
                      parseFloat(goalInput) === hours
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-muted/30 hover:bg-muted/60 border-border/50 text-foreground"
                    )}
                  >
                    {hours}h
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Target Hours / Day
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={24}
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  className="h-10 rounded-xl font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowGoalDialog(false)}
              className="rounded-xl font-mono text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                const parsed = parseFloat(goalInput);
                if (isNaN(parsed) || parsed < 0.5 || parsed > 24) {
                  toast({
                    title: 'Invalid target',
                    description: 'Please enter a daily goal between 0.5 and 24 hours.',
                    variant: 'destructive',
                  });
                  return;
                }
                saveStoredDailyGoal(parsed);
                setDailyGoalHours(parsed);
                toast({
                  title: 'Daily Goal Updated 🎯',
                  description: `Your daily target is now set to ${parsed} hours.`,
                });
                setShowGoalDialog(false);
              }}
              className="rounded-xl font-mono font-semibold text-xs bg-primary text-primary-foreground shadow-xs cursor-pointer"
            >
              Save Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
