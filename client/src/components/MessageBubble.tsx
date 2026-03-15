import React from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  isSpeaking?: boolean;
}

export default function MessageBubble({ message, isSpeaking = false }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const time = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 12,
      animation: 'fadeIn 0.2s ease-in',
    }}>
      {/* Jarvis avatar dot */}
      {!isUser && (
        <div style={{
          flexShrink: 0,
          marginRight: 8,
          marginTop: 4,
          width: 28,
          height: 28,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 'bold',
          background: 'radial-gradient(circle, #003355, #050c18)',
          border: isSpeaking ? '1px solid #00ff88' : '1px solid #00d4ff66',
          color: '#00d4ff',
          boxShadow: isSpeaking ? '0 0 10px #00ff8888' : '0 0 6px #00d4ff44',
        }}>
          J
        </div>
      )}

      {/* Bubble */}
      <div style={{ maxWidth: '72%' }}>
        <div style={{
          padding: '8px 14px',
          borderRadius: isUser ? '12px 12px 2px 12px' : '2px 12px 12px 12px',
          background: isUser
            ? 'rgba(0, 212, 255, 0.12)'
            : message.isError
              ? 'rgba(180, 30, 30, 0.18)'
              : 'rgba(0, 30, 60, 0.6)',
          border: isUser
            ? '1px solid rgba(0,212,255,0.3)'
            : message.isError
              ? '1px solid rgba(255,80,80,0.3)'
              : '1px solid rgba(0,212,255,0.15)',
          color: message.isError ? '#ff6666' : '#00d4ff',
          fontSize: 13,
          fontFamily: 'monospace',
          lineHeight: 1.5,
          letterSpacing: 0.3,
          boxShadow: isUser
            ? '0 0 8px rgba(0,212,255,0.1)'
            : '0 0 8px rgba(0,30,80,0.3)',
        }}>
          {message.content}
        </div>
        <div style={{
          fontSize: 9,
          color: '#1a3a6a',
          letterSpacing: 1,
          marginTop: 3,
          textAlign: isUser ? 'right' : 'left',
          paddingLeft: isUser ? 0 : 4,
          paddingRight: isUser ? 4 : 0,
        }}>
          {time}
        </div>
      </div>

      {/* User avatar dot */}
      {isUser && (
        <div style={{
          flexShrink: 0,
          marginLeft: 8,
          marginTop: 4,
          width: 28,
          height: 28,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 'bold',
          background: 'rgba(0,212,255,0.1)',
          border: '1px solid rgba(0,212,255,0.3)',
          color: '#00d4ff',
        }}>
          S
        </div>
      )}
    </div>
  );
}
