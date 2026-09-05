mod instance_manager;
mod java_detector;
mod launcher_engine;
mod minecraft_core;
mod models;
mod server_ping;

use models::{GameInstance, JavaInstallation, LocalMod, ServerStatus};

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
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_instances,
            save_instances,
            detect_java,
            ping_minecraft_server,
            get_local_mods,
            launch_instance
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
