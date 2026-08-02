import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { formatHours, getISTTodayStartUTC, getISTDate } from '@/types/ypt';
import { Trophy } from 'lucide-react';
import { YPTLeaderboardSkeleton } from '@/components/YPT/YPTSkeletons';

interface Props {
  currentUserId: string;
  liveElapsed?: number;
}

interface LeaderboardEntry {
  userId: string;
  name: string;
  jeeYear: string;
  totalSeconds: number;
}

export function V2LeaderboardTab({ currentUserId, liveElapsed = 0 }: Props) {
  const [todayBoard, setTodayBoard] = useState<LeaderboardEntry[]>([]);
  const [weekBoard, setWeekBoard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('today');

  const fetchLeaderboard = async () => {
    await (supabase as any).rpc('cleanup_stale_sessions');
    const todayStartUTC = getISTTodayStartUTC();
    const weekStartDate = getISTDate();
    weekStartDate.setDate(weekStartDate.getDate() - 6);
    weekStartDate.setHours(0, 0, 0, 0);
    const weekStartUTC = new Date(weekStartDate.getTime() - 5.5 * 60 * 60 * 1000).toISOString();

    const { data: sessions } = await (supabase as any)
      .from('study_sessions')
      .select('ypt_user_id, duration_seconds, status, started_at, ypt_users(name, jee_focus_year)')
      .in('status', ['completed', 'active'])
      .gte('started_at', weekStartUTC);

    if (!sessions) { setLoading(false); return; }

    const todayMap: Record<string, LeaderboardEntry> = {};
    const weekMap: Record<string, LeaderboardEntry> = {};

    sessions.forEach((s: any) => {
      const uid = s.ypt_user_id;
      // The current user's live session is added separately via liveElapsed —
      // counting its heartbeat duration here would double it.
      if (s.status === 'active' && uid === currentUserId) return;
      const entry = { userId: uid, name: s.ypt_users?.name || 'Unknown', jeeYear: s.ypt_users?.jee_focus_year || '', totalSeconds: 0 };
      if (!weekMap[uid]) weekMap[uid] = { ...entry };
      weekMap[uid].totalSeconds += s.duration_seconds || 0;
      if (new Date(s.started_at).toISOString() >= todayStartUTC) {
        if (!todayMap[uid]) todayMap[uid] = { ...entry };
        todayMap[uid].totalSeconds += s.duration_seconds || 0;
      }
    });

    setTodayBoard(Object.values(todayMap).sort((a, b) => b.totalSeconds - a.totalSeconds));
    setWeekBoard(Object.values(weekMap).sort((a, b) => b.totalSeconds - a.totalSeconds));
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <YPTLeaderboardSkeleton />;

  const mergeBoard = (board: LeaderboardEntry[]) =>
    board.map((u) => u.userId === currentUserId && liveElapsed > 0
      ? { ...u, totalSeconds: u.totalSeconds + liveElapsed }
      : u
    ).sort((a, b) => b.totalSeconds - a.totalSeconds);

  const renderBoard = (board: LeaderboardEntry[]) => {
    const display = mergeBoard(board);
    const top10 = display.slice(0, 10);
    const userRank = display.findIndex(u => u.userId === currentUserId) + 1;
    const userEntry = display.find(u => u.userId === currentUserId);

    return (
      <div className="space-y-4">
        {top10.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground border-border/50 text-base">
            No sessions recorded. Be the first!
          </Card>
        ) : (
          <ScrollArea className="h-[55vh]">
            <div className="space-y-2 pr-2">
              {top10.map((u, i) => {
                const isMe = u.userId === currentUserId;
                const isTop3 = i < 3;
                return (
                  <div
                    key={u.userId}
                    className={`relative flex items-center gap-4 p-4 rounded-xl transition-all duration-200 pop-in overflow-hidden ${
                      isMe
                        ? 'bg-primary/8 border border-primary/30 shadow-sm shine-card'
                        : isTop3
                          ? 'bg-card border border-primary/15 card-glow hover:shadow-md'
                          : 'bg-card border border-border/30 card-glow hover:shadow-sm hover:border-border/60'
                    }`}
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
                    {isTop3 && (
                      <div className="absolute inset-0 aurora-bg opacity-40 pointer-events-none" />
                    )}
                    <div className="relative flex items-center gap-4 w-full">
                    <div className="w-9 text-center shrink-0">
                      {i === 0 ? <span className="text-xl">🥇</span>
                        : i === 1 ? <span className="text-xl">🥈</span>
                        : i === 2 ? <span className="text-xl">🥉</span>
                        : <span className="text-base font-bold text-muted-foreground">#{i + 1}</span>
                      }
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      i < 3 ? 'bg-primary/10 text-primary' : 'bg-muted text-foreground/70'
                    }`}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-base truncate ${isMe ? 'text-primary' : ''}`}>
                        {u.name} {isMe && <span className="text-xs text-muted-foreground">(you)</span>}
                      </p>
                      <p className="text-sm text-muted-foreground">{u.jeeYear}</p>
                    </div>
                    <span className="font-bold text-base tabular-nums">{formatHours(u.totalSeconds)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {userEntry && userRank > 10 && (
          <Card className="p-5 border-primary/20 bg-primary/5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-2">Your Rank</p>
            <div className="flex items-center gap-4">
              <span className="w-9 text-center font-bold text-primary text-lg">#{userRank}</span>
              <div className="flex-1">
                <p className="font-semibold text-base">{userEntry.name}</p>
              </div>
              <span className="font-bold text-base tabular-nums">{formatHours(userEntry.totalSeconds)}</span>
            </div>
          </Card>
        )}

        {userEntry && userRank > 0 && userRank <= 10 && (
          <p className="text-center text-base text-muted-foreground py-1">
            You're ranked <strong className="text-foreground">#{userRank}</strong> 🎯
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 pop-in">
      <div className="flex items-center gap-2.5 mb-2">
        <Trophy className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Leaderboard</h3>
        <span className="text-xs text-muted-foreground ml-auto font-medium">
          {period === 'today' ? 'Resets daily at 12:00 AM IST' : 'Rolling last 7 days · IST'}
        </span>
      </div>

      <Tabs value={period} onValueChange={setPeriod}>
        <TabsList className="w-full h-11">
          <TabsTrigger value="today" className="flex-1 text-sm font-semibold">Daily</TabsTrigger>
          <TabsTrigger value="weekly" className="flex-1 text-sm font-semibold">Weekly</TabsTrigger>
        </TabsList>
        <TabsContent value="today" className="mt-4">
          {renderBoard(todayBoard)}
        </TabsContent>
        <TabsContent value="weekly" className="mt-4">
          {renderBoard(weekBoard)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
