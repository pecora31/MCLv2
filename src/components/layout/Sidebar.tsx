import React from 'react';
import { Home, Layers, Package, Shirt, Settings, User, Check, Edit2, ExternalLink } from 'lucide-react';
import type { Account } from '../../types';

export type NavigationTab = 'home' | 'instances' | 'mods' | 'skin' | 'settings';

interface SidebarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  account: Account;
  onUpdateUsername: (newName: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  account,
  onUpdateUsername,
}) => {
  const [isEditingUser, setIsEditingUser] = React.useState(false);
  const [tempUsername, setTempUsername] = React.useState(account.username);

  const navItems = [
    { id: 'home', label: 'Trang Chủ & Server', icon: Home, badge: 'Live' },
    { id: 'instances', label: 'Quản Lý Phiên Bản', icon: Layers },
    { id: 'mods', label: 'Kho Mod & Shader', icon: Package },
    { id: 'skin', label: '3D Skin Studio', icon: Shirt, badge: 'Skin Mod' },
    { id: 'settings', label: 'Cài Đặt Hệ Thống', icon: Settings },
  ];

  const handleSaveUsername = () => {
    if (tempUsername.trim()) {
      onUpdateUsername(tempUsername.trim());
      setIsEditingUser(false);
    }
  };

  return (
    <aside className="w-64 bg-[#0a0d16] border-r border-white/5 flex flex-col justify-between select-none">
      {/* Navigation Links */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
          Menu Điều Hướng
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as NavigationTab)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)] font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    item.badge === 'Live'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Account Info at Bottom */}
      <div className="p-3 border-t border-white/5 bg-[#0e121d]/80">
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 flex items-center gap-3">
          {/* Avatar / Skin Head */}
          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
            {account.skinUrl ? (
              <img
                src={account.skinUrl}
                alt={account.username}
                className="w-full h-full object-cover rendering-pixelated"
              />
            ) : (
              <User className="w-5 h-5 text-indigo-400" />
            )}
            <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
          </div>

          {/* Account Details */}
          <div className="flex-1 min-w-0">
            {isEditingUser ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveUsername()}
                  autoFocus
                  className="w-full bg-black/40 border border-indigo-500/60 rounded px-1.5 py-0.5 text-xs text-white outline-none"
                />
                <button
                  onClick={handleSaveUsername}
                  className="p-1 rounded bg-indigo-600 text-white hover:bg-indigo-500 transition"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="truncate">
                  <div className="text-xs font-semibold text-slate-200 truncate flex items-center gap-1">
                    <span>{account.username}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span className="capitalize">{account.type}</span>
                    <span>•</span>
                    <span className="text-emerald-400">Sẵn sàng</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingUser(true)}
                  title="Đổi tên nhân vật"
                  className="p-1 rounded text-slate-500 hover:text-indigo-400 hover:bg-white/5 transition"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
