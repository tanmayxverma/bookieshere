export type ExamType = 'jee' | 'other_pcm';
export type SubjectType = 'physics' | 'chemistry' | 'mathematics';
export type ResourceType = 'books' | 'notes' | 'pyqs' | 'practice_sheets';

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
};

export const resourceLabels: Record<ResourceType, string> = {
  books: 'Books',
  notes: 'Notes',
  pyqs: 'PYQs',
  practice_sheets: 'Practice Sheets',
};