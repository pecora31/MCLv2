import React, { useState, useEffect } from 'react';
import { Settings, Cpu, HardDrive, Server, RefreshCw, Check, Palette, Image as ImageIcon, Sparkles, Upload } from 'lucide-react';
import type { LauncherSettings, JavaInstallation, UiStyle, ColorPalette } from '../../types';
import { invokeCommand } from '../../services/api';
import { getTranslation, type Language } from '../../locales/i18n';

interface SettingsViewProps {
  settings: LauncherSettings;
  onSaveSettings: (settings: LauncherSettings) => void;
  language: Language;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSaveSettings, language }) => {
  const t = getTranslation(language);
  const [formData, setFormData] = useState<LauncherSettings>(settings);
  const [javaList, setJavaList] = useState<JavaInstallation[]>([]);
  const [detectingJava, setDetectingJava] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

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
      // fallback
    } finally {
      setDetectingJava(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  // Image Upload handler: immediately set bgType to image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type.startsWith('image/'))) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const updated: LauncherSettings = {
            ...formData,
            bgType: 'image',
            customBgImage: reader.result,
          };
          setFormData(updated);
          onSaveSettings(updated);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetBg = () => {
    const updated: LauncherSettings = {
      ...formData,
      bgType: 'video',
      customBgImage: undefined,
    };
    setFormData(updated);
    onSaveSettings(updated);
  };

  const palettes: { id: ColorPalette; name: string; color: string }[] = [
    { id: 'indigo', name: t.paletteIndigo, color: '#6366f1' },
    { id: 'emerald', name: t.paletteEmerald, color: '#10b981' },
    { id: 'amber', name: t.paletteAmber, color: '#f59e0b' },
    { id: 'rose', name: t.paletteRose, color: '#f43f5e' },
    { id: 'cyan', name: t.paletteCyan, color: '#06b6d4' },
    { id: 'slate', name: t.paletteSlate, color: '#94a3b8' },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-10 space-y-7">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold font-riot text-white tracking-normal">{t.settingsTitle}</h1>
          <p className="text-base text-slate-300 mt-1 tracking-wide">{t.settingsSub}</p>
        </div>

        <button
          onClick={handleSave}
          className="btn-primary py-3 px-6 rounded-2xl font-riot font-bold text-sm flex items-center gap-2 shadow-lg tracking-wide"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Check className="w-4 h-4" />}
          <span>{savedSuccess ? t.saved : t.btnSave}</span>
        </button>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* 1. Theme & Interface Style */}
        <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-5">
          <div className="flex items-center gap-2.5">
            <Palette className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white tracking-wide">{t.uiSection}</h3>
          </div>

          {/* Style Selector: Riot Client vs Minimalist */}
          <div>
            <label className="block text-xs text-slate-400 mb-2">{t.uiStyle}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  const updated = { ...formData, uiStyle: 'riot' as UiStyle };
                  setFormData(updated);
                  onSaveSettings(updated);
                }}
                className={`p-3.5 rounded-xl border text-left transition ${
                  formData.uiStyle === 'riot' || !formData.uiStyle
                    ? 'border-amber-500 bg-amber-500/10 text-white font-semibold shadow-sm'
                    : 'border-white/5 bg-white/[0.02] text-slate-400 hover:border-white/10'
                }`}
              >
                <div className="text-xs font-bold text-amber-400">{t.styleRiot}</div>
                <div className="text-[11px] text-slate-300 mt-0.5">Obsidian nhám, phong cách Riot Client</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  const updated = { ...formData, uiStyle: 'minimal' as UiStyle };
                  setFormData(updated);
                  onSaveSettings(updated);
                }}
                className={`p-3.5 rounded-xl border text-left transition ${
                  formData.uiStyle === 'minimal'
                    ? 'border-amber-500 bg-amber-500/10 text-white font-semibold'
                    : 'border-white/5 bg-white/[0.02] text-slate-400 hover:border-white/10'
                }`}
              >
                <div className="text-xs font-bold text-slate-200">{t.styleMinimal}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Đường nét phẳng, tối giản, sắc nét</div>
              </button>
            </div>
          </div>

          {/* Color Palettes */}
          <div>
            <label className="block text-xs text-slate-400 mb-2">{t.colorPalette}</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {palettes.map((p) => {
                const isSelected = formData.colorPalette === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      const updated = { ...formData, colorPalette: p.id };
                      setFormData(updated);
                      onSaveSettings(updated);
                    }}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                      isSelected
                        ? 'border-white/40 bg-white/10 shadow-sm'
                        : 'border-white/5 bg-black/20 hover:border-white/20'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: p.color }} />
                    <span className="text-[11px] font-medium text-slate-300 truncate w-full text-center">{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Background Mode: Video vs Custom Image */}
          <div className="pt-2 border-t border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Nền Launcher (Background Media)</span>
              </label>

              {formData.bgType === 'image' && (
                <button
                  type="button"
                  onClick={() => {
                    const updated = { ...formData, bgType: 'video' as const, customBgImage: undefined };
                    setFormData(updated);
                    onSaveSettings(updated);
                  }}
                  className="text-[11px] text-amber-400 hover:underline"
                >
                  Dùng Nền Video Mặc Định
                </button>
              )}
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  const updated = { ...formData, bgType: 'video' as const };
                  setFormData(updated);
                  onSaveSettings(updated);
                }}
                className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                  formData.bgType !== 'image'
                    ? 'bg-amber-500/20 border-amber-500 text-white shadow-sm'
                    : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/10'
                }`}
              >
                <div>Nền Video Động (Loop)</div>
                <div className="text-[10px] text-slate-400 font-normal">Chạy video điện ảnh mượt mà ngầm</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  const updated = { ...formData, bgType: 'image' as const };
                  setFormData(updated);
                  onSaveSettings(updated);
                }}
                className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                  formData.bgType === 'image'
                    ? 'bg-amber-500/20 border-amber-500 text-white shadow-sm'
                    : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/10'
                }`}
              >
                <div>Ảnh Tĩnh Cá Nhân</div>
                <div className="text-[10px] text-slate-400 font-normal">Tải ảnh .png / .jpg từ máy tính</div>
              </button>
            </div>

            {formData.bgType === 'image' && (
              <div className="space-y-3 pt-1 animate-fadeIn">
                {/* Upload & URL Input */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition shrink-0 shadow-sm">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{t.bgUpload}</span>
                    <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageUpload} className="hidden" />
                  </label>

                  <input
                    type="text"
                    value={formData.customBgImage || ''}
                    onChange={(e) => {
                      const updated: LauncherSettings = {
                        ...formData,
                        bgType: 'image',
                        customBgImage: e.target.value || undefined,
                      };
                      setFormData(updated);
                      onSaveSettings(updated);
                    }}
                    placeholder={t.bgUrlPlaceholder}
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white"
                  />
                </div>

                {/* Preset Wallpapers for Quick Selection */}
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 mb-2">Hình nền mẫu gợi ý:</div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        name: 'Hoàng Hôn Shaders',
                        url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1920&auto=format&fit=crop',
                      },
                      {
                        name: 'Rừng Khám Phá',
                        url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?q=80&w=1920&auto=format&fit=crop',
                      },
                      {
                        name: 'Không Gian Cyber',
                        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop',
                      },
                    ].map((preset) => {
                      const isSelected = formData.customBgImage === preset.url;
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            const updated: LauncherSettings = {
                              ...formData,
                              bgType: 'image',
                              customBgImage: preset.url,
                            };
                            setFormData(updated);
                            onSaveSettings(updated);
                          }}
                          className={`p-2 rounded-xl border text-left flex items-center gap-2 transition ${
                            isSelected
                              ? 'border-amber-500 bg-amber-500/20 text-white shadow-sm'
                              : 'border-white/5 bg-black/40 text-slate-400 hover:border-white/20'
                          }`}
                        >
                          <div
                            className="w-8 h-8 rounded-lg bg-cover bg-center shrink-0 border border-white/10"
                            style={{ backgroundImage: `url(${preset.url})` }}
                          />
                          <span className="text-[11px] font-medium truncate">{preset.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active Image Preview */}
                {formData.customBgImage && (
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/50 border border-white/5">
                    <img
                      src={formData.customBgImage}
                      alt="Preview"
                      className="w-14 h-9 object-cover rounded-lg border border-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-200">Ảnh đang áp dụng</div>
                      <div className="text-[10px] text-emerald-400 font-mono">Đã kích hoạt làm nền chính</div>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetBg}
                      className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
                    >
                      Gỡ ảnh
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Overlay Darkness Slider */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>{t.bgOpacity} (Độ tối lớp phủ):</span>
                <span className="font-mono text-slate-200">{Math.round((formData.bgOpacity || 0.55) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={formData.bgOpacity || 0.55}
                onChange={(e) => {
                  const updated = { ...formData, bgOpacity: parseFloat(e.target.value) };
                  setFormData(updated);
                  onSaveSettings(updated);
                }}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 2. Java Runtime */}
        <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <div>
                <h3 className="text-sm font-semibold text-white">{t.javaSection}</h3>
                <p className="text-[11px] text-slate-400">{t.javaDesc}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDetectJava}
              disabled={detectingJava}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${detectingJava ? 'animate-spin' : ''}`} />
              <span>{t.btnRescan}</span>
            </button>
          </div>

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

        {/* 3. Memory Allocation */}
        <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-3">
          <div className="flex items-center gap-2.5">
            <HardDrive className="w-4 h-4 text-indigo-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">{t.ramSection}</h3>
              <p className="text-[11px] text-slate-400">{t.ramDesc}</p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">RAM:</span>
              <span className="text-indigo-400 font-mono font-bold text-sm">
                {formData.defaultMaxRam / 1024} GB
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
          </div>
        </div>

        {/* 4. Default Server Host */}
        <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-3">
          <div className="flex items-center gap-2.5">
            <Server className="w-4 h-4 text-indigo-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">{t.serverSection}</h3>
              <p className="text-[11px] text-slate-400">{t.serverDesc}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] text-slate-400 mb-1">IP Host</label>
              <input
                type="text"
                value={formData.serverHost}
                onChange={(e) => setFormData({ ...formData, serverHost: e.target.value })}
                className="w-full glass-input px-3.5 py-2 rounded-xl text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Port</label>
              <input
                type="number"
                value={formData.serverPort}
                onChange={(e) => setFormData({ ...formData, serverPort: Number(e.target.value) })}
                className="w-full glass-input px-3.5 py-2 rounded-xl text-xs text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* 5. JVM Flags */}
        <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-2">
          <h3 className="text-sm font-semibold text-white">{t.jvmSection}</h3>
          <p className="text-[11px] text-slate-400">{t.jvmDesc}</p>
          <textarea
            rows={2}
            value={formData.defaultJvmArgs}
            onChange={(e) => setFormData({ ...formData, defaultJvmArgs: e.target.value })}
            className="w-full glass-input p-2.5 rounded-xl text-xs font-mono text-slate-300 resize-none"
          />
        </div>
      </div>
    </div>
  );
};
