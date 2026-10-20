# Bookie Design System Specification — Sticker Pop Academic Desk

**Source Authority:** Extracted from Stitch Project `17297096438450244819` (Design System `assets/5e37b0063d1d4d3a89a9baca55578172` and `assets/1b7939dec24f4096bfe54cbcba7b83dc`)  
**Design Lead:** `frontend-design` (direction & aesthetic), `apple-design` (physics & topology)

---

## 1. Core Brand Metaphor: The Academic Drafting Desk
Bookie combines high-precision engineering drafting instruments (blueprints, hairline grids, tabular figures, coordinate axes) with the raw, high-dopamine culture of a dedicated student desk (tilted sticky notes, washi tape tabs, tactile 3D punch buttons, highlighters).

---

## 2. Color System

### Light Mode (Stationery Paper Canvas)
- **Base Canvas (`--desk-bg`):** `#FFFDF7` (Warm cream architectural paper)
- **Card Surface (`--desk-card`):** `#FFFFFF` (Crisp drafting slip)
- **Container Recessed (`--desk-subtle`):** `#F4EFE6` (Warm stationery wash)
- **Ink Navy Primary (`--desk-ink`):** `#0F172A` (Rich archival drafting ink for borders, headings, and outlines)
- **Ink Navy Muted (`--desk-ink-muted`):** `#64748B` (Secondary descriptions, metadata)
- **Electric Cobalt Accent (`--desk-primary`):** `#2563EB` (Primary action engine, study streaks, active tabs)
- **Sunflower Yellow Pop (`--desk-secondary`):** `#FBBF24` (High-focus sticky notes, urgent PYQ alerts, key highlights)
- **Mint Emerald (`--desk-tertiary`):** `#10B981` (Mastery markers, solved problem checkmarks, live room badges)
- **Coral Punch Alert (`--desk-destructive`):** `#F43F5E` (Negative marking traps, countdown urgency)
- **Structural Border (`--desk-border`):** `#0F172A` (2px solid architectural boundary)

### Dark Mode (Night Shift Cockpit)
- **Base Canvas:** `#0A0E17` (Deep nocturnal void, OLED black)
- **Card Surface:** `#111726` (Layer 1 dark slate container)
- **Container Elevated:** `#182234` (Layer 2 elevated interactive deck)
- **Ink Primary:** `#F1F5F9` (High-contrast crisp white typography)
- **Ink Muted:** `#64748B` (Cool slate secondary)
- **Acid Volt Accent:** `#A3E635` / `#84CC16` (Laser timer display, active study focus)
- **Atmospheric Cyan:** `#38BDF8` (Formula reference pills, active test telemetry)
- **Structural Border:** `#1E293B` (1px/2px hairline structural edge)

---

## 3. Typography Stack & Fluid Hierarchy

### Font Families
- **Display & Headlines:** `Bricolage Grotesque`, -apple-system, sans-serif
- **Body & Reading:** `Space Grotesk`, -apple-system, sans-serif
- **Telemetry & Numbers:** `JetBrains Mono`, monospace (with `font-variant-numeric: tabular-nums`)

### Fluid Type Roles (using clamp)
- **Display XL (Hero Masthead):** `clamp(36px, 6vw, 68px)`, Weight 800, Tracking `-0.03em`, Line-height `1.04`
- **Display L (Major Sections):** `clamp(28px, 4.5vw, 44px)`, Weight 700, Tracking `-0.025em`, Line-height `1.1`
- **Title 1 (Module Headers):** `clamp(22px, 3.2vw, 32px)`, Weight 700, Tracking `-0.02em`, Line-height `1.2`
- **Title 2 (Card Titles):** `20px`, Weight 700, Tracking `-0.015em`, Line-height `1.25`
- **Headline (Subheads):** `17px`, Weight 600, Tracking `-0.01em`, Line-height `1.35`
- **Body (Content & Explanations):** `15px`, Weight 400/500, Tracking `0em`, Line-height `1.5`
- **Callout / Microcopy:** `13px`, Weight 500, Line-height `1.4`
- **Caption / Metadata:** `11px`, Weight 600, Line-height `1.3`, Tracking `+0.04em`
- **Telemetry Numerals (Timer, Stats, Ranks):** `JetBrains Mono`, Weight 700, `font-variant-numeric: tabular-nums`

---

## 4. Tactile Elevation & 3D Shadow Physics

Depth is expressed through physical ink projection and diagonal button translation:

- **Level 0 (Flat Drafting Ground):** Flat paper surfaces with subtle 16px dot or graph grid (`bg-[radial-gradient(#0F172A_1px,transparent_1px)] [background-size:16px_16px] [background-position:0_0] opacity-[0.035]`).
- **Level 1 (Docked Containers & Inputs):** 2px solid `#0F172A` with `box-shadow: 2px 2px 0px #0F172A`.
- **Level 2 (Cards, Sticker Modules, Primary Buttons):** 2px or 2.5px solid `#0F172A` with `box-shadow: 4px 4px 0px #0F172A` (dark mode: `0 4px 20px rgba(0,0,0,0.5)` with 1px border `#1E293B`).
- **Level 3 (Modals, Overlays, Floating Stickers):** 3px solid `#0F172A` with `box-shadow: 8px 8px 0px #0F172A`.
- **Physical Press Feedback:**
  ```css
  .tactile-btn {
    box-shadow: 4px 4px 0px #0F172A;
    transition: transform 100ms ease-out, box-shadow 100ms ease-out;
  }
  .tactile-btn:active {
    transform: translate(3px, 3px);
    box-shadow: 1px 1px 0px #0F172A;
  }
  ```

---

## 5. Distinctive Artifacts & Details

1. **Tilted Sticky Notes:** Callouts and student self-talk rendered in `#FEF9C3` (sunflower pale) with `-1.5deg` or `+2deg` tilt, 2px `#0F172A` outline, and `3px 3px 0px #0F172A` shadow.
2. **Washi Tape Clips:** Flat rectangular category markers anchored across the top card seam (`rgba(251, 191, 36, 0.9)` or `#A7F3D0`), displaying chapter weightage or telemetry status.
3. **Verified Proctor Stamp:** High-contrast pill badge with monospace checkmark (`[✓ VERIFIED PROCTOR]`).
4. **Zero Vibe-Coded Clutter:** No purple gradients, no floating circular icons, no rainbow glow borders, no fake AI statistics.
