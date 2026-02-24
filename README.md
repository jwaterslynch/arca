# PPP Flow Desktop (Tauri Shell)

Desktop shell for the PPP Flow Dashboard (`v3`) using Tauri v2.

## Current status

- Frontend: `src/index.html` is the live PPP dashboard UI.
- Runtime: Tauri desktop shell scaffolded and configured.
- Data behavior: dashboard keeps browser-like local state; linked-file mode remains available in the UI.

## Run locally

```bash
npm install
npm run tauri dev
```

## Build

```bash
npm run tauri build
```

## macOS prerequisite

Tauri on macOS requires full Xcode (not just Command Line Tools).

Current environment check showed:
- `rustc`/`cargo`: installed
- Xcode Command Line Tools: installed
- **Xcode app: not installed**

Install Xcode from the App Store before running `tauri dev` or `tauri build` on macOS.

## Project structure

- `src/index.html` — PPP dashboard UI (single-file app view)
- `src-tauri/` — Rust/Tauri shell config and entrypoint

## Next productification steps

1. Add native app data persistence (silent read/write to app data dir).
2. Add branded app icons.
3. Add signed release builds and GitHub Releases.
