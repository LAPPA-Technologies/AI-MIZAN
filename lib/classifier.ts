// lib/classifier.ts
// LLM-based classification with caching and conversation-history support

import { generateDeepSeekResponse } from "./deepseek";

export type ClassificationResult = {
  isLegal: boolean;
  intent?: string; // e.g., "custody", "divorce"
  confidence: number;
};

export type HistoryMessage = { role: "user" | "assistant"; content: string };

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in ms

interface CacheEntry {
  result: ClassificationResult;
  timestamp: number;
}

const classificationCache = new Map<string, CacheEntry>();

const getCacheKey = (question: string, lang: string, historyLen: number) =>
  `${lang}:${historyLen}:${question.toLowerCase().trim()}`;

const isExpired = (entry: CacheEntry) => Date.now() - entry.timestamp > CACHE_TTL;

/**
 * Classify a question, taking optional conversation history into account.
 * When history is provided, short follow-up answers (e.g. "3", "yes", "Casablanca")
 * are understood in context rather than being flagged as non-legal.
 */
export const classifyQuestion = async (
  question: string,
  lang: string,
  history: HistoryMessage[] = [],
): Promise<ClassificationResult> => {
  const key = getCacheKey(question, lang, history.length);

  // Check cache (only when there's no conversation context — follow-ups are unique)
  if (history.length === 0) {
    const cached = classificationCache.get(key);
    if (cached && !isExpired(cached)) {
      return cached.result;
    }
  }

  // Build conversation excerpt for context
  const historyExcerpt = history.length
    ? "\nRecent conversation (for context):\n" +
      history
        .slice(-6)
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content.slice(0, 300)}`)
        .join("\n") +
      "\n"
    : "";

  const prompt = `You are a legal question classifier for Moroccan law (all codes: family, penal, obligations, civil procedure).
Analyze the user's NEW message and determine if it relates to Moroccan law.
${history.length ? "IMPORTANT: The user may be answering a follow-up question from a legal conversation. Short replies like numbers, names, cities, or 'yes'/'no' ARE legal if the prior conversation was about law." : ""}
${historyExcerpt}
New message: "${question}"
Language: ${lang}

Respond with JSON only:
{
  "isLegal": true/false,
  "intent": "brief topic like 'custody', 'divorce', 'marriage', 'penal', 'contract', 'follow-up' or null",
  "confidence": 0.0 to 1.0
}`;

  try {
    const response = await generateDeepSeekResponse([
      { role: "system", content: prompt },
      { role: "user", content: question }
    ], "deepseek-chat");
    const result: ClassificationResult = JSON.parse(response);

    // Cache only standalone questions (not follow-ups)
    if (history.length === 0) {
      classificationCache.set(key, { result, timestamp: Date.now() });
    }

    return result;
  } catch (error) {
    console.error("Classification error:", error);
    // If there's conversation history, assume this is a legal follow-up
    if (history.length > 0) {
      return { isLegal: true, intent: "follow-up", confidence: 0.7 };
    }
    return { isLegal: false, confidence: 0.5 };
  }
};