import React, { useState, useRef, useEffect } from 'react';
import { VideoAsset, UserTier } from '../types';
import { Eraser, Scan, CheckCircle, Download, Sparkles, Upload, Zap, Lock, Play, Pause, X, RotateCcw, Crosshair, RefreshCw, Activity, ShieldCheck, SplitSquareHorizontal } from 'lucide-react';
import { ExportModal } from './ExportModal';

interface Props {
  videoAsset: VideoAsset;
  userTier: UserTier;
  onUpgrade: () => void;
}

interface BrandingState {
    file: File;
    previewUrl: string;
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    scale: number; // 0.1 to 2.0
    opacity: number; // 0 to 1
}

const PIPELINE_STEPS = [
    "INITIALIZING_GPU_CLUSTERS",
    "DETECTING_TEMPORAL_REGIONS",
    "COMPUTING_OPTICAL_FLOW",
    "GENERATING_SPATIAL_INPAINT",
    "ENFORCING_TEMPORAL_CONSISTENCY",
    "FINALIZING_RENDER"
];

export const WatermarkRemover: React.FC<Props> = ({ videoAsset, userTier, onUpgrade }) => {
  const [step, setStep] = useState<'IDLE' | 'SCANNING' | 'AWAITING_APPROVAL' | 'PROCESSING' | 'COMPLETED'>('IDLE');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [branding, setBranding] = useState<BrandingState | null>(null);
  const [rightsAccepted, setRightsAccepted] = useState(false);
  
  // Pipeline Configuration
  const [watermarkType, setWatermarkType] = useState<'STATIC' | 'DYNAMIC'>('STATIC');
  const [removalQuality, setRemovalQuality] = useState<'STANDARD' | 'TEMPORAL_AI'>('TEMPORAL_AI');

  // Interaction State
  const [interactionMode, setInteractionMode] = useState<'NONE' | 'DRAG' | 'RESIZE' | 'DRAW'>('NONE');
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [dragOrigin, setDragOrigin] = useState({ x: 0, y: 0 }); 
  const [isDraggingBranding, setIsDraggingBranding] = useState(false);
  
  // Playback State
  const [isPlaying, setIsPlaying] = useState(false); 
  const [compareSlider, setCompareSlider] = useState(50); // 0-100%
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentPipelineStep, setCurrentPipelineStep] = useState(0);

  // Detection Box State
  const [detectionBox, setDetectionBox] = useState({ x: 80, y: 5, w: 15, h: 10 });

  const videoRef = useRef<HTMLVideoElement>(null);
  const cleanedVideoRef = useRef<HTMLVideoElement>(null); 
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync Playback
  const togglePlay = () => {
      const shouldPlay = !isPlaying;
      setIsPlaying(shouldPlay);

      if (videoRef.current) {
          shouldPlay ? videoRef.current.play() : videoRef.current.pause();
      }
      if (cleanedVideoRef.current) {
          shouldPlay ? cleanedVideoRef.current.play() : cleanedVideoRef.current.pause();
      }
  };

  const handleTimeUpdate = () => {
      if (step === 'COMPLETED' && videoRef.current && cleanedVideoRef.current) {
          const diff = Math.abs(videoRef.current.currentTime - cleanedVideoRef.current.currentTime);
          if (diff > 0.1) {
             cleanedVideoRef.current.currentTime = videoRef.current.currentTime;
          }
      }
  };

  const startScan = () => {
    if (!rightsAccepted) return;
    setStep('SCANNING');
    if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
        setIsPlaying(true);
    }

    setTimeout(() => {
      if (videoRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);
      }
      setStep('AWAITING_APPROVAL');
    }, 1500);
  };

  const handleRescan = () => {
      setStep('SCANNING');
      setTimeout(() => {
          setStep('AWAITING_APPROVAL');
      }, 1000);
  };

  const handleAcceptDetection = () => {
    setStep('PROCESSING');
    setProcessingProgress(0);
    setCurrentPipelineStep(0);
    
    // Simulate complex pipeline
    const totalDuration = 4000;
    const intervalTime = totalDuration / 100;
    const stepInterval = 100 / PIPELINE_STEPS.length;

    let progress = 0;
    const interval = setInterval(() => {
        progress += 1;
        setProcessingProgress(progress);
        
        // Update text step based on progress
        const stepIndex = Math.min(Math.floor(progress / stepInterval), PIPELINE_STEPS.length - 1);
        setCurrentPipelineStep(stepIndex);

        if (progress >= 100) {
            clearInterval(interval);
            setStep('COMPLETED');
            if (videoRef.current) {
                videoRef.current.currentTime = 0;
                videoRef.current.play();
            }
            // Delay for cleaned video to ensure mount
            setTimeout(() => {
                if (cleanedVideoRef.current) {
                    cleanedVideoRef.current.currentTime = 0;
                    cleanedVideoRef.current.play();
                }
            }, 100);
            setIsPlaying(true);
        }
    }, intervalTime);
  };

  const handleExport = () => {
    setExportModalOpen(true);
  };

  const handleBrandingUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const url = URL.createObjectURL(file);
          setBranding({
              file,
              previewUrl: url,
              x: 50,
              y: 50,
              scale: 1,
              opacity: 0.9
          });
      }
  };

  // --- Interaction Logic (Draw/Resize/Drag) ---

  const getCoords = (e: React.MouseEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
        x: Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)),
        y: Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100))
    };
  };

  const handleMouseDown = (e: React.MouseEvent, type: 'CONTAINER' | 'BOX' | 'HANDLE' | 'BRANDING', handle?: string) => {
    const coords = getCoords(e);

    if (step === 'COMPLETED') {
        if (type === 'BRANDING') {
             setIsDraggingBranding(true);
        } else if (type === 'CONTAINER') {
             // For slider logic, we might want to just track mouse move if dragging slider handle
             // Implementing simple click-to-move slider for now or drag logic handled by slider input
        }
        return;
    }

    if (step === 'AWAITING_APPROVAL') {
        e.stopPropagation();
        e.preventDefault();

        if (type === 'HANDLE' && handle) {
            setInteractionMode('RESIZE');
            setActiveHandle(handle);
            setDragOrigin(coords); 
        } else if (type === 'BOX') {
            setInteractionMode('DRAG');
            setDragOrigin({ x: coords.x - detectionBox.x, y: coords.y - detectionBox.y });
        } else if (type === 'CONTAINER') {
            setInteractionMode('DRAW');
            setDragOrigin({ x: coords.x, y: coords.y });
            setDetectionBox({ x: coords.x, y: coords.y, w: 0, h: 0 });
        }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      const coords = getCoords(e);

      if (step === 'COMPLETED' && isDraggingBranding && branding) {
        setBranding({
            ...branding,
            x: coords.x,
            y: coords.y
        });
        return;
      }

      if (step === 'AWAITING_APPROVAL' && interactionMode !== 'NONE') {
          if (interactionMode === 'DRAG') {
              setDetectionBox(prev => ({
                  ...prev,
                  x: Math.min(100 - prev.w, Math.max(0, coords.x - dragOrigin.x)),
                  y: Math.min(100 - prev.h, Math.max(0, coords.y - dragOrigin.y))
              }));
          } 
          else if (interactionMode === 'DRAW') {
              const x = Math.min(coords.x, dragOrigin.x);
              const y = Math.min(coords.y, dragOrigin.y);
              const w = Math.abs(coords.x - dragOrigin.x);
              const h = Math.abs(coords.y - dragOrigin.y);
              setDetectionBox({ x, y, w, h });
          }
          else if (interactionMode === 'RESIZE' && activeHandle) {
              const box = { ...detectionBox };
              if (activeHandle.includes('n')) {
                  const bottom = box.y + box.h;
                  const newY = Math.min(bottom - 1, coords.y);
                  box.h = bottom - newY;
                  box.y = newY;
              }
              if (activeHandle.includes('s')) {
                  box.h = Math.max(1, coords.y - box.y);
              }
              if (activeHandle.includes('w')) {
                  const right = box.x + box.w;
                  const newX = Math.min(right - 1, coords.x);
                  box.w = right - newX;
                  box.x = newX;
              }
              if (activeHandle.includes('e')) {
                  box.w = Math.max(1, coords.x - box.x);
              }
              setDetectionBox(box);
          }
      }
  };

  const handleMouseUp = () => {
      setInteractionMode('NONE');
      setIsDraggingBranding(false);
      setActiveHandle(null);
  };

  useEffect(() => {
      return () => {
          if (branding?.previewUrl) URL.revokeObjectURL(branding.previewUrl);
      };
  }, []);

  const isFree = userTier === UserTier.FREE;

  return (
    <div className="h-full flex flex-col gap-6 animate-fadeIn w-full max-w-6xl mx-auto">
      <ExportModal 
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        userTier={userTier}
        onUpgrade={onUpgrade}
        title={branding ? `Export with Branding: ${videoAsset.file.name}` : `Clean Export: ${videoAsset.file.name}`}
      />

      <div className="border-b border-cyber-border pb-6 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-cyber font-bold text-white flex items-center gap-3">
            <Eraser className="text-cyber-orange" /> MAGIC_WATERMARK_ERASER
          </h2>
          <p className="text-cyber-muted font-mono text-xs mt-2 uppercase">
            Frame-by-Frame Artifact Elimination Protocol
          </p>
        </div>
        {step !== 'IDLE' && (
            <div className="flex items-center gap-4">
                 <button 
                    onClick={() => {
                        setStep('IDLE');
                        setBranding(null);
                        setRightsAccepted(false);
                        if(videoRef.current) {
                            videoRef.current.pause();
                            videoRef.current.currentTime = 0;
                        }
                        setIsPlaying(false);
                    }} 
                    className="text-cyber-muted hover:text-white text-xs font-bold uppercase flex items-center gap-2"
                 >
                     <RotateCcw size={14} /> Reset Project
                 </button>
            </div>
        )}
      </div>

      <div className="flex flex-col gap-4 flex-1 min-h-0">
          
          {/* Main Viewer Container */}
          <div 
            ref={containerRef}
            className={`relative bg-black border-2 border-cyber-border overflow-hidden group select-none shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-4xl mx-auto aspect-video cursor-crosshair`}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseDown={(e) => handleMouseDown(e, 'CONTAINER')}
          >
            {/* IDLE STATE OVERLAY */}
            {step === 'IDLE' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-30 backdrop-blur-sm">
                    <div className="text-center space-y-6 p-8 bg-cyber-black/90 border border-cyber-border max-w-md mx-auto">
                        <ShieldCheck size={48} className={`mx-auto mb-4 ${rightsAccepted ? 'text-green-500' : 'text-cyber-muted'}`} />
                        
                        <div className="text-left space-y-4 mb-8">
                             <label className="flex items-start gap-3 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    checked={rightsAccepted} 
                                    onChange={(e) => setRightsAccepted(e.target.checked)}
                                    className="mt-1 w-4 h-4 accent-cyber-orange bg-cyber-black border-cyber-border cursor-pointer"
                                />
                                <span className="text-xs text-cyber-muted group-hover:text-white transition-colors leading-relaxed">
                                    I confirm that I own the rights to this content or have explicit permission to modify it. I acknowledge that this tool is for restoration purposes only, not for copyright circumvention.
                                </span>
                             </label>
                        </div>

                        <button 
                            onClick={startScan}
                            disabled={!rightsAccepted}
                            className={`group relative px-10 py-4 font-bold text-lg uppercase tracking-widest transition-all ${
                                rightsAccepted 
                                ? 'bg-cyber-orange text-black hover:bg-white shadow-[0_0_30px_rgba(255,102,0,0.4)]' 
                                : 'bg-cyber-panel text-cyber-muted cursor-not-allowed'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <Scan size={24} /> Initialize Scan
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* COMPLETED: SLIDER COMPARISON VIEW */}
            {step === 'COMPLETED' ? (
                <>
                    {/* Background: Original Video */}
                    <video 
                        ref={videoRef}
                        src={videoAsset.previewUrl} 
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                        muted
                        loop
                    />
                    
                    {/* Foreground: Cleaned Video (Clipped) */}
                    <div 
                        className="absolute inset-0 overflow-hidden pointer-events-none border-r-2 border-cyber-orange bg-black"
                        style={{ width: `${compareSlider}%` }}
                    >
                        <video 
                            ref={cleanedVideoRef}
                            src={videoAsset.previewUrl} 
                            className="absolute inset-0 w-full h-full object-contain max-w-none" 
                            // Important: max-w-none ensures video doesn't shrink inside the clipped container, 
                            // but usually we need to ensure the video element matches the parent container dimensions exactly.
                            // For aspect-fit videos, CSS object-contain handles scaling. 
                            // To make slider work perfectly with object-contain, we need to ensure both videos align perfectly.
                            // The simplest way is assuming w-full h-full matches container aspect ratio or accepting letterbox mask.
                            style={{ width: containerRef.current?.clientWidth, height: containerRef.current?.clientHeight }}
                            muted
                            loop
                        />
                         {/* Simulate Clean Area */}
                         <div 
                             className="absolute bg-black/80 backdrop-blur-xl border border-white/5"
                             style={{
                                left: `${detectionBox.x}%`,
                                top: `${detectionBox.y}%`,
                                width: `${detectionBox.w}%`,
                                height: `${detectionBox.h}%`,
                                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
                             }}
                        ></div>
                    </div>

                    {/* Slider Handle */}
                    <div 
                        className="absolute top-0 bottom-0 w-1 bg-cyber-orange cursor-ew-resize z-40 flex items-center justify-center hover:shadow-[0_0_15px_#FF6600]"
                        style={{ left: `${compareSlider}%` }}
                    >
                        <div className="w-8 h-8 bg-cyber-orange rounded-full flex items-center justify-center shadow-lg -ml-0.5">
                            <SplitSquareHorizontal size={16} className="text-black" />
                        </div>
                    </div>
                    
                    {/* Invisible Input for Slider Interaction */}
                    <input 
                        type="range"
                        min="0"
                        max="100"
                        value={compareSlider}
                        onChange={(e) => setCompareSlider(Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-50"
                    />

                    {/* Labels */}
                    <div className="absolute top-4 left-4 bg-black/70 px-2 py-1 text-[10px] text-green-500 font-bold border border-green-500/50 uppercase pointer-events-none">
                        Restored Output
                    </div>
                    <div className="absolute top-4 right-4 bg-black/70 px-2 py-1 text-[10px] text-red-500 font-bold border border-red-500/50 uppercase pointer-events-none">
                        Original Source
                    </div>

                    {/* Branding Overlay */}
                    {branding && (
                        <div 
                            className={`absolute z-30 cursor-move ${isDraggingBranding ? 'opacity-80' : ''} left-1/2 top-0 bottom-0 right-0 overflow-hidden pointer-events-none`}
                        >
                            <div 
                                className="absolute pointer-events-auto"
                                style={{
                                    left: `${branding.x}%`, 
                                    top: `${branding.y}%`,
                                    transform: `translate(-50%, -50%) scale(${branding.scale})`,
                                    opacity: branding.opacity
                                }}
                                onMouseDown={(e) => handleMouseDown(e, 'BRANDING')}
                            >
                                <div className={`border-2 ${isDraggingBranding ? 'border-cyber-orange border-dashed' : 'border-transparent hover:border-white/50 border-dashed'} p-1`}>
                                    <img 
                                        src={branding.previewUrl} 
                                        alt="Watermark" 
                                        className="max-w-[150px] pointer-events-none drop-shadow-lg"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                // Step: SCANNING / APPROVAL / PROCESSING
                <>
                    <video 
                        ref={videoRef}
                        src={videoAsset.previewUrl} 
                        className={`w-full h-full object-contain transition-all duration-500 pointer-events-none ${step === 'PROCESSING' ? 'opacity-30 grayscale' : ''}`}
                        controls={false}
                        autoPlay={false} 
                        muted
                        loop
                    />

                    {/* Play/Pause (only when NOT interacting with box) */}
                    {step !== 'IDLE' && step !== 'PROCESSING' && step !== 'AWAITING_APPROVAL' && (
                        <div 
                            onClick={togglePlay}
                            className="absolute inset-0 flex items-center justify-center cursor-pointer group/overlay z-10"
                        >
                            <div className={`bg-black/50 p-4 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-300 ${isPlaying ? 'opacity-0 group-hover/overlay:opacity-100 scale-110 group-hover/overlay:scale-100' : 'opacity-100 scale-100'}`}>
                                {isPlaying ? <Pause fill="white" size={32} /> : <Play fill="white" className="ml-1" size={32} />}
                            </div>
                        </div>
                    )}

                    {/* SCANNING EFFECT */}
                    {step === 'SCANNING' && (
                        <div className="absolute inset-0 pointer-events-none z-20">
                            <div className="absolute bg-cyber-orange/10 border-t-2 border-b-2 border-cyber-orange animate-pulse" 
                                style={detectionBox.w > 0 ? {
                                    left: `${detectionBox.x}%`, top: `${detectionBox.y}%`, width: `${detectionBox.w}%`, height: `${detectionBox.h}%`
                                } : { inset: 0 }}
                            ></div>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-cyber-orange font-mono text-xs px-4 py-2 border border-cyber-orange">
                                DETECTING_OVERLAYS...
                            </div>
                        </div>
                    )}

                    {/* MANUAL SELECTION / AWAITING APPROVAL */}
                    {step === 'AWAITING_APPROVAL' && (
                        <div className="absolute inset-0 z-30">
                            <div 
                                className={`absolute border-2 border-cyber-orange bg-cyber-orange/10 group/box cursor-move`}
                                style={{
                                    left: `${detectionBox.x}%`,
                                    top: `${detectionBox.y}%`,
                                    width: `${detectionBox.w}%`,
                                    height: `${detectionBox.h}%`
                                }}
                                onMouseDown={(e) => handleMouseDown(e, 'BOX')}
                            >
                                {['nw', 'ne', 'sw', 'se'].map((h) => (
                                    <div 
                                        key={h}
                                        className={`absolute w-3 h-3 bg-white border border-cyber-orange z-50
                                            ${h === 'nw' ? '-top-1.5 -left-1.5 cursor-nw-resize' : ''}
                                            ${h === 'ne' ? '-top-1.5 -right-1.5 cursor-ne-resize' : ''}
                                            ${h === 'sw' ? '-bottom-1.5 -left-1.5 cursor-sw-resize' : ''}
                                            ${h === 'se' ? '-bottom-1.5 -right-1.5 cursor-se-resize' : ''}
                                        `}
                                        onMouseDown={(e) => handleMouseDown(e, 'HANDLE', h)}
                                    />
                                ))}
                                <div className="absolute -top-6 left-0 bg-cyber-orange text-black text-[10px] font-bold px-2 py-0.5 uppercase whitespace-nowrap flex items-center gap-1 pointer-events-none">
                                    <Crosshair size={10} /> {detectionBox.w > 0 ? 'Watermark Zone' : 'Draw Box'}
                                </div>
                            </div>
                            
                            {/* Pipeline Settings Overlay */}
                            <div className="absolute bottom-4 left-4 right-4 bg-cyber-black/90 border border-cyber-border p-4 flex justify-between items-center backdrop-blur-md">
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-cyber-muted font-mono uppercase">Tracking Mode</label>
                                        <div className="flex bg-cyber-black border border-cyber-border p-0.5 rounded">
                                            <button 
                                                onClick={() => setWatermarkType('STATIC')}
                                                className={`px-3 py-1 text-[10px] font-bold uppercase ${watermarkType === 'STATIC' ? 'bg-cyber-panel text-white' : 'text-cyber-muted'}`}
                                            >
                                                Static
                                            </button>
                                            <button 
                                                onClick={() => setWatermarkType('DYNAMIC')}
                                                className={`px-3 py-1 text-[10px] font-bold uppercase ${watermarkType === 'DYNAMIC' ? 'bg-cyber-panel text-white' : 'text-cyber-muted'}`}
                                            >
                                                Moving
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-cyber-muted font-mono uppercase">Inpainting Engine</label>
                                        <div className="flex bg-cyber-black border border-cyber-border p-0.5 rounded">
                                            <button 
                                                onClick={() => setRemovalQuality('STANDARD')}
                                                className={`px-3 py-1 text-[10px] font-bold uppercase ${removalQuality === 'STANDARD' ? 'bg-cyber-panel text-white' : 'text-cyber-muted'}`}
                                            >
                                                Fast
                                            </button>
                                            <button 
                                                onClick={() => setRemovalQuality('TEMPORAL_AI')}
                                                className={`px-3 py-1 text-[10px] font-bold uppercase flex items-center gap-1 ${removalQuality === 'TEMPORAL_AI' ? 'bg-cyber-panel text-cyber-orange' : 'text-cyber-muted'}`}
                                            >
                                                <Zap size={10}/> Temporal AI
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Step: PROCESSING */}
            {step === 'PROCESSING' && (
              <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/90 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-6 w-96">
                  <div className="relative">
                      <div className="w-24 h-24 border-4 border-cyber-border rounded-full"></div>
                      <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-cyber-orange rounded-full animate-spin"></div>
                      <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" />
                  </div>
                  
                  <div className="w-full space-y-2 text-center">
                       <div className="font-cyber text-white tracking-widest text-lg">
                          {PIPELINE_STEPS[currentPipelineStep]}...
                       </div>
                       <p className="text-cyber-muted font-mono text-xs">
                          FRAME_BUFFER_ANALYSIS: {processingProgress}%
                       </p>
                  </div>
                  
                  <div className="w-full bg-cyber-border h-1 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyber-orange transition-all duration-300 ease-out" 
                        style={{width: `${processingProgress}%`}}
                      ></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 w-full text-[10px] font-mono text-cyber-muted opacity-50">
                      <div>OPTICAL_FLOW: {processingProgress > 30 ? 'LOCKED' : 'CALC...'}</div>
                      <div>TEMPORAL_SMOOTH: {processingProgress > 70 ? 'ACTIVE' : 'PENDING'}</div>
                      <div>MASK_TRACKING: {watermarkType}</div>
                      <div>INPAINT_MODE: {removalQuality}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Timeline / Status Bar / Controls */}
          <div className="bg-cyber-black border border-cyber-border p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-cyber-muted text-xs font-mono">STATUS:</span>
                    <span className={`font-bold text-xs ${
                        step === 'IDLE' ? 'text-white' : 
                        step === 'SCANNING' ? 'text-cyber-orange animate-pulse' :
                        step === 'AWAITING_APPROVAL' ? 'text-yellow-500' :
                        step === 'PROCESSING' ? 'text-blue-500' : 'text-green-500'
                    }`}>
                        {step === 'AWAITING_APPROVAL' ? 'MANUAL_SELECTION' : step === 'COMPLETED' ? 'CLEANUP_COMPLETE' : step}
                    </span>
                  </div>
                  
                  {step === 'COMPLETED' && (
                      <div className="text-green-500 flex items-center gap-2 text-xs font-bold">
                          <CheckCircle size={12}/> {branding ? 'REBRANDED' : 'WATERMARK_REMOVED'}
                      </div>
                  )}
              </div>
              
              <div className="flex items-center gap-4">
                  {step === 'AWAITING_APPROVAL' && (
                       <>
                        <button 
                            onClick={handleRescan}
                            className="bg-cyber-panel border border-cyber-border text-white px-4 py-2 font-bold uppercase tracking-wider text-xs hover:bg-white hover:text-black transition-colors flex items-center gap-2"
                        >
                            <RefreshCw size={14} /> Rescan Area
                        </button>
                        <button 
                            onClick={handleAcceptDetection}
                            className="bg-red-600 text-white px-6 py-2 font-bold uppercase tracking-wider text-xs hover:bg-red-500 transition-colors shadow-[0_0_15px_rgba(220,38,38,0.4)] flex items-center gap-2"
                        >
                            <Eraser size={14} /> Remove Watermark
                        </button>
                       </>
                  )}

                  {step === 'COMPLETED' && (
                      <button 
                          onClick={handleExport}
                          className="bg-cyber-orange text-black px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(255,102,0,0.3)]"
                      >
                          <Download size={16} /> Export Final Video
                      </button>
                  )}
              </div>
          </div>

          {/* Branding Controls - Only in Completed Step */}
          {step === 'COMPLETED' && (
              <div className="bg-cyber-panel border border-cyber-border p-4 animate-fadeIn">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <h4 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                                <Zap size={14} className={isFree ? 'text-cyber-muted' : 'text-cyber-orange'} /> 
                                Add Your Brand
                            </h4>
                            {isFree && <span className="text-[10px] text-cyber-muted border border-cyber-border px-2 py-0.5 rounded flex items-center gap-1"><Lock size={10}/> LOCKED</span>}
                        </div>

                        {!isFree && (
                            <div className="flex items-center gap-4 flex-1 justify-end">
                                {!branding ? (
                                    <div className="relative group">
                                        <input 
                                            type="file" 
                                            accept="image/png, image/jpeg"
                                            onChange={handleBrandingUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <button className="bg-cyber-black border border-cyber-border hover:border-cyber-orange text-cyber-muted hover:text-white px-4 py-2 text-xs font-bold uppercase flex items-center gap-2 transition-all">
                                            <Upload size={14} /> Upload Logo
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4 bg-cyber-black px-4 py-2 border border-cyber-border">
                                        <span className="text-[10px] text-cyber-muted font-mono uppercase">{branding.file.name}</span>
                                        <div className="h-4 w-px bg-cyber-border"></div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-cyber-muted">SCALE</span>
                                            <input 
                                                type="range" min="0.1" max="2.0" step="0.1"
                                                value={branding.scale}
                                                onChange={(e) => setBranding({...branding, scale: parseFloat(e.target.value)})}
                                                className="w-20 h-1 bg-cyber-panel appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-cyber-orange [&::-webkit-slider-thumb]:rounded-full"
                                            />
                                        </div>
                                        <button onClick={() => setBranding(null)} className="text-red-500 hover:text-white ml-2"><X size={14}/></button>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {isFree && (
                             <button onClick={onUpgrade} className="bg-white text-black text-xs font-bold uppercase px-4 py-2 hover:bg-cyber-orange transition-colors">Upgrade to Unlock</button>
                        )}
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};