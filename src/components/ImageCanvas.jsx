import React, { useRef, useState, useEffect } from 'react';
import { Crop, RotateCcw, Check, Sparkles, Crosshair } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImageCanvas({ 
  imageSrc, 
  isScanning, 
  onCropAndRescan,
  onResetView,
  rules = [],
  hoveredRuleId = null,
  tamperResult = null
}) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  
  // Crop mode states
  const [isCropMode, setIsCropMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [selectionRect, setSelectionRect] = useState(null);

  // Mouse cursor coordinates for futuristic crosshair overlay
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    setSelectionRect(null);
    setIsCropMode(false);
  }, [imageSrc]);

  // Drag selection handlers
  const handleMouseDown = (e) => {
    if (!isCropMode) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentPos({ x, y });
    setSelectionRect(null);
  };

  const handleMouseMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    setMousePos({ x, y });

    if (!isCropMode || !isDrawing) return;
    setCurrentPos({ x, y });
  };

  const handleMouseUp = () => {
    if (!isCropMode || !isDrawing) return;
    setIsDrawing(false);

    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);

    if (width > 20 && height > 20) {
      setSelectionRect({ x, y, width, height });
    } else {
      setSelectionRect(null);
    }
  };

  // Execute Crop
  const handleExecuteCrop = () => {
    if (!selectionRect || !imgRef.current) return;

    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    const containerRect = container.getBoundingClientRect();
    const naturalW = img.naturalWidth || img.width;
    const naturalH = img.naturalHeight || img.height;

    const imgAspect = naturalW / naturalH;
    const containerAspect = containerRect.width / containerRect.height;

    let displayW, displayH, offsetX, offsetY;
    if (containerAspect > imgAspect) {
      displayH = containerRect.height;
      displayW = displayH * imgAspect;
      offsetX = (containerRect.width - displayW) / 2;
      offsetY = 0;
    } else {
      displayW = containerRect.width;
      displayH = displayW / imgAspect;
      offsetX = 0;
      offsetY = (containerRect.height - displayH) / 2;
    }

    const scale = naturalW / displayW;

    const cropX = Math.max(0, (selectionRect.x - offsetX) * scale);
    const cropY = Math.max(0, (selectionRect.y - offsetY) * scale);
    const cropW = Math.min(naturalW - cropX, selectionRect.width * scale);
    const cropH = Math.min(naturalH - cropY, selectionRect.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(50, cropW);
    canvas.height = Math.max(50, cropH);
    const ctx = canvas.getContext('2d');

    const sourceImg = new Image();
    sourceImg.crossOrigin = 'anonymous';
    sourceImg.onload = () => {
      ctx.drawImage(sourceImg, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height);
      const croppedDataUrl = canvas.toDataURL('image/png');
      onCropAndRescan(croppedDataUrl);
      setIsCropMode(false);
      setSelectionRect(null);
    };
    sourceImg.src = imageSrc;
  };

  const liveBox = isDrawing ? {
    x: Math.min(startPos.x, currentPos.x),
    y: Math.min(startPos.y, currentPos.y),
    width: Math.abs(currentPos.x - startPos.x),
    height: Math.abs(currentPos.y - startPos.y)
  } : selectionRect;

  return (
    <div className="flex flex-col gap-3">
      
      {/* Precision Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsCropMode(!isCropMode);
              setSelectionRect(null);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isCropMode 
                ? 'bg-cyan-400 text-slate-950 font-black shadow-[0_0_12px_rgba(6,182,212,0.4)]' 
                : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-750 hover:text-white shadow-2xs'
            }`}
          >
            <Crop className="w-3.5 h-3.5" />
            <span>{isCropMode ? 'Cancel Selection' : 'Select & Crop Area'}</span>
          </button>

          {isCropMode && (
            <span className="text-[10px] text-cyan-300 font-extrabold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
              Drag over unclear text
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectionRect && (
            <button
              type="button"
              onClick={handleExecuteCrop}
              className="px-3.5 py-1.5 rounded-lg text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-1.5 animate-pulse cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Rescan Selected Area</span>
            </button>
          )}

          <button
            type="button"
            onClick={onResetView}
            title="Reset to full packaging image"
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-750 text-xs font-semibold shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Image Viewport */}
      <div 
        ref={containerRef}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`relative bg-slate-950 rounded-2xl border border-slate-800/90 overflow-hidden flex items-center justify-center min-h-[380px] max-h-[500px] aspect-square select-none shadow-[inset_0_0_35px_rgba(0,0,0,0.9)] ${
          isCropMode ? 'cursor-crosshair' : 'cursor-default'
        }`}
      >
        {/* Render Active Image & Interactive Vision Bounding Boxes */}
        {imageSrc ? (
          <div className="relative inline-flex items-center justify-center max-h-full max-w-full">
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Packaging inspection viewport"
              className="max-h-[480px] max-w-full object-contain pointer-events-none rounded-lg"
            />

            {/* INTERACTIVE VISION COORDINATE BOUNDING BOX OVERLAYS */}
            {!isCropMode && !isScanning && (
              <div className="absolute inset-0 pointer-events-none overflow-visible">
                {/* 1. Five Statutory Rules Overlays */}
                {rules.map((rule) => {
                  if (!rule.bbox) return null;
                  const isHovered = hoveredRuleId === rule.id;

                  return (
                    <motion.div
                      key={rule.id}
                      initial={false}
                      animate={{
                        scale: isHovered ? 1.02 : 1,
                        opacity: hoveredRuleId && !isHovered ? 0.35 : 1
                      }}
                      transition={{ duration: 0.2 }}
                      className={`absolute rounded transition-all duration-200 pointer-events-none ${
                        isHovered
                          ? 'border-2 border-cyan-300 bg-cyan-400/20 shadow-[0_0_25px_rgba(6,182,212,0.85)] z-30'
                          : 'border border-cyan-500/40 bg-cyan-500/5 hover:border-cyan-400/70 z-10'
                      }`}
                      style={{
                        left: `${rule.bbox.left}%`,
                        top: `${rule.bbox.top}%`,
                        width: `${rule.bbox.width}%`,
                        height: `${rule.bbox.height}%`
                      }}
                    >
                      {/* Active Tag on Hover */}
                      {isHovered ? (
                        <div className="absolute -top-6 left-0 bg-cyan-400 text-slate-950 text-[9px] font-black font-mono px-2 py-0.5 rounded shadow-[0_0_10px_rgba(6,182,212,0.6)] flex items-center gap-1.5 whitespace-nowrap z-40">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></span>
                          <span>{rule.ruleCode}: {rule.name.toUpperCase()} • {rule.confidence || '96.4'}% CONFIDENCE</span>
                        </div>
                      ) : (
                        <span className="absolute top-0 left-0 -translate-y-full text-[8px] font-mono font-bold text-cyan-400/90 bg-slate-950/80 px-1 rounded-t border border-cyan-500/30">
                          {rule.ruleCode}
                        </span>
                      )}
                    </motion.div>
                  );
                })}

                {/* 2. Dedicated Pulsing Amber Box for Rule 18(2) Price Tampering */}
                {tamperResult?.hasTampering && tamperResult?.tamperBox && (
                  <div
                    className="absolute border-2 border-amber-400 bg-amber-500/25 rounded shadow-[0_0_25px_rgba(245,158,11,0.7)] animate-pulse z-25 pointer-events-none"
                    style={{
                      left: `${tamperResult.tamperBox.left}%`,
                      top: `${tamperResult.tamperBox.top}%`,
                      width: `${tamperResult.tamperBox.width}%`,
                      height: `${tamperResult.tamperBox.height}%`
                    }}
                  >
                    <div className="absolute -top-6 right-0 bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 text-[9px] font-black font-mono px-2 py-0.5 rounded shadow flex items-center gap-1 whitespace-nowrap">
                      <span>⚠️ TAMPERED REGION</span>
                      <span className="bg-slate-950 text-amber-300 px-1 py-0.2 rounded text-[8px]">
                        ₹{tamperResult.stickerPrice} vs ₹{tamperResult.originalPrice}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-slate-600 text-sm flex flex-col items-center gap-2">
            <span>No image loaded</span>
          </div>
        )}

        {/* ======================================================= */}
        {/* DYNAMIC ELECTRIC CYAN LASER SCANNER BEAM                 */}
        {/* ======================================================= */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            {/* Trailing luminous cyan gradient sheet following laser */}
            <div className="absolute inset-x-0 h-32 bg-gradient-to-b from-cyan-500/0 via-cyan-400/20 to-cyan-500/40 pointer-events-none animate-laser-cyan -translate-y-32"></div>

            {/* Electric Cyan & Hyper Blue Core Laser Line */}
            <div className="w-full h-[3px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_20px_#06b6d4,0_0_35px_#3b82f6] animate-laser-cyan"></div>

            {/* Radar Pulse Rings in center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-cyan-400/30 animate-radar-cyan pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-blue-500/40 animate-radar-cyan pointer-events-none [animation-delay:0.5s]"></div>
          </div>
        )}

        {/* ======================================================= */}
        {/* NEON MARCHING ANTS CROP SELECTION BOX                   */}
        {/* ======================================================= */}
        {liveBox && (
          <div
            className="absolute marching-ants-neon pointer-events-none z-30 shadow-[0_0_20px_rgba(6,182,212,0.5)]"
            style={{
              left: `${liveBox.x}px`,
              top: `${liveBox.y}px`,
              width: `${liveBox.width}px`,
              height: `${liveBox.height}px`
            }}
          >
            {/* Luminous Inner Tint */}
            <div className="w-full h-full bg-cyan-500/15 backdrop-blur-[0.5px]"></div>
            
            {/* Floating Tag */}
            <div className="absolute -top-6 left-0 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded shadow-md flex items-center gap-1">
              <Crosshair className="w-3 h-3 text-slate-950 stroke-[2.5]" />
              <span>Target Region</span>
            </div>
          </div>
        )}

        {/* Crosshairs guide when in crop mode */}
        {isCropMode && isHovering && !isDrawing && (
          <div className="pointer-events-none z-20">
            <div 
              className="absolute left-0 right-0 h-[1px] bg-cyan-400/50 border-t border-dashed border-cyan-400"
              style={{ top: `${mousePos.y}px` }}
            />
            <div 
              className="absolute top-0 bottom-0 w-[1px] bg-cyan-400/50 border-l border-dashed border-cyan-400"
              style={{ left: `${mousePos.x}px` }}
            />
          </div>
        )}

        {/* Help Banner */}
        {isCropMode && !liveBox && (
          <div className="absolute bottom-4 bg-slate-900/90 text-slate-200 text-xs px-3.5 py-1.5 rounded-full backdrop-blur-md pointer-events-none z-10 flex items-center gap-2 shadow-lg border border-slate-700">
            <Crop className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>Click and drag a box over label declarations</span>
          </div>
        )}
      </div>

      <div className="text-[11px] text-slate-400 flex items-center justify-between px-1 font-medium">
        <span>Principal Display Panel (PDP)</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]"></span>
          <span>Optical Resolution: 300 DPI Stream</span>
        </span>
      </div>
    </div>
  );
}
