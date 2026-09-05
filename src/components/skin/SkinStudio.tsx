import React, { useEffect, useRef, useState } from 'react';
import { Shirt, Upload, RefreshCw, UserCheck, ShieldCheck, Sparkles, Eye, Download, Info } from 'lucide-react';
import type { Account, GameInstance } from '../../types';

interface SkinStudioProps {
  account: Account;
  onUpdateSkin: (skinUrl: string, model: 'classic' | 'slim') => void;
  instances: GameInstance[];
}

export const SkinStudio: React.FC<SkinStudioProps> = ({ account, onUpdateSkin, instances }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewerRef = useRef<any>(null);

  const [currentSkin, setCurrentSkin] = useState<string>(
    account.skinUrl || 'https://textures.minecraft.net/texture/292009a4925b58f02c77d692f0085a5392652a6549aa018e69fa89e4ecbe5677'
  );
  const [modelType, setModelType] = useState<'classic' | 'slim'>(account.skinModel || 'classic');
  const [animationType, setAnimationType] = useState<'idle' | 'walk' | 'run'>('walk');
  const [searchUsername, setSearchUsername] = useState('');
  const [isFetchingSkin, setIsFetchingSkin] = useState(false);
  const [saveNotification, setSaveNotification] = useState(false);

  // Initialize skinview3d viewer
  useEffect(() => {
    let viewer: any = null;
    let isCancelled = false;

    const initViewer = async () => {
      if (!canvasRef.current) return;
      try {
        const skinview3d = await import('skinview3d');
        if (isCancelled) return;

        viewer = new skinview3d.SkinViewer({
          canvas: canvasRef.current,
          width: 320,
          height: 420,
          skin: currentSkin,
          model: modelType === 'slim' ? 'slim' : 'default',
        });

        viewer.controls.enableRotate = true;
        viewer.controls.enableZoom = true;
        viewer.controls.enablePan = false;

        // Apply initial animation
        applyAnimation(viewer, animationType, skinview3d);

        viewerRef.current = viewer;
      } catch (err) {
        console.warn('Failed to load skinview3d:', err);
      }
    };

    initViewer();

    return () => {
      isCancelled = true;
      if (viewer) {
        viewer.dispose();
      }
    };
  }, []);

  // Update skin or model when changed
  useEffect(() => {
    if (viewerRef.current) {
      viewerRef.current.loadSkin(currentSkin, {
        model: modelType === 'slim' ? 'slim' : 'default',
      });
    }
  }, [currentSkin, modelType]);

  // Update animation when selected
  const applyAnimation = async (viewer: any, anim: 'idle' | 'walk' | 'run', skinview3dModule?: any) => {
    if (!viewer) return;
    const skinview3d = skinview3dModule || (await import('skinview3d'));

    if (anim === 'walk') {
      viewer.animation = new skinview3d.WalkingAnimation();
      viewer.animation.speed = 0.8;
    } else if (anim === 'run') {
      viewer.animation = new skinview3d.RunningAnimation();
      viewer.animation.speed = 1.2;
    } else {
      viewer.animation = new skinview3d.IdleAnimation();
      viewer.animation.speed = 0.6;
    }
  };

  const handleAnimationChange = (anim: 'idle' | 'walk' | 'run') => {
    setAnimationType(anim);
    applyAnimation(viewerRef.current, anim);
  };

  // Upload local PNG
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'image/png') {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCurrentSkin(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Fetch skin from username (Mojang or Ely.by)
  const handleSearchSkin = async () => {
    if (!searchUsername.trim()) return;
    setIsFetchingSkin(true);
    try {
      // Try Ely.by first (great for offline players) or Minotar / Mojang
      const elyUrl = `https://skin.ely.by/skins/${encodeURIComponent(searchUsername.trim())}.png`;
      const mojangUrl = `https://minotar.net/skin/${encodeURIComponent(searchUsername.trim())}`;

      // Check if Ely.by exists
      const testImg = new Image();
      testImg.src = elyUrl;
      testImg.onload = () => {
        setCurrentSkin(elyUrl);
        setIsFetchingSkin(false);
      };
      testImg.onerror = () => {
        // Fallback to Mojang minotar
        setCurrentSkin(mojangUrl);
        setIsFetchingSkin(false);
      };
    } catch {
      setIsFetchingSkin(false);
    }
  };

  const handleApplySkin = () => {
    onUpdateSkin(currentSkin, modelType);
    setSaveNotification(true);
    setTimeout(() => setSaveNotification(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <Shirt className="w-3.5 h-3.5" />
            <span>3D Skin Studio & Đồng Bộ Nhóm</span>
          </div>
          <h1 className="text-2xl font-bold font-['Outfit'] text-white">
            Tuỳ Chỉnh & Xem Trước Skin 3D
          </h1>
          <p className="text-sm text-slate-400">
            Tự do xoay, chuyển động và lưu skin. Tính năng tự động hiển thị skin của nhau trong server kể cả khi không có nick bản quyền!
          </p>
        </div>

        <button
          onClick={handleApplySkin}
          className="btn-primary py-2.5 px-6 rounded-xl font-['Outfit'] font-bold text-sm flex items-center gap-2 shadow-lg shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Áp Dụng Cho Game</span>
        </button>
      </div>

      {saveNotification && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn">
          <ShieldCheck className="w-4 h-4" />
          <span>Đã lưu cấu hình Skin thành công! Skin sẽ tự động xuất hiện khi bạn vào game.</span>
        </div>
      )}

      {/* Main Grid: 3D Preview (Left) & Controls (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* 3D Canvas Box (5 cols) */}
        <div className="md:col-span-5 glass-panel rounded-2xl p-5 border border-white/5 flex flex-col items-center justify-between space-y-4 shadow-xl">
          <div className="w-full flex items-center justify-between text-xs text-slate-400 px-2">
            <span>Kéo chuột để xoay 360°</span>
            <span className="font-mono text-indigo-400">{modelType.toUpperCase()} MODEL</span>
          </div>

          {/* 3D Canvas */}
          <div className="relative w-[320px] h-[400px] flex items-center justify-center bg-slate-950/60 rounded-2xl border border-white/5 overflow-hidden shadow-inner">
            <canvas ref={canvasRef} className="cursor-grab active:cursor-grabbing w-full h-full" />
            <div className="absolute bottom-2 text-[10px] text-slate-500 pointer-events-none">
              Cuộn chuột để Phóng to / Thu nhỏ
            </div>
          </div>

          {/* Animation Bar */}
          <div className="w-full flex items-center justify-center gap-2 pt-2">
            {(['idle', 'walk', 'run'] as const).map((anim) => (
              <button
                key={anim}
                onClick={() => handleAnimationChange(anim)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  animationType === anim
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {anim === 'idle' ? 'Đứng Yên' : anim === 'walk' ? 'Đi Bộ' : 'Chạy'}
              </button>
            ))}
          </div>
        </div>

        {/* Controls & Options (7 cols) */}
        <div className="md:col-span-7 space-y-5">
          {/* Model Type Selector */}
          <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-3">
            <h3 className="text-sm font-semibold text-white">Kiểu Dáng Nhân Vật (Model)</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setModelType('classic')}
                className={`p-3 rounded-xl border text-left transition ${
                  modelType === 'classic'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/10'
                }`}
              >
                <div className="text-xs font-bold">Classic (Steve)</div>
                <div className="text-[11px] text-slate-400">Cánh tay chuẩn 4 pixel</div>
              </button>

              <button
                onClick={() => setModelType('slim')}
                className={`p-3 rounded-xl border text-left transition ${
                  modelType === 'slim'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/10'
                }`}
              >
                <div className="text-xs font-bold">Slim (Alex)</div>
                <div className="text-[11px] text-slate-400">Cánh tay thon gọn 3 pixel</div>
              </button>
            </div>
          </div>

          {/* Import / Upload Skin */}
          <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Nạp Skin Mới</h3>

            {/* Upload Local File */}
            <div>
              <label className="block text-xs text-slate-400 mb-2">Tải file từ máy tính (.PNG 64x64)</label>
              <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-white/20 hover:border-indigo-500/50 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition text-xs text-slate-300">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>Chọn file ảnh Skin .png từ máy tính</span>
                <input type="file" accept="image/png" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {/* Fetch by Username */}
            <div className="pt-2">
              <label className="block text-xs text-slate-400 mb-1.5">Hoặc lấy skin theo tên người chơi (Mojang / Ely.by)</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ví dụ: Dream, Technoblade, DanTDM..."
                  value={searchUsername}
                  onChange={(e) => setSearchUsername(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSkin()}
                  className="flex-1 glass-input px-3 py-2 rounded-xl text-xs text-white"
                />
                <button
                  onClick={handleSearchSkin}
                  disabled={isFetchingSkin}
                  className="btn-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isFetchingSkin ? 'animate-spin' : ''}`} />
                  <span>Tìm</span>
                </button>
              </div>
            </div>
          </div>

          {/* In-Game Team Skin Feature Explanation */}
          <div className="rounded-2xl p-4 bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border border-indigo-500/30 flex items-start gap-3.5 shadow-lg">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-xs">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>Cơ Chế "Nhìn Thấy Skin Của Nhau Trong Game"</span>
                <span className="px-1.5 py-0.5 text-[9px] rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  TỰ ĐỘNG KÍCH HOẠT
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Launcher đã được tích hợp sẵn <strong>CustomSkinLoader Client Module</strong>. Khi bạn và bạn bè chơi trên server nhóm, launcher sẽ tự động nạp skin của tất cả người chơi vào bộ nhớ game. Bạn bè của bạn sẽ nhìn thấy đúng hình ảnh skin này mà không bị lỗi biến thành Steve/Alex!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
