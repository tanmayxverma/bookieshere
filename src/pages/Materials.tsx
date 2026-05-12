import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Filter, X, BookOpen, Sparkles, Atom, FlaskConical, Sigma, Library, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Layout } from "@/components/Layout";
import { MaterialCard } from "@/components/MaterialCard";
import { MaterialFilters } from "@/components/MaterialFilters";
import { useMaterials } from "@/hooks/useMaterials";
import { SubjectType, ResourceType } from "@/types/materials";
import { Skeleton } from "@/components/ui/skeleton";

const Materials = () => {
  const { data: materials, isLoading } = useMaterials();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectType[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<ResourceType[]>([]);

  // Handle URL params for subject filter
  useEffect(() => {
    const subjectParam = searchParams.get('subject');
    if (subjectParam && ['physics', 'chemistry', 'mathematics', 'combined'].includes(subjectParam)) {
      setSelectedSubjects([subjectParam as SubjectType]);
    }
  }, [searchParams]);

  const filteredMaterials = useMemo(() => {
    if (!materials) return [];

    return materials.filter((material) => {
      const matchesSearch = search === "" || 
        material.name.toLowerCase().includes(search.toLowerCase()) ||
        (material.description?.toLowerCase().includes(search.toLowerCase()) ?? false);

      const matchesSubject = selectedSubjects.length === 0 || selectedSubjects.includes(material.subject);
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(material.resource_type);

      return matchesSearch && matchesSubject && matchesType;
    });
  }, [materials, search, selectedSubjects, selectedTypes]);

  const hasActiveFilters = selectedSubjects.length > 0 || selectedTypes.length > 0;

  const clearFilters = () => {
    setSelectedSubjects([]);
    setSelectedTypes([]);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Subject quick-stats for editorial hero
  const subjectStats = useMemo(() => {
    const list = materials ?? [];
    return {
      total: list.length,
      physics: list.filter((m) => m.subject === "physics").length,
      chemistry: list.filter((m) => m.subject === "chemistry").length,
      mathematics: list.filter((m) => m.subject === "mathematics").length,
    };
  }, [materials]);

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Editorial Glass Premium Hero */}
        <section className="relative overflow-hidden border-b border-border/40">
          {/* Ambient glows */}
          <div aria-hidden className="pointer-events-none absolute -top-32 -left-20 h-[480px] w-[480px] rounded-full bg-primary/10 blur-[120px]" />
          <div aria-hidden className="pointer-events-none absolute -bottom-40 right-0 h-[420px] w-[420px] rounded-full bg-jee/10 blur-[120px]" />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,hsl(var(--primary)/0.08),transparent_60%)]" />

          <div className="container mx-auto px-4 py-16 md:py-24 relative">
            <div className="grid lg:grid-cols-12 gap-12 items-end">
              {/* Left: Editorial heading */}
              <div className="lg:col-span-8 space-y-7 opacity-0 animate-fade-in">
                <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface-2/60 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground backdrop-blur">
                  <Library className="h-3 w-3 text-primary" />
                  Study Resources · Curated for JEE
                </span>

                <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black text-foreground leading-[0.92] tracking-tight">
                  Materials
                  <br />
                  <span className="italic font-medium text-muted-foreground">Library<span className="text-primary not-italic">.</span></span>
                </h1>

                <p className="max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed">
                  Modules, books, PYQs, test series and reference works — every resource hand-picked, organised, and ready for serious preparation.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <span className="inline-flex items-center gap-2 text-xs text-muted-foreground/80">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary/80" />
                    External resources · BOOKIE does not host any files
                  </span>
                </div>
              </div>

              {/* Right: Glass stat panel */}
              <div className="lg:col-span-4 opacity-0 animate-fade-in stagger-2">
                <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/40 backdrop-blur-xl p-6 shadow-[0_30px_60px_-30px_hsl(var(--primary)/0.3)]">
                  <div aria-hidden className="absolute -top-16 -right-10 h-44 w-44 rounded-full bg-primary/20 blur-3xl" />
                  <div className="relative space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Library Snapshot</div>
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <div className="font-display text-6xl font-black text-foreground leading-none tracking-tight">
                        {isLoading ? "—" : subjectStats.total}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground uppercase tracking-[0.2em]">Total Resources</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/40">
                      <StatPill icon={<Atom className="h-3.5 w-3.5" />} label="Physics" value={subjectStats.physics} loading={isLoading} />
                      <StatPill icon={<FlaskConical className="h-3.5 w-3.5" />} label="Chem" value={subjectStats.chemistry} loading={isLoading} />
                      <StatPill icon={<Sigma className="h-3.5 w-3.5" />} label="Math" value={subjectStats.mathematics} loading={isLoading} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content - Surface Level 1 */}
        <div className="py-12 bg-surface-1 relative">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,hsl(var(--jee)/0.05),transparent_60%)]" />
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Desktop Filters Sidebar */}
              <aside className="hidden lg:block w-72 flex-shrink-0 opacity-0 animate-fade-in stagger-1 relative z-10">
                <div className="sticky top-24 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-6 shadow-[0_20px_50px_-30px_hsl(var(--primary)/0.25)]">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-1">Refine</div>
                      <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                        <Filter className="h-4 w-4 text-primary" />
                        Filters
                      </h2>
                    </div>
                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground">
                        Clear all
                      </Button>
                    )}
                  </div>
                  <MaterialFilters
                    selectedSubjects={selectedSubjects}
                    selectedTypes={selectedTypes}
                    onSubjectChange={setSelectedSubjects}
                    onTypeChange={setSelectedTypes}
                    onResourceTypeSelect={scrollToTop}
                  />
                </div>
              </aside>

              {/* Main Content */}
              <div className="flex-1 relative z-10">
                {/* Search and Mobile Filter */}
                <div className="flex gap-3 mb-8 opacity-0 animate-fade-in stagger-2">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      placeholder="Search modules, PYQs, books, test series…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="h-12 pl-11 pr-4 rounded-2xl bg-card/40 backdrop-blur-xl border-border/50 text-sm placeholder:text-muted-foreground/70 transition-all duration-200 focus:shadow-[0_0_0_4px_hsl(var(--primary)/0.08)] focus:border-primary/40"
                    />
                  </div>

                  {/* Mobile Filter Sheet */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon" className="lg:hidden btn-press h-12 w-12 rounded-2xl bg-card/40 backdrop-blur-xl border-border/50">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-80 bg-surface-1">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        {hasActiveFilters && (
                          <Button variant="outline" size="sm" onClick={clearFilters} className="mb-4 w-full">
                            <X className="h-4 w-4 mr-2" />
                            Clear all filters
                          </Button>
                        )}
                        <MaterialFilters
                          selectedSubjects={selectedSubjects}
                          selectedTypes={selectedTypes}
                          onSubjectChange={setSelectedSubjects}
                          onTypeChange={setSelectedTypes}
                          onResourceTypeSelect={scrollToTop}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                {/* Results Header */}
                <div className="flex items-end justify-between mb-6 opacity-0 animate-fade-in stagger-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-1">Results</div>
                    <p className="font-display text-2xl font-bold text-foreground">
                      {isLoading ? "Loading…" : (
                        <>
                          {filteredMaterials.length}{" "}
                          <span className="text-muted-foreground font-normal italic text-lg">
                            {filteredMaterials.length === 1 ? "material" : "materials"}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  {hasActiveFilters && !isLoading && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs gap-1.5">
                      <X className="h-3 w-3" />
                      Clear filters
                    </Button>
                  )}
                </div>

                {/* Materials Grid */}
                {isLoading ? (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-52">
                        <Skeleton className="h-full w-full rounded-xl" />
                      </div>
                    ))}
                  </div>
                ) : filteredMaterials.length > 0 ? (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredMaterials.map((material, index) => (
                      <div
                        key={material.id}
                        className="opacity-0 animate-scale-in"
                        style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
                      >
                        <MaterialCard material={material} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 px-6 opacity-0 animate-fade-in rounded-3xl border border-border/50 bg-card/40 backdrop-blur-xl">
                    <div className="w-16 h-16 rounded-2xl bg-surface-2/80 border border-border/40 flex items-center justify-center mx-auto mb-5">
                      <Search className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-foreground mb-2">Nothing matches that yet</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">Try a broader keyword or clear your filters to see the full library.</p>
                    {hasActiveFilters && (
                      <Button variant="outline" onClick={clearFilters} className="mt-5 rounded-xl">
                        Clear filters
                      </Button>
                    )}
                  </div>
                )}

                {/* Bottom Protection Line */}
                <div className="mt-16 opacity-0 animate-fade-in stagger-4">
                  <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/30 backdrop-blur-xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <ShieldCheck className="h-4 w-4 text-primary/80 flex-shrink-0" />
                      <span>All materials shared strictly for educational purposes. © Respective owners.</span>
                    </div>
                    <Link to="/copyright-terms" className="text-xs text-primary hover:underline whitespace-nowrap">
                      Copyright & Terms →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

function StatPill({ icon, label, value, loading }: { icon: React.ReactNode; label: string; value: number; loading: boolean }) {
  return (
    <div className="rounded-xl border border-border/40 bg-surface-2/40 px-2 py-2.5 text-center">
      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
        {icon}
      </div>
      <div className="font-display text-lg font-bold text-foreground leading-none">
        {loading ? "—" : value}
      </div>
      <div className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/70 mt-1">{label}</div>
    </div>
  );
}

export default Materials;
