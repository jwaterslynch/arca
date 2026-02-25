# Release Checklist

## Pre-release
- [ ] Bump version in `package.json` and `src-tauri/tauri.conf.json`.
- [ ] Verify migration safety on existing JSON data.
- [ ] Run app locally (`npm run dev`) and validate:
  - [ ] Timer transitions and alerts
  - [ ] Focus mode toggle
  - [ ] Weekly closure counts
  - [ ] Closure modal detail list
- [ ] Validate JSON export/import round-trip.

## Build
- [ ] `npm run build`
- [ ] Confirm bundle artifacts generated.

## Publish
- [ ] Create git tag `vX.Y.Z`.
- [ ] Push tag.
- [ ] Create GitHub release with notes.
- [ ] Attach installer artifacts.

## Post-release
- [ ] Smoke test install on clean machine.
- [ ] Add known issues and next milestones.
