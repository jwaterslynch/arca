# Arca Mobile + Cloud Sync (Phase 1)

Date: 2026-03-02  
Status: Implementation-ready MVP plan  
Target: Desktop (existing) + Mobile (iOS/Android) + Cloud sync

## 1) Goals

1. Ship Arca on mobile from the same codebase.
2. Keep desktop and mobile in sync for tasks, life practices, focus, and progress.
3. Preserve local-first behavior: app works offline, syncs when online.
4. Keep Phase 1 simple enough to ship quickly.

## 2) Phase 1 architecture (recommended)

Use **Supabase** for auth + Postgres + realtime.  
Use **snapshot + event log** sync in Phase 1 (not fully normalized tables yet).

Rationale:
- Arca state is currently a single rich JSON object (`emptyState()` in `src/index.html`).
- Snapshot sync avoids a risky full schema refactor now.
- Event log gives auditability and later migration path to normalized tables.

### Components

1. Client state (existing):
- local state in app (desktop and mobile)
- same JSON shape already used by Arca

2. Cloud tables:
- `boards` (one board per user, metadata)
- `board_snapshots` (latest canonical JSON state)
- `board_events` (append-only event stream for trace/audit)
- `device_checkpoints` (per-device sync cursor)

3. Auth:
- Supabase Auth email/password (or magic link)

## 3) Data model (Phase 1 SQL)

```sql
create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'My Arca Board',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id)
);

create table if not exists public.board_snapshots (
  board_id uuid primary key references public.boards(id) on delete cascade,
  state_json jsonb not null,
  schema_version text not null,
  server_version bigint not null default 1,
  last_client_modified_at timestamptz null,
  last_client_device_id text null,
  updated_at timestamptz not null default now()
);

create table if not exists public.board_events (
  id bigint generated always as identity primary key,
  board_id uuid not null references public.boards(id) on delete cascade,
  device_id text not null,
  client_event_id text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(board_id, device_id, client_event_id)
);

create table if not exists public.device_checkpoints (
  board_id uuid not null references public.boards(id) on delete cascade,
  device_id text not null,
  last_seen_event_id bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (board_id, device_id)
);
```

## 4) RLS policy model

Every table row is restricted to `owner_id` through `boards`.

Implementation approach:
1. Enable RLS on all `public.*` tables above.
2. Policy rule: authenticated user can access rows where `boards.owner_id = auth.uid()`.
3. Use `exists` subqueries from child tables (`board_snapshots`, `board_events`, `device_checkpoints`) back to `boards`.

## 5) Client sync contract

Device metadata:
- `device_id` (stable UUID generated locally once)
- `client_event_id` (uuid per mutation)
- `local_modified_at` (ISO timestamp)

### 5.1 Push algorithm

On every local mutation:
1. Apply mutation locally immediately (existing behavior).
2. Append local `board_event` (event_type + payload).
3. Debounce (e.g. 800ms) then push:
   - insert unsynced events into `board_events` (idempotent via unique key)
   - upsert `board_snapshots` with full current `state_json`
4. Save returned `server_version` and latest event id.

### 5.2 Pull algorithm

On app launch / reconnect / periodic interval:
1. Fetch latest `board_snapshots` row.
2. If server `updated_at` > local last sync:
   - merge with local unsynced changes:
     - Phase 1 conflict rule: **last-write-wins by `last_modified` timestamp**
     - if local has unsynced events newer than snapshot, replay local events on top
3. Subscribe to realtime updates on `board_snapshots` for current `board_id`.
4. Apply incoming snapshot if newer than local applied server version.

### 5.3 Conflict strategy (Phase 1)

Use simple deterministic rule:
- Compare `state.last_modified` (client) vs `board_snapshots.updated_at` (server).
- Newer wins.
- Local unsynced events are replayed after pull.

Phase 2 upgrade:
- per-entity conflict resolution (task-level clocks) if needed.

## 6) Mapping to existing Arca state

The snapshot stores the existing state shape directly:
- `focus`
- `finish_track`
- `today_focus`
- `life_practices`
- `tasks`
- `sessions`
- `notes`
- `closed_task_log`
- `daily_logs`
- `weekly_reviews`

No migration required for Phase 1 beyond adding sync metadata:
- `sync.device_id`
- `sync.last_server_version`
- `sync.last_synced_at`

## 7) Mobile app path (same codebase)

Use Tauri 2 mobile targets:
1. `tauri android init`
2. `tauri ios init`
3. Build responsive layout adjustments:
   - collapse multi-column desktop sections to stacked cards
   - move dense tables to list cards
   - keep AI inbox and task funnel usable with touch targets >=44px

Release targets:
- Android AAB -> Play Console
- iOS archive -> App Store Connect

## 8) Implementation workstreams (multi-AI parallel)

## Workstream A: Backend (Supabase)
Owner: AI-Agent-Backend

1. Create migrations for tables in section 3.
2. Add RLS + policies.
3. Add RPC helpers:
   - `upsert_board_snapshot(board_id, state_json, schema_version, device_id, client_modified_at)`
   - `append_board_event(board_id, device_id, client_event_id, event_type, payload)`
4. Validate idempotency and policy coverage.

Deliverables:
- SQL migration files
- Policy test script
- short ops README

## Workstream B: Client sync core
Owner: AI-Agent-Client-Core

1. Add `sync` module in app JS:
   - queue unsynced events
   - debounced push
   - pull + apply snapshot
2. Add online/offline detection and retry backoff.
3. Add realtime subscription handler.
4. Add minimal sync status UI:
   - `Synced`, `Syncing`, `Offline`, `Conflict resolved`

Deliverables:
- `sync.js` (or inline module)
- integration with existing `saveState()` calls
- tests for push/pull idempotency

## Workstream C: Auth + onboarding
Owner: AI-Agent-Auth

1. Add auth screen (email + magic link).
2. First-login flow:
   - create/get board row
   - create initial snapshot if none exists
3. Add logout + device reset safety.

Deliverables:
- auth UI + session persistence
- board bootstrap logic

## Workstream D: Mobile UX
Owner: AI-Agent-Mobile-UI

1. Responsive layout pass for iPhone + Android sizes.
2. Touch-first controls for pipeline/task actions.
3. Ensure onboarding and AI workspace are mobile-usable.

Deliverables:
- CSS breakpoints + component adjustments
- device screenshots checklist

## 9) QA checklist (Phase 1)

1. Desktop create task -> appears on mobile within realtime window.
2. Mobile complete/delete task -> reflects on desktop.
3. Offline mobile edits -> sync on reconnect without data loss.
4. Simultaneous edits from two devices -> deterministic outcome.
5. First install on new device -> pulls full board correctly.
6. Logout/login same user -> board restored.

## 10) Delivery sequence

1. Backend schema + RLS
2. Desktop sync core (behind feature flag: `cloudSyncEnabled`)
3. Mobile target init + responsive pass
4. Auth onboarding
5. Realtime subscribe + conflict handling
6. Testflight/Internal testing
7. Public store submissions

## 11) Out of scope (Phase 1)

1. Multi-user shared boards.
2. Fine-grained CRDT merge.
3. Team workspaces and permissions beyond single owner.
4. Full normalized analytics warehouse.

---

If Phase 1 is accepted, next artifact should be:
- `SUPABASE_SCHEMA_v1.sql`
- `SYNC_ENGINE_SPEC_v1.md` with exact request/response payloads
- implementation tickets split by Workstream A/B/C/D.
