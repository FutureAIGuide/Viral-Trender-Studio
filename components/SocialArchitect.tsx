import React, { useState, useEffect } from 'react';
import { generateSocialThread } from '../services/gemini';
import { VideoAsset, UserTier } from '../types';
import { Share2, Linkedin, Twitter, Copy, Check, MessageSquare, Lock, Zap, Send } from 'lucide-react';

interface Props {
  videoAsset: VideoAsset;
  userTier: UserTier;
  onUpgrade: () => void;
}

export const SocialArchitect: React.FC<Props> = ({ videoAsset, userTier, onUpgrade }) => {
  const [platform, setPlatform] = useState<'TWITTER' | 'LINKEDIN'>('TWITTER');
  const [thread, setThread] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  // Connection State
  const [isConnected, setIsConnected] = useState(false);
  const [postingIndex, setPostingIndex] = useState<number | null>(null);
  const [postedIndices, setPostedIndices] = useState<Set<number>>(new Set());

  const isLocked = userTier === UserTier.FREE;

  useEffect(() => {
      // Check local connection state
      if (platform === 'TWITTER') {
          setIsConnected(localStorage.getItem('TWITTER_CONNECTED') === 'true');
      } else {
          setIsConnected(localStorage.getItem('LINKEDIN_CONNECTED') === 'true');
      }
      setThread([]); // Clear thread on platform switch
      setPostedIndices(new Set());
  }, [platform]);

  const handleGenerate = async () => {
    setLoading(true);
    setThread([]);
    try {
      const result = await generateSocialThread(videoAsset.base64Data, videoAsset.mimeType, platform);
      setThread(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyPost = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const postDirectly = (text: string, index: number) => {
      setPostingIndex(index);
      // Simulate API post
      setTimeout(() => {
          setPostingIndex(null);
          setPostedIndices(prev => new Set(prev).add(index));
          // alert(`Successfully posted to ${platform}`);
      }, 1500);
  };

  if (isLocked) {
    return (
        <div className="h-full flex flex-col items-center justify-center relative overflow-hidden bg-cyber-black border border-cyber-border p-8 text-center space-y-6">
            <div className="relative z-10 bg-cyber-panel p-8 border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.1)] max-w-md mx-auto">
                <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/50">
                    <Lock size={32} className="text-red-500" />
                </div>
                <h2 className="text-2xl font-cyber font-bold text-white mb-2">ACCESS_DENIED</h2>
                <p className="text-cyber-muted text-sm font-mono mb-8">
                    Social Thread Architect is available for <strong>CREATOR</strong> tier and above. 
                    Unlock automated Twitter & LinkedIn generation.
                </p>
                <button 
                    onClick={onUpgrade}
                    className="w-full bg-cyber-orange hover:bg-white hover:text-black text-black font-bold py-3 uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                    <Zap size={16} /> Unlock Feature
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-border pb-6">
        <div>
           <h2 className="text-3xl font-cyber font-bold text-white flex items-center gap-3">
             <Share2 className="text-cyber-orange" /> SOCIAL_ARCHITECT
           </h2>
           <p className="text-cyber-muted font-mono text-xs mt-2 uppercase">Constructing viral narratives for {platform}</p>
        </div>
        
        <div className="flex gap-4">
             <div className="flex bg-cyber-panel p-1 border border-cyber-border">
                <button 
                  onClick={() => setPlatform('TWITTER')}
                  className={`px-4 py-2 flex items-center gap-2 text-xs font-bold uppercase transition-all ${platform === 'TWITTER' ? 'bg-cyber-orange text-black' : 'text-cyber-muted hover:text-white'}`}
                >
                   <Twitter size={14} /> X / Twitter
                </button>
                <button 
                  onClick={() => setPlatform('LINKEDIN')}
                  className={`px-4 py-2 flex items-center gap-2 text-xs font-bold uppercase transition-all ${platform === 'LINKEDIN' ? 'bg-[#0077b5] text-white' : 'text-cyber-muted hover:text-white'}`}
                >
                   <Linkedin size={14} /> LinkedIn
                </button>
             </div>
             
             <button 
                onClick={handleGenerate}
                disabled={loading}
                className="bg-white text-black px-6 py-2 font-bold uppercase tracking-widest hover:bg-cyber-orange transition-colors disabled:opacity-50"
             >
                {loading ? 'ARCHITECTING...' : 'GENERATE'}
             </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-cyber-black border border-cyber-border p-8">
         {/* Connection Status Banner */}
         {isConnected && (
             <div className="mb-6 p-3 bg-green-900/10 border border-green-500/30 flex items-center justify-between">
                 <div className="flex items-center gap-2 text-green-500 text-xs font-mono uppercase">
                     <Check size={12} /> {platform} UPLINK ESTABLISHED
                 </div>
                 <div className="text-[10px] text-cyber-muted">READY_FOR_DIRECT_INJECTION</div>
             </div>
         )}

         {thread.length > 0 ? (
             <div className="max-w-3xl mx-auto space-y-8 relative">
                 {/* Thread connection line */}
                 <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-cyber-border z-0"></div>

                 {thread.map((post, idx) => {
                     const isPosted = postedIndices.has(idx);
                     
                     return (
                     <div key={idx} className="relative z-10 flex gap-6 animate-fadeIn" style={{ animationDelay: `${idx * 100}ms` }}>
                         <div className={`flex-shrink-0 w-12 h-12 rounded-full border flex items-center justify-center font-mono font-bold shadow-[0_0_15px_rgba(0,0,0,0.5)] z-20 ${isPosted ? 'bg-green-500 border-green-500 text-black' : 'bg-cyber-panel border-cyber-border text-cyber-orange'}`}>
                             {isPosted ? <Check size={20} /> : idx + 1}
                         </div>
                         <div className={`flex-1 bg-cyber-panel border p-6 transition-all group ${isPosted ? 'border-green-500/50 opacity-70' : 'border-cyber-border hover:border-cyber-orange'}`}>
                             <p className="text-cyber-text whitespace-pre-wrap leading-relaxed">{post}</p>
                             <div className="mt-4 flex justify-end gap-3">
                                 <button 
                                   onClick={() => copyPost(post, idx)}
                                   className="text-cyber-muted hover:text-white flex items-center gap-2 text-xs uppercase tracking-wider border border-transparent px-3 py-1 hover:border-cyber-muted"
                                 >
                                    {copiedIndex === idx ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                    {copiedIndex === idx ? 'COPIED' : 'COPY'}
                                 </button>
                                 
                                 {isConnected && !isPosted && (
                                     <button
                                        onClick={() => postDirectly(post, idx)}
                                        disabled={postingIndex === idx}
                                        className={`flex items-center gap-2 text-xs font-bold uppercase px-4 py-1 transition-all ${platform === 'TWITTER' ? 'bg-blue-500 hover:bg-blue-400 text-white' : 'bg-blue-700 hover:bg-blue-600 text-white'}`}
                                     >
                                         {postingIndex === idx ? (
                                             <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> POSTING...</>
                                         ) : (
                                             <><Send size={12} /> POST NOW</>
                                         )}
                                     </button>
                                 )}
                             </div>
                         </div>
                     </div>
                 )})}
             </div>
         ) : (
             <div className="h-full flex flex-col items-center justify-center opacity-30">
                 <MessageSquare size={64} className="mb-4 text-cyber-muted" />
                 <p className="font-cyber text-xl text-cyber-muted">NO_DATA_STREAM</p>
                 <p className="font-mono text-xs mt-2">SELECT_PLATFORM_AND_INITIATE_GENERATION</p>
             </div>
         )}
      </div>
    </div>
  );
};