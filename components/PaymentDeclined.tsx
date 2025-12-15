import React from 'react';
import { XCircle, RefreshCw, ArrowLeft, AlertTriangle } from 'lucide-react';

interface PaymentDeclinedProps {
  onRetry: () => void;
  onCancel: () => void;
}

export const PaymentDeclined: React.FC<PaymentDeclinedProps> = ({ onRetry, onCancel }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center animate-fadeIn p-4">
      <div className="max-w-md w-full bg-cyber-black border border-red-500 p-8 relative overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.1)]">
        {/* Background Glitch elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse"></div>
        
        <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/50">
             <XCircle size={40} className="text-red-500" />
        </div>

        <h2 className="text-3xl font-cyber font-bold text-white mb-2 uppercase tracking-tighter">
          Transaction <span className="text-red-500">Declined</span>
        </h2>
        
        <div className="bg-red-900/10 p-4 my-6 border border-red-500/30 flex items-start gap-3 text-left">
            <AlertTriangle className="text-red-500 flex-shrink-0" size={20} />
            <div>
                <p className="text-red-500 text-xs font-bold font-mono uppercase mb-1">Error Code: 402_PAYMENT_REQUIRED</p>
                <p className="text-cyber-muted text-xs leading-relaxed">
                    The banking protocol refused the connection. Please verify your card details or funds and attempt the handshake again.
                </p>
            </div>
        </div>

        <div className="space-y-3">
            <button 
              onClick={onRetry}
              className="w-full bg-white text-black font-bold py-3 uppercase tracking-widest hover:bg-cyber-orange transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} /> Retry Transaction
            </button>
            
            <button 
              onClick={onCancel}
              className="w-full bg-transparent border border-cyber-border text-cyber-muted text-xs font-bold py-3 uppercase tracking-widest hover:text-white hover:border-white transition-colors flex items-center justify-center gap-2"
            >
               <ArrowLeft size={14} /> Return to Pricing
            </button>
        </div>
      </div>
    </div>
  );
};