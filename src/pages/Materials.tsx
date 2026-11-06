import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { MaterialCard } from "@/components/MaterialCard";
import { MaterialFilters } from "@/components/MaterialFilters";
import { useMaterials } from "@/hooks/useMaterials";
import { SubjectType, ResourceType } from "@/types/materials";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 24;

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

  // Pagination slices the FULL filtered list, so search and filters always
  // run across the entire catalog; only the rendering is paged.
  const [page, setPage] = useState(1);
  useEffect(() => {
    setPage(1);
  }, [search, selectedSubjects, selectedTypes]);

  const pageCount = Math.max(1, Math.ceil(filteredMaterials.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pagedMaterials = filteredMaterials.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const goToPage = (next: number) => {
    setPage(Math.min(Math.max(1, next), pageCount));
    document.getElementById("catalog-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const pageNumbers: (number | "gap")[] = (() => {
    if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
    const pages = new Set<number>([1, 2, safePage - 1, safePage, safePage + 1, pageCount - 1, pageCount]);
    const sorted = [...pages].filter(n => n >= 1 && n <= pageCount).sort((a, b) => a - b);
    const out: (number | "gap")[] = [];
    sorted.forEach((n, i) => {
      if (i > 0 && n - sorted[i - 1] > 1) out.push("gap");
      out.push(n);
    });
    return out;
  })();

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
      <div className="w-full pt-16 flex-1 max-w-7xl mx-auto px-margin lg:px-margin-desktop bg-background blueprint-grid text-on-surface">
        <div className="flex flex-col w-full pb-space-xl">
          


          {/* Hero Section */}
          <section className="w-full mt-space-md relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              {/* Left Hero Column */}
              <div className="lg:col-span-8 flex flex-col items-start">
                <div className="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-surface-container-high text-on-surface font-label-code-sm text-label-code-sm tracking-wider uppercase mb-space-sm shadow-sm">
                  <span>📚 STUDY ARSENAL</span>
                  <span className="text-primary font-bold">//</span>
                  <span className="text-primary font-bold">CURATED FOR JEE ADVANCED 2027</span>
                </div>
                <h1 className="font-headline-xl text-headline-xl lg:text-[54px] lg:leading-[60px] tracking-tight text-on-surface font-extrabold uppercase mt-1 mb-space-sm">
                  MATERIALS <span className="relative inline-block text-primary">LIBRARY.
                  </span>
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed mt-space-xs">
                  Modules, books, PYQs, test series and reference works — every single resource hand-picked, zero filler, organized for serious aspirants.
                </p>
                <div className="flex flex-wrap items-center gap-space-sm mt-space-md">
                  <div className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-low text-on-surface-variant font-label-code-sm text-label-code-sm">
                    <span className="material-symbols-outlined text-[16px] text-tertiary">verified_user</span>
                    <span>External verified drives</span>
                    <span className="text-outline-variant">•</span>
                    <span>BOOKIE does not host files</span>
                    <span className="text-outline-variant">•</span>
                    <span className="text-tertiary font-bold">Pure signal, zero rot</span>
                  </div>
                  <div className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-ui text-label-ui">
                    <span className="material-symbols-outlined text-[15px]">auto_stories</span>
                    <span>Clean OCR PDF Only</span>
                  </div>
                </div>
              </div>

              {/* Right Floating Snapshot Card */}
              <div className="lg:col-span-4 w-full">
                <div className="relative bg-surface-container-lowest rounded-xl p-space-md shadow-[0_10px_25px_-5px_rgba(19,27,46,0.06)] flex flex-col gap-space-md brutal-border">
                  <div className="flex items-center justify-between">
                    <span className="font-label-code-sm text-label-code-sm tracking-wider text-on-surface-variant uppercase flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      LIBRARY SNAPSHOT
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-label-code-sm text-label-code-sm font-bold">v2026.04</span>
                  </div>
                  <div>
                    <div className="font-headline-xl text-headline-xl text-on-surface font-extrabold tracking-tight">
                      {isLoading ? "..." : `${subjectStats.total}`}<span className="text-primary">+</span>
                    </div>
                    <p className="font-label-code-sm text-label-code-sm text-on-surface-variant uppercase tracking-wider">
                      TOTAL COMBAT-READY RESOURCES
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="h-2.5 w-full bg-surface-container rounded-full overflow-hidden flex">
                      <div className="bg-primary h-full" style={{ width: subjectStats.physicsPercentage }} title={`Physics: ${subjectStats.physicsPercentage}`}></div>
                      <div className="bg-secondary h-full" style={{ width: subjectStats.chemistryPercentage }} title={`Chemistry: ${subjectStats.chemistryPercentage}`}></div>
                      <div className="bg-tertiary h-full" style={{ width: subjectStats.mathematicsPercentage }} title={`Mathematics: ${subjectStats.mathematicsPercentage}`}></div>
                    </div>
                    <div className="grid grid-cols-3 gap-space-xs font-label-code-sm text-label-code-sm mt-1">
                      <div className="bg-surface-container-low rounded-lg p-2 flex flex-col">
                        <span className="text-on-surface-variant flex items-center gap-1">⚛️ PHY</span>
                        <span className="font-bold text-on-surface">{isLoading ? "-" : subjectStats.physics} Items</span>
                      </div>
                      <div className="bg-surface-container-low rounded-lg p-2 flex flex-col">
                        <span className="text-on-surface-variant flex items-center gap-1">🧪 CHEM</span>
                        <span className="font-bold text-on-surface">{isLoading ? "-" : subjectStats.chemistry} Items</span>
                      </div>
                      <div className="bg-surface-container-low rounded-lg p-2 flex flex-col">
                        <span className="text-on-surface-variant flex items-center gap-1">∑ MATH</span>
                        <span className="font-bold text-on-surface">{isLoading ? "-" : subjectStats.mathematics} Items</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-space-xs flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
                    <span className="material-symbols-outlined text-error text-[18px]">verified</span>
                    <span className="font-label-ui text-label-ui text-on-surface">Strict Curation:</span>
                    <span className="italic text-on-surface-variant">No 800-page useless PDFs allowed.</span>
                  </div>
                </div>
              </div>
            </div>
          </section>


          {/* Search & Quick Navigation Bar */}
          <section className="w-full mt-space-lg">
            <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-[0_4px_16px_-4px_rgba(19,27,46,0.06)] flex flex-col gap-space-md brutal-border">
              <div className="relative w-full flex items-center">
                <span className="absolute left-space-md material-symbols-outlined text-primary text-[22px] pointer-events-none">search</span>
                <input 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-28 py-3.5 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all duration-150 shadow-inner brutal-border" 
                  placeholder="Search modules, PYQs, Allen sheets, Cengage, MS Chouhan, Black Book..." 
                  type="text" 
                />
                <div className="absolute right-space-sm flex items-center gap-1.5">
                  <kbd className="px-2 py-1 rounded bg-surface-container-highest text-on-surface-variant font-label-code-sm text-label-code-sm font-bold tracking-wider shadow-xs">
                    ⌘K
                  </kbd>
                  <button className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center shadow-[0_2px_0_0_#00174b] active:translate-y-0.5 active:shadow-none transition-all" type="button">
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-space-xs overflow-x-auto pb-1 scrollbar-none">
                <button onClick={clearFilters} className={`px-space-md py-1.5 rounded-full font-label-ui text-label-ui whitespace-nowrap transition-colors flex items-center gap-1 ${!hasActiveFilters ? 'bg-primary text-on-primary shadow-[0_2px_0_0_#00174b] active:translate-y-0.5' : 'bg-surface-container-low hover:bg-surface-container text-on-surface'}`} type="button">
                  All ({subjectStats.total})
                </button>
                <button onClick={() => setSelectedTypes(['pyqs'])} className={`px-space-md py-1.5 rounded-full font-label-ui text-label-ui whitespace-nowrap transition-colors flex items-center gap-1 ${selectedTypes.includes('pyqs') ? 'bg-primary text-on-primary shadow-[0_2px_0_0_#00174b] active:translate-y-0.5' : 'bg-surface-container-low hover:bg-surface-container text-on-surface'}`} type="button">
                  <span>⚡</span> PYQ Archives
                </button>
                <button onClick={() => setSelectedTypes(['modules'])} className={`px-space-md py-1.5 rounded-full font-label-ui text-label-ui whitespace-nowrap transition-colors flex items-center gap-1 ${selectedTypes.includes('modules') ? 'bg-primary text-on-primary shadow-[0_2px_0_0_#00174b] active:translate-y-0.5' : 'bg-surface-container-low hover:bg-surface-container text-on-surface'}`} type="button">
                  <span>📘</span> Coaching Modules
                </button>
              </div>
            </div>
          </section>

          {/* Main Content Layout */}
          <section className="w-full mt-space-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              
              {/* Filter Sidebar */}
              <aside className="lg:col-span-4 xl:col-span-3 flex flex-col gap-space-md sticky top-20">
                <div className="bg-surface-container-lowest rounded-xl p-space-md flex flex-col gap-space-md brutal-border">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-md text-label-ui uppercase tracking-wider text-on-surface font-bold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-primary">tune</span>
                      REFINE CATALOG
                    </span>
                    {hasActiveFilters && (
                      <button onClick={clearFilters} className="font-label-code-sm text-label-code-sm text-primary hover:underline font-bold uppercase" type="button">
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
                  
                  <div className="p-space-sm rounded-lg bg-surface-container-low text-on-surface-variant font-body-sm text-[12px] flex items-start gap-2">
                    <span className="material-symbols-outlined text-[18px] text-secondary shrink-0">tips_and_updates</span>
                    <span>Focus rule: Pick 1 core coaching module + 1 reference standard per subject. Do not hoarde 15 PDFs you won't touch!</span>
                  </div>
                </div>
                
                <div className="p-space-sm rounded-xl bg-surface-container-high flex items-center justify-between brutal-border">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
                    <span className="font-label-code-sm text-label-code-sm font-bold text-on-surface">DRIVE MIRROR: HIGH-BANDWIDTH</span>
                  </div>
                  <span className="font-label-code-sm text-[11px] text-on-surface-variant">0 SEC WAIT</span>
                </div>
              </aside>

              {/* Right Catalog Cards Grid */}
              <main className="lg:col-span-8 xl:col-span-9 flex flex-col gap-space-md">
                <div id="catalog-top" className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs scroll-mt-28">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-code-sm text-label-code-sm text-on-surface-variant uppercase tracking-wider">SHOWING:</span>
                    <span className="font-label-ui text-label-ui text-primary font-bold uppercase">
                      {search ? `"${search}"` : "ALLEN + STANDARD REFERENCE CLASSICS"}
                    </span>
                    <span className="text-on-surface-variant font-label-code-sm text-label-code-sm uppercase">({filteredMaterials.length} RESOURCES)</span>
                  </div>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-56"><Skeleton className="h-full w-full rounded-2xl" /></div>
                    ))}
                  </div>
                ) : filteredMaterials.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                    {pagedMaterials.map((material) => (
                      <MaterialCard key={material.id} material={material} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 px-6 bg-surface-container-lowest rounded-2xl brutal-border">
                    <span className="material-symbols-outlined text-[48px] text-on-surface-variant opacity-50 mb-4">search_off</span>
                    <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">Nothing matches that yet</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mx-auto">Try a broader keyword or clear your filters to see the full library.</p>
                  </div>
                )}

                {!isLoading && pageCount > 1 && (
                  <nav aria-label="Materials pages" className="flex items-center justify-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => goToPage(safePage - 1)}
                      disabled={safePage === 1}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors hover:border-slate-400 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Prev
                    </button>
                    {pageNumbers.map((n, i) =>
                      n === "gap" ? (
                        <span key={`gap-${i}`} className="px-1 text-xs text-slate-400">…</span>
                      ) : (
                        <button
                          key={n}
                          type="button"
                          onClick={() => goToPage(n)}
                          aria-current={n === safePage ? "page" : undefined}
                          className={
                            n === safePage
                              ? "px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold"
                              : "px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors hover:border-slate-400"
                          }
                        >
                          {n}
                        </button>
                      )
                    )}
                    <button
                      type="button"
                      onClick={() => goToPage(safePage + 1)}
                      disabled={safePage === pageCount}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors hover:border-slate-400 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      Next
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </nav>
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
