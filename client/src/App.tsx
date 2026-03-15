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
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, sendMessage } = useChat();
  const {
    transcript,
    state: speechState,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    speak,
    isSpeaking,
    cancelSpeech,
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

  // When transcript is final, auto-send
  const transcriptRef = useRef('');
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    if (speechState === 'idle' && transcriptRef.current && !isLoading) {
      const text = transcriptRef.current;
      resetTranscript();
      handleSend(text);
    }
  }, [speechState]);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setInputText('');
    const reply = await sendMessage(text);
    if (reply && !reply.startsWith('Sir, the GROQ') && !reply.startsWith('Apologies')) {
      speak(reply);
    }
  }, [sendMessage, speak]);

  const handleOrbActivate = () => {
    if (isSpeaking) {
      cancelSpeech();
      return;
    }
    if (orbState === 'idle') {
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
    if (inputText.trim()) handleSend(inputText);
  };

  const timeStr = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div style={{ minHeight: '100vh', background: '#050c12', color: '#00d4ff', fontFamily: 'monospace', position: 'relative', overflow: 'hidden' }}>

      {/* TOP HUD BAR */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 16px', borderBottom: '1px solid #1a3a6a44', background: 'rgba(5,12,24,0.95)' }}>
        <span style={{ fontSize: 9, color: '#1a3a6a', letterSpacing: 3 }}>J.A.R.V.I.S &nbsp;|&nbsp; JUST A RATHER VERY INTELLIGENT SYSTEM</span>
        <span style={{ fontSize: 9, color: '#1a3a6a', letterSpacing: 2 }}>{dateStr} &nbsp; {timeStr}</span>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ paddingTop: 40, paddingBottom: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh' }}>

        {/* ORB */}
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <JarvisOrb state={orbState} onClick={handleOrbActivate} />
          <WaveformVisualizer isActive={isSpeaking || speechState === 'listening'} />
          <span style={{ fontSize: 9, color: '#1a3a6a', letterSpacing: 2, marginTop: 4 }}>
            {orbState === 'idle'
              ? isSupported ? 'CLICK ORB TO SPEAK ▼' : 'TYPE BELOW ▼'
              : orbState === 'listening' ? 'LISTENING... CLICK TO STOP'
              : orbState === 'thinking' ? 'PROCESSING YOUR REQUEST...'
              : 'JARVIS IS RESPONDING...'}
          </span>
        </div>

        {/* CHAT WINDOW */}
        <div style={{ width: '100%', maxWidth: 680, marginTop: 16, padding: '0 12px', flex: 1 }}>
          <ChatWindow messages={messages} isLoading={isLoading} />
        </div>

        {/* INPUT ROW */}
        <div style={{ width: '100%', maxWidth: 680, padding: '0 12px', marginTop: 8 }}>
          <form onSubmit={handleFormSubmit} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {isSupported && (
              <button
                type="button"
                onClick={() => {
                  if (speechState === 'listening') stopListening();
                  else startListening();
                }}
                style={{
                  background: speechState === 'listening' ? '#00ff88' : 'transparent',
                  border: '1px solid #1a3a6a',
                  color: speechState === 'listening' ? '#050c12' : '#00d4ff',
                  borderRadius: 4,
                  padding: '6px 10px',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                {speechState === 'listening' ? '⏹' : '🎤'}
              </button>
            )}
            <input
              ref={inputRef}
              type="text"
              value={speechState === 'listening' ? transcript || '' : inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your command, Sir..."
              disabled={isLoading || speechState === 'listening'}
              style={{
                flex: 1,
                background: 'rgba(0,212,255,0.05)',
                border: '1px solid #1a3a6a',
                color: '#00d4ff',
                padding: '8px 14px',
                borderRadius: 4,
                fontSize: 13,
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              style={{
                background: 'transparent',
                border: '1px solid #00d4ff',
                color: '#00d4ff',
                padding: '8px 16px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 11,
                letterSpacing: 2,
              }}
            >
              SEND
            </button>
          </form>
          {!isSupported && (
            <p style={{ fontSize: 10, color: '#aa3300', letterSpacing: 2, marginTop: 4, textAlign: 'center' }}>
              VOICE INPUT NOT SUPPORTED IN THIS BROWSER
            </p>
          )}
        </div>
      </div>

      {/* BOTTOM HUD BAR */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 16px', borderTop: '1px solid #1a3a6a44', background: 'rgba(5,12,24,0.9)' }}>
        <span style={{ fontSize: 9, color: '#1a3a6a', letterSpacing: 3 }}>STARK INDUSTRIES :: AI MODULE v2.0.4</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <span className="animate-hud-blink" style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff88', display: 'inline-block' }} />
          <span style={{ fontSize: 9, color: '#00ff88', letterSpacing: 2 }}>ALL SYSTEMS NOMINAL</span>
        </div>
        <span style={{ fontSize: 9, color: '#1a3a6a', letterSpacing: 3 }}>GROQ • NODE.JS</span>
      </div>
    </div>
  );
}
