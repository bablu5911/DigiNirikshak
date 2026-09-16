import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  User, 
  ChevronDown, 
  Check, 
  FileText, 
  Scale, 
  HeartHandshake,
  BadgeAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeaderProfile({
  userRole = 'officer',
  onRoleChange,
  officerProfile = {
    name: 'Insp. Rajesh Kumar',
    badge: '#DOCA-8941',
    jurisdiction: 'Regional Directorate (Zone 4)',
    accessLevel: 'Authorized Legal Metrology Officer (PCR 2011)'
  },
  citizenProfile = {
    name: 'Jaya M. (Consumer)',
    badge: 'NCH-CITIZEN-9428',
    jurisdiction: 'Citizen Redressal Portal | NCH Integrated',
    accessLevel: 'Verified Citizen Consumer (NCH 1915)'
  }
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isOfficer = userRole === 'officer';
  const currentProfile = isOfficer ? officerProfile : citizenProfile;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectRole = (role) => {
    onRoleChange(role);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* Interactive Identity Chip (Light Theme) */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-2.5 cursor-pointer text-left shadow-xs ${
          isOfficer
            ? 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-300 text-emerald-950 shadow-[0_2px_8px_rgba(16,185,129,0.15)]'
            : 'bg-blue-50 hover:bg-blue-100/80 border-blue-300 text-blue-950 shadow-[0_2px_8px_rgba(37,99,235,0.15)]'
        }`}
        title="Click to Switch User Role (Officer / Citizen)"
      >
        {/* Avatar Icon with Pulsing Indicator */}
        <div className="relative">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shadow-2xs ${
            isOfficer
              ? 'bg-emerald-600 text-white border-emerald-500'
              : 'bg-blue-600 text-white border-blue-500'
          }`}>
            {isOfficer ? (
              <ShieldCheck className="w-4 h-4 text-white stroke-[2.5]" />
            ) : (
              <User className="w-4 h-4 text-white stroke-[2.5]" />
            )}
          </div>
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isOfficer ? 'bg-emerald-500' : 'bg-blue-500'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isOfficer ? 'bg-emerald-500' : 'bg-blue-500'
            }`}></span>
          </span>
        </div>

        {/* Text Metadata */}
        <div className="hidden sm:flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-slate-900 tracking-tight">
              {currentProfile.name}
            </span>
            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
              isOfficer 
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                : 'bg-blue-100 text-blue-800 border-blue-300'
            }`}>
              {isOfficer ? 'OFFICER' : 'CITIZEN'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 truncate max-w-[200px]">
            {isOfficer ? 'Insp. Rajesh Kumar ⇄ Jaya M.' : 'Jaya M. ⇄ Insp. Rajesh Kumar'}
          </span>
        </div>

        {/* Animated Chevron */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-500 ml-0.5"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.button>

      {/* Glassmorphic Role Switcher Dropdown (Light Theme) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-92 bg-white/98 backdrop-blur-xl border border-slate-200 rounded-2xl p-3 shadow-[0_12px_40px_rgba(15,23,42,0.12)] z-50 flex flex-col gap-2 font-sans"
          >
            {/* Header info & GovTech Telemetry Ticker */}
            <div className="px-2 py-1 border-b border-slate-100 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-slate-500">
                  1-Click Role Switcher
                </span>
                <span className="text-[9px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  SIH26034 Mode
                </span>
              </div>
              <div className="font-mono text-[9px] text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-200 flex items-center justify-between">
                <span className="text-emerald-700 font-bold">[ 🟢 WASM-OCR v7</span>
                <span className="text-slate-400">|</span>
                <span className="text-blue-700 font-bold">PCR-2011 SCHED-I</span>
                <span className="text-slate-400">|</span>
                <span className="text-indigo-700 font-bold">DOCA-HQ ]</span>
              </div>
            </div>

            {/* Option 1: Enforcement Officer Mode */}
            <button
              type="button"
              onClick={() => handleSelectRole('officer')}
              className={`w-full p-3 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                isOfficer
                  ? 'bg-emerald-50/90 border-emerald-300 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <span>Enforcement Officer (DoCA)</span>
                    {isOfficer && <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">
                    PCR 2011
                  </span>
                </div>
                <div className="text-[11px] font-bold text-emerald-800 mt-0.5">
                  {officerProfile.name}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {officerProfile.badge} • {officerProfile.jurisdiction}
                </div>
                <div className="text-[10px] text-slate-600 mt-1">
                  Enforces Rule 18(2) tamper prosecution, Section 39 short-weight penalties, and generates statutory Form VI Inspection Orders.
                </div>
              </div>
            </button>

            {/* Option 2: Consumer / Citizen Mode */}
            <button
              type="button"
              onClick={() => handleSelectRole('citizen')}
              className={`w-full p-3 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                !isOfficer
                  ? 'bg-blue-50/90 border-blue-300 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <HeartHandshake className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <span>Consumer / Citizen Mode</span>
                    {!isOfficer && <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-blue-800 bg-blue-100 px-1.5 py-0.2 rounded border border-blue-300">
                    NCH 1915
                  </span>
                </div>
                <div className="text-[11px] font-bold text-blue-800 mt-0.5">
                  {citizenProfile.name}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {citizenProfile.badge} • {citizenProfile.jurisdiction}
                </div>
                <div className="text-[10px] text-slate-600 mt-1">
                  Verifies consumer rights under Consumer Protection Act 2019, detects unfair trade practices, and drafts National Consumer Helpline petitions.
                </div>
              </div>
            </button>

            {/* Quick Session Note */}
            <div className="px-2.5 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
              <span>National Consumer Redressal Grid</span>
              <span className="font-mono font-bold text-slate-700">ACTIVE</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
