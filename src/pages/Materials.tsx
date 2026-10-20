import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { MaterialCard } from "@/components/MaterialCard";
import { MaterialFilters } from "@/components/MaterialFilters";
import { useMaterials } from "@/hooks/useMaterials";
import { SubjectType, ResourceType } from "@/types/materials";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Search, BookOpen, ShieldCheck, Sparkles, Filter, X } from "lucide-react";

const Materials = () => {
  const { data: materials, isLoading } = useMaterials();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectType[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<ResourceType[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const subjectParam = searchParams.get('subject');
    if (subjectParam && ['physics', 'chemistry', 'mathematics', 'combined'].includes(subjectParam)) {
      setSelectedSubjects([subjectParam as SubjectType]);
    }
  }, [searchParams]);

  const filteredMaterials = useMemo(() => {
    if (!materials) return [];
    return materials.filter((material) => {
      const s = (search || '').toLowerCase();
      const matchesSearch = s === "" || 
        (material.name || "").toLowerCase().includes(s) ||
        ((material.description || "").toLowerCase().includes(s));
      const matchesSubject = selectedSubjects.length === 0 || selectedSubjects.includes(material.subject);
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(material.resource_type);
      return matchesSearch && matchesSubject && matchesType;
    });
  }, [materials, search, selectedSubjects, selectedTypes]);

  const hasActiveFilters = selectedSubjects.length > 0 || selectedTypes.length > 0 || search !== "";

  const clearFilters = () => {
    setSelectedSubjects([]);
    setSelectedTypes([]);
    setSearch("");
  };

  const subjectStats = useMemo(() => {
    const list = materials ?? [];
    const total = list.length;
    const physics = list.filter((m) => m.subject === "physics").length;
    const chemistry = list.filter((m) => m.subject === "chemistry").length;
    const mathematics = list.filter((m) => m.subject === "mathematics").length;
    return {
      total,
      physicsPercentage: total ? `${(physics / total * 100).toFixed(0)}%` : "0%",
      chemistryPercentage: total ? `${(chemistry / total * 100).toFixed(0)}%` : "0%",
      mathematicsPercentage: total ? `${(mathematics / total * 100).toFixed(0)}%` : "0%",
      physics, chemistry, mathematics
    };
  }, [materials]);

  return (
    <Layout>
      <div className="w-full flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-8 text-foreground">
        <div className="flex flex-col w-full pb-16 space-y-8">

          {/* Hero Section */}
          <section className="w-full relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Hero Column */}
              <div className="lg:col-span-8 flex flex-col items-start space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-primary/20 bg-primary/10 text-primary font-mono text-[11px] font-semibold tracking-wider uppercase">
                  <span>Archival Vault</span>
                  <span>·</span>
                  <span>10-Year PYQ & Module Dossier</span>
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-foreground leading-tight">
                  Curated Academic Materials.
                </h1>
                <p className="font-mono text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                  Coaching modules, standard reference classics, chapter notes and verified PYQs — hand-curated for serious aspirants. Zero clutter, pure signal.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-border/60 bg-card text-muted-foreground font-mono text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    <span>Verified drives</span>
                    <span>·</span>
                    <span>BOOKIE does not host files</span>
                    <span>·</span>
                    <span className="text-foreground font-medium">Pure signal</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-primary/20 bg-primary/10 text-primary font-mono text-[11px] font-medium">
                    <span>Clean OCR PDF Only</span>
                  </div>
                </div>
              </div>

              {/* Right Floating Snapshot Card */}
              <div className="lg:col-span-4 w-full">
                <div className="relative bg-card rounded-2xl p-6 border border-border/80 shadow-xs flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase flex items-center gap-2 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      Inventory Audit
                    </span>
                    <span className="px-2 py-0.5 rounded-md border border-border/60 bg-muted/40 font-mono text-[10px] text-muted-foreground font-medium">
                      v2026.10
                    </span>
                  </div>
                  <div>
                    <div className="font-mono font-bold text-4xl sm:text-5xl text-foreground tracking-tight">
                      {isLoading ? "..." : `${subjectStats.total}`}<span className="text-primary font-serif font-normal">+</span>
                    </div>
                    <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider mt-1">
                      Combat-Ready Resources
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 pt-1">
                    <div className="h-2 w-full bg-muted/60 border border-border/40 rounded-full overflow-hidden flex p-0.5">
                      <div className="bg-primary h-full rounded-full" style={{ width: subjectStats.physicsPercentage }} title={`Physics: ${subjectStats.physicsPercentage}`} />
                      <div className="bg-amber-500 h-full" style={{ width: subjectStats.chemistryPercentage }} title={`Chemistry: ${subjectStats.chemistryPercentage}`} />
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: subjectStats.mathematicsPercentage }} title={`Mathematics: ${subjectStats.mathematicsPercentage}`} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 font-mono text-[11px] mt-1">
                      <div className="bg-muted/30 border border-border/50 rounded-lg p-2 flex flex-col">
                        <span className="text-muted-foreground font-semibold">[PHY]</span>
                        <span className="font-medium text-foreground">{isLoading ? "-" : subjectStats.physics} Items</span>
                      </div>
                      <div className="bg-muted/30 border border-border/50 rounded-lg p-2 flex flex-col">
                        <span className="text-muted-foreground font-semibold">[CHEM]</span>
                        <span className="font-medium text-foreground">{isLoading ? "-" : subjectStats.chemistry} Items</span>
                      </div>
                      <div className="bg-muted/30 border border-border/50 rounded-lg p-2 flex flex-col">
                        <span className="text-muted-foreground font-semibold">[MATH]</span>
                        <span className="font-medium text-foreground">{isLoading ? "-" : subjectStats.mathematics} Items</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 flex items-center justify-between text-muted-foreground font-mono text-[11px] border-t border-border/60">
                    <span className="font-medium text-foreground">Strict Curation:</span>
                    <span className="italic">Zero low-quality scans.</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 14-Day Revision Dossier Banner */}
          <section className="w-full relative">
            <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl border border-primary/20 shrink-0 mt-0.5 sm:mt-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                      Revision Protocol
                    </span>
                    <span className="text-xs text-muted-foreground hidden sm:inline font-mono">· Active JEE Cycle</span>
                  </div>
                  <p className="font-serif text-base sm:text-lg font-medium text-foreground tracking-tight mt-1">
                    "Finish the 14-day PYQ loop before starting another reference book."
                  </p>
                  <p className="font-mono text-xs text-muted-foreground mt-0.5">
                    Solve one 2019–2024 paper per subject under timed cockpit conditions before hoarding new PDFs.
                  </p>
                </div>
              </div>
              <div className="self-end sm:self-center shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-border/60 bg-muted/40 text-muted-foreground font-mono text-xs font-medium">
                  3,842 Aspirants Active
                </span>
              </div>
            </div>
          </section>

          {/* Search & Quick Filter Pills */}
          <section className="w-full">
            <div className="bg-card rounded-2xl p-4 sm:p-5 border border-border/80 shadow-xs flex flex-col gap-3.5">
              <div className="relative w-full flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-muted-foreground" />
                <input 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-background border border-border/80 text-foreground font-mono text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  placeholder="Search modules, PYQs, Allen sheets, Cengage, MS Chouhan, Black Book..." 
                  type="text" 
                />
                <div className="absolute right-3 flex items-center gap-2">
                  <span className="text-[11px] font-mono font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/60">
                    ⌘K
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button 
                  onClick={clearFilters} 
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg font-mono text-xs font-medium whitespace-nowrap transition-all border cursor-pointer",
                    !hasActiveFilters 
                      ? "bg-primary text-primary-foreground border-primary shadow-xs" 
                      : "bg-card hover:bg-muted/50 border-border/70 text-foreground"
                  )} 
                  type="button"
                >
                  All ({subjectStats.total})
                </button>
                <button 
                  onClick={() => setSelectedSubjects(['physics'])} 
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg font-mono text-xs font-medium whitespace-nowrap transition-all border cursor-pointer",
                    selectedSubjects.length === 1 && selectedSubjects[0] === 'physics'
                      ? "bg-primary text-primary-foreground border-primary shadow-xs" 
                      : "bg-card hover:bg-muted/50 border-border/70 text-foreground"
                  )} 
                  type="button"
                >
                  [PHY] Physics
                </button>
                <button 
                  onClick={() => setSelectedSubjects(['chemistry'])} 
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg font-mono text-xs font-medium whitespace-nowrap transition-all border cursor-pointer",
                    selectedSubjects.length === 1 && selectedSubjects[0] === 'chemistry'
                      ? "bg-primary text-primary-foreground border-primary shadow-xs" 
                      : "bg-card hover:bg-muted/50 border-border/70 text-foreground"
                  )} 
                  type="button"
                >
                  [CHEM] Chemistry
                </button>
                <button 
                  onClick={() => setSelectedSubjects(['mathematics'])} 
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg font-mono text-xs font-medium whitespace-nowrap transition-all border cursor-pointer",
                    selectedSubjects.length === 1 && selectedSubjects[0] === 'mathematics'
                      ? "bg-primary text-primary-foreground border-primary shadow-xs" 
                      : "bg-card hover:bg-muted/50 border-border/70 text-foreground"
                  )} 
                  type="button"
                >
                  [MATH] Mathematics
                </button>
                <button 
                  onClick={() => setSelectedTypes(['pyqs'])} 
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg font-mono text-xs font-medium whitespace-nowrap transition-all border cursor-pointer",
                    selectedTypes.includes('pyqs') 
                      ? "bg-primary text-primary-foreground border-primary shadow-xs" 
                      : "bg-card hover:bg-muted/50 border-border/70 text-foreground"
                  )} 
                  type="button"
                >
                  [PYQ] Archives
                </button>
                <button 
                  onClick={() => setSelectedTypes(['modules'])} 
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg font-mono text-xs font-medium whitespace-nowrap transition-all border cursor-pointer",
                    selectedTypes.includes('modules') 
                      ? "bg-primary text-primary-foreground border-primary shadow-xs" 
                      : "bg-card hover:bg-muted/50 border-border/70 text-foreground"
                  )} 
                  type="button"
                >
                  [MOD] Coaching Modules
                </button>
              </div>
            </div>
          </section>

          {/* Main Content Layout */}
          <section className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Filter Sidebar */}
              <aside className="lg:col-span-4 xl:col-span-3 flex flex-col gap-4 sticky top-24">
                <div className="bg-card rounded-2xl p-5 border border-border/80 shadow-xs flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-2 border-b border-border/60">
                    <span className="font-mono text-xs uppercase tracking-wider text-foreground font-semibold">
                      Refine Catalog
                    </span>
                    {hasActiveFilters && (
                      <button onClick={clearFilters} className="font-mono text-[11px] text-primary hover:underline font-semibold uppercase cursor-pointer flex items-center gap-1" type="button">
                        <X className="w-3 h-3" /> Reset
                      </button>
                    )}
                  </div>
                  
                  <MaterialFilters
                    selectedSubjects={selectedSubjects}
                    selectedTypes={selectedTypes}
                    onSubjectChange={setSelectedSubjects}
                    onTypeChange={setSelectedTypes}
                    onResourceTypeSelect={() => {}}
                  />
                  
                  <div className="p-3 rounded-lg border border-border/60 bg-muted/30 text-muted-foreground font-mono text-[11px] leading-relaxed">
                    <span className="font-semibold text-foreground block mb-0.5">Focus Rule:</span>
                    Pick 1 core coaching module + 1 reference standard per subject. Do not hoard 15 PDFs you won't touch.
                  </div>
                </div>
                
                <div className="p-3.5 rounded-xl border border-border/80 bg-card shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-[11px] font-semibold text-foreground">Drive Mirror: High Bandwidth</span>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">0s Latency</span>
                </div>
              </aside>

              {/* Right Catalog Cards Grid */}
              <main className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-border/60">
                  <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                    <span className="uppercase tracking-wider font-semibold">Showing:</span>
                    <span className="text-primary font-medium">
                      {search ? `"${search}"` : "Standard Academic Vault"}
                    </span>
                    <span>({filteredMaterials.length} Resources)</span>
                  </div>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-56"><Skeleton className="h-full w-full rounded-xl" /></div>
                    ))}
                  </div>
                ) : filteredMaterials.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredMaterials.map((material) => (
                      <MaterialCard key={material.id} material={material} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 px-6 bg-card rounded-2xl border border-border/80 shadow-xs">
                    <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                    <h3 className="font-serif text-lg font-medium text-foreground mb-1">No archives match this filter</h3>
                    <p className="font-mono text-xs text-muted-foreground max-w-sm mx-auto mb-4">Try broader search terms or reset your subject/category filters to inspect the full library.</p>
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-semibold shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
              </main>

            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Materials;
