import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Bell, MessagesSquare, Users, LogOut, ShieldCheck, Library, Megaphone, LayoutGrid, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminSession } from '@/hooks/useAdminSession';

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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link to="/admin" className="flex items-center gap-2 font-display font-bold">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Bookie Admin
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(n => {
              const active = n.exact ? loc.pathname === n.to : loc.pathname.startsWith(n.to);
              const Icon = n.icon;
              return (
                <Link key={n.to} to={n.to}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${active ? 'bg-primary/10 text-foreground border border-primary/30' : 'text-muted-foreground hover:text-foreground'}`}>
                  <Icon className="h-3.5 w-3.5" /> {n.label}
                </Link>
              );
            })}
          </nav>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={async () => { await logout(); navigate('/'); }}>
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </Button>
        </div>
        <div className="md:hidden border-t border-border/40 overflow-x-auto">
          <div className="container mx-auto px-4 flex gap-1 py-2">
            {NAV.map(n => {
              const active = n.exact ? loc.pathname === n.to : loc.pathname.startsWith(n.to);
              return (
                <Link key={n.to} to={n.to} className={`shrink-0 text-xs px-3 py-1.5 rounded-full ${active ? 'bg-primary/10 text-foreground border border-primary/30' : 'text-muted-foreground border border-transparent'}`}>
                  {n.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <h1 className="font-display text-2xl font-bold mb-6">{title}</h1>
        {children}
      </main>
    </div>
  );
}
