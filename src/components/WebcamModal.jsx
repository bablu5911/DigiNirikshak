import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

export default function WebcamModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setIsInitializing(true);
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsInitializing(false);
        };
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError(err.message || 'Unable to access camera device.');
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleSnap = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const snapshotDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    stopCamera();
    onCapture(snapshotDataUrl);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-[0_0_35px_rgba(6,182,212,0.15)] max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-950 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-sm text-slate-100">Live Packaging Optical Capture</span>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Viewfinder Body */}
        <div className="p-5 flex flex-col items-center bg-slate-900 text-slate-100">
          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
            
            {cameraError ? (
              <div className="p-6 text-center text-rose-300 max-w-sm flex flex-col items-center gap-2">
                <AlertCircle className="w-8 h-8 text-rose-500" />
                <span className="font-bold text-sm">Camera Access Unavailable</span>
                <span className="text-xs text-slate-400">{cameraError}</span>
                <button
                  type="button"
                  onClick={startCamera}
                  className="mt-3 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white cursor-pointer"
                >
                  Retry Camera Stream
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {isInitializing && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-xs text-cyan-400 font-medium gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Initializing camera stream...</span>
                  </div>
                )}

                {/* Framing Overlay Guide */}
                <div className="absolute inset-6 border-2 border-dashed border-cyan-400/70 rounded-lg pointer-events-none flex flex-col justify-between p-3">
                  <span className="text-[10px] uppercase font-extrabold text-cyan-300 bg-slate-950/80 px-2 py-0.5 rounded self-start border border-cyan-500/40">
                    Align Packaging Inside Target Frame
                  </span>
                  <span className="text-[10px] text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded self-end">
                    Keep surface flat & well lit
                  </span>
                </div>
              </>
            )}

          </div>

          <p className="text-xs text-slate-400 mt-3 text-center">
            Point your camera at the principal display panel with Net Qty, MRP, and statutory manufacturer details.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 border-t border-slate-800 px-5 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isInitializing || !!cameraError}
            onClick={handleSnap}
            className="px-5 py-2.5 rounded-xl btn-cyan-shimmer disabled:opacity-40 text-slate-950 text-xs font-black flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
          >
            <Camera className="w-4 h-4 text-slate-950" />
            <span>Capture & Run Forensic Audit</span>
          </button>
        </div>

      </div>
    </div>
  );
}
