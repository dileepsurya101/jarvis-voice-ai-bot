import React from 'react';
import HUDRings from './HUDRings';
import WaveformVisualizer from './WaveformVisualizer';

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface JarvisOrbProps {
  state: OrbState;
  onActivate: () => void;
}

const STATE_LABELS: Record<OrbState, string> = {
  idle:      'STANDBY',
  listening: 'LISTENING',
  thinking:  'PROCESSING',
  speaking:  'RESPONDING',
};

const ORB_ANIM: Record<OrbState, string> = {
  idle:      'animate-orb-idle',
  listening: 'animate-orb-listen',
  thinking:  'animate-orb-think',
  speaking:  'animate-orb-speak',
};

const ORB_GRADIENT: Record<OrbState, [string, string]> = {
  idle:      ['#0a2a4a', '#003355'],
  listening: ['#003344', '#005566'],
  thinking:  ['#3a2000', '#664400'],
  speaking:  ['#003322', '#006644'],
};

const LABEL_COLOR: Record<OrbState, string> = {
  idle:      '#00d4ff',
  listening: '#00fff7',
  thinking:  '#ffaa00',
  speaking:  '#00ff88',
};

export default function JarvisOrb({ state, onActivate }: JarvisOrbProps) {
  const [g1, g2] = ORB_GRADIENT[state];
  const labelColor = LABEL_COLOR[state];

  return (
    <div className="relative flex items-center justify-center" style={{ width: 300, height: 300 }}>
      {/* HUD rings behind everything */}
      <HUDRings state={state} size={300} />

      {/* Outer glow ring */}
      <div
        className={`absolute rounded-full transition-all duration-700 ${ORB_ANIM[state]}`}
        style={{
          width: 160, height: 160,
          background: `radial-gradient(circle at 35% 35%, ${g2}, ${g1})`,
          border: `2px solid ${labelColor}44`,
        }}
      />

      {/* Clickable orb surface */}
      <button
        onClick={onActivate}
        className={`absolute rounded-full cursor-pointer transition-all duration-300 flex items-center justify-center ${
          state === 'idle' ? 'hover:scale-105' : ''
        }`}
        style={{ width: 140, height: 140, background: 'transparent', border: 'none', outline: 'none' }}
        aria-label="Activate Jarvis"
      >
        {/* Inner orb */}
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: 120, height: 120,
            background: `radial-gradient(circle at 30% 30%, #1a4060, #050c18)`,
            border: `1px solid ${labelColor}66`,
            boxShadow: `inset 0 0 30px ${labelColor}22`,
          }}
        >
          {/* J letter or state icon */}
          {state === 'idle' && (
            <span
              className="text-glow select-none"
              style={{ fontSize: 42, fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, color: labelColor, letterSpacing: 2 }}
            >
              J
            </span>
          )}

          {state === 'listening' && (
            <WaveformVisualizer active color="#00fff7" barCount={9} />
          )}

          {state === 'thinking' && (
            <svg width="50" height="50" viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="18" fill="none" stroke="#ffaa00" strokeWidth="3"
                strokeDasharray="30 80" style={{ transformOrigin: '25px 25px', animation: 'ring-rotate 0.6s linear infinite' }} />
              <circle cx="25" cy="25" r="10" fill="none" stroke="#ffcc44" strokeWidth="2"
                strokeDasharray="15 30" style={{ transformOrigin: '25px 25px', animation: 'ring-rotate-rev 0.4s linear infinite' }} />
              <circle cx="25" cy="25" r="3" fill="#ffaa00" opacity={0.9} />
            </svg>
          )}

          {state === 'speaking' && (
            <WaveformVisualizer active color="#00ff88" barCount={9} />
          )}
        </div>
      </button>

      {/* State label below orb */}
      <div
        className="absolute bottom-0 left-0 right-0 flex flex-col items-center"
        style={{ bottom: -28 }}
      >
        <span
          className="animate-hud-blink"
          style={{ fontSize: 11, color: labelColor, letterSpacing: 4, fontFamily: 'Share Tech Mono, monospace' }}
        >
          {STATE_LABELS[state]}
        </span>
        {/* Thin status bar */}
        <div style={{ width: 80, height: 1, background: labelColor, opacity: 0.4, marginTop: 4 }} />
      </div>
    </div>
  );
}
