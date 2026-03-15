import React, { useEffect, useRef } from 'react';
import MessageBubble, { Message } from './MessageBubble';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  speakingMsgId?: string;
}

export default function ChatWindow({ messages, isLoading, speakingMsgId }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div
      className="flex flex-col h-full overflow-y-auto px-4 py-3 glass"
      style={{ borderTop: '1px solid #1a3a6a33', borderBottom: '1px solid #1a3a6a33' }}
    >
      {/* Boot message */}
      {messages.length === 0 && !isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 opacity-40">
          <p style={{ fontSize: 12, color: '#00d4ff', letterSpacing: 3, fontFamily: 'Share Tech Mono, monospace' }}>
            J.A.R.V.I.S ONLINE
          </p>
          <p style={{ fontSize: 11, color: '#1a4a6a', letterSpacing: 2 }}>
            AWAITING YOUR COMMAND, SIR
          </p>
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isSpeaking={speakingMsgId === msg.id}
        />
      ))}

      {/* Thinking indicator */}
      {isLoading && (
        <div className="flex justify-start mb-3 animate-msg-in">
          <div className="flex-shrink-0 mr-2 mt-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
              style={{ background: 'radial-gradient(circle, #003355, #050c18)', border: '1px solid #00d4ff66', color: '#00d4ff' }}
            >
              J
            </div>
          </div>
          <div
            className="px-4 py-3 rounded-lg flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #0a1e2e, #071525)', border: '1px solid #00d4ff22' }}
          >
            {[0.0, 0.2, 0.4].map((d, i) => (
              <div
                key={i}
                className="rounded-full"
                style={{
                  width: 6, height: 6,
                  background: '#ffaa00',
                  animation: `orb-think 0.8s ease-in-out infinite ${d}s`,
                  boxShadow: '0 0 6px #ffaa0088',
                }}
              />
            ))}
            <span style={{ fontSize: 11, color: '#ffaa00', letterSpacing: 2, marginLeft: 4 }}>PROCESSING</span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
