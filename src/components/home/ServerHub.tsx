import React, { useState, useEffect } from 'react';
import { Play, Wifi, Users, Server, Copy, Check, Sparkles, RefreshCw, Cpu, HardDrive, ShieldCheck, ChevronRight } from 'lucide-react';
import type { GameInstance, ServerStatus, LaunchProgress } from '../../types';
import { pingServer } from '../../services/api';

interface ServerHubProps {
  instances: GameInstance[];
  selectedInstanceId: string;
  onSelectInstance: (id: string) => void;
  onLaunch: () => void;
  onOpenCreateModal: () => void;
  launchProgress: LaunchProgress;
  isRunning: boolean;
}

export const ServerHub: React.FC<ServerHubProps> = ({
  instances,
  selectedInstanceId,
  onSelectInstance,
  onLaunch,
  onOpenCreateModal,
  launchProgress,
  isRunning,
}) => {
  const selectedInstance = instances.find((i) => i.id === selectedInstanceId) || instances[0];
  const [copied, setCopied] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    ip: 'play.ourserver.mc',
    port: 25565,
    online: true,
    playersOnline: 5,
    playersMax: 20,
    version: 'Fabric 1.21.4',
    motd: '§6Máy Chủ Bạn Bè §f- §aSinh Tồn & Voice Chat §f| §eOnline 24/7',
    pingMs: 22,
  });

  const handleRefreshPing = async () => {
    setIsPinging(true);
    try {
      const status = await pingServer(selectedInstance?.serverIp || 'play.ourserver.mc');
      setServerStatus(status);
    } catch {
      // Keep previous
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    handleRefreshPing();
    const interval = setInterval(handleRefreshPing, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [selectedInstance?.serverIp]);

  const handleCopyIp = () => {
    navigator.clipboard.writeText(`${serverStatus.ip}:${serverStatus.port}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-6 space-y-6">
      {/* Hero Banner Section */}
      <div className="relative rounded-2xl overflow-hidden glass-panel p-6 border border-white/10 shadow-2xl">
        {/* Background ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Máy Chủ Minecraft Nhóm Bạn</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold font-['Outfit'] tracking-tight text-white">
              Sẵn Sàng Chinh Phục Thế Giới Mới
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Launcher được tối ưu hóa riêng cho nhóm bạn: Tự động đồng bộ modpack, tích hợp Skin 3D trong game, khởi động cực nhanh và siêu mượt.
            </p>
          </div>

          {/* Quick Connect & Launch Box */}
          <div className="flex flex-col items-end gap-3 min-w-[260px]">
            {/* Instance Selector Dropdown */}
            <div className="w-full">
              <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Cấu Hình Đang Chọn
              </label>
              <div className="relative">
                <select
                  value={selectedInstanceId}
                  onChange={(e) => onSelectInstance(e.target.value)}
                  className="w-full appearance-none glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium text-white pr-8 cursor-pointer"
                >
                  {instances.map((inst) => (
                    <option key={inst.id} value={inst.id} className="bg-slate-900 text-white">
                      {inst.name} ({inst.loader.toUpperCase()} {inst.gameVersion})
                    </option>
                  ))}
                </select>
                <ChevronRight className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none rotate-90" />
              </div>
            </div>

            {/* Launch Button */}
            <button
              onClick={onLaunch}
              disabled={isRunning || launchProgress.stage !== 'idle'}
              className={`w-full py-4 px-6 rounded-xl font-['Outfit'] font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                isRunning
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                  : 'btn-launch text-white pulse-launch'
              }`}
            >
              <Play className={`w-5 h-5 fill-current ${launchProgress.stage !== 'idle' ? 'animate-spin' : ''}`} />
              <span>
                {isRunning
                  ? 'Đang Chơi...'
                  : launchProgress.stage !== 'idle'
                  ? 'Đang Khởi Chạy...'
                  : 'CHƠI NGAY'}
              </span>
            </button>
          </div>
        </div>

        {/* Launch Progress Overlay */}
        {launchProgress.stage !== 'idle' && (
          <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-medium capitalize text-indigo-400">
                {launchProgress.stage === 'downloading'
                  ? `Đang tải: ${launchProgress.currentFile}`
                  : launchProgress.stage === 'verifying'
                  ? 'Đang kiểm tra mã SHA-1 tập tin...'
                  : launchProgress.stage === 'launching'
                  ? 'Đang khởi động JVM Minecraft...'
                  : 'Đang chuẩn bị...'}
              </span>
              <span className="font-mono font-bold text-white">{launchProgress.percentage}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-300"
                style={{ width: `${Math.max(5, launchProgress.percentage)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Grid: Server Live Status + Instance Specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Server Live Status Card (2 cols) */}
        <div className="md:col-span-2 glass-panel rounded-2xl p-5 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Trạng Thái Server</h3>
                <p className="text-[11px] text-slate-400">Cập nhật tự động thời gian thực</p>
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
                {serverStatus.online ? 'Hoạt Động' : 'Ngoại Tuyến'}
              </span>

              <button
                onClick={handleRefreshPing}
                disabled={isPinging}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
                title="Làm mới ping"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* MOTD box */}
          <div className="p-3 rounded-xl bg-[#090d16] border border-white/5 font-mono text-xs text-slate-300">
            {serverStatus.motd?.replace(/§[0-9a-fk-or]/g, '') || 'Máy Chủ Bạn Bè - Sẵn sàng chiến game!'}
          </div>

          {/* Metrics row */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Người Chơi</span>
              </div>
              <div className="text-lg font-bold text-white">
                {serverStatus.playersOnline} <span className="text-xs text-slate-400 font-normal">/ {serverStatus.playersMax}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>Độ Trễ (Ping)</span>
              </div>
              <div className="text-lg font-bold text-emerald-400">
                {serverStatus.pingMs} <span className="text-xs font-normal">ms</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
              <div className="text-slate-400 text-xs">Địa Chỉ IP</div>
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

        {/* Selected Instance Summary Card (1 col) */}
        <div className="glass-panel rounded-2xl p-5 border border-white/5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Thông Số Profile</h3>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {selectedInstance?.loader}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-300 pb-2 border-b border-white/5">
                <span className="text-slate-400">Phiên bản MC:</span>
                <span className="font-semibold text-white">{selectedInstance?.gameVersion}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300 pb-2 border-b border-white/5">
                <span className="text-slate-400">Mod Loader:</span>
                <span className="font-semibold text-indigo-400">
                  {selectedInstance?.loader.toUpperCase()} {selectedInstance?.loaderVersion || ''}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300 pb-2 border-b border-white/5">
                <span className="text-slate-400">RAM Cấp phát:</span>
                <span className="font-semibold text-white">
                  {(selectedInstance?.maxRam || 4096) / 1024} GB
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Skin Đồng Đội:</span>
                <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Đã Bật
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition"
          >
            + Tạo Thêm Profile Khác
          </button>
        </div>
      </div>
    </div>
  );
};
