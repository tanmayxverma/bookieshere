# Redesign Clutter Cleanup Report

| File | Added By | Still Imported / Referenced? | Verdict |
| :--- | :--- | :--- | :--- |
| **Installed Skills & Metadata** | | | |
| `.agents/skills/*` (all files & scripts) | Agent Skills | Yes (local agent instruction set) | **KEEP** |
| `skills-lock.json` | Agent Skills | Yes | **KEEP** |
| **Stitch Export & Downloads** | | | |
| `.stitch/DESIGN.md` | Stitch | No | **DELETE** |
| `.stitch/README.md` | Stitch | No | **DELETE** |
| `.stitch/bricolage_cream_desk.*` | Stitch | No | **DELETE** |
| `.stitch/materials_library.*` | Stitch | No | **DELETE** |
| `.stitch/night_shift.*` | Stitch | No | **DELETE** |
| `.stitch/sticker_pop.*` | Stitch | No | **DELETE** |
| `.stitch/ypt_dashboard.*` | Stitch | No | **DELETE** |
| `.stitch/editorial_ink.*` | Stitch | No | **DELETE** |
| `.stitch/editorial_ink/*` (all 30 files) | Stitch | No | **DELETE** |
| `.stitch/designs/*` (all 28 files) | Stitch | No | **DELETE** |
| `.stitch/assets/*` (all files) | Stitch | No | **DELETE** |
| **Design Documentation** | | | |
| `docs/BANNED_PATTERNS.md` | Stitch | No | **DELETE** |
| `docs/DESIGN.md` | Stitch | No | **DELETE** |
| `docs/DESIGN_DECISIONS.md` | Stitch | No | **DELETE** |
| `docs/DESIGN_TOKENS.md` | Stitch | No | **DELETE** |
| `docs/DIRECTION.md` | Stitch | No | **DELETE** |
| `docs/PAGES_STATUS.md` | Stitch | No | **DELETE** |
| `docs/SITE_INVENTORY.md` | Stitch | No | **DELETE** |
| `docs/SKILLS_USED.md` | Stitch | No | **DELETE** |
| `docs/STITCH_MAP.md` | Stitch | No | **DELETE** |
| `docs/SUPABASE_USAGE.md` | Supabase perf | Yes (performance docs) | **KEEP** |
| `docs/RLS_POLICIES_DIFF.md` | Supabase perf | Yes (performance docs) | **KEEP** |
| **Scripts & Brand Marks** | | | |
| `scripts/check-design.mjs` | Stitch | No | **DELETE** |
| `scripts/download-stitch-assets.mjs` | Stitch | No | **DELETE** |
| `scripts/stitch-inspection.json` | Stitch | No | **DELETE** |
| `scripts/sync-stitch-paths.mjs` | Stitch | No | **DELETE** |
| `scripts/check-realtime-filters.mjs` | Supabase perf | Yes (`npm run lint:realtime`) | **KEEP** |
| `public/bookie-emblem.svg` | Stitch | No | **DELETE** |
| **Redesign Components & Tokens** | | | |
| `src/components/AI/BookieMentorDrawer.tsx` | Stitch | No | **DELETE** |
| `src/components/Brand/BookieEmblem.tsx` | Stitch | No | **DELETE** |
| `src/components/MobileTabBar.tsx` | Stitch | No | **DELETE** |
| `src/components/ui/marquee.tsx` | Stitch | No | **DELETE** |
| `src/components/ui/progress-ring.tsx` | Stitch | No | **DELETE** |
| `src/components/ui/reveal.tsx` | Stitch | No | **DELETE** |
| `src/components/ui/segmented-control.tsx` | Stitch | No | **DELETE** |
| `src/styles/tokens.css` | Stitch | No | **DELETE** |
| **Dependencies to Remove via npm uninstall** | | | |
| `@fontsource/bricolage-grotesque` | Stitch | No | **DELETE (uninstall)** |
| `@fontsource/jetbrains-mono` | Stitch | No | **DELETE (uninstall)** |
| `@fontsource/newsreader` | Stitch | No | **DELETE (uninstall)** |
| `@fontsource/plus-jakarta-sans` | Stitch | No | **DELETE (uninstall)** |
| `@fontsource/space-grotesk` | Stitch | No | **DELETE (uninstall)** |
| **Files Modified by Redesign (Reverting to BASE State)** | | | |
| `AGENTS.md` | Apple/Stitch | Yes | **REVERT-EDIT** (Keep Supabase budget rules, neutral design instruction) |
| `index.html` | Stitch | Yes | **REVERT-EDIT** (Restore BASE fonts & head tags) |
| `package.json` | Stitch | Yes | **REVERT-EDIT** (Remove 5 @fontsource packages) |
| `package-lock.json` | Stitch | Yes | **REVERT-EDIT** (Updated via npm) |
| `tailwind.config.ts` | Stitch | Yes | **REVERT-EDIT** (Restore BASE tailwind config) |
| `src/index.css` | Stitch | Yes | **REVERT-EDIT** (Restore BASE styles) |
| `src/components/Layout.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE layout) |
| `src/components/Navbar.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE navbar) |
| `src/components/Footer.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE footer) |
| `src/components/JEECountdown.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE countdown) |
| `src/components/MaterialCard.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE material card) |
| `src/components/MaterialFilters.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE material filters) |
| `src/components/Profile/AvatarUploader.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE uploader) |
| `src/components/Tests/TestSeriesHub.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE test series hub) |
| `src/components/Admin/AdminShell.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE admin shell) |
| `src/components/YPTV2/V2LeaderboardTab.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE leaderboard tab) |
| `src/components/YPTV2/V2RoomsTab.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE rooms tab) |
| `src/components/YPTV2/V2StatsTab.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE stats tab) |
| `src/components/YPTV2/V2StudyTab.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE study tab) |
| `src/components/ui/badge.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE ui primitive) |
| `src/components/ui/button.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE ui primitive) |
| `src/components/ui/card.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE ui primitive) |
| `src/components/ui/dialog.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE ui primitive) |
| `src/components/ui/input.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE ui primitive) |
| `src/components/ui/progress.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE ui primitive) |
| `src/components/ui/sheet.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE ui primitive) |
| `src/components/ui/sidebar.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE ui primitive) |
| `src/components/ui/sonner.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE ui primitive) |
| `src/components/ui/tabs.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE ui primitive) |
| `src/pages/Index.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE homepage) |
| `src/pages/Materials.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE materials page) |
| `src/pages/YPT.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE study cockpit) |
| `src/pages/Community.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE community lounge) |
| `src/pages/Tests.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE tests page) |
| `src/pages/TestSeriesDetail.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE test detail) |
| `src/pages/Profile.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE profile page) |
| `src/pages/Welcome.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE welcome auth) |
| `src/pages/Onboarding.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE onboarding) |
| `src/pages/ResetPassword.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE reset password) |
| `src/pages/Notifications.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE notifications) |
| `src/pages/Portals.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE portals) |
| `src/pages/PortalDetail.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE portal detail) |
| `src/pages/Support.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE support desk) |
| `src/pages/Donate.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE donate page) |
| `src/pages/TermsOfService.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE terms) |
| `src/pages/PrivacyPolicy.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE privacy) |
| `src/pages/DMCA.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE DMCA) |
| `src/pages/CopyrightTerms.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE copyright) |
| `src/pages/NotFound.tsx` | Stitch | Yes | **REVERT-EDIT** (Restore BASE 404) |
