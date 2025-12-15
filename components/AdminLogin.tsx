import React, { useState } from 'react';
import { Shield, Lock, ChevronRight, AlertTriangle, User } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    // Mock authentication delay
    setTimeout(() => {
      // Updated credentials verification per user request
      if (email === 'matt@futureaiguide.com' && password === 'M.a.t.t.85!!..') {
        onLogin();
      } else {
        setError(true);
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 animate-fadeIn">
      <div className="max-w-md w-full bg-cyber-black border border-cyber-border relative overflow-hidden group">
         {/* Animated Top Border */}
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse"></div>

         <div className="p-8 space-y-8">
            <div className="text-center">
                <div className="w-20 h-20 bg-red-900/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                    <Shield size={40} className="text-red-500" />
                </div>
                <h2 className="text-2xl font-cyber font-bold text-white uppercase tracking-widest">
                    Restricted <span className="text-red-500">Access</span>
                </h2>
                <p className="text-xs text-cyber-muted font-mono mt-2">
                    AUTHENTICATION_REQUIRED // LEVEL_5_CLEARANCE
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-mono text-red-500 uppercase flex items-center gap-2">
                        <User size={10} /> Admin Identity
                    </label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="OPERATOR_EMAIL"
                        className="w-full bg-cyber-panel border border-cyber-border text-white text-center px-4 py-3 focus:outline-none focus:border-red-500 font-mono tracking-widest transition-colors"
                        autoFocus
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-mono text-red-500 uppercase flex items-center gap-2">
                        <Lock size={10} /> Security Key
                    </label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="ENTER_PASSCODE"
                        className="w-full bg-cyber-panel border border-cyber-border text-white text-center px-4 py-3 focus:outline-none focus:border-red-500 font-mono tracking-widest transition-colors"
                    />
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-red-500 text-xs font-mono justify-center animate-pulse">
                        <AlertTriangle size={12} />
                        <span>INVALID_CREDENTIALS: ACCESS_DENIED</span>
                    </div>
                )}

                <div className="flex gap-4">
                    <button 
                        type="button"
                        onClick={onCancel}
                        className="flex-1 border border-cyber-border text-cyber-muted py-3 text-xs font-bold uppercase hover:text-white hover:border-white transition-colors"
                    >
                        Abort
                    </button>
                    <button 
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : <>Authenticate <ChevronRight size={14} /></>}
                    </button>
                </div>
            </form>
         </div>
      </div>
    </div>
  );
};