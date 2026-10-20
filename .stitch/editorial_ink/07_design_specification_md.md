# Design System: Editorial Ink (Bookie Academic Journal)

## 1. Visual Philosophy & Brand Identity
- **Personality:** Authoritative, scholarly, disciplined, uncompromisingly premium. Replaces dopamine-driven gamification and playful stickers with archival gravity, quiet elegance, and razor-sharp typographic hierarchy.
- **Atmosphere:** Warm archival ivory parchment with faint engineering drafting grid guidelines (`40px` coordinate spacing) and crisp hairline borders.
- **Target Audience:** Serious JEE Advanced and NEET-UG high-percentile aspirants (AIR < 500).

---

## 2. Color Palette & Tokens

### Canvas & Surfaces
| Token | Hex | Role / Usage |
|---|---|---|
| `surface` | `#fbf8fc` / `#fbf9f6` | Base parchment background wash |
| `surface-bright` | `#fbf8fc` | Main body card surface |
| `surface-dim` | `#dcd9dd` | Muted backgrounds and recessed containers |
| `surface-container-lowest` | `#ffffff` | Pure white for floating pills, modals, and focus carrels |
| `surface-container-low` | `#f6f2f7` | Subtle shaded toolbars and telemetry strips |
| `surface-container` | `#f0edf2` | Secondary cards, table headers, inactive badges |
| `surface-container-high` | `#eae7ec` | Card hover states and segmented controls |
| `surface-container-highest` | `#e4e1e6` | Distinct borders and divider lines |

### Primary & Accents
| Token | Hex | Role / Usage |
|---|---|---|
| `primary` | `#904a43` / `#b91c1c` | Deep archival crimson / Indian ink red (primary CTAs, key accent rules) |
| `primary-container` | `#ffdad5` | Soft red tint for active status pills and warning tags |
| `on-primary` | `#ffffff` | Contrast text on solid red CTA buttons |
| `on-surface` | `#1c1b1f` | Jet black / dark soot for display titles and high-emphasis body |
| `on-surface-variant` | `#49454e` | Secondary body text, subheads, and metadata |
| `outline` | `#7a757e` | Subtle iconography, secondary borders |
| `outline-variant` | `#e2ded8` | Refined hairline borders (`1px solid`) |

### Specialized Accents
| Token | Hex | Role / Usage |
|---|---|---|
| `accent-amber` | `#f59e0b` | "Chai ☕" pill border and warm warning badges |
| `accent-green` | `#10b981` | Real-time live indicators (`● LIVE`, `VERIFIED PROCTOR`) |
| `accent-blue` | `#2563eb` | Verified hyperlinks and LaTeX export tags |
| `dark-streak-pill` | `#0f172a` | Solid midnight black pill for streak telemetry (`0 / 🔥 0d`) |

---

## 3. Typography Hierarchy

### Font Families
- **Editorial Serif:** `Newsreader`, `EB Garamond`, or `Merriweather` (Display headlines, italics, and philosophical covenants)
- **Interface Sans:** `Plus Jakarta Sans`, `Inter`, or `Space Grotesk` (Labels, navigation, carrel controls, buttons)
- **Telemetry Monospace:** `JetBrains Mono` or `Fira Code` (Timers, candidate IDs, coordinates, negative-marking penalty tags, latency)

### Type Scale
- **Display Hero (H1):** `font-serif text-5xl md:text-6xl font-normal tracking-tight text-neutral-900 leading-[1.1]`
  - *Accent Treatment:* Italicized serifs for key emphasis (`Survive the *syllabus*. Rule the ranks.`)
- **Section Headlines (H2):** `font-serif text-2xl md:text-3xl font-medium tracking-tight text-neutral-900`
- **Subheads & Lead Copy:** `font-sans text-base md:text-lg text-neutral-600 font-normal leading-relaxed max-w-2xl`
- **Category Overlines / Dossier Slugs:** `font-mono text-xs uppercase tracking-wider font-semibold text-red-700`
- **Card Titles:** `font-sans font-semibold text-lg text-neutral-900`
- **Telemetry / Timers:** `font-mono text-3xl md:text-4xl font-bold tracking-tight text-neutral-950`
- **Micro Labels & Badges:** `font-mono text-[11px] uppercase tracking-wider font-semibold`

---

## 4. Layout & Spacing Architecture

- **Page Max Width:** `max-w-7xl` (`1280px`), centered with `mx-auto`.
- **Horizontal Margins:** `px-4 sm:px-6 lg:px-8`.
- **Section Spacing:** `py-12 md:py-16` between major content blocks.
- **Card Geometry:**
  - Roundness: `rounded-2xl` for floating hero capsules and parent carrel frames; `rounded-xl` for inner cards and matrices.
  - Border: Crisp hairline `border border-[#e2ded8]`.
  - Shadows: Soft, diffuse ambient elevation (`shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]`), eliminating harsh neo-brutalist solid drop shadows.

---

## 5. Signature Components

### A. Floating Navigation Capsule (Header)
- **Container:** Floating translucent pill `max-w-5xl mx-auto rounded-full border border-neutral-200/80 bg-white/95 backdrop-blur-md px-5 py-2.5 shadow-sm`.
- **Brand Group:** Circular academic book emblem + bold serif/sans wordmark `BOOKIE®`.
- **Navigation Links:** Pills with active states (`Home` in soft gray pill, `Materials`, `Tests`, `YPT` with green `LIVE` dot, `Portals`, `Community`, `Support`).
- **Right Utilities:** Warm amber-bordered `Chai ☕` button, notification bell, theme toggle, and dark circular `0 / 🔥 0d` streak badge.
- **Sub-header Bar:** Monospace tracking strip (`WELCOME BACK, OWNER • JEE 2027 TARGET // 12ms TCS iON CALIBRATION`).

### B. Live Proctored Study Carrel (Hero Right Card)
- Real-time countdown timer block (`02:47:11`) with active subject syllabus tag (*Rigid Body Dynamics: Variable Mass Systems*).
- Tabular roster of concurrent candidates (`#1092 [IITB EE]`, `#0421 [AIIMS D]`, `#8819 [IITD CS]`).
- Primary Crimson CTA: `Join Live Silent Carrel (Desk #85)` with verified webcam protocol guarantee.

### C. Archival High-Yield Ledger & Trap Frequency Matrix
- Dense, tabular data presentation for high-weightage topics (*Rotational Dynamics*, *Definite Integrals*, *Coordination Complexes*).
- Explicit negative-marking trap frequency tags (`-2 penalty: 38.2%`) paired with deconstructed faculty proofs.

### D. Official Multi-Tier Footer
- **Top Row:** Circular Bookie seal + copyright (`© 2026 | Engineered for Ambitious Aspirants`).
- **Quick Links:** `PRACTICE • PROGRESS • PERFORM • CHAI ☕ • DMCA • 🟢 AIR TARGET 2027`.
- **Legal Compliance:** Underlined links (`Terms of Service`, `Privacy Policy`, `DMCA & Copyright`, `Support Desk`).
- **Monospace Notice:** Official Google OAuth data privacy compliance and zero-monetization disclosure.