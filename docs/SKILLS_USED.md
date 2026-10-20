# Design Skills Applied & Boundary Rules

**Project:** `bookieshere`  
**Design Authority:** Editorial Ink (Bookie Academic Journal) — from Stitch Project `17297096438450244819` and `.stitch/DESIGN.md`.

This document tracks how each skill in `.agents/skills/` is leveraged, which principles are applied, and which rules are explicitly rejected in accordance with repository instructions and the brief.

---

## 1. `frontend-design`
### Rules to Apply:
- **Ground design in real student reality:** Bookie is an intensive study cockpit for high-percentile JEE Advanced and NEET aspirants studying 8–14 hours daily. Ground all copy, cards, and data in real academic artifacts (Irodov, HC Verma, Kota test series, NTA CBT calibrations).
- **Restraint and Quiet Surfaces:** Spend visual boldness in exactly one place per view (e.g., the live focus countdown carrel or the leaderboard podium). Keep the surrounding layout quiet, disciplined, and free of decorative noise.
- **Intentional, Non-Generic Layouts:** Avoid identical repetitive card grids; introduce asymmetric hierarchy, split-screen momentum, and dense tabular registers.
- **Copy Discipline:** Eliminate cliché edtech filler ("Unlock your potential!", "Master your journey!"). Replace with authentic student microcopy: "Survive the syllabus. Rule the ranks.", "12ms TCS iON Calibration", "Strict Curation Guarantee: Verified KaTeX & OCR".

### Rules NOT to Take:
- Do not invent an arbitrary new palette or random layout concepts. Stitch's `Design.md` and the 15 downloaded screens define the visual authority.

---

## 2. `ui-ux-pro-max`
### Rules to Apply:
- **WCAG AA Accessibility Floor:** Contrast ratio >= 4.5:1 for normal text and >= 3:1 for large text across both light and dark themes.
- **Touch Target Floor:** All interactive buttons, chips, and table triggers must satisfy a minimum 44×44px hit area.
- **Keyboard Navigation & Visible Focus:** 2px solid high-contrast focus rings with `outline-offset: 2px` on all interactive elements.
- **Hierarchy & Semantic Landmarks:** Single `<h1>` per view, proper `<nav>`, `<main>`, `<aside>`, and `<footer>` semantics.

### Rules NOT to Take:
- Do not override the Stitch Editorial Ink color tokens or typography with generic Tailwind / UI-UX Pro Max presets. Stitch's `Design.md` is the final authority for visual tokens.

---

## 3. `apple-design`
### Rules to Apply:
- **Structural Topology Only:**
  - One primary action per view (e.g. "START PHYSICS SESSION" on the study timer; "Join Live Silent Carrel" on home).
  - Clear visual navigation model: Desktop uses the floating translucent capsule top bar; mobile phones use a thumb-accessible bottom tab bar with safe-area insets (`env(safe-area-inset-bottom)`).
  - Secondary drill-downs and complex flows use sheets or modal flyouts (like the Bookie AI Archival Mentor Drawer).
- **Physical Dynamics & Springs:**
  - Critically damped springs (`damping: 1.0`, `response: 0.35s`) for UI transitions.
  - Interactive press feedback: instantaneous (<16ms) reaction on pointerdown with slight scale (`scale(0.98)`).
  - Interruptible animations: transitions must animate from current presentation value.
  - Zero layout thrashing: animate composite-only properties (`transform` and `opacity`).
- **Accessibility & Motion Preferences:**
  - Full support for `prefers-reduced-motion: reduce`: swap motion for instant opacity cross-fades.
  - Support `prefers-reduced-transparency: reduce` by replacing blurred backdrops with solid opaque backgrounds.

### Rules NOT to Take:
- **NEVER adopt Apple visual styling:** Do NOT use frosted glass cards, iOS San Francisco system fonts, pastel iOS colors, or sterile gray minimalism.

---

## 4. `animate`, `animation-vocabulary`, `find-animation-opportunities`
### Rules to Apply:
- **Signature Interaction per Key Page:**
  - **Home:** Smooth live countdown ticker & subtle status pulse in the focus carrel.
  - **Timer:** Elegant SVG progress ring with precision circular track tick indicators.
  - **Leaderboard:** Smooth layout reordering for rank shifts.
  - **Mentor AI Drawer:** Smooth spring slide-up and docked flyout presentation.
- **Restraint:** Only animate when it clarifies state change or communicates momentum. Zero bouncy, cartoonish, or distracting animations.

### Rules NOT to Take:
- No continuous looping decorative background animations, rotating shapes, or pulsing ambient glows.

---

## 5. `gsap-core`, `gsap-react`, `gsap-performance`
### Rules to Apply:
- Reserved for complex scroll-pinned storytelling or multi-stage choreography on the master homepage where CSS transitions or IntersectionObserver are insufficient.
- Use `useGSAP` with scoped refs and strict unmount cleanup (`gsap.context()`).
- Always respect `prefers-reduced-motion` in GSAP matchMedia.

### Rules NOT to Take:
- Do not import heavy GSAP plugins (ScrollSmoother, Inertia, etc.) that inflate bundle size unnecessarily. CSS transitions and standard React hooks handle standard interactive states.

---

## 6. Codebase Review Skills (`improve-animations`, `animation-performance`, `break-ui`, `web-design-guidelines`)
### Rules to Apply:
- **Static Code Auditing:** Used during Part 6 to inspect for composite-only animations, layout shifts, unhandled edge cases (long candidate names, empty study sessions, zero scores), and WCAG contrast violations.
- Verify zero network requests are added for fonts or external CDNs.

---

## 7. Excluded Skills
- **`animate-expo`:** Excluded (Web application, not React Native / Expo).
- **`mobile-native`:** Excluded per prompt instructions (web responsive styling with safe-area insets is handled natively via Tailwind and CSS).
- **`pick-ui-library`:** Excluded (Radix UI primitives and Tailwind CSS already in repository; no new UI libraries needed).
