import React, { useState, useEffect } from 'react';
import { ShieldCheck, Scale, Sparkles, Terminal } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

import StepIndicator from './components/StepIndicator';
import Step1Upload from './components/Step1Upload';
import Step2Inspect from './components/Step2Inspect';
import Step3Notice from './components/Step3Notice';
import RawTextDrawer from './components/RawTextDrawer';
import HeaderProfile from './components/HeaderProfile';

import { runOcr } from './utils/ocrEngine';
import { evaluateCompliance } from './utils/rulesEngine';
import { auditPhysicalScaleWeight } from './utils/mpeCalculator';
import { generateSamplePack } from './data/sampleImages';

export default function App() {
  // Current Workflow Step: 1 = Upload, 2 = Inspect, 3 = Notice
  const [currentStep, setCurrentStep] = useState(1);
  const [hasScanned, setHasScanned] = useState(false);
  const [isOcrDrawerOpen, setIsOcrDrawerOpen] = useState(false);

  // Active User Persona / Role: 'officer' | 'citizen'
  const [userRole, setUserRole] = useState('officer');
  const [sellerName, setSellerName] = useState('');

  // Pre-Authenticated Officer & Citizen Profiles
  const officerProfile = {
    name: 'Insp. Rajesh Kumar',
    badge: '#DOCA-8941',
    jurisdiction: 'Regional Directorate (Zone 4)',
    accessLevel: 'Authorized Legal Metrology Officer (PCR 2011)',
    refPrefix: 'INSP/LM/' + new Date().getFullYear() + '/8941'
  };

  const citizenProfile = {
    name: 'Jaya M. (Consumer)',
    badge: 'NCH-CITIZEN-9428',
    jurisdiction: 'Citizen Redressal Portal | NCH Integrated',
    accessLevel: 'Verified Citizen Consumer (NCH 1915)',
    refPrefix: 'NCH/GRV/' + new Date().getFullYear() + '/9428'
  };

  const activeProfile = userRole === 'officer' ? officerProfile : citizenProfile;
  const inspectorName = activeProfile.name;
  const inspectionRef = activeProfile.refPrefix;

  // Single Statutory Label Image
  const [labelImage, setLabelImage] = useState(null);
  const [originalLabelImage, setOriginalLabelImage] = useState(null);

  // Packaging Metadata
  const [sampleMeta, setSampleMeta] = useState({
    name: 'Pre-Packaged Retail Commodity',
    batchNo: 'PKG-' + new Date().getFullYear() + '-01',
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
  const [scaleWeight, setScaleWeight] = useState('200');
  const [mpeAuditResult, setMpeAuditResult] = useState(null);

  // Load default Compliant Sample on first mount
  useEffect(() => {
    handleLoadSample('compliant', false);
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
      setScaleWeight('198.5'); // Within 9g legal MPE tolerance
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
      // Base ₹120 covered with ₹150 sticker (+25%), declared 250g, scale 220g (30g short weight exceeds 9g MPE!)
      setScaleWeight('220.0');
    }

    setSampleMeta(meta);

    if (autoAudit) {
      await executeOcrAudit(label, meta);
      setCurrentStep(2);
    }
  };

  // Upload Single Statutory Label Handler
  const handleUploadLabel = (dataUrl, filename) => {
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
  };

  // Run Automated Compliance Audit (Step 1 -> Step 2)
  const handleRunAudit = async () => {
    if (!labelImage) return;

    await executeOcrAudit(labelImage, sampleMeta);
    setCurrentStep(2);
  };

  // Core OCR Execution Pipeline
  const executeOcrAudit = async (imageSource, meta) => {
    setIsScanning(true);
    setScanProgress(0);
    setScanStatusText('Preparing high-contrast image & initializing singleton OCR...');

    try {
      const { text, confidence } = await runOcr(imageSource, (pct, status) => {
        setScanProgress(pct);
        setScanStatusText(status);
      });

      setRawOcrText(text);
      setOcrConfidence(confidence);

      // Evaluate compliance + fraud detection
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
        const audit = auditPhysicalScaleWeight(detectedQty, detectedUnit || 'g', parseFloat(scaleWeight) || detectedQty);
        setMpeAuditResult(audit);
      }

      setHasScanned(true);

    } catch (err) {
      console.error('Audit execution error:', err);
      setScanStatusText('OCR execution encountered an error. Please retry or crop region.');
    } finally {
      setIsScanning(false);
    }
  };

  // Interactive Crop & Rescan Tool in Step 2
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

  // Reset All to Step 1
  const handleResetAll = () => {
    setLabelImage(null);
    setOriginalLabelImage(null);
    setRules([]);
    setTamperResult(null);
    setRawOcrText('');
    setOcrConfidence(0);
    setHasScanned(false);
    setScaleWeight('200');
    setSellerName('');
    setMpeAuditResult(null);
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col antialiased selection:bg-cyan-500/30 selection:text-cyan-300 font-sans relative overflow-x-hidden">
      
      {/* Decorative Blueprint Dotted Grid Matrix Overlay */}
      <div className="fixed inset-0 bg-blueprint-dots opacity-50 pointer-events-none z-0"></div>

      {/* Decorative Atmospheric Ambient Glow Orbs */}
      <div className="fixed top-[-10%] left-[-5%] w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[650px] h-[650px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none z-0"></div>

      {/* SCREEN APPLICATION (Hidden during print) */}
      <div className="no-print flex-1 flex flex-col relative z-10">
        
        {/* Glassmorphic Institutional Top Bar (Single Sleek Row h-16) */}
        <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800/90 sticky top-0 z-30 shadow-[0_4px_25px_rgba(0,0,0,0.5)] h-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
            
            {/* 1. LEFT: LOGO, TITLE, SUBTITLE & SYSTEM ONLINE INDICATOR */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.35)] text-lg shrink-0">
                ⚖️
              </div>
              <div className="flex flex-col">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight leading-tight">
                  DigiNirikshak
                </h1>
                <div className="flex items-center gap-2 -mt-0.5">
                  <span className="text-[11px] font-medium text-slate-400">
                    Dept. of Consumer Affairs
                  </span>
                  <span className="text-slate-600 text-[10px]">•</span>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-400" title="Forensic Enforcement Engine Live">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_6px_#10b981]"></span>
                    </span>
                    <span>SYSTEM ONLINE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. CENTER: COMPACT MONOSPACE TELEMETRY CHIP */}
            <div className="hidden md:flex items-center font-mono text-[11px] text-slate-400 bg-slate-950/80 px-3.5 py-1 rounded-full border border-slate-800 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)] select-none">
              <span className="text-slate-500 font-bold">[</span>
              <span className="mx-1.5 text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>🟢 WASM-OCR v7</span>
              </span>
              <span className="text-slate-600 mx-1">|</span>
              <span className="text-cyan-300 font-semibold mx-1.5">PCR-2011 SCHED-I</span>
              <span className="text-slate-600 mx-1">|</span>
              <span className="text-blue-300 font-bold mx-1.5">DOCA-HQ</span>
              <span className="text-slate-500 font-bold">]</span>
            </div>

            {/* 3. RIGHT: 1-CLICK ROLE SWITCHER PROFILE DROPDOWN */}
            <div className="flex items-center">
              <HeaderProfile
                userRole={userRole}
                onRoleChange={setUserRole}
                officerProfile={officerProfile}
                citizenProfile={citizenProfile}
              />
            </div>

          </div>
        </header>

        {/* WORKFLOW CONTENT WITH MAXIMIZED SCREEN HEIGHT */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex-1 flex flex-col gap-4 w-full">
          
          {/* STEPPER NAVIGATION WIZARD */}
          <StepIndicator 
            currentStep={currentStep}
            onStepClick={(stepId) => setCurrentStep(stepId)}
            hasScanned={hasScanned}
          />

          {/* ANIMATED STEP VIEWS */}
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <Step1Upload 
                key="step-1"
                labelImage={labelImage}
                onUploadLabel={handleUploadLabel}
                onLoadSample={handleLoadSample}
                onRunAudit={handleRunAudit}
                isScanning={isScanning}
                scanProgress={scanProgress}
                scanStatusText={scanStatusText}
              />
            )}

            {currentStep === 2 && (
              <Step2Inspect 
                key="step-2"
                userRole={userRole}
                activeProfile={activeProfile}
                sellerName={sellerName}
                onSellerNameChange={setSellerName}
                labelImage={labelImage}
                sampleMeta={sampleMeta}
                rules={rules}
                tamperResult={tamperResult}
                parsedDeclaredQty={parsedDeclaredQty}
                parsedDeclaredUnit={parsedDeclaredUnit}
                scaleWeight={scaleWeight}
                onScaleWeightChange={setScaleWeight}
                mpeAuditResult={mpeAuditResult}
                rawOcrText={rawOcrText}
                ocrConfidence={ocrConfidence}
                isScanning={isScanning}
                scanProgress={scanProgress}
                scanStatusText={scanStatusText}
                onCropAndRescan={handleCropAndRescan}
                onResetView={handleResetView}
                onToggleRuleStatus={handleToggleRuleStatus}
                onSaveRuleSnippet={handleSaveRuleSnippet}
                onPrevStep={() => setCurrentStep(1)}
                onNextStep={() => setCurrentStep(3)}
              />
            )}

            {currentStep === 3 && (
              <Step3Notice 
                key="step-3"
                userRole={userRole}
                activeProfile={activeProfile}
                sellerName={sellerName}
                sampleMeta={sampleMeta}
                labelImage={labelImage}
                activeImageSrc={labelImage}
                rules={rules}
                tamperResult={tamperResult}
                mpeAuditResult={mpeAuditResult}
                scaleResult={mpeAuditResult}
                inspectorName={inspectorName}
                inspectionRef={inspectionRef}
                onPrevStep={() => setCurrentStep(2)}
                onResetAll={handleResetAll}
              />
            )}
          </AnimatePresence>

        </main>

        {/* FOOTER */}
        <footer className="mt-auto border-t border-slate-800/90 bg-slate-950/80 backdrop-blur-md py-4 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[11px]">
            <span>DigiNirikshak • SIH Problem Statement SIH26034 (DoCA)</span>
            <span>Enacted under Legal Metrology Act, 2009 & Packaged Commodities Rules, 2011</span>
          </div>
        </footer>

        {/* RAW OCR TERMINAL DRAWER / MODAL */}
        <RawTextDrawer
          isOpen={isOcrDrawerOpen}
          onClose={() => setIsOcrDrawerOpen(false)}
          rawText={rawOcrText}
          confidence={ocrConfidence}
          isScanning={isScanning}
        />

      </div>

      {/* PRINT-ONLY ROOT (Strict A4 Layout when window.print() is executed) */}
      <div className="print-only p-4">
        <Step3Notice 
          userRole={userRole}
          activeProfile={activeProfile}
          sellerName={sellerName}
          sampleMeta={sampleMeta}
          labelImage={labelImage}
          activeImageSrc={labelImage}
          rules={rules}
          tamperResult={tamperResult}
          mpeAuditResult={mpeAuditResult}
          scaleResult={mpeAuditResult}
          inspectorName={inspectorName}
          inspectionRef={inspectionRef}
          onPrevStep={() => {}}
          onResetAll={() => {}}
        />
      </div>

    </div>
  );
}
