import { timeService } from './timeService';
import { weatherService } from './weatherService';
import { notesService } from './notesService';
import { remindersService } from './remindersService';
import { llmService } from './llmClient';

export type IntentType =
  | 'TIME' | 'DATE' | 'WEATHER'
  | 'NOTE_CREATE' | 'NOTE_LIST' | 'NOTE_DELETE'
  | 'REMINDER_CREATE' | 'REMINDER_LIST'
  | 'LINK_OPEN' | 'SEARCH' | 'LLM';

export interface IntentResult {
  reply: string;
  intent: IntentType;
  actions: ActionItem[];
  source: string;
}

export interface ActionItem {
  type: string;
  data?: Record<string, unknown>;
}

// Known link shortcuts
const LINK_MAP: Record<string, string> = {
  github: 'https://github.com',
  google: 'https://google.com',
  youtube: 'https://youtube.com',
  linkedin: 'https://linkedin.com',
  twitter: 'https://twitter.com',
  stackoverflow: 'https://stackoverflow.com',
  vercel: 'https://vercel.com',
  mongodb: 'https://mongodb.com',
};

function extractCityFromWeatherQuery(text: string): string | null {
  const match = text.match(/weather\s+(?:in|for|at|of)\s+([a-zA-Z\s]+?)(?:\?|$|today|tomorrow|now)/i);
  if (match) return match[1].trim();
  const match2 = text.match(/(?:in|for|at)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)?)\s+weather/i);
  if (match2) return match2[1].trim();
  return null;
}

function extractNoteContent(text: string): string {
  const patterns = [
    /(?:create|save|add|make)\s+(?:a\s+)?note[:\s]+(.+)/i,
    /note[:\s]+(.+)/i,
    /remember[:\s]+(.+)/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return text.replace(/create|save|add|note|a|please/gi, '').trim();
}

function extractReminderContent(text: string): { content: string; timeStr?: string } {
  const match = text.match(/remind(?:\s+me)?(?:\s+to)?[:\s]+(.+?)(?:\s+at\s+(.+))?$/i);
  if (match) {
    return { content: match[1]?.trim() || text, timeStr: match[2]?.trim() };
  }
  return { content: text };
}

function extractLinkTarget(text: string): string | null {
  const match = text.match(/(?:open|go\s+to|navigate\s+to|launch)\s+(.+)/i);
  if (!match) return null;
  const target = match[1].toLowerCase().trim();
  return LINK_MAP[target] || (target.startsWith('http') ? target : null);
}

export async function routeIntent(
  transcript: string,
  sessionId: string
): Promise<IntentResult> {
  const normalized = transcript.toLowerCase().trim();
  const start = Date.now();

  try {
    // TIME
    if (/what(?:'s|\s+is)?\s+the\s+time|what\s+time|current\s+time|time\s+is\s+it/.test(normalized)) {
      return { ...timeService.getTime(), intent: 'TIME', source: 'timeService' };
    }

    // DATE
    if (/what(?:'s|\s+is)?\s+(?:the\s+)?(?:date|day)|today(?:'s)?\s+date/.test(normalized)) {
      return { ...timeService.getDate(), intent: 'DATE', source: 'timeService' };
    }

    // WEATHER
    if (/weather/.test(normalized)) {
      const city = extractCityFromWeatherQuery(transcript) || process.env.DEFAULT_CITY || 'Mumbai';
      const result = await weatherService.getWeather(city);
      return { ...result, intent: 'WEATHER', source: 'weatherService' };
    }

    // NOTE CREATE
    if (/(?:create|save|add|make)\s+(?:a\s+)?note|note:/.test(normalized)) {
      const content = extractNoteContent(transcript);
      const result = await notesService.createNote(content, sessionId);
      return { ...result, intent: 'NOTE_CREATE', source: 'notesService' };
    }

    // NOTE LIST
    if (/(?:show|list|get|view)\s+(?:my\s+)?notes|my\s+notes/.test(normalized)) {
      const result = await notesService.getNotes(sessionId);
      return { ...result, intent: 'NOTE_LIST', source: 'notesService' };
    }

    // REMINDER CREATE
    if (/remind(?:\s+me)|set\s+(?:a\s+)?reminder/.test(normalized)) {
      const { content, timeStr } = extractReminderContent(transcript);
      const result = await remindersService.createReminder(content, timeStr, sessionId);
      return { ...result, intent: 'REMINDER_CREATE', source: 'remindersService' };
    }

    // REMINDER LIST
    if (/(?:show|list|get)\s+(?:my\s+)?reminders|my\s+reminders/.test(normalized)) {
      const result = await remindersService.getReminders(sessionId);
      return { ...result, intent: 'REMINDER_LIST', source: 'remindersService' };
    }

    // LINK OPEN
    if (/(?:open|go\s+to|navigate|launch)/.test(normalized)) {
      const url = extractLinkTarget(transcript);
      if (url) {
        return {
          reply: `Of course, Sir. Opening ${url}.`,
          intent: 'LINK_OPEN',
          actions: [{ type: 'OPEN_URL', data: { url, label: url } }],
          source: 'linkService',
        };
      }
    }

    // DEFAULT: LLM
    const llmReply = await llmService.chat(transcript, sessionId);
    return {
      reply: llmReply,
      intent: 'LLM',
      actions: [],
      source: 'llmService',
    };

  } catch (error) {
    console.error('Intent routing error:', error);
    return {
      reply: 'Apologies, Sir. I encountered an error processing your request. Please try again.',
      intent: 'LLM',
      actions: [],
      source: 'error',
    };
  }
}
