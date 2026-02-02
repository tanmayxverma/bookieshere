import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Filter, X, BookOpen, Sparkles } from "lucide-react";
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

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header Section - Surface Level 0 */}
        <div className="py-10 md:py-12 border-b border-border/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl opacity-0 animate-fade-in">
              {/* Pill */}
              <span className="pill pill-primary mb-4">
                <BookOpen className="h-3 w-3" />
                Study Resources
              </span>

              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                Materials <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">Library</span>
              </h1>
              <p className="text-muted-foreground max-w-xl">
                Browse and access curated study materials for JEE preparation.
              </p>
              
              {/* Enrichment line */}
              <div className="mt-4 pt-4 border-t border-border/30">
                <p className="text-xs text-muted-foreground/70 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-border" />
                  This link redirects to an external platform. BOOKIE does not host, control, or store any files.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Surface Level 1 */}
        <div className="py-8 bg-surface-1">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Desktop Filters Sidebar */}
              <aside className="hidden lg:block w-64 flex-shrink-0 opacity-0 animate-fade-in stagger-1">
                <div className="sticky top-24 bg-surface-2 rounded-xl border border-border/40 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
                      <Filter className="h-4 w-4 text-primary" />
                      Filters
                    </h2>
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
              <div className="flex-1">
                {/* Search and Mobile Filter */}
                <div className="flex gap-3 mb-6 opacity-0 animate-fade-in stagger-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search materials..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 bg-surface-2 border-border/40 transition-all duration-200 focus:shadow-md focus:shadow-primary/10"
                    />
                  </div>

                  {/* Mobile Filter Sheet */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon" className="lg:hidden btn-press bg-surface-2">
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

                {/* Results Count */}
                <div className="flex items-center gap-2 mb-5 opacity-0 animate-fade-in stagger-3">
                  <span className="w-1 h-4 rounded-full bg-primary/50" />
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? "Loading..." : `${filteredMaterials.length} materials found`}
                  </p>
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
                  <div className="text-center py-16 opacity-0 animate-fade-in bg-surface-2 rounded-xl border border-border/40">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                      <Search className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-2">No materials found matching your criteria.</p>
                    {hasActiveFilters && (
                      <Button variant="link" onClick={clearFilters} className="mt-2">
                        Clear filters
                      </Button>
                    )}
                  </div>
                )}

                {/* Bottom Protection Line */}
                <div className="mt-12 pt-6 border-t border-border/30 text-center opacity-0 animate-fade-in stagger-4">
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-border" />
                    All materials are shared strictly for educational purposes. © Respective owners.
                    <span className="w-1 h-1 rounded-full bg-border" />
                  </p>
                  <Link to="/copyright-terms" className="text-xs text-primary hover:underline mt-2 inline-block">
                    Copyright & Terms
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Materials;
