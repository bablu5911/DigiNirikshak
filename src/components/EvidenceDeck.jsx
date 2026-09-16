import React, { useRef, useState } from 'react';
import { 
  Upload, 
  Camera, 
  Crop, 
  RotateCcw, 
  Sparkles, 
  Scan, 
  CheckCircle2, 
  FileCheck, 
  AlertTriangle,
  RefreshCw,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageCanvas from './ImageCanvas';
import WebcamModal from './WebcamModal';

export default function EvidenceDeck({
  labelImage,
  onUploadLabel,
  onLoadSample,
  onRunAudit,
  isScanning,
  scanProgress,
  scanStatusText,
  rules = [],
  hoveredRuleId = null,
  tamperResult = null,
  onCropAndRescan,
  onResetView,
  sampleMeta = {}
}) {
  const fileInputRef = useRef(null);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        onUploadLabel(event.target.result, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      onUploadLabel(event.target.result, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleWebcamCapture = (dataUrl) => {
    onUploadLabel(dataUrl, 'Webcam_Statutory_Capture.jpg');
    setIsWebcamOpen(false);
  };

  const canProceed = Boolean(labelImage);

  return (
    <div className="cyber-card rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden">
      
      {/* Deck Header (Light Theme) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-xs">
            <Scan className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <span>Evidence Ingestion Bay</span>
              <span className="text-[9px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.2 rounded">
                ZONE 01
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Statutory rear label captures & OCR target visualizer
            </p>
          </div>
        </div>

        {labelImage && (
          <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-lg border border-emerald-300 flex items-center gap-1.5 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>IMAGE CACHED</span>
          </span>
        )}
      </div>

      {/* 3 Benchmark Quick-Load Presets */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-500 font-bold">
          <span>Live Hackathon Benchmarks</span>
          <span className="text-blue-600">1-Click Auto-Audit</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Preset 1 */}
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => onLoadSample('compliant')}
            className="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50/90 hover:bg-emerald-100 text-left transition-all flex flex-col gap-1 cursor-pointer shadow-xs hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>NutriGold</span>
              </span>
              <span className="text-[9px] font-black bg-emerald-600 text-white px-1.5 py-0.2 rounded font-mono">
                PASS
              </span>
            </div>
            <div className="text-[10px] text-emerald-800 font-mono">
              200g • All 5 rules pass
            </div>
          </motion.button>

          {/* Preset 2 */}
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => onLoadSample('mislabeled')}
            className="p-2.5 rounded-xl border border-amber-300 bg-amber-50/90 hover:bg-amber-100 text-left transition-all flex flex-col gap-1 cursor-pointer shadow-xs hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>CrunchMax</span>
              </span>
              <span className="text-[9px] font-black bg-amber-600 text-white px-1.5 py-0.2 rounded font-mono">
                DEFECTS
              </span>
            </div>
            <div className="text-[10px] text-amber-800 font-mono">
              75g • Missing taxes & unit
            </div>
          </motion.button>

          {/* Preset 3 */}
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => onLoadSample('tampered')}
            className="p-2.5 rounded-xl border border-rose-300 bg-rose-50/90 hover:bg-rose-100 text-left transition-all flex flex-col gap-1 cursor-pointer shadow-xs hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-rose-950 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <span>Royal Chai</span>
              </span>
              <span className="text-[9px] font-black bg-rose-600 text-white px-1.5 py-0.2 rounded font-mono">
                TAMPER
              </span>
            </div>
            <div className="text-[10px] text-rose-800 font-mono">
              Rule 18(2) sticker + short-wt
            </div>
          </motion.button>
        </div>
      </div>

      {/* Main Viewport or Dragzone */}
      <div className="flex-1 min-h-[320px] flex flex-col">
        {labelImage ? (
          <div className="flex-1 flex flex-col gap-2">
            <ImageCanvas
              imageSrc={labelImage}
              isScanning={isScanning}
              onCropAndRescan={onCropAndRescan}
              onResetView={onResetView}
              rules={rules}
              hoveredRuleId={hoveredRuleId}
              tamperResult={tamperResult}
            />
          </div>
        ) : (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[280px] bg-slate-50/80 hover:bg-blue-50/40 relative group shadow-inner"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-blue-600 group-hover:border-blue-300 shadow-sm transition-all duration-300 mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <div className="text-sm font-black text-slate-800 group-hover:text-blue-700 transition-colors">
              Drop Packaging Photo Here
            </div>
            <span className="text-xs text-slate-500 mt-1">Supports PNG, JPG, WebP high-resolution packaging</span>
          </div>
        )}
      </div>

      {/* Ingestion Actions & Webcam Trigger */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => setIsWebcamOpen(true)}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer shadow-xs transition-all"
          >
            <Camera className="w-3.5 h-3.5 text-blue-600" />
            <span>Webcam Snap</span>
          </motion.button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer shadow-xs transition-all"
          >
            Browse File
          </button>
        </div>

        {labelImage && (
          <button
            type="button"
            onClick={() => onUploadLabel(null, '')}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Scanner HUD Pill when scanning (Light Theme) */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-xl bg-white/95 border border-blue-300 shadow-[0_8px_30px_rgba(37,99,235,0.15)] flex flex-col gap-2 relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-2 text-blue-800">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                <span>{scanStatusText || 'Tesseract.js OCR Pipeline Active...'}</span>
              </span>
              <span className="font-mono text-blue-700 font-bold">{scanProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <motion.div
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 h-full rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                animate={{ width: `${Math.max(8, scanProgress)}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Webcam Modal */}
      <WebcamModal
        isOpen={isWebcamOpen}
        onClose={() => setIsWebcamOpen(false)}
        onCapture={handleWebcamCapture}
      />

    </div>
  );
}
