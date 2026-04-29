# Arca v0.1.0-beta.14

Private alpha desktop build.

## Added

- Added Continuous Pomodoro mode so focus sessions can roll from work to break to the next work block without stopping.
- Added editable keyboard shortcuts in Settings > General, including reset controls and conflict protection.

## Changed

- Shortcut labels now stay educational while reflecting the user's saved key assignments.
- Pomodoro session limits no longer stop the timer when Continuous Pomodoro is enabled.

## Validation

- `node --check /tmp/arca-index.js`
- `git diff --check`
- `npm run build`
