
/* Anviti - Vercel-compatible AI Assistant API */

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;

function checkRateLimit(clientIp) {
  const now = Date.now();
  const entry = rateLimitMap.get(clientIp);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(clientIp, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) return false;

  entry.count++;
  return true;
}

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export async function handleAssistantChatRequest(req, res) {
  try {
    if (req.method !== 'POST') {
      return sendJson(res, 405, {
        error: 'Method not allowed. Use POST.',
      });
    }

    const clientIp =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      '127.0.0.1';

    if (!checkRateLimit(clientIp)) {
      return sendJson(res, 429, {
        error: 'Too many requests. Please wait a moment.',
      });
    }

    // Support Vercel parsed bodies and local raw request streams.
    let payload = req.body;

    if (typeof payload === 'string') {
      payload = JSON.parse(payload || '{}');
    } else if (!payload || typeof payload !== 'object') {
      const chunks = [];
      let totalSize = 0;

      for await (const chunk of req) {
        totalSize += chunk.length;

        if (totalSize > 50 * 1024) {
          return sendJson(res, 413, {
            error: 'Request body is too large.',
          });
        }

        chunks.push(chunk);
      }

      payload = JSON.parse(
        Buffer.concat(chunks).toString('utf8') || '{}'
      );
    }

    const { message, context = {} } = payload;

    if (
      !message ||
      typeof message !== 'string' ||
      !message.trim()
    ) {
      return sendJson(res, 400, {
        error: 'Message cannot be empty.',
      });
    }

    if (message.length > 1000) {
      return sendJson(res, 400, {
        error: 'Message exceeds 1000 character limit.',
      });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      return sendJson(res, 200, {
        isLiveAI: false,
        mode: 'rule-based',
        notice: 'No server-side Gemini API key configured.',
      });
    }

    const systemInstruction = `You are Anviti's AI Sustainability Assistant.
Help users understand and reduce their carbon footprint.

Verified emission standards:
- Petrol car: 0.192 kg CO2e/km
- Diesel car: 0.171 kg CO2e/km
- EV: 0.053 kg CO2e/km
- Bus: 0.105 kg CO2e/km
- Train/Metro: 0.041 kg CO2e/km
- Bike/Walk: 0.0
- Electricity: 0.71 kg CO2e/kWh
- Meat-heavy meal: 2.5 kg CO2e
- Mixed meal: 1.7 kg CO2e
- Vegetarian meal: 1.0 kg CO2e
- Vegan meal: 0.7 kg CO2e

Weekly benchmark guideline: 80 kg CO2e/week.

Never invent statistics. Be concise, friendly and practical.
Encourage achievable small habits.

User Context:
${JSON.stringify(context, null, 2)}`;

    const geminiEndpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

    const geminiRes = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [
          {
            parts: [{ text: message }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 600,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      console.error('Gemini API error:', geminiRes.status, errorText);

      return sendJson(res, 502, {
        isLiveAI: false,
        mode: 'rule-based',
        error: 'AI provider temporarily unavailable.',
      });
    }

    const data = await geminiRes.json();
    const candidateText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return sendJson(res, 200, {
        isLiveAI: false,
        mode: 'rule-based',
        notice: 'AI response unavailable. Using fallback.',
      });
    }

    return sendJson(res, 200, {
      isLiveAI: true,
      mode: 'live-ai',
      provider: 'Gemini',
      text: candidateText,
    });

  } catch (err) {
    console.error('Assistant server error:', err);

    return sendJson(res, 500, {
      isLiveAI: false,
      mode: 'rule-based',
      error: 'Server error communicating with AI provider.',
    });
  }
}
