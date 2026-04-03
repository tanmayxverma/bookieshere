import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { SUBJECTS, formatTime, formatHours, getISTTodayStartUTC } from '@/types/ypt';
import { supabase } from '@/integrations/supabase/client';
import { Play, Pause, Square, Clock, TrendingUp, Flame, Zap, Maximize2, Minimize2, Pencil, Check } from 'lucide-react';
import type { YPTUser } from '@/types/ypt';

interface TimerControls {
  isActive: boolean;
  isPaused: boolean;
  subject: string | null;
  elapsedSeconds: number;
  startSession: (subject: string) => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => Promise<void>;
  showInactivityModal: boolean;
  inactivityCountdown: number;
  dismissInactivity: () => void;
}

interface Props {
  user: YPTUser;
  timer: TimerControls;
}

const GOALS_STORAGE_KEY = 'ypt_study_goals';

function getGoals(): { daily: number; weekly: number } {
  try {
    const raw = localStorage.getItem(GOALS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { daily: 6, weekly: 35 };
}

function saveGoals(goals: { daily: number; weekly: number }) {
  localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
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

export function V2StudyTab({ user, timer }: Props) {
  const [showSubjectSelect, setShowSubjectSelect] = useState(false);
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

  const DAILY_GOAL_HOURS = goals.daily;
  const WEEKLY_GOAL_HOURS = goals.weekly;

  const saveEditedGoals = () => {
    const d = Math.max(0.5, Math.min(24, parseFloat(editDaily) || 6));
    const w = Math.max(1, Math.min(168, parseFloat(editWeekly) || 35));
    const newGoals = { daily: d, weekly: w };
    saveGoals(newGoals);
    setGoalsState(newGoals);
    setEditingGoals(false);
  };

  useEffect(() => {
    if (!focusMode) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setFocusMode(false); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [focusMode]);

  useEffect(() => {
    if (!focusMode) return;
    const interval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 30000);
    return () => clearInterval(interval);
  }, [focusMode]);

  useEffect(() => {
    const fetchStats = async () => {
      const todayStartUTC = getISTTodayStartUTC();
      const weekStart = new Date(new Date(todayStartUTC).getTime() - 6 * 24 * 60 * 60 * 1000).toISOString();
      const yearAgo = new Date();
      yearAgo.setDate(yearAgo.getDate() - 365);

      const { data } = await (supabase as any)
        .from('study_sessions')
        .select('duration_seconds, started_at, status')
        .eq('ypt_user_id', user.id)
        .in('status', ['completed', 'active'])
        .gte('started_at', yearAgo.toISOString());

      if (data) {
        const todayStart = new Date(todayStartUTC).getTime();
        const weekStartTime = new Date(weekStart).getTime();

        const todaySessions = data.filter((s: any) => new Date(s.started_at).getTime() >= todayStart);
        const todaySecs = todaySessions.reduce((sum: number, s: any) => sum + (s.duration_seconds || 0), 0);
        const weekSessions = data.filter((s: any) => new Date(s.started_at).getTime() >= weekStartTime);
        const weekSecs = weekSessions.reduce((sum: number, s: any) => sum + (s.duration_seconds || 0), 0);

        setTodaySeconds(todaySecs);
        setWeekSeconds(weekSecs);
        setSessionCount(todaySessions.filter((s: any) => s.status === 'completed').length);

        const dayMap: Record<string, number> = {};
        data.forEach((s: any) => {
          const d = new Date(s.started_at);
          const utc = d.getTime() + d.getTimezoneOffset() * 60000;
          const ist = new Date(utc + 5.5 * 60 * 60 * 1000);
          const key = ist.toISOString().split('T')[0];
          dayMap[key] = (dayMap[key] || 0) + (s.duration_seconds || 0);
        });

        let s = 0;
        for (let i = 0; i < 365; i++) {
          const now = new Date();
          const utc = now.getTime() + now.getTimezoneOffset() * 60000;
          const ist = new Date(utc + 5.5 * 60 * 60 * 1000);
          ist.setDate(ist.getDate() - i);
          const key = ist.toISOString().split('T')[0];
          let daySecs = dayMap[key] || 0;
          if (i === 0) daySecs += (timer.isActive ? timer.elapsedSeconds : 0);
          if (daySecs >= 900) s++;
          else break;
        }
        setStreak(s);

        const sortedDays = Object.entries(dayMap)
          .filter(([, v]) => v >= 900)
          .map(([k]) => k)
          .sort();
        let longest = 0, current = 1;
        for (let i = 1; i < sortedDays.length; i++) {
          const prev = new Date(sortedDays[i - 1] + 'T00:00:00');
          const curr = new Date(sortedDays[i] + 'T00:00:00');
          const diffDays = (curr.getTime() - prev.getTime()) / 86400000;
          if (diffDays === 1) current++;
          else { longest = Math.max(longest, current); current = 1; }
        }
        longest = Math.max(longest, current, s);
        setLongestStreak(sortedDays.length > 0 ? longest : 0);
      }
    };
    fetchStats();
  }, [user.id, timer.isActive, timer.elapsedSeconds]);

  const liveTodaySeconds = todaySeconds + (timer.isActive ? timer.elapsedSeconds : 0);
  const liveWeekSeconds = weekSeconds + (timer.isActive ? timer.elapsedSeconds : 0);
  const dailyProgress = Math.min(100, (liveTodaySeconds / (DAILY_GOAL_HOURS * 3600)) * 100);
  const weeklyProgress = Math.min(100, (liveWeekSeconds / (WEEKLY_GOAL_HOURS * 3600)) * 100);

  const handleStart = async (subject: string) => {
    setShowSubjectSelect(false);
    await timer.startSession(subject);
  };

  // Focus Mode
  if (focusMode && timer.isActive) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] breathing-glow" />
          <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-primary/3 blur-[100px] breathing-glow" style={{ animationDelay: '3s' }} />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-8 pop-in">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <span className="text-base font-medium text-muted-foreground">{timer.subject}</span>
          </div>

          <div className="relative">
            <p className="text-7xl md:text-8xl lg:text-9xl font-mono font-bold tracking-tight tabular-nums text-foreground select-none">
              {formatTime(timer.elapsedSeconds)}
            </p>
            {!timer.isPaused && (
              <div className="absolute -inset-6 rounded-3xl bg-primary/5 animate-[pulse_3s_ease-in-out_infinite] -z-10" />
            )}
          </div>

          <p className="text-sm text-muted-foreground/60 italic font-medium transition-opacity duration-500 h-5">
            "{MOTIVATIONAL_QUOTES[quoteIndex]}"
          </p>

          <div className="w-72 space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground/50 uppercase tracking-wider">
              <span>Today</span>
              <span>{formatHours(liveTodaySeconds)} / {DAILY_GOAL_HOURS}h</span>
            </div>
            <Progress value={dailyProgress} className="h-1.5" />
          </div>

          <div className="flex items-center gap-3">
            {timer.isPaused ? (
              <Button onClick={timer.resumeSession} size="lg" className="px-8 h-12 text-base btn-lift">
                <Play className="h-5 w-5 mr-2" /> Resume
              </Button>
            ) : (
              <Button onClick={timer.pauseSession} variant="secondary" size="lg" className="px-8 h-12 text-base active:scale-95 transition-transform">
                <Pause className="h-5 w-5 mr-2" /> Pause
              </Button>
            )}
            <Button onClick={timer.endSession} variant="destructive" size="lg" className="px-8 h-12 text-base active:scale-95 transition-transform">
              <Square className="h-5 w-5 mr-2" /> Stop
            </Button>
          </div>

          <button
            onClick={() => setFocusMode(false)}
            className="flex items-center gap-2 text-sm text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors mt-4"
          >
            <Minimize2 className="h-4 w-4" /> Press ESC to exit focus mode
          </button>
        </div>

        <AlertDialog open={timer.showInactivityModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you still studying?</AlertDialogTitle>
              <AlertDialogDescription>
                3 hours straight — session auto-ends in {timer.inactivityCountdown}s.
              </AlertDialogDescription>
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

  return (
    <div className="space-y-6 pop-in">
      {/* Timer Card */}
      <Card className="relative overflow-hidden liquid-glass">
        {timer.isActive && !timer.isPaused && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[200px] rounded-full bg-primary/5 blur-[60px] breathing-glow" />
          </div>
        )}
        <div className="relative p-8 md:p-10 text-center">
          {timer.isActive ? (
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-base font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                {timer.subject}
              </div>

              <p className="text-6xl md:text-7xl font-mono font-bold tracking-tight tabular-nums select-none">
                {formatTime(timer.elapsedSeconds)}
              </p>

              <div className="flex justify-center gap-3">
                {timer.isPaused ? (
                  <Button onClick={timer.resumeSession} size="lg" className="px-7 h-12 text-base btn-lift">
                    <Play className="h-5 w-5 mr-2" /> Resume
                  </Button>
                ) : (
                  <Button onClick={timer.pauseSession} variant="secondary" size="lg" className="px-7 h-12 text-base active:scale-95 transition-transform">
                    <Pause className="h-5 w-5 mr-2" /> Pause
                  </Button>
                )}
                <Button onClick={timer.endSession} variant="destructive" size="lg" className="px-7 h-12 text-base active:scale-95 transition-transform">
                  <Square className="h-5 w-5 mr-2" /> Stop
                </Button>
                <Button
                  onClick={() => setFocusMode(true)}
                  variant="outline"
                  size="lg"
                  className="px-4 h-12 active:scale-95 transition-transform"
                  title="Focus Mode"
                >
                  <Maximize2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5 py-2">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold font-display">Start Studying</h2>
                <p className="text-base text-muted-foreground">Choose a subject and begin your session</p>
              </div>
              <Button
                size="lg"
                className="text-lg px-10 h-14 btn-lift"
                onClick={() => setShowSubjectSelect(true)}
              >
                <Play className="h-5 w-5 mr-2" /> Start Studying
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<Clock className="h-5 w-5" />} label="Today" value={formatHours(liveTodaySeconds)} />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="This Week" value={formatHours(liveWeekSeconds)} />
        <StatCard icon={<Flame className="h-5 w-5" />} label="Streak" value={`${streak} 🔥`} subtitle={longestStreak > 0 ? `Best: ${longestStreak}d` : undefined} highlight={streak > 0} />
        <StatCard icon={<Zap className="h-5 w-5" />} label="Sessions" value={`${sessionCount}`} />
      </div>

      {/* Progress Section */}
      <Card className="p-6 space-y-5 border-border/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Study Goals</h3>
          {editingGoals ? (
            <button onClick={saveEditedGoals} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors">
              <Check className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={() => { setEditDaily(String(goals.daily)); setEditWeekly(String(goals.weekly)); setEditingGoals(true); }} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {editingGoals ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Daily Goal (hours)</label>
              <Input type="number" value={editDaily} onChange={e => setEditDaily(e.target.value)} min={0.5} max={24} step={0.5} className="h-10" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Weekly Goal (hours)</label>
              <Input type="number" value={editWeekly} onChange={e => setEditWeekly(e.target.value)} min={1} max={168} step={1} className="h-10" />
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-muted-foreground">{formatHours(liveTodaySeconds)}</span>
                <span className="text-muted-foreground">{DAILY_GOAL_HOURS}h daily goal</span>
              </div>
              <Progress value={dailyProgress} className="h-2.5" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-muted-foreground">{formatHours(liveWeekSeconds)}</span>
                <span className="text-muted-foreground">{WEEKLY_GOAL_HOURS}h weekly goal</span>
              </div>
              <Progress value={weeklyProgress} className="h-2.5" />
            </div>
          </>
        )}
      </Card>

      {/* Subject Selection Dialog */}
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

      {/* Inactivity Modal */}
      <AlertDialog open={timer.showInactivityModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you still studying?</AlertDialogTitle>
            <AlertDialogDescription>
              3 hours straight — session auto-ends in {timer.inactivityCountdown}s.
            </AlertDialogDescription>
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

function StatCard({ icon, label, value, subtitle, highlight }: { icon: React.ReactNode; label: string; value: string; subtitle?: string; highlight?: boolean }) {
  return (
    <Card className={`p-4 card-glow border-border/50 ${highlight ? 'border-primary/20' : ''}`}>
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </Card>
  );
}
