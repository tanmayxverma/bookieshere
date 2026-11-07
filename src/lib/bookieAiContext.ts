// Bookie AI — per-student context pack, built fresh for every message.
// Best-effort by design: every piece is optional, and any failure just means
// that line is left out. The chat must never block or break because of context.
import { supabase } from "@/integrations/supabase/client";
import { EXAM_CONFIG } from "@/components/JEECountdown";

const PAGE_NAMES: Record<string, string> = {
  "/": "the Home page",
  "/materials": "the Materials library",
  "/ypt": "the YPT study timer",
  "/tests": "the Test Series Hub",
  "/community": "the Community (Aspirant Lounge)",
  "/portals": "the Portals launcher",
  "/support": "the Support page",
  "/donate": "the Buy Me a Chai (donate) page",
  "/profile": "their Profile page",
  "/notifications": "the Notifications page",
};

function daysLeft(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}

let userCache: { name: string | null; guest: boolean } | null = null;

async function resolveUser(): Promise<{ name: string | null; guest: boolean }> {
  if (userCache) return userCache;
  try {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) return { name: null, guest: true };
    let name: string | null =
      (user.user_metadata?.display_name as string) ||
      (user.user_metadata?.full_name as string) ||
      null;
    if (!name) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .maybeSingle();
      name = (profile as { display_name?: string } | null)?.display_name || null;
    }
    userCache = { name, guest: false };
    return userCache;
  } catch {
    return { name: null, guest: true };
  }
}

export async function buildBookieContext(): Promise<string> {
  const lines: string[] = ["STUDENT CONTEXT (live — use it naturally, never recite it):"];

  // Date & time in India
  try {
    const now = new Date();
    const ist = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(now);
    lines.push(`- Right now in India: ${ist} IST.`);
  } catch { /* skip */ }

  // Countdowns
  const exams = Object.values(EXAM_CONFIG)
    .map((e) => `${e.label} in ${daysLeft(e.targetDateISO)} days (${e.displayDate})`)
    .join("; ");
  lines.push(`- Days left: ${exams}.`);

  // Current page
  try {
    const path = window.location.pathname;
    const friendly =
      PAGE_NAMES[path] ||
      (path.startsWith("/test-series/") ? "a test series page" : "somewhere on Bookie");
    lines.push(`- The student is chatting from ${friendly} (route ${path}).`);
  } catch { /* skip */ }

  // Study streak (cached by the navbar streak hook)
  try {
    const raw = localStorage.getItem("bookie_user_streak");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.streak === "number") {
        lines.push(
          parsed.streak > 0
            ? `- Their YPT study streak is ${parsed.streak} day(s)${parsed.longestStreak ? ` (best: ${parsed.longestStreak})` : ""}.`
            : "- Their YPT streak is currently 0 — don't rub it in."
        );
      }
    }
  } catch { /* skip */ }

  // Who they are — never block the chat on this (900ms budget)
  try {
    const user = await Promise.race([
      resolveUser(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 900)),
    ]);
    if (user) {
      lines.push(
        user.name
          ? `- Signed in as ${user.name}. Use their first name occasionally, like a friend would — not in every message.`
          : user.guest
            ? "- They are browsing as a guest (not signed in)."
            : "- Signed in (no display name set)."
      );
    }
  } catch { /* skip */ }

  return lines.join("\n");
}
