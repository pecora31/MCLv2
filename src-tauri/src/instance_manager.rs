use crate::models::{GameInstance, LocalMod};
use std::fs;
use std::path::{Path, PathBuf};

pub fn get_launcher_dir() -> PathBuf {
    if let Some(app_data) = dirs::data_dir() {
        app_data.join("MCLv2")
    } else {
        PathBuf::from("MCLv2_Data")
    }
}

pub fn get_instances_file() -> PathBuf {
    get_launcher_dir().join("instances.json")
}

pub fn get_instance_dir(instance_id: &str) -> PathBuf {
    get_launcher_dir().join("instances").join(instance_id)
}

pub fn load_instances() -> Vec<GameInstance> {
    let file = get_instances_file();
    if file.exists() {
        if let Ok(content) = fs::read_to_string(&file) {
            if let Ok(instances) = serde_json::from_str::<Vec<GameInstance>>(&content) {
                return instances;
            }
        }
    }

    // Default starting instances
    vec![
        GameInstance {
            id: "server-instance-01".to_string(),
            name: "Máy Chủ Nhóm Bạn".to_string(),
            game_version: "1.21.4".to_string(),
            loader: "fabric".to_string(),
            loader_version: Some("0.16.10".to_string()),
            java_path: None,
            min_ram: 2048,
            max_ram: 4096,
            jvm_args: Some("-XX:+UseG1GC -XX:+ParallelRefProcEnabled".to_string()),
            icon: "server".to_string(),
            server_ip: Some("play.ourserver.mc".to_string()),
            server_port: Some(25565),
            custom_skin_path: None,
            skin_model: Some("classic".to_string()),
            enable_skin_in_game: true,
            last_played: Some("Hôm nay, 21:30".to_string()),
            total_play_time: Some(1420),
        },
        GameInstance {
            id: "instance-vanilla-latest".to_string(),
            name: "Vanilla 1.21.4 (Gốc)".to_string(),
            game_version: "1.21.4".to_string(),
            loader: "vanilla".to_string(),
            loader_version: None,
            java_path: None,
            min_ram: 2048,
            max_ram: 4096,
            jvm_args: None,
            icon: "grass".to_string(),
            server_ip: None,
            server_port: None,
            custom_skin_path: None,
            skin_model: Some("classic".to_string()),
            enable_skin_in_game: true,
            last_played: Some("Hôm qua".to_string()),
            total_play_time: Some(320),
        },
        GameInstance {
            id: "instance-forge-1201".to_string(),
            name: "Sinh Tồn Forge 1.20.1".to_string(),
            game_version: "1.20.1".to_string(),
            loader: "forge".to_string(),
            loader_version: Some("47.3.0".to_string()),
            java_path: None,
            min_ram: 4096,
            max_ram: 8192,
            jvm_args: None,
            icon: "sword".to_string(),
            server_ip: None,
            server_port: None,
            custom_skin_path: None,
            skin_model: Some("classic".to_string()),
            enable_skin_in_game: true,
            last_played: Some("3 ngày trước".to_string()),
            total_play_time: Some(2540),
        },
    ]
}

pub fn save_instances(instances: &[GameInstance]) -> Result<(), String> {
    let launcher_dir = get_launcher_dir();
    fs::create_dir_all(&launcher_dir).map_err(|e| e.to_string())?;

    let file = get_instances_file();
    let json = serde_json::to_string_pretty(instances).map_err(|e| e.to_string())?;
    fs::write(file, json).map_err(|e| e.to_string())?;
    Ok(())
}

pub fn get_local_mods(instance_id: &str) -> Vec<LocalMod> {
    let mods_dir = get_instance_dir(instance_id).join("mods");
    let mut mods = Vec::new();

    if !mods_dir.exists() {
        // Return default popular mods if empty directory
        return vec![
            LocalMod {
                file_name: "fabric-api-0.115.0+1.21.4.jar".to_string(),
                name: "Fabric API".to_string(),
                version: Some("0.115.0".to_string()),
                enabled: true,
                size_bytes: 2154300,
            },
            LocalMod {
                file_name: "sodium-fabric-0.6.9+mc1.21.4.jar".to_string(),
                name: "Sodium (Tối ưu FPS)".to_string(),
                version: Some("0.6.9".to_string()),
                enabled: true,
                size_bytes: 1540200,
            },
            LocalMod {
                file_name: "iris-1.8.1+mc1.21.4.jar".to_string(),
                name: "Iris Shaders".to_string(),
                version: Some("1.8.1".to_string()),
                enabled: true,
                size_bytes: 2840000,
            },
            LocalMod {
                file_name: "CustomSkinLoader_Fabric-14.21.jar".to_string(),
                name: "CustomSkinLoader (Skin Đồng Đội)".to_string(),
                version: Some("14.21".to_string()),
                enabled: true,
                size_bytes: 890000,
            },
            LocalMod {
                file_name: "voicechat-fabric-1.21.4-2.5.28.jar".to_string(),
                name: "Simple Voice Chat".to_string(),
                version: Some("2.5.28".to_string()),
                enabled: true,
                size_bytes: 4200000,
            },
        ];
    }

    if let Ok(entries) = fs::read_dir(&mods_dir) {
        for entry in entries.filter_map(|e| e.ok()) {
            let path = entry.path();
            if let Some(file_name) = path.file_name().and_then(|n| n.to_str()) {
                let enabled = file_name.ends_with(".jar");
                let disabled = file_name.ends_with(".jar.disabled");

                if enabled || disabled {
                    let clean_name = file_name
                        .trim_end_matches(".disabled")
                        .trim_end_matches(".jar")
                        .replace('-', " ")
                        .replace('_', " ");

                    let size_bytes = entry.metadata().map(|m| m.len()).unwrap_or(0);

                    mods.push(LocalMod {
                        file_name: file_name.to_string(),
                        name: clean_name,
                        version: None,
                        enabled,
                        size_bytes,
                    });
                }
            }
        }
    }

    mods
}

// Configures CustomSkinLoader so in-game offline & online skins are resolved
pub fn setup_in_game_skin_support(instance_dir: &Path, username: &str) -> Result<(), String> {
    let custom_skin_loader_dir = instance_dir.join("CustomSkinLoader");
    fs::create_dir_all(&custom_skin_loader_dir).map_err(|e| e.to_string())?;

    // CustomSkinLoader.json config file
    let config_content = format!(
        r#"{{
  "version": "14.21",
  "load_skin": true,
  "load_cape": true,
  "load_elytra": true,
  "enable_cache_auto_clean": true,
  "cache_expiry": 30,
  "skin_services": [
    {{
      "type": "Mojang",
      "enable": true
    }},
    {{
      "type": "ElyBy",
      "enable": true
    }},
    {{
      "type": "CustomSkinAPI",
      "enable": true,
      "root": "https://skin.ely.by/skins/"
    }}
  ],
  "local_user": "{}"
}}"#,
        username
    );

    let config_file = custom_skin_loader_dir.join("CustomSkinLoader.json");
    fs::write(config_file, config_content).map_err(|e| e.to_string())?;

    Ok(())
}
