import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Scale, 
  Sparkles, 
  Terminal, 
  LayoutGrid, 
  FileText, 
  Search,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  History,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import HeaderProfile from './components/HeaderProfile';
import EvidenceDeck from './components/EvidenceDeck';
import ForensicMatrixDeck from './components/ForensicMatrixDeck';
import EnforcementDossierDeck from './components/EnforcementDossierDeck';
import HistoryDeck from './components/HistoryDeck';
import LoginPage from './components/LoginPage';
import RawTextDrawer from './components/RawTextDrawer';

import { runOcr } from './utils/ocrEngine';
import { evaluateCompliance } from './utils/rulesEngine';
import { auditPhysicalScaleWeight } from './utils/mpeCalculator';
import { generateSamplePack } from './data/sampleImages';
import { saveAuditRecord } from './utils/historyStorage';

export default function App() {
  // Session Authentication State (Defaults to true if previously logged in)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('diginirikshak_auth') === 'true';
  });

  // Active Terminal View Mode: 'command' | 'inspect' | 'dossier' | 'history'
  const [viewMode, setViewMode] = useState('command');
  const [isOcrDrawerOpen, setIsOcrDrawerOpen] = useState(false);
  const [hoveredRuleId, setHoveredRuleId] = useState(null);

  // Active User Persona: 'officer' | 'citizen'
  const [userRole, setUserRole] = useState('officer');
  const [sellerName, setSellerName] = useState('');

  // Pre-Authenticated Officer & Citizen Profiles
  const [officerProfile, setOfficerProfile] = useState({
    name: 'Insp. Rajesh Kumar',
    badge: '#DOCA-8941',
    jurisdiction: 'Regional Directorate (Zone 4)',
    accessLevel: 'Authorized Legal Metrology Officer (PCR 2011)',
    refPrefix: 'INSP/LM/' + new Date().getFullYear() + '/8941'
  });

  const [citizenProfile, setCitizenProfile] = useState({
    name: 'Jaya M. (Consumer)',
    badge: 'NCH-CITIZEN-9428',
    jurisdiction: 'Citizen Redressal Portal | NCH Integrated',
    accessLevel: 'Verified Citizen Consumer (NCH 1915)',
    refPrefix: 'NCH/GRV/' + new Date().getFullYear() + '/9428'
  });

  // Reactive Mouse Movement Parallax
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let animId;
    const handleMouseMove = (e) => {
      cancelAnimationFrame(animId);
      animId = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        setMouseOffset({ x, y });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Authentication Handlers
  const handleLogin = (profile) => {
    setUserRole(profile.role);
    if (profile.role === 'officer') {
      setOfficerProfile(prev => ({
        ...prev,
        name: profile.name,
        badge: profile.badge,
        jurisdiction: profile.jurisdiction
      }));
    } else {
      setCitizenProfile(prev => ({
        ...prev,
        name: profile.name,
        badge: profile.badge,
        jurisdiction: profile.jurisdiction
      }));
    }
    setIsAuthenticated(true);
    localStorage.setItem('diginirikshak_auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('diginirikshak_auth');
  };

  const activeProfile = userRole === 'officer' ? officerProfile : citizenProfile;
  const inspectorName = activeProfile.name;
  const inspectionRef = activeProfile.refPrefix;

  // Single Statutory Label Image
  const [labelImage, setLabelImage] = useState(null);
  const [originalLabelImage, setOriginalLabelImage] = useState(null);

  // Packaging Metadata
  const [sampleMeta, setSampleMeta] = useState({
    name: 'NutriGold Whole Grain Biscuits (200g)',
    batchNo: 'NG-2026-B89',
    timestamp: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  });

  // OCR Worker State
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatusText, setScanStatusText] = useState('');
  const [rawOcrText, setRawOcrText] = useState('');
  const [ocrConfidence, setOcrConfidence] = useState(0);

  // Evaluated Rules & Fraud Findings
  const [rules, setRules] = useState([]);
  const [tamperResult, setTamperResult] = useState(null);
  const [parsedDeclaredQty, setParsedDeclaredQty] = useState(200);
  const [parsedDeclaredUnit, setParsedDeclaredUnit] = useState('g');

  // Physical Scale Laboratory Weight (MPE Audit)
  const [scaleWeight, setScaleWeight] = useState('198.5');
  const [mpeAuditResult, setMpeAuditResult] = useState(null);

  // Load default Compliant Sample on first mount
  useEffect(() => {
    handleLoadSample('compliant', true);
  }, []);

  // Recalculate MPE audit whenever scale weight or declared quantity changes
  useEffect(() => {
    if (parsedDeclaredQty) {
      const audit = auditPhysicalScaleWeight(parsedDeclaredQty, parsedDeclaredUnit, parseFloat(scaleWeight) || 0);
      setMpeAuditResult(audit);
    }
  }, [scaleWeight, parsedDeclaredQty, parsedDeclaredUnit]);

  // 1-Click Demo Sample Loader
  const handleLoadSample = async (type = 'compliant', autoAudit = true) => {
    const label = generateSamplePack(type);
    setLabelImage(label);
    setOriginalLabelImage(label);

    let meta = {};
    if (type === 'compliant') {
      meta = {
        name: 'NutriGold Whole Grain Biscuits (200g)',
        batchNo: 'NG-2026-B89',
        timestamp: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };
      setScaleWeight('198.5');
    } else if (type === 'mislabeled' || type === 'violation') {
      meta = {
        name: 'CrunchMax Potato Chips (75g)',
        batchNo: 'CM-2026-X41',
        timestamp: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };
      setScaleWeight('75.0');
    } else if (type === 'tampered' || type === 'deceptive') {
      meta = {
        name: 'Royal Chai Premium Blend (Assam CTC)',
        batchNo: 'RC-2026-TAMPER',
        timestamp: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };
      setScaleWeight('220.0');
    }

    setSampleMeta(meta);

    if (autoAudit) {
      await executeOcrAudit(label, meta);
    }
  };

  // Upload Single Statutory Label Handler
  const handleUploadLabel = (dataUrl, filename) => {
    if (!dataUrl) {
      setLabelImage(null);
      setOriginalLabelImage(null);
      setRules([]);
      setTamperResult(null);
      setRawOcrText('');
      setOcrConfidence(0);
      return;
    }

    setLabelImage(dataUrl);
    setOriginalLabelImage(dataUrl);
    if (filename) {
      setSampleMeta(prev => ({
        ...prev,
        name: filename.replace(/\.[^/.]+$/, "") || prev.name,
        batchNo: 'SCAN-' + Math.floor(1000 + Math.random() * 9000),
        timestamp: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      }));
    }
    executeOcrAudit(dataUrl, sampleMeta);
  };

  // Core OCR Execution Pipeline & Automated History Recording
  const executeOcrAudit = async (imageSource, meta) => {
    setIsScanning(true);
    setScanProgress(0);
    setScanStatusText('Preprocessing high-contrast packaging canvas...');

    try {
      const { text, confidence } = await runOcr(imageSource, (pct, status) => {
        setScanProgress(pct);
        setScanStatusText(status);
      });

      setRawOcrText(text);
      setOcrConfidence(confidence);

      const { 
        rules: evaluatedRules, 
        tamperResult: tamperFindings, 
        parsedDeclaredQty: detectedQty,
        parsedDeclaredUnit: detectedUnit
      } = evaluateCompliance(text);

      setRules(evaluatedRules);
      setTamperResult(tamperFindings);

      let currentAuditResult = null;
      if (detectedQty) {
        setParsedDeclaredQty(detectedQty);
        setParsedDeclaredUnit(detectedUnit || 'g');
        currentAuditResult = auditPhysicalScaleWeight(detectedQty, detectedUnit || 'g', parseFloat(scaleWeight) || detectedQty);
        setMpeAuditResult(currentAuditResult);
      }

      // Automatically register/update this inspection in persistent History Ledger
      const flagged = evaluatedRules.filter(r => r.status === 'VIOLATION' || r.status === 'FAIL');
      const isTampered = Boolean(tamperFindings?.hasTampering);
      const isShort = Boolean(currentAuditResult?.isShortWeight);
      const hasDefects = flagged.length > 0 || isTampered || isShort;

      saveAuditRecord({
        id: 'HIST-' + (meta.batchNo || 'PKG-2026'),
        companyName: meta.name ? meta.name.split('(')[0].trim() : 'Packaged Goods Manufacturer',
        commodity: meta.name,
        batchNo: meta.batchNo,
        timestamp: meta.timestamp || new Date().toLocaleDateString('en-IN'),
        inspectorName: activeProfile.name,
        verdict: hasDefects ? 'VIOLATION' : 'PASSED',
        violationsCount: flagged.length + (isTampered ? 1 : 0) + (isShort ? 1 : 0),
        violationDetails: flagged.map(f => `${f.name}: ${f.evidenceDetail || 'Non-compliant declaration'}`),
        noticeStatus: hasDefects ? 'PENDING' : 'CLEARED',
        noticeDispatchedAt: null,
        dispatchedFromEmail: activeProfile?.email || 'rajesh.kumar@doca.gov.in',
        dispatchTrackingNo: null,
        declaredQty: `${detectedQty || 200}${detectedUnit || 'g'}`,
        measuredWeight: `${scaleWeight || 200}${detectedUnit || 'g'}`
      });

    } catch (err) {
      console.error('Audit execution error:', err);
      setScanStatusText('OCR execution encountered an error. Please retry or crop region.');
    } finally {
      setIsScanning(false);
    }
  };

  // Interactive Crop & Rescan Tool
  const handleCropAndRescan = async (croppedDataUrl) => {
    setLabelImage(croppedDataUrl);
    setIsScanning(true);
    setScanProgress(0);
    setScanStatusText('Scanning cropped sub-region...');

    try {
      const { text, confidence } = await runOcr(croppedDataUrl, (pct, status) => {
        setScanProgress(pct);
        setScanStatusText(status);
      });

      setRawOcrText(text);
      setOcrConfidence(confidence);

      const { 
        rules: evaluatedRules, 
        tamperResult: tamperFindings, 
        parsedDeclaredQty: detectedQty,
        parsedDeclaredUnit: detectedUnit
      } = evaluateCompliance(text);

      setRules(evaluatedRules);
      setTamperResult(tamperFindings);

      if (detectedQty) {
        setParsedDeclaredQty(detectedQty);
        setParsedDeclaredUnit(detectedUnit || 'g');
      }
    } catch (err) {
      console.error('Crop rescan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // Reset View to Original Label Image
  const handleResetView = () => {
    if (originalLabelImage && originalLabelImage !== labelImage) {
      setLabelImage(originalLabelImage);
      executeOcrAudit(originalLabelImage, sampleMeta);
    }
  };

  // Manual Inspector Rule Controls
  const handleToggleRuleStatus = (ruleId) => {
    setRules(prev => prev.map(r => {
      if (r.id === ruleId) {
        const nextStatus = r.status === 'PASS' ? 'VIOLATION' : 'PASS';
        return {
          ...r,
          status: nextStatus,
          evidenceDetail: `Manually marked as ${nextStatus} by inspecting officer.`
        };
      }
      return r;
    }));
  };

  const handleSaveRuleSnippet = (ruleId, newSnippet) => {
    setRules(prev => prev.map(r => {
      if (r.id === ruleId) {
        return {
          ...r,
          extractedText: newSnippet,
          evidenceDetail: 'Manually verified snippet transcribed by inspecting officer.'
        };
      }
      return r;
    }));
  };

  const handleResetAll = () => {
    setLabelImage(null);
    setOriginalLabelImage(null);
    setRules([]);
    setTamperResult(null);
    setRawOcrText('');
    setOcrConfidence(0);
    setScaleWeight('200');
    setSellerName('');
    setMpeAuditResult(null);
  };

  const handleViewNoticeFromHistory = (record) => {
    setSampleMeta({
      name: record.commodity,
      batchNo: record.batchNo,
      timestamp: record.timestamp
    });
    setViewMode('dossier');
  };

  // If user is not logged in, render the futuristic GovTech LoginPage
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col antialiased selection:bg-blue-500/20 selection:text-blue-900 font-sans relative overflow-x-hidden cyber-scanline">
      
      {/* Reactive Parallax Blueprint Overlay (Light) */}
      <div 
        className="fixed inset-0 bg-blueprint-dots opacity-60 pointer-events-none z-0 transition-transform duration-700 ease-out will-change-transform"
        style={{
          transform: `translate3d(${mouseOffset.x * 14}px, ${mouseOffset.y * 14}px, 0)`
        }}
      />

      {/* Atmospheric Ambient Glow Orbs with Floating Parallax (Light) */}
      <div 
        className="fixed top-[-15%] left-[-10%] w-[650px] h-[650px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none z-0 animate-float-slow transition-transform duration-1000 ease-out will-change-transform"
        style={{
          transform: `translate3d(${mouseOffset.x * 35}px, ${mouseOffset.y * 35}px, 0)`
        }}
      />
      <div 
        className="fixed bottom-[-15%] right-[-10%] w-[750px] h-[750px] bg-indigo-500/08 rounded-full blur-3xl pointer-events-none z-0 animate-float-reverse transition-transform duration-1000 ease-out will-change-transform"
        style={{
          transform: `translate3d(${-mouseOffset.x * 45}px, ${-mouseOffset.y * 45}px, 0)`
        }}
      />

      {/* NO-PRINT SCREEN APPLICATION */}
      <div className="no-print flex-1 flex flex-col relative z-10">
        
        {/* Institutional Header (Light Theme) */}
        <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40 shadow-xs h-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
            
            {/* Logo & National Directorate Title */}
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.08, rotate: 3 }}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center text-white font-black shadow-[0_4px_15px_rgba(37,99,235,0.3)] text-lg shrink-0 cursor-pointer"
              >
                ⚖️
              </motion.div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
                    DigiNirikshak
                  </h1>
                  <span className="text-[9px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.2 rounded border border-blue-200 shadow-2xs">
                    SIH26034
                  </span>
                </div>
                <div className="flex items-center gap-2 -mt-0.5">
                  <span className="text-[11px] font-medium text-slate-500">
                    Legal Metrology Command Terminal
                  </span>
                  <span className="text-slate-400 text-[10px]">•</span>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-700">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_6px_#10b981]"></span>
                    </span>
                    <span>ONLINE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* View Mode Switcher Pills (Light Theme) */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('command')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'command'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 text-blue-600" />
                <span>Command Hub</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('inspect')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'inspect'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-blue-600" />
                <span>Inspection Deck</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('dossier')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'dossier'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Show Cause Notice</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('history')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'history'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <History className="w-3.5 h-3.5 text-blue-600" />
                <span>Ledger History</span>
              </button>
            </div>

            {/* Right: Persona Switcher, OCR Log & Logout */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setIsOcrDrawerOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-mono font-bold cursor-pointer shadow-xs"
                title="Open Raw Tesseract OCR Terminal Drawer"
              >
                <Terminal className="w-3.5 h-3.5 text-blue-600" />
                <span>OCR Log</span>
              </motion.button>

              <HeaderProfile
                userRole={userRole}
                onRoleChange={setUserRole}
                officerProfile={officerProfile}
                citizenProfile={citizenProfile}
              />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-300 text-slate-500 hover:text-rose-600 transition-all cursor-pointer shadow-xs"
                title="Logout Session"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            </div>

          </div>
        </header>

        {/* Dynamic Telemetry Status Ticker (Light Theme) */}
        <div className="bg-blue-50/80 border-b border-blue-100/90 px-4 py-1.5 text-[11px] font-mono text-slate-600">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto whitespace-nowrap">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-blue-700 font-bold">
                <Activity className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                <span>DOCKET: #{sampleMeta.batchNo}</span>
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-800 font-medium">{sampleMeta.name}</span>
              <span className="text-slate-300">|</span>
              <span className="text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.2 rounded border border-emerald-200">🟢 WASM-Tesseract 7.0 Ready</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-600">
                Active User: <strong className={userRole === 'officer' ? 'text-emerald-800' : 'text-blue-800'}>
                  {activeProfile.name} ({activeProfile.badge})
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* MAIN WORKSPACE */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex-1 flex flex-col gap-5 w-full">
          
          {/* LAYOUT 1: FULL 3-DECK COMMAND HUB */}
          {viewMode === 'command' && (
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start"
            >
              {/* DECK 1 (Left 4 cols): Evidence Bay & Packaging Viewport */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <EvidenceDeck
                  labelImage={labelImage}
                  onUploadLabel={handleUploadLabel}
                  onLoadSample={handleLoadSample}
                  onRunAudit={() => executeOcrAudit(labelImage, sampleMeta)}
                  isScanning={isScanning}
                  scanProgress={scanProgress}
                  scanStatusText={scanStatusText}
                  rules={rules}
                  hoveredRuleId={hoveredRuleId}
                  tamperResult={tamperResult}
                  onCropAndRescan={handleCropAndRescan}
                  onResetView={handleResetView}
                  sampleMeta={sampleMeta}
                />
              </div>

              {/* DECK 2 (Center 4 cols): Forensic Compliance Matrix */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <ForensicMatrixDeck
                  userRole={userRole}
                  activeProfile={activeProfile}
                  sellerName={sellerName}
                  onSellerNameChange={setSellerName}
                  rules={rules}
                  tamperResult={tamperResult}
                  parsedDeclaredQty={parsedDeclaredQty}
                  parsedDeclaredUnit={parsedDeclaredUnit}
                  scaleWeight={scaleWeight}
                  onScaleWeightChange={setScaleWeight}
                  mpeAuditResult={mpeAuditResult}
                  hoveredRuleId={hoveredRuleId}
                  onHoverRule={setHoveredRuleId}
                  onToggleRuleStatus={handleToggleRuleStatus}
                  onSaveRuleSnippet={handleSaveRuleSnippet}
                />
              </div>

              {/* DECK 3 (Right 4 cols): Real-Time Show Cause Notice Dossier */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <EnforcementDossierDeck
                  userRole={userRole}
                  activeProfile={activeProfile}
                  sellerName={sellerName}
                  sampleMeta={sampleMeta}
                  rules={rules}
                  tamperResult={tamperResult}
                  mpeAuditResult={mpeAuditResult}
                  inspectorName={inspectorName}
                  inspectionRef={inspectionRef}
                  onResetAll={handleResetAll}
                />
              </div>
            </motion.div>
          )}

          {/* LAYOUT 2: INSPECTION FOCUS (2-Column Expanded) */}
          {viewMode === 'inspect' && (
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start"
            >
              <EvidenceDeck
                labelImage={labelImage}
                onUploadLabel={handleUploadLabel}
                onLoadSample={handleLoadSample}
                onRunAudit={() => executeOcrAudit(labelImage, sampleMeta)}
                isScanning={isScanning}
                scanProgress={scanProgress}
                scanStatusText={scanStatusText}
                rules={rules}
                hoveredRuleId={hoveredRuleId}
                tamperResult={tamperResult}
                onCropAndRescan={handleCropAndRescan}
                onResetView={handleResetView}
                sampleMeta={sampleMeta}
              />

              <ForensicMatrixDeck
                userRole={userRole}
                activeProfile={activeProfile}
                sellerName={sellerName}
                onSellerNameChange={setSellerName}
                rules={rules}
                tamperResult={tamperResult}
                parsedDeclaredQty={parsedDeclaredQty}
                parsedDeclaredUnit={parsedDeclaredUnit}
                scaleWeight={scaleWeight}
                onScaleWeightChange={setScaleWeight}
                mpeAuditResult={mpeAuditResult}
                hoveredRuleId={hoveredRuleId}
                onHoverRule={setHoveredRuleId}
                onToggleRuleStatus={handleToggleRuleStatus}
                onSaveRuleSnippet={handleSaveRuleSnippet}
              />
            </motion.div>
          )}

          {/* LAYOUT 3: LEGAL NOTICE FOCUS */}
          {viewMode === 'dossier' && (
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto w-full"
            >
              <EnforcementDossierDeck
                userRole={userRole}
                activeProfile={activeProfile}
                sellerName={sellerName}
                sampleMeta={sampleMeta}
                rules={rules}
                tamperResult={tamperResult}
                mpeAuditResult={mpeAuditResult}
                inspectorName={inspectorName}
                inspectionRef={inspectionRef}
                onResetAll={handleResetAll}
              />
            </motion.div>
          )}

          {/* LAYOUT 4: AUDIT HISTORY LEDGER & NOTICE DISPATCH TRACKER */}
          {viewMode === 'history' && (
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <HistoryDeck 
                onViewNotice={handleViewNoticeFromHistory}
                activeProfile={activeProfile}
              />
            </motion.div>
          )}

        </main>

        {/* Global Terminal Footer (Light Theme) */}
        <footer className="mt-auto border-t border-slate-200 bg-white/90 backdrop-blur-md py-3 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>DigiNirikshak • SIH Problem Statement SIH26034 (DoCA)</span>
            </span>
            <span className="text-slate-500">Legal Metrology Act, 2009 & Packaged Commodities Rules, 2011 • Rule 32 SCN</span>
          </div>
        </footer>

        {/* Raw OCR Modal Drawer */}
        <RawTextDrawer
          isOpen={isOcrDrawerOpen}
          onClose={() => setIsOcrDrawerOpen(false)}
          rawText={rawOcrText}
          confidence={ocrConfidence}
          isScanning={isScanning}
        />

      </div>

      {/* PRINT-ONLY ROOT (Authentic A4 Paper Print) */}
      <div className="print-only p-4">
        <EnforcementDossierDeck
          userRole={userRole}
          activeProfile={activeProfile}
          sellerName={sellerName}
          sampleMeta={sampleMeta}
          rules={rules}
          tamperResult={tamperResult}
          mpeAuditResult={mpeAuditResult}
          inspectorName={inspectorName}
          inspectionRef={inspectionRef}
          onResetAll={() => {}}
        />
      </div>

    </div>
  );
}
