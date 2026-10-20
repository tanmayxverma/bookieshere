# Bookie Academics — Pages Status Tracker (Academic Desk / Sticker Pop)

**Branch:** `design/premium`  
**Visual Style Authority:** "Sticker Pop Academic Desk" (Day) & "Night Shift Cockpit" (Night)  
**Structural Authority:** Apple Physical Dynamics & Topology (from AGENTS.md)  
**Verification Mode:** Static analysis only (`npm run build`, `lint`, `tsc`, `scripts/check-design.mjs`). No browser automation.

---

## Overall Summary
- **Total Pages / Routes:** 22 tracked functional routes
- **Completed:** 1 / 22 (Home Page `/`)
- **Stage 1 Status:** Complete (Tokens, Primitives, App Shell, Home Page with live timer carrel). Git tag: `checkpoint-home`.
- **In Progress:** Tier 1 Core Pages (`/ypt`, `/materials`, `/tests`, `/test-series/:id`, `/community`)

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
| `/ypt` | `src/pages/YPT.tsx`<br>`src/components/YPT/*` | **In Progress** | Proctored study carrels, silent peer webcams, immersion stopwatch, room switcher. |
| `/materials` | `src/pages/Materials.tsx`<br>`src/components/Materials/*` | **Queued** | PYQ Vault & Kota notes, subject tag filters, formula cards, instant search. |
| `/tests` | `src/pages/Tests.tsx`<br>`src/components/Tests/*` | **Queued** | NTA mock test catalog, exam launch cards, test palette key indicator. |
| `/test-series/:id` | `src/pages/TestSeriesDetail.tsx` | **Queued** | Individual test series breakdown, paper list, test simulator entrance. |
| `/community` | `src/pages/Community.tsx`<br>`src/components/Community/*` | **Queued** | Peer discussion feed, telegram drop ticker, post creation drawer. |

---

### Priority Tier 2: Account & Identity Flows
| Route | Page File | Status | Description / Notes |
|---|---|---|---|
| `/profile` | `src/pages/Profile.tsx` | **Queued** | Aspirant profile dossier, verified proctor badge, sprint stats, streak indicator. |
| `/welcome` | `src/pages/Welcome.tsx` | **Queued** | Clean desk welcome gate, zero-friction guest entrance vs Google sign-in. |
| `/onboarding` | `src/pages/Onboarding.tsx` | **Queued** | Target exam selection (JEE 2026/2027/NEET), subject priority setup. |
| `/auth` | `src/pages/Auth.tsx` | **Queued** | Email/password sign-in and sign-up tactile cards. |
| `/reset-password`| `src/pages/ResetPassword.tsx` | **Queued** | Password recovery form with feedback. |
| `/notifications` | `src/pages/Notifications.tsx` | **Queued** | Material drop alerts and system bulletins. |

---

### Priority Tier 3: Utility & Resource Portals
| Route | Page File | Status | Description / Notes |
|---|---|---|---|
| `/support` | `src/pages/Support.tsx` | **Queued** | Aspirant helpdesk, request a Kota resource, report issue ticket. |
| `/portals` | `src/pages/Portals.tsx` | **Queued** | Curated coaching links & test portal directory. |
| `/portals/:id` | `src/pages/PortalDetail.tsx` | **Queued** | Institutional portal details and quick-access mirrors. |
| `/donate` | `src/pages/Donate.tsx` | **Queued** | "Chai Break" community server support, QR payment carrel. |

---

### Priority Tier 4: Legal & System Pages
| Route | Page File | Status | Description / Notes |
|---|---|---|---|
| `/copyright-terms` | `src/pages/CopyrightTerms.tsx` | **Queued** | Clean document card with verified legal text. |
| `/terms` | `src/pages/TermsOfService.tsx` | **Queued** | Terms of service. |
| `/dmca` | `src/pages/DMCA.tsx` | **Queued** | DMCA takedown protocol. |
| `/privacy-policy` | `src/pages/PrivacyPolicy.tsx` | **Queued** | Privacy policy. |
| `/admin/*` | `src/pages/admin/*` | **Queued** | Admin control cockpit. |
| `*` | `src/pages/NotFound.tsx` | **Queued** | Lost aspirant 404 error carrel. |
