import { useEffect, useState } from 'react';
import { AdminGuard } from '@/components/Admin/AdminGuard';
import { AdminShell } from '@/components/Admin/AdminShell';
import { useAdminSession } from '@/hooks/useAdminSession';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ACCOUNT_BADGE_STYLES: Record<string, string> = {
  google: 'border-blue-600 bg-blue-600 text-white',
  email: 'border-violet-600 bg-violet-600 text-white',
  guest: 'border-zinc-500 bg-zinc-500 text-white',
};

export default function AdminUsers() {
  const { call } = useAdminSession();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { call('user.list').then(r => { setItems(r.items ?? []); setLoading(false); }); }, [call]);
  return (
    <AdminGuard>
      <AdminShell title="Users">
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> :
          <div className="rounded-xl border border-border/40 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-2/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="text-left p-3">Name</th><th className="text-left p-3">Account</th><th className="text-left p-3">Target</th><th className="text-left p-3">Joined</th><th className="text-left p-3">Active</th></tr>
              </thead>
              <tbody>
                {items.map(u => (
                  <tr key={u.id} className="border-t border-border/30">
                    <td className="p-3 font-medium">{u.display_name}</td>
                    <td className="p-3"><Badge variant="outline" className={`text-[10px] uppercase ${ACCOUNT_BADGE_STYLES[u.account_type] ?? ''}`}>{u.account_type}</Badge></td>
                    <td className="p-3 text-muted-foreground">{u.target_category}</td>
                    <td className="p-3 text-muted-foreground">{formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}</td>
                    <td className="p-3 text-muted-foreground">{formatDistanceToNow(new Date(u.updated_at), { addSuffix: true })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}
      </AdminShell>
    </AdminGuard>
  );
}