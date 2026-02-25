# PPP Flow Desktop v0.1.0-beta.1

## What is new
- Added native app-managed persistence in Tauri:
  - dashboard autosaves to app storage
  - dashboard autoloads on startup
  - no mandatory JSON file relink loop
- Weekly Review upgraded with closure inspector:
  - click daily `X closed` to inspect closed items
  - click weekly `Tasks Closed` total to inspect full week closures
- Improved closure accounting reliability:
  - persistent closure event log
  - counts survive task cleanup

## Productization baseline
- Added `PRODUCTIZATION_ROADMAP.md`
- Added `RELEASE_CHECKLIST.md`
- Added GitHub Actions workflow to auto-build and publish Tauri artifacts on tag push

## Known limitations
- First-time desktop notifications may still require OS/browser permission grant.
- Existing historical closures may show aggregate counts without task titles where logs predate event logging.
- Local macOS builds require full Xcode installation.
