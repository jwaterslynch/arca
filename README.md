# PPP Flow Desktop

Desktop app shell for the PPP Flow Dashboard (`v3`) built with Tauri v2.

## What it does

- Runs the PPP dashboard as a desktop app.
- Supports deep-work timer, focus mode, weekly review, and closure tracking.
- Uses app-managed local persistence (auto-load + auto-save in desktop app storage).
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
- `RELEASE_CHECKLIST.md`
- `RELEASE_NOTES_v0.1.0-beta.1.md`
