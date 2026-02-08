import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { YPTTodoList } from './YPTTodoList';
import { SUBJECTS, formatTime, formatHours, getISTTodayStartUTC } from '@/types/ypt';
import { supabase } from '@/integrations/supabase/client';
import { Play, Pause, Square, BookOpen, Clock, TrendingUp } from 'lucide-react';
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

export function YPTStudyView({ user, timer }: Props) {
  const [showSubjectSelect, setShowSubjectSelect] = useState(false);
  const [todaySeconds, setTodaySeconds] = useState(0);
  const [weekSeconds, setWeekSeconds] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      const todayStartUTC = getISTTodayStartUTC();
      const weekStart = new Date(new Date(todayStartUTC).getTime() - 6 * 24 * 60 * 60 * 1000).toISOString();

      const { data } = await (supabase as any)
        .from('study_sessions')
        .select('duration_seconds, started_at, status')
        .eq('ypt_user_id', user.id)
        .in('status', ['completed', 'active'])
        .gte('started_at', weekStart);

      if (data) {
        const todayStart = new Date(todayStartUTC).getTime();
        const todaySecs = data
          .filter((s: any) => new Date(s.started_at).getTime() >= todayStart)
          .reduce((sum: number, s: any) => sum + (s.duration_seconds || 0), 0);
        const weekSecs = data.reduce((sum: number, s: any) => sum + (s.duration_seconds || 0), 0);
        setTodaySeconds(todaySecs);
        setWeekSeconds(weekSecs);
      }
    };
    fetchStats();
  }, [user.id, timer.isActive, timer.elapsedSeconds]);

  // Add live session time to today's total
  const liveTodaySeconds = todaySeconds + (timer.isActive ? timer.elapsedSeconds : 0);

  const handleStart = async (subject: string) => {
    setShowSubjectSelect(false);
    await timer.startSession(subject);
  };

  return (
    <div className="space-y-6">
      {/* Timer Card */}
      <Card className="p-8 text-center">
        {timer.isActive ? (
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {timer.subject}
            </div>
            <p className="text-6xl md:text-7xl font-mono font-bold tracking-tight">
              {formatTime(timer.elapsedSeconds)}
            </p>
            <div className="flex justify-center gap-3">
              {timer.isPaused ? (
                <Button onClick={timer.resumeSession} size="lg" className="px-6">
                  <Play className="h-4 w-4 mr-2" /> Resume
                </Button>
              ) : (
                <Button onClick={timer.pauseSession} variant="secondary" size="lg" className="px-6">
                  <Pause className="h-4 w-4 mr-2" /> Pause
                </Button>
              )}
              <Button onClick={timer.endSession} variant="destructive" size="lg" className="px-6">
                <Square className="h-4 w-4 mr-2" /> End Session
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 py-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-1">Ready to study?</h2>
              <p className="text-sm text-muted-foreground">Pick a subject and start your session</p>
            </div>
            <Button size="lg" className="text-base px-10 h-12" onClick={() => setShowSubjectSelect(true)}>
              <Play className="h-4 w-4 mr-2" /> Start Studying
            </Button>
          </div>
        )}
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium">Today</span>
          </div>
          <p className="text-2xl font-bold">{formatHours(liveTodaySeconds)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">This Week</span>
          </div>
          <p className="text-2xl font-bold">{formatHours(weekSeconds + (timer.isActive ? timer.elapsedSeconds : 0))}</p>
        </Card>
      </div>

      {/* Todo List */}
      <YPTTodoList userId={user.id} />

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
                className="h-16 text-base font-medium"
                onClick={() => handleStart(s)}
              >
                {s}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Inactivity Modal with 15s countdown */}
      <AlertDialog open={timer.showInactivityModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you still studying?</AlertDialogTitle>
            <AlertDialogDescription>
              You've been studying for 3 hours straight. Your session will auto-end in {timer.inactivityCountdown} seconds if you don't respond.
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
