import { useState, useEffect } from 'react';
import { Sparkles, Activity, ShieldCheck } from 'lucide-react';
import logo from '@/assets/logo.jfif';

export function YPTLoadingSkeleton() {
  const [stepIndex, setStepIndex] = useState(0);
  const steps = [
    "Initializing Bookie Focus Engine...",
    "Calibrating real-time study stopwatch...",
    "Syncing live leaderboard & streaks...",
    "Readying your study cockpit...",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 1100);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[75vh] px-4 py-12 animate-fade-in overflow-hidden">
      {/* Engineering blueprint background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,102,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,102,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full text-center">
        {/* Top Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 font-mono text-[11px] font-bold uppercase tracking-wider mb-8 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>YPT COCKPIT // SECURE BOOT</span>
        </div>

        {/* Central Logo & Orbital Rings */}
        <div className="relative w-28 h-28 flex items-center justify-center mb-6">
          {/* Outer pulsed ring */}
          <div className="absolute inset-0 rounded-3xl border-2 border-dashed border-primary/40 animate-[spin_12s_linear_infinite]" />
          {/* Inner glowing ring */}
          <div className="absolute inset-2 rounded-2xl border-2 border-primary/60 animate-[spin_8s_linear_infinite_reverse]" />
          
          {/* Center Logo with shadow */}
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] bg-white p-1">
            <img src={logo} alt="Bookie" className="w-full h-full object-cover rounded-xl" />
          </div>

          <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-amber-500 animate-bounce" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black font-display tracking-tight text-on-surface">
          Booting <span className="text-primary italic">YPT Cockpit</span>
        </h2>

        {/* Dynamic status ticker */}
        <div className="h-6 mt-2 flex items-center justify-center">
          <p className="text-xs font-mono font-medium text-on-surface-variant/90 transition-all duration-300 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-primary animate-pulse" />
            {steps[stepIndex]}
          </p>
        </div>

        {/* Crisp Progress Bar */}
        <div className="w-full mt-6 bg-surface-container-high rounded-full h-2 overflow-hidden border border-slate-300 dark:border-slate-700 p-0.5">
          <div className="h-full bg-gradient-to-r from-blue-600 via-primary to-indigo-600 rounded-full animate-[progress_1.8s_ease-in-out_infinite] w-2/3" />
        </div>

        {/* Micro Footer Indicator */}
        <div className="flex items-center justify-between w-full mt-4 text-[10px] font-mono text-on-surface-variant/60 uppercase">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" /> ANTI-CHEAT VERIFIED
          </span>
          <span>EST. LATENCY: &lt;18MS</span>
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
