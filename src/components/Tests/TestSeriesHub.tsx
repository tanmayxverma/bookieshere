import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search, ChevronDown, Library, Sparkles, ArrowUpRight, ArrowRight,
} from "lucide-react";
import { TEST_SERIES, type TestSeriesProvider, type TestSeriesResource } from "@/data/testSeries";
import { isSafeUrl } from "@/lib/urlValidation";
import { toast } from "@/hooks/use-toast";

function ProviderCard({
  provider, expanded, onToggle,
}: { provider: TestSeriesProvider; expanded: boolean; onToggle: () => void; query: string }) {
  const navigate = useNavigate();
  const open = (r: TestSeriesResource) => {
    if (!isSafeUrl(r.url)) {
      toast({ title: "Link blocked", description: "This URL isn't on the allowed list.", variant: "destructive" });
      return;
    }
    window.open(r.url, "_blank", "noopener,noreferrer");
  };

  const initial = provider.name.charAt(0);

  return (
    <Card className="overflow-hidden border-border/60 transition-all duration-300 hover:border-primary/40 hover:shadow-[0_20px_60px_-30px_hsl(var(--primary)/0.45)]">
      <div className={`relative bg-gradient-to-br ${provider.accent}`}>
        <button
          onClick={onToggle}
          className="relative w-full flex items-center gap-4 p-4 md:p-5 text-left group"
          aria-expanded={expanded}
        >
          {/* Logo */}
          <div className="relative shrink-0 h-14 w-14 rounded-2xl overflow-hidden bg-background/80 backdrop-blur ring-1 ring-border/60 flex items-center justify-center shadow-[inset_0_1px_0_hsl(var(--background)/0.5)]">
            {provider.logo ? (
              <img
                src={provider.logo}
                alt={provider.name}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-display text-2xl font-black text-foreground/80">{initial}</span>
            )}
          </div>

          {/* Meta */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-display text-base md:text-lg font-bold tracking-tight truncate">
                {provider.name}
              </h3>
              <Badge variant="secondary" className="text-[10px] shrink-0">
                {provider.resources.length} {provider.resources.length === 1 ? "resource" : "resources"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">{provider.description}</p>
          </div>

          <ChevronDown
            className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${expanded ? "rotate-180 text-foreground" : ""}`}
          />
        </button>
      </div>

      {/* Expanded resources */}
      <div
        className={`grid transition-all duration-300 ease-out ${
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border/50 bg-background/40 p-3 md:p-4 grid gap-2 sm:grid-cols-2">
            {provider.resources.map((r) => (
              <button
                key={r.name + r.url}
                onClick={() => open(r)}
                className="group flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-card/60 hover:bg-card hover:border-primary/40 px-3.5 py-2.5 text-left transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-foreground truncate">{r.name}</span>
                    {r.badge && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-[9px] font-bold uppercase tracking-wider text-primary">
                        <Sparkles className="h-2 w-2" /> {r.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate block">
                    {(() => { try { return new URL(r.url).hostname.replace(/^www\./, ""); } catch { return ""; } })()}
                  </span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            ))}
          </div>
          <div className="border-t border-border/40 bg-background/40 px-3 pb-3 md:px-4 md:pb-4">
            <Button
              variant="secondary"
              size="sm"
              className="w-full group"
              onClick={() => navigate(`/test-series/${provider.id}`)}
            >
              View full page
              <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function TestSeriesHub() {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TEST_SERIES;
    return TEST_SERIES
      .map((p) => {
        const nameMatch =
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q);
        const matchedResources = p.resources.filter((r) => r.name.toLowerCase().includes(q));
        if (nameMatch) return p;
        if (matchedResources.length > 0) return { ...p, resources: matchedResources };
        return null;
      })
      .filter(Boolean) as TestSeriesProvider[];
  }, [query]);

  // Auto-expand cards when searching so matches are visible.
  const isSearching = query.trim().length > 0;

  const totalResources = TEST_SERIES.reduce((sum, p) => sum + p.resources.length, 0);

  return (
    <section className="container mx-auto px-4 pb-20 pt-4">
      {/* Header */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card/60 via-card/30 to-surface-2/30 backdrop-blur-xl p-7 md:p-9">
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-20 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-jee/10 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-surface-2/60 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
              <Library className="h-3 w-3 text-primary" /> Resource Hub
            </span>
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-black tracking-tight text-foreground">
              Test Series Hub
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground leading-relaxed">
              Access curated coaching test series, PYQs, mock tests, full syllabus examinations
              and practice resources from across the JEE ecosystem.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="secondary">{TEST_SERIES.length} providers</Badge>
            <Badge variant="secondary">{totalResources} resources</Badge>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search test series, institutes, AYJR, Allen, FIITJEE..."
            className="pl-11 h-12 rounded-xl bg-background/70 backdrop-blur border-border/60 text-sm"
          />
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] text-muted-foreground/80 mb-5 text-center px-2">
        Bookie does not own or host any content. All resources belong to their respective owners.
      </p>

      {/* Cards */}
      {filtered.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          No test series match <span className="text-foreground font-semibold">"{query}"</span>.
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
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
    </section>
  );
}