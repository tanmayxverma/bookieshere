import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { canChangeName, type YPTUser } from '@/types/ypt';
import { Pencil } from 'lucide-react';

interface Props {
  user: YPTUser;
  onChangeName: (newName: string) => Promise<{ success: boolean; error?: string }>;
}

export function YPTNameChange({ user, onChangeName }: Props) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { allowed, remainingChanges, nextAvailableDate } = canChangeName(user.name_change_history || []);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    const result = await onChangeName(newName.trim());
    if (result.success) {
      setOpen(false);
      setNewName('');
    } else {
      setError(result.error || 'Failed to change name');
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => { setOpen(true); setNewName(user.name); setError(''); }}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
        title="Change display name"
      >
        <Pencil className="h-3 w-3" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Change Display Name</DialogTitle>
            <DialogDescription>
              {allowed
                ? `You have ${remainingChanges} name change${remainingChanges !== 1 ? 's' : ''} remaining in the next 14 days.`
                : `Name change limit reached. Try again after ${nextAvailableDate}.`}
            </DialogDescription>
          </DialogHeader>
          {allowed ? (
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">New Name</label>
                <Input
                  value={newName}
                  onChange={(e) => { setNewName(e.target.value); setError(''); }}
                  placeholder="Enter new name"
                  maxLength={30}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={handleSubmit} disabled={loading || !newName.trim()} className="w-full">
                {loading ? 'Updating...' : 'Update Name'}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4">
              You've used all your name changes for this 14-day period. Please wait until {nextAvailableDate}.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
