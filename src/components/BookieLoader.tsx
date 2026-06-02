import { useEffect, useState } from "react";

interface BookieLoaderProps {
  /** Optional label shown under logo (e.g. "Launching YPT") */
  label?: string;
  /** Fullscreen overlay vs inline */
  fullscreen?: boolean;
}

export function BookieLoader({ label = "Loading", fullscreen = true }: BookieLoaderProps) {
  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-[100] flex items-center justify-center bg-background"
          : "flex items-center justify-center py-16"
      }
      role="status"
      aria-live="polite"
    >
      {/* Ambient glows */}
      <div className="absolute -top-24 -left-24 w-[420px] h-[420px] bg-primary/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[360px] h-[360px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative flex flex-col items-center">
        {/* Animated ring + wordmark */}
        <div className="relative w-28 h-28 mb-7">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, hsl(var(--primary)) 0%, transparent 40%, hsl(var(--primary)/0.6) 70%, transparent 100%)",
              animation: "bookie-spin 1.4s linear infinite",
              filter: "drop-shadow(0 0 18px hsl(var(--primary)/0.35))",
            }}
          />
          <div className="absolute inset-[3px] rounded-full bg-background flex items-center justify-center">
            <span className="font-display font-black italic text-2xl tracking-tight text-foreground">
              B<span className="text-primary">.</span>
            </span>
          </div>
        </div>

        <h1 className="font-display font-black tracking-tight text-3xl md:text-4xl text-foreground">
          BOOKIE
          <span className="text-primary text-xs align-top ml-1">®</span>
        </h1>

        <p className="mt-2 text-[11px] font-bold tracking-[0.3em] uppercase text-muted-foreground">
          {label}
        </p>

        {/* Loader bar */}
        <div className="mt-6 h-[3px] w-44 rounded-full overflow-hidden bg-muted/60">
          <div
            className="h-full w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent"
            style={{ animation: "bookie-bar 1.2s ease-in-out infinite" }}
          />
        </div>
      </div>

      <style>{`
        @keyframes bookie-spin { to { transform: rotate(360deg); } }
        @keyframes bookie-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}

/** Hook: shows a loader on initial mount for `ms` milliseconds. */
export function useInitialLoad(ms = 900) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}