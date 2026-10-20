import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
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

  const hasActiveFilters = selectedSubjects.length > 0 || selectedTypes.length > 0;

  const clearFilters = () => {
    setSelectedSubjects([]);
    setSelectedTypes([]);
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
      <div className="w-full flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-6 text-foreground">
        <div className="flex flex-col w-full pb-16">

          {/* Hero Section */}
          <section className="w-full mt-2 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Hero Column */}
              <div className="lg:col-span-8 flex flex-col items-start space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border-2 border-[var(--desk-border)] bg-[var(--mint-light)] text-[var(--mint-dark)] font-mono text-xs font-bold tracking-wider uppercase shadow-[2px_2px_0px_var(--desk-border)] -rotate-1 select-none">
                  <span>STUDY ARSENAL</span>
                  <span>//</span>
                  <span>CURATED FOR JEE ADVANCED 2027</span>
                </div>
                <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl tracking-tight text-foreground font-extrabold uppercase mt-1">
                  MATERIALS <span className="relative inline-block text-primary">
                    VAULT.
                    <svg className="absolute -bottom-1.5 left-0 w-full" fill="none" height="10" viewBox="0 0 200 10" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 7C50 2 150 2 197 7" stroke="#FBBF24" strokeLinecap="round" strokeWidth="5"></path>
                    </svg>
                  </span>
                </h1>
                <p className="font-body text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
                  Modules, books, PYQs, test series and reference works — every single resource hand-picked, zero filler, organized for serious rankers without the emotional damage.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg border border-[var(--desk-border)]/40 bg-muted/40 text-muted-foreground font-mono text-xs">
                    <span>Verified drives</span>
                    <span>•</span>
                    <span>BOOKIE does not host files</span>
                    <span>•</span>
                    <span className="text-foreground font-bold">Pure signal, zero rot</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[var(--desk-border)] bg-[var(--sunflower)] text-[#0F172A] font-mono text-xs font-bold shadow-[1.5px_1.5px_0px_var(--desk-border)]">
                    <span>Clean OCR PDF Only</span>
                  </div>
                </div>
              </div>

              {/* Right Floating Snapshot Card */}
              <div className="lg:col-span-4 w-full">
                <div className="relative bg-card rounded-2xl p-6 border-2 border-[var(--desk-border)] shadow-[5px_5px_0px_var(--desk-border)] flex flex-col gap-4">
                  <div className="washi-tape bg-[var(--sunflower)] text-[#0F172A] -rotate-1">
                    LIBRARY SNAPSHOT // v2026.04
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-mono text-xs tracking-wider text-muted-foreground uppercase flex items-center gap-1.5 font-bold">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      INVENTORY AUDIT
                    </span>
                    <span className="px-2 py-0.5 rounded border border-[var(--desk-border)] bg-muted font-mono text-xs font-bold">ACTIVE</span>
                  </div>
                  <div>
                    <div className="font-mono font-black text-4xl sm:text-5xl text-foreground tracking-tight font-tabular">
                      {isLoading ? "..." : `${subjectStats.total}`}<span className="text-primary">+</span>
                    </div>
                    <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mt-1">
                      COMBAT-READY RESOURCES
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="h-3 w-full bg-muted border border-[var(--desk-border)]/40 rounded-full overflow-hidden flex p-0.5">
                      <div className="bg-primary h-full rounded-full" style={{ width: subjectStats.physicsPercentage }} title={`Physics: ${subjectStats.physicsPercentage}`}></div>
                      <div className="bg-[var(--sunflower)] h-full" style={{ width: subjectStats.chemistryPercentage }} title={`Chemistry: ${subjectStats.chemistryPercentage}`}></div>
                      <div className="bg-[var(--mint)] h-full rounded-full" style={{ width: subjectStats.mathematicsPercentage }} title={`Mathematics: ${subjectStats.mathematicsPercentage}`}></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 font-mono text-xs mt-1">
                      <div className="bg-muted/40 border border-[var(--desk-border)]/30 rounded-lg p-2 flex flex-col">
                        <span className="text-muted-foreground font-bold">[PHY]</span>
                        <span className="font-bold text-foreground">{isLoading ? "-" : subjectStats.physics} Items</span>
                      </div>
                      <div className="bg-muted/40 border border-[var(--desk-border)]/30 rounded-lg p-2 flex flex-col">
                        <span className="text-muted-foreground font-bold">[CHEM]</span>
                        <span className="font-bold text-foreground">{isLoading ? "-" : subjectStats.chemistry} Items</span>
                      </div>
                      <div className="bg-muted/40 border border-[var(--desk-border)]/30 rounded-lg p-2 flex flex-col">
                        <span className="text-muted-foreground font-bold">[MATH]</span>
                        <span className="font-bold text-foreground">{isLoading ? "-" : subjectStats.mathematics} Items</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 flex items-center gap-2 text-muted-foreground font-body text-xs border-t border-[var(--desk-border)]/20">
                    <span className="font-bold text-foreground">Strict Curation:</span>
                    <span className="italic">No 800-page useless scans allowed.</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Relatable Sticky Note Banner */}
          <section className="w-full mt-8 relative flex justify-center">
            <div className="w-full max-w-3xl relative bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 rounded-xl p-5 shadow-[4px_4px_0px_var(--desk-border)] rotate-[-0.6deg] hover:rotate-0 transition-transform duration-200 border-2 border-[var(--desk-border)]">
              <div className="washi-tape bg-white text-[#0F172A] -rotate-1">
                KOTA_DESK_MEMO // REALITY CHECK
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                <div>
                  <span className="font-mono text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider block">
                    BATCH REALITY PROTOCOL
                  </span>
                  <p className="font-heading text-lg font-bold text-amber-950 dark:text-amber-100 tracking-tight mt-0.5">
                    "Cengage download kar li, ab bas padhna baki hai!"
                  </p>
                  <p className="font-body text-xs text-amber-900/80 dark:text-amber-300/80 mt-0.5">
                    Day 42 of staring at the Irodov cover page waiting for momentum to appear by Osmosis.
                  </p>
                </div>
                <div className="self-end sm:self-center shrink-0">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-[var(--desk-border)] bg-[var(--sunflower)] text-[#0F172A] font-mono text-xs font-bold shadow-[1.5px_1.5px_0px_var(--desk-border)]">
                    3,842 Aspirants Felt This
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Search & Quick Navigation Bar */}
          <section className="w-full mt-8">
            <div className="bg-card rounded-2xl p-5 border-2 border-[var(--desk-border)] shadow-[4px_4px_0px_var(--desk-border)] flex flex-col gap-4">
              <div className="relative w-full flex items-center">
                <input 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-4 pr-16 py-3 rounded-xl bg-card border-2 border-[var(--desk-border)] text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-[2px_2px_0px_var(--desk-border)] transition-all" 
                  placeholder="Search modules, PYQs, Allen sheets, Cengage, MS Chouhan, Black Book..." 
                  type="text" 
                />
                <div className="absolute right-3 flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-muted-foreground bg-muted px-2 py-1 rounded border border-[var(--desk-border)]">
                    ⌘K
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button 
                  onClick={clearFilters} 
                  className={cn(
                    "px-4 py-1.5 rounded-lg font-mono text-xs font-bold whitespace-nowrap transition-all border-2 border-[var(--desk-border)] cursor-pointer",
                    !hasActiveFilters 
                      ? "bg-primary text-primary-foreground shadow-[2px_2px_0px_var(--desk-border)]" 
                      : "bg-card hover:bg-muted text-foreground"
                  )} 
                  type="button"
                >
                  All ({subjectStats.total})
                </button>
                <button 
                  onClick={() => setSelectedTypes(['pyqs'])} 
                  className={cn(
                    "px-4 py-1.5 rounded-lg font-mono text-xs font-bold whitespace-nowrap transition-all border-2 border-[var(--desk-border)] cursor-pointer",
                    selectedTypes.includes('pyqs') 
                      ? "bg-primary text-primary-foreground shadow-[2px_2px_0px_var(--desk-border)]" 
                      : "bg-card hover:bg-muted text-foreground"
                  )} 
                  type="button"
                >
                  [PYQ] Archives
                </button>
                <button 
                  onClick={() => setSelectedTypes(['modules'])} 
                  className={cn(
                    "px-4 py-1.5 rounded-lg font-mono text-xs font-bold whitespace-nowrap transition-all border-2 border-[var(--desk-border)] cursor-pointer",
                    selectedTypes.includes('modules') 
                      ? "bg-primary text-primary-foreground shadow-[2px_2px_0px_var(--desk-border)]" 
                      : "bg-card hover:bg-muted text-foreground"
                  )} 
                  type="button"
                >
                  [MOD] Coaching Modules
                </button>
              </div>
            </div>
          </section>

          {/* Main Content Layout */}
          <section className="w-full mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Filter Sidebar */}
              <aside className="lg:col-span-4 xl:col-span-3 flex flex-col gap-4 sticky top-24">
                <div className="bg-card rounded-2xl p-5 border-2 border-[var(--desk-border)] shadow-[4px_4px_0px_var(--desk-border)] flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--desk-border)]/20">
                    <span className="font-heading text-sm uppercase tracking-wider text-foreground font-extrabold">
                      REFINE CATALOG
                    </span>
                    {hasActiveFilters && (
                      <button onClick={clearFilters} className="font-mono text-xs text-primary hover:underline font-bold uppercase cursor-pointer" type="button">
                        RESET
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
                  
                  <div className="p-3 rounded-lg border border-[var(--desk-border)]/30 bg-muted/40 text-muted-foreground font-body text-xs">
                    <span className="font-bold text-foreground block mb-0.5">Focus rule:</span>
                    Pick 1 core coaching module + 1 reference standard per subject. Do not hoard 15 PDFs you won't touch!
                  </div>
                </div>
                
                <div className="p-3.5 rounded-xl border-2 border-[var(--desk-border)] bg-card shadow-[2px_2px_0px_var(--desk-border)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--mint)] animate-pulse"></span>
                    <span className="font-mono text-xs font-bold text-foreground">DRIVE MIRROR: HIGH-BANDWIDTH</span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">0S WAIT</span>
                </div>
              </aside>

              {/* Right Catalog Cards Grid */}
              <main className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-[var(--desk-border)]/20">
                  <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                    <span className="uppercase tracking-wider font-bold">SHOWING:</span>
                    <span className="text-primary font-bold">
                      {search ? `"${search}"` : "ALLEN + STANDARD REFERENCE CLASSICS"}
                    </span>
                    <span>({filteredMaterials.length} RESOURCES)</span>
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
                  <div className="text-center py-16 px-6 bg-card rounded-2xl border-2 border-[var(--desk-border)] shadow-[4px_4px_0px_var(--desk-border)]">
                    <h3 className="font-heading text-lg font-bold text-foreground mb-1">Nothing matches that yet</h3>
                    <p className="font-body text-xs text-muted-foreground max-w-sm mx-auto">Try a broader keyword or clear your filters to see the full library.</p>
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
