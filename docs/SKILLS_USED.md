# Skills Used for Distinctive Premium Redesign

This document records the exact role, rules applied, and boundaries for each loaded design skill. The goal is a distinctive, premium, slightly funky product identity with Apple-grade interaction physics and structural topology, completely free from generic AI/vibe-coded clichés or neutral Apple visual clones.

---

### 1. frontend-design (LEAD — Aesthetic Direction & Visual Character)
- **Rules applied:**
  1. Commit to a bold, specific aesthetic direction grounded directly in the student/aspirant subject matter before writing code.
  2. Banish AI tropes: zero Claude cream-and-terracotta palettes, zero identical 3-card rows, zero tracked-out all-caps label spam, zero decorative 01/02/03 markers unless genuine sequences.
  3. Spend boldness in one primary visual device per screen (dramatic font personality, tangible stickers/chips, or distinctive high-contrast rules), keeping all surrounding containers quiet and readable.
- **Will NOT take:** Generic minimalist templates, unmotivated decoration, or hesitation to take an opinionated aesthetic stance.

### 2. ui-ux-pro-max (INTELLIGENCE — Options, Spacing & Accessibility Floor)
- **Rules applied:**
  1. Strict accessibility baseline: WCAG AA contrast (≥4.5:1 text, ≥3:1 UI), visible high-contrast focus rings, no raw hex values in components.
  2. Touch & layout constraints: minimum 44×44px touch targets with ≥8px spacing, mobile-first responsive boundaries with zero horizontal overflow.
  3. Leverage structured design-system data (palettes, font-pairings, UX guidelines) to propose and benchmark options, with all final design decisions justified in writing.
- **Will NOT take:** Unfiltered generic styles, emoji icons, or rigid automated styles that override custom brand identity.

### 3. apple-design (TOPOLOGY & INTERACTION PHYSICS ONLY)
- **Rules applied:**
  1. Topology & Hierarchy: one primary action per view, clear visual hierarchy, progressive disclosure, bottom tab bar on mobile phones for main destinations, sheets for secondary tasks.
  2. Physical Dynamics: instant response on `pointerdown` (<16ms), critically damped springs (`damping: 1.0`, `response: 0.35s`), press feedback (`scale(0.97)` over 100ms), and 1:1 direct gesture tracking.
  3. Spatial consistency: elements enter and exit along symmetric paths, anchored to trigger origins, and fully interruptible mid-flight.
- **Will NOT take:** Apple's visual style (no SF Pro / Inter look, no neutral-gray-and-blue palette, no frosted-glass-everything).

### 4. emil-design-eng (POLISH — Component Craft & Invisible Details)
- **Rules applied:**
  1. Optical alignment, tabular figures (`font-variant-numeric: tabular-nums`) for timers/scores, and origin-aware scaling.
  2. Hover states strictly gated behind `@media (hover: hover) and (pointer: fine)`.
  3. Meaningful tactile feedback for every discrete interactive state (default, hover, active, focus, disabled, loading).
- **Will NOT take:** Fluffy decorative effects or visual noise that distracts from functional clarity.

### 5. animation-vocabulary, find-animation-opportunities, animate (MOTION TAXONOMY, FILTER & BUILD)
- **Rules applied:**
  1. Run the build sequence in strict order: frequency check (never animate 100+/day keyboard actions) -> purpose classification (feedback, spatial consistency, state indication) -> spring configuration.
  2. Composite-only property animation (`transform` and `opacity` only); never animate layout properties (`width`, `height`, `top`, `left`).
  3. Integrated accessibility: `prefers-reduced-motion` graceful fallbacks (instant state cross-fades) shipped directly with every motion declaration.
- **Will NOT take:** Vague motion concepts, uncalibrated cubic-bezier easings, or decorative animation loops competing for user attention.

### 6. gsap-core, gsap-react, gsap-plugins, gsap-performance (SCROLL STORYTELLING & FLIP)
- **Rules applied:**
  1. Pinned/sticky storytelling and masked text reveals limited strictly to 1–2 hero moments on the home page.
  2. Animated layout shifts (FLIP) for reordering dynamic lists (e.g. real-time leaderboard transitions).
  3. React-safe lifecycle scoping (`useGSAP` or cleanup routines) and GPU layer restraint.
- **Will NOT take:** Layout thrashing, elastic/bouncy easings, or JavaScript-driven animations for standard CSS interactions.

### 7. improve-animations, review-animations, animation-performance, break-ui, web-design-guidelines (AUDIT GATES)
- **Rules applied:**
  1. Frame-budget enforcement: verify 60fps/120fps smooth performance on mid-range mobile devices.
  2. Stress test against edge cases: extreme user names, empty states, slow networks, and 320px screen widths.
  3. Static code review against web design guidelines (semantic HTML hierarchy, alt attributes, button labels).
- **Will NOT take:** "Works on my high-end workstation" assumptions or unmeasured blur stacking.

### 8. pick-ui-library (DEPENDENCY MINIMALISM)
- **Rules applied:**
  1. Zero frivolous dependencies: reuse and maximize existing packages (`lucide-react`, `sonner`, `@tanstack/react-query`, `date-fns`, `recharts`, `vaul`, `canvas-confetti`).
  2. Carefully evaluate any new library against Fontsource self-hosted open fonts and performance constraints.
  3. Restyle existing UI primitives from the ground up to reflect the unique brand identity.
- **Will NOT take:** Redundant heavy UI frameworks or styling suites.

---
*Note: `animate-expo` and `mobile-native` are explicitly excluded from this web project.*
