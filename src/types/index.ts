export type ModLoader = 'vanilla' | 'fabric' | 'forge' | 'neoforge' | 'quilt';

export interface GameInstance {
  id: string;
  name: string;
  gameVersion: string;
  loader: ModLoader;
  loaderVersion?: string;
  javaPath?: string;
  minRam: number; // in MB
  maxRam: number; // in MB
  jvmArgs?: string;
  icon: string;
  serverIp?: string;
  serverPort?: number;
  customSkinPath?: string;
  skinModel?: 'classic' | 'slim';
  enableSkinInGame: boolean;
  lastPlayed?: string;
  totalPlayTime?: number; // in minutes
}

export interface VersionItem {
  id: string;
  type: 'release' | 'snapshot' | 'old_beta' | 'old_alpha';
  url: string;
  time: string;
  releaseTime: string;
}

export interface LoaderVersionItem {
  version: string;
  stable: boolean;
}

export interface Account {
  id: string;
  username: string;
  type: 'offline' | 'microsoft';
  avatarIcon?: string;
  avatarCustom?: string;
  skinUrl?: string;
  skinModel: 'classic' | 'slim';
  uuid: string;
  active: boolean;
}

export interface ServerStatus {
  ip: string;
  port: number;
  online: boolean;
  version?: string;
  playersOnline?: number;
  playersMax?: number;
  motd?: string;
  pingMs?: number;
  favicon?: string;
}

export interface ModrinthMod {
  project_id: string;
  slug: string;
  title: string;
  description: string;
  icon_url?: string;
  downloads: number;
  follows: number;
  categories: string[];
  client_side: string;
  server_side: string;
  versions: string[];
  author: string;
  installed?: boolean;
  installedVersion?: string;
}

export interface LocalMod {
  fileName: string;
  name: string;
  version?: string;
  enabled: boolean;
  sizeBytes: number;
}

export interface LaunchProgress {
  stage: 'idle' | 'checking' | 'downloading' | 'verifying' | 'extracting' | 'launching' | 'running';
  percentage: number;
  currentFile: string;
  downloadedBytes: number;
  totalBytes: number;
  speedBps: number;
}

export interface JavaInstallation {
  path: string;
  majorVersion: number;
  versionString: string;
  is64Bit: boolean;
}

export type UiStyle = 'riot' | 'minimal' | 'glass';
export type ColorPalette = 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'slate';

export interface LauncherSettings {
  defaultJavaPath?: string;
  defaultMinRam: number;
  defaultMaxRam: number;
  defaultJvmArgs: string;
  language: 'vi' | 'en';
  uiStyle: UiStyle;
  colorPalette: ColorPalette;
  bgType?: 'video' | 'image' | 'solid';
  customBgImage?: string;
  customVideoUrl?: string;
  bgOpacity: number;
  closeOnLaunch: boolean;
  enableDiscordRpc: boolean;
  serverHost: string;
  serverPort: number;
  serverName: string;
}
