// Mock Data and Sample Packaging Generators for Legal Metrology Compliance Checker

export const COMPLIANT_SAMPLE = {
  id: 'compliant-sample',
  name: 'NutriGold Whole Wheat Biscuits',
  category: 'Packaged Food & Confectionery',
  batchNo: 'NG-2026-B89',
  packType: 'Flexible Laminate Pouch',
  timestamp: '10-Sep-2026 14:35 IST',
  imageSvg: `
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <defs>
        <linearGradient id="c-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FEF9C3" />
          <stop offset="100%" stop-color="#FEF08A" />
        </linearGradient>
        <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.1" />
        </filter>
      </defs>
      <!-- Pack Outline -->
      <rect x="25" y="20" width="450" height="460" rx="16" fill="url(#c-bg)" stroke="#CA8A04" stroke-width="2" filter="url(#shadow)"/>
      <rect x="35" y="30" width="430" height="440" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>

      <!-- Header / Brand -->
      <rect x="35" y="30" width="430" height="60" rx="12" fill="#CA8A04"/>
      <text x="250" y="68" fill="#FFFFFF" font-family="Inter, sans-serif" font-weight="800" font-size="22" text-anchor="middle" letter-spacing="1">NUTRIGOLD</text>
      <text x="250" y="82" fill="#FEF08A" font-family="Inter, sans-serif" font-weight="600" font-size="11" text-anchor="middle">100% WHOLE WHEAT DIGESTIVE BISCUITS</text>

      <!-- Label Body - Declarations Section -->
      <rect x="55" y="105" width="390" height="345" rx="8" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1"/>
      <text x="70" y="130" fill="#0F172A" font-family="Inter, sans-serif" font-weight="700" font-size="13">MANDATORY STATUTORY DECLARATIONS</text>
      <line x1="70" y1="138" x2="425" y2="138" stroke="#E2E8F0" stroke-width="1"/>

      <!-- Rule 1: MRP -->
      <rect x="70" y="150" width="355" height="42" rx="6" fill="#F0FDF4" stroke="#86EFAC" stroke-width="1.5" stroke-dasharray="3 2"/>
      <text x="82" y="168" fill="#15803D" font-family="Inter, sans-serif" font-weight="700" font-size="10">RULE 6(1)(e): MAXIMUM RETAIL PRICE</text>
      <text x="82" y="184" fill="#0F172A" font-family="Inter, sans-serif" font-weight="700" font-size="13">MRP: ₹ 35.00 (incl. of all taxes)</text>

      <!-- Rule 2: Net Quantity -->
      <rect x="70" y="200" width="355" height="42" rx="6" fill="#F0FDF4" stroke="#86EFAC" stroke-width="1.5" stroke-dasharray="3 2"/>
      <text x="82" y="218" fill="#15803D" font-family="Inter, sans-serif" font-weight="700" font-size="10">RULE 12: NET QUANTITY (METRIC)</text>
      <text x="82" y="234" fill="#0F172A" font-family="Inter, sans-serif" font-weight="700" font-size="13">Net Weight: 200 g</text>

      <!-- Rule 3: Mfg Date -->
      <rect x="70" y="250" width="355" height="42" rx="6" fill="#F0FDF4" stroke="#86EFAC" stroke-width="1.5" stroke-dasharray="3 2"/>
      <text x="82" y="268" fill="#15803D" font-family="Inter, sans-serif" font-weight="700" font-size="10">RULE 6(1)(d): DATE OF PACKING / MFG</text>
      <text x="82" y="284" fill="#0F172A" font-family="Inter, sans-serif" font-weight="700" font-size="13">Mfg Date: 08/2026 | Best Before 9 Months</text>

      <!-- Rule 4: Manufacturer Address -->
      <rect x="70" y="300" width="355" height="52" rx="6" fill="#F0FDF4" stroke="#86EFAC" stroke-width="1.5" stroke-dasharray="3 2"/>
      <text x="82" y="318" fill="#15803D" font-family="Inter, sans-serif" font-weight="700" font-size="10">RULE 6(1)(a): REGISTERED MANUFACTURER ADDRESS</text>
      <text x="82" y="333" fill="#0F172A" font-family="Inter, sans-serif" font-weight="600" font-size="11">NutriGold Agro Foods Pvt. Ltd.</text>
      <text x="82" y="346" fill="#475569" font-family="Inter, sans-serif" font-size="10">Plot 14, Phase II, Industrial Area, Noida, UP - 201301</text>

      <!-- Rule 5: Consumer Care Details -->
      <rect x="70" y="360" width="355" height="52" rx="6" fill="#F0FDF4" stroke="#86EFAC" stroke-width="1.5" stroke-dasharray="3 2"/>
      <text x="82" y="378" fill="#15803D" font-family="Inter, sans-serif" font-weight="700" font-size="10">RULE 6(1)(n): CONSUMER REDRESSAL CELL</text>
      <text x="82" y="393" fill="#0F172A" font-family="Inter, sans-serif" font-weight="600" font-size="11">Toll Free: 1800-202-4455</text>
      <text x="82" y="406" fill="#475569" font-family="Inter, sans-serif" font-size="10">Grievance Officer: care@nutrigold.co.in</text>

      <!-- Barcode Mock -->
      <rect x="70" y="420" width="130" height="20" fill="#E2E8F0" rx="3"/>
      <text x="135" y="434" fill="#64748B" font-family="monospace" font-size="9" text-anchor="middle">8901234567890</text>
      <!-- Green Stamp Badge -->
      <circle cx="395" cy="425" r="16" fill="#DCFCE7" stroke="#15803D" stroke-width="1.5"/>
      <text x="395" y="430" fill="#15803D" font-family="Inter, sans-serif" font-weight="800" font-size="14" text-anchor="middle">✓</text>
    </svg>
  `,
  rules: [
    {
      id: 'mrp',
      name: 'MRP Declaration',
      ruleCode: 'Rule 6(1)(e)',
      law: 'PCR 2011 & Legal Metrology Act Sec 18',
      description: 'Checks if retail price is stated with mandatory suffix "incl. of all taxes"',
      status: 'PASS',
      extractedText: 'MRP: ₹ 35.00 (incl. of all taxes)',
      evidenceDetail: 'Clear numerical price with statutory "incl. of all taxes" declaration.',
    },
    {
      id: 'net_qty',
      name: 'Net Quantity',
      ruleCode: 'Rule 12 & 13',
      law: 'Legal Metrology Standard Units of Weights',
      description: 'Checks if weight or volume is declared in standardized SI metric units (g, kg, ml, l)',
      status: 'PASS',
      extractedText: 'Net Weight: 200 g',
      evidenceDetail: 'Standard metric unit "g" utilized with compliant font height proportion.',
    },
    {
      id: 'mfg_date',
      name: 'Manufacturing Date',
      ruleCode: 'Rule 6(1)(d)',
      law: 'PCR 2011 Date of Packaging Clause',
      description: 'Checks if month and year of packaging or manufacture is clearly specified',
      status: 'PASS',
      extractedText: 'Mfg Date: 08/2026 | Best Before 9 Months',
      evidenceDetail: 'Valid MM/YYYY packaging date present on principal display panel.',
    },
    {
      id: 'address',
      name: 'Manufacturer Address',
      ruleCode: 'Rule 6(1)(a)',
      law: 'PCR 2011 Packer / Manufacturer Identification',
      description: 'Checks if complete name and physical premise address is legibly declared',
      status: 'PASS',
      extractedText: 'NutriGold Agro Foods Pvt. Ltd., Plot 14, Phase II, Noida, UP - 201301',
      evidenceDetail: 'Full registered entity name and geolocatable postal address found.',
    },
    {
      id: 'consumer_care',
      name: 'Consumer Care Details',
      ruleCode: 'Rule 6(1)(n)',
      law: 'PCR 2011 Consumer Grievance Clause',
      description: 'Checks if customer helpline telephone or official grievance email is printed',
      status: 'PASS',
      extractedText: 'Toll Free: 1800-202-4455 | Email: care@nutrigold.co.in',
      evidenceDetail: 'Both toll-free contact and official grievance email address present.',
    },
  ],
};

export const VIOLATION_SAMPLE = {
  id: 'violation-sample',
  name: 'CrunchMax Spicy Potato Crisps',
  category: 'Extruded Snack Foods',
  batchNo: 'CM-2026-X41',
  packType: 'Metallized Poly Film',
  timestamp: '10-Sep-2026 14:38 IST',
  imageSvg: `
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <defs>
        <linearGradient id="v-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFE4E6" />
          <stop offset="100%" stop-color="#FECDD3" />
        </linearGradient>
        <filter id="v-shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.1" />
        </filter>
      </defs>
      <!-- Pack Outline -->
      <rect x="25" y="20" width="450" height="460" rx="16" fill="url(#v-bg)" stroke="#E11D48" stroke-width="2" filter="url(#v-shadow)"/>
      <rect x="35" y="30" width="430" height="440" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>

      <!-- Header / Brand -->
      <rect x="35" y="30" width="430" height="60" rx="12" fill="#E11D48"/>
      <text x="250" y="68" fill="#FFFFFF" font-family="Inter, sans-serif" font-weight="800" font-size="22" text-anchor="middle" letter-spacing="1">CRUNCHMAX</text>
      <text x="250" y="82" fill="#FFE4E6" font-family="Inter, sans-serif" font-weight="600" font-size="11" text-anchor="middle">SPICY POTATO CHIPS - TANGY MASALA</text>

      <!-- Label Body -->
      <rect x="55" y="105" width="390" height="345" rx="8" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1"/>
      <text x="70" y="130" fill="#0F172A" font-family="Inter, sans-serif" font-weight="700" font-size="13">BACK-OF-PACK NUTRITIONAL & LEGAL PANEL</text>
      <line x1="70" y1="138" x2="425" y2="138" stroke="#E2E8F0" stroke-width="1"/>

      <!-- Rule 1: MRP [VIOLATION - MISSING INCL OF ALL TAXES] -->
      <rect x="70" y="150" width="355" height="42" rx="6" fill="#FEF2F2" stroke="#F87171" stroke-width="1.5" stroke-dasharray="3 2"/>
      <text x="82" y="168" fill="#B91C1C" font-family="Inter, sans-serif" font-weight="700" font-size="10">⚠️ RULE 6(1)(e): VIOLATION DETECTED</text>
      <text x="82" y="184" fill="#991B1B" font-family="Inter, sans-serif" font-weight="700" font-size="13">MRP Rs. 30/- (Missing 'incl. of all taxes')</text>

      <!-- Rule 2: Net Quantity [VIOLATION - NON-STANDARD UNIT] -->
      <rect x="70" y="200" width="355" height="42" rx="6" fill="#FEF2F2" stroke="#F87171" stroke-width="1.5" stroke-dasharray="3 2"/>
      <text x="82" y="218" fill="#B91C1C" font-family="Inter, sans-serif" font-weight="700" font-size="10">⚠️ RULE 12: VIOLATION DETECTED</text>
      <text x="82" y="234" fill="#991B1B" font-family="Inter, sans-serif" font-weight="700" font-size="13">Weight: 75 (Missing metric unit 'g' or 'kg')</text>

      <!-- Rule 3: Mfg Date [PASS] -->
      <rect x="70" y="250" width="355" height="42" rx="6" fill="#F0FDF4" stroke="#86EFAC" stroke-width="1.5" stroke-dasharray="3 2"/>
      <text x="82" y="268" fill="#15803D" font-family="Inter, sans-serif" font-weight="700" font-size="10">RULE 6(1)(d): DATE OF PACKING / MFG</text>
      <text x="82" y="284" fill="#0F172A" font-family="Inter, sans-serif" font-weight="700" font-size="13">MFG: 07/2026 | EXP: 01/2027</text>

      <!-- Rule 4: Manufacturer Address [VIOLATION - INCOMPLETE ADDRESS] -->
      <rect x="70" y="300" width="355" height="52" rx="6" fill="#FEF2F2" stroke="#F87171" stroke-width="1.5" stroke-dasharray="3 2"/>
      <text x="82" y="318" fill="#B91C1C" font-family="Inter, sans-serif" font-weight="700" font-size="10">⚠️ RULE 6(1)(a): VIOLATION DETECTED</text>
      <text x="82" y="333" fill="#991B1B" font-family="Inter, sans-serif" font-weight="600" font-size="11">Manufactured in India for CrunchMax Brands</text>
      <text x="82" y="346" fill="#DC2626" font-family="Inter, sans-serif" font-size="10">No physical address, factory premises, or postal PIN declared</text>

      <!-- Rule 5: Consumer Care [PASS] -->
      <rect x="70" y="360" width="355" height="52" rx="6" fill="#F0FDF4" stroke="#86EFAC" stroke-width="1.5" stroke-dasharray="3 2"/>
      <text x="82" y="378" fill="#15803D" font-family="Inter, sans-serif" font-weight="700" font-size="10">RULE 6(1)(n): CONSUMER REDRESSAL CELL</text>
      <text x="82" y="393" fill="#0F172A" font-family="Inter, sans-serif" font-weight="600" font-size="11">Customer Support Email: support@crunchmax.in</text>
      <text x="82" y="406" fill="#475569" font-family="Inter, sans-serif" font-size="10">Consumer queries addressed within 48 business hours</text>

      <!-- Red Stamp Badge -->
      <circle cx="395" cy="425" r="16" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.5"/>
      <text x="395" y="430" fill="#DC2626" font-family="Inter, sans-serif" font-weight="800" font-size="14" text-anchor="middle">✕</text>
    </svg>
  `,
  rules: [
    {
      id: 'mrp',
      name: 'MRP Declaration',
      ruleCode: 'Rule 6(1)(e)',
      law: 'PCR 2011 & Legal Metrology Act Sec 18',
      description: 'Checks if retail price is stated with mandatory suffix "incl. of all taxes"',
      status: 'VIOLATION',
      extractedText: 'MRP Rs. 30/- (Missing "incl. of all taxes")',
      evidenceDetail: 'Price numeral found without statutory "inclusive of all taxes" suffix.',
    },
    {
      id: 'net_qty',
      name: 'Net Quantity',
      ruleCode: 'Rule 12 & 13',
      law: 'Legal Metrology Standard Units of Weights',
      description: 'Checks if weight or volume is declared in standardized SI metric units (g, kg, ml, l)',
      status: 'VIOLATION',
      extractedText: 'Weight: 75 (Missing standard unit "g" or "kg")',
      evidenceDetail: 'Numerical quantity declared without statutory SI unit abbreviation ("g", "kg", "ml").',
    },
    {
      id: 'mfg_date',
      name: 'Manufacturing Date',
      ruleCode: 'Rule 6(1)(d)',
      law: 'PCR 2011 Date of Packaging Clause',
      description: 'Checks if month and year of packaging or manufacture is clearly specified',
      status: 'PASS',
      extractedText: 'MFG: 07/2026 | EXP: 01/2027',
      evidenceDetail: 'Valid MM/YYYY packaging date present on principal display panel.',
    },
    {
      id: 'address',
      name: 'Manufacturer Address',
      ruleCode: 'Rule 6(1)(a)',
      law: 'PCR 2011 Packer / Manufacturer Identification',
      description: 'Checks if complete name and physical premise address is legibly declared',
      status: 'VIOLATION',
      extractedText: 'Manufactured for CrunchMax Brands (Premise missing)',
      evidenceDetail: 'Generic brand name declared without complete physical factory address or PIN.',
    },
    {
      id: 'consumer_care',
      name: 'Consumer Care Details',
      ruleCode: 'Rule 6(1)(n)',
      law: 'PCR 2011 Consumer Grievance Clause',
      description: 'Checks if customer helpline telephone or official grievance email is printed',
      status: 'PASS',
      extractedText: 'support@crunchmax.in',
      evidenceDetail: 'Grievance email address present and compliant with Rule 6(1)(n).',
    },
  ],
};

// Simulated analyzer for arbitrary uploaded images
export function analyzeUploadedImage(filename) {
  // Deterministic yet realistic response for demo:
  // If filename contains 'violation' or 'fail', mock failure, else standard analysis
  const isFail = filename.toLowerCase().includes('fail') || filename.toLowerCase().includes('violation');
  
  if (isFail) {
    return {
      name: filename.replace(/\.[^/.]+$/, "") || 'Uploaded Package Sample',
      category: 'Commercial Pre-Packaged Commodity',
      batchNo: 'SCAN-' + Math.floor(1000 + Math.random() * 9000),
      packType: 'Direct Capture',
      timestamp: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      rules: [
        {
          id: 'mrp',
          name: 'MRP Declaration',
          ruleCode: 'Rule 6(1)(e)',
          law: 'PCR 2011 & Legal Metrology Act Sec 18',
          description: 'Checks if retail price is stated with mandatory suffix "incl. of all taxes"',
          status: 'VIOLATION',
          extractedText: 'Extracted: "Rs. 99" (Omitted "incl. of all taxes")',
          evidenceDetail: 'Statutory taxes clause not detected in proximate OCR bounding box.',
        },
        {
          id: 'net_qty',
          name: 'Net Quantity',
          ruleCode: 'Rule 12 & 13',
          law: 'Legal Metrology Standard Units of Weights',
          description: 'Checks if weight or volume is declared in standardized SI metric units (g, kg, ml, l)',
          status: 'PASS',
          extractedText: 'Extracted: "Net Content: 500 g"',
          evidenceDetail: 'Permissible metric declaration verified.',
        },
        {
          id: 'mfg_date',
          name: 'Manufacturing Date',
          ruleCode: 'Rule 6(1)(d)',
          law: 'PCR 2011 Date of Packaging Clause',
          description: 'Checks if month and year of packaging or manufacture is clearly specified',
          status: 'PASS',
          extractedText: 'Extracted: "PKD: 09/2026"',
          evidenceDetail: 'Month/Year pattern validated.',
        },
        {
          id: 'address',
          name: 'Manufacturer Address',
          ruleCode: 'Rule 6(1)(a)',
          law: 'PCR 2011 Packer / Manufacturer Identification',
          description: 'Checks if complete name and physical premise address is legibly declared',
          status: 'PASS',
          extractedText: 'Extracted: "Indus Consumer Goods Ltd., Sector 62, Gurugram, HR"',
          evidenceDetail: 'Legible premise address extracted.',
        },
        {
          id: 'consumer_care',
          name: 'Consumer Care Details',
          ruleCode: 'Rule 6(1)(n)',
          law: 'PCR 2011 Consumer Grievance Clause',
          description: 'Checks if customer helpline telephone or official grievance email is printed',
          status: 'VIOLATION',
          extractedText: 'No consumer care phone number or email found on label',
          evidenceDetail: 'Mandatory consumer redressal contact absent from packaging.',
        },
      ]
    };
  }

  return {
    name: filename.replace(/\.[^/.]+$/, "") || 'Uploaded Package Sample',
    category: 'Commercial Pre-Packaged Commodity',
    batchNo: 'SCAN-' + Math.floor(1000 + Math.random() * 9000),
    packType: 'Direct Image Capture',
    timestamp: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    rules: [
      {
        id: 'mrp',
        name: 'MRP Declaration',
        ruleCode: 'Rule 6(1)(e)',
        law: 'PCR 2011 & Legal Metrology Act Sec 18',
        description: 'Checks if retail price is stated with mandatory suffix "incl. of all taxes"',
        status: 'PASS',
        extractedText: 'Extracted: "MRP: ₹ 65.00 (incl. of all taxes)"',
        evidenceDetail: 'Price detected along with mandatory tax declaration.',
      },
      {
        id: 'net_qty',
        name: 'Net Quantity',
        ruleCode: 'Rule 12 & 13',
        law: 'Legal Metrology Standard Units of Weights',
        description: 'Checks if weight or volume is declared in standardized SI metric units (g, kg, ml, l)',
        status: 'PASS',
        extractedText: 'Extracted: "Net Qty: 250 g"',
        evidenceDetail: 'Standard metric unit verified under Rule 12.',
      },
      {
        id: 'mfg_date',
        name: 'Manufacturing Date',
        ruleCode: 'Rule 6(1)(d)',
        law: 'PCR 2011 Date of Packaging Clause',
        description: 'Checks if month and year of packaging or manufacture is clearly specified',
        status: 'PASS',
        extractedText: 'Extracted: "MFD 08/2026"',
        evidenceDetail: 'Compliant MM/YYYY format recognized.',
      },
      {
        id: 'address',
        name: 'Manufacturer Address',
        ruleCode: 'Rule 6(1)(a)',
        law: 'PCR 2011 Packer / Manufacturer Identification',
        description: 'Checks if complete name and physical premise address is legibly declared',
        status: 'PASS',
        extractedText: 'Extracted: "Apex FMCG Foods, Industrial Estate, Pune, MH - 411018"',
        evidenceDetail: 'Physical address with postal pincode validated.',
      },
      {
        id: 'consumer_care',
        name: 'Consumer Care Details',
        ruleCode: 'Rule 6(1)(n)',
        law: 'PCR 2011 Consumer Grievance Clause',
        description: 'Checks if customer helpline telephone or official grievance email is printed',
        status: 'PASS',
        extractedText: 'Extracted: "Care Helpline: 1800-111-9988 | Email: care@apexfmcg.com"',
        evidenceDetail: 'Full grievance redressal channel detected.',
      },
    ]
  };
}
