import { useState } from 'react';
import { Pin, AlertTriangle, Sparkles, Wrench, Megaphone, BookOpen, Check } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useNotifications, type Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

const TYPE_ICON: Record<Notification['type'], any> = {
  announcement: Megaphone, update: Sparkles, material: BookOpen,
  maintenance: Wrench, feature: Sparkles, alert: AlertTriangle,
};

export default function NotificationsPage() {
  const { items, readIds, unreadCount, markRead, markAllRead, loading } = useNotifications();
  const [tab, setTab] = useState<'all'|'unread'|'pinned'>('all');
  const filtered = items.filter(n => tab === 'all' ? true : tab === 'unread' ? !readIds.has(n.id) : n.is_pinned);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-black tracking-tight">Notifications</h1>
            <p className="text-sm text-muted-foreground mt-1">Updates, announcements and alerts.</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => markAllRead()} className="gap-1.5">
              <Check className="h-3.5 w-3.5" /> Mark all read
            </Button>
          )}
        </div>
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread{unreadCount > 0 && ` (${unreadCount})`}</TabsTrigger>
            <TabsTrigger value="pinned">Pinned</TabsTrigger>
          </TabsList>
          <TabsContent value={tab} className="mt-5 space-y-2">
            {loading ? <div className="text-sm text-muted-foreground">Loading…</div> :
              filtered.length === 0 ? <div className="text-sm text-muted-foreground py-10 text-center">Nothing here.</div> :
              filtered.map(n => {
                const Icon = TYPE_ICON[n.type] ?? Megaphone;
                const unread = !readIds.has(n.id);
                return (
                  <button key={n.id} onClick={() => markRead(n.id)}
                    className={`w-full text-left flex gap-3 rounded-2xl border p-4 transition-colors ${unread ? 'border-primary/30 bg-primary/[0.04]' : 'border-border/40 bg-card/40'}`}>
                    <div className={`shrink-0 h-10 w-10 rounded-xl border flex items-center justify-center ${n.priority === 'critical' ? 'border-destructive/40 text-destructive' : 'border-border/40 text-primary'}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-sm font-semibold">
                        {n.is_pinned && <Pin className="h-3 w-3 text-primary" />}{n.title}
                        {unread && <span className="ml-auto h-2 w-2 rounded-full bg-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{n.body}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mt-2">
                        {formatDistanceToNow(new Date(n.publish_at), { addSuffix: true })}
                      </p>
                    </div>
                  </button>
                );
              })}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}