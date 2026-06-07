import { useEffect, useState } from 'react';
import { AdminGuard } from '@/components/Admin/AdminGuard';
import { AdminShell } from '@/components/Admin/AdminShell';
import { useAdminSession } from '@/hooks/useAdminSession';
import { Loader2, Users, Bell, MessagesSquare, CheckCircle2, Activity } from 'lucide-react';

export default function AdminOverview() {
  const { call } = useAdminSession();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => { call('stats.overview').then(setStats).catch(() => {}); }, [call]);

  return (
    <AdminGuard>
      <AdminShell title="Overview">
        {!stats ? <Loader2 className="h-5 w-5 animate-spin" /> : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Stat icon={Users} label="Total users" value={stats.users ?? 0} />
              <Stat icon={Activity} label="Active 7d" value={stats.activeUsers ?? 0} />
              <Stat icon={Bell} label="Notifications" value={stats.notifs ?? 0} />
              <Stat icon={MessagesSquare} label="Open tickets" value={stats.openTickets ?? 0} />
              <Stat icon={CheckCircle2} label="Resolved" value={stats.resolvedTickets ?? 0} />
            </div>
            <div className="mt-8 rounded-2xl border border-border/40 bg-card/40">
              <div className="px-4 py-3 border-b border-border/40 text-sm font-semibold">Recent admin activity</div>
              <ul className="divide-y divide-border/30">
                {(stats.recent ?? []).length === 0 ? <li className="p-4 text-sm text-muted-foreground">No activity yet.</li> :
                  (stats.recent as any[]).map(r => (
                    <li key={r.id} className="px-4 py-2.5 text-sm flex items-center justify-between">
                      <span><span className="font-mono text-xs text-muted-foreground">{r.action}</span> {r.metadata && Object.keys(r.metadata).length > 0 && <span className="text-xs text-muted-foreground">— {JSON.stringify(r.metadata)}</span>}</span>
                      <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </>
        )}
      </AdminShell>
    </AdminGuard>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/40 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />{label}
      </div>
      <div className="font-display text-3xl font-bold mt-2">{value}</div>
    </div>
  );
}
