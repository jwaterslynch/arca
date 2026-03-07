# Supabase Provisioning Runbook v1

Date: 2026-03-03  
Scope: PPP Flow Cloud Sync Phase 1 backend setup

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
    'upsert_device_checkpoint'
  )
order by proname;
```

Expected: all 4 function names returned.

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
  -d '{"p_name":"My PPP Board"}'
```

Expected: UUID board id.

## 6) Operational notes

- Do not ship service-role keys in client builds.
- Keep RLS enabled on all sync tables.
- `board_events` inserts are idempotent per `(board_id, device_id, client_event_id)`.
- `upsert_board_snapshot` is the canonical write path for snapshot sync and increments `server_version`.
