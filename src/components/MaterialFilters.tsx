import { SubjectType, ResourceType, subjectLabels, resourceLabels } from "@/types/materials";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Atom, FlaskConical, Sigma, Layers, BookOpen, FileText, Sparkles, History, ClipboardList, GraduationCap, PenLine, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const subjects: { id: SubjectType; icon: React.ComponentType<{ className?: string }>; accent: string }[] = [
    { id: 'physics', icon: Atom, accent: 'text-physics' },
    { id: 'chemistry', icon: FlaskConical, accent: 'text-chemistry' },
    { id: 'mathematics', icon: Sigma, accent: 'text-mathematics' },
    { id: 'combined', icon: Layers, accent: 'text-jee' },
  ];

  const resourceTypes: { id: ResourceType; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'books', icon: BookOpen },
    { id: 'notes', icon: FileText },
    { id: 'crux', icon: Sparkles },
    { id: 'pyqs', icon: History },
    { id: 'test_series', icon: ClipboardList },
    { id: 'modules', icon: GraduationCap },
    { id: 'practice_sheets', icon: PenLine },
  ];

  const toggleSubject = (subject: SubjectType) => {
    if (selectedSubjects.includes(subject)) {
      onSubjectChange(selectedSubjects.filter((v) => v !== subject));
    } else {
      onSubjectChange([...selectedSubjects, subject]);
    }
  };

  // Single-select for resource type with auto-scroll
  const selectResourceType = (type: ResourceType) => {
    if (selectedTypes.includes(type)) {
      onTypeChange([]);
    } else {
      onTypeChange([type]);
      onResourceTypeSelect?.();
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-280px)] max-h-[480px] pr-3 -mr-3">
      <div className="space-y-7">
        {/* Subject Filter Group — chip grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/80">
              Subject
            </h3>
            {selectedSubjects.length > 0 && (
              <span className="text-[10px] text-primary font-medium">{selectedSubjects.length} active</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {subjects.map(({ id, icon: Icon, accent }) => {
              const active = selectedSubjects.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleSubject(id)}
                  className={cn(
                    "group relative flex flex-col items-start gap-1.5 rounded-xl border px-3 py-2.5 text-left transition-all duration-200",
                    active
                      ? "border-primary/50 bg-primary/10 text-foreground shadow-[0_0_0_1px_hsl(var(--primary)/0.2)]"
                      : "border-border/50 bg-surface-2/40 text-foreground/80 hover:border-border hover:bg-surface-2/80"
                  )}
                >
                  <Icon className={cn("h-4 w-4 transition-colors", active ? accent : "text-muted-foreground group-hover:" + accent)} />
                  <span className="text-xs font-medium leading-tight">
                    {id === 'combined' ? 'PCM Mix' : subjectLabels[id]}
                  </span>
                  {active && (
                    <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border/40" />
          <span className="h-1 w-1 rounded-full bg-border" />
          <span className="h-px flex-1 bg-border/40" />
        </div>

        {/* Resource Type Filter Group — list with icon */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/80">
              Resource Type
            </h3>
            <span className="text-[10px] text-muted-foreground/60 italic">Single select</span>
          </div>
          <div className="space-y-1">
            {resourceTypes.map(({ id, icon: Icon }) => {
              const active = selectedTypes.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => selectResourceType(id)}
                  className={cn(
                    "group w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-150",
                    active
                      ? "bg-primary/10 text-foreground"
                      : "text-foreground/75 hover:bg-surface-2/60 hover:text-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-md border transition-colors",
                      active
                        ? "border-primary/40 bg-primary/15 text-primary"
                        : "border-border/40 bg-surface-2/40 text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="flex-1 text-sm font-medium">{resourceLabels[id]}</span>
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
