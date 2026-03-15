import type { VercelRequest, VercelResponse } from '@vercel/node';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama3-8b-8192';
const SYSTEM_PROMPT = `You are J.A.R.V.I.S (Just A Rather Very Intelligent System), Tony Stark's AI assistant. You are highly intelligent, slightly formal, and occasionally witty. You address the user as "Sir" or "Ma'am". Keep responses concise and helpful.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history = [] } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return res.status(500).json({ reply: 'Sir, the GROQ API key is not configured. Please add GROQ_API_KEY to Vercel environment variables.' });
  }

  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-10),
      { role: 'user', content: message.trim() },
    ];

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.error?.message || JSON.stringify(data);
      console.error('Groq error:', errorMsg);
      return res.status(200).json({ reply: `Sir, I encountered an issue: ${errorMsg}` });
    }

    const reply = data.choices?.[0]?.message?.content || 'No response received.';
    return res.status(200).json({ reply, actions: [], intent: 'general' });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Chat API error:', errMsg);
    return res.status(200).json({ reply: `Sir, I encountered an unexpected error: ${errMsg}` });
  }
}
