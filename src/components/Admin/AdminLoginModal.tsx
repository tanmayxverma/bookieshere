import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Lock } from 'lucide-react';
import { useAdminSession } from '@/hooks/useAdminSession';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export function AdminLoginModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { login } = useAdminSession();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!p1 || !p2) return;
    setBusy(true);
    try {
      await login(p1, p2);
      onOpenChange(false);
      setP1(''); setP2('');
      navigate('/admin');
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Access denied', description: e.message ?? 'Invalid credentials' });
    } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Lock className="h-4 w-4" /> Admin access</DialogTitle>
          <DialogDescription>Enter the admin username and password.</DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="admin-modal-username">Username</Label>
              <Input id="admin-modal-username" name="username" type="text" value={p1} onChange={(e) => setP1(e.target.value)} autoComplete="username" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-modal-password">Password</Label>
              <Input id="admin-modal-password" name="password" type="password" value={p2} onChange={(e) => setP2(e.target.value)} autoComplete="current-password" />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={busy} className="gap-1.5">{busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
