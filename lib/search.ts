// lib/search.ts
import { prisma } from "./prisma";
import { generateDeepSeekResponse } from "./deepseek";

export type RetrievedArticle = {
  id: string;
  code: string;
  chapter: string | null;
  articleNumber: string;
  language: string;
  text: string;
  source: string;
  effectiveDate: Date | null;
  updatedAt: Date;
  score?: number;
};

const cosineSimilarity = (a: number[], b: number[]) => {
  if (a.length !== b.length || a.length === 0) {
    return 0;
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

// Caching for query expansions
const EXPANSION_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

interface ExpansionCacheEntry {
  expansions: string[];
  timestamp: number;
}

const expansionCache = new Map<string, ExpansionCacheEntry>();

const getExpansionCacheKey = (question: string, lang: string) => `expansion:${lang}:${question.toLowerCase().trim()}`;

const isExpansionExpired = (entry: ExpansionCacheEntry) => Date.now() - entry.timestamp > EXPANSION_CACHE_TTL;

export const generateQueryExpansions = async (question: string, lang: string): Promise<string[]> => {
  const key = getExpansionCacheKey(question, lang);

  // Check cache
  const cached = expansionCache.get(key);
  if (cached && !isExpansionExpired(cached)) {
    return cached.expansions;
  }

  // LLM call for expansions
  const prompt = `
Generate 5-10 search query variations for this legal question in Moroccan family law context.
Include synonyms and related terms in Arabic, French, and English where appropriate.

Question: "${question}"
Language: ${lang}

Respond with a JSON array of strings, e.g.: ["query1", "query2", ...]

Only respond with the JSON array, no other text.
  `;

  try {
    const response = await generateDeepSeekResponse([
      { role: "system", content: prompt },
      { role: "user", content: question }
    ], "deepseek-chat");
    const expansions: string[] = JSON.parse(response);

    // Cache
    expansionCache.set(key, { expansions, timestamp: Date.now() });

    return expansions;
  } catch (error) {
    console.error("Expansion generation error:", error);
    // Fallback: return original question
    return [question];
  }
};

export const retrieveRelevantArticles = async (embedding: number[], limit = 5) => {
  if (!embedding.length) {
    return [] as RetrievedArticle[];
  }

  const stored = await prisma.lawEmbedding.findMany({
    include: { article: true }
  });

  const scored = stored
    .map((item) => ({
      score: cosineSimilarity(embedding, item.embedding),
      article: item.article
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ article, score }) => ({
      id: article.id,
      code: article.code,
      chapter: article.chapter,
      articleNumber: article.articleNumber,
      language: article.language,
      text: article.text,
      source: article.source,
      effectiveDate: article.effectiveDate,
      updatedAt: article.updatedAt,
      score
    }));

  return scored;
};

// Updated to use multiple embeddings from expanded queries
export const retrieveWithExpansions = async (baseEmbedding: number[], expansions: string[], embedFunction: (text: string) => Promise<number[]>, limit = 5) => {
  const allEmbeddings = [baseEmbedding];

  // Generate embeddings for expansions
  for (const exp of expansions.slice(0, 5)) { // Limit to 5 expansions
    try {
      const emb = await embedFunction(exp);
      allEmbeddings.push(emb);
    } catch (error) {
      console.error("Embedding expansion failed:", error);
    }
  }

  // Retrieve for each embedding and combine
  const allResults: RetrievedArticle[] = [];
  for (const emb of allEmbeddings) {
    const results = await retrieveRelevantArticles(emb, limit);
    allResults.push(...results);
  }

  // Dedupe and sort by score
  const seen = new Set<string>();
  const deduped = allResults
    .filter((a) => !seen.has(a.id) && seen.add(a.id))
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, limit);

  return deduped;
};

/**
 * Keyword fallback: searches text for terms in the question.
 * Enhanced with topic-specific keyword expansion for better retrieval.
 * Also returns a "score" so downstream grounded logic doesn't incorrectly become false.
 */
export const keywordFallback = async (queries: string[], limit = 4) => {
  // Build a combined list of keywords from all queries
  const allKeywords = new Set<string>();
  for (const query of queries) {
    const cleaned = query.trim();
    if (!cleaned) continue;
    
    // Tokenize into useful terms (avoid tiny/common words)
    const tokens = cleaned
      .toLowerCase()
      .split(/[^a-z0-9\u0600-\u06FF]+/i)
      .filter(Boolean)
      .filter((t) => t.length >= 3);
    
    tokens.forEach(t => allKeywords.add(t));
  }
  
  // Add related legal terms based on detected topic
  const keywordsText = Array.from(allKeywords).join(' ');
  
  // Divorce detection - add specific article-relevant terms
  if (/divorce|طلاق|تطليق|divorcer|répudiation|talaq/i.test(keywordsText)) {
    allKeywords.add('طلاق');
    allKeywords.add('تطليق');
    allKeywords.add('شقاق');
    allKeywords.add('الصلح');
    allKeywords.add('العدة');
  }
  
  // Custody detection
  if (/custody|حضانة|garde|hadana|enfant|child|أطفال|ولد/i.test(keywordsText)) {
    allKeywords.add('حضانة');
    allKeywords.add('garde');
    allKeywords.add('ولاية');
  }
  
  // Marriage detection
  if (/marriage|زواج|mariage|nikah|épouse|wife|husband|زوج/i.test(keywordsText)) {
    allKeywords.add('زواج');
    allKeywords.add('عقد');
    allKeywords.add('الصداق');
  }
  
  // Inheritance detection
  if (/inherit|إرث|héritage|ميراث|succession|تركة/i.test(keywordsText)) {
    allKeywords.add('إرث');
    allKeywords.add('تركة');
    allKeywords.add('ورثة');
  }

  // Penal/criminal detection
  if (/penal|criminal|جنائي|جريمة|عقوبة|pénal|infraction|crime|prison|سجن/i.test(keywordsText)) {
    allKeywords.add('عقوبة');
    allKeywords.add('جريمة');
    allKeywords.add('جنائي');
  }

  // Obligations/contracts detection
  if (/contract|obligation|عقد|التزام|contrat|commercial|تجاري|responsabilité|مسؤولية/i.test(keywordsText)) {
    allKeywords.add('التزام');
    allKeywords.add('عقد');
    allKeywords.add('تعويض');
  }
  
  const finalKeywords = Array.from(allKeywords).slice(0, 15);
  console.log(`[AI-Mizan] Keyword fallback searching for: ${finalKeywords.join(', ')}`);
  
  if (finalKeywords.length === 0) {
    return [];
  }
  
  const where = {
    OR: finalKeywords.map((t) => ({
      text: { contains: t, mode: "insensitive" as const }
    })),
  };

  const results = await prisma.lawArticle.findMany({
    where,
    orderBy: { articleNumber: "asc" },
    take: limit * 3 // Get more, then dedupe
  });

  // Dedupe by articleNumber (same article in different languages)
  const seen = new Set<string>();
  const deduped = results.filter((a) => {
    const key = a.articleNumber;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, limit);

  return deduped.map((article) => ({
    id: article.id,
    code: article.code,
    chapter: article.chapter,
    articleNumber: article.articleNumber,
    language: article.language,
    text: article.text,
    source: article.source,
    effectiveDate: article.effectiveDate,
    updatedAt: article.updatedAt,
    // mark as "confident enough" for keyword matches
    score: 1
  }));
};