import React, { useEffect, useRef } from 'react';
import MessageBubble, { Message } from './MessageBubble';

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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
        padding: '12px 16px',
        borderTop: '1px solid #1a3a6a',
        borderBottom: '1px solid #1a3a6a',
        background: 'rgba(0,10,30,0.5)',
      }}
    >
      {messages.length === 0 && !isLoading && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, opacity: 0.4 }}>
          <p style={{ fontSize: 12, color: '#00d4ff', letterSpacing: 3, fontFamily: 'monospace' }}>
            J.A.R.V.I.S ONLINE
          </p>
          <p style={{ fontSize: 11, color: '#1a4a6a', letterSpacing: 2, fontFamily: 'monospace' }}>
            AWAITING YOUR COMMAND, SIR
          </p>
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'flex-start', padding: '8px 0' }}>
          <div style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid #1a3a6a', borderRadius: 8, padding: '10px 16px', display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00d4ff', display: 'inline-block', animation: 'pulse 1s infinite' }} />
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00d4ff', display: 'inline-block', animation: 'pulse 1s infinite 0.2s' }} />
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00d4ff', display: 'inline-block', animation: 'pulse 1s infinite 0.4s' }} />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
