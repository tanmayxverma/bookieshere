export interface YPTUser {
  id: string;
  device_id: string;
  name: string;
  jee_focus_year: string;
  created_at: string;
  last_active_at: string;
  name_change_history: NameChangeEntry[];
}

export interface NameChangeEntry {
  oldName: string;
  newName: string;
  changedAt: string; // ISO string
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
  last_heartbeat: string | null;
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
  started_at?: string;
}

export const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Self Study'] as const;

export const JEE_YEARS = ['JEE 2027', 'JEE 2028', 'Early Starter'] as const;

export const TIMER_STORAGE_KEY = 'ypt_active_timer';

export const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // +5:30

/** Get current time in IST as a Date object */
export function getISTDate(date?: Date): Date {
  const d = date || new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  return new Date(utc + IST_OFFSET_MS);
}

/** Get IST midnight (start of today in IST) as a UTC ISO string */
export function getISTTodayStartUTC(): string {
  const ist = getISTDate();
  ist.setHours(0, 0, 0, 0);
  // Convert back to UTC
  const utcMs = ist.getTime() - IST_OFFSET_MS;
  return new Date(utcMs).toISOString();
}

/** Check if a UTC timestamp falls on "today" in IST */
export function isISTToday(utcTimestamp: string): boolean {
  const istDate = getISTDate(new Date(utcTimestamp));
  const istNow = getISTDate();
  return istDate.toDateString() === istNow.toDateString();
}

/** Get the IST date string (YYYY-MM-DD) from a UTC timestamp */
export function getISTDateString(utcTimestamp: string): string {
  const ist = getISTDate(new Date(utcTimestamp));
  return ist.toISOString().split('T')[0];
}

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

const NAME_CHANGE_LIMIT = 2;
const NAME_CHANGE_WINDOW_DAYS = 14;

export function canChangeName(history: NameChangeEntry[]): { allowed: boolean; remainingChanges: number; nextAvailableDate: string | null } {
  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - NAME_CHANGE_WINDOW_DAYS);
  
  const recentChanges = history.filter(
    (entry) => new Date(entry.changedAt) > windowStart
  );
  
  const remaining = NAME_CHANGE_LIMIT - recentChanges.length;
  
  if (remaining > 0) {
    return { allowed: true, remainingChanges: remaining, nextAvailableDate: null };
  }
  
  // Find the earliest change in window - it will expire first
  const sorted = recentChanges.sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime());
  const nextDate = new Date(sorted[0].changedAt);
  nextDate.setDate(nextDate.getDate() + NAME_CHANGE_WINDOW_DAYS);
  
  return { allowed: false, remainingChanges: 0, nextAvailableDate: nextDate.toLocaleDateString() };
}
