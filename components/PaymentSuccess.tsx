import React from 'react';
import { CheckCircle, Zap, ArrowRight, Download } from 'lucide-react';
import { UserTier } from '../types';

interface PaymentSuccessProps {
  onContinue: () => void;
  tier: UserTier;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ onContinue, tier }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center animate-fadeIn p-4">
      <div className="max-w-md w-full bg-cyber-black border border-cyber-orange p-8 relative overflow-hidden shadow-[0_0_50px_rgba(255,102,0,0.1)]">
        {/* Background Animation elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-orange to-transparent animate-pulse"></div>
        
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/50 relative">
             <div className="absolute inset-0 rounded-full border border-green-500 opacity-50 animate-ping"></div>
             <CheckCircle size={40} className="text-green-500" />
        </div>

        <h2 className="text-3xl font-cyber font-bold text-white mb-2 uppercase tracking-tighter">
          Payment <span className="text-green-500">Successful</span>
        </h2>
        
        <div className="bg-cyber-panel p-4 my-6 border border-cyber-border">
            <p className="text-cyber-muted text-xs font-mono mb-2 uppercase">Account Upgraded To</p>
            <div className="flex items-center justify-center gap-2 text-xl font-bold text-white">
                <Zap size={20} className="text-cyber-orange" fill="currentColor" /> {tier} TIER
            </div>
        </div>

        <p className="text-cyber-muted text-sm mb-8 leading-relaxed">
          Your transaction has been verified on the blockchain. All {tier} features are now unlocked and ready for deployment.
        </p>

        <div className="space-y-3">
            <button 
              onClick={onContinue}
              className="w-full bg-cyber-orange text-black font-bold py-3 uppercase tracking-widest hover:bg-white transition-colors flex items-center justify-center gap-2"
            >
              Initialize System <ArrowRight size={16} />
            </button>
            
            <button className="w-full bg-transparent border border-cyber-border text-cyber-muted text-xs font-bold py-3 uppercase tracking-widest hover:text-white hover:border-white transition-colors flex items-center justify-center gap-2">
               <Download size={14} /> Download Receipt
            </button>
        </div>
      </div>
    </div>
  );
};