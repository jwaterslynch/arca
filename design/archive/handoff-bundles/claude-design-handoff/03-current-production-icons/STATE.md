# Current production icon state

## Desktop (Tauri / macOS)
- Shipping today: `desktop-icon-1024.png` (the green-A)
- Used at: 16, 32, 64, 128, 128@2x, 256, 512, 1024 (and Windows tile sizes)
- Source location in repo: `arca/src-tauri/icons/`

## iOS Capture companion
- **No icon shipped.** `arca-ios-capture/ArcaCapture/Assets.xcassets/AppIcon.appiconset/Contents.json` declares 13 image slots and contains zero PNGs.
- The app currently appears in iOS as a generic blank tile.

## Landing page
- Uses the same green-A.

## Why we are replacing this
- The green-A doesn't earn the Latin etymology of "Arca" (ark / chest / vault).
- The vibe target is closer to Things by Cultured Code — calm, restrained, single confident accent — with more depth than Things has.
- The prior icon-concepts work in `02-prior-icon-work/` is tonally closer than the production icon, but never shipped and is itself unrefined.
