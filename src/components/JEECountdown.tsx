import { useEffect, useState } from "react";
import { Calendar, Flame } from "lucide-react";

/** Exam targets — update these once a year. */
export const JEE_ADVANCED_TARGET = new Date("2027-05-16T09:00:00+05:30").getTime();
export const JEE_MAIN_JAN_TARGET = new Date("2027-01-22T09:00:00+05:30").getTime();
export const JEE_MAIN_APR_TARGET = new Date("2027-04-02T09:00:00+05:30").getTime();

type TargetKey = "advanced" | "main-jan" | "main-apr";

const TARGETS: Record<TargetKey, { ts: number; title: JSX.Element; badge: string; date: string; note: string }> = {
  "main-jan": {
    ts: JEE_MAIN_JAN_TARGET,
    title: <>JEE Main <span className="text-brand-blue font-mono">Jan Session</span></>,
    badge: "ONGOING • SESSION 1",
    date: "22 Jan 2027",
    note: "Ongoing Session 1 — prime target for 99+ percentile.",
  },
  "main-apr": {
    ts: JEE_MAIN_APR_TARGET,
    title: <>JEE Main <span className="text-brand-blue font-mono">Session 2 (April)</span></>,
    badge: "SESSION 2 • 2 APRIL",
    date: "2 April 2027",
    note: "Session 2 — the improvement window & final rank boost.",
  },
  advanced: {
    ts: JEE_ADVANCED_TARGET,
    title: <>JEE Advanced <span className="text-brand-blue font-mono">2027</span></>,
    badge: "IIT ENTRANCE",
    date: "16 May 2027",
    note: "The day everything counts. IIT Bombay target zone.",
  },
};

function getDiff(target: number) {
  const now = Date.now();
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { days, hours, minutes, seconds };
}

function Cell({ value, label, colorClass = "text-brand-dark" }: { value: number; label: string; colorClass?: string }) {
  const padded = String(value).padStart(2, "0");
  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-blue-200/80 dark:border-blue-900/60 rounded-xl sm:rounded-2xl p-2 sm:p-5 text-center shadow-sm">
      <div className={`font-display font-black text-2xl sm:text-4xl md:text-5xl tracking-tight ${colorClass}`}>
        {padded}
      </div>
      <div className="font-mono text-[9px] sm:text-xs font-extrabold tracking-wider sm:tracking-widest text-slate-500 dark:text-slate-400 uppercase mt-0.5 sm:mt-1">
        {label}
      </div>
    </div>
  );
}

export function JEECountdown() {
  // Default to JEE Main Session 1 (Jan) as requested
  const [mode, setMode] = useState<"main" | "advanced">("main");
  const [mainSession, setMainSession] = useState<"main-jan" | "main-apr">("main-jan");

  const key: TargetKey = mode === "advanced" ? "advanced" : mainSession;
  const active = TARGETS[key];

  const [t, setT] = useState(() => getDiff(active.ts));

  useEffect(() => {
    setT(getDiff(active.ts));
    const id = setInterval(() => setT(getDiff(active.ts)), 1000);
    return () => clearInterval(id);
  }, [active.ts]);

  return (
    <section className="bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-blue-100/50 dark:from-slate-900/90 dark:via-blue-950/60 dark:to-slate-900/90 border-2 border-blue-200/80 dark:border-blue-900/60 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-card-clean">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center">
        {/* Target Info */}
        <div className="lg:col-span-5 space-y-3">
          {/* Main Toggle Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1 p-1 bg-white dark:bg-slate-900 rounded-full border border-blue-200 dark:border-blue-800">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-500" /> COUNTDOWN
              </span>
              <button
                onClick={() => setMode("main")}
                className={`px-3 py-1 text-xs font-extrabold rounded-full transition-all ${
                  mode === "main" ? "bg-brand-blue text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-brand-dark"
                }`}
              >
                JEE MAIN
              </button>
              <button
                onClick={() => setMode("advanced")}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                  mode === "advanced" ? "bg-brand-blue text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-brand-dark"
                }`}
              >
                JEE ADVANCED
              </button>
            </div>
          </div>

          {/* Sub-options for JEE Main: Jan vs April */}
          {mode === "main" && (
            <div className="inline-flex flex-wrap items-center gap-1.5 p-1 bg-white/90 dark:bg-slate-900/90 rounded-xl border border-blue-200/90 dark:border-blue-800 shadow-sm animate-in fade-in duration-200">
              <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 px-2 uppercase">
                Session:
              </span>
              <button
                onClick={() => setMainSession("main-jan")}
                className={`px-3 py-1 text-xs font-mono font-extrabold rounded-lg transition-all flex items-center gap-1.5 ${
                  mainSession === "main-jan"
                    ? "bg-brand-blue text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Ongoing Jan Session
              </button>
              <button
                onClick={() => setMainSession("main-apr")}
                className={`px-3 py-1 text-xs font-mono font-extrabold rounded-lg transition-all flex items-center gap-1.5 ${
                  mainSession === "main-apr"
                    ? "bg-brand-blue text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>🎯</span>
                Session 2 (2 April)
              </button>
            </div>
          )}

          <div>
            <h2 className="text-2xl sm:text-4xl font-display font-black text-brand-dark tracking-tight">
              {active.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold text-slate-600 dark:text-slate-300 mt-1">
              <span className="inline-flex items-center gap-1 bg-white/80 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                <Calendar className="w-3.5 h-3.5 text-brand-blue" />
                {active.date}
              </span>
              <span>•</span>
              <span className="text-slate-500 dark:text-slate-400 italic">{active.note}</span>
            </div>
          </div>
        </div>

        {/* Giant Counter Numbers */}
        <div className="lg:col-span-7 grid grid-cols-4 gap-1.5 sm:gap-4">
          <Cell value={t.days} label="DAYS" colorClass="text-brand-dark" />
          <Cell value={t.hours} label="HOURS" colorClass="text-brand-dark" />
          <Cell value={t.minutes} label="MINUTES" colorClass="text-brand-blue" />
          <Cell value={t.seconds} label="SECONDS" colorClass="text-brand-coral" />
        </div>
      </div>
    </section>
  );
}