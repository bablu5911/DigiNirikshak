import React, { useState } from 'react';
import { 
  Printer, 
  ArrowLeft, 
  RotateCcw, 
  Download, 
  Scale, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  ShieldAlert, 
  HeartHandshake,
  UserCheck,
  Send,
  Copy,
  Check,
  QrCode
} from 'lucide-react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

export default function Step3Notice({
  userRole = 'officer',
  activeProfile = null,
  sellerName = '',
  sampleMeta = {},
  labelImage = null,
  activeImageSrc,
  rules = [],
  tamperResult = null,
  crossPanelResult = null,
  mpeAuditResult = null,
  scaleResult = null,
  inspectorName = 'Insp. Rajesh Kumar',
  inspectionRef = 'INSP/LM/2026/8941',
  onPrevStep,
  onResetAll
}) {
  const isOfficer = userRole === 'officer';
  const [copiedDraft, setCopiedDraft] = useState(false);
  const imageToDisplay = labelImage || activeImageSrc;

  // Normalize scale and tamper violation state across schemas
  const activeScaleResult = scaleResult || mpeAuditResult;
  const isScaleViolated = Boolean(activeScaleResult?.isViolated || activeScaleResult?.isShortWeight);
  const isTampered = Boolean(tamperResult?.isTampered || tamperResult?.hasTampering);

  const totalRules = rules.length || 5;
  const passedCount = rules.filter(r => r.status === 'PASS').length;
  const violationCount = totalRules - passedCount;
  const isFullyCompliant = violationCount === 0 && rules.length > 0 && !isTampered && !isScaleViolated;
  const flaggedViolations = rules.filter(r => r.status === 'VIOLATION' || r.status === 'FAIL');

  // -------------------------------------------------------------
  // STATUTORY PENALTY & COMPOUNDING ASSESSMENT COMPUTATION
  // -------------------------------------------------------------
  const penaltyItems = [];

  // 1. Each failed Rule in the 5-point checklist: Add ₹10,000 (under Section 36(1))
  flaggedViolations.forEach((rule) => {
    penaltyItems.push({
      id: `rule-${rule.id}`,
      violationType: `${rule.name} (${rule.ruleCode})`,
      legalSection: 'Section 36(1)',
      amount: 10000,
      description: rule.evidenceDetail || 'Breach of mandatory packaging declaration requirements under PCR 2011.'
    });
  });

  // 2. If tamperResult.isTampered === true (Rule 18(2) Sticker Overwrite): Add ₹25,000
  if (isTampered) {
    penaltyItems.push({
      id: 'rule-18-tamper',
      violationType: 'Price Alteration / Sticker Overwrite above Nominal MRP',
      legalSection: 'Section 36(2) / Rule 18(2)',
      amount: 25000,
      description: tamperResult?.description || 'Altering, smudging or overwriting the retail sale price once marked on the package.'
    });
  }

  // 3. If scaleResult.isViolated === true (Section 39 Short-Quantity Deficit): Add ₹15,000
  if (isScaleViolated) {
    const deficitText = activeScaleResult?.illegalDeficitBeyondMpe 
      ? ` (${activeScaleResult.illegalDeficitBeyondMpe}g beyond legal MPE tolerance)` 
      : '';
    penaltyItems.push({
      id: 'sec-39-short-weight',
      violationType: `Short-Quantity Packaging Deficit${deficitText}`,
      legalSection: 'Section 39 / Sec 36(1)',
      amount: 15000,
      description: activeScaleResult?.legalAct || 'Selling or delivering pre-packaged commodity with deficit beyond Maximum Permissible Error.'
    });
  }

  const totalCompoundingDemand = penaltyItems.reduce((acc, item) => acc + item.amount, 0);
  const hasCompoundingViolations = penaltyItems.length > 0;

  // Structured QR Payloads
  const officerQrPayload = JSON.stringify({
    docType: 'FORM_VI_CHALLAN',
    caseId: inspectionRef,
    officer: inspectorName,
    badge: '#DOCA-8941',
    timestamp: sampleMeta.timestamp || new Date().toISOString(),
    violationsCount: penaltyItems.length || violationCount,
    penaltyDemand: totalCompoundingDemand > 0 ? `₹${totalCompoundingDemand.toLocaleString('en-IN')}` : '₹0 (COMPLIANT)',
    verificationUrl: `https://consumeraffairs.nic.in/verify?docket=${encodeURIComponent(inspectionRef)}`
  });

  const citizenQrPayload = JSON.stringify({
    docType: 'NCH_GRIEVANCE_C1',
    token: inspectionRef,
    complainant: inspectorName,
    seller: sellerName.trim() || 'Unspecified Retail Store',
    portal: 'National Consumer Helpline',
    helpline: '1915',
    timestamp: sampleMeta.timestamp || new Date().toISOString(),
    trackingUrl: `https://consumerhelpline.gov.in/track?token=${encodeURIComponent(inspectionRef)}`
  });

  const activeQrPayload = isOfficer ? officerQrPayload : citizenQrPayload;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyDraft = async () => {
    let draft = '';
    if (!isOfficer) {
      const issueList = flaggedViolations.length > 0 
        ? flaggedViolations.map(v => `• ${v.name} (${v.ruleCode})`).join('\n')
        : '• Mandatory packaging declaration defect';

      draft = `*CONSUMER GRIEVANCE SUMMARY (NCH 1915)*
*Token:* ${inspectionRef}
*Date:* ${sampleMeta.timestamp || new Date().toLocaleString()}
*Product:* ${sampleMeta.name || 'Packaged Commodity'} (Batch: ${sampleMeta.batchNo || 'N/A'})
*Seller / Purchased From:* ${sellerName.trim() || 'Retail Vendor / Store'}

*Issues Detected:*
${issueList}
${tamperResult?.hasTampering ? `*Price Tampering:* Factory MRP ₹${tamperResult.originalPrice} overwritten by shopkeeper with sticker ₹${tamperResult.stickerPrice} (+₹${tamperResult.markup}, +${tamperResult.markupPercent}% illegal markup)\n` : ''}${mpeAuditResult?.isShortWeight ? `*Short Quantity Deficit:* Declared ${mpeAuditResult.mpeSpec?.declaredValue}g vs Actual Scale Weight ${mpeAuditResult.measuredWeight}g (Illegal Deficit: ${mpeAuditResult.illegalDeficitBeyondMpe}g beyond legal tolerance)\n` : ''}${crossPanelResult?.hasContradiction ? `*Deceptive Packaging:* Front claims "${crossPanelResult.frontClaim}" vs Back declaration "${crossPanelResult.backDeclaration}"\n` : ''}
*Action Requested:* Immediate investigation by DoCA / CCPA under Consumer Protection Act 2019, refund of excess charged, and penalty on seller.
*Helpline:* Toll-Free 1915 | WhatsApp: +91 8800001915 | Portal: consumerhelpline.gov.in`;
    } else {
      const issueList = flaggedViolations.length > 0 
        ? flaggedViolations.map(v => `• ${v.name} [${v.ruleCode}]`).join('\n')
        : '• Non-compliance with Packaged Commodities Rules, 2011';

      draft = `*DOCA STATUTORY ENFORCEMENT SUMMARY*
*Docket No:* ${inspectionRef}
*Date:* ${sampleMeta.timestamp || new Date().toLocaleString()}
*Commodity:* ${sampleMeta.name || 'Packaged Commodity'} (Batch: ${sampleMeta.batchNo || 'N/A'})
*Inspecting Officer:* ${inspectorName} (Badge: #DOCA-8941)
*Zone:* Directorate of Legal Metrology (Regional Zone 4)

*Violations Flagged:*
${issueList}
${isTampered ? `*Rule 18(2) Offense:* Base price ₹${tamperResult.originalPrice} overwritten to ₹${tamperResult.stickerPrice} (+${tamperResult.markupPercent}%)\n` : ''}${isScaleViolated ? `*Section 39 Short-Quantity:* ${activeScaleResult.illegalDeficitBeyondMpe || 'Deficit'}g shortage beyond Schedule I MPE\n` : ''}
${totalCompoundingDemand > 0 ? `*Assessed Compounding Demand:* ₹${totalCompoundingDemand.toLocaleString('en-IN')} (Under Sec 36, 39 & 48)\n` : ''}*Statutory Action:* Form VI Notice dispatched. 15-day statutory compounding window initiated under Section 48 of Legal Metrology Act, 2009.`;
    }

    try {
      await navigator.clipboard.writeText(draft);
      setCopiedDraft(true);
      setTimeout(() => setCopiedDraft(false), 3000);
    } catch (err) {
      console.error('Failed to copy draft:', err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6"
    >
      
      {/* Top Action Control Bar (Screen Only) */}
      <div className="no-print bg-slate-900/80 backdrop-blur-md border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-[0_0_25px_rgba(6,182,212,0.05)] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Document Stage
            </span>
            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md border ${
              isOfficer 
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' 
                : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
            }`}>
              {isOfficer 
                ? 'Form VI Statutory Order under Section 18 / 36 / 39' 
                : 'National Consumer Helpline (NCH 1915) • CPA 2019'}
            </span>
          </div>
          <h2 className="text-base font-extrabold text-slate-100 mt-0.5">
            {isOfficer 
              ? 'Official Statutory Enforcement Challan (Form VI)' 
              : 'Citizen Consumer Grievance Dossier & Petition'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onPrevStep}
            className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Inspection</span>
          </button>

          {/* 1-CLICK COPY WHATSAPP / SMS DRAFT BUTTON */}
          <button
            type="button"
            onClick={handleCopyDraft}
            className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all ${
              copiedDraft
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                : 'border-slate-800 bg-slate-900 hover:bg-slate-850 text-slate-200 hover:border-cyan-500/40'
            }`}
            title="Copy formatted summary to paste into WhatsApp (NCH +91 8800001915) or SMS"
          >
            {copiedDraft ? (
              <>
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                <span className="text-emerald-300 font-black">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-cyan-400" />
                <span>{isOfficer ? 'Copy Dispatch Summary' : 'Copy NCH WhatsApp / SMS Draft'}</span>
              </>
            )}
          </button>

          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handlePrint}
            className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.35)] ${
              isOfficer
                ? 'btn-cyan-shimmer text-slate-950'
                : 'bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 text-slate-950'
            }`}
          >
            <Printer className="w-4 h-4 text-slate-950" />
            <span>
              {isOfficer ? 'Print / Save Form VI PDF' : 'Download / Print NCH Grievance Dossier'}
            </span>
          </motion.button>

          <button
            type="button"
            onClick={onResetAll}
            className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>Audit Another Product</span>
          </button>
        </div>
      </div>

      {/* FORMAL 1-PAGE A4 OFFICIAL DOCUMENT VIEWPORT */}
      <div className="bg-white border border-slate-300/90 rounded-2xl p-6 sm:p-10 shadow-[0_12px_40px_rgb(0,0,0,0.06)] max-w-4xl mx-auto w-full font-serif text-slate-900 leading-snug relative overflow-hidden">
        
        {/* FAINT 4% OPACITY OFFICIAL STATUTORY BACKGROUND WATERMARK */}
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden z-0 opacity-[0.04]">
          <div className="rotate-[-28deg] flex flex-col items-center justify-center text-center">
            {/* Watermark Circular Ashoka & Scales Motif */}
            <svg className="w-[520px] h-[520px] text-slate-950 stroke-current" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="92" strokeWidth="3" strokeDasharray="6 3" />
              <circle cx="100" cy="100" r="84" strokeWidth="1.5" />
              <path d="M100 25 V175 M25 100 H175 M50 50 L150 150 M50 150 L150 50" strokeWidth="0.8" />
              <path d="M100 45 L100 135 M60 70 L140 70 M60 70 L45 105 L75 105 Z M140 70 L125 105 L155 105 Z" strokeWidth="2.5" />
              <circle cx="100" cy="145" r="14" strokeWidth="2" />
            </svg>
            <div className="font-sans font-black tracking-[0.25em] text-3xl uppercase text-slate-900 mt-2">
              GOVERNMENT OF INDIA
            </div>
            <div className="font-sans font-bold tracking-[0.15em] text-lg uppercase text-slate-800 mt-1">
              LEGAL METROLOGY ENFORCEMENT • ACT 2009
            </div>
            <div className="font-mono text-xs uppercase text-slate-700 tracking-widest mt-1">
              STATUTORY E-CHALLAN & OFFICIAL DOCKET
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INSTITUTIONAL NATIONAL HEADER (OFFICER VS CITIZEN)                       */}
        {/* ========================================================================= */}
        <div className="text-center border-b-2 border-slate-900 pb-3 mb-4 relative z-10">
          <div className="text-xs font-sans font-extrabold uppercase tracking-widest text-slate-700">
            GOVERNMENT OF INDIA • MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION
          </div>
          
          {isOfficer ? (
            <>
              <div className="text-sm font-sans font-bold uppercase tracking-wider text-slate-900 mt-0.5">
                DIRECTORATE OF LEGAL METROLOGY (WEIGHTS & MEASURES WING)
              </div>
              <div className="mt-2 text-base sm:text-lg font-bold uppercase underline underline-offset-4 text-slate-950">
                {isFullyCompliant
                  ? 'CERTIFICATE OF STATUTORY PACKAGING COMPLIANCE'
                  : 'FORM VI: STATUTORY ORDER UNDER SECTION 18, 36 & 39 OF LEGAL METROLOGY ACT, 2009'}
              </div>
              <div className="text-[11px] font-sans text-slate-600 mt-1">
                Enacted under Legal Metrology Act, 2009 & Legal Metrology (Packaged Commodities) Rules, 2011
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-sans font-bold uppercase tracking-wider text-slate-900 mt-0.5">
                NATIONAL CONSUMER HELPLINE (NCH 1915) • CENTRAL CONSUMER PROTECTION AUTHORITY (CCPA)
              </div>
              <div className="mt-2 text-base sm:text-lg font-bold uppercase underline underline-offset-4 text-slate-950">
                {isFullyCompliant
                  ? 'VERIFIED CITIZEN PACKAGING ASSESSMENT REPORT'
                  : 'FORM C-1: FORMAL CONSUMER GRIEVANCE PETITION UNDER CONSUMER PROTECTION ACT, 2019'}
              </div>
              <div className="text-[11px] font-sans text-slate-600 mt-1">
                Filed pursuant to Section 2(47) (Unfair Trade Practice) & Section 89 (Misleading Packaging & Pricing)
              </div>
            </>
          )}
        </div>

        {/* ========================================================================= */}
        {/* DOCKET METADATA MATRIX                                                    */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 gap-2 text-xs font-sans mb-4 border border-slate-300 p-3 rounded-lg bg-slate-50/70">
          <div>
            <strong className="text-slate-700">
              {isOfficer ? 'Inspection Docket No:' : 'Grievance Token No:'}
            </strong>{' '}
            {inspectionRef}
          </div>
          <div><strong className="text-slate-700">Date & Timestamp:</strong> {sampleMeta.timestamp}</div>
          <div><strong className="text-slate-700">Commodity Name:</strong> {sampleMeta.name}</div>
          <div><strong className="text-slate-700">Batch / Lot Identifier:</strong> {sampleMeta.batchNo}</div>
          
          <div>
            <strong className="text-slate-700">
              {isOfficer ? 'Inspecting Officer:' : 'Complainant Consumer:'}
            </strong>{' '}
            {inspectorName}
          </div>

          <div>
            <strong className="text-slate-700">
              {isOfficer ? 'Statutory Verdict:' : 'Consumer Rights Verdict:'}
            </strong>{' '}
            <span className={`font-bold ${isFullyCompliant ? 'text-emerald-700' : 'text-rose-700'}`}>
              {isFullyCompliant 
                ? (isOfficer ? 'FULLY COMPLIANT' : 'NO DECEPTIVE PRACTICES OBSERVED') 
                : (isOfficer ? 'NON-COMPLIANT (ACTIONABLE UNDER LAW)' : 'DECEPTIVE TRADE DEFECTS OBSERVED')}
            </span>
          </div>

          {/* Citizen Mode: Explicit Seller / Respondent Details */}
          {!isOfficer && (
            <div className="col-span-2 bg-amber-50/80 border border-amber-200/90 p-2 rounded-lg flex items-center justify-between text-xs">
              <div>
                <strong className="text-slate-800">Respondent / Opposite Party (Store / Vendor):</strong>{' '}
                <span className="font-bold text-slate-950">
                  {sellerName.trim() || 'Unspecified Retail Store / Vendor'}
                </span>
              </div>
              <span className="text-[10px] font-sans font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300">
                Respondent Details
              </span>
            </div>
          )}

          {/* Officer or Citizen specific channel info */}
          <div className="col-span-2 pt-1 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
            <span>
              <strong>{isOfficer ? 'Jurisdiction:' : 'Redressal Channel:'}</strong>{' '}
              {isOfficer 
                ? 'Regional Directorate (Zone 4) • Legal Metrology Enforcement Cell' 
                : 'National Consumer Helpline (Toll-Free: 1915) • Integrated Redressal Portal'}
            </span>
            <span>
              <strong>Authority:</strong> {isOfficer ? 'DoCA / State LM Wing' : 'DoCA / CCPA'}
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* EVIDENCE SNAPSHOT & FINDING SUMMARY                                       */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-12 gap-4 mb-4">
          
          {/* Packet Thumbnail */}
          <div className="col-span-4 border border-slate-300 rounded-lg p-2 flex flex-col items-center justify-center bg-slate-50">
            <div className="text-[10px] font-sans font-bold text-slate-500 uppercase mb-1">
              Physical Evidence Snapshot
            </div>
            <div className="w-full h-36 flex items-center justify-center overflow-hidden bg-white border border-slate-200 rounded">
              {imageToDisplay ? (
                <img
                  src={imageToDisplay}
                  alt="Packaging Evidence"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="text-xs text-slate-400 font-sans">No image attached</span>
              )}
            </div>
            <div className="text-[10px] font-sans text-slate-500 mt-1">
              Evidence Hash: SHA256-{sampleMeta.batchNo}
            </div>
          </div>

          {/* Finding Narrative */}
          <div className="col-span-8 flex flex-col justify-between border border-slate-300 rounded-lg p-3 font-sans bg-slate-50/50">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-600">
                  {isOfficer ? 'Audit Finding' : 'Grievance Narrative'}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    isFullyCompliant ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {passedCount}/5 Mandatory Checks Cleared
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 mt-1">
                {isFullyCompliant
                  ? 'All Mandatory Declarations & MPE Tolerances Satisfied'
                  : isOfficer 
                    ? 'Forensic Non-Compliance Observed (Sections 18 / 36 / 39 & Rule 18(2))' 
                    : 'Unfair Trade Practice & Consumer Rights Infraction Flagged'}
              </h4>

              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {isFullyCompliant
                  ? (isOfficer
                    ? 'The inspected retail packaging conforms to all statutory provisions of the Legal Metrology (Packaged Commodities) Rules, 2011.'
                    : 'The packaging of this commodity conforms to consumer rights declarations with accurate weight and transparent pricing.')
                  : (isOfficer
                    ? 'Notice is hereby drawn to the specific non-compliances, pricing infractions, and weight deficits detailed below. Selling or distributing commodities with altered prices or short weight is a cognizable offense.'
                    : `The consumer submits this grievance petition against "${sellerName.trim() || 'the retail vendor'}" regarding unfair trade practice, misleading packaging disclosures, price tampering above nominal MRP, and/or short quantity filling under the Consumer Protection Act, 2019.`)}
              </p>
            </div>

            <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-200 flex items-center justify-between">
              <span>{isOfficer ? 'Enforcement Cell: Zone 4 Directorate' : 'Portal: Consumer Protection Redressal Engine'}</span>
              <span>Audit System: DigiNirikshak Forensic Engine</span>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* FORENSIC FRAUD & WEIGHT DEFICIT BOX (IF FLAGGED)                          */}
        {/* ========================================================================= */}
        {(tamperResult?.hasTampering || mpeAuditResult?.isShortWeight || crossPanelResult?.hasContradiction) && (
          <div className="mb-4 font-sans border-2 border-rose-400 bg-rose-50/60 p-3 rounded-lg text-xs">
            <div className="text-xs font-extrabold uppercase text-rose-900 mb-1.5 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>
                {isOfficer 
                  ? 'Forensic & Fraud Assessment Findings' 
                  : 'Actionable Consumer Rights Violations (Consumer Protection Act, 2019)'}
              </span>
            </div>

            <div className="space-y-1.5 text-slate-900 text-[11px]">
              {/* Tamper finding */}
              {tamperResult?.hasTampering && (
                <div className="flex items-start gap-2 bg-white/80 p-2 rounded border border-rose-200">
                  <span className="font-bold text-rose-800 min-w-36">
                    {isOfficer ? '• Rule 18(2) Infraction:' : '• Unlawful Overcharging:'}
                  </span>
                  <span>
                    Retail price tampering detected. Declared base price ₹{tamperResult.originalPrice} overwritten with sticker ₹{tamperResult.stickerPrice} (+₹{tamperResult.markup}, +{tamperResult.markupPercent}% arbitrary markup). {isOfficer ? 'Offense under Rule 18(2) PCR 2011.' : 'Unfair trade practice harming retail consumer.'}
                  </span>
                </div>
              )}

              {/* MPE Short weight finding */}
              {mpeAuditResult?.isShortWeight && (
                <div className="flex items-start gap-2 bg-white/80 p-2 rounded border border-rose-200">
                  <span className="font-bold text-rose-800 min-w-36">
                    {isOfficer ? '• Section 39 Offense:' : '• Short-Quantity Cheating:'}
                  </span>
                  <span>
                    Short-Quantity Deficit: Declared {mpeAuditResult.mpeSpec.declaredValue}g vs Verified Scale Weight {mpeAuditResult.measuredWeight}g. Net Deficit = {mpeAuditResult.deficit}g ({mpeAuditResult.deficitPercent}%). Unlawful shortage exceeds First Schedule MPE threshold by {mpeAuditResult.illegalDeficitBeyondMpe}g.
                  </span>
                </div>
              )}

              {/* Cross panel contradiction */}
              {crossPanelResult?.hasContradiction && (
                <div className="flex items-start gap-2 bg-white/80 p-2 rounded border border-rose-200">
                  <span className="font-bold text-rose-800 min-w-36">
                    {isOfficer ? '• Section 18 / 38 Claim:' : '• Misleading Claim (Sec 89):'}
                  </span>
                  <span>
                    Deceptive Cross-Panel Inconsistency: Front display declares '{crossPanelResult.frontClaim}' while Back declaration states '{crossPanelResult.backDeclaration}'.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FLAGGED VIOLATIONS TABLE                                                  */}
        {/* ========================================================================= */}
        <div className="font-sans mb-4">
          <div className="text-xs font-bold uppercase text-slate-700 mb-1.5 tracking-wide">
            {isFullyCompliant 
              ? 'Statutory Compliance Matrix' 
              : isOfficer 
                ? 'Statutory Declaration Findings (PCR 2011)' 
                : 'Summary of Packaging Deficiencies (Evidence for NCH)'}
          </div>

          <table className="w-full text-xs border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <th className="border border-slate-300 px-2 py-1.5 text-left w-6">#</th>
                <th className="border border-slate-300 px-2 py-1.5 text-left w-40">Statutory Provision</th>
                <th className="border border-slate-300 px-2 py-1.5 text-left">Observed Extracted Text</th>
                <th className="border border-slate-300 px-2 py-1.5 text-center w-24">Finding</th>
              </tr>
            </thead>
            <tbody>
              {(isFullyCompliant ? rules : flaggedViolations).map((rule, idx) => {
                const isPass = rule.status === 'PASS';
                return (
                  <tr key={rule.id} className={isPass ? 'bg-white' : 'bg-rose-50/50'}>
                    <td className="border border-slate-300 px-2 py-1.5 text-center font-mono text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5">
                      <div className="font-bold text-slate-900">{rule.name}</div>
                      <div className="text-[10px] text-slate-500">{rule.ruleCode}</div>
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 font-mono text-[11px]">
                      <span className={isPass ? 'text-slate-800' : 'text-rose-700 font-bold'}>
                        {rule.extractedText}
                      </span>
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-center font-bold">
                      {isPass ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                          PASS
                        </span>
                      ) : (
                        <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[10px] border border-rose-200">
                          VIOLATION
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ========================================================================= */}
        {/* STATUTORY CLAUSE / PRAYER FOR RELIEF (ROLE SPECIFIC)                      */}
        {/* ========================================================================= */}
        <div className="border-t border-slate-400 pt-3 text-[11px]">
          {!isFullyCompliant ? (
            isOfficer ? (
              /* Officer: Punitive Show-Cause Notice under Legal Metrology Act */
              <div className="bg-rose-50 border border-rose-300 p-2.5 rounded-lg mb-3 font-sans">
                <span className="font-bold text-rose-800 uppercase">
                  Statutory Show-Cause Notice Under Section 36 & Section 39: 
                </span>{' '}
                <span className="text-slate-800">
                  You are hereby notified that the inspected pre-packaged commodity fails to declare mandatory legal disclosures and/or exhibits price tampering and/or short-weight filling. You are called upon to show cause within 15 calendar days why penal proceedings under Section 36 (penalties up to ₹25,000) and Section 39 (penalties up to ₹10,000 for first offence, and imprisonment up to 1 year for subsequent offences) of the Legal Metrology Act, 2009 should not be initiated against your enterprise.
                </span>
              </div>
            ) : (
              /* Citizen: Prayer for Relief under Consumer Protection Act 2019 */
              <div className="bg-cyan-50 border border-cyan-300 p-2.5 rounded-lg mb-3 font-sans">
                <span className="font-bold text-cyan-900 uppercase">
                  Formal Prayer for Relief under Consumer Protection Act, 2019 (Sections 2(47), 35 & 89): 
                </span>{' '}
                <span className="text-slate-800">
                  The complainant respectfully requests the National Consumer Helpline and Central Consumer Protection Authority (CCPA) to: (1) Direct the manufacturer/vendor to refund the excess price charged over MRP and compensate for unlawful short quantity; (2) Initiate immediate regulatory inquiry into deceptive packaging practices; and (3) Impose statutory penalties for misleading trade declarations.
                </span>
              </div>
            )
          ) : (
            <div className="bg-emerald-50 border border-emerald-300 p-2.5 rounded-lg mb-3 font-sans">
              <span className="font-bold text-emerald-800 uppercase">
                {isOfficer ? 'Compliance Certification: ' : 'Consumer Verification Clearance: '}
              </span>{' '}
              <span className="text-slate-800">
                {isOfficer 
                  ? 'The inspected pre-packaged commodity clears all statutory declarations mandated by the Legal Metrology (Packaged Commodities) Rules, 2011 and satisfies MPE tolerance thresholds. Cleared for wholesale and retail marketing across India.' 
                  : 'The scanned packaging contains transparent statutory labeling, valid metric units, verified price integrity, and conforms to standard consumer disclosure norms.'}
              </span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STATUTORY PENALTY & COMPOUNDING ASSESSMENT TABLE (OFFICER MODE ONLY)     */}
          {/* ========================================================================= */}
          {isOfficer && hasCompoundingViolations && (
            <div className="font-sans mb-4 border border-rose-300 print:border-black rounded-lg bg-rose-50/40 print:bg-white p-3.5">
              
              {/* Header Bar with Total Penalty Demand Badge */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5 pb-2 border-b border-rose-200 print:border-black">
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-rose-950 print:text-black flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-rose-700 print:text-black shrink-0" />
                    <span>STATUTORY COMPOUNDING FINE ASSESSMENT</span>
                  </div>
                  <div className="text-[10px] text-slate-600 print:text-black mt-0.5">
                    Assessed under Section 36(1), Section 36(2), Section 39 & Section 48 of Legal Metrology Act, 2009
                  </div>
                </div>

                {/* Highlighted TOTAL PENALTY DEMAND badge */}
                <div className="bg-rose-950 print:bg-white text-white print:text-black px-3.5 py-1.5 rounded-lg shadow-sm border border-rose-900 print:border-2 print:border-black flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-rose-200 print:text-black">
                    TOTAL STATUTORY DEMAND:
                  </span>
                  <span className="text-sm font-black font-mono tracking-tight text-white print:text-black">
                    ₹{totalCompoundingDemand.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Assessment Itemized Table */}
              <table className="w-full text-xs border-collapse border border-slate-300 print:border-black mb-2.5">
                <thead>
                  <tr className="bg-slate-100 print:bg-slate-200 text-slate-800 print:text-black font-bold border-b border-slate-300 print:border-black text-[11px]">
                    <th className="border border-slate-300 print:border-black px-2.5 py-1.5 text-left w-7">#</th>
                    <th className="border border-slate-300 print:border-black px-2.5 py-1.5 text-left">Violation Type</th>
                    <th className="border border-slate-300 print:border-black px-2.5 py-1.5 text-center w-36">Legal Section</th>
                    <th className="border border-slate-300 print:border-black px-2.5 py-1.5 text-right w-44">Assessed Compounding Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 print:divide-black">
                  {penaltyItems.map((item, idx) => (
                    <tr key={item.id} className="bg-white print:bg-white text-[11px]">
                      <td className="border border-slate-300 print:border-black px-2.5 py-1.5 text-center font-mono text-slate-500 print:text-black font-bold">
                        {idx + 1}
                      </td>
                      <td className="border border-slate-300 print:border-black px-2.5 py-1.5">
                        <div className="font-bold text-slate-900 print:text-black">{item.violationType}</div>
                        <div className="text-[10px] text-slate-500 print:text-black">{item.description}</div>
                      </td>
                      <td className="border border-slate-300 print:border-black px-2.5 py-1.5 text-center font-mono font-bold text-slate-700 print:text-black">
                        {item.legalSection}
                      </td>
                      <td className="border border-slate-300 print:border-black px-2.5 py-1.5 text-right font-mono font-bold text-rose-700 print:text-black">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                  {/* Summary Total Row */}
                  <tr className="bg-slate-50 print:bg-slate-100 font-bold border-t-2 border-slate-400 print:border-black text-[11px]">
                    <td colSpan={3} className="border border-slate-300 print:border-black px-2.5 py-1.5 text-right uppercase tracking-wider text-slate-800 print:text-black">
                      Total Compounding Sum Payable:
                    </td>
                    <td className="border border-slate-300 print:border-black px-2.5 py-1.5 text-right font-mono text-sm font-black text-rose-800 print:text-black">
                      ₹{totalCompoundingDemand.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Legal Statutory Warning under Section 48 (15-day compounding window) */}
              <div className="bg-amber-50/90 print:bg-white border border-amber-300 print:border-black p-2.5 rounded text-[10.5px] text-slate-800 print:text-black leading-relaxed flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 print:text-black shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-900 print:text-black uppercase">
                    Statutory Notice under Section 48 (Compounding of Offences):
                  </span>{' '}
                  Pursuant to Section 48 of the Legal Metrology Act, 2009, offences punishable under Section 36 and Section 39 may be compounded by the authorised compounding officer before or after the institution of prosecution. The offender is hereby granted a statutory compounding window of <strong>fifteen (15) calendar days</strong> from the date of service of this notice to voluntarily compound the recorded infractions by depositing the assessed sum of <strong>₹{totalCompoundingDemand.toLocaleString('en-IN')}</strong> into the designated Government treasury head. Failure to compound within the stipulated 15 days shall result in initiation of formal criminal prosecution before the Court of Judicial Magistrate First Class under Section 36 / Section 39 without further notice.
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* SIGN-OFF & DIGITAL ATTESTATION BLOCK (WITH DYNAMIC SVG QR CODE)           */}
          {/* ========================================================================= */}
          <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-4 pt-3 font-sans text-xs border-t border-slate-300">
            <div className="flex items-center gap-3">
              {/* Dynamic Vector SVG QR Code */}
              <div className="p-1.5 bg-white border-2 border-slate-900 rounded-lg shadow-2xs flex flex-col items-center shrink-0">
                <QRCodeSVG 
                  value={activeQrPayload}
                  size={74}
                  level="M"
                  includeMargin={false}
                />
                <span className="text-[7.5px] font-mono font-black text-slate-800 mt-1 uppercase tracking-wider">
                  {isOfficer ? 'DoCA Verify' : 'NCH Track'}
                </span>
              </div>

              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                  {isOfficer ? 'Statutory Docket Verification Record' : 'Citizen Grievance Submission Record'}
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  {isOfficer ? 'State Legal Metrology Inspectorate' : 'National Consumer Helpline (NCH 1915)'}
                </div>
                <div className="text-[11px] text-slate-600">
                  {isOfficer 
                    ? 'Official digital seal affixed under IT Act, 2000' 
                    : 'Authenticated via Citizen Verification Token • CCPA Integrated'}
                </div>
                <div className="text-[9px] font-mono text-cyan-800 font-bold mt-0.5">
                  Scan QR code on mobile to verify docket authentic hash & status
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 ml-auto sm:ml-0">
              {/* AUTHENTIC OFFICIAL CIRCULAR SVG DIGITAL STAMP */}
              <div 
                className={`relative w-24 h-24 rounded-full border-2 border-dashed flex flex-col items-center justify-center p-1.5 rotate-[-10deg] select-none shadow-xs ${
                  isOfficer 
                    ? 'border-indigo-800 text-indigo-950 bg-indigo-50/50' 
                    : 'border-rose-800 text-rose-950 bg-rose-50/50'
                }`}
                title={isOfficer ? 'Official Directorate of Legal Metrology Seal' : 'National Consumer Helpline Redressal Seal'}
              >
                {/* Concentric Decorative Ring */}
                <div className={`absolute inset-0.5 rounded-full border ${isOfficer ? 'border-indigo-700/60' : 'border-rose-700/60'}`}></div>
                
                {/* Circular Stamp Text */}
                <div className="text-[6.5px] font-sans font-black uppercase text-center leading-tight tracking-wider">
                  {isOfficer ? 'DIRECTORATE OF LEGAL METROLOGY' : 'CENTRAL CONSUMER PROTECTION'}
                </div>

                <div className={`my-0.5 w-14 h-[1px] ${isOfficer ? 'bg-indigo-700/60' : 'bg-rose-700/60'}`}></div>

                {/* Center Badge Text */}
                <div className="text-[7.5px] font-mono font-black text-center uppercase tracking-tight py-0.5 px-1.5 bg-white/80 rounded border border-current shadow-2xs">
                  {isOfficer ? 'VERIFIED & SIGNED' : 'NCH E-DOCKET'}
                </div>
                
                <div className={`my-0.5 w-14 h-[1px] ${isOfficer ? 'bg-indigo-700/60' : 'bg-rose-700/60'}`}></div>

                <div className="text-[6px] font-mono font-bold uppercase text-center tracking-wider">
                  {isOfficer ? 'GOVT. OF INDIA // PCR 2011' : 'STAMPED // CCPA 2019'}
                </div>
              </div>

              {/* Signature Line & Authority Metadata */}
              <div className="text-right">
                <div className="border-b-2 border-slate-900 w-44 mb-1 ml-auto"></div>
                <div className="font-bold text-slate-950 text-sm">{inspectorName}</div>
                <div className="text-[10px] text-slate-600">
                  {isOfficer 
                    ? 'Authorized Legal Metrology Inspector' 
                    : 'Aggrieved Citizen Consumer / Complainant'}
                </div>
                <div className="text-[9px] text-slate-500 font-mono">
                  {isOfficer 
                    ? 'Regional Directorate (Zone 4) • #DOCA-8941' 
                    : 'NCH Token: ' + inspectionRef}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </motion.div>
  );
}

