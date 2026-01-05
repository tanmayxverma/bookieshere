import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SubjectType, ResourceType, subjectLabels, resourceLabels } from "@/types/materials";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MaterialFiltersProps {
  selectedSubjects: SubjectType[];
  selectedTypes: ResourceType[];
  onSubjectChange: (subjects: SubjectType[]) => void;
  onTypeChange: (types: ResourceType[]) => void;
}

export function MaterialFilters({
  selectedSubjects,
  selectedTypes,
  onSubjectChange,
  onTypeChange,
}: MaterialFiltersProps) {
  const subjects: SubjectType[] = ['physics', 'chemistry', 'mathematics', 'combined'];
  const resourceTypes: ResourceType[] = ['books', 'notes', 'crux', 'pyqs', 'test_series', 'modules', 'practice_sheets'];

  const toggleFilter = <T extends string>(
    current: T[],
    value: T,
    onChange: (values: T[]) => void
  ) => {
    if (current.includes(value)) {
      onChange(current.filter((v) => v !== value));
    } else {
      onChange([...current, value]);
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-280px)] max-h-[400px] pr-3">
      <div className="space-y-6">
        {/* Subject Filter Group */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Subject
          </h3>
          <div className="space-y-2.5">
            {subjects.map((subject) => (
              <div key={subject} className="flex items-center space-x-3">
                <Checkbox
                  id={`subject-${subject}`}
                  checked={selectedSubjects.includes(subject)}
                  onCheckedChange={() => toggleFilter(selectedSubjects, subject, onSubjectChange)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label 
                  htmlFor={`subject-${subject}`} 
                  className="text-sm cursor-pointer text-foreground/90 hover:text-foreground transition-colors"
                >
                  {subject === 'combined' ? 'Mixed Materials' : subjectLabels[subject]}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Resource Type Filter Group */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Resource Type
          </h3>
          <div className="space-y-2.5">
            {resourceTypes.map((type) => (
              <div key={type} className="flex items-center space-x-3">
                <Checkbox
                  id={`type-${type}`}
                  checked={selectedTypes.includes(type)}
                  onCheckedChange={() => toggleFilter(selectedTypes, type, onTypeChange)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label 
                  htmlFor={`type-${type}`} 
                  className="text-sm cursor-pointer text-foreground/90 hover:text-foreground transition-colors"
                >
                  {resourceLabels[type]}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
