# Repository Instructions & Supabase Budget Rules

## Supabase Resource Budgets (Free Tier Quota Protection)
Our project runs on the Supabase Free plan with tight quota constraints (686 MAU):
- **Realtime Messages Budget:** < 800,000 / month (<40% of 2M quota).
- **Egress Budget:** < 2.0 GB / month (<40% of 5 GB quota).
- **Log Ingestion Budget:** < 1.0 GB / month (>90% reduction from legacy leak).

## Mandatory Engineering Rules

### 1. Realtime Subscriptions
- **Never subscribe to `postgres_changes` without a restrictive `filter:`.** Unfiltered table subscriptions cause WAL broadcast storms to all active clients.
- Run `npm run lint:realtime` before opening any pull request or pushing code.
- Static or slowly changing data (e.g. `materials`, `ypt_rooms`, `notification_reads`) MUST NOT be in `supabase_realtime` publication. Use React Query caching with reasonable `staleTime`.
- Presence updates must occur ONLY on state transitions (session start, session stop, subject switch) with minimum 5-second throttling. NEVER dispatch presence on timer ticks or heartbeats.

### 2. Client Polling & Background Tabs
- Polling intervals must never be shorter than 60 seconds (120s recommended for leaderboards).
- All polling intervals must pause when the browser tab is hidden:
  ```ts
  if (document.visibilityState !== 'visible') return;
  ```
- Listen for `visibilitychange` to trigger single on-demand refreshes when the user returns.

### 3. Server-Side Maintenance vs Client Abuse
- **Never perform database maintenance from client code.** Never invoke `cleanup_stale_sessions`, `cleanup_old_messages`, `cleanup_inactive_rooms`, or `DELETE FROM ypt_room_members` from client hooks or tab mounts.
- All cleanup jobs must execute on the database server via `pg_cron`.

### 4. Leaderboard & Ranking Queries
- **Never use `.limit(100)` on raw `study_sessions` rows.** Fetching raw rows and aggregating in JavaScript wastes bandwidth and produces incorrect rankings.
- Use server-side SQL aggregation RPCs (`get_leaderboard_today`, `get_leaderboard_week`) and cache client results for at least 2 minutes.

### 5. PostgreSQL Row-Level Security (RLS)
- In all RLS policies, wrap volatile auth functions in scalar subqueries: `(select auth.uid())`, `(select auth.jwt())`.
- This ensures PostgreSQL evaluates the auth state once per query rather than once per scanned row.

### 6. Guest Auth & Upserts
- Guest account initialization must use:
  ```ts
  .upsert(payload, { onConflict: 'device_id', ignoreDuplicates: true })
  ```
  to eliminate unique constraint violation 400/409 error spikes in Supabase logs.
- Deduplicate root profile loading to eliminate concurrent auth race conditions.

### 7. Logging & Error Handling
- Never leave `console.log` statements in edge functions or hot render loops.
- Fix all recurring 400 Bad Request sources (e.g. invalid UUIDs passed to UUID-typed RPCs or queries).
