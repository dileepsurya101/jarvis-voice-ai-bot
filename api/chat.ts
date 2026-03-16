import type { VercelRequest, VercelResponse } from '@vercel/node';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.1-8b-instant';
const SYSTEM_PROMPT = `You are J.A.R.V.I.S (Just A Rather Very Intelligent System), Tony Stark's AI assistant. You are highly intelligent, slightly formal, and occasionally witty. You address the user as "Sir" or "Ma'am". Keep responses concise and helpful.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  console.log('req.body type:', typeof req.body);
  console.log('req.body value:', JSON.stringify(req.body));

  // Vercel @vercel/node automatically parses JSON bodies
  const body = req.body as { message?: string; history?: Array<{ role: string; content: string }> } || {};
  const message = body.message;
  const history = body.history || [];

  console.log('message:', message);
  console.log('GROQ_API_KEY present:', !!process.env.GROQ_API_KEY);

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    const debugInfo = `body=${JSON.stringify(req.body)}, keys=${Object.keys(req.body || {}).join(',')}`;
    return res.status(200).json({ reply: `Sir, message not found. Debug: ${debugInfo}` });
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return res.status(200).json({ reply: 'Sir, GROQ_API_KEY is not configured in Vercel.' });
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
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({ model: MODEL, messages, max_tokens: 1024, temperature: 0.7 }),
    });

    const data = await response.json();
    console.log('Groq status:', response.status);
    console.log('Groq data:', JSON.stringify(data).slice(0, 200));

    if (!response.ok) {
      const errorMsg = data?.error?.message || JSON.stringify(data);
      return res.status(200).json({ reply: `Sir, Groq error (${response.status}): ${errorMsg}` });
    }

    const reply = data.choices?.[0]?.message?.content || 'No response received.';
    return res.status(200).json({ reply, actions: [], intent: 'general' });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : JSON.stringify(error);
    console.error('Caught error:', errMsg);
    return res.status(200).json({ reply: `Sir, caught: ${errMsg}` });
  }
}
