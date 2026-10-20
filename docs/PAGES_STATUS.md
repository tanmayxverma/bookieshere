# Bookie Academics — Pages Status Tracker (Editorial Ink)

**Branch:** `design/premium`  
**Visual Style Authority:** Editorial Ink (Bookie Academic Journal) — from Stitch Project `17297096438450244819`  
**Structural Authority:** Apple Physical Dynamics & Topology (from AGENTS.md)  
**Verification Mode:** Static analysis only (`npm run build`, `npm run lint`, `npm run lint:realtime`). No browser automation.

---

## Overall Summary
- **Total Tracked Routes:** 22 functional routes
- **Stage 1 (Tokens, Primitives, App Shell, Home Page):** **DONE** (Tag: `checkpoint-home`)
- **Stage 2 (Rebuilding pages with Editorial Ink styling):** IN PROGRESS

---

## Page Status by Priority

### Foundation & App Shell (Stage 1)
- [x] **Design Tokens & Fonts (`src/styles/tokens.css`, `tailwind.config.ts`)**: Newsreader, Plus Jakarta Sans, JetBrains Mono, hairline borders, soft ambient elevation. Tag: `checkpoint-home`.
- [x] **UI Primitives Theme-Level Upgrade (`src/components/ui/*`)**: Button, Card, Input, Tabs, Dialog, Sheet, Sonner, Badge.
- [x] **Global App Shell (`src/components/Navbar.tsx`, `Footer.tsx`, `MobileTabBar.tsx`)**: Floating capsule navbar, candidate tracking sub-bar, multi-tier archival footer, vector emblem.
- [x] **Global AI Mentor Drawer (`src/components/AI/BookieMentorDrawer.tsx`)**: Built from Stitch Screen 14.
- [x] **HOME PAGE (`src/pages/Index.tsx`)**: Rebuilt from Stitch Screen 02 with live focus carrel, 4-metric strip, 3 pillars, chapter ledger. Tag: `checkpoint-home`.

---

### Priority Tier 1: Core Daily Workflows (Aspirant Engine)
| Route | Page / Component File | Mapped Stitch Screen | Status |
|---|---|---|---|
| `/ypt` | `src/pages/YPT.tsx`<br>`src/components/YPTV2/*` | Screen 01 (Leaderboard), 03 (Stats), 05 (Timer), 06 (Rooms) | **DONE** |
| `/materials` | `src/pages/Materials.tsx`<br>`src/components/MaterialCard.tsx` | Screen 04 (`7f1362e29f4540c6a750d47cd170b964`) | **DONE** |
| `/tests` | `src/pages/Tests.tsx`<br>`src/components/Tests/TestSeriesHub.tsx` | Screen 08 (`5c688b8186cc4dea8f7b3804b2e722e3`) | **DONE** |
| `/test-series/:id` | `src/pages/TestSeriesDetail.tsx` | Derived from Screen 08 | **DONE** |
| `/community` | `src/pages/Community.tsx` | Screen 10 (`8e662ca02b494b1396a38827056b0732`) | **DONE** |

---

### Priority Tier 2: Account & Identity Flows
| Route | Page File | Mapped Stitch Screen | Status |
|---|---|---|---|
| `/profile` | `src/pages/Profile.tsx` | Screen 13 (`63548a653edc4d89b3f3a442b94d0bb9`) | **DONE** |
| `/welcome` | `src/pages/Welcome.tsx` | Derived from Design.md | **DONE** |
| `/onboarding` | `src/pages/Onboarding.tsx` | Derived from Design.md | **DONE** |
| `/auth` | `src/pages/Auth.tsx` | Redirect gate | **DONE** |
| `/reset-password`| `src/pages/ResetPassword.tsx` | Derived from Design.md | **DONE** |
| `/notifications` | `src/pages/Notifications.tsx` | Derived from Design.md | **DONE** |

---

### Priority Tier 3: Utility & Resource Portals
| Route | Page File | Mapped Stitch Screen | Status |
|---|---|---|---|
| `/support` | `src/pages/Support.tsx` | Screen 11 (`2c934dce5a4647f4bad5bd200b2e0b9a`) | **DONE** |
| `/donate` | `src/pages/Donate.tsx` | Screen 12 (`3f303741e81c48fc9ce6f2fe1545da7a`) | **DONE** |
| `/portals` | `src/pages/Portals.tsx` | Screen 09 (`aeb90025f67b42fbabf4d54d4afe198a`) | **DONE** |
| `/portals/:id` | `src/pages/PortalDetail.tsx` | Derived from Screen 09 | **DONE** |

---

### Priority Tier 4: Legal & System Pages
| Route | Page File | Mapped Stitch Screen | Status |
|---|---|---|---|
| `/copyright-terms` | `src/pages/CopyrightTerms.tsx` | Derived from Design.md | **DONE** |
| `/terms` | `src/pages/TermsOfService.tsx` | Derived from Design.md | **DONE** |
| `/dmca` | `src/pages/DMCA.tsx` | Derived from Design.md | **DONE** |
| `/privacy-policy` | `src/pages/PrivacyPolicy.tsx` | Derived from Design.md | **DONE** |
| `/admin/*` | `src/pages/admin/*` | Derived from Design.md | **DONE** |
| `*` | `src/pages/NotFound.tsx` | Derived from Design.md | **DONE** |
