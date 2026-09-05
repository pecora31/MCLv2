import React, { useState, useEffect } from 'react';
import { X, Layers, Sparkles, Check, ChevronDown, ShieldCheck, AlertCircle } from 'lucide-react';
import type { ModLoader, GameInstance, VersionItem } from '../../types';
import { fetchMojangVersions, fetchFabricVersions, fetchQuiltVersions } from '../../services/api';

interface CreateInstanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (instance: Partial<GameInstance>) => void;
}

export const CreateInstanceModal: React.FC<CreateInstanceModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [gameVersion, setGameVersion] = useState('1.21.4');
  const [loader, setLoader] = useState<ModLoader>('fabric');
  const [loaderVersion, setLoaderVersion] = useState('0.16.10');
  const [minRam, setMinRam] = useState(2048);
  const [maxRam, setMaxRam] = useState(4096);
  const [enableSkinInGame, setEnableSkinInGame] = useState(true);

  const [versionList, setVersionList] = useState<VersionItem[]>([]);
  const [loaderVersions, setLoaderVersions] = useState<string[]>([]);
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [loadingVersions, setLoadingVersions] = useState(false);

  // Load Mojang versions
  useEffect(() => {
    if (!isOpen) return;
    const loadVersions = async () => {
      setLoadingVersions(true);
      try {
        const data = await fetchMojangVersions();
        setVersionList(data.versions);
        if (data.latest?.release) {
          setGameVersion(data.latest.release);
          setName(`Minecraft ${data.latest.release}`);
        }
      } catch (err) {
        console.error('Failed to fetch versions:', err);
      } finally {
        setLoadingVersions(false);
      }
    };
    loadVersions();
  }, [isOpen]);

  // Load Loader versions when game version or loader changes
  useEffect(() => {
    if (!isOpen) return;
    const loadLoaders = async () => {
      if (loader === 'fabric') {
        const versions = await fetchFabricVersions(gameVersion);
        setLoaderVersions(versions);
        if (versions.length > 0) setLoaderVersion(versions[0]);
      } else if (loader === 'quilt') {
        const versions = await fetchQuiltVersions(gameVersion);
        setLoaderVersions(versions);
        if (versions.length > 0) setLoaderVersion(versions[0]);
      } else if (loader === 'forge') {
        setLoaderVersions(['47.3.0 (Recommended)', '47.2.0']);
        setLoaderVersion('47.3.0');
      } else if (loader === 'neoforge') {
        setLoaderVersions(['21.1.84 (Latest)', '21.1.70']);
        setLoaderVersion('21.1.84');
      }
    };
    loadLoaders();
  }, [isOpen, gameVersion, loader]);

  // Auto-name instance when version changes
  const handleVersionChange = (newVer: string) => {
    setGameVersion(newVer);
    setName(`Minecraft ${newVer} ${loader !== 'vanilla' ? `(${loader.toUpperCase()})` : ''}`.trim());
  };

  const handleLoaderChange = (newLoader: ModLoader) => {
    setLoader(newLoader);
    setName(`Minecraft ${gameVersion} ${newLoader !== 'vanilla' ? `(${newLoader.toUpperCase()})` : ''}`.trim());
  };

  // Determine recommended Java version
  const getRecommendedJava = () => {
    const parts = gameVersion.split('.').map(Number);
    const major = parts[0];
    const minor = parts[1] || 0;
    const patch = parts[2] || 0;

    if (minor >= 21 || (minor === 20 && patch >= 5)) return 'Java 21 LTS (Khuyên dùng)';
    if (minor >= 18) return 'Java 17 LTS (Khuyên dùng)';
    if (minor === 17) return 'Java 16';
    return 'Java 8 (Khuyên dùng)';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      name: name.trim() || `Minecraft ${gameVersion}`,
      gameVersion,
      loader,
      loaderVersion: loader !== 'vanilla' ? loaderVersion : undefined,
      minRam,
      maxRam,
      enableSkinInGame,
      icon: loader === 'fabric' ? 'fabric' : loader === 'forge' ? 'forge' : 'grass',
    });
    onClose();
  };

  if (!isOpen) return null;

  const filteredVersions = versionList.filter((v) => showSnapshots || v.type === 'release');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-['Outfit'] text-white">Tạo Profile / Phiên Bản Mới</h2>
              <p className="text-[11px] text-slate-400">Tùy chọn phiên bản game, mod loader và cấu hình RAM</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Instance Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Tên Profile (Instance)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Server Bạn Bè (1.21.4 Fabric)"
              required
              className="w-full glass-input px-3.5 py-2 rounded-xl text-sm text-white"
            />
          </div>

          {/* Minecraft Version Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Phiên Bản Minecraft
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSnapshots}
                  onChange={(e) => setShowSnapshots(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-0"
                />
                <span>Hiện Snapshot / Thử nghiệm</span>
              </label>
            </div>

            <div className="relative">
              <select
                value={gameVersion}
                onChange={(e) => handleVersionChange(e.target.value)}
                className="w-full appearance-none glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium text-white cursor-pointer pr-8"
              >
                {filteredVersions.length > 0 ? (
                  filteredVersions.map((v) => (
                    <option key={v.id} value={v.id} className="bg-slate-900 text-white">
                      Minecraft {v.id} {v.type === 'release' ? '(Chính thức)' : `(${v.type})`}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="1.21.4" className="bg-slate-900">Minecraft 1.21.4 (Chính thức)</option>
                    <option value="1.21.1" className="bg-slate-900">Minecraft 1.21.1 (Chính thức)</option>
                    <option value="1.20.1" className="bg-slate-900">Minecraft 1.20.1 (Chính thức)</option>
                    <option value="1.19.4" className="bg-slate-900">Minecraft 1.19.4 (Chính thức)</option>
                    <option value="1.16.5" className="bg-slate-900">Minecraft 1.16.5 (Chính thức)</option>
                  </>
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Mod Loader Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Chọn Mod Loader
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {(
                [
                  { id: 'fabric', label: 'Fabric', desc: 'Mượt, nhẹ' },
                  { id: 'forge', label: 'Forge', desc: 'Nhiều mod' },
                  { id: 'neoforge', label: 'NeoForge', desc: 'Hiện đại' },
                  { id: 'quilt', label: 'Quilt', desc: 'Kế thừa' },
                  { id: 'vanilla', label: 'Vanilla', desc: 'Gốc' },
                ] as const
              ).map((item) => {
                const isSelected = loader === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleLoaderChange(item.id)}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md'
                        : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-bold text-xs">{item.label}</span>
                    <span className="text-[10px] text-slate-400 opacity-80">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loader Version if not vanilla */}
          {loader !== 'vanilla' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Phiên Bản {loader.toUpperCase()} Loader
              </label>
              <select
                value={loaderVersion}
                onChange={(e) => setLoaderVersion(e.target.value)}
                className="w-full appearance-none glass-input px-3.5 py-2 rounded-xl text-xs text-white cursor-pointer"
              >
                {loaderVersions.map((ver) => (
                  <option key={ver} value={ver} className="bg-slate-900 text-white">
                    {ver}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* RAM Allocation Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-slate-300 uppercase tracking-wider">Cấp Phát RAM Tối Đa:</span>
              <span className="text-indigo-400 font-mono text-sm">{maxRam / 1024} GB RAM</span>
            </div>
            <input
              type="range"
              min="2048"
              max="16384"
              step="1024"
              value={maxRam}
              onChange={(e) => setMaxRam(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>2 GB</span>
              <span>4 GB (Tiêu chuẩn)</span>
              <span>8 GB (Nhiều mod)</span>
              <span>16 GB</span>
            </div>
          </div>

          {/* In-Game Skin Feature Toggle */}
          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">Tự động nạp Skin Đồng Đội (In-game)</div>
                <div className="text-[11px] text-slate-400">
                  Tự động tải CustomSkinLoader để bạn bè nhìn thấy skin của nhau
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={enableSkinInGame}
              onChange={(e) => setEnableSkinInGame(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-0 cursor-pointer"
            />
          </div>

          {/* Java Recommendation Pill */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400 px-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Tự động gán: <strong className="text-slate-200">{getRecommendedJava()}</strong></span>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-primary px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tạo Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
