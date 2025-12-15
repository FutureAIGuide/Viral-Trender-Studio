import React, { useState } from 'react';
import { Package, Zap, Shield, ArrowLeft } from 'lucide-react';

interface CreditPurchaseProps {
  onPurchase: (amount: number) => void;
  onCancel: () => void;
}

export const CreditPurchase: React.FC<CreditPurchaseProps> = ({ onPurchase, onCancel }) => {
  const [processingId, setProcessingId] = useState<number | null>(null);

  const packages = [
    { id: 1, amount: 5, price: 4.99, name: 'Starter Boost', save: null },
    { id: 2, amount: 10, price: 8.99, name: 'Creator Pack', save: 'SAVE 10%' },
    { id: 3, amount: 15, price: 12.99, name: 'Power Surge', save: 'SAVE 15%' },
  ];

  const handleBuy = (pkg: typeof packages[0]) => {
    setProcessingId(pkg.id);
    // Simulate API call
    setTimeout(() => {
      onPurchase(pkg.amount);
      setProcessingId(null);
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto pt-8 pb-12 animate-fadeIn">
      <button 
        onClick={onCancel}
        className="flex items-center gap-2 text-cyber-muted hover:text-white mb-8 transition-colors text-xs font-mono uppercase tracking-widest"
      >
        <ArrowLeft size={16} /> Return to Dashboard
      </button>

      <div className="text-center mb-12 space-y-4">
        <h2 className="text-4xl md:text-5xl font-cyber font-bold text-white uppercase tracking-tighter">
          Refuel Your <span className="text-cyber-orange">Credits</span>
        </h2>
        <p className="text-cyber-muted font-mono text-sm tracking-wide max-w-xl mx-auto">
          EXTEND_PROCESSING_CAPACITY // INSTANT_ALLOCATION
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {packages.map((pkg) => (
          <div 
            key={pkg.id} 
            className={`bg-cyber-black border p-8 flex flex-col relative group transition-all duration-300 hover:-translate-y-2 ${pkg.id === 2 ? 'border-cyber-orange shadow-[0_0_30px_rgba(255,102,0,0.15)]' : 'border-cyber-border hover:border-cyber-muted'}`}
          >
            {pkg.save && (
              <div className="absolute top-0 right-0 bg-cyber-orange text-black text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                {pkg.save}
              </div>
            )}
            
            <div className="mb-6 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 ${pkg.id === 2 ? 'border-cyber-orange bg-cyber-orange/10 text-cyber-orange' : 'border-cyber-border bg-cyber-panel text-white'}`}>
                 <Package size={32} />
              </div>
              <h3 className="text-lg font-cyber text-white uppercase tracking-widest mb-1">{pkg.name}</h3>
              <div className="text-3xl font-bold text-white">${pkg.price}</div>
            </div>

            <ul className="space-y-4 mb-8 flex-1 border-t border-b border-cyber-border/50 py-6">
              <li className="flex items-center justify-between text-sm text-cyber-text">
                <span className="text-cyber-muted">Credits Added</span>
                <span className="font-bold text-white flex items-center gap-1">+{pkg.amount} <Zap size={14} className="text-cyber-orange"/></span>
              </li>
              <li className="flex items-center justify-between text-sm text-cyber-text">
                <span className="text-cyber-muted">Cost per Credit</span>
                <span className="font-mono text-white">${(pkg.price / pkg.amount).toFixed(2)}</span>
              </li>
              <li className="flex items-center justify-between text-sm text-cyber-text">
                <span className="text-cyber-muted">Expiration</span>
                <span className="font-mono text-white">Never</span>
              </li>
            </ul>

            <button 
              onClick={() => handleBuy(pkg)}
              disabled={processingId !== null}
              className={`w-full py-3 font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-colors ${
                  pkg.id === 2 
                  ? 'bg-cyber-orange text-black hover:bg-white' 
                  : 'bg-cyber-panel border border-cyber-border text-white hover:border-white'
              }`}
            >
              {processingId === pkg.id ? (
                  <>Processing <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div></>
              ) : (
                  'Purchase Pack'
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="text-center bg-cyber-panel border border-cyber-border p-6 max-w-2xl mx-auto">
         <div className="flex items-center justify-center gap-2 text-green-500 mb-2 font-bold uppercase text-xs tracking-widest">
             <Shield size={14} /> Secure Transaction
         </div>
         <p className="text-cyber-muted text-xs font-mono">
             Credits are added to your account immediately upon successful payment. 
             Purchases are non-refundable.
         </p>
      </div>
    </div>
  );
};