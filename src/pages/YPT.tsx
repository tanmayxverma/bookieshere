import { useState, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { useYPTUser } from '@/hooks/useYPTUser';
import { useStudyTimer } from '@/hooks/useStudyTimer';
import { useYPTPresence } from '@/hooks/useYPTPresence';
import { useRoomSession } from '@/hooks/useRoomSession';
import { YPTOnboarding } from '@/components/YPT/YPTOnboarding';
import { YPTLoadingSkeleton } from '@/components/YPT/YPTSkeletons';
import { YPTNameChange } from '@/components/YPT/YPTNameChange';
import { V2StudyTab, V2StatsTab, V2TasksTab, V2RoomsTab, V2LeaderboardTab } from '@/components/YPTV2';
import { Timer, BarChart3, Users, ListTodo, Trophy, LogOut, X } from 'lucide-react';
import { formatTime } from '@/types/ypt';
import { Button } from '@/components/ui/button';

const TABS = [
  { id: 'study', label: 'Study', icon: Timer },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
  { id: 'rooms', label: 'Rooms', icon: Users },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'leaderboard', label: 'Board', icon: Trophy },
] as const;

type TabId = typeof TABS[number]['id'];

export default function YPT() {
  const { user, isLoading, isOnboarded, createUser, changeName } = useYPTUser();
  const timer = useStudyTimer(user?.id);
  const { onlineCount, activeUsers } = useYPTPresence(user?.id, user?.name, user?.jee_focus_year);
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

  if (isLoading) {
    return (
      <Layout>
        <YPTLoadingSkeleton />
      </Layout>
    );
  }

  return (
    <Layout>
      <YPTOnboarding
        open={!isOnboarded}
        onSubmit={async (name, year) => {
          await createUser(name, year);
        }}
      />

      {isOnboarded && user && (
        <div className="container mx-auto px-4 py-6 pb-24 md:pb-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pop-in">
            <div>
              <h1 className="text-2xl font-bold tracking-tight font-display">Bookie YPT</h1>
              <div className="flex items-center gap-2.5 mt-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {onlineCount} online
                </p>
                <span className="text-muted-foreground/30">·</span>
                <span className="text-sm font-medium">{user.name}</span>
                <YPTNameChange user={user} onChangeName={changeName} />
              </div>
            </div>
            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1 p-1.5 rounded-xl bg-muted/50 border border-border/30">
              {TABS.map((t) => {
                const Icon = t.icon;
                const isActive = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => switchTab(t.id)}
                    className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-95 ${
                      isActive
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    {t.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Floating Room Indicator - shows when in a room but NOT on rooms tab */}
          {roomSession.activeRoomId && tab !== 'rooms' && (
            <div className="mb-4 pop-in">
              <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-primary/20 bg-primary/5 backdrop-blur-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl shrink-0">{roomSession.activeRoomEmoji || '📖'}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{roomSession.activeRoomName}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      {roomSession.presenceMembers.length} online
                      {timer.isActive && (
                        <>
                          <span className="text-muted-foreground/30 mx-1">·</span>
                          <span className="font-mono tabular-nums text-primary font-semibold">{formatTime(timer.elapsedSeconds)}</span>
                          <span className="text-muted-foreground/60">({timer.subject})</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-xs font-semibold"
                    onClick={() => switchTab('rooms')}
                  >
                    Open
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                    onClick={roomSession.leaveRoom}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <main className="max-w-3xl mx-auto">
            <div
              className={`transition-all duration-250 ease-out ${
                animating
                  ? 'opacity-0 translate-y-2 scale-[0.99]'
                  : 'opacity-100 translate-y-0 scale-100'
              }`}
            >
              {tab === 'study' && <V2StudyTab user={user} timer={timer} />}
              {tab === 'stats' && <V2StatsTab userId={user.id} liveElapsed={timer.isActive ? timer.elapsedSeconds : 0} />}
              {tab === 'rooms' && <V2RoomsTab currentUser={user} timer={timer} roomSession={roomSession} />}
              {tab === 'tasks' && <V2TasksTab userId={user.id} timer={timer} />}
              {tab === 'leaderboard' && <V2LeaderboardTab currentUserId={user.id} liveElapsed={timer.isActive ? timer.elapsedSeconds : 0} />}
            </div>
          </main>

          {/* Mobile Bottom Nav */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-t border-border/30 px-2 py-2 safe-area-bottom">
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
                        : 'text-muted-foreground'
                    }`}
                  >
                    <Icon className={`h-6 w-6 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                    <span className="text-[11px] font-semibold">{t.label}</span>
                    {isActive && (
                      <div className="absolute -bottom-0.5 w-7 h-0.5 rounded-full bg-primary transition-all duration-300" />
                    )}
                    {/* Room indicator dot on rooms tab */}
                    {t.id === 'rooms' && roomSession.activeRoomId && !isActive && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </Layout>
  );
}
