import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from "@google/genai";
import { AudioUtils } from '../services/audio-utils';
import { Objection, SalesInsight, SessionStatus, TranscriptItem, AppConfig } from '../types';

// System instruction for the Live persona
const SYSTEM_INSTRUCTION = `
You are a "Live Sales Copilot". You are listening to a live sales call via the user's microphone.
Your Goal: Analyze the conversation in real-time to help the seller (User) close the deal.
Your Behavior:
1.  **Passive Listening**: Mostly listen. Do not interrupt the conversation with audio unless necessary.
2.  **Tool Usage**: CONTINUOUSLY use the 'updateSalesInsights' tool to report the "Deal Health" (0-100), detect "Objections", and spot "Buying Signals".
3.  **Objection Handling**: If you hear an objection (Price, Timing, Competitor, etc.), IMMEDIATELY call 'updateSalesInsights' with the objection details and a short, punchy 1-sentence rebuttal.
4.  **Coach's Voice**: If you must speak via audio, keep it extremely brief (under 5 words) like "Ask about budget" or "Pause now". Ideally, stay silent and use the tool.
5.  **Transcript**: Distinguish between the Seller and Prospect based on context if possible, but treat the audio input as the "Conversation".
`;

// Tool definition
const updateSalesInsightsDetails: FunctionDeclaration = {
  name: 'updateSalesInsights',
  parameters: {
    type: Type.OBJECT,
    description: 'Updates the sales dashboard with real-time analysis.',
    properties: {
      dealHealth: {
        type: Type.NUMBER,
        description: 'Score from 0 (Lost) to 100 (Won) representing the current probability of closing.',
      },
      objectionType: {
        type: Type.STRING,
        description: 'The category of objection detected, if any (e.g., Pricing, Timing).',
      },
      suggestion: {
        type: Type.STRING,
        description: 'Tactical advice for the seller. Max 15 words.',
      },
      buyingSignal: {
        type: Type.STRING,
        description: 'A detected signal that the prospect is interested (e.g., asking about implementation).',
      }
    },
    required: ['dealHealth']
  },
};

export const useGeminiLive = (config: AppConfig) => {
  const [status, setStatus] = useState<SessionStatus>(SessionStatus.IDLE);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [currentInsight, setCurrentInsight] = useState<SalesInsight>({ dealHealth: 50, lastUpdated: Date.now() });
  const [objections, setObjections] = useState<Objection[]>([]);
  
  // Refs for audio handling to avoid re-renders
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  
  // Audio Playback State
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Store config in ref to access in callbacks without dependency loop
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const connect = useCallback(async () => {
    if (!process.env.API_KEY) {
      alert("API Key is missing in environment variables.");
      return;
    }

    try {
      setStatus(SessionStatus.CONNECTING);

      // 1. Setup Audio Input
      const stream = await navigator.mediaDevices.getUserMedia({ audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 16000, 
      }});
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      // Setup Audio Output
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputAudioContextRef.current = outputAudioContext;
      nextStartTimeRef.current = 0;

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;
      
      // Use ScriptProcessor for raw PCM access
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      // 2. Setup Gemini Live Client
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO], // Required
          systemInstruction: SYSTEM_INSTRUCTION,
          inputAudioTranscription: {}, // Enable input transcription
          outputAudioTranscription: {}, // Enable output transcription
          tools: [{ functionDeclarations: [updateSalesInsightsDetails] }],
        },
        callbacks: {
          onopen: () => {
            console.log("Gemini Live Session Opened");
            setStatus(SessionStatus.ACTIVE);
          },
          onmessage: (msg: LiveServerMessage) => {
            handleMessage(msg);
          },
          onclose: (e) => {
            console.log("Gemini Live Session Closed", e);
            if (status !== SessionStatus.FINISHED) {
                setStatus(SessionStatus.IDLE);
            }
          },
          onerror: (err) => {
            console.error("Gemini Live Error", err);
            setStatus(SessionStatus.ERROR);
          }
        }
      });
      sessionPromiseRef.current = sessionPromise;

      // 3. Start Audio Streaming
      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = AudioUtils.float32ToInt16(inputData);
        const base64Data = AudioUtils.arrayBufferToBase64(pcmData.buffer);

        sessionPromise.then(session => {
           session.sendRealtimeInput({
             media: {
               mimeType: "audio/pcm;rate=16000",
               data: base64Data
             }
           });
        });
      };

      source.connect(processor);
      const muteNode = audioContext.createGain();
      muteNode.gain.value = 0;
      processor.connect(muteNode);
      muteNode.connect(audioContext.destination);

    } catch (error) {
      console.error("Failed to connect:", error);
      setStatus(SessionStatus.ERROR);
    }
  }, []);

  const disconnect = useCallback(() => {
    setStatus(SessionStatus.FINISHED);
    
    // Stop Audio Input
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop Audio Output
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }

    // Drop session reference
    sessionPromiseRef.current = null;
  }, []);

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number = 24000,
    numChannels: number = 1
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  const handleMessage = async (msg: LiveServerMessage) => {
    const currentConfig = configRef.current;

    // 1. Handle Transcriptions
    const inputTranscript = msg.serverContent?.inputTranscription?.text;
    if (inputTranscript) {
      setTranscript(prev => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'user' && !last.isFinal) {
            const updated = { ...last, text: last.text + inputTranscript, timestamp: Date.now() };
            return [...prev.slice(0, -1), updated];
        }
        return [...prev, {
            id: Date.now().toString(),
            role: 'user',
            text: inputTranscript,
            timestamp: Date.now(),
            isFinal: false 
        }];
      });
    }

    const outputTranscript = msg.serverContent?.outputTranscription?.text;
    if (outputTranscript) {
      setTranscript(prev => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'model' && !last.isFinal) {
            const updated = { ...last, text: last.text + outputTranscript, timestamp: Date.now() };
            return [...prev.slice(0, -1), updated];
        }
        return [...prev, {
            id: Date.now().toString(),
            role: 'model',
            text: outputTranscript,
            timestamp: Date.now(),
            isFinal: false 
        }];
      });
    }
    
    // 2. Handle Audio Output (Only if suggestions are enabled in a broad sense, 
    // but the model might speak for other reasons. We allow audio generally, but 
    // specific coaching audio is controlled by the model instruction + tool suppression below)
    const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (base64Audio && outputAudioContextRef.current) {
        // We could block audio here if strict silence is required, but usually we just silence tool outputs
        const ctx = outputAudioContextRef.current;
        const audioBytes = AudioUtils.base64ToUint8Array(base64Audio);
        const audioBuffer = await decodeAudioData(audioBytes, ctx);
        
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        
        const now = ctx.currentTime;
        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, now);
        source.start(nextStartTimeRef.current);
        nextStartTimeRef.current += audioBuffer.duration;
        sourcesRef.current.add(source);
        source.onended = () => sourcesRef.current.delete(source);
    }

    if (msg.serverContent?.interrupted) {
        sourcesRef.current.forEach(source => source.stop());
        sourcesRef.current.clear();
        nextStartTimeRef.current = 0;
    }
    
    if (msg.serverContent?.turnComplete) {
         setTranscript(prev => {
             const last = prev[prev.length - 1];
             if (last) {
                 return [...prev.slice(0, -1), { ...last, isFinal: true }];
             }
             return prev;
         });
    }

    // 3. Handle Tool Calls with Config Enforcement
    if (msg.toolCall) {
        const calls = msg.toolCall.functionCalls;
        calls.forEach(call => {
            if (call.name === 'updateSalesInsights') {
                const args = call.args as any;
                
                // Update Deal Health (if enabled)
                if (typeof args.dealHealth === 'number' && currentConfig.enableDealHealth) {
                    setCurrentInsight(prev => ({
                        ...prev,
                        dealHealth: args.dealHealth,
                        lastUpdated: Date.now()
                    }));
                }

                // Update Buying Signals (if enabled)
                if (args.buyingSignal && currentConfig.enableBuyingSignals) {
                     setCurrentInsight(prev => ({
                        ...prev,
                        buyingSignal: args.buyingSignal
                    }));
                }

                // Update Suggestions (if enabled)
                if (args.suggestion && currentConfig.enableLiveSuggestions) {
                    setCurrentInsight(prev => ({
                        ...prev,
                        latestSuggestion: args.suggestion
                    }));
                }

                // Handle Objections (if enabled)
                if (args.objectionType && currentConfig.enableObjectionDetection) {
                    const newObjection: Objection = {
                        type: args.objectionType,
                        confidence: 0.9,
                        suggestion: args.suggestion || "Address this concern immediately.",
                        timestamp: Date.now()
                    };
                    setObjections(prev => [newObjection, ...prev]);
                }

                sessionPromiseRef.current?.then(session => {
                    session.sendToolResponse({
                        functionResponses: {
                            id: call.id,
                            name: call.name,
                            response: { result: "Dashboard updated successfully." }
                        }
                    });
                });
            }
        });
    }
  };

  return {
    status,
    connect,
    disconnect,
    transcript,
    currentInsight,
    objections
  };
};