/**
 * Factory Raid Inspection History Storage
 * Persists mobile field inspection records, batch audits, and statutory compliance verdicts in localStorage.
 */

const STORAGE_KEY = 'diginirikshak_raid_history_v2';

// Pre-seeded realistic factory raid sample inspection records
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
    compliantDetails: [
      'Rule 6(1)(e): MRP ₹45.00 declared with "inclusive of all taxes"',
      'Rule 6(1)(b): Standard Net Quantity 200g in metric units',
      'Rule 6(1)(d): Month & Year of packing verified (08/2026)',
      'Rule 6(1)(a): Complete manufacturer factory address identified',
      'Rule 6(1)(f): Consumer care helpline and support email present',
      'Section 39: Weight 198.5g is within legal Maximum Permissible Error (MPE)'
    ],
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
      'Rule 6(1)(e): Absence of mandatory "Inclusive of all taxes" declaration',
      'Rule 6(1)(b): Non-standard net quantity unit representation (75 gm instead of standard g)'
    ],
    compliantDetails: [
      'Rule 6(1)(d): Month & Year of packing verified',
      'Rule 6(1)(a): Complete manufacturer factory address present',
      'Rule 6(1)(f): Consumer care contact details verified'
    ],
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
      'Rule 18(2): Unauthorized retail price alteration / over-stickering of factory MRP (₹280 sticker over ₹250)',
      'Section 39: Short-quantity packaging deficit of 30g (Measured 220g vs Declared 250g, exceeds legal 9g MPE)'
    ],
    compliantDetails: [
      'Rule 6(1)(d): Month & Year of packing verified',
      'Rule 6(1)(a): Manufacturer name and address present',
      'Rule 6(1)(f): Consumer care helpline verified'
    ],
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
    compliantDetails: [
      'Rule 6(1)(e): MRP declared with "incl. of all taxes"',
      'Rule 6(1)(b): Standard Net Volume 1000ml in metric units',
      'Rule 6(1)(d): Batch & packing date valid',
      'Rule 6(1)(a): Bottling plant address verified',
      'Rule 6(1)(f): Consumer support toll-free number active'
    ],
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
    compliantDetails: [
      'Rule 6(1)(e): MRP inclusive of taxes verified',
      'Rule 6(1)(b): Net Volume declared in standard ml',
      'Rule 6(1)(d): Packing date verified',
      'Rule 6(1)(a): Dairy plant address present'
    ],
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

export function resetHistoryToDefault() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_RECORDS));
  return DEFAULT_RECORDS;
}
