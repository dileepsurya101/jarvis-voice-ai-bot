import { useState, useCallback, useRef } from 'react';
import { Message } from '../components/MessageBubble';

const API_URL = '/api/chat';

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<string | null>;
  clearMessages: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use ref to always have latest messages without stale closure
  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = messages;

  const sendMessage = useCallback(async (text: string): Promise<string | null> => {
    if (!text.trim()) return null;
    setError(null);

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Use ref to get latest messages (avoids stale closure)
      const history = messagesRef.current.slice(-10).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history,
        }),
      });

      let data: { reply?: string; error?: string };
      try {
        data = await response.json();
      } catch {
        throw new Error(`Failed to parse response (status ${response.status})`);
      }

      if (!response.ok) {
        throw new Error(data?.error || `API error: ${response.status}`);
      }

      const reply = data.reply || 'No response received.';

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      return reply;
    } catch (err) {
      const errDetail = err instanceof Error ? err.message : String(err);
      const msg = `Sir, connection error: ${errDetail}`;
      setError(msg);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: msg,
          timestamp: new Date(),
          isError: true,
        },
      ]);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, isLoading, error, sendMessage, clearMessages };
}
