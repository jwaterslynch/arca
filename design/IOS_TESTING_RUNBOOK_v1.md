# iOS Testing Runbook v1 (No App Store Required)

Date: 2026-03-03  
Scope: Test Arca on iPhone during development

## What is already done

- iOS target initialized via Tauri:
  - `src-tauri/gen/apple/ppp-flow-desktop.xcodeproj` (legacy generated name)
- iOS config scaffolded in Tauri:
  - `src-tauri/tauri.conf.json -> bundle.iOS.developmentTeam`
- Apple build dependencies installed:
  - `xcodegen`
  - `libimobiledevice`
  - `cocoapods`

## Can we test without App Store?

Yes.

You can install directly from Xcode to your own iPhone (development provisioning).  
App Store review is **not** required for this.

## Fast path (local iPhone test)

1. Connect iPhone by cable (or trusted wireless debugging).
2. Open project in Xcode:
   - `src-tauri/gen/apple/ppp-flow-desktop.xcodeproj` (legacy generated name)
3. In Xcode:
   - Select iPhone as target device.
   - Set your Apple Team in **Signing & Capabilities**.
   - Ensure bundle identifier is unique if needed.
4. Press **Run** in Xcode.
5. If iOS blocks first launch:
   - iPhone Settings -> General -> VPN & Device Management -> trust developer profile.

## CLI path

Open Xcode from Tauri:

```bash
npm run tauri ios dev -- --open
```

For physical phone hot-reload/dev server, also use host flag:

```bash
npm run tauri ios dev -- --open --host
```

## Preflight command

Before attempting signed install, run:

```bash
./scripts/ios_signed_preflight.sh
```

This checks:
- full Xcode install
- signing identities
- `APPLE_DEVELOPMENT_TEAM`
- simulator tooling availability

## Distribution options

1. **Direct dev install (Xcode)**  
   - Best for you and local testing.
   - No App Store submission.

2. **TestFlight (private testers)**  
   - Requires App Store Connect upload.
   - Does **not** require public App Store listing.

3. **Public App Store release**  
   - Full App Review required.

## Known constraints

- Team ID must match Xcode account team exactly.
  - Current project value:
    - `src-tauri/tauri.conf.json -> bundle.iOS.developmentTeam = "9G55P259N7"`
  - If Xcode shows `Unknown Name (...)`, the team ID is wrong for the signed-in account.
- Xcode may fail with:
  - `Command PhaseScriptExecution failed with a nonzero exit code`
  - and log line `Sandbox: cargo(...) deny file-read-data .../.gitignore`
  - Fix: disable user script sandboxing in the iOS Xcode project build settings.
    - File: `src-tauri/gen/apple/ppp-flow-desktop.xcodeproj/project.pbxproj` (legacy generated name)
    - Ensure both debug and release project configs include:
      - `ENABLE_USER_SCRIPT_SANDBOXING = NO;`
- `APPLE_DEVELOPMENT_TEAM` env var is optional for Xcode UI builds but recommended for CLI flows:
  - `export APPLE_DEVELOPMENT_TEAM=9G55P259N7`
