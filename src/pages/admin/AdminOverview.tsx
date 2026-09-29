import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminGuard } from '@/components/Admin/AdminGuard';
import { AdminShell } from '@/components/Admin/AdminShell';
import { useAdminSession } from '@/hooks/useAdminSession';
import { usePortals } from '@/hooks/usePortals';
import { useTestSeries } from '@/hooks/useTestSeries';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Users, Bell, MessagesSquare, BookOpen, Activity, LayoutGrid, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminOverview() {
  const { call } = useAdminSession();
  const { portals } = usePortals();
  const { testSeries } = useTestSeries();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const [overviewRes, matCountRes, ticketListRes] = await Promise.all([
          call('stats.overview').catch(() => null),
          supabase.from('materials').select('id', { count: 'exact', head: true }),
          call('ticket.list', { status: 'all' }).catch(() => ({ items: [] })),
        ]);

        const base = overviewRes || {};

        // Accurate live count of materials
        const materialsCount = matCountRes?.count ?? base.materials ?? 0;

        // Accurate open tickets (exclude resolved, closed, rejected)
        const allTickets = ticketListRes?.items ?? [];
        const openTicketsCount = allTickets.length > 0
          ? allTickets.filter((t: any) => !['resolved', 'closed', 'rejected'].includes(t.status)).length
          : (base.openTickets ?? 0);

        setStats({
          ...base,
          materials: materialsCount,
          openTickets: openTicketsCount,
        });
      } catch (err) {
        console.error('Failed to load admin stats', err);
      }
    }

    loadStats();
  }, [call]);

  return (
    <AdminGuard>
      <AdminShell title="Overview">
        {!stats ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
            <Loader2 className="h-6 w-6 animate-spin" /> Loading admin dashboard…
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              <Stat icon={Users} label="Total Users" value={stats.users ?? 0} />
              <Stat icon={Activity} label="Active 7d" value={stats.activeUsers ?? 0} />
              <Stat icon={Bell} label="Notifications" value={stats.notifs ?? 0} to="/admin/notifications" />
              <Stat icon={BookOpen} label="Materials" value={stats.materials ?? 0} to="/admin/materials" />
              <Stat icon={LayoutGrid} label="Portals" value={portals?.length || 0} to="/admin/portals" />
              <Stat icon={FileText} label="Test Series" value={testSeries?.length || 0} to="/admin/tests" />
              <Stat icon={MessagesSquare} label="Open Tickets" value={stats.openTickets ?? 0} to="/admin/support" />
            </div>

            {/* Quick Management Cards */}
            <div className="mt-8 grid md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-border/40 bg-card/40 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1">
                    <Bell className="h-4 w-4" /> Notifications Management
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Create alerts, announcements, and set auto-delete timers after specific intervals.
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="mt-4 gap-1 w-full justify-between">
                  <Link to="/admin/notifications">
                    <span>Manage Notifications</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>

              <div className="rounded-2xl border border-border/40 bg-card/40 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1">
                    <LayoutGrid className="h-4 w-4" /> Portals Management
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Add, edit, and delete partner and mirror portals like PW, Next Toppers, Vibrant, and custom mirrors.
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="mt-4 gap-1 w-full justify-between">
                  <Link to="/admin/portals">
                    <span>Manage Portals</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>

              <div className="rounded-2xl border border-border/40 bg-card/40 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1">
                    <FileText className="h-4 w-4" /> Test Series Management
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Add, edit, and delete test providers like ALLEN, FIITJEE, Narayana, and online mock tests.
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="mt-4 gap-1 w-full justify-between">
                  <Link to="/admin/tests">
                    <span>Manage Test Series</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-border/40 bg-card/40">
              <div className="px-4 py-3 border-b border-border/40 text-sm font-semibold flex items-center justify-between">
                <span>Recent admin activity</span>
                <span className="text-xs text-muted-foreground">Audit log</span>
              </div>
              <ul className="divide-y divide-border/30">
                {(stats.recent ?? []).length === 0 ? (
                  <li className="p-4 text-sm text-muted-foreground">No activity yet.</li>
                ) : (
                  (stats.recent as any[]).map((r) => (
                    <li key={r.id} className="px-4 py-2.5 text-sm flex items-center justify-between">
                      <span>
                        <span className="font-mono text-xs text-muted-foreground">{r.action}</span>{' '}
                        {r.metadata && Object.keys(r.metadata).length > 0 && (
                          <span className="text-xs text-muted-foreground">— {JSON.stringify(r.metadata)}</span>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </>
        )}
      </AdminShell>
    </AdminGuard>
  );
}

function Stat({ icon: Icon, label, value, to }: { icon: any; label: string; value: number; to?: string }) {
  const content = (
    <div className="rounded-2xl border border-border/40 bg-card/40 p-4 transition-all hover:border-border/80">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      <div className="font-display text-2xl sm:text-3xl font-bold mt-2">{value}</div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block transition-transform active:scale-[0.98]">
        {content}
      </Link>
    );
  }

  return content;
}
