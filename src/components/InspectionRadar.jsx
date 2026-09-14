import React from 'react';
import { ShieldAlert, ShieldCheck, CheckCircle2, Clock, AlertCircle, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InspectionRadar({ hasFront, hasBack }) {
  // Calculate coverage percentage
  let coverage = 0;
  let statusText = 'AWAITING EVIDENCE';
  let statusSubtext = 'Attach Front PDP and Rear Statutory panel for 100% statutory validation';

  if (hasFront && hasBack) {
    coverage = 100;
    statusText = 'DUAL-PANEL LOCKED';
    statusSubtext = 'Both panels acquired. Ready for OCR, MPE scale audit & tamper analysis';
  } else if (hasBack) {
    coverage = 50;
    statusText = 'STATUTORY PANEL LOCKED';
    statusSubtext = 'Mandatory declarations locked. Front PDP recommended for full cross-audit';
  } else if (hasFront) {
    coverage = 50;
    statusText = 'FRONT DISPLAY LOCKED';
    statusSubtext = 'Brand PDP acquired. Rear statutory declaration panel required for compliance';
  }

  // SVG circle calculations (radius = 38, circumference = 2 * PI * 38 ≈ 238.76)
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (coverage / 100) * circumference;

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-[0_0_25px_rgba(6,182,212,0.05)] flex flex-col md:flex-row items-center justify-between gap-5">
      
      {/* Left Circular HUD Progress Ring */}
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
            {/* Background Track */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="currentColor"
              strokeWidth="7"
              className="text-slate-800"
              fill="transparent"
            />
            {/* Animated Dynamic Progress Ring */}
            <motion.circle
              cx="48"
              cy="48"
              r={radius}
              stroke="currentColor"
              strokeWidth="7"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              strokeLinecap="round"
              className={
                coverage === 100 
                  ? 'text-emerald-400 drop-shadow-[0_0_8px_#10b981]' 
                  : coverage >= 50 
                  ? 'text-cyan-400 drop-shadow-[0_0_8px_#06b6d4]' 
                  : 'text-amber-400 drop-shadow-[0_0_8px_#f59e0b]'
              }
              fill="transparent"
            />
          </svg>

          {/* Center Percentage Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className={`text-xl font-black font-mono leading-none ${
              coverage === 100 ? 'text-emerald-400' : coverage >= 50 ? 'text-cyan-300' : 'text-slate-400'
            }`}>
              {coverage}%
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
              COVERAGE
            </span>
          </div>
        </div>

        {/* Narrative Status */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
              Coverage Radar
            </span>
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                coverage === 100
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                  : coverage >= 50
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                  : 'bg-amber-950/80 text-amber-300 border-amber-500/50'
              }`}
            >
              {statusText}
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-100 mt-1">
            {coverage === 100
              ? 'Complete Packaging Evidence Registered (Dual-Slot)'
              : coverage >= 50
              ? 'Partial Packaging Evidence Registered (Single-Slot)'
              : 'Awaiting Physical Packaging Capture'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 leading-snug">
            {statusSubtext}
          </p>
        </div>
      </div>

      {/* Right Panel Checklist Badges */}
      <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start md:justify-end">
        {/* Front Panel Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
            hasFront
              ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
              : 'bg-slate-900/80 border-slate-800 text-slate-500'
          }`}
        >
          {hasFront ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Clock className="w-3.5 h-3.5 text-slate-600" />
          )}
          <span>Front PDP Slot</span>
        </div>

        {/* Back Panel Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
            hasBack
              ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
              : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
          }`}
        >
          {hasBack ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          )}
          <span>Statutory Declarations Slot</span>
        </div>

        {/* Physical Scale Ready Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/50 border border-cyan-500/40 text-cyan-300 text-xs font-bold shadow-[0_0_8px_rgba(6,182,212,0.15)]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#06b6d4]"></span>
          <span>MPE Scale Audit Ready</span>
        </div>
      </div>

    </div>
  );
}
