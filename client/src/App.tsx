import React, { useState, useEffect, useRef, useCallback } from 'react';
import JarvisOrb, { OrbState } from './components/JarvisOrb';
import ChatWindow from './components/ChatWindow';
import WaveformVisualizer from './components/WaveformVisualizer';
import { useSpeech } from './hooks/useSpeech';
import { useChat } from './hooks/useChat';

const CLOCK_TICK = 1000;

export default function App() {
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [inputText, setInputText] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [speakingMsgId, setSpeakingMsgId] = useState<string | undefined>();
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, sendMessage } = useChat();
  const {
    transcript, state: speechState, isSupported,
    startListening, stopListening, resetTranscript,
    speak, isSpeaking, cancelSpeech,
  } = useSpeech();

  // Clock
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), CLOCK_TICK);
    return () => clearInterval(t);
  }, []);

  // Map speech state to orb state
  useEffect(() => {
    if (speechState === 'listening') setOrbState('listening');
    else if (isSpeaking) setOrbState('speaking');
    else if (isLoading) setOrbState('thinking');
    else setOrbState('idle');
  }, [speechState, isSpeaking, isLoading]);

  // When transcript is final (speech stopped & we have text), auto-send
  useEffect(() => {
    if (speechState === 'idle' && transcript && !isLoading) {
      handleSend(transcript);
      resetTranscript();
    }
  }, [speechState, transcript]);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setInputText('');
    const reply = await sendMessage(text);
    if (reply) {
      const lastMsg = messages[messages.length - 1];
      const msgId = `a-${Date.now()}`;
      setSpeakingMsgId(msgId);
      speak(reply, () => setSpeakingMsgId(undefined));
    }
  }, [sendMessage, speak, messages]);

  const handleOrbActivate = () => {
    if (orbState === 'idle') {
      if (isSpeaking) { cancelSpeech(); return; }
      if (isSupported) startListening();
      else inputRef.current?.focus();
    } else if (orbState === 'listening') {
      stopListening();
    } else if (orbState === 'speaking') {
      cancelSpeech();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputText);
  };

  const timeStr = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div
      className="scanlines relative flex h-screen w-screen overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at center, #050e1f 0%, #020810 100%)' }}
    >
      {/* ─── TOP HUD BAR ─── */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-2 z-20"
        style={{ borderBottom: '1px solid #1a3a6a44', background: 'rgba(5,12,24,0.85)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-glow animate-hud-blink" style={{ fontSize: 11, letterSpacing: 4 }}>J.A.R.V.I.S</span>
          <span style={{ color: '#1a4a6a', fontSize: 10 }}>|</span>
          <span style={{ fontSize: 10, color: '#1a4a6a', letterSpacing: 2 }}>JUST A RATHER VERY INTELLIGENT SYSTEM</span>
        </div>
        <div className="flex items-center gap-4">
          <span style={{ fontSize: 11, color: '#00d4ff88', fontFamily: 'Share Tech Mono, monospace', letterSpacing: 2 }}>{dateStr}</span>
          <span className="text-glow" style={{ fontSize: 13, letterSpacing: 3 }}>{timeStr}</span>
        </div>
      </div>

      {/* ─── LEFT PANEL: data stream ─── */}
      <div
        className="absolute left-0 top-10 bottom-0 w-36 overflow-hidden opacity-20 pointer-events-none"
        style={{ borderRight: '1px solid #1a3a6a22' }}
      >
        <div className="animate-data-scroll" style={{ fontSize: 9, color: '#00d4ff', lineHeight: 1.8, padding: '8px 12px', fontFamily: 'Share Tech Mono, monospace' }}>
          {Array.from({ length: 40 }, (_, i) => (
            <div key={i}>SYS::{Math.random().toString(16).slice(2, 10).toUpperCase()}</div>
          ))}
          {Array.from({ length: 40 }, (_, i) => (
            <div key={`b${i}`}>SYS::{Math.random().toString(16).slice(2, 10).toUpperCase()}</div>
          ))}
        </div>
      </div>

      {/* ─── RIGHT PANEL: data stream ─── */}
      <div
        className="absolute right-0 top-10 bottom-0 w-36 overflow-hidden opacity-20 pointer-events-none"
        style={{ borderLeft: '1px solid #1a3a6a22' }}
      >
        <div className="animate-data-scroll" style={{ fontSize: 9, color: '#00d4ff', lineHeight: 1.8, padding: '8px 12px', fontFamily: 'Share Tech Mono, monospace', animationDelay: '-6s' }}>
          {Array.from({ length: 40 }, (_, i) => (
            <div key={i}>CPU::{(Math.random() * 100).toFixed(1)}%</div>
          ))}
          {Array.from({ length: 40 }, (_, i) => (
            <div key={`b${i}`}>MEM::{(Math.random() * 100).toFixed(1)}%</div>
          ))}
        </div>
      </div>

      {/* ─── CENTER LAYOUT ─── */}
      <div className="flex flex-1 flex-col items-center mx-36 mt-10 mb-0 relative z-10">

        {/* ─── ORB SECTION ─── */}
        <div className="flex flex-col items-center pt-6 pb-2 flex-shrink-0">
          <JarvisOrb state={orbState} onActivate={handleOrbActivate} />

          {/* Hint text */}
          <p style={{ fontSize: 10, color: '#1a4a6a', letterSpacing: 3, marginTop: 36, fontFamily: 'Share Tech Mono' }}>
            {orbState === 'idle'
              ? isSupported ? 'CLICK ORB TO SPEAK ▼' : 'TYPE BELOW ▼'
              : orbState === 'listening' ? 'LISTENING... CLICK TO STOP'
              : orbState === 'thinking' ? 'PROCESSING YOUR REQUEST...'
              : 'JARVIS IS RESPONDING...'}
          </p>
        </div>

        {/* ─── CHAT WINDOW ─── */}
        <div className="flex-1 w-full overflow-hidden relative" style={{ maxWidth: 680 }}>
          {/* Corner decoration */}
          <div className="hud-corner hud-tl" />
          <div className="hud-corner hud-tr" />
          <div className="hud-corner hud-bl" />
          <div className="hud-corner hud-br" />
          <ChatWindow messages={messages} isLoading={isLoading} speakingMsgId={speakingMsgId} />
        </div>

        {/* ─── INPUT ROW ─── */}
        <div
          className="w-full flex-shrink-0 py-3 px-2"
          style={{ maxWidth: 680, borderTop: '1px solid #1a3a6a44' }}
        >
          <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
            {/* Mic button */}
            {isSupported && (
              <button
                type="button"
                onClick={handleOrbActivate}
                className="flex-shrink-0 rounded-full flex items-center justify-center transition-all duration-200"
                style={{
                  width: 40, height: 40,
                  background: orbState === 'listening' ? '#00fff722' : 'rgba(0,212,255,0.06)',
                  border: `1px solid ${orbState === 'listening' ? '#00fff7' : '#1a3a6a'}`,
                  boxShadow: orbState === 'listening' ? '0 0 12px #00fff788' : 'none',
                  cursor: 'pointer',
                }}
              >
                {orbState === 'listening'
                  ? <WaveformVisualizer active color="#00fff7" barCount={5} height={18} />
                  : <span style={{ fontSize: 16 }}>&#127908;</span>}
              </button>
            )}

            {/* Text input */}
            <input
              ref={inputRef}
              type="text"
              value={orbState === 'listening' ? transcript || '' : inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your command, Sir..."
              disabled={isLoading || orbState === 'listening'}
              className="flex-1 jarvis-input rounded px-4 py-2 text-sm"
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={isLoading || (!inputText.trim() && orbState !== 'listening')}
              className="flex-shrink-0 px-4 py-2 rounded text-xs transition-all duration-200"
              style={{
                background: 'rgba(0,212,255,0.1)',
                border: '1px solid #00d4ff44',
                color: '#00d4ff',
                letterSpacing: 2,
                opacity: isLoading ? 0.5 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              SEND
            </button>
          </form>

          {/* Voice status */}
          {!isSupported && (
            <p style={{ fontSize: 10, color: '#aa3300', letterSpacing: 2, marginTop: 4, textAlign: 'center' }}>
              VOICE INPUT NOT SUPPORTED IN THIS BROWSER
            </p>
          )}
        </div>
      </div>

      {/* ─── BOTTOM HUD BAR ─── */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-6 py-1.5 z-20"
        style={{ borderTop: '1px solid #1a3a6a44', background: 'rgba(5,12,24,0.9)' }}
      >
        <span style={{ fontSize: 9, color: '#1a3a6a', letterSpacing: 3 }}>STARK INDUSTRIES :: AI MODULE v2.0.4</span>
        <div className="flex items-center gap-2">
          <span className="animate-hud-blink" style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff88', display: 'inline-block', boxShadow: '0 0 6px #00ff88' }} />
          <span style={{ fontSize: 9, color: '#00ff88', letterSpacing: 2 }}>ALL SYSTEMS NOMINAL</span>
        </div>
        <span style={{ fontSize: 9, color: '#1a3a6a', letterSpacing: 3 }}>GROQ • MONGODB • NODE.JS</span>
      </div>
    </div>
  );
}
