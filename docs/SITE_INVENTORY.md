# Site Inventory & Route Mapping — Editorial Ink

**Project:** `bookieshere`  
**Visual Style Authority:** Editorial Ink (Bookie Academic Journal)  
**Structural Authority:** Apple Physical Dynamics & Topology (from AGENTS.md)

---

## Complete Route Inventory

### Priority Tier 1: Core Daily Workflows (Aspirant Engine)
| Route | Page File | Mapped Stitch Screen | Priority | Status |
|---|---|---|---|---|
| `/` | `src/pages/Index.tsx` | Screen 02 (`2a0899f309134863b9aedf3cb497329e`) | P0 | **DONE** (checkpoint-home) |
| `/ypt` | `src/pages/YPT.tsx`<br>`src/components/YPTV2/*` | Screen 01 (`196bd87aa0674e1d8f088fbb33342684`)<br>Screen 03 (`7046a00475774dbf9197e830dd7fefaa`)<br>Screen 05 (`7fea337709d14729a0d7a1f8e8ffc49d`)<br>Screen 06 (`808a53a2844445d4b3d0625d392123a0`) | P0 | **DONE** |
| `/materials` | `src/pages/Materials.tsx`<br>`src/components/MaterialCard.tsx` | Screen 04 (`7f1362e29f4540c6a750d47cd170b964`) | P0 | **DONE** |
| `/tests` | `src/pages/Tests.tsx`<br>`src/components/Tests/TestSeriesHub.tsx` | Screen 08 (`5c688b8186cc4dea8f7b3804b2e722e3`) | P0 | **DONE** |
| `/test-series/:id` | `src/pages/TestSeriesDetail.tsx` | Derived from Screen 08 (NTA exam format key) | P1 | **DONE** |
| `/community` | `src/pages/Community.tsx` | Screen 10 (`8e662ca02b494b1396a38827056b0732`) | P1 | **DONE** |

### Priority Tier 2: Account & Identity Flows
| Route | Page File | Mapped Stitch Screen | Priority | Status |
|---|---|---|---|---|
| `/profile` | `src/pages/Profile.tsx` | Screen 13 (`63548a653edc4d89b3f3a442b94d0bb9`) | P1 | **DONE** |
| `/welcome` | `src/pages/Welcome.tsx` | Derived from Design.md (Parchment entrance) | P1 | **DONE** |
| `/onboarding` | `src/pages/Onboarding.tsx` | Derived from Design.md (Target exam selector) | P1 | **DONE** |
| `/auth` | `src/pages/Auth.tsx` | Redirect gate to `/welcome` | P2 | **DONE** |
| `/reset-password` | `src/pages/ResetPassword.tsx` | Derived from Design.md | P2 | **DONE** |
| `/notifications` | `src/pages/Notifications.tsx` | Derived from Design.md (Archival bulletin) | P2 | **DONE** |

### Priority Tier 3: Utility & Resource Portals
| Route | Page File | Mapped Stitch Screen | Priority | Status |
|---|---|---|---|---|
| `/support` | `src/pages/Support.tsx` | Screen 11 (`2c934dce5a4647f4bad5bd200b2e0b9a`) | P1 | **DONE** |
| `/donate` | `src/pages/Donate.tsx` | Screen 12 (`3f303741e81c48fc9ce6f2fe1545da7a`) | P1 | **DONE** |
| `/portals` | `src/pages/Portals.tsx` | Screen 09 (`aeb90025f67b42fbabf4d54d4afe198a`) | P1 | **DONE** |
| `/portals/:id` | `src/pages/PortalDetail.tsx` | Derived from Screen 09 (Mirror gateway detail) | P2 | **DONE** |

### Priority Tier 4: Legal & Administrative System Pages
| Route | Page File | Mapped Stitch Screen | Priority | Status |
|---|---|---|---|---|
| `/copyright-terms` | `src/pages/CopyrightTerms.tsx` | Derived from Design.md (Archival broadsheet) | P2 | **DONE** |
| `/terms` | `src/pages/TermsOfService.tsx` | Derived from Design.md | P2 | **DONE** |
| `/dmca` | `src/pages/DMCA.tsx` | Derived from Design.md | P2 | **DONE** |
| `/privacy-policy` | `src/pages/PrivacyPolicy.tsx` | Derived from Design.md | P2 | **DONE** |
| `/admin/*` | `src/pages/admin/*`<br>`src/components/Admin/AdminShell.tsx` | Derived from Design.md | P3 | **DONE** |
| `*` | `src/pages/NotFound.tsx` | Derived from Design.md (Aspirant lost carrel) | P3 | **DONE** |
