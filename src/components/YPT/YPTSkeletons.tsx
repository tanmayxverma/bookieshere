import { Timer } from 'lucide-react';

export function YPTLoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Timer className="h-7 w-7 text-primary animate-pulse" />
        </div>
        <div className="absolute -inset-2 rounded-3xl bg-primary/5 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
      </div>
      <p className="mt-6 text-sm font-medium text-muted-foreground">Loading YPT...</p>
      <div className="mt-3 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-primary/40"
            style={{ animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
    </div>
  );
}

/** Skeleton card used inside tabs */
export function YPTContentSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-muted animate-pulse" />
              <div className="w-16 h-3 rounded bg-muted animate-pulse" />
            </div>
            <div className="w-20 h-6 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
      {/* Chart skeleton */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <div className="w-24 h-4 rounded bg-muted animate-pulse" />
        <div className="flex items-end gap-2 h-[160px]">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-muted animate-pulse"
              style={{ height: `${30 + Math.random() * 60}%`, animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Leaderboard skeleton */
export function YPTLeaderboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted animate-pulse" />
          <div className="w-36 h-4 rounded bg-muted animate-pulse" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="w-8 h-6 rounded bg-muted animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="w-28 h-4 rounded bg-muted animate-pulse" />
                <div className="w-16 h-3 rounded bg-muted animate-pulse" />
              </div>
              <div className="w-12 h-4 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** History list skeleton */
export function YPTHistorySkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="w-44 h-9 rounded-md bg-muted animate-pulse" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-4 flex items-center gap-4"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="w-10 h-10 rounded-lg bg-muted animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="w-24 h-4 rounded bg-muted animate-pulse" />
              <div className="w-40 h-3 rounded bg-muted animate-pulse" />
            </div>
            <div className="w-16 h-4 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
