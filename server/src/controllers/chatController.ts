import { Request, Response } from 'express';
import { routeIntent } from '../services/intentRouter';
import { askGroq, GroqMessage } from '../services/groqService';
import { ChatRequest, ChatResponse } from '../types';

export async function handleChat(req: Request, res: Response): Promise<void> {
  try {
    const { message, history = [] }: ChatRequest = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    const trimmed = message.trim();

    // Try routing to a specific service first
    const routed = await routeIntent(trimmed);

    if (routed.intent !== 'general') {
      const response: ChatResponse = {
        reply: routed.reply,
        actions: routed.actions,
        intent: routed.intent,
      };
      res.json(response);
      return;
    }

    // Fall back to Groq LLM
    const groqHistory: GroqMessage[] = history.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const reply = await askGroq(trimmed, groqHistory);

    const response: ChatResponse = {
      reply,
      actions: [],
      intent: 'general',
    };

    res.json(response);
  } catch (error) {
    console.error('Chat controller error:', error);
    res.status(500).json({
      reply: 'Apologies, Sir. I encountered an unexpected error.',
      actions: [],
    });
  }
}

export async function healthCheck(_req: Request, res: Response): Promise<void> {
  res.json({ status: 'online', message: 'Jarvis systems operational, Sir.' });
}
