import { useState } from 'react';
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full border border-border/50 bg-background/60 backdrop-blur-xl" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
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