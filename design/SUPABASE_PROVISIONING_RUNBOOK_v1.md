# Supabase Provisioning Runbook v1

Date: 2026-03-03  
Scope: Arca Cloud Sync Phase 1 backend setup

## 1) Create project

1. In Supabase, create a new project in your preferred region.
2. Wait for project bootstrap to complete.
3. Copy these values from Project Settings:
   - `Project URL` (for app config)
   - `anon public key` (for app config)

## 2) Apply schema

1. Open SQL Editor.
2. Paste and run:
   - `design/SUPABASE_SCHEMA_v1.sql`
3. Confirm success (no errors) and that the following tables exist:
   - `public.boards`
   - `public.board_snapshots`
   - `public.board_events`
   - `public.device_checkpoints`

## 2.1) Apply health sync foundation

For the dark-launched health sync foundation, also paste and run:

- `supabase/migrations/20260428180000_health_sync_foundation.sql`

Confirm success and that the following tables exist:

- `public.arca_devices`
- `public.health_capture_events`
- `public.health_device_checkpoints`
- `public.recovery_snapshots`
- `public.body_measurements`

Health sync is separate from board snapshot sync. The phone capture app should not upload real dogfood data until the rollout boundary in `design/DECISION_REACTIVATE_TRACK_A_HEALTH_SYNC_FOUNDATION.md` is satisfied.

## 3) Verify RPC functions

Run these checks in SQL Editor:

```sql
select proname
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and proname in (
    'ensure_user_board',
    'upsert_board_snapshot',
    'append_board_event',
    'upsert_device_checkpoint',
    'register_health_device',
    'append_health_capture_event',
    'upsert_recovery_snapshot_from_capture',
    'upsert_body_measurement_from_capture',
    'tombstone_health_capture_record',
    'upsert_health_device_checkpoint'
  )
order by proname;
```

Expected: all function names for the schemas you applied are returned.

## 4) Enable Auth mode for testing

Phase 1 sync requires authenticated requests because all policies are `to authenticated`.

Recommended for early testing:
1. Enable email/password auth in Supabase Auth settings.
2. Create a test user account in Auth.
3. Sign in with REST or app UI (when auth flow lands) and use that access token for RPC calls.

## 5) Optional smoke test via REST (authenticated)

Use a valid user JWT as `SUPABASE_ACCESS_TOKEN`.

```bash
curl -sS "$SUPABASE_URL/rest/v1/rpc/ensure_user_board" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"p_name":"My Arca Board"}'
```

Expected: UUID board id.

## 5.1) Health sync smoke test

After applying `supabase/migrations/20260428180000_health_sync_foundation.sql`, run the automated health smoke test against a test user:

```bash
SUPABASE_URL=https://project.supabase.co \
SUPABASE_ANON_KEY=... \
SUPABASE_TEST_EMAIL=test@example.com \
SUPABASE_TEST_PASSWORD=... \
npm run smoke:health-sync
```

Expected:

- device registration succeeds
- recovery and body records upsert
- duplicate `client_event_id` retries do not mutate existing records
- reusing a `client_event_id` for a different entity fails
- tombstones set `deleted_at`
- exactly four health events persist for the test records
- device checkpoint advances

## 6) Operational notes

- Do not ship service-role keys in client builds.
- Keep RLS enabled on all sync tables.
- `board_events` inserts are idempotent per `(board_id, device_id, client_event_id)`.
- `health_capture_events` inserts are idempotent per `(owner_id, source_device_id, client_event_id)`.
- `upsert_board_snapshot` is the canonical write path for snapshot sync and increments `server_version`.
