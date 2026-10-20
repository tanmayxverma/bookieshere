import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { formatHours, getISTTodayStartUTC } from '@/types/ypt';
import { Trophy } from 'lucide-react';
import { YPTLeaderboardSkeleton } from './YPTSkeletons';

interface Props {
  currentUserId: string;
  /** Current user's live elapsed seconds from an active session */
  liveElapsed?: number;
}

interface LeaderboardEntry {
  userId: string;
  name: string;
  jeeYear: string;
  totalSeconds: number;
}

let yptLeaderboardCache: {
  board: LeaderboardEntry[];
  timestamp: number;
} | null = null;
const CACHE_TTL_MS = 2 * 60 * 1000;

export function YPTLeaderboard({ currentUserId, liveElapsed = 0 }: Props) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => yptLeaderboardCache?.board || []);
  const [loading, setLoading] = useState(() => !yptLeaderboardCache);

  const fetchLeaderboard = async (force = false) => {
    if (!force && yptLeaderboardCache && Date.now() - yptLeaderboardCache.timestamp < CACHE_TTL_MS) {
      setLeaderboard(yptLeaderboardCache.board);
      setLoading(false);
      return;
    }

    try {
      const { data: rpcData, error } = await (supabase as any).rpc('get_leaderboard_today', { top_n: 50 });
      if (rpcData && !error) {
        const board: LeaderboardEntry[] = rpcData.map((r: any) => ({
          userId: r.user_id,
          name: r.name || 'Unknown',
          jeeYear: r.jee_year || '',
          totalSeconds: Number(r.total_seconds) || 0,
        }));
        yptLeaderboardCache = { board, timestamp: Date.now() };
        setLeaderboard(board);
        setLoading(false);
        return;
      }
    } catch {}

    const todayStartUTC = getISTTodayStartUTC();

    const { data: sessions } = await (supabase as any)
      .from('study_sessions')
      .select('ypt_user_id, duration_seconds, status, ypt_users(name, jee_focus_year)')
      .in('status', ['completed', 'active'])
      .gte('started_at', todayStartUTC);

    if (!sessions) { setLoading(false); return; }

    const userMap: Record<string, LeaderboardEntry> = {};
    sessions.forEach((s: any) => {
      const uid = s.ypt_user_id;
      if (!userMap[uid]) {
        userMap[uid] = {
          userId: uid,
          name: s.ypt_users?.name || 'Unknown',
          jeeYear: s.ypt_users?.jee_focus_year || '',
          totalSeconds: 0,
        };
      }
      userMap[uid].totalSeconds += s.duration_seconds || 0;
    });

    const board = Object.values(userMap).sort((a, b) => b.totalSeconds - a.totalSeconds);
    yptLeaderboardCache = { board, timestamp: Date.now() };
    setLeaderboard(board);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchLeaderboard(true);
      }
    }, 120_000);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchLeaderboard();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  if (loading) {
    return <YPTLeaderboardSkeleton />;
  }

  // Merge live elapsed into current user's total for display
  const displayBoard = leaderboard.map((u) => {
    if (u.userId === currentUserId && liveElapsed > 0) {
      return { ...u, totalSeconds: u.totalSeconds + liveElapsed };
    }
    return u;
  }).sort((a, b) => b.totalSeconds - a.totalSeconds);

  const top10 = displayBoard.slice(0, 10);
  const userRank = displayBoard.findIndex((u) => u.userId === currentUserId) + 1;
  const userEntry = displayBoard.find((u) => u.userId === currentUserId);

  const rankEmoji = (i: number) => (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`);

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" /> Today's Leaderboard
        </h3>
        <p className="text-xs text-muted-foreground mb-4">Resets daily at 12:00 AM IST</p>
        {top10.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No study sessions recorded today. Be the first!</p>
        ) : (
          <div className="space-y-2">
            {top10.map((u, i) => (
              <div
                key={u.userId}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  u.userId === currentUserId
                    ? 'bg-primary/10 border border-primary/20'
                    : 'bg-muted/30 hover:bg-muted/50'
                }`}
              >
                <span className="w-8 text-center font-bold text-lg">{rankEmoji(i)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.jeeYear}</p>
                </div>
                <span className="font-semibold text-sm tabular-nums">{formatHours(u.totalSeconds)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Always show user rank if they have studied */}
      {userEntry && userRank > 10 && (
        <Card className="p-4 border-primary/20">
          <p className="text-xs text-muted-foreground mb-2">Your Rank</p>
          <div className="flex items-center gap-3">
            <span className="w-8 text-center font-bold text-lg">#{userRank}</span>
            <div className="flex-1">
              <p className="font-medium">{userEntry.name}</p>
              <p className="text-xs text-muted-foreground">{userEntry.jeeYear}</p>
            </div>
            <span className="font-semibold tabular-nums">{formatHours(userEntry.totalSeconds)}</span>
          </div>
        </Card>
      )}

      {userEntry && userRank > 0 && userRank <= 10 && (
        <p className="text-center text-sm text-muted-foreground">You are ranked <strong>#{userRank}</strong> today 🎯</p>
      )}

      {!userEntry && (
        <p className="text-center text-sm text-muted-foreground">Start a study session to appear on the leaderboard!</p>
      )}
    </div>
  );
}
