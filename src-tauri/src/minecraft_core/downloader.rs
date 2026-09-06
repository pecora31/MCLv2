use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::Arc;
use std::time::Instant;
use tauri::{AppHandle, Emitter};
use tokio::sync::Semaphore;

pub static CANCEL_DOWNLOAD: AtomicBool = AtomicBool::new(false);

pub fn request_cancel() {
    CANCEL_DOWNLOAD.store(true, Ordering::Relaxed);
}

pub fn reset_cancel() {
    CANCEL_DOWNLOAD.store(false, Ordering::Relaxed);
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DownloadProgressPayload {
    pub stage: String,
    pub percentage: u32,
    pub current_file: String,
    pub downloaded_bytes: u64,
    pub total_bytes: u64,
    pub speed_bps: u64,
}

#[allow(dead_code)]
#[derive(Debug, Clone)]
pub struct DownloadTask {
    pub url: String,
    pub destination: PathBuf,
    pub size: u64,
    pub sha1: Option<String>,
}

pub async fn download_files_concurrently(
    app_handle: &AppHandle,
    stage_name: &str,
    tasks: Vec<DownloadTask>,
    max_concurrent: usize,
) -> Result<(), String> {
    if tasks.is_empty() {
        return Ok(());
    }

    let client = reqwest::Client::builder()
        .user_agent("MCLv2-Downloader/1.0")
        .build()
        .map_err(|e| e.to_string())?;

    // Filter tasks that already exist with non-zero size
    let mut tasks_to_download = Vec::new();
    for task in tasks {
        if task.destination.exists() {
            if let Ok(metadata) = fs::metadata(&task.destination) {
                if task.size > 0 && metadata.len() == task.size {
                    continue; // Skip already downloaded file
                }
            }
        }
        tasks_to_download.push(task);
    }

    let total_files = tasks_to_download.len();
    if total_files == 0 {
        let _ = app_handle.emit(
            "download-progress",
            DownloadProgressPayload {
                stage: stage_name.to_string(),
                percentage: 85,
                current_file: "Tất cả tệp đã có sẵn trong bộ nhớ đệm".to_string(),
                downloaded_bytes: 0,
                total_bytes: 0,
                speed_bps: 0,
            },
        );
        return Ok(());
    }

    let completed_count = Arc::new(AtomicU64::new(0));
    let downloaded_bytes = Arc::new(AtomicU64::new(0));
    let total_bytes: u64 = tasks_to_download.iter().map(|t| t.size).sum();

    let semaphore = Arc::new(Semaphore::new(max_concurrent));
    let start_time = Instant::now();

    let mut handles = Vec::new();

    for task in tasks_to_download {
        if CANCEL_DOWNLOAD.load(Ordering::Relaxed) {
            return Err("Tải tài nguyên đã bị hủy".to_string());
        }

        let permit = semaphore.clone().acquire_owned().await.unwrap();
        let client = client.clone();
        let app = app_handle.clone();
        let stage = stage_name.to_string();
        let completed = completed_count.clone();
        let downloaded = downloaded_bytes.clone();

        let handle = tokio::spawn(async move {
            let _permit = permit; // holds permit until task finishes

            if CANCEL_DOWNLOAD.load(Ordering::Relaxed) {
                return;
            }

            if let Some(parent) = task.destination.parent() {
                let _ = fs::create_dir_all(parent);
            }

            let file_name = task
                .destination
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("file")
                .to_string();

            let resp = client.get(&task.url).send().await;
            if let Ok(mut response) = resp {
                if response.status().is_success() {
                    let mut file = match tokio::fs::File::create(&task.destination).await {
                        Ok(f) => f,
                        Err(_) => return,
                    };

                    while let Some(chunk) = response.chunk().await.ok().flatten() {
                        if CANCEL_DOWNLOAD.load(Ordering::Relaxed) {
                            break;
                        }
                        use tokio::io::AsyncWriteExt;
                        let _ = file.write_all(&chunk).await;
                        downloaded.fetch_add(chunk.len() as u64, Ordering::Relaxed);
                    }
                }
            }

            let done = completed.fetch_add(1, Ordering::Relaxed) + 1;
            let percent = ((done as f64 / total_files as f64) * 100.0).min(100.0) as u32;

            let elapsed_sec = start_time.elapsed().as_secs_f64().max(0.1);
            let current_downloaded = downloaded.load(Ordering::Relaxed);
            let speed = (current_downloaded as f64 / elapsed_sec) as u64;

            if !CANCEL_DOWNLOAD.load(Ordering::Relaxed) {
                let _ = app.emit(
                    "download-progress",
                    DownloadProgressPayload {
                        stage,
                        percentage: percent,
                        current_file: file_name,
                        downloaded_bytes: current_downloaded,
                        total_bytes,
                        speed_bps: speed,
                    },
                );
            }
        });

        handles.push(handle);
    }

    for handle in handles {
        let _ = handle.await;
    }

    Ok(())
}
