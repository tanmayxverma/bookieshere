import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Pin,
  AlertTriangle,
  Sparkles,
  Wrench,
  Megaphone,
  BookOpen,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotifications, type Notification } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const LAST_SEEN_KEY = 'bookies_notifs_last_opened';

const TYPE_CONFIG: Record<
  Notification['type'],
  { icon: any; color: string; bg: string; border: string }
> = {
  announcement: {
    icon: Megaphone,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    border: 'border-blue-200/80 dark:border-blue-900/60',
  },
  update: {
    icon: Sparkles,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/60',
    border: 'border-purple-200/80 dark:border-purple-900/60',
  },
  material: {
    icon: BookOpen,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    border: 'border-emerald-200/80 dark:border-emerald-900/60',
  },
  maintenance: {
    icon: Wrench,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    border: 'border-amber-200/80 dark:border-amber-900/60',
  },
  feature: {
    icon: Sparkles,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-950/60',
    border: 'border-indigo-200/80 dark:border-indigo-900/60',
  },
  alert: {
    icon: AlertTriangle,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/60',
    border: 'border-rose-200/80 dark:border-rose-900/60',
  },
};

export function NotificationBell() {
  const { items, readIds, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const [hasOpenedRecently, setHasOpenedRecently] = useState(false);
  const { toast } = useToast();

  const top = useMemo(() => items.slice(0, 8), [items]);

  // Check if there are any unread notifications published AFTER the user last opened the popup
  const hasNewUnseen = useMemo(() => {
    if (hasOpenedRecently || unreadCount === 0) return false;
    try {
      const raw = localStorage.getItem(LAST_SEEN_KEY);
      const lastOpened = raw ? parseInt(raw, 10) : 0;
      return items.some(
        n =>
          !readIds.has(n.id) &&
          new Date(n.publish_at || n.created_at).getTime() > lastOpened
      );
    } catch {
      return false;
    }
  }, [hasOpenedRecently, unreadCount, items, readIds]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      try {
        localStorage.setItem(LAST_SEEN_KEY, Date.now().toString());
      } catch {
        /* ignore */
      }
      setHasOpenedRecently(true);
    }
    setOpen(nextOpen);
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    try {
      localStorage.setItem(LAST_SEEN_KEY, Date.now().toString());
    } catch {
      /* ignore */
    }
    setHasOpenedRecently(true);
    toast({ description: "All notifications marked as read." });
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          aria-label="Notifications"
          className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-all h-9 w-9 flex items-center justify-center cursor-pointer select-none"
          type="button"
        >
          <Bell className="w-4 h-4" />

          {/* Red indicator dot:
              - Blinks ONLY when there are brand-new notifications that haven't been seen/opened yet
              - Stays solid and calm once the popup is opened or viewed
              - Disappears completely when all are marked read */}
          {unreadCount > 0 && (
            hasNewUnseen ? (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 pointer-events-none">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
              </span>
            ) : (
              <span className="absolute top-1.5 right-1.5 inline-flex rounded-full h-2 w-2 bg-rose-500 ring-2 ring-white dark:ring-slate-900 pointer-events-none" />
            )
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[370px] sm:w-[400px] p-0 overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl animate-in fade-in-50 zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Bell className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/60">
                {unreadCount} new
              </span>
            )}
          </div>

          {unreadCount > 0 ? (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-primary hover:text-primary/80 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-primary/10 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
              title="Mark all notifications as read"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark all read</span>
            </button>
          ) : (
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="h-3 w-3" />
              <span>All caught up</span>
            </span>
          )}
        </div>

        {/* Notification List */}
        <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/70">
          {top.length === 0 ? (
            <div className="px-6 py-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Bell className="w-6 h-6 opacity-60" />
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">No notifications yet</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                We will alert you here when new study materials, announcements or updates arrive.
              </p>
            </div>
          ) : (
            top.map(n => {
              const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.announcement;
              const Icon = cfg.icon;
              const unread = !readIds.has(n.id);

              return (
                <div
                  key={n.id}
                  onClick={() => {
                    if (unread) markRead(n.id);
                  }}
                  className={cn(
                    "group relative w-full text-left flex gap-3 px-4 py-3.5 transition-all cursor-pointer",
                    unread
                      ? "bg-blue-50/40 dark:bg-blue-950/20 border-l-[3px] border-l-blue-600 dark:border-l-blue-400 hover:bg-blue-50/70 dark:hover:bg-blue-950/30"
                      : "border-l-[3px] border-l-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  )}
                >
                  <div
                    className={cn(
                      "shrink-0 h-9 w-9 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105",
                      n.priority === 'critical'
                        ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-600'
                        : `${cfg.bg} ${cfg.border} ${cfg.color}`
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-xs md:text-sm font-bold text-slate-900 dark:text-white line-clamp-1 flex items-center gap-1.5">
                        {n.is_pinned && (
                          <Pin className="h-3 w-3 text-primary shrink-0" />
                        )}
                        <span>{n.title}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {unread && (
                          <span
                            onClick={e => {
                              e.stopPropagation();
                              markRead(n.id);
                            }}
                            className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors"
                            title="Click to mark as read"
                          >
                            New
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                      {n.body}
                    </p>

                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 mt-1.5">
                      <Clock className="h-3 w-3 opacity-60" />
                      <span>{formatDistanceToNow(new Date(n.publish_at || n.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 dark:border-slate-800/80 p-2.5 bg-slate-50/40 dark:bg-slate-950/30">
          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          >
            <span>View all notifications</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}