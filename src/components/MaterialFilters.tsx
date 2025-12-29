import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ExamType, SubjectType, ResourceType, examLabels, subjectLabels, resourceLabels } from "@/types/materials";

interface MaterialFiltersProps {
  selectedExams: ExamType[];
  selectedSubjects: SubjectType[];
  selectedTypes: ResourceType[];
  onExamChange: (exams: ExamType[]) => void;
  onSubjectChange: (subjects: SubjectType[]) => void;
  onTypeChange: (types: ResourceType[]) => void;
}

export function MaterialFilters({
  selectedExams,
  selectedSubjects,
  selectedTypes,
  onExamChange,
  onSubjectChange,
  onTypeChange,
}: MaterialFiltersProps) {
  const exams: ExamType[] = ['jee', 'other_pcm'];
  const subjects: SubjectType[] = ['physics', 'chemistry', 'mathematics'];
  const resourceTypes: ResourceType[] = ['books', 'notes', 'pyqs', 'practice_sheets'];

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
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-semibold mb-3 text-foreground">Exam Type</h3>
        <div className="space-y-2">
          {exams.map((exam) => (
            <div key={exam} className="flex items-center space-x-2">
              <Checkbox
                id={`exam-${exam}`}
                checked={selectedExams.includes(exam)}
                onCheckedChange={() => toggleFilter(selectedExams, exam, onExamChange)}
              />
              <Label htmlFor={`exam-${exam}`} className="text-sm cursor-pointer">
                {examLabels[exam]}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display font-semibold mb-3 text-foreground">Subject</h3>
        <div className="space-y-2">
          {subjects.map((subject) => (
            <div key={subject} className="flex items-center space-x-2">
              <Checkbox
                id={`subject-${subject}`}
                checked={selectedSubjects.includes(subject)}
                onCheckedChange={() => toggleFilter(selectedSubjects, subject, onSubjectChange)}
              />
              <Label htmlFor={`subject-${subject}`} className="text-sm cursor-pointer">
                {subjectLabels[subject]}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display font-semibold mb-3 text-foreground">Resource Type</h3>
        <div className="space-y-2">
          {resourceTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${type}`}
                checked={selectedTypes.includes(type)}
                onCheckedChange={() => toggleFilter(selectedTypes, type, onTypeChange)}
              />
              <Label htmlFor={`type-${type}`} className="text-sm cursor-pointer">
                {resourceLabels[type]}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}