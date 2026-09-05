import React from 'react';
import { Plus, Play, Folder, Trash2, Copy, ShieldCheck, Clock, Layers, Sparkles } from 'lucide-react';
import type { GameInstance } from '../../types';

interface InstanceListProps {
  instances: GameInstance[];
  selectedInstanceId: string;
  onSelectInstance: (id: string) => void;
  onLaunchInstance: (id: string) => void;
  onDeleteInstance: (id: string) => void;
  onOpenCreateModal: () => void;
  isRunning: boolean;
}

export const InstanceList: React.FC<InstanceListProps> = ({
  instances,
  selectedInstanceId,
  onSelectInstance,
  onLaunchInstance,
  onDeleteInstance,
  onOpenCreateModal,
  isRunning,
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-10 space-y-7">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2 tracking-wide">
            <Layers className="w-4 h-4" />
            <span>Danh Sách Profile</span>
          </div>
          <h1 className="text-3xl font-extrabold font-['Outfit'] text-white tracking-normal">Danh Sách Phiên Bản Game</h1>
          <p className="text-base text-slate-300 mt-1 tracking-wide">
            Mỗi profile được lưu trữ tại thư mục riêng biệt, hoạt động độc lập.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="btn-primary py-3 px-6 rounded-2xl font-['Outfit'] font-bold text-sm flex items-center gap-2 shadow-lg shrink-0 tracking-wide"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Profile Mới</span>
        </button>
      </div>

      {/* Grid of Instances */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {instances.map((inst) => {
          const isSelected = inst.id === selectedInstanceId;

          return (
            <div
              key={inst.id}
              onClick={() => onSelectInstance(inst.id)}
              className={`relative rounded-2xl p-6 border transition-all cursor-pointer flex flex-col justify-between space-y-5 ${
                isSelected
                  ? 'glass-card-active'
                  : 'glass-card'
              }`}
            >
              {/* Header: Loader Badge & Icon */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-900 border border-white/[0.08] flex items-center justify-center font-riot font-bold text-base text-amber-400 shadow-md">
                    {inst.loader === 'fabric' ? 'Fb' : inst.loader === 'forge' ? 'Fg' : inst.loader === 'neoforge' ? 'Nf' : 'Mc'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-snug line-clamp-1 tracking-wide">{inst.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-300 mt-1 tracking-wide">
                      <span>MC {inst.gameVersion}</span>
                      <span>•</span>
                      <span className="capitalize text-amber-400 font-semibold">{inst.loader}</span>
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0 font-riot tracking-wider">
                    ĐANG CHỌN
                  </span>
                )}
              </div>

              {/* Specs Pills */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400">RAM:</span>
                  <span className="font-mono text-slate-200 font-medium">{inst.maxRam / 1024} GB</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400">Skin Đồng Đội:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Bật
                  </span>
                </div>
              </div>

              {/* Last played */}
              <div className="flex items-center gap-2 text-xs text-slate-400 tracking-wide">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Chơi gần nhất: {inst.lastPlayed || 'Chưa chơi'}</span>
              </div>

              {/* Actions Footer */}
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLaunchInstance(inst.id);
                  }}
                  disabled={isRunning}
                  className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center gap-2 transition tracking-wider ${
                    isSelected
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>CHƠI NGAY</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Bạn có chắc muốn xóa profile "${inst.name}"?`)) {
                      onDeleteInstance(inst.id);
                    }
                  }}
                  title="Xóa Profile"
                  className="p-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
