# Arca Desktop v2 Brief — Practices Redesign + Moments of Stillness

**Date:** 2026-04-29
**Audience:** Claude Design (claude.ai/design)
**Status:** Follow-up brief to identity v1
**Author:** Julian, drafted with Claude Code

## Read this first

Identity v1 shipped — your vault-arch icon, parchment+ink+bronze tokens, Fraunces wordmark, JetBrains Mono numerics — across desktop, iOS Capture, and the landing page. See `arca/design/VISUAL_BRIEF.md` for the original brief and `arca/design/claude-design-output-v2/` for your canonical output.

What landed well: the iOS Capture home and the landing page. Both feel like the moleskin/vault metaphor we wanted. The icon at 1024px on the iOS home screen is striking; opening the iOS app feels like opening a beautifully-bound notebook.

What didn't land as well: **the desktop**. The token swap is correct, but the underlying layout is still the productivity-app skeleton it was before. Same panel density, same right-rail stack, same competing elements. The moleskin metaphor sits on top of dense-CRM-app structure. Result: it reads as "old Arca in brown" rather than "Arca as a private, calm life ledger."

This brief asks you to address two specific surfaces where the desktop can earn back the iOS feeling.

## Surface 1: The Practices panel — designerly checklist

### Current state

`arca/src/index.html` (lines ~292–346) — the "Practices & Domains" panel on Execute. Each practice item currently renders four layers stacked vertically:

1. `.practice-kind` — small uppercase type label ("HABIT", "RITUAL", etc.)
2. `.practice-name` — the practice title
3. `.practice-meta` — minute targets and timing rules ("10 min minimum")
4. `.practice-entries` — log history ("Logged twice this week")

Plus `.practice-check` on the left — a 22px bronze circle that ticks `✓` when done.

The user's reaction: *"all this other data floating around: zero seven logged twice, ten minutes minimum, and all this stuff. We want to be fully using that as a sort of feature."*

Translation: the meta information has overwhelmed the act of ticking. The check is small; the data is loud. It feels like a CRM record, not a Moleskine page.

### Goal

A **designerly checklist** that makes you want to tick. The tick is the feature, not the data. Closer to Things' Today list or a beautiful paper checklist than to a habit-tracking dashboard.

Specifically:
- The check itself should be **larger, more deliberate, more satisfying** to act on. Big enough to feel meaningful. Maybe a soft micro-animation. Maybe a faint parchment-imprint feel when checked. Make the tap feel earned.
- **Hide the meta noise by default.** Type labels, minute targets, and entry logs should not all be visible at once. A practice item at rest should be: check + name. That's it.
- **Meta on demand.** Hover, click-to-expand, or a subtle drawer reveals the timing rules and history. The user can ask for it; it doesn't crowd the default view.
- **Progress as a side glance, not a number stack.** A faint dotted week-strip across the top of the panel ("5/7 this week" as visual, not text) earns more than four numbers per item. Calm at-a-glance.
- **State after tick** is part of the design. A ticked practice could fade to a softer ink, draw a gentle strikethrough, leave a check mark stroke that feels handwritten — not a hard-fill bronze circle.

### What we don't want

- A skeuomorphic checkbook (no paper textures, no drop shadows pretending to be ink wells)
- A "satisfying tick animation" that's slow enough to interrupt flow
- Hiding so much that the user can't find where to set up a new practice
- Removing the entry history entirely (it's useful — just not on the home view)

## Surface 2: Moments of stillness — the icon as punctuation

### The opportunity

Your vault-arch icon is striking at 1024px because it has space to breathe. On iOS, the entire app launch experience is the icon (home screen tile → app open). On desktop, the icon currently appears only in the dock and the window chrome — it never gets the room to *be* an experience.

The user's instinct: *"there could be just a few seconds where it goes all black with A and then zooms up… moments of beauty and refinement and simplicity and bringing your attention to non-distraction for a second, etc., could be really cool."*

The non-negotiable constraint: *"this is about getting shit done. We don't want anything fancy that gets in the way of the user experience."*

So: identify the moments in the desktop workflow where bringing the icon's simplicity back as a quiet beat **deepens the calm without delaying the work**. Some of these earn their place; some don't. Decide which.

### Candidate moments (you decide which earn their place)

1. **Launch splash.** First 1–2 seconds when the app opens. Dark navy ground, the vault-arch mark, brief soft fade out into the parchment workspace. Critically: short enough to never feel slow. Bypassable if the user clicks. Tauri can be configured to show a custom splash via `tauri-plugin-window-state` or a startup window.

2. **Focus mode lock.** When the user clicks "Enter Focus", the workspace currently dims. Could it instead transition to the icon's navy ground — full surface, the timer in JetBrains Mono, current task name in Fraunces, mark in the corner? A genuine "non-distraction screen." Exit returns to the parchment workspace.

3. **Pomodoro session-complete moment.** When a focus session finishes, instead of a notification toast, briefly fade the hero-timer area to navy with the mark + the duration achieved. 1–2 seconds. Then return to the parchment. Closure ritual.

4. **Last-task-of-the-day moment.** When the final task on the Today list is checked off, an even briefer moment — just the mark on the parchment, in a calm position, while the list animates to its empty-day state. Acknowledges the achievement without celebrating it.

5. **Empty-state appearances.** When a panel is empty (no tasks yet, no practices configured, no closures this week), the wordmark or a small mark appears in vellum-on-paper as a calm placeholder rather than the current "No tasks yet" gray text.

6. **Weekly review entry.** When the user opens the Sunday review, a brief tone-setting moment with the mark + a question or a phrase. Sets the surface apart from the daily Execute view.

### What we want from you on this surface

- Pick **2–3** of the above (or propose your own) that earn their place. Reject the rest with reasoning.
- For each chosen moment: what it looks like, when it appears, when it disappears, and how the user can bypass or skip it.
- Implementation hints — CSS animations + a tiny JS module are fine; we don't need a full framework. Tauri startup splash needs Rust-side config, which we can wire.
- Sonic counterpart, optional: a subtle chime or absence-of-sound moment that complements the visual. Calm only — no celebration sounds.

### What we don't want

- Anything that delays the user's first click in the app
- An always-visible animated icon in the chrome
- A "focus mode" that requires the user to learn new gestures or shortcuts
- Sound effects that feel like a game
- More than one stillness moment in any 30-second window of normal use

## Constraints (both surfaces)

- **Workflow > ceremony.** Every choice has to pass: "would I rather skip this on day 50?" If yes, redesign or cut.
- **Bypassable.** Splash, transitions, and rituals must be skippable with any input.
- **Calm > clever.** Subtle micro-animation beats fancy choreography.
- **Brief by default.** Stillness moments are punctuation, not content. Sub-2-seconds for the splash; sub-1-second for in-flow transitions.
- **Settings escape hatch.** A "Reduce motion / disable rituals" toggle in settings. iOS users running with prefers-reduced-motion: no transitions at all.

## Source material

Same three repos as v1:
- `arca` — desktop (Tauri). The Practices panel CSS lives in `src/index.html` lines ~292–346. The hero timer area lives ~100–146. Mode switcher / focus mode entry ~56–64.
- `arca-ios-capture` — see `Views/HistoryView.swift` for the calm tile-grid feeling we want to bring back to desktop.
- Identity tokens: `arca/design/claude-design-output-v2/design_handoff_arca_identity/` — canonical.
- The icon masters: `arca/design/icons-v1/arca-mark-{master,flat,tinted}.svg`.

What's already in flight (should NOT be redone):
- The token system (parchment / ink / bronze, domain hues, type) — locked.
- The icon family — locked.
- The iOS Capture redesign — shipped as a tile grid; do not re-spec.
- The landing page — shipped; do not re-spec.

## Deliverables we want back

1. **Practices panel redesign** — annotated mockup of the at-rest, hover, expanded, and ticked states. Source files in JSX or HTML/CSS the way you delivered v1.
2. **Stillness moments** — for each chosen moment: a frame-by-frame description, a representative still image, and a CSS transition or animation snippet. Splash also needs a static SVG/HTML rendering for Tauri integration.
3. **A short rationale** — one page, why each call. Include "what to push back on" honestly, like you did in v1.
4. **A list of what you considered and rejected.** That's the hardest part of this brief — knowing which moments earn their place is the whole point.

## What success looks like

A user opens the desktop app on Day 50 and notices: the practices feel like a paper checklist they actually want to tick; once or twice a session there's a brief moment where the icon shows up calmly and they think *"this app respects my attention."* Nothing slows them down. Nothing flashes. The desktop finally feels like the iOS app — a private, calm, durable place to do the work.

## What to push back on

If any of the candidate stillness moments feel like decoration that doesn't earn its place, say so. If the practices redesign direction misses something obvious about how habits/rituals are actually used, say so. We trust your judgment on form. We're holding the product strategy.
