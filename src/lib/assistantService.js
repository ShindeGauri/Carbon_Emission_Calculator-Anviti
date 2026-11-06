/* ==============================================================================
   Anviti — Assistant Client Service
   Coordinates chat requests between server-side AI endpoint and the local
   grounded rule-based engine, ensuring safety, privacy, and full transparency.
   ============================================================================== */

import { processAssistantQuery } from './assistantEngine';

/**
 * Send user query to assistant.
 *
 * @param {string} userMessage
 * @param {Object} context - Safe authorized summary of user environmental data
 * @returns {Promise<Object>}
 */
export async function sendAssistantMessage(userMessage, context = {}) {
  const sanitized = (userMessage || '').trim();
  if (!sanitized) {
    return {
      text: "Please enter a question or choose one of the suggested topics below.",
      actions: [],
      isLiveAI: false,
      mode: 'rule-based',
    };
  }

  // 1. Try secure server-side endpoint first
  try {
    const res = await fetch('/api/assistant/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: sanitized,
        context: {
          isAuthenticated: Boolean(context.isAuthenticated),
          userEmail: context.userEmail ? context.userEmail.split('@')[0] : null,
          total_co2e: context.latestRecord?.total_co2e ?? null,
          highest_category: context.latestRecord?.highest_category ?? null,
          breakdown: context.latestRecord?.breakdown ?? null,
          historicalCount: context.historicalCount ?? 0,
        },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.isLiveAI && data.text) {
        // Derive appropriate contextual actions based on message
        const engineResult = processAssistantQuery(sanitized, context);
        return {
          text: data.text,
          actions: engineResult.actions || [],
          suggestedGoal: engineResult.suggestedGoal || null,
          isLiveAI: true,
          mode: 'live-ai',
          provider: data.provider || 'AI Model',
        };
      }
    }
  } catch (err) {
    // Server endpoint not reachable (e.g. static environment or offline)
    console.warn('Server AI endpoint offline, using Anviti rule-based assistant:', err);
  }

  // 2. Deterministic Anviti Grounded Sustainability Engine
  // 100% accurate, private, and grounded in Anviti's emission factors & user records
  const result = processAssistantQuery(sanitized, context);
  return {
    ...result,
    isLiveAI: false,
    mode: 'rule-based',
  };
}
