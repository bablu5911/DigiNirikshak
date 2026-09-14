/**
 * High-Contrast Single-Label Statutory Packaging Generator
 * Generates clear, high-resolution rear/side statutory labels for Tesseract OCR:
 * 1. 'compliant' (NutriGold 200g - All 5 mandatory PCR rules pass)
 * 2. 'mislabeled' / 'violation' (CrunchMax 75g - Missing taxes, non-standard unit, incomplete premise)
 * 3. 'tampered' / 'deceptive' (Royal Chai 250g - Printed Rs. 120 overwritten by Rs. 150 sticker + 30g short weight)
 */

export function generateSamplePack(type = 'compliant') {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 920;
  const ctx = canvas.getContext('2d');

  // Base background & high-contrast border
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 800, 920);
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#0F172A';
  ctx.strokeRect(20, 20, 760, 880);

  if (type === 'compliant') {
    // -------------------------------------------------------------
    // PRESET 1: COMPLIANT LABEL (NutriGold 200g)
    // -------------------------------------------------------------
    ctx.fillStyle = '#1E3A8A';
    ctx.fillRect(24, 24, 752, 90);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NUTRIGOLD - MANDATORY DECLARATIONS', 400, 80);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('STATUTORY DETAILS UNDER PACKAGED COMMODITIES RULES, 2011', 50, 155);

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 170);
    ctx.lineTo(750, 170);
    ctx.stroke();

    // Rule 1: MRP
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.fillText('Maximum Retail Price (MRP):', 50, 225);
    ctx.font = 'bold 30px Arial, sans-serif';
    ctx.fillText('MRP: Rs. 35.00 (incl. of all taxes)', 50, 268);

    // Rule 2: Net Quantity
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.fillText('Net Quantity:', 50, 340);
    ctx.font = 'bold 30px Arial, sans-serif';
    ctx.fillText('Net Weight: 200 g', 50, 385);

    // Rule 3: Date of Mfg
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.fillText('Date of Manufacture / Packing:', 50, 460);
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.fillText('Mfg Date: 08/2026', 50, 505);

    // Rule 4: Address
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.fillText('Manufactured & Packed By:', 50, 595);
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.fillText('NutriGold Agro Foods Pvt. Ltd.', 50, 630);
    ctx.font = '20px Arial, sans-serif';
    ctx.fillText('Plot 14, Phase II, Industrial Area, Noida, UP - 201301', 50, 660);

    // Rule 5: Consumer Care
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.fillText('Consumer Grievance Cell:', 50, 735);
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText('Toll Free: 1800-202-4455', 50, 770);
    ctx.fillText('Email: care@nutrigold.co.in', 50, 800);

    // Barcode Mock
    for (let x = 540; x < 740; x += 6) {
      const w = (x % 12 === 0) ? 4 : 2;
      ctx.fillRect(x, 740, w, 65);
    }
    ctx.font = '14px monospace';
    ctx.fillText('8901234567890', 580, 830);

    return canvas.toDataURL('image/png');
  }

  if (type === 'mislabeled' || type === 'violation') {
    // -------------------------------------------------------------
    // PRESET 2: MISLABELED PACK (CrunchMax - Missing taxes & unit)
    // -------------------------------------------------------------
    ctx.fillStyle = '#991B1B';
    ctx.fillRect(24, 24, 752, 90);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CRUNCHMAX - NUTRITIONAL & LEGAL PANEL', 400, 80);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('BACK-OF-PACK INFORMATION PANEL', 50, 155);

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 170);
    ctx.lineTo(750, 170);
    ctx.stroke();

    // Rule 1: MRP [VIOLATION - Missing 'incl. of all taxes']
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.fillText('Maximum Retail Price:', 50, 225);
    ctx.font = 'bold 30px Arial, sans-serif';
    ctx.fillText('MRP: Rs. 30/-', 50, 268);

    // Rule 2: Quantity [VIOLATION - Missing standard metric unit 'g']
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.fillText('Quantity Declaration:', 50, 340);
    ctx.font = 'bold 30px Arial, sans-serif';
    ctx.fillText('Weight: 75', 50, 385);

    // Rule 3: Date [PASS]
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.fillText('Packaging Date:', 50, 460);
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.fillText('MFG: 07/2026', 50, 505);

    // Rule 4: Address [VIOLATION - Incomplete Premise]
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.fillText('Manufactured for:', 50, 595);
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.fillText('CrunchMax Consumer Brands', 50, 630);

    // Rule 5: Consumer Care [PASS]
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.fillText('Feedback & Support:', 50, 735);
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText('Email: support@crunchmax.in', 50, 770);
    ctx.fillText('Phone: +91 9876543210', 50, 800);

    return canvas.toDataURL('image/png');
  }

  // -------------------------------------------------------------
  // PRESET 3: TAMPERED PACK (Royal Chai - ₹120 altered to ₹150 + 30g deficit)
  // -------------------------------------------------------------
  ctx.fillStyle = '#78350F';
  ctx.fillRect(24, 24, 752, 90);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 30px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ROYAL CHAI - STATUTORY DECLARATIONS', 400, 80);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('STATUTORY DETAILS UNDER PACKAGED COMMODITIES RULES, 2011', 50, 155);

  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, 170);
  ctx.lineTo(750, 170);
  ctx.stroke();

  // Price Tampering: Base printed price ₹120 with over-stamped Sticker price ₹150!
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.fillText('Retail Sale Price Declarations:', 50, 215);

  // Stamped base price
  ctx.font = '22px Arial, sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText('Base Printed MRP: Rs. 120.00 (incl. of all taxes)', 50, 250);

  // Sticker Overwrite Box (Tampering under Rule 18(2))
  ctx.fillStyle = '#FEF2F2';
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 2;
  ctx.fillRect(45, 270, 520, 52);
  ctx.strokeRect(45, 270, 520, 52);

  ctx.fillStyle = '#B91C1C';
  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.fillText('⚠️ REVISED STICKER APPLIED OVER BASE MRP', 60, 292);
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.fillText('Sticker MRP: Rs. 150.00 (incl. of all taxes)', 60, 314);

  // Declared Quantity: 250 g
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.fillText('Net Quantity:', 50, 370);
  ctx.font = 'bold 30px Arial, sans-serif';
  ctx.fillText('Net Weight: 250 g', 50, 410);

  // Mfg Date
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.fillText('Date of Packaging:', 50, 480);
  ctx.font = 'bold 28px Arial, sans-serif';
  ctx.fillText('PKD: 06/2026', 50, 520);

  // Address
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.fillText('Manufactured By:', 50, 595);
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.fillText('Royal Estate Tea Blenders Pvt. Ltd.', 50, 630);
  ctx.font = '20px Arial, sans-serif';
  ctx.fillText('Plot 28, Industrial Focal Point, Guwahati, AS - 781001', 50, 660);

  // Consumer Care
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.fillText('Consumer Care Cell:', 50, 735);
  ctx.font = 'bold 20px Arial, sans-serif';
  ctx.fillText('Toll Free: 1800-444-8899 | Email: care@royalteablends.com', 50, 770);

  return canvas.toDataURL('image/png');
}
