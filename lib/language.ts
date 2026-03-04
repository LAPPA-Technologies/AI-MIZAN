export type SupportedLanguage = "fr" | "en" | "ar" | "darija";

const ENGLISH_KEYWORDS = /(\b(the|is|are|can|rent|tenant|law|marriage|divorce|custody|inherit)\b)/i;
const DARIJA_KEYWORDS = /(kif|wach|chno|fin|bghit|ntla9|mrati|drari|7dana|tlaq|zwaj|nafaqa)/i;
const FRENCH_KEYWORDS = /(\b(le|la|les|du|des|et|ou|pour|avec|sans|article|contrat|loi|droit)\b)/i;

/**
 * Lightweight language detector shared across client & server.
 * Prefers explicit script/keyword hints while remaining deterministic.
 */
export const detectLanguage = (text: string): SupportedLanguage => {
  const value = text || "";
  if (/\p{Script=Arabic}/u.test(value)) {
    return "ar";
  }
  if (DARIJA_KEYWORDS.test(value)) {
    return "darija";
  }
  if (ENGLISH_KEYWORDS.test(value)) {
    return "en";
  }
  if (FRENCH_KEYWORDS.test(value)) {
    return "fr";
  }
  return "fr";
};

export const isRtlLanguage = (language: SupportedLanguage) => language === "ar" || language === "darija";
