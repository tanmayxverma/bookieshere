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
    <article className="group relative flex flex-col rounded-xl border border-border/80 bg-card shadow-xs hover:border-primary/40 hover:shadow-sm transition-all duration-200 overflow-hidden">
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
              className="w-11 h-11 text-sm rounded-lg border border-border/70 shrink-0"
            />
            <div>
              <span className="font-serif text-base font-semibold text-foreground leading-tight block truncate max-w-[190px] sm:max-w-[240px]">
                {provider.name}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {provider.resources.length} {provider.resources.length === 1 ? "Paper" : "Papers"}
              </span>
            </div>
          </div>
          <button
            type="button"
            aria-label="Toggle resources list"
            className="p-1 rounded-md border border-border/60 hover:bg-muted/50 text-muted-foreground transition-colors"
          >
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                expanded ? "rotate-180" : ""
              )}
            />
          </button>
        </div>

        <p className="font-mono text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {provider.description}
        </p>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="px-2 py-0.5 rounded-md border border-border/60 bg-muted/40 font-mono text-[10px] font-semibold text-muted-foreground">
            MAINS + ADV
          </span>
          <span className="px-2 py-0.5 rounded-md border border-primary/20 bg-primary/10 font-mono text-[10px] font-semibold text-primary">
            VERIFIED
          </span>
        </div>
      </div>

      {/* Expanded resources inline */}
      <div
        className={cn(
          "grid transition-all duration-200 ease-out border-t border-border/60",
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="bg-muted/30 p-2.5 grid gap-1.5">
            {provider.resources.map((r, i) => (
              <button
                key={i}
                onClick={(e) => open(r, e)}
                className="flex items-center justify-between p-2 rounded-lg border border-border/50 bg-card hover:bg-muted/50 hover:border-primary/40 shadow-xs transition-colors text-left group/res cursor-pointer"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-mono text-xs text-foreground font-medium truncate">
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

      <div className="px-5 py-3 border-t border-border/60 flex items-center justify-between bg-muted/20 mt-auto">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
          <CheckCircle className="w-3.5 h-3.5 text-primary" />
          <span>Active Feed</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/test-series/${provider.id}`);
          }}
          className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs font-semibold shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>Enter Portal</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </article>
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
    <div className="w-full pt-6 flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-foreground pb-20 space-y-7">
      <div className="flex flex-col w-full space-y-7">
        {/* Hero Header Section */}
        <section className="relative w-full rounded-2xl border border-border/80 bg-card p-6 md:p-8 shadow-xs mt-2 overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 flex flex-col items-start gap-4">
              <div className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-primary">
                <span>§ 04 // Dossier</span>
                <span className="text-border">|</span>
                <span className="text-muted-foreground">Test Series & Mock Arena</span>
              </div>

              <div>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-medium tracking-tight text-foreground leading-[1.15]">
                  Test Series <em className="italic text-primary font-serif font-normal">Arena.</em>
                </h1>
              </div>

              <p className="font-mono text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
                Access curated coaching test series, chapterwise drills, NTA-style 1v1 battle arena, and full syllabus papers from across the premier JEE ecosystem — deconstructed mocks with honest percentile curves.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
                <span className="inline-flex items-center gap-1.5 bg-muted/40 border border-border/60 text-foreground px-2.5 py-1 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{(testSeries || []).length} Master Providers</span>
                </span>
                <span className="inline-flex items-center gap-1.5 bg-muted/40 border border-border/60 text-foreground px-2.5 py-1 rounded-md">
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                  <span>{totalResources} Live Resources</span>
                </span>
                <span className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-md font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% NTA Scoring Engine</span>
                </span>
              </div>
            </div>

            {/* Test Reality Widget */}
            <div className="lg:col-span-5 w-full">
              <div className="relative w-full bg-[#faf7f3] dark:bg-muted/30 text-foreground rounded-xl p-5 border border-border/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border/60">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-foreground">
                      <span className="text-primary">◈</span>
                      <span>Test Reality Check</span>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground bg-card border border-border/60 px-1.5 py-0.5 rounded-md">
                      JAN 2027 TARGET
                    </span>
                  </div>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground text-[11px]">Average Aspirant Score</span>
                      <span className="font-semibold text-foreground font-mono">142 / 300</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground text-[11px]">Safe 99%ile Benchmark</span>
                      <span className="font-bold text-primary font-mono">210+ Marks</span>
                    </div>
                  </div>
                  <div className="mt-3.5 pt-1">
                    <div className="flex justify-between text-[10px] font-mono text-muted-foreground mb-1">
                      <span>CALIBRATION</span>
                      <span>70% TARGET MARGIN</span>
                    </div>
                    <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden border border-border/40">
                      <div className="bg-primary h-full rounded-full w-[70%]" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 text-[11px] font-serif italic text-muted-foreground">
                  “Mock se darr nahi lagta sahab, analysis se lagta hai.”
                  <div className="font-mono not-italic text-[10px] text-muted-foreground/80 mt-0.5 text-right">
                    — Kota Hostel Bathroom Wisdom
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Search & Instant Filter Bar */}
        <section className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <Search className="w-4 h-4" />
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 bg-card text-foreground rounded-xl border border-border/80 font-mono text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs transition-all"
              placeholder="Search test series, institutes, MathOnGo, Narayana, Allen, PW, FIITJEE..."
              type="text"
            />
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1">
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded border border-border/60 bg-muted/50 text-muted-foreground font-mono text-[10px]">
                CTRL + K
              </kbd>
            </div>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setFilterType("all")}
              className={cn(
                "px-3.5 py-2 rounded-lg font-mono text-xs font-medium border transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer",
                filterType === "all"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-card text-foreground hover:bg-muted/50 border-border/70"
              )}
            >
              <span>All Tests</span>
              <span className="px-1 py-0.2 rounded bg-white/20 text-[10px] font-bold">
                {(testSeries || []).length}
              </span>
            </button>
            <button
              onClick={() => setFilterType("full")}
              className={cn(
                "px-3.5 py-2 rounded-lg font-mono text-xs font-medium border transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer",
                filterType === "full"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-card text-foreground hover:bg-muted/50 border-border/70"
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
                "px-3.5 py-2 rounded-lg font-mono text-xs font-medium border transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer",
                filterType === "battle"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-card text-foreground hover:bg-muted/50 border-border/70"
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
          className="relative w-full rounded-2xl border border-border/80 bg-card p-6 md:p-8 shadow-xs overflow-hidden"
        >
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-primary text-primary-foreground font-mono text-[10px] font-semibold uppercase tracking-wider">
                  1v1 Multiplayer Arena
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-border/60 bg-muted/40 text-foreground font-mono text-[11px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>348 aspirants queuing</span>
                </span>
                <span className="text-muted-foreground font-mono text-[11px]">Instant Match Ready</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-foreground tracking-tight">
                Head-to-Head Mock Conflict
              </h2>
              <p className="font-mono text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                NTA-style real-time 1v1 speed drills — challenge batchmates head-to-head in a calibrated 15-minute combat. Winner takes verified percentile gains and <strong className="text-foreground font-semibold">+50 Bookie Karma Points</strong>.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
                <span className="bg-muted/40 border border-border/60 text-muted-foreground px-2 py-0.5 rounded-md">
                  ⏱ 15 Mins / 12 MCQs
                </span>
                <span className="bg-muted/40 border border-border/60 text-muted-foreground px-2 py-0.5 rounded-md">
                  ⚖ +4 / -1 Marking
                </span>
                <span className="bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-md font-semibold">
                  🎯 Rotational Motion & Calculus
                </span>
              </div>
            </div>

            <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
              <div className="flex items-center gap-3 bg-muted/40 px-4 py-2.5 rounded-xl border border-border/60 shadow-xs">
                <div className="flex items-center -space-x-1.5 font-mono text-[10px] font-bold">
                  <div className="h-6 w-6 rounded-full border border-background bg-foreground text-background flex items-center justify-center">
                    TK
                  </div>
                  <div className="h-6 w-6 rounded-full border border-background bg-primary text-primary-foreground flex items-center justify-center">
                    VS
                  </div>
                  <div className="h-6 w-6 rounded-full border border-background bg-muted text-foreground flex items-center justify-center">
                    AG
                  </div>
                </div>
                <div className="flex flex-col text-left font-mono text-[11px]">
                  <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Concluded Just Now</span>
                  <span className="text-foreground font-medium"><strong className="text-primary font-semibold">Tanmay (+36)</strong> beat Aniket (+28)</span>
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
                className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs font-semibold shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <Swords className="w-4 h-4" />
                <span>Enter 1v1 Arena →</span>
              </button>
            </div>
          </div>
        </section>

        {/* Section Title & Grid Counter */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <h3 className="font-serif text-lg font-medium text-foreground tracking-tight">
              Verified Test Portals & Series
            </h3>
            <span className="px-2 py-0.5 rounded-md border border-border/60 bg-muted/40 text-muted-foreground font-mono text-xs font-medium">
              {(testSeries || []).length} Master Providers
            </span>
          </div>
        </div>

        {/* Test Series Provider Cards Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 px-6 bg-card rounded-2xl border border-border/80 shadow-xs">
            <Search className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="font-serif text-base font-medium text-foreground mb-1">
              No test series found
            </h3>
            <p className="font-mono text-xs text-muted-foreground">
              Try searching by coaching name (e.g. Allen, MathOnGo, Narayana, PW).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {filtered.map((p) => (
              <ProviderCard
                key={p.id}
                provider={p}
                expanded={!!expanded[p.id]}
                onToggle={() =>
                  setExpanded((prev) => ({ ...prev, [p.id]: !prev[p.id] }))
                }
                query={query}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}