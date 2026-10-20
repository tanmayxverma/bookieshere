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

let v2LeaderboardCache: {
  today: LeaderboardEntry[];
  week: LeaderboardEntry[];
  timestamp: number;
} | null = null;
const CACHE_TTL_MS = 2 * 60 * 1000;

export function V2LeaderboardTab({ currentUserId, liveElapsed = 0 }: Props) {
  const [todayBoard, setTodayBoard] = useState<LeaderboardEntry[]>(() => v2LeaderboardCache?.today || []);
  const [weekBoard, setWeekBoard] = useState<LeaderboardEntry[]>(() => v2LeaderboardCache?.week || []);
  const [loading, setLoading] = useState(() => !v2LeaderboardCache);
  const [period, setPeriod] = useState<'today' | 'weekly'>('today');

  const fetchLeaderboard = async (force = false) => {
    if (!force && v2LeaderboardCache && Date.now() - v2LeaderboardCache.timestamp < CACHE_TTL_MS) {
      setTodayBoard(v2LeaderboardCache.today);
      setWeekBoard(v2LeaderboardCache.week);
      setLoading(false);
      return;
    }

    try {
      const [todayRpc, weekRpc] = await Promise.all([
        (supabase as any).rpc('get_leaderboard_today', { top_n: 50 }),
        (supabase as any).rpc('get_leaderboard_week', { top_n: 100 }),
      ]);

      if (todayRpc.data && weekRpc.data && !todayRpc.error && !weekRpc.error) {
        const mapRows = (rows: any[]): LeaderboardEntry[] =>
          rows.map((r: any) => ({
            userId: r.user_id,
            name: r.name || 'Aspirant',
            jeeYear: r.jee_year || 'JEE',
            totalSeconds: Number(r.total_seconds) || 0,
          }));

        const today = mapRows(todayRpc.data);
        const week = mapRows(weekRpc.data);
        v2LeaderboardCache = { today, week, timestamp: Date.now() };
        setTodayBoard(today);
        setWeekBoard(week);
        setLoading(false);
        return;
      }
    } catch {
      // Fallback below if RPC is not yet applied
    }

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

    const today = Object.values(todayMap).sort((a, b) => b.totalSeconds - a.totalSeconds);
    const week = Object.values(weekMap).sort((a, b) => b.totalSeconds - a.totalSeconds);
    v2LeaderboardCache = { today, week, timestamp: Date.now() };
    setTodayBoard(today);
    setWeekBoard(week);
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
      {/* ───── HERO ARENA HEADER (STITCH SCREEN 01) ───── */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 font-mono text-[11px] font-semibold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>NATIONAL AIR ARENA // LIVE RANKINGS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground mt-1.5">
              All-India Aspirants Leaderboard
            </h2>
            <p className="font-mono text-xs text-muted-foreground mt-0.5">
              Live grind rankings across India · Synchronized every 30 seconds
            </p>
          </div>

          {/* Period Toggle */}
          <div className="flex items-center bg-muted/40 p-1 rounded-xl border border-border/60 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setPeriod('today')}
              className={cn(
                'px-4 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer',
                period === 'today'
                  ? 'bg-background text-foreground shadow-xs border border-border/60'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Today's AIR
            </button>
            <button
              type="button"
              onClick={() => setPeriod('weekly')}
              className={cn(
                'px-4 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer',
                period === 'weekly'
                  ? 'bg-background text-foreground shadow-xs border border-border/60'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Weekly (7-Day)
            </button>
          </div>
        </div>

        {/* User Standing Strip */}
        <div className="bg-muted/20 border border-border/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground font-mono font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
              {userRank > 0 ? `#${userRank}` : '—'}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {userRank > 0 ? (
                  <>
                    You are currently ranked <span className="text-primary font-bold">#{userRank}</span> nationwide
                    with <span className="font-mono font-bold">{formatHours(userEntry?.totalSeconds || 0)}</span> logged!
                  </>
                ) : (
                  'You have not logged any study time in this period yet.'
                )}
              </p>
              <p className="text-xs font-mono text-muted-foreground mt-0.5">
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

          <div className="flex items-center gap-2 self-start sm:self-center font-mono text-xs font-medium px-3 py-1.5 rounded-lg bg-card border border-border/60 text-muted-foreground">
            <span>TOTAL COMPETITORS:</span>
            <span className="text-foreground font-semibold">{activeBoard.length}</span>
          </div>
        </div>
      </div>

      {/* ───── TOP 3 PODIUM DISPLAY (EDITORIAL INK ARCHITECTURAL PODIUM) ───── */}
      {activeBoard.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-2">
          {/* RANK 2 (Silver) - Left on desktop */}
          {top2 ? (
            <div className="order-2 md:order-1 bg-card border border-border/80 rounded-xl p-5 shadow-xs relative flex flex-col justify-between group hover:shadow-sm transition-shadow space-y-4">
              <div className="absolute top-0 left-0 right-0 h-1 bg-slate-300 dark:bg-slate-700 rounded-t-xl" />
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  🥈 AIR #2
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">Top Ranker</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-13 h-13 rounded-full bg-muted text-foreground flex items-center justify-center font-display text-xl font-bold shrink-0 border border-border/50">
                  {top2.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <h4 className="font-display font-bold text-base text-foreground truncate">
                    {top2.name} {top2.userId === currentUserId && <span className="text-xs text-primary font-mono">(You)</span>}
                  </h4>
                  <span className="font-mono text-xs text-muted-foreground">{top2.jeeYear} Target</span>
                </div>
              </div>
              <div className="pt-2 flex items-baseline justify-between bg-muted/30 px-3.5 py-2.5 rounded-lg border border-border/40">
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">LOGGED TIME</span>
                  <span className="font-mono text-xl font-bold text-foreground">
                    {formatHours(top2.totalSeconds)}
                  </span>
                </div>
                <span className="font-mono text-xs text-muted-foreground">AIR 2 Verified</span>
              </div>
            </div>
          ) : (
            <div className="order-2 md:order-1 bg-card/40 border border-dashed border-border/60 rounded-xl p-5 flex flex-col items-center justify-center text-center min-h-[200px]">
              <span className="text-2xl opacity-40">🥈</span>
              <p className="text-xs font-mono text-muted-foreground mt-2">AIR #2 Slot Open</p>
            </div>
          )}

          {/* RANK 1 (Gold) - Center Monarch (Elevated Prestige) */}
          {top1 && (
            <div className="order-1 md:order-2 bg-card border-2 border-primary/40 rounded-2xl p-6 shadow-sm relative flex flex-col justify-between space-y-4 scale-100 md:-translate-y-2">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary rounded-t-2xl" />
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-mono text-xs font-bold tracking-wider border border-primary/20">
                  <span>👑 CHAMPION // AIR 1</span>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" title="Live Continuous Stream" />
              </div>
              <div className="flex flex-col items-center text-center my-1">
                <div className="relative mb-2">
                  <div className="w-18 h-18 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display text-2xl font-bold shadow-xs">
                    {top1.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background text-primary flex items-center justify-center shadow-xs border border-border/40">
                    <Crown className="w-3.5 h-3.5 fill-current" />
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-foreground truncate max-w-[220px]">
                  {top1.name} {top1.userId === currentUserId && <span className="text-xs text-primary font-mono">(You)</span>}
                </h3>
                <span className="font-mono text-xs text-muted-foreground mt-0.5">{top1.jeeYear} Target</span>
              </div>
              <div className="bg-muted/40 p-3.5 rounded-xl border border-border/50 flex flex-col gap-0.5 text-center">
                <span className="font-mono text-[10px] text-primary font-bold uppercase tracking-widest">NATIONAL LEADING PACE</span>
                <div className="font-mono text-2xl font-bold text-foreground">
                  {formatHours(top1.totalSeconds)}
                </div>
                <span className="font-mono text-[11px] text-muted-foreground">Continuous Leader Pace</span>
              </div>
            </div>
          )}

          {/* RANK 3 (Bronze) - Right on desktop */}
          {top3 ? (
            <div className="order-3 bg-card border border-border/80 rounded-xl p-5 shadow-xs relative flex flex-col justify-between group hover:shadow-sm transition-shadow space-y-4">
              <div className="absolute top-0 left-0 right-0 h-1 bg-amber-700/60 rounded-t-xl" />
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  🥉 AIR #3
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">Top Ranker</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-13 h-13 rounded-full bg-muted text-foreground flex items-center justify-center font-display text-xl font-bold shrink-0 border border-border/50">
                  {top3.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <h4 className="font-display font-bold text-base text-foreground truncate">
                    {top3.name} {top3.userId === currentUserId && <span className="text-xs text-primary font-mono">(You)</span>}
                  </h4>
                  <span className="font-mono text-xs text-muted-foreground">{top3.jeeYear} Target</span>
                </div>
              </div>
              <div className="pt-2 flex items-baseline justify-between bg-muted/30 px-3.5 py-2.5 rounded-lg border border-border/40">
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">LOGGED TIME</span>
                  <span className="font-mono text-xl font-bold text-foreground">
                    {formatHours(top3.totalSeconds)}
                  </span>
                </div>
                <span className="font-mono text-xs text-muted-foreground">AIR 3 Verified</span>
              </div>
            </div>
          ) : (
            <div className="order-3 bg-card/40 border border-dashed border-border/60 rounded-xl p-5 flex flex-col items-center justify-center text-center min-h-[200px]">
              <span className="text-2xl opacity-40">🥉</span>
              <p className="text-xs font-mono text-muted-foreground mt-2">AIR #3 Slot Open</p>
            </div>
          )}
        </div>
      )}

      {/* ───── FULL RANKINGS TABLE (STITCH SCREEN 01 AIR REGISTRY) ───── */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <Medal className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-foreground">
              All India Rankers Registry (Top 30)
            </h3>
          </div>
          <span className="text-xs font-mono text-muted-foreground">Synchronized Live</span>
        </div>

        {/* Ledger Column Headers on Desktop */}
        <div className="hidden md:grid grid-cols-12 px-4 py-2 text-muted-foreground font-mono text-[11px] font-semibold uppercase tracking-wider bg-muted/30 rounded-lg border border-border/40">
          <div className="col-span-2">RANK POSITION</div>
          <div className="col-span-5">CANDIDATE DOSSIER</div>
          <div className="col-span-2">TARGET PROGRAM</div>
          <div className="col-span-3 text-right">VERIFIED EFFORT</div>
        </div>

        {activeBoard.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground font-mono text-sm">
            No study sessions logged for this period yet. Start your timer to be #1!
          </div>
        ) : (
          <div className="space-y-2">
            {activeBoard.map((entry, index) => {
              const rank = index + 1;
              const isMe = entry.userId === currentUserId;
              const isTop3 = rank <= 3;

              return (
                <div
                  key={entry.userId}
                  className={cn(
                    'flex flex-col md:grid md:grid-cols-12 items-start md:items-center gap-3 p-3.5 sm:p-4 rounded-xl border transition-all',
                    isMe
                      ? 'border-primary/50 bg-primary/5 shadow-2xs'
                      : isTop3
                      ? 'border-amber-400/40 bg-amber-500/5 hover:bg-amber-500/10'
                      : 'border-border/50 bg-card hover:bg-muted/30'
                  )}
                >
                  {/* Rank position */}
                  <div className="md:col-span-2 flex items-center gap-2">
                    <span
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0',
                        rank === 1
                          ? 'bg-amber-500 text-slate-900'
                          : rank === 2
                          ? 'bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white'
                          : rank === 3
                          ? 'bg-amber-800 text-white'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {rank <= 3 ? ['01', '02', '03'][rank - 1] : String(rank).padStart(2, '0')}
                    </span>
                    <span className={cn(
                      'font-mono text-xs font-semibold',
                      isTop3 ? 'text-amber-700 dark:text-amber-400' : 'text-muted-foreground'
                    )}>
                      AIR #{rank}
                    </span>
                  </div>

                  {/* Candidate Dossier */}
                  <div className="md:col-span-5 flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs shrink-0 text-foreground border border-border/40">
                      {entry.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate flex items-center gap-1.5">
                        <span>{entry.name}</span>
                        {isMe && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-primary text-primary-foreground">
                            YOU
                          </span>
                        )}
                      </p>
                      <span className="font-mono text-xs text-muted-foreground md:hidden">
                        {entry.jeeYear} Target
                      </span>
                    </div>
                  </div>

                  {/* Target Program (desktop) */}
                  <div className="hidden md:block md:col-span-2">
                    <span className="font-mono text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted/40 border border-border/40">
                      {entry.jeeYear}
                    </span>
                  </div>

                  {/* Verified Effort */}
                  <div className="w-full md:w-auto md:col-span-3 md:text-right flex items-center justify-between md:justify-end gap-2">
                    <span className="text-[11px] font-mono text-muted-foreground md:hidden uppercase">Verified Effort:</span>
                    <div>
                      <span className="font-mono font-bold text-base text-foreground tabular-nums">
                        {formatHours(entry.totalSeconds)}
                      </span>
                      <p className="text-[10px] font-mono text-muted-foreground uppercase hidden md:block">Verified Effort</p>
                    </div>
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
