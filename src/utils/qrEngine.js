import jsQR from 'jsqr';

/**
 * QR Code Decoding & Statutory Completeness Engine
 * Scans image data for QR codes and validates statutory declarations
 * under Legal Metrology Rules, 2011 and FSSAI Packaging & Labelling Regulations.
 */

/**
 * Decodes a QR code from an image source (data URL or Image element)
 * @param {string|HTMLImageElement} imageSource 
 * @returns {Promise<object>}
 */
export async function decodeQrFromImage(imageSource) {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);
        
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth'
        });

        if (code && code.data) {
          const parsed = parseQrPayload(code.data);
          resolve({
            hasQr: true,
            rawData: code.data,
            location: code.location,
            ...parsed
          });
        } else {
          resolve({
            hasQr: false,
            rawData: null,
            parsedDetails: null,
            missingFields: ['QR code not detected on packaging'],
            qrViolations: []
          });
        }
      };
      img.onerror = () => {
        resolve({
          hasQr: false,
          rawData: null,
          parsedDetails: null,
          missingFields: ['Failed to load image for QR decoding'],
          qrViolations: []
        });
      };

      if (typeof imageSource === 'string') {
        img.src = imageSource;
      } else if (imageSource instanceof HTMLImageElement) {
        img.src = imageSource.src;
      } else {
        resolve({ hasQr: false, rawData: null, parsedDetails: null, missingFields: [], qrViolations: [] });
      }
    } catch (e) {
      console.error('Error decoding QR code:', e);
      resolve({ hasQr: false, rawData: null, parsedDetails: null, missingFields: [], qrViolations: [] });
    }
  });
}

/**
 * Parses and verifies structured QR data
 * Supports JSON, URL params, or Pipe/Comma separated statutory text
 * @param {string} rawString 
 * @returns {object}
 */
export function parseQrPayload(rawString = '') {
  let details = {};
  const lower = rawString.toLowerCase();

  // Try parsing JSON payload
  if (rawString.trim().startsWith('{') && rawString.trim().endsWith('}')) {
    try {
      details = JSON.parse(rawString);
    } catch (e) {
      details = {};
    }
  }

  // If not JSON or empty, parse key-value pairs (e.g. MRP: 35 | MFG: 08/2026 | BATCH: NG-89)
  if (Object.keys(details).length === 0) {
    // Check URL parameters if it's a verification URL
    if (rawString.includes('?') && (rawString.startsWith('http://') || rawString.startsWith('https://'))) {
      try {
        const url = new URL(rawString);
        url.searchParams.forEach((val, key) => {
          details[key] = val;
        });
      } catch (e) {}
    }

    // Parse standard text patterns
    const mrpMatch = rawString.match(/(?:MRP|Price|Rs\.?)\s*[:=\-]?\s*([0-9]+(?:\.[0-9]{1,2})?)/i);
    if (mrpMatch) details.mrp = mrpMatch[1];

    const taxesMatch = lower.includes('incl') && lower.includes('tax');
    details.hasTaxes = taxesMatch;

    const mfgMatch = rawString.match(/(?:MFG|PKD|PACKED|DATE)\s*[:=\-]?\s*([0-9]{1,2}[\/\-\.][0-9]{2,4})/i);
    if (mfgMatch) details.mfgDate = mfgMatch[1];

    const expMatch = rawString.match(/(?:EXP|USE\s*BY|BEST\s*BEFORE)\s*[:=\-]?\s*([0-9]{1,2}[\/\-\.][0-9]{2,4})/i);
    if (expMatch) details.expDate = expMatch[1];

    const qtyMatch = rawString.match(/(?:NET\s*QTY|QTY|WEIGHT|VOLUME)\s*[:=\-]?\s*([0-9]+(?:\.[0-9]+)?\s*(?:g|kg|ml|l|ltr|pcs))/i);
    if (qtyMatch) details.netQty = qtyMatch[1];

    const batchMatch = rawString.match(/(?:BATCH|LOT|B\.NO)\s*[:=\-]?\s*([A-Za-z0-9\-]+)/i);
    if (batchMatch) details.batchNo = batchMatch[1];

    const fssaiMatch = rawString.match(/(?:FSSAI|LIC|REG)\s*[:=\-]?\s*([0-9]{14})/i);
    if (fssaiMatch) details.fssaiLic = fssaiMatch[1];

    const mfgByMatch = rawString.match(/(?:MFG\s*BY|MANUFACTURED\s*BY|PACKED\s*BY)\s*[:=\-]?\s*([^|\n]+)/i);
    if (mfgByMatch) details.manufacturer = mfgByMatch[1].trim();

    const careMatch = rawString.match(/(?:CARE|SUPPORT|HELPLINE|EMAIL)\s*[:=\-]?\s*([^|\n]+)/i);
    if (careMatch) details.consumerCare = careMatch[1].trim();
  }

  // Statutory Completeness Verification
  const missingFields = [];
  const qrViolations = [];

  // 1. MRP Verification
  if (!details.mrp) {
    missingFields.push('MRP (Retail Price)');
    qrViolations.push({
      rule: 'Rule 6(1)(e) PCR 2011',
      title: 'MRP Missing in QR Code',
      detail: 'The QR code does not declare the Maximum Retail Price (MRP).'
    });
  } else if (!details.hasTaxes && !lower.includes('tax') && !lower.includes('incl')) {
    qrViolations.push({
      rule: 'Rule 6(1)(e) PCR 2011',
      title: 'Tax Declaration Missing in QR',
      detail: `QR declares MRP ₹${details.mrp} but omits mandatory "inclusive of all taxes" clause.`
    });
  }

  // 2. Manufacturing Date Verification
  if (!details.mfgDate && !details.pkdDate) {
    missingFields.push('Date of Manufacture / Packing');
    qrViolations.push({
      rule: 'Rule 6(1)(d) PCR 2011',
      title: 'Mfg / Packing Date Missing in QR',
      detail: 'The QR code omits the mandatory month and year of packaging.'
    });
  }

  // 3. Expiry / Best Before Date Verification
  if (!details.expDate && !details.bestBefore && !lower.includes('best before') && !lower.includes('exp')) {
    missingFields.push('Expiry Date / Best Before');
    qrViolations.push({
      rule: 'FSSAI Reg 2.2.2 & PCR 2011',
      title: 'Expiry / Best Before Date Missing in QR',
      detail: 'Mandatory Expiry / Best Before date is not provided in QR statutory payload.'
    });
  }

  // 4. Net Quantity & Metric Unit
  if (!details.netQty && !details.netQuantity && !details.weight) {
    missingFields.push('Net Quantity in Standard Metric Units');
    qrViolations.push({
      rule: 'Rule 12 PCR 2011',
      title: 'Net Quantity Missing in QR',
      detail: 'The QR code does not state the standard net weight or volume.'
    });
  }

  // 5. Manufacturer Identity & Premise
  if (!details.manufacturer && !details.mfgBy && !details.packedBy) {
    missingFields.push('Manufacturer / Packer Identity & Premise');
    qrViolations.push({
      rule: 'Rule 6(1)(a) PCR 2011',
      title: 'Manufacturer Premise Missing in QR',
      detail: 'Manufacturer registered factory name and address omitted from QR payload.'
    });
  }

  const isQrFullyCompliant = qrViolations.length === 0 && missingFields.length === 0;

  return {
    parsedDetails: details,
    missingFields,
    qrViolations,
    isQrFullyCompliant
  };
}
