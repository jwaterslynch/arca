# Arca Productization Roadmap (HISTORICAL)

> **Superseded by [`ROADMAP.md`](ROADMAP.md)** as of 2026-04-20.
> Most of this file has shipped (Phase 1 core, Phase 2 distribution, Phase 3 partial).
> Kept for historical reference. For current priorities, read `ROADMAP.md`.

## Current State
- Desktop shell: Tauri v2
- UI: Arca v3 embedded in `src/index.html`
- Core loops working: timer, focus mode, weekly review, closure logs

## Phase 1: Ship-Ready Core (Now)
1. Persist reliable local app data to app-managed storage (no manual file linking required).
2. Keep JSON import/export for backup + migration.
3. Add basic onboarding screen with first-run setup.
4. Add app version footer and changelog discipline.

## Phase 2: Distribution
1. Create tagged GitHub releases.
2. Build signed binaries:
   - macOS `.dmg`
   - Windows `.msi`
3. Add release notes template and upgrade guidance.

## Phase 3: Product Surface
1. Add task detail drawer (notes, subtasks, links).
2. Add weekly review click-through analytics by category/WIG/depth.
3. Add daily/weekly auto-backup to user-selected folder.
4. Add optional cloud sync adapter (off by default).

## Phase 4: Commercial Readiness
1. Decide license model:
   - Open-source core + paid pro build, or
   - Paid binary + public roadmap.
2. Add website landing page with screenshots and pricing.
3. Add in-app feedback + crash reporting.

## Minimal Definition of Done for v1.0
- Installation in under 3 minutes.
- Data survives restarts without manual relink.
- Weekly review and closure logs are trustworthy.
- Export/import can recover state end-to-end.
- Clear changelog and issue tracker in GitHub.
