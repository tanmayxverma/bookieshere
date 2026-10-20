import { SubjectType, ResourceType, subjectLabels, resourceLabels } from "@/types/materials";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useMaterials } from "@/hooks/useMaterials";

interface MaterialFiltersProps {
  selectedSubjects: SubjectType[];
  selectedTypes: ResourceType[];
  onSubjectChange: (subjects: SubjectType[]) => void;
  onTypeChange: (types: ResourceType[]) => void;
  onResourceTypeSelect?: () => void;
}

export function MaterialFilters({
  selectedSubjects,
  selectedTypes,
  onSubjectChange,
  onTypeChange,
  onResourceTypeSelect,
}: MaterialFiltersProps) {
  const { data: materials } = useMaterials();
  
  const subjects: { id: SubjectType; code: string; label: string }[] = [
    { id: 'physics', code: 'PHY', label: 'Physics' },
    { id: 'chemistry', code: 'CHEM', label: 'Chemistry' },
    { id: 'mathematics', code: 'MATH', label: 'Maths' },
    { id: 'combined', code: 'ALL', label: 'PCM Mix' },
  ];

  const resourceTypes: ResourceType[] = [
    'modules', 'books', 'pyqs', 'crux', 'test_series', 'notes', 'practice_sheets'
  ];

  const getSubjectCount = (id: SubjectType) => {
    return materials?.filter(m => m.subject === id).length || 0;
  };

  const getTypeCount = (id: ResourceType) => {
    return materials?.filter(m => m.resource_type === id).length || 0;
  };

  const toggleSubject = (subject: SubjectType) => {
    if (selectedSubjects.includes(subject)) {
      onSubjectChange(selectedSubjects.filter((v) => v !== subject));
    } else {
      onSubjectChange([...selectedSubjects, subject]);
    }
  };

  const toggleResourceType = (type: ResourceType) => {
    if (selectedTypes.includes(type)) {
      onTypeChange(selectedTypes.filter((v) => v !== type));
    } else {
      onTypeChange([...selectedTypes, type]);
      onResourceTypeSelect?.();
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-280px)] max-h-[480px] pr-3 -mr-3">
      <div className="space-y-6">
        {/* Subject Filter Group */}
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            1. Academic Discipline
          </span>
          <div className="grid grid-cols-2 gap-2">
            {subjects.map(({ id, code, label }) => {
              const active = selectedSubjects.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleSubject(id)}
                  className={cn(
                    "p-2.5 rounded-lg font-mono text-xs font-medium flex items-center justify-between text-left transition-all border cursor-pointer",
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-card border-border/70 hover:border-primary/40 text-foreground"
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="text-[10px] opacity-80">[{code}]</span>
                    <span>{label}</span>
                  </span>
                  <span className="text-[10px] font-semibold opacity-85">
                    {getSubjectCount(id)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/60" />

        {/* Resource Type Filter Group */}
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            2. Archival Category
          </span>
          <div className="flex flex-col gap-1.5">
            {resourceTypes.map((id) => {
              const active = selectedTypes.includes(id);
              const count = getTypeCount(id);
              
              if (count === 0 && !active) return null; // Hide empty categories
              
              return (
                <label 
                  key={id}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer border",
                    active 
                      ? "bg-primary/5 border-primary/20 text-foreground" 
                      : "border-transparent hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2.5 font-mono text-xs">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleResourceType(id)}
                      className="w-3.5 h-3.5 rounded text-primary accent-primary cursor-pointer"
                    />
                    <span>{resourceLabels[id]}</span>
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground font-medium">
                    {count}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
        
        {/* Difficulty Target Level */}
        <div className="flex flex-col gap-2 pt-1 border-t border-border/60">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            3. Standard Level
          </span>
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 rounded-md bg-muted/60 text-muted-foreground font-mono text-[11px] border border-border/60 cursor-pointer hover:text-foreground transition-colors">
              Mains Speed (99%ile)
            </span>
            <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary font-mono text-[11px] font-semibold border border-primary/20 cursor-pointer">
              Adv Standard (Top 5k)
            </span>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
