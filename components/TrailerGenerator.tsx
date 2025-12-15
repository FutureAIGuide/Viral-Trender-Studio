import React, { useState, useEffect, useRef } from 'react';
import { generateTrailerPlan } from '../services/gemini';
import { VideoAsset, TrailerResponse, UserTier } from '../types';
import { Film, Play, Pause, Music, Clapperboard, Download, Zap, RefreshCw } from 'lucide-react';
import { ExportModal } from './ExportModal';

interface Props {
  videoAsset: VideoAsset;
  userTier: UserTier;
  onUpgrade: () => void;
}

export const TrailerGenerator: React.FC<Props> = ({ videoAsset, userTier, onUpgrade }) => {
  const [data, setData] = useState<TrailerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  
  // Preview Player State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [currentCutIndex, setCurrentCutIndex] = useState(0);

  const parseTime = (timeStr: string) => {
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    return 0;
  };

  const generate = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await generateTrailerPlan(videoAsset.base64Data, videoAsset.mimeType);
      setData(result);
    } catch (err) {
      setError("Failed to generate trailer plan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!data && !loading && !error) {
      generate();
    }
  }, [videoAsset]);

  // Trailer Preview Logic
  useEffect(() => {
    if (!isPreviewing || !data || !videoRef.current) return;

    const handleTimeUpdate = () => {
      const video = videoRef.current;
      if (!video) return;

      const currentCut = data.cuts[currentCutIndex];
      const endTime = parseTime(currentCut.endTime);

      if (video.currentTime >= endTime) {
        const nextIndex = currentCutIndex + 1;
        if (nextIndex < data.cuts.length) {
          setCurrentCutIndex(nextIndex);
          video.currentTime = parseTime(data.cuts[nextIndex].startTime);
          video.play();
        } else {
          // Trailer finished
          setIsPreviewing(false);
          setCurrentCutIndex(0);
          video.pause();
        }
      }
    };

    const videoElement = videoRef.current;
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [isPreviewing, currentCutIndex, data]);

  const startPreview = () => {
    if (!data || !videoRef.current) return;
    setCurrentCutIndex(0);
    videoRef.current.currentTime = parseTime(data.cuts[0].startTime);
    setIsPreviewing(true);
    videoRef.current.play();
  };

  const stopPreview = () => {
    setIsPreviewing(false);
    if (videoRef.current) videoRef.current.pause();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6">
        <div className="relative">
             <div className="w-24 h-24 border-2 border-cyber-border rounded-full animate-ping absolute top-0 left-0"></div>
             <div className="w-24 h-24 border-2 border-cyber-orange rounded-full animate-spin flex items-center justify-center">
                 <Clapperboard className="text-white" size={32} />
             </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-cyber text-white tracking-widest">ASSEMBLING_CUTS</h3>
          <p className="text-cyber-orange font-mono text-xs">SEQUENCING_HIGHLIGHT_REEL...</p>
        </div>
      </div>
    );
  }

  if (error) {
     return (
        <div className="flex flex-col items-center justify-center h-full text-red-500 font-mono space-y-4">
           <p>{error}</p>
           <button 
              onClick={generate}
              className="border border-red-500 px-4 py-2 hover:bg-red-500 hover:text-white transition-colors uppercase text-xs font-bold"
            >
               Retry Generation
           </button>
        </div>
     );
  }

  if (!data) return null;

  return (
    <div className="h-full flex flex-col gap-6">
      <ExportModal 
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        userTier={userTier}
        onUpgrade={onUpgrade}
        title={`Highlight Reel: ${data.title}`}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-border pb-6">
        <div>
          <h2 className="text-3xl font-cyber font-bold text-white flex items-center gap-3">
            <Film className="text-cyber-orange" /> 
            HIGHLIGHT_REEL
          </h2>
          <p className="text-cyber-muted font-mono text-xs mt-2 uppercase tracking-wide">
            Auto-Generated Trailer & Best Moments
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
             <div className="bg-cyber-panel px-4 py-2 border border-cyber-border flex items-center gap-2">
                 <Music size={14} className="text-cyber-orange" />
                 <span className="text-xs text-white font-mono">{data.mood}</span>
             </div>
             
             <button 
                onClick={generate}
                className="bg-cyber-black border border-cyber-border text-cyber-muted hover:text-white px-3 py-2 transition-colors"
                title="Regenerate"
             >
                 <RefreshCw size={16} />
             </button>

             <button 
                onClick={() => setExportModalOpen(true)}
                className="bg-white text-black font-bold px-4 py-2 uppercase text-xs flex items-center gap-2 hover:bg-cyber-orange transition-colors"
             >
                 <Download size={14} /> Export Reel
             </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
         {/* Preview Player */}
         <div className="flex flex-col gap-4">
            <div className="bg-cyber-black border-2 border-cyber-border relative group aspect-video flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                {/* Overlay indicating Trailer Mode */}
                {isPreviewing && (
                    <div className="absolute top-4 left-4 z-20 bg-red-600 text-white px-2 py-1 text-[10px] font-bold uppercase animate-pulse flex items-center gap-2 shadow-lg">
                        <div className="w-2 h-2 bg-white rounded-full"></div> HIGHLIGHT_PREVIEW
                    </div>
                )}
                
                <video 
                    ref={videoRef}
                    src={videoAsset.previewUrl} 
                    className="w-full h-full object-contain"
                    controls={!isPreviewing}
                />
            </div>
            
            <div className="bg-cyber-panel p-4 border-l-4 border-cyber-orange relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Zap size={80} />
                </div>
                <h3 className="font-cyber font-bold text-white text-lg mb-1 relative z-10">{data.title}</h3>
                <p className="text-cyber-muted text-sm font-light leading-relaxed relative z-10">{data.synopsis}</p>
            </div>

            <div className="flex gap-4">
                {!isPreviewing ? (
                    <button 
                        onClick={startPreview}
                        className="flex-1 bg-cyber-orange text-black font-bold py-3 uppercase tracking-widest hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,102,0,0.3)] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    >
                        <Play size={18} fill="currentColor" /> Preview Highlight Reel
                    </button>
                ) : (
                    <button 
                        onClick={stopPreview}
                        className="flex-1 bg-red-600 text-white font-bold py-3 uppercase tracking-widest hover:bg-red-500 transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                    >
                        <Pause size={18} fill="currentColor" /> Stop Preview
                    </button>
                )}
            </div>
         </div>

         {/* Cut List */}
         <div className="bg-cyber-black border border-cyber-border flex flex-col overflow-hidden">
             <div className="p-4 bg-cyber-panel border-b border-cyber-border flex justify-between items-center">
                 <span className="font-cyber text-cyber-orange text-sm uppercase tracking-widest flex items-center gap-2">
                    <Clapperboard size={14} /> EDIT_DECISION_LIST
                 </span>
                 <span className="font-mono text-xs text-cyber-muted px-2 py-1 bg-cyber-black rounded border border-cyber-border">{data.cuts.length} SEGMENTS</span>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-3">
                 {data.cuts.map((cut, idx) => (
                     <div 
                        key={idx} 
                        className={`p-4 border transition-all duration-300 relative overflow-hidden group ${
                            isPreviewing && currentCutIndex === idx 
                                ? 'bg-cyber-orange/10 border-cyber-orange transform scale-[1.02] z-10' 
                                : 'bg-cyber-panel/50 border-cyber-border hover:border-cyber-muted'
                        }`}
                        onClick={() => {
                            if(videoRef.current) {
                                videoRef.current.currentTime = parseTime(cut.startTime);
                                // Optional: auto-play clip on click?
                            }
                        }}
                     >
                         <div className="flex justify-between items-start mb-2 relative z-10">
                             <div className="flex items-center gap-3">
                                 <span className={`font-cyber font-bold text-lg ${isPreviewing && currentCutIndex === idx ? 'text-cyber-orange' : 'text-white'}`}>
                                     {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                                 </span>
                                 {isPreviewing && currentCutIndex === idx && (
                                     <span className="text-[10px] font-bold text-cyber-orange uppercase animate-pulse">Playing</span>
                                 )}
                             </div>
                             <div className="font-mono text-xs text-cyber-muted bg-cyber-black px-2 py-1 rounded border border-cyber-border group-hover:border-cyber-text transition-colors cursor-help">
                                 {cut.startTime} - {cut.endTime}
                             </div>
                         </div>
                         <p className="text-sm text-cyber-text font-light relative z-10">{cut.description}</p>
                         
                         {/* Progress bar background for active item */}
                         {isPreviewing && currentCutIndex === idx && (
                             <div className="absolute bottom-0 left-0 h-0.5 bg-cyber-orange w-full animate-pulse"></div>
                         )}
                     </div>
                 ))}
             </div>
         </div>
      </div>
    </div>
  );
};