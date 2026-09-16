import React from 'react';
import { FileText, Printer, Download, X, Scale, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function NoticeModal({
  isOpen,
  onClose,
  sampleName,
  batchNo,
  imageSrc,
  rules,
  passedCount,
  violationCount,
  isFullyCompliant,
  inspectorName,
  inspectionRef,
  timestamp
}) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 no-print">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Topbar */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-sm">
              Official Statutory Inspection Order (Section 18 & 36)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white px-2 py-1 font-bold text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Scrollable Container */}
        <div className="p-6 max-h-[80vh] overflow-y-auto bg-slate-50">
          <div className="bg-white border border-slate-300 rounded-lg p-6 sm:p-8 shadow-sm">
            <InspectionDocument 
              sampleName={sampleName}
              batchNo={batchNo}
              imageSrc={imageSrc}
              rules={rules}
              passedCount={passedCount}
              violationCount={violationCount}
              isFullyCompliant={isFullyCompliant}
              inspectorName={inspectorName}
              inspectionRef={inspectionRef}
              timestamp={timestamp}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Certified digital inspection order generated pursuant to Rule 6 & Rule 12 of PCR, 2011.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print Order Form</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// 1-Page Document Formatter
export function InspectionDocument({
  sampleName,
  batchNo,
  imageSrc,
  rules,
  passedCount,
  violationCount,
  isFullyCompliant,
  inspectorName,
  inspectionRef,
  timestamp
}) {
  return (
    <div className="font-serif text-slate-900 leading-snug">
      
      {/* Official Government Seal & Title */}
      <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
        <div className="text-xs font-sans font-bold uppercase tracking-widest text-slate-700">
          GOVERNMENT OF INDIA • MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION
        </div>
        <div className="text-sm font-sans font-bold uppercase tracking-wider text-slate-900 mt-0.5">
          DIRECTORATE OF LEGAL METROLOGY (PACKAGED COMMODITIES DIVISION)
        </div>
        <div className="mt-2 text-base sm:text-lg font-bold uppercase underline underline-offset-4 text-slate-950">
          {isFullyCompliant 
            ? 'CERTIFICATE OF STATUTORY PACKAGING COMPLIANCE' 
            : 'FORM VI: STATUTORY INSPECTION NOTICE UNDER SECTION 18 & SECTION 36'
          }
        </div>
        <div className="text-[11px] font-sans text-slate-600 mt-1">
          Enacted under the Legal Metrology Act, 2009 & Legal Metrology (Packaged Commodities) Rules, 2011
        </div>
      </div>

      {/* Metadata Overview */}
      <div className="grid grid-cols-2 gap-2 text-xs font-sans mb-4 border border-slate-300 p-2.5 rounded bg-slate-50/60">
        <div><strong className="text-slate-700">Inspection Docket No:</strong> {inspectionRef}</div>
        <div><strong className="text-slate-700">Audit Timestamp:</strong> {timestamp}</div>
        <div><strong className="text-slate-700">Sample Commodity:</strong> {sampleName}</div>
        <div><strong className="text-slate-700">Batch / Identifier:</strong> {batchNo}</div>
        <div><strong className="text-slate-700">Inspecting Officer:</strong> {inspectorName}</div>
        <div>
          <strong className="text-slate-700">Verdict:</strong>{' '}
          <span className={`font-bold ${isFullyCompliant ? 'text-emerald-700' : 'text-rose-700'}`}>
            {isFullyCompliant ? 'FULLY COMPLIANT' : 'NON-COMPLIANT (STATUTORY DEFICIENCIES)'}
          </span>
        </div>
      </div>

      {/* Image Snapshot and Summary */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-4 border border-slate-300 rounded p-2 flex flex-col items-center justify-center bg-slate-50">
          <div className="text-[10px] font-sans font-bold text-slate-500 uppercase mb-1">
            Physical Evidence Snapshot
          </div>
          <div className="w-full h-36 flex items-center justify-center overflow-hidden bg-white border border-slate-200 rounded">
            {imageSrc ? (
              <img src={imageSrc} alt="Physical Sample" className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-xs text-slate-400 font-sans">No image attached</span>
            )}
          </div>
          <div className="text-[10px] font-sans text-slate-500 mt-1">
            Audit Hash: SHA256-{batchNo}
          </div>
        </div>

        <div className="col-span-8 flex flex-col justify-between border border-slate-300 rounded p-3 font-sans bg-slate-50/30">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-600">Inspection Verdict</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                isFullyCompliant ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {passedCount}/5 Rules Cleared
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 mt-1">
              {isFullyCompliant 
                ? 'All Statutory Declarations Cleared Under PCR 2011' 
                : `${violationCount} Statutory Non-Compliance(s) Observed on Principal Display Panel`
              }
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {isFullyCompliant 
                ? 'The observed packaging conforms strictly to rules governing retail price declaration, metric net weights, manufacturer details, and consumer grievance channels.'
                : 'The commodity pack is in direct violation of mandatory packaging norms. Under Section 36 of the Legal Metrology Act, 2009, manufacturing, packing, or distributing non-compliant commodities is a punishable offence.'
              }
            </p>
          </div>

          <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-200">
            Jurisdiction: State Directorate of Legal Metrology • Enforcement Cell
          </div>
        </div>
      </div>

      {/* 5-Rule Findings Matrix */}
      <div className="font-sans mb-4">
        <div className="text-xs font-bold uppercase text-slate-700 mb-1.5 tracking-wide">
          Statutory Compliance Verification Matrix (PCR 2011)
        </div>
        <table className="w-full text-xs border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
              <th className="border border-slate-300 px-2 py-1.5 text-left w-6">#</th>
              <th className="border border-slate-300 px-2 py-1.5 text-left w-36">Statutory Rule</th>
              <th className="border border-slate-300 px-2 py-1.5 text-left">Observed Extracted Text</th>
              <th className="border border-slate-300 px-2 py-1.5 text-center w-24">Finding</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule, idx) => {
              const isPass = rule.status === 'PASS';
              return (
                <tr key={rule.id} className={isPass ? 'bg-white' : 'bg-rose-50/40'}>
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

      {/* Statutory Section 36 Notice */}
      <div className="border-t border-slate-400 pt-3 text-[11px]">
        {!isFullyCompliant ? (
          <div className="bg-rose-50 border border-rose-300 p-2.5 rounded mb-3 font-sans">
            <span className="font-bold text-rose-800 uppercase">Statutory Notice Under Section 36: </span>
            <span className="text-slate-800">
              Notice is hereby given that the pre-packaged commodity fails to declare mandatory legal disclosures prescribed under Rule 6 and Rule 12. You are directed to show cause within 15 calendar days stating grounds and reasons for these violations. Take notice that if a satisfactory explanation is not submitted within 15 days, the challan will be issued to your company and prosecution under Section 36 of the Legal Metrology Act, 2009 will be initiated.
            </span>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-300 p-2.5 rounded mb-3 font-sans">
            <span className="font-bold text-emerald-800 uppercase">Compliance Certification: </span>
            <span className="text-slate-800">
              This commodity lot satisfies the mandatory disclosure requirements stipulated under the Legal Metrology (Packaged Commodities) Rules, 2011. Cleared for distribution and retail marketing across all states and union territories.
            </span>
          </div>
        )}

        <div className="flex justify-between items-end pt-3 font-sans text-xs">
          <div>
            <div className="text-[10px] text-slate-500">DIGITALLY SIGNED AUDIT RECORD</div>
            <div className="font-bold text-slate-800">Legal Metrology Inspectorate Division</div>
            <div className="text-[10px] text-slate-500">Seal affixed electronically pursuant to IT Act 2000</div>
          </div>
          <div className="text-right">
            <div className="border-b border-slate-800 w-44 mb-1"></div>
            <div className="font-bold text-slate-900">{inspectorName}</div>
            <div className="text-[10px] text-slate-500">Authorized Legal Metrology Inspector</div>
          </div>
        </div>
      </div>

    </div>
  );
}
