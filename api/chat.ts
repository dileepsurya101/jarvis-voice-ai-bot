import type { VercelRequest, VercelResponse } from '@vercel/node';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama3-8b-8192';
const SYSTEM_PROMPT = `You are J.A.R.V.I.S (Just A Rather Very Intelligent System), Tony Stark's AI assistant. You are highly intelligent, slightly formal, and occasionally witty. You address the user as "Sir" or "Ma'am". Keep responses concise and helpful.`;

async function readBody(req: VercelRequest): Promise<Record<string, unknown>> {
  // If Vercel already parsed it, return it
  if (req.body && typeof req.body === 'object') return req.body as Record<string, unknown>;
  // Otherwise read raw body
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: Buffer) => { data += chunk.toString(); });
    req.on('end', () => {
      try { resolve(JSON.parse(data)); } catch { resolve({}); }
    });
    req.on('error', reject);
  });
}

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

  const body = await readBody(req);
  const message = body.message as string | undefined;
  const history = (body.history as Array<{ role: string; content: string }>) || [];

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(200).json({ reply: `Sir, no message received. Body was: ${JSON.stringify(body)}` });
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return res.status(200).json({ reply: 'Sir, the GROQ_API_KEY is not set in Vercel environment variables.' });
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
      return res.status(200).json({ reply: `Sir, Groq API error: ${errorMsg}` });
    }

    const reply = data.choices?.[0]?.message?.content || 'No response received.';
    return res.status(200).json({ reply, actions: [], intent: 'general' });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : JSON.stringify(error);
    return res.status(200).json({ reply: `Sir, unexpected error: ${errMsg}` });
  }
}
