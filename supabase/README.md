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
