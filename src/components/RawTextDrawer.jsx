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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Raw OCR Stream & Tesseract Logs
            </span>
            {confidence > 0 && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {confidence}% Confidence
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-3">
          {/* Metrics bar */}
          <div className="flex flex-wrap items-center justify-between pb-2 border-b border-slate-200 text-slate-500 gap-2 font-mono text-[11px]">
            <div className="flex items-center gap-4">
              <span>Words: <strong className="text-slate-800">{wordCount}</strong></span>
              <span>Lines: <strong className="text-slate-800">{lineCount}</strong></span>
              <span>Chars: <strong className="text-slate-800">{rawText.length}</strong></span>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!rawText.trim()}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span className="text-emerald-700 font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-blue-600" />
                  <span>Copy OCR String</span>
                </>
              )}
            </button>
          </div>

          {/* Raw Text Box */}
          <div className="mt-1">
            {isScanning ? (
              <div className="py-12 text-center text-xs text-blue-600 flex flex-col items-center justify-center gap-2 font-mono">
                <span className="w-3 h-3 rounded-full bg-blue-600 animate-ping"></span>
                <span>Streaming tokens from WebAssembly Tesseract core...</span>
              </div>
            ) : rawText.trim() ? (
              <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap max-h-80 overflow-y-auto p-3.5 bg-slate-50 rounded-xl border border-slate-200 leading-relaxed select-text shadow-inner">
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
