// Bookie AI — site knowledge, GENERATED from the app's own data files so it can
// never drift out of sync with the real site the way the old hardcoded prompt did.
// If the catalog changes, this knowledge changes with it automatically.
import { DEFAULT_MATERIALS } from "@/data/materialsData";
import { TEST_SERIES } from "@/data/testSeries";
import { PORTALS } from "@/data/portals";
import { EXAM_CONFIG } from "@/components/JEECountdown";

function materialsDigest(): string {
  const bySubject = new Map<string, string[]>();
  for (const m of DEFAULT_MATERIALS) {
    const key = m.subject || "combined";
    if (!bySubject.has(key)) bySubject.set(key, []);
    bySubject.get(key)!.push(`${m.name} (${m.resource_type.replace(/_/g, " ")})`);
  }
  const lines: string[] = [
    `The Materials library (/materials) currently holds ${DEFAULT_MATERIALS.length} resources. Every one of them opens through Bookie's Telegram channel — tell students the name and that it's in Materials; never invent a download link or a title that is not in this list.`,
  ];
  const order = ["physics", "chemistry", "mathematics", "combined"];
  for (const subject of order) {
    const items = bySubject.get(subject);
    if (!items?.length) continue;
    lines.push(`${subject.toUpperCase()} (${items.length}): ${items.join("; ")}`);
  }
  return lines.join("\n");
}

function testSeriesDigest(): string {
  const parts = TEST_SERIES.map(
    (p) => `${p.name} — ${p.description} [${p.resources.map((r) => r.name).join(", ")}]`
  );
  return `The Test Series Hub (/tests) collects free test-series and mock resources from these providers:\n${parts.join("\n")}`;
}

function portalsDigest(): string {
  const names = PORTALS.map((p) => p.name).join(", ");
  return `Portals (/portals) is a launcher of study apps and teacher platforms students already use: ${names}. Each portal opens its own app/site from there.`;
}

function examDigest(): string {
  const parts = Object.values(EXAM_CONFIG).map(
    (e) => `${e.label}: ${e.displayDate} ${e.year}`
  );
  return `The countdowns on Bookie's home page (the dates the whole site plans around): ${parts.join(" · ")}. Treat these as the site's target dates; official NTA/IIT notices are the final word and you should say so if a student asks about exact exam dates.`;
}

export const BOOKIE_AI_KNOWLEDGE = [
  "WHAT BOOKIE IS: Bookie (bookiejee.cv) is a 100% free JEE preparation platform built by a single student developer. Sign-in is Google, email, or guest mode — guests keep their data on-device until they link an account. Nothing on the site costs money; a voluntary 'Buy Me a Chai' page (/donate) supports the developer.",
  "",
  "THE PAGES (send students to the exact page, by name and route):",
  "- Home (/): exam countdowns, quick subject access, trending materials.",
  "- Materials (/materials): the resource library detailed below — searchable, filterable by subject and type.",
  "- YPT (/ypt): focus study timer (stopwatch + Pomodoro), daily targets, streaks (the study day resets at 3 AM IST, matching late-night study), live study rooms with other aspirants, a study tracker for the JEE syllabus, and stats.",
  "- Tests (/tests): the test-series hub detailed below.",
  "- Community (/community): the Aspirant Lounge — students post doubts, strategies, memes and mock scores in categories (General & Rants, Strategy & Tips, Memes & Humor, Daily Grind, Mocks & Marks, Books & Notes, College & Cutoffs, and subject doubts for Physics, Math, Chemistry). Post titles go up exactly as written.",
  "- Portals (/portals): detailed below.",
  "- Support (/support): a help desk where students chat with the owner — report bugs, missing or wrong materials, or request a book. Replies come in the owner's free time. This is the correct answer for anything broken on the site.",
  "- Profile (/profile): account, avatar and study identity. Notifications (/notifications) carry site updates.",
  "",
  examDigest(),
  "",
  materialsDigest(),
  "",
  testSeriesDigest(),
  "",
  portalsDigest(),
].join("\n");
