import React, { useCallback, useState } from 'react';
import { Upload, Film, Zap, Layers, Cpu, Cloud } from 'lucide-react';
import { VideoAsset } from '../types';
import { uploadToStorage, getSupabase } from '../services/supabase';
import { trackEvent } from '../services/analytics';

interface VideoUploaderProps {
  onVideoSelected: (asset: VideoAsset) => void;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({ onVideoSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState<'LOCAL' | 'CLOUD'>('LOCAL');

  // Check if cloud upload is available
  const supabase = getSupabase();

  const processFile = useCallback(async (file: File) => {
    setError(null);
    if (!file.type.startsWith('video/')) {
      setError("INVALID_FILE_TYPE: PLEASE_UPLOAD_VIDEO");
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // Increased limit for cloud
      setError("MEMORY_OVERFLOW: FILE_SIZE_LIMIT_50MB");
      return;
    }

    setLoading(true);
    trackEvent('video_upload_started', { fileSize: file.size, mode: supabase ? 'cloud' : 'local' });

    try {
        let asset: VideoAsset;

        if (supabase) {
            // Cloud Upload Path
            setUploadMode('CLOUD');
            const result = await uploadToStorage(file);
            
            if (!result) throw new Error("Cloud upload failed");

            // For preview, we still read locally to avoid latency, but we store the cloud path
            // In a real app, we might wait for processing or use the publicUrl directly if ready
            const reader = new FileReader();
            reader.readAsDataURL(file);
            await new Promise<void>((resolve) => {
                reader.onload = (e) => {
                    const resultData = e.target?.result as string;
                    asset = {
                        file,
                        previewUrl: result.publicUrl, // Use cloud URL if public, or local blob
                        base64Data: resultData.split(',')[1], // Still need base64 for Gemini for now
                        mimeType: file.type,
                        storagePath: result.path,
                        source: 'CLOUD'
                    };
                    resolve();
                };
            });
        } else {
            // Local Fallback Path
            setUploadMode('LOCAL');
            const reader = new FileReader();
            await new Promise<void>((resolve, reject) => {
                reader.onload = (e) => {
                    const result = e.target?.result as string;
                    const base64Data = result.split(',')[1];
                    asset = {
                        file,
                        previewUrl: URL.createObjectURL(file),
                        base64Data,
                        mimeType: file.type,
                        source: 'LOCAL'
                    };
                    resolve();
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        // @ts-ignore
        onVideoSelected(asset);
        trackEvent('video_upload_completed', { mode: supabase ? 'cloud' : 'local' });

    } catch (err: any) {
        console.error(err);
        setError(`UPLOAD_FAILED: ${err.message || 'UNKNOWN_ERROR'}`);
        trackEvent('video_upload_failed', { error: err.message });
    } finally {
        setLoading(false);
    }
  }, [onVideoSelected, supabase]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col justify-center h-full">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-5xl md:text-6xl font-cyber font-bold text-white uppercase tracking-tighter">
          Unveil the <span className="text-cyber-orange">Secrets</span>
        </h1>
        <p className="text-cyber-muted text-lg font-light tracking-wide max-w-2xl mx-auto border-l-2 border-cyber-orange pl-4 text-left">
          Our system is your gateway to a universe of viral potential. Explore the high-tech repurposing pipeline where humanity and machinery blur.
        </p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative group border border-dashed transition-all duration-300 ease-out h-80 flex items-center justify-center bg-cyber-panel/30 backdrop-blur-sm
          ${isDragging 
            ? 'border-cyber-orange shadow-[0_0_30px_rgba(255,102,0,0.2)]' 
            : 'border-cyber-border hover:border-cyber-orange/50'
          }
        `}
      >
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyber-orange"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyber-orange"></div>
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyber-orange"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyber-orange"></div>

        <input
          type="file"
          accept="video/*"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        <div className="flex flex-col items-center justify-center space-y-6 pointer-events-none">
          {loading ? (
             <div className="flex flex-col items-center gap-4">
                 <div className="w-16 h-16 border-4 border-cyber-border border-t-cyber-orange rounded-full animate-spin"></div>
                 <span className="font-cyber text-cyber-orange animate-pulse">
                     {uploadMode === 'CLOUD' ? 'UPLOADING_TO_CLOUD...' : 'PROCESSING_LOCAL_STREAM...'}
                 </span>
             </div>
          ) : (
            <>
                <div className={`p-6 bg-cyber-black border border-cyber-border group-hover:border-cyber-orange transition-colors duration-300`}>
                    {supabase ? <Cloud size={40} className="text-blue-500 group-hover:text-white transition-colors"/> : <Upload size={40} className="text-white group-hover:text-cyber-orange transition-colors" />}
                </div>
                
                <div className="text-center space-y-1">
                    <h3 className="text-xl font-cyber font-bold text-white tracking-wider">
                    INITIATE UPLOAD
                    </h3>
                    <p className="text-xs text-cyber-muted font-mono">
                    {supabase ? 'CLOUD_STORAGE_ACTIVE // MAX_50MB' : 'LOCAL_MODE // MAX_50MB'}
                    </p>
                </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-900/20 border border-red-500/50 flex items-center space-x-3 text-red-500 font-mono text-sm">
          <span className="text-red-500 font-bold">[ERROR]</span>
          <span>{error}</span>
        </div>
      )}

      {/* Feature Preview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
        {[
          { icon: Film, title: "SMART_CLIPS", desc: "Automated viral segment extraction" },
          { icon: Layers, title: "SOCIAL_ARCHITECT", desc: "Thread & Carousel construction" },
          { icon: Zap, title: "VISUAL_GEN", desc: "AI-driven imagery & prompts" },
        ].map((feature, idx) => (
          <div key={idx} className="p-6 bg-cyber-black border border-cyber-border hover:border-cyber-orange group transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-cyber-orange transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
            <feature.icon className="text-cyber-muted group-hover:text-cyber-orange mb-4 transition-colors" size={24} />
            <h4 className="font-cyber font-bold text-white mb-2">{feature.title}</h4>
            <p className="text-xs text-cyber-muted font-mono">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};