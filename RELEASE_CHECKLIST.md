# Release Checklist

## Pre-release
- [ ] Bump version in `package.json` and `src-tauri/tauri.conf.json`.
- [ ] Keep the release private or as a draft prerelease until testers are chosen.
- [ ] Update / prepare release notes for the next build.
- [ ] Verify migration safety on existing JSON data.
- [ ] Run app locally (`npm run dev`) and validate:
  - [ ] Timer transitions and alerts
  - [ ] Focus mode toggle
  - [ ] Weekly closure counts
  - [ ] Closure modal detail list
- [ ] Validate installed bundle matches the reviewed source build.
- [ ] Validate the `Data` modal shows the expected version, executable path, and data paths.
- [ ] Validate JSON export/import round-trip.
- [ ] Validate backup restore from the in-app `App & Data` modal.

## Build
- [ ] `npm run build`
- [ ] Confirm bundle artifacts generated.
- [ ] If sharing the app with friends, smoke-test the DMG from a clean install path.
- [ ] Decide whether to sign/notarize the build before distribution.

## Publish
- [ ] Create git tag `vX.Y.Z` or trigger the workflow manually.
- [ ] Run `.github/workflows/tauri-release.yml`.
- [ ] Keep the GitHub release as `draft` unless you are intentionally sharing it.
- [ ] Attach / verify installer artifacts.
- [ ] If using Apple signing, confirm the signed/notarized artifact is the one attached.

## Post-release
- [ ] Smoke test install on a clean machine or clean macOS user profile.
- [ ] Collect tester feedback against real imported data.
- [ ] Add known issues and next milestones.
