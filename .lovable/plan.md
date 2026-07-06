# Bookie — Bug Fix & Feature Roadmap

Big scope. I'll break it into 4 tracks, shipping in the order you suggested. Below is what I'll actually change per track; confirm and I'll start with Track 1 immediately, then move down.

---

## Track 1 — Quick Fixes (ship first)

**1.1 Footer "New material drops" card**
- In `src/components/Footer.tsx`, change that card's link from the Support route to `https://t.me/bookieshere`, open in new tab with `rel="noopener noreferrer"`.

**1.2 OP Test Series allow-list**
- Add `ophub-testseries-books-notes.pages.dev` to `ALLOWED_DOMAINS` in `src/lib/urlValidation.ts`.
- If the site sends `X-Frame-Options: DENY`, keep the "Open in new tab" fallback rather than iframe.

**1.3 Chat disclaimer — once per 24h**
- Store `disclaimer_last_seen_at` in localStorage (guest) and on `profiles` (logged-in) so it syncs.
- Skip the modal if `now - lastSeen < 24h` in `V2RoomsTab`.

---

## Track 2 — Backend / Data Model

**2.1 Universal UUID for every account**
- Audit: guests already have `device_id`; ensure `profiles.id` (uuid) is the FK used everywhere (progress, notifications-read, tickets). Fix any spots keyed by display name.

**2.2 Gmail login → cross-device sync**
- Migrate syllabus tracker (`useSyllabusTracker` currently localStorage) to a new `syllabus_progress` table keyed by `profile_id`, with guest RPCs by `device_id` and merge-on-login.
- Same pattern for disclaimer-seen and any other personal-but-persistent state.

**2.3 Notification "seen" state**
- Already have `notification_reads(notification_id, profile_id, seen_at)`; fix the badge query so unread = notifications where no matching read row exists OR `notification.updated_at > read.seen_at`.
- Mark-as-read only upserts; don't clear local state on view.

---

## Track 3 — UX / Animation / LaTeX

**3.1 Motion polish**
- Add `framer-motion`. Wrap routes in `AnimatePresence` inside `PageTransition`. Animate `transform`/`opacity` only.

**3.2 Loading screen scope**
- Keep `BookieLoader` for first paint only. Replace inner-app "loading" with a ~250ms fade/scale transition on route change.

**3.3 LaTeX in chat rooms**
- The chat message renderer in `V2RoomsTab` is plain text. Introduce a shared markdown+math renderer using `react-markdown` + `remark-math` + `rehype-katex` (already installed for BookieAI) and apply it to AI response bubbles in rooms.

---

## Track 4 — YPT Tracker & Anti-cheat

**4.1 Global Stop**
- `useStudyTimer` already uses a single localStorage state + DB session. Add a small event/context so `V2StudyTab`, floating timer, and any duplicate UIs all read/dispatch through the same hook. Stop → end session, clear state, broadcast.

**4.2 Trustworthy tracking**
- Keep timer running through tab-switch/nav (already does).
- Add Page Visibility handling: on `visibilitychange` just log, don't stop.
- On `pagehide`/`beforeunload` fire `navigator.sendBeacon` to a new edge function `end-study-session` that uses service role + validates by session id + device id (client-reported duration ignored; server recomputes `last_heartbeat - started_at - paused`).
- Heartbeats already exist every 30s; add server-side cleanup treating sessions with no heartbeat >60s as ended (already have `cleanup_stale_sessions`).

---

## Technical notes
- New table: `public.syllabus_progress(profile_id uuid, chapter_key text, stars smallint, updated_at)` with GRANTs, RLS, and guest RPCs (`guest_upsert_progress`, `guest_list_progress`) mirroring existing guest RPC pattern.
- New edge function: `end-study-session` (verify_jwt=false, validates session ownership by `id` + `device_id`).
- New dep: `framer-motion`.
- No changes to existing admin, materials, or portal data.

---

## Build order
1. Track 1 (footer, allow-list, disclaimer) — one pass, no migrations.
2. Track 2 (migration + notification query fix + tracker sync).
3. Track 4 (global timer + sendBeacon endpoint).
4. Track 3 (motion + LaTeX in rooms).

Reply "go" (or tell me to skip/reorder any track) and I'll start with Track 1.
