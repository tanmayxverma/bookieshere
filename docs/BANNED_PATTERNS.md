# Banned Patterns (Anti-Vibe-Coding Rules)

The following patterns are strictly banned across the entire Bookie codebase. They make an interface look AI-generated, templated, or vibe-coded. These rules will be statically verified by `scripts/check-design.mjs`.

---

## 1. Visual & Styling Bans
- **Banned: Purple/Blue Gradient Blobs & Aurora Backgrounds:** No floating blurred radial color balls, no animated glowing gradient mesh backgrounds.
- **Banned: Stacked Glassmorphism:** Never stack translucent blurred layers on top of one another. Limit backdrop-filter to at most 1–2 small chrome layers with solid fallbacks.
- **Banned: Neon Glow Borders:** No multi-colored neon outer glow rings around cards or panels.
- **Banned: Gradient Text Overuse:** Gradient text is allowed on at most ONE headline per page; never on subtitles, cards, or body text.
- **Banned: Colored Drop Shadows:** No diffuse saturated drop shadows (`rgba(primary, 0.4)`). Shadows must be crisp tactile dark ink offsets (`4px 4px 0 #0F172A`) or subtle ambient occlusion in dark mode.
- **Banned: Generic Cliché 3-Card Grids:** No identical rounded rectangle cards in a row as the default section layout. Vary proportion, orientation, and content density.

---

## 2. Iconography & Decorational Bans
- **Banned: Emoji as Icons or UI Decoration:** Never use raw emoji (🔥, 🚀, ✨, 🧠, 📚, 🏆) as navigational icons, feature bullets, or UI buttons. Use clean Lucide SVG icons with a consistent 1.5–2px stroke.
- **Banned: Sparkles (✨):** Never put sparkles on AI, search, or feature badges.
- **Banned: Icon-in-a-Circle Feature Grids:** No repetitive colorful circles containing centered icons above 3-line descriptions.
- **Banned: "New" or "Hot" Badge Spam:** No decorative badges without real functional meaning. Badges are reserved for verified system status (e.g. `[✓ VERIFIED PROCTOR]`, `[OFFLINE]`).

---

## 3. Copywriting & Content Bans
- **Banned: AI Filler Clichés:**
  - "Welcome to..."
  - "Unlock the power of..."
  - "Supercharge your..."
  - "Transform your study routine..."
  - "The ultimate all-in-one platform..."
- **Banned: Fake Stats & Testimonials:** No fabricated quotes, fake student percentages, or generic avatar testimonials. Real telemetry and real platform features only.
- **Banned: Exclamation Spam:** No exclamation marks in informational UI or feature headings. Keep the tone calm, disciplined, and confident.

---

## 4. Motion & Animation Bans
- **Banned: Layout Property Animation:** Never animate `width`, `height`, `top`, `left`, `margin`, or `padding`. Animate only composite properties: `transform` and `opacity`.
- **Banned: Competing Decorative Loops:** No infinite rotating borders, wobbling badges, or autoplaying loops.
- **Banned: Bouncy/Elastic Easings on Functional UI:** Interactive buttons and sheets use critically damped springs (`damping: 1.0`), never bouncy carnival oscillations.
- **Banned: Missing Reduced Motion:** Every animated element must support `@media (prefers-reduced-motion: reduce)` with immediate cross-fade or static fallbacks.
