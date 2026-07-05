# Bookie — Batch Feature Rollout

This is a large batch (~5 independent features). I'll implement in this order, in one pass, preserving the existing black/white + sea-blue design system and liquid-glass UI.

---

## 1. Auth cleanup (small)
- Remove email/password sign-in + sign-up forms from `src/pages/Auth.tsx` and `src/pages/Welcome.tsx`.
- Keep only **Google login** + **Continue as Guest**.
- Remove/hide the "Reset password" and "Forgot password" links. Keep `/reset-password` route (harmless) but remove UI entry.

## 2. Portals & Test Series links
- `src/data/portals.ts`: add Competishun #2, eSaral (with uploaded logo), Eduniti (with uploaded logo), Allen #2.
- Upload logos via `lovable-assets` from `/mnt/user-uploads/esaral.png` and `Eduniti.png`.
- `src/data/testSeries.ts`: add "All Live Test Series Hub" + "Other Test Series" (label only, no source name).

## 3. Resource Library expansion
- Currently materials live in DB (managed via admin). Since these are ~80 bulk entries, I'll seed them via a **SQL migration** into `public.materials` (or the existing materials table — will verify shape first) grouped by category: Books, Test Series, Notes, Modules, PYQs, Assignments, Special/Olympiad, Teacher Collections.
- Each row: title (verbatim), category, url, subject tag where obvious.
- Respect existing "Access Resource" copy rule (no "Download"/"Free PDF").

## 4. Study Room chat upgrades
File: `src/components/YPTV2/V2RoomsTab.tsx` (or wherever the room chat lives — will confirm).
- **Avatars**: fetch `profiles.avatar_url` for each message author; render circular avatar beside bubble. Fallback to initials.
- **@mention system**: parse `@username` in message body, highlight as chip. If current user is mentioned in a new message, show a soft toast/banner "You were mentioned by X" above the chat (auto-dismiss 4s).
- **Reply-to**: long-press / hover shows "Reply" action; replied message renders a small quoted preview above the new bubble. Store `reply_to_id` on the message row (needs schema tweak on `room_messages`).
- **`/ai` command**: When message starts with `/ai `, send remainder to `bookie-chat` edge function with a JEE-mentor system prompt override. Insert response as a message from a synthetic "Bookie AI" author (avatar = generated bot logo, name = "Bookie AI", author_role = `ai`). Add `author_role` column to `room_messages` if missing.
- Input placeholder: `"Type a message or use /ai to ask Bookie AI..."`
- Tighten animations (framer-motion fade+slide on new messages).
- Update `bookie-chat` system prompt to a JEE-mentor tone (already tutor-oriented; verify and reinforce).

## 5. Study Tracker (new YPT section)
New tab in YPT nav: **Tracker** (icon: `Target` or `BookMarked`).
- Data source: static syllabus tree hard-coded in `src/data/jeeSyllabus.ts` (Physics/Chem/Math × 11/12, with sub-branches for Chemistry).
- Storage: new table `public.syllabus_progress` — `(profile_id, chapter_key, stars smallint 0-3, updated_at)`. RLS: owner-only via profile lookup; guest support through security-definer RPCs mirroring existing `guest_*` pattern.
- Auto-clear: single edge function or SQL cron `DELETE ... WHERE updated_at < now() - interval '3 months'` — will add a `cleanup_stale_progress()` function; scheduling optional (documented).
- UI: `src/components/YPT/YPTTracker.tsx`
  - Overall progress bar at top (weighted avg of chapter stars / max stars).
  - Per-subject accordion cards with % complete + progress bar.
  - Class 11 / Class 12 sub-groups.
  - Each chapter row: name + 3 star buttons (☆/★). Tap to cycle 0→1→2→3→0.
  - Weak chapters callout (stars ≤ 1) at top of each subject.
  - Legend: ★★★ Fully Done · ★★☆ Revision Pending · ★☆☆ Weak/Started.
- Debounced auto-save on star change (upsert).

---

## Technical notes / decisions
- One DB migration for: `syllabus_progress` table + RPCs (`upsert_progress`, `guest_upsert_progress`, `list_progress`, `guest_list_progress`, `cleanup_stale_progress`); `room_messages` additions (`reply_to_id uuid`, `author_role text default 'user'`, `ai_generated bool`).
- Materials seeding: separate migration inserting into existing materials table (will read schema first). Skip duplicates by URL.
- No changes to Cengage/SKM/V Joshi rows (per memory).
- All new UI uses semantic tokens + liquid-glass utilities already in `index.css`.
- Mobile: Tracker uses full-width cards; bottom nav gets 6th tab — if too crowded I'll fold Tracker into the Stats tab as a sub-view instead. Will decide during build after checking current tab bar.

## Risks
- The materials list is long; if the current schema requires manual admin approval flow, I'll insert as pre-approved/active rows.
- `/ai` in chat uses existing `bookie-chat` function — no new key needed.

Proceeding to implement now.
