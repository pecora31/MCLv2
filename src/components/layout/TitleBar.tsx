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
      className="titlebar-drag-region h-11 bg-transparent flex items-center justify-between pl-6 pr-2 select-none z-50 shrink-0"
    >
      {/* Left side of canvas header: status only when in-game */}
      <div className="flex items-center gap-2 titlebar-no-drag">
        {isRunning && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t.inGame}</span>
          </div>
        )}
      </div>

      {/* Center Drag Area */}
      <div data-tauri-drag-region className="flex-1 h-full" />

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 titlebar-no-drag">
        {/* Language Switcher */}
        <button
          onClick={onToggleLanguage}
          title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
          className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-1.5 transition tracking-wider"
        >
          <Languages className="w-3.5 h-3.5 text-amber-400" />
          <span>{language.toUpperCase()}</span>
        </button>

        {/* Logs */}
        {onOpenConsole && (
          <button
            onClick={onOpenConsole}
            title={t.viewLogs}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/10 flex items-center gap-1.5 transition tracking-wide"
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.viewLogs}</span>
          </button>
        )}

        <div className="w-px h-3.5 bg-white/10 mx-1" />

        {/* Window controls: Minimize and Close placed close to the top-right corner */}
        <button
          onClick={handleMinimize}
          className="w-10 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition"
          title={t.minimize}
        >
          <Minus className="w-4 h-4" />
        </button>

        <button
          onClick={handleClose}
          className="w-10 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-[#e81123] transition"
          title={t.close}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
