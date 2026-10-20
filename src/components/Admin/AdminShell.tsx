import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Bell, MessagesSquare, Users, LogOut, ShieldCheck, Library, Megaphone, LayoutGrid, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminSession } from '@/hooks/useAdminSession';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  { to: '/admin/materials', label: 'Materials', icon: Library },
  { to: '/admin/portals', label: 'Portals', icon: LayoutGrid },
  { to: '/admin/tests', label: 'Tests', icon: FileText },
  { to: '/admin/community', label: 'Community', icon: Megaphone },
  { to: '/admin/support', label: 'Support', icon: MessagesSquare },
  { to: '/admin/users', label: 'Users', icon: Users },
];

export function AdminShell({ children, title }: { children: ReactNode; title: string }) {
  const { logout } = useAdminSession();
  const navigate = useNavigate();
  const loc = useLocation();

  return (
    <div className="min-h-screen bg-academic-grid text-foreground pb-20">
      <header className="border-b border-border/80 bg-card/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link to="/admin" className="flex items-center gap-2 font-serif font-bold text-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Bookie Admin Desk</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1.5">
            {NAV.map(n => {
              const active = n.exact ? loc.pathname === n.to : loc.pathname.startsWith(n.to);
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-semibold transition-all border",
                    active
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" /> {n.label}
                </Link>
              );
            })}
          </nav>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 font-mono text-xs border-border/80 rounded-xl"
            onClick={async () => { await logout(); navigate('/'); }}
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </Button>
        </div>
        <div className="md:hidden border-t border-border/80 overflow-x-auto no-scrollbar">
          <div className="container mx-auto px-4 flex gap-1.5 py-2">
            {NAV.map(n => {
              const active = n.exact ? loc.pathname === n.to : loc.pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "shrink-0 text-xs px-2.5 py-1 rounded-lg font-mono font-semibold border",
                    active
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "text-muted-foreground border-transparent hover:bg-muted/60"
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-bold text-foreground">{title}</h1>
        </div>
        {children}
      </main>
    </div>
  );
}
