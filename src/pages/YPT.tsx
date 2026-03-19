import { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { useYPTUser } from '@/hooks/useYPTUser';
import { useStudyTimer } from '@/hooks/useStudyTimer';
import { useYPTPresence } from '@/hooks/useYPTPresence';
import { YPTOnboarding } from '@/components/YPT/YPTOnboarding';
import { YPTLoadingSkeleton } from '@/components/YPT/YPTSkeletons';
import { YPTNameChange } from '@/components/YPT/YPTNameChange';
import { V2StudyTab, V2StatsTab, V2TasksTab, V2RoomsTab, V2LeaderboardTab } from '@/components/YPTV2';
import { Timer, BarChart3, Users, ListTodo, Trophy } from 'lucide-react';

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
  const { activeUsers } = useYPTPresence();
  const [tab, setTab] = useState<TabId>('study');
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const prevTab = useRef<TabId>('study');

  const switchTab = (newTab: TabId) => {
    if (newTab === tab || animating) return;
    const oldIdx = TABS.findIndex(t => t.id === tab);
    const newIdx = TABS.findIndex(t => t.id === newTab);
    setDirection(newIdx > oldIdx ? 'right' : 'left');
    setAnimating(true);
    prevTab.current = tab;
    // Small delay for exit animation
    setTimeout(() => {
      setTab(newTab);
      setTimeout(() => setAnimating(false), 300);
    }, 150);
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
              <h1 className="text-xl font-bold tracking-tight font-display">Bookie YPT</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  {activeUsers.length} online
                </p>
                <span className="text-muted-foreground/30">·</span>
                <span className="text-xs font-medium">{user.name}</span>
                <YPTNameChange user={user} onChangeName={changeName} />
              </div>
            </div>
            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border/30">
              {TABS.map((t) => {
                const Icon = t.icon;
                const isActive = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => switchTab(t.id)}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {t.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content with tab transitions */}
          <main className="max-w-3xl mx-auto">
            <div
              className={`transition-all duration-300 ease-out ${
                animating
                  ? 'opacity-0 translate-y-3 scale-[0.98]'
                  : 'opacity-100 translate-y-0 scale-100'
              }`}
            >
              {tab === 'study' && <V2StudyTab user={user} timer={timer} />}
              {tab === 'stats' && <V2StatsTab userId={user.id} liveElapsed={timer.isActive ? timer.elapsedSeconds : 0} />}
              {tab === 'rooms' && <V2RoomsTab activeUsers={activeUsers} currentUser={user} timer={timer} />}
              {tab === 'tasks' && <V2TasksTab userId={user.id} timer={timer} />}
              {tab === 'leaderboard' && <V2LeaderboardTab currentUserId={user.id} liveElapsed={timer.isActive ? timer.elapsedSeconds : 0} />}
            </div>
          </main>

          {/* Mobile Bottom Nav */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-t border-border/30 px-2 py-1.5 safe-area-bottom">
            <div className="flex items-center justify-around max-w-md mx-auto">
              {TABS.map((t) => {
                const Icon = t.icon;
                const isActive = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => switchTab(t.id)}
                    className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-200 min-w-[52px] active:scale-95 ${
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <Icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                    <span className="text-[10px] font-medium">{t.label}</span>
                    {isActive && (
                      <div className="absolute -bottom-0.5 w-6 h-0.5 rounded-full bg-primary transition-all duration-300" />
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
