export interface YPTUser {
  id: string;
  device_id: string;
  name: string;
  jee_focus_year: string;
  created_at: string;
  last_active_at: string;
}

export interface StudySession {
  id: string;
  ypt_user_id: string;
  subject: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  status: string;
  created_at: string;
}

export interface YPTTodo {
  id: string;
  ypt_user_id: string;
  text: string;
  completed: boolean;
  created_date: string;
  created_at: string;
}

export interface TimerState {
  sessionId: string;
  subject: string;
  startedAt: number;
  pausedAt: number | null;
  totalPausedMs: number;
  yptUserId: string;
}

export interface ActiveStudyUser {
  name: string;
  subject: string;
  jee_focus_year: string;
}

export const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Self Study'] as const;

export const JEE_YEARS = ['JEE 2027', 'JEE 2028', 'Early Starter'] as const;

export const TIMER_STORAGE_KEY = 'ypt_active_timer';

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function formatHours(seconds: number): string {
  return `${(seconds / 3600).toFixed(1)}h`;
}

const BLOCKED_WORDS = [
  'fuck', 'shit', 'ass', 'dick', 'bitch', 'bastard', 'cunt',
  'nigger', 'faggot', 'whore', 'slut', 'porn', 'rape',
  'madarchod', 'bhenchod', 'chutiya', 'gaand', 'lund', 'randi'
];

export function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'Name cannot be empty';
  if (trimmed.length < 2) return 'Name must be at least 2 characters';
  if (trimmed.length > 30) return 'Name must be under 30 characters';
  if (/^\d+$/.test(trimmed)) return 'Name cannot be only numbers';
  const lower = trimmed.toLowerCase();
  for (const word of BLOCKED_WORDS) {
    if (lower.includes(word)) return 'Please use an appropriate name';
  }
  return null;
}
