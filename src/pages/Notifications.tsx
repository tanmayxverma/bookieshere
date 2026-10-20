import { useEffect, useState } from 'react';
import { Pin, AlertTriangle, Sparkles, Wrench, Megaphone, BookOpen, CheckCheck, Zap, ExternalLink, Send } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useNotifications, type Notification } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const TYPE_ICON: Record<Notification['type'], any> = {
  announcement: Megaphone, update: Zap, material: BookOpen,
  maintenance: Wrench, feature: Sparkles, alert: AlertTriangle,
};

export default function NotificationsPage() {
  const { items, readIds, unreadCount, markRead, markAllRead, loading } = useNotifications();
  const [tab, setTab] = useState<'all'|'unread'|'pinned'>('all');
  const { toast } = useToast();
  const filtered = items.filter(n => tab === 'all' ? true : tab === 'unread' ? !readIds.has(n.id) : n.is_pinned);

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

  const handleOpenTelegram = (e: React.MouseEvent<HTMLAnchorElement>) => {
    try {
      const win = window.open("https://t.me/bookieshere", "_blank", "noopener,noreferrer");
      if (!win) {
        window.location.assign("https://t.me/bookieshere");
      }
    } catch {
      window.location.assign("https://t.me/bookieshere");
    }
  };

  return (
    <Layout>
      <div className="w-full bg-background text-foreground min-h-screen pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-3xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="font-mono text-[10px] px-2.5 py-0.5 rounded border border-border bg-muted uppercase tracking-wider font-bold text-muted-foreground">
                DISPATCH BULLETIN
              </span>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground mt-2">
                Notifications
              </h1>
              <p className="text-xs sm:text-sm font-sans text-muted-foreground mt-1">
                Material releases, syllabus updates, and system bulletins.
              </p>
            </div>
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllRead}
                className="gap-2 border-2 border-border shadow-[2px_2px_0px_var(--desk-border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none bg-primary text-primary-foreground font-sans font-bold text-xs"
              >
                <CheckCheck className="h-4 w-4" /> Mark all read
              </Button>
            )}
          </div>

          {/* Emergency Backup Channel Callout */}
          <div className="relative overflow-hidden bg-card border-2 border-border rounded-xl p-5 mb-8 shadow-[4px_4px_0px_var(--desk-border)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-muted text-primary flex items-center justify-center shrink-0 border-2 border-border shadow-[2px_2px_0px_var(--desk-border)]">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-display font-bold text-foreground">Emergency Backup Telegram Channel</span>
                    <span className="px-2 py-0.2 rounded border border-primary/30 bg-primary/10 text-primary font-mono text-[10px] font-bold">
                      FAILSAFE
                    </span>
                  </div>
                  <p className="text-xs font-sans text-muted-foreground mt-0.5 leading-relaxed">
                    Never lose access during exam weeks. We mirror all drive PDFs and test series directly on Telegram.
                  </p>
                </div>
              </div>
              <a
                href="https://t.me/bookieshere"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleOpenTelegram}
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-sans font-bold text-xs border-2 border-border shadow-[2px_2px_0px_var(--desk-border)] hover:bg-primary/90 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer select-none"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Join Channel</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-80" />
              </a>
            </div>
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
            <TabsList className="bg-card border-2 border-border shadow-[3px_3px_0px_var(--desk-border)] p-1 h-auto rounded-xl flex gap-1 mb-6 w-full sm:w-auto sm:inline-flex">
              {(['all', 'unread', 'pinned'] as const).map(t => (
                <TabsTrigger 
                  key={t}
                  value={t} 
                  className={cn(
                    "flex-1 sm:flex-none capitalize font-bold font-sans text-xs px-4 py-1.5 rounded-lg transition-all",
                    "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[1px_1px_0px_var(--desk-border)]",
                    "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted"
                  )}
                >
                  {t}{t === 'unread' && unreadCount > 0 ? ` (${unreadCount})` : ''}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={tab} className="space-y-3.5 focus-visible:outline-none focus-visible:ring-0">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block px-4 py-2 bg-card border-2 border-border border-dashed rounded-lg font-mono text-xs text-muted-foreground animate-pulse">
                    Loading bulletins…
                  </div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 bg-card border-2 border-border rounded-xl shadow-[3px_3px_0px_var(--desk-border)]">
                  <Megaphone className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-sm font-display font-bold text-foreground">Nothing here.</p>
                  <p className="text-xs font-sans text-muted-foreground mt-0.5">You're all caught up on announcements!</p>
                </div>
              ) : (
                filtered.map(n => {
                  const Icon = TYPE_ICON[n.type] ?? Megaphone;
                  const unread = !readIds.has(n.id);
                  return (
                    <div 
                      key={n.id} 
                      role="button"
                      tabIndex={0}
                      onClick={() => markRead(n.id)}
                      onKeyDown={(e) => e.key === 'Enter' && markRead(n.id)}
                      className={cn(
                        "w-full text-left flex gap-4 rounded-xl border-2 p-4 transition-all duration-150 group text-foreground cursor-pointer select-none",
                        "shadow-[3px_3px_0px_var(--desk-border)] hover:shadow-[5px_5px_0px_var(--desk-border)] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_var(--desk-border)]",
                        unread 
                          ? "border-primary bg-primary/5" 
                          : "border-border bg-card hover:bg-muted"
                      )}>
                      <div className={cn(
                        "shrink-0 h-10 w-10 rounded-lg border-2 flex items-center justify-center transition-transform",
                        n.priority === 'critical' 
                          ? "border-destructive bg-destructive text-destructive-foreground" 
                          : unread 
                            ? "border-primary bg-primary text-primary-foreground" 
                            : "border-border bg-muted text-foreground"
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 text-sm font-bold font-display">
                            {n.is_pinned && <Pin className="h-3.5 w-3.5 text-primary shrink-0" />}
                            <span className="truncate">{n.title}</span>
                          </div>
                          {unread && (
                            <span className="shrink-0 px-1.5 py-0.2 rounded border border-primary/30 bg-primary/20 text-primary font-mono text-[9px] font-bold">
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-sans mt-1 whitespace-pre-wrap leading-relaxed text-foreground/90">
                          {n.body.split(/(https?:\/\/[^\s]+|t\.me\/[^\s]+)/g).map((part, i) => {
                            if (part.match(/(https?:\/\/[^\s]+|t\.me\/[^\s]+)/g)) {
                              const href = part.startsWith('http') ? part : `https://${part}`;
                              return (
                                <a
                                  key={i}
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="underline font-bold text-primary hover:opacity-80 inline-flex items-center gap-0.5 break-all cursor-pointer"
                                >
                                  {part}
                                  <ExternalLink className="h-3 w-3 inline shrink-0 ml-0.5" />
                                </a>
                              );
                            }
                            return part;
                          })}
                        </p>
                        <p className="text-[10px] font-mono font-bold uppercase tracking-wider mt-2.5 text-muted-foreground">
                          {(() => {
                            try {
                              const d = n?.publish_at ? new Date(n.publish_at) : new Date();
                              return isNaN(d.getTime()) ? 'Recently' : formatDistanceToNow(d, { addSuffix: true });
                            } catch {
                              return 'Recently';
                            }
                          })()}
                        </p>
                      </div>
                    </div>
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