# Idea: Shared Team Task Board

**Status:** Future ambition. 🌠 Not in current scope. Blocked on Track A.
**Date filed:** 2026-04-20

## The idea

A cloud-synced shared task board that multiple users can view and edit. Sits alongside personal boards — the user can toggle between "Personal" and "Team: <name>" via a board picker.

Principal use case:
- Collaborating with a specific colleague (Brendan) on FatooraFi (business venture) + research
- Shared visibility on who's doing what
- Near-real-time updates (not polling every 60s)

## Why this is a big build

This is a product expansion, not a feature. Single-user → multi-user transforms most layers of the app.

### What it actually requires

1. **Multi-user data model**
   - Board ownership: who owns, who can edit, who can view
   - User identity on every change (who created/edited/completed)
   - Invite / accept flow
   - Removal / revocation semantics

2. **Concurrent edit resolution**
   - Our existing event sync handles sequential operations (one user at a time). Multi-user needs conflict resolution for simultaneous edits.
   - Cases: two people editing the same task; one deleting what another is editing; reordering while completing; offline edits reconciling.
   - Well-understood territory (CRDTs, OT, server-authoritative with last-write-wins) — but none of it is trivial.

3. **Real-time updates**
   - "Relatively real-time" = not polling. Means Supabase Realtime subscriptions, websockets, or push-based updates.
   - Presence indicators (is Brendan online? viewing this task?)
   - UI must update without user action without flickering or stealing focus.

4. **Auth & access control**
   - Current auth: per-user Supabase account, one board.
   - Team layer needs: a "workspace" or "team" concept, RLS policies granting specific people access to specific boards, audit trail of permission changes.

5. **UX changes throughout**
   - Board picker (Personal / FatooraFi / Research)
   - "Assigned to" on every task
   - Activity feed (who did what, when)
   - Mentions / notifications
   - Visual differentiation (whose task? whose edit?)
   - Personal surfaces (Health, Wealth, life practices, timer stats) do NOT appear in team boards

6. **Privacy / scope boundaries**
   - What moves between personal and team boards?
   - Can a task migrate?
   - Does the AI coach see team context, personal context, or both? (It should never leak personal to team.)
   - Who can see your focus-time stats in a team context?

7. **Existing sync is quarantined**
   - The current event-sync implementation is on the `claude/task-event-sync` branch, untested, deferred.
   - Multi-user compounds every sync bug. You cannot build team features on top of sync that hasn't proven itself single-user.

## Sequencing

### Prerequisites (must be true before starting)

- Track A (companion sync) is genuinely solid:
  - Two-device test passes (e.g. desktop + PWA)
  - 30+ days of personal use without data loss or drift
  - All event types idempotent and well-tested
- Desktop auth hardened (sign-in, session refresh, sign-out, recovery)
- Supabase RLS proven for personal boards

### Phase 1 — Minimum team layer (only if prerequisites hold)

- Two-user shared board (you + Brendan)
- Board picker in UI
- "Assigned to" field on tasks
- Polling-based sync (not real-time yet) — 15s interval
- Last-write-wins conflict resolution (acceptable for low-concurrency collaboration)
- Invite flow: you create the board, generate a magic link, Brendan accepts

### Phase 2 — Real-time polish

- Supabase Realtime subscriptions replacing polling
- Presence indicators
- Live cursor / "Brendan is editing" hints
- Activity feed view

### Phase 3 — Scale

- More than 2 users per board
- Role-based permissions (viewer vs. editor)
- Workspace-level settings

## Estimated effort

- **Phase 1:** 6-12 weeks of focused work *after* Track A is solid
- **Phase 2:** another 4-6 weeks
- **Phase 3:** scope-dependent

Total: ~3-6 months post-Track-A.

## Before building

Three questions worth settling first:

1. **Is "in Arca" actually required?** Linear, Notion, and Todoist already do this well. Your FatooraFi work does not have to wait on Arca's roadmap. If the goal is "collaborate with Brendan," using an existing tool is 100× faster and doesn't block Arca's other tracks.

2. **What's the positioning shift?** Arca is currently a personal operating system. Adding team features changes the product story — now it competes with Linear/Todoist. Different users, different marketing, different pricing.

3. **Is this a forcing function for Track A maturity?** Possibly yes — committing to team collaboration with Brendan creates a deadline for Track A working correctly. But it also risks entangling two unfinished tracks.

## Interim recommendation

**Use an existing tool (Linear / Notion / Todoist) for FatooraFi collaboration now.** Keep Arca as your personal system. Revisit shared boards when:
- Track A has been live and solid for 30+ days
- The existing tool is creating real friction that Arca could solve better
- You've validated the personal-product thesis via iOS capture (Track B) and desktop Health v2

Don't let "it would be cool in Arca" pull you into a major infrastructure project before the single-user product is mature.

## Related specs

- [`COMPANION_APP_ARCHITECTURE_v2.md`](COMPANION_APP_ARCHITECTURE_v2.md) — touches sync architecture
- [`MOBILE_CLOUD_PHASE1_PLAN.md`](MOBILE_CLOUD_PHASE1_PLAN.md) — earlier sync planning
- [`SUPABASE_SCHEMA_v1.sql`](SUPABASE_SCHEMA_v1.sql) — current data layout (would need expansion)
