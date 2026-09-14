/**
 * Maximum Permissible Error (MPE) Calculator
 * Implements the statutory First Schedule of the Legal Metrology (Packaged Commodities) Rules, 2011
 * and Rule 24 / Section 39 of the Legal Metrology Act, 2009 (Short-Weight & Under-Filling Offenses).
 */

/**
 * Calculates Maximum Permissible Error (MPE) based on the First Schedule
 * @param {number} declaredQty - Declared net quantity value in grams or milliliters
 * @param {string} unit - 'g', 'gm', 'kg', 'ml', 'l'
 * @returns {object} MPE specification { mpeValue, mpeType, minAllowed, unit }
 */
export function calculateLegalMpe(declaredQty, unit = 'g') {
  if (!declaredQty || declaredQty <= 0) {
    return {
      declaredValue: 0,
      mpeValue: 0,
      mpeType: 'fixed',
      minAllowed: 0,
      unit: 'g',
      mpeRule: 'First Schedule of PCR 2011'
    };
  }

  // Normalize kg / l to grams / ml
  let normalizedQty = declaredQty;
  let baseUnit = unit.toLowerCase();
  if (baseUnit === 'kg' || baseUnit === 'l' || baseUnit === 'ltr') {
    normalizedQty = declaredQty * 1000;
    baseUnit = baseUnit === 'kg' ? 'g' : 'ml';
  } else if (baseUnit === 'gm' || baseUnit === 'gms') {
    baseUnit = 'g';
  }

  let mpeValue = 0;
  let mpeType = 'fixed';
  let ruleBracket = '';

  // First Schedule Statutory Brackets (PCR 2011):
  if (normalizedQty <= 50) {
    // Up to 50g: 9%
    mpeValue = (normalizedQty * 9) / 100;
    mpeType = '9%';
    ruleBracket = 'Up to 50g/ml (9% tolerance)';
  } else if (normalizedQty <= 100) {
    // 50 to 100g: 4.5g fixed
    mpeValue = 4.5;
    mpeType = '4.5g';
    ruleBracket = '50g to 100g (4.5g fixed tolerance)';
  } else if (normalizedQty <= 200) {
    // 100 to 200g: 4.5%
    mpeValue = (normalizedQty * 4.5) / 100;
    mpeType = '4.5%';
    ruleBracket = '100g to 200g (4.5% tolerance)';
  } else if (normalizedQty <= 300) {
    // 200 to 300g: 9g fixed
    mpeValue = 9.0;
    mpeType = '9.0g';
    ruleBracket = '200g to 300g (9.0g fixed tolerance)';
  } else if (normalizedQty <= 500) {
    // 300 to 500g: 3%
    mpeValue = (normalizedQty * 3.0) / 100;
    mpeType = '3.0%';
    ruleBracket = '300g to 500g (3.0% tolerance)';
  } else if (normalizedQty <= 1000) {
    // 500g to 1000g: 15g fixed
    mpeValue = 15.0;
    mpeType = '15.0g';
    ruleBracket = '500g to 1000g (15.0g fixed tolerance)';
  } else if (normalizedQty <= 10000) {
    // 1kg to 10kg: 1.5%
    mpeValue = (normalizedQty * 1.5) / 100;
    mpeType = '1.5%';
    ruleBracket = '1kg to 10kg (1.5% tolerance)';
  } else if (normalizedQty <= 15000) {
    // 10kg to 15kg: 150g fixed
    mpeValue = 150.0;
    mpeType = '150g';
    ruleBracket = '10kg to 15kg (150g fixed tolerance)';
  } else {
    // > 15kg: 1.0%
    mpeValue = (normalizedQty * 1.0) / 100;
    mpeType = '1.0%';
    ruleBracket = 'Above 15kg (1.0% tolerance)';
  }

  // Round mpeValue to 1 decimal place
  mpeValue = Math.round(mpeValue * 10) / 10;
  const minAllowed = Math.round((normalizedQty - mpeValue) * 10) / 10;

  return {
    declaredValue: normalizedQty,
    mpeValue,
    mpeType,
    minAllowed,
    unit: baseUnit,
    ruleBracket
  };
}

/**
 * Performs physical scale verification audit
 * @param {number} declaredQty - Declared on packaging
 * @param {string} declaredUnit - 'g' or 'ml'
 * @param {number} physicalScaleWeight - Measured on laboratory scale
 * @returns {object} Full audit report with Section 39 violation metrics
 */
export function auditPhysicalScaleWeight(declaredQty, declaredUnit, physicalScaleWeight) {
  const mpeSpec = calculateLegalMpe(declaredQty, declaredUnit);
  if (!physicalScaleWeight || physicalScaleWeight <= 0) {
    return {
      hasMeasured: false,
      mpeSpec,
      status: 'AWAITING_PHYSICAL_MEASUREMENT',
      message: 'Enter verified laboratory scale reading to compute legal MPE conformance.'
    };
  }

  const measured = parseFloat(physicalScaleWeight);
  const deficit = Math.round((mpeSpec.declaredValue - measured) * 10) / 10;
  const isShortWeight = measured < mpeSpec.minAllowed;
  const deficitPercent = Math.round((deficit / mpeSpec.declaredValue) * 1000) / 10;
  const illegalDeficitBeyondMpe = isShortWeight 
    ? Math.round((mpeSpec.minAllowed - measured) * 10) / 10 
    : 0;

  return {
    hasMeasured: true,
    mpeSpec,
    measuredWeight: measured,
    deficit,
    deficitPercent,
    isShortWeight,
    illegalDeficitBeyondMpe,
    status: isShortWeight ? 'SECTION_39_SHORT_WEIGHT_OFFENSE' : 'LEGAL_TOLERANCE_PASS',
    legalAct: isShortWeight ? 'Legal Metrology Act, 2009 Section 39 & Rule 24 of PCR 2011' : 'Conforms to First Schedule of PCR 2011',
    penaltyClause: isShortWeight 
      ? 'Section 39 Penalty: Fine up to ₹10,000 for first offense; up to ₹50,000 or imprisonment up to 1 year for subsequent offenses.'
      : 'Net quantity conforms to statutory Maximum Permissible Error tolerance.'
  };
}
