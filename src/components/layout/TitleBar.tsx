import React, { useState, useEffect } from 'react';
import { Minus, Square, X, Terminal, Languages, Box } from 'lucide-react';
import { isTauri } from '../../services/api';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { getTranslation, type Language } from '../../locales/i18n';

interface TitleBarProps {
  onOpenConsole?: () => void;
  isRunning?: boolean;
  language: Language;
  onToggleLanguage: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  onOpenConsole,
  isRunning = false,
  language,
  onToggleLanguage,
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const t = getTranslation(language);

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
      className="titlebar-drag-region h-10 bg-transparent flex items-center justify-between px-4 select-none z-50 sticky top-0"
    >
      {/* Brand & Status */}
      <div className="flex items-center gap-2.5 titlebar-no-drag">
        <div className="w-5 h-5 rounded-md bg-amber-500 flex items-center justify-center text-slate-950 font-black text-[10px] shadow-sm">
          MC
        </div>
        <div className="flex items-center gap-2">
          <span className="font-['Outfit'] font-bold text-xs tracking-wider text-white">
            MCL<span className="text-amber-400 font-mono text-[11px]">v2</span>
          </span>
        </div>

        {isRunning && (
          <div className="ml-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t.inGame}</span>
          </div>
        )}
      </div>

      {/* Center Drag Area */}
      <div data-tauri-drag-region className="flex-1 h-full flex items-center justify-center" />

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 titlebar-no-drag">
        {/* Language Switcher */}
        <button
          onClick={onToggleLanguage}
          title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
          className="px-2 py-1 rounded text-[11px] font-mono text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 flex items-center gap-1 transition"
        >
          <Languages className="w-3 h-3 text-indigo-400" />
          <span className="font-semibold">{language.toUpperCase()}</span>
        </button>

        {/* Logs */}
        {onOpenConsole && (
          <button
            onClick={onOpenConsole}
            title={t.viewLogs}
            className="px-2 py-1 rounded text-[11px] font-mono text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-white/5 flex items-center gap-1 transition"
          >
            <Terminal className="w-3 h-3 text-amber-400" />
            <span>{t.viewLogs}</span>
          </button>
        )}

        <div className="w-px h-3.5 bg-white/10 mx-0.5" />

        {/* Window controls */}
        <button
          onClick={handleMinimize}
          className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-white/10 transition"
          title={t.minimize}
        >
          <Minus className="w-3 h-3" />
        </button>

        <button
          onClick={handleToggleMaximize}
          className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-white/10 transition"
          title={isMaximized ? t.restore : t.maximize}
        >
          <Square className="w-2.5 h-2.5" />
        </button>

        <button
          onClick={handleClose}
          className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-red-500/80 transition"
          title={t.close}
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </header>
  );
};
