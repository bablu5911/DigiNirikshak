/**
 * Legal Metrology Packaging Compliance & Fraud Detection Rules Engine
 * Implements robust, multi-strategy spatial and multi-line parsing
 * to detect MRP, dates, quantities, addresses, and food safety ingredients
 * placed at different positions, orientations, or stamped clusters on packaging.
 */

import { analyzeIngredientSafety } from './ingredientSafetyEngine';

/**
 * Normalizes common optical character confusion and dot-matrix artifacts
 */
export function sanitizeOcrText(rawText = '') {
  if (!rawText) return '';
  return rawText
    .replace(/\r\n/g, '\n')
    // Fix dot-matrix and spaced letters: "M R P" or "M. R. P." or "M.R.P."
    .replace(/\bM\s*\.?\s*R\s*\.?\s*P\s*\.?/gi, 'MRP')
    // Fix optical character confusions for MRP (common in stamped ink-jet font)
    .replace(/\b(MRF|MBP|MAP|WRP|HRP|MRР|MFR)\s*[:\-]/gi, 'MRP:')
    // Normalize verbose headings to standard MRP token
    .replace(/\bMAX(?:IMUM)?\s*RETAIL\s*PRICE\b/gi, 'MRP')
    .replace(/\bRETAIL\s*(?:SALE\s*)?PRICE\b/gi, 'MRP')
    // Fix currency symbols & typos: "Rs .", "Rs :", "RS.", "R5.", "R5 "
    .replace(/\b(?:Rs|RS|Re|RE|INR)\s*[\.:\-]?\s*/gi, 'Rs. ')
    .replace(/₹\s*[\.:\-]?\s*/g, 'Rs. ')
    // Normalize comma used as decimal separator: e.g. "Rs. 35,00" -> "Rs. 35.00"
    .replace(/Rs\.\s*(\d+),(\d{2})\b/gi, 'Rs. $1.$2')
    // Normalize spaced numerals inside price: e.g. "Rs. 3 5 . 0 0" -> "Rs. 35.00"
    .replace(/Rs\.\s*(\d)\s+(\d)/gi, 'Rs. $1$2')
    // Fix standard weight symbols with spacing typos
    .replace(/(\d+)\s*k\s*g\b/gi, '$1 kg')
    .replace(/(\d+)\s*g\s*m\s*s?\b/gi, '$1 g')
    .replace(/(\d+)\s*m\s*l\b/gi, '$1 ml')
    .replace(/(\d+)\s*l\s*t\s*r\b/gi, '$1 l')
    // Fix date spacing: e.g. "08 / 2026" -> "08/2026"
    .replace(/(\d{1,2})\s*[\/\-\.]\s*(\d{2,4})\b/g, '$1/$2');
}

/**
 * Detects MRP Sticker Overwrite & Price Tampering under Rule 18(2)
 */
export function detectPriceTampering(text = '', qrPayload = null) {
  const priceRegex = /(?:MRP|Price|Rs\.?|₹|INR|Sticker|New\s*MRP|Printed\s*MRP)\s*[:\-]?\s*(\d+(?:\.\d{1,2})?)/gi;
  const matches = [...text.matchAll(priceRegex)];
  
  const prices = matches.map(m => parseFloat(m[1])).filter(p => !isNaN(p) && p > 0);
  
  // If QR code declared an original MRP and text has sticker price
  if (qrPayload?.parsedDetails?.mrp) {
    const qrPrice = parseFloat(qrPayload.parsedDetails.mrp);
    if (!isNaN(qrPrice) && qrPrice > 0 && !prices.includes(qrPrice)) {
      prices.push(qrPrice);
    }
  }

  const uniquePrices = Array.from(new Set(prices));
  const lower = text.toLowerCase();
  const hasStickerKeyword = 
    lower.includes('sticker') || 
    lower.includes('revised mrp') || 
    lower.includes('new mrp') || 
    lower.includes('overwrite') ||
    lower.includes('revised price');

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
 * Robust Multi-Strategy MRP Extraction
 * Handles labels placed in different corners, stamped ink-jet blocks, and multi-line breaks.
 */
function extractMrp(text = '', lines = [], qrPayload = null) {
  const lower = text.toLowerCase();

  // Check if mandatory taxes phrase is present anywhere on the packaging
  const hasTaxesAnywhere = 
    lower.includes('incl') && (lower.includes('tax') || lower.includes('taxes')) ||
    lower.includes('inclusive of all taxes') || 
    lower.includes('incl. of all taxes') || 
    lower.includes('incl of all taxes') ||
    lower.includes('inclusive of taxes') ||
    Boolean(qrPayload?.parsedDetails?.hasTaxes);

  let detectedPrice = null;
  let rawExtracted = '';
  let confidence = 85.0;

  // Strategy 1: Direct Compound Pattern: "MRP: Rs. 35.00" or "MRP 35.00" or "MRP: 35/-"
  const directRegex = /\bMRP\s*[:\-=\.]?\s*(?:\(?[^)]*tax[^)]*\)?\s*)?(?:Rs\.?|INR|₹)?\s*[:\-=\.]?\s*(\d+(?:\.\d{1,2})?)\s*(?:\/\-)?/i;
  const directMatch = text.match(directRegex);
  if (directMatch) {
    detectedPrice = directMatch[1];
    rawExtracted = directMatch[0].trim();
    confidence = 97.5;
  }

  // Strategy 2: Currency Sign followed by number: "Rs. 35.00" or "Rs 35/-"
  if (!detectedPrice) {
    const currencyRegex = /\bRs\.\s*(\d+(?:\.\d{1,2})?)\s*(?:\/\-)?/i;
    const currencyMatch = text.match(currencyRegex);
    if (currencyMatch) {
      detectedPrice = currencyMatch[1];
      rawExtracted = currencyMatch[0].trim();
      confidence = 94.0;
    }
  }

  // Strategy 3: Multi-Line Association: "MRP:" on line N and number on line N+1 or N+2
  if (!detectedPrice) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/\bMRP\b/i.test(line) || /\bPrice\b/i.test(line)) {
        // Look within this line and next 3 lines
        const windowText = lines.slice(i, Math.min(lines.length, i + 4)).join(' ');
        const numMatch = windowText.match(/(?:Rs\.?|₹|INR)?\s*[:\-=\.]?\s*(\d+(?:\.\d{1,2})?)\s*(?:\/\-)?/i);
        if (numMatch && parseFloat(numMatch[1]) > 0) {
          detectedPrice = numMatch[1];
          rawExtracted = `MRP: Rs. ${detectedPrice}`;
          confidence = 92.0;
          break;
        }
      }
    }
  }

  // Strategy 4: Tax phrase proximity: Find price immediately preceding or following "(incl. of all taxes)"
  if (!detectedPrice) {
    const taxMatch = text.match(/(\d+(?:\.\d{1,2})?)\s*(?:\/\-)?\s*(?:\(?[^)]*tax[^)]*\)?)/i);
    if (taxMatch) {
      detectedPrice = taxMatch[1];
      rawExtracted = `₹ ${detectedPrice} (incl. of all taxes)`;
      confidence = 91.0;
    }
  }

  // Strategy 5: QR Code statutory payload fallback
  if (!detectedPrice && qrPayload?.parsedDetails?.mrp) {
    detectedPrice = qrPayload.parsedDetails.mrp;
    rawExtracted = `₹ ${detectedPrice} [Extracted via statutory QR]`;
    confidence = 98.0;
  }

  return {
    detectedPrice,
    rawExtracted,
    confidence,
    hasTaxes: hasTaxesAnywhere
  };
}

/**
 * Robust Net Quantity Extraction across multi-line or scattered packaging panels
 */
function extractNetQuantity(text = '', lines = [], qrPayload = null) {
  let detectedQty = null;
  let detectedUnit = 'g';
  let rawExtracted = '';
  let isFaulty = false;
  let confidence = 85.0;

  // Standard metric pattern: e.g. "Net Weight: 200 g", "Net Qty: 200g", "200 g", "500 ml", "1 L"
  const metricRegex = /(?:Net\s*(?:Qty|Quantity|Weight|Wt|Volume|Vol|Content)?\s*[:\-=\.]?\s*)?(\d+(?:\.\d+)?)\s*(g|gm|gms|gram|grams|kg|kilograms?|ml|milli[l|li]?tre|l|ltr|litres?)\b/i;
  const metricMatch = text.match(metricRegex);

  // Faulty pattern: numeral without metric unit
  const faultyWeightRegex = /(?:Net\s*(?:Wt|Weight|Quantity|Qty)?|Weight|Wt)\s*[:\-=\.]?\s*(\d+)(?!\s*(?:g|gm|kg|ml|l|piece|pcs|u|units|cm|m)\b)/i;
  const faultyMatch = text.match(faultyWeightRegex);

  if (metricMatch) {
    detectedQty = parseFloat(metricMatch[1]);
    const rawUnit = metricMatch[2].toLowerCase();
    detectedUnit = rawUnit.startsWith('k') ? 'kg' : (rawUnit.startsWith('m') ? 'ml' : (rawUnit.startsWith('l') ? 'l' : 'g'));
    rawExtracted = metricMatch[0].trim();
    confidence = 98.0;
  } else if (faultyMatch) {
    detectedQty = parseFloat(faultyMatch[1]);
    detectedUnit = 'g';
    rawExtracted = `${faultyMatch[0].trim()} [MISSING METRIC UNIT 'g'/'ml']`;
    isFaulty = true;
    confidence = 91.0;
  } else if (qrPayload?.parsedDetails?.netQty) {
    const qm = qrPayload.parsedDetails.netQty.match(/([0-9]+(?:\.[0-9]+)?)\s*([A-Za-z]+)/);
    if (qm) {
      detectedQty = parseFloat(qm[1]);
      detectedUnit = qm[2].toLowerCase();
      rawExtracted = qrPayload.parsedDetails.netQty;
      confidence = 98.0;
    }
  }

  return {
    detectedQty,
    detectedUnit,
    rawExtracted,
    isFaulty,
    confidence
  };
}

/**
 * Robust Manufacturing / Packing Date Extraction
 */
function extractMfgDate(text = '', lines = [], qrPayload = null) {
  // Matches MM/YYYY, MM/YY, DD/MM/YYYY, DD/MM/YY
  const dateNumRegex = /(?:mfg|pkd|packed|date|mfd|dom)?\s*[:\-=\.]?\s*(0[1-9]|1[0-2])[\/\-\.](20\d{2}|\d{2})\b/i;
  const dateFullRegex = /(?:0[1-9]|[12]\d|3[01])[\/\-\.](0[1-9]|1[0-2])[\/\-\.](20\d{2}|\d{2})\b/;
  const dateTextRegex = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\.\-\/]+(?:20\d{2}|\d{2})\b/i;

  const matchNum = text.match(dateNumRegex);
  const matchFull = text.match(dateFullRegex);
  const matchText = text.match(dateTextRegex);
  const qrMfg = qrPayload?.parsedDetails?.mfgDate;

  if (matchNum) {
    return { detectedDate: matchNum[0].trim(), confidence: 97.0 };
  } else if (matchFull) {
    return { detectedDate: matchFull[0].trim(), confidence: 96.0 };
  } else if (matchText) {
    return { detectedDate: matchText[0].trim(), confidence: 95.0 };
  } else if (qrMfg) {
    return { detectedDate: `Mfg: ${qrMfg} [via QR]`, confidence: 98.0 };
  }

  return { detectedDate: null, confidence: 85.0 };
}

/**
 * Robust Expiry / Best Before Date Extraction
 */
function extractExpDate(text = '', lines = [], qrPayload = null) {
  const expRegex = /(?:exp|expiry|best\s*before|use\s*by|valid\s*till)\s*[:\-=\.]?\s*(?:(0[1-9]|1[0-2])[\/\-\.](20\d{2}|\d{2})|(\d{1,2}\s*(?:months?|days?|years?))|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\.\-\/]+(?:20\d{2}|\d{2}))/i;
  const match = text.match(expRegex);
  const qrExp = qrPayload?.parsedDetails?.expDate;

  if (match) {
    return { detectedDate: match[0].trim(), confidence: 96.5 };
  } else if (text.toLowerCase().includes('best before') || text.toLowerCase().includes('use by')) {
    return { detectedDate: 'Best Before consumption statement present', confidence: 94.0 };
  } else if (qrExp) {
    return { detectedDate: `Exp: ${qrExp} [via QR]`, confidence: 98.0 };
  }

  return { detectedDate: null, confidence: 84.0 };
}

/**
 * Robust Manufacturer Identity & Physical Premise Extraction
 */
function extractManufacturer(text = '', lines = [], qrPayload = null) {
  const lower = text.toLowerCase();
  const premiseKeywords = [
    'plot', 'sector', 'phase', 'road', 'street', 'industrial', 
    'pvt ltd', 'pvt. ltd', 'limited', 'mfg by', 'manufactured by', 
    'packed by', 'marketed by', 'floor', 'building', 'bldg', 
    'estate', 'area', 'nagar', 'pincode', 'noida', 'mumbai', 'delhi', 'pune', 'bengaluru', 'guwahati', 'ahmedabad', 'hyderabad'
  ];
  const pinRegex = /\b[1-9]\d{5}\b/;

  const matchedKeywords = premiseKeywords.filter(k => lower.includes(k));
  const pinMatch = text.match(pinRegex);
  const qrMaker = qrPayload?.parsedDetails?.manufacturer;

  if (matchedKeywords.length >= 2 || (matchedKeywords.length >= 1 && pinMatch) || qrMaker) {
    const addressLine = lines.find(l => 
      matchedKeywords.some(k => l.toLowerCase().includes(k)) || pinRegex.test(l)
    ) || qrMaker || lines.slice(0, 3).join(' ');

    return {
      isValid: true,
      extracted: addressLine.substring(0, 85).trim(),
      confidence: 95.0
    };
  } else if (matchedKeywords.length === 1) {
    return {
      isValid: false,
      extracted: 'Incomplete physical premise address',
      confidence: 88.0
    };
  }

  return {
    isValid: false,
    extracted: null,
    confidence: 82.0
  };
}

/**
 * Robust Consumer Care Extraction
 */
function extractConsumerCare(text = '', qrPayload = null) {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const phoneRegex = /(?:1800[-\s]?\d{3}[-\s]?\d{3,4}|(?:\+91|0)?[6-9]\d{9}|\b\d{3,4}[-\s]\d{6,8}\b)/;

  const emailMatch = text.match(emailRegex);
  const phoneMatch = text.match(phoneRegex);
  const qrCare = qrPayload?.parsedDetails?.consumerCare;

  if (emailMatch || phoneMatch || qrCare) {
    const contacts = [];
    if (phoneMatch) contacts.push(`Phone: ${phoneMatch[0]}`);
    if (emailMatch) contacts.push(`Email: ${emailMatch[0]}`);
    if (contacts.length === 0 && qrCare) contacts.push(`Care: ${qrCare}`);

    return {
      isValid: true,
      extracted: contacts.join(' | '),
      confidence: 97.5
    };
  }

  return {
    isValid: false,
    extracted: null,
    confidence: 83.0
  };
}

/**
 * Main Evaluation Pipeline
 */
export function evaluateCompliance(rawOcrText = '', qrPayload = null) {
  const sanitizedText = sanitizeOcrText(rawOcrText);
  const lines = sanitizedText.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Run Tamper Detector (Rule 18(2) Price Overwrite)
  const tamperResult = detectPriceTampering(sanitizedText, qrPayload);

  // 2. Run Food Safety & Harmful / Excessive Ingredient Engine
  const ingredientSafetyResult = analyzeIngredientSafety(sanitizedText, qrPayload?.parsedDetails || null);

  // 3. Robust Extraction of Individual Declarations
  const mrpInfo = extractMrp(sanitizedText, lines, qrPayload);
  const qtyInfo = extractNetQuantity(sanitizedText, lines, qrPayload);
  const mfgInfo = extractMfgDate(sanitizedText, lines, qrPayload);
  const expInfo = extractExpDate(sanitizedText, lines, qrPayload);
  const makerInfo = extractManufacturer(sanitizedText, lines, qrPayload);
  const careInfo = extractConsumerCare(sanitizedText, qrPayload);

  // -------------------------------------------------------------
  // RULE 1: MRP & TAX CLAUSE [Rule 6(1)(e)]
  // -------------------------------------------------------------
  let rule1 = {
    id: 'mrp',
    name: 'Maximum Retail Price (MRP) & Taxes',
    ruleCode: 'Rule 6(1)(e)',
    act: 'Legal Metrology Act Sec 18 & PCR 2011',
    description: 'Checks if retail price is declared with mandatory suffix "inclusive of all taxes" without price tampering',
    status: 'VIOLATION',
    confidence: mrpInfo.confidence,
    extractedText: 'Not detected on scanned packaging',
    defectExplanation: 'Retail sale price numeral is missing on the statutory label.',
    isOmitted: true
  };

  if (tamperResult.hasTampering) {
    rule1.status = 'VIOLATION';
    rule1.confidence = 98.5;
    rule1.extractedText = `Sticker: ₹${tamperResult.stickerPrice} vs Base: ₹${tamperResult.originalPrice} (+₹${tamperResult.markup})`;
    rule1.defectExplanation = `Price tampering detected: ${tamperResult.description}`;
    rule1.isOmitted = false;
  } else if (mrpInfo.detectedPrice) {
    rule1.isOmitted = false;
    if (mrpInfo.hasTaxes) {
      rule1.status = 'PASS';
      rule1.extractedText = `₹ ${mrpInfo.detectedPrice} (incl. of all taxes)`;
      rule1.defectExplanation = null;
    } else {
      rule1.status = 'VIOLATION';
      rule1.extractedText = `₹ ${mrpInfo.detectedPrice} [MISSING 'incl. of all taxes']`;
      rule1.defectExplanation = 'Price numeral is present, but mandatory phrase "inclusive of all taxes" is omitted under Rule 6(1)(e).';
    }
  }

  // -------------------------------------------------------------
  // RULE 2: NET QUANTITY & STANDARD METRIC UNITS [Rule 12]
  // -------------------------------------------------------------
  let rule2 = {
    id: 'net_qty',
    name: 'Net Quantity & Metric Units',
    ruleCode: 'Rule 12',
    act: 'Standard Units of Weight & Measure Clause',
    description: 'Checks if weight or volume is declared in standardized SI metric units (g, kg, ml, l)',
    status: 'VIOLATION',
    confidence: qtyInfo.confidence,
    extractedText: 'Not detected on scanned packaging',
    defectExplanation: 'No net metric weight or volume statement detected on packaging.',
    isOmitted: true
  };

  if (qtyInfo.detectedQty && !qtyInfo.isFaulty) {
    rule2.status = 'PASS';
    rule2.extractedText = qtyInfo.rawExtracted || `${qtyInfo.detectedQty} ${qtyInfo.detectedUnit}`;
    rule2.defectExplanation = null;
    rule2.isOmitted = false;
  } else if (qtyInfo.isFaulty) {
    rule2.status = 'VIOLATION';
    rule2.extractedText = qtyInfo.rawExtracted;
    rule2.defectExplanation = 'Quantity numeral declared without standard legal metric unit abbreviation (g, kg, ml).';
    rule2.isOmitted = false;
  }

  // -------------------------------------------------------------
  // RULE 3: MANUFACTURING / PACKING DATE [Rule 6(1)(d)]
  // -------------------------------------------------------------
  let rule3 = {
    id: 'mfg_date',
    name: 'Packing / Manufacturing Date',
    ruleCode: 'Rule 6(1)(d)',
    act: 'PCR 2011 Packaging Date Clause',
    description: 'Checks if month and year of packaging or manufacture is clearly specified',
    status: 'VIOLATION',
    confidence: mfgInfo.confidence,
    extractedText: 'Not detected on scanned packaging',
    defectExplanation: 'Month and year of manufacture/packing not identified.',
    isOmitted: true
  };

  if (mfgInfo.detectedDate) {
    rule3.status = 'PASS';
    rule3.extractedText = mfgInfo.detectedDate;
    rule3.defectExplanation = null;
    rule3.isOmitted = false;
  }

  // -------------------------------------------------------------
  // RULE 4: EXPIRY / BEST BEFORE DATE [FSSAI Reg 2.2.2 & Rule 6]
  // -------------------------------------------------------------
  let rule4 = {
    id: 'exp_date',
    name: 'Expiry Date / Best Before',
    ruleCode: 'FSSAI Reg 2.2.2 & PCR Rule 6',
    act: 'Food Safety Expiry Declaration Mandate',
    description: 'Checks if expiry date, best before date, or consumption validity period is clearly declared',
    status: 'VIOLATION',
    confidence: expInfo.confidence,
    extractedText: 'Not detected on scanned packaging',
    defectExplanation: 'Mandatory Expiry Date or Best Before consumption statement is missing.',
    isOmitted: true
  };

  if (expInfo.detectedDate) {
    rule4.status = 'PASS';
    rule4.extractedText = expInfo.detectedDate;
    rule4.defectExplanation = null;
    rule4.isOmitted = false;
  }

  // -------------------------------------------------------------
  // RULE 5: MANUFACTURER IDENTITY & PREMISE [Rule 6(1)(a)]
  // -------------------------------------------------------------
  let rule5 = {
    id: 'address',
    name: 'Manufacturer Identity & Premise',
    ruleCode: 'Rule 6(1)(a)',
    act: 'PCR 2011 Packer Identification Clause',
    description: 'Checks if complete name and physical premise address is legibly declared',
    status: 'VIOLATION',
    confidence: makerInfo.confidence,
    extractedText: 'Not detected on scanned packaging',
    defectExplanation: 'Complete registered physical premise address is missing.',
    isOmitted: true
  };

  if (makerInfo.isValid) {
    rule5.status = 'PASS';
    rule5.extractedText = makerInfo.extracted;
    rule5.defectExplanation = null;
    rule5.isOmitted = false;
  } else if (makerInfo.extracted) {
    rule5.status = 'VIOLATION';
    rule5.extractedText = makerInfo.extracted;
    rule5.defectExplanation = 'Brand name declared without complete physical factory premises or postal PIN code.';
    rule5.isOmitted = false;
  }

  // -------------------------------------------------------------
  // RULE 6: CONSUMER REDRESSAL CONTACT [Rule 6(1)(n)]
  // -------------------------------------------------------------
  let rule6 = {
    id: 'consumer_care',
    name: 'Consumer Redressal Contact',
    ruleCode: 'Rule 6(1)(n)',
    act: 'PCR 2011 Consumer Grievance Clause',
    description: 'Checks if customer helpline telephone or official grievance email is printed',
    status: 'VIOLATION',
    confidence: careInfo.confidence,
    extractedText: 'Not detected on scanned packaging',
    defectExplanation: 'No customer care email address or helpline telephone number detected.',
    isOmitted: true
  };

  if (careInfo.isValid) {
    rule6.status = 'PASS';
    rule6.extractedText = careInfo.extracted;
    rule6.defectExplanation = null;
    rule6.isOmitted = false;
  }

  return {
    rules: [rule1, rule2, rule3, rule4, rule5, rule6],
    tamperResult,
    parsedDeclaredQty: qtyInfo.detectedQty || 200,
    parsedDeclaredUnit: qtyInfo.detectedUnit || 'g',
    ingredientSafetyResult
  };
}

/**
 * Merges new crop/re-scan rules with existing full-packet scan rules
 * Prevents wiping out previously recognized rules when cropping a sub-region!
 */
export function mergeEvaluatedRules(existingRules = [], newRules = []) {
  if (!existingRules || existingRules.length === 0) return newRules;

  return existingRules.map(ex => {
    const match = newRules.find(nr => nr.id === ex.id);
    if (!match) return ex;

    // If new scan found a PASS or newly detected snippet, adopt it!
    if (match.status === 'PASS' || (!match.isOmitted && ex.isOmitted)) {
      return match;
    }
    // If existing rule had passed, retain the pass
    if (ex.status === 'PASS') {
      return ex;
    }
    return match;
  });
}
