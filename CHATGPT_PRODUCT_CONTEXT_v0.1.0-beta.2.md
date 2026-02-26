# PPP Flow Desktop — ChatGPT Context Pack (v0.1.0-beta.2)

Use this file as the primary context artifact when asking for product strategy, UX critique, architecture review, or roadmap planning.

## 1) Product in one line
PPP Flow Desktop is a local-first deep-work execution app (tasks + Pomodoro + weekly review) with an auditable event ledger and daily backups.

## 2) Problem being solved
- Traditional productivity tools over-index on planning and under-index on execution.
- Users need fast capture, tight focus blocks, and objective evidence of closure.
- Manual file-saving workflows create friction and data-loss risk.

## 3) Core user outcomes
- Start focused work quickly.
- Track real time-on-task (sessions, not guesses).
- See closed-loop output by day/week/month.
- Preserve trustworthy history even if tasks are cleared from active lists.

## 4) Current feature set
- Task capture and active checklist.
- Focus mode with central Pomodoro timer.
- Sprint/session logging.
- Weekly review with deep ratio, quadrant split, and closure counts.
- Closure modal (click day/weekly closed counts to inspect exact closure items + timestamps).
- Life practices checklist and finish-track commitment.
- Desktop notifications and sound alerts.

## 5) Technical architecture
- Shell: Tauri v2 desktop app.
- Frontend: single-page app in `src/index.html`.
- Backend: Rust commands in `src-tauri/src/lib.rs`.
- Persistence model:
  - Source of truth: SQLite (`PPP_LEDGER.sqlite3`).
  - Mirror/export convenience: JSON (`PPP_DATA.json`).
  - Daily snapshot backups: auto-generated JSON in `backups/`.

## 6) Data model and reliability choices
### State storage
- Current app state is stored in SQLite table `app_state` (`key='current'`).
- JSON state is mirrored for compatibility/export.

### Immutable event ledger
- Events stored append-only in SQLite table `ledger_events`.
- Event IDs are unique for dedupe/idempotency.
- Current event types:
  - `task_created`
  - `task_completed`
  - `task_reopened`
  - `session_started`
  - `session_stopped`

### Backup policy
- On save, app creates one daily snapshot file if not already present for that day.

## 7) Local paths (macOS)
- App state mirror:
  - `~/Library/Application Support/com.jwaterslynch.pppflow/PPP_DATA.json`
- SQLite backend:
  - `~/Library/Application Support/com.jwaterslynch.pppflow/PPP_LEDGER.sqlite3`
- Daily backups:
  - `~/Library/Application Support/com.jwaterslynch.pppflow/backups/`

## 8) Repository layout
- `src/index.html` — dashboard UI + client logic.
- `src-tauri/src/lib.rs` — backend commands (state, ledger, backups).
- `src-tauri/tauri.conf.json` — app config/version.
- `README.md` — quickstart + storage locations.
- `PRODUCTIZATION_ROADMAP.md` — phased roadmap.
- `RELEASE_NOTES_v0.1.0-beta.2.md` — latest release notes.

## 9) Release status
- Current prerelease: `v0.1.0-beta.2`.
- Branch in use: `codex/tauri-shell`.
- Release goal: transition from robust personal tool to distributable product.

## 10) Known constraints / open decisions
- No cloud sync by default (intentional local-first posture).
- No multi-device merge semantics yet.
- No signed/notarized distribution workflow finalized across all OS targets.
- Product positioning decision pending:
  - Open-source core + paid pro, or
  - Paid binary + public roadmap.

## 11) What to ask ChatGPT for (high-value prompts)
- Product strategy:
  - "Given this context pack, propose a v1.0 scope that maximizes reliability and habit retention."
- UX critique:
  - "Critique the focus-mode workflow and reduce interaction friction to <2 clicks per Pomodoro cycle."
- Analytics design:
  - "Design a weekly/monthly insights model based on immutable event logs (no vanity metrics)."
- Monetization:
  - "Propose 3 viable go-to-market options for a local-first productivity desktop app."
- Architecture hardening:
  - "Design a migration/versioning strategy for state schema and event schema evolution."

## 12) If you need deeper code-level review
Attach these files along with this context pack:
1. `src/index.html`
2. `src-tauri/src/lib.rs`
3. `README.md`
4. `PRODUCTIZATION_ROADMAP.md`

## 13) Desired review style
- Prioritize practical product and engineering decisions.
- Identify reliability risks and migration risks first.
- Keep recommendations execution-focused and sequenced.
