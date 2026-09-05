mod instance_manager;
mod java_detector;
mod launcher_engine;
mod minecraft_core;
mod models;
mod server_ping;

use models::{GameInstance, JavaInstallation, LocalMod, ServerStatus};
use tauri::Manager;

#[tauri::command]
fn get_instances() -> Vec<GameInstance> {
    instance_manager::load_instances()
}

#[tauri::command]
fn save_instances(instances: Vec<GameInstance>) -> Result<(), String> {
    instance_manager::save_instances(&instances)
}

#[tauri::command]
fn detect_java() -> Vec<JavaInstallation> {
    java_detector::detect_installed_javas()
}

#[tauri::command]
async fn ping_minecraft_server(host: String, port: u16) -> ServerStatus {
    server_ping::ping_server(&host, port).await
}

#[tauri::command]
fn get_local_mods(instance_id: String) -> Vec<LocalMod> {
    instance_manager::get_local_mods(&instance_id)
}

#[tauri::command]
async fn launch_instance(
    app: tauri::AppHandle,
    instance_id: String,
    username: String,
) -> Result<String, String> {
    use tauri::Emitter;
    let instances = instance_manager::load_instances();
    if let Some(inst) = instances.into_iter().find(|i| i.id == instance_id) {
        let app_handle = app.clone();
        tokio::spawn(async move {
            if let Err(e) = minecraft_core::launcher::prepare_and_launch(&app_handle, &inst, &username).await {
                log::error!("Lỗi khởi chạy game: {}", e);
                let _ = app_handle.emit("mc-log", format!("[MCLv2/ERROR] {}", e));
                let _ = app_handle.emit(
                    "download-progress",
                    minecraft_core::downloader::DownloadProgressPayload {
                        stage: "Lỗi".to_string(),
                        percentage: 0,
                        current_file: e,
                        downloaded_bytes: 0,
                        total_bytes: 0,
                        speed_bps: 0,
                    },
                );
            }
        });
        Ok(format!("Bắt đầu chuẩn bị tài nguyên cho profile: {}", instance_id))
    } else {
        Err(format!("Không tìm thấy profile với ID: {}", instance_id))
    }
}

#[tauri::command]
fn kill_game() -> Result<bool, String> {
    minecraft_core::launcher::kill_current_game()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_shadow(false);
                let _ = window.set_size(tauri::LogicalSize::new(1600.0, 900.0));
                let _ = window.set_resizable(false);
                let _ = window.center();

                #[cfg(target_os = "windows")]
                if let Ok(hwnd) = window.hwnd() {
                    use std::ffi::c_void;
                    #[link(name = "dwmapi")]
                    extern "system" {
                        fn DwmSetWindowAttribute(
                            hwnd: isize,
                            dwAttribute: u32,
                            pvAttribute: *const c_void,
                            cbAttribute: u32,
                        ) -> i32;
                    }
                    // DWMWA_BORDER_COLOR = 34. 0xFFFFFFFE = DWMWA_COLOR_NONE (no border drawn by Windows DWM)
                    let border_color: u32 = 0xFFFFFFFE;
                    unsafe {
                        let _ = DwmSetWindowAttribute(
                            hwnd.0 as isize,
                            34,
                            &border_color as *const _ as *const c_void,
                            std::mem::size_of::<u32>() as u32,
                        );
                    }
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_instances,
            save_instances,
            detect_java,
            ping_minecraft_server,
            get_local_mods,
            launch_instance,
            kill_game
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
