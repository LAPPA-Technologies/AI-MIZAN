// lib/search.ts
import { prisma } from "./prisma";

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

// ── Cosine similarity ────────────────────────────────────────────────────────

const cosineSimilarity = (a: number[], b: number[]): number => {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

// ── Topic keyword expansion (zero API calls) ─────────────────────────────────

/**
 * Returns extra search terms derived from detected legal topic in the question.
 * Used to augment both embedding search queries and keyword fallback.
 */
export const getTopicKeywords = (question: string): string[] => {
  const q = question.toLowerCase();
  const extra = new Set<string>();

  if (/divorce|طلاق|تطليق|divorcer|répudiation|talaq|séparation|انفصال/i.test(q))
    ["طلاق","تطليق","شقاق","العدة","فراق","divorce","talaq"].forEach(t => extra.add(t));

  if (/custody|حضانة|garde|hadana|enfant|أطفال|ولد|حاضن/i.test(q))
    ["حضانة","ولاية","garde","droit de visite","نفقة"].forEach(t => extra.add(t));

  if (/marriage|زواج|mariage|nikah|épouse|wife|husband|زوج|عقد الزواج|صداق/i.test(q))
    ["زواج","عقد","صداق","مهر","شروط الزواج"].forEach(t => extra.add(t));

  if (/inherit|إرث|héritage|ميراث|succession|تركة|وارث|فريضة/i.test(q))
    ["إرث","تركة","ورثة","فريضة","ميراث","وصية"].forEach(t => extra.add(t));

  if (/travail|labor|labour|عمل|شغل|salarié|employer|طرد|فصل|رواتب|تعويض|congé|إجازة/i.test(q))
    ["عمل","عقد الشغل","فصل","تعويض","أجر","contrat de travail"].forEach(t => extra.add(t));

  if (/penal|criminal|جنائي|جريمة|عقوبة|pénal|infraction|crime|prison|سجن|غرامة|مخالفة/i.test(q))
    ["عقوبة","جريمة","جنحة","جناية","غرامة","infraction"].forEach(t => extra.add(t));

  if (/contract|obligation|عقد|التزام|contrat|responsabilité|مسؤولية|تعويض|ضمان/i.test(q))
    ["التزام","عقد","تعويض","مسؤولية","contrat","obligation"].forEach(t => extra.add(t));

  if (/propriété|عقار|immobilier|سكن|بيع|شراء|تجزئة|محافظة عقارية/i.test(q))
    ["عقار","ملكية","بيع","رسوم التسجيل","immatriculation"].forEach(t => extra.add(t));

  if (/tribunal|محكمة|استئناف|appel|recours|طعن|مسطرة|procédure|jugement|حكم/i.test(q))
    ["مسطرة","محكمة","حكم","استئناف","تنفيذ","procédure civile"].forEach(t => extra.add(t));

  if (/نفقة|pension|alimony|entretien|nafaqa|مصاريف/i.test(q))
    ["نفقة","مصاريف","pension alimentaire"].forEach(t => extra.add(t));

  return [...extra];
};

// ── Vector search ────────────────────────────────────────────────────────────

/**
 * Retrieve articles by cosine similarity against stored embeddings.
 * Loads all embeddings from the DB — fast enough for ~5k–10k articles at 256 dim.
 */
export const retrieveRelevantArticles = async (
  embedding: number[],
  limit = 8,
): Promise<RetrievedArticle[]> => {
  if (!embedding.length) return [];

  const stored = await prisma.lawEmbedding.findMany({
    include: { article: true },
  });

  return stored
    .map((item) => ({
      score: cosineSimilarity(embedding, item.embedding),
      article: item.article,
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ article, score }) => ({
      id:            article.id,
      code:          article.code,
      chapter:       article.chapter,
      articleNumber: article.articleNumber,
      language:      article.language,
      text:          article.text,
      source:        article.source,
      effectiveDate: article.effectiveDate,
      updatedAt:     article.updatedAt,
      score,
    }));
};

// ── Keyword fallback ─────────────────────────────────────────────────────────

/**
 * Full-text keyword fallback for when vector search finds nothing.
 * Accepts multiple query strings (question + topic keywords) and merges results.
 * Always assigns score = 1 so downstream "grounded" logic stays correct.
 */
export const keywordFallback = async (
  queries: string[],
  limit = 8,
): Promise<RetrievedArticle[]> => {
  const allKeywords = new Set<string>();

  for (const query of queries) {
    const tokens = query
      .trim()
      .toLowerCase()
      .split(/[^a-z0-9\u0600-\u06FF]+/i)
      .filter((t) => t.length >= 3);
    tokens.forEach((t) => allKeywords.add(t));
  }

  if (allKeywords.size === 0) return [];

  const terms = [...allKeywords].slice(0, 15);

  const results = await prisma.lawArticle.findMany({
    where: {
      OR: terms.map((t) => ({
        text: { contains: t, mode: "insensitive" as const },
      })),
    },
    orderBy: { articleNumber: "asc" },
    take: limit * 3,
  });

  // Dedupe by article ID, then trim to limit
  const seen = new Set<string>();
  return results
    .filter((a) => !seen.has(a.id) && seen.add(a.id))
    .slice(0, limit)
    .map((article) => ({
      id:            article.id,
      code:          article.code,
      chapter:       article.chapter,
      articleNumber: article.articleNumber,
      language:      article.language,
      text:          article.text,
      source:        article.source,
      effectiveDate: article.effectiveDate,
      updatedAt:     article.updatedAt,
      score:         1,
    }));
};