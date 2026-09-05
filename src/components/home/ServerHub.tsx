import React, { useState, useEffect } from 'react';
import { Play, Wifi, Users, Server, Copy, Check, RefreshCw, Square, ChevronDown, ShieldCheck, Sparkles } from 'lucide-react';
import type { GameInstance, ServerStatus, LaunchProgress } from '../../types';
import { pingServer } from '../../services/api';
import { getTranslation, type Language } from '../../locales/i18n';

interface ServerHubProps {
  instances: GameInstance[];
  selectedInstanceId: string;
  onSelectInstance: (id: string) => void;
  onLaunch: () => void;
  onStopGame: () => void;
  launchProgress: LaunchProgress;
  isRunning: boolean;
  isPreparing?: boolean;
  language: Language;
}

export const ServerHub: React.FC<ServerHubProps> = ({
  instances,
  selectedInstanceId,
  onSelectInstance,
  onLaunch,
  onStopGame,
  launchProgress,
  isRunning,
  isPreparing = false,
  language,
}) => {
  const t = getTranslation(language);
  const selectedInstance = instances.find((i) => i.id === selectedInstanceId) || instances[0];
  const [activeTab, setActiveTab] = useState<'overview' | 'server'>('overview');
  const [copied, setCopied] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [isHoveringStop, setIsHoveringStop] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    ip: selectedInstance?.serverIp || 'play.ourserver.mc',
    port: selectedInstance?.serverPort || 25565,
    online: true,
    playersOnline: 4,
    playersMax: 20,
    version: 'Fabric 1.21.4',
    motd: 'Máy Chủ Minecraft Nhóm Bạn',
    pingMs: 24,
  });

  const handleRefreshPing = async () => {
    setIsPinging(true);
    try {
      const status = await pingServer(selectedInstance?.serverIp || 'play.ourserver.mc', selectedInstance?.serverPort || 25565);
      setServerStatus(status);
    } catch {
      // Keep existing status
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    handleRefreshPing();
    const interval = setInterval(handleRefreshPing, 30000);
    return () => clearInterval(interval);
  }, [selectedInstance?.serverIp, selectedInstance?.serverPort]);

  const handleCopyIp = () => {
    navigator.clipboard.writeText(`${serverStatus.ip}:${serverStatus.port}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Actively downloading/preparing if flag is true OR progress stage is active and not running
  const isPreparingOrDownloading =
    isPreparing ||
    (launchProgress.stage !== 'idle' && launchProgress.stage !== 'running' && !isRunning);

  return (
    <div className="flex-1 flex flex-col justify-between overflow-hidden relative select-none bg-transparent">
      {/* Riot-Style Top Navigation Bar (Seamless, transparent, no dark gradient band) */}
      <div className="px-10 pt-4 pb-2 flex items-center justify-between z-10 bg-transparent">
        {/* Center Capsule Tabs */}
        <div className="p-1.5 rounded-full bg-[#141414]/90 border border-white/[0.08] flex items-center gap-1.5 shadow-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-full text-sm font-semibold tracking-wide transition-colors ${
              activeTab === 'overview'
                ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.tabOverview}
          </button>
          <button
            onClick={() => setActiveTab('server')}
            className={`px-6 py-2 rounded-full text-sm font-semibold tracking-wide transition-colors ${
              activeTab === 'server'
                ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.tabServerInfo}
          </button>
        </div>

        {/* Right Status Pill */}
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-full bg-[#141414]/90 border border-white/[0.08] flex items-center gap-3 text-sm shadow-lg">
            <span className={`w-2.5 h-2.5 rounded-full ${serverStatus.online ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="font-mono text-slate-200 font-semibold">{serverStatus.playersOnline}/{serverStatus.playersMax}</span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-emerald-400 text-sm font-bold">{serverStatus.pingMs ?? '--'} ms</span>
          </div>
        </div>
      </div>

      {/* Main Body Area (Minimalist, clean, without news cards clutter) */}
      <div className="flex-1 flex flex-col justify-center px-12 py-6 relative z-10">
        {activeTab === 'overview' ? (
          <div className="max-w-2xl space-y-6 animate-fadeIn">
            {/* Tag */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>MÙA 2 • KHÁM PHÁ SINH TỒN</span>
            </div>

            {/* Headline with Relaxed Spacing */}
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-normal leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
              {t.heroTitle}
            </h1>

            {/* Description */}
            <p className="text-lg text-slate-200 leading-relaxed max-w-xl drop-shadow-md font-normal tracking-wide">
              {t.heroSub}
            </p>

            {/* Ergonomic Primary Action Zone */}
            <div className="relative pt-3">
              <div className="flex items-center gap-3">
                {/* 1. Standalone Play Button with Absolute Zero-Layout-Shift Progress Bar */}
                <div className="relative shrink-0">
                  {isRunning ? (
                    <button
                      onClick={onStopGame}
                      onMouseEnter={() => setIsHoveringStop(true)}
                      onMouseLeave={() => setIsHoveringStop(false)}
                      className="btn-riot-running h-[56px] min-w-[170px] px-8 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold shadow-xl"
                    >
                      {isHoveringStop ? (
                        <>
                          <Square className="w-5 h-5 fill-current" />
                          <span>{t.btnStopGame}</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                          <span>{t.btnInGame}</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={onLaunch}
                      disabled={isPreparingOrDownloading}
                      className={`${
                        isPreparingOrDownloading
                          ? 'h-[56px] min-w-[170px] px-8 rounded-2xl bg-[#161616] text-amber-400 border border-amber-500/40 cursor-wait flex items-center justify-center gap-3 shadow-xl'
                          : 'btn-riot-play h-[56px] min-w-[170px] px-8 rounded-2xl flex items-center justify-center gap-3 text-xl font-bold shadow-xl'
                      }`}
                    >
                      {isPreparingOrDownloading ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
                          <span className="text-base font-bold">{t.btnLoading}</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 fill-current" />
                          <span className="tracking-wide">{language === 'vi' ? 'Chơi' : 'Play'}</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Compact Progress Bar directly underneath Play button - Absolute so ZERO layout shift */}
                  {isPreparingOrDownloading && (
                    <div className="absolute top-[calc(100%+10px)] left-0 w-[240px] space-y-2 p-2.5 rounded-xl bg-[#141414] border border-amber-500/40 shadow-2xl z-40 animate-fadeIn">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                          {launchProgress.speedBps > 0 ? (
                            <span className="text-emerald-400 font-bold text-xs">
                              {(launchProgress.speedBps / (1024 * 1024)).toFixed(1)} MB/s
                            </span>
                          ) : (
                            <span className="text-amber-300 font-semibold text-xs">{launchProgress.stage || 'Chuẩn bị'}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {launchProgress.totalBytes > 0 && (
                            <span className="text-slate-400 text-[11px]">
                              {(launchProgress.downloadedBytes / (1024 * 1024)).toFixed(0)}/{(launchProgress.totalBytes / (1024 * 1024)).toFixed(0)} MB
                            </span>
                          )}
                          <span className="font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded text-[10px] border border-amber-500/40">
                            {Math.max(5, launchProgress.percentage)}%
                          </span>
                        </div>
                      </div>
                      {/* Amber Gold Progress Bar */}
                      <div className="w-full h-1.5 rounded-full bg-black/80 overflow-hidden p-0.5 border border-white/[0.08]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#d8a951] to-amber-400 transition-all duration-200 shadow-[0_0_10px_rgba(216,169,81,0.6)]"
                          style={{ width: `${Math.max(5, launchProgress.percentage)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Profile Info Pill with Integrated Dropdown Arrow */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                    disabled={isRunning || isPreparingOrDownloading}
                    title="Bấm để chọn phiên bản"
                    className={`h-[56px] px-4 rounded-2xl bg-[#141414] hover:bg-[#1a1a1a] border transition-colors shadow-lg flex items-center gap-3 text-slate-200 cursor-pointer ${
                      isProfileDropdownOpen ? 'border-amber-400/50 bg-[#1c1c1c]' : 'border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-white text-sm tracking-wide leading-tight truncate max-w-[170px]">
                        {selectedInstance?.name}
                      </span>
                      <span className="text-amber-400 text-xs font-semibold leading-tight">
                        {selectedInstance?.loader ? selectedInstance.loader.charAt(0).toUpperCase() + selectedInstance.loader.slice(1) : 'Vanilla'} {selectedInstance?.gameVersion}
                      </span>
                    </div>
                    <div className="w-px h-6 bg-white/10 mx-0.5" />
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform duration-150 ${
                        isProfileDropdownOpen ? 'rotate-180 text-amber-300' : ''
                      }`}
                    />
                  </button>

                  {/* Active Profile Dropdown Popover */}
                  {isProfileDropdownOpen && (
                    <div className="absolute left-0 top-[calc(100%+8px)] w-72 rounded-2xl bg-[#141414] border border-white/10 shadow-2xl p-2 z-50 space-y-1 animate-fadeIn">
                      <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Chọn Phiên Bản
                      </div>
                      <div className="max-h-56 overflow-y-auto space-y-1 custom-scrollbar">
                        {instances.map((inst) => (
                          <button
                            key={inst.id}
                            onClick={() => {
                              onSelectInstance(inst.id);
                              setIsProfileDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                              inst.id === selectedInstanceId
                                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                                : 'text-slate-300 hover:bg-white/5 hover:text-white'
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
            </div>
          </div>
        ) : (
          /* Server Info Tab */
          <div className="max-w-3xl space-y-4 animate-fadeIn">
            <div className="minimal-panel rounded-2xl p-6 border border-white/[0.06] space-y-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white font-riot tracking-wide">{t.serverHeader}</h2>
                    <p className="text-xs text-slate-400">{t.serverSub}</p>
                  </div>
                </div>
                <button
                  onClick={handleRefreshPing}
                  disabled={isPinging}
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                  <span>Làm mới</span>
                </button>
              </div>

              {/* MOTD */}
              <div className="p-4 rounded-xl bg-black/50 border border-white/5 font-mono text-sm text-amber-200 shadow-inner">
                {serverStatus.motd?.replace(/§[0-9a-fk-or]/g, '') || 'Máy Chủ Minecraft Nhóm Bạn'}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-slate-400 text-xs mb-1 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t.players}</span>
                  </div>
                  <div className="text-xl font-bold text-white font-mono">
                    {serverStatus.playersOnline} <span className="text-xs text-slate-500 font-normal">/ {serverStatus.playersMax}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-slate-400 text-xs mb-1 flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.latency}</span>
                  </div>
                  <div className="text-xl font-bold text-emerald-400 font-mono">
                    {serverStatus.pingMs ?? '--'} <span className="text-xs font-normal">ms</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                  <div className="text-slate-400 text-xs mb-1">{t.serverIp}</div>
                  <button
                    onClick={handleCopyIp}
                    className="flex items-center justify-between text-xs font-mono text-amber-300 hover:text-amber-200 transition"
                  >
                    <span className="truncate">{serverStatus.ip}</span>
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clean Bottom Footer: Server Info & Server IP Together */}
      <div className="bg-gradient-to-t from-black/95 via-black/50 to-transparent pb-6 pt-6 px-12 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          {/* Server Info Toggle Button */}
          <button
            onClick={() => setActiveTab(activeTab === 'server' ? 'overview' : 'server')}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-2 shadow-md ${
              activeTab === 'server'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-[#141414] hover:bg-[#1c1c1c] text-slate-300 hover:text-white border-white/[0.08]'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-amber-400" />
            <span>{activeTab === 'server' ? 'Quay lại Trang Chủ' : t.tabServerInfo}</span>
          </button>

          {/* Copy IP Button */}
          <button
            onClick={handleCopyIp}
            className="px-4 py-2 rounded-xl bg-[#141414]/90 hover:bg-[#1f1f1f] text-slate-300 hover:text-amber-300 text-xs font-mono border border-white/[0.06] transition-colors flex items-center gap-2 shadow-md"
            title="Bấm để sao chép địa chỉ máy chủ"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
            <span>IP: {serverStatus.ip}</span>
            {copied && <span className="text-emerald-400 font-bold ml-1">({t.copied})</span>}
          </button>
        </div>

        {isRunning && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#081810] border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Minecraft đang hoạt động</span>
          </div>
        )}
      </div>
    </div>
  );
};
