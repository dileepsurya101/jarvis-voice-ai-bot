import React from 'react';

interface WaveformVisualizerProps {
  active: boolean;
  color?: string;
  barCount?: number;
  height?: number;
}

export default function WaveformVisualizer({
  active,
  color = '#00d4ff',
  barCount = 10,
  height = 40,
}: WaveformVisualizerProps) {
  const bars = Array.from({ length: barCount }, (_, i) => i + 1);

  return (
    <div
      className="flex items-end justify-center gap-1"
      style={{ height, minWidth: barCount * 8 }}
      aria-hidden
    >
      {bars.map((n) => (
        <div
          key={n}
          className={`wave-bar wave-${n <= 10 ? n : 10} rounded-sm`}
          style={{
            width: 4,
            height: '100%',
            background: `linear-gradient(to top, ${color}, ${color}88)`,
            boxShadow: active ? `0 0 6px ${color}` : 'none',
            animationPlayState: active ? 'running' : 'paused',
            transform: active ? undefined : 'scaleY(0.15)',
            transition: 'transform 0.3s',
            opacity: active ? 1 : 0.4,
          }}
        />
      ))}
    </div>
  );
}
