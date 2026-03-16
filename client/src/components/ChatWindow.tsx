import React, { useEffect, useRef } from 'react';
import { Message } from './MessageBubble';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  speakingMsgId?: string;
}

export default function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: '100%' }}>

      {/* Empty state */}
      {messages.length === 0 && !isLoading && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          padding: '40px 20px',
          opacity: 0.6,
        }}>
          {/* Big J logo */}
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            border: '2px solid #00d4ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            fontWeight: 700,
            color: '#00d4ff',
            fontFamily: 'Share Tech Mono, monospace',
            boxShadow: '0 0 20px #00d4ff44',
            animation: 'pulse-glow 3s ease-in-out infinite',
          }}>J</div>
          <p style={{ fontSize: 13, color: '#00d4ff', letterSpacing: '0.15em', fontFamily: 'Share Tech Mono, monospace' }}>
            J.A.R.V.I.S ONLINE
          </p>
          <p style={{ fontSize: 11, color: '#6b7280', letterSpacing: '0.1em', fontFamily: 'Share Tech Mono, monospace' }}>
            AWAITING YOUR COMMAND, SIR
          </p>
          {/* Suggestion chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 }}>
            {['What can you do?', 'Tell me the news', 'Explain quantum computing', 'Set a reminder'].map((s) => (
              <span key={s} style={{
                padding: '5px 12px',
                background: 'rgba(0,212,255,0.06)',
                border: '1px solid rgba(0,212,255,0.2)',
                borderRadius: 20,
                fontSize: 11,
                color: '#6b7280',
                fontFamily: 'Inter, sans-serif',
              }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.map((msg) => (
        <div
          key={msg.id}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
            gap: 4,
          }}
        >
          {/* Role label */}
          <div style={{
            fontSize: 10,
            color: '#6b7280',
            fontFamily: 'Share Tech Mono, monospace',
            letterSpacing: '0.1em',
            paddingLeft: msg.role === 'user' ? 0 : 4,
            paddingRight: msg.role === 'user' ? 4 : 0,
          }}>
            {msg.role === 'user' ? 'YOU' : 'J.A.R.V.I.S'}
          </div>

          {/* Bubble */}
          <div className={msg.role === 'user' ? 'message-user' : 'message-jarvis'}>
            {msg.content}
          </div>
        </div>
      ))}

      {/* Thinking indicator */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
          <div style={{ fontSize: 10, color: '#6b7280', fontFamily: 'Share Tech Mono, monospace', letterSpacing: '0.1em', paddingLeft: 4 }}>
            J.A.R.V.I.S
          </div>
          <div className="message-jarvis" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: '#ffaa00', fontFamily: 'Share Tech Mono, monospace' }}>PROCESSING</span>
            <div className="thinking-dots">
              <span /><span /><span />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
