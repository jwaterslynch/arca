# PPP Flow Desktop v0.1.0-beta.2

## Highlights

- Added a local SQLite backend as the app persistence source of truth.
- Added immutable append-only event ledger for task/session lifecycle events.
- Added automatic daily JSON snapshots in app data backup folder.
- Upgraded closure history UX so weekly/day closed counts open exact closure details with timestamps.

## Backend details

- New SQLite file: `PPP_LEDGER.sqlite3` in app data directory.
- State JSON (`PPP_DATA.json`) is still written as a mirror/export convenience.
- New commands:
  - `append_events`
  - `list_events`
  - `ledger_path`
  - `backup_path`

## Data paths (macOS)

- `~/Library/Application Support/com.jwaterslynch.pppflow/PPP_LEDGER.sqlite3`
- `~/Library/Application Support/com.jwaterslynch.pppflow/PPP_DATA.json`
- `~/Library/Application Support/com.jwaterslynch.pppflow/backups/`

## Notes

- No workflow/UI changes required to continue using the app.
- Existing dashboard JSON data remains supported.
