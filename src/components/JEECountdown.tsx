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

function Cell({ value, label, colorClass = "text-foreground" }: { value: number; label: string; colorClass?: string }) {
  const padded = String(value).padStart(2, "0");
  return (
    <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-2.5 sm:p-5 text-center shadow-xs">
      <div className={`font-mono font-bold text-2xl sm:text-4xl tracking-tight font-tabular ${colorClass}`}>
        {padded}
      </div>
      <div className="font-mono text-[9px] sm:text-xs font-semibold tracking-widest text-muted-foreground uppercase mt-1">
        {label}
      </div>
    </div>
  );
}

export function JEECountdown() {
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
    <section className="relative bg-card border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] transition-all">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center">
        {/* Target Info & Selector */}
        <div className="lg:col-span-5 space-y-3 sm:space-y-4">
          {/* Selector with 3 Options */}
          <div className="w-full sm:w-auto inline-flex items-center gap-1 p-1 bg-muted/60 rounded-full border border-border">
            <span className="px-2.5 py-1 text-xs font-mono font-semibold text-muted-foreground hidden sm:flex items-center gap-1.5 shrink-0">
              <Flame className="w-3.5 h-3.5 text-primary" />
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
                      "px-2 sm:px-3 py-1 text-xs font-sans font-medium rounded-full transition-all duration-150 cursor-pointer whitespace-nowrap text-center select-none",
                      isSelected
                        ? "bg-card text-foreground font-semibold shadow-xs border border-border/80"
                        : "text-muted-foreground hover:text-foreground border border-transparent"
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
            <h2 className="text-2xl sm:text-3xl font-serif font-medium text-foreground tracking-tight">
              {active.label} <span className="text-primary font-mono font-bold text-xl sm:text-2xl">{active.year}</span>
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-muted-foreground mt-1 sm:mt-1.5">
              <span className="inline-flex items-center gap-1 text-primary font-semibold">
                <Calendar className="w-3.5 h-3.5" />
                {active.displayDate}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="italic text-[11px] sm:text-xs block sm:inline">{active.note}</span>
            </div>
          </div>
        </div>

        {/* Counter Numbers */}
        <div className="lg:col-span-7 grid grid-cols-4 gap-2 sm:gap-3">
          <Cell value={t.days} label="DAYS" colorClass="text-foreground" />
          <Cell value={t.hours} label="HOURS" colorClass="text-foreground" />
          <Cell value={t.minutes} label="MINUTES" colorClass="text-primary" />
          <Cell value={t.seconds} label="SECONDS" colorClass="text-[#B91C1C]" />
        </div>
      </div>
    </section>
  );
}