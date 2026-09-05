import React, { useState, useEffect } from 'react';
import { Settings, Cpu, HardDrive, Server, Shield, Sparkles, Folder, RefreshCw, Check } from 'lucide-react';
import type { LauncherSettings, JavaInstallation } from '../../types';
import { invokeCommand } from '../../services/api';

interface SettingsViewProps {
  settings: LauncherSettings;
  onSaveSettings: (settings: LauncherSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSaveSettings }) => {
  const [formData, setFormData] = useState<LauncherSettings>(settings);
  const [javaList, setJavaList] = useState<JavaInstallation[]>([]);
  const [detectingJava, setDetectingJava] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    handleDetectJava();
  }, []);

  const handleDetectJava = async () => {
    setDetectingJava(true);
    try {
      const list = await invokeCommand<JavaInstallation[]>('detect_java');
      setJavaList(list || []);
      if (!formData.defaultJavaPath && list?.length > 0) {
        setFormData((prev) => ({ ...prev, defaultJavaPath: list[0].path }));
      }
    } catch {
      // Mock fallback
    } finally {
      setDetectingJava(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <Settings className="w-3.5 h-3.5" />
            <span>Cấu Hình Nâng Cao</span>
          </div>
          <h1 className="text-2xl font-bold font-['Outfit'] text-white">Cài Đặt Hệ Thống</h1>
          <p className="text-sm text-slate-400">
            Tối ưu hóa Java, phân bổ bộ nhớ RAM và cấu hình máy chủ cho launcher.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="btn-primary py-2.5 px-6 rounded-xl font-['Outfit'] font-bold text-sm flex items-center gap-2 shadow-lg"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Sparkles className="w-4 h-4" />}
          <span>{savedSuccess ? 'Đã Lưu!' : 'Lưu Thay Đổi'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        {/* Java Configuration */}
        <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-sm font-semibold text-white">Bộ Cài Đặt Java Runtime</h3>
                <p className="text-xs text-slate-400">Tự động nhận diện các phiên bản Java trên máy tính</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDetectJava}
              disabled={detectingJava}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${detectingJava ? 'animate-spin' : ''}`} />
              <span>Quét Lại Java</span>
            </button>
          </div>

          <div className="space-y-2">
            <select
              value={formData.defaultJavaPath || ''}
              onChange={(e) => setFormData({ ...formData, defaultJavaPath: e.target.value })}
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs font-mono text-white cursor-pointer"
            >
              {javaList.map((j) => (
                <option key={j.path} value={j.path} className="bg-slate-900 text-white font-sans">
                  {j.versionString} - {j.path}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* RAM Allocation */}
        <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-4">
          <div className="flex items-center gap-2.5">
            <HardDrive className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Bộ Nhớ RAM Mặc Định</h3>
              <p className="text-xs text-slate-400">Phân bổ RAM cho các profile mới tạo</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold">RAM Cấp Phát:</span>
              <span className="text-indigo-400 font-mono font-bold text-sm">
                {formData.defaultMaxRam / 1024} GB RAM
              </span>
            </div>
            <input
              type="range"
              min="2048"
              max="16384"
              step="1024"
              value={formData.defaultMaxRam}
              onChange={(e) => setFormData({ ...formData, defaultMaxRam: Number(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>2 GB (Vanilla)</span>
              <span>4 GB (Fabric nhẹ)</span>
              <span>8 GB (Forge / Shaders)</span>
              <span>16 GB (Heavy Modpack)</span>
            </div>
          </div>
        </div>

        {/* Default Server IP & Port */}
        <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-4">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Máy Chủ Mặc Định Của Nhóm</h3>
              <p className="text-xs text-slate-400">Địa chỉ IP server hiển thị ở màn hình chính</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs text-slate-400 mb-1">Địa chỉ IP Server</label>
              <input
                type="text"
                value={formData.serverHost}
                onChange={(e) => setFormData({ ...formData, serverHost: e.target.value })}
                placeholder="play.example.mc hoặc 127.0.0.1"
                className="w-full glass-input px-3.5 py-2 rounded-xl text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Port</label>
              <input
                type="number"
                value={formData.serverPort}
                onChange={(e) => setFormData({ ...formData, serverPort: Number(e.target.value) })}
                className="w-full glass-input px-3.5 py-2 rounded-xl text-xs text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* JVM Flags */}
        <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-3">
          <h3 className="text-sm font-semibold text-white">Tối Ưu Hoá JVM Arguments (Aikar's Flags)</h3>
          <p className="text-xs text-slate-400">
            Các tham số tối ưu bộ thu gom rác (Garbage Collector) giúp game giảm giật lag và drop FPS:
          </p>
          <textarea
            rows={2}
            value={formData.defaultJvmArgs}
            onChange={(e) => setFormData({ ...formData, defaultJvmArgs: e.target.value })}
            className="w-full glass-input p-3 rounded-xl text-xs font-mono text-slate-300 resize-none"
          />
        </div>
      </form>
    </div>
  );
};
