# Arca

Desktop app shell for the Arca (`v3`) built with Tauri v2.

## What it does

- Runs the Arca board as a desktop app.
- Supports deep-work timer, focus mode, weekly review, and closure tracking.
- Uses app-managed local persistence with SQLite as the source of truth.
- Writes immutable event ledger entries (task/session lifecycle events) for auditable history.
- Creates automatic daily JSON snapshot backups in app storage.
- Supports linked-file JSON import/export for explicit backups and migration.

## Quick start

```bash
npm install
npm run dev
```

## Build installers

```bash
npm run build
```

## Requirements

- Node.js 18+
- Rust toolchain
- Tauri prerequisites for your OS
- macOS: full Xcode app (not only Command Line Tools)

## Project layout

- `src/index.html` — dashboard UI
- `src-tauri/` — Tauri (Rust) shell + bundling config

## Productization docs

- `PRODUCTIZATION_ROADMAP.md`
- `PRIVATE_ALPHA_DISTRIBUTION.md`
- `RELEASE_CHECKLIST.md`
- `RELEASE_NOTES_v0.1.0-beta.1.md`
- `RELEASE_NOTES_v0.1.0-beta.2.md`
- `RELEASE_NOTES_v0.1.0-beta.4.md`

## Local data locations (macOS)

- Current mirrored JSON state:
  - `~/Library/Application Support/com.arca.desktop/ARCA_DATA.json`
- SQLite ledger + app state:
  - `~/Library/Application Support/com.arca.desktop/ARCA_LEDGER.sqlite3`
- Daily backup snapshots:
  - `~/Library/Application Support/com.arca.desktop/backups/`
