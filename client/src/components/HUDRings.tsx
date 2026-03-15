import React from 'react';

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

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="absolute inset-0 pointer-events-none"
      style={{ filter: `drop-shadow(0 0 12px ${colors.glow})` }}
    >
      {/* Radar background grid */}
      {[30, 60, 90, 120].map((r) => (
        <circle
          key={`grid-${r}`}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={colors.secondary}
          strokeWidth={0.5}
          opacity={0.2}
        />
      ))}

      {/* Cross-hairs */}
      <line x1={cx} y1={cy - 130} x2={cx} y2={cy + 130} stroke={colors.primary} strokeWidth={0.5} opacity={0.15} />
      <line x1={cx - 130} y1={cy} x2={cx + 130} y2={cy} stroke={colors.primary} strokeWidth={0.5} opacity={0.15} />

      {/* Radar sweep (only when thinking/listening) */}
      {(state === 'listening' || state === 'thinking') && (
        <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: `radar-sweep ${state === 'thinking' ? '1.2s' : '2s'} linear infinite` }}>
          <defs>
            <radialGradient id="sweepGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={colors.primary} stopOpacity="0.5" />
              <stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
            </radialGradient>
          </defs>
          <path
            d={`M ${cx} ${cy} L ${cx} ${cy - 120} A 120 120 0 0 1 ${cx + 60} ${cy - 103.9} Z`}
            fill={`url(#sweepGrad)`}
            opacity={0.6}
          />
        </g>
      )}

      {/* Animated rings */}
      {RING_CONFIGS.map((cfg, i) => (
        <circle
          key={i}
          cx={cx} cy={cy}
          r={cfg.r}
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
            key={`tick-${i}`}
            x1={cx + r1 * Math.cos(angle)}
            y1={cy + r1 * Math.sin(angle)}
            x2={cx + r2 * Math.cos(angle)}
            y2={cy + r2 * Math.sin(angle)}
            stroke={colors.primary}
            strokeWidth={i % 9 === 0 ? 2 : 1}
            opacity={i % 9 === 0 ? 0.8 : 0.35}
          />
        );
      })}

      {/* Corner HUD data labels */}
      <text x={cx - 125} y={cy - 120} fill={colors.primary} fontSize="8" opacity={0.5} fontFamily="Share Tech Mono, monospace">
        SYS::ONLINE
      </text>
      <text x={cx + 70} y={cy - 120} fill={colors.primary} fontSize="8" opacity={0.5} fontFamily="Share Tech Mono, monospace">
        v2.0.4
      </text>
      <text x={cx - 125} y={cy + 128} fill={colors.primary} fontSize="8" opacity={0.5} fontFamily="Share Tech Mono, monospace">
        AI::ACTIVE
      </text>
      <text x={cx + 78} y={cy + 128} fill={colors.primary} fontSize="8" opacity={0.5} fontFamily="Share Tech Mono, monospace">
        {state.toUpperCase()}
      </text>
    </svg>
  );
}
