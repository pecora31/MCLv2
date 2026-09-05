import React, { useState } from 'react';
import { Home, Layers, Package, Shirt, Settings, User, Check, Edit2 } from 'lucide-react';
import type { Account } from '../../types';
import { getTranslation, type Language } from '../../locales/i18n';

export type NavigationTab = 'home' | 'instances' | 'mods' | 'skin' | 'settings';

interface SidebarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  account: Account;
  onUpdateUsername: (newName: string) => void;
  language: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  account,
  onUpdateUsername,
  language,
}) => {
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [tempUsername, setTempUsername] = useState(account.username);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [showAccountTooltip, setShowAccountTooltip] = useState(false);

  const t = getTranslation(language);

  const navItems = [
    { id: 'home', label: t.navHome, icon: Home },
    { id: 'instances', label: t.navInstances, icon: Layers },
    { id: 'mods', label: t.navMods, icon: Package },
    { id: 'skin', label: t.navSkin, icon: Shirt },
    { id: 'settings', label: t.navSettings, icon: Settings },
  ];

  const handleSaveUsername = () => {
    if (tempUsername.trim()) {
      onUpdateUsername(tempUsername.trim());
      setIsEditingUser(false);
    }
  };

  return (
    <aside className="w-16 bg-[#080b13] border-r border-white/5 flex flex-col justify-between items-center py-3 select-none z-30">
      {/* Navigation Icons */}
      <div className="space-y-3 flex flex-col items-center w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <div key={item.id} className="relative group flex items-center justify-center w-full px-2">
              <button
                onClick={() => onTabChange(item.id as NavigationTab)}
                onMouseEnter={() => setHoveredTab(item.id)}
                onMouseLeave={() => setHoveredTab(null)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-indigo-600/25 text-indigo-400 border border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-105' : 'group-hover:scale-105'}`} />
              </button>

              {/* Floating Tooltip */}
              {hoveredTab === item.id && (
                <div className="absolute left-16 px-2.5 py-1.5 rounded-lg bg-slate-900/95 border border-white/10 text-xs font-medium text-white shadow-xl whitespace-nowrap z-50 pointer-events-none animate-fadeIn">
                  {item.label}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Account Info at Bottom */}
      <div className="relative flex flex-col items-center px-2">
        <button
          onClick={() => setIsEditingUser(!isEditingUser)}
          onMouseEnter={() => setShowAccountTooltip(true)}
          onMouseLeave={() => setShowAccountTooltip(false)}
          className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-white/10 hover:border-indigo-500/50 flex items-center justify-center transition"
        >
          {account.skinUrl ? (
            <img
              src={account.skinUrl}
              alt={account.username}
              className="w-full h-full object-cover rendering-pixelated"
            />
          ) : (
            <User className="w-5 h-5 text-indigo-400" />
          )}
          <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
        </button>

        {/* Floating Account Details or Edit Form */}
        {isEditingUser ? (
          <div className="absolute left-16 bottom-0 p-3 rounded-xl bg-slate-900/95 border border-white/10 text-xs text-white shadow-2xl z-50 w-52 space-y-2">
            <div className="font-semibold text-slate-300">{t.changeName}</div>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveUsername()}
                autoFocus
                className="w-full glass-input px-2 py-1 rounded text-xs text-white"
              />
              <button
                onClick={handleSaveUsername}
                className="p-1 rounded bg-indigo-600 text-white hover:bg-indigo-500 transition"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : showAccountTooltip ? (
          <div className="absolute left-16 bottom-0 px-3 py-2 rounded-xl bg-slate-900/95 border border-white/10 text-xs text-white shadow-xl whitespace-nowrap z-50 pointer-events-none">
            <div className="font-bold text-slate-200">{account.username}</div>
            <div className="text-[10px] text-slate-400">{account.type.toUpperCase()} • {t.ready}</div>
          </div>
        ) : null}
      </div>
    </aside>
  );
};
