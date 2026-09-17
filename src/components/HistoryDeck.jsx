import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Building2, 
  RotateCcw, 
  ShieldCheck, 
  Scale,
  PackageCheck,
  PackageX
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getAuditHistory, resetHistoryToDefault } from '../utils/historyStorage';

export default function HistoryDeck({ onSelectRecord, activeProfile = null }) {
  const [records, setRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerdict, setFilterVerdict] = useState('ALL'); // 'ALL' | 'VIOLATION' | 'PASSED'

  useEffect(() => {
    setRecords(getAuditHistory());
  }, []);

  const handleResetLedger = () => {
    const reset = resetHistoryToDefault();
    setRecords(reset);
  };

  // Filtering
  const filteredRecords = records.filter(r => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (r.companyName && r.companyName.toLowerCase().includes(query)) ||
      (r.commodity && r.commodity.toLowerCase().includes(query)) ||
      (r.batchNo && r.batchNo.toLowerCase().includes(query));

    if (!matchesSearch) return false;

    if (filterVerdict === 'VIOLATION') return r.verdict === 'VIOLATION';
    if (filterVerdict === 'PASSED') return r.verdict === 'PASSED';

    return true;
  });

  const totalInspected = records.length;
  const compliantCount = records.filter(r => r.verdict === 'PASSED').length;
  const violationCount = records.filter(r => r.verdict === 'VIOLATION').length;

  return (
    <div className="cyber-card rounded-2xl p-4 sm:p-6 flex flex-col gap-4 relative overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-md shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span>Factory Raid Inspection Log</span>
              <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                AUDIT TRAIL
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Complete on-site ledger of inspected factory batches, weights, and compliance results
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetLedger}
          className="text-xs font-mono text-slate-500 hover:text-blue-600 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors"
          title="Reset ledger to default factory audit records"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Log</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-3 gap-2 font-mono text-xs">
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center sm:text-left">
          <span className="text-[10px] text-slate-500 block uppercase">Inspected</span>
          <span className="text-sm sm:text-base font-black text-slate-900">{totalInspected} Batches</span>
        </div>
        <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200 text-center sm:text-left">
          <span className="text-[10px] text-emerald-700 block uppercase">Compliant</span>
          <span className="text-sm sm:text-base font-black text-emerald-900">{compliantCount} Passed</span>
        </div>
        <div className="bg-rose-50/70 p-2.5 rounded-xl border border-rose-200 text-center sm:text-left">
          <span className="text-[10px] text-rose-700 block uppercase">Defects</span>
          <span className="text-sm sm:text-base font-black text-rose-900">{violationCount} Flagged</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search brand, batch number..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto font-mono text-xs">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'PASSED', label: 'Compliant' },
            { id: 'VIOLATION', label: 'Violations' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterVerdict(tab.id)}
              className={`flex-1 sm:flex-initial px-3 py-1 rounded-lg font-bold transition-all cursor-pointer text-center ${
                filterVerdict === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Card List (< sm screens) */}
      <div className="flex flex-col gap-2.5 sm:hidden">
        {filteredRecords.length > 0 ? (
          filteredRecords.map(record => {
            const isPass = record.verdict === 'PASSED';
            return (
              <div 
                key={record.id}
                className={`p-3 rounded-xl border flex flex-col gap-2 bg-white ${
                  isPass ? 'border-emerald-200 shadow-2xs' : 'border-rose-200 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                      #{record.batchNo}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">
                      {record.commodity}
                    </h4>
                    <span className="text-[10px] text-slate-500">
                      {record.companyName}
                    </span>
                  </div>

                  <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded ${
                    isPass 
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                      : 'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}>
                    {isPass ? '0 DEFECTS' : `${record.violationsCount} DEFECTS`}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono bg-slate-50 p-2 rounded-lg text-slate-600">
                  <span>Weight: <strong>{record.measuredWeight || 'N/A'}</strong> (Decl: {record.declaredQty || 'N/A'})</span>
                  <span className="text-slate-400">{record.timestamp}</span>
                </div>

                {!isPass && record.violationDetails && record.violationDetails.length > 0 && (
                  <div className="text-[10px] text-rose-800 bg-rose-50/70 p-2 rounded border border-rose-100">
                    <span className="font-bold block mb-0.5">Issues Found:</span>
                    <ul className="list-disc list-inside space-y-0.5">
                      {record.violationDetails.map((v, i) => (
                        <li key={i} className="line-clamp-1">{v}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-6 text-center text-slate-500 text-xs font-mono">
            No raid inspection records match.
          </div>
        )}
      </div>

      {/* Desktop / Tablet Table (>= sm screens) */}
      <div className="hidden sm:block w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs font-sans border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 font-mono text-[11px] text-slate-600">
              <th className="p-3">Company & Commodity</th>
              <th className="p-3">Batch & Timestamp</th>
              <th className="p-3">Scale Weight</th>
              <th className="p-3">Audit Verdict</th>
              <th className="p-3">Inspected By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => {
                const isPass = record.verdict === 'PASSED';

                return (
                  <tr 
                    key={record.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Company & Commodity */}
                    <td className="p-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{record.companyName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {record.commodity}
                      </div>
                    </td>

                    {/* Batch & Timestamp */}
                    <td className="p-3 font-mono">
                      <span className="font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded text-[10px]">
                        #{record.batchNo}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{record.timestamp}</span>
                      </div>
                    </td>

                    {/* Scale Weight */}
                    <td className="p-3 font-mono text-[11px]">
                      <span className="text-slate-800 font-bold">{record.measuredWeight || 'N/A'}</span>
                      <span className="text-slate-400 block text-[10px]">Decl: {record.declaredQty || 'N/A'}</span>
                    </td>

                    {/* Verdict */}
                    <td className="p-3">
                      {isPass ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-md shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>COMPLIANT (0 DEFECTS)</span>
                        </span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold bg-rose-50 text-rose-800 border border-rose-300 px-2 py-0.5 rounded-md shadow-xs w-fit">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            <span>{record.violationsCount} DEFECTS FOUND</span>
                          </span>
                          {record.violationDetails && record.violationDetails.length > 0 && (
                            <span className="text-[10px] text-slate-500 line-clamp-1 max-w-xs" title={record.violationDetails.join(' | ')}>
                              {record.violationDetails[0]}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Inspector */}
                    <td className="p-3 text-slate-600 font-mono text-[10px]">
                      {record.inspectorName || 'Insp. Rajesh Kumar'}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="p-6 text-center text-slate-500 text-xs font-mono">
                  No raid records match the current filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
