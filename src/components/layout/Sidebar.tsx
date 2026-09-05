import React from 'react';
import { Home, Layers, Package, Shirt, Settings, User } from 'lucide-react';
import type { Account } from '../../types';
import { getTranslation, type Language } from '../../locales/i18n';
import { MINECRAFT_AVATAR_ICONS } from '../profile/ProfileView';

export type NavigationTab = 'home' | 'instances' | 'mods' | 'skin' | 'settings' | 'profile';

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
  language,
}) => {
  const t = getTranslation(language);

  const navItems = [
    { id: 'home', label: t.navHome, icon: Home },
    { id: 'instances', label: t.navInstances, icon: Layers },
    { id: 'mods', label: t.navMods, icon: Package },
    { id: 'skin', label: t.navSkin, icon: Shirt },
    { id: 'settings', label: t.navSettings, icon: Settings },
  ];

  // Resolve preset icon if active
  const presetAvatar =
    MINECRAFT_AVATAR_ICONS.find((i) => i.id === (account.avatarIcon || 'creeper')) ||
    MINECRAFT_AVATAR_ICONS[0];

  return (
    <aside className="w-20 bg-[#0a0a0a] flex flex-col justify-between items-center py-5 select-none z-30 shrink-0 h-full border-r border-white/[0.06]">
      {/* Top MCL Logo - Subdued (chìm), Unclickable */}
      <div className="w-full flex items-center justify-center pt-1 select-none pointer-events-none">
        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-slate-500/70 font-black text-xs font-mono tracking-widest">
          MCL
        </div>
      </div>

      {/* Vertically Centered Navigation Menu Cluster */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3 w-full px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <div key={item.id} className="relative group flex items-center justify-center w-full">
              {/* Left Edge Active Indicator Bar (stuck to sidebar's outer left edge) */}
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
              )}

              <button
                onClick={() => onTabChange(item.id as NavigationTab)}
                onMouseDown={() => onTabChange(item.id as NavigationTab)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-100 border-none outline-none ${
                  isActive
                    ? 'bg-white/10 text-amber-400'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Icon className="w-6 h-6" />
              </button>

              {/* Pure CSS Tooltip (Zero JS delay) */}
              <div className="absolute left-16 px-3 py-1.5 rounded-lg bg-[#181818] border border-white/10 text-xs font-semibold text-white shadow-xl whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Account Avatar at Bottom -> Opens Full Profile Page */}
      <div className="relative group flex flex-col items-center px-2 pb-1 w-full">
        <button
          onClick={() => onTabChange('profile')}
          onMouseDown={() => onTabChange('profile')}
          className={`relative w-12 h-12 rounded-xl overflow-hidden bg-[#171717] border transition-colors duration-100 flex items-center justify-center outline-none ${
            currentTab === 'profile'
              ? 'border-amber-400 ring-2 ring-amber-400/40'
              : 'border-white/10 hover:border-amber-400/60'
          }`}
        >
          {account.avatarCustom ? (
            <img
              src={account.avatarCustom}
              alt={account.username}
              className="w-full h-full object-cover"
            />
          ) : account.avatarIcon ? (
            <div className={`w-full h-full flex items-center justify-center text-lg bg-gradient-to-br ${presetAvatar.color}`}>
              <span className="select-none">{presetAvatar.icon}</span>
            </div>
          ) : account.skinUrl ? (
            <img
              src={account.skinUrl}
              alt={account.username}
              className="w-full h-full object-cover rendering-pixelated"
            />
          ) : (
            <User className="w-6 h-6 text-amber-400" />
          )}

          {/* Active online status dot */}
          <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0a0a0a]" />
        </button>

        {/* Pure CSS Tooltip for profile */}
        <div className="absolute left-16 bottom-2 px-3.5 py-2 rounded-lg bg-[#181818] border border-white/10 text-xs text-white shadow-xl whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-100">
          <div className="font-bold text-amber-300 text-sm">{account.username}</div>
          <div className="text-xs text-slate-400">Xem Hồ Sơ & Đổi Avatar</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
