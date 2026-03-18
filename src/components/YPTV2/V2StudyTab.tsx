import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SUBJECTS, formatTime, formatHours, getISTTodayStartUTC } from '@/types/ypt';
import { supabase } from '@/integrations/supabase/client';
import { Play, Pause, Square, Clock, TrendingUp, Flame, Zap, Maximize2, Minimize2 } from 'lucide-react';
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

const DAILY_GOAL_HOURS = 6;
const WEEKLY_GOAL_HOURS = 35;

const MOTIVATIONAL_QUOTES = [
  "Discipline > Motivation",
  "AIR 1 is built here",
  "Consistency beats intensity",
  "Every second counts",
  "Focus is your superpower",
];

export function V2StudyTab({ user, timer }: Props) {
  const [showSubjectSelect, setShowSubjectSelect] = useState(false);
  const [todaySeconds, setTodaySeconds] = useState(0);
  const [weekSeconds, setWeekSeconds] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [focusMode, setFocusMode] = useState(false);
  const [quoteIndex] = useState(() => Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));

  useEffect(() => {
    const fetchStats = async () => {
      const todayStartUTC = getISTTodayStartUTC();
      const weekStart = new Date(new Date(todayStartUTC).getTime() - 6 * 24 * 60 * 60 * 1000).toISOString();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 365);

      const { data } = await (supabase as any)
        .from('study_sessions')
        .select('duration_seconds, started_at, status')
        .eq('ypt_user_id', user.id)
        .in('status', ['completed', 'active'])
        .gte('started_at', thirtyDaysAgo.toISOString());

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

        // Calculate streak
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
        {/* Subtle gradient glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px] breathing-glow" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-8 pop-in">
          {/* Subject */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground">{timer.subject}</span>
          </div>

          {/* Timer */}
          <div className="relative">
            <p className="text-7xl md:text-8xl lg:text-9xl font-mono font-bold tracking-tight tabular-nums text-foreground">
              {formatTime(timer.elapsedSeconds)}
            </p>
            {!timer.isPaused && (
              <div className="absolute -inset-4 rounded-3xl bg-primary/5 animate-[pulse_3s_ease-in-out_infinite] -z-10" />
            )}
          </div>

          {/* Quote */}
          <p className="text-sm text-muted-foreground/60 italic font-medium">
            "{MOTIVATIONAL_QUOTES[quoteIndex]}"
          </p>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {timer.isPaused ? (
              <Button onClick={timer.resumeSession} size="lg" className="px-8 btn-lift">
                <Play className="h-4 w-4 mr-2" /> Resume
              </Button>
            ) : (
              <Button onClick={timer.pauseSession} variant="secondary" size="lg" className="px-8">
                <Pause className="h-4 w-4 mr-2" /> Pause
              </Button>
            )}
            <Button onClick={timer.endSession} variant="destructive" size="lg" className="px-8">
              <Square className="h-4 w-4 mr-2" /> Stop
            </Button>
          </div>

          {/* Exit focus */}
          <button
            onClick={() => setFocusMode(false)}
            className="flex items-center gap-2 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors mt-4"
          >
            <Minimize2 className="h-3.5 w-3.5" /> Press ESC or click to exit focus mode
          </button>
        </div>

        {/* Inactivity Modal */}
        <AlertDialog open={timer.showInactivityModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you still studying?</AlertDialogTitle>
              <AlertDialogDescription>
                3 hours straight. Session auto-ends in {timer.inactivityCountdown}s.
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

  // ESC handler for focus mode
  if (focusMode) {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFocusMode(false);
    };
    window.addEventListener('keydown', handleEsc);
    setTimeout(() => window.removeEventListener('keydown', handleEsc), 100);
  }

  return (
    <div className="space-y-6 pop-in">
      {/* Timer Card */}
      <Card className="relative overflow-hidden border-border/50">
        {timer.isActive && !timer.isPaused && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[200px] rounded-full bg-primary/5 blur-[60px] breathing-glow" />
          </div>
        )}
        <div className="relative p-8 md:p-10 text-center">
          {timer.isActive ? (
            <div className="space-y-6">
              {/* Subject badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                {timer.subject}
              </div>

              {/* Timer display */}
              <p className="text-6xl md:text-7xl font-mono font-bold tracking-tight tabular-nums">
                {formatTime(timer.elapsedSeconds)}
              </p>

              {/* Controls */}
              <div className="flex justify-center gap-3">
                {timer.isPaused ? (
                  <Button onClick={timer.resumeSession} size="lg" className="px-6 btn-lift">
                    <Play className="h-4 w-4 mr-2" /> Resume
                  </Button>
                ) : (
                  <Button onClick={timer.pauseSession} variant="secondary" size="lg" className="px-6">
                    <Pause className="h-4 w-4 mr-2" /> Pause
                  </Button>
                )}
                <Button onClick={timer.endSession} variant="destructive" size="lg" className="px-6">
                  <Square className="h-4 w-4 mr-2" /> Stop
                </Button>
                <Button
                  onClick={() => setFocusMode(true)}
                  variant="outline"
                  size="lg"
                  className="px-4"
                  title="Focus Mode"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5 py-2">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold font-display">Start Studying</h2>
                <p className="text-sm text-muted-foreground">Choose a subject and begin your session</p>
              </div>
              <Button
                size="lg"
                className="text-base px-10 h-12 btn-lift"
                onClick={() => setShowSubjectSelect(true)}
              >
                <Play className="h-4 w-4 mr-2" /> Start Studying
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<Clock className="h-4 w-4" />} label="Today" value={formatHours(liveTodaySeconds)} />
        <StatCard icon={<TrendingUp className="h-4 w-4" />} label="This Week" value={formatHours(liveWeekSeconds)} />
        <StatCard icon={<Flame className="h-4 w-4" />} label="Streak" value={`${streak} 🔥`} highlight={streak > 0} />
        <StatCard icon={<Zap className="h-4 w-4" />} label="Sessions" value={`${sessionCount}`} />
      </div>

      {/* Progress Section */}
      <Card className="p-5 space-y-4 border-border/50">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Daily Goal</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{formatHours(liveTodaySeconds)}</span>
            <span className="text-muted-foreground">{DAILY_GOAL_HOURS}h goal</span>
          </div>
          <Progress value={dailyProgress} className="h-2" />
        </div>

        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pt-2">Weekly Goal</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{formatHours(liveWeekSeconds)}</span>
            <span className="text-muted-foreground">{WEEKLY_GOAL_HOURS}h goal</span>
          </div>
          <Progress value={weeklyProgress} className="h-2" />
        </div>
      </Card>

      {/* Subject Selection Dialog */}
      <Dialog open={showSubjectSelect} onOpenChange={setShowSubjectSelect}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>What are you studying?</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 pt-2">
            {SUBJECTS.map((s) => (
              <Button
                key={s}
                variant="outline"
                className="h-16 text-base font-medium card-glow"
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
              3 hours straight. Session auto-ends in {timer.inactivityCountdown}s.
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

function StatCard({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <Card className={`p-4 card-glow border-border/50 ${highlight ? 'border-primary/20' : ''}`}>
      <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-bold tabular-nums">{value}</p>
    </Card>
  );
}
