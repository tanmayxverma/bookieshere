import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { formatHours, getISTTodayStartUTC, getISTDate } from '@/types/ypt';
import { Trophy, Flame } from 'lucide-react';
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
  streak?: number;
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
      const entry = {
        userId: uid,
        name: s.ypt_users?.name || 'Unknown',
        jeeYear: s.ypt_users?.jee_focus_year || '',
        totalSeconds: 0,
      };

      // Week
      if (!weekMap[uid]) weekMap[uid] = { ...entry };
      weekMap[uid].totalSeconds += s.duration_seconds || 0;

      // Today
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
          <Card className="p-8 text-center text-muted-foreground border-border/50">
            No sessions recorded. Be the first!
          </Card>
        ) : (
          <div className="space-y-2">
            {top10.map((u, i) => {
              const isMe = u.userId === currentUserId;
              return (
                <div
                  key={u.userId}
                  className={`flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 pop-in ${
                    isMe
                      ? 'bg-primary/8 border border-primary/20 shadow-sm'
                      : 'bg-card border border-border/30 card-glow'
                  }`}
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  {/* Rank */}
                  <div className="w-8 text-center shrink-0">
                    {i === 0 ? <span className="text-lg">🥇</span>
                      : i === 1 ? <span className="text-lg">🥈</span>
                      : i === 2 ? <span className="text-lg">🥉</span>
                      : <span className="text-sm font-bold text-muted-foreground">#{i + 1}</span>
                    }
                  </div>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    i < 3 ? 'bg-primary/10 text-primary' : 'bg-muted text-foreground/70'
                  }`}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${isMe ? 'text-primary' : ''}`}>
                      {u.name} {isMe && <span className="text-[10px] text-muted-foreground">(you)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{u.jeeYear}</p>
                  </div>
                  {/* Time */}
                  <span className="font-semibold text-sm tabular-nums">{formatHours(u.totalSeconds)}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Show user rank if outside top 10 */}
        {userEntry && userRank > 10 && (
          <Card className="p-4 border-primary/20 bg-primary/5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Your Rank</p>
            <div className="flex items-center gap-3">
              <span className="w-8 text-center font-bold text-primary">#{userRank}</span>
              <div className="flex-1">
                <p className="font-medium text-sm">{userEntry.name}</p>
              </div>
              <span className="font-semibold text-sm tabular-nums">{formatHours(userEntry.totalSeconds)}</span>
            </div>
          </Card>
        )}

        {userEntry && userRank > 0 && userRank <= 10 && (
          <p className="text-center text-sm text-muted-foreground py-1">
            You're ranked <strong className="text-foreground">#{userRank}</strong> 🎯
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 pop-in">
      <div className="flex items-center gap-2 mb-2">
        <Trophy className="h-4 w-4 text-primary" />
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Leaderboard</h3>
        <span className="text-[10px] text-muted-foreground ml-auto">Resets at 12:00 AM IST</span>
      </div>

      <Tabs value={period} onValueChange={setPeriod}>
        <TabsList className="w-full">
          <TabsTrigger value="today" className="flex-1">Today</TabsTrigger>
          <TabsTrigger value="weekly" className="flex-1">This Week</TabsTrigger>
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
