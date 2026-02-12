// lib/search.ts
import { prisma } from "./prisma";

export type RetrievedArticle = {
  id: string;
  code: string;
  chapter: string;
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

/**
 * Keyword fallback: searches text for terms in the question (not the entire question as one string).
 * Also returns a "score" so downstream grounded logic doesn't incorrectly become false.
 */
export const keywordFallback = async (question: string, limit = 4) => {
  const cleaned = question.trim();
  if (!cleaned) return [] as RetrievedArticle[];

  // Tokenize into useful terms (avoid tiny/common words)
  const tokens = cleaned
    .toLowerCase()
    .split(/[^a-z0-9\u0600-\u06FF]+/i)
    .filter(Boolean)
    .filter((t) => t.length >= 3)
    .slice(0, 8);

  // If tokenization yields nothing (e.g., "??"), fallback to original contains
  const where =
    tokens.length > 0
      ? {
          OR: tokens.map((t) => ({
            text: { contains: t, mode: "insensitive" as const }
          }))
        }
      : {
          text: { contains: cleaned, mode: "insensitive" as const }
        };

  const results = await prisma.lawArticle.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: limit
  });

  return results.map((article) => ({
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