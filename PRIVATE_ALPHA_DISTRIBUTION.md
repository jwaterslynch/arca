# Private Alpha Distribution

This app is ready for a small invited alpha, not uncontrolled public release.

## Recommended distribution model

Use a **private GitHub repo** or a **private release workflow** and ship the app as a **draft prerelease** first.

Why:
- limits access to selected testers
- avoids accidental public download
- gives one place to attach installer artifacts and notes
- supports iterative alpha releases without pretending the app is ready for broad release

## Current build target

The repo currently produces a macOS app bundle and DMG from Tauri:

- Apple Silicon DMG:
  - `src-tauri/target/release/bundle/dmg/PPP Flow Desktop_0.1.0-beta.3_aarch64.dmg`

If you need Intel support, add an Intel build or a universal macOS build before expanding tester scope.

## Safe-by-default GitHub workflow

The repo includes:

- `.github/workflows/tauri-release.yml`

This workflow is intentionally conservative:
- macOS only
- draft release by default
- prerelease by default
- can run from a tag push or manually via `workflow_dispatch`

## Apple signing and notarization

The current GitHub workflow intentionally builds an **unsigned** macOS alpha by default.

That keeps the private-alpha path simple and avoids failed release jobs when Apple secrets are not configured.

If you want a smoother tester install flow later, add a second signed/notarized workflow once you have:

- `APPLE_CERTIFICATE`
- `APPLE_CERTIFICATE_PASSWORD`
- `APPLE_SIGNING_IDENTITY`
- `APPLE_ID`
- `APPLE_PASSWORD`
- `APPLE_TEAM_ID`

Until then:
- the workflow will still build
- the app will still be usable
- testers will need macOS override steps like `Open Anyway`

## Suggested alpha flow

1. Keep the repo private.
2. Bump the version.
3. Update release notes.
4. Run the GitHub Actions release workflow manually.
5. Leave the release as `draft` while you smoke-test the generated DMG.
6. Publish only when you are ready to share with a small invited group.
7. Add testers as repo collaborators or send them the prerelease URL if your access model allows it.

## What to test before publishing

- app launches from installed bundle, not just local dev
- `Data` modal shows the correct runtime version and paths
- import / export / restore work on real data
- onboarding renders correctly in installed app
- `Cmd+K` routing works on all main surfaces
- AI provider selection is curated and stable
- at least one real Wealth dataset imports successfully

## Recommended release positioning

Call it:

- `Private Alpha`
- or `Invited Alpha`

Do not present it as a production-ready app yet. The product is broad, but real-data validation is still underway.
