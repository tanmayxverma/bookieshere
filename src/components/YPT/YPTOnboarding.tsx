import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { validateName, JEE_YEARS } from '@/types/ypt';
import { Timer, Sparkles, Flame, Trophy } from 'lucide-react';

interface Props {
  open: boolean;
  onSubmit: (name: string, jeeYear: string) => Promise<void>;
}

export function YPTOnboarding({ open, onSubmit }: Props) {
  const [name, setName] = useState('');
  const [jeeYear, setJeeYear] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const nameError = validateName(name);
    if (nameError) { setError(nameError); return; }
    if (!jeeYear) { setError('Please select your JEE focus year'); return; }
    setLoading(true);
    await onSubmit(name.trim(), jeeYear);
    setLoading(false);
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md p-0 overflow-hidden border-border/40"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Hero ambient header */}
        <div className="relative px-6 pt-7 pb-5 overflow-hidden">
          <div className="absolute inset-0 aurora-bg opacity-80" />
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-primary/20 blur-3xl blob-a" />
          <div className="absolute -bottom-12 -left-8 w-40 h-40 rounded-full bg-[hsl(195_85%_55%_/_0.20)] blur-3xl blob-b" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-background/60 backdrop-blur border border-border/40 text-[10px] uppercase tracking-[0.18em] font-bold text-muted-foreground mb-3">
              <Sparkles className="h-3 w-3 text-primary" /> Bookie YPT
            </div>
            <DialogHeader className="text-left space-y-1.5">
              <DialogTitle className="text-2xl font-display font-bold tracking-tight">
                Welcome, future <span className="text-gradient-glow">JEE topper</span>
              </DialogTitle>
              <DialogDescription className="text-sm">
                Track every minute. Build streaks. Out-study the rest.
              </DialogDescription>
            </DialogHeader>
            {/* Feature pills */}
            <div className="flex flex-wrap gap-1.5 mt-4">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-background/60 backdrop-blur border border-border/40 text-[11px] font-semibold">
                <Timer className="h-3 w-3 text-primary" /> Live timer
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-background/60 backdrop-blur border border-border/40 text-[11px] font-semibold">
                <Flame className="h-3 w-3 text-orange-500" /> Streaks
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-background/60 backdrop-blur border border-border/40 text-[11px] font-semibold">
                <Trophy className="h-3 w-3 text-yellow-500" /> Leaderboards
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-6 pb-6 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Student name</label>
            <Input
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="What should we call you?"
              maxLength={30}
              className="h-11"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">JEE focus year</label>
            <Select value={jeeYear} onValueChange={(v) => { setJeeYear(v); setError(''); }}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Select your target year" /></SelectTrigger>
              <SelectContent>
                {JEE_YEARS.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleSubmit} disabled={loading} className="w-full h-12 text-base font-semibold btn-lift shine-card relative" size="lg">
            {loading ? 'Setting up your dashboard…' : 'Begin the grind →'}
          </Button>
          <p className="text-[11px] text-center text-muted-foreground/70">
            Your data stays private. Free forever.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
