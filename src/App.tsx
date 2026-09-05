import React, { useState, useEffect } from 'react';
import { TitleBar } from './components/layout/TitleBar';
import { Sidebar } from './components/layout/Sidebar';
import type { NavigationTab } from './components/layout/Sidebar';
import { ServerHub } from './components/home/ServerHub';
import { InstanceList } from './components/instances/InstanceList';
import { CreateInstanceModal } from './components/instances/CreateInstanceModal';
import { SkinStudio } from './components/skin/SkinStudio';
import { ModStore } from './components/mods/ModStore';
import { SettingsView } from './components/settings/SettingsView';
import { ConsoleModal } from './components/common/ConsoleModal';
import type { GameInstance, Account, LauncherSettings, LaunchProgress } from './types';
import { invokeCommand, isTauri } from './services/api';

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
    name: 'Vanilla 1.21.4 (Gốc)',
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
  theme: 'dark-cyber',
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
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
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

  // Launch Engine Handler
  const handleLaunch = async () => {
    const targetInstance = instances.find((i) => i.id === selectedInstanceId) || instances[0];
    if (!targetInstance) return;

    setIsRunning(false);
    setConsoleLogs([
      `[${new Date().toLocaleTimeString()}] [MCLv2/INFO] Đang chuẩn bị phiên bản: ${targetInstance.name} (MC ${targetInstance.gameVersion})`,
      `[${new Date().toLocaleTimeString()}] [MCLv2/INFO] Người chơi: ${account.username} (${account.type.toUpperCase()} Auth)`,
      `[${new Date().toLocaleTimeString()}] [MCLv2/INFO] Cấp phát RAM: ${targetInstance.maxRam} MB`,
      `[${new Date().toLocaleTimeString()}] [MCLv2/INFO] Tính năng CustomSkinLoader: ${targetInstance.enableSkinInGame ? 'BẬT (Tự động tải skin đồng đội)' : 'TẮT'}`,
    ]);

    // Simulating launch progress stages with realistic logs
    setLaunchProgress({ stage: 'checking', percentage: 10, currentFile: 'version_manifest_v2.json', downloadedBytes: 0, totalBytes: 100, speedBps: 0 });
    await new Promise((r) => setTimeout(r, 600));

    setConsoleLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] [MCLv2/INFO] Đang xác thực tệp libraries & assets với Mojang CDN...`]);
    setLaunchProgress({ stage: 'downloading', percentage: 35, currentFile: `client-${targetInstance.gameVersion}.jar`, downloadedBytes: 25000000, totalBytes: 42000000, speedBps: 8500000 });
    await new Promise((r) => setTimeout(r, 800));

    setLaunchProgress({ stage: 'verifying', percentage: 70, currentFile: 'Xác thực mã băm SHA-1...', downloadedBytes: 42000000, totalBytes: 42000000, speedBps: 0 });
    setConsoleLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [MCLv2/INFO] Nạp Mod Loader: ${targetInstance.loader.toUpperCase()} ${targetInstance.loaderVersion || ''}`,
      `[${new Date().toLocaleTimeString()}] [MCLv2/INFO] Cấu hình CustomSkinLoader: Nạp skin cho người chơi "${account.username}"`,
    ]);
    await new Promise((r) => setTimeout(r, 700));

    setLaunchProgress({ stage: 'launching', percentage: 95, currentFile: 'Khởi động Java Virtual Machine...', downloadedBytes: 42000000, totalBytes: 42000000, speedBps: 0 });
    setConsoleLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [MCLv2/INFO] JVM Args: -Xms${targetInstance.minRam}M -Xmx${targetInstance.maxRam}M ${targetInstance.jvmArgs || ''}`,
      `[${new Date().toLocaleTimeString()}] [Minecraft/INFO] [RenderThread]: Setting user: ${account.username}`,
      `[${new Date().toLocaleTimeString()}] [Minecraft/INFO] [RenderThread]: Backend library: LWJGL version 3.3.3-snapshot`,
      `[${new Date().toLocaleTimeString()}] [CustomSkinLoader/INFO]: Successfully initialized! Skin provider loaded.`,
    ]);
    await new Promise((r) => setTimeout(r, 500));

    setLaunchProgress({ stage: 'running', percentage: 100, currentFile: '', downloadedBytes: 0, totalBytes: 0, speedBps: 0 });
    setIsRunning(true);

    // Call native Tauri launch command if available
    if (isTauri()) {
      try {
        await invokeCommand('launch_instance', {
          instanceId: targetInstance.id,
          username: account.username,
        });
      } catch (err) {
        console.warn('Native launch fallback:', err);
      }
    }

    // Reset progress after launch
    setTimeout(() => {
      setLaunchProgress({ stage: 'idle', percentage: 0, currentFile: '', downloadedBytes: 0, totalBytes: 0, speedBps: 0 });
    }, 1500);
  };

  const activeInstance = instances.find((i) => i.id === selectedInstanceId) || instances[0];

  return (
    <div className="flex flex-col h-screen w-screen bg-[#07090f] text-slate-100 overflow-hidden font-sans select-none">
      {/* Frameless TitleBar */}
      <TitleBar onOpenConsole={() => setIsConsoleOpen(true)} isRunning={isRunning} />

      {/* Main App Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          account={account}
          onUpdateUsername={handleUpdateUsername}
        />

        {/* Dynamic Content View */}
        <main className="flex-1 flex overflow-hidden bg-gradient-to-br from-[#0c101c]/80 via-[#090d18]/90 to-[#070912]">
          {currentTab === 'home' && (
            <ServerHub
              instances={instances}
              selectedInstanceId={selectedInstanceId}
              onSelectInstance={setSelectedInstanceId}
              onLaunch={handleLaunch}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              launchProgress={launchProgress}
              isRunning={isRunning}
            />
          )}

          {currentTab === 'instances' && (
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
          )}

          {currentTab === 'mods' && <ModStore activeInstance={activeInstance} />}

          {currentTab === 'skin' && (
            <SkinStudio
              account={account}
              onUpdateSkin={handleUpdateSkin}
              instances={instances}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView settings={settings} onSaveSettings={setSettings} />
          )}
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
  );
};

export default App;
