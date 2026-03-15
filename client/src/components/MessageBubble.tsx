import React from 'react';
import WaveformVisualizer from './WaveformVisualizer';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
  isSpeaking?: boolean;
}

export default function MessageBubble({ message, isSpeaking = false }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const time = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className={`flex animate-msg-in ${
        isUser ? 'justify-end' : 'justify-start'
      } mb-3`}
    >
      {/* Jarvis avatar dot */}
      {!isUser && (
        <div className="flex-shrink-0 mr-2 mt-1">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              background: 'radial-gradient(circle, #003355, #050c18)',
              border: '1px solid #00d4ff66',
              color: '#00d4ff',
              boxShadow: isSpeaking ? '0 0 10px #00ff8888' : '0 0 6px #00d4ff44',
            }}
          >
            J
          </div>
        </div>
      )}

      <div style={{ maxWidth: '72%' }}>
        {/* Bubble */}
        <div
          className="relative px-4 py-2.5 rounded-lg"
          style={{
            background: isUser
              ? 'linear-gradient(135deg, #1a3a6a, #0d2040)'
              : 'linear-gradient(135deg, #0a1e2e, #071525)',
            border: `1px solid ${isUser ? '#1a4a8a' : '#00d4ff22'}`,
            boxShadow: isUser
              ? '0 2px 12px #00d4ff11'
              : isSpeaking
              ? '0 2px 16px #00ff8833'
              : '0 2px 12px #00000033',
          }}
        >
          {/* HUD corners on Jarvis messages */}
          {!isUser && (
            <>
              <span className="hud-tl" />
              <span className="hud-tr" />
              <span className="hud-bl" />
              <span className="hud-br" />
            </>
          )}

          <p
            style={{
              color: isUser ? '#a8d4ff' : '#00d4ff',
              fontSize: 13,
              lineHeight: 1.6,
              fontFamily: isUser ? 'inherit' : 'Share Tech Mono, monospace',
            }}
          >
            {message.content}
          </p>

          {/* Speaking waveform on active Jarvis message */}
          {!isUser && isSpeaking && (
            <div className="mt-2">
              <WaveformVisualizer active color="#00ff88" barCount={8} height={20} />
            </div>
          )}
        </div>

        {/* Timestamp + role */}
        <div
          className={`flex items-center gap-2 mt-1 ${
            isUser ? 'justify-end' : 'justify-start'
          }`}
        >
          <span style={{ fontSize: 10, color: '#1a4a6a', fontFamily: 'Share Tech Mono, monospace' }}>
            {isUser ? 'YOU' : 'J.A.R.V.I.S'} &bull; {time}
          </span>
        </div>
      </div>

      {/* User avatar dot */}
      {isUser && (
        <div className="flex-shrink-0 ml-2 mt-1">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
            style={{
              background: 'radial-gradient(circle, #1a3a6a, #050c18)',
              border: '1px solid #4488ff66',
              color: '#4488ff',
            }}
          >
            ▲
          </div>
        </div>
      )}
    </div>
  );
}
