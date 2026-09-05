import React, { useEffect, useRef } from 'react';
import { X, Terminal, Copy, Trash2, Check } from 'lucide-react';

interface ConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: string[];
  onClearLogs: () => void;
}

export const ConsoleModal: React.FC<ConsoleModalProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
}) => {
  const [copied, setCopied] = React.useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(logs.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fadeIn">
      <div className="w-full max-w-4xl h-[650px] glass-panel rounded-2xl border border-white/[0.06] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between bg-[#070b13]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-mono font-bold text-white">Minecraft Game Console Logs</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Live Stream
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              title="Sao chép toàn bộ logs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClearLogs}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              title="Xóa màn hình"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Console output */}
        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-slate-300 space-y-1 bg-[#06080e] select-text">
          {logs.length === 0 ? (
            <div className="text-slate-600 italic">Chưa có log nào... Sẵn sàng nhận sự kiện khi khởi chạy game.</div>
          ) : (
            logs.map((log, idx) => {
              const isError = log.includes('ERROR') || log.includes('Exception') || log.includes('Caused by:');
              const isWarn = log.includes('WARN');
              const isInfo = log.includes('INFO');

              return (
                <div
                  key={idx}
                  className={`leading-relaxed break-all ${
                    isError
                      ? 'text-red-400 bg-red-950/20 px-1 rounded'
                      : isWarn
                      ? 'text-amber-300'
                      : isInfo
                      ? 'text-slate-300'
                      : 'text-slate-400'
                  }`}
                >
                  {log}
                </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>
      </div>
    </div>
  );
};
