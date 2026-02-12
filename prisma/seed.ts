// Simple language detection utility
const detectLanguage = (text: string): "ar" | "fr" | "en" => {
  if (/[\u0600-\u06FF]/.test(text)) return "ar";
  if (/\b(le|la|les|du|des|et|ou|pour|avec|sans|article|contrat|loi|droit)\b/i.test(text)) return "fr";
  return "en";
};
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedArticle = {
  code: string;
  chapter: string;
  article_number: string;
  language: "ar" | "fr";
  text: string;
  source: string;
  effective_date?: string;
  version: number;
};

const dataDir = path.join(process.cwd(), "data", "laws");

const loadSeedFiles = () => {
  if (!fs.existsSync(dataDir)) {
    return [] as SeedArticle[];
  }

  const files = fs
    .readdirSync(dataDir)
    .filter((file) => file.endsWith(".json"));

  const entries: SeedArticle[] = [];
  files.forEach((file) => {
    const raw = fs.readFileSync(path.join(dataDir, file), "utf8");
    const parsed = JSON.parse(raw) as SeedArticle[];
    entries.push(...parsed);
  });

  return entries;
};

// Local embedding fallback (same as in lib/embeddings.ts)
const DEFAULT_DIM = 256;
const normalizeVector = (vector: number[]) => {
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (!norm) return vector;
  return vector.map((value) => value / norm);
};
const hashToken = (token: string) => {
  let hash = 2166136261;
  for (let i = 0; i < token.length; i += 1) {
    hash ^= token.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash);
};
const tokenize = (text: string) => {
  return text
    .toLowerCase()
    .split(/[^A-Za-z0-9\u0600-\u06FF]+/)
    .filter(Boolean);
};
const createLocalEmbedding = (text: string) => {
  const dim = Math.max(
    32,
    Number.parseInt(process.env.LOCAL_EMBEDDINGS_DIM || "", 10) || DEFAULT_DIM
  );
  const vector = Array.from({ length: dim }, () => 0);
  const tokens = tokenize(text);
  tokens.forEach((token) => {
    const index = hashToken(token) % dim;
    vector[index] += 1;
  });
  return normalizeVector(vector);
};
const createEmbedding = async (text: string) => {
  const key = process.env.OPENAI_API_KEY;
  if (key) {
    try {
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: text
        })
      });
      if (response.ok) {
        const data = (await response.json()) as {
          data: Array<{ embedding: number[] }>;
        };
        return data.data[0]?.embedding ?? null;
      }
    } catch (e) {
      // fall through to local
    }
  }
  // Always fallback to local embedding
  return createLocalEmbedding(text);
};

const main = async () => {
  const entries = loadSeedFiles();

  for (const entry of entries) {
    const article = await prisma.lawArticle.upsert({
      where: {
        code_chapter_articleNumber_language_version: {
          code: entry.code,
          chapter: entry.chapter,
          articleNumber: entry.article_number,
          language: entry.language,
          version: entry.version
        }
      },
      update: {
        text: entry.text,
        source: entry.source,
        effectiveDate: entry.effective_date ? new Date(entry.effective_date) : null
      },
      create: {
        code: entry.code,
        chapter: entry.chapter,
        articleNumber: entry.article_number,
        language: entry.language,
        text: entry.text,
        source: entry.source,
        effectiveDate: entry.effective_date ? new Date(entry.effective_date) : null,
        version: entry.version
      }
    });

    const embedding = await createEmbedding(`${entry.code} ${entry.chapter} ${entry.text}`);
    if (embedding && Array.isArray(embedding) ? embedding.length > 0 : embedding) {
      await prisma.lawEmbedding.upsert({
        where: {
          articleId: article.id
        },
        update: {
          embedding
        },
        create: {
          id: crypto.randomUUID(),
          articleId: article.id,
          embedding
        }
      });
    }
  }
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
