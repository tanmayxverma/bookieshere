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
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground font-bold">
            1. SUBJECT STREAM
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
                    "p-2.5 rounded-lg font-mono text-xs font-bold flex items-center justify-between text-left transition-all border-2 border-[var(--desk-border)] cursor-pointer",
                    active
                      ? "bg-primary text-primary-foreground shadow-[2px_2px_0px_var(--desk-border)]"
                      : "bg-card hover:bg-muted text-foreground"
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="text-[10px] opacity-80">[{code}]</span>
                    <span>{label}</span>
                  </span>
                  <span className="text-[10px] font-semibold opacity-75">
                    {getSubjectCount(id)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-outline-variant/30" />

        {/* Resource Type Filter Group */}
        <div className="flex flex-col gap-space-xs">
          <span className="font-label-code-sm text-label-code-sm uppercase tracking-wider text-on-surface-variant font-bold">
            2. ARSENAL CATEGORY
          </span>
          <div className="flex flex-col gap-2">
            {resourceTypes.map((id) => {
              const active = selectedTypes.includes(id);
              const count = getTypeCount(id);
              
              if (count === 0 && !active) return null; // Hide empty categories
              
              return (
                <label 
                  key={id}
                  className="flex items-center justify-between p-1.5 rounded hover:bg-surface-container-low cursor-pointer"
                >
                  <span className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleResourceType(id)}
                      className="w-4 h-4 rounded text-primary accent-primary focus:ring-0"
                    />
                    {resourceLabels[id]}
                  </span>
                  <span className="font-label-code-sm text-[11px] text-on-surface-variant">
                    {count}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
        
        {/* Difficulty Target Level (Static for Visual) */}
        <div className="flex flex-col gap-space-xs pt-space-xs border-t border-outline-variant/30">
          <span className="font-label-code-sm text-label-code-sm uppercase tracking-wider text-on-surface-variant font-bold">
            3. TARGET BENCHMARK
          </span>
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 rounded-md bg-surface-container text-on-surface font-label-code-sm text-label-code-sm cursor-pointer hover:bg-surface-container-high transition-colors">
              Mains Speed (99%ile)
            </span>
            <span className="px-2.5 py-1 rounded-md bg-primary text-on-primary font-label-code-sm text-label-code-sm font-bold cursor-pointer">
              Adv Standard (Top 5k)
            </span>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
