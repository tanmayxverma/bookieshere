export type ExamType = 'jee' | 'other_pcm';
export type SubjectType = 'physics' | 'chemistry' | 'mathematics' | 'combined';
export type ResourceType = 'books' | 'notes' | 'pyqs' | 'practice_sheets' | 'test_series' | 'modules' | 'crux';

export interface Material {
  id: string;
  name: string;
  description: string | null;
  exam: ExamType;
  subject: SubjectType;
  resource_type: ResourceType;
  download_link: string;
  created_at: string;
  updated_at: string;
}

export const examLabels: Record<ExamType, string> = {
  jee: 'JEE',
  other_pcm: 'Other PCM Exams',
};

export const subjectLabels: Record<SubjectType, string> = {
  physics: 'Physics',
  chemistry: 'Chemistry',
  mathematics: 'Mathematics',
  combined: 'All Subjects',
};

export const resourceLabels: Record<ResourceType, string> = {
  books: 'Books',
  notes: 'Notes',
  pyqs: 'PYQs',
  practice_sheets: 'Practice Sheets',
  test_series: 'Test Series',
  modules: 'Coaching Modules',
  crux: 'Crux / Summary',
};
