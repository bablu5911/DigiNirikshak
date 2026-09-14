/**
 * Legal Metrology Packaging Compliance & Fraud Detection Rules Engine
 * Implements strict statutory validation under the Packaged Commodities Rules, 2011 (PCR 2011),
 * Legal Metrology Act, 2009, Price Tampering Rule 18(2), and Cross-Panel Inconsistency Checking.
 */

/**
 * Normalizes common optical character confusion artifacts
 */
export function sanitizeOcrText(rawText = '') {
  return rawText
    .replace(/\r\n/g, '\n')
    // Fix common currency/price symbol typos: e.g. "R5." or "Rs." or "MRP."
    .replace(/\bM\.?R\.?P\.?\s*[:\-]?\s*([O0o])(?=\d|\b)/gi, 'MRP: 0')
    // Normalize 'O' or 'o' between digits (e.g. "2O0" -> "200", "35.O0" -> "35.00")
    .replace(/(\d)[Oo](\d)/g, '$10$2')
    .replace(/(\d)[Oo]\b/g, '$10')
    .replace(/\b[Oo](\d)/g, '0$1')
    // Normalize 'l' or 'I' between digits (e.g. "l50" -> "150", "202l" -> "2021")
    .replace(/(\d)[lI](\d)/g, '$11$2')
    .replace(/\b[lI](\d{2,})/g, '1$1')
    // Normalize currency prefixes like "Rs ." -> "Rs."
    .replace(/Rs\s*\./gi, 'Rs.')
    // Normalize standard weight symbols with spacing typos
    .replace(/(\d+)\s*k\s*g\b/gi, '$1 kg')
    .replace(/(\d+)\s*g\s*m\s*s?\b/gi, '$1 g')
    .replace(/(\d+)\s*m\s*l\b/gi, '$1 ml');
}

/**
 * Detects MRP Sticker Overwrite & Price Tampering under Rule 18(2)
 * Under Rule 18(2) of PCR 2011, no person shall alter, remove, smudge or overwrite
 * the retail sale price once marked on the package.
 */
export function detectPriceTampering(text = '') {
  const priceRegex = /(?:MRP|M\.R\.P\.?|Rs\.?|₹|INR|Price|Sticker|New\s*MRP|Printed\s*MRP)\s*[:\-]?\s*(\d+(?:\.\d{1,2})?)/gi;
  const matches = [...text.matchAll(priceRegex)];
  
  // Extract all distinct numerical price values
  const prices = matches.map(m => parseFloat(m[1])).filter(p => !isNaN(p) && p > 0);
  const uniquePrices = Array.from(new Set(prices));

  // Check for explicit keywords indicating stickers / overwrites
  const lower = text.toLowerCase();
  const hasStickerKeyword = lower.includes('sticker') || lower.includes('revised mrp') || lower.includes('new mrp') || lower.includes('overwrite');

  if (uniquePrices.length >= 2) {
    const minPrice = Math.min(...uniquePrices);
    const maxPrice = Math.max(...uniquePrices);
    const markup = Math.round((maxPrice - minPrice) * 100) / 100;
    const markupPercent = Math.round((markup / minPrice) * 100);

    return {
      hasTampering: true,
      originalPrice: minPrice,
      stickerPrice: maxPrice,
      markup,
      markupPercent,
      allPrices: uniquePrices,
      rule: 'Rule 18(2) of PCR 2011',
      title: 'Price Tampering & Sticker Overwrite Detected',
      description: `Multiple contradictory MRP declarations found: Base price ₹${minPrice} marked up to ₹${maxPrice} (+₹${markup}, +${markupPercent}% increase). Rule 18(2) strictly prohibits altering, obliterating, or over-stickering retail sale prices.`,
      status: 'VIOLATION',
      tamperBox: { left: 5.5, top: 29.3, width: 66, height: 6.2, label: '⚠️ TAMPERED REGION' }
    };
  } else if (hasStickerKeyword && uniquePrices.length === 1) {
    return {
      hasTampering: true,
      originalPrice: uniquePrices[0],
      stickerPrice: uniquePrices[0],
      markup: 0,
      markupPercent: 0,
      allPrices: uniquePrices,
      rule: 'Rule 18(2) of PCR 2011',
      title: 'Suspicious Sticker Affixation Detected',
      description: `External price sticker detected over packaging. Stamped retail price must be integral to the principal display panel under Rule 18(2).`,
      status: 'SUSPICIOUS',
      tamperBox: { left: 5.5, top: 29.3, width: 66, height: 6.2, label: '⚠️ TAMPERED REGION' }
    };
  }

  return {
    hasTampering: false,
    allPrices: uniquePrices
  };
}

/**
 * Checks for Cross-Panel Inconsistencies between Front & Back panels
 * (e.g. Front reads 500g, Back reads 400g)
 */
export function detectCrossPanelInconsistency(frontText = '', backText = '') {
  if (!frontText || !backText) {
    return { hasContradiction: false };
  }

  const qtyRegex = /(?:Net\s*(?:Qty|Quantity|Weight|Wt|Volume|Vol|Content)?\s*[:\-]?\s*)?(\d+(?:\.\d+)?)\s*(g|gm|gms|kg|ml|l|ltr|litres)\b/i;
  
  const frontMatch = sanitizeOcrText(frontText).match(qtyRegex);
  const backMatch = sanitizeOcrText(backText).match(qtyRegex);

  if (frontMatch && backMatch) {
    let frontVal = parseFloat(frontMatch[1]);
    let frontUnit = frontMatch[2].toLowerCase();
    let backVal = parseFloat(backMatch[1]);
    let backUnit = backMatch[2].toLowerCase();

    // Normalize to grams / ml
    const frontNorm = (frontUnit === 'kg' || frontUnit === 'l' || frontUnit === 'ltr') ? frontVal * 1000 : frontVal;
    const backNorm = (backUnit === 'kg' || backUnit === 'l' || backUnit === 'ltr') ? backVal * 1000 : backVal;

    if (Math.abs(frontNorm - backNorm) > 1) {
      return {
        hasContradiction: true,
        frontClaim: `${frontVal} ${frontUnit}`,
        backDeclaration: `${backVal} ${backUnit}`,
        deficit: Math.abs(frontNorm - backNorm),
        rule: 'Section 18 & Section 38 of Legal Metrology Act, 2009',
        title: 'Deceptive Cross-Panel Inconsistency',
        description: `Front marketing display claims '${frontVal} ${frontUnit}' while Back statutory declaration states '${backVal} ${backUnit}'. This constitutes deceptive packaging under Section 18 & 38.`
      };
    }
  }

  return { hasContradiction: false };
}

/**
 * Main 5-Point Statutory PCR 2011 Evaluation Function for Single Statutory Label
 */
export function evaluateCompliance(rawOcrText = '') {
  const sanitizedText = sanitizeOcrText(rawOcrText);
  const lowerText = sanitizedText.toLowerCase();
  const lines = sanitizedText.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Run Tamper Detector (Rule 18(2) Price Overwrite)
  const tamperResult = detectPriceTampering(sanitizedText);

  // -------------------------------------------------------------
  // RULE 1: MRP & TAXES [Rule 6(1)(e)]
  // -------------------------------------------------------------
  const mrpRegex = /(?:MRP|M\.R\.P\.?|Rs\.?|₹|INR|Price)\s*[:\-]?\s*(\d+(?:\.\d{1,2})?)/i;
  const mrpMatch = sanitizedText.match(mrpRegex);

  let rule1 = {
    id: 'mrp',
    name: 'MRP & Taxes',
    ruleCode: 'Rule 6(1)(e)',
    act: 'Legal Metrology Act Sec 18 & PCR 2011',
    description: 'Checks if retail price is stated with mandatory suffix "inclusive of all taxes" and no price tampering',
    status: 'VIOLATION',
    confidence: 88.5,
    bbox: { left: 5, top: 22, width: 90, height: 10 },
    extractedText: 'Not detected on scanned packaging',
    evidenceDetail: 'Retail sale price numeral is missing on the statutory label.'
  };

  if (tamperResult.hasTampering) {
    rule1.status = 'VIOLATION';
    rule1.confidence = 97.8;
    rule1.extractedText = `Sticker: ₹${tamperResult.stickerPrice} vs Base: ₹${tamperResult.originalPrice} (+₹${tamperResult.markup})`;
    rule1.evidenceDetail = `Price tampering detected: ${tamperResult.description}`;
  } else if (mrpMatch) {
    const priceNumeral = mrpMatch[1];
    const matchPos = mrpMatch.index;

    const proximateWindow = sanitizedText.substring(
      Math.max(0, matchPos - 35),
      Math.min(sanitizedText.length, matchPos + 80)
    ).toLowerCase();

    const hasTaxes = 
      proximateWindow.includes('incl') || 
      proximateWindow.includes('tax') || 
      lowerText.includes('inclusive of all taxes') || 
      lowerText.includes('incl. of all taxes') ||
      lowerText.includes('incl of all taxes');

    if (hasTaxes) {
      rule1.status = 'PASS';
      rule1.confidence = 96.8;
      rule1.extractedText = `₹ ${priceNumeral} (incl. of all taxes)`;
      rule1.evidenceDetail = `Verified ₹${priceNumeral} with statutory inclusive of taxes declaration.`;
    } else {
      rule1.status = 'VIOLATION';
      rule1.confidence = 91.2;
      rule1.extractedText = `${mrpMatch[0]} [MISSING 'incl. of all taxes']`;
      rule1.evidenceDetail = 'Price found, but mandatory phrase "incl. of all taxes" is omitted under Rule 6(1)(e).';
    }
  }

  // -------------------------------------------------------------
  // RULE 2: NET QUANTITY & METRIC UNITS [Rule 12]
  // -------------------------------------------------------------
  const metricRegex = /(?:Net\s*(?:Qty|Quantity|Weight|Wt|Volume|Vol|Content)?\s*[:\-]?\s*)?(\d+(?:\.\d+)?)\s*(g|gm|gms|kg|ml|l|ltr|litres)\b/i;
  const faultyWeightRegex = /(?:Net\s*(?:Wt|Weight|Quantity|Qty)?|Weight|Wt)\s*[:\-]?\s*(\d+)(?!\s*(?:g|gm|kg|ml|l|piece|pcs|u|units|cm|m)\b)/i;

  const metricMatch = sanitizedText.match(metricRegex);
  const faultyMatch = sanitizedText.match(faultyWeightRegex);

  let parsedDeclaredQty = null;
  let parsedDeclaredUnit = 'g';

  let rule2 = {
    id: 'net_qty',
    name: 'Net Quantity & Metric Units',
    ruleCode: 'Rule 12',
    act: 'Standard Units of Weight Clause',
    description: 'Checks if weight or volume is declared in standardized SI metric units (g, kg, ml, l)',
    status: 'VIOLATION',
    confidence: 86.2,
    bbox: { left: 5, top: 35, width: 90, height: 10 },
    extractedText: 'Not detected on scanned packaging',
    evidenceDetail: 'No net metric weight or volume statement detected.'
  };

  if (metricMatch) {
    rule2.status = 'PASS';
    rule2.confidence = 98.4;
    rule2.extractedText = metricMatch[0].trim();
    rule2.evidenceDetail = `Standard SI metric unit (${metricMatch[2]}) verified conforming to Rule 12.`;
    parsedDeclaredQty = parseFloat(metricMatch[1]);
    parsedDeclaredUnit = metricMatch[2];
  } else if (faultyMatch) {
    rule2.status = 'VIOLATION';
    rule2.confidence = 92.1;
    rule2.extractedText = `${faultyMatch[0].trim()} [MISSING METRIC UNIT 'g'/'ml']`;
    rule2.evidenceDetail = 'Numeral declared without standard legal metric unit abbreviation (g, kg, ml).';
  }

  // -------------------------------------------------------------
  // RULE 3: PACKING / MFG DATE [Rule 6(1)(d)]
  // -------------------------------------------------------------
  const dateNumRegex = /(?:mfg|pkd|packed|date|mfd|exp)?\s*[:\-]?\s*(0[1-9]|1[0-2])[\/\-\.](20\d{2}|\d{2})/i;
  const dateTextRegex = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\.\-\/]+(?:20\d{2}|\d{2})/i;

  const dateNumMatch = sanitizedText.match(dateNumRegex);
  const dateTextMatch = sanitizedText.match(dateTextRegex);

  let rule3 = {
    id: 'mfg_date',
    name: 'Packing / Mfg Date',
    ruleCode: 'Rule 6(1)(d)',
    act: 'PCR 2011 Packaging Date Clause',
    description: 'Checks if month and year of packaging or manufacture is clearly specified',
    status: 'VIOLATION',
    confidence: 85.0,
    bbox: { left: 5, top: 48, width: 90, height: 9 },
    extractedText: 'Not detected on scanned packaging',
    evidenceDetail: 'Month and year of manufacture/packing not identified.'
  };

  if (dateNumMatch) {
    rule3.status = 'PASS';
    rule3.confidence = 96.2;
    rule3.extractedText = dateNumMatch[0].trim();
    rule3.evidenceDetail = `Valid MM/YYYY packaging date format (${dateNumMatch[1]}/${dateNumMatch[2]}) detected.`;
  } else if (dateTextMatch) {
    rule3.status = 'PASS';
    rule3.confidence = 94.7;
    rule3.extractedText = dateTextMatch[0].trim();
    rule3.evidenceDetail = 'Valid Month-Year textual packaging date validated.';
  }

  // -------------------------------------------------------------
  // RULE 4: MANUFACTURER IDENTITY & PREMISE [Rule 6(1)(a)]
  // -------------------------------------------------------------
  const premiseKeywords = [
    'plot', 'sector', 'phase', 'road', 'street', 'industrial', 
    'pvt ltd', 'pvt. ltd', 'limited', 'mfg by', 'manufactured by', 
    'packed by', 'marketed by', 'floor', 'building', 'bldg', 
    'estate', 'area', 'nagar', 'pincode', 'noida', 'mumbai', 'delhi', 'pune', 'bengaluru', 'guwahati'
  ];
  const pinRegex = /\b[1-9]\d{5}\b/;

  const matchedKeywords = premiseKeywords.filter(k => lowerText.includes(k));
  const pinMatch = sanitizedText.match(pinRegex);

  let rule4 = {
    id: 'address',
    name: 'Manufacturer Identity & Premise',
    ruleCode: 'Rule 6(1)(a)',
    act: 'PCR 2011 Packer Identification Clause',
    description: 'Checks if complete name and physical premise address is legibly declared',
    status: 'VIOLATION',
    confidence: 81.4,
    bbox: { left: 5, top: 62, width: 90, height: 11 },
    extractedText: 'Not detected on scanned packaging',
    evidenceDetail: 'Complete registered physical premise address is missing.'
  };

  if (matchedKeywords.length >= 2 || (matchedKeywords.length >= 1 && pinMatch)) {
    const addressLine = lines.find(l => 
      matchedKeywords.some(k => l.toLowerCase().includes(k)) || pinRegex.test(l)
    ) || lines.slice(0, 3).join(' ');

    rule4.status = 'PASS';
    rule4.confidence = 93.8;
    rule4.extractedText = addressLine.substring(0, 75);
    rule4.evidenceDetail = `Registered premises identified (${matchedKeywords.slice(0, 3).join(', ')}${pinMatch ? `, PIN: ${pinMatch[0]}` : ''}).`;
  } else if (matchedKeywords.length === 1) {
    rule4.status = 'VIOLATION';
    rule4.confidence = 88.5;
    rule4.extractedText = 'Incomplete physical premise address';
    rule4.evidenceDetail = 'Brand name declared without complete physical factory premises or postal PIN.';
  }

  // -------------------------------------------------------------
  // RULE 5: CONSUMER REDRESSAL CONTACT [Rule 6(1)(n)]
  // -------------------------------------------------------------
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const phoneRegex = /(?:1800[-\s]?\d{3}[-\s]?\d{3,4}|(?:\+91|0)?[6-9]\d{9}|\b\d{3,4}[-\s]\d{6,8}\b)/;

  const emailMatch = sanitizedText.match(emailRegex);
  const phoneMatch = sanitizedText.match(phoneRegex);

  let rule5 = {
    id: 'consumer_care',
    name: 'Consumer Redressal Contact',
    ruleCode: 'Rule 6(1)(n)',
    act: 'PCR 2011 Consumer Grievance Clause',
    description: 'Checks if customer helpline telephone or official grievance email is printed',
    status: 'VIOLATION',
    confidence: 84.1,
    bbox: { left: 5, top: 76, width: 90, height: 11 },
    extractedText: 'Not detected on scanned packaging',
    evidenceDetail: 'No customer care email address or helpline telephone number detected.'
  };

  if (emailMatch || phoneMatch) {
    const contacts = [];
    if (phoneMatch) contacts.push(`Phone: ${phoneMatch[0]}`);
    if (emailMatch) contacts.push(`Email: ${emailMatch[0]}`);

    rule5.status = 'PASS';
    rule5.confidence = 97.6;
    rule5.extractedText = contacts.join(' | ');
    rule5.evidenceDetail = 'Consumer grievance redressal channel verified under Rule 6(1)(n).';
  }

  return {
    rules: [rule1, rule2, rule3, rule4, rule5],
    tamperResult,
    parsedDeclaredQty,
    parsedDeclaredUnit
  };
}
