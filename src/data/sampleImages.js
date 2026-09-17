import QRCode from 'qrcode';

/**
 * High-Contrast Single-Label Statutory Packaging Generator
 * Generates realistic packaging labels with real scannable QR codes,
 * comprehensive statutory declarations (Rule 6 PCR 2011),
 * and food safety ingredient / nutritional panels.
 */

// Draws an authentic, scannable QR code directly onto the 2D canvas
function drawQrToCanvas(ctx, text, x, y, size = 120) {
  try {
    const qr = QRCode.create(text, { errorCorrectionLevel: 'M' });
    const moduleCount = qr.modules.size;
    const cellSize = size / moduleCount;

    // White background padding
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x - 6, y - 6, size + 12, size + 12);
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 6, y - 6, size + 12, size + 12);

    ctx.fillStyle = '#000000';
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (qr.modules.get(r, c)) {
          ctx.fillRect(
            Math.round(x + c * cellSize), 
            Math.round(y + r * cellSize), 
            Math.ceil(cellSize), 
            Math.ceil(cellSize)
          );
        }
      }
    }
  } catch (e) {
    console.error('Error drawing QR to canvas:', e);
  }
}

export function generateSamplePack(type = 'compliant') {
  const canvas = document.createElement('canvas');
  canvas.width = 820;
  canvas.height = 980;
  const ctx = canvas.getContext('2d');

  // High-contrast clean white background & dark institutional border
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 820, 980);
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#0F172A';
  ctx.strokeRect(20, 20, 780, 940);

  if (type === 'compliant') {
    // -------------------------------------------------------------
    // PRESET 1: COMPLIANT PACKET (NutriGold Whole Grain Biscuits 200g)
    // -------------------------------------------------------------
    // Header
    ctx.fillStyle = '#1E3A8A';
    ctx.fillRect(24, 24, 772, 85);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NUTRIGOLD - STATUTORY & NUTRITION PANEL', 410, 75);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('STATUTORY DECLARATIONS UNDER LEGAL METROLOGY & FSSAI', 50, 145);

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 155);
    ctx.lineTo(770, 155);
    ctx.stroke();

    // Rule 1: MRP & Taxes
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText('Maximum Retail Price (MRP):', 50, 195);
    ctx.font = 'bold 26px Arial, sans-serif';
    ctx.fillText('MRP: Rs. 35.00 (incl. of all taxes)', 50, 230);

    // Rule 2: Net Quantity
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText('Net Quantity:', 50, 285);
    ctx.font = 'bold 26px Arial, sans-serif';
    ctx.fillText('Net Weight: 200 g', 50, 320);

    // Rule 3: Dates (Mfg & Best Before / Expiry)
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText('Manufacturing & Expiry Dates:', 50, 375);
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.fillText('Mfg Date: 08/2026  |  Best Before: 02/2027', 50, 410);

    // Rule 4: Manufacturer
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText('Manufactured & Packed By:', 50, 465);
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText('NutriGold Agro Foods Pvt. Ltd.', 50, 495);
    ctx.font = '18px Arial, sans-serif';
    ctx.fillText('Plot 14, Phase II, Industrial Area, Noida, UP - 201301', 50, 522);
    ctx.fillText('FSSAI Lic. No. 10019051000842', 50, 548);

    // Rule 5: Consumer Care
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText('Consumer Care & Grievance Cell:', 50, 600);
    ctx.font = '18px Arial, sans-serif';
    ctx.fillText('Toll Free: 1800-202-4455  |  Email: care@nutrigold.co.in', 50, 630);

    // INGREDIENTS & NUTRITION FACTS (100% Safe & Permissible)
    ctx.lineWidth = 1.5;
    ctx.strokeRect(50, 660, 540, 160);
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillText('Ingredients & Nutritional Information (Per 100g):', 60, 690);
    ctx.font = '15px Arial, sans-serif';
    ctx.fillText('Ingredients: Whole Wheat Flour (65%), Rolled Oats (15%), Butter, Salt.', 60, 720);
    ctx.fillText('• Added Sugar: 9.2g (Safe < 22g FSSAI Limit)', 60, 748);
    ctx.fillText('• Sodium: 180mg (Safe < 600mg FSSAI Limit)', 60, 774);
    ctx.fillText('• Saturated Fat: 4.2g  |  Trans Fat: 0g (Zero Trans Fat)', 60, 800);

    // Real Scannable QR Code
    const qrData = JSON.stringify({
      mrp: '35.00',
      hasTaxes: true,
      netQty: '200g',
      mfgDate: '08/2026',
      expDate: '02/2027',
      batchNo: 'NG-2026-B89',
      manufacturer: 'NutriGold Agro Foods Pvt. Ltd., Plot 14, Phase II, Noida, UP - 201301',
      consumerCare: '1800-202-4455 | care@nutrigold.co.in',
      sugar: 9.2,
      sodium: 180,
      transFat: 0
    });
    drawQrToCanvas(ctx, qrData, 620, 660, 140);
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCAN STATUTORY QR', 690, 825);
    ctx.textAlign = 'left';

    // Barcode
    for (let x = 50; x < 280; x += 5) {
      const w = (x % 10 === 0) ? 3 : 1.5;
      ctx.fillRect(x, 860, w, 50);
    }
    ctx.font = '13px monospace';
    ctx.fillText('8901234567890 (Batch: NG-2026-B89)', 50, 925);

    return canvas.toDataURL('image/png');
  }

  if (type === 'mislabeled' || type === 'violation') {
    // -------------------------------------------------------------
    // PRESET 2: MISLABELED & EXCESSIVE SODIUM PACKET (CrunchMax 75g)
    // -------------------------------------------------------------
    ctx.fillStyle = '#991B1B';
    ctx.fillRect(24, 24, 772, 85);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CRUNCHMAX - NUTRITIONAL & LEGAL PANEL', 410, 75);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('BACK-OF-PACK DECLARATIONS PANEL', 50, 145);

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 155);
    ctx.lineTo(770, 155);
    ctx.stroke();

    // Rule 1: MRP [VIOLATION - Missing 'incl. of all taxes']
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText('Maximum Retail Price:', 50, 195);
    ctx.font = 'bold 26px Arial, sans-serif';
    ctx.fillText('MRP: Rs. 30/-', 50, 230);

    // Rule 2: Quantity [VIOLATION - Missing standard metric unit 'g']
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText('Quantity Declaration:', 50, 285);
    ctx.font = 'bold 26px Arial, sans-serif';
    ctx.fillText('Weight: 75', 50, 320);

    // Rule 3: Dates [PASS]
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText('Packaging Date:', 50, 375);
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.fillText('MFG: 07/2026  |  Exp: 01/2027', 50, 410);

    // Rule 4: Address [VIOLATION - Incomplete Premise]
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText('Manufactured for:', 50, 465);
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText('CrunchMax Consumer Brands', 50, 495);

    // Rule 5: Consumer Care [PASS]
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText('Feedback & Support:', 50, 560);
    ctx.font = '18px Arial, sans-serif';
    ctx.fillText('Email: support@crunchmax.in  |  Phone: +91 9876543210', 50, 590);

    // INGREDIENTS & NUTRITIONAL PROFILE [VIOLATIONS: Excessive Sodium 890mg & High Palm Fat 16g]
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#DC2626';
    ctx.strokeRect(50, 630, 540, 185);
    ctx.fillStyle = '#DC2626';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillText('Ingredients & Nutrition (Per 100g) [HEALTH HAZARDS]:', 60, 660);
    ctx.fillStyle = '#0F172A';
    ctx.font = '15px Arial, sans-serif';
    ctx.fillText('Ingredients: Dehydrated Potato Flakes, Refined Palm Olein, Iodised Salt.', 60, 690);
    ctx.fillStyle = '#B91C1C';
    ctx.font = 'bold 15px Arial, sans-serif';
    ctx.fillText('• Sodium: 890mg (EXCEEDS FSSAI 600mg CEILING - HYPERTENSION RISK)', 60, 720);
    ctx.fillText('• Saturated Fat: 16.0g (EXCEEDS 10g THRESHOLD - PALM OIL SATURATION)', 60, 748);
    ctx.fillStyle = '#0F172A';
    ctx.font = '15px Arial, sans-serif';
    ctx.fillText('• Added Sugar: 14.5g  |  Trans Fat: 1.1%', 60, 775);
    ctx.fillText('• Contains Permitted Synthetic Food Colour: Tartrazine (INS 102)', 60, 800);

    // Embedded QR Code (Contains statutory omissions matching the packaging)
    const qrData = JSON.stringify({
      mrp: '30',
      hasTaxes: false,
      netQty: '75',
      mfgDate: '07/2026',
      expDate: '01/2027',
      batchNo: 'CM-2026-X41',
      sodium: 890,
      sugar: 14.5
    });
    drawQrToCanvas(ctx, qrData, 620, 650, 140);
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('QR (DEFECTIVE DATA)', 690, 815);
    ctx.textAlign = 'left';

    // Barcode
    for (let x = 50; x < 280; x += 5) {
      const w = (x % 10 === 0) ? 3 : 1.5;
      ctx.fillRect(x, 860, w, 50);
    }
    ctx.font = '13px monospace';
    ctx.fillText('8909876543210 (Batch: CM-2026-X41)', 50, 925);

    return canvas.toDataURL('image/png');
  }

  // -------------------------------------------------------------
  // PRESET 3: TAMPERED & BANNED ADDITIVE PACKET (Royal Chai 250g)
  // -------------------------------------------------------------
  ctx.fillStyle = '#78350F';
  ctx.fillRect(24, 24, 772, 85);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ROYAL CHAI - FORENSIC EVIDENCE PACKET', 410, 75);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 16px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('STATUTORY REAR PANEL (FORENSIC AUDIT TARGET)', 50, 145);

  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, 155);
  ctx.lineTo(770, 155);
  ctx.stroke();

  // Rule 18(2) Price Tampering: Printed MRP Rs. 120 with Rs. 150 Sticker
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 20px Arial, sans-serif';
  ctx.fillText('Maximum Retail Price (Printed Factory Base):', 50, 195);
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.fillText('Printed MRP: Rs. 120.00 (incl. of all taxes)', 50, 230);

  // Sticker Overwrite Overlay
  ctx.fillStyle = '#FEF08A';
  ctx.strokeStyle = '#CA8A04';
  ctx.lineWidth = 2;
  ctx.fillRect(45, 255, 480, 50);
  ctx.strokeRect(45, 255, 480, 50);
  ctx.fillStyle = '#991B1B';
  ctx.font = 'black 22px Arial, sans-serif';
  ctx.fillText('⚠️ REVISED MRP STICKER: Rs. 150.00', 60, 290);

  // Rule 2: Quantity [250g declared, but lab scale measures 220g -> Section 39 Violation!]
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 20px Arial, sans-serif';
  ctx.fillText('Net Quantity (Declared on Carton):', 50, 350);
  ctx.font = 'bold 26px Arial, sans-serif';
  ctx.fillText('Net Weight: 250 g', 50, 385);

  // Dates
  ctx.font = 'bold 20px Arial, sans-serif';
  ctx.fillText('Batch & Packaging Date:', 50, 440);
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.fillText('MFG: 06/2026  |  Best Before: 12/2026', 50, 475);

  // Manufacturer
  ctx.font = 'bold 20px Arial, sans-serif';
  ctx.fillText('Manufactured & Packed By:', 50, 530);
  ctx.font = 'bold 20px Arial, sans-serif';
  ctx.fillText('Royal Tea & Beverages Private Limited', 50, 560);
  ctx.font = '18px Arial, sans-serif';
  ctx.fillText('Plot 8, Industrial Estate, Guwahati, Assam - 781001', 50, 588);

  // INGREDIENTS & ADULTERANTS [CRITICAL VIOLATION: Banned Toxic Dyes / Potassium Bromate]
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#DC2626';
  ctx.strokeRect(50, 630, 540, 185);
  ctx.fillStyle = '#DC2626';
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.fillText('Ingredients & Chemical Additives [TOXIC ADULTERATION]:', 60, 660);
  ctx.fillStyle = '#0F172A';
  ctx.font = '15px Arial, sans-serif';
  ctx.fillText('Ingredients: CTC Leaf Tea, Added Colorant: Metanil Yellow (Prohibited Dye).', 60, 690);
  ctx.fillStyle = '#B91C1C';
  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.fillText('• ADULTERANT: Metanil Yellow (BANNED INDUSTRIAL TOXIC DYE)', 60, 720);
  ctx.fillText('• PRESERVATIVE: Potassium Bromate (BANNED CARCINOGENIC AGENT)', 60, 748);
  ctx.fillStyle = '#0F172A';
  ctx.font = '15px Arial, sans-serif';
  ctx.fillText('• Artificial Flavouring Substances declared without natural ratio.', 60, 775);
  ctx.fillText('• Consumer Care Helpline: 1800-444-9988 | care@royalteaindia.com', 60, 800);

  // Embedded QR Code (Records the price tampering & toxic dye adulteration)
  const qrData = JSON.stringify({
    mrp: '120',
    stickerPrice: '150',
    netQty: '250g',
    mfgDate: '06/2026',
    expDate: '12/2026',
    batchNo: 'RC-2026-TAMPER',
    adulterant: 'Metanil Yellow',
    carcinogen: 'Potassium Bromate'
  });
  drawQrToCanvas(ctx, qrData, 620, 650, 140);
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 12px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('QR CODE AUDIT', 690, 815);
  ctx.textAlign = 'left';

  // Barcode
  for (let x = 50; x < 280; x += 5) {
    const w = (x % 10 === 0) ? 3 : 1.5;
    ctx.fillRect(x, 860, w, 50);
  }
  ctx.font = '13px monospace';
  ctx.fillText('8905554443321 (Batch: RC-2026-TAMPER)', 50, 925);

  return canvas.toDataURL('image/png');
}
