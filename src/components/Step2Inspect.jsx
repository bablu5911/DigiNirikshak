import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  IndianRupee, 
  Scale, 
  Calendar, 
  Building2, 
  Headphones, 
  Edit3, 
  Check, 
  X,
  ShieldCheck, 
  AlertTriangle, 
  FileText,
  Sparkles, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageCanvas from './ImageCanvas';

export default function Step2Inspect({
  userRole = 'officer',
  activeProfile = null,
  sellerName = '',
  onSellerNameChange,
  labelImage,
  frontImage,
  backImage,
  sampleMeta = {},
  rules = [],
  tamperResult = null,
  crossPanelResult = null,
  parsedDeclaredQty = 200,
  parsedDeclaredUnit = 'g',
  scaleWeight = '200',
  onScaleWeightChange,
  mpeAuditResult = null,
  rawOcrText = '',
  ocrConfidence = 0,
  isScanning = false,
  scanProgress = 0,
  scanStatusText = '',
  onCropAndRescan,
  onResetView,
  onToggleRuleStatus,
  onSaveRuleSnippet,
  onPrevStep,
  onNextStep
}) {
  const isOfficer = userRole === 'officer';
  const [hoveredRuleId, setHoveredRuleId] = useState(null);
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [customSnippet, setCustomSnippet] = useState('');
  const [isScaleExpanded, setIsScaleExpanded] = useState(Boolean(mpeAuditResult?.isShortWeight));

  const activeImageSrc = labelImage || backImage || frontImage;

  const totalRules = rules.length || 5;
  const passedCount = rules.filter(r => r.status === 'PASS').length;
  const violationCount = totalRules - passedCount;
  const isFullyCompliant = violationCount === 0 && rules.length > 0 && !tamperResult?.hasTampering && !mpeAuditResult?.isShortWeight;

  const getRuleIcon = (id) => {
    switch (id) {
      case 'mrp': return <IndianRupee className="w-3.5 h-3.5 text-cyan-400" />;
      case 'net_qty': return <Scale className="w-3.5 h-3.5 text-blue-400" />;
      case 'mfg_date': return <Calendar className="w-3.5 h-3.5 text-amber-400" />;
      case 'address': return <Building2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'consumer_care': return <Headphones className="w-3.5 h-3.5 text-purple-400" />;
      default: return <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  // Dynamic Vocabulary Engine (Role-Adaptive Copy)
  const getRoleAdaptiveRule = (rule) => {
    if (isOfficer) {
      return {
        name: rule.name,
        ruleCode: rule.ruleCode,
        description: rule.description,
        statusPass: 'PASS',
        statusFail: 'VIOLATION'
      };
    }

    // Citizen Plain-Language Vocabulary
    switch (rule.id) {
      case 'mrp':
        return {
          name: rule.status === 'PASS' ? 'MRP & Inclusive of All Taxes' : 'Taxes Not Clarified',
          ruleCode: 'Rule 6(1)(e) • Price Transparency',
          description: rule.status === 'PASS' 
            ? 'Retail price is declared inclusive of all taxes.' 
            : 'Taxes Not Clarified - Bill may include hidden charges (Absence of "Inclusive of all taxes" declaration).',
          statusPass: 'VERIFIED FAIR',
          statusFail: 'OVERCHARGE RISK'
        };
      case 'net_qty':
        return {
          name: rule.status === 'PASS' ? 'Net Quantity Declared' : 'Packet is Underweight',
          ruleCode: 'Section 39 • Quantity Integrity',
          description: rule.status === 'PASS'
            ? 'Net quantity declared in standard metric units.'
            : 'Packet is Underweight - Less product received than paid for (Section 39 Short-Quantity Offense).',
          statusPass: 'ACCURATE QTY',
          statusFail: 'SHORT WEIGHT'
        };
      case 'mfg_date':
        return {
          name: rule.status === 'PASS' ? 'Manufacturing / Pack Date' : 'Pack Date Missing',
          ruleCode: 'Rule 6(1)(d) • Freshness & Expiry',
          description: rule.status === 'PASS'
            ? 'Month & year of manufacture or packaging identified.'
            : 'Manufacturing Date Missing - May be expired or old stock.',
          statusPass: 'VERIFIED DATE',
          statusFail: 'OLD STOCK RISK'
        };
      case 'address':
        return {
          name: rule.status === 'PASS' ? 'Manufacturer Identity' : 'Maker / Importer Unknown',
          ruleCode: 'Rule 6(1)(a) • Origin & Traceability',
          description: rule.status === 'PASS'
            ? 'Complete name and physical factory/packer address located.'
            : 'Seller / Manufacturer Unknown - No physical address provided on packaging.',
          statusPass: 'IDENTIFIED',
          statusFail: 'UNTRACEABLE'
        };
      case 'consumer_care':
        return {
          name: rule.status === 'PASS' ? 'Customer Care Helpline' : 'Customer Care Missing',
          ruleCode: 'Rule 6(1)(f) • Consumer Helpline',
          description: rule.status === 'PASS'
            ? 'Direct customer support phone number or grievance email declared.'
            : 'Customer Care Missing - No helpline or grievance contact found on packet.',
          statusPass: 'CONTACTABLE',
          statusFail: 'NO SUPPORT'
        };
      default:
        return {
          name: rule.name,
          ruleCode: rule.ruleCode,
          description: rule.description,
          statusPass: 'PASS',
          statusFail: 'DEFECT'
        };
    }
  };

  // Safe MPE values for visual tolerance gauge
  const declaredVal = mpeAuditResult?.mpeSpec?.declaredValue || parsedDeclaredQty || 200;
  const minAllowedVal = mpeAuditResult?.mpeSpec?.minAllowed || (declaredVal - 9);
  const currentWeightNum = parseFloat(scaleWeight) || declaredVal;
  const toleranceRangeMin = Math.round(declaredVal * 0.7);
  const toleranceRangeMax = Math.round(declaredVal * 1.3);

  const gaugePercent = Math.min(100, Math.max(0, ((currentWeightNum - toleranceRangeMin) / (toleranceRangeMax - toleranceRangeMin)) * 100));
  const minAllowedPercent = Math.min(100, Math.max(0, ((minAllowedVal - toleranceRangeMin) / (toleranceRangeMax - toleranceRangeMin)) * 100));

  const handleStartEdit = (rule) => {
    setEditingRuleId(rule.id);
    setCustomSnippet(rule.extractedText || '');
  };

  const handleSaveEdit = (ruleId) => {
    onSaveRuleSnippet(ruleId, customSnippet);
    setEditingRuleId(null);
  };

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
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: -12, transition: { duration: 0.25 } }}
      className="flex flex-col gap-5"
    >
      
      {/* Sleek Minimalist Top Workstation Header */}
      <motion.div 
        variants={itemVariants}
        className="bg-slate-900/80 backdrop-blur-md border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-4 shadow-[0_0_25px_rgba(6,182,212,0.05)] transition-all duration-300 flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              {isOfficer ? 'Active Forensic Docket (DoCA)' : 'Citizen Grievance Docket (NCH-1915)'}
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
              isOfficer 
                ? 'text-emerald-300 bg-emerald-950/80 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]' 
                : 'text-cyan-300 bg-cyan-950/80 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
            }`}>
              #{sampleMeta.batchNo || 'PKG-2026-01'}
            </span>
            <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
              • {isOfficer ? 'Insp. Rajesh Kumar (#DOCA-8941)' : 'Jaya M. (Citizen Complainant)'}
            </span>
          </div>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-100 mt-0.5 truncate max-w-xl">
            {isOfficer ? 'Forensic Packaging Audit & PCR Verification' : 'Consumer Protection Verification Scanner'}
            <span className="text-xs font-medium text-slate-400 ml-2">— {sampleMeta.name}</span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.15)]">
            PCR 2011 Enforcement Workspace
          </span>
        </div>
      </motion.div>

      {/* ======================================================= */}
      {/* BALANCED 50/50 2-COLUMN WORKSTATION                     */}
      {/* ======================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        
        {/* ===================================================== */}
        {/* LEFT COLUMN (50%): PACKAGING VIEWPORT & CROP CANVAS   */}
        {/* ===================================================== */}
        <motion.div 
          variants={itemVariants}
          className="bg-slate-900/80 backdrop-blur-md border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-4 shadow-[0_0_25px_rgba(6,182,212,0.05)] transition-all duration-300 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
            <div>
              <h3 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                <span>Packaging Viewport</span>
                {isScanning && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-cyan-300 bg-cyan-950/90 px-2 py-0.5 rounded-md border border-cyan-500/40 animate-pulse">
                    <Sparkles className="w-3 h-3 text-cyan-400" /> Scanning
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">
                Statutory Rear/Side Packaging Label (Mandatory Declarations)
              </p>
            </div>

            <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
              Interactive Zoom & Crop
            </span>
          </div>

          {/* Interactive Image Viewport Canvas */}
          <ImageCanvas
            imageSrc={activeImageSrc}
            isScanning={isScanning}
            onCropAndRescan={onCropAndRescan}
            onResetView={onResetView}
            rules={rules}
            hoveredRuleId={hoveredRuleId}
            tamperResult={tamperResult}
          />

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Use crop tool to isolate blurred text for instant sub-region re-OCR</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">PCR 2011 Engine</span>
          </div>
        </motion.div>

        {/* ===================================================== */}
        {/* RIGHT COLUMN (50%): UNIFIED INSPECTION CONSOLE       */}
        {/* ===================================================== */}
        <motion.div variants={itemVariants} className="flex flex-col gap-4">
          
          {/* 1. TOP VERDICT STRIP */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800/90 rounded-2xl p-3.5 shadow-[0_0_25px_rgba(6,182,212,0.05)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${
                isFullyCompliant 
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                  : 'bg-rose-950/80 text-rose-400 border-rose-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
              }`}>
                {isFullyCompliant ? <ShieldCheck className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-rose-400" />}
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase font-bold text-slate-400">
                  {isOfficer ? 'Statutory Evaluation' : 'Consumer Rights Check'}
                </div>
                <div className={`text-xs font-black tracking-tight ${isFullyCompliant ? 'text-emerald-300' : 'text-rose-400'}`}>
                  {isFullyCompliant 
                    ? (isOfficer ? 'VERDICT: FULLY COMPLIANT' : 'VERDICT: SAFE & FAIR PRODUCT') 
                    : (isOfficer 
                        ? `VERDICT: ${violationCount} STATUTORY DEFECT${violationCount > 1 ? 'S' : ''} FLAGGED`
                        : `VERDICT: ${violationCount} CONSUMER ISSUE${violationCount > 1 ? 'S' : ''} DETECTED`)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40 text-[10px]">
                {passedCount} {isOfficer ? 'PASS' : 'OK'}
              </span>
              <span className={`font-bold px-2 py-0.5 rounded border text-[10px] ${
                violationCount > 0 
                  ? 'text-rose-300 bg-rose-950/80 border-rose-500/50' 
                  : 'text-slate-500 bg-slate-950 border-slate-800'
              }`}>
                {violationCount} {isOfficer ? 'FAIL' : 'ISSUE'}
              </span>
            </div>
          </div>

          {/* CITIZEN MODE ONLY: STORE / SELLER INPUT FIELD */}
          {!isOfficer && (
            <div className="bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-3 shadow-[0_0_20px_rgba(6,182,212,0.08)] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-100">
                    Purchased From (Shop / Supermarket / E-Com Store)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                  Feeds into NCH Grievance
                </span>
              </div>
              <div>
                <input
                  type="text"
                  value={sellerName}
                  onChange={(e) => onSellerNameChange && onSellerNameChange(e.target.value)}
                  placeholder="e.g., QuickMart Supermarket / Blinkit / Local Kirana Store..."
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-medium"
                />
              </div>
            </div>
          )}

          {/* 2. CONDITIONAL FRAUD ALERT: RULE 18(2) MRP STICKER TAMPER (Rendered ONLY if tampering detected) */}
          {tamperResult?.hasTampering && (
            <motion.div 
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-950/40 border border-amber-500/60 rounded-2xl p-3.5 shadow-[0_0_20px_rgba(245,158,11,0.2)] flex flex-col gap-2.5 animate-violation-shake"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded border border-amber-500/50">
                    {isOfficer ? 'Rule 18(2) Statutory Offense' : 'Price Sticker Tampering Alert'}
                  </span>
                </div>
                <span className="text-[10px] font-extrabold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-500/50">
                  {isOfficer ? 'PRICE TAMPERING FLAGGED' : 'OVERCHARGING DETECTED'}
                </span>
              </div>

              <p className="text-[11px] text-slate-300">
                {isOfficer 
                  ? tamperResult.description 
                  : 'Price Sticker Tampering - Shopkeeper overcharging above printed MRP. Pasting higher price stickers over factory MRP violates Consumer Protection rules.'}
              </p>

              <div className="bg-slate-950/80 border border-amber-500/40 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs">
                <div className="text-center flex-1">
                  <div className="text-[9px] uppercase font-bold text-slate-400">
                    {isOfficer ? 'Printed Base Price' : 'Original Printed MRP'}
                  </div>
                  <div className="text-xs font-black text-slate-200">₹{tamperResult.originalPrice}</div>
                </div>
                <div className="text-amber-400 font-bold">➔</div>
                <div className="text-center flex-1">
                  <div className="text-[9px] uppercase font-bold text-amber-400">
                    {isOfficer ? 'Sticker Price' : 'Shop Sticker Price'}
                  </div>
                  <div className="text-xs font-black text-amber-300">₹{tamperResult.stickerPrice}</div>
                </div>
                <div className="text-center flex-1 bg-amber-900/40 rounded-lg p-1 border border-amber-500/40">
                  <div className="text-[9px] uppercase font-bold text-amber-300">
                    {isOfficer ? 'Arbitrary Hike' : 'Illegal Extra'}
                  </div>
                  <div className="text-[11px] font-black text-amber-200">+{tamperResult.markupPercent}%</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. 5 MANDATORY STATUTORY RULE CARDS WITH INLINE CLICK-TO-EDIT */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800/90 rounded-2xl p-3.5 shadow-[0_0_25px_rgba(6,182,212,0.05)] flex flex-col gap-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-200">
                {isOfficer ? 'Mandatory Declarations (PCR 2011)' : 'Consumer Packaging Checklist'}
              </span>
              <span className="text-[10px] text-slate-400">
                Click snippet to edit • Click pill to toggle
              </span>
            </div>

            <div className="space-y-2">
              {rules.map((rule, idx) => {
                const isPass = rule.status === 'PASS';
                const isEditing = editingRuleId === rule.id;
                const adaptiveRule = getRoleAdaptiveRule(rule);
                const isHovered = hoveredRuleId === rule.id;

                return (
                  <div
                    key={rule.id}
                    onMouseEnter={() => setHoveredRuleId(rule.id)}
                    onMouseLeave={() => setHoveredRuleId(null)}
                    className={`border rounded-xl p-2.5 transition-all cursor-pointer ${
                      isHovered
                        ? 'border-cyan-400/80 bg-slate-900/90 shadow-[0_0_18px_rgba(6,182,212,0.25)] scale-[1.008]'
                        : isPass
                        ? 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                        : 'border-rose-500/40 bg-rose-950/20 hover:border-rose-500/60 shadow-[0_0_12px_rgba(239,68,68,0.1)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      
                      {/* Left: Icon & Description */}
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <div className="mt-0.5 p-1.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                          {getRuleIcon(rule.id)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-slate-100">
                              {adaptiveRule.name}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-1 py-0.2 rounded">
                              {adaptiveRule.ruleCode}
                            </span>
                            <span className="text-[9px] font-mono font-bold text-cyan-400/90 bg-cyan-950/70 border border-cyan-500/30 px-1.5 py-0.2 rounded flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse"></span>
                              <span>Confidence: {rule.confidence || '95.2'}%</span>
                            </span>
                          </div>

                          <p className="text-[10px] text-slate-400 mt-0.5 leading-tight line-clamp-1" title={adaptiveRule.description}>
                            {adaptiveRule.description}
                          </p>

                          {/* Inline Click-to-Edit Snippet */}
                          {isEditing ? (
                            <div className="mt-1.5 flex items-center gap-1.5">
                              <input
                                type="text"
                                autoFocus
                                value={customSnippet}
                                onChange={(e) => setCustomSnippet(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit(rule.id);
                                  if (e.key === 'Escape') setEditingRuleId(null);
                                }}
                                placeholder="Type verified declaration text..."
                                className="flex-1 text-xs px-2 py-1 border border-cyan-500 rounded bg-slate-900 text-slate-100 focus:outline-hidden font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(rule.id)}
                                className="p-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold cursor-pointer"
                                title="Save"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingRuleId(null)}
                                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div 
                              onClick={() => handleStartEdit(rule)}
                              title="Click to edit text snippet inline"
                              className="mt-1.5 bg-slate-950/80 hover:bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-lg px-2 py-1 flex items-center justify-between gap-2 cursor-pointer group transition-colors"
                            >
                              <div className="flex items-baseline gap-1.5 min-w-0">
                                <span className="text-[9px] font-bold uppercase text-slate-500 shrink-0">
                                  {isOfficer ? 'OCR:' : 'Text:'}
                                </span>
                                <span className={`text-[11px] font-mono font-bold truncate ${
                                  isPass ? 'text-slate-200' : 'text-rose-300'
                                }`}>
                                  {rule.extractedText || 'None detected'}
                                </span>
                              </div>
                              <Edit3 className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 shrink-0 transition-colors" />
                            </div>
                          )}

                        </div>
                      </div>

                      {/* Right: Interactive Toggle Status Pill */}
                      <button
                        type="button"
                        onClick={() => onToggleRuleStatus(rule.id)}
                        title="Click to toggle Pass / Issue status"
                        className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-black border transition-all cursor-pointer flex items-center gap-1 ${
                          isPass
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900/60 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                            : 'bg-rose-950/80 text-rose-300 border-rose-500/50 hover:bg-rose-900/60 shadow-[0_0_8px_rgba(239,68,68,0.15)]'
                        }`}
                      >
                        {isPass ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>{adaptiveRule.statusPass}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-2.5 h-2.5 text-rose-400" />
                            <span>{adaptiveRule.statusFail}</span>
                          </>
                        )}
                      </button>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. COLLAPSIBLE PHYSICAL SCALE VERIFIER */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800/90 rounded-2xl overflow-hidden shadow-[0_0_25px_rgba(6,182,212,0.05)]">
            <button
              type="button"
              onClick={() => setIsScaleExpanded(prev => !prev)}
              className="w-full px-4 py-3 bg-slate-900/90 hover:bg-slate-855/90 flex items-center justify-between text-xs font-bold text-slate-200 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-cyan-400" />
                <span>⚖️ {isOfficer ? 'Verify Scale Weight (Optional MPE Audit)' : 'Verify Kitchen / Home Scale Weight [Optional]'}</span>
                {mpeAuditResult?.hasMeasured && (
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    mpeAuditResult.isShortWeight 
                      ? 'bg-rose-950 text-rose-300 border-rose-500/50' 
                      : 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                  }`}>
                    {mpeAuditResult.isShortWeight 
                      ? (isOfficer ? '⚠️ SHORT WEIGHT' : '⚠️ UNDERWEIGHT PACKET') 
                      : (isOfficer ? '✓ WITHIN MPE' : '✓ ACCURATE WEIGHT')}
                  </span>
                )}
              </div>
              <div className="text-slate-400">
                {isScaleExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            <AnimatePresence>
              {isScaleExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 border-t border-slate-800 bg-slate-950/60 flex flex-col gap-3.5"
                >
                  {/* Inputs & Tolerance Specs Grid */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">
                        {isOfficer ? 'Declared Qty' : 'Printed Qty'}
                      </span>
                      <span className="text-xs font-black text-slate-200">
                        {declaredVal} {mpeAuditResult?.mpeSpec?.unit || 'g'}
                      </span>
                    </div>

                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">
                        {isOfficer ? 'Legal MPE' : 'Legal Tolerance'}
                      </span>
                      <span className="text-xs font-black text-cyan-400">
                        ±{mpeAuditResult?.mpeSpec?.mpeValue} {mpeAuditResult?.mpeSpec?.unit || 'g'}
                      </span>
                    </div>

                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">
                        {isOfficer ? 'Min Legal' : 'Min Acceptable'}
                      </span>
                      <span className="text-xs font-black text-emerald-400">
                        {minAllowedVal} {mpeAuditResult?.mpeSpec?.unit || 'g'}
                      </span>
                    </div>
                  </div>

                  {/* Verified Scale Input + Slider */}
                  <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-300">
                        {isOfficer ? 'Enter Standard Calibrated Scale Weight:' : 'Enter Kitchen / Home Scale Weight [Optional]:'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step="0.1"
                          value={scaleWeight}
                          onChange={(e) => onScaleWeightChange(e.target.value)}
                          className="w-20 text-xs font-bold font-mono px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-cyan-300 focus:outline-hidden focus:border-cyan-400"
                        />
                        <span className="text-xs font-bold text-slate-400">{mpeAuditResult?.mpeSpec?.unit || 'g'}</span>
                      </div>
                    </div>

                    {/* Range Slider */}
                    <input
                      type="range"
                      min={toleranceRangeMin}
                      max={toleranceRangeMax}
                      step="0.5"
                      value={scaleWeight}
                      onChange={(e) => onScaleWeightChange(e.target.value)}
                      className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                    />

                    {/* LIVE VISUAL TOLERANCE GAUGE BAR */}
                    <div className="relative pt-2 pb-1">
                      <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex relative">
                        {/* Red short-weight zone */}
                        <div 
                          className="bg-rose-500/70 h-full" 
                          style={{ width: `${minAllowedPercent}%` }}
                          title={`Illegal Short-Weight Zone (< ${minAllowedVal}g)`}
                        />
                        {/* Green legal zone */}
                        <div 
                          className="bg-emerald-500/70 h-full flex-1" 
                          title={`Statutory Legal Tolerance Zone (>= ${minAllowedVal}g)`}
                        />
                      </div>

                      {/* Min legal tick mark */}
                      <div 
                        className="absolute top-1 -translate-x-1/2 flex flex-col items-center pointer-events-none"
                        style={{ left: `${minAllowedPercent}%` }}
                      >
                        <div className="w-0.5 h-5 bg-white shadow-[0_0_4px_#ffffff]"></div>
                        <span className="text-[8px] font-bold font-mono text-slate-400 mt-0.5">
                          Min {minAllowedVal}g
                        </span>
                      </div>

                      {/* Current scale pointer marker */}
                      <motion.div 
                        className="absolute top-1 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10"
                        animate={{ left: `${gaugePercent}%` }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      >
                        <div className={`w-2.5 h-2.5 rounded-full border border-white shadow-md ${
                          mpeAuditResult?.isShortWeight ? 'bg-rose-500 shadow-[0_0_8px_#ef4444]' : 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]'
                        }`}></div>
                        <span className={`text-[8px] font-black font-mono px-1 rounded mt-0.5 ${
                          mpeAuditResult?.isShortWeight ? 'text-rose-300 bg-rose-950' : 'text-cyan-300 bg-slate-900'
                        }`}>
                          {currentWeightNum}g
                        </span>
                      </motion.div>
                    </div>

                  </div>

                  {/* Quick Scale Presets */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Presets:</span>
                    <button
                      type="button"
                      onClick={() => onScaleWeightChange(declaredVal.toString())}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-slate-300 cursor-pointer"
                    >
                      Exact {declaredVal}g
                    </button>
                    <button
                      type="button"
                      onClick={() => onScaleWeightChange((minAllowedVal + 1.5).toString())}
                      className="px-2 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 text-[10px] font-bold text-emerald-300 border border-emerald-500/40 cursor-pointer"
                    >
                      Pass ({minAllowedVal + 1.5}g)
                    </button>
                    <button
                      type="button"
                      onClick={() => onScaleWeightChange((minAllowedVal - 11).toString())}
                      className="px-2 py-0.5 rounded bg-rose-950 hover:bg-rose-900 text-[10px] font-bold text-rose-300 border border-rose-500/40 cursor-pointer"
                    >
                      Deficit ({minAllowedVal - 11}g)
                    </button>
                  </div>

                  {/* Short weight alert if active */}
                  {mpeAuditResult?.isShortWeight && (
                    <div className="p-2.5 rounded-xl border border-rose-500/60 bg-rose-950/50 text-rose-200 text-xs flex items-start gap-2 animate-in fade-in">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold flex items-center justify-between text-[11px]">
                          <span>
                            {isOfficer 
                              ? 'Section 39 Short-Quantity Offense' 
                              : 'Packet is Underweight - Less product received than paid for'}
                          </span>
                          <span className="text-[9px] font-black bg-rose-900/80 px-1 rounded text-rose-200 border border-rose-500/50">
                            Beyond MPE: {mpeAuditResult.illegalDeficitBeyondMpe}g
                          </span>
                        </div>
                        <p className="text-[10px] opacity-90 mt-0.5">
                          {isOfficer 
                            ? mpeAuditResult.penaltyClause 
                            : `Statutory deficit of ${mpeAuditResult.illegalDeficitBeyondMpe}g detected below the maximum permissible error limit under Schedule I. This constitutes an unfair trade practice actionable under Section 39.`}
                        </p>
                      </div>
                    </div>
                  )}

                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 5. WORKSTATION ACTION BUTTONS */}
          <div className="flex items-center gap-3 pt-1">
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={onPrevStep}
              className="px-4 py-3 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 hover:border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(255,255,255,0.05)] transition-all shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={onNextStep}
              className={`flex-1 py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isOfficer
                  ? 'btn-cyan-shimmer text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]'
                  : 'bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]'
              }`}
            >
              <FileText className="w-4 h-4 text-slate-950" />
              <span>
                {isOfficer
                  ? 'Generate Statutory Form VI Notice under Section 36'
                  : 'File Grievance with National Consumer Helpline (NCH)'}
              </span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </motion.button>
          </div>

        </motion.div>

      </div>

    </motion.div>
  );
}
