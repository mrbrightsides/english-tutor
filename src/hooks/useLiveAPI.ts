import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration, ThinkingLevel } from '@google/genai';

export interface LearnedItem {
  content: string;
  type: 'vocabulary' | 'grammar' | 'pronunciation';
}

export function useLiveAPI(
  onAppCodeUpdate: (code: string) => void, 
  currentAppCode: string, 
  learningGoal: string = "General English", 
  sessionsCount: number = 0,
  learnedItemsList: string[] = [],
  masteryStats: any = {},
  onMasteryUpdate: (stats: any) => void
) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<string>("");
  const [learnedItems, setLearnedItems] = useState<LearnedItem[]>([]);
  
  const sessionRef = useRef<any>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const respondedToolCallsRef = useRef<Set<string>>(new Set());
  const gainNodeRef = useRef<GainNode | null>(null);

  const cleanup = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      audioContextRef.current = null;
    }
    if (playbackContextRef.current) {
      if (playbackContextRef.current.state !== 'closed') {
        playbackContextRef.current.close();
      }
      playbackContextRef.current = null;
    }
    gainNodeRef.current = null;
    
    if (sessionRef.current) {
      if (typeof sessionRef.current.close === 'function') {
        sessionRef.current.close();
      }
      sessionRef.current = null;
    }
    
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => {
        if (session && typeof session.close === 'function') {
          session.close();
        }
      }).catch(() => {});
      sessionPromiseRef.current = null;
    }
  }, []);

  const connect = useCallback(async () => {
    cleanup();
    
    setIsConnecting(true);
    setError(null);
    setSessionSummary("");
    respondedToolCallsRef.current.clear();
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      
      playbackContextRef.current = new AudioContext({ sampleRate: 24000 });
      gainNodeRef.current = playbackContextRef.current.createGain();
      gainNodeRef.current.gain.value = 1.8; 
      gainNodeRef.current.connect(playbackContextRef.current.destination);
      
      nextPlayTimeRef.current = playbackContextRef.current.currentTime;

      const sessionPromise = ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: `You are 'Ngenglish AI Agent', a proactive and intelligent personal English coach for TechnoFest 2026.
          
          MISSION: Reimagining the future of learning by being more than a chatbot. You are a coach that tracks progress, sets challenges, and proactively manages the user's growth.
          
          USER'S CURRENT LEARNING GOAL: ${learningGoal}
          - SESSIONS COMPLETED: ${sessionsCount}
          - ITEMS LEARNED: ${learnedItemsList.length > 0 ? learnedItemsList.join(', ') : 'None yet'}
          - LEVEL: ${masteryStats.level || 'Novice'}
          - XP: ${masteryStats.xp || 0}
          - WORDS MASTERED: ${masteryStats.wordsMastered || 0}
          - STREAK: ${masteryStats.streak || 0} days

          CRITICAL RULES:
          1. DASHBOARD INITIALIZATION: Immediately upon connection, you MUST call 'updateAppCode' to initialize the Learning Dashboard with relevant data (Current Stats, Goals, and Missions). Do NOT wait for user input to update the UI.
          2. INTERRUPTIONS: You are designed for real-time conversation. It is perfectly fine if the user interrupts you. Stop speaking immediately and listen.
          3. PROACTIVE GREETING: Start the session by referencing progress. Ex: "Halo! Kemarin kita udah belajar ${learnedItemsList.slice(-2).join(' & ')}. Hari ini mau hajar ${learningGoal} lagi atau mau coba tantangan baru?"
          4. CREATIVE MISSIONS: Periodically set "Creative Missions" to keep things exciting. (e.g., "Describe a cat without using the word 'animal'").
          5. MASTERY TRACKING: Every time the user shows improvement, update their stats using 'updateMasteryStats'. Be generous with XP and words.
          
          TOOLS:
          - updateAppCode: Update the Learning Dashboard UI. (ALWAYS CALL THIS AT START).
          - logLearnedItem: Log a specific vocab/grammar point.
          - updateSessionSummary: Update the live markdown summary.
          - updateMasteryStats: Update level, XP, and mastered word count.
          
          Greet in a mix of casual Indonesian and English. Focus on the goal: ${learningGoal}.`,
          tools: [{
            functionDeclarations: [
              {
                name: "updateAppCode",
                description: "Updates the Learning Dashboard UI with educational content or interactive missions.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    htmlContent: {
                      type: Type.STRING,
                      description: "The complete HTML document for the Learning Dashboard.",
                    },
                  },
                  required: ["htmlContent"],
                },
              },
              {
                name: "logLearnedItem",
                description: "Log a new vocabulary word or grammar point.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING, enum: ['vocabulary', 'grammar', 'pronunciation'], description: "The type of item learned." },
                    content: { type: Type.STRING, description: "The word or rule learned." }
                  },
                  required: ["type", "content"]
                }
              },
              {
                name: "updateSessionSummary",
                description: "Updates the live session summary with key points and progress.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    summary: {
                      type: Type.STRING,
                      description: "The updated session summary in Markdown format.",
                    },
                  },
                  required: ["summary"],
                },
              },
              {
                name: "updateMasteryStats",
                description: "Update the user's overall learning progress metrics.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    xp: { type: Type.NUMBER, description: "Total XP points gained in this update." },
                    wordsMastered: { type: Type.NUMBER, description: "Number of new words mastered in this update." },
                    level: { type: Type.STRING, description: "Current proficiency level (e.g. Apprentice, Expert)." },
                    streak: { type: Type.NUMBER, description: "Current login streak." }
                  }
                }
              }
            ]
          }]
        },
        callbacks: {
          onopen: async () => {
            try {
              if (sessionPromiseRef.current !== sessionPromise) return;

              const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                  echoCancellation: true,
                  noiseSuppression: true,
                  autoGainControl: true,
                } 
              });
              streamRef.current = stream;
              
              const audioContext = new AudioContext({ sampleRate: 16000 });
              await audioContext.resume();
              audioContextRef.current = audioContext;
              
              const source = audioContext.createMediaStreamSource(stream);
              const processor = audioContext.createScriptProcessor(4096, 1, 1);
              processorRef.current = processor;
              
              processor.onaudioprocess = (e) => {
                const channelData = e.inputBuffer.getChannelData(0);
                let sum = 0;
                for (let i = 0; i < channelData.length; i++) {
                  sum += channelData[i] * channelData[i];
                }
                setAudioLevel(Math.sqrt(sum / channelData.length));

                const pcm16 = new Int16Array(channelData.length);
                for (let i = 0; i < channelData.length; i++) {
                  let s = Math.max(-1, Math.min(1, channelData[i]));
                  pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }
                
                const buffer = new Uint8Array(pcm16.buffer);
                let binary = '';
                for (let i = 0; i < buffer.length; i++) {
                  binary += String.fromCharCode(buffer[i]);
                }
                const base64 = btoa(binary);
                
                if (sessionRef.current) {
                  sessionRef.current.sendRealtimeInput({
                    audio: { data: base64, mimeType: 'audio/pcm;rate=16000' }
                  });
                }

                const outData = e.outputBuffer.getChannelData(0);
                for (let i = 0; i < outData.length; i++) {
                  outData[i] = 0;
                }
              };
              
              source.connect(processor);
              processor.connect(audioContext.destination);
              
              setIsConnected(true);
              setIsConnecting(false);
            } catch (err: any) {
              console.error("Error accessing microphone:", err);
              setError(err.message || "Microphone access denied.");
              setIsConnecting(false);
              sessionPromise.then(session => session.close());
            }
          },
          onmessage: async (message: any) => {
            if (!sessionRef.current) return;

            // Handle Audio
            const parts = message.serverContent?.modelTurn?.parts || [];
            for (const part of parts) {
              const base64Audio = part.inlineData?.data;
              if (base64Audio && playbackContextRef.current) {
                const binaryString = atob(base64Audio);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                const pcm16 = new Int16Array(bytes.buffer);
                const audioBuffer = playbackContextRef.current.createBuffer(1, pcm16.length, 24000);
                const channelData = audioBuffer.getChannelData(0);
                for (let i = 0; i < pcm16.length; i++) {
                  channelData[i] = pcm16[i] / 32768.0;
                }
                const source = playbackContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                if (gainNodeRef.current) {
                  source.connect(gainNodeRef.current);
                } else {
                  source.connect(playbackContextRef.current.destination);
                }
                
                const startTime = Math.max(playbackContextRef.current.currentTime, nextPlayTimeRef.current);
                source.start(startTime);
                nextPlayTimeRef.current = startTime + audioBuffer.duration;
              }
            }
            
            // Handle Interruption
            if (message.serverContent?.interrupted && playbackContextRef.current) {
              playbackContextRef.current.close();
              playbackContextRef.current = new AudioContext({ sampleRate: 24000 });
              gainNodeRef.current = playbackContextRef.current.createGain();
              gainNodeRef.current.gain.value = 1.8;
              gainNodeRef.current.connect(playbackContextRef.current.destination);
              nextPlayTimeRef.current = playbackContextRef.current.currentTime;
            }

            // Handle Tool Calls
            if (message.toolCall) {
              const functionCalls = message.toolCall.functionCalls;
              if (functionCalls && functionCalls.length > 0) {
                const functionResponses = [];
                for (const call of functionCalls) {
                  const callId = call.id || "";
                  if (callId && respondedToolCallsRef.current.has(callId)) {
                    continue;
                  }
                  if (callId) {
                    respondedToolCallsRef.current.add(callId);
                  }

                  if (call.name === 'updateAppCode') {
                    const htmlContent = call.args?.htmlContent as string;
                    if (htmlContent) {
                      onAppCodeUpdate(htmlContent);
                    }
                    const responseObj: any = {
                      name: call.name || "updateAppCode",
                      response: { output: { result: "success" } }
                    };
                    if (callId) responseObj.id = callId;
                    functionResponses.push(responseObj);
                  } else if (call.name === 'logLearnedItem') {
                    const type = call.args?.type as 'vocabulary' | 'grammar' | 'pronunciation';
                    const content = call.args?.content as string;
                    if (type && content) {
                      setLearnedItems(prev => [...prev, { type, content }]);
                    }
                    const responseObj: any = {
                      name: call.name || "logLearnedItem",
                      response: { output: { result: "success" } }
                    };
                    if (callId) responseObj.id = callId;
                    functionResponses.push(responseObj);
                  } else if (call.name === 'updateSessionSummary') {
                    const summary = call.args?.summary as string;
                    if (summary) {
                      setSessionSummary(summary);
                    }
                    const responseObj: any = {
                      name: call.name || "updateSessionSummary",
                      response: { output: { result: "success" } }
                    };
                    if (callId) responseObj.id = callId;
                    functionResponses.push(responseObj);
                  } else if (call.name === 'updateMasteryStats') {
                    onMasteryUpdate(call.args);
                    const responseObj: any = {
                      name: call.name || "updateMasteryStats",
                      response: { output: { result: "success" } }
                    };
                    if (callId) responseObj.id = callId;
                    functionResponses.push(responseObj);
                  } else {
                    const responseObj: any = {
                      name: call.name || "unknown",
                      response: { error: "Unknown function call" }
                    };
                    if (callId) responseObj.id = callId;
                    functionResponses.push(responseObj);
                  }
                }
                
                if (functionResponses.length > 0) {
                  sessionPromise.then(session => {
                    if (sessionRef.current === session) {
                      session.sendToolResponse({ functionResponses });
                    }
                  });
                }
              }
            }
          },
          onclose: () => {
            setIsConnected(false);
            cleanup();
          },
          onerror: (err: any) => {
            console.error("Live API Error:", err);
            setError(`Connection failed: ${err?.message || "Check console."}`);
            setIsConnected(false);
            setIsConnecting(false);
            cleanup();
          }
        }
      });
      
      sessionPromiseRef.current = sessionPromise;
      sessionRef.current = await sessionPromise;
      
    } catch (err: any) {
      console.error("Failed to connect to Live API:", err);
      setError(err.message || "Failed to connect");
      setIsConnecting(false);
    }
  }, [onAppCodeUpdate, currentAppCode, cleanup, learningGoal, sessionsCount, learnedItemsList]);

  const disconnect = useCallback(() => {
    cleanup();
    setIsConnected(false);
  }, [cleanup]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (playbackContextRef.current) {
        setIsModelSpeaking(nextPlayTimeRef.current > playbackContextRef.current.currentTime + 0.1);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const sendText = useCallback((text: string) => {
    if (sessionRef.current && isConnected) {
      sessionRef.current.send({ parts: [{ text }] });
    }
  }, [isConnected]);

  // Silence Detection Logic
  const lastActivityTimeRef = useRef<number>(Date.now());
  const silenceThreshold = 5000; // 5 seconds of silence

  useEffect(() => {
    if (!isConnected || isConnecting) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityTimeRef.current;

      // Only prompt if silence threshold exceeded, model is not speaking, and it's been active
      if (timeSinceLastActivity > silenceThreshold && !isModelSpeaking) {
        lastActivityTimeRef.current = now; // Reset timer to prevent rapid-fire prompts
        sendText("[User has been silent for a while. Proactively check in or suggest something!]");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected, isConnecting, isModelSpeaking, sendText]);

  // Update activity timestamp whenever there's audio or model speaks
  useEffect(() => {
    if (audioLevel > 0.05 || isModelSpeaking) {
      lastActivityTimeRef.current = Date.now();
    }
  }, [audioLevel, isModelSpeaking]);

  return { isConnected, isConnecting, error, audioLevel, isModelSpeaking, sessionSummary, learnedItems, connect, disconnect, setSessionSummary, setLearnedItems, sendText };
}
