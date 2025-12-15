import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  Activity, 
  HardDrive, 
  Search, 
  ShieldAlert, 
  Ban, 
  Eye, 
  Clock,
  LogOut,
  User,
  Cpu,
  Settings,
  Database,
  BarChart3,
  Save,
  CheckCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from 'recharts';
import { UserTier, SystemLog, AppStats } from '../types';
import { initSupabase } from '../services/supabase';
import { initAnalytics } from '../services/analytics';

// Hardcoded Mock Data for Charts (Still necessary for visual impact)
const TRAFFIC_DATA = [
  { name: '00:00', users: 120, load: 24 },
  { name: '04:00', users: 80, load: 15 },
  { name: '08:00', users: 450, load: 55 },
  { name: '12:00', users: 980, load: 88 },
  { name: '16:00', users: 850, load: 72 },
  { name: '20:00', users: 600, load: 45 },
  { name: '23:59', users: 300, load: 30 },
];

const REVENUE_DATA = [
    { name: 'Mon', rev: 4000 },
    { name: 'Tue', rev: 3000 },
    { name: 'Wed', rev: 5500 },
    { name: 'Thu', rev: 4800 },
    { name: 'Fri', rev: 9200 },
    { name: 'Sat', rev: 8100 },
    { name: 'Sun', rev: 7400 },
];

// Mock Users for flavor, but we will prepend the Real User
const MOCK_USERS_BASE = [
  { id: 'USR_001', name: 'Sarah Connor', email: 'sarah@resistance.net', tier: 'AGENCY', status: 'ACTIVE', spent: '$1,290' },
  { id: 'USR_003', name: 'Roy Batty', email: 'nexus6@tyrell.corp', tier: 'CREATOR', status: 'SUSPENDED', spent: '$58' },
  { id: 'USR_004', name: 'Motoko Kusanagi', email: 'major@section9.gov', tier: 'AGENCY', status: 'ACTIVE', spent: '$2,400' },
];

interface AdminDashboardProps {
    onLogout: () => void;
    userTier: UserTier;
    logs: SystemLog[];
    stats: AppStats;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, userTier, logs, stats }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'USERS' | 'SYSTEM' | 'CONFIG'>('OVERVIEW');

  // Config State
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [posthogKey, setPosthogKey] = useState('');
  const [configSaved, setConfigSaved] = useState(false);

  useEffect(() => {
      // Load backend keys
      setSupabaseUrl(localStorage.getItem('SUPABASE_URL') || '');
      setSupabaseKey(localStorage.getItem('SUPABASE_KEY') || '');
      setPosthogKey(localStorage.getItem('POSTHOG_KEY') || '');
  }, []);

  const handleSaveConfig = () => {
      localStorage.setItem('SUPABASE_URL', supabaseUrl.trim());
      localStorage.setItem('SUPABASE_KEY', supabaseKey.trim());
      localStorage.setItem('POSTHOG_KEY', posthogKey.trim());
      
      initSupabase();
      initAnalytics();
      
      setConfigSaved(true);
      setTimeout(() => setConfigSaved(false), 2000);
  };

  // Calculate Real Stats
  const currentPlanPrice = userTier === UserTier.AGENCY ? 99 : userTier === UserTier.CREATOR ? 29 : 0;
  
  // Construct User List with Real "Session User"
  const users = [
    { 
        id: 'SESSION_USER', 
        name: 'Current Session User', 
        email: 'admin_session@local', 
        tier: userTier, 
        status: 'ONLINE', 
        spent: `$${currentPlanPrice}` 
    },
    ...MOCK_USERS_BASE
  ];

  const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
    <div className="bg-cyber-black border border-cyber-border p-6 flex items-start justify-between group hover:border-white transition-colors">
        <div>
            <p className="text-cyber-muted text-xs font-mono uppercase tracking-widest mb-2">{title}</p>
            <h3 className="text-3xl font-cyber font-bold text-white mb-1">{value}</h3>
            <p className={`text-[10px] font-mono ${color}`}>{sub}</p>
        </div>
        <div className={`p-3 bg-cyber-panel border border-cyber-border rounded text-white group-hover:text-cyber-orange transition-colors`}>
            <Icon size={24} />
        </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col gap-6 animate-fadeIn pb-10">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-cyber-border pb-6">
            <div>
                <h2 className="text-3xl font-cyber font-bold text-white flex items-center gap-3">
                    <ShieldAlert className="text-red-500" /> SYSTEM_OVERSEER
                </h2>
                <p className="text-cyber-muted font-mono text-xs mt-2 uppercase">Administrative Control Panel // {userTier} ACCESS</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex bg-cyber-panel border border-cyber-border p-1">
                    {['OVERVIEW', 'USERS', 'SYSTEM', 'CONFIG'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 text-xs font-bold uppercase transition-all ${activeTab === tab ? 'bg-white text-black' : 'text-cyber-muted hover:text-white'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <button 
                    onClick={onLogout}
                    className="p-3 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                    title="Logout"
                >
                    <LogOut size={16} />
                </button>
            </div>
        </div>

        {activeTab === 'OVERVIEW' && (
            <div className="space-y-6 animate-fadeIn">
                {/* Stats Grid - Mixing Real & Mock Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        title="Session Uploads" 
                        value={stats.uploads} 
                        sub="Real-time Session Data" 
                        icon={Users} 
                        color="text-green-500" 
                    />
                    <StatCard 
                        title="Current Plan Value" 
                        value={`$${currentPlanPrice}`} 
                        sub="Monthly Recurring Revenue" 
                        icon={DollarSign} 
                        color="text-cyber-orange" 
                    />
                    <StatCard 
                        title="AI Generations" 
                        value={stats.apiCalls} 
                        sub="API Requests" 
                        icon={Cpu} 
                        color="text-blue-500" 
                    />
                    <StatCard 
                        title="Storage Used" 
                        value={`${stats.storageMB.toFixed(1)} MB`} 
                        sub="Session Buffer" 
                        icon={HardDrive} 
                        color="text-purple-500" 
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
                    {/* Main Chart */}
                    <div className="lg:col-span-2 bg-cyber-black border border-cyber-border p-6 flex flex-col">
                         <h3 className="text-sm font-cyber font-bold text-white mb-6 uppercase tracking-wider">Network Traffic Analysis (Platform Wide)</h3>
                         <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={TRAFFIC_DATA}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#FF6600" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#FF6600" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                                    <XAxis dataKey="name" stroke="#525252" fontSize={10} fontFamily="monospace" />
                                    <YAxis stroke="#525252" fontSize={10} fontFamily="monospace" />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#050505', borderColor: '#2a2a2a', color: '#fff' }}
                                        itemStyle={{ color: '#FF6600' }}
                                    />
                                    <Area type="monotone" dataKey="users" stroke="#FF6600" fillOpacity={1} fill="url(#colorUsers)" />
                                </AreaChart>
                            </ResponsiveContainer>
                         </div>
                    </div>

                    {/* Revenue Bar */}
                    <div className="bg-cyber-black border border-cyber-border p-6 flex flex-col">
                        <h3 className="text-sm font-cyber font-bold text-white mb-6 uppercase tracking-wider">Weekly Revenue</h3>
                        <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={REVENUE_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                                    <XAxis dataKey="name" stroke="#525252" fontSize={10} fontFamily="monospace" />
                                    <Tooltip 
                                         cursor={{fill: '#1a1a1a'}}
                                         contentStyle={{ backgroundColor: '#050505', borderColor: '#2a2a2a', color: '#fff' }}
                                    />
                                    <Bar dataKey="rev" fill="#22c55e" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'USERS' && (
            <div className="bg-cyber-black border border-cyber-border flex flex-col flex-1 animate-fadeIn">
                <div className="p-4 border-b border-cyber-border flex justify-between items-center bg-cyber-panel">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted" size={14} />
                        <input 
                            type="text" 
                            placeholder="Search database..." 
                            className="bg-cyber-black border border-cyber-border text-white pl-10 pr-4 py-2 text-xs font-mono focus:outline-none focus:border-cyber-orange w-64"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="bg-white text-black px-4 py-2 text-xs font-bold uppercase hover:bg-cyber-orange transition-colors">Export CSV</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-cyber-border text-xs text-cyber-muted font-mono uppercase bg-cyber-black/50">
                                <th className="p-4 font-normal">User Identity</th>
                                <th className="p-4 font-normal">Current Tier</th>
                                <th className="p-4 font-normal">Monthly Value</th>
                                <th className="p-4 font-normal">Status</th>
                                <th className="p-4 font-normal text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className={`border-b border-cyber-border hover:bg-cyber-panel/50 transition-colors group ${user.id === 'SESSION_USER' ? 'bg-cyber-orange/5' : ''}`}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-cyber-panel border border-cyber-border flex items-center justify-center font-bold text-cyber-orange text-xs">
                                                {user.id === 'SESSION_USER' ? <User size={14}/> : user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm flex items-center gap-2">
                                                    {user.name} 
                                                    {user.id === 'SESSION_USER' && <span className="text-[9px] bg-cyber-orange text-black px-1 rounded uppercase">You</span>}
                                                </div>
                                                <div className="text-[10px] text-cyber-muted font-mono">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-[10px] px-2 py-1 font-bold border rounded ${
                                            user.tier === 'AGENCY' ? 'border-purple-500 text-purple-500 bg-purple-500/10' :
                                            user.tier === 'CREATOR' ? 'border-cyber-orange text-cyber-orange bg-cyber-orange/10' :
                                            'border-cyber-muted text-cyber-muted'
                                        }`}>
                                            {user.tier}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm font-mono text-white">{user.spent}</td>
                                    <td className="p-4">
                                        <span className={`flex items-center gap-2 text-[10px] font-bold uppercase ${user.status === 'ONLINE' ? 'text-green-500' : user.status === 'ACTIVE' ? 'text-blue-500' : 'text-red-500'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'ONLINE' ? 'bg-green-500 animate-ping' : user.status === 'ACTIVE' ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:text-white text-cyber-muted transition-colors" title="View Details"><Eye size={14} /></button>
                                            <button className="p-2 hover:text-red-500 text-cyber-muted transition-colors" title="Suspend User"><Ban size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {activeTab === 'SYSTEM' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full animate-fadeIn">
                <div className="bg-cyber-black border border-cyber-border flex flex-col">
                    <div className="p-4 border-b border-cyber-border bg-cyber-panel">
                        <h3 className="text-xs font-cyber text-white uppercase tracking-widest flex items-center gap-2">
                            <Activity size={14} className="text-cyber-orange" /> System Health
                        </h3>
                    </div>
                    <div className="p-6 space-y-6">
                        {/* Mock Health Bars */}
                        {[
                            { label: 'API Latency', val: 92, max: 200, unit: 'ms', color: 'bg-green-500' },
                            { label: 'CPU Utilization', val: 45, max: 100, unit: '%', color: 'bg-blue-500' },
                            { label: 'Memory Usage', val: 78, max: 100, unit: '%', color: 'bg-yellow-500' },
                            { label: 'Disk I/O', val: 24, max: 100, unit: 'MB/s', color: 'bg-purple-500' },
                        ].map((metric, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between text-xs font-mono text-cyber-muted mb-2">
                                    <span>{metric.label}</span>
                                    <span className="text-white">{metric.val}{metric.unit}</span>
                                </div>
                                <div className="w-full h-1 bg-cyber-panel">
                                    <div 
                                        className={`h-full ${metric.color}`} 
                                        style={{ width: `${(metric.val / metric.max) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-cyber-black border border-cyber-border flex flex-col">
                    <div className="p-4 border-b border-cyber-border bg-cyber-panel">
                        <h3 className="text-xs font-cyber text-white uppercase tracking-widest flex items-center gap-2">
                            <Clock size={14} className="text-cyber-orange" /> Real-time Logs
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
                        {logs.map((log) => (
                            <div key={log.id} className="p-3 border border-cyber-border hover:bg-cyber-panel/50 transition-colors flex gap-3 animate-fadeIn">
                                <span className={`font-bold ${
                                    log.type === 'WARN' ? 'text-yellow-500' :
                                    log.type === 'ERR' ? 'text-red-500' : 
                                    log.type === 'SUCCESS' ? 'text-green-500' : 'text-blue-500'
                                }`}>[{log.type}]</span>
                                <span className="text-cyber-muted whitespace-nowrap">{log.timestamp}</span>
                                <span className="text-white flex-1 break-words">{log.msg}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'CONFIG' && (
            <div className="max-w-4xl mx-auto w-full animate-fadeIn">
                <div className="bg-cyber-black border border-cyber-border p-8 space-y-8">
                    <div className="border-b border-cyber-border pb-6">
                        <h3 className="text-2xl font-cyber text-white uppercase tracking-widest mb-2 flex items-center gap-3">
                            <Settings className="text-cyber-orange" /> System Configuration
                        </h3>
                        <p className="text-cyber-muted font-mono text-xs">
                            BACKEND_INFRASTRUCTURE_KEYS // DATABASE_CONNECTION
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Supabase */}
                        <div className="bg-cyber-panel border border-cyber-border p-6 space-y-6">
                            <h4 className="text-white font-bold flex items-center gap-2"><Database size={18} className="text-green-500"/> Supabase Integration</h4>
                            <p className="text-xs text-cyber-muted">Configure the primary database and authentication endpoint.</p>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-cyber-muted uppercase">Project URL</label>
                                <input 
                                    type="text" 
                                    value={supabaseUrl}
                                    onChange={(e) => setSupabaseUrl(e.target.value)}
                                    placeholder="https://xyz.supabase.co"
                                    className="w-full bg-cyber-black border border-cyber-border text-white px-3 py-2 text-xs font-mono focus:border-green-500 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-cyber-muted uppercase">Anon Public Key</label>
                                <input 
                                    type="password" 
                                    value={supabaseKey}
                                    onChange={(e) => setSupabaseKey(e.target.value)}
                                    placeholder="eyJh..."
                                    className="w-full bg-cyber-black border border-cyber-border text-white px-3 py-2 text-xs font-mono focus:border-green-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* PostHog */}
                        <div className="bg-cyber-panel border border-cyber-border p-6 space-y-6">
                            <h4 className="text-white font-bold flex items-center gap-2"><BarChart3 size={18} className="text-blue-500"/> PostHog Analytics</h4>
                            <p className="text-xs text-cyber-muted">Product analytics pipeline configuration.</p>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-cyber-muted uppercase">Project API Key</label>
                                <input 
                                    type="password" 
                                    value={posthogKey}
                                    onChange={(e) => setPosthogKey(e.target.value)}
                                    placeholder="phc_..."
                                    className="w-full bg-cyber-black border border-cyber-border text-white px-3 py-2 text-xs font-mono focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-cyber-border">
                        <button 
                            onClick={handleSaveConfig}
                            className="bg-cyber-orange text-black font-bold px-8 py-3 uppercase tracking-wider hover:bg-white transition-colors flex items-center gap-2"
                        >
                            <Save size={18} /> Save System Config
                        </button>
                        {configSaved && (
                            <span className="text-green-500 text-sm font-mono flex items-center gap-2 animate-fadeIn">
                                <CheckCircle size={14} /> SYSTEM_KEYS_UPDATED
                            </span>
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};