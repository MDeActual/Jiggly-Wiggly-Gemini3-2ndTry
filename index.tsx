import React, { useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI } from "@google/genai";

// --- Icons (Inline SVGs for reliability) ---
const ShieldCheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>
);
const BrainCircuitIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" /><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" /><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" /><path d="M17.599 6.5a3 3 0 0 0 .399-1.375" /><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" /><path d="M3.477 10.896a4 4 0 0 1 .585-.396" /><path d="M19.938 10.5a4 4 0 0 1 .585.396" /><path d="M6 18a4 4 0 0 1-1.97-1.375" /><path d="M18 18a4 4 0 0 0 1.97-1.375" /></svg>
);
const CloudIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17.5 19c0-3.037-2.463-5.5-5.5-5.5S6.5 15.963 6.5 19" /><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" /></svg>
);
const LockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
);
const CpuIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M15 2v2" /><path d="M15 20v2" /><path d="M2 15h2" /><path d="M2 9h2" /><path d="M20 15h2" /><path d="M20 9h2" /><path d="M9 2v2" /><path d="M9 20v2" /></svg>
);
const MessageSquareIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
);
const XIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
);
const SendIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
);

// --- Type Definitions ---

type ChatMessage = {
  role: 'user' | 'model';
  text: string;
};

// --- Components ---

const ServiceCard = ({ title, icon, features, accentColor }: { title: string, icon: React.ReactNode, features: string[], accentColor: string }) => (
  <div className={`group relative p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-${accentColor} transition-all duration-300 hover:shadow-2xl overflow-hidden`}>
    <div className={`absolute inset-0 bg-gradient-to-br from-${accentColor}/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
    <div className={`mb-6 p-3 rounded-lg bg-slate-950 w-fit text-${accentColor}`}>
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-brand-cyan transition-colors">{title}</h3>
    <ul className="space-y-3">
      {features.map((f, i) => (
        <li key={i} className="flex items-center text-slate-400">
          <div className={`w-1.5 h-1.5 rounded-full bg-${accentColor} mr-3`} />
          {f}
        </li>
      ))}
    </ul>
  </div>
);

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello. I am Nexus, your AI Cloud Security Consultant. How can I assist you with your Microsoft Cloud strategy today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Using gemini-2.5-flash for responsiveness
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            { role: 'user', parts: [{ text: userMsg }]}
        ],
        config: {
            systemInstruction: "You are Nexus, an elite AI consultant for a next-gen MSP/MSSP/CSP agency called NexusGuard AI. You specialize in Microsoft Cloud (Azure, M365), Cybersecurity (Zero Trust, Defender), and AI adoption (Copilot). Your tone is professional, futuristic, and security-conscious. Concise answers. Focus on business value and technical accuracy."
        }
      });

      const text = response.text || "I apologize, I am processing high-volume security telemetry. Please try again.";
      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Secure connection interrupted. Please verify your network." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-96 max-w-[90vw] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="font-mono text-sm font-bold text-brand-cyan">NEXUS_AI_AGENT_V2</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
              <XIcon className="w-5 h-5" />
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 h-80 overflow-y-auto p-4 space-y-4 bg-slate-900/95">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
                  m.role === 'user' 
                    ? 'bg-brand-purple/20 text-brand-purple border border-brand-purple/30' 
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 text-slate-300 border border-slate-700 p-3 rounded-lg text-xs font-mono animate-pulse">
                  ANALYZING_QUERY...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about Azure Security..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-cyan transition-colors"
            />
            <button 
              onClick={handleSend}
              disabled={loading}
              className="bg-brand-cyan hover:bg-cyan-600 text-black p-2 rounded-md transition-colors disabled:opacity-50"
            >
              <SendIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-3 bg-gradient-to-r from-brand-purple to-brand-cyan p-4 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all duration-300"
      >
        <span className="hidden group-hover:block font-bold text-black text-sm pr-2 animate-in fade-in slide-in-from-right-2">
          Ask AI Advisor
        </span>
        <BrainCircuitIcon className="w-6 h-6 text-black" />
      </button>
    </div>
  );
};

const Header = () => (
  <nav className="fixed w-full z-40 glass">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-20">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-brand-purple to-brand-cyan p-1.5 rounded-lg">
             <ShieldCheckIcon className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">NEXUS<span className="text-brand-cyan">GUARD</span></span>
        </div>
        <div className="hidden md:block">
          <div className="ml-10 flex items-baseline space-x-8">
            <a href="#" className="hover:text-brand-cyan px-3 py-2 rounded-md text-sm font-medium transition-colors">Services</a>
            <a href="#" className="hover:text-brand-cyan px-3 py-2 rounded-md text-sm font-medium transition-colors">Solutions</a>
            <a href="#" className="hover:text-brand-cyan px-3 py-2 rounded-md text-sm font-medium transition-colors">AI Platform</a>
            <a href="#" className="hover:text-brand-cyan px-3 py-2 rounded-md text-sm font-medium transition-colors">About</a>
          </div>
        </div>
        <div>
          <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full border border-white/20 text-sm font-medium transition-all">
            Client Portal
          </button>
        </div>
      </div>
    </div>
  </nav>
);

const Hero = () => (
  <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
    {/* Background Effect */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-brand-purple rounded-full mix-blend-multiply filter blur-[128px] animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-brand-cyan rounded-full mix-blend-multiply filter blur-[128px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
    </div>

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 mb-8 backdrop-blur-sm">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-cyan"></span>
        </span>
        <span className="text-sm font-mono text-slate-300">New: Copilot Security Readiness Assessment</span>
      </div>
      
      <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-8">
        Security First.<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-blue-500 to-brand-purple glow-text">
          AI Forward.
        </span>
      </h1>
      
      <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-400 mb-10">
        Your next-generation MSP/MSSP/CSP Partner. We bridge the gap between Zero Trust security architecture and Microsoft Cloud AI innovation.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button className="px-8 py-4 rounded-lg bg-brand-cyan text-slate-950 font-bold hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(6,182,212,0.4)]">
          Secure Your Cloud
        </button>
        <button className="px-8 py-4 rounded-lg bg-slate-800 text-white font-medium border border-slate-700 hover:bg-slate-700 transition-colors">
          Explore AI Solutions
        </button>
      </div>

      {/* Tech Stack Strip */}
      <div className="mt-20 pt-10 border-t border-slate-800/50">
        <p className="text-sm text-slate-500 font-mono mb-6">TRUSTED TECHNOLOGIES</p>
        <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <span className="text-xl font-bold text-white flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-sm"></div> Microsoft Azure</span>
          <span className="text-xl font-bold text-white flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-sm"></div> Microsoft 365</span>
          <span className="text-xl font-bold text-white flex items-center gap-2"><div className="w-2 h-2 bg-purple-500 rounded-sm"></div> Sentinel</span>
          <span className="text-xl font-bold text-white flex items-center gap-2"><div className="w-2 h-2 bg-pink-500 rounded-sm"></div> Copilot</span>
        </div>
      </div>
    </div>
  </div>
);

const Services = () => (
  <div className="py-24 bg-slate-950 relative">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Comprehensive Cloud Intelligence</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          We integrate managed services, advanced security, and cloud provision into a unified, AI-driven ecosystem.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <ServiceCard 
          title="MSP: Managed Services" 
          icon={<CpuIcon className="w-8 h-8" />}
          features={[
            "24/7 Proactive Monitoring",
            "Infrastructure as Code (IaC)",
            "Automated Patch Management",
            "Strategic IT Roadmapping"
          ]}
          accentColor="brand-cyan"
        />
        <ServiceCard 
          title="MSSP: Security Operations" 
          icon={<LockIcon className="w-8 h-8" />}
          features={[
            "Zero Trust Architecture",
            "Managed SIEM/SOAR (Sentinel)",
            "Threat Hunting & Response",
            "Identity Governance (Entra ID)"
          ]}
          accentColor="brand-purple"
        />
        <ServiceCard 
          title="CSP: Cloud & AI" 
          icon={<CloudIcon className="w-8 h-8" />}
          features={[
            "Microsoft 365 Licensing",
            "Copilot Implementation",
            "Azure Cost Optimization",
            "AI Data Governance"
          ]}
          accentColor="brand-accent"
        />
      </div>
    </div>
  </div>
);

const Features = () => (
    <div className="py-24 bg-slate-900 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
                <h2 className="text-3xl font-bold text-white mb-6">AI-Driven Threat Defense</h2>
                <p className="text-slate-400 mb-8 text-lg">
                    Traditional security isn't enough. We leverage machine learning models to predict and neutralize threats before they impact your perimeter.
                </p>
                <div className="space-y-6">
                    {[
                        { title: "Predictive Analytics", desc: "Forecasts attack vectors based on global threat intelligence." },
                        { title: "Automated Remediation", desc: "AI bots isolate compromised endpoints in milliseconds." },
                        { title: "Compliance Mapping", desc: "Real-time auditing against ISO 27001, SOC 2, and HIPAA." }
                    ].map((item, i) => (
                        <div key={i} className="flex gap-4">
                            <div className="mt-1">
                                <div className="w-8 h-8 rounded-full bg-brand-purple/20 flex items-center justify-center text-brand-purple">
                                    {i + 1}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-white font-bold">{item.title}</h4>
                                <p className="text-slate-500 text-sm">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-purple to-brand-cyan rounded-2xl blur-xl opacity-20"></div>
                <div className="relative bg-slate-950 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                    <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                        <span className="text-sm font-mono text-slate-400">THREAT_MONITOR_LIVE</span>
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                    </div>
                    {/* Mock Data Visualization */}
                    <div className="space-y-4 font-mono text-xs">
                        <div className="flex justify-between items-center text-green-400">
                            <span>> SYSTEM_STATUS</span>
                            <span>OPERATIONAL</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400">
                            <span>> ENDPOINT_AGENTS</span>
                            <span>1,420 ONLINE</span>
                        </div>
                        <div className="h-px bg-slate-800 my-2"></div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-slate-300">
                                <span>Identity_Protection</span>
                                <span className="text-brand-cyan">98% SCORE</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5">
                                <div className="bg-brand-cyan h-1.5 rounded-full" style={{ width: '98%' }}></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-slate-300">
                                <span>Data_Loss_Prevention</span>
                                <span className="text-brand-purple">100% SCORE</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5">
                                <div className="bg-brand-purple h-1.5 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 p-4 bg-slate-900 rounded border border-slate-800 flex items-start gap-3">
                         <div className="mt-1 w-2 h-2 rounded-full bg-brand-cyan animate-pulse"></div>
                         <div>
                             <p className="text-slate-300 text-sm font-bold">AI Insight</p>
                             <p className="text-slate-500 text-xs mt-1">Anomalous login pattern detected in Frankfurt region. Conditional Access policy automatically triggered MFA requirement. Threat neutralized.</p>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const Footer = () => (
    <footer className="bg-slate-950 border-t border-slate-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                <div className="col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                        <ShieldCheckIcon className="w-6 h-6 text-brand-cyan" />
                        <span className="font-bold text-white text-lg">NEXUSGUARD</span>
                    </div>
                    <p className="text-slate-500 text-sm">
                        Empowering enterprises with next-gen security and AI-native cloud infrastructure.
                    </p>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4">Solutions</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li><a href="#" className="hover:text-brand-cyan">Azure Migration</a></li>
                        <li><a href="#" className="hover:text-brand-cyan">Modern Workplace</a></li>
                        <li><a href="#" className="hover:text-brand-cyan">Cyber Defense</a></li>
                        <li><a href="#" className="hover:text-brand-cyan">Copilot Studio</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4">Company</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li><a href="#" className="hover:text-brand-cyan">About Us</a></li>
                        <li><a href="#" className="hover:text-brand-cyan">Careers</a></li>
                        <li><a href="#" className="hover:text-brand-cyan">Partners</a></li>
                        <li><a href="#" className="hover:text-brand-cyan">Compliance</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4">Connect</h4>
                    <div className="flex gap-4">
                        {/* Social placeholders */}
                        <div className="w-8 h-8 rounded bg-slate-800 hover:bg-brand-cyan transition-colors cursor-pointer"></div>
                        <div className="w-8 h-8 rounded bg-slate-800 hover:bg-brand-cyan transition-colors cursor-pointer"></div>
                        <div className="w-8 h-8 rounded bg-slate-800 hover:bg-brand-cyan transition-colors cursor-pointer"></div>
                    </div>
                </div>
            </div>
            <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600">
                <p>&copy; 2024 NexusGuard AI. All rights reserved.</p>
                <div className="flex gap-4 mt-4 md:mt-0">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">SLA</a>
                </div>
            </div>
        </div>
    </footer>
);

const App = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-brand-cyan selection:text-slate-950 font-sans">
      <Header />
      <Hero />
      <Services />
      <Features />
      <Footer />
      <AIChatWidget />
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
