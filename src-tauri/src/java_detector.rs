use crate::models::JavaInstallation;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;

pub fn detect_installed_javas() -> Vec<JavaInstallation> {
    let mut results: Vec<JavaInstallation> = Vec::new();
    let mut visited_paths = std::collections::HashSet::new();

    // Check environment variables
    if let Ok(java_home) = std::env::var("JAVA_HOME") {
        check_and_add(&PathBuf::from(java_home), &mut results, &mut visited_paths);
    }

    // Common Windows search directories
    let program_files = std::env::var("ProgramFiles").unwrap_or_else(|_| "C:\\Program Files".to_string());
    let program_files_x86 = std::env::var("ProgramFiles(x86)").unwrap_or_else(|_| "C:\\Program Files (x86)".to_string());

    let candidates = vec![
        PathBuf::from(&program_files).join("Common Files").join("Oracle").join("Java").join("javapath"),
        PathBuf::from(&program_files).join("Java"),
        PathBuf::from(&program_files).join("Eclipse Adoptium"),
        PathBuf::from(&program_files).join("Microsoft"),
        PathBuf::from(&program_files).join("BellSoft"),
        PathBuf::from(&program_files).join("Zulu"),
        PathBuf::from(&program_files_x86).join("Java"),
    ];

    // Query where.exe javaw
    if let Ok(output) = std::process::Command::new("where.exe").arg("javaw").output() {
        if output.status.success() {
            let stdout = String::from_utf8_lossy(&output.stdout);
            for line in stdout.lines() {
                let trimmed = line.trim();
                if !trimmed.is_empty() && Path::new(trimmed).exists() {
                    let path_buf = PathBuf::from(trimmed);
                    let p_str = path_buf.to_string_lossy().to_string();
                    if !visited_paths.contains(&p_str) {
                        visited_paths.insert(p_str.clone());
                        results.push(JavaInstallation {
                            path: p_str,
                            major_version: 21,
                            version_string: "Oracle Java 21 LTS (System)".to_string(),
                            is_64_bit: true,
                        });
                    }
                }
            }
        }
    }

    for base_dir in candidates {
        if base_dir.exists() && base_dir.is_dir() {
            for entry in WalkDir::new(&base_dir).max_depth(3).into_iter().filter_map(|e| e.ok()) {
                let p = entry.path();
                if p.is_file() {
                    let file_name = p.file_name().and_then(|n| n.to_str()).unwrap_or("");
                    if file_name.eq_ignore_ascii_case("javaw.exe") || file_name.eq_ignore_ascii_case("java.exe") {
                        if let Some(bin_parent) = p.parent().and_then(|bin| bin.parent()) {
                            check_and_add(bin_parent, &mut results, &mut visited_paths);
                        }
                    }
                }
            }
        }
    }

    // If nothing found, provide a graceful default
    if results.is_empty() {
        results.push(JavaInstallation {
            path: "javaw.exe".to_string(),
            major_version: 21,
            version_string: "Default System Java".to_string(),
            is_64_bit: true,
        });
    }

    results
}

fn check_and_add(
    dir: &Path,
    results: &mut Vec<JavaInstallation>,
    visited: &mut std::collections::HashSet<String>,
) {
    let javaw_path = dir.join("bin").join("javaw.exe");
    let java_path = dir.join("bin").join("java.exe");

    let exe_path = if javaw_path.exists() {
        javaw_path
    } else if java_path.exists() {
        java_path
    } else {
        return;
    };

    let path_str = exe_path.to_string_lossy().to_string();
    if visited.contains(&path_str) {
        return;
    }
    visited.insert(path_str.clone());

    let folder_name = dir.file_name().and_then(|n| n.to_str()).unwrap_or("");
    let (major, version_str) = parse_version_from_dir_or_exec(folder_name, &exe_path);

    results.push(JavaInstallation {
        path: path_str,
        major_version: major,
        version_string: version_str,
        is_64_bit: true,
    });
}

fn parse_version_from_dir_or_exec(folder: &str, _exe_path: &Path) -> (u32, String) {
    let lower = folder.to_lowercase();
    if lower.contains("21") {
        return (21, format!("Java 21 LTS ({})", folder));
    }
    if lower.contains("17") {
        return (17, format!("Java 17 LTS ({})", folder));
    }
    if lower.contains("16") {
        return (16, format!("Java 16 ({})", folder));
    }
    if lower.contains("11") {
        return (11, format!("Java 11 LTS ({})", folder));
    }
    if lower.contains("1.8") || lower.contains("8") {
        return (8, format!("Java 8 ({})", folder));
    }

    (21, format!("Java ({})", folder))
}

pub fn find_system_javaw() -> String {
    let program_files = std::env::var("ProgramFiles").unwrap_or_else(|_| "C:\\Program Files".to_string());
    let oracle_javapath = PathBuf::from(&program_files)
        .join("Common Files")
        .join("Oracle")
        .join("Java")
        .join("javapath")
        .join("javaw.exe");

    if oracle_javapath.exists() {
        return oracle_javapath.to_string_lossy().to_string();
    }

    if let Ok(output) = std::process::Command::new("where.exe").arg("javaw").output() {
        if output.status.success() {
            let stdout = String::from_utf8_lossy(&output.stdout);
            if let Some(first_line) = stdout.lines().next() {
                let p = first_line.trim();
                if !p.is_empty() && Path::new(p).exists() {
                    return p.to_string();
                }
            }
        }
    }

    "javaw.exe".to_string()
}
