# Arca Supabase Backend

This folder holds migration assets for the cloud backend.

The current live-safe slice is health sync foundation:

- user-scoped health capture records
- append-only capture events
- idempotent retry keys
- domain tables for desktop charts/coaching

The existing board snapshot/event schema still lives in `design/SUPABASE_SCHEMA_v1.sql`. That older board sync path is not the recommended write path for health capture.

## Apply Order

For a new Supabase project:

1. Apply `design/SUPABASE_SCHEMA_v1.sql` if desktop board sync is needed.
2. Apply migrations in `supabase/migrations/` in filename order.

For the health foundation slice, apply:

```text
supabase/migrations/20260428180000_health_sync_foundation.sql
```

## Guardrails

- Do not put Supabase service-role keys in any client.
- Keep RLS enabled on every table.
- Use RPC calls for writes from iOS/desktop clients.
- Treat `health_capture_events` as append-only.
- Store screenshots locally by default. Cloud media upload requires a separate opt-in design.

## Local Contract Check

Run:

```bash
npm run validate:health-sync-schema
```

This is a lightweight static contract check, not a substitute for applying the migration to a test Supabase project.

## Remote Smoke Test

After applying the health migration to a test Supabase project and creating a test user, run:

```bash
SUPABASE_URL=https://project.supabase.co \
SUPABASE_ANON_KEY=... \
SUPABASE_TEST_EMAIL=test@example.com \
SUPABASE_TEST_PASSWORD=... \
npm run smoke:health-sync
```

The smoke test signs in as the test user, uses the dark-launched JS health sync client, registers a device, upserts one recovery snapshot and one body measurement, verifies duplicate `client_event_id` retries are true no-ops, loads the repository/read-model/coach snapshot path, tombstones both records, and advances a checkpoint.

## Client Contract

The dark-launched client wrapper lives at:

```text
src/lib/healthSyncClient.js
```

It is not wired into the desktop app or iOS app yet. It exists so the backend RPC contract can be tested and reused when upload/import work begins.

Run:

```bash
npm run test:health-sync
```

Individual checks:

```bash
npm run test:health-sync-client
npm run test:health-sync-read-model
npm run test:health-sync-repository
npm run test:health-coach-context
```
