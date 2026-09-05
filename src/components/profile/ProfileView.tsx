import React, { useState } from 'react';
import { User, Shield, Clock, HardDrive, Edit3, Check, Upload, Shirt, Sparkles, Trash2, Award, Zap, Heart, Flame } from 'lucide-react';
import type { Account, GameInstance } from '../../types';
import { getTranslation, type Language } from '../../locales/i18n';

interface ProfileViewProps {
  account: Account;
  onUpdateAccount: (updated: Account) => void;
  onNavigateSkin: () => void;
  instances: GameInstance[];
  language: Language;
}

// Preset Minecraft Icons
export const MINECRAFT_AVATAR_ICONS = [
  { id: 'creeper', name: 'Creeper', color: 'from-emerald-500 to-green-700', icon: '🟢', desc: 'Biểu tượng kinh điển' },
  { id: 'diamond_sword', name: 'Diamond Sword', color: 'from-cyan-400 to-blue-600', icon: '⚔️', desc: 'Kiếm kim cương' },
  { id: 'netherite_helmet', name: 'Netherite Helmet', color: 'from-slate-700 to-zinc-900', icon: '🛡️', desc: 'Mũ Netherite' },
  { id: 'golden_apple', name: 'Golden Apple', color: 'from-amber-300 to-yellow-500', icon: '🍏', desc: 'Táo vàng huyền thoại' },
  { id: 'totem', name: 'Totem of Undying', color: 'from-amber-400 to-emerald-500', icon: '🗿', desc: 'Bảo vật hồi sinh' },
  { id: 'enderman', name: 'Enderman', color: 'from-purple-900 to-indigo-950', icon: '👁️', desc: 'Kẻ dịch chuyển' },
  { id: 'enchanted_book', name: 'Enchanted Book', color: 'from-purple-500 to-pink-600', icon: '📖', desc: 'Sách phù phép' },
  { id: 'wolf', name: 'Tamed Wolf', color: 'from-stone-400 to-slate-600', icon: '🐺', desc: 'Bạn đồng hành' },
  { id: 'redstone', name: 'Redstone Core', color: 'from-red-500 to-rose-700', icon: '⚡', desc: 'Kỹ sư tự động' },
  { id: 'emerald', name: 'Emerald Gem', color: 'from-emerald-400 to-teal-600', icon: '💎', desc: 'Thương gia giàu có' },
  { id: 'tnt', name: 'TNT Explosive', color: 'from-red-600 to-rose-900', icon: '🧨', desc: 'Bùng nổ sức mạnh' },
  { id: 'fire', name: 'Blaze Flame', color: 'from-orange-500 to-amber-600', icon: '🔥', desc: 'Ngọn lửa địa ngục' },
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  account,
  onUpdateAccount,
  onNavigateSkin,
  instances,
  language,
}) => {
  const t = getTranslation(language);
  const [usernameInput, setUsernameInput] = useState(account.username);
  const [isEditingName, setIsEditingName] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveName = () => {
    if (!usernameInput.trim()) return;
    const updated = { ...account, username: usernameInput.trim() };
    onUpdateAccount(updated);
    setIsEditingName(false);
    showSuccess();
  };

  const handleSelectPresetIcon = (iconId: string) => {
    const updated: Account = {
      ...account,
      avatarIcon: iconId,
      avatarCustom: undefined, // Clear custom image to use preset
    };
    onUpdateAccount(updated);
    showSuccess();
  };

  const handleUploadCustomAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const updated: Account = {
          ...account,
          avatarCustom: reader.result,
          avatarIcon: undefined,
        };
        onUpdateAccount(updated);
        showSuccess();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomAvatar = () => {
    const updated: Account = {
      ...account,
      avatarCustom: undefined,
      avatarIcon: 'creeper',
    };
    onUpdateAccount(updated);
    showSuccess();
  };

  const showSuccess = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Find active preset icon
  const currentPreset = MINECRAFT_AVATAR_ICONS.find((i) => i.id === (account.avatarIcon || 'creeper')) || MINECRAFT_AVATAR_ICONS[0];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-8 space-y-6 animate-fadeIn">
      {/* Top Banner & Player Identity Card */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          {/* Avatar & Name Info */}
          <div className="flex items-center gap-5">
            {/* Big Avatar Frame */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-3xl overflow-hidden bg-slate-900 border-2 border-amber-400/50 shadow-[0_0_25px_rgba(245,158,11,0.3)] flex items-center justify-center text-4xl">
                {account.avatarCustom ? (
                  <img src={account.avatarCustom} alt={account.username} className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${currentPreset.color}`}>
                    <span className="drop-shadow-md select-none">{currentPreset.icon}</span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center" title="Online">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </div>
            </div>

            {/* Name, Tag & UUID */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                      className="glass-input px-3 py-1.5 rounded-xl text-base font-bold text-white font-['Outfit']"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      className="p-2 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition"
                    >
                      <Check className="w-4 h-4 font-bold" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-black font-['Outfit'] text-white">{account.username}</h1>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
                      title="Đổi tên hiển thị"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {account.type.toUpperCase()}
                </span>
              </div>

              <p className="text-xs text-slate-400 font-mono">UUID: {account.uuid.slice(0, 18)}...</p>

              <div className="flex items-center gap-3 pt-1 text-xs text-slate-300">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <Shield className="w-3.5 h-3.5" /> Sẵn sàng vào game
                </span>
                <span>•</span>
                <span className="text-slate-400">Model: <strong className="text-slate-200 capitalize">{account.skinModel}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Actions on Right */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onNavigateSkin}
              className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-2 border border-white/10 transition shadow-lg"
            >
              <Shirt className="w-4 h-4 text-indigo-400" />
              <span>Chỉnh Sửa Skin 3D</span>
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4" />
            <span>Đã cập nhật thông tin hồ sơ thành công!</span>
          </div>
        )}
      </div>

      {/* Main Grid: Avatar Gallery (Left) & Player Stats (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Avatar Picker (8 cols) */}
        <div className="lg:col-span-8 glass-panel rounded-3xl p-6 border border-white/10 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
            <div>
              <h2 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Biểu Tượng Đại Diện (Player Avatar)</span>
              </h2>
              <p className="text-xs text-slate-400">Chọn icon Minecraft đặc trưng hoặc tải ảnh đại diện từ máy tính</p>
            </div>

            {/* Upload Custom Avatar Button */}
            <div className="flex items-center gap-2">
              <label className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-xs cursor-pointer flex items-center gap-1.5 transition">
                <Upload className="w-3.5 h-3.5" />
                <span>Tải ảnh từ máy</span>
                <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleUploadCustomAvatar} className="hidden" />
              </label>

              {account.avatarCustom && (
                <button
                  onClick={handleRemoveCustomAvatar}
                  className="p-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition"
                  title="Xóa ảnh riêng và dùng icon mặc định"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Minecraft Preset Icons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {MINECRAFT_AVATAR_ICONS.map((item) => {
              const isSelected = !account.avatarCustom && (account.avatarIcon || 'creeper') === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectPresetIcon(item.id)}
                  className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 group relative ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/15 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br ${item.color} shadow-md group-hover:scale-110 transition shrink-0`}>
                    <span className="select-none">{item.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{item.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Player Stats & Information (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400" />
              <span>Thống Kê Người Chơi</span>
            </h3>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Tổng giờ chơi:</span>
                </div>
                <span className="font-mono text-xs font-bold text-white">42.5 giờ</span>
              </div>

              <div className="p-3 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <HardDrive className="w-4 h-4 text-emerald-400" />
                  <span>Số bản game (Profile):</span>
                </div>
                <span className="font-mono text-xs font-bold text-white">{instances.length} Profile</span>
              </div>

              <div className="p-3 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>Chế độ mod khuyên dùng:</span>
                </div>
                <span className="font-mono text-xs font-bold text-cyan-300">Fabric Loader</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl p-5 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-purple-950/30 border border-indigo-500/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <Heart className="w-4 h-4 text-rose-400" />
              <span>Đồng Bộ Skin Trong Game</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Bạn có thể cập nhật skin 3D bất kỳ lúc nào. Skin sẽ tự động xuất hiện trên server bạn bè mà không cần mua bản quyền.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
