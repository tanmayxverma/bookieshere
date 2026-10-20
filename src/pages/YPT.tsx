import { useState, useRef } from 'react';
import { useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useYPTUser } from '@/hooks/useYPTUser';
import { useProfile } from '@/hooks/useProfile';
import { useStudyTimer } from '@/hooks/useStudyTimer';
import { useYPTPresence } from '@/hooks/useYPTPresence';
import { useRoomSession } from '@/hooks/useRoomSession';
import { YPTOnboarding } from '@/components/YPT/YPTOnboarding';
import { YPTLoadingSkeleton } from '@/components/YPT/YPTSkeletons';
import { YPTNameChange } from '@/components/YPT/YPTNameChange';
import { YPTYearChange } from '@/components/YPT/YPTYearChange';
import { V2StudyTab, V2StatsTab, V2TasksTab, V2RoomsTab, V2LeaderboardTab } from '@/components/YPTV2';
import { YPTTracker } from '@/components/YPT/YPTTracker';
import { Timer, BarChart3, Users, ListTodo, Trophy, LogOut, X, Target } from 'lucide-react';
import { formatTime } from '@/types/ypt';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'study', label: 'Study', icon: Timer },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
  { id: 'rooms', label: 'Rooms', icon: Users },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'tracker', label: 'Track', icon: Target },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, isHot: true },
] as const;

type TabId = typeof TABS[number]['id'];

export default function YPT() {
  const { user, isLoading, isOnboarded, createUser, changeName, changeJeeYear } = useYPTUser();
  const { profile, isOnboarded: profileOnboarded } = useProfile();

  // Auto-bridge: if the visitor already has a Bookie profile, hydrate the YPT user from it
  // so we never ask for the same details twice.
  useEffect(() => {
    if (isLoading) return;
    if (isOnboarded) return;
    if (profile && profileOnboarded) {
      createUser(profile.display_name, profile.target_category);
    }
  }, [isLoading, isOnboarded, profile, profileOnboarded, createUser]);

  const timer = useStudyTimer(user?.id);
  const { onlineCount, activeUsers } = useYPTPresence(user?.id, user?.name, user?.jee_focus_year, timer.isActive ? timer.subject : undefined);
  const roomSession = useRoomSession(user || null, timer.startSession, timer.endSession, timer.isActive);
  const [tab, setTab] = useState<TabId>('study');
  const [animating, setAnimating] = useState(false);
  const prevTab = useRef<TabId>('study');

  const switchTab = (newTab: TabId) => {
    if (newTab === tab || animating) return;
    setAnimating(true);
    prevTab.current = tab;
    setTimeout(() => {
      setTab(newTab);
      setTimeout(() => setAnimating(false), 250);
    }, 120);
  };

  if (isLoading || !user) {
    return (
      <Layout>
        <YPTLoadingSkeleton />
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Only show YPT's own dialog if there is no Bookie profile to hydrate from. */}
      <YPTOnboarding
        open={!isOnboarded && !(profile && profileOnboarded)}
        onSubmit={async (name, year) => {
          await createUser(name, year);
        }}
      />

      <div className="w-full text-foreground min-h-screen">
        <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-8 space-y-6 flex-1">
            
            {/* Header section with tabs */}
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b-2 border-[var(--desk-border)]" data-purpose="sub-navigation">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold text-muted-foreground uppercase tracking-wide">
                  <span className="inline-block w-2 h-2 rounded-full bg-[var(--mint)] animate-pulse"></span>
                  <span className="text-foreground font-semibold">{onlineCount} online</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span className="truncate max-w-[120px] sm:max-w-none text-foreground">{user.name}</span>
                    <YPTNameChange user={user} onChangeName={changeName} />
                  </span>
                  <span>|</span>
                  <span className="flex items-center gap-1 text-foreground">
                    <span>{user.jee_focus_year}</span>
                    <YPTYearChange user={user} onChangeYear={changeJeeYear} />
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-foreground mt-1">
                  Bookie YPT Immersion Cockpit
                </h1>
              </div>

              {/* Segmented Module Selector based on Academic Desk Reference */}
              <div className="flex items-center bg-card border-2 border-[var(--desk-border)] rounded-xl p-1 shadow-[3px_3px_0px_var(--desk-border)] text-xs font-bold overflow-x-auto scrollbar-none gap-1 max-w-full touch-pan-x">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  const isActive = tab === t.id;
                  const isLeaderboard = t.id === 'leaderboard';
                  return (
                    <button
                      key={t.id}
                      onClick={() => switchTab(t.id)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap relative shrink-0 min-h-[38px] cursor-pointer",
                        isActive 
                          ? isLeaderboard
                            ? "bg-[var(--sunflower)] text-[#0F172A] border-2 border-[var(--desk-border)] shadow-[1.5px_1.5px_0px_var(--desk-border)]"
                            : "bg-primary text-primary-foreground border-2 border-[var(--desk-border)] shadow-[1.5px_1.5px_0px_var(--desk-border)]" 
                          : isLeaderboard
                            ? "bg-amber-100 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 hover:bg-amber-200 border-2 border-transparent"
                            : "text-muted-foreground hover:text-foreground border-2 border-transparent"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                      {isLeaderboard && (
                        <span className={cn(
                          "ml-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black uppercase tracking-wider",
                          isActive ? "bg-[#0F172A] text-white" : "bg-[var(--coral)] text-white animate-pulse"
                        )}>
                          LIVE
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Floating Room Indicator - shows when in a room but NOT on rooms tab */}
            {roomSession.activeRoomId && tab !== 'rooms' && (
              <div className="mb-4 pop-in brutal-border bg-surface-container-high rounded-xl p-3 shadow-sm border-2 border-on-surface">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl shrink-0">{roomSession.activeRoomEmoji || '📖'}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate font-headline-md">{roomSession.activeRoomName}</p>
                      <p className="text-xs text-on-surface-variant flex items-center gap-1.5 font-label-code-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
                        {roomSession.presenceMembers.length} online
                        {timer.isActive && (
                          <>
                            <span className="text-on-surface-variant/30 mx-1">·</span>
                            <span className="tabular-nums text-primary font-bold">{formatTime(timer.elapsedSeconds)}</span>
                            <span className="text-on-surface-variant/60">({timer.subject})</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs font-bold brutal-border"
                      onClick={() => switchTab('rooms')}
                    >
                      Open
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-error hover:bg-error-container"
                      onClick={roomSession.leaveRoom}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Content Tab Content Area */}
            <div
              className={`transition-all duration-250 ease-out min-h-[calc(100vh-250px)] ${
                animating
                  ? 'opacity-0 translate-y-2 scale-[0.99]'
                  : 'opacity-100 translate-y-0 scale-100'
              }`}
            >
              {tab === 'study' && <V2StudyTab user={user} timer={timer} onNavigate={(t) => switchTab(t)} />}
              {tab === 'stats' && <V2StatsTab userId={user.id} liveElapsed={timer.isActive ? timer.elapsedSeconds : 0} />}
              {tab === 'rooms' && <V2RoomsTab currentUser={user} timer={timer} roomSession={roomSession} />}
              {tab === 'tasks' && <V2TasksTab userId={user.id} timer={timer} />}
              {tab === 'tracker' && <YPTTracker />}
              {tab === 'leaderboard' && <V2LeaderboardTab currentUserId={user.id} liveElapsed={timer.isActive ? timer.elapsedSeconds : 0} />}
            </div>

            {/* Mobile Bottom Nav is hidden since we use the scrollable module selector, but kept for ultra-small screens just in case */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/90 backdrop-blur-md px-2 py-2 safe-area-bottom border-t border-outline-variant/30 hidden">
              <div className="flex items-center justify-around max-w-md mx-auto">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  const isActive = tab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => switchTab(t.id)}
                      className={`relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all duration-200 min-w-[56px] active:scale-95 ${
                        isActive
                          ? 'text-primary'
                          : 'text-on-surface-variant'
                      }`}
                    >
                      <Icon className={`h-6 w-6 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                      <span className="text-[11px] font-semibold">{t.label}</span>
                      {isActive && (
                        <div className="absolute -bottom-0.5 w-7 h-0.5 rounded-full bg-primary transition-all duration-300" />
                      )}
                      {/* Room indicator dot on rooms tab */}
                      {t.id === 'rooms' && roomSession.activeRoomId && !isActive && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </nav>

          </main>
        </div>
    </Layout>
  );
}
