# Arca Desktop v3 Brief — Redesign the Execute View End-to-End

**Date:** 2026-04-30
**Audience:** Claude Design (claude.ai/design)
**Status:** Follow-up to identity v1 + desktop v2
**Author:** Julian, drafted with Claude Code
**Repo:** https://github.com/jwaterslynch/arca (read access; the file you'll spend time in is `src/index.html` — it's monolithic on purpose)
**Branch suggestion:** `feat/desktop-v3-explore` off `release/beta.15` — this is a parallel exploration, NOT a successor to v2 yet. v2's session-closed beat and practices polish are already shipped on `feat/desktop-v2-practices-stillness`; v3 may keep, supersede, or rethink them.

## Read this first

You shipped two beautiful things in v1: the iOS Capture home and the landing page. Both feel like the moleskin/vault metaphor we wanted — calm, private, durable, designerly.

You then shipped a thoughtful v2 brief response: practices polish, focus-mode lock, session-closed beat. It went into a handoff bundle (`arca/design/claude-design-output-v3/arca/handoff-v2/`).

What landed for v2: the session-closed beat (navy fade with the mark when a focus pomodoro completes) — verified live, feels right. The practices polish was integrated as CSS overrides on the existing markup (bigger tick, hide meta until hover, hover tint). Focus-mode lock was deferred — refactoring `enterFocusMode()` and `#focusOverlay` is real surgery, not a styling pass.

What didn't land: **the polish overrides barely register, because the structural bones of the Execute view are unchanged.** The Practices panel is still a dense right-rail card with drag handles, group headings, "0/7 LOGGED" counters, and chevrons leading to drawers. The polish changed the tick, not the experience. Looking at the v2 mock and the live desktop side-by-side, the gap is layout, not detail.

**Two screenshots tell the story:**
- The v2 mock you shipped: a centered card, "Practices · today / 2 of 5" headline, a quiet week-strip dot row, big satisfying ticks, hidden meta, strikethrough on done, "+ New practice" footer. Feels like a beautiful paper checklist.
- The live desktop on beta.14: a dense right-rail "Practices & Domains" panel listing seven domains (Meditation, Reading, Piano/Music, Arabic, Exercise/Gym, Research, Revenue/Venture) with chevrons, a "0/7 logged" counter, a stats card stacked underneath, a Today task list on the left with `DEEP STRATEGIC` tags showing on every row by default, a Current Focus card up top with timer, and an AI bar between them. It works, but it reads as old-Arca-in-brown.

The honest framing of v3: **the v2 brief asked you to design two components on top of an existing skeleton; v3 asks you to design the skeleton.** Components alone can't fix a layout problem.

## The core tension this brief asks you to resolve

**Visibility vs. elegance.**

The current Practices panel is in your face on purpose. The whole point was to make practices visible and slightly guilt-inducing — "I haven't ticked Meditation today, I can see it sitting there, I want to take it off." That's load-bearing product behaviour, not a styling mistake. Hiding practices in a drawer or a tab probably loses the adherence pressure that makes them work.

But the v2 mock direction — quiet, designerly, calm — is precisely what the rest of the Execute view is missing, and is what the iOS app and landing page get right. If we keep practices visible the way they currently are, the Execute view will keep feeling crowded; if we calm them down to look like the mock, we may lose the daily nudge.

**This is a design problem, not a constraint.** We're asking you to argue for a position. Some plausible directions, none of which we're committed to:

- Keep practices on the Execute view but radically quieten them — week-strip dots become the always-visible adherence pressure, individual rows collapse to tick + name, drawer is opt-in. (The v2 mock direction.)
- Promote practices to their own surface — make Execute about *task* execution and put practices on a sibling surface (e.g. Plan, or a new "Today's Practice" surface). Lose proximity, gain calm.
- Rotate practices into the Execute view contextually — show only the not-yet-done ones, hide the rest, make completion feel like clearing the deck.
- Split: a small "stillness rail" of practices stays visible (light, dot-only, no labels) but the management surface lives elsewhere.
- Something we haven't thought of.

We genuinely don't know which is right. We trust your eye for "what would feel like a place I want to be on Day 50."

## Scope

**In scope: the entire Execute view.** The Execute tab is the primary daily-use surface — it's where the user spends 80% of their app time. Everything currently on it is in scope:

1. **Top bar** — logo, mode switcher (Execute / Plan / Health / Wealth), streak badge, active-timer pill, Data button, settings cog
2. **Current Focus card (hero timer)** — current task name, depth/category meta, "Session 1 of 4", timer display, Start/Done buttons
3. **AI bar** — text input, provider pill (ChatGPT/Claude/Grok/etc), Auto-mode toggle, send button, expanding proposal/receipt area
4. **Today panel** — task list (left column, takes most of the vertical space), with `DEEP/SHALLOW` + `STRATEGIC/etc` tags currently shown on every row, drag handles, focus highlighting on the active task
5. **Practices & Domains panel** — right rail, the existing dense list with drag handles and chevrons
6. **Stats card** — under practices, four stat boxes (Today, Deep Ratio, Closed Wk, This Week) plus an "App open · Untracked" meta line
7. **Focus Mode overlay** — when the user enters focus, the whole workspace currently dims to a parchment overlay; v2 wanted to redesign this to a navy lock; v2's lock was deferred to v3.

**Out of scope (locked, do not redo):**
- iOS Capture — the tile grid you designed in v1 + identity work shipped to TestFlight, do not re-spec.
- Landing page — shipped, do not re-spec.
- Identity tokens (parchment / ink / bronze + Fraunces + JetBrains Mono) — locked.
- Icon family (vault-arch A, master/flat/tinted variants) — locked.
- Plan / Health / Wealth tabs — different surfaces, separate brief if/when needed.

**Permission to restructure.** Anything in scope can move, merge, split, or disappear. The right rail is not sacred. The two-column grid is not sacred. The hero card placement is not sacred. The four stat boxes don't need to be four. The AI bar position is up for grabs. The only true constraint is the workflow: the user must be able to see what to work on next, start a focus session on it, and have practices remain present enough to drive adherence. How that looks is yours.

## What v3 must preserve (functionally, not visually)

These are the daily-use jobs the Execute view does. The redesign needs to keep all of them workable, not necessarily in the same place or shape.

1. **Pick today's tasks** — the user pulls 3–5 tasks from a backlog (managed on Plan tab) into Today each morning.
2. **See what to work on next** — at any moment, a glance should say "your current focus is X." Currently that's the hero timer card.
3. **Start a focus session** — single click from "I want to work on this" to a 25-minute pomodoro running. Currently a Start button on the hero card.
4. **Enter Focus Mode** — distraction-free fullscreen; v2's lock direction (navy ground, JetBrains Mono timer, mark, current task) is the right idea, and v3 should make it native rather than bolted on.
5. **Tick a practice** — daily completion of practices like Meditation, Reading, Piano. Currently ticking the bronze circle on the practice item.
6. **Add a quick task** — type into the AI bar, it parses and adds to the appropriate list/stage. Used dozens of times a day.
7. **See "am I doing the work"** — adherence pressure on practices + visible deep-work ratio + closed-this-week count. Currently the stats card under practices.
8. **Close the session** — when a pomodoro ends, a moment of acknowledgement (v2's session-closed beat handles this — keep, modify, or replace).
9. **Drag-reorder** — both Today tasks and practices are drag-reorderable. Whether the v3 design supports this in the same way is open, but the user does reorder.

## Code structure tour

Real pointers so you can read the repo end-to-end. All in `src/index.html` unless noted.

### Layout grid
- `.execute-grid` (line 141) — `grid-template-columns: 1fr 360px`, two columns. Hero spans both, today goes left, sidebar goes right.
- Mobile breakpoint collapses to single column at line 1013 + 2726.
- Top bar / app shell — line 3374 (`<div class="app-shell">`).

### Execute view markup
- `<div class="surface active tab-content" id="tab-execute">` — line 3396, opens the whole Execute surface.
  - `.hero-timer` — line 3400. Current focus card with timer.
  - `.ai-bar` — line 3426. AI input with provider pill, auto toggle, proposal/receipt slots.
  - `.today-panel` — line 3475. Container for today's task list (`#todayTaskList`).
  - `.sidebar-panel` — line 3492. Holds `.practices-card` + `.stats-card` stacked.
  - `.focus-overlay` — line 3527. The current workspace-dim focus screen (this is what v2's focus-mode lock was meant to replace).

### Practices panel CSS (current)
- `.practices-card` styles — line 277–284
- `.practice-item` (row), `.practice-block` (drag wrapper), `.practice-check` (tick), `.practice-info`, `.practice-kind`, `.practice-name`, `.practice-meta`, `.practice-expand` (chevron), `.practice-drawer` — lines 292–360
- v2 polish overrides — lines 3270–3325 (these are what we shipped — bigger tick, hide kind/meta until hover, scale on press)

### Practices render function
- `renderLifePractices()` — `src/index.html` line 14044. Reads `state.life_practices.practices` and `state.life_practices.daily_log[today]`. Builds group headings + practice blocks + drawers. Drag-reorder, drawer toggle, AI logging input, recent entries — all rendered here.
- The data model for a practice — `normalizeLifePractices()` at line 13095. Each practice has: `id`, `title`, `kind` (life_practice | work_domain), `minimum_minutes`, `default_minutes`, `note`, `coach_key`, `target_value`, `target_unit`, `target_period` (day/week/month), `logging_hint`, `linked_goal`, `domain_key`, `color`, `icon`. **Practices already carry a per-item `color` and `icon` — the v3 design can use those if you want per-row visual identity.**
- Daily log shape — `state.life_practices.daily_log[YYYY-MM-DD][practiceId]` = `{ done, minutes, notes, entries: [...] }`.
- Sort order — `sortPracticesForDisplay()` at line 13198 (life_practices come before work_domains; user-defined order preserved within each group).

### Today task list
- `.today-panel` styles — line 201
- Task render — search for `renderTaskPipeline` (line 17441) and the today list. Tasks have: `title`, `depth` (deep/shallow), `category` (strategic/operational/admin/etc), `linked_practice`, `linked_goal`, `priority` (PG1/PG2/PG3/none), `status`.
- The `DEEP STRATEGIC` tags shown on every today row are these `depth` + `category` values. They're noisy by default; whether they should be is a design question.

### AI bar
- `.ai-bar` styles — line 495
- The bar can expand into a proposal panel (showing assumptions/questions/actions before applying) or display a "receipt" (post-action with undo). Both are inline in the same card. Provider switcher is a dropdown of six providers.

### Hero timer + focus mode
- `.hero-timer` — line 151. Three regions in a flex row: current-task block (left, flex:1), `.timer-display` (3.2rem JetBrains Mono), `.timer-controls` (Start / Pause / Done buttons).
- `.focus-overlay` — line 3527. Fixed-position fullscreen, currently a parchment overlay with the same timer + task name + pomo dots + Pause/Done/Exit buttons. v2's `focus-mode.{css,html,js}` proposed replacing this with a navy lock — files are at `arca/design/claude-design-output-v3/arca/handoff-v2/focus-mode.*`.
- The timer state is shared between the hero card and the focus overlay (this is the source-of-truth refactor that deferred Focus Mode Lock — they read from the same pomodoro state). Whatever v3 proposes for the focus surface, please call out cleanly which surface owns the timer DOM and which mirrors it.

### Tokens (locked from v1)
- Parchment / ink / bronze tokens are defined as CSS custom properties at the top of `src/index.html` (search `--paper`, `--ink`, `--accent`, `--surface`, `--text2`, `--line`, `--bg`, `--radius`, `--shadow`).
- Fraunces (display serif) and JetBrains Mono (numerics) are loaded as web fonts.
- Don't redefine these. Use them.

### Identity v1 + v2 outputs
- v1 canonical: `arca/design/claude-design-output-v2/design_handoff_arca_identity/`
- v1 icons: `arca/design/icons-v1/arca-mark-{master,flat,tinted}.svg`
- v2 canonical: `arca/design/claude-design-output-v3/arca/handoff-v2/` — the practices.html / focus-mode.* / session-closed.* files. Use as reference, supersede freely.

## Specific product questions we'd like you to answer

You don't have to use this list — but if you want a steer on which decisions matter, these are the ones currently blocking the redesign.

1. **Where do practices live?** Same surface as tasks (current), separate sub-tab, or split (one quiet rail visible + a richer management surface elsewhere)?
2. **If on Execute: how visible at rest?** Big ticks + names (v2 mock direction)? Just dots? Just initials? Just a count? "3 of 5 done today"? The visibility-vs-elegance tension lives here.
3. **Group headings — keep or flatten?** Current panel splits "Life Practices" (Meditation, Reading, Piano…) from "Work Domains" (Research, Revenue/Venture). The v2 mock flattens. We're not attached to either.
4. **Do tasks need their depth/category tags shown by default?** Currently every Today row shows `DEEP STRATEGIC` as a permanent label. It's useful information but it's loud. Hover-only, glanceable colour, or kept?
5. **Where does the AI bar belong?** Currently a horizontal strip between hero and Today. It's used heavily but feels like it interrupts the surface. Top? Bottom? Floating? Integrated into something else?
6. **The four stat boxes** — Today / Deep Ratio / Closed (Wk) / This Week. Are these four numbers earning their place, or could one or two visualisations replace them with the same insight? The v1 brief specifically called out the data-density problem.
7. **Focus Mode** — v2 wanted a navy fullscreen lock. Still the right answer? What does Exit Focus look like? Where does the music pill go? When the user comes out of a session, does the workspace already show the session-closed beat or does that fire elsewhere?
8. **Empty states** — empty Today list (planning hasn't happened yet), zero practices configured, no closures this week. The current copy says "No tasks yet" in gray text. Calm placeholders with the mark were a v2 idea — do they belong here or only in some places?
9. **Day 50 question.** Imagine the user has been using this app every workday for ten weeks. What does the Execute view need to look like for them on Day 50, when novelty is gone, when practices are habitual, when they don't need adherence pressure but they do still need calm? Different from Day 5? Worth supporting two states?

## Constraints (carry over from v1/v2)

- **Workflow > ceremony.** Every choice has to pass: "would I rather skip this on day 50?"
- **Calm > clever.** Subtle micro-animation beats fancy choreography.
- **Brief by default.** Stillness beats are punctuation, not content.
- **Bypassable.** Anything animated is skippable with any input.
- **`prefers-reduced-motion` respected.** Everything must work with motion off.
- **Tauri target.** The app runs as a desktop window; CSS `position: fixed` + z-index works but be aware that overlays can tussle with the macOS title bar (set `data-tauri-drag-region="false"` on overlays if needed).
- **No build step required.** Vanilla HTML/CSS/JS or React-on-CDN, the way you delivered v1 and v2. The Tauri shell loads `src/index.html` directly.
- **Token system locked.** Use `--paper`, `--ink`, `--accent`, etc. Don't introduce new colours unless you make a strong case.

## Source material to read

You'll do best by actually reading the repo. Specific must-reads:

- `src/index.html` — the whole desktop. It's 32k lines, but the structure is concentrated: layout grid lines 141–280, Practices CSS 277–360, hero/today/sidebar markup 3374–3548, render functions 14044 (practices) and 17441 (tasks).
- `arca/design/DESKTOP_v2_BRIEF.md` — what we asked you for last time. The "what got rejected" section in v2's response was instructive.
- `arca/design/claude-design-output-v3/arca/handoff-v2/practices.html` — your own v2 mock. Reference, not constraint.
- `arca/design/VISUAL_BRIEF.md` (if present) — the original v1 brief, for the tone and the metaphor.
- `arca-ios-capture/Views/HistoryView.swift` (in the sibling repo) — the iOS tile grid that landed beautifully. The Execute view should feel like a sibling of this, not a different product.

## Deliverables we want back

1. **A whole-Execute mockup** — annotated frames showing at-rest, with-active-focus, mid-AI-interaction, and an empty/morning state. Source files in JSX or HTML/CSS like v1. We need to be able to run it.
2. **A short rationale** — one to two pages, why each call. Be opinionated. Where you broke from the v2 mock direction, say so.
3. **A list of what you considered and rejected** — same as v2; the cuts are as informative as the choices.
4. **Open implementation questions for engineering** — anything where the design assumes data we don't have, or animation timing that needs verification on Tauri, or a layout decision that depends on viewport widths we should test. Flag it.
5. **The tension answered.** Tell us where you came down on visibility vs. elegance for practices, and why.

## What success looks like

A user opens the desktop on Day 50 and feels what the iOS app makes them feel: this is *my* workspace. Calm. Private. Designerly. The practices are still doing their adherence job, but they're doing it without shouting. The Today list reads like the next page of a notebook, not a Jira board. Starting a focus session is a single move and the screen goes quiet around them. When the session ends there's a brief beat of acknowledgement and they're back. They don't think about the design. They think about the work.

The line we're holding: **calm AND honest about practice adherence at the same time.**

## What to push back on

- If keeping practices on the Execute view in any form makes the page un-calmable, say so and propose where they should go instead.
- If the visibility-vs-elegance framing is the wrong frame, reframe it.
- If the data we currently surface (the four stat boxes, the depth/category tags, the "0/7 logged" count) is decoration rather than fuel for the user's next decision, cut it.
- If the AI bar shouldn't live on the Execute view at all, argue for that.
- If you want a sibling brief for the Plan tab to make Execute work properly, ask for it — we'd rather hear that than have you hold back.

We trust your judgment on form. We're holding the product strategy, but we're genuinely open on layout, hierarchy, and which surfaces hold which jobs.

— Julian (with Claude Code)
