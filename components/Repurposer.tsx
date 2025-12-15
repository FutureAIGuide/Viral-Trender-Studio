import React, { useState } from 'react';
import { generateBlogPost, generateScriptFromBlog } from '../services/gemini';
import { generateSpeech } from '../services/voice';
import { VideoAsset } from '../types';
import ReactMarkdown from 'react-markdown';
import { FileText, ArrowRight, Video, Copy, Check, Terminal, Mic, AlertCircle, RefreshCw } from 'lucide-react';

interface RepurposerProps {
  videoAsset: VideoAsset;
  initialMode?: 'BLOG' | 'SCRIPT';
}

export const Repurposer: React.FC<RepurposerProps> = ({ videoAsset, initialMode = 'BLOG' }) => {
  const [activeMode, setActiveMode] = useState<'BLOG' | 'SCRIPT'>(initialMode);
  
  const [content, setContent] = useState<string>('');
  const [script, setScript] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Audio State
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const handleGenerateBlog = async () => {
    setLoading(true);
    try {
      const text = await generateBlogPost(videoAsset.base64Data, videoAsset.mimeType);
      setContent(text);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateScript = async () => {
    if (!content) return;
    setLoading(true);
    try {
      const text = await generateScriptFromBlog(content);
      setScript(text);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAudio = async () => {
      if (!script) return;
      setGeneratingAudio(true);
      setAudioError(null);
      try {
          // Extract just the dialogue parts (simple heuristic or just pass whole script)
          // For this demo, we pass the first 500 chars to avoid quota limits on trial keys
          const cleanText = script.replace(/\[.*?\]/g, '').substring(0, 500); 
          const url = await generateSpeech(cleanText);
          setAudioUrl(url);
      } catch (e: any) {
          setAudioError(e.message || "Failed to generate audio");
      } finally {
          setGeneratingAudio(false);
      }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col gap-6">
        {/* Mode Switcher Header */}
        <div className="flex items-center justify-between border-b border-cyber-border pb-4">
            <h2 className="text-2xl font-cyber font-bold text-white flex items-center gap-3">
                <RefreshCw className="text-cyber-orange" /> CONTENT_REPURPOSER
            </h2>
            <div className="flex bg-cyber-panel p-1 border border-cyber-border">
                <button 
                    onClick={() => setActiveMode('BLOG')}
                    className={`px-4 py-2 text-xs font-bold uppercase transition-all flex items-center gap-2 ${activeMode === 'BLOG' ? 'bg-cyber-orange text-black' : 'text-cyber-muted hover:text-white'}`}
                >
                    <FileText size={14} /> Blog Post
                </button>
                <button 
                    onClick={() => setActiveMode('SCRIPT')}
                    className={`px-4 py-2 text-xs font-bold uppercase transition-all flex items-center gap-2 ${activeMode === 'SCRIPT' ? 'bg-cyber-orange text-black' : 'text-cyber-muted hover:text-white'}`}
                >
                    <Video size={14} /> Video Script
                </button>
            </div>
        </div>

        {activeMode === 'BLOG' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
                {/* Source Video Side */}
                <div className="flex flex-col gap-6">
                <div className="bg-cyber-black p-1 border border-cyber-border relative group">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-cyber-orange"></div>
                    <video src={videoAsset.previewUrl} controls className="w-full bg-black aspect-video" />
                    <div className="p-4 flex justify-between items-center bg-cyber-panel">
                        <span className="font-cyber text-xs text-cyber-orange">SOURCE_MEDIA</span>
                        <button 
                        onClick={handleGenerateBlog} 
                        disabled={loading}
                        className="bg-cyber-orange hover:bg-cyber-orangeDim text-black px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                        {loading ? <span className="animate-pulse">PROCESSING...</span> : <><FileText size={14}/> GENERATE_POST</>}
                        </button>
                    </div>
                </div>
                
                <div className="bg-cyber-panel/50 p-6 border border-cyber-border flex-1 overflow-y-auto font-mono text-xs">
                    <h4 className="text-cyber-orange mb-4 uppercase tracking-widest border-b border-cyber-border pb-2">[ INSTRUCTIONS ]</h4>
                    <ul className="text-cyber-muted space-y-4">
                        <li className="flex gap-3">
                            <span className="text-cyber-orange">01.</span>
                            <span>AI analysis of audio transcript and visual cues initiated.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-cyber-orange">02.</span>
                            <span>Structure output: Intro, Key Points, SEO Optimization.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-cyber-orange">03.</span>
                            <span>Format: Markdown for CMS compatibility.</span>
                        </li>
                    </ul>
                </div>
                </div>

                {/* Output Side */}
                <div className="bg-cyber-panel border border-cyber-border flex flex-col overflow-hidden relative shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    <div className="bg-cyber-black p-3 border-b border-cyber-border flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Terminal size={14} className="text-cyber-orange" />
                            <span className="font-mono text-xs text-cyber-muted">OUTPUT_STREAM.md</span>
                        </div>
                        {content && (
                            <button onClick={() => copyToClipboard(content)} className="text-cyber-muted hover:text-cyber-orange transition-colors">
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 prose prose-invert prose-headings:text-cyber-orange prose-strong:text-white prose-p:text-cyber-muted max-w-none font-sans">
                        {content ? (
                            <ReactMarkdown>{content}</ReactMarkdown>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-cyber-border">
                                <FileText size={48} className="mb-4 opacity-20" />
                                <p className="font-mono text-xs opacity-50">WAITING_FOR_GENERATION...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        ) : (
            <div className="flex flex-col gap-6 flex-1 min-h-0">
                <div className="flex justify-end gap-4">
                    {/* ElevenLabs Button */}
                    {script && (
                        <button
                            onClick={handleGenerateAudio}
                            disabled={generatingAudio}
                            className="border border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {generatingAudio ? <span className="animate-spin">◐</span> : <Mic size={14} />} 
                            {generatingAudio ? 'SYNTHESIZING...' : 'GENERATE AUDIO (VO)'}
                        </button>
                    )}

                    <button 
                        onClick={handleGenerateScript} 
                        disabled={loading || !content}
                        className="border border-cyber-orange text-cyber-orange hover:bg-cyber-orange hover:text-black px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                        {loading ? 'CONVERTING_DATA...' : 'CONVERT_TO_SCRIPT'}
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
                    <div className="flex flex-col bg-cyber-black border border-cyber-border">
                        <div className="p-3 bg-cyber-panel border-b border-cyber-border">
                            <span className="text-cyber-orange font-mono text-xs">INPUT_BUFFER (BLOG SOURCE)</span>
                        </div>
                        <textarea 
                            className="flex-1 bg-transparent p-4 text-cyber-text resize-none focus:outline-none font-mono text-sm" 
                            placeholder="// Paste blog content here or generate in 'Blog Post' tab..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col items-center justify-center relative">
                        <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-cyber-black border border-cyber-border p-2 rounded-full hidden md:block">
                            <ArrowRight className="text-cyber-orange" size={20} />
                        </div>
                        
                        <div className="w-full h-full flex flex-col bg-cyber-black border border-cyber-border relative">
                            <div className="p-3 bg-cyber-panel border-b border-cyber-border flex justify-between">
                                <span className="text-green-500 font-mono text-xs">OUTPUT_SCRIPT.txt</span>
                                {script && (
                                    <button onClick={() => copyToClipboard(script)} className="text-cyber-muted hover:text-green-500">
                                        {copied ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                )}
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 whitespace-pre-wrap text-cyber-text font-mono text-sm leading-relaxed selection:bg-green-500/30">
                                {script || <span className="text-cyber-border opacity-50 italic">// SCRIPT_OUTPUT_PENDING...</span>}
                            </div>

                            {/* Audio Player Overlay */}
                            {(audioUrl || audioError) && (
                                <div className="absolute bottom-4 left-4 right-4 bg-cyber-panel border border-purple-500 p-4 shadow-lg animate-fadeIn flex items-center gap-4">
                                    {audioError ? (
                                        <div className="text-red-500 text-xs font-bold flex items-center gap-2">
                                            <AlertCircle size={14} /> {audioError}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500">
                                                <Mic size={18} className="text-purple-500" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-white text-xs font-bold mb-1">AI_VOICE_PREVIEW.MP3</h4>
                                                <audio src={audioUrl!} controls className="w-full h-8" />
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};