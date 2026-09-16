import React, { useRef, useState } from 'react';
import { 
  Upload, 
  Camera, 
  CheckCircle2, 
  ArrowRight, 
  FileCheck, 
  Sparkles,
  RefreshCw,
  Scan
} from 'lucide-react';
import { motion } from 'framer-motion';
import WebcamModal from './WebcamModal';

export default function Step1Upload({
  labelImage,
  onUploadLabel,
  onLoadSample,
  onRunAudit,
  isScanning,
  scanProgress,
  scanStatusText
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

  // Staggered entrance animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: -12, transition: { duration: 0.25 } }}
      className="flex flex-col gap-6 max-w-4xl mx-auto w-full"
    >
      
      {/* Top Demo Bar: 3 Clean, Compact Presets */}
      <motion.div 
        variants={itemVariants}
        className="bg-slate-900/80 backdrop-blur-md border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-[0_0_25px_rgba(6,182,212,0.05)] transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Live Hackathon Benchmark
            </span>
            <span className="text-[10px] bg-cyan-950/90 text-cyan-300 font-bold px-2.5 py-0.5 rounded-md border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.15)]">
              Instant PCR 2011 Test Packs
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Choose a quick test sample or upload a rear statutory packaging label below:
          </p>
        </div>

        {/* 3 Compact Preset Pills with Tactile Micro-Interactions */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* 1. Compliant Label */}
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => onLoadSample('compliant')}
            className="flex-1 md:flex-none px-3.5 py-2 rounded-xl text-xs font-bold border border-emerald-500/50 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(16,185,129,0.15)] hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] cursor-pointer"
            title="NutriGold 200g - All 5 mandatory PCR rules pass"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>🟢 Compliant Label</span>
            <span className="bg-emerald-500 text-slate-950 text-[10px] px-1.5 py-0.5 rounded-md font-black">
              5/5 PASS
            </span>
          </motion.button>

          {/* 2. Mislabeled Pack */}
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => onLoadSample('mislabeled')}
            className="flex-1 md:flex-none px-3.5 py-2 rounded-xl text-xs font-bold border border-amber-500/50 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(245,158,11,0.15)] hover:shadow-[0_0_20px_rgba(245,158,11,0.35)] cursor-pointer"
            title="CrunchMax - Missing taxes & non-standard unit"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>🟡 Mislabeled Pack</span>
            <span className="bg-amber-500 text-slate-950 text-[10px] px-1.5 py-0.5 rounded-md font-black">
              DEFECTS
            </span>
          </motion.button>

          {/* 3. Tampered Pack */}
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => onLoadSample('tampered')}
            className="flex-1 md:flex-none px-3.5 py-2 rounded-xl text-xs font-bold border border-rose-500/60 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(239,68,68,0.2)] hover:shadow-[0_0_22px_rgba(239,68,68,0.4)] cursor-pointer"
            title="Royal Chai - ₹120 printed covered with ₹150 sticker + 30g short weight"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span>🔴 Tampered Pack</span>
            <span className="bg-rose-500 text-slate-950 text-[10px] px-1.5 py-0.5 rounded-md font-black">
              RULE 18(2)
            </span>
          </motion.button>
        </div>
      </motion.div>

      {/* SINGLE STATUTORY LABEL INGESTION CARD */}
      <motion.div 
        variants={itemVariants}
        whileHover={{ y: -3 }}
        transition={{ duration: 0.3 }}
        className="bg-slate-900/80 backdrop-blur-md border border-slate-800/90 hover:border-cyan-500/50 rounded-2xl p-6 sm:p-8 shadow-[0_0_30px_rgba(6,182,212,0.06)] hover:shadow-[0_0_40px_rgba(6,182,212,0.18)] transition-all duration-300 flex flex-col gap-5 group hover-sheen"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 flex items-center justify-center font-black text-sm shadow-[0_0_15px_rgba(6,182,212,0.4)] shrink-0 group-hover:scale-105 transition-transform duration-300">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                <span>Scan Packaging Statutory Label</span>
                <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-extrabold px-2 py-0.5 rounded shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                  MANDATORY DECLARATIONS
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Drag & drop packet rear label or snap using webcam (MRP, Net Qty, Dates, Address & Helpline)
              </p>
            </div>
          </div>

          {labelImage && (
            <motion.span 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-[11px] font-extrabold text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-lg border border-emerald-500/50 flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.25)] self-start sm:self-auto"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> READY FOR INSPECTION
            </motion.span>
          )}
        </div>

        {/* Central Dropzone / Image Preview Area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-800 group-hover:border-cyan-500/70 rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[280px] sm:min-h-[320px] bg-slate-950/60 group-hover:bg-cyan-950/20 relative overflow-hidden group/drop"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {labelImage ? (
            <div className="relative w-full h-64 sm:h-72 flex items-center justify-center">
              <motion.img
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={labelImage}
                alt="Packaging Statutory Label"
                className="max-h-full max-w-full object-contain rounded-xl shadow-xl border border-slate-800 transition-transform duration-300 group-hover/drop:scale-[1.01]"
              />
              <div className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover/drop:opacity-100 transition-opacity duration-200 flex items-center justify-center text-cyan-300 text-xs font-bold rounded-xl backdrop-blur-xs">
                Click or drop to replace packaging photo
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-slate-500 py-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/50 shadow-md group-hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all duration-300">
                <Upload className="w-7 h-7" />
              </div>
              <div className="text-sm font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                Drop Packaging Statutory Rear/Side Label Here
              </div>
              <span className="text-xs text-slate-500">Supports PNG, JPG, WebP high-resolution packaging captures</span>
            </div>
          )}
        </div>

        {/* Dropzone Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsWebcamOpen(true);
            }}
            className="px-4 py-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 hover:border-cyan-500/40 text-xs font-semibold text-slate-200 flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all duration-200"
          >
            <Camera className="w-4 h-4 text-cyan-400" />
            <span>Snap with Webcam</span>
          </motion.button>

          {labelImage && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUploadLabel(null, '');
              }}
              className="text-xs text-rose-400 hover:text-rose-300 hover:underline cursor-pointer font-semibold transition-colors"
            >
              Clear Image
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* HIGH-END FUTURISTIC SCANNER LOADER */}
      {isScanning && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="bg-slate-900/95 backdrop-blur-xl border border-cyan-500/60 text-white rounded-2xl p-5 shadow-[0_0_40px_rgba(6,182,212,0.3)] flex flex-col gap-3 relative overflow-hidden"
        >
          {/* Decorative scanner laser beam sweeping horizontally */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent pointer-events-none animate-pulse" />

          <div className="flex items-center justify-between text-xs font-bold relative z-10">
            <div className="flex items-center gap-3">
              <div className="relative flex h-4 w-4 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400 shadow-[0_0_10px_#06b6d4]"></span>
              </div>
              <div className="flex flex-col">
                <span className="text-cyan-200 text-xs font-black tracking-wide">
                  {scanStatusText || 'Tesseract.js WebAssembly OCR Engine Active...'}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  PCR 2011 Rule Verification Pipeline • Singleton Worker
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                AI SCANNING
              </span>
              <span className="font-mono text-base font-black text-cyan-300">
                {scanProgress}%
              </span>
            </div>
          </div>

          {/* Eased Glowing Multi-Step Progress Track */}
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800 relative z-10 shadow-inner">
            <motion.div
              className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 h-full rounded-full shadow-[0_0_15px_#06b6d4] relative"
              initial={{ width: '6%' }}
              animate={{ width: `${Math.max(6, scanProgress)}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full shadow-[0_0_8px_#ffffff] animate-pulse"></div>
            </motion.div>
          </div>

          {/* Dynamic Telemetry Status Badges */}
          <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 pt-0.5 relative z-10">
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>WASM Tesseract 7.0</span>
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-300">Rule 18(2) Heuristic Scanner</span>
            <span className="text-slate-500">|</span>
            <span className="text-indigo-300">Section 39 MPE Gauge</span>
          </div>
        </motion.div>
      )}

      {/* PRIMARY CTA BAR WITH SHIMMER BUTTON */}
      <motion.div 
        variants={itemVariants}
        className="bg-slate-900/80 backdrop-blur-md border border-slate-800/90 rounded-2xl p-5 shadow-[0_0_25px_rgba(6,182,212,0.05)] hover:border-slate-700/80 transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.15)]">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <span>
            {canProceed 
              ? 'Statutory label loaded. Ready to run client-side OCR, Rule 18(2) tamper detection, and MPE scale audit.'
              : 'Please drop a statutory rear label or select one of the 3 hackathon benchmark presets above.'
            }
          </span>
        </div>

        <motion.button
          whileHover={canProceed && !isScanning ? { scale: 1.03, y: -1 } : {}}
          whileTap={canProceed && !isScanning ? { scale: 0.96 } : {}}
          type="button"
          disabled={!canProceed || isScanning}
          onClick={onRunAudit}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl btn-cyan-shimmer disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              <span>Auditing Declarations ({scanProgress}%)...</span>
            </>
          ) : (
            <>
              <FileCheck className="w-4 h-4 stroke-[2.5] text-slate-950" />
              <span>Run Forensic Inspection ➔</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5] text-slate-950" />
            </>
          )}
        </motion.button>
      </motion.div>

      {/* WEBCAM MODAL */}
      <WebcamModal
        isOpen={isWebcamOpen}
        onClose={() => setIsWebcamOpen(false)}
        onCapture={handleWebcamCapture}
      />

    </motion.div>
  );
}

