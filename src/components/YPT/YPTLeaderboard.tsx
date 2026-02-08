import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { formatHours } from '@/types/ypt';
import { Trophy } from 'lucide-react';

interface Props {
  currentUserId: string;
}

interface LeaderboardEntry {
  userId: string;
  name: string;
  jeeYear: string;
  totalSeconds: number;
}

export function YPTLeaderboard({ currentUserId }: Props) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data: sessions } = await (supabase as any)
        .from('study_sessions')
        .select('ypt_user_id, duration_seconds, ypt_users(name, jee_focus_year)')
        .eq('status', 'completed')
        .gte('started_at', todayStart.toISOString());

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

      setLeaderboard(Object.values(userMap).sort((a, b) => b.totalSeconds - a.totalSeconds));
      setLoading(false);
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground animate-pulse">Loading leaderboard...</div>;
  }

  const top10 = leaderboard.slice(0, 10);
  const userRank = leaderboard.findIndex((u) => u.userId === currentUserId) + 1;
  const userEntry = leaderboard.find((u) => u.userId === currentUserId);

  const rankEmoji = (i: number) => (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`);

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" /> Today's Leaderboard
        </h3>
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

      {userRank > 10 && userEntry && (
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
    </div>
  );
}
