import React from 'react';
import { Check, Zap, Crown, Shield } from 'lucide-react';
import { UserTier } from '../types';

interface PricingProps {
  currentTier: UserTier;
  onSelectTier: (tier: UserTier) => void;
}

export const Pricing: React.FC<PricingProps> = ({ currentTier, onSelectTier }) => {
  return (
    <div className="max-w-6xl mx-auto pt-8 pb-12">
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-4xl md:text-5xl font-cyber font-bold text-white uppercase tracking-tighter">
          Upgrade Your <span className="text-cyber-orange">Core</span>
        </h2>
        <p className="text-cyber-muted font-mono text-sm tracking-wide max-w-xl mx-auto">
          UNLOCK_FULL_POTENTIAL // INCREASE_PROCESSING_POWER
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Free Tier */}
        <div className={`bg-cyber-black border p-8 flex flex-col relative group transition-colors ${currentTier === UserTier.FREE ? 'border-cyber-orange' : 'border-cyber-border hover:border-cyber-muted'}`}>
          <div className="mb-6">
            <h3 className="text-xl font-cyber text-white uppercase tracking-widest mb-2">Initiate</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">$0</span>
              <span className="text-cyber-muted font-mono text-xs">/MO</span>
            </div>
            <p className="text-xs text-cyber-muted mt-4 font-mono">For testing the neural link.</p>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-sm text-cyber-text">
              <Check size={16} className="text-cyber-muted" /> <span className="text-white font-bold">1 Upload</span> / Month
            </li>
            <li className="flex items-center gap-3 text-sm text-cyber-text">
              <Check size={16} className="text-cyber-muted" /> Max Resolution: <span className="text-white font-bold">720p</span>
            </li>
            <li className="flex items-center gap-3 text-sm text-cyber-text">
              <Check size={16} className="text-cyber-muted" /> Basic Smart Clips
            </li>
            <li className="flex items-center gap-3 text-sm text-cyber-text">
              <Check size={16} className="text-cyber-muted" /> Standard Processing Speed
            </li>
          </ul>
          <button 
            onClick={() => onSelectTier(UserTier.FREE)}
            className={`w-full py-3 border text-xs font-bold uppercase tracking-widest transition-all ${currentTier === UserTier.FREE ? 'bg-cyber-panel text-white border-cyber-orange' : 'border-cyber-border text-cyber-muted hover:text-white hover:border-white'}`}
            disabled={currentTier === UserTier.FREE}
          >
            {currentTier === UserTier.FREE ? 'Active Plan' : 'Downgrade to Free'}
          </button>
        </div>

        {/* Creator Tier */}
        <div className={`bg-cyber-panel border-2 p-8 flex flex-col relative transform md:-translate-y-4 shadow-[0_0_30px_rgba(255,102,0,0.15)] ${currentTier === UserTier.CREATOR ? 'border-white' : 'border-cyber-orange'}`}>
          <div className="absolute top-0 right-0 bg-cyber-orange text-black text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
            Recommended
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-cyber text-cyber-orange uppercase tracking-widest mb-2 flex items-center gap-2">
              <Zap size={18} /> Creator
            </h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">$29</span>
              <span className="text-cyber-muted font-mono text-xs">/MO</span>
            </div>
            <p className="text-xs text-cyber-muted mt-4 font-mono">Full repurposing suite enabled.</p>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-sm text-white">
              <Check size={16} className="text-cyber-orange" /> <span className="font-bold">15 Uploads</span> / Month
            </li>
            <li className="flex items-center gap-3 text-sm text-white">
              <Check size={16} className="text-cyber-orange" /> Max Resolution: <span className="font-bold">4K Ultra HD</span>
            </li>
             <li className="flex items-center gap-3 text-sm text-white">
              <Check size={16} className="text-cyber-orange" /> <span className="font-bold">Virality Score</span> Analysis
            </li>
            <li className="flex items-center gap-3 text-sm text-white">
              <Check size={16} className="text-cyber-orange" /> Social Thread Architect
            </li>
            <li className="flex items-center gap-3 text-sm text-white">
              <Check size={16} className="text-cyber-orange" /> Visual Prompt Gen
            </li>
            <li className="flex items-center gap-3 text-sm text-white">
              <Check size={16} className="text-cyber-orange" /> Fast Processing Queue
            </li>
          </ul>
          <button 
             onClick={() => onSelectTier(UserTier.CREATOR)}
             className={`w-full py-4 font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-colors ${currentTier === UserTier.CREATOR ? 'bg-white text-black' : 'bg-cyber-orange text-black hover:bg-white'}`}
             disabled={currentTier === UserTier.CREATOR}
          >
            {currentTier === UserTier.CREATOR ? 'Active Plan' : <><Zap size={16} /> Select Creator Plan</>}
          </button>
        </div>

        {/* Agency Tier */}
        <div className={`bg-cyber-black border p-8 flex flex-col relative group transition-colors ${currentTier === UserTier.AGENCY ? 'border-purple-500' : 'border-cyber-border hover:border-purple-500'}`}>
          <div className="mb-6">
            <h3 className="text-xl font-cyber text-white group-hover:text-purple-500 transition-colors uppercase tracking-widest mb-2 flex items-center gap-2">
              <Crown size={18} /> Agency
            </h3>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">$99</span>
              <span className="text-cyber-muted font-mono text-xs">/MO</span>
            </div>
            <p className="text-xs text-cyber-muted mt-4 font-mono">For high-volume domination.</p>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-sm text-cyber-text">
              <Check size={16} className="text-purple-500" /> <span className="text-white font-bold">50+ Uploads</span> / Month
            </li>
             <li className="flex items-center gap-3 text-sm text-cyber-text">
              <Check size={16} className="text-purple-500" /> Resolution: <span className="text-white font-bold">Uncompressed 4K+</span>
            </li>
            <li className="flex items-center gap-3 text-sm text-cyber-text">
              <Check size={16} className="text-purple-500" /> White-label Reports
            </li>
            <li className="flex items-center gap-3 text-sm text-cyber-text">
              <Check size={16} className="text-purple-500" /> Priority: <span className="text-white font-bold">Zero-Queue</span>
            </li>
            <li className="flex items-center gap-3 text-sm text-cyber-text">
              <Check size={16} className="text-purple-500" /> API Access & Webhooks
            </li>
          </ul>
          <button 
            onClick={() => onSelectTier(UserTier.AGENCY)}
            className={`w-full py-3 border font-bold uppercase text-xs tracking-widest transition-all ${currentTier === UserTier.AGENCY ? 'bg-purple-900/20 text-purple-500 border-purple-500' : 'border-cyber-border text-white group-hover:border-purple-500 group-hover:text-purple-500'}`}
             disabled={currentTier === UserTier.AGENCY}
          >
            {currentTier === UserTier.AGENCY ? 'Active Plan' : 'Select Agency Plan'}
          </button>
        </div>
      </div>

      <div className="mt-16 border-t border-cyber-border pt-8 text-center">
        <div className="inline-flex items-center gap-2 text-cyber-muted text-xs font-mono border border-cyber-border px-4 py-2 rounded bg-cyber-panel">
          <Shield size={14} className="text-green-500" />
          SECURE_PAYMENT_GATEWAY // STRIPE_ENCRYPTED
        </div>
      </div>
    </div>
  );
};