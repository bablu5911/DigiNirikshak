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
  Store
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

  const totalRules = rules.length || 5;
  const passedCount = rules.filter(r => r.status === 'PASS').length;
  const violationCount = totalRules - passedCount;
  const isScaleViolated = Boolean(mpeAuditResult?.isShortWeight || mpeAuditResult?.isViolated);
  const isTampered = Boolean(tamperResult?.hasTampering);
  const isFullyCompliant = violationCount === 0 && rules.length > 0 && !isTampered && !isScaleViolated;

  const complianceScore = Math.round((passedCount / totalRules) * 100);

  const getRuleIcon = (id) => {
    switch (id) {
      case 'mrp': return <IndianRupee className="w-3.5 h-3.5 text-cyan-400" />;
      case 'net_qty': return <Scale className="w-3.5 h-3.5 text-blue-400" />;
      case 'mfg_date': return <Calendar className="w-3.5 h-3.5 text-amber-400" />;
      case 'address': return <Building2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'consumer_care': return <Headphones className="w-3.5 h-3.5 text-purple-400" />;
      default: return <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getRoleAdaptiveRule = (rule) => {
    if (isOfficer) {
      return {
        name: rule.name,
        ruleCode: rule.ruleCode,
        description: rule.description,
        statusPass: 'PASS',
        statusFail: 'VIOLATION'
      };
    }

    switch (rule.id) {
      case 'mrp':
        return {
          name: rule.status === 'PASS' ? 'MRP & Tax Transparency' : 'Taxes Not Clarified',
          ruleCode: 'Rule 6(1)(e) • Price Protection',
          description: rule.status === 'PASS' 
            ? 'Price is declared inclusive of all taxes.' 
            : 'Bill may include hidden charges (Missing "Inclusive of all taxes" notice).',
          statusPass: 'VERIFIED FAIR',
          statusFail: 'OVERCHARGE RISK'
        };
      case 'net_qty':
        return {
          name: rule.status === 'PASS' ? 'Net Quantity Declared' : 'Packet Underweight',
          ruleCode: 'Section 39 • Quantity Integrity',
          description: rule.status === 'PASS'
            ? 'Net quantity declared in standard metric units.'
            : 'Underweight packet - Less product received than paid for.',
          statusPass: 'ACCURATE QTY',
          statusFail: 'SHORT WEIGHT'
        };
      case 'mfg_date':
        return {
          name: rule.status === 'PASS' ? 'Pack / Mfg Date' : 'Pack Date Missing',
          ruleCode: 'Rule 6(1)(d) • Freshness',
          description: rule.status === 'PASS'
            ? 'Month & year of packing identified.'
            : 'Date missing - Risk of expired or stale goods.',
          statusPass: 'VERIFIED DATE',
          statusFail: 'OLD STOCK RISK'
        };
      case 'address':
        return {
          name: rule.status === 'PASS' ? 'Manufacturer Identity' : 'Maker / Importer Unknown',
          ruleCode: 'Rule 6(1)(a) • Traceability',
          description: rule.status === 'PASS'
            ? 'Full physical factory address located.'
            : 'No physical maker address - Untraceable vendor.',
          statusPass: 'IDENTIFIED',
          statusFail: 'UNTRACEABLE'
        };
      case 'consumer_care':
        return {
          name: rule.status === 'PASS' ? 'Helpline Support' : 'Customer Care Missing',
          ruleCode: 'Rule 6(1)(f) • Consumer Redressal',
          description: rule.status === 'PASS'
            ? 'Direct grievance helpline or email found.'
            : 'No consumer contact found for grievance.',
          statusPass: 'CONTACTABLE',
          statusFail: 'NO SUPPORT'
        };
      default:
        return {
          name: rule.name,
          ruleCode: rule.ruleCode,
          description: rule.description,
          statusPass: 'PASS',
          statusFail: 'DEFECT'
        };
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
    <div className="cyber-card rounded-2xl p-5 flex flex-col gap-4 relative">
      
      {/* Top Deck Header with Compliance Score Meter (Light Theme) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 ${
            isFullyCompliant 
              ? 'bg-emerald-100 text-emerald-700 border-emerald-300 shadow-xs' 
              : 'bg-rose-100 text-rose-700 border-rose-300 shadow-xs'
          }`}>
            {isFullyCompliant ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <span>Forensic Compliance Matrix</span>
              <span className="text-[9px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.2 rounded">
                ZONE 02
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              {isOfficer ? 'PCR 2011 Schedule I & Rule 18(2) verification' : 'Consumer protection & fair trade audit'}
            </p>
          </div>
        </div>

        {/* Live Score Chip (Light Theme) */}
        <div className="flex items-center gap-2 font-mono">
          <span className="text-xs font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
            SCORE: <span className={isFullyCompliant ? 'text-emerald-700' : 'text-amber-700'}>{complianceScore}%</span>
          </span>
          <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300">
            {passedCount} PASS
          </span>
          {violationCount > 0 && (
            <span className="text-xs font-black text-rose-800 bg-rose-100 px-2 py-0.5 rounded-lg border border-rose-300">
              {violationCount} FAIL
            </span>
          )}
        </div>
      </div>

      {/* Citizen Mode: Retail Store / Shop Input */}
      {!isOfficer && (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span className="flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-blue-600" />
              <span>Purchased From (Store / E-commerce App)</span>
            </span>
            <span className="text-[9px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
              NCH Petitions
            </span>
          </div>
          <input
            type="text"
            value={sellerName}
            onChange={(e) => onSellerNameChange && onSellerNameChange(e.target.value)}
            placeholder="e.g. QuickMart Supermarket / Blinkit / Local Kirana Store..."
            className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-medium shadow-2xs"
          />
        </div>
      )}

      {/* Rule 18(2) Price Tampering Detected Banner (Light Theme) */}
      {tamperResult?.hasTampering && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-300 shadow-sm flex flex-col gap-2 animate-violation-shake"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-black text-amber-900">
                {isOfficer ? 'Rule 18(2) Price Tampering Offense' : 'Overcharging Sticker Alert'}
              </span>
            </div>
            <span className="text-[9px] font-black bg-rose-600 text-white px-2 py-0.5 rounded shadow-2xs font-mono">
              +{tamperResult.markupPercent}% HIKE
            </span>
          </div>
          <p className="text-[11px] text-amber-950 font-medium">
            {isOfficer 
              ? tamperResult.description 
              : 'Shopkeeper overcharged by affixing a higher price sticker over the factory printed MRP.'}
          </p>
          <div className="grid grid-cols-3 gap-2 bg-white/90 p-2 rounded-lg border border-amber-200 text-center font-mono text-xs shadow-2xs">
            <div>
              <span className="text-[9px] text-slate-500 block">BASE MRP</span>
              <span className="font-bold text-slate-800">₹{tamperResult.originalPrice}</span>
            </div>
            <div>
              <span className="text-[9px] text-amber-700 block">STICKER</span>
              <span className="font-bold text-amber-800">₹{tamperResult.stickerPrice}</span>
            </div>
            <div>
              <span className="text-[9px] text-rose-700 block">EXCESS</span>
              <span className="font-bold text-rose-800">+₹{tamperResult.markup}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* 5 Mandatory Statutory Rules Checklist */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-500 font-bold">
          <span>Statutory Declarations (PCR 2011)</span>
          <span>Hover to locate on canvas</span>
        </div>

        <div className="space-y-2">
          {rules.map((rule) => {
            const isPass = rule.status === 'PASS';
            const adaptive = getRoleAdaptiveRule(rule);
            const isHovered = hoveredRuleId === rule.id;
            const isEditing = editingRuleId === rule.id;

            return (
              <div
                key={rule.id}
                onMouseEnter={() => onHoverRule(rule.id)}
                onMouseLeave={() => onHoverRule(null)}
                className={`p-2.5 rounded-xl border transition-all duration-200 flex flex-col gap-1.5 ${
                  isHovered
                    ? 'border-blue-400 bg-blue-50/50 shadow-sm scale-[1.01]'
                    : isPass
                    ? 'border-slate-200 bg-white hover:bg-slate-50/70 shadow-2xs'
                    : 'border-rose-300 bg-rose-50/70 hover:bg-rose-50 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 shrink-0 mt-0.5 text-slate-700">
                      {getRuleIcon(rule.id)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-slate-900 truncate">
                          {adaptive.name}
                        </span>
                        <span className="text-[9px] font-mono text-slate-600 bg-slate-100 px-1 py-0.2 rounded border border-slate-200">
                          {adaptive.ruleCode}
                        </span>
                        <span className="text-[9px] font-mono text-blue-700 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
                          {rule.confidence || '96.2'}%
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-tight mt-0.5">
                        {adaptive.description}
                      </p>
                    </div>
                  </div>

                  {/* Manual Override Status Toggle Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.94 }}
                    type="button"
                    onClick={() => onToggleRuleStatus(rule.id)}
                    className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold border transition-all shrink-0 cursor-pointer ${
                      isPass
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-2xs'
                        : 'bg-rose-100 text-rose-800 border-rose-300 shadow-2xs'
                    }`}
                    title="Click to toggle Pass / Violation manually"
                  >
                    {isPass ? '✓ ' + adaptive.statusPass : '✕ ' + adaptive.statusFail}
                  </motion.button>
                </div>

                {/* Extracted snippet or inline editor */}
                {isEditing ? (
                  <div className="flex items-center gap-1.5 mt-1">
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
                    className="flex items-center justify-between text-[10px] font-mono text-slate-700 bg-slate-50 hover:bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 cursor-pointer group/snippet transition-colors"
                    title="Click to edit transcribed snippet"
                  >
                    <span className="truncate">
                      <span className="text-slate-400 mr-1">OCR:</span>
                      <span className="text-slate-800 font-semibold">{rule.extractedText || 'Declaration text not found'}</span>
                    </span>
                    <Edit3 className="w-3 h-3 text-slate-400 group-hover/snippet:text-blue-600 ml-1 shrink-0" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Laboratory Scale Verification & MPE Gauge (Light Theme) */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
            <Scale className="w-3.5 h-3.5 text-blue-600" />
            <span>Physical Laboratory Scale Audit (Schedule I MPE)</span>
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
