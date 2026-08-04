import { useState, type ReactNode } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { formatHours, getISTTodayStartUTC, getISTWeekStartUTC } from '@/types/ypt';
import { Loader2, ShieldBan, VolumeX, Clock } from 'lucide-react';

interface Stats {
  name: string;
  jeeYear: string;
  today: number;
  week: number;
  allTime: number;
  isBanned: boolean;
  isMuted: boolean;
}

interface Props {
  yptUserId: string;
  fallbackName?: string;
  children: ReactNode;
}

/**
 * Tap a name/avatar in a room to see a compact study profile.
 * Fetched on demand when the popover opens — no live subscription.
 */
export function StudyProfilePopover({ yptUserId, fallbackName, children }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const todayStart = getISTTodayStartUTC();
      const weekStart = getISTWeekStartUTC();

      const [{ data: u }, { data: sessions }] = await Promise.all([
        (supabase as any).from('ypt_users').select('name, jee_focus_year, device_id').eq('id', yptUserId).maybeSingle(),
        (supabase as any)
          .from('study_sessions')
          .select('duration_seconds, started_at')
          .eq('ypt_user_id', yptUserId)
          .in('status', ['completed', 'active']),
      ]);

      let isBanned = false;
      let isMuted = false;
      if (u?.device_id) {
        // Moderation state lives on the site profile, matched by device.
        const { data: p } = await (supabase as any)
          .from('profiles')
          .select('is_banned, is_muted, muted_until')
          .eq('device_id', u.device_id)
          .maybeSingle();
        if (p) {
          isBanned = !!p.is_banned;
          isMuted = !!p.is_muted && (!p.muted_until || new Date(p.muted_until) > new Date());
        }
      }

      let today = 0, week = 0, allTime = 0;
      (sessions ?? []).forEach((s: any) => {
        const d = s.duration_seconds || 0;
        allTime += d;
        if (s.started_at >= weekStart) week += d;
        if (s.started_at >= todayStart) today += d;
      });

      setStats({
        name: u?.name || fallbackName || 'Unknown',
        jeeYear: u?.jee_focus_year || '',
        today, week, allTime, isBanned, isMuted,
      });
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v && !stats) load();
      }}
    >
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-64 p-0 overflow-hidden" align="start">
        {loading || !stats ? (
          <div className="p-6 flex items-center justify-center text-muted-foreground">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="text-xs">Profile unavailable.</span>}
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 p-4 border-b border-border/40">
              <div className="h-10 w-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold shrink-0">
                {stats.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{stats.name}</p>
                <p className="text-xs text-muted-foreground truncate">{stats.jeeYear || '—'}</p>
              </div>
            </div>

            {(stats.isBanned || stats.isMuted) && (
              <div className="px-4 py-2 border-b border-border/40 flex items-center gap-1.5 text-[11px] font-medium text-destructive bg-destructive/5">
                {stats.isBanned ? <ShieldBan className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                {stats.isBanned ? 'Banned from the community' : 'Muted — currently restricted'}
              </div>
            )}

            <div className="p-4 space-y-2">
              <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-muted-foreground/70 flex items-center gap-1.5">
                <Clock className="h-3 w-3" /> Study hours
              </p>
              <Row label="Today" value={formatHours(stats.today)} strong />
              <Row label="This week" value={formatHours(stats.week)} />
              <Row label="All time" value={formatHours(stats.allTime)} />
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`tabular-nums ${strong ? 'font-bold' : 'font-medium'}`}>{value}</span>
    </div>
  );
}
