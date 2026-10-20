# Bookie Design System Specification — Editorial Ink (Bookie Academic Journal)

**Source Authority:** Extracted from Stitch Project `17297096438450244819` (Design System `assets/9f78641c2cea430ca400dd3af0d70928` / Screen `89012a0cfd6e40818b9eb3178d701a37`)  
**Design Lead Authority:** `frontend-design` (direction & aesthetic), `apple-design` (physics & topology only)

---

## 1. Visual Philosophy & Brand Identity
- **Personality:** Authoritative, scholarly, disciplined, uncompromisingly premium. Replaces dopamine-driven gamification, childish cartoon stickers, and neo-brutalist solid black offset shadows with archival gravity, quiet elegance, and razor-sharp typographic hierarchy.
- **Atmosphere:** Warm archival ivory parchment with faint engineering drafting grid guidelines (`40px` coordinate spacing) and crisp hairline borders (`1px solid #e2ded8`).
- **Target Audience:** Serious JEE Advanced and NEET-UG high-percentile aspirants (AIR < 500) studying 8 to 14 hours every single day.

---

## 2. Color System & Design Tokens

### Canvas & Surfaces (Light Mode)
| Token | Hex | Role / Usage |
|---|---|---|
| `surface` | `#FBF8FC` / `#FBF9F6` | Base parchment background wash |
| `surface-bright` | `#FBF8FC` | Main body card surface |
| `surface-dim` | `#DCD9DD` | Muted backgrounds and recessed containers |
| `surface-container-lowest` | `#FFFFFF` | Pure white for floating pills, modals, and focus carrels |
| `surface-container-low` | `#F6F2F7` | Subtle shaded toolbars and telemetry strips |
| `surface-container` | `#F0EDF2` | Secondary cards, table headers, inactive badges |
| `surface-container-high` | `#EAE7EC` | Card hover states and segmented controls |
| `surface-container-highest`| `#E4E1E6` | Distinct borders and divider lines |

### Primary & Typography Ink
| Token | Hex | Role / Usage |
|---|---|---|
| `primary` | `#904A43` / `#B91C1C` | Deep archival crimson / Indian ink red (primary CTAs, key accent rules) |
| `primary-container` | `#FFDAD5` | Soft red tint for active status pills and warning tags |
| `on-primary` | `#FFFFFF` | Contrast text on solid red CTA buttons |
| `on-surface` | `#1C1B1F` | Jet black / dark soot for display titles and high-emphasis body |
| `on-surface-variant` | `#49454E` | Secondary body text, subheads, and metadata |
| `outline` | `#7A757E` | Subtle iconography, secondary borders |
| `outline-variant` | `#E2DED8` | Refined hairline borders (`1px solid`) |

### Specialized Accents
| Token | Hex | Role / Usage |
|---|---|---|
| `accent-amber` | `#F59E0B` | "Chai ☕" pill border and warm warning badges |
| `accent-green` | `#10B981` | Real-time live indicators (`● LIVE`, `VERIFIED PROCTOR`) |
| `accent-blue` | `#2563EB` | Verified hyperlinks and LaTeX export tags |
| `dark-streak-pill` | `#0F172A` | Solid midnight black pill for streak telemetry (`0 / 🔥 0d`) |

### Nocturnal Broadside / Night Shift (Dark Mode)
| Token | Hex | Role / Usage |
|---|---|---|
| `surface` | `#0A0E17` | Deep nocturnal void canvas |
| `surface-container` | `#111726` | Layer 1 dark slate container |
| `surface-container-high` | `#182234` | Layer 2 elevated interactive deck |
| `on-surface` | `#F1F5F9` | High-contrast chalk white typography |
| `on-surface-variant` | `#94A3B8` | Cool slate secondary |
| `outline-variant` | `#1E293B` | Hairline structural edge |
| `primary` | `#EF4444` / `#DC2626` | Deep crimson glow accent |
| `accent-amber` | `#FBBF24` | Warm amber badge |
| `accent-green` | `#34D399` | Laser emerald timer & status |

---

## 3. Typography Stack & Fluid Hierarchy

### Font Families
- **Display & Headlines:** `Newsreader` (`@fontsource/newsreader`), Georgia, serif
- **Interface & Reading:** `Plus Jakarta Sans` (`@fontsource/plus-jakarta-sans`), -apple-system, sans-serif
- **Telemetry & Numbers:** `JetBrains Mono` (`@fontsource/jetbrains-mono`), monospace (with `font-variant-numeric: tabular-nums`)

### Fluid Type Roles (using clamp)
- **Display XL (Hero Masthead):** `clamp(36px, 5.5vw, 64px)`, Weight 400/500, Tracking `-0.025em`, Line-height `1.08`
  - *Accent Treatment:* Italicized serifs for key emphasis (`Survive the *syllabus*. Rule the ranks.`)
- **Display L (Major Sections):** `clamp(24px, 3.5vw, 36px)`, Weight 500, Tracking `-0.02em`, Line-height `1.15`
- **Subheads & Lead Copy:** `clamp(15px, 1.8vw, 18px)`, Weight 400, Line-height `1.55`
- **Category Overlines / Dossier Slugs:** `11px`, Weight 600, Monospace, Tracking `+0.08em`, Uppercase
- **Card Titles:** `17px – 19px`, Weight 600, Line-height `1.3`
- **Telemetry Numerals:** `JetBrains Mono`, Weight 700, Tabular figures
- **Micro Labels & Badges:** `11px`, Weight 600, Monospace

---

## 4. Elevation, Depth & Shadow Language

Depth is expressed through soft ambient elevation and crisp 1px hairline rules, eliminating heavy 3D neo-brutalist drop shadows:

- **Level 0 (Flat Drafting Ground):** Warm ivory parchment canvas (`#FBF8FC`) with subtle 40px engineering grid (`bg-[radial-gradient(#0F172A_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.03]`).
- **Level 1 (Docked Containers & Inputs):** 1px solid hairline `#E2DED8` with crisp white background.
- **Level 2 (Cards, Sticker Modules, Primary Panels):** 1px solid `#E2DED8` with diffuse ambient elevation (`shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]`). Dark mode: `0 4px 20px rgba(0,0,0,0.5)` with `1px border #1E293B`.
- **Level 3 (Modals, Overlays, Floating Capsules):** 1px solid `#E2DED8` with `shadow-[0_12px_36px_-6px_rgba(15,23,42,0.08)]`.
- **Interactive Press Feedback (<16ms):**
  ```css
  .tactile-btn {
    transition: transform 120ms cubic-bezier(0.25, 1, 0.5, 1), opacity 120ms ease;
  }
  .tactile-btn:active {
    transform: scale(0.98);
  }
  ```

---

## 5. Signature Structural Components

1. **Floating Navigation Capsule (Header):**
   - Translucent rounded-full pill container (`max-w-5xl mx-auto rounded-full border border-neutral-200/80 bg-white/95 backdrop-blur-md px-5 py-2.5 shadow-sm`).
   - Circular Bookie seal emblem + `BOOKIE®` wordmark.
   - Active route pill indicator (`Home`, `Materials`, `Tests`, `YPT`, `Portals`, `Community`, `Support`).
   - Amber-bordered `Chai ☕` badge, notification bell, and midnight streak telemetry badge (`0 / 🔥 0d`).
2. **Candidate Status Ticker:**
   - Under-header monospace telemetry bar (`WELCOME BACK, OWNER • JEE 2027 TARGET // 12ms TCS iON CALIBRATION`).
3. **Live Proctored Focus Carrel (Home & YPT):**
   - Elevated card with active syllabus tracker, tabular peer roster, live countdown timer, and prominent crimson CTA.
4. **Bookie AI Archival Mentor Drawer:**
   - Floating flyout in the bottom-right corner with scholarly crest (`#904A43`), deconstructive LaTeX derivations, and prompt composer.
5. **Official Multi-Tier Archival Footer:**
   - Circular Bookie mark, copyright © 2026, quick destination tags, legal compliance links, and Google OAuth compliance disclosure in monospace.
