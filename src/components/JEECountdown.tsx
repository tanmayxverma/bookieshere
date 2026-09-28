import { useEffect, useState } from "react";
import { Calendar, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ─────────────────────────────────────────────────────────────
 * EXAM DATES CONFIGURATION
 * Edit exam targets in one central place.
 * ─────────────────────────────────────────────────────────────
 */
export const EXAM_CONFIG = {
  "main-session-1": {
    id: "main-session-1" as const,
    label: "JEE Main Session 1",
    shortLabel: "Session 1",
    targetDateISO: "2027-01-22T09:00:00+05:30",
    displayDate: "22 Jan 2027",
    year: "2027",
    note: "Session 1 — first shot at your dream percentile.",
  },
  "main-session-2": {
    id: "main-session-2" as const,
    label: "JEE Main Session 2",
    shortLabel: "Session 2",
    targetDateISO: "2027-04-02T09:00:00+05:30",
    displayDate: "2 Apr 2027",
    year: "2027",
    note: "Session 2 — the improvement & rank maximization window.",
  },
  "advanced": {
    id: "advanced" as const,
    label: "JEE Advanced",
    shortLabel: "Advanced",
    targetDateISO: "2027-05-16T09:00:00+05:30",
    displayDate: "16 May 2027",
    year: "2027",
    note: "The day everything counts. IIT Bombay awaits.",
  },
} as const;

export type TargetKey = keyof typeof EXAM_CONFIG;

export const EXAM_OPTIONS: { id: TargetKey; label: string; shortLabel: string }[] = [
  { id: "main-session-1", label: "JEE Main Session 1", shortLabel: "Session 1" },
  { id: "main-session-2", label: "JEE Main Session 2", shortLabel: "Session 2" },
  { id: "advanced", label: "JEE Advanced", shortLabel: "Advanced" },
];

const STORAGE_KEY = "bookie_jee_countdown_target";

/** Get next upcoming timestamp for a target (advances year if date already passed) */
function getTargetTimestamp(targetDateISO: string): number {
  const target = new Date(targetDateISO).getTime();
  const now = Date.now();
  if (target > now) return target;
  const d = new Date(targetDateISO);
  while (d.getTime() <= now) {
    d.setFullYear(d.getFullYear() + 1);
  }
  return d.getTime();
}

function getDiff(target: number) {
  const now = Date.now();
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { days, hours, minutes, seconds };
}

function Cell({ value, label, colorClass = "text-brand-dark dark:text-white" }: { value: number; label: string; colorClass?: string }) {
  const padded = String(value).padStart(2, "0");
  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-blue-200/80 dark:border-slate-800 rounded-xl sm:rounded-2xl p-2 sm:p-5 text-center shadow-xs">
      <div className={`font-display font-black text-2xl sm:text-5xl tracking-tight ${colorClass}`}>
        {padded}
      </div>
      <div className="font-mono text-[9px] sm:text-xs font-extrabold tracking-widest text-slate-500 dark:text-slate-400 uppercase mt-0.5 sm:mt-1">
        {label}
      </div>
    </div>
  );
}

export function JEECountdown() {
  // Default for everyone is JEE Main Session 1; restores user choice from localStorage
  const [selectedTarget, setSelectedTarget] = useState<TargetKey>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as TargetKey;
      if (saved && EXAM_CONFIG[saved]) {
        return saved;
      }
    } catch {}
    return "main-session-1";
  });

  const active = EXAM_CONFIG[selectedTarget];
  const targetTs = getTargetTimestamp(active.targetDateISO);
  const [t, setT] = useState(() => getDiff(targetTs));

  useEffect(() => {
    setT(getDiff(targetTs));
    const id = setInterval(() => setT(getDiff(targetTs)), 1000);
    return () => clearInterval(id);
  }, [targetTs]);

  const handleSelect = (key: TargetKey) => {
    setSelectedTarget(key);
    try {
      localStorage.setItem(STORAGE_KEY, key);
    } catch {}
  };

  return (
    <section className="bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-blue-100/50 dark:from-slate-900/90 dark:via-blue-950/30 dark:to-slate-900/90 border-2 border-blue-200/80 dark:border-blue-900/60 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-card-clean transition-all">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center">
        {/* Target Info & Selector */}
        <div className="lg:col-span-5 space-y-3 sm:space-y-4">
          {/* Selector with 3 Options */}
          <div className="w-full sm:w-auto inline-flex items-center gap-1 p-1 bg-white/95 dark:bg-slate-900/95 rounded-xl sm:rounded-full border border-blue-200/90 dark:border-blue-900/80 shadow-xs">
            <span className="px-2 py-1 text-xs font-mono font-bold text-blue-700 dark:text-blue-400 hidden sm:flex items-center gap-1.5 shrink-0">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
              <span>LIVE</span>
            </span>
            <div className="grid grid-cols-3 sm:flex items-center gap-1 w-full sm:w-auto">
              {EXAM_OPTIONS.map((opt) => {
                const isSelected = selectedTarget === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect(opt.id)}
                    className={cn(
                      "px-2 sm:px-3 py-1.5 sm:py-1 text-xs font-display font-extrabold rounded-lg sm:rounded-full transition-all duration-150 active:scale-95 cursor-pointer whitespace-nowrap text-center",
                      isSelected
                        ? "bg-brand-blue text-white shadow-sm ring-1 ring-blue-600"
                        : "text-slate-600 dark:text-slate-300 hover:text-brand-blue hover:bg-blue-50/80 dark:hover:bg-slate-800"
                    )}
                  >
                    <span className="sm:hidden">{opt.shortLabel}</span>
                    <span className="hidden sm:inline">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-4xl font-display font-black text-brand-dark dark:text-white tracking-tight">
              {active.label} <span className="text-brand-blue font-mono">{active.year}</span>
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold text-slate-600 dark:text-slate-300 mt-1 sm:mt-2">
              <span className="inline-flex items-center gap-1 text-brand-blue dark:text-blue-400">
                <Calendar className="w-4 h-4" />
                {active.displayDate}
              </span>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
              <span className="text-slate-500 dark:text-slate-400 italic text-[11px] sm:text-xs block sm:inline">{active.note}</span>
            </div>
          </div>
        </div>

        {/* Giant Counter Numbers */}
        <div className="lg:col-span-7 grid grid-cols-4 gap-1.5 sm:gap-4">
          <Cell value={t.days} label="DAYS" colorClass="text-brand-dark dark:text-white" />
          <Cell value={t.hours} label="HOURS" colorClass="text-brand-dark dark:text-white" />
          <Cell value={t.minutes} label="MINUTES" colorClass="text-brand-blue dark:text-blue-400" />
          <Cell value={t.seconds} label="SECONDS" colorClass="text-rose-500 dark:text-rose-400" />
        </div>
      </div>
    </section>
  );
}