import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { formatHours, getISTTodayStartUTC, getISTDate } from '@/types/ypt';
import { Trophy, Flame, Crown, Sparkles, Medal, ArrowUpRight, Zap, Target } from 'lucide-react';
import { YPTLeaderboardSkeleton } from '@/components/YPT/YPTSkeletons';
import { cn } from '@/lib/utils';

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
  const [period, setPeriod] = useState<'today' | 'weekly'>('today');

  const fetchLeaderboard = async () => {
    try {
      await (supabase as any).rpc('cleanup_stale_sessions');
    } catch {}
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

    if (!sessions) {
      setLoading(false);
      return;
    }

    const todayMap: Record<string, LeaderboardEntry> = {};
    const weekMap: Record<string, LeaderboardEntry> = {};

    sessions.forEach((s: any) => {
      const uid = s.ypt_user_id;
      // The current user's live session is added separately via liveElapsed
      if (s.status === 'active' && uid === currentUserId) return;
      const entry = {
        userId: uid,
        name: s.ypt_users?.name || 'Aspirant',
        jeeYear: s.ypt_users?.jee_focus_year || 'JEE',
        totalSeconds: 0,
      };
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
    board
      .map((u) =>
        u.userId === currentUserId && liveElapsed > 0
          ? { ...u, totalSeconds: u.totalSeconds + liveElapsed }
          : u
      )
      .sort((a, b) => b.totalSeconds - a.totalSeconds);

  const activeBoard = period === 'today' ? mergeBoard(todayBoard) : mergeBoard(weekBoard);
  const userRank = activeBoard.findIndex((u) => u.userId === currentUserId) + 1;
  const userEntry = activeBoard.find((u) => u.userId === currentUserId);

  const top1 = activeBoard[0];
  const top2 = activeBoard[1];
  const top3 = activeBoard[2];
  const restBoard = activeBoard.slice(3, 30);

  return (
    <div className="space-y-6 pop-in">
      {/* ───── HERO ARENA HEADER ───── */}
      <div className="bg-surface-container-lowest border-2 border-slate-900 dark:border-slate-700 rounded-3xl p-5 sm:p-7 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono text-[11px] font-black uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5" />
              <span>NATIONAL AIR ARENA // LIVE RANKINGS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-on-surface mt-1.5">
              All-India Aspirants Leaderboard
            </h2>
            <p className="font-mono text-xs text-on-surface-variant mt-0.5">
              Live grind rankings across India · Synchronized every 30 seconds
            </p>
          </div>

          {/* Period Toggle */}
          <div className="flex items-center bg-surface-container p-1 rounded-2xl border border-outline-variant/40 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setPeriod('today')}
              className={cn(
                'px-4 py-1.5 rounded-xl font-mono text-xs font-bold transition-all',
                period === 'today'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              )}
            >
              Today's AIR
            </button>
            <button
              type="button"
              onClick={() => setPeriod('weekly')}
              className={cn(
                'px-4 py-1.5 rounded-xl font-mono text-xs font-bold transition-all',
                period === 'weekly'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              )}
            >
              Weekly (7-Day)
            </button>
          </div>
        </div>

        {/* User Standing Strip */}
        <div className="bg-gradient-to-r from-blue-500/10 via-primary/5 to-transparent border-2 border-primary/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary font-black text-lg flex items-center justify-center shrink-0 shadow-xs border border-primary/40">
              {userRank > 0 ? `#${userRank}` : '—'}
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface">
                {userRank > 0 ? (
                  <>
                    You are currently ranked <span className="text-primary font-black">#{userRank}</span> nationwide
                    with <span className="font-mono font-bold">{formatHours(userEntry?.totalSeconds || 0)}</span> logged!
                  </>
                ) : (
                  'You have not logged any study time in this period yet.'
                )}
              </p>
              <p className="text-xs font-mono text-on-surface-variant mt-0.5">
                {userRank === 1
                  ? '👑 You are leading All India Rank 1! Keep defending your position!'
                  : userRank > 1 && userRank <= 3
                  ? '🔥 You are on the National Podium! Push for AIR 1!'
                  : userRank > 3
                  ? '🎯 Grind another session to climb onto the top 3 podium!'
                  : 'Start your study timer to claim your national rank!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center font-mono text-xs font-bold px-3 py-1.5 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface">
            <span>TOTAL COMPETITORS:</span>
            <span className="text-primary">{activeBoard.length}</span>
          </div>
        </div>
      </div>

      {/* ───── TOP 3 PODIUM DISPLAY ───── */}
      {activeBoard.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-2">
          {/* RANK 2 (Silver) - Left on desktop */}
          {top2 ? (
            <div className="order-2 md:order-1 bg-surface-container-lowest border-2 border-slate-300 dark:border-slate-700 rounded-3xl p-5 shadow-[3px_3px_0px_0px_rgba(15,23,42,0.8)] relative flex flex-col items-center text-center space-y-3">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-2 border-slate-400 px-3 py-0.5 rounded-full font-mono text-xs font-black uppercase flex items-center gap-1 shadow-xs">
                <span>🥈</span> AIR #2
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-200 to-slate-400 dark:from-slate-700 dark:to-slate-500 text-slate-900 dark:text-white font-black text-2xl flex items-center justify-center border-2 border-slate-400 shadow-sm mt-2">
                {top2.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-display font-black text-base text-on-surface truncate max-w-[200px]">
                  {top2.name} {top2.userId === currentUserId && <span className="text-xs text-primary font-mono">(You)</span>}
                </h4>
                <span className="text-xs font-mono font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                  {top2.jeeYear}
                </span>
              </div>
              <div className="w-full bg-[#f1f5f9] dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl py-2 px-3">
                <span className="font-mono font-black text-xl text-slate-900 dark:text-white">
                  {formatHours(top2.totalSeconds)}
                </span>
                <p className="text-[10px] font-mono text-on-surface-variant uppercase">Logged Study Time</p>
              </div>
            </div>
          ) : (
            <div className="order-2 md:order-1 bg-surface-container-low/40 border-2 border-dashed border-outline-variant/40 rounded-3xl p-5 flex flex-col items-center justify-center text-center min-h-[220px]">
              <span className="text-2xl opacity-40">🥈</span>
              <p className="text-xs font-mono text-on-surface-variant mt-2">AIR #2 Slot Open</p>
            </div>
          )}

          {/* RANK 1 (Gold) - Center elevated */}
          {top1 && (
            <div className="order-1 md:order-2 bg-gradient-to-b from-amber-500/10 via-surface-container-lowest to-surface-container-lowest border-2 border-amber-500 rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(245,158,11,1)] relative flex flex-col items-center text-center space-y-3.5 scale-100 md:-translate-y-2">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-900 border-2 border-slate-900 px-4 py-1 rounded-full font-mono text-xs font-black uppercase flex items-center gap-1.5 shadow-md">
                <Crown className="w-3.5 h-3.5 fill-current" />
                <span>CHAMPION // AIR 1</span>
              </div>
              <div className="relative mt-2">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-900 font-black text-3xl flex items-center justify-center border-2 border-slate-900 shadow-md">
                  {top1.name.charAt(0).toUpperCase()}
                </div>
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-500 animate-bounce" />
              </div>
              <div>
                <h4 className="font-display font-black text-lg text-on-surface truncate max-w-[220px]">
                  {top1.name} {top1.userId === currentUserId && <span className="text-xs text-primary font-mono">(You)</span>}
                </h4>
                <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                  {top1.jeeYear} Target
                </span>
              </div>
              <div className="w-full bg-[#fef9c3] dark:bg-amber-950/40 border-2 border-amber-500/40 rounded-2xl py-2.5 px-3">
                <span className="font-mono font-black text-2xl text-amber-900 dark:text-amber-200">
                  {formatHours(top1.totalSeconds)}
                </span>
                <p className="text-[10px] font-mono font-bold text-amber-800/80 dark:text-amber-300/80 uppercase">
                  National Leading Pace
                </p>
              </div>
            </div>
          )}

          {/* RANK 3 (Bronze) - Right on desktop */}
          {top3 ? (
            <div className="order-3 bg-surface-container-lowest border-2 border-amber-700/40 dark:border-amber-700/60 rounded-3xl p-5 shadow-[3px_3px_0px_0px_rgba(15,23,42,0.8)] relative flex flex-col items-center text-center space-y-3">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-800 text-white border-2 border-amber-900 px-3 py-0.5 rounded-full font-mono text-xs font-black uppercase flex items-center gap-1 shadow-xs">
                <span>🥉</span> AIR #3
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-900 text-white font-black text-2xl flex items-center justify-center border-2 border-amber-800 shadow-sm mt-2">
                {top3.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-display font-black text-base text-on-surface truncate max-w-[200px]">
                  {top3.name} {top3.userId === currentUserId && <span className="text-xs text-primary font-mono">(You)</span>}
                </h4>
                <span className="text-xs font-mono font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                  {top3.jeeYear}
                </span>
              </div>
              <div className="w-full bg-[#fff7ed] dark:bg-amber-950/30 border border-amber-700/30 rounded-xl py-2 px-3">
                <span className="font-mono font-black text-xl text-amber-950 dark:text-amber-200">
                  {formatHours(top3.totalSeconds)}
                </span>
                <p className="text-[10px] font-mono text-on-surface-variant uppercase">Logged Study Time</p>
              </div>
            </div>
          ) : (
            <div className="order-3 bg-surface-container-low/40 border-2 border-dashed border-outline-variant/40 rounded-3xl p-5 flex flex-col items-center justify-center text-center min-h-[220px]">
              <span className="text-2xl opacity-40">🥉</span>
              <p className="text-xs font-mono text-on-surface-variant mt-2">AIR #3 Slot Open</p>
            </div>
          )}
        </div>
      )}

      {/* ───── FULL RANKINGS TABLE (RANKS 4+) ───── */}
      <div className="bg-surface-container-lowest border-2 border-slate-900 dark:border-slate-700 rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
          <div className="flex items-center gap-2">
            <Medal className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-on-surface">
              All India Rankers (Top 30)
            </h3>
          </div>
          <span className="text-xs font-mono text-on-surface-variant">Live updates enabled</span>
        </div>

        {activeBoard.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant font-mono text-sm">
            No study sessions logged for this period yet. Start your timer to be #1!
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeBoard.map((entry, index) => {
              const rank = index + 1;
              const isMe = entry.userId === currentUserId;
              const isTop3 = rank <= 3;

              return (
                <div
                  key={entry.userId}
                  className={cn(
                    'flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border-2 transition-all',
                    isMe
                      ? 'border-primary bg-primary/10 shadow-[2px_2px_0px_0px_rgba(0,102,255,0.4)]'
                      : isTop3
                      ? 'border-amber-400/80 bg-amber-500/5'
                      : 'border-slate-200 dark:border-slate-800 bg-surface-container-low/50 hover:bg-surface-container-low'
                  )}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    {/* Rank badge */}
                    <div
                      className={cn(
                        'w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-sm shrink-0 border',
                        rank === 1
                          ? 'bg-amber-500 text-slate-900 border-amber-600'
                          : rank === 2
                          ? 'bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-400'
                          : rank === 3
                          ? 'bg-amber-800 text-white border-amber-900'
                          : 'bg-surface-container text-on-surface-variant border-outline-variant/40'
                      )}
                    >
                      {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `#${rank}`}
                    </div>

                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center font-bold text-sm shrink-0 text-on-surface">
                      {entry.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Name & Target */}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-on-surface truncate flex items-center gap-1.5">
                        <span>{entry.name}</span>
                        {isMe && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-extrabold bg-primary text-on-primary">
                            YOU
                          </span>
                        )}
                      </p>
                      <p className="text-xs font-mono text-on-surface-variant truncate">
                        {entry.jeeYear} Target
                      </p>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="text-right shrink-0">
                    <span className="font-mono font-black text-base sm:text-lg text-on-surface tabular-nums">
                      {formatHours(entry.totalSeconds)}
                    </span>
                    <p className="text-[10px] font-mono text-on-surface-variant uppercase">Focus logged</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
