import React, { useState, useEffect, useRef } from 'react';
import { TitleBar } from './components/layout/TitleBar';
import { Sidebar } from './components/layout/Sidebar';
import type { NavigationTab } from './components/layout/Sidebar';
import { ServerHub } from './components/home/ServerHub';
import { InstanceList } from './components/instances/InstanceList';
import { CreateInstanceModal } from './components/instances/CreateInstanceModal';
import { EditInstanceModal } from './components/instances/EditInstanceModal';
import { ServerManagerModal } from './components/server/ServerManagerModal';
import { SkinStudio } from './components/skin/SkinStudio';
import { ModStore } from './components/mods/ModStore';
import { SettingsView } from './components/settings/SettingsView';
import { ProfileView } from './components/profile/ProfileView';
import { ConsoleModal } from './components/common/ConsoleModal';
import type { GameInstance, Account, LauncherSettings, LaunchProgress, SavedServer } from './types';
import { invokeCommand, isTauri } from './services/api';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';
import type { Language } from './locales/i18n';
import { X } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('MCLv2 ErrorBoundary caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen w-screen bg-[#0a0a0a] text-white p-8 select-none">
          <div className="max-w-md w-full minimal-panel p-8 rounded-2xl border border-white/10 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-xl font-bold">
              ⚠️
            </div>
            <h2 className="text-xl font-bold font-riot">Đã xảy ra sự cố giao diện</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ứng dụng vừa ghi nhận lỗi: <span className="font-mono text-amber-300">{this.state.error?.message}</span>
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.reload();
                }}
                className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold font-riot cursor-pointer"
              >
                Tải lại ứng dụng
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const DEFAULT_INSTANCES: GameInstance[] = [
  {
    id: 'server-instance-01',
    name: 'Máy Chủ Nhóm Bạn',
    gameVersion: '1.21.4',
    loader: 'fabric',
    loaderVersion: '0.16.10',
    minRam: 2048,
    maxRam: 4096,
    jvmArgs: '-XX:+UseG1GC -XX:+ParallelRefProcEnabled',
    icon: 'server',
    serverIp: 'play.ourserver.mc',
    serverPort: 25565,
    enableSkinInGame: true,
    lastPlayed: 'Hôm nay, 21:30',
    totalPlayTime: 1420,
  },
  {
    id: 'instance-vanilla-latest',
    name: 'Vanilla 1.21.4',
    gameVersion: '1.21.4',
    loader: 'vanilla',
    minRam: 2048,
    maxRam: 4096,
    icon: 'grass',
    enableSkinInGame: true,
    lastPlayed: 'Hôm qua',
    totalPlayTime: 320,
  },
  {
    id: 'instance-forge-1201',
    name: 'Sinh Tồn Forge 1.20.1',
    gameVersion: '1.20.1',
    loader: 'forge',
    loaderVersion: '47.3.0',
    minRam: 4096,
    maxRam: 8192,
    icon: 'sword',
    enableSkinInGame: true,
    lastPlayed: '3 ngày trước',
    totalPlayTime: 2540,
  },
];

const DEFAULT_SERVERS: SavedServer[] = [
  {
    id: 'srv-01',
    name: 'Máy Chủ Nhóm Bạn',
    ip: 'play.ourserver.mc',
    port: 25565,
  },
  {
    id: 'srv-02',
    name: 'Hypixel Network',
    ip: 'mc.hypixel.net',
    port: 25565,
  },
];

const DEFAULT_ACCOUNT: Account = {
  id: 'acc-01',
  username: 'Player_Hero',
  type: 'offline',
  skinUrl: 'https://textures.minecraft.net/texture/292009a4925b58f02c77d692f0085a5392652a6549aa018e69fa89e4ecbe5677',
  skinModel: 'classic',
  uuid: '8667ba71-b85a-4004-af54-457a9734eed7',
  active: true,
};

const DEFAULT_SETTINGS: LauncherSettings = {
  defaultMinRam: 2048,
  defaultMaxRam: 4096,
  defaultJvmArgs: '-XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200',
  language: 'vi',
  uiStyle: 'riot',
  colorPalette: 'amber',
  bgType: 'video',
  bgOpacity: 0.5,
  closeOnLaunch: false,
  enableDiscordRpc: true,
  serverHost: 'play.ourserver.mc',
  serverPort: 25565,
  serverName: 'Máy Chủ Minecraft Nhóm Bạn',
};

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [instances, setInstances] = useState<GameInstance[]>(() => {
    const saved = localStorage.getItem('mcl_instances');
    return saved ? JSON.parse(saved) : DEFAULT_INSTANCES;
  });
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>(instances[0]?.id || 'server-instance-01');

  // Multi-server state
  const [savedServers, setSavedServers] = useState<SavedServer[]>(() => {
    const saved = localStorage.getItem('mcl_servers');
    return saved ? JSON.parse(saved) : DEFAULT_SERVERS;
  });
  const [activeServerId, setActiveServerId] = useState<string>(() => {
    return localStorage.getItem('mcl_active_server') || savedServers[0]?.id || 'srv-01';
  });
  const [directConnectServer, setDirectConnectServer] = useState<boolean>(() => {
    return localStorage.getItem('mcl_direct_connect') === 'true';
  });
  const [isServerManagerOpen, setIsServerManagerOpen] = useState(false);

  const [account, setAccount] = useState<Account>(() => {
    const saved = localStorage.getItem('mcl_account');
    return saved ? JSON.parse(saved) : DEFAULT_ACCOUNT;
  });
  const [settings, setSettings] = useState<LauncherSettings>(() => {
    const saved = localStorage.getItem('mcl_settings');
    const parsed = saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      bgType: parsed.bgType || (parsed.customBgImage ? 'image' : 'video'),
    };
  });

  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('mcl_lang') as Language;
    return saved || settings.language || 'vi';
  });

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInstance, setEditingInstance] = useState<GameInstance | null>(null);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  // Runtime states
  const [isRunning, setIsRunning] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [launchProgress, setLaunchProgress] = useState<LaunchProgress>({
    stage: 'idle',
    percentage: 0,
    currentFile: '',
    downloadedBytes: 0,
    totalBytes: 0,
    speedBps: 0,
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('mcl_instances', JSON.stringify(instances));
  }, [instances]);

  useEffect(() => {
    localStorage.setItem('mcl_servers', JSON.stringify(savedServers));
  }, [savedServers]);

  useEffect(() => {
    localStorage.setItem('mcl_active_server', activeServerId);
  }, [activeServerId]);

  useEffect(() => {
    localStorage.setItem('mcl_direct_connect', directConnectServer.toString());
  }, [directConnectServer]);

  useEffect(() => {
    localStorage.setItem('mcl_account', JSON.stringify(account));
  }, [account]);

  useEffect(() => {
    localStorage.setItem('mcl_settings', JSON.stringify(settings));
  }, [settings]);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Ensure video auto-plays when active
  useEffect(() => {
    if (settings.bgType !== 'image' && videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.log('Video autoplay handled:', err);
        });
      }
    }
  }, [settings.bgType, settings.customVideoUrl]);

  // Apply 1600x900 dimensions, disable shadow and center window
  useEffect(() => {
    if (isTauri()) {
      const configureWindow = async () => {
        try {
          const win = getCurrentWindow();
          await win.setSize(new LogicalSize(1600, 900));
          await win.setResizable(false);
          await win.center();
        } catch (err) {
          console.warn('Error applying window settings:', err);
        }
      };
      configureWindow();
    }
  }, []);

  // Load instances from backend if in Tauri
  useEffect(() => {
    const initBackend = async () => {
      if (isTauri()) {
        try {
          const list = await invokeCommand<GameInstance[]>('get_instances');
          if (list && list.length > 0) {
            setInstances(list);
          }
        } catch (err) {
          console.warn('Backend instances fallback:', err);
        }
      }
    };
    initBackend();
  }, []);

  // Profile management handlers
  const handleCreateInstance = (newInstData: Partial<GameInstance>) => {
    const newInstance: GameInstance = {
      id: `instance-${Date.now()}`,
      name: newInstData.name || 'Minecraft Profile',
      gameVersion: newInstData.gameVersion || '1.21.4',
      loader: newInstData.loader || 'fabric',
      loaderVersion: newInstData.loaderVersion,
      minRam: newInstData.minRam || settings.defaultMinRam,
      maxRam: newInstData.maxRam || settings.defaultMaxRam,
      jvmArgs: settings.defaultJvmArgs,
      icon: newInstData.icon || 'grass',
      enableSkinInGame: newInstData.enableSkinInGame ?? true,
      lastPlayed: 'Mới tạo',
      totalPlayTime: 0,
    };

    const updated = [newInstance, ...instances];
    setInstances(updated);
    setSelectedInstanceId(newInstance.id);

    if (isTauri()) {
      invokeCommand('save_instances', { instances: updated }).catch(console.warn);
    }
  };

  const handleEditInstance = (inst: GameInstance) => {
    setEditingInstance(inst);
    setIsEditModalOpen(true);
  };

  const handleSaveEditedInstance = (updated: GameInstance) => {
    const list = instances.map((i) => (i.id === updated.id ? updated : i));
    setInstances(list);
    if (isTauri()) {
      invokeCommand('save_instances', { instances: list }).catch(console.warn);
    }
  };

  const handleDeleteInstance = (id: string) => {
    const remaining = instances.filter((i) => i.id !== id);
    setInstances(remaining);
    if (selectedInstanceId === id) {
      setSelectedInstanceId(remaining[0]?.id || '');
    }
    if (isTauri()) {
      invokeCommand('save_instances', { instances: remaining }).catch(console.warn);
    }
  };

  // Server management handlers
  const handleAddServer = (srvData: Omit<SavedServer, 'id'>) => {
    const newSrv: SavedServer = {
      ...srvData,
      id: `srv-${Date.now()}`,
    };
    setSavedServers((prev) => [...prev, newSrv]);
    setActiveServerId(newSrv.id);
  };

  const handleUpdateServer = (updated: SavedServer) => {
    setSavedServers((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleDeleteServer = (id: string) => {
    setSavedServers((prev) => {
      const rem = prev.filter((s) => s.id !== id);
      if (activeServerId === id) {
        setActiveServerId(rem[0]?.id || '');
      }
      return rem;
    });
  };

  const handleUpdateUsername = (newName: string) => {
    setAccount((prev) => ({ ...prev, username: newName }));
  };

  const handleUpdateSkin = (skinUrl: string, model: 'classic' | 'slim') => {
    setAccount((prev) => ({ ...prev, skinUrl, skinModel: model }));
  };

  // Listen to Tauri native events
  useEffect(() => {
    if (!isTauri()) return;
    let unlistenProgress: (() => void) | undefined;
    let unlistenLogs: (() => void) | undefined;
    let unlistenStarted: (() => void) | undefined;
    let unlistenExit: (() => void) | undefined;

    const setupListeners = async () => {
      try {
        unlistenProgress = await listen<LaunchProgress>('download-progress', (event) => {
          setLaunchProgress(event.payload);
          if (event.payload.stage === 'Lỗi') {
            setIsPreparing(false);
          }
        });

        unlistenLogs = await listen<string>('mc-log', (event) => {
          setConsoleLogs((prev) => [...prev, event.payload]);
        });

        unlistenStarted = await listen<number>('game-started', () => {
          setIsRunning(true);
          setIsPreparing(false);
        });

        unlistenExit = await listen('game-exit', () => {
          setIsRunning(false);
          setIsPreparing(false);
          setLaunchProgress({ stage: 'idle', percentage: 0, currentFile: '', downloadedBytes: 0, totalBytes: 0, speedBps: 0 });
          setConsoleLogs((prev) => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] [MCLv2/INFO] Tiến trình Minecraft đã đóng.`,
          ]);
        });
      } catch (err) {
        console.warn('Tauri event listener setup:', err);
      }
    };

    setupListeners();

    return () => {
      unlistenProgress?.();
      unlistenLogs?.();
      unlistenStarted?.();
      unlistenExit?.();
    };
  }, []);

  // Launch Engine Handler
  const handleLaunch = async () => {
    const targetInstance = instances.find((i) => i.id === selectedInstanceId) || instances[0];
    if (!targetInstance) {
      setIsCreateModalOpen(true);
      return;
    }

    const currentServer = savedServers.find((s) => s.id === activeServerId) || savedServers[0];

    // Inject direct connect server IP and port if user enabled directConnectServer
    const launchData: GameInstance = {
      ...targetInstance,
      serverIp: directConnectServer && currentServer ? currentServer.ip : targetInstance.serverIp,
      serverPort: directConnectServer && currentServer ? currentServer.port : targetInstance.serverPort,
    };

    setIsRunning(false);
    setIsPreparing(true);
    setConsoleLogs([
      `[${new Date().toLocaleTimeString()}] [MCLv2/INFO] Khởi động phiên bản: ${launchData.name} (Minecraft ${launchData.gameVersion})`,
      `[${new Date().toLocaleTimeString()}] [MCLv2/INFO] Người chơi: ${account.username} (${account.type.toUpperCase()})`,
      `[${new Date().toLocaleTimeString()}] [MCLv2/INFO] Cấp phát RAM: ${launchData.maxRam} MB`,
      ...(directConnectServer && currentServer
        ? [`[${new Date().toLocaleTimeString()}] [MCLv2/INFO] Tự động vào thẳng Server: ${currentServer.name} (${currentServer.ip}:${currentServer.port})`]
        : []),
    ]);

    setLaunchProgress({
      stage: 'checking',
      percentage: 5,
      currentFile: 'Đang kết nối Mojang CDN và kiểm tra dữ liệu...',
      downloadedBytes: 0,
      totalBytes: 0,
      speedBps: 0,
    });

    if (isTauri()) {
      try {
        await invokeCommand('launch_instance', {
          instanceId: launchData.id,
          username: account.username,
          instanceData: launchData,
        });
      } catch (err: any) {
        setIsPreparing(false);
        setConsoleLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [MCLv2/LỖI] ${err?.toString() || 'Khởi chạy thất bại'}`,
        ]);
        setLaunchProgress({ stage: 'idle', percentage: 0, currentFile: '', downloadedBytes: 0, totalBytes: 0, speedBps: 0 });
        setIsRunning(false);
      }
    } else {
      // Browser preview simulation
      setLaunchProgress({ stage: 'downloading', percentage: 35, currentFile: `client-${launchData.gameVersion}.jar`, downloadedBytes: 25000000, totalBytes: 42000000, speedBps: 8500000 });
      await new Promise((r) => setTimeout(r, 800));
      setLaunchProgress({ stage: 'verifying', percentage: 70, currentFile: 'Xác thực mã băm SHA-1...', downloadedBytes: 42000000, totalBytes: 42000000, speedBps: 0 });
      await new Promise((r) => setTimeout(r, 700));
      setLaunchProgress({ stage: 'running', percentage: 100, currentFile: 'Đang chạy', downloadedBytes: 0, totalBytes: 0, speedBps: 0 });
      setIsRunning(true);
      setIsPreparing(false);
    }
  };

  // Stop Game Handler
  const handleStopGame = async () => {
    if (isTauri()) {
      try {
        await invokeCommand('kill_game');
      } catch (err) {
        console.warn('Kill game error:', err);
      }
    }
    setIsRunning(false);
    setLaunchProgress({ stage: 'idle', percentage: 0, currentFile: '', downloadedBytes: 0, totalBytes: 0, speedBps: 0 });
    setConsoleLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [MCLv2/INFO] Đã gửi lệnh dừng tiến trình trò chơi.`,
    ]);
  };

  // Cancel Download Handler
  const handleCancelDownload = async () => {
    if (isTauri()) {
      try {
        await invokeCommand('cancel_download');
      } catch (err) {
        console.warn('Cancel download error:', err);
      }
    }
    setIsPreparing(false);
    setLaunchProgress({ stage: 'idle', percentage: 0, currentFile: '', downloadedBytes: 0, totalBytes: 0, speedBps: 0 });
    setConsoleLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [MCLv2/INFO] Đã gửi lệnh hủy tiến trình tải tài nguyên.`,
    ]);
  };

  const handleToggleLanguage = () => {
    const next: Language = language === 'vi' ? 'en' : 'vi';
    setLanguage(next);
    localStorage.setItem('mcl_lang', next);
    setSettings((s) => ({ ...s, language: next }));
  };

  const activeInstance = instances.find((i) => i.id === selectedInstanceId) || instances[0];

  return (
    <ErrorBoundary>
      <div
        className={`relative flex flex-col h-screen w-screen overflow-hidden font-sans select-none bg-[#0a0a0a] text-slate-100 style-riot palette-${settings.colorPalette || 'amber'} window-shell`}
      >
        {/* Dynamic Background Media: Persistent across all modals for seamless cinematic look */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 bg-[#0a0a0a]" />

          {settings.bgType === 'image' && settings.customBgImage ? (
            <img
              src={settings.customBgImage}
              alt="Launcher Background"
              className="w-full h-full object-cover select-none relative z-1"
            />
          ) : (
            <video
              ref={videoRef}
              src={settings.customVideoUrl || '/cinematic_bg.mp4'}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover select-none relative z-1"
            />
          )}

          {/* Contrast & Tint Overlays */}
          <div
            className="absolute inset-0 bg-black z-2 pointer-events-none transition-opacity duration-300"
            style={{ opacity: settings.bgOpacity ?? 0.55 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-3 pointer-events-none" />
        </div>

        {/* Outer App Frame: Vertical Sidebar + Main Canvas */}
        <div className="relative z-10 flex h-full w-full overflow-hidden">
          {/* Riot-Style Vertical Left Sidebar */}
          <Sidebar
            currentTab={currentTab}
            onTabChange={(tab) => {
              if (currentTab === tab) {
                setCurrentTab('home'); // Toggle close if clicking active tab
              } else {
                setCurrentTab(tab);
              }
            }}
            account={account}
            onUpdateUsername={handleUpdateUsername}
            language={language}
          />

          {/* Right Main Content Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent">
            {/* Frameless TitleBar */}
            <TitleBar
              onOpenConsole={() => setIsConsoleOpen(true)}
              isRunning={isRunning}
              language={language}
              onToggleLanguage={handleToggleLanguage}
            />

            {/* Persistent Home Screen Canvas */}
            <main className="flex-1 flex overflow-hidden bg-transparent relative">
              <ServerHub
                instances={instances}
                selectedInstanceId={selectedInstanceId}
                onSelectInstance={setSelectedInstanceId}
                onLaunch={handleLaunch}
                onStopGame={handleStopGame}
                onCancelDownload={handleCancelDownload}
                launchProgress={launchProgress}
                isRunning={isRunning}
                isPreparing={isPreparing}
                language={language}
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
                savedServers={savedServers}
                activeServerId={activeServerId}
                onSelectActiveServer={setActiveServerId}
                onOpenServerManager={() => setIsServerManagerOpen(true)}
                directConnectServer={directConnectServer}
                onToggleDirectConnectServer={setDirectConnectServer}
              />
            </main>
          </div>

          {/* Secondary Menus Rendered as Floating Overlay Popups over Home */}
          {currentTab !== 'home' && (
            <div
              className="fixed inset-0 z-40 flex items-center justify-center p-6 sm:p-10 bg-black/75 backdrop-blur-sm animate-fadeIn"
              onClick={() => setCurrentTab('home')}
            >
              <div
                className="w-full max-w-6xl h-[88vh] rounded-3xl bg-[#111111]/95 border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-scaleUp"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Overlay Window Header Bar */}
                <div className="flex items-center justify-between px-8 py-3.5 border-b border-white/[0.08] bg-[#141414]/90 shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-xs font-bold font-riot text-slate-300 uppercase tracking-widest">
                      {currentTab === 'instances' && 'Danh Sách Profile'}
                      {currentTab === 'mods' && 'Cửa Hàng Modrinth'}
                      {currentTab === 'skin' && 'Phòng Thiết Kế Skin'}
                      {currentTab === 'profile' && 'Hồ Sơ Người Chơi'}
                      {currentTab === 'settings' && 'Cài Đặt Hệ Thống'}
                    </span>
                  </div>
                  <button
                    onClick={() => setCurrentTab('home')}
                    title="Đóng cửa sổ (Quay lại trang chủ)"
                    className="w-8 h-8 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Overlay Window Body Content */}
                <div className="flex-1 flex overflow-hidden">
                  {currentTab === 'instances' && (
                    <InstanceList
                      instances={instances}
                      selectedInstanceId={selectedInstanceId}
                      onSelectInstance={setSelectedInstanceId}
                      onLaunchInstance={(id) => {
                        setSelectedInstanceId(id);
                        setCurrentTab('home');
                        handleLaunch();
                      }}
                      onEditInstance={handleEditInstance}
                      onDeleteInstance={handleDeleteInstance}
                      onOpenCreateModal={() => setIsCreateModalOpen(true)}
                      isRunning={isRunning}
                    />
                  )}

                  {currentTab === 'mods' && (
                    <ModStore
                      activeInstance={activeInstance}
                      onOpenCreateModal={() => setIsCreateModalOpen(true)}
                    />
                  )}

                  {currentTab === 'skin' && (
                    <SkinStudio
                      account={account}
                      onUpdateSkin={handleUpdateSkin}
                      instances={instances}
                    />
                  )}

                  {currentTab === 'profile' && (
                    <ProfileView
                      account={account}
                      onUpdateAccount={setAccount}
                      onNavigateSkin={() => setCurrentTab('skin')}
                      instances={instances}
                      language={language}
                    />
                  )}

                  {currentTab === 'settings' && (
                    <SettingsView
                      settings={settings}
                      onSaveSettings={setSettings}
                      language={language}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Sub Modals */}
          <CreateInstanceModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreate={handleCreateInstance}
          />

          <EditInstanceModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            instance={editingInstance}
            onSave={handleSaveEditedInstance}
          />

          <ServerManagerModal
            isOpen={isServerManagerOpen}
            onClose={() => setIsServerManagerOpen(false)}
            servers={savedServers}
            activeServerId={activeServerId}
            onSelectActiveServer={setActiveServerId}
            onAddServer={handleAddServer}
            onUpdateServer={handleUpdateServer}
            onDeleteServer={handleDeleteServer}
          />

          <ConsoleModal
            isOpen={isConsoleOpen}
            onClose={() => setIsConsoleOpen(false)}
            logs={consoleLogs}
            onClearLogs={() => setConsoleLogs([])}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;
