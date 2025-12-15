import React, { useState } from 'react';
import { User, Mail, Lock, ArrowRight, UserPlus, LogIn, Sparkles } from 'lucide-react';

interface AuthProps {
  onSuccess: () => void;
  onSwitchMode: () => void;
}

export const UserLogin: React.FC<AuthProps> = ({ onSuccess, onSwitchMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock login delay
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 1500);
  };

  return (
    <div className="max-w-md w-full mx-auto mt-20 p-8 bg-cyber-black border border-cyber-border relative overflow-hidden animate-fadeIn">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <LogIn size={100} />
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-cyber font-bold text-white uppercase tracking-wider mb-2">
          Welcome <span className="text-cyber-orange">Back</span>
        </h2>
        <p className="text-cyber-muted text-xs font-mono">ESTABLISH_NEURAL_LINK</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="space-y-2">
          <label className="text-[10px] font-mono text-cyber-muted uppercase flex items-center gap-2">
            <Mail size={12} /> Email Address
          </label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-cyber-panel border border-cyber-border text-white px-4 py-3 focus:outline-none focus:border-cyber-orange font-mono transition-colors text-sm"
            placeholder="user@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-mono text-cyber-muted uppercase flex items-center gap-2">
            <Lock size={12} /> Password
          </label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-cyber-panel border border-cyber-border text-white px-4 py-3 focus:outline-none focus:border-cyber-orange font-mono transition-colors text-sm"
            placeholder="••••••••"
            required
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-cyber-orange hover:bg-white text-black font-bold py-4 uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>Initializing <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div></>
          ) : (
            <>Log In <ArrowRight size={16} /></>
          )}
        </button>
      </form>

      <div className="mt-8 text-center pt-6 border-t border-cyber-border">
        <p className="text-cyber-muted text-xs">Don't have an identity?</p>
        <button 
          onClick={onSwitchMode}
          className="text-cyber-orange font-bold text-sm uppercase tracking-wider hover:text-white transition-colors mt-2"
        >
          Create Account
        </button>
      </div>
    </div>
  );
};

export const UserSignup: React.FC<AuthProps> = ({ onSuccess, onSwitchMode }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock signup delay
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 1500);
  };

  return (
    <div className="max-w-md w-full mx-auto mt-20 p-8 bg-cyber-black border border-cyber-border relative overflow-hidden animate-fadeIn">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <UserPlus size={100} />
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-cyber font-bold text-white uppercase tracking-wider mb-2">
          Join the <span className="text-cyber-orange">Grid</span>
        </h2>
        <p className="text-cyber-muted text-xs font-mono">INITIALIZE_NEW_USER_PROTOCOL</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="space-y-2">
          <label className="text-[10px] font-mono text-cyber-muted uppercase flex items-center gap-2">
            <User size={12} /> Username
          </label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-cyber-panel border border-cyber-border text-white px-4 py-3 focus:outline-none focus:border-cyber-orange font-mono transition-colors text-sm"
            placeholder="Neo"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-mono text-cyber-muted uppercase flex items-center gap-2">
            <Mail size={12} /> Email Address
          </label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-cyber-panel border border-cyber-border text-white px-4 py-3 focus:outline-none focus:border-cyber-orange font-mono transition-colors text-sm"
            placeholder="user@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-mono text-cyber-muted uppercase flex items-center gap-2">
            <Lock size={12} /> Password
          </label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-cyber-panel border border-cyber-border text-white px-4 py-3 focus:outline-none focus:border-cyber-orange font-mono transition-colors text-sm"
            placeholder="••••••••"
            required
          />
        </div>

        <div className="bg-cyber-panel p-3 border border-cyber-border text-[10px] text-cyber-muted font-mono flex items-start gap-2">
            <Sparkles size={12} className="text-cyber-orange flex-shrink-0 mt-0.5" />
            <span>Includes 14-day free trial of Creator Tier features.</span>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-white hover:bg-cyber-orange text-black font-bold py-4 uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>Creating Identity...</>
          ) : (
            <>Sign Up <ArrowRight size={16} /></>
          )}
        </button>
      </form>

      <div className="mt-8 text-center pt-6 border-t border-cyber-border">
        <p className="text-cyber-muted text-xs">Already authenticated?</p>
        <button 
          onClick={onSwitchMode}
          className="text-white font-bold text-sm uppercase tracking-wider hover:text-cyber-orange transition-colors mt-2"
        >
          Access Terminal
        </button>
      </div>
    </div>
  );
};