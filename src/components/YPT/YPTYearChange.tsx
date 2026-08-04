import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { JEE_YEARS, type YPTUser } from '@/types/ypt';
import { CalendarCog, Check } from 'lucide-react';

interface Props {
  user: YPTUser;
  onChangeYear: (year: string) => Promise<{ success: boolean; error?: string }>;
}

/** Lets a user switch their JEE focus year after onboarding. Unrestricted. */
export function YPTYearChange({ user, onChangeYear }: Props) {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(user.jee_focus_year);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError('');
    const res = await onChangeYear(year);
    if (res.success) setOpen(false);
    else setError(res.error || 'Failed to update target year');
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => { setOpen(true); setYear(user.jee_focus_year); setError(''); }}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
        title="Change JEE target year"
      >
        <CalendarCog className="h-3.5 w-3.5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Change Target Year</DialogTitle>
            <DialogDescription>
              Currently set to <strong>{user.jee_focus_year}</strong>. You can change this any time.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            {JEE_YEARS.map((y) => (
              <button
                key={y}
                onClick={() => { setYear(y); setError(''); }}
                className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                  year === y
                    ? 'border-primary/40 bg-primary/10 text-foreground'
                    : 'border-border/50 hover:bg-muted/50 text-muted-foreground'
                }`}
              >
                {y}
                {year === y && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              onClick={submit}
              disabled={loading || year === user.jee_focus_year}
              className="w-full mt-2"
            >
              {loading ? 'Updating…' : 'Save Target Year'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
