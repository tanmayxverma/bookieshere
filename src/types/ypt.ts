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

export type TimerMode = 'stopwatch' | 'countdown';

export interface TimerState {
  sessionId: string;
  subject: string;
  startedAt: number;
  pausedAt: number | null;
  totalPausedMs: number;
  yptUserId: string;
  /** 'stopwatch' counts up (default), 'countdown' counts down from targetSeconds */
  mode?: TimerMode;
  /** Countdown target in seconds (countdown mode only) */
  targetSeconds?: number;
  /** Pomodoro phase, used to offer the follow-up break */
  phase?: 'work' | 'break';
  /** Break length in seconds to offer once a work countdown completes */
  breakSeconds?: number;
  /** Strict anti-cheat: last timestamp when site was actively ticking/running */
  lastActiveAt?: number;
  /** Strict anti-cheat: exact verified seconds accumulated while site was open */
  accumulatedSeconds?: number;
}

export interface PomodoroPreset {
  label: string;
  work: number; // minutes
  break: number; // minutes
}

export const POMODORO_PRESETS: PomodoroPreset[] = [
  { label: 'Standard 25/5', work: 25, break: 5 },
  { label: 'Long Block 50/10', work: 50, break: 10 },
  { label: 'JEE Shift 90/15', work: 90, break: 15 },
];

export interface ActiveStudyUser {
  name: string;
  subject: string;
  jee_focus_year: string;
  started_at?: string;
}

export const SUBJECTS = [
  'Physics',
  'Chemistry',
  'Mathematics',
  'Self Study',
  'Mock Test',
  'Revision',
] as const;

export const JEE_YEARS = ['JEE 2027', 'JEE 2028', 'Early Starter'] as const;

export const TIMER_STORAGE_KEY = 'ypt_active_timer';

export const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // +5:30
export const STUDY_DAY_CUTOFF_HOUR = 3; // 3:00 AM IST daily reset

/** Get current time in IST as a Date object */
export function getISTDate(date?: Date): Date {
  const d = date || new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  return new Date(utc + IST_OFFSET_MS);
}

/**
 * Get the Start of the active "Study Day" in IST as a UTC ISO string.
 * The daily reset is 3:00 AM IST.
 * If the current IST time is before 3:00 AM, the study day started at 3:00 AM on the previous day.
 */
export function getISTTodayStartUTC(): string {
  const ist = getISTDate();
  if (ist.getHours() < STUDY_DAY_CUTOFF_HOUR) {
    ist.setDate(ist.getDate() - 1);
  }
  ist.setHours(STUDY_DAY_CUTOFF_HOUR, 0, 0, 0);
  const utcMs = ist.getTime() - IST_OFFSET_MS;
  return new Date(utcMs).toISOString();
}

/** Get IST start of current study week (Monday 3:00 AM IST) as a UTC ISO string */
export function getISTWeekStartUTC(): string {
  const ist = getISTDate();
  if (ist.getHours() < STUDY_DAY_CUTOFF_HOUR) {
    ist.setDate(ist.getDate() - 1);
  }
  const day = ist.getDay(); // 0 = Sunday
  const diff = day === 0 ? 6 : day - 1; // days since Monday
  ist.setDate(ist.getDate() - diff);
  ist.setHours(STUDY_DAY_CUTOFF_HOUR, 0, 0, 0);
  return new Date(ist.getTime() - IST_OFFSET_MS).toISOString();
}

/**
 * Get IST study day string (YYYY-MM-DD) for any timestamp based on 3:00 AM IST reset.
 * For example:
 * 2:30 AM IST on Sept 29 -> "2026-09-28" (yesterday's study day)
 * 3:01 AM IST on Sept 29 -> "2026-09-29" (today's study day)
 */
export function getISTDateString(utcTimestamp?: string | Date | number): string {
  const d = utcTimestamp ? (typeof utcTimestamp === 'string' || typeof utcTimestamp === 'number' ? new Date(utcTimestamp) : utcTimestamp) : new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  // Shift by IST (+5:30) minus 3 hours rollover (-3:00)
  const studyDate = new Date(utc + IST_OFFSET_MS - STUDY_DAY_CUTOFF_HOUR * 3600 * 1000);
  return studyDate.toISOString().split('T')[0];
}

/**
 * Get IST date string for today's active study day (YYYY-MM-DD) based on 3:00 AM IST reset.
 */
export function getISTStudyDayString(): string {
  return getISTDateString(new Date());
}

/** Check if a UTC timestamp falls on the current active study day in IST (based on 3:00 AM IST reset) */
export function isISTToday(utcTimestamp: string): boolean {
  return getISTDateString(utcTimestamp) === getISTStudyDayString();
}

/**
 * Calculate study streak with 3:00 AM IST daily rollover:
 * - If user studied on today's study day: streak includes today!
 * - If user hasn't studied today yet, but studied yesterday (the previous 3 AM - 3 AM window):
 *   the streak from yesterday is STILL ALIVE (grace period until 3:00 AM IST)!
 * - Steps backwards consecutive days to count full streak length.
 */
export function calculateStudyStreak(dayMap: Record<string, number>, liveElapsedSeconds = 0): {
  streak: number;
  longestStreak: number;
  isAliveToday: boolean;
} {
  const todayKey = getISTStudyDayString();
  const todaySecs = (dayMap[todayKey] || 0) + liveElapsedSeconds;
  const MIN_SECS = 300; // 5 minutes minimum to count a day

  // Find yesterday's key relative to current study day
  const istNow = getISTDate();
  if (istNow.getHours() < STUDY_DAY_CUTOFF_HOUR) {
    istNow.setDate(istNow.getDate() - 1);
  }
  
  let currentStreak = 0;
  const checkDate = new Date(istNow);

  // Check if today qualifies
  const todayQualifies = todaySecs >= MIN_SECS;

  if (todayQualifies) {
    currentStreak = 1;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    // Today hasn't qualified yet. Check if yesterday qualified
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayKey = checkDate.toISOString().split('T')[0];
    const yesterdaySecs = dayMap[yesterdayKey] || 0;
    if (yesterdaySecs >= MIN_SECS) {
      currentStreak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      return { streak: 0, longestStreak: calculateLongestStreak(dayMap), isAliveToday: false };
    }
  }

  // Count backwards consecutive qualifying days
  for (let i = 0; i < 365; i++) {
    const key = checkDate.toISOString().split('T')[0];
    const secs = dayMap[key] || 0;
    if (secs >= MIN_SECS) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  const longest = Math.max(currentStreak, calculateLongestStreak(dayMap));

  return {
    streak: currentStreak,
    longestStreak: longest,
    isAliveToday: todayQualifies,
  };
}

function calculateLongestStreak(dayMap: Record<string, number>): number {
  const keys = Object.keys(dayMap).filter(k => (dayMap[k] || 0) >= 300).sort();
  if (keys.length === 0) return 0;
  let max = 1;
  let current = 1;
  for (let i = 1; i < keys.length; i++) {
    const prev = new Date(keys[i - 1]);
    const curr = new Date(keys[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diffDays === 1) {
      current++;
      if (current > max) max = current;
    } else if (diffDays > 1) {
      current = 1;
    }
  }
  return max;
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
