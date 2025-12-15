import React, { useState, useEffect, useRef } from 'react';
import { VideoAsset, UserTier, ShortsStrategy, CaptionWord } from '../types';
import { generateShortsStrategy, generateShortScript, refineShortScript, generateCaptionData } from '../services/gemini';
import { trimVideo } from '../services/ffmpeg';
import { Youtube, Music2, Type, Wand2, Hash, Lock, Play, Pause, AlignLeft, RefreshCw, Download, CheckCircle, Crop, MoveHorizontal, MoveVertical, Monitor, Maximize } from 'lucide-react';
import { ExportModal } from './ExportModal';

interface Props {
  videoAsset: VideoAsset;
  userTier: UserTier;
  onUpgrade: () => void;
  platform: 'TIKTOK' | 'SHORTS';
}

export const ShortFormCreator: React.FC<Props> = ({ videoAsset, userTier, onUpgrade, platform }) => {
  // State
  const [activeTab, setActiveTab] = useState<'STRATEGY' | 'SCRIPT' | 'CAPTIONS'>('STRATEGY');
  const [strategy, setStrategy] = useState<ShortsStrategy | null>(null);
  const [script, setScript] = useState<string>('');
  const [captions, setCaptions] = useState<CaptionWord[]>([]);
  const [loading, setLoading] = useState(false);

  // Video State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Resize / Crop State
  const [cropMode, setCropMode] = useState<'FILL' | 'FIT'>('FILL');
  const [panX, setPanX] = useState(50); // 0-100%
  const [panY, setPanY] = useState(50); // 0-100%
  const [zoom, setZoom] = useState(1); // 1.0 - 2.5x

  // Export State
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [isExported, setIsExported] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);

  const isFree = userTier === UserTier.FREE;
  
  // Theme configuration based on platform
  const theme = platform === 'TIKTOK' 
    ? { 
        primary: 'text-[#ff0050]', 
        border: 'border-[#ff0050]', 
        bg: 'bg-[#ff0050]',
        hoverBg: 'hover:bg-[#ff0050]',
        secondary: 'text-[#00f2ea]',
        gradient: 'from-[#ff0050] to-[#00f2ea]',
        name: 'TikTok',
        icon: Music2
      } 
    : { 
        primary: 'text-[#FF0000]', 
        border: 'border-[#FF0000]', 
        bg: 'bg-[#FF0000]',
        hoverBg: 'hover:bg-[#FF0000]',
        secondary: 'text-white',
        gradient: 'from-[#FF0000] to-[#800000]',
        name: 'YouTube Shorts',
        icon: Youtube
      };

  const handleGenerateStrategy = async () => {
    setLoading(true);
    try {
      const result = await generateShortsStrategy(videoAsset.base64Data, videoAsset.mimeType, platform === 'TIKTOK' ? 'TIKTOK' : 'YOUTUBE_SHORTS');
      setStrategy(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateScript = async () => {
    setLoading(true);
    try {
      const result = await generateShortScript(videoAsset.base64Data, videoAsset.mimeType);
      setScript(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRefineScript = async () => {
    if (!script) return;
    setLoading(true);
    try {
      const result = await refineShortScript(script);
      setScript(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCaptions = async () => {
    if (!script) return;
    setLoading(true);
    try {
      const result = await generateCaptionData(script);
      setCaptions(result);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
        setIsPlaying(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Video Player Handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Real FFmpeg Export
  const handleRealExport = async () => {
    setIsRendering(true);
    setRenderProgress(0);
    try {
        // Simple trim (first 60 seconds as per generic shorts logic, or current trim)
        // In a real app we'd pass exact start/end from user input
        // Note: FFmpeg crop filter would need to be calculated based on panX/panY/zoom
        const url = await trimVideo(videoAsset.file, 0, Math.min(60, duration), (p) => setRenderProgress(p));
        
        // Auto-download
        const a = document.createElement('a');
        a.href = url;
        a.download = `viral_short_${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        
        setIsExported(true);
        setExportModalOpen(false);
    } catch (e) {
        console.error("Export Failed", e);
        alert("FFmpeg Export Failed. Check console.");
    } finally {
        setIsRendering(false);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const getCurrentWord = () => {
    return captions.find(w => currentTime >= w.start && currentTime <= w.end)?.word || '';
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Custom Export Modal with FFmpeg Progress */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-cyber-black border border-cyber-border w-full max-w-md p-6 relative">
                 <h3 className="text-xl font-cyber text-white mb-4">RENDERING_VIDEO</h3>
                 {isRendering ? (
                     <div className="space-y-4 text-center">
                         <div className="w-full bg-cyber-panel h-2 rounded overflow-hidden">
                             <div className="bg-cyber-orange h-full transition-all" style={{ width: `${renderProgress}%`}}></div>
                         </div>
                         <p className="font-mono text-cyber-orange">{renderProgress}% PROCESSED</p>
                         <p className="text-xs text-cyber-muted">Using client-side FFmpeg WASM...</p>
                     </div>
                 ) : (
                     <div className="space-y-4">
                         <p className="text-sm text-cyber-muted">Ready to render video processing.</p>
                         <button onClick={handleRealExport} className="w-full bg-cyber-orange text-black font-bold py-3 uppercase">START RENDER</button>
                         <button onClick={() => setExportModalOpen(false)} className="w-full border border-cyber-border text-white py-2 uppercase mt-2">CANCEL</button>
                     </div>
                 )}
            </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-cyber-border pb-6">
        <div>
           <h2 className={`text-3xl font-cyber font-bold flex items-center gap-3 text-white`}>
             <theme.icon className={theme.primary} /> {platform}_STUDIO
           </h2>
           <p className="text-cyber-muted font-mono text-xs mt-2 uppercase">Viral Engineering Protocol</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
            {/* Tabs */}
            <div className="flex bg-cyber-panel p-1 border border-cyber-border">
                <button 
                    onClick={() => setActiveTab('STRATEGY')}
                    className={`px-4 py-2 text-xs font-bold uppercase transition-all flex items-center gap-2 ${activeTab === 'STRATEGY' ? `${theme.bg} text-white` : 'text-cyber-muted hover:text-white'}`}
                >
                    <Hash size={14} /> Strategy
                </button>
                <button 
                    onClick={() => setActiveTab('SCRIPT')}
                    className={`px-4 py-2 text-xs font-bold uppercase transition-all flex items-center gap-2 ${activeTab === 'SCRIPT' ? `${theme.bg} text-white` : 'text-cyber-muted hover:text-white'}`}
                >
                    <AlignLeft size={14} /> Script
                </button>
                <button 
                    onClick={() => setActiveTab('CAPTIONS')}
                    className={`px-4 py-2 text-xs font-bold uppercase transition-all flex items-center gap-2 ${activeTab === 'CAPTIONS' ? `${theme.bg} text-white` : 'text-cyber-muted hover:text-white'}`}
                >
                    <Type size={14} /> Captions
                </button>
            </div>

            {/* Export Button */}
            <button 
                onClick={() => setExportModalOpen(true)}
                className={`px-6 py-3 font-bold uppercase text-xs transition-all flex items-center gap-2 ${
                    isExported 
                    ? 'bg-green-500 text-black hover:bg-green-400' 
                    : `bg-cyber-panel border border-cyber-border hover:border-current ${theme.primary} hover:text-white`
                }`}
            >
                {isExported ? (
                    <><CheckCircle size={16} className="animate-bounce" /> Exported</>
                ) : (
                    <><Download size={16} /> Export Video</>
                )}
            </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Player & Visuals */}
          <div className="flex flex-col gap-4">
               {/* Video Player Container */}
               <div className="flex flex-col max-w-sm mx-auto w-full group">
                   <div className={`relative aspect-[9/16] bg-black border-2 border-b-0 ${theme.border} overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]`}>
                        <video 
                            ref={videoRef}
                            src={videoAsset.previewUrl} 
                            className={`w-full h-full transition-all duration-300 ${isPlaying ? 'opacity-100' : 'opacity-80'}`}
                            style={{ 
                                objectFit: cropMode === 'FILL' ? 'cover' : 'contain',
                                objectPosition: `${panX}% ${panY}%`,
                                transform: cropMode === 'FILL' ? `scale(${zoom})` : 'none'
                            }}
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                            loop
                            onClick={togglePlay}
                        />
                        
                        {/* Animated Caption Overlay */}
                        {activeTab === 'CAPTIONS' && captions.length > 0 && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <h2 className={`text-3xl sm:text-4xl font-cyber font-bold text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] px-4 text-center animate-bounce duration-75`}>
                                    <span className={`bg-black/50 px-2 leading-tight ${theme.primary}`}>{getCurrentWord()}</span>
                                </h2>
                            </div>
                        )}

                        {!isPlaying && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <Play size={48} className="text-white opacity-50" fill="currentColor" />
                            </div>
                        )}
                   </div>

                   {/* Player Controls */}
                   <div className={`bg-cyber-black border-2 border-t-0 ${theme.border} p-3 flex flex-col gap-2`}>
                        <div className="flex items-center gap-3">
                            <button onClick={togglePlay} className="text-white hover:text-cyber-orange transition-colors">
                                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                            </button>
                            <input 
                                type="range" 
                                min="0" 
                                max={duration || 100} 
                                value={currentTime} 
                                onChange={handleSeek}
                                className={`flex-1 h-1 bg-cyber-panel appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all`}
                            />
                            <span className="text-[10px] font-mono text-cyber-muted w-16 text-right">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>
                   </div>
               </div>

               {/* Crop / Resize Controls */}
               <div className="max-w-sm mx-auto w-full bg-cyber-panel border border-cyber-border p-3">
                   <div className="flex items-center justify-between mb-3">
                       <span className={`text-xs font-bold flex items-center gap-2 ${theme.primary}`}>
                          <Crop size={14} /> CANVAS_CONTROL (9:16)
                       </span>
                       <div className="flex bg-cyber-black p-1 rounded border border-cyber-border">
                          <button 
                            onClick={() => setCropMode('FILL')} 
                            className={`px-3 py-1 text-[10px] font-bold uppercase transition-colors ${cropMode === 'FILL' ? `${theme.bg} text-white` : 'text-cyber-muted hover:text-white'}`}
                          >
                            Fill
                          </button>
                          <button 
                            onClick={() => { setCropMode('FIT'); setPanX(50); setPanY(50); setZoom(1); }} 
                            className={`px-3 py-1 text-[10px] font-bold uppercase transition-colors ${cropMode === 'FIT' ? `${theme.bg} text-white` : 'text-cyber-muted hover:text-white'}`}
                          >
                            Fit
                          </button>
                       </div>
                   </div>

                   {cropMode === 'FILL' ? (
                       <div className="space-y-4">
                           {/* Pan Control X */}
                           <div className="space-y-2">
                               <div className="flex justify-between text-[10px] text-cyber-muted font-mono">
                                   <span>PAN_LEFT</span>
                                   <span>CENTER</span>
                                   <span>PAN_RIGHT</span>
                               </div>
                               <div className="flex items-center gap-3">
                                   <MoveHorizontal size={14} className={theme.primary} />
                                   <input 
                                       type="range" 
                                       min="0" 
                                       max="100" 
                                       value={panX} 
                                       onChange={(e) => setPanX(Number(e.target.value))}
                                       className="w-full h-1 bg-cyber-black appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                                   />
                               </div>
                           </div>

                           {/* Pan Control Y */}
                           <div className="space-y-2">
                               <div className="flex justify-between text-[10px] text-cyber-muted font-mono">
                                   <span>PAN_TOP</span>
                                   <span>CENTER</span>
                                   <span>PAN_BOTTOM</span>
                               </div>
                               <div className="flex items-center gap-3">
                                   <MoveVertical size={14} className={theme.primary} />
                                   <input 
                                       type="range" 
                                       min="0" 
                                       max="100" 
                                       value={panY} 
                                       onChange={(e) => setPanY(Number(e.target.value))}
                                       className="w-full h-1 bg-cyber-black appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                                   />
                               </div>
                           </div>
                           
                           {/* Zoom Control */}
                           <div className="space-y-2">
                               <div className="flex justify-between text-[10px] text-cyber-muted font-mono">
                                   <span>ZOOM_LEVEL</span>
                                   <span>{zoom.toFixed(1)}x</span>
                               </div>
                               <div className="flex items-center gap-3">
                                   <Maximize size={14} className={theme.primary} />
                                   <input 
                                       type="range" 
                                       min="1" 
                                       max="2.5" 
                                       step="0.1" 
                                       value={zoom} 
                                       onChange={(e) => setZoom(Number(e.target.value))}
                                       className="w-full h-1 bg-cyber-black appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                                   />
                               </div>
                           </div>
                       </div>
                   ) : (
                       <div className="text-center py-2 text-[10px] text-cyber-muted font-mono flex items-center justify-center gap-2">
                           <Monitor size={12} /> ORIGINAL_ASPECT_RATIO_PRESERVED
                       </div>
                   )}
                   <p className="text-[10px] text-center text-cyber-muted mt-2 border-t border-cyber-border pt-2">
                       Output auto-resized to 1080x1920 (Vertical)
                   </p>
               </div>
          </div>

          {/* Right Column: Controls & Output */}
          <div className="bg-cyber-black border border-cyber-border p-6 flex flex-col gap-6 overflow-y-auto relative h-[600px] lg:h-auto">
              
              {/* STRATEGY TAB */}
              {activeTab === 'STRATEGY' && (
                  isFree ? (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                          <Lock size={48} className={theme.primary} />
                          <h3 className="text-xl font-bold text-white">STRATEGY_LOCKED</h3>
                          <p className="text-cyber-muted text-sm">Upgrade to Creator Tier to unlock AI viral strategy generation.</p>
                          <button onClick={onUpgrade} className={`px-6 py-2 ${theme.bg} text-white font-bold uppercase text-xs`}>Upgrade</button>
                      </div>
                  ) : (
                      <>
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-cyber text-white">CONTENT_STRATEGY</h3>
                            <button 
                                onClick={handleGenerateStrategy}
                                disabled={loading}
                                className={`px-4 py-2 border ${theme.border} ${theme.primary} hover:bg-white hover:text-black font-bold uppercase text-xs transition-all`}
                            >
                                {loading ? 'GENERATING...' : 'GENERATE_STRATEGY'}
                            </button>
                        </div>
                        {strategy ? (
                            <div className="space-y-6 animate-fadeIn">
                                <div>
                                    <span className="text-xs font-mono text-cyber-muted uppercase block mb-2">3-Second Hooks</span>
                                    <ul className="space-y-2">
                                        {strategy.hooks.map((hook, i) => (
                                            <li key={i} className="bg-cyber-panel p-3 border-l-2 border-cyber-orange text-white text-sm">"{hook}"</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <span className="text-xs font-mono text-cyber-muted uppercase block mb-2">Audio Vibe</span>
                                    <div className="flex flex-wrap gap-2">
                                        {strategy.audioSuggestions.map((audio, i) => (
                                            <span key={i} className="bg-cyber-panel px-3 py-1 rounded-full text-xs text-cyber-orange border border-cyber-border flex items-center gap-1">
                                                <Music2 size={10} /> {audio}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs font-mono text-cyber-muted uppercase block mb-2">Hashtags</span>
                                    <p className="text-cyber-text text-sm leading-relaxed font-mono text-opacity-80">
                                        {strategy.hashtags.join(' ')}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center opacity-30">
                                <Wand2 size={48} />
                            </div>
                        )}
                      </>
                  )
              )}

              {/* SCRIPT TAB */}
              {activeTab === 'SCRIPT' && (
                  <>
                    <div className="flex justify-between items-center">
                         <h3 className="text-lg font-cyber text-white">VOICEOVER_SCRIPT</h3>
                         <div className="flex gap-2">
                             {/* Refine Button - Locked on Free */}
                             <button 
                                onClick={isFree ? onUpgrade : handleRefineScript}
                                disabled={loading || !script}
                                className={`px-3 py-2 border border-cyber-border text-cyber-muted hover:text-white font-bold uppercase text-[10px] transition-all flex items-center gap-2`}
                             >
                                {isFree && <Lock size={10} />} <RefreshCw size={10} /> Refine
                             </button>
                             <button 
                                onClick={handleGenerateScript}
                                disabled={loading}
                                className={`px-4 py-2 ${theme.bg} text-white font-bold uppercase text-xs transition-all`}
                             >
                                {loading ? 'WRITING...' : 'WRITE_SCRIPT'}
                             </button>
                         </div>
                    </div>
                    <textarea 
                        className="flex-1 bg-cyber-panel border border-cyber-border p-4 text-white font-mono text-sm resize-none focus:outline-none focus:border-cyber-orange"
                        placeholder="// Generated script will appear here..."
                        value={script}
                        onChange={(e) => setScript(e.target.value)}
                    />
                  </>
              )}

              {/* CAPTIONS TAB */}
              {activeTab === 'CAPTIONS' && (
                  isFree ? (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                          <Lock size={48} className={theme.primary} />
                          <h3 className="text-xl font-bold text-white">ANIMATION_LOCKED</h3>
                          <p className="text-cyber-muted text-sm">Upgrade to Creator Tier to unlock Animated Caption Generator.</p>
                          <button onClick={onUpgrade} className={`px-6 py-2 ${theme.bg} text-white font-bold uppercase text-xs`}>Upgrade</button>
                      </div>
                  ) : (
                      <>
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-cyber text-white">CAPTION_GENERATOR</h3>
                            <button 
                                onClick={handleGenerateCaptions}
                                disabled={loading || !script}
                                className={`px-4 py-2 ${theme.bg} text-white font-bold uppercase text-xs transition-all`}
                            >
                                {loading ? 'SYNCING...' : 'GENERATE_ANIMATION'}
                            </button>
                        </div>
                        
                        {!script && <p className="text-red-500 text-xs font-mono">ERROR: SCRIPT_REQUIRED</p>}

                        <div className="flex-1 overflow-y-auto bg-cyber-panel border border-cyber-border p-4 space-y-2">
                            {captions.length > 0 ? captions.map((word, i) => (
                                <div key={i} className={`flex justify-between text-xs font-mono p-2 ${currentTime >= word.start && currentTime <= word.end ? 'bg-cyber-orange text-black' : 'text-cyber-muted border-b border-cyber-border'}`}>
                                    <span>{word.word}</span>
                                    <span>{word.start.toFixed(1)}s - {word.end.toFixed(1)}s</span>
                                </div>
                            )) : (
                                <div className="text-cyber-muted text-center py-10 opacity-50">
                                    // CAPTION_DATA_EMPTY
                                </div>
                            )}
                        </div>
                      </>
                  )
              )}

          </div>
      </div>
    </div>
  );
};