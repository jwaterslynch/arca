# PPP Flow Desktop

Desktop app shell for the PPP Flow Dashboard (`v3`) built with Tauri v2.

## What it does

- Runs the PPP dashboard as a desktop app.
- Supports deep-work timer, focus mode, weekly review, and closure tracking.
- Keeps local state and supports linked-file JSON save/load for explicit backups.

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
