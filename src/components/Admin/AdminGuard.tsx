import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminSession } from '@/hooks/useAdminSession';
import { Loader2, ShieldCheck, Lock, ArrowLeft, KeyRound } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function AdminGuard({ children }: { children: ReactNode }) {
  const { valid, validating, login } = useAdminSession();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (validating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground font-mono">Verifying admin credentials…</span>
      </div>
    );
  }

  if (!valid) {
    const handleLogin = async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!p1.trim() || !p2.trim()) {
        setErrorMsg('Both Password 1 and Password 2 are required.');
        return;
      }
      setBusy(true);
      setErrorMsg(null);
      try {
        await login(p1.trim(), p2.trim());
        toast({ title: 'Admin access granted', description: 'Welcome to Bookie Command Center.' });
        setP1('');
        setP2('');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Invalid credentials';
        setErrorMsg(message);
        toast({
          variant: 'destructive',
          title: 'Authentication failed',
          description: message,
        });
      } finally {
        setBusy(false);
      }
    };

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Background ambient gradient glow */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

        <div className="w-full max-w-md bg-card/60 backdrop-blur-xl border border-border/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to site
            </button>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
              <Lock className="h-3 w-3" /> Secure Gateway
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="h-14 w-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-4 text-primary shadow-inner">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Bookie Admin Portal
            </h1>
            <p className="text-xs text-muted-foreground mt-1.5 max-w-xs mx-auto">
              Dual-layer authentication required. Enter both admin passcodes to unlock the cockpit.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <KeyRound className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground/80">Primary Passcode (Password 1)</Label>
              <Input
                type="password"
                placeholder="Enter password 1"
                value={p1}
                onChange={(e) => setP1(e.target.value)}
                autoComplete="off"
                disabled={busy}
                className="h-11 rounded-xl bg-background/50 border-border/60 focus-visible:ring-primary font-mono text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground/80">Secondary Passcode (Password 2)</Label>
              <Input
                type="password"
                placeholder="Enter password 2"
                value={p2}
                onChange={(e) => setP2(e.target.value)}
                autoComplete="off"
                disabled={busy}
                className="h-11 rounded-xl bg-background/50 border-border/60 focus-visible:ring-primary font-mono text-sm"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={busy || !p1 || !p2}
                className="w-full h-11 rounded-xl font-medium shadow-md shadow-primary/20 gap-2"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                Unlock Cockpit
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}