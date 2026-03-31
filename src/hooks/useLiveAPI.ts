import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';

export interface TranscriptEntry {
  role: 'user' | 'model';
  text: string;
}

export interface LearnedItem {
  type: 'vocabulary' | 'grammar';
  content: string;
  timestamp: number;
}

export function useLiveAPI(onAppCodeUpdate: (code: string) => void, currentAppCode: string, learningGoal: string = "General English", playbackSpeed: number = 1.0) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [learnedItems, setLearnedItems] = useState<LearnedItem[]>([]);
  
  const sessionRef = useRef<any>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const respondedToolCallsRef = useRef<Set<string>>(new Set());
  const playbackSpeedRef = useRef<number>(playbackSpeed);

  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed;
  }, [playbackSpeed]);

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
    
    // Close the session if it exists
    if (sessionRef.current) {
      if (typeof sessionRef.current.close === 'function') {
        sessionRef.current.close();
      }
      sessionRef.current = null;
    }
    
    // Also handle the case where the session is still connecting
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
    // Clean up any existing session before starting a new one
    cleanup();
    
    setIsConnecting(true);
    setError(null);
    setTranscript([]);
    respondedToolCallsRef.current.clear();
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      
      playbackContextRef.current = new AudioContext({ sampleRate: 24000 });
      nextPlayTimeRef.current = playbackContextRef.current.currentTime;

      const sessionPromise = ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: `You are 'Ngenglish', a friendly and personal AI English learning assistant. Your goal is to help the user improve their English skills through conversation.
          
          USER'S CURRENT LEARNING GOAL: ${learningGoal}
          Tailor all your conversations, vocabulary choices, and exercises to align with this goal.

          When the user first connects, greet them warmly in a mix of casual Indonesian and English (Jaksel style is fine if appropriate), mention their current learning goal, and introduce yourself as 'Ngenglish'. 
          Offer them a few options to start, such as:
          - A casual conversation.
          - An interactive quiz on a specific topic.
          - A fill-in-the-blanks vocabulary exercise.
          - An interactive story.
          - A structured speaking exercise (like a role-play, image description, or text summary).

          You can:
          1. Practice conversation on various topics.
          2. Correct grammar and provide specific pronunciation guidance. Analyze the user's pronunciation and provide constructive feedback on specific sounds or intonation. For example: "Your 'th' sound in 'three' was a bit like 's', try placing your tongue between your teeth."
          3. Explain vocabulary and idioms.
          4. Provide interactive exercises or quizzes.
          5. Engage in interactive storytelling.
          6. Conduct structured speaking exercises (role-play, image description, text summary).
          
          TOOLS:
          - updateAppCode: Use this to update the Learning Dashboard with visual content.
          - logLearnedItem: Use this whenever you teach a new vocabulary word or grammar rule. This helps track the user's progress.
          
          You have a 'Learning Dashboard' (the iframe) where you can display helpful information.
          - When you teach a new word, update the dashboard to show the word, its definition, and example sentences.
          - When you explain a grammar rule, update the dashboard with a clear summary.
          - You can also create interactive quizzes or reading passages on the dashboard.
          
          INTERACTIVE QUIZZES:
          - When creating a quiz (multiple choice, fill-in-the-blanks, etc.), use vanilla JavaScript to make it interactive.
          - Provide immediate visual feedback (e.g., green for correct, red for incorrect) when the user interacts with the quiz.
          - You can include a 'Check Answer' button or make it reactive to selection.
          - Ensure the quiz is visually clean and uses Tailwind CSS for styling.
          - Quizzes should be based on the vocabulary or grammar you just discussed with the user.

          INTERACTIVE STORYTELLING:
          - You can start a story and allow the user to make choices that influence the plot.
          - Use the Learning Dashboard to visualize the story: show the current scene text, a list of choices, and key vocabulary used in the story.
          - Encourage the user to describe what happens next in their own words to practice creative expression and English comprehension.
          - Use visual aids like icons (from Lucide or simple SVG) or stylized CSS to make the story immersive.

          STRUCTURED SPEAKING EXERCISES:
          - ROLE-PLAY: 
            - Initiation: "Let's practice a role-play. Today, we're at a [Scenario]."
            - Dashboard: Show a split screen. Left side: Scenario description and User's Role. Right side: Useful vocabulary and phrases for this scenario.
            - Interaction: Act as the other character. Keep your turns concise.
          - IMAGE DESCRIPTION: 
            - Initiation: "I've put an image on the dashboard. Can you describe what's happening?"
            - Dashboard: Show a large, high-quality image (use https://picsum.photos/seed/{keyword}/800/600). Below the image, list 3-5 'Target Words' the user should try to use.
          - TEXT SUMMARY: 
            - Initiation: "Here's a short article about [Topic]. Read it and then tell me the main points."
            - Dashboard: Show a clear, well-formatted text snippet (2-3 paragraphs). Highlight 2-3 key sentences or difficult words.
          - FEEDBACK: After each exercise, provide targeted feedback on the user's fluency, vocabulary usage, and grammar. Be specific and encouraging.
          
          CRITICAL:
          - Do NOT repeat yourself.
          - Do NOT call the updateAppCode tool if the content is already correct.
          - Briefly explain what you are showing on the dashboard before calling the tool. 
          - Do NOT speak again after the tool call completes. Wait for the user to respond.
          - If the user interrupts you, stop immediately.
          
          The dashboard starts with a welcome screen.
          
          ${currentAppCode ? `The CURRENT STATE of the Learning Dashboard is: \n\n${currentAppCode}\n\n` : 'The dashboard is currently in its initial welcome state.'}
          
          Technical Requirements:
          - Use the updateAppCode tool to refresh the Learning Dashboard.
          - Use the logLearnedItem tool to record progress.
          - Generate complete, self-contained HTML documents using Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>.
          - Use vanilla JavaScript for any interactivity in the dashboard.
          - Be encouraging, patient, and professional.`,
          tools: [{
            functionDeclarations: [
              {
                name: "updateAppCode",
                description: "Updates the Learning Dashboard UI with educational content (vocabulary, grammar, exercises, etc.). Provide a complete HTML document.",
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
                description: "Log a new vocabulary word or grammar point that the user has learned.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING, enum: ['vocabulary', 'grammar'], description: "The type of item learned." },
                    content: { type: Type.STRING, description: "The word or rule learned (e.g., 'ubiquitous' or 'Present Perfect')." }
                  },
                  required: ["type", "content"]
                }
              }
            ]
          }]
        },
        callbacks: {
          onopen: async () => {
            try {
              // Double check if we are still the active session
              if (sessionPromiseRef.current !== sessionPromise) return;

              if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Microphone API not available.");
              }
              
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
                
                // Calculate audio level
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
                
                sessionPromise.then(session => {
                  // Only send if this is still the active session
                  if (sessionRef.current === session) {
                    session.sendRealtimeInput({
                      audio: { data: base64, mimeType: 'audio/pcm;rate=16000' }
                    });
                  }
                });

                // Clear output buffer to prevent local echo
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
              setError(err.message || "Microphone access denied or failed.");
              setIsConnecting(false);
              sessionPromise.then(session => session.close());
            }
          },
          onmessage: async (message: any) => {
            // Only process if we are still connected
            if (!sessionRef.current) return;

            // Handle Transcript
            const modelTurn = message.serverContent?.modelTurn;
            const userTurn = message.serverContent?.userTurn;

            if (modelTurn?.parts) {
              const text = modelTurn.parts.map((p: any) => p.text).filter(Boolean).join("");
              if (text) {
                setTranscript(prev => {
                  const last = prev[prev.length - 1];
                  if (last && last.role === 'model') {
                    return [...prev.slice(0, -1), { ...last, text: last.text + text }];
                  }
                  return [...prev, { role: 'model', text }];
                });
              }
            }

            if (userTurn?.parts) {
              const text = userTurn.parts.map((p: any) => p.text).filter(Boolean).join("");
              if (text) {
                setTranscript(prev => {
                  const last = prev[prev.length - 1];
                  if (last && last.role === 'user') {
                    return [...prev.slice(0, -1), { ...last, text: last.text + text }];
                  }
                  return [...prev, { role: 'user', text }];
                });
              }
            }

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
                source.playbackRate.value = playbackSpeedRef.current;
                source.connect(playbackContextRef.current.destination);
                
                const startTime = Math.max(playbackContextRef.current.currentTime, nextPlayTimeRef.current);
                source.start(startTime);
                nextPlayTimeRef.current = startTime + (audioBuffer.duration / playbackSpeedRef.current);
              }
            }
            
            if (message.serverContent?.interrupted && playbackContextRef.current) {
              playbackContextRef.current.close();
              playbackContextRef.current = new AudioContext({ sampleRate: 24000 });
              nextPlayTimeRef.current = playbackContextRef.current.currentTime;
            }
            
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
                    const type = call.args?.type as 'vocabulary' | 'grammar';
                    const content = call.args?.content as string;
                    if (type && content) {
                      setLearnedItems(prev => [...prev, { type, content, timestamp: Date.now() }]);
                    }
                    const responseObj: any = {
                      name: call.name || "logLearnedItem",
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
            const errorMessage = err?.message || err?.toString() || "Connection error. Check console.";
            setError(`Connection failed: ${errorMessage}`);
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
  }, [onAppCodeUpdate, currentAppCode, cleanup]);

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

  return { isConnected, isConnecting, error, audioLevel, isModelSpeaking, transcript, learnedItems, connect, disconnect, setTranscript, setLearnedItems };
}
