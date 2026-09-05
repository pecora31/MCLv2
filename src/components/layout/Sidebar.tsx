import React, { useState } from 'react';
import { Home, Layers, Package, Shirt, Settings, User, Sparkles } from 'lucide-react';
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
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const t = getTranslation(language);

  const navItems = [
    { id: 'home', label: t.navHome, icon: Home },
    { id: 'instances', label: t.navInstances, icon: Layers },
    { id: 'mods', label: t.navMods, icon: Package },
    { id: 'skin', label: t.navSkin, icon: Shirt },
    { id: 'settings', label: t.navSettings, icon: Settings },
  ];

  // Resolve preset icon if active
  const presetAvatar = MINECRAFT_AVATAR_ICONS.find((i) => i.id === (account.avatarIcon || 'creeper')) || MINECRAFT_AVATAR_ICONS[0];

  return (
    <aside className="w-20 bg-black/60 flex flex-col justify-between items-center py-4 select-none z-30 shrink-0 shadow-2xl">
      {/* Top Logo & Navigation Icons */}
      <div className="space-y-4 flex flex-col items-center w-full">
        {/* Top Logo Icon (Riot Style Emblem) */}
        <div
          onClick={() => onTabChange('home')}
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center font-black text-slate-950 text-base shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer hover:scale-105 transition-transform mb-2 select-none"
          title="MCLv2 Home"
        >
          <span>MC</span>
        </div>

        <div className="w-8 h-[1px] bg-white/5" />

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <div key={item.id} className="relative group flex items-center justify-center w-full px-2">
              <button
                onClick={() => onTabChange(item.id as NavigationTab)}
                onMouseEnter={() => setHoveredTab(item.id)}
                onMouseLeave={() => setHoveredTab(null)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_16px_rgba(245,158,11,0.3)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110 text-amber-300' : 'group-hover:scale-110'}`} />
              </button>

              {/* Floating Tooltip */}
              {hoveredTab === item.id && (
                <div className="absolute left-20 px-3 py-1.5 rounded-xl bg-slate-900/95 border border-white/10 text-xs font-bold text-white shadow-2xl whitespace-nowrap z-50 pointer-events-none animate-fadeIn">
                  {item.label}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Account Avatar at Bottom -> Opens Full Profile Page */}
      <div className="relative flex flex-col items-center px-2 w-full">
        <button
          onClick={() => onTabChange('profile')}
          onMouseEnter={() => setHoveredTab('profile')}
          onMouseLeave={() => setHoveredTab(null)}
          className={`relative w-12 h-12 rounded-2xl overflow-hidden bg-slate-900 border transition-all flex items-center justify-center ${
            currentTab === 'profile'
              ? 'border-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.5)] ring-2 ring-amber-400/40 scale-105'
              : 'border-white/10 hover:border-amber-400/60 hover:scale-105'
          }`}
        >
          {account.avatarCustom ? (
            <img
              src={account.avatarCustom}
              alt={account.username}
              className="w-full h-full object-cover"
            />
          ) : account.avatarIcon ? (
            <div className={`w-full h-full flex items-center justify-center text-xl bg-gradient-to-br ${presetAvatar.color}`}>
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
          <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
        </button>

        {/* Tooltip for profile */}
        {hoveredTab === 'profile' && (
          <div className="absolute left-20 bottom-1 px-3 py-2 rounded-xl bg-slate-900/95 border border-white/10 text-xs text-white shadow-2xl whitespace-nowrap z-50 pointer-events-none animate-fadeIn">
            <div className="font-bold text-amber-300">{account.username}</div>
            <div className="text-[10px] text-slate-400">Xem Hồ Sơ & Đổi Avatar</div>
          </div>
        )}
      </div>
    </aside>
  );
};
