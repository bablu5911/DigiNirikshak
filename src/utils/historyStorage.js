/**
 * Inspection History Ledger Storage
 * Persists audit trail, batch records, violation findings, and Show Cause Legal Notice dispatch statuses in localStorage.
 */

const STORAGE_KEY = 'diginirikshak_audit_history_v1';

// Pre-seeded realistic statutory audit records
const DEFAULT_RECORDS = [
  {
    id: 'HIST-2026-001',
    companyName: 'NutriGold Agro Foods Pvt. Ltd.',
    commodity: 'NutriGold Whole Grain Biscuits (200g)',
    batchNo: 'NG-2026-B89',
    timestamp: '16 Sep 2026, 09:15 AM',
    inspectorName: 'Insp. Rajesh Kumar (#DOCA-8941)',
    verdict: 'PASSED',
    violationsCount: 0,
    violationDetails: [],
    noticeStatus: 'CLEARED', // 'CLEARED' | 'PENDING' | 'DISPATCHED'
    noticeDispatchedAt: null,
    dispatchTrackingNo: null,
    declaredQty: '200g',
    measuredWeight: '198.5g'
  },
  {
    id: 'HIST-2026-002',
    companyName: 'CrunchMax Snack Foods India Ltd.',
    commodity: 'CrunchMax Potato Chips (75g)',
    batchNo: 'CM-2026-X41',
    timestamp: '15 Sep 2026, 02:40 PM',
    inspectorName: 'Insp. Rajesh Kumar (#DOCA-8941)',
    verdict: 'VIOLATION',
    violationsCount: 2,
    violationDetails: [
      'Rule 6(1)(e): Absence of "Inclusive of all taxes" declaration',
      'Rule 6(1)(b): Non-standard net quantity representation (75 gm vs standard g)'
    ],
    noticeStatus: 'DISPATCHED',
    noticeDispatchedAt: '15 Sep 2026, 03:10 PM',
    dispatchedFromEmail: 'rajesh.kumar@doca.gov.in',
    dispatchTrackingNo: 'DOCA/SPD/2026/8941-X41',
    declaredQty: '75g',
    measuredWeight: '75.0g'
  },
  {
    id: 'HIST-2026-003',
    companyName: 'Royal Tea & Beverages Private Limited',
    commodity: 'Royal Chai Premium Blend (Assam CTC)',
    batchNo: 'RC-2026-TAMPER',
    timestamp: '16 Sep 2026, 10:05 AM',
    inspectorName: 'Insp. Rajesh Kumar (#DOCA-8941)',
    verdict: 'VIOLATION',
    violationsCount: 2,
    violationDetails: [
      'Rule 18(2): Unauthorized retail price alteration / over-stickering of declared MRP',
      'Section 39: Short-quantity packaging deficit of 30g (exceeds legal 9g MPE)'
    ],
    noticeStatus: 'PENDING',
    noticeDispatchedAt: null,
    dispatchedFromEmail: null,
    dispatchTrackingNo: null,
    declaredQty: '250g',
    measuredWeight: '220.0g'
  },
  {
    id: 'HIST-2026-004',
    companyName: 'Himalayan Spring Waters LLP',
    commodity: 'Himalayan Natural Mineral Water (1 Litre)',
    batchNo: 'HW-2026-L09',
    timestamp: '14 Sep 2026, 11:30 AM',
    inspectorName: 'Insp. Rajesh Kumar (#DOCA-8941)',
    verdict: 'PASSED',
    violationsCount: 0,
    violationDetails: [],
    noticeStatus: 'CLEARED',
    noticeDispatchedAt: null,
    dispatchedFromEmail: null,
    dispatchTrackingNo: null,
    declaredQty: '1000ml',
    measuredWeight: '1000ml'
  },
  {
    id: 'HIST-2026-005',
    companyName: 'Sunrise Dairy Products Ltd.',
    commodity: 'Sunrise Pure Cow Ghee (500ml)',
    batchNo: 'SD-2026-G12',
    timestamp: '12 Sep 2026, 04:15 PM',
    inspectorName: 'Insp. Rajesh Kumar (#DOCA-8941)',
    verdict: 'VIOLATION',
    violationsCount: 1,
    violationDetails: [
      'Rule 6(1)(f): Absence of consumer care telephone helpline and grievance email'
    ],
    noticeStatus: 'DISPATCHED',
    noticeDispatchedAt: '12 Sep 2026, 05:00 PM',
    dispatchedFromEmail: 'rajesh.kumar@doca.gov.in',
    dispatchTrackingNo: 'DOCA/SPD/2026/8941-G12',
    declaredQty: '500ml',
    measuredWeight: '500ml'
  }
];

export function getAuditHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_RECORDS));
      return DEFAULT_RECORDS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading audit history from storage:', e);
    return DEFAULT_RECORDS;
  }
}

export function saveAuditRecord(record) {
  try {
    const current = getAuditHistory();
    // Check if record for batch already exists, if so update it
    const existingIndex = current.findIndex(r => r.batchNo === record.batchNo);
    let updated;
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...updated[existingIndex], ...record };
    } else {
      updated = [record, ...current];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error saving audit record:', e);
    return getAuditHistory();
  }
}

export function markNoticeDispatched(recordId, trackingNo = null, senderEmail = null) {
  try {
    const current = getAuditHistory();
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const tracking = trackingNo || `DOCA/SPD/${now.getFullYear()}/${Math.floor(10000 + Math.random() * 90000)}`;

    const updated = current.map(r => {
      if (r.id === recordId || r.batchNo === recordId) {
        return {
          ...r,
          noticeStatus: 'DISPATCHED',
          noticeDispatchedAt: dateStr,
          dispatchedFromEmail: senderEmail || r.dispatchedFromEmail || 'rajesh.kumar@doca.gov.in',
          dispatchTrackingNo: tracking
        };
      }
      return r;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error marking notice as dispatched:', e);
    return getAuditHistory();
  }
}

export function resetHistoryToDefault() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_RECORDS));
  return DEFAULT_RECORDS;
}
