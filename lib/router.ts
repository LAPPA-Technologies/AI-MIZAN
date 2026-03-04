// lib/router.ts
import { fastRoute } from "./fastRouter";
import { classifyQuestion } from "./classifier";

export type RouteDecision = "LEGAL_MA" | "NON_LEGAL" | "NEEDS_CLARIFICATION" | "UNSAFE";

const DEFAULT_MIN_RELEVANCE = 0.78;

const normalize = (s: string) => (s || "").toLowerCase().trim();

// Keep unsafe phrases for backward compatibility, but fastRouter handles it
const UNSAFE_PHRASES = [
  "forge", "forgery", "fake id", "fake passport", "how to forge", "evade", "evading",
  "avoid taxes", "tax evasion", "hide assets", "how to hide", "commit fraud", "fraud",
  "falsification", "contrefaçon", "falsifier", "fabriquer un faux", "évasion fiscale", "fraude",
  "comment contourner la loi",
  "تزوير", "تزوير الهوية", "تهرب ضريبي", "كيف أهرب", "تزوير السجلات", "تزوير مستند"
];

const GENERIC_WORDS = new Set([
  "problem", "help", "issue", "question", "something", "need", "how", "what", "why", "please", "merci", "شكرا", "مشكلة", "مساعدة", "probleme", "aide"
]);

export const routeQuestion = async (
  message: string,
  retrievedCount: number,
  topScore?: number,
  lang: string = "ar"
): Promise<RouteDecision> => {
  const text = normalize(message);
  const minRel = Number.parseFloat(process.env.MIN_RELEVANCE || String(DEFAULT_MIN_RELEVANCE));

  // Stage 1: Fast routing
  const fastResult = fastRoute(message);
  if (fastResult === "SMALLTALK") return "NEEDS_CLARIFICATION"; // or handle smalltalk separately
  if (fastResult === "UNSAFE") return "UNSAFE";
  if (fastResult === "NON_LEGAL") return "NON_LEGAL";

  // Fallback unsafe check (for any missed)
  for (const phrase of UNSAFE_PHRASES) {
    if (!phrase) continue;
    if (text.includes(phrase)) return "UNSAFE";
  }

  // LEGAL if we already retrieved documents or score is high
  if (retrievedCount > 0) return "LEGAL_MA";
  if (typeof topScore === "number" && topScore >= minRel) return "LEGAL_MA";

  // Stage 2: LLM classification
  try {
    const classification = await classifyQuestion(message, lang);
    if (classification.isLegal && classification.confidence > 0.7) {
      return "LEGAL_MA";
    }
    if (classification.confidence < 0.5) {
      return "NEEDS_CLARIFICATION";
    }
    return "NON_LEGAL";
  } catch (error) {
    console.error("Classification failed:", error);
    // Fallback to old logic
    // Too vague: short or generic-only
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length < 8) {
      const allGeneric = words.every((w) => GENERIC_WORDS.has(w));
      if (allGeneric || words.length < 4) return "NEEDS_CLARIFICATION";
    }
    if (retrievedCount === 0) return "NON_LEGAL";
    return "NON_LEGAL";
  }
};

export default routeQuestion;
