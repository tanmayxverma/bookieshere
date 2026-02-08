import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useYPTUser } from '@/hooks/useYPTUser';
import { useStudyTimer } from '@/hooks/useStudyTimer';
import { useYPTPresence } from '@/hooks/useYPTPresence';
import { YPTOnboarding } from '@/components/YPT/YPTOnboarding';
import { YPTStudyView } from '@/components/YPT/YPTStudyView';
import { YPTDashboard } from '@/components/YPT/YPTDashboard';
import { YPTLeaderboard } from '@/components/YPT/YPTLeaderboard';
import { YPTHistory } from '@/components/YPT/YPTHistory';
import { YPTPresence } from '@/components/YPT/YPTPresence';
import { YPTNameChange } from '@/components/YPT/YPTNameChange';
import { Users, Timer } from 'lucide-react';

export default function YPT() {
  const { user, isLoading, isOnboarded, createUser, changeName } = useYPTUser();
  const timer = useStudyTimer(user?.id);
  const { activeUsers } = useYPTPresence();
  const [tab, setTab] = useState('study');

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex items-center gap-3 text-muted-foreground animate-pulse">
            <Timer className="h-5 w-5" />
            <span>Loading YPT...</span>
          </div>
        </div>
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
        <div className="container mx-auto px-4 py-6">
          {/* YPT Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Bookie YPT</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {activeUsers.length} studying now
                </p>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-sm font-medium">{user.name}</span>
                <YPTNameChange user={user} onChangeName={changeName} />
              </div>
            </div>
            {/* Mobile presence toggle */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Users className="h-4 w-4" /> Live
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 p-4">
                  <div className="mt-6">
                    <YPTPresence users={activeUsers} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Main Content */}
            <main className="flex-1 min-w-0">
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="mb-6 w-full sm:w-auto">
                  <TabsTrigger value="study" className="flex-1 sm:flex-none">Study</TabsTrigger>
                  <TabsTrigger value="dashboard" className="flex-1 sm:flex-none">Dashboard</TabsTrigger>
                  <TabsTrigger value="leaderboard" className="flex-1 sm:flex-none">Leaderboard</TabsTrigger>
                  <TabsTrigger value="history" className="flex-1 sm:flex-none">History</TabsTrigger>
                </TabsList>
                <TabsContent value="study">
                  <YPTStudyView user={user} timer={timer} />
                </TabsContent>
                <TabsContent value="dashboard">
                  <YPTDashboard userId={user.id} liveElapsed={timer.isActive ? timer.elapsedSeconds : 0} />
                </TabsContent>
                <TabsContent value="leaderboard">
                  <YPTLeaderboard currentUserId={user.id} liveElapsed={timer.isActive ? timer.elapsedSeconds : 0} />
                </TabsContent>
                <TabsContent value="history">
                  <YPTHistory userId={user.id} />
                </TabsContent>
              </Tabs>
            </main>

            {/* Desktop Presence Sidebar */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-20">
                <YPTPresence users={activeUsers} />
              </div>
            </aside>
          </div>
        </div>
      )}
    </Layout>
  );
}
