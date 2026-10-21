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
      <div className="w-full pt-16 flex-1 max-w-7xl mx-auto px-margin lg:px-margin-desktop bg-background blueprint-grid text-on-surface">
        <div className="flex flex-col w-full pb-space-xl">
          


          {/* Hero Section */}
          <section className="w-full mt-space-md relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              {/* Left Hero Column */}
              <div className="lg:col-span-8 flex flex-col items-start">
                <div className="inline-flex items-center gap-space-xs px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-brand-blue dark:text-blue-400 font-mono text-xs tracking-wider uppercase mb-space-sm border border-blue-200 dark:border-blue-800">
                  <span>📚 STUDY ARSENAL</span>
                  <span className="text-brand-blue font-bold">//</span>
                  <span className="text-brand-blue font-bold">CURATED FOR JEE ADVANCED 2027</span>
                </div>
                <h1 className="text-4xl sm:text-5xl xl:text-6xl font-ruling font-black tracking-tight text-slate-950 dark:text-white uppercase mt-1 mb-space-sm">
                  MATERIALS <span className="relative inline-block text-brand-blue">LIBRARY.
                    <span className="absolute -bottom-1 left-0 w-full h-1 bg-amber-400 rounded-full opacity-80" />
                  </span>
                </h1>
                <p className="font-editorial italic text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed mt-space-xs">
                  Modules, books, PYQs, test series and reference works — every single resource hand-picked, zero filler, organized for serious rankers without the emotional damage.
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-space-md">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-medium">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">verified_user</span>
                    <span>External verified drives • BOOKIE does not host files • Pure signal, zero rot</span>
                  </div>
                  <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-mono text-xs font-semibold">
                    <span className="material-symbols-outlined text-[15px]">auto_stories</span>
                    <span>Clean OCR PDF Only</span>
                  </div>
                </div>
              </div>

              {/* Right Floating Snapshot Card */}
              <div className="lg:col-span-4 w-full">
                <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-space-md shadow-sm border-2 border-slate-900 dark:border-slate-700 flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs tracking-wider text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5 font-bold">
                      <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse"></span>
                      LIBRARY SNAPSHOT
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-brand-blue dark:text-blue-400 font-mono text-xs font-bold border border-blue-200 dark:border-blue-800">v2026.04</span>
                  </div>
                  <div>
                    <div className="text-4xl font-ruling font-black text-slate-950 dark:text-white tracking-tight">
                      {isLoading ? "..." : `${subjectStats.total}`}<span className="text-brand-blue">+</span>
                    </div>
                    <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                      TOTAL COMBAT-READY RESOURCES
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex border border-slate-200 dark:border-slate-700">
                      <div className="bg-indigo-500 h-full" style={{ width: subjectStats.physicsPercentage }} title={`Physics: ${subjectStats.physicsPercentage}`}></div>
                      <div className="bg-emerald-500 h-full" style={{ width: subjectStats.chemistryPercentage }} title={`Chemistry: ${subjectStats.chemistryPercentage}`}></div>
                      <div className="bg-amber-500 h-full" style={{ width: subjectStats.mathematicsPercentage }} title={`Mathematics: ${subjectStats.mathematicsPercentage}`}></div>
                    </div>
                    <div className="grid grid-cols-3 gap-space-xs font-mono text-xs mt-1">
                      <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 rounded-lg p-2 flex flex-col">
                        <span className="text-indigo-700 dark:text-indigo-300 font-bold text-[10px]">⚛️ PHY</span>
                        <span className="font-bold text-slate-900 dark:text-white">{isLoading ? "-" : subjectStats.physics} Items</span>
                      </div>
                      <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 rounded-lg p-2 flex flex-col">
                        <span className="text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">🧪 CHEM</span>
                        <span className="font-bold text-slate-900 dark:text-white">{isLoading ? "-" : subjectStats.chemistry} Items</span>
                      </div>
                      <div className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 rounded-lg p-2 flex flex-col">
                        <span className="text-amber-700 dark:text-amber-300 font-bold text-[10px]">∑ MATH</span>
                        <span className="font-bold text-slate-900 dark:text-white">{isLoading ? "-" : subjectStats.mathematics} Items</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-space-xs flex items-center gap-space-xs text-slate-600 dark:text-slate-400 text-xs">
                    <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
                    <span className="font-bold text-slate-900 dark:text-white">Strict Curation:</span>
                    <span className="font-editorial italic">No 800-page useless PDFs allowed.</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Search & Quick Navigation Bar */}
          <section className="w-full mt-space-lg">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-space-md shadow-sm border-2 border-slate-900 dark:border-slate-700 flex flex-col gap-space-md">
              <div className="relative w-full flex items-center">
                <span className="absolute left-space-md material-symbols-outlined text-brand-blue text-[22px] pointer-events-none">search</span>
                <input 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-28 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all duration-150 border border-slate-200 dark:border-slate-700" 
                  placeholder="Search modules, PYQs, Allen sheets, Cengage, MS Chouhan, Black Book..." 
                  type="text" 
                />
                <div className="absolute right-space-sm flex items-center gap-1.5">
                  <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono text-xs font-bold tracking-wider">
                    ⌘K
                  </kbd>
                </div>
              </div>
              <div className="flex items-center gap-space-xs overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
                <button onClick={clearFilters} className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1 ${!hasActiveFilters ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`} type="button">
                  All ({subjectStats.total})
                </button>
                <button onClick={() => setSelectedTypes(['pyqs'])} className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1 ${selectedTypes.includes('pyqs') ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`} type="button">
                  <span>⚡</span> PYQ Archives
                </button>
                <button onClick={() => setSelectedTypes(['modules'])} className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1 ${selectedTypes.includes('modules') ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`} type="button">
                  <span>📘</span> Coaching Modules
                </button>
                <button onClick={() => setSelectedTypes(['books'])} className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1 ${selectedTypes.includes('books') ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`} type="button">
                  <span>📚</span> Reference Books
                </button>
                <button onClick={() => setSelectedTypes(['formula_sheets'])} className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1 ${selectedTypes.includes('formula_sheets') ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`} type="button">
                  <span>📝</span> Formula Sheets
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
