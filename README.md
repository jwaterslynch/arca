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

## Code signing

Releases are signed with a Developer ID Application certificate and notarized
with Apple. The GitHub Actions workflow (`tauri-release.yml`) uses these secrets:

| Secret | Purpose |
|--------|---------|
| `APPLE_CERTIFICATE` | Base64-encoded .p12 |
| `APPLE_CERTIFICATE_PASSWORD` | .p12 export password |
| `APPLE_SIGNING_IDENTITY` | `Developer ID Application: …` |
| `APPLE_ID` | Apple ID email for notarization |
| `APPLE_PASSWORD` | App-specific password |
| `APPLE_TEAM_ID` | 10-char team identifier |

To cut a release: push a `v*` tag or use **Actions → Build macOS Release → Run workflow**.

## Docs

- `RELEASE_CHECKLIST.md` — release process
- `PRIVATE_ALPHA_DISTRIBUTION.md` — tester install guide
- `PRODUCTIZATION_ROADMAP.md` — high-level plan
- `design/` — specs, PRDs, and icon source files

## Local data locations (macOS)

- Current mirrored JSON state:
  - `~/Library/Application Support/com.arca.desktop/ARCA_DATA.json`
- SQLite ledger + app state:
  - `~/Library/Application Support/com.arca.desktop/ARCA_LEDGER.sqlite3`
- Daily backup snapshots:
  - `~/Library/Application Support/com.arca.desktop/backups/`
