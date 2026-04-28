# Idea: Phone Tasks Tab (Execute + Plan companion)

**Status:** Future ambition. 🌠 Not in current scope. Blocked on Track A health sync proving out.
**Date filed:** 2026-04-28

## The vision

A `Tasks` tab on the iOS Arca app that mirrors the desktop's Execute and Plan surfaces. Lets the user:
- See today's focused tasks
- Mark a task complete
- Add a new task to the backlog when an idea strikes (walking, between meetings, in the gym)

The "added card appears on desktop" loop is the whole point. Same low-friction-capture thesis as Arboleaf/Morpheus screenshots — but for tasks.

## Why this is blocked

A phone Tasks tab without sync is meaningless. Without sync:
- Tasks added on phone sit trapped there
- You open desktop, the task isn't there → you retype it or forget
- Net result: more friction than just using Wispr / Apple Notes

The unique value comes entirely from sync. Building the UI before sync exists means:
1. Designing a Task data model on iOS that we'll redesign when backend schema lands
2. Rebuilding it again when offline-queue / idempotency requirements emerge
3. Wasted weeks of UI work that doesn't unlock real value

## Prerequisites

Before this becomes a sensible build:

- ✅ Phase A capture loop validated by daily dogfood
- ⏳ Track A health sync foundation built (`arca-sync` repo, `health_captures` + `recovery_snapshots` tables, idempotency, RLS)
- ⏳ Health sync proven: 30+ days of real iOS-to-desktop data flow without loss/dup/corruption
- ⏳ Decision: do we extend the same pattern to tasks, or use a different approach (Apple Reminders integration, Wispr handoff, etc.)?

## When it gets picked up

### Phase 1 — task schema + read-only iOS Tasks tab
- Add `tasks`, `task_events` tables to `arca-sync`
- Migrate desktop tasks into Supabase
- iOS pulls task list, displays today + backlog
- iOS read-only at first: see tasks, can't add or complete

### Phase 2 — task completion from iOS
- Tap to toggle complete on iOS
- Event syncs to desktop
- Idempotency: same `client_event_id` from iOS doesn't double-complete

### Phase 3 — add task from iOS (the main use case)
- Voice or typed input
- Routes to backlog by default
- AI parses to extract: title, optional category, optional WIG, optional importance/urgency
- User can confirm or edit before save (mirrors capture review flow)
- Syncs to desktop, appears as a card next time desktop pulls

### Phase 4 — phone-shaped UI polish
- Things-inspired layout (per the Mobile Companion Strategy doc)
- Bottom sheet for add-task to keep it one-thumb
- Haptic feedback on complete
- Maybe widget for "add to Arca" from anywhere

## Why not just build the frontend now

Three reasons:

1. **Schema risk.** Without backend in place, we'd guess at the iOS-side Task model. That model would almost certainly need rework when sync arrives — different field names, different ID strategies, different conflict-resolution metadata.

2. **No value without sync.** A standalone phone Tasks tab is a worse Notes app. The user has Notes, Reminders, Wispr — the iOS Arca tab's only unique pull is sync to desktop.

3. **Scope discipline.** Phase A capture has been proven for one morning. Until the dogfood week validates the capture-first thesis, expanding iOS surface area is premature. If dogfood reveals iOS isn't actually used daily, building Tasks tab is wasted weeks for a phone app that sits closed.

## Interim option

While the foundation is being built and dogfood is in progress: **use Wispr (or Apple Notes / Reminders) for walking-around task capture**, then transcribe/import to desktop Arca during your daily review. Not elegant, but it's what works today and doesn't block any product decisions.

## Sequencing

```
Phase A capture (Arboleaf + Morpheus) — DONE, awaiting audit + dogfood
        ↓
Track A health sync foundation (arca-sync, dark-launched) — STARTING
        ↓
Phase A dogfood week — STARTING
        ↓
Track A health sync activation (iOS upload, desktop import, coach context)
        ↓
30+ days of health sync stability
        ↓
Phone Tasks tab Phase 1-4 (this doc)
```

Realistic timeline: 2-3 months minimum from today before this gets built. Faster only if dogfood proves the iOS app is in heavy daily use AND health sync proves rock-solid.

## Related

- `MOBILE_COMPANION_STRATEGY_v1.md` — earlier thinking on phone companion
- `MOBILE_COMPANION_PRD_v1.md` — earlier PRD
- `SYNC_RECOVERY_PROTOCOL_v1.md` — sync safety bar that applies here too
- `IDEA_SHARED_TEAM_BOARD.md` — different but related (multi-user task sync)
