import React, { useState, useEffect } from 'react';
import { Key, Save, Trash2, ShieldCheck, Cpu, CheckCircle, Mic2, Linkedin, Twitter } from 'lucide-react';
import { AIProvider } from '../types';

export const Settings: React.FC = () => {
  // Config State
  const [activeProvider, setActiveProvider] = useState<AIProvider>(AIProvider.GEMINI);
  
  // AI Keys
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [claudeKey, setClaudeKey] = useState('');
  const [elevenLabsKey, setElevenLabsKey] = useState('');

  // Social Connections
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [linkedinConnected, setLinkedinConnected] = useState(false);

  // Models
  const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash');
  const [openaiModel, setOpenaiModel] = useState('gpt-4o');
  const [claudeModel, setClaudeModel] = useState('claude-3-5-sonnet-latest');

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load from LocalStorage
    setGeminiKey(localStorage.getItem('GEMINI_KEY') || '');
    setOpenaiKey(localStorage.getItem('OPENAI_KEY') || '');
    setClaudeKey(localStorage.getItem('CLAUDE_KEY') || '');
    setElevenLabsKey(localStorage.getItem('ELEVENLABS_KEY') || '');

    setGeminiModel(localStorage.getItem('GEMINI_MODEL') || 'gemini-2.5-flash');
    setOpenaiModel(localStorage.getItem('OPENAI_MODEL') || 'gpt-4o');
    setClaudeModel(localStorage.getItem('CLAUDE_MODEL') || 'claude-3-5-sonnet-latest');

    // Load Mock Social State
    setTwitterConnected(localStorage.getItem('TWITTER_CONNECTED') === 'true');
    setLinkedinConnected(localStorage.getItem('LINKEDIN_CONNECTED') === 'true');

    const storedProvider = localStorage.getItem('ACTIVE_PROVIDER');
    if (storedProvider && Object.values(AIProvider).includes(storedProvider as AIProvider)) {
        setActiveProvider(storedProvider as AIProvider);
    }
  }, []);

  const handleSave = () => {
    // Save to LocalStorage
    localStorage.setItem('GEMINI_KEY', geminiKey.trim());
    localStorage.setItem('OPENAI_KEY', openaiKey.trim());
    localStorage.setItem('CLAUDE_KEY', claudeKey.trim());
    localStorage.setItem('ELEVENLABS_KEY', elevenLabsKey.trim());

    localStorage.setItem('GEMINI_MODEL', geminiModel);
    localStorage.setItem('OPENAI_MODEL', openaiModel);
    localStorage.setItem('CLAUDE_MODEL', claudeModel);

    localStorage.setItem('ACTIVE_PROVIDER', activeProvider);

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    
    // Dispatch event to update Layout and other listeners
    window.dispatchEvent(new Event('storage'));
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear all stored AI credentials?")) {
        // Only clear AI related keys
        localStorage.removeItem('GEMINI_KEY');
        localStorage.removeItem('OPENAI_KEY');
        localStorage.removeItem('CLAUDE_KEY');
        localStorage.removeItem('ELEVENLABS_KEY');
        localStorage.removeItem('TWITTER_CONNECTED');
        localStorage.removeItem('LINKEDIN_CONNECTED');
        
        setGeminiKey('');
        setOpenaiKey('');
        setClaudeKey('');
        setElevenLabsKey('');
        setTwitterConnected(false);
        setLinkedinConnected(false);
        setActiveProvider(AIProvider.GEMINI);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        window.dispatchEvent(new Event('storage'));
    }
  };

  const toggleSocial = (platform: 'TWITTER' | 'LINKEDIN') => {
      // Simulate OAuth Window
      const width = 600;
      const height = 600;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;
      
      const popup = window.open('', 'Connect', `width=${width},height=${height},top=${top},left=${left}`);
      if(popup) {
          popup.document.write(`
            <body style="background:#111; color:#fff; display:flex; justify-content:center; align-items:center; height:100%; font-family:monospace; flex-direction:column;">
                <h2>CONNECTING TO ${platform}...</h2>
                <p>Simulating OAuth handshake...</p>
            </body>
          `);
          setTimeout(() => {
              popup.close();
              if (platform === 'TWITTER') {
                  setTwitterConnected(!twitterConnected);
                  localStorage.setItem('TWITTER_CONNECTED', (!twitterConnected).toString());
              } else {
                  setLinkedinConnected(!linkedinConnected);
                  localStorage.setItem('LINKEDIN_CONNECTED', (!linkedinConnected).toString());
              }
          }, 1500);
      }
  };

  const ProviderCard = ({ 
      provider, 
      label, 
      icon: Icon, 
      colorClass, 
      apiKey, 
      setApiKey, 
      model, 
      setModel, 
      options 
  }: any) => (
      <div className={`border p-6 relative transition-all duration-300 ${
          activeProvider === provider 
          ? `bg-cyber-panel border-${colorClass}` 
          : 'bg-cyber-black border-cyber-border opacity-60 hover:opacity-100'
      }`}>
          {activeProvider === provider && (
              <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold text-black uppercase bg-${colorClass}`}>
                  Active
              </div>
          )}
          
          <div className="flex items-center gap-3 mb-6">
              <div 
                  onClick={() => setActiveProvider(provider)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer ${
                      activeProvider === provider ? `border-${colorClass}` : 'border-cyber-muted'
                  }`}
              >
                  {activeProvider === provider && <div className={`w-3 h-3 rounded-full bg-${colorClass}`}></div>}
              </div>
              <Icon size={24} className={`text-${colorClass}`} />
              <h3 className="text-xl font-cyber font-bold text-white uppercase">{label}</h3>
          </div>

          <div className="space-y-4">
              <div className="space-y-1">
                  <label className="text-[10px] font-mono text-cyber-muted uppercase">API Key</label>
                  <input 
                      type="password" 
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={`sk-...`}
                      className="w-full bg-cyber-black border border-cyber-border text-white px-3 py-2 focus:outline-none focus:border-white font-mono text-xs"
                  />
              </div>

              <div className="space-y-1">
                  <label className="text-[10px] font-mono text-cyber-muted uppercase">Model Selection</label>
                  <select 
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full bg-cyber-black border border-cyber-border text-white px-3 py-2 focus:outline-none focus:border-white font-mono text-xs"
                  >
                      {options.map((opt: any) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                  </select>
              </div>
          </div>
      </div>
  );

  return (
    <div className="max-w-4xl mx-auto pt-10 pb-20">
      <div className="mb-10 border-b border-cyber-border pb-6">
        <h2 className="text-4xl font-cyber font-bold text-white uppercase tracking-tighter flex items-center gap-4">
          <Cpu className="text-cyber-orange" size={40} />
          AI & Social <span className="text-cyber-orange">Configuration</span>
        </h2>
        <p className="text-cyber-muted font-mono text-sm mt-4">
          INTELLIGENCE_ENGINE // VOICE_SYNTHESIS // SOCIAL_UPLINK
        </p>
      </div>

      <div className="space-y-12">
          
          {/* AI Providers Section */}
          <section className="space-y-6">
             <h3 className="text-lg font-cyber text-cyber-orange uppercase tracking-widest border-l-4 border-cyber-orange pl-4">Core Intelligence</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {/* GEMINI */}
                <ProviderCard 
                    provider={AIProvider.GEMINI}
                    label="Google Gemini"
                    icon={Key} 
                    colorClass="blue-500"
                    apiKey={geminiKey}
                    setApiKey={setGeminiKey}
                    model={geminiModel}
                    setModel={setGeminiModel}
                    options={[
                        { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
                        { value: 'gemini-3-pro-preview', label: 'Gemini 2.5 Pro' }
                    ]}
                />

                {/* OPENAI */}
                <ProviderCard 
                    provider={AIProvider.OPENAI}
                    label="OpenAI"
                    icon={Cpu}
                    colorClass="green-500"
                    apiKey={openaiKey}
                    setApiKey={setOpenaiKey}
                    model={openaiModel}
                    setModel={setOpenaiModel}
                    options={[
                        { value: 'gpt-4o', label: 'GPT-4o' },
                        { value: 'gpt-4o-mini', label: 'GPT-4o Mini' }
                    ]}
                />

                {/* CLAUDE */}
                <ProviderCard 
                    provider={AIProvider.CLAUDE}
                    label="Anthropic"
                    icon={ShieldCheck}
                    colorClass="purple-500"
                    apiKey={claudeKey}
                    setApiKey={setClaudeKey}
                    model={claudeModel}
                    setModel={setClaudeModel}
                    options={[
                        { value: 'claude-3-5-sonnet-latest', label: 'Claude 3.5 Sonnet' },
                        { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' }
                    ]}
                />
             </div>
          </section>

          {/* Voice Synthesis Section */}
          <section className="space-y-6">
              <h3 className="text-lg font-cyber text-cyber-orange uppercase tracking-widest border-l-4 border-cyber-orange pl-4">Voice Synthesis</h3>
              <div className="bg-cyber-black border border-cyber-border p-6 flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-1 space-y-2">
                       <h4 className="text-white font-bold flex items-center gap-2"><Mic2 size={18} /> ElevenLabs API</h4>
                       <p className="text-xs text-cyber-muted">Enable ultra-realistic AI voice generation for scripts.</p>
                       <input 
                          type="password" 
                          value={elevenLabsKey}
                          onChange={(e) => setElevenLabsKey(e.target.value)}
                          placeholder="xi-..."
                          className="w-full bg-cyber-panel border border-cyber-border text-white px-4 py-3 focus:outline-none focus:border-cyber-orange font-mono text-xs mt-2"
                      />
                  </div>
              </div>
          </section>

          {/* Social Connections */}
          <section className="space-y-6">
              <h3 className="text-lg font-cyber text-cyber-orange uppercase tracking-widest border-l-4 border-cyber-orange pl-4">Social Uplink</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`border p-6 flex items-center justify-between ${twitterConnected ? 'bg-cyber-panel border-blue-400' : 'bg-cyber-black border-cyber-border'}`}>
                      <div className="flex items-center gap-4">
                          <Twitter size={24} className={twitterConnected ? 'text-blue-400' : 'text-cyber-muted'} />
                          <div>
                              <div className="text-white font-bold">X / Twitter</div>
                              <div className="text-[10px] font-mono text-cyber-muted">{twitterConnected ? 'CONNECTED AS @USER' : 'NO UPLINK'}</div>
                          </div>
                      </div>
                      <button 
                         onClick={() => toggleSocial('TWITTER')}
                         className={`text-xs font-bold px-4 py-2 uppercase transition-all ${twitterConnected ? 'bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-blue-500 text-white hover:bg-white hover:text-black'}`}
                      >
                          {twitterConnected ? 'Disconnect' : 'Connect'}
                      </button>
                  </div>

                  <div className={`border p-6 flex items-center justify-between ${linkedinConnected ? 'bg-cyber-panel border-blue-700' : 'bg-cyber-black border-cyber-border'}`}>
                      <div className="flex items-center gap-4">
                          <Linkedin size={24} className={linkedinConnected ? 'text-blue-700' : 'text-cyber-muted'} />
                          <div>
                              <div className="text-white font-bold">LinkedIn</div>
                              <div className="text-[10px] font-mono text-cyber-muted">{linkedinConnected ? 'CONNECTED' : 'NO UPLINK'}</div>
                          </div>
                      </div>
                      <button 
                         onClick={() => toggleSocial('LINKEDIN')}
                         className={`text-xs font-bold px-4 py-2 uppercase transition-all ${linkedinConnected ? 'bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-blue-700 text-white hover:bg-white hover:text-black'}`}
                      >
                          {linkedinConnected ? 'Disconnect' : 'Connect'}
                      </button>
                  </div>
              </div>
          </section>

          <div className="sticky bottom-4 z-50">
             <div className="bg-cyber-black border border-cyber-border p-4 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleSave}
                        className="bg-cyber-orange text-black font-bold px-8 py-3 uppercase tracking-wider hover:bg-white transition-colors flex items-center gap-2"
                    >
                        <Save size={18} /> Save AI Configuration
                    </button>
                    {saved && (
                        <span className="text-green-500 text-sm font-mono flex items-center gap-2 animate-fadeIn">
                            <CheckCircle size={14} /> KEYS_UPDATED
                        </span>
                    )}
                </div>
                
                <button 
                    onClick={handleClear}
                    className="text-red-500 text-xs font-bold uppercase hover:text-white flex items-center gap-2"
                >
                    <Trash2 size={14} /> Reset AI Keys
                </button>
             </div>
          </div>
      </div>
    </div>
  );
};