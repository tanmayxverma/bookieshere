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
      <div className="w-full pt-8 sm:pt-16 flex-1 max-w-7xl mx-auto px-3 sm:px-margin lg:px-margin-desktop bg-background blueprint-grid text-on-surface">
        <div className="flex flex-col w-full pb-space-xl">
          

          {/* Hero Section */}
          <section className="w-full mt-space-sm sm:mt-space-md relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md sm:gap-space-lg items-start">
              {/* Left Hero Column */}
              <div className="lg:col-span-8 flex flex-col items-start">
                <div className="inline-flex items-center gap-space-xs px-3 sm:px-space-md py-1 rounded-full bg-surface-container-high text-on-surface font-label-code-sm text-[10px] sm:text-label-code-sm tracking-wider uppercase mb-space-sm shadow-sm max-w-full truncate">
                  <span>📚 STUDY ARSENAL</span>
                  <span className="text-primary font-bold">//</span>
                  <span className="text-primary font-bold truncate">JEE ADVANCED 2027</span>
                </div>
                <h1 className="font-headline-xl text-3xl sm:text-headline-xl lg:text-[54px] lg:leading-[60px] tracking-tight text-on-surface font-extrabold uppercase italic mt-1 mb-space-sm">
                  MATERIALS <span className="relative inline-block text-primary">LIBRARY.
                    <svg className="absolute -bottom-2 left-0 w-full h-3 text-secondary-container" fill="none" preserveAspectRatio="none" viewBox="0 0 250 12">
                      <path d="M3 8.5C45 3.5 130 1.5 247 7.5" stroke="currentColor" strokeLinecap="round" strokeWidth="5"></path>
                    </svg>
                  </span>
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed mt-space-xs">
                  Modules, books, PYQs, test series and reference works — every single resource hand-picked, zero filler, organized for serious rankers without the emotional damage.
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
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-5 bg-secondary-container/60 rotate-1 backdrop-blur-sm sticker-tape pointer-events-none"></div>
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

          {/* Relatable Sticky Note Banner */}
          <section className="w-full mt-space-lg relative flex justify-center">
            <div className="w-full max-w-3xl relative bg-secondary-fixed text-on-secondary-fixed rounded-lg p-space-md shadow-[0_8px_18px_-2px_rgba(92,67,0,0.12)] rotate-[-0.6deg] hover:rotate-0 transition-transform duration-200 brutal-border border-secondary-fixed">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-surface-container-lowest/80 backdrop-blur-sm -rotate-2 sticker-tape pointer-events-none flex items-center justify-center">
                <span className="font-label-code-sm text-[9px] uppercase tracking-widest text-outline">KOTA_DESK_MEMO</span>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm pt-1">
                <div className="flex items-start gap-space-sm">
                  <span className="text-[24px] leading-none select-none">📌</span>
                  <div>
                    <span className="font-label-code-sm text-label-code-sm font-bold text-secondary uppercase tracking-wider block">
                      BATCH REALITY PROTOCOL
                    </span>
                    <p className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight mt-0.5">
                      "Cengage download kar li, ab bas padhna baki hai!"
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Day 42 of staring at the Irodov cover page waiting for momentum to appear by Osmosis.
                    </p>
                  </div>
                </div>
                <div className="self-end sm:self-center shrink-0">
                  <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-code-sm text-label-code-sm font-bold shadow-[0_2px_0_0_#5c4300]">
                    🔥 3,842 Aspirants Felt This
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Search & Quick Navigation Bar */}
          <section className="w-full mt-space-lg">
            <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-[0_4px_16px_-4px_rgba(19,27,46,0.06)] flex flex-col gap-space-md brutal-border">
              <div className="relative w-full flex items-center">
                <span className="absolute left-3 sm:left-space-md material-symbols-outlined text-primary text-[20px] sm:text-[22px] pointer-events-none">search</span>
                <input 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-12 sm:pr-28 py-3 sm:py-3.5 rounded-xl bg-surface-container-low text-on-surface font-body-md text-sm sm:text-body-md focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all duration-150 shadow-inner brutal-border" 
                  placeholder="Search modules, PYQs, Allen sheets, Cengage, MS Chouhan..." 
                  type="text" 
                />
                <div className="absolute right-2 sm:right-space-sm flex items-center gap-1.5">
                  <kbd className="hidden sm:inline-block px-2 py-1 rounded bg-surface-container-highest text-on-surface-variant font-label-code-sm text-label-code-sm font-bold tracking-wider shadow-xs">
                    ⌘K
                  </kbd>
                  <button className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center shadow-[0_2px_0_0_#00174b] active:translate-y-0.5 active:shadow-none transition-all" type="button" aria-label="Search">
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-space-xs overflow-x-auto pb-1 scrollbar-none">
                <button onClick={clearFilters} className={`px-3 sm:px-space-md py-1.5 rounded-full font-label-ui text-xs sm:text-label-ui whitespace-nowrap transition-colors flex items-center gap-1 ${!hasActiveFilters ? 'bg-primary text-on-primary shadow-[0_2px_0_0_#00174b] active:translate-y-0.5' : 'bg-surface-container-low hover:bg-surface-container text-on-surface'}`} type="button">
                  All ({subjectStats.total})
                </button>
                <button onClick={() => setSelectedTypes(['pyqs' as ResourceType])} className={`px-3 sm:px-space-md py-1.5 rounded-full font-label-ui text-xs sm:text-label-ui whitespace-nowrap transition-colors flex items-center gap-1 ${selectedTypes.includes('pyqs' as ResourceType) ? 'bg-primary text-on-primary shadow-[0_2px_0_0_#00174b] active:translate-y-0.5' : 'bg-surface-container-low hover:bg-surface-container text-on-surface'}`} type="button">
                  <span>⚡</span> PYQ Archives
                </button>
                <button onClick={() => setSelectedTypes(['modules' as ResourceType])} className={`px-3 sm:px-space-md py-1.5 rounded-full font-label-ui text-xs sm:text-label-ui whitespace-nowrap transition-colors flex items-center gap-1 ${selectedTypes.includes('modules' as ResourceType) ? 'bg-primary text-on-primary shadow-[0_2px_0_0_#00174b] active:translate-y-0.5' : 'bg-surface-container-low hover:bg-surface-container text-on-surface'}`} type="button">
                  <span>📘</span> Coaching Modules
                </button>
              </div>
            </div>
          </section>

          {/* Main Content Layout */}
          <section className="w-full mt-space-md sm:mt-space-lg">
            {/* Mobile Filter Toggle Button */}
            <div className="lg:hidden mb-4">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="w-full p-3 rounded-xl bg-surface-container-lowest border-2 border-on-surface flex items-center justify-between shadow-brutal active:translate-y-0.5 transition-all"
              >
                <div className="flex items-center gap-2 font-headline-md text-sm font-bold text-on-surface">
                  <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
                  <span>Filter Resources</span>
                  {hasActiveFilters && (
                    <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-mono font-bold">
                      {selectedSubjects.length + selectedTypes.length} Active
                    </span>
                  )}
                </div>
                <span className="text-xs font-mono font-bold text-primary">
                  {mobileFiltersOpen ? "Hide Filters ▲" : "Show Filters ▼"}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md sm:gap-space-lg items-start">
              
              {/* Filter Sidebar (collapsible on mobile, sticky on desktop) */}
              <aside className={`lg:col-span-4 xl:col-span-3 flex-col gap-space-md sticky top-20 ${mobileFiltersOpen ? 'flex' : 'hidden lg:flex'}`}>
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
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
                    {filteredMaterials.map((material) => (
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
              </main>

            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Materials;
