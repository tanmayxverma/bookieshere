import { useEffect, useState } from "react";
import { Calendar, Flame } from "lucide-react";

const TARGET = new Date("2027-05-16T09:00:00+05:30").getTime();

function getDiff() {
  const now = Date.now();
  const diff = Math.max(0, TARGET - now);
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
  const [t, setT] = useState(getDiff);

  useEffect(() => {
    const id = setInterval(() => setT(getDiff()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] via-surface-1/40 to-primary/[0.04] p-6 md:p-10">
        {/* ambient glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-md">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-[11px] font-bold uppercase tracking-widest">
              <Flame className="h-3 w-3" /> Live Countdown
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight tracking-tight">
              JEE Advanced <span className="text-primary">2027</span>
            </h2>
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">16 May 2027</span>
              <span className="opacity-60">· The day everything counts.</span>
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