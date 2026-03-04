// lib/fastRouter.ts
// Fast routing for obvious cases that don't need LLM

export type FastRouteResult = "SMALLTALK" | "UNSAFE" | "NON_LEGAL" | null; // null means proceed to LLM

/** Build a word-boundary-safe regex for a pattern. */
const wordRegex = (pattern: string): RegExp => {
  // For Arabic/non-Latin patterns, use start/end or surrounding whitespace
  const hasArabic = /[\u0600-\u06FF]/.test(pattern);
  if (hasArabic) {
    // Arabic word boundaries: start-of-string or whitespace
    return new RegExp(`(?:^|\\s)${pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\s|$)`, "i");
  }
  // Latin: use \b word boundaries
  return new RegExp(`\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
};

const SMALLTALK_PATTERNS = [
  // English
  "hi", "hello", "hey", "good morning", "good afternoon", "good evening", "thanks", "thank you", "bye", "goodbye",
  // French
  "bonjour", "salut", "merci", "au revoir", "bonsoir",
  // Arabic
  "مرحبا", "السلام عليكم", "شكرا", "مع السلامة", "صباح الخير", "مساء الخير"
].map(wordRegex);

const UNSAFE_PATTERNS = [
  // English
  "forge", "forgery", "fake id", "fake passport", "how to forge", "evade", "evading",
  "avoid taxes", "tax evasion", "hide assets", "how to hide", "commit fraud",
  // French
  "falsification", "contrefaçon", "falsifier", "fabriquer un faux", "évasion fiscale",
  "comment contourner la loi",
  // Arabic
  "تزوير", "تزوير الهوية", "تهرب ضريبي", "كيف أهرب", "تزوير السجلات", "تزوير مستند"
].map(wordRegex);

const OBVIOUSLY_NON_LEGAL_PATTERNS = [
  // English
  "weather", "temperature", "forecast", "recipe", "cook", "food", "sport", "football", "basketball", "music", "movie", "film",
  // French
  "météo", "recette", "cuisine", "football", "musique",
  // Arabic
  "طقس", "طبخ", "رياضة", "كرة قدم", "موسيقى", "فيلم"
].map(wordRegex);

const normalize = (s: string) => s.toLowerCase().trim();

export const fastRoute = (question: string): FastRouteResult => {
  const text = normalize(question);

  // Very short inputs (≤ 3 words) that match smalltalk exactly
  const wordCount = text.split(/\s+/).length;

  // Check smalltalk — only flag on short messages to avoid false positives
  if (wordCount <= 4) {
    for (const pattern of SMALLTALK_PATTERNS) {
      if (pattern.test(text)) return "SMALLTALK";
    }
  }

  // Check unsafe
  for (const pattern of UNSAFE_PATTERNS) {
    if (pattern.test(text)) return "UNSAFE";
  }

  // Check obviously non-legal (only on messages without legal keywords)
  const hasLegalHint = /law|legal|droit|loi|قانون|مدونة|article|مادة|tribunal|محكمة|divorce|طلاق|custody|حضانة|marriage|زواج|inherit|إرث|pension|نفقة/i.test(text);
  if (!hasLegalHint) {
    for (const pattern of OBVIOUSLY_NON_LEGAL_PATTERNS) {
      if (pattern.test(text)) return "NON_LEGAL";
    }
  }

  // Proceed to LLM classification
  return null;
};