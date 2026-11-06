/* ==============================================================================
   Anviti — Server-Side AI Assistant Middleware
   Handles secure upstream AI model requests, enforces rate-limiting,
   input validation, and ensures zero secrets are exposed to the client.
   ============================================================================== */

// In-memory rate limiting cache (IP -> { count, resetTime })
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

function checkRateLimit(clientIp) {
  const now = Date.now();
  const entry = rateLimitMap.get(clientIp);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  entry.count += 1;
  return true;
}

/**
 * Handle incoming POST requests to /api/assistant/chat
 */
export async function handleAssistantChatRequest(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed. Use POST.' }));
    return;
  }

  const clientIp = req.socket?.remoteAddress || '127.0.0.1';
  if (!checkRateLimit(clientIp)) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Too many requests. Please wait a moment before asking again.' }));
    return;
  }

  // Parse incoming request body
  let rawBody = '';
  req.on('data', (chunk) => {
    rawBody += chunk;
    if (rawBody.length > 50 * 1024) {
      // 50KB limit protection
      req.destroy();
    }
  });

  req.on('end', async () => {
    try {
      const payload = JSON.parse(rawBody || '{}');
      const { message, context = {} } = payload;

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Message cannot be empty.' }));
        return;
      }

      if (message.length > 1000) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Message exceeds 1000 character limit.' }));
        return;
      }

      // Check for server-side API keys (NEVER VITE_ keys)
      const geminiApiKey = process.env.GEMINI_API_KEY;
      const openaiApiKey = process.env.OPENAI_API_KEY;

      // If no server-side AI provider is configured:
      if (!geminiApiKey && !openaiApiKey) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          isLiveAI: false,
          mode: 'rule-based',
          notice: 'No server-side AI API key configured (GEMINI_API_KEY or OPENAI_API_KEY in server environment). Using deterministic Anviti sustainability engine.',
        }));
        return;
      }

      // Prepare system grounding context
      const systemInstruction = `You are Anviti's AI Sustainability Assistant. You help users understand and reduce their carbon footprint using Anviti's verified emission standards:
- Transport: Petrol car (0.192 kg CO2e/km), Diesel car (0.171), EV (0.053), Bus (0.105), Train/Metro (0.041), Bike/Walk (0.0).
- Electricity: 0.71 kg CO2e per kWh (Indian national grid average).
- Food: Meat-heavy (2.5 kg CO2e/meal), Mixed (1.7), Vegetarian (1.0), Vegan (0.7).
- Guidelines: Weekly benchmark guideline is 80 kg CO2e/week (UNEP 1.5°C milestone).
Never invent statistics. Be concise, friendly, practical, and encourage achievable small habits.
User Context Summary:
${JSON.stringify(context, null, 2)}`;

      // Call Google Gemini if GEMINI_API_KEY is present
      if (geminiApiKey) {
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

        const geminiRes = await fetch(geminiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: [{ parts: [{ text: message }] }],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 600,
            },
          }),
        });

        if (!geminiRes.ok) {
          const errText = await geminiRes.text();
          console.warn('Gemini upstream error:', geminiRes.status, errText);
          throw new Error(`Upstream AI provider error (${geminiRes.status})`);
        }

        const data = await geminiRes.json();
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (candidateText) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            isLiveAI: true,
            mode: 'live-ai',
            provider: 'Gemini 1.5 Flash',
            text: candidateText,
          }));
          return;
        }
      }

      // Fallback
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        isLiveAI: false,
        mode: 'rule-based',
        notice: 'AI provider did not return text. Falling back to rule-based engine.',
      }));
    } catch (err) {
      console.error('Assistant server error:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        isLiveAI: false,
        mode: 'rule-based',
        error: err.message || 'Server error communicating with AI provider.',
      }));
    }
  });
}
