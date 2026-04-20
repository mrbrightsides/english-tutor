import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, AlertCircle, RotateCcw, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Sun, Moon, History, BookOpen, Trash2, X, ArrowDown, Target, FileText, Square, Cpu, BrainCircuit, Zap, MonitorPlay } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { useLiveAPI, LearnedItem } from './hooks/useLiveAPI';

const LEARNING_GOALS = [
  "General English",
  "Business English",
  "TOEFL Preparation",
  "IELTS Preparation",
  "Travel English",
  "Academic Writing"
];

interface Session {
  id: string;
  date: string;
  summary: string;
  learnedItems: LearnedItem[];
}

interface MasteryStats {
  xp: number;
  level: string;
  wordsMastered: number;
  streak: number;
}

const DEFAULT_MASTERY: MasteryStats = {
  xp: 0,
  level: 'Apprentice',
  wordsMastered: 0,
  streak: 1
};

const getLevelProgress = (xp: number) => {
  const xpPerLevel = 500;
  const currentXPInLevel = xp % xpPerLevel;
  const progress = (currentXPInLevel / xpPerLevel) * 100;
  const levelNum = Math.floor(xp / xpPerLevel) + 1;
  const xpNeeded = xpPerLevel - currentXPInLevel;
  return { levelNum, progress, xpNeeded };
};

const getDashboardCode = (stats: MasteryStats) => {
  const { levelNum, progress, xpNeeded } = getLevelProgress(stats.xp);
  const wordsThisWeek = Math.floor(stats.wordsMastered * 0.15); 

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script src="https://unpkg.com/lucide@latest"><\/script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Outfit:wght@400;600;700&display=swap');
    :root {
      --bg: #09090b;
      --panel: #18181b;
      --accent: #3b82f6;
      --accent-glow: rgba(59, 130, 246, 0.5);
    }
    body { 
      font-family: 'Outfit', sans-serif; 
      background: var(--bg);
      color: #fafafa;
      overflow-x: hidden;
    }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .glass {
      background: rgba(24, 24, 27, 0.8);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .grid-bg {
      background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0);
      background-size: 32px 32px;
    }
    @keyframes pulse-slow {
      0%, 100% { opacity: 0.8; }
      50% { opacity: 0.4; }
    }
    .animate-pulse-slow { animation: pulse-slow 4s infinite; }
  </style>
</head>
<body class="min-h-screen p-4 md:p-8 grid-bg">
  <div class="max-w-5xl mx-auto space-y-6">
    <!-- Header -->
    <header class="flex flex-col md:flex-row md:items-end justify-between gap-4 py-8">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span class="mono text-[10px] uppercase tracking-[0.3em] text-emerald-500 font-bold">System Online // AI Agent Active</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-bold tracking-tight">Learning <span class="text-blue-500">Mastery</span></h1>
        <p class="text-zinc-500 mt-2 max-w-md">Your personal AI learning agent is analyzing your speech patterns and vocabulary growth in real-time.</p>
      </div>
      <div class="flex gap-3">
         <div class="glass p-3 px-6 rounded-2xl flex flex-col items-center justify-center">
            <span class="mono text-[10px] uppercase text-zinc-500 mb-1">Current Streak</span>
            <span class="text-2xl font-bold">${stats.streak} <span class="text-xs text-orange-500">DAYS</span></span>
         </div>
      </div>
    </header>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <!-- Stats Sidebar -->
      <div class="md:col-span-1 space-y-6">
        <!-- Level Card -->
        <div class="glass p-6 rounded-[2rem] relative overflow-hidden group">
          <div class="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
          <span class="mono text-[10px] uppercase text-blue-500 font-bold mb-4 block">Proficiency Level</span>
          <div class="flex items-baseline gap-2 mb-6">
            <span class="text-5xl font-bold tracking-tighter">LV. ${levelNum.toString().padStart(2, '0')}</span>
            <span class="text-zinc-500 font-medium tracking-wide">${stats.level}</span>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between text-[11px] mono uppercase text-zinc-400">
              <span>Next Level in ${xpNeeded} XP</span>
              <span class="text-blue-400">${Math.round(progress)}%</span>
            </div>
            <div class="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div class="h-full bg-blue-500 rounded-full" style="width: ${progress}%"></div>
            </div>
          </div>
        </div>

        <!-- Mastery Circle -->
        <div class="glass p-6 rounded-[2rem] flex flex-col items-center justify-center gap-4 text-center">
           <div class="relative w-32 h-32 flex items-center justify-center">
             <svg class="w-32 h-32 transform -rotate-90">
               <circle cx="64" cy="64" r="58" stroke="currentColor" stroke-width="8" fill="transparent" class="text-zinc-800" />
               <circle cx="64" cy="64" r="58" stroke="currentColor" stroke-width="8" fill="transparent" stroke-dasharray="364.4" stroke-dashoffset="${364.4 - (364.4 * (Math.min(stats.wordsMastered, 2000) / 2000))}" class="text-blue-500" stroke-linecap="round" />
             </svg>
             <div class="absolute flex flex-col items-center">
                <span class="text-2xl font-bold">${stats.wordsMastered}</span>
                <span class="mono text-[8px] uppercase text-zinc-500">Words Mastered</span>
             </div>
           </div>
           <p class="text-[11px] text-zinc-500 leading-relaxed px-4">You've mastered ${wordsThisWeek} new words this week. Keep it up!</p>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="md:col-span-2 space-y-6">
        <!-- Activity Grid -->
        <div class="glass p-6 rounded-[2rem] h-full">
          <header class="flex justify-between items-center mb-8">
            <div class="flex items-center gap-2">
              <i data-lucide="zap" class="w-4 h-4 text-orange-500"></i>
              <h3 class="text-sm font-bold uppercase tracking-wider">Active Challenges</h3>
            </div>
            <span class="mono text-[10px] text-zinc-600">3 Pending Missions</span>
          </header>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              onclick="window.parent.postMessage({ type: 'START_CHALLENGE', prompt: 'I want to start the 5-minute speaking fluency challenge!' }, '*')"
              class="p-5 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-blue-500/50 transition-all cursor-pointer group"
            >
              <div class="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                <i data-lucide="mic" class="w-5 h-5 text-orange-500"></i>
              </div>
              <h4 class="font-bold text-sm mb-2">Speak for 5 Minutes</h4>
              <p class="text-xs text-zinc-500 leading-relaxed">Improve your overall fluency by maintaining a long conversation.</p>
              <div class="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div class="h-full bg-orange-500" style="width: 60%"></div>
              </div>
            </div>

            <div 
              onclick="window.parent.postMessage({ type: 'START_CHALLENGE', prompt: 'Teach me 10 important business idioms today.' }, '*')"
              class="p-5 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-purple-500/50 transition-all cursor-pointer group"
            >
              <div class="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                <i data-lucide="book" class="w-5 h-5 text-purple-500"></i>
              </div>
              <h4 class="font-bold text-sm mb-2">10 Business Idioms</h4>
              <p class="text-xs text-zinc-500 leading-relaxed">Incorporate business-specific phrases into your speech today.</p>
              <div class="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div class="h-full bg-purple-500" style="width: 20%"></div>
              </div>
            </div>

            <div 
              onclick="window.parent.postMessage({ type: 'START_CHALLENGE', prompt: 'I want to do the Special Mission: Creative Story challenge!' }, '*')"
              class="md:col-span-2 p-5 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-between group cursor-pointer hover:bg-blue-500/10 transition-all"
            >
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <i data-lucide="award" class="w-6 h-6 text-white"></i>
                </div>
                <div>
                   <h4 class="font-bold text-sm">Special Mission: Creative Story</h4>
                   <p class="text-xs text-zinc-500">Tell a story using only past tense. Reward: 250 XP</p>
                </div>
              </div>
              <i data-lucide="chevron-right" class="w-5 h-5 text-zinc-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pb-8">
       <div class="glass p-4 rounded-2xl border-l-4 border-l-blue-500">
          <span class="mono text-[8px] uppercase text-zinc-500 block mb-1">Vocabulary</span>
          <span class="text-xl font-bold tracking-tight">${stats.wordsMastered.toLocaleString()} <span class="text-[10px] text-emerald-500">+${wordsThisWeek}</span></span>
       </div>
       <div class="glass p-4 rounded-2xl border-l-4 border-l-orange-500">
          <span class="mono text-[8px] uppercase text-zinc-500 block mb-1">Fluency Rate</span>
          <span class="text-xl font-bold tracking-tight">${Math.min(30 + levelNum * 5, 95)}% <span class="text-[10px] text-emerald-500">+1%</span></span>
       </div>
       <div class="glass p-4 rounded-2xl border-l-4 border-l-purple-500">
          <span class="mono text-[8px] uppercase text-zinc-500 block mb-1">Grammar Score</span>
          <span class="text-xl font-bold tracking-tight">${levelNum > 5 ? 'A-' : levelNum > 2 ? 'B+' : 'C'} <span class="text-[10px] text-emerald-500">STABLE</span></span>
       </div>
       <div class="glass p-4 rounded-2xl border-l-4 border-l-pink-500">
          <span class="mono text-[8px] uppercase text-zinc-500 block mb-1">Total XP</span>
          <span class="text-xl font-bold tracking-tight">${stats.xp.toLocaleString()} <span class="text-[10px] text-zinc-500">TOTAL</span></span>
       </div>
    </div>
  </div>

  <script>
    lucide.createIcons();
  <\/script>
</body>
</html>`;
};

export default function App() {
  const [hasLaunched, setHasLaunched] = useState<boolean>(false);
  const [masteryStats, setMasteryStats] = useState<MasteryStats>(DEFAULT_MASTERY);
  const [appCode, setAppCode] = useState<string>(getDashboardCode(DEFAULT_MASTERY));
  const [showCode, setShowCode] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isLightMode, setIsLightMode] = useState<boolean>(false);
  const [view, setView] = useState<'tutor' | 'history'>('tutor');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'history'>('dashboard');
  const [learningGoal, setLearningGoal] = useState<string>("General English");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false);
  const [isGoalSelectorOpen, setIsGoalSelectorOpen] = useState<boolean>(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const launched = localStorage.getItem('ngenglish_launched');
    if (launched === 'true') {
      setHasLaunched(true);
    }

    const savedSessions = localStorage.getItem('english_tutor_sessions');
    if (savedSessions) {
      try {
        setSessions(JSON.parse(savedSessions));
      } catch (e) {
        console.error("Failed to load sessions", e);
      }
    }

    const savedMastery = localStorage.getItem('ngenglish_mastery');
    if (savedMastery) {
      try {
        const parsed = JSON.parse(savedMastery);
        setMasteryStats(parsed);
        setAppCode(getDashboardCode(parsed));
      } catch (e) {}
    } else {
      setAppCode(getDashboardCode(DEFAULT_MASTERY));
    }
  }, []);

  const handleMasteryUpdate = (newStats: Partial<MasteryStats>) => {
    setMasteryStats(prev => {
      const updated = {
        ...prev,
        xp: prev.xp + (newStats.xp || 0),
        wordsMastered: prev.wordsMastered + (newStats.wordsMastered || 0),
        level: newStats.level || prev.level,
        streak: newStats.streak || prev.streak
      };
      localStorage.setItem('ngenglish_mastery', JSON.stringify(updated));
      setAppCode(getDashboardCode(updated));
      return updated;
    });
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { isConnected, isConnecting, error, audioLevel, isModelSpeaking, sessionSummary, learnedItems, connect, disconnect, setSessionSummary, setLearnedItems, sendText } = useLiveAPI(
    setAppCode, 
    appCode, 
    learningGoal, 
    sessions.length,
    sessions.flatMap(s => s.learnedItems.map(li => li.content)),
    masteryStats,
    handleMasteryUpdate
  );

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'START_CHALLENGE') {
        const { prompt } = event.data;
        if (!isConnected) {
          connect().then(() => {
            // Give a small delay for connection to stabilize before sending text
            setTimeout(() => sendText(prompt), 1000);
          });
        } else {
          sendText(prompt);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isConnected, connect, sendText]);

  // Save session when disconnected and has content
  useEffect(() => {
    if (!isConnected && (sessionSummary.length > 0 || learnedItems.length > 0)) {
      const newSession: Session = {
        id: Date.now().toString(),
        date: new Date().toLocaleString(),
        summary: sessionSummary || "No summary generated for this session.",
        learnedItems: [...learnedItems]
      };
      
      setSessions(prev => {
        const updated = [newSession, ...prev];
        localStorage.setItem('english_tutor_sessions', JSON.stringify(updated));
        return updated;
      });
      
      // Clear current session data for next time
      setSessionSummary("");
      setLearnedItems([]);
      localStorage.removeItem('ngenglish_current_summary');
      localStorage.removeItem('ngenglish_current_learned');
    }
  }, [isConnected]);

  // Auto-save current session to a temporary storage to prevent data loss
  useEffect(() => {
    if (isConnected && sessionSummary.length > 0) {
      localStorage.setItem('ngenglish_current_summary', sessionSummary);
    }
  }, [sessionSummary, isConnected]);

  useEffect(() => {
    if (isConnected && learnedItems.length > 0) {
      localStorage.setItem('ngenglish_current_learned', JSON.stringify(learnedItems));
    }
  }, [learnedItems, isConnected]);

  // Recover interrupted session
  useEffect(() => {
    const tempSummary = localStorage.getItem('ngenglish_current_summary');
    const tempLearned = localStorage.getItem('ngenglish_current_learned');
    if (tempSummary && !isConnected) {
      setSessionSummary(tempSummary);
    }
    if (tempLearned && !isConnected) {
      try {
        const parsed = JSON.parse(tempLearned);
        if (parsed.length > 0) setLearnedItems(parsed);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (transcriptEndRef.current && !showScrollButton) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sessionSummary, showScrollButton]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setShowScrollButton(!isAtBottom);
  };

  const scrollToBottom = () => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setShowScrollButton(false);
    }
  };

  const launchApp = () => {
    setHasLaunched(true);
    localStorage.setItem('ngenglish_launched', 'true');
  };

  const resetAll = () => {
    if (confirm('Reset all progress and see landing page again?')) {
      localStorage.removeItem('ngenglish_mastery');
      localStorage.removeItem('english_tutor_sessions');
      localStorage.removeItem('ngenglish_launched');
      window.location.reload();
    }
  };

  const ringScale = 1 + Math.min(audioLevel * 6, 0.8);

  const deleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem('english_tutor_sessions', JSON.stringify(updated));
    if (expandedSessionId === id) setExpandedSessionId(null);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className={`relative w-full h-screen overflow-hidden font-sans ${isLightMode ? 'bg-[#E6E6E6]' : 'bg-[#09090b]'} ${isLightMode ? 'text-zinc-900' : 'text-zinc-100'}`}>
      <style>{`
        .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
        .grid-mask {
          background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0);
          background-size: 24px 24px;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(59, 130, 246, 0.2); 
          border-radius: 10px; 
        }
      `}</style>
      
      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="absolute top-6 left-1/2 bg-red-500 text-white px-6 py-3 rounded-2xl text-xs font-bold tracking-wider shadow-xl z-50 flex items-center gap-3 min-w-[320px] uppercase glow-border border border-red-400/50"
          >
            <AlertCircle className="w-4 h-4" />
            <p className="font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!hasLaunched ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            className="absolute inset-0 z-[100] bg-[#09090b] text-white flex flex-col items-center justify-center p-8 overflow-y-auto"
          >
            <div className="absolute inset-0 grid-mask opacity-20 pointer-events-none"></div>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="max-w-4xl w-full"
            >
              <div className="flex flex-col items-center text-center mb-16">
                <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.4)] mb-8 ring-1 ring-blue-400/50">
                  <Target className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter italic uppercase mb-4 leading-none">
                  Ngen<span className="text-blue-500">glish</span>
                </h1>
                <p className="text-zinc-500 font-bold uppercase tracking-[0.4em] text-sm md:text-base">
                  TechnoFest 2026 // AI Learning Agent
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                {[
                  { icon: <Cpu className="text-blue-500" />, title: "Autonomous Voice Core", desc: "Self-correcting AI that independently adjusts its teaching style based on your unique linguistic patterns in real-time." },
                  { icon: <BrainCircuit className="text-emerald-500" />, title: "Context-Aware Memory", desc: "The agent maintains a persistent long-term memory of your progress, evolving as you learn without manual configuration." },
                  { icon: <Zap className="text-purple-500" />, title: "Dynamic Synthesis", desc: "Autonomous generation of quizzes and summaries, synthesized instantly from the context of your spoken conversations." },
                  { icon: <MonitorPlay className="text-orange-500" />, title: "Reactive Interface", desc: "A real-time bridge between voice interaction and visual feedback, providing an autonomous multi-modal learning experience." }
                ].map((feature, i) => (
                  <motion.div 
                    key={i}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm group hover:border-zinc-700 transition-all flex flex-col items-center text-center md:items-start md:text-left"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* Hackathon Criteria Section: Autonomous Logic */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="mb-16 border-t border-zinc-800 pt-12"
              >
                <div className="flex items-center gap-3 mb-8">
                   <div className="w-1 h-10 bg-blue-600 rounded-full"></div>
                   <h2 className="text-2xl font-black uppercase tracking-[0.2em]">Autonomous Agent Logic</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/50">
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest block mb-2">01 // Proactive Probing</span>
                    <p className="text-xs text-zinc-400">Agent autonomously analyzes silence and hesitation to trigger proactive supportive prompts without user input.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/50">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block mb-2">02 // Dynamic Synthesis</span>
                    <p className="text-xs text-zinc-400">Context-aware memory synthesis: The dashboard independently mutates based on the semantic flow of the conversation.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/50">
                    <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest block mb-2">03 // Adaptive HUD</span>
                    <p className="text-xs text-zinc-400">Self-evolving interface that shifts focus between grammar, vocabulary, or pronunciation as the AI perceives weaknesses.</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col items-center gap-6"
              >
                <button
                  onClick={launchApp}
                  className="px-12 py-5 bg-blue-600 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-blue-500 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)]"
                >
                  Initiate Learning Protocol
                </button>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                  Secure Local Instance // Ready for Hackathon Phase 01
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <div key="app" className="relative w-full h-full flex flex-col md:flex-row overflow-hidden">
            <div className="absolute inset-0 grid-mask opacity-10 pointer-events-none"></div>
            
            <div className="absolute inset-0 flex flex-col md:flex-row w-full h-full z-10 overflow-hidden">
        {/* Sidebar / Panel (Hardware Recipe) */}
        <AnimatePresence mode="wait">
          {(!isMobile || activeTab !== 'dashboard') && (
            <motion.div
              key={isMobile ? activeTab : 'sidebar'}
              initial={isMobile ? { opacity: 0, scale: 0.95 } : { width: 0, opacity: 0 }}
              animate={isMobile 
                ? { opacity: 1, scale: 1, width: '100%', height: '100%' } 
                : { width: showCode ? '420px' : 0, opacity: showCode ? 1 : 0, height: '100%' }
              }
              exit={isMobile ? { opacity: 0, scale: 0.95 } : { width: 0, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className={`overflow-hidden flex flex-col relative shrink-0 ${isLightMode ? 'bg-[#f7f7f7]' : 'bg-[#151619]'} border-r border-zinc-800/50 shadow-2xl`}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.5)] z-20"></div>
              
              {/* Hardware Header */}
              <div className="p-6 md:p-8 space-y-6 shrink-0 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-blue-400/30">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="font-black text-xl tracking-tighter uppercase italic">Ngenglish <span className="text-blue-500">Agent</span></h2>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">Active Mode // TechnoFest 2026</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsLightMode(!isLightMode)}
                      className={`p-2 rounded-xl transition-all border ${isLightMode ? 'bg-zinc-100 border-zinc-200 text-zinc-600' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'}`}
                    >
                      {isLightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    </button>
                    {isMobile && (
                      <button onClick={() => setActiveTab('dashboard')} className="p-2 text-zinc-400">
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Mastery HUD */}
                <div className="grid grid-cols-3 gap-2">
                   <div className={`p-3 rounded-2xl border flex flex-col items-center justify-center ${isLightMode ? 'bg-white border-zinc-200' : 'bg-[#0c0c0e] border-zinc-800/50 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]'}`}>
                      <span className="text-[8px] font-bold uppercase text-zinc-500 mb-1">XP Points</span>
                      <span className="text-sm font-black mono tabular-nums text-blue-500">{masteryStats.xp}</span>
                   </div>
                   <div className={`p-3 rounded-2xl border flex flex-col items-center justify-center ${isLightMode ? 'bg-white border-zinc-200' : 'bg-[#0c0c0e] border-zinc-800/50'}`}>
                      <span className="text-[8px] font-bold uppercase text-zinc-500 mb-1">Rank</span>
                      <span className="text-xs font-black uppercase text-zinc-200">{masteryStats.level}</span>
                   </div>
                   <div className={`p-3 rounded-2xl border flex flex-col items-center justify-center ${isLightMode ? 'bg-white border-zinc-200' : 'bg-[#0c0c0e] border-zinc-800/50'}`}>
                      <span className="text-[8px] font-bold uppercase text-zinc-500 mb-1">Streak</span>
                      <span className="text-sm font-black mono text-orange-500">{masteryStats.streak}d</span>
                   </div>
                </div>

                <div className="flex border-b border-zinc-800/30">
                  <button 
                    onClick={() => {
                      setView('tutor');
                      if (isMobile) setActiveTab('chat');
                    }}
                    className={`flex-1 pb-3 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${ (isMobile ? activeTab === 'chat' : view === 'tutor') ? 'text-blue-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    Control
                    {(isMobile ? activeTab === 'chat' : view === 'tutor') && <motion.div layoutId="navGlow" className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
                  </button>
                  <button 
                    onClick={() => {
                      setView('history');
                      if (isMobile) setActiveTab('history');
                    }}
                    className={`flex-1 pb-3 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${ (isMobile ? activeTab === 'history' : view === 'history') ? 'text-blue-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    Memory
                    {(isMobile ? activeTab === 'history' : view === 'history') && <motion.div layoutId="navGlow" className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
                  </button>
                </div>
              </div>

              <div 
                ref={transcriptContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto custom-scrollbar relative px-6 md:px-8 pb-24 md:pb-8"
              >
                {(isMobile ? activeTab === 'chat' : view === 'tutor') ? (
                  <div className="space-y-6 pr-2 pb-4">
                    {/* Goal Selector Integrated - Custom Dropdown for Visibility */}
                    <div className="relative">
                      <div className={`p-4 rounded-2xl border transition-all ${isLightMode ? 'bg-white border-zinc-200' : 'bg-zinc-900/50 border-zinc-800'} ${isGoalSelectorOpen ? 'ring-2 ring-blue-500/50' : ''}`}>
                        <div className="flex items-center justify-between mb-3">
                           <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Target Objective</span>
                           <Target className="w-3 h-3 text-blue-500" />
                        </div>
                        <button 
                          onClick={() => !isConnected && setIsGoalSelectorOpen(!isGoalSelectorOpen)}
                          disabled={isConnected}
                          className={`w-full flex items-center justify-between text-left text-sm font-bold outline-none cursor-pointer disabled:cursor-not-allowed ${isLightMode ? 'text-zinc-900' : 'text-zinc-100'}`}
                        >
                          <span>{learningGoal}</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${isGoalSelectorOpen ? 'rotate-180' : ''}`} />
                        </button>
                      </div>

                      <AnimatePresence>
                        {isGoalSelectorOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 5, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className={`absolute top-full left-0 w-full z-[100] mt-1 p-2 rounded-2xl border shadow-2xl backdrop-blur-xl ${isLightMode ? 'bg-white/90 border-zinc-200' : 'bg-[#151619]/90 border-zinc-800'}`}
                          >
                            <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                              {LEARNING_GOALS.map(goal => (
                                <button
                                  key={goal}
                                  onClick={() => {
                                    setLearningGoal(goal);
                                    setIsGoalSelectorOpen(false);
                                  }}
                                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
                                    learningGoal === goal 
                                    ? 'bg-blue-600 text-white' 
                                    : isLightMode ? 'hover:bg-zinc-100 text-zinc-600' : 'hover:bg-zinc-800 text-zinc-300'
                                  }`}
                                >
                                  {goal}
                                  {learningGoal === goal && <Target className="w-3 h-3" />}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {sessionSummary.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${isLightMode ? 'bg-zinc-100 text-zinc-400' : 'bg-zinc-900 text-zinc-600'}`}>
                          <FileText className="w-6 h-6" />
                        </div>
                        <p className={`text-xs font-medium ${isLightMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                          Ngenglish will summarize your session here...
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <h3 className={`text-[10px] font-bold uppercase tracking-widest ${isLightMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Session Summary</h3>
                        </div>
                        <div className={`prose prose-sm max-w-none ${isLightMode ? 'prose-zinc' : 'prose-invert'} p-4 rounded-3xl border ${isLightMode ? 'bg-white border-zinc-200 shadow-sm' : 'bg-zinc-900/50 border-zinc-800'}`}>
                          <ReactMarkdown>{sessionSummary}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                    
                    {learnedItems.length > 0 && (
                      <div className="mt-6 space-y-3">
                        <div className="flex items-center gap-2 px-1">
                          <BookOpen className="w-4 h-4 text-purple-500" />
                          <h3 className={`text-[10px] font-bold uppercase tracking-widest ${isLightMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Learned Today</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {learnedItems.map((item, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`px-3 py-1.5 rounded-2xl text-[11px] font-medium border flex items-center gap-2 ${
                                item.type === 'vocabulary' 
                                  ? (isLightMode ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-blue-900/20 text-blue-300 border-blue-800/30')
                                  : item.type === 'grammar'
                                  ? (isLightMode ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-purple-900/20 text-purple-300 border-purple-800/30')
                                  : (isLightMode ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-emerald-900/20 text-emerald-300 border-emerald-800/30')
                              }`}
                            >
                              <span className="opacity-50">•</span>
                              {item.content}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6 pr-2 pb-4">
                    {sessions.length === 0 ? (
                      <div className={`text-xs italic ${isLightMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        No past sessions yet. Complete a session to see it here.
                      </div>
                    ) : (
                      sessions.map((session) => (
                        <div 
                          key={session.id} 
                          className={`p-4 rounded-2xl border transition-all duration-300 ${isLightMode ? 'bg-white border-zinc-200 shadow-sm' : 'bg-zinc-900 border-zinc-800'} ${expandedSessionId === session.id ? 'ring-1 ring-blue-500' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <button 
                              onClick={() => setExpandedSessionId(expandedSessionId === session.id ? null : session.id)}
                              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                            >
                              <History className={`w-3 h-3 ${isLightMode ? 'text-zinc-400' : 'text-zinc-500'}`} />
                              <span className={`text-[10px] font-bold ${isLightMode ? 'text-zinc-500' : 'text-zinc-400'}`}>{session.date}</span>
                              {expandedSessionId === session.id ? <ChevronUp className="w-3 h-3 text-zinc-400" /> : <ChevronDown className="w-3 h-3 text-zinc-400" />}
                            </button>
                            <button 
                              onClick={() => deleteSession(session.id)}
                              className="text-zinc-500 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          
                          {session.learnedItems.length > 0 && (
                            <div className="mb-3 space-y-2">
                              <div className="flex items-center gap-1">
                                <BookOpen className="w-3 h-3 text-blue-500" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Learned</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {session.learnedItems.map((item, idx) => (
                                  <div 
                                    key={idx} 
                                    className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${isLightMode ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-blue-900/20 text-blue-300 border-blue-800/30'}`}
                                  >
                                    {item.content}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className={`prose prose-xs max-w-none ${isLightMode ? 'prose-zinc' : 'prose-invert'} ${expandedSessionId === session.id ? '' : 'line-clamp-3 opacity-60'}`}>
                            <ReactMarkdown>{session.summary}</ReactMarkdown>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
                
                {/* Scroll to Bottom Button */}
                <AnimatePresence>
                  {showScrollButton && (isMobile ? activeTab === 'chat' : view === 'tutor') && sessionSummary.length > 0 && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={scrollToBottom}
                      className={`absolute bottom-24 md:bottom-4 right-6 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all z-20 ${isLightMode ? 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50' : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700'}`}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
              
              {!isMobile && (
                <div className="mt-6 shrink-0 text-center">
                  <p className={`text-[10px] ${isLightMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    {view === 'tutor' ? 'Ngenglish siap bantuin kamu belajar.' : 'Review progress dan percakapan lama kamu.'}
                  </p>
                </div>
              )}

              {/* Sidebar FOOTER: Relocated Connect Hub */}
              <div className={`p-6 shrink-0 relative z-40 border-t ${isLightMode ? 'bg-white border-zinc-200' : 'bg-[#151619] border-zinc-800/50'}`}>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={isConnected ? disconnect : connect}
                    disabled={isConnecting}
                    className={`w-full relative group flex items-center justify-center p-4 rounded-2xl transition-all font-black uppercase tracking-[0.2em] text-[10px] overflow-hidden ${
                      isConnected 
                      ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
                      : isConnecting 
                        ? 'bg-zinc-800 text-zinc-500' 
                        : 'bg-blue-600 text-white shadow-[0_0_25px_rgba(59,130,246,0.4)] hover:scale-[1.02] active:scale-95'
                    }`}
                  >
                    <div className="flex items-center gap-2 relative z-10 transition-transform">
                      {isConnecting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : isConnected ? (
                        <Square className="w-4 h-4 fill-current" />
                      ) : (
                        <Mic className="w-5 h-5" />
                      )}
                      <span>{isConnecting ? 'Linking...' : isConnected ? 'Abort session' : 'Initiate Agent'}</span>
                    </div>
                  </button>

                  <div className="flex items-center justify-center gap-3">
                     <div className="flex items-center gap-2">
                        <div className={`w-1 h-1 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-zinc-600'}`}></div>
                        <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">{isConnected ? 'System Voice Linked' : 'Voice Disconnected'}</span>
                     </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview Panel (Dashboard) */}
        <AnimatePresence mode="wait">
          {(!isMobile || activeTab === 'dashboard') && (
            <motion.div 
              initial={isMobile ? { opacity: 0, scale: 0.95 } : undefined}
              animate={{ opacity: 1, scale: 1 }}
              exit={isMobile ? { opacity: 0, scale: 0.95 } : undefined}
              className="flex-1 w-full relative bg-white min-h-0 min-w-0 flex flex-col"
            >
              {!isMobile && (
                <button
                  onClick={() => setShowCode(!showCode)}
                  className="absolute top-1/2 left-0 -translate-y-1/2 z-50 flex items-center justify-center w-6 h-14 bg-white border border-zinc-300 border-l-0 rounded-r-lg shadow-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-all"
                  title={showCode ? "Hide Sidebar" : "Show Sidebar"}
                >
                  {showCode ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              )}
              <iframe
                srcDoc={appCode}
                className="flex-1 w-full border-none"
                title="Learning Dashboard"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )}
</AnimatePresence>

      {/* Floating Status Indicator (Hidden sidebar or mobile dashboard) */}
      <AnimatePresence>
        {isConnected && (!showCode || (isMobile && activeTab === 'dashboard')) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 md:bottom-12 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto"
          >
            <button 
              onClick={disconnect}
              className={`flex items-center gap-3 px-6 py-3 rounded-full border backdrop-blur-xl transition-all ${isLightMode ? 'bg-white/80 border-blue-100 shadow-lg shadow-blue-500/10 text-zinc-600' : 'bg-zinc-900/80 border-blue-500/30 text-zinc-300'}`}
            >
               <motion.div 
                 animate={{ scale: isModelSpeaking ? [1, 1.2, 1] : ringScale }}
                 className={`w-2.5 h-2.5 rounded-full ${isModelSpeaking ? 'bg-blue-500 shadow-[0_0_10px_#3b82f6]' : 'bg-red-500'}`} 
               />
               <span className="text-[9px] font-black uppercase tracking-widest">
                 {isModelSpeaking ? 'Agent Speaking' : 'Listening...'}
               </span>
               <div className="w-[1px] h-3 bg-zinc-700/50" />
               <Square className="w-3 h-3 fill-current text-red-500" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className={`absolute bottom-0 left-0 right-0 h-20 z-[60] flex items-center justify-around px-6 border-t shadow-[0_-10px_30px_rgba(0,0,0,0.05)] ${isLightMode ? 'bg-white/80 backdrop-blur-lg border-zinc-100' : 'bg-zinc-950/80 backdrop-blur-lg border-zinc-800'}`}>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'dashboard' ? 'text-blue-500 scale-110' : 'text-zinc-400'}`}
          >
            <Sun className={`w-5 h-5 ${activeTab === 'dashboard' ? 'fill-blue-500/10' : ''}`} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Board</span>
          </button>
          
          <div className="w-12" /> {/* Spacer for Mic button */}

          <button 
            onClick={() => {
              setActiveTab('chat');
              setView('tutor');
            }}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'chat' ? 'text-blue-500 scale-110' : 'text-zinc-400'}`}
          >
            <History className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Chat</span>
          </button>

          <button 
            onClick={() => {
              setActiveTab('history');
              setView('history');
            }}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'history' ? 'text-blue-500 scale-110' : 'text-zinc-400'}`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-widest">History</span>
          </button>
        </div>
      )}

      {/* Top Right Controls */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={resetAll}
          className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border transition-all shadow-sm font-bold text-[10px] uppercase tracking-widest ${isLightMode ? 'bg-white/90 border-zinc-200 text-zinc-600 hover:text-zinc-900 shadow-xl' : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-white'}`}
          title="Reset All Progress"
        >
          <RotateCcw className="w-3 h-3" />
          <span>System Reset</span>
        </motion.button>
      </div>
    </div>
  );
}
