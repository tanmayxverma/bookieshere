# Bookie Academics — Pages Status Tracker (Academic Desk / Sticker Pop)

**Branch:** `design/premium`  
**Visual Style Authority:** "Sticker Pop Academic Desk" (Day) & "Night Shift Cockpit" (Night)  
**Structural Authority:** Apple Physical Dynamics & Topology (from AGENTS.md)  
**Verification Mode:** Static analysis only (`npm run build`, `lint`, `tsc`, `scripts/check-design.mjs`). No browser automation.

---

## Overall Summary
- **Total Pages / Routes:** 22 tracked functional routes
- **Completed:** 22 / 22 (100% Complete)
- **Stage 1 Status:** Complete (Tokens, Primitives, App Shell, Home Page with live timer carrel). Git tag: `checkpoint-home`.
- **Stage 2 Status:** Complete (All Tier 1, 2, 3, 4 pages redesigned with tactile Academic Desk aesthetic and conventional git commits).

---

## Page Status by Priority

### Foundation & App Shell (Stage 1)
- [x] **Design Tokens & Fonts (`src/styles/tokens.css`)**: Bricolage Grotesque, Space Grotesk, JetBrains Mono, tactile drop shadows, washi tape clips.
- [x] **UI Primitives Theme-Level Upgrade (`src/components/ui/*`)**: Button, Card, Input, Tabs, Dialog, Sheet, Sonner, ProgressRing, SegmentedControl, Reveal, Marquee.
- [x] **Global App Shell (`src/components/Navbar.tsx`, `Footer.tsx`, `MobileTabBar.tsx`)**: Solid desk navigation, mobile thumb tab bar with safe-area insets, footer with legal links.
- [x] **HOME PAGE (`src/pages/Index.tsx`)**: Rebuilt from Stitch reference with live LCD timer carrel, split-screen momentum, JEE countdown, 3 workbench modules, Hall of Fame ledger, manifesto banner. Tag: `checkpoint-home`.

---

### Priority Tier 1: Core Daily Workflows (Aspirant Engine)
| Route | Page File | Status | Description / Notes |
|---|---|---|---|
| `/` | `src/pages/Index.tsx` | **DONE** | Complete Academic Desk rebuild with live interactive timer station carrel. |
| `/ypt` | `src/pages/YPT.tsx`<br>`src/components/YPTV2/V2StudyTab.tsx` | **DONE** | Proctored study carrels, silent peer webcams, immersion stopwatch, room switcher. |
| `/materials` | `src/pages/Materials.tsx`<br>`src/components/MaterialCard.tsx`<br>`src/components/MaterialFilters.tsx` | **DONE** | PYQ Vault & Kota notes, subject tag filters, formula cards, instant search. |
| `/tests` | `src/pages/Tests.tsx`<br>`src/components/Tests/TestSeriesHub.tsx` | **DONE** | NTA mock test catalog, exam launch cards, test palette key indicator. |
| `/test-series/:id` | `src/pages/TestSeriesDetail.tsx` | **DONE** | Individual test series breakdown, paper list, test simulator entrance. |
| `/community` | `src/pages/Community.tsx` | **DONE** | Peer discussion feed, telegram drop ticker, post creation drawer. |

---

### Priority Tier 2: Account & Identity Flows
| Route | Page File | Status | Description / Notes |
|---|---|---|---|
| `/profile` | `src/pages/Profile.tsx` | **DONE** | Aspirant profile dossier, verified proctor badge, sprint stats, streak indicator. |
| `/welcome` | `src/pages/Welcome.tsx` | **DONE** | Clean desk welcome gate, zero-friction guest entrance vs Google sign-in. |
| `/onboarding` | `src/pages/Onboarding.tsx` | **DONE** | Target exam selection (JEE 2026/2027/NEET), subject priority setup. |
| `/auth` | `src/pages/Auth.tsx` | **DONE** | Redirect gate to welcome. |
| `/reset-password`| `src/pages/ResetPassword.tsx` | **DONE** | Password recovery form with tactile feedback. |
| `/notifications` | `src/pages/Notifications.tsx` | **DONE** | Material drop alerts, system bulletins, emergency Telegram channel. |

---

### Priority Tier 3: Utility & Resource Portals
| Route | Page File | Status | Description / Notes |
|---|---|---|---|
| `/support` | `src/pages/Support.tsx` | **DONE** | Aspirant helpdesk, request a Kota resource, report issue ticket. |
| `/portals` | `src/pages/Portals.tsx` | **DONE** | Curated coaching links & test portal directory. |
| `/portals/:id` | `src/pages/PortalDetail.tsx` | **DONE** | Institutional portal details and quick-access mirrors. |
| `/donate` | `src/pages/Donate.tsx` | **DONE** | "Chai Break" community server support, QR payment carrel. |

---

### Priority Tier 4: Legal & System Pages
| Route | Page File | Status | Description / Notes |
|---|---|---|---|
| `/copyright-terms` | `src/pages/CopyrightTerms.tsx` | **DONE** | Clean document card with verified legal text. |
| `/terms` | `src/pages/TermsOfService.tsx` | **DONE** | Terms of service. |
| `/dmca` | `src/pages/DMCA.tsx` | **DONE** | DMCA takedown protocol. |
| `/privacy-policy` | `src/pages/PrivacyPolicy.tsx` | **DONE** | Privacy policy. |
| `/admin/*` | `src/pages/admin/*`<br>`src/components/Admin/AdminShell.tsx` | **DONE** | Admin control cockpit with Academic Desk masthead. |
| `*` | `src/pages/NotFound.tsx` | **DONE** | Lost aspirant 404 error carrel. |
