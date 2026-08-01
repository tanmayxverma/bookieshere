import { useEffect, useState } from "react";
import { Calendar, Flame } from "lucide-react";

/** Exam targets — update these once a year. */
export const JEE_ADVANCED_TARGET = new Date("2027-05-16T09:00:00+05:30").getTime();
export const JEE_MAIN_JAN_TARGET = new Date("2027-01-22T09:00:00+05:30").getTime();
export const JEE_MAIN_APR_TARGET = new Date("2027-04-02T09:00:00+05:30").getTime();

type TargetKey = "advanced" | "main-jan" | "main-apr";

const TARGETS: Record<TargetKey, { ts: number; title: JSX.Element; date: string; note: string }> = {
  advanced: {
    ts: JEE_ADVANCED_TARGET,
    title: <>JEE Advanced <span className="text-primary">2027</span></>,
    date: "16 May 2027",
    note: "The day everything counts.",
  },
  "main-jan": {
    ts: JEE_MAIN_JAN_TARGET,
    title: <>JEE Main <span className="text-primary">Jan 2027</span></>,
    date: "22 Jan 2027",
    note: "Session 1 — first shot at your rank.",
  },
  "main-apr": {
    ts: JEE_MAIN_APR_TARGET,
    title: <>JEE Main <span className="text-primary">Apr 2027</span></>,
    date: "2 Apr 2027",
    note: "Session 2 — the improvement window.",
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

function Cell({ value, label }: { value: number; label: string }) {
  const padded = String(value).padStart(2, "0");
  return (
    <div className="group relative flex-1 min-w-[64px]">
      <div className="relative overflow-hidden rounded-xl bg-surface-1/70 backdrop-blur-xl border border-border/60 px-2 py-4 md:px-4 md:py-5 text-center transition-all group-hover:border-primary/50">
        {/* shine sweep */}
        <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
        <div
          key={padded}
          className="font-display font-black text-3xl md:text-5xl text-foreground tracking-tighter tabular-nums animate-fade-in"
        >
          {padded}
        </div>
        <div className="mt-1 text-[10px] md:text-[11px] font-bold tracking-[0.25em] uppercase text-muted-foreground">
          {label}
        </div>
      </div>
    </div>
  );
}

export function JEECountdown() {
  const [mode, setMode] = useState<"advanced" | "main">("advanced");
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
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] via-surface-1/40 to-primary/[0.04] p-6 md:p-10">
        {/* ambient glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-md">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-[11px] font-bold uppercase tracking-widest">
                <Flame className="h-3 w-3" /> Live Countdown
              </span>
              <div className="inline-flex rounded-full border border-border/60 bg-surface-1/70 p-0.5">
                {(["advanced", "main"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest transition-colors ${
                      mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m === "advanced" ? "Advanced" : "Main"}
                  </button>
                ))}
              </div>
            </div>
            {mode === "main" && (
              <div className="inline-flex rounded-lg border border-border/60 bg-surface-1/60 p-0.5">
                {([["main-jan", "January"], ["main-apr", "April"]] as const).map(([k, label]) => (
                  <button
                    key={k}
                    onClick={() => setMainSession(k)}
                    className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      mainSession === k ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight tracking-tight">
              {active.title}
            </h2>
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">{active.date}</span>
              <span className="opacity-60">· {active.note}</span>
            </p>
          </div>

          <div className="w-full lg:w-auto lg:min-w-[520px] flex gap-2 md:gap-3">
            <Cell value={t.days} label="Days" />
            <Cell value={t.hours} label="Hours" />
            <Cell value={t.minutes} label="Minutes" />
            <Cell value={t.seconds} label="Seconds" />
          </div>
        </div>
      </div>
    </section>
  );
}