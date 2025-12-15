import React, { useState } from 'react';
import { UserTier } from '../types';
import { Download, Lock, CheckCircle, AlertTriangle, X, FileVideo, Film, Image, Monitor, Smartphone } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userTier: UserTier;
  onUpgrade: () => void;
  title: string;
  onExportComplete?: () => void;
  aspectRatio?: '16:9' | '9:16' | '1:1';
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, userTier, onUpgrade, title, onExportComplete, aspectRatio = '16:9' }) => {
  const [processing, setProcessing] = useState(false);
  const [complete, setComplete] = useState(false);
  const [format, setFormat] = useState<'MP4' | 'MOV' | 'GIF'>('MP4');

  if (!isOpen) return null;

  const handleExport = (resolution: '720p' | '1080p' | '4k') => {
    setProcessing(true);
    // Simulate export delay
    setTimeout(() => {
      setProcessing(false);
      setComplete(true);
      if (onExportComplete) onExportComplete();
    }, 2000);
  };

  const getDimensions = (res: '720p' | '1080p' | '4k') => {
    if (aspectRatio === '9:16') {
        if (res === '720p') return '720x1280';
        if (res === '1080p') return '1080x1920';
        if (res === '4k') return '2160x3840';
    }
    if (aspectRatio === '1:1') {
        if (res === '720p') return '720x720';
        if (res === '1080p') return '1080x1080';
        if (res === '4k') return '2160x2160';
    }
    // Default 16:9
    if (res === '720p') return '1280x720';
    if (res === '1080p') return '1920x1080';
    if (res === '4k') return '3840x2160';
    return '';
  };

  const isFree = userTier === UserTier.FREE;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-cyber-black border border-cyber-border w-full max-w-md relative shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-cyber-muted hover:text-white transition-colors"
        >
            <X size={20} />
        </button>

        <div className="p-6 border-b border-cyber-border">
            <h3 className="text-xl font-cyber font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Download className="text-cyber-orange" size={24} /> Export Media
            </h3>
            <p className="text-cyber-muted text-xs font-mono mt-1 truncate">{title}</p>
        </div>

        <div className="p-6 space-y-6">
            {complete ? (
                <div className="text-center py-8 space-y-4">
                    <CheckCircle size={64} className="text-green-500 mx-auto animate-bounce" />
                    <h4 className="text-white font-cyber text-lg">EXPORT_COMPLETE</h4>
                    <p className="text-cyber-muted text-sm">File has been downloaded to your local drive.</p>
                    <button 
                        onClick={() => { setComplete(false); onClose(); }}
                        className="bg-cyber-panel border border-cyber-border text-white px-6 py-2 uppercase text-xs font-bold hover:bg-cyber-orange hover:text-black transition-colors"
                    >
                        Close Protocol
                    </button>
                </div>
            ) : processing ? (
                <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 border-4 border-cyber-panel border-t-cyber-orange rounded-full animate-spin mx-auto"></div>
                    <p className="font-cyber text-cyber-orange animate-pulse">RENDERING_STREAM...</p>
                    <p className="text-xs text-cyber-muted font-mono">
                        FORMAT: {format} // RES: {aspectRatio}
                    </p>
                </div>
            ) : (
                <>
                    {/* Format Selection */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-mono text-cyber-muted uppercase">Select Format</label>
                            <span className="text-[10px] font-mono text-cyber-orange border border-cyber-orange/30 px-2 py-0.5 rounded flex items-center gap-1">
                                {aspectRatio === '9:16' ? <Smartphone size={10} /> : <Monitor size={10} />}
                                {aspectRatio} ASPECT
                            </span>
                        </div>
                        <div className="flex bg-cyber-black p-1 border border-cyber-border rounded">
                            {(['MP4', 'MOV', 'GIF'] as const).map((fmt) => (
                                <button
                                    key={fmt}
                                    onClick={() => setFormat(fmt)}
                                    className={`flex-1 py-2 text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                                        format === fmt 
                                        ? 'bg-cyber-panel text-cyber-orange border border-cyber-orange shadow-[0_0_10px_rgba(255,102,0,0.2)]' 
                                        : 'text-cyber-muted hover:text-white'
                                    }`}
                                >
                                    {fmt === 'MP4' && <FileVideo size={14} />}
                                    {fmt === 'MOV' && <Film size={14} />}
                                    {fmt === 'GIF' && <Image size={14} />}
                                    {fmt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Resolution Options */}
                    <div className="space-y-3">
                        {/* 720p Option */}
                        <button 
                            onClick={() => handleExport('720p')}
                            className="w-full bg-cyber-panel border border-cyber-border hover:border-cyber-orange p-4 flex items-center justify-between group transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-cyber-black p-2 rounded text-cyber-muted group-hover:text-cyber-orange text-center min-w-[60px]">
                                    <span className="font-bold font-mono text-xs block">720p</span>
                                </div>
                                <div className="text-left">
                                    <div className="text-white font-bold text-sm">Standard Export</div>
                                    <div className="text-cyber-muted text-[10px] font-mono flex items-center gap-1">
                                        {getDimensions('720p')} {isFree ? <><AlertTriangle size={10} className="text-yellow-500 ml-1"/> WATERMARKED</> : ''}
                                    </div>
                                </div>
                            </div>
                            <Download size={18} className="text-cyber-muted group-hover:text-white" />
                        </button>

                        {/* 1080p Option */}
                        <button 
                            onClick={() => isFree ? onUpgrade() : handleExport('1080p')}
                            className={`w-full border p-4 flex items-center justify-between group transition-all relative overflow-hidden ${
                                isFree 
                                ? 'bg-cyber-black border-cyber-border opacity-75' 
                                : 'bg-cyber-panel border-cyber-border hover:border-purple-500'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded font-bold font-mono text-center min-w-[60px] ${isFree ? 'bg-cyber-panel text-cyber-muted' : 'bg-cyber-black text-purple-500'}`}>
                                    <span className="text-xs block">1080p</span>
                                </div>
                                <div className="text-left">
                                    <div className="text-white font-bold text-sm">HD Export</div>
                                    <div className="text-cyber-muted text-[10px] font-mono">
                                        {getDimensions('1080p')}
                                    </div>
                                </div>
                            </div>
                            {isFree ? <Lock size={18} className="text-cyber-muted" /> : <Download size={18} className="text-purple-500" />}
                            
                            {isFree && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                    <span className="text-xs font-bold text-white uppercase tracking-widest border border-white px-3 py-1">Upgrade to Unlock</span>
                                </div>
                            )}
                        </button>

                         {/* 4K Option */}
                         <button 
                            onClick={() => isFree ? onUpgrade() : handleExport('4k')}
                            className={`w-full border p-4 flex items-center justify-between group transition-all relative overflow-hidden ${
                                isFree 
                                ? 'bg-cyber-black border-cyber-border opacity-50' 
                                : 'bg-cyber-panel border-cyber-border hover:border-cyber-orange'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded font-bold font-mono text-center min-w-[60px] ${isFree ? 'bg-cyber-panel text-cyber-muted' : 'bg-cyber-black text-cyber-orange'}`}>
                                    <span className="text-xs block">4K</span>
                                </div>
                                <div className="text-left">
                                    <div className="text-white font-bold text-sm">Ultra HD Export</div>
                                    <div className="text-cyber-muted text-[10px] font-mono">
                                        {getDimensions('4k')}
                                    </div>
                                </div>
                            </div>
                            {isFree ? <Lock size={18} className="text-cyber-muted" /> : <Download size={18} className="text-cyber-orange" />}
                             {isFree && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                    <span className="text-xs font-bold text-white uppercase tracking-widest border border-white px-3 py-1">Upgrade to Unlock</span>
                                </div>
                            )}
                        </button>
                    </div>
                </>
            )}
        </div>
        
        {isFree && !processing && !complete && (
            <div className="p-4 bg-cyber-panel border-t border-cyber-border text-center">
                <p className="text-[10px] text-cyber-muted mb-2">FREE TIER LIMITS APPLIED</p>
                <button onClick={onUpgrade} className="text-cyber-orange text-xs font-bold hover:underline">
                    UPGRADE PLAN &gt;
                </button>
            </div>
        )}
      </div>
    </div>
  );
};