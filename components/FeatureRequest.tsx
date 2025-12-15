import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle, XCircle, AlertTriangle, Lightbulb } from 'lucide-react';

interface FeatureRequestProps {
  onCancel: () => void;
}

export const FeatureRequest: React.FC<FeatureRequestProps> = ({ onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    description: '',
    type: 'FEATURE'
  });
  const [status, setStatus] = useState<'IDLE' | 'SENDING' | 'SUCCESS' | 'DECLINED'>('IDLE');
  const [simulateError, setSimulateError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('SENDING');

    // Simulate Network Request
    setTimeout(() => {
      if (simulateError) {
        setStatus('DECLINED');
      } else {
        setStatus('SUCCESS');
        // In a real app, this would send data to feature@futureaiguide.com via backend
        console.log('Sending request to feature@futureaiguide.com', formData);
      }
    }, 2000);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      title: '',
      description: '',
      type: 'FEATURE'
    });
    setStatus('IDLE');
  };

  if (status === 'SUCCESS') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
        <div className="max-w-md w-full bg-cyber-black border border-green-500 p-8 relative overflow-hidden shadow-[0_0_50px_rgba(34,197,94,0.1)] text-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-green-500 animate-pulse"></div>
            
            <div className="w-20 h-20 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/50">
                 <CheckCircle size={40} className="text-green-500" />
            </div>

            <h2 className="text-2xl font-cyber font-bold text-white mb-2 uppercase tracking-tighter">
              Submission <span className="text-green-500">Received</span>
            </h2>
            
            <p className="text-cyber-muted text-sm mb-6 leading-relaxed">
              Your feature request has been successfully transmitted to <span className="text-white font-mono">feature@futureaiguide.com</span>. Our engineering team will analyze the feasibility.
            </p>

            <button 
              onClick={onCancel}
              className="w-full bg-green-500 text-black font-bold py-3 uppercase tracking-widest hover:bg-white transition-colors"
            >
              Return to Dashboard
            </button>
        </div>
      </div>
    );
  }

  if (status === 'DECLINED') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
        <div className="max-w-md w-full bg-cyber-black border border-red-500 p-8 relative overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.1)] text-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse"></div>
            
            <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/50">
                 <XCircle size={40} className="text-red-500" />
            </div>

            <h2 className="text-2xl font-cyber font-bold text-white mb-2 uppercase tracking-tighter">
              Submission <span className="text-red-500">Declined</span>
            </h2>
            
            <div className="bg-red-900/10 p-4 mb-6 border border-red-500/30 flex items-start gap-3 text-left">
                <AlertTriangle className="text-red-500 flex-shrink-0" size={20} />
                <div>
                    <p className="text-red-500 text-xs font-bold font-mono uppercase mb-1">Error Code: 503_SERVICE_UNAVAILABLE</p>
                    <p className="text-cyber-muted text-xs leading-relaxed">
                        Unable to establish connection with the feature request server. Please try again later.
                    </p>
                </div>
            </div>

            <div className="flex gap-4">
                <button 
                  onClick={() => setStatus('IDLE')}
                  className="flex-1 bg-transparent border border-cyber-border text-white font-bold py-3 uppercase tracking-widest hover:bg-cyber-panel transition-colors"
                >
                  Edit Request
                </button>
                <button 
                  onClick={handleSubmit}
                  className="flex-1 bg-red-500 text-white font-bold py-3 uppercase tracking-widest hover:bg-red-400 transition-colors"
                >
                  Retry
                </button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pt-8 pb-12 animate-fadeIn">
        <div className="mb-10 border-b border-cyber-border pb-6 flex justify-between items-end">
            <div>
                <h2 className="text-4xl font-cyber font-bold text-white uppercase tracking-tighter flex items-center gap-4">
                    <Lightbulb className="text-cyber-orange" size={40} />
                    Feature <span className="text-cyber-orange">Request</span>
                </h2>
                <p className="text-cyber-muted font-mono text-sm mt-4">
                    CONTRIBUTE_TO_THE_ROADMAP // SHAPE_THE_FUTURE
                </p>
            </div>
            <button onClick={onCancel} className="text-cyber-muted hover:text-white uppercase text-xs font-bold tracking-widest">Cancel</button>
        </div>

        <div className="bg-cyber-black border border-cyber-border p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                <MessageSquare size={120} />
            </div>

            <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-cyber-muted uppercase">Your Name</label>
                        <input 
                            type="text" 
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-cyber-panel border border-cyber-border text-white px-4 py-3 focus:outline-none focus:border-cyber-orange font-mono text-sm"
                            placeholder="OPERATOR_NAME"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-cyber-muted uppercase">Email Address</label>
                        <input 
                            type="email" 
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            className="w-full bg-cyber-panel border border-cyber-border text-white px-4 py-3 focus:outline-none focus:border-cyber-orange font-mono text-sm"
                            placeholder="you@futureaiguide.com"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-mono text-cyber-muted uppercase">Request Type</label>
                    <div className="flex gap-4">
                        {['FEATURE', 'BUG', 'IMPROVEMENT'].map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setFormData({...formData, type})}
                                className={`flex-1 py-3 border text-xs font-bold uppercase transition-all ${
                                    formData.type === type 
                                    ? 'bg-cyber-orange text-black border-cyber-orange' 
                                    : 'bg-cyber-black border-cyber-border text-cyber-muted hover:text-white'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-mono text-cyber-muted uppercase">Feature Title</label>
                    <input 
                        type="text" 
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        className="w-full bg-cyber-panel border border-cyber-border text-white px-4 py-3 focus:outline-none focus:border-cyber-orange font-mono text-sm"
                        placeholder="Brief summary of your idea"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-mono text-cyber-muted uppercase">Description</label>
                    <textarea 
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full h-32 bg-cyber-panel border border-cyber-border text-white px-4 py-3 focus:outline-none focus:border-cyber-orange font-mono text-sm resize-none"
                        placeholder="Describe the feature in detail..."
                        required
                    />
                </div>

                {/* Dev Toggle for Decline Simulation */}
                <div className="py-2 flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        id="simulateError" 
                        checked={simulateError}
                        onChange={(e) => setSimulateError(e.target.checked)}
                        className="accent-red-500"
                    />
                    <label htmlFor="simulateError" className="text-[10px] text-cyber-muted font-mono cursor-pointer select-none">
                        [DEV] Simulate Server Error (Decline Submission)
                    </label>
                </div>

                <button 
                    type="submit"
                    disabled={status === 'SENDING'}
                    className="w-full bg-cyber-orange hover:bg-white text-black font-bold py-4 uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {status === 'SENDING' ? (
                        <>TRANSMITTING <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div></>
                    ) : (
                        <>Submit Request <Send size={16} /></>
                    )}
                </button>
            </form>
        </div>
    </div>
  );
};