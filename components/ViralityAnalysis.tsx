import React, { useState, useEffect } from 'react';
import { VideoAsset, ViralityMetric, UserTier } from '../types';
import { analyzeViralityFactors } from '../services/gemini';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Zap, Cpu, Lock } from 'lucide-react';

interface Props {
  videoAsset: VideoAsset;
  userTier: UserTier;
  onUpgrade: () => void;
}

export const ViralityAnalysis: React.FC<Props> = ({ videoAsset, userTier, onUpgrade }) => {
  const [metrics, setMetrics] = useState<ViralityMetric[]>([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const isLocked = userTier === UserTier.FREE;

  useEffect(() => {
    if (isLocked) return; // Don't run analysis if locked

    const runAudit = async () => {
      setLoading(true);
      try {
        const result = await analyzeViralityFactors(videoAsset.base64Data, videoAsset.mimeType);
        // Normalize for chart
        const chartData = result.metrics.map(m => ({ ...m, fullMark: 100 }));
        setMetrics(chartData);
        setSummary(result.summary);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    runAudit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoAsset, isLocked]);

  if (isLocked) {
      return (
          <div className="h-full flex flex-col items-center justify-center relative overflow-hidden bg-cyber-black border border-cyber-border p-8 text-center space-y-6">
              {/* Background Effect */}
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, #1a1a1a 0, #1a1a1a 10px, #050505 10px, #050505 20px)'
              }}></div>
              
              <div className="relative z-10 bg-cyber-panel p-8 border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.1)] max-w-md mx-auto">
                  <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/50">
                      <Lock size={32} className="text-red-500" />
                  </div>
                  <h2 className="text-2xl font-cyber font-bold text-white mb-2">RESTRICTED_ACCESS</h2>
                  <p className="text-cyber-muted text-sm font-mono mb-8">
                      Virality DNA Analysis requires higher clearance level. 
                      Upgrade to <span className="text-cyber-orange">CREATOR</span> tier to unlock AI-driven metrics.
                  </p>
                  <button 
                      onClick={onUpgrade}
                      className="w-full bg-cyber-orange hover:bg-white hover:text-black text-black font-bold py-3 uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                      <Zap size={16} /> Upgrade Clearance
                  </button>
              </div>
          </div>
      );
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-6">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-cyber-panel rounded-full"></div>
                    <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-cyber-orange rounded-full animate-spin"></div>
                    <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyber-muted" />
                </div>
                <span className="font-cyber text-cyber-orange tracking-widest animate-pulse">AUDITING_CONTENT_DNA...</span>
            </div>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start h-full">
        {/* Chart Section */}
        <div className="bg-cyber-black rounded-none border border-cyber-border p-6 h-[400px] flex flex-col relative overflow-hidden">
             {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-2 h-2 bg-cyber-orange"></div>
            <div className="absolute top-0 right-0 w-2 h-2 bg-cyber-orange"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-cyber-orange"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-cyber-orange"></div>

            <h3 className="text-lg font-cyber font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="text-cyber-orange" size={20} /> VIRALITY_MATRIX
            </h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={metrics}>
                        <PolarGrid stroke="#2a2a2a" />
                        <PolarAngleAxis dataKey="category" tick={{ fill: '#a3a3a3', fontSize: 10, fontFamily: 'Orbitron' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="Score"
                            dataKey="score"
                            stroke="#FF6600"
                            strokeWidth={2}
                            fill="#FF6600"
                            fillOpacity={0.4}
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#050505', borderColor: '#FF6600', color: '#fff', fontFamily: 'monospace' }}
                            itemStyle={{ color: '#FF6600' }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Breakdown Section */}
        <div className="space-y-6">
            <div className="bg-cyber-panel p-6 border-l-2 border-cyber-orange">
                <h3 className="text-sm font-cyber text-cyber-orange mb-2 uppercase tracking-widest">AI Audit Summary</h3>
                <p className="text-cyber-text leading-relaxed text-sm font-light">{summary}</p>
            </div>

            <div className="space-y-3">
                {metrics.map((metric, idx) => (
                    <div key={idx} className="bg-cyber-black p-4 flex items-center justify-between border border-cyber-border hover:border-cyber-orange/50 transition-colors">
                        <span className="text-cyber-muted font-mono text-xs uppercase">{metric.category}</span>
                        <div className="flex items-center gap-4">
                            <div className="w-32 h-1 bg-cyber-panel overflow-hidden">
                                <div 
                                    className={`h-full ${
                                        metric.score > 80 ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 
                                        metric.score > 50 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`} 
                                    style={{ width: `${metric.score}%` }}
                                />
                            </div>
                            <span className="text-white font-cyber font-bold w-8 text-right text-sm">{metric.score}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};