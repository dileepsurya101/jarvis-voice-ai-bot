import React, { useEffect, useRef, useState } from 'react';

type State = 'idle' | 'listening' | 'thinking' | 'speaking';

interface HUDRingsProps {
  state: State;
  size?: number;
}

const RING_CONFIGS = [
  { r: 110, stroke: 8,   dash: '60 40',  speed: '8s',  rev: false, opacity: 0.7, color: '#00d4ff' },
  { r: 90,  stroke: 3,   dash: '20 10',  speed: '5s',  rev: true,  opacity: 0.5, color: '#00fff7' },
  { r: 70,  stroke: 6,   dash: '90 20',  speed: '12s', rev: false, opacity: 0.6, color: '#00d4ff' },
  { r: 50,  stroke: 2,   dash: '15 8',   speed: '3s',  rev: true,  opacity: 0.4, color: '#4488ff' },
  { r: 130, stroke: 1.5, dash: '40 15',  speed: '20s', rev: false, opacity: 0.3, color: '#00fff7' },
];

const stateColorMap: Record<State, { primary: string; secondary: string; glow: string }> = {
  idle:      { primary: '#00d4ff', secondary: '#1a3a6a', glow: '#00d4ff44' },
  listening: { primary: '#00fff7', secondary: '#00aabb', glow: '#00fff7aa' },
  thinking:  { primary: '#ffaa00', secondary: '#aa6600', glow: '#ffaa0088' },
  speaking:  { primary: '#00ff88', secondary: '#007744', glow: '#00ff8888' },
};

export default function HUDRings({ state, size = 300 }: HUDRingsProps) {
  const cx = size / 2;
  const cy = size / 2;
  const colors = stateColorMap[state];
  const speedMult = state === 'thinking' ? 0.4 : state === 'listening' ? 0.6 : 1;

  // Mouse-following cursor orb
  const orbRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -200, y: -200 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      {/* Mouse-following cursor orb */}
      <div
        ref={orbRef}
        style={{
          position: 'fixed',
          left: mousePos.x,
          top: mousePos.y,
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: `2px solid ${colors.primary}`,
          boxShadow: `0 0 12px ${colors.primary}, 0 0 24px ${colors.glow}`,
          pointerEvents: 'none',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          transition: 'border-color 0.3s, box-shadow 0.3s',
        }}
      >
        <div style={{
          position: 'absolute',
          inset: 4,
          borderRadius: '50%',
          border: `1px dashed ${colors.secondary}`,
          animation: 'ring-rotate 2s linear infinite',
        }} />
        <div style={{
          position: 'absolute',
          inset: 10,
          borderRadius: '50%',
          background: colors.primary,
          opacity: 0.3,
          animation: 'ring-rotate-rev 3s linear infinite',
        }} />
      </div>

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 pointer-events-none"
        style={{ filter: `drop-shadow(0 0 12px ${colors.glow})` }}
      >
        {/* Radar background grid */}
        {[30, 60, 90, 120].map((r) => (
          <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke={colors.secondary} strokeWidth="0.5" opacity="0.3" />
        ))}

        {/* Cross-hairs */}
        <line x1={cx} y1={cy - 135} x2={cx} y2={cy + 135} stroke={colors.secondary} strokeWidth="0.5" opacity="0.3" />
        <line x1={cx - 135} y1={cy} x2={cx + 135} y2={cy} stroke={colors.secondary} strokeWidth="0.5" opacity="0.3" />

        {/* Radar sweep (only when thinking/listening) */}
        {(state === 'listening' || state === 'thinking') && (
          <line
            x1={cx} y1={cy} x2={cx} y2={cy - 120}
            stroke={colors.primary} strokeWidth="2" opacity="0.6"
            style={{ transformOrigin: `${cx}px ${cy}px`, animation: `ring-rotate ${state === 'thinking' ? '2s' : '1s'} linear infinite` }}
          />
        )}

        {/* Animated rings */}
        {RING_CONFIGS.map((cfg, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={cfg.r}
            fill="none"
            stroke={cfg.color}
            strokeWidth={cfg.stroke}
            strokeDasharray={cfg.dash}
            opacity={cfg.opacity}
            style={{
              transformOrigin: `${cx}px ${cy}px`,
              animation: `${cfg.rev ? 'ring-rotate-rev' : 'ring-rotate'} ${parseFloat(cfg.speed) / speedMult}s linear infinite`,
            }}
          />
        ))}

        {/* Tick marks */}
        {Array.from({ length: 36 }, (_, i) => {
          const angle = (i * 10 * Math.PI) / 180;
          const r1 = 115, r2 = i % 9 === 0 ? 105 : 110;
          return (
            <line
              key={i}
              x1={cx + r1 * Math.sin(angle)} y1={cy - r1 * Math.cos(angle)}
              x2={cx + r2 * Math.sin(angle)} y2={cy - r2 * Math.cos(angle)}
              stroke={colors.primary} strokeWidth={i % 9 === 0 ? 2 : 1} opacity="0.5"
            />
          );
        })}

        {/* Corner HUD data labels */}
        <text x="8" y="16" fill={colors.primary} fontSize="7" fontFamily="monospace" opacity="0.7">SYS::ONLINE v2.0.4</text>
        <text x="8" y={size - 8} fill={colors.primary} fontSize="7" fontFamily="monospace" opacity="0.7">AI::ACTIVE</text>
        <text x={size - 8} y={size - 8} fill={colors.primary} fontSize="7" fontFamily="monospace" opacity="0.7" textAnchor="end">{state.toUpperCase()}</text>
      </svg>
    </>
  );
}
