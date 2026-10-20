# Supabase Usage & Quota Architecture Guide

## 1. Quota Emergency Context & Baseline
Prior to this optimization, the "bookieshere" Supabase project (`ldnnmpmkoflfmvvpvivy`, `ap-south-1`) exceeded Free plan quotas despite having only 686 monthly active users (MAU):
- **Realtime Messages:** 4,720,000 / 2,000,000 (236% of quota)
- **Egress:** 15.5 GB / 5.0 GB (310% of quota)
- **Log Ingestion:** 16.3 GB / 1.0 GB (1630% of quota)

### Root Causes Identified via ClickHouse/Postgres Logs:
1. **Unfiltered Realtime on High-Frequency Timer Writes:** `study_sessions` timer heartbeats every 30s across hundreds of users caused 1.1M rows/mo and 4.93M WAL evaluations by `realtime.list_changes`.
2. **Cascading Reactive Refetches:** `useYPTPresence`, `useUserStudyStats`, and `useUserStreak` subscribed to table changes and refetched 3.23M active session queries and 1.21M completed session queries.
3. **Client-Side Maintenance Spam:** Clients invoked `cleanup_stale_sessions`, `cleanup_old_messages`, `cleanup_inactive_rooms`, and bulk deletes on every tab visit and every 30 seconds.
4. **Log Explosion from 400 Bad Requests:** Invalid guest UUIDs (`guest_...`) passed into `notification_reads.profile_id` triggered continuous Postgres syntax error log writes.

---

## 2. Quota Targets & Resource Budgets
- **Realtime Messages:** < 800,000 / month (<40% of quota)
- **Egress:** < 2.0 GB / month (<40% of quota)
- **Log Ingestion:** < 1.0 GB / month (>90% reduction)

---

## 3. Migration Sequence (Apply Manually in Order)

> [!IMPORTANT]
> Write migrations to disk only. DO NOT apply directly until database backup is confirmed.
> **Deploy Order:** Deploy frontend and edge function code FIRST, then apply publication migration.

1. **`supabase/migrations/20261020000000_quota_realtime_publication.sql`**
   - Drops `study_sessions`, `materials`, `notification_reads`, and `ypt_rooms` from `supabase_realtime` publication.
   - *Safe: Zero data deletion. Stops Postgres WAL publication.*

2. **`supabase/migrations/20261020000001_cleanup_jobs_cron.sql`**
   - Implements server-side maintenance functions (`cleanup_stale_sessions` with 300s grace, `cleanup_old_messages`, `cleanup_stale_room_members`).
   - Schedules background execution via `pg_cron` (5m, 15m, 30m).
   - Revokes client execution permissions from `anon` and `authenticated`.

3. **`supabase/migrations/20261020000002_leaderboard_rpc.sql`**
   - Creates server-side aggregated RPCs `get_leaderboard_today(top_n)` and `get_leaderboard_week(top_n)`.
   - Returns pre-aggregated study durations grouped by user in IST timezone.

4. **`supabase/migrations/20261020000003_perf_indexes.sql`**
   - Adds indexes using plain `CREATE INDEX IF NOT EXISTS` for unindexed foreign keys and hot queries.
   - Does not index high-churn heartbeat columns.

5. **`supabase/migrations/20261020000004_rls_subquery_auth.sql`**
   - Rewrites 13 RLS policies to wrap `auth.uid()` in `(select auth.uid())` scalar subqueries.
   - Evaluates auth function once per statement instead of once per scanned row.

---

## 4. Rollback Notes Per Phase

### Phase 1: Realtime & Heartbeat
- **Code:** If active counts or presence need rollback, restore `study_sessions` channel in `src/hooks/useYPTPresence.ts`.
- **Database:** If a dropped publication table must be re-added:
  ```sql
  ALTER PUBLICATION supabase_realtime ADD TABLE public.<tablename>;
  ```

### Phase 2: Query Caching & Leaderboard
- **Code:** Revert `defaultOptions` in `src/App.tsx` or `staleTime` values.
- **Database:** If client-side cleanup needs temporary reactivation, grant permissions back:
  ```sql
  GRANT EXECUTE ON FUNCTION public.cleanup_stale_sessions() TO anon, authenticated;
  GRANT EXECUTE ON FUNCTION public.cleanup_old_messages() TO anon, authenticated;
  ```

### Phase 3: Auth & Guest Management
- **Code:** `useYPTUser.ts` upsert falls back safely. If needed, revert `useProfile.ts` `lastLoadedSessionKeyRef` deduplication.

### Phase 4: Images & Web Vitals
- **Assets:** The original `public/logo.png` remains untouched as the master image. Favicon links in `index.html` can be pointed back to `/logo.png`.

### Phase 5: Database Migrations
- **RLS Rollback:** Execute `supabase/migrations/20261020000004_rls_subquery_auth_rollback.sql`.
- **Index Drop:**
  ```sql
  DROP INDEX IF EXISTS idx_study_sessions_user_status_started;
  DROP INDEX IF EXISTS idx_study_sessions_status_started;
  DROP INDEX IF EXISTS idx_room_messages_room_created;
  -- ...
  ```

---

## 5. Pre-Merge Checklist
Before submitting code or approving PRs touching Supabase:
- [ ] Run `npm run lint:realtime` (verifies zero unfiltered `postgres_changes`).
- [ ] Verify `npm run build` passes without errors.
- [ ] Verify no queries use `.limit()` on unaggregated tables for ranking/analytics.
- [ ] Ensure all client polling checks `document.visibilityState === 'visible'`.
- [ ] Ensure guest inserts use `upsert(..., { onConflict: 'device_id', ignoreDuplicates: true })`.
