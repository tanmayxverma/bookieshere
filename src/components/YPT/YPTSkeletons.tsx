import { Timer, Sparkles } from 'lucide-react';

export function YPTLoadingSkeleton() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[70vh] animate-fade-in overflow-hidden">
      {/* Ambient aurora */}
      <div className="absolute inset-0 aurora-bg opacity-60 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-primary/10 blur-[100px] blob-a pointer-events-none" />
      <div className="absolute top-1/3 right-1/3 w-[260px] h-[260px] rounded-full bg-[hsl(195_85%_55%_/_0.10)] blur-[90px] blob-b pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-24 h-24">
          {/* Spinning conic ring */}
          <div className="absolute inset-0 rounded-full loader-ring" />
          <div className="absolute inset-[3px] rounded-full bg-background/95 backdrop-blur-md flex items-center justify-center">
            <Timer className="h-9 w-9 text-primary" />
          </div>
          <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-primary/70 animate-pulse" />
        </div>
        <p className="mt-7 text-lg font-display font-bold tracking-tight">
          Loading <span className="text-gradient-glow">YPT</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground tracking-wider uppercase">Preparing your study space</p>
        <div className="mt-5 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary/60"
              style={{ animation: `pulse 1.2s ease-in-out ${i * 0.18}s infinite` }}
            />
          ))}
        </div>
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
