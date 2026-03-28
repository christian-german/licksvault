use tauri::{Manager};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // Hide the main window if it exists
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.hide();
            }

            println!("Licksvault companion started.");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}