import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are Jarvis, a sophisticated AI personal assistant inspired by Tony Stark's Jarvis.
You are precise, professional, witty, and always address the user as "Sir" or "Ma'am".
You provide concise, helpful responses. You never break character.
When you don't know something, admit it gracefully but offer alternatives.
Keep responses under 3 sentences unless detail is explicitly requested.`;

export interface GroqMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function askGroq(
  userMessage: string,
  history: GroqMessage[] = []
): Promise<string> {
  try {
    const messages: GroqMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-10),
      { role: 'user', content: userMessage },
    ];

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama3-8b-8192',
      messages,
      max_tokens: 512,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || 'I seem to be at a loss for words, Sir.';
  } catch (error: unknown) {
    console.error('Groq API error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('401') || msg.includes('invalid_api_key')) {
      return 'My language processors are offline, Sir. The API key appears invalid.';
    }
    return 'Apologies, Sir. My language processors are temporarily unavailable.';
  }
}
