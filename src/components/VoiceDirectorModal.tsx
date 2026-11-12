import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Volume2, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

interface VoiceDirectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVoiceStateChange: (isActive: boolean) => void;
}

export const VoiceDirectorModal: React.FC<VoiceDirectorModalProps> = ({
  isOpen,
  onClose,
  onVoiceStateChange,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [transcripts, setTranscripts] = useState<Array<{ sender: 'user' | 'model'; text: string }>>([
    {
      sender: 'model',
      text: "Hello! I am your HyperFrames Live Creative Voice Director powered by Gemini 3.8 Live. Ask me for motion timing advice, scene pacing ideas, color palettes, or script taglines!",
    },
  ]);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Helper: Float32Array to 16-bit PCM little-endian Base64
  const pcmToBase64 = (float32Array: Float32Array): string => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Helper: Play Base64 24kHz PCM Audio Chunk
  const playAudioChunk = (audioCtx: AudioContext, base64Audio: string) => {
    try {
      const binary = atob(base64Audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const audioBuffer = audioCtx.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);

      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);

      const currentTime = audioCtx.currentTime;
      if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime;
      }

      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += audioBuffer.duration;

      setIsModelSpeaking(true);
      source.onended = () => {
        if (audioCtx.currentTime >= nextStartTimeRef.current - 0.05) {
          setIsModelSpeaking(false);
        }
      };
    } catch (e) {
      console.error('Audio playback error:', e);
    }
  };

  // Connect to Gemini Live WebSocket
  const startLiveSession = async () => {
    setError(null);
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // Initialize 24kHz output audio context
      outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });

      ws.onopen = () => {
        setIsConnected(true);
        onVoiceStateChange(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'ready') {
            setIsConnected(true);
          } else if (data.type === 'audio' && data.audio) {
            if (outputAudioCtxRef.current) {
              playAudioChunk(outputAudioCtxRef.current, data.audio);
            }
          } else if (data.type === 'text' && data.text) {
            setTranscripts((prev) => [...prev, { sender: 'model', text: data.text }]);
          } else if (data.type === 'interrupted') {
            nextStartTimeRef.current = 0;
            setIsModelSpeaking(false);
          } else if (data.type === 'error') {
            setError(data.error);
          }
        } catch (err) {
          console.error('Error handling WS message:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsMicActive(false);
        onVoiceStateChange(false);
      };

      ws.onerror = () => {
        setError('WebSocket error connecting to Live voice bridge.');
      };

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 16kHz audio context for mic
      const inputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      inputAudioCtxRef.current = inputAudioCtx;

      const source = inputAudioCtx.createMediaStreamSource(stream);
      const processor = inputAudioCtx.createScriptProcessor(4096, 1, 1);
      source.connect(processor);
      processor.connect(inputAudioCtx.destination);

      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN) {
          const inputChannelData = e.inputBuffer.getChannelData(0);
          const base64Audio = pcmToBase64(inputChannelData);
          ws.send(JSON.stringify({ audio: base64Audio }));
        }
      };

      setIsMicActive(true);
    } catch (err: any) {
      console.error('Mic initialization error:', err);
      setError(err.message || 'Microphone access denied or audio device unavailable.');
    }
  };

  const stopLiveSession = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsMicActive(false);
    setIsModelSpeaking(false);
    onVoiceStateChange(false);
  };

  // Close session on unmount or modal close
  useEffect(() => {
    if (isOpen && !isConnected) {
      startLiveSession();
    }
    return () => {
      stopLiveSession();
    };
  }, [isOpen]);

  // Audio Visualizer Animation Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const renderWave = () => {
      time += 0.05;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Draw concentric fluid voice waves
      const amplitude = isModelSpeaking ? 30 : isMicActive ? 15 : 5;
      const waveCount = 3;

      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        ctx.strokeStyle = isModelSpeaking
          ? `rgba(6, 182, 212, ${0.8 - w * 0.25})`
          : isMicActive
          ? `rgba(245, 158, 11, ${0.8 - w * 0.25})`
          : 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 2.5 - w * 0.5;

        for (let x = 0; x < canvas.width; x += 3) {
          const y =
            cy +
            Math.sin(x * 0.03 + time * 3 + w) * amplitude * Math.sin((x / canvas.width) * Math.PI);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(renderWave);
    };

    animId = requestAnimationFrame(renderWave);
    return () => cancelAnimationFrame(animId);
  }, [isMicActive, isModelSpeaking]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0B0F17] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B] bg-[#080C14]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-sans">
                Live Creative Voice Director
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Model: gemini-3.8-live (Real-Time Bidirectional Audio)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Visualizer Orb Canvas */}
          <div className="relative bg-[#080C14] border border-[#1E293B] rounded-xl p-4 flex flex-col items-center justify-center h-48 overflow-hidden">
            <canvas
              ref={canvasRef}
              width={500}
              height={140}
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-3 flex items-center gap-2 text-xs font-mono">
              <span
                className={`w-2 h-2 rounded-full ${
                  isModelSpeaking
                    ? 'bg-cyan-400 animate-ping'
                    : isMicActive
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-slate-600'
                }`}
              />
              <span className="text-slate-300">
                {isModelSpeaking
                  ? 'Gemini 3.8 Live Speaking...'
                  : isMicActive
                  ? 'Listening to your voice (16kHz PCM)...'
                  : 'Connecting...'}
              </span>
            </div>
          </div>

          {/* Transcript Log */}
          <div className="bg-[#080C14] border border-[#1E293B] rounded-xl p-4 max-h-48 overflow-y-auto space-y-2.5 text-xs">
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">
              Live Session Transcript
            </div>
            {transcripts.map((t, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg leading-relaxed ${
                  t.sender === 'user'
                    ? 'bg-amber-950/40 text-amber-200 border border-amber-900/40'
                    : 'bg-[#0F172A] text-slate-200 border border-[#1E293B]'
                }`}
              >
                <div className="text-[10px] font-mono text-slate-400 mb-0.5">
                  {t.sender === 'user' ? 'YOU' : 'DIRECTOR (GEMINI 3.8 LIVE)'}
                </div>
                <div>{t.text}</div>
              </div>
            ))}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-lg bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="font-mono text-[11px]">{error}</div>
            </div>
          )}

          {/* Quick Suggestions to Ask */}
          <div>
            <span className="text-[11px] text-slate-500 font-mono block mb-1.5">
              Spoken Prompt Ideas:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.send(
                      JSON.stringify({ text: 'How can I make the title animation feel more punchy and dynamic?' })
                    );
                    setTranscripts((p) => [
                      ...p,
                      { sender: 'user', text: 'How can I make the title animation feel more punchy and dynamic?' },
                    ]);
                  }
                }}
                className="text-left p-2 rounded bg-[#080C14] border border-[#1E293B] hover:border-cyan-500/50 text-slate-300 transition-colors"
              >
                "How to make title animation more punchy?"
              </button>
              <button
                type="button"
                onClick={() => {
                  if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.send(
                      JSON.stringify({ text: 'Recommend a futuristic color palette and easing curve for scene two.' })
                    );
                    setTranscripts((p) => [
                      ...p,
                      { sender: 'user', text: 'Recommend a futuristic color palette and easing curve for scene two.' },
                    ]);
                  }
                }}
                className="text-left p-2 rounded bg-[#080C14] border border-[#1E293B] hover:border-cyan-500/50 text-slate-300 transition-colors"
              >
                "Recommend futuristic color palette & easing"
              </button>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                stopLiveSession();
                setTimeout(() => startLiveSession(), 300);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-[#080C14] border border-[#1E293B] rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reconnect Bridge
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Close Voice Studio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
