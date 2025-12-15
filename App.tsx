import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { VideoUploader } from './components/VideoUploader';
import { SmartClips } from './components/SmartClips';
import { Repurposer } from './components/Repurposer';
import { ViralityAnalysis } from './components/ViralityAnalysis';
import { SocialArchitect } from './components/SocialArchitect';
import { PromptGenerator } from './components/PromptGenerator';
import { Settings } from './components/Settings';
import { Pricing } from './components/Pricing';
import { TrailerGenerator } from './components/TrailerGenerator';
import { ShortFormCreator } from './components/ShortFormCreator';
import { Checkout } from './components/Checkout';
import { PaymentSuccess } from './components/PaymentSuccess';
import { PaymentDeclined } from './components/PaymentDeclined';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { UserLogin, UserSignup } from './components/Auth';
import { FeatureRequest } from './components/FeatureRequest';
import { WatermarkRemover } from './components/WatermarkRemover';
import { UserDashboard } from './components/UserDashboard';
import { CreditModal } from './components/CreditModal';
import { PerformanceStudio } from './components/PerformanceStudio';
import { CreditPurchase } from './components/CreditPurchase';
import { AppView, VideoAsset, UserTier, SystemLog, AppStats } from './types';
import { Scissors, Image as ImageIcon, Music2, Youtube, Eraser, Repeat, TrendingUp } from 'lucide-react';
import { initSupabase } from './services/supabase';
import { initAnalytics, trackEvent } from './services/analytics';

// Tier Limits Configuration
const TIER_LIMITS = {
  [UserTier.FREE]: 1,
  [UserTier.CREATOR]: 15,
  [UserTier.AGENCY]: 100
};

function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.UPLOAD);
  const [videoAsset, setVideoAsset] = useState<VideoAsset | null>(null);
  const [userTier, setUserTier] = useState<UserTier>(UserTier.FREE);
  const [pendingTier, setPendingTier] = useState<UserTier | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Credit Tracking
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [extraCredits, setExtraCredits] = useState(0); // Credits purchased separately
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditModalType, setCreditModalType] = useState<'LOW_CREDIT' | 'LIMIT_REACHED' | 'OUT_OF_CREDITS'>('LOW_CREDIT');

  // App Data & Stats for Admin Dashboard
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([
    { id: 1, type: 'INFO', msg: 'System initialized v2.4.0', timestamp: new Date().toLocaleTimeString() }
  ]);
  const [appStats, setAppStats] = useState<AppStats>({
    uploads: 0,
    storageMB: 0,
    apiCalls: 0
  });

  // Init Services on Mount
  useEffect(() => {
      initSupabase();
      initAnalytics();
      trackEvent('app_opened');
  }, []);

  // Load persistence for credits
  useEffect(() => {
    const savedUsed = localStorage.getItem('CREDITS_USED');
    const savedExtra = localStorage.getItem('EXTRA_CREDITS');
    if (savedUsed !== null) setCreditsUsed(parseInt(savedUsed));
    if (savedExtra !== null) setExtraCredits(parseInt(savedExtra));
  }, []);

  // Save persistence for credits
  useEffect(() => {
    localStorage.setItem('CREDITS_USED', creditsUsed.toString());
    localStorage.setItem('EXTRA_CREDITS', extraCredits.toString());
  }, [creditsUsed, extraCredits]);

  // Track View Changes
  useEffect(() => {
      trackEvent('view_changed', { view: currentView });
  }, [currentView]);

  const addLog = (type: SystemLog['type'], msg: string) => {
    setSystemLogs(prev => [{
      id: Date.now(),
      type,
      msg,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev]);
  };

  const handleVideoUpload = (asset: VideoAsset) => {
    const limit = TIER_LIMITS[userTier] + extraCredits;

    // Check Limit Before Allowing
    if (creditsUsed >= limit) {
        setCreditModalType('LIMIT_REACHED');
        setShowCreditModal(true);
        addLog('WARN', `User hit upload limit (${limit})`);
        trackEvent('limit_reached', { tier: userTier, limit, extraCredits });
        return; // Block upload
    }

    setVideoAsset(asset);
    setCurrentView(AppView.DASHBOARD);
    
    // Consume Credit
    const newUsed = creditsUsed + 1;
    setCreditsUsed(newUsed);
    const remaining = limit - newUsed;
    
    // Log
    const fileSizeMB = asset.file.size / (1024 * 1024);
    setAppStats(prev => ({
      ...prev,
      uploads: prev.uploads + 1,
      storageMB: prev.storageMB + fileSizeMB
    }));
    addLog('INFO', `Ingested media: ${asset.file.name}. Credits: ${newUsed}/${limit}`);

    // Check for Warnings AFTER usage increment
    if (remaining === 1 && limit > 1) {
        setTimeout(() => {
            setCreditModalType('LOW_CREDIT');
            setShowCreditModal(true);
        }, 1000); // Slight delay for UX
    } else if (remaining === 0) {
        setTimeout(() => {
            setCreditModalType('OUT_OF_CREDITS');
            setShowCreditModal(true);
        }, 1000);
    }
  };

  const handleNavigate = (view: AppView) => {
    if (view === AppView.ADMIN_DASHBOARD && !isAdminAuthenticated) {
        setCurrentView(AppView.ADMIN_LOGIN);
        return;
    }
    setCurrentView(view);
  };

  const handleUpgrade = () => {
    trackEvent('upgrade_clicked', { fromView: currentView });
    setCurrentView(AppView.PRICING);
  };

  const handleBuyCredits = () => {
      setShowCreditModal(false);
      setCurrentView(AppView.PURCHASE_CREDITS);
  };

  const handleCreditPurchaseComplete = (amount: number) => {
      setExtraCredits(prev => prev + amount);
      addLog('SUCCESS', `Purchased ${amount} extra credits`);
      trackEvent('credits_purchased', { amount });
      
      // Return user to dashboard or upload
      if (videoAsset) {
          setCurrentView(AppView.DASHBOARD);
      } else {
          setCurrentView(AppView.UPLOAD);
      }
  };

  // Payment Flow Handlers
  const handleSelectPlan = (tier: UserTier) => {
    if (tier === UserTier.FREE) {
        setUserTier(tier);
        setCurrentView(AppView.DASHBOARD);
        addLog('INFO', 'User reverted to Free Tier');
    } else {
        setPendingTier(tier);
        setCurrentView(AppView.CHECKOUT);
    }
  };

  const handlePaymentSuccess = () => {
      if (pendingTier) {
          setUserTier(pendingTier);
          if (userTier === UserTier.FREE && pendingTier !== UserTier.FREE) {
              setCreditsUsed(0); 
          }
          setCurrentView(AppView.PAYMENT_SUCCESS);
          addLog('SUCCESS', `Subscription Verified: Upgraded to ${pendingTier}`);
          trackEvent('payment_success', { tier: pendingTier });
      } else {
          setCurrentView(AppView.DASHBOARD);
      }
  };

  const handlePaymentFailure = () => {
      setCurrentView(AppView.PAYMENT_DECLINED);
      addLog('ERR', `Payment Failed for ${pendingTier} Tier`);
      trackEvent('payment_failed', { tier: pendingTier });
  };

  // User Auth Handlers
  const handleUserLogin = () => {
      setIsAuthenticated(true);
      setCurrentView(AppView.UPLOAD);
      addLog('INFO', 'User logged in');
      trackEvent('login');
  };

  const handleUserLogout = () => {
      setIsAuthenticated(false);
      setUserTier(UserTier.FREE); 
      setCreditsUsed(0);
      setExtraCredits(0);
      localStorage.removeItem('CREDITS_USED');
      localStorage.removeItem('EXTRA_CREDITS');
      setCurrentView(AppView.LOGIN);
      addLog('INFO', 'User logged out');
      trackEvent('logout');
  };

  // Admin Handlers
  const handleAdminLogin = () => {
      setIsAdminAuthenticated(true);
      setUserTier(UserTier.AGENCY); 
      setCurrentView(AppView.ADMIN_DASHBOARD);
      addLog('WARN', 'Admin Access Granted');
      trackEvent('admin_login');
  };

  const handleAdminLogout = () => {
      setIsAdminAuthenticated(false);
      setUserTier(UserTier.FREE); 
      setCurrentView(AppView.UPLOAD);
      addLog('INFO', 'Admin Session Terminated');
  };

  useEffect(() => {
     if ([AppView.CLIPS, AppView.SOCIAL, AppView.PROMPTS, AppView.TRAILER].includes(currentView)) {
        setAppStats(prev => ({...prev, apiCalls: prev.apiCalls + 1}));
     }
  }, [currentView]);

  const renderContent = () => {
    const allowedViews = [
        AppView.UPLOAD, AppView.SETTINGS, AppView.PRICING, AppView.CHECKOUT, 
        AppView.PAYMENT_SUCCESS, AppView.PAYMENT_DECLINED, AppView.ADMIN_LOGIN,
        AppView.ADMIN_DASHBOARD, AppView.LOGIN, AppView.SIGNUP, AppView.FEATURE_REQUEST,
        AppView.USER_DASHBOARD, AppView.PERFORMANCE, AppView.PURCHASE_CREDITS
    ];
    
    if (!videoAsset && !allowedViews.includes(currentView)) {
        return <div className="text-cyber-orange font-mono p-10 text-center border border-cyber-border bg-cyber-black">ACCESS_DENIED: MISSING_SOURCE_FILE</div>;
    }

    switch (currentView) {
      case AppView.UPLOAD:
        return <VideoUploader onVideoSelected={handleVideoUpload} />;
      
      case AppView.DASHBOARD:
        return (
            <div className="text-center space-y-12 mt-12 animate-fadeIn">
                <div className="space-y-2">
                    <h2 className="text-4xl font-cyber font-bold text-white uppercase tracking-tighter">
                        Command <span className="text-cyber-orange">Center</span>
                    </h2>
                    <p className="text-cyber-muted font-mono text-sm">SELECT_OPERATION_MODE</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {/* Short Form Channels */}
                    <button onClick={() => setCurrentView(AppView.TIKTOK)} className="p-8 bg-cyber-black border border-cyber-border hover:border-[#ff0050] hover:shadow-[0_0_20px_rgba(255,0,80,0.2)] transition-all group text-left relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Music2 size={80} />
                        </div>
                        <h3 className="text-xl font-cyber font-bold text-white group-hover:text-[#ff0050] mb-2 uppercase">TikTok</h3>
                        <p className="text-cyber-muted text-sm font-mono">Strategy & Captions</p>
                    </button>

                    <button onClick={() => setCurrentView(AppView.SHORTS)} className="p-8 bg-cyber-black border border-cyber-border hover:border-[#FF0000] hover:shadow-[0_0_20px_rgba(255,0,0,0.2)] transition-all group text-left relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Youtube size={80} />
                        </div>
                        <h3 className="text-xl font-cyber font-bold text-white group-hover:text-[#FF0000] mb-2 uppercase">Shorts</h3>
                        <p className="text-cyber-muted text-sm font-mono">YouTube Optimization</p>
                    </button>

                    <button onClick={() => setCurrentView(AppView.CLIPS)} className="p-8 bg-cyber-black border border-cyber-border hover:border-cyber-orange hover:shadow-[0_0_20px_rgba(255,102,0,0.2)] transition-all group text-left relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Scissors size={80} />
                        </div>
                        <h3 className="text-xl font-cyber font-bold text-white group-hover:text-cyber-orange mb-2 uppercase">Extraction</h3>
                        <p className="text-cyber-muted text-sm font-mono">Create Smart Clips</p>
                    </button>
                    
                     <button onClick={() => setCurrentView(AppView.WATERMARK_REMOVER)} className="p-8 bg-cyber-black border border-cyber-border hover:border-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all group text-left relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Eraser size={80} />
                        </div>
                        <h3 className="text-xl font-cyber font-bold text-white group-hover:text-green-500 mb-2 uppercase">Cleanup</h3>
                        <p className="text-cyber-muted text-sm font-mono">Magic Eraser</p>
                    </button>

                    <button onClick={() => setCurrentView(AppView.REPURPOSE)} className="p-8 bg-cyber-black border border-cyber-border hover:border-pink-500 hover:shadow-[0_0_20px_rgba(236,72,153,0.2)] transition-all group text-left relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Repeat size={80} />
                        </div>
                        <h3 className="text-xl font-cyber font-bold text-white group-hover:text-pink-500 mb-2 uppercase">Repurpose</h3>
                        <p className="text-cyber-muted text-sm font-mono">Blogs & Scripts</p>
                    </button>

                    <button onClick={() => setCurrentView(AppView.PROMPTS)} className="p-8 bg-cyber-black border border-cyber-border hover:border-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all group text-left relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <ImageIcon size={80} />
                        </div>
                        <h3 className="text-xl font-cyber font-bold text-white group-hover:text-purple-500 mb-2 uppercase">Vision</h3>
                        <p className="text-cyber-muted text-sm font-mono">Prompt Generator</p>
                    </button>

                    <button onClick={() => setCurrentView(AppView.PERFORMANCE)} className="p-8 bg-cyber-black border border-cyber-border hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all group text-left relative overflow-hidden md:col-span-3 lg:col-span-1">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp size={80} />
                        </div>
                        <h3 className="text-xl font-cyber font-bold text-white group-hover:text-blue-500 mb-2 uppercase">Performance</h3>
                        <p className="text-cyber-muted text-sm font-mono">Actuals vs Prediction</p>
                    </button>
                </div>
            </div>
        );

      case AppView.TIKTOK:
        return <ShortFormCreator videoAsset={videoAsset!} userTier={userTier} onUpgrade={handleUpgrade} platform="TIKTOK" />;
      
      case AppView.SHORTS:
        return <ShortFormCreator videoAsset={videoAsset!} userTier={userTier} onUpgrade={handleUpgrade} platform="SHORTS" />;

      case AppView.CLIPS:
        return <SmartClips videoAsset={videoAsset!} userTier={userTier} onUpgrade={handleUpgrade} />;
        
      case AppView.TRAILER:
        return <TrailerGenerator videoAsset={videoAsset!} userTier={userTier} onUpgrade={handleUpgrade} />;

      case AppView.REPURPOSE:
        return <Repurposer videoAsset={videoAsset!} initialMode="BLOG" />;

      // Legacy support if specific link is used
      case AppView.BLOG:
        return <Repurposer videoAsset={videoAsset!} initialMode="BLOG" />;

      case AppView.SCRIPT:
        return <Repurposer videoAsset={videoAsset!} initialMode="SCRIPT" />;
        
      case AppView.CHAT:
        return <ViralityAnalysis videoAsset={videoAsset!} userTier={userTier} onUpgrade={handleUpgrade} />;

      case AppView.SOCIAL:
        return <SocialArchitect videoAsset={videoAsset!} userTier={userTier} onUpgrade={handleUpgrade} />;
      
      case AppView.PROMPTS:
        return <PromptGenerator videoAsset={videoAsset!} userTier={userTier} onUpgrade={handleUpgrade} />;
      
      case AppView.WATERMARK_REMOVER:
        return <WatermarkRemover videoAsset={videoAsset!} userTier={userTier} onUpgrade={handleUpgrade} />;
      
      case AppView.PERFORMANCE:
        return <PerformanceStudio />;

      case AppView.USER_DASHBOARD:
        return <UserDashboard 
          userTier={userTier} 
          onUpgrade={handleUpgrade} 
          usage={{ used: creditsUsed, limit: TIER_LIMITS[userTier] + extraCredits }}
          onBuyCredits={() => setCurrentView(AppView.PURCHASE_CREDITS)}
        />;

      case AppView.PURCHASE_CREDITS:
        return <CreditPurchase 
            onPurchase={handleCreditPurchaseComplete} 
            onCancel={() => setCurrentView(videoAsset ? AppView.DASHBOARD : AppView.USER_DASHBOARD)} 
        />;

      case AppView.SETTINGS:
        return <Settings />;

      case AppView.PRICING:
        return <Pricing currentTier={userTier} onSelectTier={handleSelectPlan} />;
    
      case AppView.CHECKOUT:
        return <Checkout 
            selectedTier={pendingTier || UserTier.CREATOR} 
            onSuccess={handlePaymentSuccess} 
            onFailure={handlePaymentFailure} 
            onCancel={() => setCurrentView(AppView.PRICING)} 
        />;
    
      case AppView.PAYMENT_SUCCESS:
        return <PaymentSuccess tier={userTier} onContinue={() => setCurrentView(AppView.DASHBOARD)} />;
      
      case AppView.PAYMENT_DECLINED:
        return <PaymentDeclined onRetry={() => setCurrentView(AppView.CHECKOUT)} onCancel={() => setCurrentView(AppView.PRICING)} />;
      
      case AppView.ADMIN_LOGIN:
        return <AdminLogin onLogin={handleAdminLogin} onCancel={() => setCurrentView(AppView.UPLOAD)} />;
      
      case AppView.ADMIN_DASHBOARD:
        if (!isAdminAuthenticated) return <AdminLogin onLogin={handleAdminLogin} onCancel={() => setCurrentView(AppView.UPLOAD)} />;
        return <AdminDashboard 
          onLogout={handleAdminLogout} 
          userTier={userTier} 
          logs={systemLogs} 
          stats={appStats}
        />;

      case AppView.LOGIN:
        return <UserLogin onSuccess={handleUserLogin} onSwitchMode={() => setCurrentView(AppView.SIGNUP)} />;
      
      case AppView.SIGNUP:
        return <UserSignup onSuccess={handleUserLogin} onSwitchMode={() => setCurrentView(AppView.LOGIN)} />;

      case AppView.FEATURE_REQUEST:
        return <FeatureRequest onCancel={() => setCurrentView(videoAsset ? AppView.DASHBOARD : AppView.UPLOAD)} />;

      default:
        return <div>View not found</div>;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      onNavigate={handleNavigate} 
      hasVideo={!!videoAsset}
      userTier={userTier}
      isAuthenticated={isAuthenticated}
      onLogout={handleUserLogout}
      isAdminAuthenticated={isAdminAuthenticated}
    >
      <CreditModal 
         isOpen={showCreditModal}
         onClose={() => setShowCreditModal(false)}
         type={creditModalType}
         userTier={userTier}
         onUpgrade={handleUpgrade}
         onBuyCredits={handleBuyCredits}
      />
      {renderContent()}
    </Layout>
  );
}

export default App;