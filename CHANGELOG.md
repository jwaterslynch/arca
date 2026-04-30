# Arca Changelog

## v0.1.0-beta.15

- Redesigned the Execute view (single column, no right rail). Practices became a rail of seven dots at the top of Execute — present, legible, undeniable, but quiet. Hover a dot to see the practice's name + last-logged. Stale practices (3+ days hollow) get a faint dashed warning ring.
- Added a slide-out Manage drawer behind the rail, preserving the existing rich practice management UI (entries, templates, AI logging, drag-reorder). Esc closes.
- Replaced the four stat-boxes with a slim horizontal stats line at the bottom of Execute.
- Hid the DEEP / STRATEGIC tags on Today task rows by default — a small depth dot carries the signal at low visual weight; tags appear on hover. Done tasks strike through and fade to grey.
- Replaced the legacy parchment focus overlay with a native v3 focus mode: navy radial ground, 48px vault-arch mark top-left, 128px JetBrains Mono timer, paper-on-navy task title. Idle 2s hides cursor + controls; mousemove restores. Esc exits, Space toggles pause. Progress bar at bottom + remaining mono caption.
- Added Wise — a coach for the life half of the ledger as a top-level tab alongside Execute / Plan / Health / Wealth. Curiosity-driven, not guilt-driven, with explicit forbidden phrases ("you should", "get back on track"). Sees the user's last-30-day adherence + recent entries when responding.
- Wise empty-state starter chips are data-aware: positive prompts for practices going strong, gentle probes for slipping practices, reflection prompts for dormant practices, plus always-on generics. Each render rolls fresh variants.
- Wise can propose new practices via an inline editable card (title / minutes / kind / logging prompt / why this matters). Accepting lands the practice directly on the rail — no detour through Manage. The coach never silently mutates state.
- Conversation persists to localStorage (`arca_wise_conversation_v1`). Last-spoke-on caption updates ("Just now", "Last spoke 9m ago", "Last spoke yesterday").

## v0.1.0-beta.14

- Added Continuous Pomodoro mode for uninterrupted focus blocks with focus music.
- Added editable keyboard shortcuts with saved preferences, reset controls, and conflict protection.
- Kept the private alpha desktop version aligned with the bundled app build.

## v0.1.0-beta.4

- Added consistent AI composer state across coach surfaces:
  - grey star at rest
  - green star when ready/focused
  - pulsing thinking state while requests are in flight
- Added experimental top-level module toggles for `Health` and `Wealth` in `Data -> App & Data`
- Improved coach UX feedback so sends feel registered immediately
- Kept the downloadable alpha build aligned with the installed desktop bundle

## v0.1.0-beta.3

- Redesigned onboarding to match the visual quality of the main app
- Added visible goal editing in `Plan`
- Made `Plan Coach` the primary sidebar coach
- Added coach attachments for images and text-like files
- Added actionable `Health Coach` and `Wealth Coach` flows
- Added `App & Data` runtime panel with import/export/restore controls

## v0.1.0-beta.2

- Added progressive disclosure for `Health` and `Wealth`
- Improved AI routing and coach accessibility
- Expanded local/cloud AI setup flows

## v0.1.0-beta.1

- Initial private alpha packaging of Arca
