import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Target,
  ChevronDown,
  CheckCircle,
  ExternalLink,
  Activity,
  Flame,
  Swords,
  Zap,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import type { TestSeriesProvider, TestSeriesResource } from "@/data/testSeries";
import { useTestSeries } from "@/hooks/useTestSeries";
import { isSafeUrl } from "@/lib/urlValidation";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { InstituteLogo } from "@/components/common/InstituteLogo";

function ProviderCard({
  provider,
  expanded,
  onToggle,
  query,
}: {
  provider: TestSeriesProvider;
  expanded: boolean;
  onToggle: () => void;
  query: string;
}) {
  const navigate = useNavigate();
  const open = (r: TestSeriesResource, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSafeUrl(r.url)) {
      toast({
        title: "Link blocked",
        description: "This URL isn't on the allowed list.",
        variant: "destructive",
      });
      return;
    }
    window.open(r.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="group relative flex flex-col rounded-xl border-2 border-border bg-card shadow-[4px_4px_0px_var(--desk-border)] hover:shadow-[6px_6px_0px_var(--desk-border)] hover:-translate-y-0.5 transition-all duration-150 overflow-hidden">
      <div
        className="p-5 space-y-3 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <InstituteLogo
              id={provider.id}
              name={provider.name}
              logo={provider.logo}
              accent={provider.accent}
              className="w-12 h-12 text-base rounded-lg border-2 border-border shadow-[2px_2px_0px_var(--desk-border)]"
            />
            <div>
              <span className="font-display text-base font-bold text-foreground leading-tight block truncate max-w-[190px] sm:max-w-[240px]">
                {provider.name}
              </span>
              <span className="font-mono text-xs text-muted-foreground font-medium">
                {provider.resources.length} {provider.resources.length === 1 ? "Paper" : "Papers"}
              </span>
            </div>
          </div>
          <button
            type="button"
            aria-label="Toggle resources list"
            className="p-1 rounded-md border border-border/60 hover:bg-muted text-muted-foreground transition-colors"
          >
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                expanded ? "rotate-180" : ""
              )}
            />
          </button>
        </div>

        <p className="font-sans text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {provider.description}
        </p>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="px-2 py-0.5 rounded border border-border bg-muted font-mono text-[10px] font-bold text-foreground">
            MAINS + ADV
          </span>
          <span className="px-2 py-0.5 rounded border border-primary/30 bg-primary/10 font-mono text-[10px] font-bold text-primary">
            VERIFIED
          </span>
        </div>
      </div>

      {/* Expanded resources inline */}
      <div
        className={cn(
          "grid transition-all duration-200 ease-out border-t border-border",
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="bg-muted/40 p-2.5 grid gap-1.5">
            {provider.resources.map((r, i) => (
              <button
                key={i}
                onClick={(e) => open(r, e)}
                className="flex items-center justify-between p-2 rounded-lg border border-border/50 bg-card hover:bg-accent hover:border-primary/50 shadow-[1px_1px_0px_var(--desk-border)] transition-colors text-left group/res"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-sans text-xs text-foreground font-semibold truncate">
                    {r.name}
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground truncate">
                    {(() => {
                      try {
                        return new URL(r.url).hostname.replace(/^www\./, "");
                      } catch {
                        return "External Portal";
                      }
                    })()}
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover/res:text-primary transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 py-3 border-t border-border flex items-center justify-between bg-muted/20 mt-auto">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
          <CheckCircle className="w-3.5 h-3.5 text-primary" />
          <span>Active Feed</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/test-series/${provider.id}`);
          }}
          className="px-3 py-1.5 rounded-lg border-2 border-border bg-primary text-primary-foreground font-sans text-xs font-bold shadow-[2px_2px_0px_var(--desk-border)] hover:bg-primary/90 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1"
        >
          <span>Enter Portal</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export function TestSeriesHub() {
  const { testSeries } = useTestSeries();
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "full" | "battle">("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          timeZone: "Asia/Kolkata",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    const list = testSeries || [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list
      .map((p) => {
        const nameMatch =
          (p.name || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q) ||
          (p.id || "").toLowerCase().includes(q);
        const matchedResources = (p.resources || []).filter((r) =>
          (r.name || "").toLowerCase().includes(q)
        );
        if (nameMatch) return p;
        if (matchedResources.length > 0) return { ...p, resources: matchedResources };
        return null;
      })
      .filter(Boolean) as TestSeriesProvider[];
  }, [testSeries, query]);

  const isSearching = query.trim().length > 0;
  const totalResources = (testSeries || []).reduce(
    (sum, p) => sum + (p.resources?.length || 0),
    0
  );

  return (
    <div className="w-full pt-6 flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-foreground pb-20">
      <div className="flex flex-col w-full">
        {/* Hero Header Section */}
        <section className="relative w-full rounded-2xl border-2 border-border bg-card p-6 md:p-8 shadow-[4px_4px_0px_var(--desk-border)] mt-4 mb-8 overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 flex flex-col items-start gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-border bg-muted font-mono text-xs font-bold text-foreground">
                <Target className="w-3.5 h-3.5 text-primary" />
                <span>TEST SERIES & MOCK ARENA</span>
                <span className="text-muted-foreground/50">|</span>
                <span className="text-muted-foreground">IST {time}</span>
              </div>

              <div>
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
                  Test Series <span className="text-primary underline decoration-primary/40 decoration-wavy underline-offset-4">Vault.</span>
                </h1>
              </div>

              <p className="font-sans text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
                Curated coaching test series, chapterwise mocks, NTA-style 1v1 battle arena, and full syllabus papers across the JEE ecosystem — zero gaslighting, honest percentile curves.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <div className="flex items-center gap-2 px-3 py-1 rounded-md border border-border bg-background font-mono text-xs font-bold shadow-[2px_2px_0px_var(--desk-border)]">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span>{(testSeries || []).length} Providers</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-md border border-border bg-background font-mono text-xs font-bold shadow-[2px_2px_0px_var(--desk-border)]">
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                  <span>{totalResources} Verified Papers</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-border bg-background font-mono text-xs font-bold shadow-[2px_2px_0px_var(--desk-border)] text-muted-foreground">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  <span>100% NTA Marking Standard</span>
                </div>
              </div>
            </div>

            {/* Test Reality Widget */}
            <div className="lg:col-span-4 w-full">
              <div className="relative w-full bg-muted/60 text-foreground rounded-xl p-5 border-2 border-border shadow-[4px_4px_0px_var(--desk-border)]">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-extrabold uppercase tracking-wider text-foreground">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    <span>REALITY BENCHMARK</span>
                  </div>
                  <span className="px-2 py-0.5 rounded border border-border bg-card text-foreground font-mono text-[10px] font-bold">
                    JAN 2027
                  </span>
                </div>
                <div className="space-y-2.5 font-sans text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-muted-foreground">Avg Aspirant Score</span>
                    <span className="font-extrabold text-foreground px-2 py-0.5 rounded border border-border bg-card">
                      142 / 300
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-muted-foreground">Safe 99%ile Benchmark</span>
                    <span className="font-extrabold text-primary px-2 py-0.5 rounded border border-primary/30 bg-primary/10">
                      210+ Marks
                    </span>
                  </div>
                  <div className="w-full bg-border h-2 rounded-full overflow-hidden my-1">
                    <div className="bg-primary h-full rounded-full" style={{ width: "67%" }} />
                  </div>
                  <div className="pt-2 text-center italic font-display text-xs text-foreground/90">
                    “Mock se darr nahi lagta sahab, analysis se lagta hai.”
                  </div>
                  <div className="text-right font-mono text-[10px] text-muted-foreground font-semibold">
                    — Kota Hostel Bathroom Wisdom
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Search & Instant Filter Bar */}
        <section className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <Search className="w-4 h-4" />
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 bg-card text-foreground rounded-xl border-2 border-border font-sans text-sm shadow-[3px_3px_0px_var(--desk-border)] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="Search test series, institutes, MathonGo, Narayana..."
              type="text"
            />
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1">
              <kbd className="hidden sm:inline-block px-2 py-0.5 rounded border border-border bg-muted text-muted-foreground font-mono text-[10px]">
                CTRL + K
              </kbd>
            </div>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setFilterType("all")}
              className={cn(
                "px-3.5 py-2 rounded-xl border-2 border-border font-sans text-xs font-bold shadow-[2px_2px_0px_var(--desk-border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5 whitespace-nowrap",
                filterType === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground hover:bg-muted"
              )}
            >
              <span>All Tests</span>
              <span className="px-1.5 py-0.2 rounded border border-current font-mono text-[10px]">
                {(testSeries || []).length}
              </span>
            </button>
            <button
              onClick={() => setFilterType("full")}
              className={cn(
                "px-3.5 py-2 rounded-xl border-2 border-border font-sans text-xs font-bold shadow-[2px_2px_0px_var(--desk-border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5 whitespace-nowrap",
                filterType === "full"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground hover:bg-muted"
              )}
            >
              <Flame className="w-3.5 h-3.5 text-primary" />
              <span>Full Mocks</span>
            </button>
            <button
              onClick={() => {
                setFilterType("battle");
                const arena = document.getElementById("battle-arena");
                arena?.scrollIntoView({ behavior: "smooth" });
              }}
              className={cn(
                "px-3.5 py-2 rounded-xl border-2 border-border font-sans text-xs font-bold shadow-[2px_2px_0px_var(--desk-border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5 whitespace-nowrap",
                filterType === "battle"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground hover:bg-muted"
              )}
            >
              <Swords className="w-3.5 h-3.5 text-primary" />
              <span>1v1 Battle</span>
            </button>
          </div>
        </section>

        {/* Featured 1v1 Mock Battle Arena Card */}
        <section
          id="battle-arena"
          className="relative w-full rounded-2xl border-2 border-border bg-card p-6 md:p-8 shadow-[4px_4px_0px_var(--desk-border)] mb-8 overflow-hidden"
        >
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded border border-primary/30 bg-primary/10 text-primary font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>MULTIPLAYER ARENA • LIVE CONFLICT</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-border bg-muted text-foreground font-mono text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>348 aspirants queuing</span>
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-foreground tracking-tight flex items-center gap-2">
                <span>1v1 Mock Test Battle</span>
                <span className="px-2 py-0.5 text-[10px] rounded border border-border bg-muted font-mono uppercase font-bold">
                  Instant Match
                </span>
              </h2>
              <p className="font-sans text-sm text-muted-foreground max-w-2xl leading-relaxed">
                NTA-style real-time 1v1 mock test battles — challenge batchmates head-to-head in a 15-minute speed drill. Winner takes rank bragging rights and +50 Bookie Karma Points.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1 text-muted-foreground font-mono text-xs">
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-primary" /> 15 Mins / 12 MCQs
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-primary" /> +4 / -1 Marking
                </span>
              </div>
            </div>

            <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3">
              <div className="flex items-center gap-3 bg-muted/60 px-4 py-2.5 rounded-xl border-2 border-border shadow-[2px_2px_0px_var(--desk-border)]">
                <div className="flex items-center -space-x-2">
                  <div className="w-7 h-7 rounded-full border-2 border-border bg-primary text-primary-foreground font-mono font-bold text-xs flex items-center justify-center">
                    TK
                  </div>
                  <div className="w-7 h-7 rounded-full border-2 border-border bg-muted text-foreground font-mono font-bold text-xs flex items-center justify-center">
                    VS
                  </div>
                  <div className="w-7 h-7 rounded-full border-2 border-border bg-card text-foreground font-mono font-bold text-xs flex items-center justify-center">
                    AG
                  </div>
                </div>
                <div className="flex flex-col text-left font-mono text-[11px]">
                  <span className="font-bold text-foreground">Last Match Concluded</span>
                  <span className="text-primary font-bold">Tanmay (+36) beat Aniket (+28)</span>
                </div>
              </div>
              <button
                onClick={() =>
                  window.open(
                    "https://www.ovibattle.in/",
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
                className="px-5 py-3 rounded-xl border-2 border-border bg-primary text-primary-foreground font-sans text-sm font-bold shadow-[3px_3px_0px_var(--desk-border)] hover:bg-primary/90 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Swords className="w-4 h-4" />
                <span>Challenge an Aspirant Now →</span>
              </button>
            </div>
          </div>
        </section>

        {/* Section Title & Grid Counter */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <h3 className="font-display text-lg sm:text-xl font-bold text-foreground tracking-tight">
              Verified Test Portals & Series
            </h3>
            <span className="px-2 py-0.5 rounded border border-border bg-muted text-muted-foreground font-mono text-xs font-semibold">
              {(testSeries || []).length} Providers
            </span>
          </div>
        </div>

        {/* Test Series Provider Cards Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 px-6 bg-card rounded-2xl border-2 border-border shadow-[4px_4px_0px_var(--desk-border)]">
            <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-display text-base font-bold text-foreground mb-1">
              No test series found
            </h3>
            <p className="font-sans text-xs text-muted-foreground">
              Try searching by coaching name (e.g. Allen, MathonGo, Narayana).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {filtered.map((p) => (
              <ProviderCard
                key={p.id}
                provider={p}
                query={query}
                expanded={isSearching ? true : !!expanded[p.id]}
                onToggle={() =>
                  setExpanded((s) => ({ ...s, [p.id]: !s[p.id] }))
                }
              />
            ))}
          </div>
        )}

        {/* Real Exam Schedule & AYJR Countdown Mini Banner */}
        <section className="w-full bg-muted/50 rounded-2xl border-2 border-border p-5 md:p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[3px_3px_0px_var(--desk-border)]">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl border-2 border-border bg-card text-foreground flex items-center justify-center font-mono font-bold shadow-[2px_2px_0px_var(--desk-border)] shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-sm sm:text-base font-bold text-foreground">
                  Synchronized All-India Mock: AYJR Jan Shift 1
                </span>
                <span className="px-2 py-0.5 rounded border border-primary/30 bg-primary/10 text-primary font-mono text-[10px] font-bold uppercase">
                  Live in 3 Days
                </span>
              </div>
              <p className="font-sans text-xs text-muted-foreground">
                Morning 09:00 AM - 12:00 PM simulation. Registered aspirants: 68,400+.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => toast({ title: "AYJR Reminder Set", description: "You'll be notified 30 mins before shift 1 commences." })}
              className="px-4 py-2 rounded-xl border-2 border-border bg-primary text-primary-foreground font-sans text-xs font-bold shadow-[2px_2px_0px_var(--desk-border)] hover:bg-primary/90 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              Book Slot Reminder
            </button>
          </div>
        </section>

        {/* Relatable Bottom Punchline / Reality Callout */}
        <section className="relative w-full rounded-2xl border-2 border-border bg-card p-6 md:p-8 shadow-[4px_4px_0px_var(--desk-border)] mb-8 overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-border bg-muted font-mono text-xs font-bold text-foreground uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span>PLOT TWIST // REAL TALK</span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-black text-foreground tracking-tight">
                “Itna test series collect kar liya? Ab ek mock test de bhi do.”
              </h3>
              <p className="font-sans text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Drive folder mein 400 GB test papers hoard karne se AIR 1 nahi aati. Give one honest 45-minute timed mock right now without checking answers midway.
              </p>
            </div>
            <div className="w-full lg:w-auto flex flex-col items-stretch sm:items-end">
              <button
                onClick={() => {
                  const first = filtered[0];
                  if (first) navigate(`/test-series/${first.id}`);
                }}
                className="px-5 py-3.5 rounded-xl border-2 border-border bg-foreground text-background font-sans text-sm font-bold shadow-[3px_3px_0px_var(--desk-border)] hover:opacity-95 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Zap className="w-4 h-4 text-primary" />
                <span>Start Immediate 45-Min Mock →</span>
              </button>
              <span className="font-mono text-[10px] text-muted-foreground text-center sm:text-right mt-1.5">
                Rotational Motion + Thermodynamics MCQs
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}