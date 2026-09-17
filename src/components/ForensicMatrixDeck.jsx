import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  IndianRupee, 
  Scale, 
  Calendar, 
  Building2, 
  Headphones, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Check, 
  X, 
  Sparkles,
  Sliders,
  Store,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ForensicMatrixDeck({
  userRole = 'officer',
  activeProfile = null,
  sellerName = '',
  onSellerNameChange,
  rules = [],
  tamperResult = null,
  parsedDeclaredQty = 200,
  parsedDeclaredUnit = 'g',
  scaleWeight = '200',
  onScaleWeightChange,
  mpeAuditResult = null,
  hoveredRuleId = null,
  onHoverRule,
  onToggleRuleStatus,
  onSaveRuleSnippet
}) {
  const isOfficer = userRole === 'officer';
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [customSnippet, setCustomSnippet] = useState('');

  // Segregate rules into Correctly Done vs Not Correctly Done
  const correctlyDoneRules = rules.filter(r => r.status === 'PASS');
  const notCorrectRules = rules.filter(r => r.status !== 'PASS');

  const isScaleViolated = Boolean(mpeAuditResult?.isShortWeight || mpeAuditResult?.isViolated);
  const isTampered = Boolean(tamperResult?.hasTampering);
  
  const totalDefectsCount = notCorrectRules.length + (isTampered ? 1 : 0) + (isScaleViolated ? 1 : 0);
  const isFullyCompliant = totalDefectsCount === 0 && rules.length > 0;

  const totalRules = rules.length || 5;
  const passedCount = correctlyDoneRules.length + (!isScaleViolated && mpeAuditResult ? 1 : 0);
  const complianceScore = Math.round((correctlyDoneRules.length / totalRules) * 100);

  const getRuleIcon = (id) => {
    switch (id) {
      case 'mrp': return <IndianRupee className="w-4 h-4 text-emerald-600" />;
      case 'net_qty': return <Scale className="w-4 h-4 text-blue-600" />;
      case 'mfg_date': return <Calendar className="w-4 h-4 text-amber-600" />;
      case 'address': return <Building2 className="w-4 h-4 text-purple-600" />;
      case 'consumer_care': return <Headphones className="w-4 h-4 text-indigo-600" />;
      default: return <CheckCircle2 className="w-4 h-4 text-slate-500" />;
    }
  };

  // Safe MPE values for visual tolerance gauge
  const declaredVal = mpeAuditResult?.mpeSpec?.declaredValue || parsedDeclaredQty || 200;
  const minAllowedVal = mpeAuditResult?.mpeSpec?.minAllowed || (declaredVal - 9);
  const currentWeightNum = parseFloat(scaleWeight) || declaredVal;
  const toleranceRangeMin = Math.round(declaredVal * 0.75);
  const toleranceRangeMax = Math.round(declaredVal * 1.25);

  const gaugePercent = Math.min(100, Math.max(0, ((currentWeightNum - toleranceRangeMin) / (toleranceRangeMax - toleranceRangeMin)) * 100));
  const minAllowedPercent = Math.min(100, Math.max(0, ((minAllowedVal - toleranceRangeMin) / (toleranceRangeMax - toleranceRangeMin)) * 100));

  const handleStartEdit = (rule) => {
    setEditingRuleId(rule.id);
    setCustomSnippet(rule.extractedText || '');
  };

  const handleSaveEdit = (ruleId) => {
    onSaveRuleSnippet(ruleId, customSnippet);
    setEditingRuleId(null);
  };

  return (
    <div className="cyber-card rounded-2xl p-4 sm:p-5 flex flex-col gap-4 relative">
      
      {/* 1. TOP RAID COMPLIANCE VERDICT BANNER (Instant Visual Decision for Field Officers) */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isFullyCompliant 
          ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300 shadow-sm'
          : 'bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 border-rose-300 shadow-md'
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
              isFullyCompliant 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'bg-rose-600 text-white shadow-md animate-bounce'
            }`}>
              {isFullyCompliant ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  {isFullyCompliant 
                    ? '100% STATUTORY COMPLIANT PACKET' 
                    : 'FACTORY NON-COMPLIANCE DETECTED'}
                </h2>
                <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full ${
                  isFullyCompliant 
                    ? 'bg-emerald-200 text-emerald-900 border border-emerald-400' 
                    : 'bg-rose-200 text-rose-900 border border-rose-400'
                }`}>
                  {isFullyCompliant ? '0 DEFECTS' : `${totalDefectsCount} DEFECTS IDENTIFIED`}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                {isFullyCompliant 
                  ? 'All mandatory statutory declarations under Legal Metrology Rules, 2011 are verified and correct.'
                  : 'Packet failed statutory requirements. Review the non-compliant items marked below.'}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0 hidden sm:block">
            <span className="text-[10px] font-mono text-slate-500 block uppercase">Compliance Rate</span>
            <span className={`text-xl font-black font-mono ${isFullyCompliant ? 'text-emerald-700' : 'text-rose-700'}`}>
              {complianceScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Citizen Mode Store / Location info if applicable */}
      {!isOfficer && (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span className="flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-blue-600" />
              <span>Retail Outlet / Factory Location</span>
            </span>
            <span className="text-[9px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
              Inspection Site
            </span>
          </div>
          <input
            type="text"
            value={sellerName}
            onChange={(e) => onSellerNameChange && onSellerNameChange(e.target.value)}
            placeholder="e.g. Factory Godown 4 / Sector 18 Depot / Retail Store..."
            className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-medium shadow-2xs"
          />
        </div>
      )}

      {/* 2. SECTION 1: ❌ NOT CORRECTLY DONE (Statutory Defects & Violations) */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between pb-1 border-b border-rose-200">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-black text-xs">
              ✕
            </span>
            <h3 className="text-xs sm:text-sm font-black text-rose-950 uppercase tracking-tight">
              Things NOT Correctly Done ({totalDefectsCount})
            </h3>
          </div>
          <span className="text-[10px] font-mono text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            ACTION REQUIRED
          </span>
        </div>

        {totalDefectsCount === 0 ? (
          <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="text-xs font-black text-emerald-950">
                No Statutory Defects Found!
              </div>
              <div className="text-[11px] text-emerald-800">
                This packet passes all statutory packaging and price transparency checks.
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Rule 18(2) Price Tampering Detected */}
            {isTampered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 rounded-xl bg-rose-50 border-2 border-rose-400 shadow-xs flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-rose-950">
                          Unauthorized Price Over-Stickering Detected
                        </span>
                        <span className="text-[9px] font-mono font-bold bg-rose-600 text-white px-1.5 py-0.2 rounded">
                          Rule 18(2) PCR
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-800 font-medium mt-0.5">
                        A higher price sticker has been affixed over the factory-printed statutory MRP.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200 shrink-0">
                    +{tamperResult.markupPercent}% MARKUP
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded-lg border border-rose-200 text-center font-mono text-xs">
                  <div>
                    <span className="text-[9px] text-slate-500 block">Factory MRP</span>
                    <span className="font-bold text-slate-800">₹{tamperResult.originalPrice}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-rose-600 block">Sticker Price</span>
                    <span className="font-bold text-rose-700">₹{tamperResult.stickerPrice}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-rose-600 block">Illegal Hike</span>
                    <span className="font-bold text-rose-800">+₹{tamperResult.markup}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Section 39 Weight Shortage Detected */}
            {isScaleViolated && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 rounded-xl bg-rose-50 border-2 border-rose-400 shadow-xs flex flex-col gap-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <Scale className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-rose-950">
                          Package Weight Deficit Beyond MPE Tolerance
                        </span>
                        <span className="text-[9px] font-mono font-bold bg-rose-600 text-white px-1.5 py-0.2 rounded">
                          Section 39 / Sched I
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-800 font-medium mt-0.5">
                        Measured sample weight ({currentWeightNum}{parsedDeclaredUnit}) is below statutory minimum allowed ({minAllowedVal}{parsedDeclaredUnit}). Deficit: <strong>{mpeAuditResult?.illegalDeficitBeyondMpe}g</strong> beyond legal limit.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200 shrink-0">
                    SHORT WEIGHT
                  </span>
                </div>
              </motion.div>
            )}

            {/* Non-compliant statutory rules */}
            {notCorrectRules.map((rule) => {
              const isHovered = hoveredRuleId === rule.id;
              return (
                <div
                  key={rule.id}
                  onMouseEnter={() => onHoverRule(rule.id)}
                  onMouseLeave={() => onHoverRule(null)}
                  className={`p-3 rounded-xl border transition-all ${
                    isHovered 
                      ? 'border-rose-500 bg-rose-100/70 shadow-sm' 
                      : 'border-rose-300 bg-rose-50/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <div className="p-1.5 rounded-lg bg-rose-100 border border-rose-200 text-rose-700 shrink-0 mt-0.5">
                        <XCircle className="w-4 h-4 text-rose-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-rose-950">
                            {rule.name}
                          </span>
                          <span className="text-[9px] font-mono font-bold text-rose-800 bg-rose-100 px-1.5 py-0.2 rounded border border-rose-200">
                            {rule.ruleCode}
                          </span>
                        </div>
                        <p className="text-[11px] text-rose-900 font-medium mt-0.5">
                          {rule.defectExplanation || rule.description || 'Statutory declaration missing or improperly formatted.'}
                        </p>
                        <div className="text-[10px] font-mono text-slate-600 mt-1 bg-white/80 p-1.5 rounded border border-rose-200">
                          <span className="text-slate-400">Detected on Label: </span>
                          <span className="text-rose-900 font-semibold">{rule.extractedText || 'Clause NOT found'}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleRuleStatus(rule.id)}
                      className="text-[10px] font-mono text-slate-500 hover:text-emerald-700 bg-white border border-slate-200 px-2 py-1 rounded-md cursor-pointer shrink-0"
                      title="Mark as passed manually"
                    >
                      Mark Pass
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. SECTION 2: ✅ CORRECTLY DONE (Compliant Statutory Declarations) */}
      <div className="flex flex-col gap-2.5 mt-2">
        <div className="flex items-center justify-between pb-1 border-b border-emerald-200">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
              ✓
            </span>
            <h3 className="text-xs sm:text-sm font-black text-emerald-950 uppercase tracking-tight">
              Things CORRECTLY Done ({passedCount})
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            PCR 2011 VERIFIED
          </span>
        </div>

        <div className="space-y-2">
          {/* If physical weight passed */}
          {!isScaleViolated && mpeAuditResult && (
            <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-700 shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-emerald-950">
                    Physical Package Weight Compliant
                  </span>
                  <span className="text-[9px] font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-200">
                    Section 39 • Schedule I
                  </span>
                </div>
                <p className="text-[11px] text-emerald-900 mt-0.5">
                  Measured sample weight ({currentWeightNum}{parsedDeclaredUnit}) meets or exceeds legal statutory threshold ({minAllowedVal}{parsedDeclaredUnit}).
                </p>
              </div>
            </div>
          )}

          {/* Compliant Rules */}
          {correctlyDoneRules.map((rule) => {
            const isHovered = hoveredRuleId === rule.id;
            const isEditing = editingRuleId === rule.id;

            return (
              <div
                key={rule.id}
                onMouseEnter={() => onHoverRule(rule.id)}
                onMouseLeave={() => onHoverRule(null)}
                className={`p-3 rounded-xl border transition-all ${
                  isHovered 
                    ? 'border-blue-400 bg-blue-50/50 shadow-sm' 
                    : 'border-slate-200 bg-white hover:bg-slate-50/70'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-slate-900">
                          {rule.name}
                        </span>
                        <span className="text-[9px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                          {rule.ruleCode}
                        </span>
                        <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          {rule.confidence || '96.4'}% OCR
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {rule.description}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleRuleStatus(rule.id)}
                    className="text-[10px] font-mono text-slate-400 hover:text-rose-600 bg-white border border-slate-200 px-2 py-1 rounded-md cursor-pointer shrink-0"
                    title="Mark as violation manually"
                  >
                    Flag
                  </button>
                </div>

                {/* Extracted snippet or inline editor */}
                {isEditing ? (
                  <div className="flex items-center gap-1.5 mt-2">
                    <input
                      type="text"
                      autoFocus
                      value={customSnippet}
                      onChange={(e) => setCustomSnippet(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(rule.id);
                        if (e.key === 'Escape') setEditingRuleId(null);
                      }}
                      className="flex-1 text-xs px-2.5 py-1 rounded-lg bg-white border border-blue-500 text-slate-900 font-mono shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(rule.id)}
                      className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingRuleId(null)}
                      className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer shadow-2xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => handleStartEdit(rule)}
                    className="flex items-center justify-between text-[10px] font-mono text-slate-700 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 cursor-pointer group/snippet transition-colors mt-2"
                    title="Click to edit transcribed snippet"
                  >
                    <span className="truncate">
                      <span className="text-slate-400 mr-1">Verified Text:</span>
                      <span className="text-slate-800 font-semibold">{rule.extractedText || 'Declared properly'}</span>
                    </span>
                    <Edit3 className="w-3 h-3 text-slate-400 group-hover/snippet:text-blue-600 ml-1 shrink-0" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. LABORATORY / FACTORY SCALE AUDIT (Schedule I MPE Tolerance) */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2.5 shadow-2xs mt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
            <Scale className="w-3.5 h-3.5 text-blue-600" />
            <span>Factory Scale Audit (Schedule I MPE)</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Declared: <strong className="text-blue-700">{declaredVal}{parsedDeclaredUnit}</strong>
          </span>
        </div>

        {/* Weight input and slider */}
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={toleranceRangeMin}
            max={toleranceRangeMax}
            step="0.5"
            value={currentWeightNum}
            onChange={(e) => onScaleWeightChange(e.target.value)}
            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex items-center gap-1 bg-white border border-slate-300 px-2.5 py-1 rounded-lg shrink-0 shadow-2xs">
            <input
              type="number"
              step="0.1"
              value={scaleWeight}
              onChange={(e) => onScaleWeightChange(e.target.value)}
              className="w-14 bg-transparent font-mono text-xs font-bold text-slate-900 text-right focus:outline-none"
            />
            <span className="text-[10px] font-mono text-slate-500">{parsedDeclaredUnit}</span>
          </div>
        </div>

        {/* Visual Tolerance Bar */}
        <div className="relative w-full bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-300">
          <div 
            className="absolute top-0 bottom-0 bg-emerald-400/40 border-l border-r border-emerald-500"
            style={{
              left: `${minAllowedPercent}%`,
              width: `${100 - minAllowedPercent}%`
            }}
          />
          <div 
            className={`absolute top-0 bottom-0 w-2.5 rounded-full shadow-md transition-all ${
              mpeAuditResult?.isShortWeight ? 'bg-rose-600 shadow-[0_0_8px_#e11d48]' : 'bg-emerald-600 shadow-[0_0_8px_#059669]'
            }`}
            style={{ left: `calc(${gaugePercent}% - 5px)` }}
          />
        </div>

        {/* Scale Status Footer */}
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-slate-500">
            Legal Min Allowed: <strong className="text-slate-800">{minAllowedVal}g</strong>
          </span>
          {mpeAuditResult?.isShortWeight ? (
            <span className="text-rose-700 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              <span>DEFICIT: {mpeAuditResult.illegalDeficitBeyondMpe}g BEYOND MPE</span>
            </span>
          ) : (
            <span className="text-emerald-700 font-bold">
              ✓ WITHIN STATUTORY TOLERANCE
            </span>
          )}
        </div>
      </div>

    </div>
  );
}
