/**
 * Legal Metrology Packaging Compliance & Fraud Detection Rules Engine
 * Implements strict statutory validation under the Packaged Commodities Rules, 2011 (PCR 2011),
 * Legal Metrology Act, 2009, Price Tampering Rule 18(2), and FSSAI Ingredient Safety Regulations.
 */

import { analyzeIngredientSafety } from './ingredientSafetyEngine';

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
 */
export function detectPriceTampering(text = '') {
  const priceRegex = /(?:MRP|M\.R\.P\.?|Rs\.?|₹|INR|Price|Sticker|New\s*MRP|Printed\s*MRP)\s*[:\-]?\s*(\d+(?:\.\d{1,2})?)/gi;
  const matches = [...text.matchAll(priceRegex)];
  
  const prices = matches.map(m => parseFloat(m[1])).filter(p => !isNaN(p) && p > 0);
  const uniquePrices = Array.from(new Set(prices));

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
      description: `Contradictory MRP declarations found: Base price ₹${minPrice} marked up to ₹${maxPrice} (+₹${markup}, +${markupPercent}% increase). Rule 18(2) strictly prohibits altering, obliterating, or over-stickering retail sale prices.`,
      status: 'VIOLATION'
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
      status: 'SUSPICIOUS'
    };
  }

  return {
    hasTampering: false,
    allPrices: uniquePrices
  };
}

/**
 * Main Statutory PCR 2011 & Food Safety Evaluation Function
 * Identifies MRP, Mfg Date, Expiry Date, Net Quantity, Manufacturer, Consumer Care,
 * and executes toxicological / excessive ingredient evaluation.
 */
export function evaluateCompliance(rawOcrText = '', qrPayload = null) {
  const sanitizedText = sanitizeOcrText(rawOcrText);
  const lowerText = sanitizedText.toLowerCase();
  const lines = sanitizedText.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Run Tamper Detector (Rule 18(2) Price Overwrite)
  const tamperResult = detectPriceTampering(sanitizedText);

  // 2. Run Food Safety & Harmful / Excessive Ingredient Engine
  const ingredientSafetyResult = analyzeIngredientSafety(sanitizedText, qrPayload?.parsedDetails || null);

  // -------------------------------------------------------------
  // RULE 1: MRP & MANDATORY TAX CLAUSE [Rule 6(1)(e)]
  // -------------------------------------------------------------
  const mrpRegex = /(?:MRP|M\.R\.P\.?|Rs\.?|₹|INR|Price)\s*[:\-]?\s*(\d+(?:\.\d{1,2})?)/i;
  const mrpMatch = sanitizedText.match(mrpRegex);
  const qrMrp = qrPayload?.parsedDetails?.mrp;

  let rule1 = {
    id: 'mrp',
    name: 'Maximum Retail Price (MRP) & Taxes',
    ruleCode: 'Rule 6(1)(e)',
    act: 'Legal Metrology Act Sec 18 & PCR 2011',
    description: 'Checks if retail price is declared with mandatory suffix "inclusive of all taxes" without price tampering',
    status: 'VIOLATION',
    confidence: 88.5,
    extractedText: 'Not detected on scanned packaging',
    defectExplanation: 'Retail sale price numeral is missing on the statutory label.',
    isOmitted: true
  };

  if (tamperResult.hasTampering) {
    rule1.status = 'VIOLATION';
    rule1.confidence = 98.2;
    rule1.extractedText = `Sticker: ₹${tamperResult.stickerPrice} vs Base: ₹${tamperResult.originalPrice} (+₹${tamperResult.markup})`;
    rule1.defectExplanation = `Price tampering detected: ${tamperResult.description}`;
    rule1.isOmitted = false;
  } else if (mrpMatch || qrMrp) {
    const priceNumeral = mrpMatch ? mrpMatch[1] : qrMrp;
    const matchPos = mrpMatch ? mrpMatch.index : 0;

    const proximateWindow = mrpMatch ? sanitizedText.substring(
      Math.max(0, matchPos - 35),
      Math.min(sanitizedText.length, matchPos + 80)
    ).toLowerCase() : '';

    const hasTaxes = 
      proximateWindow.includes('incl') || 
      proximateWindow.includes('tax') || 
      lowerText.includes('inclusive of all taxes') || 
      lowerText.includes('incl. of all taxes') ||
      lowerText.includes('incl of all taxes') ||
      Boolean(qrPayload?.parsedDetails?.hasTaxes);

    if (hasTaxes) {
      rule1.status = 'PASS';
      rule1.confidence = 97.4;
      rule1.extractedText = `₹ ${priceNumeral} (incl. of all taxes)`;
      rule1.defectExplanation = null;
      rule1.isOmitted = false;
    } else {
      rule1.status = 'VIOLATION';
      rule1.confidence = 92.0;
      rule1.extractedText = `₹ ${priceNumeral} [MISSING 'incl. of all taxes']`;
      rule1.defectExplanation = 'Price numeral is present, but mandatory phrase "inclusive of all taxes" is omitted under Rule 6(1)(e).';
      rule1.isOmitted = false;
    }
  }

  // -------------------------------------------------------------
  // RULE 2: NET QUANTITY & STANDARD METRIC UNITS [Rule 12]
  // -------------------------------------------------------------
  const metricRegex = /(?:Net\s*(?:Qty|Quantity|Weight|Wt|Volume|Vol|Content)?\s*[:\-]?\s*)?(\d+(?:\.\d+)?)\s*(g|gm|gms|kg|ml|l|ltr|litres)\b/i;
  const faultyWeightRegex = /(?:Net\s*(?:Wt|Weight|Quantity|Qty)?|Weight|Wt)\s*[:\-]?\s*(\d+)(?!\s*(?:g|gm|kg|ml|l|piece|pcs|u|units|cm|m)\b)/i;

  const metricMatch = sanitizedText.match(metricRegex);
  const faultyMatch = sanitizedText.match(faultyWeightRegex);
  const qrQty = qrPayload?.parsedDetails?.netQty;

  let parsedDeclaredQty = null;
  let parsedDeclaredUnit = 'g';

  let rule2 = {
    id: 'net_qty',
    name: 'Net Quantity & Metric Units',
    ruleCode: 'Rule 12',
    act: 'Standard Units of Weight & Measure Clause',
    description: 'Checks if weight or volume is declared in standardized SI metric units (g, kg, ml, l)',
    status: 'VIOLATION',
    confidence: 86.2,
    extractedText: 'Not detected on scanned packaging',
    defectExplanation: 'No net metric weight or volume statement detected on packaging.',
    isOmitted: true
  };

  if (metricMatch || qrQty) {
    const rawVal = metricMatch ? metricMatch[0].trim() : qrQty;
    rule2.status = 'PASS';
    rule2.confidence = 98.4;
    rule2.extractedText = rawVal;
    rule2.defectExplanation = null;
    rule2.isOmitted = false;

    if (metricMatch) {
      parsedDeclaredQty = parseFloat(metricMatch[1]);
      parsedDeclaredUnit = metricMatch[2].toLowerCase().startsWith('k') ? 'kg' : (metricMatch[2].toLowerCase().startsWith('m') ? 'ml' : (metricMatch[2].toLowerCase().startsWith('l') ? 'l' : 'g'));
    } else if (qrQty) {
      const qm = qrQty.match(/([0-9]+(?:\.[0-9]+)?)\s*([A-Za-z]+)/);
      if (qm) {
        parsedDeclaredQty = parseFloat(qm[1]);
        parsedDeclaredUnit = qm[2].toLowerCase();
      }
    }
  } else if (faultyMatch) {
    rule2.status = 'VIOLATION';
    rule2.confidence = 92.1;
    rule2.extractedText = `${faultyMatch[0].trim()} [MISSING METRIC UNIT 'g'/'ml']`;
    rule2.defectExplanation = 'Quantity numeral declared without standard legal metric unit abbreviation (g, kg, ml).';
    rule2.isOmitted = false;
  }

  // -------------------------------------------------------------
  // RULE 3: MANUFACTURING / PACKING DATE [Rule 6(1)(d)]
  // -------------------------------------------------------------
  const dateNumRegex = /(?:mfg|pkd|packed|date|mfd)?\s*[:\-]?\s*(0[1-9]|1[0-2])[\/\-\.](20\d{2}|\d{2})/i;
  const dateTextRegex = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\.\-\/]+(?:20\d{2}|\d{2})/i;

  const dateNumMatch = sanitizedText.match(dateNumRegex);
  const dateTextMatch = sanitizedText.match(dateTextRegex);
  const qrMfg = qrPayload?.parsedDetails?.mfgDate;

  let rule3 = {
    id: 'mfg_date',
    name: 'Packing / Manufacturing Date',
    ruleCode: 'Rule 6(1)(d)',
    act: 'PCR 2011 Packaging Date Clause',
    description: 'Checks if month and year of packaging or manufacture is clearly specified',
    status: 'VIOLATION',
    confidence: 85.0,
    extractedText: 'Not detected on scanned packaging',
    defectExplanation: 'Month and year of manufacture/packing not identified.',
    isOmitted: true
  };

  if (dateNumMatch || qrMfg) {
    rule3.status = 'PASS';
    rule3.confidence = 96.8;
    rule3.extractedText = dateNumMatch ? dateNumMatch[0].trim() : `Mfg: ${qrMfg}`;
    rule3.defectExplanation = null;
    rule3.isOmitted = false;
  } else if (dateTextMatch) {
    rule3.status = 'PASS';
    rule3.confidence = 95.1;
    rule3.extractedText = dateTextMatch[0].trim();
    rule3.defectExplanation = null;
    rule3.isOmitted = false;
  }

  // -------------------------------------------------------------
  // RULE 4: EXPIRY / BEST BEFORE DATE [FSSAI Reg 2.2.2 & Rule 6]
  // -------------------------------------------------------------
  const expRegex = /(?:exp|expiry|best\s*before|use\s*by)\s*[:\-]?\s*(?:(0[1-9]|1[0-2])[\/\-\.](20\d{2}|\d{2})|(\d{1,2}\s*(?:months?|days?|years?))|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\.\-\/]+(?:20\d{2}|\d{2}))/i;
  const expMatch = sanitizedText.match(expRegex);
  const qrExp = qrPayload?.parsedDetails?.expDate;

  let rule4 = {
    id: 'exp_date',
    name: 'Expiry Date / Best Before',
    ruleCode: 'FSSAI Reg 2.2.2 & PCR Rule 6',
    act: 'Food Safety Expiry Declaration Mandate',
    description: 'Checks if expiry date, best before date, or consumption validity period is clearly declared',
    status: 'VIOLATION',
    confidence: 84.5,
    extractedText: 'Not detected on scanned packaging',
    defectExplanation: 'Mandatory Expiry Date or Best Before consumption statement is missing.',
    isOmitted: true
  };

  if (expMatch || qrExp) {
    rule4.status = 'PASS';
    rule4.confidence = 96.0;
    rule4.extractedText = expMatch ? expMatch[0].trim() : `Exp: ${qrExp}`;
    rule4.defectExplanation = null;
    rule4.isOmitted = false;
  } else if (lowerText.includes('best before 12 months') || lowerText.includes('best before 6 months') || lowerText.includes('best before 9 months')) {
    rule4.status = 'PASS';
    rule4.confidence = 94.0;
    rule4.extractedText = 'Best Before declared from packing date';
    rule4.defectExplanation = null;
    rule4.isOmitted = false;
  }

  // -------------------------------------------------------------
  // RULE 5: MANUFACTURER IDENTITY & PREMISE [Rule 6(1)(a)]
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
  const qrMaker = qrPayload?.parsedDetails?.manufacturer;

  let rule5 = {
    id: 'address',
    name: 'Manufacturer Identity & Premise',
    ruleCode: 'Rule 6(1)(a)',
    act: 'PCR 2011 Packer Identification Clause',
    description: 'Checks if complete name and physical premise address is legibly declared',
    status: 'VIOLATION',
    confidence: 81.4,
    extractedText: 'Not detected on scanned packaging',
    defectExplanation: 'Complete registered physical premise address is missing.',
    isOmitted: true
  };

  if (matchedKeywords.length >= 2 || (matchedKeywords.length >= 1 && pinMatch) || qrMaker) {
    const addressLine = lines.find(l => 
      matchedKeywords.some(k => l.toLowerCase().includes(k)) || pinRegex.test(l)
    ) || qrMaker || lines.slice(0, 3).join(' ');

    rule5.status = 'PASS';
    rule5.confidence = 94.2;
    rule5.extractedText = addressLine.substring(0, 80);
    rule5.defectExplanation = null;
    rule5.isOmitted = false;
  } else if (matchedKeywords.length === 1) {
    rule5.status = 'VIOLATION';
    rule5.confidence = 88.5;
    rule5.extractedText = 'Incomplete physical premise address';
    rule5.defectExplanation = 'Brand name declared without complete physical factory premises or postal PIN code.';
    rule5.isOmitted = false;
  }

  // -------------------------------------------------------------
  // RULE 6: CONSUMER REDRESSAL CONTACT [Rule 6(1)(n)]
  // -------------------------------------------------------------
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const phoneRegex = /(?:1800[-\s]?\d{3}[-\s]?\d{3,4}|(?:\+91|0)?[6-9]\d{9}|\b\d{3,4}[-\s]\d{6,8}\b)/;

  const emailMatch = sanitizedText.match(emailRegex);
  const phoneMatch = sanitizedText.match(phoneRegex);
  const qrCare = qrPayload?.parsedDetails?.consumerCare;

  let rule6 = {
    id: 'consumer_care',
    name: 'Consumer Redressal Contact',
    ruleCode: 'Rule 6(1)(n)',
    act: 'PCR 2011 Consumer Grievance Clause',
    description: 'Checks if customer helpline telephone or official grievance email is printed',
    status: 'VIOLATION',
    confidence: 84.1,
    extractedText: 'Not detected on scanned packaging',
    defectExplanation: 'No customer care email address or helpline telephone number detected.',
    isOmitted: true
  };

  if (emailMatch || phoneMatch || qrCare) {
    const contacts = [];
    if (phoneMatch) contacts.push(`Phone: ${phoneMatch[0]}`);
    if (emailMatch) contacts.push(`Email: ${emailMatch[0]}`);
    if (contacts.length === 0 && qrCare) contacts.push(`Care: ${qrCare}`);

    rule6.status = 'PASS';
    rule6.confidence = 97.6;
    rule6.extractedText = contacts.join(' | ');
    rule6.defectExplanation = null;
    rule6.isOmitted = false;
  }

  return {
    rules: [rule1, rule2, rule3, rule4, rule5, rule6],
    tamperResult,
    parsedDeclaredQty,
    parsedDeclaredUnit,
    ingredientSafetyResult
  };
}
