import { Card } from '@/components/ui/card';
import { Users } from 'lucide-react';
import type { ActiveStudyUser } from '@/types/ypt';

interface Props {
  users: ActiveStudyUser[];
}

export function YPTPresence({ users }: Props) {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        Studying Now
        <span className="ml-auto text-xs font-normal bg-primary/10 text-primary px-2 py-0.5 rounded-full">
          {users.length}
        </span>
      </h3>
      {users.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No one studying right now</p>
      ) : (
        <div className="space-y-3">
          {users.map((u, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{u.name}</p>
                <p className="text-xs text-muted-foreground">
                  {u.subject} · {u.jee_focus_year}
                </p>
              </div>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
