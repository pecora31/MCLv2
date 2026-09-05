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
      {/* Riot-Style Top Navigation Bar (Clean matte without glassmorphism) */}
      <div className="px-8 pt-5 pb-3 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent z-10">
        {/* Game Title on Left */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center font-black text-slate-950 text-sm shadow-[0_0_15px_rgba(245,158,11,0.4)]">
            MC
          </div>
          <div>
            <div className="text-[11px] font-black uppercase tracking-widest text-amber-400 font-riot">
              MCL CLIENT
            </div>
            <div className="text-xs font-bold text-white tracking-wide">
              {serverStatus.motd?.replace(/§[0-9a-fk-or]/g, '') || 'Minecraft Server'}
            </div>
          </div>
        </div>

        {/* Center Capsule Tabs (Riot Style Clean Obsidian) */}
        <div className="p-1 rounded-full bg-[#0c121e] border border-white/[0.06] flex items-center gap-1 shadow-md">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-1.5 rounded-full text-xs font-bold font-riot transition-all ${
              activeTab === 'overview'
                ? 'bg-amber-500/20 text-amber-300 shadow-sm border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.tabOverview}
          </button>
          <button
            onClick={() => setActiveTab('server')}
            className={`px-5 py-1.5 rounded-full text-xs font-bold font-riot transition-all ${
              activeTab === 'server'
                ? 'bg-amber-500/20 text-amber-300 shadow-sm border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.tabServerInfo}
          </button>
        </div>

        {/* Right Status Pill */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-full bg-[#0c121e] border border-white/[0.06] flex items-center gap-2.5 text-xs shadow-md">
            <span className={`w-2.5 h-2.5 rounded-full ${serverStatus.online ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="font-mono text-slate-200 font-semibold">{serverStatus.playersOnline}/{serverStatus.playersMax}</span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-emerald-400 text-xs font-bold">{serverStatus.pingMs ?? '--'} ms</span>
          </div>
        </div>
      </div>

      {/* Main Body Area (Minimalist, clean, without news cards clutter) */}
      <div className="flex-1 flex flex-col justify-center px-10 py-6 relative z-10">
        {activeTab === 'overview' ? (
          <div className="max-w-2xl space-y-5 animate-fadeIn">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-extrabold uppercase tracking-wider shadow-sm font-riot">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>MÙA 2 • KHÁM PHÁ SINH TỒN</span>
            </div>

            {/* Headline with Riot Condensed Font */}
            <h1 className="text-5xl md:text-6xl font-black text-white font-riot tracking-wide leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
              {t.heroTitle}
            </h1>

            {/* Description */}
            <p className="text-base text-slate-200 leading-relaxed max-w-xl drop-shadow-md font-medium">
              {t.heroSub}
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleCopyIp}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_4px_20px_rgba(245,158,11,0.35)] hover:scale-105 active:scale-95 flex items-center gap-2 font-riot"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? t.copied : `${t.heroCta} (IP: ${serverStatus.ip})`}</span>
              </button>
              <button
                onClick={() => setActiveTab('server')}
                className="px-6 py-3 rounded-xl bg-[#0c121e]/90 hover:bg-[#141c2e] text-white font-bold text-xs border border-white/[0.06] transition-all shadow-lg font-riot tracking-wider uppercase"
              >
                {t.tabServerInfo}
              </button>
            </div>
          </div>
        ) : (
          /* Server Info Tab */
          <div className="max-w-3xl space-y-4 animate-fadeIn">
            <div className="glass-panel rounded-2xl p-6 border border-white/[0.04] space-y-5 shadow-2xl">
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

      {/* Riot-Style Bottom Action Bar (Seamless without dividing border lines) */}
      <div className="bg-gradient-to-t from-black/90 via-black/45 to-transparent pb-6 pt-8 px-8 flex flex-col md:flex-row md:items-center justify-between gap-5 z-20">
        {/* Left Side: Download & Resource Monitor (Seamlessly floats over video) */}
        <div className="flex-1 min-w-0 pr-4">
          {isPreparingOrDownloading ? (
            <div className="space-y-2 p-3.5 rounded-xl bg-[#0c121e]/95 border border-white/[0.06] shadow-2xl animate-fadeIn">
              {/* Status Header */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate max-w-[65%]">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                  <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px] shrink-0 font-riot">
                    {launchProgress.stage || 'Chuẩn bị'}:
                  </span>
                  <span className="text-slate-200 truncate text-xs font-mono">
                    {launchProgress.currentFile || 'Đang kết nối và kiểm tra tệp tin...'}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {launchProgress.speedBps > 0 && (
                    <span className="text-xs text-emerald-400 font-mono font-bold">
                      {(launchProgress.speedBps / (1024 * 1024)).toFixed(2)} MB/s
                    </span>
                  )}
                  {launchProgress.totalBytes > 0 && (
                    <span className="text-xs text-slate-400 font-mono">
                      {(launchProgress.downloadedBytes / (1024 * 1024)).toFixed(1)} / {(launchProgress.totalBytes / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  )}
                  <span className="font-mono font-black text-amber-300 text-xs bg-amber-500/20 px-2.5 py-0.5 rounded-md border border-amber-500/40">
                    {Math.max(5, launchProgress.percentage)}%
                  </span>
                </div>
              </div>

              {/* Progress Bar with Amber/Gold Glow */}
              <div className="w-full h-2.5 rounded-full bg-black/80 overflow-hidden p-0.5 border border-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 transition-all duration-200 shadow-[0_0_14px_rgba(245,158,11,0.7)]"
                  style={{ width: `${Math.max(5, launchProgress.percentage)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-300 font-medium truncate flex items-center gap-3 drop-shadow-md">
              {isRunning ? (
                <span className="text-emerald-400 flex items-center gap-2 font-mono font-bold bg-[#061e14] px-4 py-2 rounded-xl border border-emerald-500/40 shadow-xl">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  Tiến trình Minecraft đang hoạt động
                </span>
              ) : (
                <div className="flex items-center gap-2 bg-[#0c121e]/90 px-4 py-2 rounded-xl border border-white/[0.06] shadow-lg text-slate-300">
                  <span className="font-bold text-white">{selectedInstance?.name}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-amber-300 font-mono">MC {selectedInstance?.gameVersion}</span>
                  <span className="text-slate-500">•</span>
                  <span className="font-mono text-slate-300">{(selectedInstance?.maxRam || 4096) / 1024} GB RAM</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Profile Selector + BIG Riot Play Button */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Profile Dropdown (Sleek 52px Riot style selector) */}
          <div className="relative w-56 sm:w-64">
            <select
              value={selectedInstanceId}
              onChange={(e) => onSelectInstance(e.target.value)}
              disabled={isRunning || isPreparingOrDownloading}
              className="w-full h-[52px] appearance-none bg-[#0c121e] hover:bg-[#141b2b] border border-white/[0.08] rounded-xl px-4 text-xs font-bold text-white pr-9 cursor-pointer disabled:opacity-60 transition shadow-xl"
            >
              {instances.map((inst) => (
                <option key={inst.id} value={inst.id} className="bg-slate-900 text-white font-sans py-2">
                  {inst.name} ({inst.loader.toUpperCase()} {inst.gameVersion})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* BIG Riot Play Button [ ▶ Chơi ] */}
          {isRunning ? (
            <button
              onClick={onStopGame}
              onMouseEnter={() => setIsHoveringStop(true)}
              onMouseLeave={() => setIsHoveringStop(false)}
              className="btn-riot-running px-8 min-w-[170px] flex items-center justify-center gap-2.5 shadow-2xl"
            >
              {isHoveringStop ? (
                <>
                  <Square className="w-5 h-5 fill-current" />
                  <span className="text-sm font-black">{t.btnStopGame}</span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                  <span className="text-sm font-black">{t.btnInGame}</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onLaunch}
              disabled={isPreparingOrDownloading}
              className={`min-w-[170px] flex items-center justify-center gap-2.5 ${
                isPreparingOrDownloading
                  ? 'h-[52px] rounded-2xl bg-slate-900/80 text-amber-400/70 border border-amber-500/20 cursor-wait shadow-xl'
                  : 'btn-riot-play'
              }`}
            >
              {isPreparingOrDownloading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
                  <span className="text-sm font-black tracking-wider">{t.btnLoading}</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span className="text-base font-black tracking-wider">{t.btnLaunch}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
