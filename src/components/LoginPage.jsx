import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  Lock, 
  BadgeCheck, 
  Building2, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  HeartHandshake,
  Zap,
  Globe,
  Mail
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage({ onLogin }) {
  const [activeTab, setActiveTab] = useState('officer'); // 'officer' | 'citizen'
  
  // Officer Form State
  const [officerBadge, setOfficerBadge] = useState('#DOCA-8941');
  const [officerName, setOfficerName] = useState('Insp. Rajesh Kumar');
  const [officerEmail, setOfficerEmail] = useState('rajesh.kumar@doca.gov.in');
  const [officerZone, setOfficerZone] = useState('Regional Directorate (Zone 4)');
  const [officerPin, setOfficerPin] = useState('8941');

  // Citizen Form State
  const [citizenName, setCitizenName] = useState('Jaya M.');
  const [citizenEmail, setCitizenEmail] = useState('jaya.menaria@gmail.com');
  const [citizenPhone, setCitizenPhone] = useState('+91 98765 43210');
  const [citizenCity, setCitizenCity] = useState('New Delhi (NCR)');

  const handleOfficerSubmit = (e) => {
    e?.preventDefault();
    onLogin({
      role: 'officer',
      name: officerName || 'Insp. Rajesh Kumar',
      email: officerEmail || 'rajesh.kumar@doca.gov.in',
      badge: officerBadge || '#DOCA-8941',
      jurisdiction: officerZone || 'Regional Directorate (Zone 4)',
      accessLevel: 'Authorized Legal Metrology Officer (PCR 2011)',
      refPrefix: 'INSP/LM/' + new Date().getFullYear() + '/8941'
    });
  };

  const handleCitizenSubmit = (e) => {
    e?.preventDefault();
    onLogin({
      role: 'citizen',
      name: citizenName || 'Jaya M. (Consumer)',
      email: citizenEmail || 'jaya.menaria@gmail.com',
      badge: 'NCH-CITIZEN-9428',
      jurisdiction: 'Citizen Redressal Portal | NCH Integrated',
      accessLevel: 'Verified Citizen Consumer (NCH 1915)',
      refPrefix: 'NCH/GRV/' + new Date().getFullYear() + '/9428'
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans cyber-scanline">
      
      {/* Parallax Blueprint Grid Overlay (Light) */}
      <div className="fixed inset-0 bg-blueprint-dots opacity-60 pointer-events-none z-0"></div>

      {/* Atmospheric Ambient Glow Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none z-0 animate-float-slow"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[650px] h-[650px] bg-indigo-500/08 rounded-full blur-3xl pointer-events-none z-0 animate-float-reverse"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg z-10 flex flex-col gap-6"
      >
        
        {/* National Portal Brand Banner */}
        <div className="text-center flex flex-col items-center gap-2">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center text-white font-black shadow-[0_8px_25px_rgba(37,99,235,0.35)] text-3xl mb-1 cursor-pointer"
          >
            ⚖️
          </motion.div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-blue-700 bg-blue-50 px-3 py-0.5 rounded-full border border-blue-200 shadow-xs">
              SIH PROBLEM STATEMENT SIH26034
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            DigiNirikshak
          </h1>
          <p className="text-xs text-slate-600 max-w-sm">
            National Legal Metrology Statutory Enforcement & Consumer Protection Terminal • Ministry of Consumer Affairs, Govt. of India
          </p>
        </div>

        {/* Auth Card Container */}
        <div className="cyber-card rounded-2xl p-6 sm:p-7 shadow-[0_12px_45px_rgba(15,23,42,0.06)] flex flex-col gap-5 border border-slate-200 bg-white/95">
          
          {/* Dual Persona Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-xl border border-slate-200 gap-1 font-mono text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('officer')}
              className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'officer'
                  ? 'bg-emerald-600 text-white font-black shadow-[0_2px_10px_rgba(16,185,129,0.35)]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Officer (DoCA)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('citizen')}
              className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'citizen'
                  ? 'bg-blue-600 text-white font-black shadow-[0_2px_10px_rgba(37,99,235,0.35)]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Citizen (NCH)</span>
            </button>
          </div>

          {/* TAB 1: OFFICER LOGIN FORM */}
          {activeTab === 'officer' && (
            <form onSubmit={handleOfficerSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Inspector Official Name</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">Gazetted Officer</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
                    placeholder="e.g. Insp. Rajesh Kumar"
                  />
                  <BadgeCheck className="w-4 h-4 text-emerald-600 absolute right-3 top-3" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Official Email Address</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-700">Notice Dispatch Origin</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={officerEmail}
                    onChange={(e) => setOfficerEmail(e.target.value)}
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
                    placeholder="rajesh.kumar@doca.gov.in"
                  />
                  <Mail className="w-4 h-4 text-emerald-600 absolute right-3 top-3" />
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  Statutory Legal Notices under Rule 32 of PCR 2011 will be dispatched from this sender ID.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Badge Number
                  </label>
                  <input
                    type="text"
                    value={officerBadge}
                    onChange={(e) => setOfficerBadge(e.target.value)}
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:border-emerald-600 shadow-2xs"
                    placeholder="#DOCA-8941"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Security PIN
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={officerPin}
                      onChange={(e) => setOfficerPin(e.target.value)}
                      required
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:border-emerald-600 shadow-2xs"
                      placeholder="****"
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Enforcement Zone / Directorate
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={officerZone}
                    onChange={(e) => setOfficerZone(e.target.value)}
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
                    placeholder="Regional Directorate (Zone 4)"
                  />
                  <Building2 className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white font-black text-xs uppercase tracking-wider shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Access Enforcement Terminal</span>
                <ArrowRight className="w-4 h-4 text-white stroke-[3]" />
              </motion.button>
            </form>
          )}

          {/* TAB 2: CITIZEN LOGIN FORM */}
          {activeTab === 'citizen' && (
            <form onSubmit={handleCitizenSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Consumer Full Name</span>
                  <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">NCH 1915 Verified</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs"
                    placeholder="e.g. Jaya M."
                  />
                  <User className="w-4 h-4 text-blue-600 absolute right-3 top-3" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Consumer Email Address</span>
                  <span className="text-[10px] font-mono font-bold text-blue-700">Grievance Notice Sender</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={citizenEmail}
                    onChange={(e) => setCitizenEmail(e.target.value)}
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs"
                    placeholder="jaya.menaria@gmail.com"
                  />
                  <Mail className="w-4 h-4 text-blue-600 absolute right-3 top-3" />
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  Consumer protection inquiries and legal notices will be sent from this verified email address.
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Mobile Number (for NCH Grievance SMS updates)
                </label>
                <input
                  type="text"
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value)}
                  required
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:border-blue-600 shadow-2xs"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Location / City
                </label>
                <input
                  type="text"
                  value={citizenCity}
                  onChange={(e) => setCitizenCity(e.target.value)}
                  required
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 shadow-2xs"
                  placeholder="New Delhi (NCR)"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 text-white font-black text-xs uppercase tracking-wider shadow-[0_4px_15px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Launch Citizen Grievance Portal</span>
                <ArrowRight className="w-4 h-4 text-white stroke-[3]" />
              </motion.button>
            </form>
          )}

          {/* Instant 1-Click Fast Access for Hackathon Jury */}
          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase text-slate-500 text-center font-bold">
              ⚡ Instant 1-Click Hackathon Jury Login
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOfficerSubmit}
                className="flex-1 py-2 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-[11px] font-bold font-mono transition-all text-center cursor-pointer shadow-xs"
              >
                1-Click as Officer
              </button>

              <button
                type="button"
                onClick={handleCitizenSubmit}
                className="flex-1 py-2 px-2.5 rounded-lg bg-blue-50 hover:bg-blue-100/80 border border-blue-300 text-blue-800 text-[11px] font-bold font-mono transition-all text-center cursor-pointer shadow-xs"
              >
                1-Click as Citizen
              </button>
            </div>
          </div>

        </div>

        {/* Statutory Legal Footer */}
        <div className="text-center font-mono text-[10px] text-slate-500">
          Enacted under the Legal Metrology Act, 2009 & Packaged Commodities Rules, 2011
        </div>

      </motion.div>

    </div>
  );
}
