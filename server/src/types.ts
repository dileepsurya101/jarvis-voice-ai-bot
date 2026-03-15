export interface ServiceResult {
  reply: string;
  actions: ActionPayload[];
}

export interface ActionPayload {
  type: string;
  data?: unknown;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

export interface ChatResponse {
  reply: string;
  actions: ActionPayload[];
  intent?: string;
}

export type Intent =
  | 'weather'
  | 'time'
  | 'note_create'
  | 'note_list'
  | 'note_delete'
  | 'reminder_set'
  | 'reminder_list'
  | 'reminder_dismiss'
  | 'general';
