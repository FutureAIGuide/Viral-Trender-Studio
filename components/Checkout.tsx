import React, { useState } from 'react';
import { UserTier } from '../types';
import { CreditCard, Shield, Lock, Calendar, User, ArrowLeft, Zap, AlertCircle } from 'lucide-react';
import { createStripeCheckout, getSupabase } from '../services/supabase';
import { trackEvent } from '../services/analytics';

interface CheckoutProps {
  selectedTier: UserTier;
  onSuccess: () => void;
  onFailure: () => void;
  onCancel: () => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ selectedTier, onSuccess, onFailure, onCancel }) => {
  const [processing, setProcessing] = useState(false);
  const [simulateDecline, setSimulateDecline] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pricing mapping
  const prices = {
    [UserTier.FREE]: 0,
    [UserTier.CREATOR]: 29,
    [UserTier.AGENCY]: 99
  };

  const stripePriceIds = {
      [UserTier.CREATOR]: 'price_creator_id',
      [UserTier.AGENCY]: 'price_agency_id'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);
    trackEvent('checkout_started', { tier: selectedTier });

    const supabase = getSupabase();

    if (supabase) {
        // --- REAL BACKEND MODE ---
        try {
            // Call Supabase Edge Function to create Stripe Session
            const { url } = await createStripeCheckout(
                stripePriceIds[selectedTier],
                window.location.origin + '/?payment=success',
                window.location.origin + '/?payment=cancelled'
            );
            
            // Redirect to Stripe
            if (url) {
                window.location.href = url;
            } else {
                throw new Error("No payment URL returned");
            }
        } catch (e: any) {
            console.error("Stripe Error", e);
            setError("PAYMENT_GATEWAY_ERROR: " + e.message);
            setProcessing(false);
            trackEvent('checkout_failed', { error: e.message });
        }
    } else {
        // --- MOCK MODE ---
        setTimeout(() => {
            setProcessing(false);
            if (simulateDecline) {
                trackEvent('checkout_declined_mock');
                onFailure();
            } else {
                trackEvent('checkout_success_mock');
                onSuccess();
            }
        }, 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pt-8 pb-12 animate-fadeIn">
      <button 
        onClick={onCancel}
        className="flex items-center gap-2 text-cyber-muted hover:text-white mb-8 transition-colors text-xs font-mono uppercase tracking-widest"
      >
        <ArrowLeft size={16} /> Return to Plans
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Form */}
        <div className="bg-cyber-black border border-cyber-border p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <CreditCard size={120} />
          </div>

          <div className="relative z-10">
            <h2 className="text-2xl font-cyber font-bold text-white mb-6 flex items-center gap-2">
              <Lock className="text-cyber-orange" size={24} /> SECURE_CHECKOUT
            </h2>

            {error && (
                <div className="bg-red-900/20 text-red-500 p-4 mb-4 text-xs font-mono border border-red-500/50">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Only show mock fields if Supabase is NOT active, otherwise show "Redirecting to Stripe" info */}
              {!getSupabase() ? (
                  <>
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-cyber-muted uppercase">Cardholder Name</label>
                        <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted" size={16} />
                        <input 
                            type="text" 
                            placeholder="ALEXANDER MURPHY"
                            className="w-full bg-cyber-panel border border-cyber-border text-white pl-10 pr-4 py-3 focus:outline-none focus:border-cyber-orange font-mono text-sm"
                            required
                        />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-mono text-cyber-muted uppercase">Card Number</label>
                        <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted" size={16} />
                        <input 
                            type="text" 
                            placeholder="0000 0000 0000 0000"
                            maxLength={19}
                            className="w-full bg-cyber-panel border border-cyber-border text-white pl-10 pr-4 py-3 focus:outline-none focus:border-cyber-orange font-mono text-sm tracking-widest"
                            required
                        />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                        <label className="text-xs font-mono text-cyber-muted uppercase">Expiration</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted" size={16} />
                            <input 
                            type="text" 
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full bg-cyber-panel border border-cyber-border text-white pl-10 pr-4 py-3 focus:outline-none focus:border-cyber-orange font-mono text-sm"
                            required
                            />
                        </div>
                        </div>
                        <div className="space-y-2">
                        <label className="text-xs font-mono text-cyber-muted uppercase">CVC</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted" size={16} />
                            <input 
                            type="text" 
                            placeholder="123"
                            maxLength={4}
                            className="w-full bg-cyber-panel border border-cyber-border text-white pl-10 pr-4 py-3 focus:outline-none focus:border-cyber-orange font-mono text-sm"
                            required
                            />
                        </div>
                        </div>
                    </div>

                    {/* Dev Toggle */}
                    <div className="py-2 flex items-center gap-2">
                        <input 
                        type="checkbox" 
                        id="decline" 
                        checked={simulateDecline}
                        onChange={(e) => setSimulateDecline(e.target.checked)}
                        className="accent-red-500"
                        />
                        <label htmlFor="decline" className="text-xs text-cyber-muted font-mono cursor-pointer select-none">
                        [DEV] Simulate Declined Transaction
                        </label>
                    </div>
                  </>
              ) : (
                  <div className="text-center py-8">
                      <p className="text-cyber-muted text-sm mb-4">
                          You will be redirected to our secure payment partner (Stripe) to complete your purchase.
                      </p>
                  </div>
              )}

              <button 
                type="submit"
                disabled={processing}
                className="w-full bg-cyber-orange hover:bg-white text-black font-bold py-4 uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>PROCESSING <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div></>
                ) : (
                  <>PROCEED TO PAYMENT (${prices[selectedTier]})</>
                )}
              </button>
              
              <div className="flex items-center justify-center gap-2 text-cyber-muted text-[10px] font-mono mt-4">
                <Lock size={10} /> 256-BIT ENCRYPTED TRANSACTION
              </div>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className={`bg-cyber-panel border-2 p-8 ${selectedTier === UserTier.AGENCY ? 'border-purple-500' : 'border-cyber-orange'}`}>
            <h3 className="text-xs font-mono text-cyber-muted uppercase tracking-widest mb-4">Order Summary</h3>
            
            <div className="flex justify-between items-start mb-6 border-b border-cyber-border pb-6">
              <div>
                <h4 className="text-2xl font-cyber font-bold text-white uppercase">{selectedTier} PLAN</h4>
                <p className="text-sm text-cyber-muted mt-1">Monthly Subscription</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-white">${prices[selectedTier]}</span>
                <span className="text-xs text-cyber-muted block">/mo</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
               <li className="flex items-center gap-3 text-sm text-white">
                 <Zap size={14} className="text-cyber-orange" /> {selectedTier === UserTier.AGENCY ? '50+' : '15'} Uploads Included
               </li>
               <li className="flex items-center gap-3 text-sm text-white">
                 <Zap size={14} className="text-cyber-orange" /> AI Virality Analysis
               </li>
               <li className="flex items-center gap-3 text-sm text-white">
                 <Zap size={14} className="text-cyber-orange" /> Priority Processing
               </li>
            </ul>

            <div className="flex justify-between items-center pt-4 border-t border-cyber-border">
              <span className="font-bold text-white uppercase tracking-wider">Total Due Today</span>
              <span className="font-bold text-cyber-orange text-xl">${prices[selectedTier]}.00</span>
            </div>
          </div>

          <div className="bg-cyber-black border border-cyber-border p-4 flex items-start gap-3">
             <AlertCircle className="text-cyber-muted flex-shrink-0" size={16} />
             <p className="text-[10px] text-cyber-muted leading-relaxed font-mono">
               By confirming your subscription, you allow Future AI Guide to charge your card for this payment and future payments in accordance with our terms. You can cancel at any time.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};