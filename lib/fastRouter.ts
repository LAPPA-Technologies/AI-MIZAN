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
  // English — only unambiguous non-legal topics
  "weather", "temperature", "forecast", "recipe", "cooking", "sport", "football", "basketball", "music", "movie", "film", "joke",
  "celebrity", "actor", "singer", "tv show", "video game",
  // French
  "météo", "recette de cuisine", "football", "musique",
  // Arabic
  "طقس", "طبخ", "وصفة", "موسيقى", "فيلم", "مسلسل"
].map(wordRegex);

/**
 * Comprehensive Moroccan legal keyword list.
 * If ANY of these appear, we proceed to retrieval (never block as non-legal).
 */
const LEGAL_HINT_REGEX = new RegExp(
  [
    // General law
    "law", "legal", "droit", "loi", "قانون", "مدونة", "article", "مادة", "tribunal", "محكمة",
    "procédure", "مسطرة", "jugement", "حكم", "avocat", "محامي", "notaire", "عدل",
    // Family law / Moudawana
    "divorce", "طلاق", "تطليق", "mariage", "زواج", "custody", "حضانة", "garde",
    "inheritance", "inherit", "إرث", "ميراث", "تركة", "وصية",
    "pension", "نفقة", "alimony", "mahr", "صداق", "مهر", "polygam", "تعدد",
    "répudiation", "khul", "خلع", "filiation", "نسب",
    // Labor
    "travail", "شغل", "عمل", "licenciem", "فصل", "سراح", "indemnité", "تعويض",
    "salaire", "راتب", "أجر", "contrat de travail", "retraite", "تقاعد",
    "congé", "إجازة", "CNSS", "AMO", "grève", "إضراب",
    // Penal
    "pénal", "criminal", "جنائي", "جريمة", "crime", "infraction", "مخالفة",
    "prison", "سجن", "amende", "غرامة", "peine", "عقوبة",
    // Property / real estate
    "propriété", "ملكية", "عقار", "immobil", "loyer", "إيجار", "bail", "expulsion", "طرد",
    "copropriété", "hypothèque", "رهن",
    // Contracts / obligations
    "contrat", "عقد", "obligation", "التزام", "responsabilité", "مسؤولية",
    "résiliation", "faillite", "إفلاس", "dette", "دين",
    // Civil procedure
    "appel", "استئناف", "recours", "طعن", "cassation", "نقض", "exécution", "تنفيذ",
    // Commerce
    "commercial", "تجاري", "société", "شركة", "brevet", "marque",
    // Misc Moroccan legal
    "Moudawana", "مدونة الأسرة", "dahir", "ظهير", "bulletin officiel", "الجريدة الرسمية",
    "code pénal", "قانون العقوبات", "DOC", "قانون الالتزامات",
    // Common Moroccan questions
    "droit", "حق", "حقوق", "droits", "obligation", "واجب", "شروط", "conditions",
    "procédure", "إجراء", "délai", "أجل", "délais",
  ]
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|"),
  "i"
);

const normalize = (s: string) => s.toLowerCase().trim();

export const fastRoute = (question: string): FastRouteResult => {
  const text = normalize(question);
  const wordCount = text.split(/\s+/).length;

  // Smalltalk — only short messages
  if (wordCount <= 4) {
    for (const pattern of SMALLTALK_PATTERNS) {
      if (pattern.test(text)) return "SMALLTALK";
    }
  }

  // Unsafe — always block
  for (const pattern of UNSAFE_PATTERNS) {
    if (pattern.test(text)) return "UNSAFE";
  }

  // If legal keywords detected → proceed to retrieval regardless
  if (LEGAL_HINT_REGEX.test(text)) return null;

  // Only flag NON_LEGAL if explicitly off-topic and no legal keywords
  for (const pattern of OBVIOUSLY_NON_LEGAL_PATTERNS) {
    if (pattern.test(text)) return "NON_LEGAL";
  }

  // For anything unclear → let retrieval decide
  return null;
};