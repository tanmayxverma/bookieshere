# Design Decisions & Specification — Editorial Ink (Bookie Academic Journal)

**Project:** `bookieshere`  
**Date:** 2026-10-20  
**Design Lead Authority:** Stitch Project `17297096438450244819` and `.stitch/DESIGN.md`.

---

## 1. Navigation Architecture
### Desktop: Signature Floating Translucent Capsule
- **Structure:** `max-w-5xl mx-auto rounded-full border border-neutral-200/80 bg-white/95 backdrop-blur-md px-5 py-2.5 shadow-sm mt-4`
- **Brand Cluster (Left):** Circular Bookie Academic seal + bold serif `BOOKIE®` wordmark.
- **Primary Destinations (5 Max):**
  1. `Home` (`/`)
  2. `Materials` (`/materials`)
  3. `Tests` (`/tests`)
  4. `YPT` (`/ypt` with green `● LIVE` badge)
  5. `Portals` (`/portals`)
- **Secondary Destinations (Top Right & Overflow):**
  - `Community` (`/community`) & `Support` (`/support`)
  - Warm amber `Chai ☕` patronage pill (`/donate`)
  - Notification bell, dark/light theme toggle, and midnight streak telemetry pill (`0 / 🔥 0d`) linking to `/profile`.
- **Candidate Sub-bar (Directly Below Capsule):**
  `WELCOME BACK, OWNER • JEE 2027 TARGET // 12ms TCS iON CALIBRATION`

### Mobile Phones: Thumb-Driven Bottom Tab Bar with Safe-Area Insets
- **Structure:** Fixed bottom bar with `env(safe-area-inset-bottom)`, solid high-contrast ivory surface with hairline top rule (`1px solid #e2ded8`).
- **5 Primary Touch Targets (>= 44×44px):**
  1. `Home` (`/`)
  2. `Materials` (`/materials`)
  3. `Timer / YPT` (`/ypt`)
  4. `Tests` (`/tests`)
  5. `More / Profile` (Sheet drawer for Portals, Community, Support, Donate, Profile)
- **One Primary Action:** No visual clutter on mobile; persistent access to study timer and search.

---

## 2. Style, Palette & Dark Theme Derivation
### Light Mode (Ivory Parchment Canvas)
- **Base Canvas (`--desk-bg` / `surface`):** `#FBF8FC` / `#FBF9F6` (Warm archival drafting parchment)
- **Grid Pattern:** Subtle 40px coordinate drafting grid lines (`rgba(15, 23, 42, 0.03)`)
- **Card Surfaces (`surface-bright`):** `#FFFFFF` (Crisp archival sheet)
- **Recessed Containers (`surface-container-low`):** `#F6F2F7`
- **Primary Ink (`on-surface`):** `#1C1B1F` (Deep sumi drafting ink)
- **Muted Ink (`on-surface-variant`):** `#49454E` / `#64748B`
- **Hairline Borders (`outline-variant`):** `#E2DED8` (1px solid crisp drafting edge)
- **Primary Action Accent (`primary`):** `#904A43` / `#B91C1C` (Deep archival Indian ink crimson)
- **Supporting Accents:**
  - `accent-amber`: `#F59E0B` (Chai ☕ and high-focus notices)
  - `accent-green`: `#10B981` (Live study telemetry `● LIVE`)
  - `dark-streak-pill`: `#0F172A` (Candidate streak capsule)

### Dark Mode (Nocturnal Broadside / Night Shift Cockpit)
Derived deliberately as its own balanced nocturnal paper rather than a simple color inversion:
- **Base Canvas:** `#0A0E17` (Deep nocturnal drafting void)
- **Card Surface:** `#111726` (Crisp dark slate container)
- **Container Recessed / Elevated:** `#182234`
- **Primary Ink:** `#F1F5F9` (Crisp high-contrast chalk white)
- **Muted Ink:** `#94A3B8` (Cool slate secondary)
- **Hairline Borders:** `#1E293B` (1px solid boundary)
- **Primary Action Accent:** `#EF4444` / `#DC2626` (Crimson beacon)
- **Supporting Accents:**
  - `accent-amber`: `#FBBF24`
  - `accent-green`: `#34D399`

---

## 3. Typography Stack & Fluid Type Roles
All fonts are strictly self-hosted locally via Fontsource (zero Google CDN network calls, zero tracking, size-adjusted fallback).

1. **Display & Editorial Headlines:** `Newsreader` (`@fontsource/newsreader`) — weights 400, 500, 600, with italicized accents.
2. **Interface UI & Body:** `Plus Jakarta Sans` (`@fontsource/plus-jakarta-sans`) — weights 400, 500, 600, 700.
3. **Telemetry & Numerals:** `JetBrains Mono` (`@fontsource/jetbrains-mono`) — weights 500, 600, 700 with `tabular-nums`.

### Type Roles (using fluid `clamp`):
- **Display Hero (H1):** `clamp(36px, 5.5vw, 64px)`, Weight 400/500, Tracking `-0.025em`, Line-height `1.08`.
- **Section Headlines (H2):** `clamp(24px, 3.5vw, 36px)`, Weight 500, Tracking `-0.02em`, Line-height `1.15`.
- **Subheads & Lead Copy:** `clamp(15px, 1.8vw, 18px)`, Weight 400, Line-height `1.55`.
- **Category Overlines / Dossier Slugs:** `11px`, Weight 600, Monospace, Tracking `+0.08em`, Uppercase.
- **Card Titles:** `17px – 19px`, Weight 600, Line-height `1.3`.
- **Telemetry Numerals:** `JetBrains Mono`, Tabular figures.

---

## 4. Components & States
- **Cards:** Crisp white / dark slate surfaces, `rounded-2xl` or `rounded-xl`, `1px solid #e2ded8` hairline border, soft ambient elevation (`shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]`).
- **Buttons:**
  - **Primary CTA:** Deep crimson (`#b91c1c` / `#904a43`), white text, `rounded-xl` or `rounded-full`, subtle hover brightness transition.
  - **Secondary Outline:** Hairline border `border-[#e2ded8]`, background transparent or white, text dark ink.
  - **Tactile Active Press:** Instantaneous `<16ms` feedback (`transform: scale(0.98)`).
- **Tabs & Segmented Controls:** Pill-based container with smooth sliding active indicator.
- **Inputs & Search:** Hairline bordered box, `[Ctrl + K]` shortcut badge, clear focus ring (`outline: 2px solid #b91c1c`, `outline-offset: 2px`).
- **Sheets & Flyouts:** Bordered container with subtle backdrop-blur (single layer) and solid opaque fallback for `prefers-reduced-transparency`.

---

## 5. Identity Assets
- **Emblem:** Extracted from Screen 15 as clean, optimized SVG `bookie_ai_archival_mentor_emblem.svg` (deep crimson `#904A43` squircle, ivory open codex book `#FFF7ED`, gold starburst `#FBBF24`).
- **Favicon & Touch Icon:** Generated directly from the brand mark vector.

---

## 6. Route Gap-Filling Rules
Any secondary routes without explicit standalone screens in Stitch (e.g. `/test-series/:id`, `/welcome`, `/onboarding`, `/notifications`, legal pages) are implemented using:
- The exact ivory parchment canvas (`#FBF8FC`).
- The signature floating capsule header and candidate tracking sub-bar.
- The multi-tier archival footer with legal disclosure.
- Crisp hairline-bordered cards and Newsreader typography.

---

## 7. Banned Patterns & Anti-Vibe Code Guardrails
- **Banned:** No purple/blue gradient blobs, no aurora floating backdrops, no neon glow borders, no floating emoji badges, no neo-brutalist offset block shadows, no low-effort "Unlock the power of AI" copy.
- **Allowed & Required:** Subtle 40px engineering grid, crisp 1px hairline rules, soft ambient elevation, tabular monospace telemetry, and dignified academic prose.
