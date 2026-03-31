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
  learnedItemsList: string[] = []
) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<string>("");
  const [learnedItems, setLearnedItems] = useState<LearnedItem[]>([]);
  const [transcript, setTranscript] = useState<{ role: 'user' | 'model', text: string, isFinal?: boolean }[]>([]);
  
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
    setTranscript([]);
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
          systemInstruction: `You are 'Ngenglish', a friendly and personal AI English learning assistant. Your goal is to help the user improve their English skills through conversation.
          
          USER'S CURRENT LEARNING GOAL: ${learningGoal}
          ${sessionsCount > 0 ? `This is a RETURNING USER. They have completed ${sessionsCount} sessions with you already.` : 'This is a NEW USER.'}
          ${learnedItemsList.length > 0 ? `Items they have learned so far: ${learnedItemsList.join(', ')}.` : ''}

          Greet them in a mix of casual Indonesian and English. 
          Focus on the goal: ${learningGoal}.
          
          TOOLS:
          - updateAppCode: Use this to update the Learning Dashboard with visual content.
          - logLearnedItem: Use this whenever you teach a new vocabulary word or grammar rule.
          - updateSessionSummary: Use this periodically to maintain a live summary of the conversation.
          
          You have a 'Learning Dashboard' (the iframe) where you can display helpful information.
          
          CRITICAL:
          - Do NOT repeat yourself.
          - Briefly explain what you are showing on the dashboard before calling the tool. 
          - You can be interrupted by the user. If the user starts speaking, stop immediately and listen.
          - Maintain a live summary of the session using 'updateSessionSummary'. Include key topics discussed and progress made.`,
          tools: [{
            functionDeclarations: [
              {
                name: "updateAppCode",
                description: "Updates the Learning Dashboard UI with educational content.",
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

            // Handle Transcription
            if (message.serverContent?.inputAudioTranscription) {
              const { text, isFinal } = message.serverContent.inputAudioTranscription;
              if (text) {
                setTranscript(prev => {
                  const last = prev[prev.length - 1];
                  if (last && last.role === 'user' && !last.isFinal) {
                    const updated = [...prev];
                    updated[updated.length - 1] = { role: 'user', text, isFinal };
                    return updated;
                  }
                  return [...prev, { role: 'user', text, isFinal }];
                });
              }
            }

            if (message.serverContent?.modelTurn?.parts) {
              const textParts = message.serverContent.modelTurn.parts.filter((p: any) => p.text).map((p: any) => p.text).join("");
              if (textParts) {
                setTranscript(prev => {
                  const last = prev[prev.length - 1];
                  if (last && last.role === 'model') {
                    const updated = [...prev];
                    updated[updated.length - 1] = { role: 'model', text: last.text + textParts };
                    return updated;
                  }
                  return [...prev, { role: 'model', text: textParts }];
                });
              }
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

  return { isConnected, isConnecting, error, audioLevel, isModelSpeaking, sessionSummary, learnedItems, transcript, connect, disconnect, setSessionSummary, setLearnedItems };
}
