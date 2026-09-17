import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Scale, 
  Sparkles, 
  Terminal, 
  LayoutGrid, 
  Search,
  Activity,
  CheckCircle2, 
  AlertTriangle, 
  History, 
  LogOut,
  Camera,
  ClipboardCheck,
  RotateCcw,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import HeaderProfile from './components/HeaderProfile';
import EvidenceDeck from './components/EvidenceDeck';
import ForensicMatrixDeck from './components/ForensicMatrixDeck';
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

  // Active View Mode: 'hub' (split) | 'scan' | 'audit' | 'history'
  const [viewMode, setViewMode] = useState('hub');
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
    const newMeta = {
      name: filename ? filename.replace(/\.[^/.]+$/, "") : sampleMeta.name,
      batchNo: 'RAID-' + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
    setSampleMeta(newMeta);
    executeOcrAudit(dataUrl, newMeta);
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

      // Automatically register this inspection in persistent Raid Ledger
      const flagged = evaluatedRules.filter(r => r.status === 'VIOLATION' || r.status === 'FAIL');
      const compliant = evaluatedRules.filter(r => r.status === 'PASS');
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
        violationDetails: [
          ...(isTampered ? ['Rule 18(2): Unauthorized price alteration / over-stickering'] : []),
          ...(isShort ? [`Section 39: Physical weight deficit beyond legal MPE`] : []),
          ...flagged.map(f => `${f.name}: ${f.defectExplanation || f.description || 'Statutory declaration missing'}`)
        ],
        compliantDetails: compliant.map(c => `${c.name}: Verified compliant`),
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
          defectExplanation: nextStatus === 'VIOLATION' ? 'Manually flagged as non-compliant by officer.' : null
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
          extractedText: newSnippet
        };
      }
      return r;
    }));
  };

  // Rapid "Scan Next Packet" / Reset Workflow
  const handleScanNextPacket = () => {
    setLabelImage(null);
    setOriginalLabelImage(null);
    setRules([]);
    setTamperResult(null);
    setRawOcrText('');
    setOcrConfidence(0);
    setScaleWeight('200');
    setSellerName('');
    setMpeAuditResult(null);
    setSampleMeta({
      name: 'New Inspection Packet',
      batchNo: 'RAID-' + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    });
    // On mobile, switch directly to scan deck
    setViewMode('scan');
  };

  // Summary counts
  const notCorrectRules = rules.filter(r => r.status !== 'PASS');
  const isScaleViolated = Boolean(mpeAuditResult?.isShortWeight || mpeAuditResult?.isViolated);
  const isTampered = Boolean(tamperResult?.hasTampering);
  const totalDefects = notCorrectRules.length + (isTampered ? 1 : 0) + (isScaleViolated ? 1 : 0);
  const isAuditComplete = rules.length > 0;

  // If user is not logged in, render the GovTech LoginPage
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col antialiased font-sans relative overflow-x-hidden pb-16 md:pb-0">
      
      {/* Light Blueprint Grid Background Overlay */}
      <div 
        className="fixed inset-0 bg-blueprint-dots opacity-50 pointer-events-none z-0"
      />

      {/* Institutional Top Header */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40 shadow-xs h-15">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-3">
          
          {/* Logo & Directorate Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center text-white font-black shadow-md text-base sm:text-lg shrink-0">
              ⚖️
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-tight">
                  DigiNirikshak
                </h1>
                <span className="text-[9px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                  RAID SUITE
                </span>
              </div>
              <span className="text-[10px] text-slate-500 hidden sm:block">
                Legal Metrology Factory Raid & Statutory Packet Scanner
              </span>
            </div>
          </div>

          {/* Desktop View Switcher Pills */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('hub')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'hub'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-blue-600" />
              <span>Command Hub</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('scan')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'scan'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-blue-600" />
              <span>Camera & Packet</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('audit')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'audit'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Audit Findings</span>
              {isAuditComplete && totalDefects > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] flex items-center justify-center font-mono font-bold">
                  {totalDefects}
                </span>
              )}
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
              <span>Raid Log</span>
            </button>
          </div>

          {/* Right Header Controls: Rapid Next Packet, OCR Log, Profile, Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Next Packet Scan Button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleScanNextPacket}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Quickly clear and scan next packet sample"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Scan Next Packet</span>
              <span className="sm:hidden">Next</span>
            </motion.button>

            {/* Raw OCR Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsOcrDrawerOpen(true)}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-mono font-bold cursor-pointer shadow-xs"
              title="Open raw OCR text console"
            >
              <Terminal className="w-3.5 h-3.5 text-blue-600" />
              <span>OCR Log</span>
            </button>

            <HeaderProfile
              userRole={userRole}
              onRoleChange={setUserRole}
              officerProfile={officerProfile}
              citizenProfile={citizenProfile}
            />

            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 sm:p-2 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-all cursor-pointer shadow-xs"
              title="Logout Session"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Raid Status Ticker */}
      <div className="bg-blue-50/90 border-b border-blue-100 px-3 sm:px-4 py-1.5 text-[11px] font-mono text-slate-600 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto whitespace-nowrap">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="flex items-center gap-1 text-blue-700 font-bold">
              <Activity className="w-3 h-3 text-blue-600 animate-pulse" />
              <span>BATCH: #{sampleMeta.batchNo}</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-800 font-medium truncate max-w-[150px] sm:max-w-xs">{sampleMeta.name}</span>
          </div>

          <div className="flex items-center gap-2">
            {isAuditComplete && (
              totalDefects === 0 ? (
                <span className="text-emerald-800 font-black bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  <span>100% COMPLIANT</span>
                </span>
              ) : (
                <span className="text-rose-800 font-black bg-rose-100 px-2 py-0.5 rounded border border-rose-300 flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-rose-600" />
                  <span>{totalDefects} ISSUES DETECTED</span>
                </span>
              )
            )}
            <span className="text-slate-500 hidden sm:inline">
              Officer: <strong className="text-slate-800">{activeProfile.name}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* MAIN WORKSPACE CONTENT */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-5 flex-1 flex flex-col gap-4 w-full z-10">
        
        {/* LAYOUT 1: COMMAND HUB (Dual-deck side-by-side or stacked) */}
        {viewMode === 'hub' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left 5 cols: Evidence Bay & Packet Capture */}
            <div className="lg:col-span-5 flex flex-col gap-4">
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

            {/* Right 7 cols: Forensic Findings (Correctly Done vs NOT Correctly Done) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
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
          </div>
        )}

        {/* LAYOUT 2: CAMERA & PACKET SCAN FULL VIEW */}
        {viewMode === 'scan' && (
          <div className="max-w-3xl mx-auto w-full">
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
            {isAuditComplete && (
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewMode('audit')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <span>View Audit Findings ({rules.length} verified)</span>
                  <span>→</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* LAYOUT 3: AUDIT FINDINGS FULL VIEW (Which things are correctly done vs not) */}
        {viewMode === 'audit' && (
          <div className="max-w-4xl mx-auto w-full">
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
        )}

        {/* LAYOUT 4: FACTORY RAID INSPECTION LOG */}
        {viewMode === 'history' && (
          <div className="w-full">
            <HistoryDeck 
              activeProfile={activeProfile}
            />
          </div>
        )}

      </main>

      {/* Global Terminal Footer (Desktop only) */}
      <footer className="mt-auto border-t border-slate-200 bg-white/90 backdrop-blur-md py-3 text-xs text-slate-500 hidden md:block z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>DigiNirikshak • SIH Problem Statement SIH26034 (DoCA)</span>
          </span>
          <span className="text-slate-500">Legal Metrology Act, 2009 & Packaged Commodities Rules, 2011</span>
        </div>
      </footer>

      {/* MOBILE STICKY BOTTOM ACTION BAR (Engineered for field officers during factory raids) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center justify-around">
        {/* 1. Camera / Scan */}
        <button
          type="button"
          onClick={() => setViewMode('scan')}
          className={`flex-1 flex flex-col items-center py-1 rounded-xl transition-all cursor-pointer ${
            viewMode === 'scan' ? 'text-blue-600 font-black' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Camera className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Scan Packet</span>
        </button>

        {/* 2. Audit Findings (Correct vs Not Correct) */}
        <button
          type="button"
          onClick={() => setViewMode('audit')}
          className={`flex-1 flex flex-col items-center py-1 rounded-xl transition-all relative cursor-pointer ${
            viewMode === 'audit' ? 'text-blue-600 font-black' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardCheck className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Findings</span>
          {isAuditComplete && totalDefects > 0 && (
            <span className="absolute top-0 right-5 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center font-mono">
              {totalDefects}
            </span>
          )}
        </button>

        {/* 3. Command Hub (Overview) */}
        <button
          type="button"
          onClick={() => setViewMode('hub')}
          className={`flex-1 flex flex-col items-center py-1 rounded-xl transition-all cursor-pointer ${
            viewMode === 'hub' ? 'text-blue-600 font-black' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutGrid className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Command Hub</span>
        </button>

        {/* 4. Raid Log */}
        <button
          type="button"
          onClick={() => setViewMode('history')}
          className={`flex-1 flex flex-col items-center py-1 rounded-xl transition-all cursor-pointer ${
            viewMode === 'history' ? 'text-blue-600 font-black' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Raid Log</span>
        </button>
      </nav>

      {/* Raw OCR Modal Drawer */}
      <RawTextDrawer
        isOpen={isOcrDrawerOpen}
        onClose={() => setIsOcrDrawerOpen(false)}
        rawText={rawOcrText}
        confidence={ocrConfidence}
        isScanning={isScanning}
      />

    </div>
  );
}
