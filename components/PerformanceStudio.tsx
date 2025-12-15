import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, 
  Youtube, 
  Music2, 
  Smartphone, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  Target, 
  BarChart2, 
  AlertCircle,
  CheckCircle,
  Eye,
  ThumbsUp,
  Share2,
  Clock,
  Compass,
  Hash,
  Lightbulb,
  Zap,
  Link as LinkIcon,
  DownloadCloud
} from 'lucide-react';
import { generateTrendAnalysis } from '../services/gemini';

type Platform = 'YOUTUBE' | 'TIKTOK' | 'SHORTS';

const MOCK_PREDICTION = 78; // Simulated previous AI prediction score

// Mock Trends Data
const MOCK_TRENDS = {
    YOUTUBE: [
        { id: '1', name: 'The "100 Hours" Challenge', volume: '2.4M', growth: 125, category: 'Entertainment', description: 'Creators spending 100 hours learning a skill or surviving in a game.' },
        { id: '2', name: 'AI Workflow Tutorials', volume: '850K', growth: 85, category: 'Tech', description: 'Deep dives into using multiple AI tools to automate complex tasks.' },
        { id: '3', name: 'Video Essays on Nostalgia', volume: '1.2M', growth: 40, category: 'Commentary', description: 'Long-form analysis of 2000s media and culture.' },
        { id: '4', name: 'Silent Vlogs / ASMR', volume: '3.1M', growth: 15, category: 'Lifestyle', description: 'High-production value day-in-the-life videos with no talking, just ambient sound.' },
        { id: '5', name: 'Extreme Budget Travel', volume: '900K', growth: 60, category: 'Travel', description: 'Traveling to expensive places with $0 budget.' },
    ],
    TIKTOK: [
        { id: '1', name: '#TubeGirl Effect', volume: '1B+', growth: 300, category: 'Lifestyle', description: 'Confidence-based trend filming yourself on public transport with wind effects.' },
        { id: '2', name: 'Corporate Horror Skits', volume: '500M', growth: 150, category: 'Comedy', description: 'Surreal, dystopian takes on 9-5 office culture and jargon.' },
        { id: '3', name: 'De-influencing', volume: '750M', growth: 45, category: 'Beauty/Tech', description: 'Honest reviews telling people what NOT to buy.' },
        { id: '4', name: 'Wes Anderson Style', volume: '400M', growth: 20, category: 'Art', description: 'Symmetrical composition, pastel colors, and quirky movement.' },
        { id: '5', name: 'Glitch Core Transitions', volume: '200M', growth: 90, category: 'Editing', description: 'Fast-paced editing synchronized to phonk music.' },
    ],
    SHORTS: [
        { id: '1', name: 'Minecraft Parkour Facts', volume: '5B+', growth: 20, category: 'Gaming', description: 'Split screen with gameplay below and rapid-fire facts above.' },
        { id: '2', name: 'Street Interviews / Trivia', volume: '2B', growth: 50, category: 'Entertainment', description: 'Asking strangers simple questions for cash prizes.' },
        { id: '3', name: 'Satisfying Cleaning', volume: '800M', growth: 35, category: 'Satisfying', description: 'Pressure washing or rug cleaning time-lapses.' },
        { id: '4', name: '"Did You Know?" Movie Facts', volume: '1.5B', growth: 65, category: 'Film', description: 'Hidden easter eggs in popular movies.' },
        { id: '5', name: 'Hydraulic Press vs Thing', volume: '3B', growth: 10, category: 'Science', description: 'Crushing varied objects.' },
    ]
};

export const PerformanceStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'EVALUATION' | 'TRENDS'>('EVALUATION');
  const [platform, setPlatform] = useState<Platform>('YOUTUBE');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  // URL Import State
  const [importMode, setImportMode] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);

  // Trend Explorer State
  const [selectedTrend, setSelectedTrend] = useState<any | null>(null);
  const [userNiche, setUserNiche] = useState('');
  const [trendAnalysis, setTrendAnalysis] = useState<any | null>(null);
  const [analyzingTrend, setAnalyzingTrend] = useState(false);

  // Input State for Evaluation
  const [inputs, setInputs] = useState({
    views: 0,
    likes: 0,
    shares: 0,
    retention: 0, // %
    ctr: 0, // % (Click Through Rate)
    avd: 0, // (Average View Duration in seconds)
    swipedAway: 0 // % (For Shorts/TikTok)
  });

  const handleUrlFetch = () => {
      if(!importUrl) return;
      setIsFetchingUrl(true);
      
      // Simulate API call to fetch metrics
      setTimeout(() => {
          let detectedPlatform: Platform = 'YOUTUBE';
          if (importUrl.includes('tiktok.com')) detectedPlatform = 'TIKTOK';
          else if (importUrl.includes('shorts')) detectedPlatform = 'SHORTS';
          
          setPlatform(detectedPlatform);
          
          // Generate realistic mock data
          const baseViews = Math.floor(Math.random() * 50000) + 1000;
          setInputs({
              views: baseViews,
              likes: Math.floor(baseViews * (Math.random() * 0.1 + 0.02)), // 2-12%
              shares: Math.floor(baseViews * 0.01),
              retention: Math.floor(Math.random() * 60) + 20, // 20-80%
              ctr: Math.floor(Math.random() * 15) + 2, // 2-17%
              avd: Math.floor(Math.random() * 300) + 30,
              swipedAway: Math.floor(Math.random() * 40) + 10 
          });
          
          setIsFetchingUrl(false);
          setImportMode(false); // Switch back to view the populated data
      }, 1500);
  };

  const handleAnalyze = () => {
    setAnalyzing(true);
    // Simulate complex calculation
    setTimeout(() => {
      const score = calculatePerformanceScore(platform, inputs);
      setResult({
        score,
        delta: score - MOCK_PREDICTION,
        insight: generateInsight(score, MOCK_PREDICTION, platform, inputs),
        chartData: [
            { subject: 'Views', A: normalize(inputs.views, 10000), B: MOCK_PREDICTION, fullMark: 100 },
            { subject: 'Engagement', A: normalize(inputs.likes + inputs.shares, 1000), B: MOCK_PREDICTION, fullMark: 100 },
            { subject: 'Retention', A: inputs.retention, B: MOCK_PREDICTION, fullMark: 100 },
            { subject: 'CTR/Hook', A: platform === 'YOUTUBE' ? inputs.ctr * 10 : (100 - inputs.swipedAway), B: MOCK_PREDICTION, fullMark: 100 },
        ]
      });
      setAnalyzing(false);
    }, 1500);
  };

  const handleTrendAnalysis = async () => {
      if (!selectedTrend || !userNiche) return;
      setAnalyzingTrend(true);
      setTrendAnalysis(null);
      try {
          const analysis = await generateTrendAnalysis(selectedTrend.name, platform, userNiche);
          setTrendAnalysis(analysis);
      } catch (e) {
          console.error(e);
      } finally {
          setAnalyzingTrend(false);
      }
  };

  const normalize = (val: number, max: number) => Math.min(100, (val / max) * 100);

  const calculatePerformanceScore = (plat: Platform, metrics: typeof inputs) => {
      // Simplified weighted algorithm
      let score = 0;
      if (plat === 'YOUTUBE') {
          score = (normalize(metrics.views, 5000) * 0.3) + 
                  (normalize(metrics.likes, 500) * 0.2) + 
                  (metrics.retention * 0.3) + 
                  (metrics.ctr * 5 * 0.2); // CTR 20% is amazing, so *5
      } else {
          // TikTok / Shorts
          score = (normalize(metrics.views, 10000) * 0.3) + 
                  (normalize(metrics.likes, 2000) * 0.2) + 
                  (metrics.retention * 0.2) + 
                  ((100 - metrics.swipedAway) * 0.3);
      }
      return Math.round(Math.min(100, Math.max(0, score)));
  };

  const generateInsight = (actual: number, predicted: number, plat: Platform, metrics: typeof inputs) => {
      const diff = actual - predicted;
      if (diff > 10) return { type: 'SUCCESS', text: `Outstanding performance! Your content outperformed the AI prediction by ${diff} points. The ${plat === 'YOUTUBE' ? 'CTR' : 'Hook rate'} suggests the thumbnail/intro was exceptionally strong.` };
      if (diff < -10) return { type: 'WARN', text: `Underperformed by ${Math.abs(diff)} points. While the AI predicted high potential, the ${metrics.retention < 30 ? 'retention rate' : 'engagement metrics'} fell short. Consider shortening the intro.` };
      return { type: 'NEUTRAL', text: "Performance aligned with AI predictions. The content performed exactly as expected based on the virality audit." };
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-fadeIn pb-12">
        {/* Header */}
        <div className="border-b border-cyber-border pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h2 className="text-3xl font-cyber font-bold text-white flex items-center gap-3">
                    <TrendingUp className="text-cyber-orange" /> PERFORMANCE_STUDIO
                </h2>
                <p className="text-cyber-muted font-mono text-xs mt-2 uppercase">
                    DATA_INTELLIGENCE // TREND_FORECASTING
                </p>
            </div>
            
            <div className="flex bg-cyber-black border border-cyber-border p-1">
                <button 
                    onClick={() => setActiveTab('EVALUATION')}
                    className={`px-6 py-2 text-xs font-bold uppercase transition-all flex items-center gap-2 ${activeTab === 'EVALUATION' ? 'bg-cyber-panel text-white' : 'text-cyber-muted hover:text-white'}`}
                >
                    <Activity size={14} /> Evaluation
                </button>
                <button 
                    onClick={() => setActiveTab('TRENDS')}
                    className={`px-6 py-2 text-xs font-bold uppercase transition-all flex items-center gap-2 ${activeTab === 'TRENDS' ? 'bg-cyber-panel text-white' : 'text-cyber-muted hover:text-white'}`}
                >
                    <Compass size={14} /> Trend Explorer
                </button>
            </div>
        </div>

        {/* --- EVALUATION TAB --- */}
        {activeTab === 'EVALUATION' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0 animate-fadeIn">
                {/* Platform Toggle */}
                <div className="lg:col-span-3 flex justify-end">
                    <div className="flex bg-cyber-black border border-cyber-border p-1">
                        {[
                            { id: 'YOUTUBE', icon: Youtube, label: 'YouTube' },
                            { id: 'TIKTOK', icon: Music2, label: 'TikTok' },
                            { id: 'SHORTS', icon: Smartphone, label: 'Shorts' }
                        ].map((p) => (
                            <button
                                key={p.id}
                                onClick={() => { setPlatform(p.id as Platform); setResult(null); }}
                                className={`flex items-center gap-2 px-6 py-2 text-xs font-bold uppercase transition-all ${
                                    platform === p.id 
                                    ? 'bg-cyber-panel text-cyber-orange border border-cyber-orange shadow-[0_0_15px_rgba(255,102,0,0.2)]' 
                                    : 'text-cyber-muted hover:text-white'
                                }`}
                            >
                                <p.icon size={14} /> {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Left: Input Panel */}
                <div className="bg-cyber-black border border-cyber-border p-6 flex flex-col gap-6 h-fit">
                    <div className="flex items-center justify-between border-b border-cyber-border pb-4">
                        <div className="flex items-center gap-2">
                            <Activity size={16} className="text-cyber-muted" />
                            <h3 className="font-cyber font-bold text-white uppercase">Metrics</h3>
                        </div>
                        
                        {/* Input Mode Toggle */}
                        <div className="flex bg-cyber-panel border border-cyber-border p-0.5">
                            <button 
                                onClick={() => setImportMode(false)}
                                className={`px-2 py-1 text-[10px] font-bold uppercase ${!importMode ? 'bg-cyber-orange text-black' : 'text-cyber-muted hover:text-white'}`}
                            >
                                Manual
                            </button>
                            <button 
                                onClick={() => setImportMode(true)}
                                className={`px-2 py-1 text-[10px] font-bold uppercase flex items-center gap-1 ${importMode ? 'bg-cyber-orange text-black' : 'text-cyber-muted hover:text-white'}`}
                            >
                                <LinkIcon size={10} /> URL
                            </button>
                        </div>
                    </div>

                    {importMode ? (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="bg-cyber-panel p-4 border border-cyber-border/50">
                                <p className="text-[10px] text-cyber-muted mb-4 leading-relaxed">
                                    Provide a public link to your published video. Our system will attempt to retrieve engagement statistics automatically.
                                </p>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono text-cyber-orange uppercase">Post URL</label>
                                    <input 
                                        type="text" 
                                        value={importUrl}
                                        onChange={(e) => setImportUrl(e.target.value)}
                                        placeholder="https://youtube.com/watch?v=..."
                                        className="w-full bg-cyber-black border border-cyber-border text-white px-3 py-2 text-sm font-mono focus:border-cyber-orange outline-none"
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={handleUrlFetch}
                                disabled={isFetchingUrl || !importUrl}
                                className="w-full bg-white text-black font-bold uppercase py-3 tracking-widest hover:bg-cyber-orange transition-colors flex items-center justify-center gap-2"
                            >
                                {isFetchingUrl ? (
                                    <>Fetching Data <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div></>
                                ) : (
                                    <>Retrieve Metrics <DownloadCloud size={16} /></>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-cyber-muted uppercase flex items-center gap-1"><Eye size={10}/> Views</label>
                                    <input 
                                        type="number" 
                                        value={inputs.views} 
                                        onChange={(e) => setInputs({...inputs, views: Number(e.target.value)})}
                                        className="w-full bg-cyber-panel border border-cyber-border text-white px-3 py-2 text-sm font-mono focus:border-cyber-orange outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-cyber-muted uppercase flex items-center gap-1"><ThumbsUp size={10}/> Likes</label>
                                    <input 
                                        type="number" 
                                        value={inputs.likes} 
                                        onChange={(e) => setInputs({...inputs, likes: Number(e.target.value)})}
                                        className="w-full bg-cyber-panel border border-cyber-border text-white px-3 py-2 text-sm font-mono focus:border-cyber-orange outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-cyber-muted uppercase flex items-center gap-1"><Share2 size={10}/> Shares</label>
                                    <input 
                                        type="number" 
                                        value={inputs.shares} 
                                        onChange={(e) => setInputs({...inputs, shares: Number(e.target.value)})}
                                        className="w-full bg-cyber-panel border border-cyber-border text-white px-3 py-2 text-sm font-mono focus:border-cyber-orange outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-cyber-muted uppercase flex items-center gap-1"><Clock size={10}/> Retention (%)</label>
                                    <input 
                                        type="number" 
                                        max="100"
                                        value={inputs.retention} 
                                        onChange={(e) => setInputs({...inputs, retention: Number(e.target.value)})}
                                        className="w-full bg-cyber-panel border border-cyber-border text-white px-3 py-2 text-sm font-mono focus:border-cyber-orange outline-none"
                                    />
                                </div>
                            </div>

                            {/* Platform Specific Inputs */}
                            {platform === 'YOUTUBE' ? (
                                <div className="grid grid-cols-2 gap-4 border-t border-cyber-border pt-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-mono text-cyber-orange uppercase">CTR (%)</label>
                                        <input 
                                            type="number" 
                                            max="100"
                                            value={inputs.ctr} 
                                            onChange={(e) => setInputs({...inputs, ctr: Number(e.target.value)})}
                                            className="w-full bg-cyber-panel border border-cyber-border text-white px-3 py-2 text-sm font-mono focus:border-cyber-orange outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-mono text-cyber-orange uppercase">Avg. View Dur (s)</label>
                                        <input 
                                            type="number" 
                                            value={inputs.avd} 
                                            onChange={(e) => setInputs({...inputs, avd: Number(e.target.value)})}
                                            className="w-full bg-cyber-panel border border-cyber-border text-white px-3 py-2 text-sm font-mono focus:border-cyber-orange outline-none"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="border-t border-cyber-border pt-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-mono text-cyber-orange uppercase">Swiped Away (%)</label>
                                        <input 
                                            type="number" 
                                            max="100"
                                            value={inputs.swipedAway} 
                                            onChange={(e) => setInputs({...inputs, swipedAway: Number(e.target.value)})}
                                            className="w-full bg-cyber-panel border border-cyber-border text-white px-3 py-2 text-sm font-mono focus:border-cyber-orange outline-none"
                                        />
                                    </div>
                                </div>
                            )}

                            <button 
                                onClick={handleAnalyze}
                                disabled={analyzing}
                                className="mt-4 w-full bg-white text-black font-bold uppercase py-3 tracking-widest hover:bg-cyber-orange transition-colors flex items-center justify-center gap-2"
                            >
                                {analyzing ? (
                                    <>Processing <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div></>
                                ) : (
                                    <>Evaluate Performance <BarChart2 size={16} /></>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Right: Results Panel */}
                <div className="lg:col-span-2 space-y-6">
                    {result ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Score Cards */}
                                <div className="bg-cyber-black border border-cyber-border p-6 flex flex-col justify-between relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Target size={100} />
                                    </div>
                                    <h4 className="text-cyber-muted text-xs font-mono uppercase tracking-widest mb-4">Predicted Virality</h4>
                                    <div className="flex items-end gap-2">
                                        <span className="text-5xl font-cyber font-bold text-cyber-muted">{MOCK_PREDICTION}</span>
                                        <span className="text-sm font-mono text-cyber-muted mb-2">/100</span>
                                    </div>
                                    <div className="w-full h-1 bg-cyber-panel mt-4">
                                        <div className="h-full bg-cyber-muted" style={{width: `${MOCK_PREDICTION}%`}}></div>
                                    </div>
                                </div>

                                <div className={`bg-cyber-black border-2 p-6 flex flex-col justify-between relative overflow-hidden ${result.delta >= 0 ? 'border-green-500' : 'border-red-500'}`}>
                                    <div className={`absolute top-0 right-0 p-4 opacity-10 pointer-events-none`}>
                                        {result.delta >= 0 ? <ArrowUpRight size={100} className="text-green-500" /> : <ArrowDownRight size={100} className="text-red-500" />}
                                    </div>
                                    <h4 className={`text-xs font-mono uppercase tracking-widest mb-4 ${result.delta >= 0 ? 'text-green-500' : 'text-red-500'}`}>Actual Performance</h4>
                                    <div className="flex items-end gap-2">
                                        <span className={`text-5xl font-cyber font-bold ${result.delta >= 0 ? 'text-green-500' : 'text-red-500'}`}>{result.score}</span>
                                        <span className="text-sm font-mono text-cyber-muted mb-2">/100</span>
                                    </div>
                                    <div className="w-full h-1 bg-cyber-panel mt-4">
                                        <div className={`h-full ${result.delta >= 0 ? 'bg-green-500' : 'bg-red-500'}`} style={{width: `${result.score}%`}}></div>
                                    </div>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="bg-cyber-black border border-cyber-border p-6 h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={result.chartData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" horizontal={false} />
                                        <XAxis type="number" domain={[0, 100]} stroke="#525252" fontSize={10} fontFamily="monospace" />
                                        <YAxis dataKey="subject" type="category" stroke="#fff" fontSize={10} fontFamily="Orbitron" width={80} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#050505', borderColor: '#2a2a2a', color: '#fff' }}
                                            cursor={{fill: '#1a1a1a'}}
                                        />
                                        <Legend />
                                        <Bar dataKey="A" name="Actual" fill={result.delta >= 0 ? '#22c55e' : '#ef4444'} barSize={20} />
                                        <Bar dataKey="B" name="Predicted" fill="#737373" barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Insight Block */}
                            <div className={`p-6 border-l-4 ${result.insight.type === 'SUCCESS' ? 'bg-green-900/10 border-green-500' : result.insight.type === 'WARN' ? 'bg-red-900/10 border-red-500' : 'bg-cyber-panel border-cyber-muted'}`}>
                                <h4 className={`text-sm font-bold uppercase mb-2 flex items-center gap-2 ${result.insight.type === 'SUCCESS' ? 'text-green-500' : result.insight.type === 'WARN' ? 'text-red-500' : 'text-cyber-muted'}`}>
                                    {result.insight.type === 'SUCCESS' ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
                                    AI Analysis
                                </h4>
                                <p className="text-sm text-cyber-text leading-relaxed">
                                    {result.insight.text}
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center border border-cyber-border border-dashed bg-cyber-panel/20 p-12 text-center space-y-4">
                            <BarChart2 size={64} className="text-cyber-muted opacity-50" />
                            <h3 className="text-xl font-cyber text-white">READY_TO_EVALUATE</h3>
                            <p className="text-cyber-muted text-sm max-w-sm">
                                Input your content's post-launch metrics on the left to generate a comparative analysis against our AI predictions.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* --- TRENDS TAB --- */}
        {activeTab === 'TRENDS' && (
            <div className="flex flex-col h-full animate-fadeIn">
                {/* Filters */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex bg-cyber-black border border-cyber-border p-1">
                        {[
                            { id: 'YOUTUBE', icon: Youtube, label: 'YouTube' },
                            { id: 'TIKTOK', icon: Music2, label: 'TikTok' },
                            { id: 'SHORTS', icon: Smartphone, label: 'Shorts' }
                        ].map((p) => (
                            <button
                                key={p.id}
                                onClick={() => { setPlatform(p.id as Platform); setSelectedTrend(null); setTrendAnalysis(null); }}
                                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase transition-all ${
                                    platform === p.id 
                                    ? 'bg-cyber-orange text-black' 
                                    : 'text-cyber-muted hover:text-white'
                                }`}
                            >
                                <p.icon size={14} /> {p.label}
                            </button>
                        ))}
                    </div>
                    <div className="text-xs text-cyber-muted font-mono flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        LIVE_FEED_ACTIVE
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
                    {/* Left: Trend Feed */}
                    <div className="flex flex-col gap-4 overflow-y-auto">
                        {MOCK_TRENDS[platform].map((trend, idx) => (
                            <div 
                                key={trend.id}
                                onClick={() => { setSelectedTrend(trend); setTrendAnalysis(null); }}
                                className={`p-4 border border-cyber-border cursor-pointer transition-all group ${
                                    selectedTrend?.id === trend.id 
                                    ? 'bg-cyber-panel border-cyber-orange' 
                                    : 'bg-cyber-black hover:border-white'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-lg font-cyber font-bold ${selectedTrend?.id === trend.id ? 'text-cyber-orange' : 'text-cyber-muted'}`}>#{idx + 1}</span>
                                        <h4 className="text-white font-bold text-sm">{trend.name}</h4>
                                    </div>
                                    <span className="text-[10px] bg-green-900/30 text-green-500 px-2 py-1 border border-green-500/30 flex items-center gap-1">
                                        <ArrowUpRight size={10} /> {trend.growth}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-cyber-muted">
                                    <span className="bg-cyber-black px-2 py-1 border border-cyber-border rounded">{trend.category}</span>
                                    <span className="font-mono">{trend.volume} Views</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right: Trend Explainer & Opportunities */}
                    <div className="bg-cyber-black border border-cyber-border p-6 flex flex-col h-full relative overflow-hidden">
                        {selectedTrend ? (
                            <div className="flex flex-col h-full animate-fadeIn">
                                {/* Header */}
                                <div className="border-b border-cyber-border pb-4 mb-4">
                                    <h3 className="text-2xl font-cyber font-bold text-white mb-2">{selectedTrend.name}</h3>
                                    <p className="text-cyber-muted text-sm leading-relaxed">{selectedTrend.description}</p>
                                </div>

                                {/* Deep Dive Analysis */}
                                <div className="flex-1 space-y-6 overflow-y-auto">
                                    {/* Trend Explainer */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-cyber text-cyber-orange uppercase tracking-widest flex items-center gap-2">
                                            <Lightbulb size={14} /> Trend Explainer
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-cyber-panel p-4 border-l-2 border-blue-500">
                                                <span className="text-[10px] text-blue-500 font-bold uppercase block mb-1">The Mechanism</span>
                                                <p className="text-xs text-cyber-text leading-relaxed">
                                                    {trendAnalysis ? trendAnalysis.mechanism : "Select 'Analyze Opportunity' to generate deep dive."}
                                                </p>
                                            </div>
                                            <div className="bg-cyber-panel p-4 border-l-2 border-purple-500">
                                                <span className="text-[10px] text-purple-500 font-bold uppercase block mb-1">The Psychology</span>
                                                <p className="text-xs text-cyber-text leading-relaxed">
                                                    {trendAnalysis ? trendAnalysis.psychology : "Select 'Analyze Opportunity' to generate deep dive."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Opportunity Generator */}
                                    <div className="bg-cyber-panel border border-cyber-border p-6 mt-4">
                                        <div className="flex items-end gap-2 mb-4">
                                            <div className="flex-1">
                                                <label className="text-[10px] font-mono text-cyber-muted uppercase block mb-2">Your Niche</label>
                                                <input 
                                                    type="text" 
                                                    value={userNiche}
                                                    onChange={(e) => setUserNiche(e.target.value)}
                                                    placeholder="e.g. Cooking, Coding, Fitness..."
                                                    className="w-full bg-cyber-black border border-cyber-border text-white px-4 py-2 text-sm focus:border-cyber-orange outline-none"
                                                />
                                            </div>
                                            <button 
                                                onClick={handleTrendAnalysis}
                                                disabled={!userNiche || analyzingTrend}
                                                className="bg-white text-black font-bold uppercase px-4 py-2 text-xs hover:bg-cyber-orange transition-colors disabled:opacity-50 h-9 flex items-center gap-2"
                                            >
                                                {analyzingTrend ? <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <Zap size={14} />} 
                                                Analyze Opportunity
                                            </button>
                                        </div>

                                        {trendAnalysis && (
                                            <div className="space-y-3 animate-fadeIn">
                                                <h5 className="text-xs font-bold text-white uppercase flex items-center gap-2 mb-3">
                                                    <Target size={14} className="text-green-500" /> Tailored Concepts
                                                </h5>
                                                {trendAnalysis.opportunities.map((idea: string, i: number) => (
                                                    <div key={i} className="flex gap-3 text-sm text-cyber-text">
                                                        <span className="text-cyber-orange font-mono">0{i+1}.</span>
                                                        <p className="leading-relaxed">{idea}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                                <Hash size={64} className="text-cyber-muted mb-4" />
                                <p className="font-cyber text-lg text-white">SELECT_TREND_DATA_POINT</p>
                                <p className="font-mono text-xs mt-2">Initialize analysis sequence</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};