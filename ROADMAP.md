# Arca Roadmap

Single source of truth for what's next, in what order. Replaces the older `PRODUCTIZATION_ROADMAP.md` (most of which has shipped).

## How this doc works

**Five buckets:**

- **Now** — active or immediately next (1-2 items, concurrent)
- **Next** — queued, not yet started (3-5 items)
- **Later** — intentionally not-yet, blocked on something specific
- **Ideas** — aspirational, unscheduled, unbriefed
- **Retired** — considered and explicitly dropped

**Classification tags** (per [Codex's framework](../productization-library/playbooks/ai-pair-programming.md)):

- 🔥 **core pain** — repeated friction you personally feel; high-leverage to build
- 🎨 **idiosyncratic** — maybe just your setup; don't generalize yet
- 🌠 **future ambition** — strategically important, not yet earned by real behavior

**Decision rules:**

- Build immediately when repeated friction in daily use.
- Promote an idea to Now/Next only when it's earned by actual behavior or a concrete blocker.
- Move things to Retired if they sit in Ideas for months without real pull signal.
- Update this doc every time scope or priority shifts.

**For a new AI thread:** read this file first to see the state of play, then the relevant spec in `design/` if one exists.

---

## Now

### Track B Phase A — iOS Arboleaf capture
- **Tag:** 🔥 core pain
- **Brief:** [`design/IOS_HEALTH_CAPTURE_PHASE_A_BRIEF.md`](design/IOS_HEALTH_CAPTURE_PHASE_A_BRIEF.md)
- **Repo:** `jwaterslynch/arca-ios-capture` (separate from this one)
- **Status:** Scaffold committed (`3c20214`). Blocked on user's Xcode step (File → New Project). After that, next slice is Vision OCR + fixture-set benchmarking.
- **Why:** Validates the capture-first pattern that unlocks Health v2 later. Desktop Health redesign cannot start until capture data exists.

---

## Next

### Audit uncommitted design docs
- **Tag:** procedural
- **Where:** `design/` has three untracked docs from Codex (`DESKTOP_AUTH_REVIEW_v1.md`, `SYNC_RECOVERY_PROTOCOL_v1.md`, `FIELD_WORK_TRANSFER_BRIEF_v1.md`)
- **Status:** Unreviewed. May contain proposed briefs for near-term work.
- **Action:** Read them, decide whether any feeds into Now/Next, commit or archive.

### Track A decision — test or abandon
- **Tag:** 🔥 core pain (eventually)
- **Where:** Quarantined on branch `claude/task-event-sync`
- **Status:** Event sync code written, unvalidated for two weeks. Leaving it to rot silently is the worst option.
- **Action:** Either (a) schedule a test window against a second Supabase account/device, or (b) formally abandon and accept it'll be rewritten when companion sync actually becomes critical. Document the decision in `productization-library/decisions/`.

### Dogfood week → gap list
- **Tag:** procedural
- **Status:** Not scheduled.
- **Action:** 5 days using Arca exclusively. Log every moment you reach for another tool. Output: concrete list of what's actually broken for you. Drives what moves into Next after.

---

## Later

### Health v2 — coach-first, dashboard, Friday ritual
- **Tag:** 🔥 core pain
- **Blocked on:** Track B Phase A data. Coach + dashboard over trending data only makes sense once capture is reliably producing data.
- **Shape:** Conversation-first UI (existing coach sidebar promoted to primary), trend visuals for Morpheus/weight/sleep/workouts, weekly Friday review ritual. Kills most existing Health forms.
- **Related specs:** `design/HEALTH_BUILD_SPEC_v1.md`, `design/HEALTH_MODULE_PRD_v1.md`, `design/ACTIONABLE_COACHES_SPEC.md`, `design/COACH_UI_REDESIGN_SPEC.md` (may need reconciling — multiple versions exist)

### Wealth v2 — same pattern as Health v2
- **Tag:** 🔥 core pain
- **Blocked on:** Health v2 proving the coach-first pattern works.
- **Related specs:** `design/WEALTH_BUILD_SPEC_v2.md`, `design/WEALTH_MODULE_PRD_v1.md`, `design/WEALTH_SHARESIGHT_BUILD_PLAN.md`

### Companion sync + PWA (Track A proper)
- **Tag:** 🔥 core pain
- **Blocked on:** Track A decision above (test or abandon the current event-sync implementation).
- **Order when unblocked:** second test user/board → desktop auth + sync correctness → PWA shell for Execute/Plan → realtime polish later.
- **Related specs:** `design/COMPANION_APP_ARCHITECTURE_v2.md`, `design/MOBILE_COMPANION_PRD_v1.md`, `design/MOBILE_COMPANION_STRATEGY_v1.md`, `design/MOBILE_CLOUD_PHASE1_PLAN.md`

### Focus music Path B — bundled audio
- **Tag:** 🎨 idiosyncratic
- **Blocked on:** User producing 1-2 tracks in Logic (25+ min each). See spec in idea doc.
- **Shape:** Replace Spotify deep-link (shipped in beta.11) with an internal audio player + bundled tracks. UI toggle stays the same; source changes.
- **Brief:** [`design/IDEA_FOCUS_MUSIC_TIMER.md`](design/IDEA_FOCUS_MUSIC_TIMER.md)

### Module extraction / Vite migration
- **Tag:** 🎨 idiosyncratic (for now)
- **Blocked on:** Product surface settling. Modularizing a moving target is waste. Revisit after activation + progressive disclosure or Health v2 ships.
- **Related spec:** `design/MODULE_EXTRACTION_SPEC.md`

---

## Ideas

Aspirational, unscheduled. Each should have its own `IDEA_*.md` in `design/` if it's substantive enough to preserve research.

*(Add items here as they arrive. Move to Next when they earn it.)*

---

## Retired

*(Nothing formally retired yet. Add items that were considered and explicitly dropped, with a one-line reason.)*

---

## Revision notes

- **2026-04-20** — created. Supersedes `PRODUCTIZATION_ROADMAP.md` (which is now mostly historical). Reflects state as of `v0.1.0-beta.11`.
