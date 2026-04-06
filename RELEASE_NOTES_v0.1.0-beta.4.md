# Arca v0.1.0-beta.4

## Channel

Private Alpha

## What changed in this build

- Added a clearer AI status model across coach surfaces:
  - grey star when idle
  - green star when the composer is ready
  - pulsing thinking state while the AI is working
- Added experimental top-level toggles so testers can hide `Health` and `Wealth` and use a simpler `Execute` + `Plan` shell
- Kept the installed desktop app and downloadable prerelease aligned to the same reviewed source

## What to test

- `Cmd+K` on each surface and whether the coach feels immediately ready
- AI send feedback before the response arrives
- `Data -> App & Data -> Experimental Modules`
- Turning `Health` and `Wealth` on and off without losing recoverability
- General alpha install/update flow from the GitHub prerelease

## Install / update notes

- macOS only in this alpha build unless otherwise stated
- Apple Silicon build is the primary downloadable artifact
- If the build is unsigned, macOS may require `Open Anyway` in Privacy & Security
- Compare the version shown in `Data` with this release tag to confirm you are on the latest build

## Known issues

- `Health` and `Wealth` remain alpha modules and are still being validated with broader real-world data
- Some AI coach actions still need more real prompt testing across edge cases
- The alpha release is intended for invited testers, not broad public use
