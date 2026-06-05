## Goal

Replace the current admin-only `/auth` page with a full **Welcome → Login → Onboarding → Profile** system that personalizes Bookie for every user (guest, Google, or email) while reusing the existing YPT identity so the user is never asked their name twice.

## What gets built

### 1. Welcome / Auth screen (`/welcome`)
- Premium black-and-white card matching site language.
- Three CTAs:
  - **Continue as Guest** — instant entry, falls straight into onboarding (name + target + optional avatar upload).
  - **Continue with Google** — uses Lovable Cloud managed Google OAuth (`lovable.auth.signInWithOAuth("google")`), auto-pulls display name + Google profile picture.
  - **Continue with Email** — email/password sign in & sign up tabs, with "Forgot password" → email reset to `/reset-password`.
- Footer link: "Skip for now" (guest).

### 2. Onboarding flow (`/onboarding`)
- Step 1: name (skipped if Google or guest-name already set).
- Step 2: target year (chips): JEE 2027 / 2028 / 2029 / 2030+ / Droppers / Seniors / Early Starters / Other.
- Step 3 (optional): upload avatar.
- Writes to a single `profiles` row, then redirects home.

### 3. Profile hub (`/profile`)
- Displays avatar, name, target, account type (Guest / Google / Email), join date.
- Actions: edit name (uses existing 60-day cooldown rule from `ypt_users`), change target, upload/replace/remove avatar, sign out, "Upgrade Guest → Account".
- Future-ready sections (stubbed sub-cards): Bookmarks, Recent activity, Study stats (pulled from existing YPT data).

### 4. Personalization across the site
- New `useProfile()` hook = single source of truth (name, avatar, target).
- Navbar adds avatar + name dropdown (replaces current "Admin" link for non-admins).
- Homepage hero greets user: "Welcome back, {name}".
- YPT onboarding (`YPTOnboarding`) becomes a no-op when a profile already exists — name flows in automatically. Existing `ypt_users` row is created/synced from the profile so leaderboards keep working.

## Data model

New `public.profiles` table (one row per identity, keyed by either `auth.uid()` or device id):

| column | purpose |
|---|---|
| id (uuid pk) | primary key |
| user_id (uuid, nullable, fk auth.users) | set for Google/Email |
| device_id (text, nullable, unique) | set for Guest |
| account_type (text: guest / google / email) | |
| display_name (text) | |
| avatar_url (text, nullable) | Google URL or storage URL |
| target_category (text) | JEE 2027 … Other |
| onboarded_at (timestamptz) | |
| created_at / updated_at | |

RLS:
- Authenticated users can read/update only their own row (`auth.uid() = user_id`).
- Guests read/update via `device_id` match using a security-definer RPC `get_or_create_guest_profile(device_id)`; direct anon access is locked down.
- `service_role` full access.
- Plus standard `update_updated_at_column` trigger.

`avatars` public storage bucket for uploaded profile pictures; per-user folder + RLS on `storage.objects` so each user can only write `auth.uid()/...` (guests upload via signed paths using device id).

Trigger `handle_new_user` on `auth.users` insert auto-creates a profile row carrying Google `raw_user_meta_data.full_name` / `avatar_url` when present.

## Auth provider work

- Call `supabase--configure_social_auth` with `providers: ["google"]` (keeps email enabled). Lovable Cloud managed Google credentials — no user secrets needed.
- Keep current email/password flow but move it to the new welcome screen.
- Add `/reset-password` page (required for password reset to work).

## Routing & gating

- `/welcome` shown automatically on first visit when no profile exists (guest or auth). Once a profile exists, the app loads normally — guest mode never forces login.
- `/profile` and `/onboarding` are new routes.
- `/auth` redirects to `/welcome`.
- `/admin` still gated by `has_role('admin')`.

## Files

**New**
- `supabase/migrations/...` — `profiles` table + grants + RLS + trigger + `avatars` bucket RLS.
- `src/hooks/useProfile.ts`
- `src/pages/Welcome.tsx`
- `src/pages/Onboarding.tsx`
- `src/pages/Profile.tsx`
- `src/pages/ResetPassword.tsx`
- `src/components/Profile/AvatarUploader.tsx`
- `src/components/Profile/TargetPicker.tsx`
- `src/components/Profile/UserMenu.tsx` (navbar dropdown)

**Edited**
- `src/App.tsx` (routes + first-visit redirect)
- `src/components/Navbar.tsx` (UserMenu)
- `src/pages/Auth.tsx` (redirect to /welcome, or repurpose as email-only fallback)
- `src/hooks/useAuth.ts` (add `signInWithGoogle`, `resetPassword`)
- `src/components/YPT/YPTOnboarding.tsx` + `src/hooks/useYPTUser.ts` (hydrate from profile, skip name prompt)
- `src/pages/Index.tsx` (personalized greeting)
- `supabase/storage` — create `avatars` bucket (public).

## Technical notes

- Auth listener pattern preserved (`onAuthStateChange` + `getSession`).
- All profile reads use `getUser()` for trust-sensitive checks.
- Avatar uploads validated client-side (≤2 MB, image/* only) and server-side via storage RLS.
- Zod schemas for name (2–24 chars), target enum, password (≥8).
- Guests can later "upgrade" — when an authed session appears with a matching device id, the guest profile is migrated (device_id → user_id) by an RPC.
- All UI uses existing design tokens; no new colors. No purple/violet. Liquid-glass surfaces.
