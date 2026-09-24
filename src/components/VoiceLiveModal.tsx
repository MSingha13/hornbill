import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Volume2, Sparkles, Radio, MessageSquare, AlertCircle, Send, ShieldAlert } from 'lucide-react';
import { HornbillProfile } from '../types';

interface VoiceLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  hornbill: HornbillProfile;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  time: string;
}

// Convert Float32Array audio data (16kHz) to 16-bit PCM base64 string
function floatTo16BitPCM(input: Float32Array): string {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  const bytes = new Uint8Array(output.buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert base64 24kHz 16-bit PCM to Float32Array for Web Audio API
function base64ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const int16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / (int16[i] < 0 ? 0x8000 : 0x7FFF);
  }
  return float32;
}

export const VoiceLiveModal: React.FC<VoiceLiveModalProps> = ({
  isOpen,
  onClose,
  hornbill,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [statusText, setStatusText] = useState('พร้อมเชื่อมต่อกับระบบ Live API');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'assistant',
      text: `สวัสดีครับ! ผมคือผู้ช่วยวิจัยด้านการอนุรักษ์นกกก (Live AI) ขณะนี้กำลังติดตามนกกก ${hornbill.code} (${hornbill.name}) ที่อุทยานแห่งชาติแจ้ซ้อน คุณสามารถสนทนาเสียงแบบเรียลไทม์ได้เลยครับ`,
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);

  // Web Audio refs
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Connect WebSocket when modal opens
  useEffect(() => {
    if (!isOpen) {
      disconnectLive();
      return;
    }

    connectLive();

    return () => {
      disconnectLive();
    };
  }, [isOpen]);

  const connectLive = () => {
    try {
      setStatusText('กำลังเชื่อมต่อ Gemini 3.8 Live API...');
      setErrorMessage(null);

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected to /live');
        setIsConnected(true);
        setStatusText('เชื่อมต่อสำเร็จ! กดปุ่มไมโครโฟนเพื่อเริ่มพูดคุย');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.error) {
            setErrorMessage(data.error);
            setStatusText('เกิดข้อผิดพลาดในการเชื่อมต่อ');
          }

          if (data.type === 'ready') {
            setStatusText('ระบบ Live API พร้อมรับฟังเสียงของคุณ');
          }

          // Handle incoming audio from Gemini 3.8 Live
          if (data.type === 'audio' && data.audio) {
            setIsAiSpeaking(true);
            setStatusText('นกกก AI กำลังตอบกลับด้วยเสียง...');
            playAudioChunk(data.audio);
          }

          // Handle transcript text
          if (data.type === 'text' && data.text) {
            setMessages((prev) => {
              const lastMsg = prev[prev.length - 1];
              if (lastMsg && lastMsg.sender === 'assistant' && lastMsg.id === 'streaming') {
                return [
                  ...prev.slice(0, -1),
                  { ...lastMsg, text: lastMsg.text + data.text },
                ];
              } else {
                return [
                  ...prev,
                  {
                    id: 'streaming',
                    sender: 'assistant',
                    text: data.text,
                    time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
                  },
                ];
              }
            });
          }

          if (data.type === 'interrupted') {
            stopAudioPlayback();
            setIsAiSpeaking(false);
            setStatusText('ผู้ใช้ขัดจังหวะ กำลังรับฟังคำสั่งใหม่...');
          }
        } catch (err) {
          console.error('Error parsing WS message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setErrorMessage('ไม่สามารถเชื่อมต่อ WebSocket ได้ หรือระบบคีย์ยังไม่พร้อมใช้งาน');
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
      };

      wsRef.current = ws;
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error connecting');
    }
  };

  const disconnectLive = () => {
    stopRecording();
    stopAudioPlayback();

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsAiSpeaking(false);
    setIsRecording(false);
  };

  // Start microphone capture at 16kHz
  const startRecording = async () => {
    try {
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      micStreamRef.current = stream;

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      inputAudioCtxRef.current = inputCtx;

      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(2048, 1, 1);
      scriptProcessorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);

        // Simple volume meter
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += Math.abs(inputData[i]);
        }
        const avg = sum / inputData.length;
        setAudioLevel(Math.min(100, Math.round(avg * 400)));

        // Send to Live WebSocket
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const base64Audio = floatTo16BitPCM(inputData);
          wsRef.current.send(JSON.stringify({ audio: base64Audio }));
        }
      };

      source.connect(processor);
      processor.connect(inputCtx.destination);

      setIsRecording(true);
      setStatusText('กำลังรับฟังเสียงของคุณ (พูดภาษาไทยได้เลย)...');
    } catch (err: any) {
      console.error('Error accessing microphone:', err);
      setErrorMessage(`ไม่สามารถเปิดไมโครโฟนได้: ${err.message || 'โปรดอนุญาตการใช้ไมโครโฟนในเบราว์เซอร์'}`);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }
    setIsRecording(false);
    setAudioLevel(0);
    setStatusText('หยุดรับฟังเสียงแล้ว');
  };

  // Playback audio chunks received from model at 24kHz
  const playAudioChunk = (base64Data: string) => {
    try {
      if (!outputAudioCtxRef.current || outputAudioCtxRef.current.state === 'closed') {
        outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });
        nextPlayTimeRef.current = outputAudioCtxRef.current.currentTime;
      }

      const audioCtx = outputAudioCtxRef.current;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const float32Data = base64ToFloat32(base64Data);
      const audioBuffer = audioCtx.createBuffer(1, float32Data.length, 24000);
      audioBuffer.getChannelData(0).set(float32Data);

      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);

      const currentTime = audioCtx.currentTime;
      const startTime = Math.max(currentTime, nextPlayTimeRef.current);
      source.start(startTime);
      nextPlayTimeRef.current = startTime + audioBuffer.duration;

      activeSourcesRef.current.push(source);
      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
        if (activeSourcesRef.current.length === 0) {
          setIsAiSpeaking(false);
          setStatusText('AI ตอบเสร็จแล้ว พร้อมรับฟังต่อ');
        }
      };
    } catch (err) {
      console.error('Error playing audio chunk:', err);
    }
  };

  const stopAudioPlayback = () => {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
      } catch {}
    });
    activeSourcesRef.current = [];
    if (outputAudioCtxRef.current) {
      nextPlayTimeRef.current = outputAudioCtxRef.current.currentTime;
    }
    setIsAiSpeaking(false);
  };

  // Send typed text prompt
  const handleSendText = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText.trim();
    if (!textToSend) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // If WebSocket is open, send text input
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text: textToSend }));
      setStatusText('กำลังส่งคำสั่งไปยัง Gemini Live API...');
    } else {
      // Fallback to HTTP /api/analyze if WebSocket isn't available
      setStatusText('กำลังวิเคราะห์คำตอบผ่าน API สำรอง...');
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: textToSend,
            context: {
              code: hornbill.code,
              name: hornbill.name,
              species: hornbill.thaiSpecies,
              lat: hornbill.latestPoint.lat,
              lng: hornbill.latestPoint.lng,
              battery: hornbill.latestPoint.battery,
              temp: hornbill.latestPoint.temp,
              location: hornbill.latestPoint.location,
            },
          }),
        });
        const data = await res.json();
        if (data.text) {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              sender: 'assistant',
              text: data.text,
              time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        } else if (data.error) {
          setErrorMessage(data.error);
        }
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to send text');
      }
    }
  };

  const quickPrompts = [
    'สรุปตำแหน่งล่าสุดของนกกก KKOZ01 ตอนนี้',
    'วิเคราะห์ระดับแบตเตอรี่และอุณหภูมิเซนเซอร์',
    'ทำไมนกกกถึงสำคัญต่อผืนป่าแจ้ซ้อน-ขุนตาล?',
    'ประเมินความเร็วและระยะทางในการบินข้ามเขา',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 p-0.5 overflow-hidden shadow-md">
                <img
                  src="/assets/hornbill_portrait.jpg"
                  alt="Hornbill"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-emerald-950 flex items-center justify-center">
                <Radio className="w-2.5 h-2.5 text-emerald-950 animate-pulse" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  สนทนาเสียงสด (Gemini 3.8 Live API)
                </h3>
                <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  REAL-TIME AUDIO
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 font-medium">
                ผู้ช่วยวิจัยสัตว์ป่าและพิกัดดาวเทียม GISTDA ({hornbill.code} - {hornbill.name})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Audio Visualizer / Status Bar */}
        <div className="bg-slate-900 px-5 py-4 border-b border-slate-800 text-white flex flex-col items-center justify-center relative overflow-hidden">
          {/* Subtle background glow */}
          <div
            className={`absolute inset-0 bg-gradient-to-r ${
              isAiSpeaking
                ? 'from-teal-600/30 via-emerald-500/20 to-teal-600/30 animate-pulse'
                : isRecording
                ? 'from-amber-600/30 via-emerald-600/20 to-amber-600/30 animate-pulse'
                : 'from-slate-900 to-slate-900'
            }`}
          />

          {/* Sound waves visualization simulation */}
          <div className="relative z-10 flex items-center gap-1.5 h-10 mb-2">
            {[40, 65, 85, 50, 95, 75, 45, 90, 60, 30, 70, 50].map((h, i) => {
              const currentH = isRecording
                ? Math.max(15, Math.min(90, (audioLevel / 100) * h + Math.sin(i + Date.now() / 200) * 15))
                : isAiSpeaking
                ? Math.max(20, Math.min(95, h + Math.sin(i * 0.8 + Date.now() / 150) * 20))
                : 12;

              return (
                <span
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-100 ${
                    isAiSpeaking
                      ? 'bg-gradient-to-t from-teal-400 to-emerald-300'
                      : isRecording
                      ? 'bg-gradient-to-t from-amber-400 to-emerald-400'
                      : 'bg-slate-700'
                  }`}
                  style={{ height: `${currentH}%` }}
                />
              );
            })}
          </div>

          <div className="relative z-10 text-center">
            <p className="text-xs font-semibold text-emerald-300 flex items-center justify-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isAiSpeaking
                    ? 'bg-teal-400 animate-ping'
                    : isRecording
                    ? 'bg-amber-400 animate-ping'
                    : isConnected
                    ? 'bg-emerald-400'
                    : 'bg-slate-500'
                }`}
              />
              <span>{statusText}</span>
            </p>
          </div>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center gap-2 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        {/* Chat / Transcript Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-slate-50/50 min-h-[220px]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-emerald-700 text-white rounded-br-none'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 mb-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>ผู้เชี่ยวชาญอนุรักษ์นกกก GISTDA</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <div
                  className={`text-[10px] mt-1 text-right ${
                    msg.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'
                  }`}
                >
                  {msg.time}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatBottomRef} />
        </div>

        {/* Quick prompt chips */}
        <div className="px-4 py-2.5 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0">คำถามแนะนำ:</span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendText(prompt)}
              className="text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 px-3 py-1 rounded-full whitespace-nowrap border border-slate-200/70 transition cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Controls Section: Big Mic Button & Text Box */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col gap-3">
          <div className="flex items-center justify-center gap-4">
            {/* Main Microphone Action Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex items-center gap-2.5 px-6 py-3.5 rounded-full font-bold text-sm shadow-md transition-all transform cursor-pointer active:scale-95 ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse ring-4 ring-red-300'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white ring-4 ring-emerald-100'
              }`}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-5 h-5" />
                  <span>กำลังบันทึกเสียง (กดเพื่อหยุด)</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  <span>กดเพื่อพูดคุยด้วยเสียง</span>
                </>
              )}
            </button>

            {/* Stop AI Audio playback if speaking */}
            {isAiSpeaking && (
              <button
                onClick={stopAudioPlayback}
                className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl border border-slate-200 cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span>หยุดเสียงชั่วคราว</span>
              </button>
            )}
          </div>

          {/* Text Input Fallback */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
              placeholder="หรือพิมพ์คำถามเกี่ยวกับนกกกที่นี่..."
              className="flex-1 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
            <button
              onClick={() => handleSendText()}
              disabled={!inputText.trim()}
              className="bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white p-2.5 rounded-xl transition cursor-pointer shadow-2xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
