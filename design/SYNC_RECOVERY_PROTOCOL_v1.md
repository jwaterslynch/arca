# Sync Recovery Protocol (v1)

Date: 2026-04-21  
Status: Active recovery brief  
Scope: desktop auth + single-user event sync safety for future companion work

## Goal

Recover the companion-sync effort into a disciplined, testable state.

This is **not** a companion PWA build brief. It is the protocol that must pass before a writable companion is allowed to exist.

## Current State

- Supabase project exists and auth works.
- Desktop has a cloud sign-in flow.
- Experimental event-sync work exists on `claude/task-event-sync`.
- That branch has not been proven safe enough for primary daily-use data.

The specific known failure mode was severe:

- an empty local client was capable of pushing before pulling
- that could overwrite remote state with an empty snapshot

That class of bug is unacceptable for cross-device sync.

## Non-Negotiable Rules

1. Do not test this work against the primary live board.
2. Use a second account, second board, or separate project if needed.
3. Snapshots are bootstrap / checkpoint / recovery only.
4. Granular task events are the mutation primitive for cross-device task sync.
5. No writable companion UI ships until this protocol passes.
6. Backup and restore remain desktop-only and are tested only in real Tauri runtime.

## Branch Discipline

Use one clean branch off `main` for recovery work:

- `sync/task-events-v1`

Do not continue layering work on top of stale mixed-purpose branches.

If code is salvaged from `claude/task-event-sync`, port it intentionally. Do not treat that branch as production-ready by default.

## Recovery Sequence

### Phase 1 — Audit and isolate

1. Review the existing event-sync implementation
2. Extract what is worth keeping:
   - pull-before-push behavior
   - event schema
   - `lastSeenEventId` cursor handling
   - task event reducer
3. Discard anything unclear or mixed with unrelated UI tweaks

### Phase 2 — Safe single-user desktop sync

Target:

- desktop client A and desktop client B
- same test account
- same board
- separate device IDs

Required invariants:

- sign-in from empty client must pull cloud state first
- empty local client must never overwrite non-empty remote state on first sign-in
- own-device events must not be re-applied on pull
- stale snapshots must not trump fresher task events

### Phase 3 — Event replay proof

The following actions on client A must reproduce correctly on client B:

- create task
- update task fields
- move task between columns
- reorder tasks within a column
- complete task
- reopen task
- delete task

Pass conditions:

- no duplicate tasks
- no silent task loss
- no incorrect stage/order after replay
- no full-state overwrite of task state after event replay is active

### Phase 4 — Companion shell unlock

Only after Phases 1-3 pass:

- scaffold the browser PWA shell
- Execute + Plan only
- read/write tasks only
- no Health/Wealth
- no browser-side AI provider keys

## Test Matrix

### A. Bootstrap

1. Existing populated board → new empty client signs in
2. New client receives remote state
3. No empty push occurs before first pull

### B. Mutation replay

1. Create task on client A → appears on client B
2. Move task on client A → correct stage and order on client B
3. Complete/reopen on client A → correct status on client B
4. Delete task on client A → removed on client B

### C. Reorder determinism

1. Reorder within Backlog
2. Reorder within Today
3. Move then reorder

Expected:

- deterministic order reconstruction
- no duplicate IDs
- no fallback snapshot stomp

### D. Offline / reconnect

1. Client B goes offline
2. Mutates queue locally
3. Reconnects and flushes
4. Client A receives final state correctly

Expected:

- queued events flush in order
- checkpoint advances correctly
- no event replay loop

## Companion App Gate

A writable companion app is blocked until:

- all test matrix items above pass
- the behavior is re-run after a fresh install
- the behavior is re-run after sign-out / sign-in
- the behavior is re-run with a snapshot already present

This is the minimum bar, not the ideal bar.

## Decision Point

After the audit, make one explicit call:

### Option A — Salvage current event-sync work

Use this if:

- most of the reducer and event schema are sound
- the bugs are local and understandable
- the branch can be ported cleanly to `sync/task-events-v1`

### Option B — Rewrite cleanly

Use this if:

- the branch is too mixed
- the sync state machine is still hard to reason about
- confidence remains low after review

Either outcome is acceptable.

Silent decay is not.

