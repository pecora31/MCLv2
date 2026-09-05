import React, { useState, useEffect } from 'react';
import { X, Sliders, Cpu, Save, ShieldCheck } from 'lucide-react';
import type { GameInstance } from '../../types';

interface EditInstanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  instance: GameInstance | null;
  onSave: (updated: GameInstance) => void;
}

export const EditInstanceModal: React.FC<EditInstanceModalProps> = ({
  isOpen,
  onClose,
  instance,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [minRam, setMinRam] = useState(2048);
  const [maxRam, setMaxRam] = useState(4096);
  const [jvmArgs, setJvmArgs] = useState('');
  const [enableSkinInGame, setEnableSkinInGame] = useState(true);

  useEffect(() => {
    if (instance) {
      setName(instance.name);
      setMinRam(instance.minRam || 2048);
      setMaxRam(instance.maxRam || 4096);
      setJvmArgs(instance.jvmArgs || '');
      setEnableSkinInGame(instance.enableSkinInGame ?? true);
    }
  }, [instance, isOpen]);

  if (!isOpen || !instance) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...instance,
      name: name.trim() || instance.name,
      minRam,
      maxRam,
      jvmArgs: jvmArgs.trim() || undefined,
      enableSkinInGame,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl bg-[#121212] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#161616]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-riot">Edit Profile</h2>
              <p className="text-xs text-slate-400">
                {instance.loader.toUpperCase()} • Minecraft {instance.gameVersion}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Profile Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Profile Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter profile name..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1a1a] border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* RAM Allocation */}
          <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-400" />
                <span>Memory (RAM) Allocation</span>
              </label>
              <span className="text-xs font-mono font-bold text-amber-400">
                {(maxRam / 1024).toFixed(1)} GB (Max)
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Maximum RAM: {maxRam} MB</span>
                <span>(Recommended: 4096 - 8192 MB)</span>
              </div>
              <input
                type="range"
                min={2048}
                max={16384}
                step={512}
                value={maxRam}
                onChange={(e) => setMaxRam(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>2 GB</span>
                <span>4 GB</span>
                <span>8 GB</span>
                <span>16 GB</span>
              </div>
            </div>
          </div>

          {/* JVM Arguments */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Custom JVM Arguments (Optional)
            </label>
            <input
              type="text"
              value={jvmArgs}
              onChange={(e) => setJvmArgs(e.target.value)}
              placeholder="-XX:+UseG1GC -XX:+ParallelRefProcEnabled"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1a1a] border border-white/10 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Skin Synchronization Toggle */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-xs font-semibold text-slate-200 block">In-Game Team Skin Support</span>
                <span className="text-[11px] text-slate-400">Automatically sync custom player skins in-game</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={enableSkinInGame}
              onChange={(e) => setEnableSkinInGame(e.target.checked)}
              className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold font-riot flex items-center gap-2 shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
