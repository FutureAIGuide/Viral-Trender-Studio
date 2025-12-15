import React, { useState, useEffect } from 'react';
    import { generateSmartClips } from '../services/gemini';
    import { VideoAsset, SmartClipResponse, UserTier } from '../types';
    import { Play, Share2, Sparkles, Download, Activity, Lock, CheckCircle } from 'lucide-react';
    import { ExportModal } from './ExportModal';
    
    interface SmartClipsProps {
      videoAsset: VideoAsset;
      userTier: UserTier;
      onUpgrade: () => void;
    }
    
    export const SmartClips: React.FC<SmartClipsProps> = ({ videoAsset, userTier, onUpgrade }) => {
      const [data, setData] = useState<SmartClipResponse | null>(null);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState<string | null>(null);
      
      const [exportModalOpen, setExportModalOpen] = useState(false);
      const [selectedClipTitle, setSelectedClipTitle] = useState('');
      const [exportedClips, setExportedClips] = useState<Set<string>>(new Set());
    
      useEffect(() => {
        const analyze = async () => {
          if (!videoAsset) return;
          setLoading(true);
          setError(null);
          try {
            const result = await generateSmartClips(videoAsset.base64Data, videoAsset.mimeType);
            setData(result);
          } catch (err) {
            setError("Analysis failed. Core dumped.");
          } finally {
            setLoading(false);
          }
        };
        
        if (!data && !loading) {
          analyze();
        }
      }, [videoAsset]);

      const handleExportClick = (title: string) => {
        setSelectedClipTitle(title);
        setExportModalOpen(true);
      };

      const handleExportComplete = () => {
          setExportedClips(prev => new Set(prev).add(selectedClipTitle));
      };

      const parseTime = (timeStr: string) => {
          const parts = timeStr.split(':');
          if (parts.length === 2) {
              return parseInt(parts[0]) * 60 + parseInt(parts[1]);
          }
          return 0;
      };

      const isFree = userTier === UserTier.FREE;
    
      if (loading) {
        return (
          <div className="flex flex-col items-center justify-center h-96 space-y-6">
            <div className="w-24 h-24 border-t-2 border-b-2 border-cyber-orange rounded-full animate-spin relative flex items-center justify-center">
                <div className="w-16 h-16 bg-cyber-orange/10 rounded-full animate-pulse"></div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-cyber text-white tracking-widest">ANALYZING_FEED</h3>
              <p className="text-cyber-orange font-mono text-xs">DETECTING_VIRAL_SIGNATURES...</p>
            </div>
          </div>
        );
      }
    
      if (error) {
        return (
          <div className="p-8 text-center border border-red-500/50 bg-red-900/10 text-red-500 font-mono">
            <p>[SYSTEM_FAILURE]: {error}</p>
            <button 
              onClick={() => setData(null)} 
              className="mt-4 px-6 py-2 border border-red-500 hover:bg-red-500 hover:text-white transition-colors uppercase text-xs tracking-widest"
            >
              Retry_Sequence
            </button>
          </div>
        );
      }
    
      if (!data) return null;
    
      return (
        <div className="space-y-8 animate-fadeIn pb-12">
          <ExportModal 
            isOpen={exportModalOpen}
            onClose={() => setExportModalOpen(false)}
            userTier={userTier}
            onUpgrade={onUpgrade}
            title={`Export: ${selectedClipTitle}`}
            onExportComplete={handleExportComplete}
          />

          <div className="flex items-center justify-between border-b border-cyber-border pb-6">
            <div>
              <h2 className="text-3xl font-cyber font-bold text-white flex items-center gap-3">
                <Sparkles className="text-cyber-orange" /> 
                SMART_CLIPS
              </h2>
              <p className="text-cyber-muted font-mono text-xs mt-2 uppercase tracking-wide">
                Detected {data.clips.length} viral segments
              </p>
            </div>
            <div className="hidden md:block bg-cyber-panel px-4 py-2 border-l-2 border-cyber-orange">
              <span className="text-[10px] text-cyber-muted uppercase block">Source File</span>
              <span className="text-sm font-medium text-white truncate max-w-[200px] block">{videoAsset.file.name}</span>
            </div>
          </div>
    
          {/* Summary Card */}
          <div className="bg-cyber-panel border border-cyber-border p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-cyber-orange/5 rounded-bl-full -mr-10 -mt-10"></div>
            <h3 className="text-xs font-cyber text-cyber-orange uppercase tracking-widest mb-3 flex items-center gap-2">
                <Activity size={14} /> Mission Summary
            </h3>
            <p className="text-cyber-text leading-relaxed font-light">{data.overallSummary}</p>
          </div>
    
          {/* Clips Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.clips.map((clip, index) => {
              const isExported = exportedClips.has(clip.title);
              
              return (
              <div key={index} className="bg-cyber-black border border-cyber-border hover:border-cyber-orange transition-all duration-300 group flex flex-col h-full">
                {/* Visual Representation */}
                <div className="aspect-video bg-black relative overflow-hidden">
                    <video 
                        src={`${videoAsset.previewUrl}#t=${parseTime(clip.startTime)},${parseTime(clip.endTime)}`} 
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                        preload="metadata"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-14 h-14 bg-cyber-orange/90 flex items-center justify-center text-black clip-path-polygon">
                            <Play size={24} fill="currentColor" />
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 bg-cyber-black/80 px-3 py-1 text-[10px] font-mono text-cyber-orange border-b border-l border-cyber-border">
                         {clip.startTime} - {clip.endTime}
                    </div>
                    
                    {/* Virality Score - Gated */}
                    {isFree ? (
                         <div className="absolute bottom-0 left-0 bg-cyber-black/90 px-3 py-1 border-t border-r border-cyber-border flex items-center gap-2">
                            <Lock size={12} className="text-cyber-muted" />
                            <span className="text-[10px] font-mono text-cyber-muted uppercase">SCORE_LOCKED</span>
                         </div>
                    ) : (
                        <div className="absolute bottom-0 left-0 bg-cyber-black/90 px-3 py-1 border-t border-r border-cyber-border flex items-center gap-2">
                             <span className={`text-lg font-cyber font-bold ${
                                 clip.viralityScore >= 80 ? 'text-green-500' : 
                                 clip.viralityScore >= 60 ? 'text-yellow-500' : 'text-cyber-muted'
                             }`}>
                                 {clip.viralityScore}
                             </span>
                             <span className="text-[8px] text-cyber-muted uppercase">Viral<br/>Index</span>
                        </div>
                    )}
                </div>
    
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-white mb-2 font-cyber line-clamp-1 group-hover:text-cyber-orange transition-colors">
                      {clip.title}
                  </h3>
                  <p className="text-xs text-cyber-muted mb-4 line-clamp-2 font-light">
                      {clip.description}
                  </p>
    
                  {/* Reasoning - Gated */}
                  <div className="bg-cyber-panel p-3 border-l-2 border-cyber-border mb-4">
                      {isFree ? (
                          <div className="flex items-center gap-2 cursor-pointer" onClick={onUpgrade}>
                              <Lock size={12} className="text-cyber-muted" />
                              <span className="text-[10px] text-cyber-muted hover:text-white uppercase transition-colors">Unlock viral analysis</span>
                          </div>
                      ) : (
                         <p className="text-[10px] text-cyber-text italic opacity-80">"{clip.reasoning}"</p>
                      )}
                  </div>
    
                  <div className="mt-auto flex gap-3">
                    <button 
                        onClick={() => handleExportClick(clip.title)}
                        className={`flex-1 font-bold py-2 text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                            isExported 
                            ? 'bg-green-500 text-black hover:bg-green-400' 
                            : 'bg-cyber-orange hover:bg-cyber-orangeDim text-black'
                        }`}
                    >
                        {isExported ? (
                            <><CheckCircle size={14} className="animate-bounce" /> Exported</>
                        ) : (
                            <><Download size={14} /> Export</>
                        )}
                    </button>
                    <button className="px-3 border border-cyber-border hover:border-cyber-orange text-cyber-muted hover:text-cyber-orange transition-colors">
                        <Share2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )})}
          </div>
        </div>
      );
    };