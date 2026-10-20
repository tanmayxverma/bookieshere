# Stitch Screen Map — Bookie Redesign Source of Truth

**Project:** `bookieshere`  
**Project ID:** `17297096438450244819`  
**Design Authority:** Editorial Ink (Bookie Academic Journal) — from Stitch Project `17297096438450244819`

---

## Screen Mapping Matrix

| # | Screen ID | Title / Content Identified | Type | Target Route / Component | Viewport |
|---|---|---|---|---|---|
| **01** | `196bd87aa0674e1d8f088fbb33342684` | **Bookie YPT Cockpit — All-India Leaderboard**<br>PODIUM: AIR #1, #2, #3; registry list, Today vs Weekly switcher | Page / Tab | `/ypt` (Leaderboard Tab)<br>`src/components/YPTV2/V2LeaderboardTab.tsx` | Desktop (responsive) |
| **02** | `2a0899f309134863b9aedf3cb497329e` | **Bookie — Locked Master Academic Homepage**<br>Hero: "Survive the syllabus. Rule the ranks.", split-screen live focus carrel, 4 metrics, 3 Pillars, Chapter Trap Ledger, Roll of Honor, Covenant, Footer | Page | `/`<br>`src/pages/Index.tsx` | Desktop (responsive) |
| **03** | `7046a00475774dbf9197e830dd7fefaa` | **Bookie YPT Cockpit — Study Stats & Calendar**<br>Daily Study Metric cards, 6h target progress, full-month October calendar heatmap, weekly trend chart, subject ledger | Page / Tab | `/ypt` (Stats Tab)<br>`src/components/YPTV2/V2StatsTab.tsx` | Desktop (responsive) |
| **04** | `7f1362e29f4540c6a750d47cd170b964` | **Bookie — Materials Library & Archival Vault**<br>Search with [⌘K], category pills, 4-tier left sidebar filter, 2-column cards grid, 14-day revision dossier banner | Page | `/materials`<br>`src/pages/Materials.tsx`<br>`src/components/MaterialCard.tsx` | Desktop (responsive) |
| **05** | `7fea337709d14729a0d7a1f8e8ffc49d` | **Bookie YPT Cockpit — Study & Focus Timer**<br>Stopwatch/Pomodoro toggle, subject pills, circular focal timer ring, audio cadence card, syllabus units checklist, study metrics | Page / Tab | `/ypt` (Study Tab)<br>`src/components/YPTV2/V2StudyTab.tsx` | Desktop (responsive) |
| **06** | `808a53a2844445d4b3d0625d392123a0` | **Bookie YPT Cockpit — Peer Study Rooms**<br>Host room banner, active rooms grid (JEE 2028, JEE 2027, Droppers Grind, Kota Night Shift), activity ledger | Page / Tab | `/ypt` (Rooms Tab)<br>`src/components/YPTV2/V2RoomsTab.tsx` | Desktop (responsive) |
| **07** | `89012a0cfd6e40818b9eb3178d701a37` | **Design.md (Design System Specification)**<br>Full token spec: colors, typography, elevations, layout rules, signature components, and footer covenant | Document | `.stitch/DESIGN.md`<br>`docs/DESIGN.md` | Core Spec |
| **08** | `5c688b8186cc4dea8f7b3804b2e722e3` | **Bookie — Tests & Mock Arena Hub (Editorial Ink)**<br>Reality check barometer, 1v1 Mock Conflict arena, verified test portals matrix (PW, MathOnGo, Allen, Narayana) | Page | `/tests`<br>`src/pages/Tests.tsx`<br>`src/components/Tests/*` | Desktop (responsive) |
| **09** | `aeb90025f67b42fbabf4d54d4afe198a` | **Bookie — Coaching Portals & Mirror Gateway**<br>Hero launcher, terminal window preview, archival disclaimer, active portals cards (PW, Next Toppers, Vibrant, etc.) | Page | `/portals`<br>`src/pages/Portals.tsx`<br>`src/pages/PortalDetail.tsx` | Desktop (responsive) |
| **10** | `8e662ca02b494b1396a38827056b0732` | **Bookie — Aspirant Lounge & Community Codex**<br>Discourse feed, academic post cards with LaTeX and score audits, Bookie Codex guidelines sidebar | Page | `/community`<br>`src/pages/Community.tsx` | Desktop (responsive) |
| **11** | `2c934dce5a4647f4bad5bd200b2e0b9a` | **Bookie — Support & Direct 1v1 Aspirant Desk**<br>Direct aspirant terminal, solo architect manifesto, topic starters, prompt chips, direct message composer | Page | `/support`<br>`src/pages/Support.tsx` | Desktop (responsive) |
| **12** | `3f303741e81c48fc9ce6f2fe1545da7a` | **Bookie — Support BOOKIE (Buy Us a Chai)**<br>Central patronage card ("BUY US A chai."), UPI quick copy, 3 impact breakdown cards (Server Costs, Test Scanners, Free Forever) | Page | `/donate`<br>`src/pages/Donate.tsx` | Desktop (responsive) |
| **13** | `63548a653edc4d89b3f3a442b94d0bb9` | **Bookie — Aspirant Profile & Telemetry Dossier**<br>Aspirant avatar dossier, quick avatar icons, Today's study performance ledger, Upgrade Account card, settings form | Page | `/profile`<br>`src/pages/Profile.tsx` | Desktop (responsive) |
| **14** | `3463549f292a4297a2f47829c7ba6427` | **Bookie AI — Archival Study Mentor Drawer**<br>Floating academic study mentor drawer, scholarly crest, deconstructive LaTeX derivations, prompt composer | Component | `src/components/AI/BookieMentorDrawer.tsx` (Global Drawer) | Desktop & Mobile Flyout |
| **15** | `3fa624e46fea45bd968a895076744b05` | **Bookie AI Archival Mentor Emblem**<br>Crimson squircle (`#904A43`) with ivory open codex book and gold starburst (`#FBBF24`) spark | Asset | `public/bookie-emblem.svg`<br>`public/favicon.ico`<br>`src/components/Brand/Emblem.tsx` | Vector Asset |

---

## Secondary Routes (Derived from Design System Specification)

For routes that did not have an explicit standalone screen in Stitch, the Editorial Ink design system tokens and layout language are directly applied:

| Route | Target Component | Design Architecture |
|---|---|---|
| `/test-series/:id` | `src/pages/TestSeriesDetail.tsx` | Archival test paper syllabus deconstruction, timing bar, NTA format key |
| `/welcome` | `src/pages/Welcome.tsx` | Ivory parchment gate, minimal guest entrance vs Google OAuth |
| `/onboarding` | `src/pages/Onboarding.tsx` | Clean academic exam selector (JEE 2026/2027/NEET) |
| `/auth` | `src/pages/Auth.tsx` | Redirect gate to `/welcome` |
| `/reset-password` | `src/pages/ResetPassword.tsx` | Clean ivory credential recovery carrel |
| `/notifications` | `src/pages/Notifications.tsx` | Archival bulletin ledger, material drop notifications |
| `/terms`, `/privacy-policy`, `/dmca`, `/copyright-terms` | Legal pages | Archival legal broadsheets with crisp typography and hairline rules |
| `/admin/*` | `src/pages/admin/*` | Scholarly cockpit control deck with hairline borders |
| `*` | `src/pages/NotFound.tsx` | Aspirant lost carrel with link back to study cockpit |
