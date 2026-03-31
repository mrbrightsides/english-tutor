import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, AlertCircle, RotateCcw, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Sun, Moon, History, BookOpen, Trash2, X, ArrowDown, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLiveAPI, TranscriptEntry, LearnedItem } from './hooks/useLiveAPI';

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
  transcript: TranscriptEntry[];
  learnedItems: LearnedItem[];
}

const INITIAL_APP_CODE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; }
  </style>
</head>
<body class="bg-zinc-50 min-h-screen flex flex-col items-center justify-center p-6 md:p-12 text-center">
  <div class="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-zinc-100">
    <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>
    </div>
    <h1 class="text-3xl md:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">Welcome to Ngenglish</h1>
    <p class="text-zinc-500 text-sm md:text-base leading-relaxed mb-10 max-w-lg mx-auto">
      Halo! Aku tutor AI personal kamu buat belajar bahasa Inggris. Klik mic di bawah buat mulai ngobrol. Pilih aktivitasnya atau langsung cuap-cuap aja!
    </p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
      <div class="p-5 bg-blue-50/50 rounded-3xl border border-blue-100/50 transition-all hover:bg-blue-50">
        <div class="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <h3 class="font-bold text-zinc-900 text-sm mb-1">Casual Conversation</h3>
        <p class="text-zinc-500 text-xs leading-snug">Practice natural speaking on any topic you like.</p>
      </div>
      
      <div class="p-5 bg-purple-50/50 rounded-3xl border border-purple-100/50 transition-all hover:bg-purple-50">
        <div class="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <h3 class="font-bold text-zinc-900 text-sm mb-1">Interactive Quiz</h3>
        <p class="text-zinc-500 text-xs leading-snug">Test your knowledge with dynamic grammar & vocab questions.</p>
      </div>
      
      <div class="p-5 bg-emerald-50/50 rounded-3xl border border-emerald-100/50 transition-all hover:bg-emerald-50">
        <div class="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        </div>
        <h3 class="font-bold text-zinc-900 text-sm mb-1">Storytelling</h3>
        <p class="text-zinc-500 text-xs leading-snug">Listen to or help create an immersive interactive story.</p>
      </div>
      
      <div class="p-5 bg-orange-50/50 rounded-3xl border border-orange-100/50 transition-all hover:bg-orange-50">
        <div class="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </div>
        <h3 class="font-bold text-zinc-900 text-sm mb-1">Fill-in-the-Blanks</h3>
        <p class="text-zinc-500 text-xs leading-snug">A fun vocabulary exercise to master word usage in context.</p>
      </div>
    </div>
    
    <div class="mt-10 pt-8 border-t border-zinc-100">
      <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Made with ❤︎ by mrbrightsides</p>
    </div>
  </div>
</body>
</html>`;

export default function App() {
  const [appCode, setAppCode] = useState<string>(INITIAL_APP_CODE);
  const [showCode, setShowCode] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isLightMode, setIsLightMode] = useState<boolean>(false);
  const [view, setView] = useState<'tutor' | 'history'>('tutor');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'history'>('dashboard');
  const [learningGoal, setLearningGoal] = useState<string>("General English");
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedSessions = localStorage.getItem('english_tutor_sessions');
    if (savedSessions) {
      try {
        setSessions(JSON.parse(savedSessions));
      } catch (e) {
        console.error("Failed to load sessions", e);
      }
    }
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { isConnected, isConnecting, error, audioLevel, isModelSpeaking, transcript, learnedItems, connect, disconnect, setTranscript, setLearnedItems } = useLiveAPI(setAppCode, appCode, learningGoal, playbackSpeed);

  // Save session when disconnected and has content
  useEffect(() => {
    if (!isConnected && (transcript.length > 0 || learnedItems.length > 0)) {
      const newSession: Session = {
        id: Date.now().toString(),
        date: new Date().toLocaleString(),
        transcript: [...transcript],
        learnedItems: [...learnedItems]
      };
      
      const updatedSessions = [newSession, ...sessions];
      setSessions(updatedSessions);
      localStorage.setItem('english_tutor_sessions', JSON.stringify(updatedSessions));
      
      // Clear current session data for next time
      setTranscript([]);
      setLearnedItems([]);
    }
  }, [isConnected]);

  useEffect(() => {
    if (transcriptEndRef.current && !showScrollButton) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript, showScrollButton]);

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

  // Scale the audio ring
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
      utterance.rate = playbackSpeed;
      window.speechSynthesis.speak(utterance);
    }
  };

  const scrollToTranscriptItem = (text: string) => {
    const elements = document.querySelectorAll('.transcript-item');
    for (const el of elements) {
      if (el.textContent?.toLowerCase().includes(text.toLowerCase())) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2');
        setTimeout(() => el.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2'), 2000);
        break;
      }
    }
  };

  return (
    <div className="relative w-full h-screen bg-white overflow-hidden font-sans text-zinc-900">
      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="absolute top-6 left-1/2 bg-white/80 backdrop-blur-md border border-red-100 text-red-600 px-6 py-3 rounded-2xl text-sm shadow-xl z-50 flex items-center gap-3 min-w-[320px]"
          >
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <p className="font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Always-visible app canvas */}
      <div className="absolute inset-0 flex flex-col md:flex-row w-full h-full z-10 bg-white overflow-hidden">
        {/* Sidebar / Panel (Desktop: Side, Mobile: Full Screen based on tab) */}
        <AnimatePresence mode="wait">
          {(!isMobile || activeTab !== 'dashboard') && (
            <motion.div
              key={isMobile ? activeTab : 'sidebar'}
              initial={isMobile ? { opacity: 0, y: 20 } : { width: 0, opacity: 0 }}
              animate={isMobile 
                ? { opacity: 1, y: 0, width: '100%', height: '100%' } 
                : { width: showCode ? '33.333333%' : 0, opacity: showCode ? 1 : 0, height: '100%' }
              }
              exit={isMobile ? { opacity: 0, y: 20 } : { width: 0, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className={`overflow-hidden p-6 shadow-inner shrink-0 flex flex-col ${isLightMode ? 'bg-zinc-50' : 'bg-zinc-950'} ${!isMobile && 'border-r border-zinc-200'}`}
            >
              <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      setView('tutor');
                      if (isMobile) setActiveTab('chat');
                    }}
                    className={`text-xs font-bold uppercase tracking-wider transition-colors ${(isMobile ? activeTab === 'chat' : view === 'tutor') ? (isLightMode ? 'text-blue-600' : 'text-blue-400') : (isLightMode ? 'text-zinc-400' : 'text-zinc-600')}`}
                  >
                    Transcript
                  </button>
                  <button 
                    onClick={() => {
                      setView('history');
                      if (isMobile) setActiveTab('history');
                    }}
                    className={`text-xs font-bold uppercase tracking-wider transition-colors ${(isMobile ? activeTab === 'history' : view === 'history') ? (isLightMode ? 'text-blue-600' : 'text-blue-400') : (isLightMode ? 'text-zinc-400' : 'text-zinc-600')}`}
                  >
                    History
                  </button>
                </div>
                
                {(isMobile ? activeTab === 'chat' : view === 'tutor') && (
                  <div className="relative group">
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border transition-all ${isLightMode ? 'bg-white border-zinc-200 text-zinc-600' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
                      <Target className="w-3 h-3" />
                      <select 
                        value={learningGoal}
                        onChange={(e) => setLearningGoal(e.target.value)}
                        disabled={isConnected}
                        className="bg-transparent text-[10px] font-bold uppercase tracking-tighter outline-none cursor-pointer disabled:cursor-not-allowed"
                      >
                        {LEARNING_GOALS.map(goal => (
                          <option key={goal} value={goal}>{goal}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div 
                ref={transcriptContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto custom-scrollbar relative pb-24 md:pb-4"
              >
                {(isMobile ? activeTab === 'chat' : view === 'tutor') ? (
                  <div className="space-y-4 pr-2 pb-4">
                    {transcript.length === 0 ? (
                      <div className={`text-xs italic ${isLightMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        Start speaking to see the transcript...
                      </div>
                    ) : (
                      transcript.map((entry, i) => (
                        <div key={i} className={`transcript-item flex flex-col gap-1 transition-all duration-500 ${entry.role === 'user' ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-2">
                            {entry.role === 'model' && (
                              <button 
                                onClick={() => speakText(entry.text)}
                                className={`p-1 rounded-full hover:bg-zinc-200 transition-colors ${isLightMode ? 'text-zinc-400' : 'text-zinc-600'}`}
                                title="Read aloud"
                              >
                                <RotateCcw className="w-2.5 h-2.5" />
                              </button>
                            )}
                            <span className={`text-[10px] font-bold uppercase tracking-tighter ${entry.role === 'user' ? 'text-blue-500' : 'text-zinc-500'}`}>
                              {entry.role === 'user' ? 'You' : 'Ngenglish'}
                            </span>
                          </div>
                          <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed max-w-[90%] ${
                            entry.role === 'user' 
                              ? (isLightMode ? 'bg-blue-50 text-blue-900 border border-blue-100' : 'bg-blue-900/30 text-blue-100 border border-blue-800/50')
                              : (isLightMode ? 'bg-zinc-100 text-zinc-900 border border-zinc-200' : 'bg-zinc-800/50 text-zinc-100 border border-zinc-700/50')
                          }`}>
                            {entry.text}
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={transcriptEndRef} />
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
                                  <button 
                                    key={idx} 
                                    onClick={() => {
                                      if (expandedSessionId !== session.id) setExpandedSessionId(session.id);
                                      setTimeout(() => scrollToTranscriptItem(item.content), 100);
                                    }}
                                    className={`px-2 py-0.5 rounded-full text-[9px] font-medium transition-all hover:scale-105 active:scale-95 ${isLightMode ? 'bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100' : 'bg-blue-900/20 text-blue-300 border border-blue-800/30 hover:bg-blue-900/40'}`}
                                  >
                                    {item.content}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className={`space-y-2 ${expandedSessionId === session.id ? '' : 'opacity-60'}`}>
                            {(expandedSessionId === session.id ? session.transcript : session.transcript.slice(0, 2)).map((entry, idx) => (
                              <div key={idx} className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[9px] font-bold uppercase tracking-tighter ${entry.role === 'user' ? 'text-blue-500' : 'text-zinc-500'}`}>
                                    {entry.role === 'user' ? 'You' : 'Ngenglish'}
                                  </span>
                                  {expandedSessionId === session.id && entry.role === 'model' && (
                                    <button 
                                      onClick={() => speakText(entry.text)}
                                      className="p-0.5 rounded-full hover:bg-zinc-200 text-zinc-400"
                                    >
                                      <RotateCcw className="w-2 h-2" />
                                    </button>
                                  )}
                                </div>
                                <p className={`transcript-item text-[10px] leading-relaxed ${expandedSessionId === session.id ? '' : 'line-clamp-1'} ${isLightMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                  {entry.text}
                                </p>
                              </div>
                            ))}
                            {expandedSessionId !== session.id && session.transcript.length > 2 && (
                              <p className="text-[9px] italic text-zinc-500">+{session.transcript.length - 2} more messages</p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
                
                {/* Scroll to Bottom Button */}
                <AnimatePresence>
                  {showScrollButton && (isMobile ? activeTab === 'chat' : view === 'tutor') && transcript.length > 0 && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={scrollToBottom}
                      className={`absolute bottom-24 md:bottom-4 right-6 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all ${isLightMode ? 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50' : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700'}`}
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview Panel (Dashboard) */}
        <AnimatePresence mode="wait">
          {(!isMobile || activeTab === 'dashboard') && (
            <motion.div 
              initial={isMobile ? { opacity: 0, scale: 0.95 } : false}
              animate={{ opacity: 1, scale: 1 }}
              exit={isMobile ? { opacity: 0, scale: 0.95 } : false}
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

      {/* Floating Mic Button */}
      <motion.div 
        layout
        initial={false}
        animate={{
          left: isConnected ? (isMobile ? '50%' : '2rem') : '50%',
          bottom: isConnected ? (isMobile ? '6rem' : '2rem') : (isMobile ? '7rem' : '6rem'),
          x: '-50%',
          scale: isConnected && isMobile ? 0.9 : 1
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="absolute z-50"
      >
        <div className="relative group">
          {/* Audio Level Ring */}
          {isConnected && (
            <motion.div
              className="absolute rounded-full border-2 pointer-events-none"
              style={{
                inset: '-6px',
                borderColor: isModelSpeaking 
                  ? 'rgba(59, 130, 246, 0.5)' 
                  : (isLightMode ? 'rgba(239, 68, 68, 0.4)' : 'rgba(24, 24, 27, 0.3)'),
              }}
              animate={{ 
                scale: isModelSpeaking ? [1, 1.15, 1] : ringScale,
                opacity: isModelSpeaking ? [0.4, 0.8, 0.4] : Math.min(audioLevel * 10, 1),
              }}
              transition={isModelSpeaking ? { duration: 1.2, repeat: Infinity } : { duration: 0.05 }}
            />
          )}

          {/* Pulse effect when connected */}
          {isConnected && (
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`absolute -inset-4 rounded-full ${isLightMode ? 'bg-red-500/20' : 'bg-zinc-900/20'}`}
            />
          )}
          
          <button
            onClick={isConnected ? disconnect : connect}
            disabled={isConnecting}
            className={`
              relative flex items-center justify-center rounded-full 
              transition-all duration-500
              ${isConnected 
                ? (isLightMode ? 'bg-white text-red-500 border border-red-100 w-12 h-12 shadow-[0_20px_50px_rgba(0,0,0,0.1)]' : 'bg-zinc-800 text-red-400 border border-zinc-700 w-12 h-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)]') 
                : (isLightMode ? 'bg-white text-zinc-900 hover:scale-105 active:scale-95 border border-zinc-100 w-16 h-16 shadow-[0_20px_50px_rgba(0,0,0,0.1)]' : 'bg-zinc-900 text-white hover:scale-105 active:scale-95 border border-zinc-800 w-16 h-16 shadow-[0_20px_50px_rgba(0,0,0,0.3)]')
              }
              ${isConnecting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {isConnecting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : isConnected ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </button>
        </div>
      </motion.div>

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
        <div className="flex items-center bg-white/90 backdrop-blur-md border border-zinc-200 rounded-full px-3 py-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mr-2">Speed</span>
          <div className="flex gap-1">
            {[0.8, 1.0, 1.2, 1.5].map(speed => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`w-8 h-7 rounded-full text-[10px] font-bold transition-all ${playbackSpeed === speed ? 'bg-blue-500 text-white' : 'text-zinc-500 hover:bg-zinc-100'}`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setIsLightMode(!isLightMode)}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 transition-all shadow-sm"
          title={isLightMode ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {isLightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </motion.button>

        {appCode !== INITIAL_APP_CODE && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setAppCode(INITIAL_APP_CODE)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 transition-all shadow-sm font-medium text-sm"
            title="Reset to initial state"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </motion.button>
        )}
      </div>
    </div>
  );
}
