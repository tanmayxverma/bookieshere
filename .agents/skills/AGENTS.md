# AGENTS.md — Main Plan & Design Constitution

This file is the master plan for this project. Read it fully before any UI, design, or animation work. If anything here conflicts with a skill, **this file wins**.

---

## 1. The One Rule

**The whole site is designed the Apple way. `apple-design` is the lead skill.**

Every other skill is a *specialist that serves apple-design*. No skill is allowed to change the visual or motion identity of the site. Other skills may improve *how well* we build it, never *what it looks and feels like*.

The target feeling: calm, precise, physical, responsive. Restraint over decoration. Motion that follows the user's finger and can be interrupted at any moment.

---

## 2. Priority Order (highest wins)

1. **AGENTS.md** (this file)
2. **apple-design**: look, feel, motion model, typography, materials, accessibility
3. **emil-design-eng** (if installed): polish details, component craft
4. **frontend-design**: structure and process only (see rules below)
5. **ui-ux-pro-max**: UX rules, accessibility, layout checks (see rules below)
6. **GSAP skills, animation skills**: implementation tools
7. **web-design-guidelines**: final audit
8. Everything else: only when its trigger applies

If two skills disagree, take the higher one. Do not blend them into a compromise.

---

## 3. Apple Design Core Numbers (from the apple-design guide)

Use these as defaults unless apple-design's `SKILL.md` says otherwise.

| Thing | Value |
|---|---|
| Press feedback | `scale(0.97)`, ~100ms, fires on touch-down, never on release |
| Default spring | damping 1.0, response 0.3 to 0.4 |
| Move / reposition spring | damping 1.0, response 0.4 |
| Drawer / sheet spring | damping 0.8, response 0.3 |
| After a flick | damping about 0.8 (a small bounce is allowed only after a flick) |
| Drag start threshold | about 10px, then move 1:1 and keep the grab point |
| Past an edge | rubber-band, constant 0.55 |
| Flick landing | momentum projection, deceleration 0.998 |
| Glass | `backdrop-filter: blur(20px) saturate(180%)`, one translucent layer only |
| Big headlines | `letter-spacing: -0.02em`, tighter as size grows, line-height adjusted per size |
| Animate only | `transform` and `opacity` |
| Reduce Motion | slides become short cross-fades |

### Non-negotiables
- **Interruptible beats smooth.** Every animation can turn around mid-flight from its current position and velocity. No jumps, no restarts.
- **Springs, not fixed curves.** No `ease-in-out` with fixed durations for interactive motion.
- **Things leave the way they came in** (spatial consistency).
- **No glass on glass.** Never light glass on a light surface.
- **Motion, sound and haptics only when they matter.**
- **Accessibility is built in from the start:** `prefers-reduced-motion`, `prefers-reduced-transparency`, `prefers-contrast`.

---

## 4. The Skills: What Each One Does and How to Use It

### 4.1 apple-design (LEAD)
**Job:** The design language of the whole site: press states, direct manipulation, springs, velocity handoff, momentum, rubber-banding, glass and depth, optical typography, reduced motion, and the eight WWDC principles (Purpose, Agency, Responsibility, Familiarity, Flexibility, Simplicity, Craft, Delight).
**Use it:** On every single UI task, first and always. Decide with it before using any other skill.

### 4.2 frontend-design (structure only)
**Job:** Makes the agent commit to a clear design direction before coding, with intentional type, color and layout, and avoids generic AI-looking pages.
**Rule:** The committed direction is already decided: **Apple**. Use this skill only for its *process* (think about purpose, audience and hierarchy first, avoid cliche layouts like "centered hero + three cards + footer"). Do **not** let it choose brutalist, maximalist, retro, or any other aesthetic.

### 4.3 ui-ux-pro-max (rules and checks only)
**Job:** A searchable database of UX guidelines, palettes, font pairings, chart types and stack-specific advice.
**Rule:** Use it for UX rules, accessibility, spacing and layout sanity, and chart choices. Do **not** let it pick a visual style, palette, or font pairing that conflicts with Apple. If it suggests a style, translate the *reason* into Apple terms or discard it. Palettes stay neutral, high-contrast, and restrained, with one accent.

### 4.4 animate
**Job:** Writing animation and motion code.
**Rule:** Allowed only in the apple-design motion model: springs, interruptible, transform/opacity only. Never fixed `ease-in-out` for interaction.

### 4.5 animation-vocabulary
**Job:** Turns vague motion descriptions ("make it feel smooth and floaty") into precise terms.
**Use it:** At the start of any motion request, to define exactly what is wanted, then implement it with apple-design values.

### 4.6 find-animation-opportunities
**Job:** Scans the project for places where motion would help.
**Use it:** During the planning phase. Output is a ranked list. Do not add motion that isn't justified by purpose (restraint first).

### 4.7 improve-animations
**Job:** Audits existing motion code and produces a prioritized fix plan.
**Use it:** After the first build, and after every major feature. Fix in order of priority.

### 4.8 animation-performance
**Job:** Keeps animations smooth (frame rate, layout thrash, GPU-friendly properties).
**Rule:** Consistent with apple-design's "animate only transform and opacity." Run it on any heavy or scroll-linked motion.

### 4.9 gsap-core, gsap-performance, gsap-plugins, gsap-react
**Job:** GSAP as an engine for scroll choreography, timelines, and React integration.
**Rule:**
- Use GSAP only where CSS and spring logic are not enough (scroll-driven sequences, complex timelines).
- No bouncy or elastic eases unless apple-design allows a post-flick bounce.
- Everything GSAP drives must still respect Reduce Motion and be interruptible.
- `gsap-react`: use the proper React cleanup and context pattern. `gsap-performance`: transform/opacity only.

### 4.10 pick-ui-library
**Job:** Picks the right library for a task (toasts, command menus, charts, drag and drop, inputs, and so on).
**Rule:** Prefer the fewest dependencies. Any library must be restyled to the Apple look and its motion replaced or tuned to springs.

### 4.11 web-design-guidelines
**Job:** Final audit of the finished UI for accessibility, UX and quality.
**Use it:** The last step before calling anything done. Fix all findings the Apple way.

### 4.12 break-ui
**Job:** Read this skill's `SKILL.md` description to confirm. By its name it stress-tests the UI to find where it breaks.
**Use it:** After building, as a stress test (odd screen sizes, long text, rapid interaction, interruption). Fix anything it finds in the Apple way.

### 4.13 animate-expo and mobile-native (DISABLED for this web site)
**Job:** Expo, React Native and native-mobile guidance.
**Rule:** Do **not** use these for the website. Only use them if we later build a native or Expo app.

> If any skill's `SKILL.md` description contradicts the summary above, read the `SKILL.md` and follow the priority order in section 2.

---

## 5. Workflow for Every UI Task

1. **Read** apple-design first.
2. **Plan:** define purpose and hierarchy (frontend-design process), and use animation-vocabulary if motion is involved.
3. **Look up** current docs (Context7 MCP) before using any framework or library API.
4. **Build** with apple-design values from section 3.
5. **Verify** in the browser (Playwright MCP or Antigravity's browser agent): screenshot desktop and mobile, check press, drag, interrupt, and Reduce Motion.
6. **Improve:** run improve-animations and animation-performance.
7. **Stress test:** break-ui.
8. **Audit:** web-design-guidelines, plus ui-ux-pro-max accessibility checks.
9. **Fix** all findings the Apple way, then report what was done and what remains.

---

## 6. Tools (MCP)

- **Context7:** live documentation. Use before writing framework code.
- **Playwright / browser agent:** screenshot and test every UI change.
- **GitHub:** only when asked. Never push or open PRs without being asked.
- **Supabase:** only for backend work. Ask before changing schema or data.
- **Stitch:** design exploration only. Anything imported must be reworked into the Apple language.

Keep enabled tools under 50.

---

## 7. Hard Rules

- Do not introduce a new visual style, font family, or color palette without asking.
- Do not use `ease-in-out` / fixed-duration animation for interactive elements.
- Do not stack glass layers or put text on muddy glass. Content sits under one translucent layer.
- Do not ship any animation without a Reduce Motion version.
- Do not animate layout properties (`width`, `height`, `top`, `left`). Use `transform` and `opacity`.
- Do not add motion for decoration. Every animation must have a purpose.
- Do not blend skill advice that conflicts. Follow the priority order.
- Never commit secrets or tokens. Keep API keys out of the repo.
- Test on a real phone before calling interaction work finished. Rules are not a substitute for feel.

---

## 8. Project Plan (fill in)

- **Site name / purpose:**
- **Audience:**
- **Stack:** (HTML/CSS, React, Next.js, etc.)
- **Pages / sections:**
  1.
  2.
  3.
- **Key interactions to nail first:** (press states, nav, sheet/modal, scroll sections)
- **Definition of done:** passes the 60-second test below.

### 60-second test
1. Press and hold a button: it shrinks on touch, before release.
2. Open a modal and close it halfway: it turns around from where it is.
3. Flick a card or drawer: it keeps speed and settles softly.
4. Drag past the end of a sheet: it stretches, resists, springs back.
5. Turn on Reduce Motion: slides become fades.
6. Check the biggest headline: tighter tracking than body text.

---

## 9. Notes

- Skills live in `.agents/skills/`. Update with `npx skills update`, then restart the agent.
- If this file and a skill ever disagree, update this file deliberately rather than letting the agent improvise.
