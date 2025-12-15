import React, { useState, useEffect } from 'react';
import { generateVisualPrompts } from '../services/gemini';
import { VideoAsset, ImagePrompt, UserTier } from '../types';
import { Image as ImageIcon, Copy, Check, Aperture, Cpu, Lock, Zap } from 'lucide-react';

interface Props {
  videoAsset: VideoAsset;
  userTier: UserTier;
  onUpgrade: () => void;
}

export const PromptGenerator: React.FC<Props> = ({ videoAsset, userTier, onUpgrade }) => {
  const [prompts, setPrompts] = useState<ImagePrompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const isLocked = userTier === UserTier.FREE;

  useEffect(() => {
    if (isLocked) return;

    const gen = async () => {
      setLoading(true);
      try {
        const result = await generateVisualPrompts(videoAsset.base64Data, videoAsset.mimeType);
        setPrompts(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (prompts.length === 0) gen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoAsset, isLocked]);

  const copyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (isLocked) {
    return (
        <div className="h-full flex flex-col items-center justify-center relative overflow-hidden bg-cyber-black border border-cyber-border p-8 text-center space-y-6">
            <div className="relative z-10 bg-cyber-panel p-8 border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.1)] max-w-md mx-auto">
                <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/50">
                    <Lock size={32} className="text-red-500" />
                </div>
                <h2 className="text-2xl font-cyber font-bold text-white mb-2">SYSTEM_LOCKED</h2>
                <p className="text-cyber-muted text-sm font-mono mb-8">
                    AI Visual Prompt Generation is a <span className="text-cyber-orange">CREATOR</span> feature. 
                    Generate high-end prompts for Midjourney & DALL-E.
                </p>
                <button 
                    onClick={onUpgrade}
                    className="w-full bg-cyber-orange hover:bg-white hover:text-black text-black font-bold py-3 uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                    <Zap size={16} /> Upgrade Now
                </button>
            </div>
        </div>
    );
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="text-center">
                <Aperture className="animate-spin text-cyber-orange mx-auto mb-4" size={48} />
                <h3 className="font-cyber text-white tracking-widest text-lg">IMAGINING_VISUALS...</h3>
                <p className="font-mono text-cyber-muted text-xs mt-2">CRAFTING_MIDJOURNEY_PROMPTS</p>
            </div>
        </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-8">
      <div className="border-b border-cyber-border pb-6">
         <h2 className="text-3xl font-cyber font-bold text-white flex items-center gap-3">
            <ImageIcon className="text-cyber-orange" /> VISUAL_PROMPTS
         </h2>
         <p className="text-cyber-muted font-mono text-xs mt-2">
            AI-generated prompt engineering for thumbnails and cover art.
         </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {prompts.map((item, idx) => (
              <div key={idx} className="bg-cyber-black border border-cyber-border hover:border-cyber-orange transition-all duration-300 flex flex-col group relative overflow-hidden">
                  {/* Neon Top Bar */}
                  <div className={`h-1 w-full ${idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-purple-500' : 'bg-cyber-orange'}`}></div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                          <h3 className="font-cyber font-bold text-white uppercase tracking-wider text-lg">{item.conceptName}</h3>
                          <Cpu size={16} className="text-cyber-muted opacity-50" />
                      </div>
                      
                      <p className="text-xs text-cyber-muted mb-6 italic border-l-2 border-cyber-border pl-3">
                          {item.rationale}
                      </p>

                      <div className="bg-cyber-panel p-4 rounded border border-cyber-border mt-auto relative group-hover:bg-cyber-panel/80 transition-colors">
                          <p className="font-mono text-xs text-cyber-text leading-relaxed break-words">
                              /imagine prompt: {item.prompt} --ar 16:9 --v 6.0
                          </p>
                          <button 
                             onClick={() => copyText(`/imagine prompt: ${item.prompt} --ar 16:9 --v 6.0`, idx)}
                             className="absolute top-2 right-2 p-2 bg-cyber-black border border-cyber-border text-cyber-orange hover:bg-cyber-orange hover:text-black transition-colors"
                          >
                              {copiedIndex === idx ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                      </div>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};