# Bookie Expansion — Admin · Notifications · Support

A single phased build that adds three connected systems and refreshes the three legal pages.

## 1. Database (one migration)

New tables in `public` (all with RLS + GRANTs):

- `admin_credentials` — one server-side row. Stores `password_hash_1`, `password_hash_2` (bcrypt-equivalent via `pgcrypto`), plus `updated_at`. **No client read access at all.** Only the `verify-admin` edge function can read it via `service_role`.
- `admin_sessions` — `id`, `user_id` (nullable, links to `auth.users` when present), `device_id`, `token` (random 32-byte), `expires_at`, `created_at`, `last_seen_at`. 30-minute sliding expiry. Validated server-side only.
- `admin_login_attempts` — `id`, `device_id`, `ip_hash`, `attempted_at`, `success` — used for brute-force throttling (max 5 fails / 15 min).
- `notifications` — `id`, `title`, `body`, `type` (`announcement | update | material | maintenance | feature | alert`), `priority` (`low | normal | high | critical`), `is_pinned`, `is_active`, `publish_at`, `expires_at`, `created_by`, timestamps.
- `notification_reads` — `id`, `notification_id`, `profile_id`, `read_at`. Composite unique on `(notification_id, profile_id)`. Works for both authenticated users and guests (uses `profiles.id`, which exists for both).
- `tickets` — `id`, `profile_id`, `subject`, `category` (`bug | help | feature | feedback | content_report | technical`), `description`, `priority` (`low | normal | high | urgent`), `status` (`open | under_review | accepted | rejected | in_progress | resolved | closed | reopened`), `rejection_reason`, `assigned_admin_id`, `last_message_at`, timestamps.
- `ticket_messages` — `id`, `ticket_id`, `author_role` (`user | admin | system`), `author_profile_id`, `body`, `read_by_user_at`, `read_by_admin_at`, `created_at`.
- `admin_logs` — `id`, `action`, `target_table`, `target_id`, `admin_session_id`, `metadata jsonb`, `created_at`.

RLS:
- `notifications`: `SELECT` for `anon` + `authenticated` where `is_active AND publish_at <= now() AND (expires_at IS NULL OR expires_at > now())`. All writes blocked from client; admin edge function uses `service_role`.
- `notification_reads`: user/guest can read/insert/update rows where `profile_id` matches their session profile (security-definer `current_profile_id(_device_id)` helper).
- `tickets` + `ticket_messages`: same — only the owning profile can read/insert. Admin actions go through edge functions.
- `admin_credentials`, `admin_sessions`, `admin_login_attempts`, `admin_logs`: no client access (no policies, no anon/authenticated grants).

Realtime publication adds `notifications`, `notification_reads`, `tickets`, `ticket_messages`.

Seed: empty `admin_credentials` row created from environment-supplied hashes via a one-time `INSERT` in the seeding edge function (`init-admin`), not in source.

## 2. Edge functions (server-only auth + admin work)

- `admin-login` — body `{ password1, password2, device_id }`. Throttles via `admin_login_attempts`, compares both hashes with `crypt()`, issues 30-min session token. Returns `{ token, expires_at }`.
- `admin-session` — body `{ token }`. Returns `{ valid: bool }`, slides expiry on hit.
- `admin-logout` — invalidates token.
- `admin-action` — single endpoint for all moderator writes: `{ token, op, payload }` where `op` is one of `notification.create/update/delete/toggle`, `ticket.accept/reject/status/assign/reply/close/reopen`, `user.list/details`, `stats.overview`. All operations validate the token, log to `admin_logs`, and run with `service_role`. Keeps surface area tiny.

Secrets needed (one-time, asked from user): `ADMIN_PASSWORD_1`, `ADMIN_PASSWORD_2`. The functions hash on first run and store in `admin_credentials`. After that, secrets can be rotated by re-running an `init-admin` flow from the admin panel.

## 3. Frontend

### Notification bell (`src/components/Notifications/NotificationBell.tsx`)
- Lives in `Navbar` next to `UserMenu`.
- Subscribes to `notifications` + `notification_reads` via Realtime, computes unread count.
- Dropdown shows latest 8 with type icon, time-ago, "Mark all read", and "View all".
- Pinned + critical notifications get a red dot.

### Notification Center (`src/pages/Notifications.tsx`)
- Tabs: All · Unread · Pinned · By type.
- Cards with read/unread state, swipe-friendly on mobile.

### Support Center (`src/pages/Support.tsx` — rewrite)
- Replaces the current Telegram-routing page.
- Left rail: my tickets (status pills, last-message time). Right: ticket detail + chat thread.
- "New ticket" opens modal with subject, category, priority, description (zod-validated; max 120 / 2000 chars).
- Ticket chat: realtime message stream, optimistic send, read receipts. "Awaiting admin acceptance" state until an admin accepts.
- Status timeline at top of each ticket.

### Admin panel
- Hidden entry: tiny `·` glyph in `Footer.tsx` bottom-right, `text-muted-foreground/30 hover:text-muted-foreground`, tooltip "Admin". Opens `AdminLoginModal`.
- New routes (only mounted when a valid session token exists in `sessionStorage`):
  - `/admin` — overview (stats cards + recent activity feed)
  - `/admin/notifications` — CRUD list, schedule, pin, enable/disable
  - `/admin/tickets` — searchable/filterable list + detail view with reply, status, reject reason, assign
  - `/admin/users` — paginated list with activity
  - `/admin/settings` — change passwords, view system logs
- Existing `src/pages/Admin.tsx` is repurposed as the shell.
- Auto-logout after 30 min inactivity; activity ping every 5 min to extend session.
- All admin reads/writes go through `admin-action` with the session token. Frontend never sees password hashes or service role.

### Hooks
- `useNotifications()` — list + unread count + mark read, realtime.
- `useTickets()` / `useTicket(id)` — list + detail with realtime messages.
- `useAdminSession()` — token lifecycle, inactivity timer.

### Performance
- All lists paginated (20 per page) with React Query keepPreviousData.
- Bell uses a tiny `count(*) filter` query, not full list, refreshed by realtime.
- Admin routes lazy-loaded with `React.lazy` + Suspense.
- Existing global preloader unchanged.

## 4. Legal page updates

- `src/pages/PrivacyPolicy.tsx`, `src/pages/CopyrightTerms.tsx`, `src/pages/DMCA.tsx`:
  - Replace every Telegram / `t.me/...` reference with a link to the in-app Support Center and a mention of the chat ticket system.
  - Add a "Contact" block at the end of **each** of these three pages only: chat support link + email `capcutwaladiddy@gmail.com`. Email is **not** added to the global footer or any general public surface.

## 5. Memory updates

- Update Core memory: remove "Centralized Telegram support integration"; replace with "Internal ticket-based Support Center is the only support channel". Email `capcutwaladiddy@gmail.com` appears only in Privacy, Copyright Terms, and DMCA pages.
- Update `mem://features/support` to describe the new chat/ticket flow.

## Technical notes

- Password hashing: `pgcrypto`'s `crypt(pw, gen_salt('bf', 10))`; comparison via `crypt(input, stored) = stored`. Done inside `admin-login` edge function using `service_role` client.
- Throttle window: count rows in `admin_login_attempts` where `device_id = ? AND attempted_at > now() - interval '15 minutes' AND success = false`; reject when ≥ 5.
- Realtime: enabled for the four user-facing tables. Bell uses one channel filtered to `notifications` table changes; ticket detail uses one channel filtered to its `ticket_id`.
- Design: re-uses existing semantic tokens, liquid-glass surfaces, and the project's black/white minimal pass for admin views per existing structural-design-law memory.
- Mobile: ticket detail and admin tables collapse into stacked cards under `md`.

## What I need from you before building

1. **Admin password 1** and **admin password 2** — I'll add them as edge-function secrets (`ADMIN_PASSWORD_1`, `ADMIN_PASSWORD_2`) using the secrets tool; you'll paste them in the secure form, they never touch source.
2. Confirm you want auto-logout at 30 min (or pick another window).
3. Confirm `capcutwaladiddy@gmail.com` is the only contact email and it appears **only** on Privacy / Copyright / DMCA pages.

Once you approve, I'll ship the migration, edge functions, frontend, and legal-page rewrites in that order.
