import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, Pin, AlertTriangle, Sparkles, Wrench, Megaphone, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotifications, type Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

const TYPE_ICON: Record<Notification['type'], any> = {
  announcement: Megaphone, update: Sparkles, material: BookOpen,
  maintenance: Wrench, feature: Sparkles, alert: AlertTriangle,
};

export function NotificationBell() {
  const { items, readIds, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const top = items.slice(0, 8);

  // Auto-persist "seen" when the user opens the bell — badge should not
  // reappear on nav / reopen unless a new or modified notification arrives.
  useEffect(() => {
    if (open && unreadCount > 0) {
      markAllRead();
    }
  }, [open, unreadCount, markAllRead]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Notifications"
          className="p-2 text-slate-500 hover:text-brand-dark dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors h-9 w-9 flex items-center justify-center cursor-pointer"
          type="button"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-coral rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-[360px] p-0 overflow-hidden border-border/60 bg-background/95 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
          <div className="font-semibold text-sm">Notifications</div>
          {unreadCount > 0 && (
            <button onClick={() => markAllRead()} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              <Check className="h-3 w-3" /> Mark all read
            </button>
          )}
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {top.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">No notifications yet.</div>
          ) : top.map(n => {
            const Icon = TYPE_ICON[n.type] ?? Megaphone;
            const unread = !readIds.has(n.id);
            return (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`w-full text-left flex gap-3 px-4 py-3 border-b border-border/30 last:border-0 transition-colors ${unread ? 'bg-primary/[0.04] hover:bg-primary/[0.08]' : 'hover:bg-surface-2/40'}`}
              >
                <div className={`shrink-0 h-9 w-9 rounded-xl border flex items-center justify-center ${n.priority === 'critical' ? 'border-destructive/40 text-destructive' : 'border-border/40 text-primary'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-semibold text-foreground line-clamp-1 flex items-center gap-1.5">
                      {n.is_pinned && <Pin className="h-3 w-3 text-primary" />}{n.title}
                    </div>
                    {unread && <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.body}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mt-1">
                    {formatDistanceToNow(new Date(n.publish_at), { addSuffix: true })}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
        <div className="border-t border-border/40 p-2">
          <Link to="/notifications" onClick={() => setOpen(false)} className="block text-center text-xs font-medium text-muted-foreground hover:text-foreground py-2">
            View all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}