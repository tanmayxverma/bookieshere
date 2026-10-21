import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Sparkles, Target, Settings, ChevronDown, CheckCircle, ExternalLink, Activity, Plus } from "lucide-react";
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
}: { provider: TestSeriesProvider; expanded: boolean; onToggle: () => void; query: string }) {
  const navigate = useNavigate();
  const open = (r: TestSeriesResource, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSafeUrl(r.url)) {
      toast({ title: "Link blocked", description: "This URL isn't on the allowed list.", variant: "destructive" });
      return;
    }
    window.open(r.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="test-card group relative flex flex-col bg-surface-container-lowest rounded-2xl shadow-[0_4px_16px_-2px_rgba(19,27,46,0.06)] hover:shadow-[0_8px_24px_-4px_rgba(19,27,46,0.12)] transition-all duration-200 brutal-border overflow-hidden">
      <div 
        className="p-space-md space-y-space-sm cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <InstituteLogo
              id={provider.id}
              name={provider.name}
              logo={provider.logo}
              accent={provider.accent}
              className="w-12 h-12 text-base rounded-xl border-2 border-slate-900 shadow-sm"
            />
            <div>
              <span className="font-headline-md text-[16px] font-bold text-on-surface leading-tight block truncate max-w-[200px] sm:max-w-[250px]">
                {provider.name}
              </span>
              <span className="font-label-code-sm text-label-code-sm text-on-surface-variant font-medium">
                {provider.resources.length} {provider.resources.length === 1 ? "Resource" : "Resources"}
              </span>
            </div>
          </div>
          <ChevronDown className={cn("text-on-surface-variant transition-transform duration-300", expanded ? "rotate-180" : "")} size={20} />
        </div>

        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed line-clamp-2 mt-2">
          {provider.description}
        </p>

        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="px-2 py-0.5 rounded bg-surface-container font-label-code-sm text-label-code-sm text-on-surface font-bold">Mains + Adv</span>
          <span className="px-2 py-0.5 rounded bg-tertiary/10 font-label-code-sm text-label-code-sm text-tertiary font-bold">Verified</span>
        </div>
      </div>
      
      {/* Expanded resources inline */}
      <div className={cn("grid transition-all duration-300 ease-out border-t border-outline-variant/30", expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden">
          <div className="bg-surface-container-low/50 p-space-xs grid gap-1">
            {provider.resources.map((r, i) => (
              <button
                key={i}
                onClick={(e) => open(r, e)}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-lowest hover:shadow-sm transition-colors text-left group/res"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-label-ui text-label-ui text-on-surface font-bold truncate">
                    {r.name}
                  </div>
                  <div className="font-label-code-sm text-[10px] text-on-surface-variant truncate">
                    {(() => { try { return new URL(r.url).hostname.replace(/^www\./, ""); } catch { return "External Link"; } })()}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-on-surface-variant group-hover/res:text-primary transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-space-md py-space-sm border-t border-outline-variant/30 flex items-center justify-between bg-surface-container-low/30">
        <div className="flex items-center gap-1 font-label-code-sm text-[11px] text-on-surface-variant">
          <CheckCircle className="w-[15px] h-[15px] text-tertiary" />
          <span>Active</span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); navigate(`/test-series/${provider.id}`); }}
          className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-headline-md text-label-ui shadow-[0_3px_0_0_#131b2e] hover:bg-primary-container active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1"
        >
          <span>Enter Portal</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}

export function TestSeriesHub() {
  const { testSeries } = useTestSeries();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Kolkata' }));
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
          (p.name || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.id || '').toLowerCase().includes(q);
        const matchedResources = (p.resources || []).filter((r) => (r.name || '').toLowerCase().includes(q));
        if (nameMatch) return p;
        if (matchedResources.length > 0) return { ...p, resources: matchedResources };
        return null;
      })
      .filter(Boolean) as TestSeriesProvider[];
  }, [testSeries, query]);

  const isSearching = query.trim().length > 0;
  const totalResources = (testSeries || []).reduce((sum, p) => sum + (p.resources?.length || 0), 0);

  return (
    <div className="w-full pt-16 flex-1 max-w-7xl mx-auto px-margin lg:px-margin-desktop bg-background blueprint-grid text-on-surface">
      <div className="flex flex-col w-full pb-space-xl">
        
        {/* Hero Header Section */}
        <section className="relative w-full rounded-2xl bg-surface-container-lowest p-space-md lg:p-space-lg shadow-[0_4px_20px_-2px_rgba(19,27,46,0.06)] mt-space-md mb-space-lg overflow-hidden brutal-border">
          <div className="absolute -right-8 -bottom-10 pointer-events-none select-none text-surface-container-highest/60 font-headline-xl text-[120px] font-black opacity-30 leading-none">
            TESTS
          </div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
            <div className="lg:col-span-8 flex flex-col items-start gap-space-sm">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-brand-blue dark:text-blue-400 font-mono text-xs tracking-wider uppercase font-bold border border-blue-200 dark:border-blue-800">
                <Target className="w-[15px] h-[15px] text-brand-blue" />
                <span>TEST SERIES & MOCK ARENA</span>
              </div>
              <div className="relative mt-1">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-ruling font-black tracking-tight text-slate-950 dark:text-white leading-[1.08]">
                  Test Series <span className="text-brand-blue inline-block">Hub.</span>
                </h1>
              </div>
              <p className="font-editorial italic text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed pt-1">
                Access curated coaching test series, chapterwise mocks, NTA-style 1v1 battle arena, and full syllabus papers from across the entire JEE ecosystem — zero gaslighting, honest percentile curves.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300 font-bold shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  <span>{(testSeries || []).length} Providers</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 font-mono text-xs text-brand-blue dark:text-blue-400 font-bold shadow-xs border border-blue-100 dark:border-blue-800">
                  <span className="material-symbols-outlined text-[15px]">inventory_2</span>
                  <span>{totalResources} Live Resources</span>
                </div>
                <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 font-mono text-xs text-emerald-800 dark:text-emerald-300 font-bold shadow-xs border border-emerald-200 dark:border-emerald-800">
                  <span className="material-symbols-outlined text-[14px] text-emerald-600">verified</span>
                  <span>100% NTA Scoring Engine</span>
                </div>
              </div>
            </div>

            {/* Test Reality Widget */}
            <div className="lg:col-span-4 w-full">
              <div className="relative w-full bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100 rounded-2xl p-space-md shadow-sm border-2 border-slate-900 dark:border-amber-700/60">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-black uppercase tracking-wider text-amber-950 dark:text-amber-200">
                    <span className="material-symbols-outlined text-[16px] text-amber-700">psychology_alt</span>
                    <span>TEST REALITY CHECK</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-mono text-[10px] font-bold">JAN 2027 TARGET</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-900/80 dark:text-amber-300">Average Aspirant Score</span>
                    <span className="font-mono font-bold text-amber-950 dark:text-amber-100 bg-amber-200/70 dark:bg-amber-900/60 px-2.5 py-0.5 rounded">142 / 300</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950 dark:text-amber-200">Safe 99%ile Benchmark</span>
                    <span className="font-mono font-black text-white bg-brand-blue px-2.5 py-0.5 rounded shadow-xs">210+ Marks</span>
                  </div>
                  <div className="w-full bg-amber-200/60 dark:bg-amber-900/40 h-2.5 rounded-full overflow-hidden my-1 p-0.5">
                    <div className="bg-brand-blue h-full rounded-full" style={{ width: '67%' }}></div>
                  </div>
                  <div className="pt-2 text-center font-serif italic text-sm leading-snug text-slate-800 dark:text-amber-100">
                    “Mock se darr nahi lagta sahab, analysis se lagta hai.”
                  </div>
                  <div className="text-right font-mono text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400">
                    — Kota Hostel Bathroom Wisdom
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Search & Instant Filter Bar */}
        <section className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md mb-space-lg">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
              <Search className="w-5 h-5 text-on-surface-variant" />
            </div>
            <input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-24 py-3 bg-surface-container-lowest text-on-surface rounded-xl font-body-md text-body-md shadow-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all brutal-border" 
              placeholder="Search test series, institutes, MathonGo, Narayana..." 
              type="text" 
            />
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1">
              <kbd className="hidden sm:inline-block px-2 py-1 rounded bg-surface-container text-on-surface-variant font-label-code-sm text-[10px]">CTRL + K</kbd>
            </div>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button className="px-3.5 py-2 rounded-xl bg-primary text-on-primary font-label-ui text-label-ui shadow-[0_3px_0_0_#131b2e] active:translate-y-0.5 active:shadow-none transition-all duration-100 flex items-center gap-1 whitespace-nowrap">
              <span>All Tests</span>
              <span className="px-1.5 py-0.2 rounded-full bg-surface-container-lowest/20 font-label-code-sm text-[10px]">{(testSeries || []).length}</span>
            </button>
            <button className="px-3.5 py-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-ui text-label-ui shadow-sm active:translate-y-0.5 transition-all duration-100 flex items-center gap-1 whitespace-nowrap brutal-border">
              <span className="text-error">🔥</span>
              <span>Full Mocks</span>
            </button>
            <button className="px-3.5 py-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-ui text-label-ui shadow-sm active:translate-y-0.5 transition-all duration-100 flex items-center gap-1 whitespace-nowrap brutal-border">
              <span>⚔️</span>
              <span>1v1 Battle</span>
            </button>
          </div>
        </section>

        {/* Featured 1v1 Mock Battle Arena Card */}
        <section className="relative w-full rounded-2xl bg-gradient-to-r from-primary-fixed to-primary-container/20 dark:from-slate-900 dark:via-blue-950/40 dark:to-slate-900 p-space-md lg:p-space-lg shadow-sm mb-space-xl overflow-hidden brutal-border border-primary-fixed dark:border-slate-800">
          <div className="absolute -right-6 -top-6 w-48 h-48 rounded-full bg-primary/20 blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-lg">
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-primary text-on-primary font-label-code-sm text-label-code-sm uppercase font-bold tracking-wider flex items-center gap-1">
                  <Activity className="w-[13px] h-[13px]" />
                  <span>MULTIPLAYER ARENA • LIVE CONFLICT</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-container/30 text-tertiary font-label-code-sm text-label-code-sm font-bold">
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                  <span>348 aspirants queuing</span>
                </span>
              </div>
              <h2 className="font-headline-lg text-headline-lg font-black text-on-surface tracking-tight flex items-center gap-2">
                <span>1v1 Mock Test Battle</span>
                <span className="px-2 py-0.5 text-[11px] rounded bg-secondary-container text-on-secondary-container font-label-code-sm uppercase font-extrabold">Instant Match</span>
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                NTA-style real-time 1v1 mock test battles — challenge batchmates head-to-head in a 15-minute speed drill. Winner takes rank bragging rights and +50 Bookie Karma Points.
              </p>
              <div className="flex flex-wrap items-center gap-space-md pt-2 text-on-surface-variant font-label-code-sm text-label-code-sm">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-primary text-[16px]">timer</span> 15 Mins / 12 MCQs</span>
                <span>•</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-error text-[16px]">balance</span> +4 / -1 Marking</span>
              </div>
            </div>
            
            <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-space-md">
              <div className="flex items-center gap-3 bg-surface-container-lowest/90 px-4 py-2.5 rounded-xl shadow-sm brutal-border border-surface-container-lowest">
                <div className="flex items-center -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center ring-2 ring-surface-container-lowest">TK</div>
                  <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container font-bold text-xs flex items-center justify-center ring-2 ring-surface-container-lowest">VS</div>
                  <div className="w-8 h-8 rounded-full bg-tertiary text-on-tertiary font-bold text-xs flex items-center justify-center ring-2 ring-surface-container-lowest">AG</div>
                </div>
                <div className="flex flex-col text-left font-label-code-sm text-[11px]">
                  <span className="font-bold text-on-surface">Last Match Just Concluded</span>
                  <span className="text-tertiary font-bold">Tanmay (+36) beat Aniket (+28)</span>
                </div>
              </div>
              <button onClick={() => window.open("https://www.ovibattle.in/", "_blank", "noopener,noreferrer")} className="px-space-lg py-3.5 rounded-xl bg-primary text-on-primary font-headline-md text-body-md font-bold shadow-[0_4px_0_0_#131b2e] hover:bg-primary-container active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                <span className="material-symbols-outlined text-[20px]">sports_martial_arts</span>
                <span>Challenge an Aspirant Now →</span>
              </button>
            </div>
          </div>
        </section>

        {/* Section Title & Grid Counter */}
        <div className="flex items-center justify-between mb-space-md">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">Verified Test Portals & Series</h3>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-code-sm text-label-code-sm font-semibold">{(testSeries || []).length} Master Providers</span>
          </div>
        </div>

        {/* Test Series Provider Cards Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 px-6 bg-surface-container-lowest rounded-2xl brutal-border">
            <Search className="w-12 h-12 text-outline-variant mx-auto mb-4" />
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">No test series found</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Try a different search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md mb-space-xl">
            {filtered.map((p) => (
              <ProviderCard
                key={p.id}
                provider={p}
                query={query}
                expanded={isSearching ? true : !!expanded[p.id]}
                onToggle={() => setExpanded((s) => ({ ...s, [p.id]: !s[p.id] }))}
              />
            ))}
          </div>
        )}

        {/* Real Exam Schedule & AYJR Countdown Mini Banner */}
        <section className="w-full bg-surface-container-high rounded-2xl p-space-md lg:p-space-lg mb-space-xl flex flex-col md:flex-row items-center justify-between gap-space-md brutal-border">
          <div className="flex items-center gap-space-md">
            <div className="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center font-headline-md text-headline-md shadow-[0_3px_0_0_#5c4300] brutal-border border-secondary-container">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline-md text-body-lg font-bold text-on-surface">Next Synchronized All-India Mock: AYJR Jan Shift 1</span>
                <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-label-code-sm text-[10px] font-extrabold uppercase">Live in 3 Days</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Simulating shift timings: Morning 09:00 AM - 12:00 PM. Registered aspirants: 68,400+.</p>
            </div>
          </div>
          <div className="flex items-center gap-space-sm w-full md:w-auto justify-end">
            <button className="px-space-md py-2 rounded-xl bg-primary text-on-primary font-headline-md text-label-ui shadow-[0_3px_0_0_#131b2e] hover:bg-primary-container active:translate-y-0.5 active:shadow-none transition-all">
              Book Free Slot
            </button>
          </div>
        </section>

        {/* Relatable Bottom Punchline / Reality Callout */}
        <section className="relative w-full rounded-2xl bg-secondary-fixed dark:bg-amber-950/40 text-on-secondary-fixed-variant dark:text-amber-100 p-space-lg lg:p-space-xl shadow-[0_8px_24px_-4px_rgba(69,26,3,0.08)] mb-space-xl overflow-hidden brutal-border border-secondary-fixed dark:border-amber-700/60">
          <div className="absolute -top-3 left-8 w-28 h-6 bg-secondary-container transform -rotate-2 rounded shadow-sm opacity-80 sticker-tape"></div>
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-lg">
            <div className="space-y-space-xs max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-code-sm text-label-code-sm font-extrabold tracking-wider uppercase">
                <span className="material-symbols-outlined text-[15px]">psychology</span>
                <span>PLOT TWIST // REAL TALK</span>
              </div>
              <h3 className="font-headline-lg text-headline-lg font-black text-on-secondary-fixed-variant dark:text-amber-100 tracking-tight pt-1">
                “Itna test series collect kar liya? Ab ek mock test de bhi do.”
              </h3>
              <p className="font-body-lg text-body-lg text-secondary dark:text-amber-200/90 leading-relaxed">
                Drive folder mein 400 GB test papers hoard karne se AIR 1 nahi aati. Give one honest 45-minute timed mock right now without checking answers midway.
              </p>
            </div>
            <div className="w-full lg:w-auto flex flex-col items-stretch sm:items-end">
              <button className="px-space-lg py-4 rounded-xl bg-inverse-surface dark:bg-slate-800 text-inverse-on-surface dark:text-white font-headline-md text-body-md font-extrabold shadow-[0_4px_0_0_#000000] hover:opacity-90 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                <span className="material-symbols-outlined text-secondary-container text-[20px]">bolt</span>
                <span>Start Immediate 45-Min Physics Mock →</span>
              </button>
              <span className="font-label-code-sm text-[11px] text-secondary dark:text-amber-300 text-center sm:text-right mt-1.5 font-bold">
                Includes Rotational Motion + Thermodynamics MCQs
              </span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}