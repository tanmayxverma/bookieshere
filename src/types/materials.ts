export type ExamType = 'jee' | 'other_pcm';
export type SubjectType = 'physics' | 'chemistry' | 'mathematics' | 'combined';
export type ResourceType = 'books' | 'notes' | 'pyqs' | 'practice_sheets' | 'test_series' | 'modules' | 'crux';
export type BadgeType = 'premium' | 'air' | 'core' | null;

export interface Material {
  id: string;
  name: string;
  description: string | null;
  exam: ExamType;
  subject: SubjectType;
  resource_type: ResourceType;
  download_link: string;
  popularity: number;
  badge?: BadgeType;
  created_at: string;
  updated_at: string;
}

export const badgeLabels: Record<Exclude<BadgeType, null>, { label: string; icon: string }> = {
  premium: { label: 'Premium', icon: '⭐' },
  air: { label: 'AIR', icon: '📘' },
  core: { label: 'Core', icon: '🔥' },
};

export const examLabels: Record<ExamType, string> = {
  jee: 'JEE',
  other_pcm: 'Other PCM Exams',
};

export const subjectLabels: Record<SubjectType, string> = {
  physics: 'Physics',
  chemistry: 'Chemistry',
  mathematics: 'Mathematics',
  combined: 'PCM Mix',
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
