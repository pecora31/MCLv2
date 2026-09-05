import React, { useState, useEffect } from 'react';
import { Play, Wifi, Users, Server, Copy, Check, RefreshCw, Square, ChevronDown, ShieldCheck } from 'lucide-react';
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
  language,
}) => {
  const t = getTranslation(language);
  const selectedInstance = instances.find((i) => i.id === selectedInstanceId) || instances[0];
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

  // Only show download progress when actively preparing/downloading (not idle, not running)
  const isDownloading =
    launchProgress.stage !== 'idle' &&
    launchProgress.stage !== 'running' &&
    !isRunning;

  return (
    <div className="flex-1 flex flex-col justify-between overflow-hidden relative">
      {/* Top / Main Body Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Server Status Box */}
        <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">{t.serverHeader}</h2>
                <p className="text-xs text-slate-400">{t.serverSub}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  serverStatus.online
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${serverStatus.online ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                {serverStatus.online ? t.online : t.offline}
              </span>

              <button
                onClick={handleRefreshPing}
                disabled={isPinging}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
                title="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* MOTD box */}
          <div className="p-3 rounded-xl bg-black/30 border border-white/5 font-mono text-xs text-slate-300">
            {serverStatus.motd?.replace(/§[0-9a-fk-or]/g, '') || 'Máy Chủ Minecraft Nhóm Bạn'}
          </div>

          {/* Server Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t.players}</span>
              </div>
              <div className="text-base font-bold text-white font-mono">
                {serverStatus.playersOnline} <span className="text-xs text-slate-400 font-normal">/ {serverStatus.playersMax}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.latency}</span>
              </div>
              <div className="text-base font-bold text-emerald-400 font-mono">
                {serverStatus.pingMs ?? '--'} <span className="text-xs font-normal">ms</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
              <div className="text-slate-400 text-xs">{t.serverIp}</div>
              <button
                onClick={handleCopyIp}
                className="flex items-center justify-between text-xs font-mono text-indigo-300 hover:text-indigo-200 transition"
              >
                <span className="truncate">{serverStatus.ip}</span>
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
              </button>
            </div>
          </div>
        </div>

        {/* Selected Profile Specs Summary */}
        <div className="glass-panel rounded-2xl p-4 border border-white/5 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-slate-400">{t.profileConfig}:</div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>{selectedInstance?.name}</span>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 uppercase">
                {selectedInstance?.loader} {selectedInstance?.gameVersion}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div>
              RAM: <strong className="text-slate-200 font-mono">{(selectedInstance?.maxRam || 4096) / 1024} GB</strong>
            </div>
            {selectedInstance?.enableSkinInGame && (
              <div className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Skin: {t.enabled}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar (Cụm điều khiển dưới góc phải & Giám sát tải bên trái) */}
      <div className="bg-[#090d16]/95 border-t border-white/10 p-4 px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 z-20 backdrop-blur-md">
        {/* Left Side: Download & Resource Monitor (Hidden when completed) */}
        <div className="flex-1 min-w-0 pr-4">
          {isDownloading ? (
            <div className="space-y-1.5 animate-fadeIn">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate max-w-[70%]">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping shrink-0" />
                  <span className="font-semibold text-indigo-300 capitalize shrink-0">{launchProgress.stage}:</span>
                  <span className="text-slate-400 truncate text-[11px] font-mono">{launchProgress.currentFile}</span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {launchProgress.speedBps > 0 && (
                    <span className="text-[11px] text-emerald-400 font-mono font-medium">
                      {(launchProgress.speedBps / (1024 * 1024)).toFixed(2)} MB/s
                    </span>
                  )}
                  {launchProgress.totalBytes > 0 && (
                    <span className="text-[11px] text-slate-400 font-mono">
                      {(launchProgress.downloadedBytes / (1024 * 1024)).toFixed(1)} / {(launchProgress.totalBytes / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  )}
                  <span className="font-mono font-bold text-white text-xs bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
                    {launchProgress.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-150"
                  style={{ width: `${Math.max(4, launchProgress.percentage)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 font-medium truncate">
              {isRunning ? (
                <span className="text-emerald-400 flex items-center gap-1.5 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Minecraft process active
                </span>
              ) : (
                <span>MCLv2 Ready</span>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Profile Selector + Launch/Stop Button */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Profile Dropdown */}
          <div className="relative w-52 sm:w-64">
            <select
              value={selectedInstanceId}
              onChange={(e) => onSelectInstance(e.target.value)}
              disabled={isRunning || isDownloading}
              className="w-full appearance-none glass-input px-3 py-2.5 rounded-xl text-xs font-semibold text-white pr-8 cursor-pointer disabled:opacity-60"
            >
              {instances.map((inst) => (
                <option key={inst.id} value={inst.id} className="bg-slate-900 text-white font-sans">
                  {inst.name} ({inst.loader.toUpperCase()} {inst.gameVersion})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Launch / Stop Button */}
          {isRunning ? (
            <button
              onClick={onStopGame}
              onMouseEnter={() => setIsHoveringStop(true)}
              onMouseLeave={() => setIsHoveringStop(false)}
              className="py-2.5 px-6 rounded-xl font-['Outfit'] font-bold text-sm flex items-center justify-center gap-2 transition-all btn-action-running w-36"
            >
              {isHoveringStop ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>{t.btnStopGame}</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>{t.btnInGame}</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onLaunch}
              disabled={isDownloading}
              className={`py-2.5 px-7 rounded-xl font-['Outfit'] font-bold text-sm flex items-center justify-center gap-2 transition-all w-36 ${
                isDownloading
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                  : 'btn-action-launch'
              }`}
            >
              <Play className={`w-4 h-4 fill-current ${isDownloading ? 'animate-spin' : ''}`} />
              <span>{isDownloading ? t.btnLoading : t.btnLaunch}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
