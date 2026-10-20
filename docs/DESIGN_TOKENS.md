# Design Tokens Documentation — Bookie

**Source File:** [`src/styles/tokens.css`](file:///c:/Users/HP/Downloads/bookieshere/src/styles/tokens.css)  
**Design System:** Sticker Pop Academic Desk (with Night Shift Cockpit for Dark Mode)  
**Lead Authority:** `frontend-design` & `apple-design`

---

## 1. Color Palette

| Token | Light Theme | Dark Theme | Purpose |
|---|---|---|---|
| `--desk-bg` | `#FFFDF7` (Warm cream paper) | `#0A0E17` (Deep nocturnal void) | Primary page canvas |
| `--desk-card` | `#FFFFFF` (Pure white card) | `#111726` (Slate surface) | Primary interactive card surface |
| `--desk-subtle` | `#F5EFE6` (Recessed wash) | `#182234` (Elevated dark tray) | Recessed containers, toolbars, chips |
| `--desk-ink` | `#0F172A` (Archival ink navy) | `#F1F5F9` (Crisp off-white) | Primary typography, borders, icons |
| `--desk-ink-muted`| `#64748B` (Graphite slate) | `#94A3B8` (Cool slate) | Secondary descriptions, timestamps |
| `--desk-primary` | `#2563EB` (Electric Cobalt) | `#3B82F6` (Electric Laser Blue)| Primary action CTA, active sprint triggers |
| `--desk-secondary`| `#FBBF24` (Sunflower Yellow) | `#F59E0B` (Radiant Amber) | Sticky notes, urgent alerts, ELO/rank pills |
| `--desk-tertiary` | `#10B981` (Mint Emerald) | `#A3E635` (Acid Volt) | Solved problems, verified proctor status, timer rings |
| `--desk-destructive`| `#F43F5E` (Coral Red) | `#FB7185` (Soft Crimson) | Negative-marking warnings, penalty alerts |
| `--desk-border` | `#0F172A` (2px solid ink) | `#1E293B` (Hairline slate) | Structural card & component boundaries |

---

## 2. Typography Hierarchy (Fluid Clamps)

All visible brand typography uses self-hosted open fonts from `@fontsource`:

- **Headline/Display Font:** `Bricolage Grotesque` (Weights: 600, 700, 800)
- **Body/Content Font:** `Space Grotesk` (Weights: 400, 500, 700)
- **Telemetry & Numbers:** `JetBrains Mono` (Weights: 500, 700, with `font-variant-numeric: tabular-nums`)

| Role | Class | Specs | Tracking | Usage |
|---|---|---|---|---|
| Display XL | `.text-display-xl` | `clamp(36px, 6vw, 68px)` / `1.04` / 800 | `-0.03em` | Hero page mastheads |
| Display L | `.text-display-l` | `clamp(28px, 4.5vw, 44px)` / `1.1` / 700 | `-0.025em`| Section headers |
| Title 1 | `.text-title-1` | `clamp(22px, 3.2vw, 32px)` / `1.2` / 700 | `-0.02em` | Module & card block titles |
| Title 2 | `.text-title-2` | `20px` / `1.25` / 700 | `-0.015em`| Chapter names, test titles |
| Headline | `.text-headline` | `17px` / `1.35` / 600 | `-0.01em` | Subsection leads, table headers |
| Body | `.text-body` | `15px` / `1.5` / 400 | `0em` | Explanations, problem stems |
| Callout | `.text-callout` | `13px` / `1.4` / 500 | `0em` | Microcopy, user stats |
| Caption | `.text-caption` | `11px` / `1.3` / 600 | `+0.06em` | Monospace metadata, tags |
| Telemetry | `.font-tabular` | `tabular-nums` | `inherit` | Stopwatches, timers, scores, rankings |

---

## 3. Tactile 3D Depth & Elevation Tokens

- **Light Mode Elevation:**
  - Level 1: `box-shadow: 2px 2px 0px #0F172A`
  - Level 2: `box-shadow: 4px 4px 0px #0F172A`
  - Level 3: `box-shadow: 8px 8px 0px #0F172A`
  - Active Press: `transform: translate(3px, 3px); box-shadow: 1px 1px 0px #0F172A;`
- **Dark Mode Elevation:**
  - Ambient occlusion: `0 8px 24px rgba(0, 0, 0, 0.5)` with hairline border `#1E293B`.

---

## 4. Spacing & Touch Targets
- **Base Grid:** 8px rhythm (4px micro).
- **Touch Targets:** Minimum `44×44px` height on all buttons, triggers, and tab items.
- **Container Max-Width:** `1200px` (`--desk-container-max`).
