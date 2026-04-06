use std::fs;
use std::io::ErrorKind;
use std::path::PathBuf;
use std::process::Command;
use std::sync::Mutex;
use std::time::Duration;

use chrono::Local;
use rusqlite::{params, types::Value, Connection};
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};
use tauri::{AppHandle, Emitter, Manager};
use thiserror::Error;

#[derive(Debug, Error)]
enum AppError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("Database error: {0}")]
    Db(#[from] rusqlite::Error),
    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),
    #[error("HTTP error: {0}")]
    Http(#[from] reqwest::Error),
    #[error("{0}")]
    App(String),
}

impl From<AppError> for String {
    fn from(err: AppError) -> String {
        err.to_string()
    }
}

struct DbPool(Mutex<Option<Connection>>);

impl DbPool {
    fn get_or_init(&self, app: &AppHandle) -> Result<std::sync::MutexGuard<'_, Option<Connection>>, String> {
        let mut guard = self.0.lock().map_err(|e| format!("DB lock poisoned: {e}"))?;
        if guard.is_none() {
            let db_path = ledger_db_path(app)?;
            let conn = Connection::open(db_path).map_err(|e| AppError::Db(e))?;
            conn.execute_batch(
                "
                PRAGMA journal_mode=WAL;
                PRAGMA synchronous=NORMAL;

                CREATE TABLE IF NOT EXISTS app_state (
                  key TEXT PRIMARY KEY,
                  state_json TEXT NOT NULL,
                  updated_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS ledger_events (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  event_id TEXT NOT NULL UNIQUE,
                  event_type TEXT NOT NULL,
                  entity_type TEXT,
                  entity_id TEXT,
                  occurred_at TEXT NOT NULL,
                  payload_json TEXT NOT NULL,
                  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
                );

                CREATE INDEX IF NOT EXISTS idx_ledger_events_type_time
                  ON ledger_events(event_type, occurred_at);

                CREATE INDEX IF NOT EXISTS idx_ledger_events_entity
                  ON ledger_events(entity_type, entity_id, occurred_at);
                ",
            )
            .map_err(|e| AppError::Db(e))?;
            *guard = Some(conn);
        }
        Ok(guard)
    }
}

const APP_STATE_FILENAME: &str = "ARCA_DATA.json";
const LEGACY_APP_STATE_FILENAME: &str = "PPP_DATA.json";
const LEDGER_DB_FILENAME: &str = "ARCA_LEDGER.sqlite3";
const LEGACY_LEDGER_DB_FILENAME: &str = "PPP_LEDGER.sqlite3";
const BACKUP_DIRNAME: &str = "backups";
const BACKUP_SNAPSHOT_SUFFIX: &str = "_ARCA_DATA_snapshot.json";
const LEGACY_BACKUP_SNAPSHOT_SUFFIX: &str = "_PPP_DATA_snapshot.json";

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct LedgerEventInput {
    event_id: String,
    event_type: String,
    entity_type: Option<String>,
    entity_id: Option<String>,
    occurred_at: String,
    payload_json: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct LedgerEventRecord {
    event_id: String,
    event_type: String,
    entity_type: Option<String>,
    entity_id: Option<String>,
    occurred_at: String,
    payload_json: String,
    created_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct HttpTextResponse {
    status: u16,
    body: String,
    final_url: String,
    content_type: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct OllamaProbeResponse {
    binary_found: bool,
    app_found: bool,
    running: bool,
    models: Vec<String>,
    version: Option<String>,
    error: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct AppRuntimeInfo {
    version: String,
    profile: String,
    executable_path: String,
    app_data_path: String,
}

fn app_data_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir)
}

fn migrate_legacy_named_file(dir: &PathBuf, legacy_name: &str, current_name: &str) -> Result<(), String> {
    let mut current_path = dir.clone();
    current_path.push(current_name);
    if current_path.exists() {
        return Ok(());
    }

    let mut legacy_path = dir.clone();
    legacy_path.push(legacy_name);
    if !legacy_path.exists() {
        return Ok(());
    }

    fs::rename(&legacy_path, &current_path).map_err(|e| {
        format!(
            "Failed migrating legacy file '{}' to '{}': {}",
            legacy_name, current_name, e
        )
    })?;
    Ok(())
}

fn app_state_file_path(app: &AppHandle) -> Result<PathBuf, String> {
    let mut path = app_data_dir(app)?;
    migrate_legacy_named_file(&path, LEGACY_APP_STATE_FILENAME, APP_STATE_FILENAME)?;
    path.push(APP_STATE_FILENAME);
    Ok(path)
}

fn ledger_db_path(app: &AppHandle) -> Result<PathBuf, String> {
    let mut path = app_data_dir(app)?;
    migrate_legacy_named_file(&path, LEGACY_LEDGER_DB_FILENAME, LEDGER_DB_FILENAME)?;
    path.push(LEDGER_DB_FILENAME);
    Ok(path)
}

fn backup_dir_path(app: &AppHandle) -> Result<PathBuf, String> {
    let mut path = app_data_dir(app)?;
    path.push(BACKUP_DIRNAME);
    fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    Ok(path)
}

// Connection pooling: see DbPool::get_or_init() above.

fn ensure_daily_backup(app: &AppHandle, content: &str) -> Result<(), String> {
    let day = Local::now().format("%Y-%m-%d").to_string();
    let mut backup_path = backup_dir_path(app)?;
    backup_path.push(format!("{}{}", day, BACKUP_SNAPSHOT_SUFFIX));

    let mut legacy_backup_path = backup_dir_path(app)?;
    legacy_backup_path.push(format!("{}{}", day, LEGACY_BACKUP_SNAPSHOT_SUFFIX));

    if backup_path.exists() || legacy_backup_path.exists() {
        return Ok(());
    }

    fs::write(backup_path, content).map_err(|e| e.to_string())
}

fn latest_backup_file_path(app: &AppHandle) -> Result<Option<PathBuf>, String> {
    let backup_dir = backup_dir_path(app)?;
    let entries = fs::read_dir(&backup_dir).map_err(|e| e.to_string())?;
    let mut candidates = entries
        .filter_map(|entry| entry.ok().map(|e| e.path()))
        .filter(|path| {
            path.extension().and_then(|ext| ext.to_str()) == Some("json")
                && path
                    .file_name()
                    .and_then(|name| name.to_str())
                    .map(|name| {
                        name.ends_with(BACKUP_SNAPSHOT_SUFFIX)
                            || name.ends_with(LEGACY_BACKUP_SNAPSHOT_SUFFIX)
                    })
                    .unwrap_or(false)
        })
        .collect::<Vec<_>>();
    candidates.sort();
    Ok(candidates.pop())
}

#[tauri::command]
fn load_app_state(app: AppHandle, db: tauri::State<'_, DbPool>) -> Result<Option<String>, String> {
    // Scope the DB access so the MutexGuard drops before file fallback
    {
        let guard = db.get_or_init(&app)?;
        let conn = guard.as_ref().unwrap();

        let mut stmt = conn
            .prepare("SELECT state_json FROM app_state WHERE key = 'current' LIMIT 1")
            .map_err(|e| AppError::Db(e))?;

        let mut rows = stmt.query([]).map_err(|e| AppError::Db(e))?;
        if let Some(row) = rows.next().map_err(|e| AppError::Db(e))? {
            let json: String = row.get(0).map_err(|e| AppError::Db(e))?;
            return Ok(Some(json));
        }
    }

    let path = app_state_file_path(&app)?;
    match fs::read_to_string(path) {
        Ok(content) => Ok(Some(content)),
        Err(err) if err.kind() == ErrorKind::NotFound => Ok(None),
        Err(err) => Err(AppError::Io(err).to_string()),
    }
}

#[tauri::command]
fn save_app_state(app: AppHandle, db: tauri::State<'_, DbPool>, content: String) -> Result<(), String> {
    let guard = db.get_or_init(&app)?;
    let conn = guard.as_ref().unwrap();

    conn.execute(
        "
        INSERT INTO app_state (key, state_json, updated_at)
        VALUES ('current', ?1, strftime('%Y-%m-%dT%H:%M:%fZ','now'))
        ON CONFLICT(key) DO UPDATE
          SET state_json = excluded.state_json,
              updated_at = excluded.updated_at
        ",
        params![content],
    )
    .map_err(|e| AppError::Db(e))?;
    drop(guard);

    let path = app_state_file_path(&app)?;
    fs::write(path, &content).map_err(|e| AppError::Io(e))?;
    ensure_daily_backup(&app, &content)?;

    Ok(())
}

#[tauri::command]
fn append_events(app: AppHandle, db: tauri::State<'_, DbPool>, events: Vec<LedgerEventInput>) -> Result<usize, String> {
    if events.is_empty() {
        return Ok(0);
    }

    let mut guard = db.get_or_init(&app)?;
    let conn = guard.as_mut().unwrap();
    let tx = conn.transaction().map_err(|e| AppError::Db(e))?;

    let mut inserted: usize = 0;
    for event in events {
        // Validate payload is valid JSON before storing
        if serde_json::from_str::<JsonValue>(&event.payload_json).is_err() {
            return Err(format!(
                "Invalid JSON in payload for event_id '{}': payload must be valid JSON",
                event.event_id
            ));
        }
        let affected = tx
            .execute(
                "
                INSERT OR IGNORE INTO ledger_events
                  (event_id, event_type, entity_type, entity_id, occurred_at, payload_json)
                VALUES (?1, ?2, ?3, ?4, ?5, ?6)
                ",
                params![
                    event.event_id,
                    event.event_type,
                    event.entity_type,
                    event.entity_id,
                    event.occurred_at,
                    event.payload_json
                ],
            )
            .map_err(|e| e.to_string())?;
        inserted += affected as usize;
    }

    tx.commit().map_err(|e| e.to_string())?;
    Ok(inserted)
}

#[tauri::command]
fn list_events(
    app: AppHandle,
    db: tauri::State<'_, DbPool>,
    event_type: Option<String>,
    start_iso: Option<String>,
    end_iso: Option<String>,
    limit: Option<i64>,
) -> Result<Vec<LedgerEventRecord>, String> {
    let guard = db.get_or_init(&app)?;
    let conn = guard.as_ref().unwrap();

    let mut sql = String::from(
        "SELECT event_id, event_type, entity_type, entity_id, occurred_at, payload_json, created_at
         FROM ledger_events WHERE 1=1",
    );

    if event_type.is_some() {
        sql.push_str(" AND event_type = ?1");
    }
    if start_iso.is_some() {
        if event_type.is_some() {
            sql.push_str(" AND occurred_at >= ?2");
        } else {
            sql.push_str(" AND occurred_at >= ?1");
        }
    }
    if end_iso.is_some() {
        match (event_type.is_some(), start_iso.is_some()) {
            (true, true) => sql.push_str(" AND occurred_at <= ?3"),
            (true, false) => sql.push_str(" AND occurred_at <= ?2"),
            (false, true) => sql.push_str(" AND occurred_at <= ?2"),
            (false, false) => sql.push_str(" AND occurred_at <= ?1"),
        }
    }

    sql.push_str(" ORDER BY occurred_at DESC");

    let lim = limit.unwrap_or(500).clamp(1, 5000);
    sql.push_str(" LIMIT ");
    sql.push_str(&lim.to_string());

    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;

    let mut params_vec: Vec<Value> = Vec::new();
    if let Some(et) = event_type {
        params_vec.push(Value::Text(et));
    }
    if let Some(s) = start_iso {
        params_vec.push(Value::Text(s));
    }
    if let Some(e) = end_iso {
        params_vec.push(Value::Text(e));
    }

    let rows = stmt
        .query_map(rusqlite::params_from_iter(params_vec.iter()), |row| {
            Ok(LedgerEventRecord {
                event_id: row.get(0)?,
                event_type: row.get(1)?,
                entity_type: row.get(2)?,
                entity_id: row.get(3)?,
                occurred_at: row.get(4)?,
                payload_json: row.get(5)?,
                created_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut out = Vec::new();
    for item in rows {
        out.push(item.map_err(|e| e.to_string())?);
    }
    Ok(out)
}

#[tauri::command]
fn app_state_path(app: AppHandle) -> Result<String, String> {
    let path = app_state_file_path(&app)?;
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
fn ledger_path(app: AppHandle) -> Result<String, String> {
    let path = ledger_db_path(&app)?;
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
fn backup_path(app: AppHandle) -> Result<String, String> {
    let path = backup_dir_path(&app)?;
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
fn load_latest_backup(app: AppHandle) -> Result<Option<String>, String> {
    let Some(path) = latest_backup_file_path(&app)? else {
        return Ok(None);
    };
    fs::read_to_string(path)
        .map(Some)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn app_runtime_info(app: AppHandle) -> Result<AppRuntimeInfo, String> {
    let executable_path = std::env::current_exe()
        .map_err(|e| e.to_string())?
        .to_string_lossy()
        .to_string();
    let app_data_path = app_data_dir(&app)?.to_string_lossy().to_string();
    Ok(AppRuntimeInfo {
        version: env!("CARGO_PKG_VERSION").to_string(),
        profile: if cfg!(debug_assertions) {
            "debug".to_string()
        } else {
            "release".to_string()
        },
        executable_path,
        app_data_path,
    })
}

#[tauri::command]
fn toggle_main_window_fullscreen(app: AppHandle) -> Result<(), String> {
    let Some(window) = app.get_webview_window("main") else {
        return Err("Main window not found".to_string());
    };

    let is_fullscreen = window.is_fullscreen().unwrap_or(false);
    window.set_fullscreen(!is_fullscreen).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn play_native_chime(
    sound_profile: Option<String>,
    chime_length: Option<String>,
    tone: Option<String>,
) -> Result<bool, String> {
    #[cfg(target_os = "macos")]
    {
        let profile = sound_profile
            .unwrap_or_else(|| "normal".to_string())
            .to_lowercase();
        let length = chime_length
            .unwrap_or_else(|| "short".to_string())
            .to_lowercase();
        let tone_key = tone.unwrap_or_else(|| "glass".to_string()).to_lowercase();

        let volume = match profile.as_str() {
            "soft" => 0.35_f32,
            "loud" => 1.0_f32,
            _ => 0.70_f32,
        };

        let loops: usize = if length == "long" { 2 } else { 1 };

        let file_name = match tone_key.as_str() {
            "ping" => "Ping.aiff",
            "funk" => "Funk.aiff",
            "hero" => "Hero.aiff",
            "purr" => "Purr.aiff",
            _ => "Glass.aiff",
        };

        let sound_path = format!("/System/Library/Sounds/{file_name}");
        if !std::path::Path::new(&sound_path).exists() {
            return Ok(false);
        }

        std::thread::spawn(move || {
            for _ in 0..loops {
                let _ = std::process::Command::new("/usr/bin/afplay")
                    .arg("-v")
                    .arg(format!("{volume:.2}"))
                    .arg(&sound_path)
                    .status();
            }
        });
        return Ok(true);
    }

    #[cfg(not(target_os = "macos"))]
    {
        let _ = (sound_profile, chime_length, tone);
        Ok(false)
    }
}

#[tauri::command]
async fn http_get_text(url: String) -> Result<HttpTextResponse, String> {
    let parsed = reqwest::Url::parse(&url).map_err(|e| e.to_string())?;
    match parsed.scheme() {
        "http" | "https" => {}
        _ => return Err("Only http/https URLs are allowed".to_string()),
    }

    let host = parsed.host_str().unwrap_or_default();
    let allowed_exact_hosts = [
        "api.coingecko.com",
        "query1.finance.yahoo.com",
        "api.frankfurter.app",
        "open.er-api.com",
    ];
    let allowed_domain_suffixes = [
        "domain.com.au",
        "realestate.com.au",
        "onthehouse.com.au",
        "property.com.au",
        "propertyvalue.com.au",
    ];
    let host_allowed = allowed_exact_hosts.contains(&host)
        || allowed_domain_suffixes.iter().any(|domain| host == *domain || host.ends_with(&format!(".{domain}")));
    if !host_allowed {
        return Err(format!("Host not allowed: {host}"));
    }

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(15))
        .user_agent("Arca/0.1")
        .build()
        .map_err(|e| e.to_string())?;

    let response = client.get(parsed).send().await.map_err(|e| e.to_string())?;
    let status = response.status().as_u16();
    let final_url = response.url().to_string();
    let content_type = response
        .headers()
        .get(reqwest::header::CONTENT_TYPE)
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());
    let body = response.text().await.map_err(|e| e.to_string())?;

    Ok(HttpTextResponse {
        status,
        body,
        final_url,
        content_type,
    })
}

#[tauri::command]
async fn ollama_probe() -> Result<OllamaProbeResponse, String> {
    let binary_output = Command::new("which").arg("ollama").output();
    let binary_found = binary_output
        .as_ref()
        .map(|output| output.status.success() && !String::from_utf8_lossy(&output.stdout).trim().is_empty())
        .unwrap_or(false);

    let home_dir = std::env::var_os("HOME")
        .map(PathBuf::from)
        .unwrap_or_default();
    let app_found = PathBuf::from("/Applications/Ollama.app").exists()
        || home_dir.join("Applications/Ollama.app").exists();

    let version = if binary_found {
        Command::new("ollama")
            .arg("--version")
            .output()
            .ok()
            .and_then(|output| {
                if output.status.success() {
                    Some(String::from_utf8_lossy(&output.stdout).trim().to_string())
                } else {
                    None
                }
            })
            .filter(|value| !value.is_empty())
    } else {
        None
    };

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(3))
        .user_agent("Arca/0.1")
        .build()
        .map_err(|e| e.to_string())?;

    let response = client
        .get("http://127.0.0.1:11434/api/tags")
        .send()
        .await;

    match response {
        Ok(resp) => {
            let status = resp.status();
            let body = resp.text().await.map_err(|e| e.to_string())?;
            let json: JsonValue = serde_json::from_str(&body).map_err(|e| e.to_string())?;
            let models = json
                .get("models")
                .and_then(|value| value.as_array())
                .map(|items| {
                    items.iter()
                        .filter_map(|item| {
                            item.get("name")
                                .and_then(|value| value.as_str())
                                .or_else(|| item.get("model").and_then(|value| value.as_str()))
                                .map(str::to_string)
                        })
                        .collect::<Vec<_>>()
                })
                .unwrap_or_default();

            Ok(OllamaProbeResponse {
                binary_found,
                app_found,
                running: status.is_success(),
                models,
                version,
                error: if status.is_success() {
                    None
                } else {
                    Some(format!("Ollama responded with HTTP {}", status.as_u16()))
                },
            })
        }
        Err(err) => Ok(OllamaProbeResponse {
            binary_found,
            app_found,
            running: false,
            models: Vec::new(),
            version,
            error: Some(err.to_string()),
        }),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .menu(|handle| {
            let import_json = MenuItem::with_id(handle, "file_import_json", "Import JSON…", true, Some("CmdOrCtrl+O"))?;
            let export_json = MenuItem::with_id(handle, "file_export_json", "Export JSON Backup", true, Some("CmdOrCtrl+S"))?;
            let restore_backup = MenuItem::with_id(handle, "file_restore_latest_backup", "Restore Latest Backup", true, Some("CmdOrCtrl+Shift+R"))?;
            let close_window = MenuItem::with_id(handle, "window_close", "Close Window", true, Some("CmdOrCtrl+W"))?;
            let quit_app = MenuItem::with_id(handle, "app_quit", "Quit Arca", true, Some("CmdOrCtrl+Q"))?;
            let menu = Menu::with_items(
                handle,
                &[
                    &Submenu::with_items(
                        handle,
                        "File",
                        true,
                        &[
                            &import_json,
                            &export_json,
                            &restore_backup,
                            &PredefinedMenuItem::separator(handle)?,
                            &close_window,
                            &quit_app,
                        ],
                    )?,
                    &Submenu::with_items(
                        handle,
                        "Edit",
                        true,
                        &[
                            &PredefinedMenuItem::undo(handle, None)?,
                            &PredefinedMenuItem::redo(handle, None)?,
                            &PredefinedMenuItem::separator(handle)?,
                            &PredefinedMenuItem::cut(handle, None)?,
                            &PredefinedMenuItem::copy(handle, None)?,
                            &PredefinedMenuItem::paste(handle, None)?,
                            &PredefinedMenuItem::select_all(handle, None)?,
                        ],
                    )?,
                    &Submenu::with_items(
                        handle,
                        "Window",
                        true,
                        &[
                            &PredefinedMenuItem::minimize(handle, None)?,
                            &PredefinedMenuItem::maximize(handle, None)?,
                            &PredefinedMenuItem::fullscreen(handle, None)?,
                        ],
                    )?,
                ],
            )?;
            Ok(menu)
        })
        .on_menu_event(|app, event| match event.id().0.as_str() {
            "file_import_json" => {
                let _ = app.emit("menu://import-json", ());
            }
            "file_export_json" => {
                let _ = app.emit("menu://export-json", ());
            }
            "file_restore_latest_backup" => {
                let _ = app.emit("menu://restore-latest-backup", ());
            }
            "window_close" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.close();
                }
            }
            "app_quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .manage(DbPool(Mutex::new(None)))
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            load_app_state,
            save_app_state,
            append_events,
            list_events,
            app_state_path,
            ledger_path,
            backup_path,
            load_latest_backup,
            app_runtime_info,
            toggle_main_window_fullscreen,
            play_native_chime,
            http_get_text,
            ollama_probe
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
