// Client-side content moderation for Community.
// Blocks URLs and a compact vulgar/slur wordlist.

const URL_RE = /\b((https?:\/\/|www\.)\S+|\S+\.(com|net|org|io|in|app|xyz|co|dev|gg|me|tv|shop|store|info|biz)(\/\S*)?)/i;

const BLOCKED_WORDS = [
  'fuck','fucker','fucking','shit','bitch','bastard','asshole','dick',
  'pussy','cunt','slut','whore','faggot','nigger','nigga','retard','rape',
  'chutiya','chutiyaa','madarchod','behenchod','bhosdi','bhosdike','bhosdika',
  'lund','lauda','gaand','randi','harami','kutta','kutti','saala','saali',
  'bkl','mc','bc','bsdk','mkc'
];

// Simple character-substitution normalization
function normalize(input: string) {
  return input
    .toLowerCase()
    .replace(/[0]/g, 'o')
    .replace(/[1!|]/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[4@]/g, 'a')
    .replace(/[5$]/g, 's')
    .replace(/[7]/g, 't')
    .replace(/[^a-z\s]/g, ' ');
}

export interface ModResult {
  ok: boolean;
  reason?: string;
}

export function moderate(text: string, opts: { allowLinks?: boolean } = {}): ModResult {
  const raw = text.trim();
  if (!raw) return { ok: false, reason: 'Message is empty.' };
  if (!opts.allowLinks && URL_RE.test(raw)) {
    return { ok: false, reason: 'Links are not allowed here.' };
  }
  const normalized = normalize(raw);
  const tokens = new Set(normalized.split(/\s+/).filter(Boolean));
  for (const w of BLOCKED_WORDS) {
    if (tokens.has(w)) return { ok: false, reason: 'Please keep it respectful — that word isn\'t allowed.' };
  }
  return { ok: true };
}