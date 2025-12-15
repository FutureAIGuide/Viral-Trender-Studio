
import React from 'react';
import { UserTier } from '../types';
import { AlertTriangle, Zap, Lock, X, TrendingUp, PlusCircle } from 'lucide-react';

interface CreditModalProps {
  isOpen: boolean;
  type: 'LOW_CREDIT' | 'LIMIT_REACHED' | 'OUT_OF_CREDITS';
  userTier: UserTier;
  onClose: () => void;
  onUpgrade: () => void;
  onBuyCredits: () => void;
}

export const CreditModal: React.FC<CreditModalProps> = ({ 
  isOpen, 
  type, 
  userTier, 
  onClose, 
  onUpgrade, 
  onBuyCredits 
}) => {
  if (!isOpen) return null;

  const isFree = userTier === UserTier.FREE;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fadeIn">
      <div className={`max-w-md w-full bg-cyber-black border-2 p-8 relative shadow-[0_0_50px_rgba(0,0,0,0.5)] ${type === 'LOW_CREDIT' ? 'border-yellow-500' : 'border-red-500'}`}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-cyber-muted hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center space-y-6">
           <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto border-2 ${type === 'LOW_CREDIT' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' : 'bg-red-500/10 border-red-500 text-red-500'}`}>
               {type === 'LOW_CREDIT' ? <AlertTriangle size={40} /> : <Lock size={40} />}
           </div>

           <div>
               <h2 className="text-2xl font-cyber font-bold text-white uppercase tracking-wider">
                   {type === 'LOW_CREDIT' && 'Low Battery Warning'}
                   {type === 'LIMIT_REACHED' && 'System Limit Reached'}
                   {type === 'OUT_OF_CREDITS' && 'Capacity Depleted'}
               </h2>
               <p className="text-cyber-muted font-mono text-xs mt-2 uppercase">
                   {type === 'LOW_CREDIT' && 'Only 1 Processing Credit Remaining'}
                   {type === 'LIMIT_REACHED' && 'Upload Limit Exceeded for Current Tier'}
                   {type === 'OUT_OF_CREDITS' && 'You have used your last credit'}
               </p>
           </div>

           <div className="bg-cyber-panel border border-cyber-border p-4 text-sm text-cyber-text leading-relaxed">
               {type === 'LOW_CREDIT' && (
                   <p>You are about to run out of processing power. Upgrade your core or purchase a booster pack to ensure uninterrupted service.</p>
               )}
               {(type === 'LIMIT_REACHED' || type === 'OUT_OF_CREDITS') && isFree && (
                   <p>The Free Tier is limited to 1 upload per month. Unlock 15+ uploads, 4K export, and AI virality tools by upgrading to Creator Tier.</p>
               )}
               {(type === 'LIMIT_REACHED' || type === 'OUT_OF_CREDITS') && !isFree && (
                   <p>You've utilized all allocated credits for this billing cycle. Add a credit pack to continue creating or upgrade to Agency for higher limits.</p>
               )}
           </div>

           <div className="space-y-3">
               {isFree ? (
                   <button 
                       onClick={() => { onClose(); onUpgrade(); }}
                       className="w-full bg-cyber-orange text-black font-bold py-4 uppercase tracking-widest hover:bg-white transition-colors flex items-center justify-center gap-2"
                   >
                       <Zap size={18} /> Upgrade to Creator
                   </button>
               ) : (
                   <div className="grid grid-cols-1 gap-3">
                       <button 
                           onClick={() => { onClose(); onUpgrade(); }}
                           className="w-full bg-cyber-orange text-black font-bold py-3 uppercase tracking-widest hover:bg-white transition-colors flex items-center justify-center gap-2"
                       >
                           <TrendingUp size={18} /> Upgrade Tier
                       </button>
                       <button 
                           onClick={() => { onClose(); onBuyCredits(); }}
                           className="w-full bg-transparent border border-cyber-border text-white font-bold py-3 uppercase tracking-widest hover:border-cyber-orange hover:text-cyber-orange transition-colors flex items-center justify-center gap-2"
                       >
                           <PlusCircle size={18} /> Buy Credit Pack
                       </button>
                   </div>
               )}
               
               {type === 'LOW_CREDIT' && (
                   <button 
                       onClick={onClose}
                       className="text-cyber-muted text-xs hover:text-white uppercase tracking-widest mt-2"
                   >
                       Dismiss Warning
                   </button>
               )}
           </div>
        </div>
      </div>
    </div>
  );
};
