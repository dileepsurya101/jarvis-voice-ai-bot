import React, { useState, useEffect, useRef, useCallback } from 'react';
import JarvisOrb, { OrbState } from './components/JarvisOrb';
import ChatWindow from './components/ChatWindow';
import WaveformVisualizer from './components/WaveformVisualizer';
import HUDRings from './components/HUDRings';
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
    interimTranscript,
    state: speechState,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    speak,
    isSpeaking,
    cancelSpeech,
    unlockAudio,
    setOnFinalTranscript,
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
  const handleSend = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setInputText('');
    resetTranscript();
    const reply = await sendMessage(text);
    if (reply) { speak(reply); }
  }, [sendMessage, speak, resetTranscript]);
  // Register final transcript callback for auto-submit
  useEffect(() => {
    setOnFinalTranscript((text: string) => {
      handleSend(text);
    });
    return () => setOnFinalTranscript(null);
  }, [handleSend, setOnFinalTranscript]);
  const handleOrbActivate = () => {
    unlockAudio();
    if (isSpeaking) { cancelSpeech(); return; }
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
    unlockAudio();
    if (inputText.trim()) handleSend(inputText);
  };
  const handleMicClick = () => {
    unlockAudio();
    if (speechState === 'listening') {
      stopListening();
    } else {
      startListening();
    }
  };
  // What to show in input during voice
  const voiceDisplayText = speechState === 'listening'
    ? (interimTranscript || transcript || '')
    : inputText;
  // State colors for badge
  const stateColors: Record<OrbState, { color: string; border: string; label: string }> = {
    idle: { color: '#00d4ff', border: '#00d4ff44', label: 'STANDBY' },
    listening: { color: '#00fff7', border: '#00fff7aa', label: 'LISTENING...' },
    thinking: { color: '#ffaa00', border: '#ffaa0088', label: 'PROCESSING...' },
    speaking: { color: '#00ff88', border: '#00ff8888', label: 'RESPONDING...' },
  };
  const sc = stateColors[orbState];
  const timeStr = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  const isListening = speechState === 'listening';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: 'var(--pplx-bg)', overflow: 'hidden' }}>
      {/* Scanline overlay */}
      <div className="scanline-overlay" />
      {/* TOP HUD BAR */}
      <div className="hud-bar">
        <span className="hud-title">J.A.R.V.I.S &nbsp;|&nbsp; JUST A RATHER VERY INTELLIGENT SYSTEM</span>
        <span style={{ color: '#6b7280', fontSize: 10 }}>{dateStr} &nbsp;&nbsp; {timeStr}</span>
      </div>
      {/* MAIN CONTENT */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* LEFT PANEL - ORB */}
        <div className="orb-panel" style={{ width: 260, minWidth: 220 }}>
          {/* Waveform at top */}
          <div style={{ width: '100%', height: 36, marginBottom: 8 }}>
            <WaveformVisualizer state={orbState} />
          </div>
          {/* Orb clickable */}
          <div
            onClick={handleOrbActivate}
            style={{
              position: 'relative',
              width: 220,
              height: 220,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'none',
            }}
          >
            <HUDRings state={orbState} size={220} />
            <div style={{ position: 'absolute', zIndex: 2 }}>
              <JarvisOrb state={orbState} size={100} />
            </div>
          </div>
          {/* Status badge */}
          <div
            className="orb-status-badge"
            style={{ color: sc.color, borderColor: sc.border }}
          >
            {sc.label}
          </div>
          {/* Voice interim transcript preview */}
          {isListening && (
            <div style={{
              marginTop: 8,
              padding: '6px 12px',
              background: 'rgba(0,255,247,0.06)',
              border: '1px solid rgba(0,255,247,0.2)',
              borderRadius: 6,
              fontSize: 11,
              color: '#00fff7',
              fontFamily: 'Share Tech Mono, monospace',
              textAlign: 'center',
              minHeight: 28,
              letterSpacing: '0.05em',
              transition: 'all 0.2s',
            }}>
              {interimTranscript
                ? <span style={{ opacity: 0.8 }}>{interimTranscript}</span>
                : <span style={{ opacity: 0.4 }}>Listening...</span>
              }
            </div>
          )}
          {/* Hint text */}
          <div style={{ marginTop: 10, fontSize: 10, color: '#6b7280', fontFamily: 'Share Tech Mono, monospace', letterSpacing: '0.1em', textAlign: 'center' }}>
            {orbState === 'idle'
              ? isSupported ? 'CLICK ORB TO SPEAK' : 'TYPE BELOW'
              : orbState === 'listening' ? 'CLICK TO STOP'
              : orbState === 'thinking' ? 'ANALYZING QUERY...'
              : 'SPEAKING — CLICK TO STOP'}
          </div>
          {/* Bottom info */}
          <div style={{ marginTop: 'auto', paddingTop: 16, fontSize: 9, color: '#2a2a3a', fontFamily: 'Share Tech Mono, monospace', textAlign: 'center', letterSpacing: '0.1em' }}>
            STARK INDUSTRIES :: AI MODULE v2.0.4
          </div>
        </div>
        {/* RIGHT PANEL - CHAT */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--pplx-surface)' }}>
          {/* Perplexity-style top bar */}
          <div style={{
            padding: '10px 20px',
            borderBottom: '1px solid var(--pplx-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--pplx-bg)',
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: sc.color,
              boxShadow: `0 0 8px ${sc.color}`,
              animation: 'pulse-glow 2s ease-in-out infinite',
            }} />
            <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'Share Tech Mono, monospace', letterSpacing: '0.08em' }}>
              AI::ACTIVE &nbsp;•&nbsp; {orbState.toUpperCase()}
            </span>
            {isListening && (
              <span style={{
                fontSize: 10,
                color: '#00fff7',
                fontFamily: 'Share Tech Mono, monospace',
                letterSpacing: '0.08em',
                animation: 'pulse-glow 1s ease-in-out infinite',
              }}>
                🎙 VOICE ACTIVE
              </span>
            )}
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#2a2a3a', fontFamily: 'Share Tech Mono, monospace' }}>
              GROQ • NODE.JS
            </span>
          </div>
          {/* Chat messages */}
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 20px' }}>
            <ChatWindow messages={messages} isLoading={isLoading} />
          </div>
          {/* INPUT ROW - Perplexity style */}
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--pplx-border)', background: 'var(--pplx-bg)' }}>
            <form onSubmit={handleFormSubmit}>
              <div className="pplx-input-bar">
                {/* Mic button */}
                {isSupported && (
                  <button
                    type="button"
                    onClick={handleMicClick}
                    title={isListening ? 'Stop listening' : 'Start voice input'}
                    style={{
                      background: isListening
                        ? 'linear-gradient(135deg,#00ff88,#00d4ff)'
                        : 'rgba(0,212,255,0.08)',
                      border: isListening
                        ? '1px solid #00fff7'
                        : '1px solid rgba(0,212,255,0.25)',
                      color: isListening ? '#050c12' : '#00d4ff',
                      borderRadius: 8,
                      padding: '6px 10px',
                      fontSize: 15,
                      lineHeight: 1,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: isListening ? '0 0 12px #00fff788' : 'none',
                      animation: isListening ? 'pulse-glow 1s ease-in-out infinite' : 'none',
                    }}
                  >
                    {isListening ? '⏹' : '🎤'}
                  </button>
                )}
                <input
                  ref={inputRef}
                  type="text"
                  value={voiceDisplayText}
                  onChange={(e) => {
                    if (!isListening) setInputText(e.target.value);
                  }}
                  placeholder={isListening ? 'Speak now...' : 'Ask JARVIS anything, Sir...'}
                  disabled={isLoading}
                  style={{
                    fontStyle: isListening && interimTranscript ? 'italic' : 'normal',
                    color: isListening ? '#00fff7' : undefined,
                  }}
                />
                <button type="submit" className="pplx-send-btn" disabled={isLoading || isListening}>
                  {isLoading ? '...' : 'ASK →'}
                </button>
              </div>
            </form>
            {!isSupported && (
              <div style={{ marginTop: 6, fontSize: 10, color: '#6b7280', textAlign: 'center', fontFamily: 'Share Tech Mono, monospace' }}>
                VOICE INPUT NOT SUPPORTED IN THIS BROWSER
              </div>
            )}
            {speechState === 'error' && (
              <div style={{ marginTop: 6, fontSize: 10, color: '#ff6b6b', textAlign: 'center', fontFamily: 'Share Tech Mono, monospace' }}>
                MIC ACCESS DENIED — PLEASE ALLOW MICROPHONE PERMISSION
              </div>
            )}
          </div>
        </div>
      </div>
      {/* BOTTOM HUD BAR */}
      <div className="hud-bar hud-bar-bottom">
        <span style={{ color: '#2a2a3a', fontSize: 10 }}>STARK INDUSTRIES :: AI MODULE v2.0.4</span>
        <span style={{ color: '#00d4ff', fontSize: 10, animation: 'pulse-glow 2s ease-in-out infinite' }}>ALL SYSTEMS NOMINAL</span>
        <span style={{ color: '#2a2a3a', fontSize: 10 }}>GROQ • NODE.JS</span>
      </div>
    </div>
  );
}
