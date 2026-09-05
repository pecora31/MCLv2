import React, { useState, useEffect, useRef } from 'react';
import { TitleBar } from './components/layout/TitleBar';
import { Sidebar } from './components/layout/Sidebar';
import type { NavigationTab } from './components/layout/Sidebar';
import { ServerHub } from './components/home/ServerHub';
import { InstanceList } from './components/instances/InstanceList';
import { CreateInstanceModal } from './components/instances/CreateInstanceModal';
import { SkinStudio } from './components/skin/SkinStudio';
import { ModStore } from './components/mods/ModStore';
import { SettingsView } from './components/settings/SettingsView';
import { ProfileView } from './components/profile/ProfileView';
import { ConsoleModal } from './components/common/ConsoleModal';
import type { GameInstance, Account, LauncherSettings, LaunchProgress } from './types';
import { invokeCommand, isTauri } from './services/api';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';
import type { Language } from './locales/i18n';

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

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
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

  // Apply 1600x900 Riot Client dimensions, disable shadow (white border) and center window
  useEffect(() => {
    if (isTauri()) {
      const configureWindow = async () => {
        try {
          const win = getCurrentWindow();
          await win.setShadow(true);
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

    setInstances((prev) => [newInstance, ...prev]);
    setSelectedInstanceId(newInstance.id);
  };

  const handleDeleteInstance = (id: string) => {
    setInstances((prev) => prev.filter((i) => i.id !== id));
    if (selectedInstanceId === id) {
      const remaining = instances.filter((i) => i.id !== id);
      if (remaining.length > 0) setSelectedInstanceId(remaining[0].id);
    }
  };

  const handleUpdateUsername = (newName: string) => {
    setAccount((prev) => ({ ...prev, username: newName }));
  };

  const handleUpdateSkin = (skinUrl: string, model: 'classic' | 'slim') => {
    setAccount((prev) => ({ ...prev, skinUrl, skinModel: model }));
  };

  // Listen to Tauri native download progress, game log stream, game start, and game exit
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
    if (!targetInstance) return;

    setIsRunning(false);
    setIsPreparing(true);
    setConsoleLogs([
      `[${new Date().toLocaleTimeString()}] [MCLv2/INFO] Khởi động phiên bản: ${targetInstance.name} (Minecraft ${targetInstance.gameVersion})`,
      `[${new Date().toLocaleTimeString()}] [MCLv2/INFO] Người chơi: ${account.username} (${account.type.toUpperCase()})`,
      `[${new Date().toLocaleTimeString()}] [MCLv2/INFO] Cấp phát RAM: ${targetInstance.maxRam} MB`,
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
          instanceId: targetInstance.id,
          username: account.username,
        });
      } catch (err: any) {
        setConsoleLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [MCLv2/LỖI] ${err?.toString() || 'Khởi chạy thất bại'}`,
        ]);
        setLaunchProgress({ stage: 'idle', percentage: 0, currentFile: '', downloadedBytes: 0, totalBytes: 0, speedBps: 0 });
        setIsRunning(false);
      }
    } else {
      // Browser preview simulation
      setLaunchProgress({ stage: 'downloading', percentage: 35, currentFile: `client-${targetInstance.gameVersion}.jar`, downloadedBytes: 25000000, totalBytes: 42000000, speedBps: 8500000 });
      await new Promise((r) => setTimeout(r, 800));
      setLaunchProgress({ stage: 'verifying', percentage: 70, currentFile: 'Xác thực mã băm SHA-1...', downloadedBytes: 42000000, totalBytes: 42000000, speedBps: 0 });
      await new Promise((r) => setTimeout(r, 700));
      setLaunchProgress({ stage: 'running', percentage: 100, currentFile: 'Đang chạy', downloadedBytes: 0, totalBytes: 0, speedBps: 0 });
      setIsRunning(true);
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

  const handleToggleLanguage = () => {
    const next: Language = language === 'vi' ? 'en' : 'vi';
    setLanguage(next);
    localStorage.setItem('mcl_lang', next);
    setSettings((s) => ({ ...s, language: next }));
  };

  const activeInstance = instances.find((i) => i.id === selectedInstanceId) || instances[0];

  return (
    <div
      className={`relative flex flex-col h-screen w-screen overflow-hidden font-sans select-none bg-[#0a0a0a] text-slate-100 style-riot palette-${settings.colorPalette || 'amber'} window-shell`}
    >
      {/* Dynamic Background Media: Looping Video or Custom Image - ONLY shown on Home tab */}
      <div
        className={`absolute inset-0 overflow-hidden pointer-events-none z-0 transition-opacity duration-300 ${
          currentTab === 'home' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Atmospheric fallback gradient */}
        <div className="absolute inset-0 bg-[#0a0a0a]" />

        {settings.bgType === 'image' && settings.customBgImage ? (
          <img
            src={settings.customBgImage}
            alt="Launcher Background"
            className="w-full h-full object-cover select-none relative z-1"
            onError={() => {
              console.warn('Background image failed to load, falling back to video');
              setSettings((s) => ({ ...s, bgType: 'video' }));
            }}
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover select-none relative z-1"
            src={settings.customVideoUrl || '/background.mp4'}
          >
            <source src={settings.customVideoUrl || '/background.mp4'} type="video/mp4" />
          </video>
        )}
        {/* Darkness overlay (vignette) */}
        <div
          className="absolute inset-0 bg-[#0a0a0a] z-2"
          style={{
            opacity: typeof settings.bgOpacity === 'number'
              ? Math.min(Math.max(settings.bgOpacity, 0.1), 0.85)
              : 0.45,
          }}
        />
      </div>

      {/* Main Foreground Container: Full-Height Sidebar on Left, Canvas Column on Right */}
      <div className="relative z-10 flex h-full w-full bg-transparent overflow-hidden">
        {/* Full-Height Sidebar (matching Riot Client Image 5) */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          account={account}
          onUpdateUsername={handleUpdateUsername}
          language={language}
        />

        {/* Right Canvas Column: TitleBar + Dynamic Content View */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent">
          {/* Frameless TitleBar (only right side controls, no duplicate MC logo) */}
          <TitleBar
            onOpenConsole={() => setIsConsoleOpen(true)}
            isRunning={isRunning}
            language={language}
            onToggleLanguage={handleToggleLanguage}
          />

          {/* Dynamic Content View with Persistent Tab Panels for Instant, Smooth Transitions */}
          <main className="flex-1 flex overflow-hidden bg-transparent relative">
            <div className={`tab-panel ${currentTab === 'home' ? 'active' : ''}`}>
              <ServerHub
                instances={instances}
                selectedInstanceId={selectedInstanceId}
                onSelectInstance={setSelectedInstanceId}
                onLaunch={handleLaunch}
                onStopGame={handleStopGame}
                launchProgress={launchProgress}
                isRunning={isRunning}
                isPreparing={isPreparing}
                language={language}
              />
            </div>

            <div className={`tab-panel ${currentTab === 'instances' ? 'active' : ''}`}>
              <InstanceList
                instances={instances}
                selectedInstanceId={selectedInstanceId}
                onSelectInstance={setSelectedInstanceId}
                onLaunchInstance={(id) => {
                  setSelectedInstanceId(id);
                  handleLaunch();
                }}
                onDeleteInstance={handleDeleteInstance}
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
                isRunning={isRunning}
              />
            </div>

            <div className={`tab-panel ${currentTab === 'mods' ? 'active' : ''}`}>
              <ModStore activeInstance={activeInstance} />
            </div>

            <div className={`tab-panel ${currentTab === 'skin' ? 'active' : ''}`}>
              <SkinStudio
                account={account}
                onUpdateSkin={handleUpdateSkin}
                instances={instances}
              />
            </div>

            <div className={`tab-panel ${currentTab === 'profile' ? 'active' : ''}`}>
              <ProfileView
                account={account}
                onUpdateAccount={setAccount}
                onNavigateSkin={() => setCurrentTab('skin')}
                instances={instances}
                language={language}
              />
            </div>

            <div className={`tab-panel ${currentTab === 'settings' ? 'active' : ''}`}>
              <SettingsView
                settings={settings}
                onSaveSettings={setSettings}
                language={language}
              />
            </div>
          </main>
        </div>

        {/* Modals */}
        <CreateInstanceModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateInstance}
        />

        <ConsoleModal
          isOpen={isConsoleOpen}
          onClose={() => setIsConsoleOpen(false)}
          logs={consoleLogs}
          onClearLogs={() => setConsoleLogs([])}
        />
      </div>
    </div>
  );
};

export default App;
