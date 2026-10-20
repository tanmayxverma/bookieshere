# Repository Instructions: Interaction Physics, Structural Topology & Supabase Budget Rules

## 1. Design & Interaction Authority — Physical Dynamics & Topology

`apple-design` supplies interaction physics and structural topology only (springs, interruptible motion, press feedback, hierarchy, restraint, accessibility). It does NOT dictate fonts, colors, materials or visual style. The visual aesthetic is a premium, distinctive, slightly funky product identity (not generic, not vibe-coded, not templated).

### 1.1 Structural Topology
- **Clear Hierarchy:** One primary action per view, strong navigation model, progressive disclosure, and quiet surfaces.
- **Form & Navigation:** Large clear titles, grouped content, bottom tab bar on mobile phones for primary destinations, sheets for secondary tasks.
- **Restraint:** One element draws the eye at any given moment. Remove competing decorative noise.

### 1.2 Fluid Interaction & Motion Principles
1. **Instant Response (<16ms feedback):**
   - Respond immediately on `pointerdown`, never waiting for `pointerup` or `click`.
   - Never introduce artificial latency, debounces, or transit waits on direct input paths.
   - Feedback must be continuous throughout the gesture (1:1 tracking with the pointer).
2. **Interruptibility (Highest Priority):**
   - Every animation must be interruptible and redirectable mid-flight without glitching or snapping.
   - Always animate from the live *presentation* (current on-screen) value, never the logical target value.
   - Use velocity-aware springs rather than linear or hard-coded duration easings for user-driven interactions.
3. **Physical Springs & Velocity Handoff:**
   - Think in **damping ratio** and **response**, not arbitrary durations.
   - Default to critically damped springs (`damping: 1.0`, `response: 0.35s`) for clean, non-distracting settlements.
   - Apply slight bounce (`damping: ~0.8`) strictly when a physical momentum flick or throw preceded release.
   - Seamlessly transfer release pointer velocity into the initial spring velocity.
4. **Spatial Consistency & Origin Anchoring:**
   - Enter and exit along symmetric paths (e.g., sheets slide in from bottom and dismiss to bottom).
   - Anchor sheets, popovers, and menus to their trigger element via proper `transform-origin`.
5. **Depth, Surfaces & Performance:**
   - Distinctive elevation language tailored to the product identity: solid surfaces, hairline rules, or crisp offset layers rather than stacked frosted glass.
   - Limit backdrop-filter to at most 1–2 small chrome layers; always provide solid fallbacks.
   - Never animate layout properties (`width`, `height`, `top`, `left`). Animate only `transform` and `opacity`.
6. **Restraint & Reduced Motion:**
   - Respect `prefers-reduced-motion: reduce`: gracefully swap springs/slides for immediate opacity cross-fades without vestibular disturbance.
   - Respect `prefers-reduced-transparency: reduce` by replacing blurred surfaces with solid high-contrast backgrounds.
   - Avoid unmotivated motion. Restraint produces elegance.

---

## 2. Supabase Resource Budgets (Free Tier Quota Protection)

Our project runs on the Supabase Free plan with tight quota constraints (686 MAU):
- **Realtime Messages Budget:** < 800,000 / month (<40% of 2M quota).
- **Egress Budget:** < 2.0 GB / month (<40% of 5 GB quota).
- **Log Ingestion Budget:** < 1.0 GB / month (>90% reduction from legacy leak).

## 3. Mandatory Supabase Engineering Rules

### 3.1 Realtime Subscriptions
- **Never subscribe to `postgres_changes` without a restrictive `filter:`.** Unfiltered table subscriptions cause WAL broadcast storms to all active clients.
- Run `npm run lint:realtime` before opening any pull request or pushing code.
- Static or slowly changing data (e.g. `materials`, `ypt_rooms`, `notification_reads`) MUST NOT be in `supabase_realtime` publication. Use React Query caching with reasonable `staleTime`.
- Presence updates must occur ONLY on state transitions (session start, session stop, subject switch) with minimum 5-second throttling. NEVER dispatch presence on timer ticks or heartbeats.

### 3.2 Client Polling & Background Tabs
- Polling intervals must never be shorter than 60 seconds (120s recommended for leaderboards).
- All polling intervals must pause when the browser tab is hidden:
  ```ts
  if (document.visibilityState !== 'visible') return;
  ```
- Listen for `visibilitychange` to trigger single on-demand refreshes when the user returns.

### 3.3 Server-Side Maintenance vs Client Abuse
- **Never perform database maintenance from client code.** Never invoke `cleanup_stale_sessions`, `cleanup_old_messages`, `cleanup_inactive_rooms`, or `DELETE FROM ypt_room_members` from client hooks or tab mounts.
- All cleanup jobs must execute on the database server via `pg_cron`.
- Maintenance functions must have their `EXECUTE` privileges revoked from `PUBLIC`, `anon`, and `authenticated` roles.

### 3.4 Leaderboard & Ranking Queries
- **Never use `.limit(100)` on raw `study_sessions` rows.** Fetching raw rows and aggregating in JavaScript wastes bandwidth and produces incorrect rankings.
- Use server-side SQL aggregation RPCs (`get_leaderboard_today`, `get_leaderboard_week`) and cache client results for at least 2 minutes.
- Active study sessions must dynamically compute elapsed time from `started_at` (capped at `last_heartbeat + 300s` and `now()`) so active users never display 0 seconds.

### 3.5 PostgreSQL Row-Level Security (RLS)
- In all RLS policies, wrap volatile auth functions in scalar subqueries: `(select auth.uid())`, `(select auth.jwt())`.
- This ensures PostgreSQL evaluates the auth state once per query rather than once per scanned row.

### 3.6 Guest Auth & Upserts
- Guest account initialization must use:
  ```ts
  .upsert(payload, { onConflict: 'device_id', ignoreDuplicates: true })
  ```
  to eliminate unique constraint violation 400/409 error spikes in Supabase logs.
- Deduplicate root profile loading to eliminate concurrent auth race conditions.

### 3.7 Logging & Error Handling
- Never leave `console.log` statements in edge functions or hot render loops.
- Fix all recurring 400 Bad Request sources (e.g. invalid UUIDs passed to UUID-typed RPCs or queries).
- The dev request counter in `src/integrations/supabase/client.ts` must only run when `import.meta.env.DEV` is true.
