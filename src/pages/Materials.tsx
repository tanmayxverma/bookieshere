import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, X } from "lucide-react";
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Materials <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">Library</span>
          </h1>
          <p className="text-muted-foreground">
            Browse and download curated study materials for JEE preparation.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-foreground">Filters</h2>
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
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Mobile Filter */}
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search materials..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Mobile Filter Sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="lg:hidden">
                    <Filter className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
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
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Results Count */}
            <p className="text-sm text-muted-foreground mb-4">
              {isLoading ? "Loading..." : `${filteredMaterials.length} materials found`}
            </p>

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
                {filteredMaterials.map((material) => (
                  <MaterialCard key={material.id} material={material} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No materials found matching your criteria.</p>
                {hasActiveFilters && (
                  <Button variant="link" onClick={clearFilters} className="mt-2">
                    Clear filters
                  </Button>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Materials;
