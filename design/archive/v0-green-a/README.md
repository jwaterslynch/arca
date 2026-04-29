# v0 — Green-A archive

**Archived:** 2026-04-29

The original Arca icon set: a white "A" lettermark on a green tile (`#1a8f55` family). Replaced by the `vault-arch A` identity (navy ink + parchment strokes + bronze keystone) designed by Claude Design — see [arca/design/icons-v1/](../../icons-v1/) and [VISUAL_BRIEF.md](../../VISUAL_BRIEF.md).

## Why archived

Julian wanted the green direction preserved before replacement, in case anything in the light-green visual system turned out to be worth pulling forward. The icon itself didn't earn the Latin etymology (Arca = ark / chest / vault), but the broader light-green CSS token system in `arca/src/index.html` may still hold useful ergonomic decisions worth referencing in future passes.

## Contents

- `src-tauri-icons/` — full snapshot of `arca/src-tauri/icons/` at the moment of replacement (Tauri desktop, plus Android and iOS sub-bundles)
- `landing-icon.png` — the green-A as it appeared on the landing page (256×256 RGBA)

## Not archived (and why)

- `arca-ios-capture/.../AppIcon.appiconset/` — the iOS Capture app had no shipped icon (the `Contents.json` declared 13 slots but contained zero PNGs), so there was nothing to preserve.
- `arca/src/index.html` CSS tokens — the light-green color system (`--accent: #1a8f55`, `--bg: #f4f7f6` etc.) remains live in `index.html` until step 2 of the redesign. When that swap happens, the previous token block should be archived alongside this folder as `desktop-tokens-v0.css`.
