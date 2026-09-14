import React from 'react';
import { Upload, CheckCircle2, FileText, ChevronRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StepIndicator({ currentStep, onStepClick, hasScanned }) {
  const steps = [
    {
      id: 1,
      title: 'Step 1: Upload Packaging',
      desc: 'Statutory label capture & presets',
      icon: Upload
    },
    {
      id: 2,
      title: 'Step 2: Compliance Inspection',
      desc: 'Visual workstation & PCR audit',
      icon: CheckCircle2
    },
    {
      id: 3,
      title: 'Step 3: Legal Notice / Challan',
      desc: 'Section 18 & 36 statutory order',
      icon: FileText
    }
  ];

  // Calculate progress percentage for connector bar
  const progressPercent = currentStep === 1 ? 16 : currentStep === 2 ? 66 : 100;

  return (
    <div className="relative bg-slate-900/80 backdrop-blur-md border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-[0_0_25px_rgba(6,182,212,0.05)] transition-all">
      
      {/* Background connecting progress track for desktop */}
      <div className="hidden sm:block absolute top-[38px] left-12 right-12 h-1 bg-slate-800 rounded-full z-0 overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full shadow-[0_0_12px_#06b6d4]"
          initial={{ width: '16%' }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3">
        {steps.map((step, idx) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const canClick = (step.id === 1) || (step.id === 2 && hasScanned) || (step.id === 3 && hasScanned);
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              <motion.button
                type="button"
                whileHover={canClick ? { scale: 1.02 } : {}}
                whileTap={canClick ? { scale: 0.98 } : {}}
                disabled={!canClick}
                onClick={() => canClick && onStepClick(step.id)}
                className={`flex-1 flex items-center gap-3.5 p-3 rounded-xl text-left transition-all w-full sm:w-auto relative ${
                  isActive
                    ? 'bg-slate-800/90 border border-cyan-500/70 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                    : isCompleted
                    ? 'bg-slate-900/60 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 cursor-pointer'
                    : 'bg-slate-950/40 border border-slate-900/60 opacity-50 cursor-not-allowed'
                }`}
              >
                {/* Step Circle with Active Pulsing Ring */}
                <div className="relative shrink-0">
                  {isActive && (
                    <span className="absolute -inset-1 rounded-xl bg-cyan-400/30 animate-ping opacity-75"></span>
                  )}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-all relative ${
                      isActive
                        ? 'bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                        : isCompleted
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 stroke-[3]" />
                    ) : (
                      <Icon className={`w-5 h-5 ${isActive ? 'text-slate-950' : 'text-slate-500'}`} />
                    )}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      STEP {step.id}
                    </span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#06b6d4]"></span>
                    )}
                  </div>
                  <div
                    className={`text-xs font-bold leading-tight truncate mt-0.5 ${
                      isActive ? 'text-cyan-300 font-black' : isCompleted ? 'text-slate-200' : 'text-slate-500'
                    }`}
                  >
                    {step.title.replace(/^Step \d+:\s*/, '')}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {step.desc}
                  </div>
                </div>
              </motion.button>

              {idx < steps.length - 1 && (
                <div className="hidden sm:flex text-slate-700">
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
