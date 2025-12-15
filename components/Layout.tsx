import React, { useEffect, useState } from 'react';
import { AppView, UserTier, AIProvider } from '../types';
import { 
  Scissors, 
  Upload,
  BarChart2,
  Menu,
  X,
  Share2,
  Image as ImageIcon,
  CreditCard,
  Film,
  Music2,
  Youtube,
  Shield,
  LogIn,
  LogOut,
  UserPlus,
  Lightbulb,
  Eraser,
  User,
  Repeat,
  TrendingUp
} from 'lucide-react';

interface LayoutProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  children: React.ReactNode;
  hasVideo: boolean;
  userTier?: UserTier;
  isAuthenticated: boolean;
  onLogout: () => void;
  isAdminAuthenticated?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  currentView, 
  onNavigate, 
  children, 
  hasVideo, 
  userTier = UserTier.FREE, 
  isAuthenticated, 
  onLogout,
  isAdminAuthenticated = false
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string>('GEMINI');
  const [activeModel, setActiveModel] = useState<string>('gemini-2.5-flash');
  const [systemOnline, setSystemOnline] = useState(false);

  // Check for API key presence and active provider
  useEffect(() => {
    const checkConfig = () => {
      const provider = localStorage.getItem('ACTIVE_PROVIDER') || 'GEMINI';
      setActiveProvider(provider);
      
      let key = '';
      let model = '';

      if (provider === 'GEMINI') {
          key = localStorage.getItem('GEMINI_KEY') || process.env.API_KEY || '';
          model = localStorage.getItem('GEMINI_MODEL') || 'gemini-2.5-flash';
      } else if (provider === 'OPENAI') {
          key = localStorage.getItem('OPENAI_KEY') || '';
          model = localStorage.getItem('OPENAI_MODEL') || 'gpt-4o';
      } else if (provider === 'CLAUDE') {
          key = localStorage.getItem('CLAUDE_KEY') || '';
          model = localStorage.getItem('CLAUDE_MODEL') || 'claude-3-5-sonnet-latest';
      }

      setActiveModel(model);
      setSystemOnline(!!key);
    };
    
    checkConfig();
    window.addEventListener('storage', checkConfig);
    const interval = setInterval(checkConfig, 1000);
    
    return () => {
        window.removeEventListener('storage', checkConfig);
        clearInterval(interval);
    };
  }, []);

  const NavItem = ({ view, icon: Icon, label, disabled = false }: { view: AppView; icon: any; label: string; disabled?: boolean }) => (
    <button
      onClick={() => {
        if (!disabled) {
          onNavigate(view);
          setIsMobileMenuOpen(false);
        }
      }}
      disabled={disabled}
      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-none border-l-2 transition-all duration-200 group ${
        currentView === view
          ? 'border-cyber-orange bg-cyber-orange/10 text-white'
          : disabled
            ? 'border-transparent text-cyber-muted/30 cursor-not-allowed'
            : 'border-transparent text-cyber-muted hover:text-white hover:bg-cyber-panel'
      }`}
    >
      <Icon size={18} className={currentView === view ? 'text-cyber-orange' : 'group-hover:text-cyber-orange transition-colors'} />
      <span className={`font-medium tracking-wide ${currentView === view ? 'text-white' : ''}`}>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-cyber-black flex text-cyber-text font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-cyber-black border-r border-cyber-border transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 border-b border-cyber-border flex justify-between items-center bg-cyber-black">
          <div className="flex flex-col items-start">
            <a 
              href="https://futureaiguide.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-lg md:text-xl font-cyber font-bold text-white tracking-widest hover:text-cyber-orange transition-colors"
            >
              FUTURE AI GUIDE
            </a>
            <button 
              onClick={() => window.location.reload()} 
              className="text-xs text-cyber-orange tracking-[0.2em] uppercase mt-1 hover:text-white transition-colors text-left"
            >
              VIRAL CLIPPER
            </button>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-cyber-muted">
            <X size={24} />
          </button>
        </div>

        <div className="px-6 py-4">
            {isAuthenticated ? (
                 <button 
                    onClick={() => onNavigate(AppView.USER_DASHBOARD)}
                    className="w-full flex items-center justify-between bg-cyber-panel border border-cyber-border p-3 hover:border-cyber-orange transition-colors group"
                 >
                     <div className="flex items-center gap-2">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${userTier === UserTier.FREE ? 'border-cyber-muted bg-cyber-muted/20 text-cyber-muted' : 'border-cyber-orange bg-cyber-orange/20 text-cyber-orange'}`}>
                            <User size={14} />
                         </div>
                         <div className="text-left">
                             <div className="text-xs font-bold text-white group-hover:text-cyber-orange transition-colors">MY PROFILE</div>
                             <div className="text-[10px] text-cyber-muted uppercase">{userTier} TIER</div>
                         </div>
                     </div>
                 </button>
            ) : (
                <div className="space-y-3">
                    <button 
                        onClick={() => onNavigate(AppView.LOGIN)}
                        className="w-full bg-cyber-panel border border-cyber-border hover:border-cyber-orange text-white py-2 px-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all"
                    >
                        <LogIn size={14} className="text-cyber-orange" /> Log In
                    </button>
                    <button 
                        onClick={() => onNavigate(AppView.SIGNUP)}
                        className="w-full bg-cyber-orange text-black py-2 px-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all hover:bg-white"
                    >
                        <UserPlus size={14} /> Sign Up
                    </button>
                </div>
            )}
        </div>

        <nav className="py-2 space-y-1 h-[calc(100vh-280px)] overflow-y-auto">
          <NavItem view={AppView.UPLOAD} icon={Upload} label="UPLOAD_SOURCE" />
          
          <div className="mt-6 mb-2 px-6 flex items-center gap-2">
            <div className="h-px bg-cyber-border flex-1"></div>
            <span className="text-[10px] font-cyber text-cyber-orange uppercase tracking-widest">Channels</span>
            <div className="h-px bg-cyber-border flex-1"></div>
          </div>
          <NavItem view={AppView.TIKTOK} icon={Music2} label="TIKTOK CREATOR" disabled={!hasVideo} />
          <NavItem view={AppView.SHORTS} icon={Youtube} label="SHORTS CREATOR" disabled={!hasVideo} />

          <div className="mt-6 mb-2 px-6 flex items-center gap-2">
            <div className="h-px bg-cyber-border flex-1"></div>
            <span className="text-[10px] font-cyber text-cyber-orange uppercase tracking-widest">Extraction</span>
            <div className="h-px bg-cyber-border flex-1"></div>
          </div>
          <NavItem view={AppView.CLIPS} icon={Scissors} label="SMART CLIPS" disabled={!hasVideo} />
          <NavItem view={AppView.TRAILER} icon={Film} label="TRAILER GEN" disabled={!hasVideo} />
          <NavItem view={AppView.CHAT} icon={BarChart2} label="VIRALITY AUDIT" disabled={!hasVideo} />
          
          <div className="mt-6 mb-2 px-6 flex items-center gap-2">
            <div className="h-px bg-cyber-border flex-1"></div>
            <span className="text-[10px] font-cyber text-cyber-orange uppercase tracking-widest">Analysis</span>
            <div className="h-px bg-cyber-border flex-1"></div>
          </div>
          <NavItem view={AppView.PERFORMANCE} icon={TrendingUp} label="PERFORMANCE STUDIO" />

          <div className="mt-6 mb-2 px-6 flex items-center gap-2">
            <div className="h-px bg-cyber-border flex-1"></div>
            <span className="text-[10px] font-cyber text-cyber-orange uppercase tracking-widest">Tools</span>
            <div className="h-px bg-cyber-border flex-1"></div>
          </div>
          <NavItem view={AppView.WATERMARK_REMOVER} icon={Eraser} label="MAGIC ERASER" disabled={!hasVideo} />

          <div className="mt-6 mb-2 px-6 flex items-center gap-2">
            <div className="h-px bg-cyber-border flex-1"></div>
            <span className="text-[10px] font-cyber text-cyber-orange uppercase tracking-widest">Synthesis</span>
            <div className="h-px bg-cyber-border flex-1"></div>
          </div>
          <NavItem view={AppView.REPURPOSE} icon={Repeat} label="CONTENT REPURPOSER" disabled={!hasVideo} />
          <NavItem view={AppView.SOCIAL} icon={Share2} label="SOCIAL THREADS" disabled={!hasVideo} />
          <NavItem view={AppView.PROMPTS} icon={ImageIcon} label="VISUAL PROMPTS" disabled={!hasVideo} />

          <div className="mt-8 mb-2 px-6">
             <button 
               onClick={() => onNavigate(AppView.PRICING)}
               className="w-full bg-cyber-panel border border-cyber-border hover:border-cyber-orange text-white py-2 px-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all"
             >
                <CreditCard size={14} className="text-cyber-orange" /> Plans & Billing
             </button>
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-cyber-black border-t border-cyber-border space-y-3">
          <button 
             onClick={() => onNavigate(AppView.FEATURE_REQUEST)}
             className="w-full flex items-center justify-center gap-2 py-2 border border-cyber-border hover:border-cyber-text text-[10px] text-cyber-muted hover:text-white uppercase tracking-widest transition-all mb-2"
          >
              <Lightbulb size={12} /> Feature Request
          </button>

          <button 
            onClick={() => onNavigate(AppView.SETTINGS)}
            className="w-full flex items-center space-x-3 p-3 bg-cyber-panel border border-cyber-border hover:border-cyber-orange rounded transition-all group text-left"
          >
            <div className={`w-2 h-2 rounded-full ${systemOnline ? 'bg-cyber-orange shadow-[0_0_8px_#FF6600]' : 'bg-red-500 shadow-[0_0_8px_#EF4444]'} animate-pulse`}></div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-cyber text-white tracking-wider group-hover:text-cyber-orange transition-colors truncate">
                  {activeProvider === 'OPENAI' ? 'OPENAI NET' : activeProvider === 'CLAUDE' ? 'ANTHROPIC AI' : 'GEMINI CORE'}
              </p>
              <p className={`text-[10px] ${systemOnline ? 'text-cyber-muted' : 'text-red-500'} uppercase font-mono truncate`}>
                {systemOnline ? activeModel.toUpperCase() : 'KEY_MISSING'}
              </p>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-cyber-orange text-xs">
                &gt;
            </div>
          </button>
          
          <div className="flex gap-2">
              <button 
                 onClick={() => onNavigate(isAdminAuthenticated ? AppView.ADMIN_DASHBOARD : AppView.ADMIN_LOGIN)}
                 className={`flex-1 flex items-center justify-center gap-2 p-2 border ${isAdminAuthenticated ? 'border-red-500/50 text-red-500' : 'border-transparent text-cyber-muted'} hover:border-cyber-border hover:text-white uppercase tracking-widest transition-all text-[10px]`}
              >
                  <Shield size={10} /> {isAdminAuthenticated ? 'Admin Panel' : 'Admin'}
              </button>
              
              {isAuthenticated && (
                  <button 
                     onClick={onLogout}
                     className="flex-1 flex items-center justify-center gap-2 p-2 border border-transparent hover:border-red-500/50 text-[10px] text-red-500 hover:text-white uppercase tracking-widest transition-all"
                  >
                      <LogOut size={10} /> Log Out
                  </button>
              )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#050505]">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 border-b border-cyber-border flex items-center justify-between bg-cyber-black">
          <div className="flex flex-col items-start">
            <a 
              href="https://futureaiguide.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-cyber font-bold text-white tracking-wide hover:text-cyber-orange transition-colors"
            >
              FUTURE AI GUIDE
            </a>
            <button 
              onClick={() => window.location.reload()} 
              className="text-[10px] text-cyber-orange tracking-widest uppercase hover:text-white transition-colors text-left"
            >
              VIRAL CLIPPER
            </button>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-cyber-orange">
            <Menu size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative scroll-smooth">
           {/* Background Grid Pattern */}
           <div className="absolute inset-0 pointer-events-none opacity-5" style={{
              backgroundImage: 'linear-gradient(rgba(255, 102, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 102, 0, 0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}></div>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};