import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { validateName, JEE_YEARS } from '@/types/ypt';
import { Timer } from 'lucide-react';

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
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-primary/10">
              <Timer className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold">Welcome to Bookie YPT</DialogTitle>
          </div>
          <DialogDescription>Your personal study tracker. Set up once, track forever.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Student Name</label>
            <Input
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="Enter your name"
              maxLength={30}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">JEE Focus Year</label>
            <Select value={jeeYear} onValueChange={(v) => { setJeeYear(v); setError(''); }}>
              <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
              <SelectContent>
                {JEE_YEARS.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleSubmit} disabled={loading} className="w-full" size="lg">
            {loading ? 'Setting up...' : 'Start Tracking'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
