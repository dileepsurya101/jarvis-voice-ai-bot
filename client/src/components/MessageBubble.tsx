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
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 12,
        opacity: 1,
      }}
    >
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
          background: 'rgba(0,212,255,0.1)',
          border: '1px solid rgba(0,212,255,0.3)',
          color: '#00d4ff',
        }}>
          J
        </div>
      )}

      {/* Bubble */}
      <div style={{
        maxWidth: '75%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
      }}>
        <div style={{
          background: isUser
            ? 'rgba(0,212,255,0.15)'
            : message.isError
            ? 'rgba(255,50,50,0.1)'
            : 'rgba(0,10,30,0.6)',
          border: isUser
            ? '1px solid rgba(0,212,255,0.4)'
            : message.isError
            ? '1px solid rgba(255,50,50,0.4)'
            : '1px solid #1a3a6a',
          borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
          padding: '8px 14px',
          fontSize: 13,
          lineHeight: 1.5,
          color: message.isError ? '#ff6b6b' : '#c8e6ff',
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
          boxShadow: isSpeaking ? '0 0 12px rgba(0,212,255,0.4)' : 'none',
        }}>
          {message.content}
        </div>
        <span style={{
          fontSize: 10,
          color: '#1a4a6a',
          marginTop: 3,
          letterSpacing: 1,
        }}>
          {time}
        </span>
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
