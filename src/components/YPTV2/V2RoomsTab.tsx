import { Card } from '@/components/ui/card';
import { Users, BookOpen } from 'lucide-react';
import type { ActiveStudyUser } from '@/types/ypt';

interface Props {
  activeUsers: ActiveStudyUser[];
}

export function V2RoomsTab({ activeUsers }: Props) {
  // Group by subject to create "rooms"
  const rooms: Record<string, ActiveStudyUser[]> = {};
  activeUsers.forEach((u) => {
    const room = u.subject || 'General';
    if (!rooms[room]) rooms[room] = [];
    rooms[room].push(u);
  });

  const roomList = Object.entries(rooms).sort((a, b) => b[1].length - a[1].length);

  return (
    <div className="space-y-6 pop-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Study Rooms</h3>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse mr-1.5" />
            {activeUsers.length} studying now
          </p>
        </div>
      </div>

      {activeUsers.length === 0 ? (
        <Card className="p-8 text-center border-border/50">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Users className="h-8 w-8 opacity-30" />
            <p className="text-sm">No one studying right now. Be the first!</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {roomList.map(([subject, users], idx) => (
            <Card key={subject} className="border-border/50 overflow-hidden card-glow pop-in" style={{ animationDelay: `${idx * 0.08}s` }}>
              {/* Room Header */}
              <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{subject}</h4>
                    <p className="text-xs text-muted-foreground">{users.length} active</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live
                </span>
              </div>
              {/* Users */}
              <div className="p-4 space-y-3">
                {users.map((u, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground/70 shrink-0">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.jee_focus_year}</p>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
