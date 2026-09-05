import React, { useState, useEffect } from 'react';
import { Minus, Square, X, ShieldAlert, Sparkles } from 'lucide-react';
import { isTauri } from '../../services/api';
import { getCurrentWindow } from '@tauri-apps/api/window';

interface TitleBarProps {
  onOpenConsole?: () => void;
  isRunning?: boolean;
}

export const TitleBar: React.FC<TitleBarProps> = ({ onOpenConsole, isRunning = false }) => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (!isTauri()) return;
    const checkMaximized = async () => {
      try {
        const win = getCurrentWindow();
        setIsMaximized(await win.isMaximized());
        win.onResized(async () => {
          setIsMaximized(await win.isMaximized());
        });
      } catch (err) {
        console.warn('Window API error:', err);
      }
    };
    checkMaximized();
  }, []);

  const handleMinimize = async () => {
    if (!isTauri()) return;
    try {
      await getCurrentWindow().minimize();
    } catch {}
  };

  const handleToggleMaximize = async () => {
    if (!isTauri()) return;
    try {
      await getCurrentWindow().toggleMaximize();
    } catch {}
  };

  const handleClose = async () => {
    if (!isTauri()) return;
    try {
      await getCurrentWindow().close();
    } catch {}
  };

  return (
    <header
      data-tauri-drag-region
      className="titlebar-drag-region h-11 bg-[#0c101a]/95 border-b border-white/5 flex items-center justify-between px-3 select-none z-50 sticky top-0"
    >
      {/* Brand & Status */}
      <div className="flex items-center gap-2.5 titlebar-no-drag">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.5)]">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-['Outfit'] font-bold text-sm tracking-wider bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
            MCL<span className="text-indigo-400 text-xs font-mono ml-0.5 font-bold">v2</span>
          </span>
          <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
            Core 2.0
          </span>
        </div>

        {isRunning && (
          <div className="ml-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-medium">Đang Chạy Minecraft</span>
          </div>
        )}
      </div>

      {/* Center Drag Area */}
      <div data-tauri-drag-region className="flex-1 h-full flex items-center justify-center text-xs text-slate-500 font-medium">
        <span className="opacity-60 text-[11px]">Server Minecraft Nhóm Bạn</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1 titlebar-no-drag">
        {onOpenConsole && (
          <button
            onClick={onOpenConsole}
            title="Xem Console Log"
            className="px-2 py-1 mr-2 rounded text-[11px] font-mono text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-white/5 flex items-center gap-1 transition"
          >
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            <span>Logs</span>
          </button>
        )}

        <button
          onClick={handleMinimize}
          className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-white/10 transition"
          title="Thu nhỏ"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleToggleMaximize}
          className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-white/10 transition"
          title={isMaximized ? "Khôi phục kích thước" : "Phóng to"}
        >
          <Square className="w-3 h-3" />
        </button>

        <button
          onClick={handleClose}
          className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-red-500/80 transition"
          title="Đóng launcher"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
