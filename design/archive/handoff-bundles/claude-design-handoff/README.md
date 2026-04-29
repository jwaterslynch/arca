# Arca — Claude Design Handoff Bundle

**Snapshot date:** 2026-04-29

## Start here

Open **`VISUAL_BRIEF.md`** at the root of this bundle. It tells you what we want, why we want it, and what to push back on.

## Live source

This bundle is a curated, offline-readable snapshot. Live source lives in three GitHub repos:

- `arca` — Tauri desktop app (productivity spine)
- `arca-ios-capture` — iOS health capture companion
- `arca-landing` — landing page

If you have GitHub access wired in, prefer the live repos for code reading. Use this bundle when you need to refer to a specific file without bouncing between repos.

## Bundle layout

```
01-product-context/         positioning, IA, naming, README
02-prior-icon-work/         four icon concepts that never shipped — open compare.html first
03-current-production-icons/ what is actually deployed today (the green-A)
04-current-surfaces/        source files for the surfaces you are being asked to redesign
05-future-modules/          modules not yet built — slot space in your designs
```

## What each folder is for

### 01-product-context
- `ARCA_README.md` — quickstart and project layout for the desktop app
- `ARCA_PRODUCT_CONTEXT.md` — the canonical product context pack (positioning, features, architecture, constraints)
- `HEALTHY_WEALTHY_WISE_IA.md` — the four-domain information architecture (Execute/Plan + Health/Wealth/Wise)
- `PRODUCT_NAMING_OPTIONS_v3.md` — how the name "Arca" was chosen, etymology, tone map

### 02-prior-icon-work
Four concepts and a "final" SVG, all sharing a navy/cream/bronze palette. Open `compare.html` in a browser to see them rendered side-by-side at multiple sizes. Read `CONCEPTS_NOTES.md` for the original notes. **None of this has shipped.**

### 03-current-production-icons
The green-A icon currently in production at three sizes. The user is **not** sold on this. Note: the iOS Capture companion has no app icon at all — its `AppIcon.appiconset` is empty.

### 04-current-surfaces
Source files for the live UI:
- `desktop-app-index.html` — the entire desktop SPA (CSS in the `<head>`, all logic inline)
- `ios-capture-*.swift` — SwiftUI views for the iOS companion. The `HistoryView` is the long-scroll-chart problem the brief asks you to redesign.
- `landing-index.html` — landing page

### 05-future-modules
- `PHASE_A_BRIEF.md` — the brief that produced the current iOS Capture app
- `IDEA_WORKOUT_STATS_CAPTURE.md` — parked module idea for capturing workout stats

## Conventions

- File names use kebab-case where introduced by the bundle
- Ordering is reading order, not alphabetical
- All paths in `VISUAL_BRIEF.md` reference the **GitHub repo paths** (e.g. `arca/src/index.html`); the bundle has flattened copies under `04-current-surfaces/` for offline readability
