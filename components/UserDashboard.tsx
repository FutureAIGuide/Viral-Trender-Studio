import React, { useState } from 'react';
import { UserTier } from '../types';
import { 
  Layout, 
  Clock, 
  CreditCard, 
  TrendingUp, 
  Folder, 
  Plus, 
  MoreVertical, 
  FileVideo, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Download
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, CartesianGrid } from 'recharts';

interface Props {
  userTier: UserTier;
  onUpgrade: () => void;
  usage: { used: number; limit: number };
  onBuyCredits?: () => void;
}

// Mock Data
const PROJECTS = [
  { id: 1, name: 'Tech Reviews', niche: 'Technology', platform: 'YouTube Shorts', branding: 'Cyberpunk', tone: 'Energetic' },
  { id: 2, name: 'Daily Motivation', niche: 'Self Help', platform: 'TikTok', branding: 'Minimalist', tone: 'Inspiring' },
  { id: 3, name: 'Crypto News', niche: 'Finance', platform: 'Twitter', branding: 'Professional', tone: 'Serious' },
];

const HISTORY = [
  { id: 101, file: 'review_draft_v1.mp4', date: '2023-10-24', type: 'Smart Clips', status: 'COMPLETED' },
  { id: 102, file: 'podcast_ep4.mov', date: '2023-10-22', type: 'Blog Post', status: 'COMPLETED' },
  { id: 103, file: 'intro_sequence.mp4', date: '2023-10-20', type: 'Trailer', status: 'COMPLETED' },
  { id: 104, file: 'stream_vod.mp4', date: '2023-10-18', type: 'Cleanup', status: 'FAILED' },
];

const INVOICES = [
  { id: 'INV-2023-001', date: 'Oct 01, 2023', amount: '$29.00', status: 'PAID' },
  { id: 'INV-2023-002', date: 'Sep 01, 2023', amount: '$29.00', status: 'PAID' },
  { id: 'INV-2023-003', date: 'Aug 01, 2023', amount: '$0.00', status: 'PAID' },
];

const TREND_DATA = [
  { day: 'Mon', viralScore: 45 },
  { day: 'Tue', viralScore: 52 },
  { day: 'Wed', viralScore: 48 },
  { day: 'Thu', viralScore: 70 },
  { day: 'Fri', viralScore: 85 },
  { day: 'Sat', viralScore: 92 },
  { day: 'Sun', viralScore: 65 },
];

export const UserDashboard: React.FC<Props> = ({ userTier, onUpgrade, usage, onBuyCredits }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PROJECTS' | 'HISTORY' | 'BILLING'>('OVERVIEW');

  // Usage Stats Calculation with safeguard
  const usagePercent = usage.limit > 0 ? (usage.used / usage.limit) * 100 : 0;

  const TabButton = ({ id, icon: Icon, label }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
        activeTab === id 
        ? 'border-cyber-orange text-white' 
        : 'border-transparent text-cyber-muted hover:text-white'
      }`}
    >
      <Icon size={16} />
      <span className="font-bold text-xs uppercase tracking-wider">{label}</span>
    </button>
  );

  return (
    <div className="h-full flex flex-col gap-6 animate-fadeIn pb-12">
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-cyber-border pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-cyber-panel to-cyber-black border border-cyber-border rounded-full flex items-center justify-center">
             <span className="font-cyber font-bold text-2xl text-cyber-orange">U</span>
          </div>
          <div>
            <h2 className="text-3xl font-cyber font-bold text-white uppercase tracking-tighter">
              User <span className="text-cyber-muted">Dashboard</span>
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <span className={`px-2 py-0.5 text-[10px] font-bold border rounded uppercase ${
                 userTier === UserTier.AGENCY ? 'border-purple-500 text-purple-500' :
                 userTier === UserTier.CREATOR ? 'border-cyber-orange text-cyber-orange' :
                 'border-cyber-muted text-cyber-muted'
              }`}>
                {userTier} PLAN
              </span>
              <span className="text-cyber-muted text-xs font-mono">Member since 2023</span>
            </div>
          </div>
        </div>
        
        <div className="bg-cyber-panel border border-cyber-border p-4 min-w-[200px]">
           <div className="flex justify-between text-xs font-mono text-cyber-muted mb-2">
              <span>CREDIT_USAGE</span>
              <span className={usagePercent > 80 ? 'text-red-500' : 'text-white'}>{usage.used} / {usage.limit}</span>
           </div>
           <div className="w-full h-1.5 bg-cyber-black rounded-full overflow-hidden">
              <div 
                className={`h-full ${usagePercent > 90 ? 'bg-red-500' : 'bg-cyber-orange'}`} 
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              ></div>
           </div>
           <div className="flex justify-between mt-2">
               {usagePercent >= 80 && (
                 <button onClick={onUpgrade} className="text-[10px] text-cyber-orange hover:underline">Increase Limits &gt;</button>
               )}
               {onBuyCredits && (
                 <button onClick={onBuyCredits} className="text-[10px] text-white font-bold hover:text-cyber-orange transition-colors">
                     + Buy Credits
                 </button>
               )}
           </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-cyber-border overflow-x-auto">
        <TabButton id="OVERVIEW" icon={Layout} label="Overview" />
        <TabButton id="PROJECTS" icon={Folder} label="Projects" />
        <TabButton id="HISTORY" icon={Clock} label="History" />
        <TabButton id="BILLING" icon={CreditCard} label="Billing" />
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Trends Chart */}
             <div className="lg:col-span-2 bg-cyber-black border border-cyber-border p-6 flex flex-col h-80">
                <h3 className="text-sm font-cyber font-bold text-white uppercase mb-6 flex items-center gap-2">
                   <TrendingUp className="text-cyber-orange" size={16} /> Viral Trend Analysis
                </h3>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={TREND_DATA}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF6600" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#FF6600" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                      <XAxis dataKey="day" stroke="#525252" fontSize={10} fontFamily="monospace" />
                      <Tooltip contentStyle={{ backgroundColor: '#050505', borderColor: '#2a2a2a', color: '#fff' }} />
                      <Area type="monotone" dataKey="viralScore" stroke="#FF6600" fillOpacity={1} fill="url(#colorScore)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </div>

             {/* Quick Actions / Recents */}
             <div className="space-y-6">
                <div className="bg-cyber-panel border border-cyber-border p-6">
                   <h3 className="text-sm font-cyber font-bold text-white uppercase mb-4">Quick Actions</h3>
                   <div className="space-y-3">
                      <button onClick={onUpgrade} className="w-full flex items-center justify-between p-3 border border-cyber-border hover:border-cyber-orange hover:bg-cyber-black transition-colors group">
                         <span className="text-xs font-bold text-white">Upgrade Plan</span>
                         <Zap size={14} className="text-cyber-muted group-hover:text-cyber-orange" />
                      </button>
                      <button className="w-full flex items-center justify-between p-3 border border-cyber-border hover:border-cyber-orange hover:bg-cyber-black transition-colors group">
                         <span className="text-xs font-bold text-white">New Project</span>
                         <Plus size={14} className="text-cyber-muted group-hover:text-cyber-orange" />
                      </button>
                   </div>
                </div>

                <div className="bg-cyber-black border border-cyber-border p-6">
                   <h3 className="text-sm font-cyber font-bold text-white uppercase mb-4">Recent Activity</h3>
                   <div className="space-y-4">
                      {HISTORY.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center gap-3 text-xs">
                           <div className={`w-2 h-2 rounded-full ${item.status === 'COMPLETED' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                           <span className="text-white flex-1 truncate">{item.file}</span>
                           <span className="text-cyber-muted font-mono">{item.date}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* PROJECTS TAB */}
        {activeTab === 'PROJECTS' && (
           <div>
              <div className="flex justify-end mb-6">
                 <button className="bg-cyber-orange text-black font-bold px-6 py-2 uppercase text-xs hover:bg-white transition-colors flex items-center gap-2">
                    <Plus size={14} /> Create New Project
                 </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {PROJECTS.map((project) => (
                    <div key={project.id} className="bg-cyber-black border border-cyber-border p-6 hover:border-cyber-orange transition-all group relative">
                       <div className="absolute top-4 right-4 text-cyber-muted group-hover:text-white cursor-pointer">
                          <MoreVertical size={16} />
                       </div>
                       <h3 className="text-lg font-cyber font-bold text-white mb-4">{project.name}</h3>
                       <div className="space-y-3">
                          <div className="flex justify-between text-xs border-b border-cyber-border pb-2">
                             <span className="text-cyber-muted font-mono">NICHE</span>
                             <span className="text-white font-bold">{project.niche}</span>
                          </div>
                          <div className="flex justify-between text-xs border-b border-cyber-border pb-2">
                             <span className="text-cyber-muted font-mono">PLATFORM</span>
                             <span className="text-white font-bold">{project.platform}</span>
                          </div>
                          <div className="flex justify-between text-xs border-b border-cyber-border pb-2">
                             <span className="text-cyber-muted font-mono">TONE</span>
                             <span className="text-white font-bold">{project.tone}</span>
                          </div>
                       </div>
                       <div className="mt-6 pt-4 border-t border-cyber-border/50 flex justify-between items-center">
                          <span className="text-[10px] text-cyber-muted">Last edited: 2 days ago</span>
                          <button className="text-cyber-orange text-xs font-bold hover:underline">OPEN &gt;</button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'HISTORY' && (
           <div className="bg-cyber-black border border-cyber-border overflow-hidden">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-cyber-panel border-b border-cyber-border text-xs text-cyber-muted font-mono uppercase">
                       <th className="p-4 font-normal">File Name</th>
                       <th className="p-4 font-normal">Date</th>
                       <th className="p-4 font-normal">Operation Type</th>
                       <th className="p-4 font-normal">Status</th>
                       <th className="p-4 font-normal text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="text-sm">
                    {HISTORY.map((item) => (
                       <tr key={item.id} className="border-b border-cyber-border hover:bg-cyber-panel/50 transition-colors">
                          <td className="p-4 text-white font-medium flex items-center gap-2">
                             <FileVideo size={14} className="text-cyber-muted" /> {item.file}
                          </td>
                          <td className="p-4 text-cyber-muted font-mono text-xs">{item.date}</td>
                          <td className="p-4 text-white">{item.type}</td>
                          <td className="p-4">
                             <span className={`text-[10px] font-bold uppercase px-2 py-1 border rounded flex items-center gap-1 w-fit ${
                                item.status === 'COMPLETED' ? 'border-green-500 text-green-500 bg-green-500/10' : 'border-red-500 text-red-500 bg-red-500/10'
                             }`}>
                                {item.status === 'COMPLETED' ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                                {item.status}
                             </span>
                          </td>
                          <td className="p-4 text-right">
                             {item.status === 'COMPLETED' && (
                                <button className="text-cyber-muted hover:text-white transition-colors">
                                   <Download size={16} />
                                </button>
                             )}
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        )}

        {/* BILLING TAB */}
        {activeTab === 'BILLING' && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                 <h3 className="text-sm font-cyber font-bold text-white uppercase border-b border-cyber-border pb-4">Invoice History</h3>
                 <div className="bg-cyber-black border border-cyber-border">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-cyber-border text-xs text-cyber-muted font-mono uppercase">
                                <th className="p-4 font-normal">Invoice ID</th>
                                <th className="p-4 font-normal">Date</th>
                                <th className="p-4 font-normal">Amount</th>
                                <th className="p-4 font-normal">Status</th>
                                <th className="p-4 font-normal"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {INVOICES.map((inv) => (
                                <tr key={inv.id} className="border-b border-cyber-border last:border-0 hover:bg-cyber-panel/30">
                                    <td className="p-4 text-white text-xs font-mono">{inv.id}</td>
                                    <td className="p-4 text-cyber-muted text-xs">{inv.date}</td>
                                    <td className="p-4 text-white font-bold text-sm">{inv.amount}</td>
                                    <td className="p-4"><span className="text-green-500 text-[10px] font-bold uppercase border border-green-500 px-2 py-0.5 rounded">{inv.status}</span></td>
                                    <td className="p-4 text-right"><Download size={14} className="text-cyber-muted cursor-pointer hover:text-white" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
              </div>

              <div className="space-y-6">
                 <h3 className="text-sm font-cyber font-bold text-white uppercase border-b border-cyber-border pb-4">Current Subscription</h3>
                 <div className="bg-cyber-panel border-2 border-cyber-orange p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-cyber-orange text-black text-[10px] font-bold px-3 py-1 uppercase">Active</div>
                    <h4 className="text-2xl font-cyber font-bold text-white mb-1 uppercase">{userTier}</h4>
                    <p className="text-xs text-cyber-muted font-mono mb-6">Renews on Nov 01, 2023</p>
                    
                    <ul className="space-y-2 mb-8">
                        <li className="text-xs text-white flex items-center gap-2"><CheckCircle size={12} className="text-cyber-orange"/> All AI Features</li>
                        <li className="text-xs text-white flex items-center gap-2"><CheckCircle size={12} className="text-cyber-orange"/> 4K Export</li>
                        <li className="text-xs text-white flex items-center gap-2"><CheckCircle size={12} className="text-cyber-orange"/> Priority Support</li>
                    </ul>

                    <div className="space-y-3">
                        <button onClick={onUpgrade} className="w-full bg-cyber-orange text-black font-bold text-xs uppercase py-3 hover:bg-white transition-colors">
                            Change Plan
                        </button>
                        <button className="w-full border border-cyber-border text-cyber-muted font-bold text-xs uppercase py-3 hover:text-white hover:border-white transition-colors">
                            Cancel Subscription
                        </button>
                    </div>
                 </div>
              </div>
           </div>
        )}

      </div>
    </div>
  );
};