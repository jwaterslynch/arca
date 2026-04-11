# Arca Companion App — Architecture Spec (v2)

Date: 2026-04-10
Status: Ready for implementation
References:
- `MOBILE_COMPANION_PRD_v1.md` (product requirements)
- `MOBILE_COMPANION_STRATEGY_v1.md` (UX strategy)
- `MOBILE_CLOUD_PHASE1_PLAN.md` (sync plan)
- `SUPABASE_SCHEMA_v1.sql` (database schema)
- `SUPABASE_PROVISIONING_RUNBOOK_v1.md` (setup guide)
- `MOBILE_COMPANION_BUILD_CHECKLIST_v1.md` (tickets)

## 1. Strategic Decision

**Build a browser-based PWA, not a native mobile app.**

Rationale:
- One codebase serves phone, tablet, and desktop browser
- PWA gives "Add to Home Screen" with app-like experience
- No App Store review cycles during rapid iteration
- Native wrapper (Capacitor) is a later option if usage proves it
- Arca desktop remains the primary control surface

**v1 implementation lock:**
- Plain Vite + vanilla TypeScript
- Vanilla CSS
- No SvelteKit, React, or native mobile wrapper in v1

## 2. Scope: What's In vs Out

### v1 Companion (ship this)

| Surface | Capabilities |
|---------|-------------|
| **Execute** | View Today list, reorder, mark done/reopen, quick-capture new task |
| **Plan** | View all columns (Backlog / Next Up / Today / Done Today), add task, move between columns, edit title/category/depth |
| **Sync** | Auth, cloud push/pull, offline queue, conflict resolution |
| **Quick Capture** | Single-field task entry at top of Execute, auto-stages to Backlog |

### v1 Companion — explicitly excluded

- Health module
- Wealth module
- Full onboarding wizard (companion gets minimal "sign in + sync" flow)
- Local AI / Ollama (requires desktop)
- Pomodoro timer audio/native chimes
- Weekly review authoring
- Settings beyond account + sync status
- Life practices editing (read-only display OK)

### v2 Companion (later)

- AI coach via Arca-hosted backend proxy
- Life practices logging
- Timer with basic start/stop
- Push notifications (focus reminders, review nudges)

## 3. Architecture Overview

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Arca Desktop │     │ Companion PWA│     │ Companion PWA│
│   (Tauri)    │     │  (Phone)     │     │  (Browser)   │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       │  Supabase JS SDK   │  Supabase JS SDK   │
       │                    │                    │
       └────────────┬───────┴────────────────────┘
                    │
           ┌────────▼────────┐
           │    Supabase     │
           │                 │
           │  Auth (email)   │
           │  Postgres       │
           │  Realtime       │
           │  Edge Functions │ ← v2: AI proxy
           └─────────────────┘
```

### Key Principle: Event-Sourced Sync

The desktop app already has a local **ledger events** system (`append_events`, `list_events` in `lib.rs`). The Supabase schema has `board_events` with idempotent `client_event_id`. This is the correct sync primitive.

**Every mutation is an event.** Clients emit events locally, push them to Supabase, and pull events from other devices. State is materialized from events on each client.

This avoids the fragility of full JSON snapshot sync (last-write-wins on a 500KB blob is a data loss risk).

## 4. Data Model

### 4.1 Existing Supabase Tables (from SUPABASE_SCHEMA_v1.sql)

| Table | Purpose |
|-------|---------|
| `boards` | One board per user (owner_id → auth.users) |
| `board_snapshots` | Latest materialized state as JSONB (checkpoint, not source of truth) |
| `board_events` | Append-only event stream (idempotent via board_id + device_id + client_event_id) |
| `device_checkpoints` | Per-device cursor (last_seen_event_id) |

All tables have RLS policies restricting access to board owner. Schema is already written and ready to deploy.

### 4.2 Event Schema

Events use the same shape as the existing desktop ledger:

```typescript
interface BoardEvent {
  client_event_id: string;   // uid() — globally unique, idempotent key
  device_id: string;          // stable per-device identifier
  event_type: string;         // e.g. "task_created", "task_moved", "task_completed"
  payload: {
    entity_type: string;      // "task" | "life_practice" | "focus" | "commitment"
    entity_id: string;        // the task/practice ID
    [key: string]: any;       // event-specific data
  };
  created_at: string;         // ISO timestamp from client
}
```

### 4.3 Event Types (v1 — Execute + Plan only)

| Event Type | Payload | Source |
|-----------|---------|--------|
| `task_created` | `{title, category, importance, urgency, depth, stage}` | Both |
| `task_updated` | `{field, old_value, new_value}` | Both |
| `task_moved` | `{from_stage, to_stage, position}` | Both |
| `task_completed` | `{completed_at}` | Both |
| `task_reopened` | `{reopened_at}` | Both |
| `task_deleted` | `{deleted_at}` | Both |
| `task_reordered` | `{stage, ordered_ids[]}` | Both |
| `focus_wig_updated` | `{title, deadline, measure}` | Desktop only (v1) |
| `snapshot_checkpoint` | `{schema_version}` | Both |

### 4.4 Shared Core (extracted module)

Both desktop and companion import a shared core. This is a plain JS/TS module:

```
arca-core/
  schema.ts        — task, practice, focus type definitions
  events.ts        — event type constants + constructors
  reducers.ts      — apply event → state (materializer)
  validators.ts    — task validation, stage limits
  date-helpers.ts  — localDateKey, parseLocalDateKey, formatDateLong
  sync-client.ts   — Supabase push/pull/subscribe logic
  constants.ts     — TODAY_STAGE_LIMIT, stages, categories
```

This is extracted from the existing `index.html` functions. It's the same logic, just importable.

## 5. Auth Model

### 5.1 Flow

```
User opens companion → Sign In / Sign Up screen
  → Email + password (Supabase Auth)
  → On success: call ensure_user_board() → get board_id
  → Pull latest snapshot → materialize local state
  → Subscribe to realtime events
  → Ready
```

### 5.2 Desktop Linking

Desktop gets the same auth flow. When a user signs in on desktop:
1. Desktop calls `ensure_user_board()`
2. Pushes current local state as the initial snapshot checkpoint
3. Starts event-based sync

No QR pairing needed in v1 — both clients authenticate independently with the same account. QR linking is a v2 convenience optimization.

### 5.3 Auth Rules

- Supabase RLS ensures users only see their own board
- API keys (OpenAI, Anthropic, etc.) are **never** synced — they stay in device-local storage
- AI provider config syncs the provider name and model choice, not the key
- `device_id` is generated once per install and stored locally
- Desktop and companion each store their own Supabase session locally; auth tokens are not shared across devices

## 6. Sync Protocol

### 6.1 Push (client → server)

```
On every local mutation:
  1. Apply event to local state immediately (optimistic)
  2. Append event to local queue
  3. If online: flush queue to Supabase via append_board_event()
  4. On success: update local checkpoint
  5. If offline: events accumulate in queue, flushed on reconnect
```

### 6.2 Pull (server → client)

```
On app open / foreground / manual refresh:
  1. Read local checkpoint (last_seen_event_id)
  2. SELECT * FROM board_events WHERE id > checkpoint ORDER BY id
  3. For each event not from this device: apply to local state
  4. Update checkpoint
```

### 6.3 Realtime (continuous)

```
Subscribe to Supabase Realtime on board_events INSERT
  → On new event from another device_id: apply to local state
  → Update checkpoint
```

Realtime is a latency optimization, not the sole source of correctness. Clients still pull on app open, foreground, and manual refresh.

### 6.4 Conflict Resolution

**Last-event-wins at the field level.**

Because events are granular (field-level updates, not full-object replacements), most conflicts resolve naturally:
- Device A moves task to Today, Device B edits task title → both apply cleanly
- Device A and B both move the same task → last event by server `id` wins
- Device A deletes a task, Device B edits it → delete wins (tombstone)

Edge cases logged for diagnostics but no user-facing conflict UI in v1.

### 6.5 Snapshot Checkpoints

Periodically (every 50 events or on app close), the client pushes a full `board_snapshot` to Supabase. This is a performance optimization — new devices can hydrate from the snapshot instead of replaying thousands of events.

**Important rule:** snapshots are checkpoints, not authority. After the initial bootstrap, clients must not overwrite remote state with full-state replacement. All normal cross-device mutation flows through events.

```
Hydration order:
  1. Pull latest board_snapshot (fast full state)
  2. Pull events after snapshot's server_version
  3. Apply those events on top
  4. Re-apply any still-pending local unsynced events
  5. Subscribe to realtime
```

## 7. Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Framework** | Plain Vite + vanilla TS | Matches desktop philosophy, smallest bundle, least integration overhead |
| **Styling** | Vanilla CSS | Reuse desktop design tokens/patterns without introducing utility-framework complexity |
| **State** | In-memory + IndexedDB | Same pattern as desktop (in-memory state, persisted to local store) |
| **Backend** | Supabase (Auth + Postgres + Realtime) | Already designed, schema ready, free tier sufficient for alpha |
| **PWA** | Vite PWA plugin / manual service worker | Offline support, Add to Home Screen |
| **Deployment** | Vercel or Cloudflare Pages | Static deploy, edge CDN, free tier |
| **Domain** | `app.witharca.app` | Subdomain of existing landing page |

### Recommendation: Vanilla TS + Vite

This is the v1 choice. Do not introduce SvelteKit unless the companion later proves a need for more complex routing, SSR, or form/state orchestration.

## 8. Companion PWA Screens

### 8.1 Sign In

```
┌─────────────────────────┐
│         🏛 Arca          │
│                         │
│  ┌───────────────────┐  │
│  │ Email             │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ Password          │  │
│  └───────────────────┘  │
│                         │
│  [ Sign In ]  [ Sign Up]│
│                         │
│  Forgot password?       │
└─────────────────────────┘
```

### 8.2 Execute (default tab)

```
┌─────────────────────────┐
│ Today          + Add    │
│─────────────────────────│
│ ┌─────────────────────┐ │
│ │ Quick capture...    │ │
│ └─────────────────────┘ │
│                         │
│ ☐ Write intro section   │
│   Strategic · Deep      │
│                         │
│ ☐ Reply to client email │
│   Maintenance · Shallow │
│                         │
│ ☑ Review PR #42     ✓   │
│   Strategic · Deep      │
│                         │
│ ── Done Today (3) ──    │
│ ✓ Stand-up notes        │
│ ✓ Deploy staging        │
│ ✓ Update docs           │
│                         │
├─────────────────────────┤
│  Execute    Plan    ⚙   │
└─────────────────────────┘
```

Interactions:
- Tap checkbox → mark done (event: `task_completed`)
- Tap task → expand inline edit (title, category, depth)
- Long-press / drag → reorder within Today
- Quick capture → creates task in Backlog by default, Today if < limit
- Pull-to-refresh → manual sync

### 8.3 Plan

```
┌─────────────────────────┐
│ Board           + Add   │
│─────────────────────────│
│ TODAY (3/5)              │
│ ☐ Write intro section   │
│ ☐ Reply to client email │
│ ☐ Review PR #42         │
│                         │
│ NEXT UP (4)             │
│ ☐ Research competitors  │
│ ☐ Draft slides          │
│ ☐ Book venue            │
│ ☐ Update roadmap        │
│                         │
│ BACKLOG (12)            │
│ ☐ Redesign landing page │
│ ☐ Write test suite      │
│ ...                     │
│                         │
├─────────────────────────┤
│  Execute    Plan    ⚙   │
└─────────────────────────┘
```

Interactions:
- Tap task → inline edit
- Swipe right → move to next stage (Backlog → Next Up → Today)
- Swipe left → move back one stage
- Long-press → drag to reorder within column
- Tap column header → collapse/expand

### 8.4 Settings (gear icon → bottom sheet)

```
┌─────────────────────────┐
│ Settings                │
│─────────────────────────│
│ Account                 │
│ julian@email.com        │
│ [ Sign Out ]            │
│                         │
│ Sync                    │
│ Status: Synced ✓        │
│ Last sync: 2 min ago    │
│ [ Sync Now ]            │
│                         │
│ About                   │
│ Arca Companion v0.1.0   │
│ [ Get Desktop App ]     │
└─────────────────────────┘
```

## 9. Build Phases

### Phase 0: Backend (1–2 days)

**Goal:** Supabase project live, schema deployed, auth working.

- [ ] Create Supabase project (follow `SUPABASE_PROVISIONING_RUNBOOK_v1.md`)
- [ ] Run `SUPABASE_SCHEMA_v1.sql`
- [ ] Verify RPC functions
- [ ] Enable email/password auth
- [ ] Create test user, verify RLS with curl
- [ ] Store Supabase URL + anon key in repo config

### Phase 1: Desktop Sync Integration (2–3 days)

**Goal:** Desktop app can auth with Supabase and sync via events.

This is the critical prerequisite. The companion is useless without sync.

- [ ] Add Supabase JS client to desktop (load via CDN or bundle)
- [ ] Add Sign In / Sign Up UI in desktop settings
- [ ] On auth: call `ensure_user_board()`, store board_id
- [ ] Push existing local state as initial snapshot
- [ ] Rewire `queueLedgerEvent()` to also push to Supabase `append_board_event()`
- [ ] Pull events from other devices on app open
- [ ] Subscribe to Realtime for live cross-device sync
- [ ] Add sync status indicator (Synced / Syncing / Offline)
- [ ] Verify: two desktop instances stay in sync

### Phase 2: Companion PWA Shell (2–3 days)

**Goal:** Deployable PWA with auth, sync, and Execute tab.

- [ ] Scaffold Vite + vanilla TS project (`arca-companion/`)
- [ ] Set up PWA manifest + service worker (offline shell)
- [ ] Auth screen (Supabase email/password)
- [ ] Extract shared core from `index.html` into `arca-core/`
- [ ] Implement sync client (same protocol as desktop)
- [ ] Build Execute tab (Today list, quick capture, done/reopen)
- [ ] Deploy to `app.witharca.app` via Vercel
- [ ] Test on iPhone Safari + Chrome Android

### Phase 3: Plan Tab + Polish (1–2 days)

**Goal:** Full v1 companion with Plan tab.

- [ ] Build Plan tab (column view, add/move/edit tasks)
- [ ] Add swipe gestures for stage transitions
- [ ] Add pull-to-refresh
- [ ] Add offline queue + reconnect behavior
- [ ] Add "Add to Home Screen" prompt
- [ ] Cross-device smoke test (desktop ↔ phone ↔ browser)

### Phase Gates

**Phase 1 is complete only if:**
- Two desktop instances stay in sync within 5 seconds
- Offline desktop edits queue and replay correctly on reconnect
- Delete beats stale edit for the same entity
- No full-state overwrite is used after initial bootstrap

**Phase 2 is complete only if:**
- Companion auth works on iPhone Safari and Chrome Android
- Execute quick-capture, done/reopen, and reorder all sync back to desktop
- Pull-to-refresh and foreground sync both work after device sleep
- Companion can be installed via "Add to Home Screen"

### Phase 4: AI via Backend Proxy (v2, later)

**Goal:** AI coaching available in companion without exposing API keys.

- [ ] Supabase Edge Function: `/ai-proxy`
  - Accepts prompt + board context
  - Reads user's AI provider preference from board config
  - Calls provider API server-side with Arca's API key (or user's stored key)
  - Returns structured response
- [ ] Rate limiting per user (prevent abuse)
- [ ] Companion AI tab: chat interface calling Edge Function
- [ ] Same `parseCoachActionsFromResponse()` + `applySingleAiAction()` logic

## 10. Repo Structure

```
arca/                          ← existing desktop repo
  src/index.html               ← desktop app shell
  src-tauri/                   ← Tauri backend
  companion/                   ← PWA app (v1 lives in same repo)
    src/
      main.ts
      auth.ts
      sync.ts
      screens/
        execute.ts
        plan.ts
        settings.ts
      components/
        task-card.ts
        quick-capture.ts
        bottom-nav.ts
    public/
      manifest.json
      sw.js
    index.html
    vite.config.ts
  shared/arca-core/            ← shared event/schema/materializer code
    schema.ts
    events.ts
    reducers.ts
    validators.ts
    date-helpers.ts
    sync-client.ts
    constants.ts
```

**v1 rule:** keep the companion and shared core in the same repo. Do not split them into separate repos, npm packages, or a monorepo toolchain until the product proves it needs that overhead.

## 11. Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Sync primitive | Events (not snapshot blob) | Granular conflict resolution, audit trail, no full-state overwrites |
| Auth | Supabase email/password | Simple, free, RLS built-in |
| PWA vs native | PWA first | One codebase, no App Store, fast iteration |
| Framework | Vanilla TS + Vite | Matches desktop philosophy, smallest bundle, no lock-in |
| AI on companion | Server-side proxy (v2) | Can't expose API keys in browser; needs backend |
| Offline | IndexedDB + event queue | Works offline, syncs on reconnect |
| Desktop auth | Same Supabase, same account | No QR pairing needed — both authenticate independently |
| Repo shape | Same repo for v1 | Lower coordination cost while desktop and companion evolve together |

## 12. Migration Path for Desktop

The desktop currently uses:
- `localStorage` for state
- SQLite (`ARCA_LEDGER.sqlite3`) for ledger events
- Optional JSON file for backup

With sync enabled:
- SQLite remains the local source of truth
- Supabase becomes the cross-device source of truth
- Local state materializes from local SQLite (fast) and merges remote events on sync
- Users who don't sign in continue to work fully offline (zero regression)

## 13. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Event ordering across devices | Data inconsistency | Server-assigned sequential IDs; last-event-wins |
| Large state on slow connections | Slow initial sync | Snapshot checkpoint + incremental events |
| API key leakage via sync | Security breach | Keys excluded from synced state; stripped before push |
| Scope creep into full parity | Delayed ship | Hard scope gate: Execute + Plan only in v1 |
| Supabase free tier limits | Service disruption | 500MB DB, 50K monthly active users — sufficient for alpha/beta |

## 14. Success Metrics (v1)

1. Desktop change appears on companion within 5 seconds
2. Companion task creation appears on desktop within 5 seconds
3. App works offline and syncs correctly on reconnect
4. PWA installable on iOS Safari and Chrome Android
5. < 200KB initial JS bundle (excluding service worker cache)
6. Zero API key exposure in network traffic or synced state

## 15. What to Build First

**The unlock is Phase 1 (desktop sync), not the companion UI.**

If desktop can't push/pull events to Supabase reliably, the companion has nothing to display. Build order:

1. **Phase 0** — stand up Supabase (1 day)
2. **Phase 1** — desktop sync works (2–3 days)
3. **Phase 2** — companion shell with Execute (2–3 days)
4. **Phase 3** — Plan tab + polish (1–2 days)

Total: ~7–10 days of focused work for a working v1 companion.
