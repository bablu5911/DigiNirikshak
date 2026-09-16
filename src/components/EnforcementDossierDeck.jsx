import React, { useState } from 'react';
import { 
  Printer, 
  Copy, 
  Check, 
  QrCode, 
  RotateCcw, 
  Download, 
  FileText, 
  Send,
  ShieldCheck,
  AlertTriangle,
  MailCheck,
  Building2,
  Calendar,
  Scale,
  Mail,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { markNoticeDispatched, saveAuditRecord } from '../utils/historyStorage';

export default function EnforcementDossierDeck({
  userRole = 'officer',
  activeProfile = null,
  sellerName = '',
  sampleMeta = {},
  rules = [],
  tamperResult = null,
  mpeAuditResult = null,
  inspectorName = 'Insp. Rajesh Kumar',
  inspectionRef = 'INSP/LM/2026/8941',
  onResetAll,
  onNoticeDispatched
}) {
  const isOfficer = userRole === 'officer';
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [downloadedJson, setDownloadedJson] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);
  const [dispatchInfo, setDispatchInfo] = useState(null);
  const [vendorReplyDraft, setVendorReplyDraft] = useState('');

  // SENDER & TARGET MANUFACTURER EMAIL INTEGRATION
  const senderEmail = activeProfile?.email || (isOfficer ? 'rajesh.kumar@doca.gov.in' : 'jaya.menaria@gmail.com');
  const senderName = activeProfile?.name || inspectorName;
  const rawVendor = (sellerName || (sampleMeta?.name ? sampleMeta.name.split('(')[0] : '') || 'Packaged Commodity Manufacturer').trim();
  const companySlug = rawVendor.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15) || 'producer';
  const targetEmail = `compliance@${companySlug}.in`;
  const noticeSubject = `[STATUTORY SCN] Show Cause Notice under Rule 32 of PCR 2011 - Batch ${sampleMeta.batchNo || 'N/A'}`;

  const isScaleViolated = Boolean(mpeAuditResult?.isShortWeight || mpeAuditResult?.isViolated);
  const isTampered = Boolean(tamperResult?.hasTampering);
  const totalRules = rules.length || 5;
  const passedCount = rules.filter(r => r.status === 'PASS').length;
  const violationCount = totalRules - passedCount;
  const isFullyCompliant = violationCount === 0 && rules.length > 0 && !isTampered && !isScaleViolated;
  const flaggedViolations = rules.filter(r => r.status === 'VIOLATION' || r.status === 'FAIL');

  // Statutory violations under Legal Metrology Act
  const penaltyItems = [];
  flaggedViolations.forEach((rule) => {
    penaltyItems.push({
      id: `rule-${rule.id}`,
      clause: `${rule.name} [${rule.ruleCode}]`,
      section: 'Section 36(1)',
      defect: rule.evidenceDetail || 'Missing or non-compliant mandatory statutory declaration.'
    });
  });

  if (isTampered) {
    penaltyItems.push({
      id: 'rule-18-tamper',
      clause: 'Rule 18(2) - Retail Sale Price Alteration / Sticker Overwrite',
      section: 'Section 36(2) / Rule 18(2)',
      defect: 'Unauthorized retail price alteration / over-stickering of declared MRP'
    });
  }

  if (isScaleViolated) {
    penaltyItems.push({
      id: 'sec-39-short-weight',
      clause: 'Section 39 - Short-Quantity Packaging Deficit beyond MPE',
      section: 'Section 39',
      defect: `Shortage of ${mpeAuditResult?.illegalDeficitBeyondMpe}g exceeding Schedule I Maximum Permissible Error`
    });
  }

  // Pre-filled statutory email draft for external email clients
  const mailtoBody = `GOVERNMENT OF INDIA • MINISTRY OF CONSUMER AFFAIRS
${isOfficer ? 'DIRECTORATE OF LEGAL METROLOGY (WEIGHTS & MEASURES WING)' : 'NATIONAL CONSUMER HELPLINE • CENTRAL CONSUMER PROTECTION AUTHORITY'}

FORM LM/SCN-2026: STATUTORY NOTICE TO SHOW CAUSE
Issued under Rule 32 of PCR 2011 & Sections 18 & 36 of Legal Metrology Act, 2009

FROM (DISPATCHING SENDER):
${senderName} <${senderEmail}>
Role/Jurisdiction: ${activeProfile?.accessLevel || 'Authorized Legal Metrology Authority'}
Docket Reference: ${inspectionRef}

TO (RESPONDENT PACKER / MANUFACTURER):
Compliance & Regulatory Affairs Department
${rawVendor} <${targetEmail}>

DATE OF AUDIT: ${sampleMeta.timestamp || new Date().toLocaleDateString('en-IN')}
COMMODITY: ${sampleMeta.name}
BATCH NUMBER: ${sampleMeta.batchNo}

STATUTORY DEFECTS & VIOLATIONS DETECTED:
${penaltyItems.map((item, idx) => `(${idx + 1}) ${item.clause}\n    Defect: ${item.defect}\n    Statutory Section: ${item.section}`).join('\n\n')}

STATUTORY DIRECTIVE TO SHOW CAUSE:
You are hereby called upon and directed to submit your written explanation within 15 (fifteen) days from receipt of this notice, explaining clearly the grounds and reasons as to why the aforementioned mandatory statutory declarations were violated.

TAKE NOTICE:
If a satisfactory written explanation is not submitted within the stipulated 15-day period, the challan will be issued to your company, and formal legal proceedings under the Legal Metrology Act, 2009 shall be initiated without further reference.

OFFICIALLY DISPATCHED FROM:
${senderName}
Email: ${senderEmail}
Portal: DigiNirikshak National Legal Metrology Terminal
Tracking: ${dispatchInfo?.trackingNo || 'DOCA/SPD/' + new Date().getFullYear() + '/PENDING'}`;

  const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(noticeSubject)}&body=${encodeURIComponent(mailtoBody)}`;

  // Dispatch Action Handler
  const handleDispatchNotice = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const trackingNo = `DOCA/SPD/${now.getFullYear()}/${Math.floor(10000 + Math.random() * 90000)}`;

    // Save/Update in persistent storage with dispatching email & target manufacturer email
    saveAuditRecord({
      id: `HIST-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      companyName: rawVendor,
      commodity: sampleMeta.name,
      batchNo: sampleMeta.batchNo,
      timestamp: sampleMeta.timestamp || dateStr,
      inspectorName: senderName,
      verdict: isFullyCompliant ? 'PASSED' : 'VIOLATION',
      violationsCount: penaltyItems.length,
      violationDetails: penaltyItems.map(p => `${p.clause}: ${p.defect}`),
      noticeStatus: 'DISPATCHED',
      noticeDispatchedAt: dateStr,
      dispatchedFromEmail: senderEmail,
      targetManufacturerEmail: targetEmail,
      dispatchTrackingNo: trackingNo,
      declaredQty: `${mpeAuditResult?.mpeSpec?.declaredValue || 200}g`,
      measuredWeight: `${mpeAuditResult?.measuredWeight || 200}g`
    });

    setIsDispatched(true);
    setDispatchInfo({ dateStr, trackingNo });
    if (onNoticeDispatched) onNoticeDispatched(trackingNo);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyNotice = async () => {
    let summary = '';
    if (isFullyCompliant) {
      summary = `*STATUTORY PACKAGING COMPLIANCE CERTIFICATE*
Ref No: ${inspectionRef}
Commodity: ${sampleMeta.name} (Batch: ${sampleMeta.batchNo})
Verdict: FULLY COMPLIANT under Legal Metrology (Packaged Commodities) Rules, 2011.
No Show Cause Notice required.`;
    } else {
      const issues = penaltyItems.map(p => `• ${p.clause}: ${p.defect}`).join('\n');
      summary = `*STATUTORY SHOW CAUSE NOTICE (UNDER RULE 32 & SEC 18/36)*
Docket No: ${inspectionRef}
Date: ${sampleMeta.timestamp}
Product: ${sampleMeta.name} (Batch: ${sampleMeta.batchNo})
Inspecting Authority: ${inspectorName}

VIOLATIONS DETECTED:
${issues}

DIRECTIVE TO SHOW CAUSE & NOTICE OF CHALLAN:
You are hereby required to SHOW CAUSE in writing within 15 (fifteen) days from receipt of this notice explaining reasons for the aforementioned violations. If satisfactory explanation is not submitted within 15 days, the challan will be issued to your company.`;
    }

    try {
      await navigator.clipboard.writeText(summary);
      setCopiedDraft(true);
      setTimeout(() => setCopiedDraft(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  // QR Payload
  const qrData = JSON.stringify({
    docType: isFullyCompliant ? 'COMPLIANCE_CERTIFICATE' : 'SHOW_CAUSE_LEGAL_NOTICE',
    docketNo: inspectionRef,
    commodity: sampleMeta.name,
    batchNo: sampleMeta.batchNo,
    inspector: inspectorName,
    violationsCount: penaltyItems.length,
    challanNotice: 'The challan will be issued to your company if explanation not submitted within 15 days',
    deadlineDays: 15,
    dispatchStatus: isDispatched ? 'DISPATCHED' : 'PENDING'
  });

  return (
    <div className="cyber-card rounded-2xl p-5 flex flex-col gap-4 relative">
      
      {/* Deck Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-black shadow-md ${
            isFullyCompliant 
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20'
              : 'bg-gradient-to-br from-amber-500 via-rose-500 to-red-600 shadow-rose-500/20'
          }`}>
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <span>{isFullyCompliant ? 'Compliance Certificate' : 'Statutory Show Cause Notice'}</span>
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                isFullyCompliant 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                  : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}>
                {isFullyCompliant ? 'PASS' : 'SHOW CAUSE'}
              </span>
            </h3>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <span className="text-[11px] text-slate-600 font-mono">
                Ref: {inspectionRef}
              </span>
              <span className="text-slate-300 font-mono text-[10px]">•</span>
              <span className="text-[10px] font-mono text-slate-600 flex items-center gap-1">
                <Mail className="w-3 h-3 text-blue-600" />
                From: <strong className="text-blue-700">{senderEmail}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-1.5">
          {!isFullyCompliant && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleDispatchNotice}
              className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md transition-all ${
                isDispatched
                  ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                  : 'bg-gradient-to-r from-rose-600 via-amber-600 to-blue-600 text-white shadow-rose-600/20'
              }`}
            >
              {isDispatched ? <MailCheck className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
              <span>{isDispatched ? 'Notice Dispatched' : 'Dispatch Legal Notice'}</span>
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg text-xs font-bold btn-cyan-shimmer text-white flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print PDF</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleCopyNotice}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
            title="Copy Notice Text"
          >
            {copiedDraft ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <Copy className="w-3.5 h-3.5 text-blue-600" />}
          </motion.button>
        </div>
      </div>

      {/* Dispatch Tracking Banner (if sent) */}
      {isDispatched && (
        <motion.div 
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-emerald-900 font-bold">
              <MailCheck className="w-4 h-4 text-emerald-600" />
              <span>Statutory Show Cause Notice officially dispatched!</span>
            </div>
            <div className="text-[11px] font-mono text-slate-700 flex items-center gap-2 flex-wrap">
              <span>From: <strong className="text-blue-700">{senderEmail}</strong></span>
              <span className="text-slate-400">➔</span>
              <span>To: <strong className="text-amber-800">{targetEmail}</strong></span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-slate-600 bg-white px-2 py-1 rounded border border-slate-300 shadow-xs">
              Tracking: <strong className="text-blue-700">{dispatchInfo?.trackingNo}</strong>
            </span>
            <a
              href={mailtoUrl}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] font-mono flex items-center gap-1.5 transition-all shadow-xs"
              title="Open prefilled notice in default desktop/browser email client"
            >
              <ExternalLink className="w-3 h-3 text-white stroke-[2.5]" />
              <span>Open Email Client</span>
            </a>
          </div>
        </motion.div>
      )}

      {/* Statutory Legal Notice & Challan Warning Banner */}
      {!isFullyCompliant && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 font-bold text-sm shadow-xs">
              ⚖️
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-rose-900 font-mono block tracking-wide">
                STATUTORY NOTICE TO SHOW CAUSE ISSUED
              </span>
              <p className="text-xs font-semibold text-rose-800">
                The challan will be issued to your company if a satisfactory explanation is not submitted within 15 days.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-rose-100 text-rose-900 px-2.5 py-1 rounded border border-rose-300 shrink-0">
            {penaltyItems.length} DEFECT{penaltyItems.length > 1 ? 'S' : ''} FLAGGED
          </span>
        </div>
      )}

      {/* Official A4-Style Show Cause Legal Notice Viewport */}
      <div className="bg-white rounded-xl p-5 sm:p-7 text-slate-900 font-serif text-xs leading-relaxed relative overflow-hidden border border-slate-200 shadow-inner max-h-[500px] overflow-y-auto">
        
        {/* Subtle Ashoka & Scales Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none select-none">
          <div className="rotate-[-25deg] text-center font-sans font-black text-6xl uppercase tracking-widest text-slate-950">
            DOCA LEGAL METROLOGY
          </div>
        </div>

        {/* Paper Header */}
        <div className="text-center border-b-2 border-slate-900 pb-2 mb-3 relative z-10">
          <div className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-slate-600">
            GOVERNMENT OF INDIA • MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION
          </div>
          <div className="text-xs font-sans font-bold uppercase text-slate-900 mt-0.5">
            {isOfficer 
              ? 'DIRECTORATE OF LEGAL METROLOGY (WEIGHTS & MEASURES WING)'
              : 'NATIONAL CONSUMER HELPLINE • CENTRAL CONSUMER PROTECTION AUTHORITY'}
          </div>
          <div className="text-sm font-sans font-black uppercase underline mt-1.5 text-slate-950 tracking-tight">
            {isFullyCompliant 
              ? 'CERTIFICATE OF STATUTORY PACKAGING COMPLIANCE'
              : 'FORM LM/SCN-2026: STATUTORY NOTICE TO SHOW CAUSE'}
          </div>
          <div className="text-[10px] font-sans text-slate-600 mt-0.5">
            {isFullyCompliant 
              ? 'Issued pursuant to Rule 24 of Legal Metrology (Packaged Commodities) Rules, 2011'
              : 'Issued under Rule 32 of PCR 2011 & Sections 18 & 36 of Legal Metrology Act, 2009'}
          </div>
        </div>

        {/* Docket & Recipient Metadata */}
        <div className="grid grid-cols-2 gap-2.5 text-[11px] font-sans bg-slate-50 p-3 rounded border border-slate-300 mb-3 relative z-10">
          <div><strong>Notice Reference:</strong> {inspectionRef}</div>
          <div><strong>Inspection Date:</strong> {sampleMeta.timestamp}</div>
          <div><strong>Commodity Name:</strong> {sampleMeta.name}</div>
          <div><strong>Batch / Lot No:</strong> {sampleMeta.batchNo}</div>
          <div className="col-span-2 sm:col-span-1 border-t border-slate-200 pt-1.5">
            <strong>From (Sender):</strong> {senderName} <span className="text-slate-600">({senderEmail})</span>
          </div>
          <div className="col-span-2 sm:col-span-1 border-t border-slate-200 pt-1.5">
            <strong>To (Respondent Packer):</strong> {rawVendor} <span className="text-slate-600">({targetEmail})</span>
          </div>
        </div>

        {/* Legal Body: Show Cause Mandate */}
        <div className="space-y-2.5 relative z-10 font-serif">
          {isFullyCompliant ? (
            <p className="text-slate-800 leading-normal">
              This is to certify that physical and optical inspection of the retail commodity <strong>{sampleMeta.name}</strong> (Batch No: <code>{sampleMeta.batchNo}</code>) was completed in accordance with Schedule I of the Legal Metrology (Packaged Commodities) Rules, 2011. All 5 mandatory statutory declarations (MRP with taxes, standard net metric quantity, dates, manufacturer identity, and consumer care) were verified compliant. No cause for statutory action exists.
            </p>
          ) : (
            <>
              <p className="text-slate-800 leading-normal">
                <strong>WHEREAS</strong>, an official compliance audit of the pre-packaged retail commodity <strong>{sampleMeta.name}</strong> (Batch: <code>{sampleMeta.batchNo}</code>) was executed by the authorized inspecting authority;
              </p>

              <p className="text-slate-800 leading-normal">
                <strong>AND WHEREAS</strong>, inspection of the statutory declarations on the principal display panel and physical scale laboratory weight revealed the following statutory violations and breaches:
              </p>

              {/* Violations Enumeration Box */}
              <div className="border border-rose-300 bg-rose-50/70 rounded-lg p-2.5 space-y-1.5 font-sans">
                {penaltyItems.map((item, idx) => (
                  <div key={item.id} className="text-[11px] text-slate-900 flex items-start gap-1.5">
                    <span className="font-bold text-rose-700 shrink-0">({idx + 1})</span>
                    <div>
                      <strong className="text-rose-900">{item.clause}:</strong>{' '}
                      <span className="text-slate-800">{item.defect}</span>{' '}
                      <span className="text-rose-700 font-mono font-bold text-[10px]">({item.section})</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Formal Directive to Show Cause & Challan Warning */}
              <div className="p-3.5 bg-amber-50 border-2 border-amber-400 rounded-lg text-slate-900 font-sans my-2">
                <div className="font-black text-amber-900 uppercase text-xs tracking-wide mb-1.5 flex items-center gap-1.5">
                  <span>⚖️</span>
                  <span>STATUTORY DIRECTIVE TO SHOW CAUSE (15-DAY STATUTORY WINDOW):</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-800 mb-2">
                  You are hereby called upon and directed to submit a written explanation within <strong>15 (fifteen) days</strong> from the date of receipt of this notice, stating clearly the grounds and reasons as to why the aforementioned mandatory statutory provisions were violated.
                </p>
                <div className="p-2.5 rounded bg-rose-100/90 border border-rose-300 text-rose-950 font-sans text-xs">
                  <strong>⚠️ NOTICE OF CHALLAN ISSUANCE:</strong> Take notice that if a satisfactory written explanation is not provided within the prescribed 15-day period, <u>the challan will be issued to your company</u> and prosecution proceedings under the Legal Metrology Act, 2009 shall be initiated without further notice.
                </div>
              </div>

              {/* Vendor Explanation Field */}
              <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50 font-sans">
                <div className="text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Designated Area for Manufacturer / Vendor Written Explanation:
                </div>
                <textarea
                  rows={2}
                  value={vendorReplyDraft}
                  onChange={(e) => setVendorReplyDraft(e.target.value)}
                  placeholder="Record manufacturer/packer explanation or reasons submitted in response to show cause notice..."
                  className="w-full text-xs p-2 rounded bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-sans"
                />
              </div>
            </>
          )}
        </div>

        {/* Verification QR Code & Official Seal Footer */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-300 relative z-10 font-sans">
          <div className="flex items-center gap-2.5">
            <div className="p-1 bg-white border border-slate-300 rounded shadow-xs">
              <QRCodeSVG value={qrData} size={48} level="M" />
            </div>
            <div className="text-[9px] text-slate-600 leading-tight">
              <div><strong>Digital Seal & QR Verification</strong></div>
              <div>Scan to verify docket & show cause status</div>
              <div className="font-mono text-blue-800 mt-0.5">DOCA-PORTAL-E-DOCKET</div>
            </div>
          </div>

          <div className="text-right text-[10px]">
            <div className="border-b-2 border-slate-900 w-36 mb-1 ml-auto"></div>
            <div className="font-bold text-slate-900">{inspectorName}</div>
            <div className="text-slate-600">
              {isOfficer ? 'Authorized Legal Metrology Inspector' : 'Verified Citizen Complainant'}
            </div>
            <div className="text-[9px] text-slate-500 font-mono">
              {isOfficer ? '#DOCA-8941 • Directorate of Legal Metrology' : 'NCH Token: ' + inspectionRef}
            </div>
          </div>
        </div>

      </div>

      {/* Footer Reset & New Audit Session */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-200 font-mono text-xs">
        <span className="text-[10px] text-slate-500">
          Enacted under LMA 2009 & PCR 2011 • Rule 32 SCN
        </span>
        <button
          type="button"
          onClick={onResetAll}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-1.5 cursor-pointer font-bold"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Audit Session</span>
        </button>
      </div>

    </div>
  );
}
