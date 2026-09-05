use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FabricLoaderResponse {
    pub loader: FabricLoaderInfo,
    pub intermediary: FabricIntermediaryInfo,
    #[serde(rename = "launcherMeta")]
    pub launcher_meta: FabricLauncherMeta,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FabricLoaderInfo {
    pub version: String,
    pub maven: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FabricIntermediaryInfo {
    pub maven: String,
    pub version: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FabricLauncherMeta {
    #[serde(rename = "mainClass")]
    pub main_class: FabricMainClass,
    pub libraries: FabricLibraries,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FabricMainClass {
    pub client: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FabricLibraries {
    pub client: Vec<FabricMavenLibrary>,
    pub common: Vec<FabricMavenLibrary>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FabricMavenLibrary {
    pub name: String,
    pub url: String,
}

pub async fn get_fabric_meta(
    game_version: &str,
    loader_version: &str,
) -> Result<FabricLoaderResponse, String> {
    let client = reqwest::Client::new();
    let url = format!(
        "https://meta.fabricmc.net/v2/versions/loader/{}/{}",
        game_version, loader_version
    );

    let resp: FabricLoaderResponse = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Fabric Meta API failed: {}", e))?
        .json()
        .await
        .map_err(|e| format!("Failed to parse Fabric Meta: {}", e))?;

    Ok(resp)
}

// Converts maven coordinate "net.fabricmc:fabric-loader:0.16.10" into path and URL
pub fn parse_maven_coord(
    base_url: &str,
    libraries_dir: &Path,
    coord: &str,
) -> Option<(PathBuf, String)> {
    let parts: Vec<&str> = coord.split(':').collect();
    if parts.len() < 3 {
        return None;
    }

    let group = parts[0].replace('.', "/");
    let artifact = parts[1];
    let version = parts[2];
    let classifier = if parts.len() >= 4 { format!("-{}", parts[3]) } else { "".to_string() };

    let file_name = format!("{}{}-{}.jar", artifact, classifier, version);
    let rel_path = PathBuf::from(&group).join(artifact).join(version).join(&file_name);
    let dest = libraries_dir.join(&rel_path);

    let mut clean_base = base_url.to_string();
    if !clean_base.ends_with('/') {
        clean_base.push('/');
    }

    let url = format!("{}{}/{}/{}/{}", clean_base, group, artifact, version, file_name);
    Some((dest, url))
}
