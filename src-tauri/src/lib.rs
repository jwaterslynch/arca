use std::fs;
use std::io::ErrorKind;
use std::path::PathBuf;
use std::time::Duration;

use chrono::Local;
use rusqlite::{params, types::Value, Connection};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

const APP_STATE_FILENAME: &str = "PPP_DATA.json";
const LEDGER_DB_FILENAME: &str = "PPP_LEDGER.sqlite3";
const BACKUP_DIRNAME: &str = "backups";

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

fn app_data_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir)
}

fn app_state_file_path(app: &AppHandle) -> Result<PathBuf, String> {
    let mut path = app_data_dir(app)?;
    path.push(APP_STATE_FILENAME);
    Ok(path)
}

fn ledger_db_path(app: &AppHandle) -> Result<PathBuf, String> {
    let mut path = app_data_dir(app)?;
    path.push(LEDGER_DB_FILENAME);
    Ok(path)
}

fn backup_dir_path(app: &AppHandle) -> Result<PathBuf, String> {
    let mut path = app_data_dir(app)?;
    path.push(BACKUP_DIRNAME);
    fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    Ok(path)
}

fn open_ledger(app: &AppHandle) -> Result<Connection, String> {
    let db_path = ledger_db_path(app)?;
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;

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
    .map_err(|e| e.to_string())?;

    Ok(conn)
}

fn ensure_daily_backup(app: &AppHandle, content: &str) -> Result<(), String> {
    let day = Local::now().format("%Y-%m-%d").to_string();
    let mut backup_path = backup_dir_path(app)?;
    backup_path.push(format!("{}_PPP_DATA_snapshot.json", day));

    if backup_path.exists() {
        return Ok(());
    }

    fs::write(backup_path, content).map_err(|e| e.to_string())
}

#[tauri::command]
fn load_app_state(app: AppHandle) -> Result<Option<String>, String> {
    let conn = open_ledger(&app)?;

    let mut stmt = conn
        .prepare("SELECT state_json FROM app_state WHERE key = 'current' LIMIT 1")
        .map_err(|e| e.to_string())?;

    let mut rows = stmt.query([]).map_err(|e| e.to_string())?;
    if let Some(row) = rows.next().map_err(|e| e.to_string())? {
        let json: String = row.get(0).map_err(|e| e.to_string())?;
        return Ok(Some(json));
    }

    let path = app_state_file_path(&app)?;
    match fs::read_to_string(path) {
        Ok(content) => Ok(Some(content)),
        Err(err) if err.kind() == ErrorKind::NotFound => Ok(None),
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
fn save_app_state(app: AppHandle, content: String) -> Result<(), String> {
    let conn = open_ledger(&app)?;

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
    .map_err(|e| e.to_string())?;

    let path = app_state_file_path(&app)?;
    fs::write(path, &content).map_err(|e| e.to_string())?;
    ensure_daily_backup(&app, &content)?;

    Ok(())
}

#[tauri::command]
fn append_events(app: AppHandle, events: Vec<LedgerEventInput>) -> Result<usize, String> {
    if events.is_empty() {
        return Ok(0);
    }

    let mut conn = open_ledger(&app)?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    let mut inserted: usize = 0;
    for event in events {
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
    event_type: Option<String>,
    start_iso: Option<String>,
    end_iso: Option<String>,
    limit: Option<i64>,
) -> Result<Vec<LedgerEventRecord>, String> {
    let conn = open_ledger(&app)?;

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
    let allowed_hosts = [
        "api.coingecko.com",
        "query1.finance.yahoo.com",
        "api.frankfurter.app",
    ];
    if !allowed_hosts.contains(&host) {
        return Err(format!("Host not allowed: {host}"));
    }

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(15))
        .user_agent("PPP Flow Desktop/0.1")
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            load_app_state,
            save_app_state,
            append_events,
            list_events,
            app_state_path,
            ledger_path,
            backup_path,
            play_native_chime,
            http_get_text
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
