import React, { useState } from 'react';
import { Copy, Check, Terminal, X } from 'lucide-react';

export default function RawTextDrawer({ 
  isOpen = false, 
  onClose, 
  rawText = '', 
  confidence = 0, 
  isScanning = false 
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;
  const lineCount = rawText.trim() ? rawText.split('\n').length : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.15)] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Raw OCR Stream & Tesseract Logs
            </span>
            {confidence > 0 && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                {confidence}% Confidence
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-3">
          {/* Metrics bar */}
          <div className="flex flex-wrap items-center justify-between pb-2 border-b border-slate-800 text-xs text-slate-400 gap-2 font-mono text-[11px]">
            <div className="flex items-center gap-4">
              <span>Words: <strong className="text-slate-200">{wordCount}</strong></span>
              <span>Lines: <strong className="text-slate-200">{lineCount}</strong></span>
              <span>Chars: <strong className="text-slate-200">{rawText.length}</strong></span>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!rawText.trim()}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy OCR String</span>
                </>
              )}
            </button>
          </div>

          {/* Raw Text Box */}
          <div className="mt-1">
            {isScanning ? (
              <div className="py-12 text-center text-xs text-cyan-400 flex flex-col items-center justify-center gap-2 font-mono">
                <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></span>
                <span>Streaming tokens from WebAssembly Tesseract core...</span>
              </div>
            ) : rawText.trim() ? (
              <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap max-h-80 overflow-y-auto p-3.5 bg-slate-950 rounded-xl border border-slate-800 leading-relaxed select-text">
                {rawText}
              </pre>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500 font-mono">
                No OCR string captured yet. Upload a label or select a demo sample to trigger OCR.
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-1">
            <span>Tesseract.js v5 LSTM Core</span>
            <span>Character Conf: {confidence}%</span>
          </div>
        </div>

      </div>
    </div>
  );
}
