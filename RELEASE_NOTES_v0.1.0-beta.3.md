# PPP Flow Desktop v0.1.0-beta.3

## Channel

Private Alpha

## Who this build is for

This build is intended for a small invited group of testers using modern macOS, primarily on Apple Silicon.

## What to test

- Onboarding flow and first-run clarity
- Goal setup, Plan Coach, and `Cmd+K` behavior
- Health and Wealth progressive disclosure
- AI coach proposals and apply flows
- Import / export / restore
- Real Wealth data import and category review

## Highlights

- Redesigned onboarding to match the visual style and shell quality of the main app.
- Added visible goal editing in `Plan` and made the sidebar the primary `Plan Coach`.
- Unified coach access across surfaces, including contextual `Cmd+K` routing and coach drawers where relevant.
- Added actionable `Health Coach` and `Wealth Coach` flows with propose-and-apply behavior.
- Added attachment support in coach drawers and AI workspace for images and text-like files.
- Added `App & Data` runtime panel with version, paths, import/export, and restore controls.

## Known issues

- macOS distribution is currently Apple Silicon-first unless a second architecture build is added.
- If the release is unsigned, testers may need to use `Open Anyway` in macOS Privacy & Security.
- Real-data import flows need broader validation with more actual brokerage, banking, and property datasets.
- Some advanced Health and Wealth surfaces are intentionally broad; progressive disclosure reduces clutter but does not remove all complexity.

## Install notes

- macOS only in this alpha build unless otherwise stated.
- Prefer the DMG attached to the GitHub prerelease rather than local dev builds.
- If the app is unsigned, testers may need to right-click `Open` or use `Open Anyway` in macOS Privacy & Security.

## Data safety

- The app maintains a JSON mirror and daily backup snapshots in app storage.
- The `Data` modal shows the active runtime version, executable path, JSON path, SQLite path, and backup folder.
- Testers should export a JSON backup before large imports or reset flows.

## Feedback requested

- Which screens felt confusing on first use?
- Which AI coach flows felt reliable versus brittle?
- What broke when using real data?
- Which part of the product felt most valuable immediately?
