import { useEffect, useState } from 'react';
import { Pin, AlertTriangle, Sparkles, Wrench, Megaphone, BookOpen, Check, CheckCheck } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useNotifications, type Notification } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const TYPE_ICON: Record<Notification['type'], any> = {
  announcement: Megaphone, update: Sparkles, material: BookOpen,
  maintenance: Wrench, feature: Sparkles, alert: AlertTriangle,
};

export default function NotificationsPage() {
  const { items, readIds, unreadCount, markRead, markAllRead, loading } = useNotifications();
  const [tab, setTab] = useState<'all'|'unread'|'pinned'>('all');
  const { toast } = useToast();
  const filtered = items.filter(n => tab === 'all' ? true : tab === 'unread' ? !readIds.has(n.id) : n.is_pinned);

  // When visiting the notifications page, mark as seen so the red dot stops blinking
  useEffect(() => {
    try {
      localStorage.setItem('bookies_notifs_last_opened', Date.now().toString());
    } catch {
      /* ignore */
    }
  }, []);

  const handleMarkAllRead = async () => {
    await markAllRead();
    try {
      localStorage.setItem('bookies_notifs_last_opened', Date.now().toString());
    } catch {
      /* ignore */
    }
    toast({ description: "All notifications marked as read." });
  };

  return (
    <Layout>
      <div className="w-full bg-background blueprint-grid text-on-surface min-h-screen pb-20">
        <div className="container mx-auto px-4 py-10 md:py-16 max-w-3xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="font-headline-xl text-4xl md:text-5xl font-black tracking-tight text-on-surface">Notifications</h1>
              <p className="text-sm font-body-md font-medium text-on-surface-variant mt-2 border-2 border-on-surface border-dashed rounded-full px-4 py-1 inline-block bg-surface-container-low">Updates, announcements and alerts.</p>
            </div>
            {unreadCount > 0 && (
              <Button onClick={handleMarkAllRead} className="gap-2 border-2 border-on-surface shadow-[2px_2px_0px_0px_rgba(19,27,46,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none bg-primary text-on-primary font-bold">
                <CheckCheck className="h-4 w-4" /> Mark all read
              </Button>
            )}
          </div>

          {/* Emergency Backup Channel Callout */}
          <div className="relative overflow-hidden bg-surface-container-lowest border-2 border-on-surface rounded-2xl p-5 mb-8 shadow-[4px_4px_0px_0px_rgba(19,27,46,1)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 border-2 border-on-surface shadow-[2px_2px_0px_0px_rgba(19,27,46,1)]">
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-headline-md font-extrabold text-on-surface">Emergency Backup Telegram Channel</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary-fixed text-on-secondary-fixed-variant">FAILSAFE</span>
                  </div>
                  <p className="text-xs font-body-sm text-on-surface-variant mt-0.5 leading-relaxed">
                    Never lose access during exam weeks. We mirror all drive PDFs and test series directly on Telegram.
                  </p>
                </div>
              </div>
              <a
                href="https://t.me/bookieshere"
                target="_blank"
                rel="noreferrer noopener"
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary font-headline-md font-bold text-xs shadow-[2px_2px_0px_0px_rgba(19,27,46,1)] hover:bg-primary-hover active:translate-y-[2px] active:shadow-none transition-all"
              >
                <span>Join Channel</span>
                <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
              </a>
            </div>
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
            <TabsList className="bg-surface-container-lowest border-2 border-on-surface shadow-[4px_4px_0px_0px_rgba(19,27,46,1)] p-1.5 h-auto rounded-xl flex gap-1 mb-8 w-full sm:w-auto sm:inline-flex">
              {(['all', 'unread', 'pinned'] as const).map(t => (
                <TabsTrigger 
                  key={t}
                  value={t} 
                  className={cn(
                    "flex-1 sm:flex-none capitalize font-bold font-headline-md text-sm px-6 py-2 rounded-lg transition-all",
                    "data-[state=active]:bg-primary data-[state=active]:text-on-primary data-[state=active]:shadow-none",
                    "data-[state=inactive]:text-on-surface-variant data-[state=inactive]:hover:bg-surface-container-low"
                  )}
                >
                  {t}{t === 'unread' && unreadCount > 0 ? ` (${unreadCount})` : ''}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={tab} className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block px-4 py-2 bg-surface-container border-2 border-on-surface border-dashed rounded-xl font-label-code-sm text-on-surface-variant animate-pulse">
                    Loading notifications…
                  </div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 bg-surface-container-lowest border-2 border-on-surface rounded-2xl shadow-[4px_4px_0px_0px_rgba(19,27,46,1)]">
                  <Megaphone className="mx-auto h-12 w-12 text-outline-variant mb-4" />
                  <p className="text-base font-headline-md font-bold text-on-surface-variant">Nothing here.</p>
                  <p className="text-xs font-body-sm text-on-surface-variant mt-1">You're all caught up!</p>
                </div>
              ) : (
                filtered.map(n => {
                  const Icon = TYPE_ICON[n.type] ?? Megaphone;
                  const unread = !readIds.has(n.id);
                  return (
                    <button key={n.id} onClick={() => markRead(n.id)}
                      className={cn(
                        "w-full text-left flex gap-4 rounded-2xl border-2 p-5 transition-all duration-200 group text-on-surface",
                        "shadow-[4px_4px_0px_0px_rgba(19,27,46,1)] hover:shadow-[6px_6px_0px_0px_rgba(19,27,46,1)] hover:-translate-y-0.5",
                        unread 
                          ? "border-primary bg-primary-container text-on-primary-container" 
                          : "border-on-surface bg-surface-container-lowest hover:bg-surface-container-low"
                      )}>
                      <div className={cn(
                        "shrink-0 h-12 w-12 rounded-xl border-2 flex items-center justify-center transition-transform group-hover:scale-110",
                        n.priority === 'critical' 
                          ? "border-error bg-error-container text-on-error-container" 
                          : unread 
                            ? "border-primary bg-primary text-on-primary" 
                            : "border-on-surface bg-surface-container text-on-surface"
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 text-base font-bold font-headline-md">
                            {n.is_pinned && <Pin className="h-4 w-4 text-primary shrink-0" />}
                            <span className="truncate">{n.title}</span>
                          </div>
                          {unread && <span className="shrink-0 h-2.5 w-2.5 rounded-full bg-primary border border-on-primary mt-1.5" />}
                        </div>
                        <p className={cn(
                          "text-sm font-body-md mt-1.5 whitespace-pre-wrap leading-relaxed",
                          unread ? "text-on-primary-container/90 font-medium" : "text-on-surface/80"
                        )}>
                          {n.body}
                        </p>
                        <p className={cn(
                          "text-[10px] font-label-code-sm font-bold uppercase tracking-wider mt-3",
                          unread ? "text-primary" : "text-on-surface-variant"
                        )}>
                          {formatDistanceToNow(new Date(n.publish_at), { addSuffix: true })}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}