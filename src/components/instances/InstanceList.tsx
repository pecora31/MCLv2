import React from 'react';
import { Plus, Play, Trash2, Edit3, Clock, Layers } from 'lucide-react';
import type { GameInstance } from '../../types';

interface InstanceListProps {
  instances: GameInstance[];
  selectedInstanceId: string;
  onSelectInstance: (id: string) => void;
  onLaunchInstance: (id: string) => void;
  onEditInstance: (instance: GameInstance) => void;
  onDeleteInstance: (id: string) => void;
  onOpenCreateModal: () => void;
  isRunning: boolean;
}

export const InstanceList: React.FC<InstanceListProps> = ({
  instances,
  selectedInstanceId,
  onSelectInstance,
  onLaunchInstance,
  onEditInstance,
  onDeleteInstance,
  onOpenCreateModal,
  isRunning,
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-10 space-y-7 custom-scrollbar">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2 tracking-wide">
            <Layers className="w-4 h-4" />
            <span>Danh Sách Profile</span>
          </div>
          <h1 className="text-3xl font-extrabold font-riot text-white tracking-normal">Danh Sách Phiên Bản Game</h1>
          <p className="text-base text-slate-300 mt-1 tracking-wide">
            Mỗi profile được lưu trữ tại thư mục riêng biệt, hoạt động độc lập.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="btn-primary py-3 px-6 rounded-2xl font-riot font-bold text-sm flex items-center gap-2 shadow-lg shrink-0 tracking-wide"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Profile Mới</span>
        </button>
      </div>

      {/* Grid of Instances or Empty State */}
      {instances.length === 0 ? (
        <div className="minimal-panel rounded-2xl p-12 border border-white/[0.06] text-center flex flex-col items-center justify-center space-y-5 max-w-xl mx-auto my-12 shadow-2xl animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-lg">
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-riot">Chưa Có Phiên Bản Nào</h3>
            <p className="text-xs text-slate-400 mt-1.5 max-w-md leading-relaxed">
              Bạn hiện chưa có profile game nào. Hãy tạo một profile mới để tải tài nguyên Minecraft và bắt đầu chơi!
            </p>
          </div>
          <button
            onClick={onOpenCreateModal}
            className="btn-primary py-3 px-6 rounded-xl font-riot font-bold text-sm flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Profile Đầu Tiên</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instances.map((inst) => {
            const isSelected = inst.id === selectedInstanceId;

            return (
              <div
                key={inst.id}
                onClick={() => onSelectInstance(inst.id)}
                className={`relative rounded-2xl p-6 border transition-all cursor-pointer flex flex-col justify-between space-y-5 ${
                  isSelected
                    ? 'minimal-card-active'
                    : 'minimal-card'
                }`}
              >
                {/* Header: Pure Clean Text (No logo box, no RAM/skin pill) */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-white leading-snug truncate tracking-wide">
                      {inst.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-300 mt-1.5 tracking-wide">
                      <span className="font-semibold text-white">Minecraft {inst.gameVersion}</span>
                      <span className="text-slate-500">•</span>
                      <span className="capitalize text-amber-400 font-bold font-mono">
                        {inst.loader === 'vanilla' ? 'Vanilla (Gốc)' : `${inst.loader.toUpperCase()} ${inst.loaderVersion || ''}`}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0 font-riot tracking-wider">
                      ĐANG CHỌN
                    </span>
                  )}
                </div>

                {/* Last played info */}
                <div className="flex items-center gap-2 text-xs text-slate-400 tracking-wide">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Chơi gần nhất: {inst.lastPlayed || 'Chưa chơi'}</span>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLaunchInstance(inst.id);
                    }}
                    disabled={isRunning}
                    className={`py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-2 transition tracking-wider ${
                      isSelected
                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>CHƠI NGAY</span>
                  </button>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onEditInstance(inst)}
                      title="Chỉnh sửa Profile"
                      className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
