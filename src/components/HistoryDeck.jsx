import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  FileText, 
  Clock, 
  Building2, 
  Filter,
  Check,
  RotateCcw,
  ShieldCheck,
  MailCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuditHistory, markNoticeDispatched, resetHistoryToDefault } from '../utils/historyStorage';

export default function HistoryDeck({ onSelectRecord, onViewNotice, activeProfile = null }) {
  const [records, setRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerdict, setFilterVerdict] = useState('ALL'); // 'ALL' | 'VIOLATION' | 'PASSED' | 'DISPATCHED' | 'PENDING'
  const [actionSuccessId, setActionSuccessId] = useState(null);

  useEffect(() => {
    setRecords(getAuditHistory());
  }, []);

  const handleDispatch = (recordId) => {
    const senderEmail = activeProfile?.email || 'rajesh.kumar@doca.gov.in';
    const updated = markNoticeDispatched(recordId, null, senderEmail);
    setRecords(updated);
    setActionSuccessId(recordId);
    setTimeout(() => setActionSuccessId(null), 2500);
  };

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
    if (filterVerdict === 'DISPATCHED') return r.noticeStatus === 'DISPATCHED';
    if (filterVerdict === 'PENDING') return r.noticeStatus === 'PENDING';

    return true;
  });

  return (
    <div className="cyber-card rounded-2xl p-5 sm:p-6 flex flex-col gap-5 relative overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-md">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span>Statutory Inspection Ledger & Notice Dispatch Log</span>
              <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                AUDIT TRAIL
              </span>
            </h2>
            <p className="text-xs text-slate-600">
              Track inspected companies, batch numbers, compliance verdicts, and statutory Show Cause Notice dispatch statuses
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetLedger}
          className="text-xs font-mono text-slate-500 hover:text-blue-600 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors"
          title="Reset ledger to initial factory sample audit records"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Ledger</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, brand, batch ID..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto font-mono text-xs">
          {[
            { id: 'ALL', label: 'All Batches' },
            { id: 'VIOLATION', label: 'Violations' },
            { id: 'PASSED', label: 'Passed' },
            { id: 'DISPATCHED', label: 'Notice Sent' },
            { id: 'PENDING', label: 'Notice Pending' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterVerdict(tab.id)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
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

      {/* Ledger Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs font-sans border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 font-mono text-[11px] text-slate-600">
              <th className="p-3">Company & Commodity</th>
              <th className="p-3">Batch & Timestamp</th>
              <th className="p-3">Audit Verdict</th>
              <th className="p-3">Show Cause Notice Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => {
                const isPass = record.verdict === 'PASSED';
                const isDispatched = record.noticeStatus === 'DISPATCHED';
                const isPending = record.noticeStatus === 'PENDING';

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
                            <span>{record.violationsCount} VIOLATIONS DETECTED</span>
                          </span>
                          {record.violationDetails && record.violationDetails.length > 0 && (
                            <span className="text-[10px] text-slate-500 line-clamp-1 max-w-xs" title={record.violationDetails.join(' | ')}>
                              {record.violationDetails[0]}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Show Cause Notice Status */}
                    <td className="p-3">
                      {isPass ? (
                        <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          CLEARED • NO NOTICE REQUIRED
                        </span>
                      ) : isDispatched ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-black text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded w-fit shadow-xs">
                            <MailCheck className="w-3 h-3 text-emerald-600" />
                            <span>NOTICE DISPATCHED</span>
                          </span>
                          <span className="text-[9px] font-mono text-slate-700 flex items-center gap-1">
                            From: <strong className="text-blue-700">{record.dispatchedFromEmail || activeProfile?.email || 'rajesh.kumar@doca.gov.in'}</strong>
                          </span>
                          <span className="text-[9px] font-mono text-slate-500">
                            Sent: {record.noticeDispatchedAt}
                          </span>
                          {record.dispatchTrackingNo && (
                            <span className="text-[9px] font-mono text-blue-700 font-semibold">
                              Tracking: {record.dispatchTrackingNo}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-black text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded w-fit shadow-xs">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>NOTICE PENDING DISPATCH</span>
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono">
                            Sender: {activeProfile?.email || 'rajesh.kumar@doca.gov.in'}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isPass && isPending && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => handleDispatch(record.id)}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase font-mono shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="w-3 h-3 text-white" />
                            <span>Dispatch Notice</span>
                          </motion.button>
                        )}

                        {actionSuccessId === record.id && (
                          <span className="text-[10px] font-mono text-emerald-600 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Dispatched!</span>
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => onViewNotice && onViewNotice(record)}
                          className="px-2 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer hover:border-blue-500 shadow-xs transition-colors"
                          title="View Show Cause Legal Notice"
                        >
                          <FileText className="w-3 h-3 text-blue-600" />
                          <span>View Notice</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="p-6 text-center text-slate-500 text-xs font-mono">
                  No inspection records match the current filter or search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Ledger Summary Stats Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs pt-1 border-t border-slate-200 text-slate-600">
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-500 block">TOTAL INSPECTED</span>
          <span className="text-sm font-black text-slate-900">{records.length} Batches</span>
        </div>
        <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
          <span className="text-[10px] text-emerald-700 block">COMPLIANT PASSED</span>
          <span className="text-sm font-black text-emerald-900">
            {records.filter(r => r.verdict === 'PASSED').length}
          </span>
        </div>
        <div className="bg-rose-50/70 p-2.5 rounded-xl border border-rose-200">
          <span className="text-[10px] text-rose-700 block">DEFECTS FLAGGED</span>
          <span className="text-sm font-black text-rose-900">
            {records.filter(r => r.verdict === 'VIOLATION').length}
          </span>
        </div>
        <div className="bg-blue-50/70 p-2.5 rounded-xl border border-blue-200">
          <span className="text-[10px] text-blue-700 block">NOTICES DISPATCHED</span>
          <span className="text-sm font-black text-blue-900">
            {records.filter(r => r.noticeStatus === 'DISPATCHED').length}
          </span>
        </div>
      </div>

    </div>
  );
}
