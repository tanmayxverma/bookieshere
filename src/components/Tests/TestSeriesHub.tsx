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
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
            <div className="lg:col-span-12 flex flex-col items-start gap-space-sm">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/50 text-primary font-label-code-sm text-label-code-sm tracking-wider uppercase font-bold">
                <Target className="w-[15px] h-[15px] text-primary" />
                <span>TEST SERIES & MOCKS</span>
              </div>
              <div className="relative mt-1">
                <h1 className="font-headline-xl text-headline-xl lg:text-[44px] lg:leading-[50px] tracking-tight font-extrabold text-on-surface">
                  Test Series <span className="text-primary">Hub.</span>
                </h1>
              </div>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl pt-1">
                Access curated coaching test series, chapter-wise mocks and full syllabus papers from across the entire JEE ecosystem, with honest percentile curves.
              </p>
              <div className="flex flex-wrap items-center gap-space-sm pt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container font-label-code-sm text-label-code-sm text-on-surface font-bold shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                  <span>{(testSeries || []).length} Providers</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container font-label-code-sm text-label-code-sm text-on-surface font-bold shadow-sm">
                  <span className="material-symbols-outlined text-primary text-[15px]">inventory_2</span>
                  <span>{totalResources} Live Resources</span>
                </div>
                <div className="hidden sm:inline-flex items-center gap-1 text-on-surface-variant font-label-code-sm text-label-code-sm">
                  <span className="material-symbols-outlined text-[14px] text-tertiary">verified</span>
                  <span>100% NTA Scoring Engine</span>
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



      </div>
    </div>
  );
}