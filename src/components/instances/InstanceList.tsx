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
    <div className="flex-1 flex flex-col overflow-y-auto p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Quản Lý Profile & Bản Game</span>
          </div>
          <h1 className="text-2xl font-bold font-['Outfit'] text-white">Danh Sách Phiên Bản Game</h1>
          <p className="text-sm text-slate-400">
            Mỗi profile được cách ly thư mục hoàn toàn, không lo xung đột mod hoặc file save.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="btn-primary py-2.5 px-5 rounded-xl font-['Outfit'] font-bold text-sm flex items-center gap-2 shadow-lg shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Profile Mới</span>
        </button>
      </div>

      {/* Grid of Instances */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {instances.map((inst) => {
          const isSelected = inst.id === selectedInstanceId;

          return (
            <div
              key={inst.id}
              onClick={() => onSelectInstance(inst.id)}
              className={`relative rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'glass-card-active'
                  : 'glass-card'
              }`}
            >
              {/* Header: Loader Badge & Icon */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center font-['Outfit'] font-bold text-base text-indigo-400 shadow-md">
                    {inst.loader === 'fabric' ? 'Fb' : inst.loader === 'forge' ? 'Fg' : inst.loader === 'neoforge' ? 'Nf' : 'Mc'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-snug line-clamp-1">{inst.name}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>MC {inst.gameVersion}</span>
                      <span>•</span>
                      <span className="capitalize text-indigo-400 font-semibold">{inst.loader}</span>
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shrink-0">
                    ĐANG CHỌN
                  </span>
                )}
              </div>

              {/* Specs Pills */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-black/20 border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400">RAM:</span>
                  <span className="font-mono text-slate-200">{inst.maxRam / 1024} GB</span>
                </div>
                <div className="p-2 rounded-lg bg-black/20 border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400">Skin Đồng Đội:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Bật
                  </span>
                </div>
              </div>

              {/* Last played */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Clock className="w-3 h-3" />
                <span>Chơi gần nhất: {inst.lastPlayed || 'Chưa chơi'}</span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLaunchInstance(inst.id);
                  }}
                  disabled={isRunning}
                  className={`flex-1 py-2 px-3 rounded-xl font-['Outfit'] font-bold text-xs flex items-center justify-center gap-2 transition ${
                    isSelected
                      ? 'btn-launch text-white'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isSelected && isRunning ? 'Đang Chơi' : 'Khởi Chạy'}</span>
                </button>

                {instances.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Bạn có chắc muốn xóa profile "${inst.name}"?`)) {
                        onDeleteInstance(inst.id);
                      }
                    }}
                    className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                    title="Xóa Profile"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
