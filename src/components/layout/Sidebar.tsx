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
    <aside className="w-20 bg-[#080c13] flex flex-col justify-between items-center py-4 select-none z-30 shrink-0 h-full border-r border-black/80 shadow-2xl">
      {/* Top Logo & Navigation Icons */}
      <div className="space-y-4 flex flex-col items-center w-full">
        {/* Top Logo Icon (Riot Style Emblem - Image 5 Style) */}
        <button
          onClick={() => onTabChange('home')}
          onMouseDown={() => onTabChange('home')}
          className="w-12 h-12 rounded-2xl bg-[#d8a951] text-[#0b0e14] flex items-center justify-center font-black text-base shadow-[0_0_20px_rgba(216,169,81,0.3)] cursor-pointer hover:bg-[#e2b564] active:bg-[#c99a42] transition-colors mb-1 select-none border-none outline-none"
          title="MCLv2 Home"
        >
          <span className="font-extrabold tracking-tight">MC</span>
        </button>

        <div className="w-8 h-[1px] bg-white/[0.08]" />

        {/* Navigation Items (Fast, flat, no 3D delay) */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <div key={item.id} className="relative group flex items-center justify-center w-full px-2">
              {/* Left Edge Active Indicator Bar (stuck to sidebar's outer left edge) */}
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-amber-400" />
              )}

              <button
                onClick={() => onTabChange(item.id as NavigationTab)}
                onMouseDown={() => onTabChange(item.id as NavigationTab)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors duration-100 border-none outline-none ${
                  isActive
                    ? 'bg-white/10 text-amber-400'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Icon className="w-5 h-5" />
              </button>

              {/* Pure CSS Tooltip (Zero JS delay) */}
              <div className="absolute left-16 px-2.5 py-1 rounded-lg bg-[#141b27] border border-slate-700/60 text-xs font-semibold text-white shadow-xl whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Account Avatar at Bottom -> Opens Full Profile Page */}
      <div className="relative group flex flex-col items-center px-2 w-full">
        <button
          onClick={() => onTabChange('profile')}
          onMouseDown={() => onTabChange('profile')}
          className={`relative w-11 h-11 rounded-xl overflow-hidden bg-slate-900 border transition-colors duration-100 flex items-center justify-center outline-none ${
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
            <User className="w-5 h-5 text-amber-400" />
          )}

          {/* Active online status dot */}
          <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
        </button>

        {/* Pure CSS Tooltip for profile */}
        <div className="absolute left-16 bottom-1 px-3 py-1.5 rounded-lg bg-[#141b27] border border-slate-700/60 text-xs text-white shadow-xl whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <div className="font-bold text-amber-300">{account.username}</div>
          <div className="text-[10px] text-slate-400">Xem Hồ Sơ & Đổi Avatar</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
