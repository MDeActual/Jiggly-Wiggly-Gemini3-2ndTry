
import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, AreaChart, Area, Brush, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";

// --- ICONS (Minimalist/Line) ---
const Icon = ({ path, className }: { path: string, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={path} />
  </svg>
);

const Icons = {
  Shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10",
  Activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  Lock: "M7 11V7a5 5 0 0 1 10 0v4 M3 11h18v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9z",
  Server: "M2 14h20 M2 10h20 M2 2h20a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z",
  Check: "M20 6 9 17l-5-5",
  Brain: "M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-4z M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-4z",
  ArrowRight: "M5 12h14 M12 5l7 7-7 7",
  Terminal: "M4 17 10 11 4 5 M12 19h8",
  Layers: "M12 2 2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
  Mic: "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v4 M8 23h8",
  Zap: "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
  Search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.35-4.35",
  Grid: "M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z",
  Stop: "M9 9h6v6H9z",
  Eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 5c-3.866 0-7 3.134-7 7s3.134 7 7 7 7-3.134 7-7-3.134-7-7-3.134-7-7-7zm0 12c-2.761 0-5-2.239-5-5s2.239-5 5-5 5 2.239 5 5-2.239 5-5 5z",
  Play: "M5 3l14 9-14 9V3z",
  Globe: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-1-13h2v6h-2zm0 8h2v2h-2z",
  X: "M18 6L6 18M6 6l12 12"
};

// --- TYPES & DATA ---

type ViewState = 'landing' | 'assessment' | 'recommendation' | 'service-detail' | 'onboarding' | 'dashboard';

// FY26 Aligned Service Catalog
const SERVICE_PLANS = [
  {
    id: 'essentials',
    name: 'Foundation',
    price: '$129',
    description: 'Modern Work & Zero Trust Baseline',
    features: ['Microsoft 365 Business Premium', 'Defender for Business', 'Intune Device Management', 'Email Encryption', '8x5 Support'],
    color: 'border-titanium-600',
    demoTitle: 'Zero Trust Foundation Demo',
    techSpecs: {
      sku: "M365-BP-FY26",
      sla: "99.9% Uptime",
      architecture: "Cloud Native (Entra ID Joined)",
      compliance: "CIS L1 Baseline"
    },
    caseStudies: [
      { company: "Logistics Co.", result: "Achieved SOC2 Type 1 readiness in 4 weeks." }
    ]
  },
  {
    id: 'ai-ready',
    name: 'AI & Data Visibility',
    price: '$399',
    tag: 'FY26 Recommended',
    description: 'Fabric Data Estate & Copilot Governance',
    features: ['Everything in Foundation', 'Purview Data Labeling', 'Shadow IT Discovery', 'Semantic Index Optimization', 'Fabric Capacity Starter', 'AI Oversharing Protection'],
    color: 'border-apple-indigo',
    recommended: true,
    demoTitle: 'Copilot Governance Simulation',
    techSpecs: {
      sku: "M365-BP + Fabric Capacity",
      sla: "99.95% Uptime",
      architecture: "Data Lakehouse (OneLake)",
      compliance: "NIST AI RMF"
    },
    caseStudies: [
      { company: "Regional FinTech", result: "Prevented 140+ data leaks during Copilot pilot." }
    ]
  },
  {
    id: 'unified-soc',
    name: 'Unified SOC',
    price: '$649',
    description: '24/7 MDR & Sentinel SIEM',
    features: ['Everything in AI & Data', 'Microsoft Sentinel (SIEM)', '24/7 Human SOC', 'Automated Remediation', 'Threat Hunting', 'Compliance Reporting (CIS/NIST)'],
    color: 'border-apple-blue',
    demoTitle: 'MDR Threat Hunting Feed',
    techSpecs: {
      sku: "M365 E5 Security + Sentinel",
      sla: "99.99% Uptime",
      architecture: "Hybrid Zero Trust",
      compliance: "ISO 27001 / HIPAA"
    },
    caseStudies: [
      { company: "Healthcare Network", result: "Reduced mean time to respond (MTTR) by 92%." }
    ]
  }
];

const RESPONSIBILITY_MATRIX = {
  'Identity': { provider: 'Enforce MFA, CA Policies, Risk Detection', customer: 'Approve Admin Access, HR Terminations' },
  'Devices': { provider: 'Intune Compliance, Patch Mgmt, EDR', customer: 'Physical Asset Security, Report Loss' },
  'Data & AI': { provider: 'Purview Labels, DLP Policies, AI Logging', customer: 'Data Classification Decisions, Prompt Ethics' },
  'Infrastructure': { provider: 'Azure Arc, Firewall Mgmt, Sentinel Rules', customer: 'Approve Architecture Changes' }
};

const ROI_DATA = [
  { period: 'Q1', legacy: 30000, managed: 25000 },
  { period: 'Q2', legacy: 60000, managed: 45000 },
  { period: 'Q3', legacy: 90000, managed: 65000 },
  { period: 'Q4', legacy: 120000, managed: 85000 },
  { period: 'Q5', legacy: 152500, managed: 103750 },
  { period: 'Q6', legacy: 185000, managed: 122500 },
  { period: 'Q7', legacy: 217500, managed: 141250 },
  { period: 'Q8', legacy: 250000, managed: 160000 },
];

const COMPLIANCE_METRICS = [
  { name: 'CIS v8', score: 82, color: '#34c759' },
  { name: 'NIST CSF', score: 76, color: '#ff9500' },
  { name: 'ISO 27001', score: 65, color: '#ff3b30' },
  { name: 'AI Act', score: 92, color: '#007aff' },
];

const DATA_VISIBILITY_METRICS = [
  { name: 'Public', value: 45, color: '#34c759' },
  { name: 'Internal', value: 30, color: '#ffcc00' },
  { name: 'Confidential', value: 20, color: '#ff9500' },
  { name: 'Secret', value: 5, color: '#ff3b30' },
];

// --- AUDIO UTILS ---

function base64ToUint8Array(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

function floatTo16BitPCM(float32Array: Float32Array): ArrayBuffer {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
        let s = Math.max(-1, Math.min(1, float32Array[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}


// --- COMPONENTS ---

// 0. GLOBAL NAVBAR
const Navbar = ({ onNavigate, currentView }: { onNavigate: (view: ViewState) => void, currentView: ViewState }) => (
    <nav className="fixed w-full z-40 top-0 border-b border-white/5 glass-panel h-16 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => onNavigate('landing')}>
                <div className="w-6 h-6 rounded bg-gradient-to-br from-titanium-200 to-titanium-600 group-hover:from-white group-hover:to-titanium-400 transition-all"></div>
                <span className="font-semibold tracking-tight text-lg">CloudMatrix</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-titanium-400">
                <button onClick={() => onNavigate('dashboard')} className={`${currentView === 'dashboard' ? 'text-white' : 'hover:text-white'} transition-colors`}>Platform</button>
                <button onClick={() => onNavigate('recommendation')} className={`${currentView === 'recommendation' ? 'text-white' : 'hover:text-white'} transition-colors`}>Services</button>
                <button onClick={() => onNavigate('landing')} className={`${currentView === 'landing' ? 'text-white' : 'hover:text-white'} transition-colors`}>Intelligence</button>
            </div>
            <button onClick={() => onNavigate('recommendation')} className="text-sm font-medium text-white px-4 py-2 rounded-full glass-button hover:bg-white/10 transition-all">
                Partner Access
            </button>
        </div>
    </nav>
);

// 1. AI INTELLIGENCE ORB (Apple/Siri Style)
const AIOrb = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<'consultant' | 'live'>('consultant');
    const [messages, setMessages] = useState<{role: 'user'|'model', text?:string}[]>([
        {role: 'model', text: 'CloudMatrix Intelligence active. Accessing security graph...'}
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [isLiveActive, setIsLiveActive] = useState(false);
    
    // Live API refs
    const audioContextRef = useRef<AudioContext|null>(null);
    const mediaStreamRef = useRef<MediaStream|null>(null);
    const processorRef = useRef<ScriptProcessorNode|null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode|null>(null);
    const nextStartTimeRef = useRef<number>(0);

    const stopLiveSession = () => {
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        setIsLiveActive(false);
        setMessages(p => [...p, {role: 'model', text: "Live session ended."}]);
    };

    const startLiveSession = async () => {
        try {
            setIsLiveActive(true);
            setMessages(p => [...p, {role: 'model', text: "Connecting to Gemini Live..."}]);
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Audio setup
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            sourceRef.current = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
            processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            sourceRef.current.connect(processorRef.current);
            processorRef.current.connect(audioContextRef.current.destination);

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
                    }
                },
                callbacks: {
                    onopen: () => {
                        setMessages(p => [...p, {role: 'model', text: "Live connection established. Listening..."}]);
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        // Playback
                        const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (audioData) {
                            const audioBytes = base64ToUint8Array(audioData);
                            // Decode PCM manually since it's raw
                            const dataInt16 = new Int16Array(audioBytes.buffer);
                            const buffer = outputAudioContext.createBuffer(1, dataInt16.length, 24000);
                            const channelData = buffer.getChannelData(0);
                            for(let i=0; i<dataInt16.length; i++) {
                                channelData[i] = dataInt16[i] / 32768.0;
                            }
                            
                            const src = outputAudioContext.createBufferSource();
                            src.buffer = buffer;
                            src.connect(outputAudioContext.destination);
                            
                            const now = outputAudioContext.currentTime;
                            const start = Math.max(now, nextStartTimeRef.current);
                            src.start(start);
                            nextStartTimeRef.current = start + buffer.duration;
                        }
                    },
                    onclose: () => {
                        setIsLiveActive(false);
                    },
                    onerror: (e) => {
                        console.error(e);
                        setMessages(p => [...p, {role: 'model', text: "Error in live connection."}]);
                        setIsLiveActive(false);
                    }
                }
            });

            processorRef.current.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                // Convert Float32 to Int16 PCM
                const pcmBuffer = floatTo16BitPCM(inputData);
                const base64Audio = arrayBufferToBase64(pcmBuffer);
                
                sessionPromise.then(session => {
                    session.sendRealtimeInput({
                        media: {
                            mimeType: "audio/pcm;rate=16000",
                            data: base64Audio
                        }
                    });
                });
            };

        } catch (error) {
            console.error(error);
            setIsLiveActive(false);
            setMessages(p => [...p, {role: 'model', text: "Failed to access microphone or connect."}]);
        }
    };

    const handleSend = async () => {
        if(!input.trim()) return;
        setMessages(p => [...p, {role: 'user', text: input}]);
        setInput('');
        setIsThinking(true);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: input,
                config: { thinkingConfig: { thinkingBudget: 16000 } } // Thinking mode
            });
            setMessages(p => [...p, {role: 'model', text: response.text}]);
        } catch(e) {
            setMessages(p => [...p, {role: 'model', text: "Secure connection interrupted."}]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            <div className={`pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] origin-bottom-right overflow-hidden ${isOpen ? 'w-96 h-[600px] opacity-100 mb-4 rounded-3xl' : 'w-0 h-0 opacity-0 mb-0'}`}>
                <div className="w-full h-full glass-panel flex flex-col text-titanium-50">
                    <div className="p-5 border-b border-white/10 flex justify-between items-center bg-titanium-950/50">
                        <div className="flex items-center gap-3">
                            <div className="relative w-8 h-8">
                                <div className={`absolute inset-0 bg-gradient-to-tr from-apple-cyan to-apple-purple rounded-full blur-sm ${isLiveActive ? 'animate-ping' : 'animate-pulse'}`}></div>
                                <div className="absolute inset-1 bg-black rounded-full z-10"></div>
                                <Icon path={Icons.Brain} className="absolute inset-0 m-auto w-4 h-4 text-white z-20" />
                            </div>
                            <span className="font-medium tracking-tight">Intelligence</span>
                        </div>
                        <button 
                            onClick={() => {
                                if (mode === 'live' && isLiveActive) {
                                    stopLiveSession();
                                }
                                setMode(mode === 'live' ? 'consultant' : 'live')
                            }} 
                            className={`text-xs px-2 py-1 rounded-full border ${mode === 'live' ? 'bg-apple-red/20 border-apple-red text-apple-red' : 'border-white/20'}`}
                        >
                            {mode === 'live' ? 'LIVE AUDIO' : 'TEXT MODE'}
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-5 space-y-6">
                        {messages.map((m,i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] text-sm leading-relaxed p-4 rounded-2xl ${m.role === 'user' ? 'bg-apple-blue text-white' : 'bg-titanium-800/50 text-titanium-100'}`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {(isThinking || isLiveActive) && (
                            <div className="flex gap-1 pl-4 items-center">
                                {isLiveActive ? (
                                    <div className="flex gap-1 h-4 items-center">
                                        <div className="w-1 bg-apple-red animate-[bounce_1s_infinite] h-2"></div>
                                        <div className="w-1 bg-apple-red animate-[bounce_1s_infinite_0.2s] h-4"></div>
                                        <div className="w-1 bg-apple-red animate-[bounce_1s_infinite_0.4s] h-2"></div>
                                        <span className="text-xs text-apple-red ml-2">Listening...</span>
                                    </div>
                                ) : (
                                    <>
                                        <span className="w-1.5 h-1.5 bg-titanium-400 rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-titanium-400 rounded-full animate-bounce delay-100"></span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-titanium-950/50">
                        {mode === 'live' ? (
                            <button 
                                onClick={isLiveActive ? stopLiveSession : startLiveSession}
                                className={`w-full py-3 rounded-full flex items-center justify-center gap-2 font-medium transition-all ${isLiveActive ? 'bg-apple-red text-white' : 'bg-titanium-800 hover:bg-titanium-700'}`}
                            >
                                <Icon path={isLiveActive ? Icons.Stop : Icons.Mic} className="w-5 h-5" />
                                {isLiveActive ? "End Session" : "Start Live Conversation"}
                            </button>
                        ) : (
                            <div className="relative">
                                <input 
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask about threat vectors..." 
                                    className="w-full bg-titanium-900/50 border border-white/10 rounded-full py-3 pl-5 pr-12 text-sm focus:outline-none focus:border-apple-blue/50 transition-colors"
                                />
                                <button onClick={handleSend} className="absolute right-2 top-2 p-1.5 bg-apple-blue rounded-full text-white hover:opacity-90 transition-opacity">
                                    <Icon path={Icons.ArrowRight} className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Trigger Orb */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="pointer-events-auto group relative w-16 h-16 flex items-center justify-center transition-transform active:scale-95"
            >
                <div className={`absolute inset-0 rounded-full bg-gradient-to-tr from-apple-cyan via-apple-blue to-apple-purple blur-md transition-all duration-700 ${isOpen ? 'opacity-20 scale-150' : 'opacity-60 scale-100 group-hover:scale-110'}`}></div>
                <div className="absolute inset-0.5 rounded-full bg-black z-10 border border-white/10"></div>
                <Icon path={isOpen ? Icons.Check : Icons.Brain} className={`relative z-20 w-6 h-6 text-white transition-all duration-300 ${isOpen ? 'rotate-0' : 'rotate-12'}`} />
            </button>
        </div>
    );
};

// 2. CDX EXPERIENCE CENTER (New Component)
const CDXExperienceCenter = () => {
    return (
        <section className="py-20 px-6 border-t border-white/5 bg-titanium-950/50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-apple-blue font-mono text-xs uppercase tracking-widest mb-2 block">Microsoft CDX Simulations</span>
                    <h2 className="text-4xl font-bold tracking-tight mb-4">Experience the Platform</h2>
                    <p className="text-titanium-400 max-w-2xl mx-auto">
                        See how CloudMatrix leverages the Microsoft ecosystem to provide total visibility.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Demo 1: Copilot */}
                    <div className="group relative glass-panel rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02]">
                        <div className="aspect-video bg-titanium-900 relative flex items-center justify-center overflow-hidden">
                            {/* Simulated UI Background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-titanium-800 to-black p-4 opacity-50">
                                <div className="w-full h-8 bg-titanium-700 rounded-md mb-2 w-1/3"></div>
                                <div className="w-full h-32 bg-titanium-700/50 rounded-md"></div>
                            </div>
                            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform z-10">
                                <Icon path={Icons.Play} className="w-6 h-6 text-white ml-1" />
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-apple-purple animate-pulse"></div>
                                <span className="text-xs font-bold text-apple-purple uppercase">Interactive</span>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Copilot Readiness</h3>
                            <p className="text-sm text-titanium-400">Watch how we use Semantic Index to sanitize data before AI rollout.</p>
                        </div>
                    </div>

                    {/* Demo 2: Defender */}
                    <div className="group relative glass-panel rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02]">
                         <div className="aspect-video bg-titanium-900 relative flex items-center justify-center overflow-hidden">
                             <div className="absolute inset-0 bg-gradient-to-br from-titanium-800 to-black p-4 opacity-50">
                                 <div className="flex gap-2 mb-4">
                                     <div className="w-8 h-8 rounded bg-titanium-700"></div>
                                     <div className="w-8 h-8 rounded bg-titanium-700"></div>
                                 </div>
                                 <div className="w-full h-full border border-titanium-700 rounded grid grid-cols-2 gap-2 p-2">
                                     <div className="bg-apple-red/20 rounded"></div>
                                     <div className="bg-titanium-700/30 rounded"></div>
                                 </div>
                             </div>
                            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform z-10">
                                <Icon path={Icons.Play} className="w-6 h-6 text-white ml-1" />
                            </div>
                        </div>
                        <div className="p-6">
                             <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-apple-blue animate-pulse"></div>
                                <span className="text-xs font-bold text-apple-blue uppercase">Live Feed</span>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Threat Hunting</h3>
                            <p className="text-sm text-titanium-400">See Defender XDR neutralize a ransomware attack in real-time.</p>
                        </div>
                    </div>

                    {/* Demo 3: Purview */}
                    <div className="group relative glass-panel rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02]">
                         <div className="aspect-video bg-titanium-900 relative flex items-center justify-center overflow-hidden">
                             <div className="absolute inset-0 bg-gradient-to-br from-titanium-800 to-black p-4 opacity-50">
                                 <div className="w-full h-full rounded-full border border-titanium-700/50 flex items-center justify-center">
                                     <div className="w-2/3 h-2/3 rounded-full border border-titanium-600/50"></div>
                                 </div>
                             </div>
                            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform z-10">
                                <Icon path={Icons.Play} className="w-6 h-6 text-white ml-1" />
                            </div>
                        </div>
                        <div className="p-6">
                             <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-apple-green animate-pulse"></div>
                                <span className="text-xs font-bold text-apple-green uppercase">Simulation</span>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Data Map Visibility</h3>
                            <p className="text-sm text-titanium-400">Visualize where sensitive credit card data lives across your estate.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

// 3. LANDING PAGE (Titanium Aesthetic)
const Landing = ({ onNavigate }: { onNavigate: (view: ViewState) => void }) => (
    <div className="min-h-screen bg-black text-titanium-50 font-sans selection:bg-apple-blue/30">
        
        {/* Hero Section */}
        <section className="relative pt-40 pb-32 px-6 flex flex-col items-center text-center overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-radial from-apple-blue/10 to-transparent opacity-50 blur-[100px] pointer-events-none"></div>

            <div className="relative z-10 animate-in fade-in zoom-in duration-1000">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-mono tracking-widest text-titanium-300 mb-8 backdrop-blur-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-apple-green animate-pulse"></span>
                    FY26 SOLUTION AREA: AI INNOVATION
                </div>
                <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 bg-gradient-to-b from-white to-titanium-500 bg-clip-text text-transparent pb-2">
                    Autonomous.<br/>Secure.
                </h1>
                <p className="text-xl text-titanium-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
                    The first <span className="text-white font-medium">AI-Native Managed Service Provider</span>. 
                    We automate compliance, unify your security stack, and prepare your data estate for Copilot.
                </p>
                
                <div className="flex items-center justify-center gap-4">
                    <button onClick={() => onNavigate('recommendation')} className="group relative px-8 py-4 bg-white text-black font-semibold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95">
                        <span className="relative z-10 flex items-center gap-2">
                            Initialize Assessment <Icon path={Icons.ArrowRight} className="w-4 h-4" />
                        </span>
                        <div className="absolute inset-0 bg-titanium-200 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                    <button onClick={() => onNavigate('recommendation')} className="px-8 py-4 glass-button rounded-full text-white font-medium border border-white/10">
                        View Solution Catalog
                    </button>
                </div>
            </div>

            {/* Feature Bento Grid */}
            <div className="max-w-6xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {/* Card 1: Copilot */}
                <div className="glass-panel rounded-3xl p-8 flex flex-col items-start col-span-1 md:col-span-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-apple-purple/20 blur-[80px] rounded-full transition-opacity group-hover:opacity-100 opacity-50"></div>
                    <Icon path={Icons.Brain} className="w-8 h-8 text-apple-purple mb-6" />
                    <h3 className="text-2xl font-bold mb-2">Copilot Governance</h3>
                    <p className="text-titanium-400 leading-relaxed max-w-md">
                        Automated Purview labeling and semantic indexing to ensure your data is safe before AI ingestion.
                    </p>
                </div>

                {/* Card 2: Security */}
                <div className="glass-panel rounded-3xl p-8 flex flex-col items-start relative overflow-hidden group">
                     <div className="absolute bottom-0 right-0 w-48 h-48 bg-apple-blue/20 blur-[60px] rounded-full transition-opacity group-hover:opacity-100 opacity-50"></div>
                    <Icon path={Icons.Shield} className="w-8 h-8 text-apple-blue mb-6" />
                    <h3 className="text-2xl font-bold mb-2">Unified SOC</h3>
                    <p className="text-titanium-400 text-sm">
                        24/7 Threat Hunting via Sentinel & Defender XDR.
                    </p>
                </div>

                {/* Card 3: Fabric */}
                <div className="glass-panel rounded-3xl p-8 flex flex-col items-start relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-48 h-48 bg-apple-cyan/20 blur-[60px] rounded-full transition-opacity group-hover:opacity-100 opacity-50"></div>
                    <Icon path={Icons.Server} className="w-8 h-8 text-apple-cyan mb-6" />
                    <h3 className="text-2xl font-bold mb-2">Fabric Data Estate</h3>
                    <p className="text-titanium-400 text-sm">
                        Modernize SQL/Synapse to Fabric for real-time analytics.
                    </p>
                </div>

                {/* Card 4: Compliance */}
                <div className="glass-panel rounded-3xl p-8 flex flex-col items-start col-span-1 md:col-span-2 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-apple-green/20 blur-[80px] rounded-full transition-opacity group-hover:opacity-100 opacity-50"></div>
                    <Icon path={Icons.Check} className="w-8 h-8 text-apple-green mb-6" />
                    <h3 className="text-2xl font-bold mb-2">Compliance as Visibility</h3>
                    <p className="text-titanium-400 leading-relaxed max-w-md">
                        Turn compliance into strategy. Visualize data sprawl, shadow IT, and sensitive information flow in real-time.
                    </p>
                </div>
            </div>
        </section>

        {/* CDX Section */}
        <CDXExperienceCenter />
    </div>
);

// 4. SERVICE SELECTION (Clean Grid)
const ServiceSelection = ({ onSelect }: { onSelect: (id: string) => void }) => {
    const [activeDemo, setActiveDemo] = useState<typeof SERVICE_PLANS[0] | null>(null);

    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-20 text-center">
                    <h2 className="text-4xl font-bold tracking-tight mb-4">Choose your Intelligence Level</h2>
                    <p className="text-titanium-400">Scalable managed services designed for the AI era.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {SERVICE_PLANS.map((plan) => (
                        <div key={plan.id} className={`glass-panel rounded-3xl p-8 relative transition-all duration-300 hover:transform hover:-translate-y-2 border-t-4 ${plan.color} ${plan.recommended ? 'bg-titanium-900/40' : ''}`}>
                            {plan.recommended && (
                                <div className="absolute top-4 right-4 px-3 py-1 bg-apple-indigo/20 text-apple-indigo text-[10px] font-bold uppercase tracking-wider rounded-full border border-apple-indigo/30">
                                    FY26 Preferred
                                </div>
                            )}
                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                <p className="text-sm text-titanium-400 min-h-[40px]">{plan.description}</p>
                            </div>
                            <div className="mb-8 flex items-baseline gap-1">
                                <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                                <span className="text-titanium-500 text-sm">/user/mo</span>
                            </div>
                            
                            <ul className="space-y-4 mb-10">
                                {plan.features.map((feat, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-titanium-300">
                                        <Icon path={Icons.Check} className="w-4 h-4 text-titanium-500 mt-0.5 shrink-0" />
                                        {feat}
                                    </li>
                                ))}
                            </ul>

                            <div className="flex flex-col gap-3">
                                <button onClick={() => onSelect(plan.id)} className={`w-full py-3 rounded-xl font-medium transition-all ${plan.recommended ? 'bg-white text-black hover:bg-titanium-200' : 'bg-titanium-800 text-white hover:bg-titanium-700'}`}>
                                    Configure Plan
                                </button>
                                <button onClick={() => setActiveDemo(plan)} className="w-full py-3 rounded-xl font-medium glass-button border border-white/10 text-titanium-300 hover:text-white flex items-center justify-center gap-2">
                                    <Icon path={Icons.Play} className="w-4 h-4" />
                                    View Demo
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Demo Modal */}
            {activeDemo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200" onClick={() => setActiveDemo(null)}>
                    <div className="w-full max-w-5xl bg-titanium-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-titanium-900/50">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-apple-red animate-pulse"></div>
                                <h3 className="font-mono text-sm uppercase tracking-wider text-titanium-300">CDX // {activeDemo.demoTitle}</h3>
                            </div>
                            <button onClick={() => setActiveDemo(null)} className="p-2 hover:bg-white/10 rounded-full text-titanium-400 hover:text-white transition-colors">
                                <Icon path={Icons.X} className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="relative aspect-video bg-black flex items-center justify-center group overflow-hidden">
                            {/* Placeholder for Video - simulating a loading/playing state */}
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                            
                            <div className="z-10 text-center">
                                <div className="w-20 h-20 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-sm cursor-pointer hover:scale-110 transition-transform bg-white/5">
                                    <Icon path={Icons.Play} className="w-8 h-8 text-white ml-1" />
                                </div>
                                <p className="mt-4 text-sm font-mono text-titanium-400">Loading Simulation Stream...</p>
                            </div>

                            {/* Fake Controls */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
                                <div className="w-full h-1 bg-white/20 rounded-full mb-4 overflow-hidden">
                                    <div className="w-1/3 h-full bg-apple-blue relative">
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow"></div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-xs font-mono text-titanium-400">
                                    <div className="flex gap-4">
                                        <span>PLAYING</span>
                                        <span className="text-white">00:34 / 02:15</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span>HD</span>
                                        <span>CC</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-titanium-900/30 border-t border-white/10">
                            <h4 className="text-lg font-bold mb-2 text-white">{activeDemo.name} Walkthrough</h4>
                            <p className="text-sm text-titanium-400 max-w-3xl">
                                This simulation demonstrates the specific Microsoft Cloud capabilities included in the {activeDemo.name} tier. 
                                Observe how CloudMatrix automates the configuration of these services via Graph API.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// 4.1 SERVICE DETAIL (New Page)
const ServiceDetail = ({ planId, onBack, onDeploy }: { planId: string, onBack: () => void, onDeploy: () => void }) => {
    const plan = SERVICE_PLANS.find(p => p.id === planId);
    if (!plan) return null;

    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-20 px-6 animate-in fade-in zoom-in duration-300">
             <div className="max-w-7xl mx-auto">
                <button onClick={onBack} className="mb-8 flex items-center gap-2 text-titanium-400 hover:text-white transition-colors">
                    <Icon path={Icons.ArrowRight} className="w-4 h-4 rotate-180" /> Back to Catalog
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Header & Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                         <div>
                            <div className={`inline-block px-3 py-1 rounded-full border mb-4 text-xs font-bold uppercase tracking-wider ${plan.recommended ? 'bg-apple-indigo/20 border-apple-indigo text-apple-indigo' : 'bg-titanium-800 border-titanium-600 text-titanium-400'}`}>
                                {plan.recommended ? 'FY26 Recommended' : 'Standard Tier'}
                            </div>
                            <h1 className="text-5xl font-bold tracking-tight mb-4">{plan.name}</h1>
                            <p className="text-xl text-titanium-400">{plan.description}</p>
                         </div>

                         <div className="glass-panel p-8 rounded-3xl">
                            <h3 className="text-lg font-bold mb-6">Comprehensive Capabilities</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {plan.features.map((feat, i) => (
                                    <div key={i} className="flex gap-3 items-start">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-titanium-800 flex items-center justify-center shrink-0">
                                            <Icon path={Icons.Check} className="w-3 h-3 text-titanium-200" />
                                        </div>
                                        <span className="text-titanium-300">{feat}</span>
                                    </div>
                                ))}
                            </div>
                         </div>
                         
                         {/* Case Studies */}
                         {plan.caseStudies && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold">Success Stories</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {plan.caseStudies.map((study, i) => (
                                        <div key={i} className="glass-panel p-6 rounded-2xl border-l-4 border-l-apple-blue">
                                            <h4 className="font-bold mb-2">{study.company}</h4>
                                            <p className="text-sm text-titanium-400">"{study.result}"</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                         )}
                    </div>

                    {/* Sidebar: Specs & Pricing */}
                    <div className="space-y-6">
                        <div className="glass-panel p-8 rounded-3xl border-t-4 border-t-white sticky top-24">
                            <div className="mb-6">
                                <span className="text-sm text-titanium-500 uppercase tracking-widest">Monthly Investment</span>
                                <div className="flex items-baseline gap-1 mt-1">
                                    <span className="text-5xl font-bold tracking-tight">{plan.price}</span>
                                    <span className="text-titanium-400">/user</span>
                                </div>
                            </div>

                            {plan.techSpecs && (
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between py-2 border-b border-white/5">
                                        <span className="text-sm text-titanium-500">Microsoft SKU</span>
                                        <span className="text-sm font-mono text-white text-right max-w-[150px]">{plan.techSpecs.sku}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-white/5">
                                        <span className="text-sm text-titanium-500">SLA Guarantee</span>
                                        <span className="text-sm font-mono text-apple-green">{plan.techSpecs.sla}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-white/5">
                                        <span className="text-sm text-titanium-500">Architecture</span>
                                        <span className="text-sm font-mono text-white text-right max-w-[150px]">{plan.techSpecs.architecture}</span>
                                    </div>
                                     <div className="flex justify-between py-2 border-b border-white/5">
                                        <span className="text-sm text-titanium-500">Compliance</span>
                                        <span className="text-sm font-mono text-apple-blue">{plan.techSpecs.compliance}</span>
                                    </div>
                                </div>
                            )}

                            <button onClick={onDeploy} className="w-full py-4 bg-white text-black font-bold rounded-xl hover:scale-[1.02] transition-transform shadow-glow">
                                Deploy Environment
                            </button>
                            <p className="text-center text-xs text-titanium-500 mt-4">
                                Automated provisioning initiates immediately after payment.
                            </p>
                        </div>
                    </div>
                </div>
             </div>
        </div>
    )
}

// 5. DASHBOARD (High Density / Bento)
const Dashboard = () => {
    return (
        <div className="min-h-screen bg-black text-titanium-50 p-6 md:p-12 pt-24">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight mb-1">Command Center</h1>
                    <div className="flex items-center gap-2 text-xs text-titanium-400 font-mono">
                        <span className="w-2 h-2 rounded-full bg-apple-green"></span>
                        SYSTEM OPTIMAL • TENANT: CLOUDMATRIX_DEMO
                    </div>
                </div>
                <div className="flex gap-4">
                     <button className="p-3 rounded-full glass-button text-titanium-400 hover:text-white">
                        <Icon path={Icons.Search} className="w-5 h-5" />
                     </button>
                     <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-titanium-700 to-titanium-500 border border-white/10"></div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Left Column: Metrics */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Score Card */}
                    <div className="glass-panel rounded-3xl p-6 md:col-span-1">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-medium text-titanium-400 uppercase tracking-wider">Secure Score</span>
                            <Icon path={Icons.Shield} className="w-5 h-5 text-apple-blue" />
                        </div>
                        <div className="text-5xl font-bold tracking-tighter mb-4">78<span className="text-xl text-titanium-600 font-normal">%</span></div>
                        <div className="h-20 -mx-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={[{v:60},{v:65},{v:72},{v:70},{v:75},{v:78}]}>
                                    <Line type="monotone" dataKey="v" stroke="#007aff" strokeWidth={3} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Copilot Risk */}
                    <div className="glass-panel rounded-3xl p-6 md:col-span-1">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-medium text-titanium-400 uppercase tracking-wider">AI Governance</span>
                            <Icon path={Icons.Brain} className="w-5 h-5 text-apple-purple" />
                        </div>
                        <div className="text-3xl font-bold tracking-tight mb-2">Protected</div>
                        <p className="text-xs text-titanium-500 mb-6">99.8% of sensitive data labeled before Copilot ingestion.</p>
                        <div className="w-full bg-titanium-800 h-1 rounded-full overflow-hidden">
                            <div className="h-full bg-apple-purple w-[99%]" />
                        </div>
                    </div>

                    {/* ROI */}
                    <div className="glass-panel rounded-3xl p-6 md:col-span-1 flex flex-col justify-between">
                         <div className="flex justify-between items-start">
                            <span className="text-xs font-medium text-titanium-400 uppercase tracking-wider">Proj. Savings</span>
                            <Icon path={Icons.Activity} className="w-5 h-5 text-apple-green" />
                        </div>
                        <div className="text-3xl font-bold tracking-tight text-white">$42,500</div>
                        <div className="text-xs text-apple-green font-medium flex items-center gap-1">
                            <Icon path={Icons.Zap} className="w-3 h-3" /> +12% vs last Q
                        </div>
                    </div>

                    {/* Compliance as Visibility Map */}
                    <div className="glass-panel rounded-3xl p-8 md:col-span-2 min-h-[300px]">
                        <div className="flex justify-between items-center mb-6">
                             <div>
                                 <h3 className="font-semibold text-lg flex items-center gap-2">
                                     <Icon path={Icons.Eye} className="w-5 h-5 text-apple-orange" />
                                     Data Visibility Map
                                 </h3>
                                 <p className="text-xs text-titanium-400">Real-time tracking of sensitive data types across tenant.</p>
                             </div>
                        </div>
                        <div className="flex gap-8 items-center h-full">
                            <div className="w-48 h-48 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={DATA_VISIBILITY_METRICS}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {DATA_VISIBILITY_METRICS.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-2xl font-bold">100%</span>
                                    <span className="text-[10px] text-titanium-500 uppercase">Mapped</span>
                                </div>
                            </div>
                            <div className="flex-1 grid grid-cols-2 gap-4">
                                {DATA_VISIBILITY_METRICS.map((m, i) => (
                                    <div key={i} className="flex flex-col p-3 rounded-xl bg-titanium-900/50">
                                        <span className="text-xs text-titanium-400 mb-1">{m.name}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{background: m.color}}></div>
                                            <span className="text-lg font-bold">{m.value}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Chart area */}
                    <div className="glass-panel rounded-3xl p-8 md:col-span-1 min-h-[300px]">
                        <div className="flex justify-between items-center mb-8">
                             <h3 className="font-semibold text-lg">Cost Efficiency</h3>
                        </div>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={ROI_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#007aff" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#007aff" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="period" stroke="#48484a" tick={{fill: '#8e8e93', fontSize: 12}} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#48484a" tick={{fill: '#8e8e93', fontSize: 12}} tickLine={false} axisLine={false} />
                                    <CartesianGrid stroke="#2c2c2e" vertical={false} />
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: '#1c1c1e', borderColor: '#3a3a3c', color: '#f5f5f7', borderRadius: '12px' }}
                                        itemStyle={{ fontSize: '12px' }}
                                    />
                                    <Area type="monotone" dataKey="legacy" stroke="#ff3b30" fill="transparent" strokeWidth={2} />
                                    <Area type="monotone" dataKey="managed" stroke="#007aff" fill="url(#blueGradient)" strokeWidth={2} />
                                    <Brush dataKey="period" height={20} stroke="#48484a" fill="#1c1c1e" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Right Column: Responsibility & Compliance */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Compliance Mini */}
                    <div className="glass-panel rounded-3xl p-6">
                        <h3 className="text-sm font-semibold mb-6">Compliance Status</h3>
                        <div className="space-y-4">
                            {COMPLIANCE_METRICS.map((m, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-default">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full" style={{background: m.color}}></div>
                                        <span className="text-sm text-titanium-300">{m.name}</span>
                                    </div>
                                    <span className="text-sm font-mono text-white">{m.score}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shared Responsibility Widget */}
                    <div className="glass-panel rounded-3xl p-6 flex flex-col h-[400px]">
                        <h3 className="text-sm font-semibold mb-6">Shared Responsibility</h3>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                            {Object.entries(RESPONSIBILITY_MATRIX).map(([key, val], i) => (
                                <div key={i} className="bg-titanium-900/50 rounded-xl p-4 border border-white/5">
                                    <div className="text-xs font-bold text-titanium-500 uppercase mb-3">{key}</div>
                                    <div className="space-y-3">
                                        <div className="flex gap-3">
                                            <div className="w-1 bg-apple-blue rounded-full"></div>
                                            <div>
                                                <div className="text-[10px] text-apple-blue font-bold">PROVIDER</div>
                                                <div className="text-xs text-titanium-300 leading-snug">{val.provider}</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-1 bg-titanium-600 rounded-full"></div>
                                            <div>
                                                <div className="text-[10px] text-titanium-500 font-bold">CUSTOMER</div>
                                                <div className="text-xs text-titanium-400 leading-snug">{val.customer}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 6. ONBOARDING (Terminal Simulation with Glass)
const Onboarding = ({ onFinish }: { onFinish: () => void }) => {
    const [lines, setLines] = useState<string[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const steps = [
            "Initializing secure handshake...",
            "Establishing GDAP relationship with Tenant ID...",
            "Scanning for Copilot prerequisites...",
            "Applying baseline policy: 'Titanium_ZeroTrust_v4'...",
            "Configuring Fabric capacity...",
            "Deploying Sentinel agents...",
            "Optimization complete. Accessing Command Center..."
        ];
        let i = 0;
        const interval = setInterval(() => {
            if (i >= steps.length) {
                clearInterval(interval);
                setTimeout(onFinish, 1500);
            } else {
                if (steps[i]) {
                     setLines(prev => [...prev, steps[i]]);
                }
                i++;
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Auto-scroll
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [lines]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
            <div className="w-full max-w-2xl glass-panel rounded-2xl border border-white/10 p-1">
                <div className="bg-titanium-900/80 px-4 py-2 rounded-t-xl flex items-center gap-2 border-b border-white/5">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-titanium-600"></div>
                        <div className="w-3 h-3 rounded-full bg-titanium-600"></div>
                        <div className="w-3 h-3 rounded-full bg-titanium-600"></div>
                    </div>
                    <span className="ml-4 text-xs font-mono text-titanium-500">provisioning_daemon</span>
                </div>
                <div ref={containerRef} className="p-8 h-96 font-mono text-sm space-y-3 overflow-y-auto">
                    {lines.map((line, i) => (
                        <div key={i} className="flex gap-3 text-titanium-300 animate-in fade-in slide-in-from-left-2">
                            <span className="text-titanium-600 select-none">$</span>
                            <span>{line}</span>
                        </div>
                    ))}
                    <div className="w-2 h-4 bg-titanium-400 animate-pulse"></div>
                </div>
            </div>
        </div>
    );
}

// MAIN APP
const App = () => {
    const [view, setView] = useState<ViewState>('landing');
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    
    return (
        <div className="antialiased text-titanium-50 bg-black selection:bg-apple-blue/30">
            <Navbar onNavigate={setView} currentView={view} />
            {view === 'landing' && <Landing onNavigate={setView} />}
            {view === 'recommendation' && (
                <ServiceSelection onSelect={(id) => {
                    setSelectedPlanId(id);
                    setView('service-detail');
                }} />
            )}
            {view === 'service-detail' && selectedPlanId && (
                <ServiceDetail 
                    planId={selectedPlanId} 
                    onBack={() => setView('recommendation')}
                    onDeploy={() => setView('onboarding')}
                />
            )}
            {view === 'onboarding' && <Onboarding onFinish={() => setView('dashboard')} />}
            {view === 'dashboard' && <Dashboard />}
            <AIOrb />
        </div>
    );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
