use std::fs;
use std::io::ErrorKind;
use std::path::PathBuf;

use tauri::{AppHandle, Manager};

const APP_STATE_FILENAME: &str = "PPP_DATA.json";

fn app_state_file_path(app: &AppHandle) -> Result<PathBuf, String> {
    let mut dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    dir.push(APP_STATE_FILENAME);
    Ok(dir)
}

#[tauri::command]
fn load_app_state(app: AppHandle) -> Result<Option<String>, String> {
    let path = app_state_file_path(&app)?;
    match fs::read_to_string(path) {
        Ok(content) => Ok(Some(content)),
        Err(err) if err.kind() == ErrorKind::NotFound => Ok(None),
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
fn save_app_state(app: AppHandle, content: String) -> Result<(), String> {
    let path = app_state_file_path(&app)?;
    fs::write(path, content).map_err(|e| e.to_string())
}

#[tauri::command]
fn app_state_path(app: AppHandle) -> Result<String, String> {
    let path = app_state_file_path(&app)?;
    Ok(path.to_string_lossy().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            load_app_state,
            save_app_state,
            app_state_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
