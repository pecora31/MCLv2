import React, { useState, useEffect } from 'react';
import { Play, Wifi, Users, Server, Copy, Check, RefreshCw, Square, ChevronDown, ShieldCheck, Sparkles, Film } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'server' | 'news'>('overview');
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
    <div className="flex-1 flex flex-col justify-between overflow-hidden relative select-none">
      {/* Riot-Style Top Navigation Bar */}
      <div className="px-8 pt-5 pb-3 flex items-center justify-between border-b border-white/5 bg-gradient-to-b from-black/60 to-transparent z-10">
        {/* Game Title on Left */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-slate-950 text-sm shadow-[0_0_12px_rgba(245,158,11,0.4)]">
            MC
          </div>
          <div>
            <div className="text-[11px] font-black uppercase tracking-widest text-amber-400 font-['Outfit']">
              MCL CLIENT
            </div>
            <div className="text-xs font-bold text-white tracking-wide">
              {serverStatus.motd?.replace(/§[0-9a-fk-or]/g, '') || 'Minecraft Server'}
            </div>
          </div>
        </div>

        {/* Center Capsule Tabs (Riot Style Pill) */}
        <div className="p-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md flex items-center gap-1 shadow-inner">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-white/15 text-white shadow-sm border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.tabOverview}
          </button>
          <button
            onClick={() => setActiveTab('server')}
            className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'server'
                ? 'bg-white/15 text-white shadow-sm border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.tabServerInfo}
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'news'
                ? 'bg-white/15 text-white shadow-sm border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.tabNews}
          </button>
        </div>

        {/* Right Status Pill */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-black/40 border border-white/10 flex items-center gap-2 text-xs">
            <span className={`w-2 h-2 rounded-full ${serverStatus.online ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="font-mono text-slate-300">{serverStatus.playersOnline}/{serverStatus.playersMax}</span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-emerald-400 text-[11px]">{serverStatus.pingMs ?? '--'} ms</span>
          </div>
        </div>
      </div>

      {/* Main Body Area: Overview vs Server vs News */}
      <div className="flex-1 overflow-y-auto px-8 py-6 relative z-10">
        {activeTab === 'overview' && (
          <div className="h-full flex flex-col justify-between space-y-6">
            {/* Hero Left Headline & Call To Action */}
            <div className="max-w-xl space-y-4 pt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mùa 2 • Khám Phá Sinh Tồn</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white font-['Outfit'] tracking-tight leading-tight drop-shadow-md">
                {t.heroTitle}
              </h1>
              <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-lg">
                {t.heroSub}
              </p>
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleCopyIp}
                  className="px-6 py-2.5 rounded-full bg-white hover:bg-slate-200 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? t.copied : `${t.heroCta} (IP)`}</span>
                </button>
                <button
                  onClick={() => setActiveTab('server')}
                  className="px-5 py-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white font-semibold text-xs border border-white/15 transition-all backdrop-blur-sm"
                >
                  {t.tabServerInfo}
                </button>
              </div>
            </div>

            {/* Bottom Right: 3 Riot-Style Featured Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              {/* Card 1 */}
              <div
                onClick={() => setActiveTab('server')}
                className="riot-preview-card rounded-2xl bg-black/40 border border-white/10 overflow-hidden group shadow-lg"
              >
                <div className="relative h-28 w-full overflow-hidden bg-gradient-to-tr from-amber-950/60 via-slate-900 to-indigo-950/40">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent opacity-60" />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[9px] font-extrabold tracking-wider text-amber-300 border border-amber-500/30">
                    {t.card1Tag}
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white/80">
                    <Server className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="p-3.5 space-y-1">
                  <h3 className="text-xs font-bold text-white group-hover:text-amber-300 transition line-clamp-1">
                    {t.card1Title}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    IP: {serverStatus.ip} • Online: {serverStatus.playersOnline}
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div
                onClick={() => setActiveTab('news')}
                className="riot-preview-card rounded-2xl bg-black/40 border border-white/10 overflow-hidden group shadow-lg"
              >
                <div className="relative h-28 w-full overflow-hidden bg-gradient-to-tr from-indigo-950/70 via-slate-900 to-purple-950/40">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent opacity-60" />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[9px] font-extrabold tracking-wider text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                    <Film className="w-2.5 h-2.5" />
                    <span>{t.card2Tag}</span>
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[9px] text-slate-300">
                    v1.21.4
                  </div>
                </div>
                <div className="p-3.5 space-y-1">
                  <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition line-clamp-1">
                    {t.card2Title}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    Tích hợp Sodium, Iris Shaders & Voice Chat
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div
                onClick={() => setActiveTab('news')}
                className="riot-preview-card rounded-2xl bg-black/40 border border-white/10 overflow-hidden group shadow-lg"
              >
                <div className="relative h-28 w-full overflow-hidden bg-gradient-to-tr from-emerald-950/70 via-slate-900 to-teal-950/40">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent opacity-60" />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[9px] font-extrabold tracking-wider text-emerald-300 border border-emerald-500/30">
                    {t.card3Tag}
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="p-3.5 space-y-1">
                  <h3 className="text-xs font-bold text-white group-hover:text-emerald-300 transition line-clamp-1">
                    {t.card3Title}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    Đồng bộ hiển thị skin nhóm không cần bản quyền
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Server Info Tab */}
        {activeTab === 'server' && (
          <div className="max-w-3xl space-y-4 animate-fadeIn">
            <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">{t.serverHeader}</h2>
                    <p className="text-xs text-slate-400">{t.serverSub}</p>
                  </div>
                </div>
                <button
                  onClick={handleRefreshPing}
                  disabled={isPinging}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                  <span>Làm mới</span>
                </button>
              </div>

              {/* MOTD */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-sm text-amber-200 shadow-inner">
                {serverStatus.motd?.replace(/§[0-9a-fk-or]/g, '') || 'Máy Chủ Minecraft Nhóm Bạn'}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-slate-400 text-xs mb-1 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
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

        {/* News Tab */}
        {activeTab === 'news' && (
          <div className="max-w-3xl space-y-4 animate-fadeIn">
            <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
              <h2 className="text-base font-bold text-white">Thông Tin Bản Cập Nhật 1.21.4</h2>
              <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <p>• Hỗ trợ đầy đủ Minecraft 1.21.4 với nền tảng Fabric Loader v0.16.10.</p>
                <p>• Tự động tích hợp Sodium tăng tốc đồ họa, nâng cao FPS trung bình lên 200-300%.</p>
                <p>• Mô-đun CustomSkinLoader tự động nạp skin 3D cho toàn bộ người chơi trong server.</p>
                <p>• Voice Chat khoảng cách gần (Simple Voice Chat) tương thích trực tiếp.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Riot-Style Bottom Action Bar */}
      <div className="bg-[#080c14]/95 border-t border-white/10 p-4 px-8 flex flex-col md:flex-row md:items-center justify-between gap-5 z-20 backdrop-blur-xl shadow-2xl">
        {/* Left Side: Download & Resource Monitor (Visible when preparing or downloading) */}
        <div className="flex-1 min-w-0 pr-4">
          {isPreparingOrDownloading ? (
            <div className="space-y-2 p-3 rounded-2xl bg-slate-950/70 border border-white/10 shadow-inner animate-fadeIn">
              {/* Status Header */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate max-w-[65%]">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                  <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px] shrink-0">
                    {launchProgress.stage || 'Chuẩn bị'}:
                  </span>
                  <span className="text-slate-300 truncate text-xs font-mono">
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
              <div className="w-full h-2.5 rounded-full bg-black/80 overflow-hidden p-0.5 border border-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 transition-all duration-200 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                  style={{ width: `${Math.max(5, launchProgress.percentage)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 font-medium truncate flex items-center gap-3">
              {isRunning ? (
                <span className="text-emerald-400 flex items-center gap-2 font-mono font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  Tiến trình Minecraft đang hoạt động
                </span>
              ) : (
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="font-semibold text-slate-200">{selectedInstance?.name}</span>
                  <span>•</span>
                  <span>MC {selectedInstance?.gameVersion}</span>
                  <span>•</span>
                  <span>{(selectedInstance?.maxRam || 4096) / 1024} GB RAM</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Profile Selector + BIG Riot Play Button */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Profile Dropdown (Sleek 52px pill) */}
          <div className="relative w-56 sm:w-64">
            <select
              value={selectedInstanceId}
              onChange={(e) => onSelectInstance(e.target.value)}
              disabled={isRunning || isPreparingOrDownloading}
              className="w-full h-[52px] appearance-none bg-black/60 hover:bg-black/80 border border-white/10 rounded-2xl px-4 text-xs font-bold text-white pr-9 cursor-pointer disabled:opacity-60 transition shadow-inner"
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
              className="btn-riot-running px-8 min-w-[170px] flex items-center justify-center gap-2.5"
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
                  ? 'h-[52px] rounded-2xl bg-slate-900/80 text-amber-400/70 border border-amber-500/20 cursor-wait'
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
