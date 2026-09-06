import React, { useState, useEffect } from 'react';
import { Play, Wifi, Users, Server, Copy, Check, RefreshCw, Square, ChevronDown, Plus, Globe, Pause, Trash2, Edit3, Save, X } from 'lucide-react';
import type { GameInstance, ServerStatus, LaunchProgress, SavedServer } from '../../types';
import { pingServer } from '../../services/api';
import { getTranslation, type Language } from '../../locales/i18n';

interface ServerHubProps {
  instances: GameInstance[];
  selectedInstanceId: string;
  onSelectInstance: (id: string) => void;
  onLaunch: () => void;
  onStopGame: () => void;
  onCancelDownload?: () => void;
  launchProgress: LaunchProgress;
  isRunning: boolean;
  isPreparing?: boolean;
  language: Language;
  onOpenCreateModal?: () => void;
  savedServers: SavedServer[];
  activeServerId: string;
  onSelectActiveServer: (id: string) => void;
  onAddServer: (server: Omit<SavedServer, 'id'>) => void;
  onUpdateServer: (server: SavedServer) => void;
  onDeleteServer: (id: string) => void;
  directConnectServer: boolean;
  onToggleDirectConnectServer: (enabled: boolean) => void;
}

export const ServerHub: React.FC<ServerHubProps> = ({
  instances,
  selectedInstanceId,
  onSelectInstance,
  onLaunch,
  onStopGame,
  onCancelDownload,
  launchProgress,
  isRunning,
  isPreparing = false,
  language,
  onOpenCreateModal,
  savedServers,
  activeServerId,
  onSelectActiveServer,
  onAddServer,
  onUpdateServer,
  onDeleteServer,
  directConnectServer,
  onToggleDirectConnectServer,
}) => {
  const t = getTranslation(language);
  const selectedInstance = instances.find((i) => i.id === selectedInstanceId) || instances[0];
  const currentSavedServer = savedServers.find((s) => s.id === activeServerId) || savedServers[0];

  const [activeTab, setActiveTab] = useState<'overview' | 'server'>('overview');
  const [copied, setCopied] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [isHoveringStop, setIsHoveringStop] = useState(false);
  const [isHoveringLoadingButton, setIsHoveringLoadingButton] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isServerDropdownOpen, setIsServerDropdownOpen] = useState(false);

  // Server management states inside Server Info tab
  const [isAddingServer, setIsAddingServer] = useState(false);
  const [editingServerId, setEditingServerId] = useState<string | null>(null);
  const [serverNameInput, setServerNameInput] = useState('');
  const [serverIpInput, setServerIpInput] = useState('');
  const [serverPortInput, setServerPortInput] = useState(25565);

  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    ip: currentSavedServer?.ip || 'play.ourserver.mc',
    port: currentSavedServer?.port || 25565,
    online: true,
    playersOnline: 4,
    playersMax: 20,
    version: 'Fabric 1.21.4',
    motd: 'MCL Community Server',
    pingMs: 24,
  });

  const handleRefreshPing = async () => {
    setIsPinging(true);
    const targetIp = currentSavedServer?.ip || 'play.ourserver.mc';
    const targetPort = currentSavedServer?.port || 25565;
    try {
      const status = await pingServer(targetIp, targetPort);
      setServerStatus(status);
    } catch {
      // Keep existing
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    handleRefreshPing();
    const interval = setInterval(handleRefreshPing, 30000);
    return () => clearInterval(interval);
  }, [currentSavedServer?.ip, currentSavedServer?.port]);

  const handleCopyIp = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const target = currentSavedServer
      ? `${currentSavedServer.ip}${currentSavedServer.port !== 25565 ? `:${currentSavedServer.port}` : ''}`
      : `${serverStatus.ip}:${serverStatus.port}`;
    navigator.clipboard.writeText(target);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartAddServer = () => {
    setServerNameInput('');
    setServerIpInput('');
    setServerPortInput(25565);
    setIsAddingServer(true);
    setEditingServerId(null);
  };

  const handleStartEditServer = (srv: SavedServer) => {
    setServerNameInput(srv.name);
    setServerIpInput(srv.ip);
    setServerPortInput(srv.port);
    setEditingServerId(srv.id);
    setIsAddingServer(false);
  };

  const handleSaveServerForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverNameInput.trim() || !serverIpInput.trim()) return;

    if (isAddingServer) {
      onAddServer({
        name: serverNameInput.trim(),
        ip: serverIpInput.trim(),
        port: serverPortInput || 25565,
      });
      setIsAddingServer(false);
    } else if (editingServerId) {
      onUpdateServer({
        id: editingServerId,
        name: serverNameInput.trim(),
        ip: serverIpInput.trim(),
        port: serverPortInput || 25565,
      });
      setEditingServerId(null);
    }
  };

  const isPreparingOrDownloading =
    isPreparing ||
    (launchProgress.stage !== 'idle' && launchProgress.stage !== 'running' && !isRunning);

  // SVG Circular Progress calculation
  const circleRadius = 15;
  const circleCircumference = 2 * Math.PI * circleRadius; // ~94.25
  const progressPercent = Math.min(100, Math.max(3, launchProgress.percentage || 0));
  const strokeOffset = circleCircumference - (circleCircumference * progressPercent) / 100;

  return (
    <div className="flex-1 flex flex-col justify-between overflow-hidden relative select-none bg-transparent">
      {/* Top Header Capsule Bar */}
      <div className="px-10 pt-4 pb-2 flex items-center justify-between z-10 bg-transparent">
        {/* Center Capsule Tabs */}
        <div className="p-1.5 rounded-full bg-[#141414]/90 border border-white/[0.08] flex items-center gap-1.5 shadow-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-full text-sm font-semibold tracking-wide transition-colors border ${
              activeTab === 'overview'
                ? 'bg-amber-500/25 text-amber-300 border-amber-500/40'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('server')}
            className={`px-6 py-2 rounded-full text-sm font-semibold tracking-wide transition-colors border ${
              activeTab === 'server'
                ? 'bg-amber-500/25 text-amber-300 border-amber-500/40'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Server Info & Hub
          </button>
        </div>

        {/* Top-Right Notification pill removed per user request */}
        <div />
      </div>

      {/* Main Body Area */}
      <div className="flex-1 flex flex-col justify-center px-12 py-3 relative z-10">
        {activeTab === 'overview' ? (
          <div className="max-w-2xl space-y-5 animate-fadeIn">
            {/* Version Badge: strictly BETA 0.2.1 */}
            <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold tracking-widest shadow-sm">
              <span>BETA 0.2.1</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-normal leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
              MCL Client
            </h1>

            {/* Description */}
            <p className="text-base text-slate-200 leading-relaxed max-w-xl drop-shadow-md font-normal tracking-wide">
              Next-generation Minecraft launcher with high-performance optimization, direct server connection, and unified profile management.
            </p>

            {/* Action Zone: Fixed-Size Play Button & Profile Box */}
            <div className="pt-1">
              <div className="flex items-center gap-3">
                {/* 1. Standalone Play Button - Strictly Fixed w-[220px] h-[64px] */}
                <div className="relative shrink-0">
                  {isRunning ? (
                    <button
                      onClick={onStopGame}
                      onMouseEnter={() => setIsHoveringStop(true)}
                      onMouseLeave={() => setIsHoveringStop(false)}
                      className="btn-riot-running w-[220px] h-[64px] rounded-2xl flex items-center justify-center gap-3 text-lg font-bold shadow-xl shrink-0"
                    >
                      {isHoveringStop ? (
                        <>
                          <Square className="w-5 h-5 fill-current" />
                          <span>STOP GAME</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                          <span>IN GAME</span>
                        </>
                      )}
                    </button>
                  ) : isPreparingOrDownloading ? (
                    /* Circular Loading Inside Play Button with Hover Pause/Cancel */
                    <button
                      onClick={onCancelDownload}
                      onMouseEnter={() => setIsHoveringLoadingButton(true)}
                      onMouseLeave={() => setIsHoveringLoadingButton(false)}
                      title="Click to cancel download"
                      className="w-[220px] h-[64px] rounded-2xl bg-[#161616] border border-amber-500/50 hover:border-red-500/60 transition-colors shadow-2xl flex items-center px-4 gap-3.5 group cursor-pointer shrink-0"
                    >
                      {/* Circular Progress Ring */}
                      <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
                        <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
                          {/* Background Ring */}
                          <circle
                            cx="18"
                            cy="18"
                            r={circleRadius}
                            className="text-white/10"
                            strokeWidth="3"
                            stroke="currentColor"
                            fill="transparent"
                          />
                          {/* Active Progress Ring */}
                          <circle
                            cx="18"
                            cy="18"
                            r={circleRadius}
                            className="text-amber-400 group-hover:text-red-400 transition-all duration-300"
                            strokeWidth="3"
                            strokeDasharray={circleCircumference}
                            strokeDashoffset={strokeOffset}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                          />
                        </svg>

                        {/* Center Icon or Percentage */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          {isHoveringLoadingButton ? (
                            <Pause className="w-4 h-4 text-red-400 fill-current animate-pulse" />
                          ) : (
                            <span className="text-[10px] font-mono font-bold text-amber-300">
                              {progressPercent}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status Text inside button */}
                      <div className="flex flex-col text-left min-w-0">
                        <span className="text-xs font-bold text-white tracking-wider truncate">
                          {isHoveringLoadingButton ? 'CANCEL' : 'DOWNLOADING...'}
                        </span>
                        <span className="text-[10px] font-mono text-amber-400 truncate">
                          {isHoveringLoadingButton
                            ? 'Click to stop'
                            : launchProgress.speedBps > 0
                            ? `${(launchProgress.speedBps / (1024 * 1024)).toFixed(1)} MB/s`
                            : 'Preparing files'}
                        </span>
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={selectedInstance ? onLaunch : onOpenCreateModal}
                      className="btn-riot-play w-[220px] h-[64px] rounded-2xl flex items-center justify-center gap-3 text-xl font-bold shadow-xl shrink-0"
                    >
                      {selectedInstance ? (
                        <>
                          <Play className="w-5 h-5 fill-current" />
                          <span className="tracking-wider text-2xl font-black">PLAY</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          <span className="tracking-wide text-base">New Profile</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* 2. Profile Selector Box - Strictly Fixed w-[280px] h-[64px] */}
                <div className="relative shrink-0">
                  <button
                    onClick={selectedInstance ? () => setIsProfileDropdownOpen((prev) => !prev) : onOpenCreateModal}
                    disabled={isRunning || isPreparingOrDownloading}
                    title={selectedInstance ? 'Click to select profile' : 'Click to create profile'}
                    className={`w-[280px] h-[64px] px-4 rounded-2xl bg-[#141414] hover:bg-[#1a1a1a] border transition-colors shadow-lg flex items-center justify-between cursor-pointer shrink-0 ${
                      isProfileDropdownOpen ? 'border-amber-400/50 bg-[#1c1c1c]' : 'border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    <div className="flex flex-col text-left flex-1 min-w-0 pr-2">
                      <span className="font-bold text-white text-sm tracking-wide leading-tight truncate">
                        {selectedInstance?.name || 'No Profiles'}
                      </span>
                      <span className="text-amber-400 text-xs font-semibold leading-tight font-mono truncate mt-0.5">
                        {selectedInstance
                          ? `${selectedInstance.loader ? selectedInstance.loader.toUpperCase() : 'VANILLA'} ${selectedInstance.gameVersion}`
                          : 'Click to create'}
                      </span>
                    </div>

                    <div className="w-px h-7 bg-white/10 mx-1 shrink-0" />

                    <div className="shrink-0 pl-1">
                      {selectedInstance ? (
                        <ChevronDown
                          className={`w-5 h-5 text-slate-400 transition-transform duration-150 ${
                            isProfileDropdownOpen ? 'rotate-180 text-amber-300' : ''
                          }`}
                        />
                      ) : (
                        <Plus className="w-5 h-5 text-amber-400" />
                      )}
                    </div>
                  </button>

                  {/* Profile Dropdown Popover */}
                  {isProfileDropdownOpen && (
                    <div className="absolute left-0 top-[calc(100%+8px)] w-72 rounded-2xl bg-[#141414] border border-white/10 shadow-2xl p-2 z-50 space-y-1 animate-fadeIn">
                      <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Select Profile
                      </div>
                      <div className="max-h-56 overflow-y-auto space-y-1 custom-scrollbar">
                        {instances.map((inst) => (
                          <button
                            key={inst.id}
                            onClick={() => {
                              onSelectInstance(inst.id);
                              setIsProfileDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between transition-colors border ${
                              inst.id === selectedInstanceId
                                ? 'bg-amber-500/20 text-amber-300 font-bold border-amber-500/30'
                                : 'border-transparent text-slate-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <span className="truncate font-semibold">{inst.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono shrink-0 ml-2">
                              {inst.loader.toUpperCase()} {inst.gameVersion}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Server Widget - Located BELOW Play Button & Profile Box */}
              {/* Width = 220px (Play) + 12px (gap) + 280px (Profile) = 512px exact */}
              <div className="w-[512px] mt-3.5 p-3.5 rounded-2xl bg-[#121212]/90 border border-white/[0.08] shadow-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  {/* Active Server Dropdown */}
                  <div className="flex items-center gap-2.5 relative">
                    <span className={`w-2.5 h-2.5 rounded-full ${serverStatus.online ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />

                    <div className="relative">
                      <button
                        onClick={() => setIsServerDropdownOpen(!isServerDropdownOpen)}
                        className="flex items-center gap-1.5 text-sm font-bold text-white hover:text-amber-300 transition"
                        title="Click to switch active server"
                      >
                        <span className="truncate max-w-[200px]">{currentSavedServer?.name || 'Minecraft Server'}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isServerDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown Menu */}
                      {isServerDropdownOpen && (
                        <div className="absolute left-0 top-[calc(100%+8px)] w-64 rounded-2xl bg-[#181818] border border-white/10 shadow-2xl p-2 z-50 space-y-1 animate-fadeIn">
                          <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Saved Servers
                          </div>
                          {savedServers.map((srv) => (
                            <button
                              key={srv.id}
                              onClick={() => {
                                onSelectActiveServer(srv.id);
                                setIsServerDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition border ${
                                srv.id === activeServerId
                                  ? 'bg-amber-500/20 text-amber-300 font-bold border-amber-500/30'
                                  : 'border-transparent text-slate-300 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              <span className="truncate font-semibold">{srv.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">{srv.ip}</span>
                            </button>
                          ))}
                          <div className="pt-1 border-t border-white/[0.06]">
                            <button
                              onClick={() => {
                                setIsServerDropdownOpen(false);
                                setActiveTab('server');
                              }}
                              className="w-full text-left px-3 py-1.5 rounded-xl text-xs text-amber-400 font-semibold hover:bg-amber-500/10 transition flex items-center gap-1.5"
                            >
                              <Server className="w-3.5 h-3.5" />
                              <span>Manage Servers</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Live Ping & Player Count */}
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-slate-300 font-semibold">{serverStatus.playersOnline}/{serverStatus.playersMax} Online</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-emerald-400 font-bold">{serverStatus.pingMs ?? '--'} ms</span>
                  </div>
                </div>

                {/* Bottom Row: Copy IP Badge & Switch Toggle for Connect on Play */}
                <div className="flex items-center justify-between pt-1 text-xs border-t border-white/[0.04] gap-2">
                  <button
                    onClick={handleCopyIp}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition border ${
                      copied
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-white/[0.04] text-slate-300 hover:text-amber-300 border-white/[0.06] hover:border-amber-400/40'
                    }`}
                    title="Click to copy server IP address"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                    <span className="font-semibold truncate max-w-[160px]">{currentSavedServer?.ip || serverStatus.ip}</span>
                    <span className="text-[10px] opacity-75">{copied ? '(Copied!)' : '(Copy)'}</span>
                  </button>

                  {/* Switch Toggle for Direct Connect */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={directConnectServer}
                      onClick={() => onToggleDirectConnectServer(!directConnectServer)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        directConnectServer ? 'bg-amber-500' : 'bg-white/20'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          directConnectServer ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-xs font-semibold text-slate-300 select-none">
                      Connect on Play
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Server Info & Hub Tab: Integrated with Multi-Server Management */
          <div className="max-w-3xl space-y-4 animate-fadeIn overflow-y-auto max-h-[75vh] custom-scrollbar pr-2">
            <div className="minimal-panel rounded-2xl p-6 border border-white/[0.06] space-y-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] text-amber-400 flex items-center justify-center border border-white/10">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white font-riot tracking-wide">{currentSavedServer?.name || 'Active Server'}</h2>
                    <p className="text-xs text-slate-400">Manage connections, view live status, and configure saved servers</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleStartAddServer}
                    className="btn-primary px-3.5 py-1.5 rounded-xl text-xs font-bold font-riot flex items-center gap-1.5 shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Server</span>
                  </button>
                  <button
                    onClick={handleRefreshPing}
                    disabled={isPinging}
                    className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* MOTD Banner */}
              <div className="p-4 rounded-xl bg-black/50 border border-white/5 font-mono text-sm text-amber-200 shadow-inner">
                {serverStatus.motd?.replace(/§[0-9a-fk-or]/g, '') || 'MCL Community Minecraft Server'}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-slate-400 text-xs mb-1 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>Online Players</span>
                  </div>
                  <div className="text-xl font-bold text-white font-mono">
                    {serverStatus.playersOnline} <span className="text-xs text-slate-500 font-normal">/ {serverStatus.playersMax}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-slate-400 text-xs mb-1 flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ping Latency</span>
                  </div>
                  <div className="text-xl font-bold text-emerald-400 font-mono">
                    {serverStatus.pingMs ?? '--'} <span className="text-xs font-normal">ms</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                  <div className="text-slate-400 text-xs mb-1">Server Address</div>
                  <button
                    onClick={handleCopyIp}
                    className="flex items-center justify-between text-xs font-mono text-amber-300 hover:text-amber-200 transition"
                  >
                    <span className="truncate">{currentSavedServer?.ip || serverStatus.ip}</span>
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Inline Add / Edit Server Form */}
              {(isAddingServer || editingServerId) && (
                <form onSubmit={handleSaveServerForm} className="p-4 rounded-2xl bg-white/[0.03] border border-amber-500/30 space-y-4 animate-fadeIn">
                  <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber-400" />
                    <span>{isAddingServer ? 'Add New Minecraft Server' : 'Edit Server Connection'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Server Name</label>
                      <input
                        type="text"
                        value={serverNameInput}
                        onChange={(e) => setServerNameInput(e.target.value)}
                        placeholder="e.g. Friends Survival"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-[#181818] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">IP / Hostname</label>
                        <input
                          type="text"
                          value={serverIpInput}
                          onChange={(e) => setServerIpInput(e.target.value)}
                          placeholder="play.server.com"
                          required
                          className="w-full px-3 py-2 rounded-xl bg-[#181818] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Port</label>
                        <input
                          type="number"
                          value={serverPortInput}
                          onChange={(e) => setServerPortInput(Number(e.target.value))}
                          className="w-full px-2.5 py-2 rounded-xl bg-[#181818] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingServer(false);
                        setEditingServerId(null);
                      }}
                      className="px-3.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary px-4 py-1.5 rounded-xl text-xs font-bold font-riot shadow"
                    >
                      {isAddingServer ? 'Save Server' : 'Update Server'}
                    </button>
                  </div>
                </form>
              )}

              {/* Saved Servers List */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Saved Servers ({savedServers.length})</span>
                  <span className="text-[11px] text-slate-500 font-normal">Click any server to set as active</span>
                </div>

                <div className="space-y-2">
                  {savedServers.map((srv) => {
                    const isActive = srv.id === activeServerId;

                    return (
                      <div
                        key={srv.id}
                        onClick={() => onSelectActiveServer(srv.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                          isActive
                            ? 'bg-amber-500/10 border-amber-500/40 shadow-lg'
                            : 'bg-[#161616] hover:bg-[#1a1a1a] border-white/[0.06] hover:border-white/15'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                              isActive
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                : 'bg-white/[0.04] text-slate-400 border-white/10'
                            }`}
                          >
                            <Wifi className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm truncate">{srv.name}</span>
                              {isActive && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/25 text-amber-300 border border-amber-500/40 font-mono tracking-wider">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                              {srv.ip}{srv.port && srv.port !== 25565 ? `:${srv.port}` : ''}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleStartEditServer(srv)}
                            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
                            title="Edit server"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {savedServers.length > 1 && (
                            <button
                              onClick={() => onDeleteServer(srv.id)}
                              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                              title="Delete server"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clean Bottom Footer */}
      <div className="bg-gradient-to-t from-black/95 via-black/50 to-transparent pb-6 pt-6 px-12 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab(activeTab === 'server' ? 'overview' : 'server')}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-2 shadow-md ${
              activeTab === 'server'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-[#141414] hover:bg-[#1c1c1c] text-slate-300 hover:text-white border-white/[0.08]'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-amber-400" />
            <span>{activeTab === 'server' ? 'Back to Home' : 'Server Info & Hub'}</span>
          </button>
        </div>

        {isRunning && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#081810] border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Minecraft is Running</span>
          </div>
        )}
      </div>
    </div>
  );
};
