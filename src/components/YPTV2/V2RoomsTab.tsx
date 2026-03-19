import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, BookOpen, Play, Zap } from 'lucide-react';
import { SUBJECTS } from '@/types/ypt';
import type { ActiveStudyUser, YPTUser } from '@/types/ypt';

interface TimerControls {
  isActive: boolean;
  isPaused: boolean;
  subject: string | null;
  startSession: (subject: string) => Promise<void>;
  [key: string]: any;
}

interface Props {
  activeUsers: ActiveStudyUser[];
  currentUser: YPTUser;
  timer: TimerControls;
}

const ROOM_DESCRIPTIONS: Record<string, string> = {
  'Physics': 'Mechanics, Electrodynamics, Optics & Modern Physics',
  'Chemistry': 'Physical, Organic & Inorganic Chemistry',
  'Mathematics': 'Calculus, Algebra, Coordinate Geometry & more',
  'Self Study': 'Revision, problem solving & mixed practice',
};

const ROOM_ICONS: Record<string, string> = {
  'Physics': '⚡',
  'Chemistry': '🧪',
  'Mathematics': '📐',
  'Self Study': '📚',
};

export function V2RoomsTab({ activeUsers, currentUser, timer }: Props) {
  const [showJoinDialog, setShowJoinDialog] = useState(false);

  // Group by subject to create "rooms"
  const rooms: Record<string, ActiveStudyUser[]> = {};
  // Always show all 4 subject rooms
  SUBJECTS.forEach(s => { rooms[s] = []; });
  activeUsers.forEach((u) => {
    const room = u.subject || 'Self Study';
    if (!rooms[room]) rooms[room] = [];
    rooms[room].push(u);
  });

  const roomList = Object.entries(rooms).sort((a, b) => b[1].length - a[1].length);
  const totalOnline = activeUsers.length;

  const handleJoinRoom = async (subject: string) => {
    if (timer.isActive) return;
    await timer.startSession(subject);
  };

  const isInRoom = (subject: string) => timer.isActive && timer.subject === subject;

  return (
    <div className="space-y-6 pop-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Study Rooms</h3>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {totalOnline} studying now
          </p>
        </div>
        {!timer.isActive && (
          <Button size="sm" className="btn-lift active:scale-95 transition-transform" onClick={() => setShowJoinDialog(true)}>
            <Play className="h-3.5 w-3.5 mr-1.5" /> Quick Join
          </Button>
        )}
      </div>

      {/* Room Cards */}
      <div className="space-y-3">
        {roomList.map(([subject, users], idx) => {
          const inThisRoom = isInRoom(subject);
          return (
            <Card
              key={subject}
              className={`border-border/50 overflow-hidden card-glow pop-in ${inThisRoom ? 'border-primary/30 bg-primary/5' : ''}`}
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              {/* Room Header */}
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg">
                    {ROOM_ICONS[subject] || '📖'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      {subject}
                      {inThisRoom && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">You're here</span>
                      )}
                    </h4>
                    <p className="text-xs text-muted-foreground">{ROOM_DESCRIPTIONS[subject] || 'Study together'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {users.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      {users.length}
                    </span>
                  )}
                  {!timer.isActive && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs active:scale-95 transition-transform"
                      onClick={() => handleJoinRoom(subject)}
                    >
                      Join
                    </Button>
                  )}
                </div>
              </div>

              {/* Users in room */}
              {users.length > 0 && (
                <div className="px-5 pb-4 space-y-2.5 border-t border-border/20 pt-3">
                  {users.map((u, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-foreground/70 shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{u.name}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{u.jee_focus_year}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Empty state when nobody at all */}
      {totalOnline === 0 && (
        <Card className="p-6 text-center border-border/50 border-dashed">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Zap className="h-6 w-6 opacity-30" />
            <p className="text-sm">All rooms are empty. Start studying to be the first!</p>
          </div>
        </Card>
      )}

      {/* Quick Join Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Join a study room</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 pt-2">
            {SUBJECTS.map((s) => (
              <Button
                key={s}
                variant="outline"
                className="h-16 text-base font-medium card-glow active:scale-95 transition-transform flex flex-col gap-1"
                onClick={() => { setShowJoinDialog(false); handleJoinRoom(s); }}
              >
                <span>{ROOM_ICONS[s]}</span>
                <span className="text-sm">{s}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
