/**
 * seed.ts — Production-grade database seeder for AI-Mizan
 *
 * Reads every JSON produced by extract_law.py under data/laws/<code>/<lang>/
 * and upserts articles + local embeddings into the database.
 *
 * Usage:
 *   npx prisma db seed          (configured in package.json)
 *   npx tsx prisma/seed.ts      (direct)
 *
 * Env flags:
 *   SEED_SKIP_EMBEDDINGS=1      skip embedding generation (faster for testing)
 *   SEED_BATCH_SIZE=200         upsert batch size (default 200)
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Configuration ──────────────────────────────────────────────────────────

const LAWS_DIR = path.join(process.cwd(), "data", "laws");
const BATCH_SIZE = parseInt(process.env.SEED_BATCH_SIZE ?? "200", 10);
const SKIP_EMBEDDINGS = process.env.SEED_SKIP_EMBEDDINGS === "1";

// ─── Types — mirrors extract_law.py JSON output ─────────────────────────────

/** Top-level document envelope written by extract_law.py */
interface ExtractedDocument {
  doc_id: number;
  code: string;
  language: "ar" | "fr";
  source: string;
  effective_date: string;
  version: string;
  pdf_file: string;
  extracted_at: string;
  total_articles: number;
  articles: ExtractedArticle[];
}

/** Single article inside the document */
interface ExtractedArticle {
  article_number: number | string;
  content: string;
  hierarchy: {
    book?: string;
    part?: string;
    title?: string;
    chapter?: string;
    section?: string;
  };
}

// ─── Book-order extraction ──────────────────────────────────────────────────

const ARABIC_ORDINALS: Record<string, number> = {
  الأول: 1, الثاني: 2, الثالث: 3, الرابع: 4, الخامس: 5,
  السادس: 6, السابع: 7, الثامن: 8, التاسع: 9, العاشر: 10,
};

const FRENCH_ORDINALS: Record<string, number> = {
  PREMIER: 1, DEUXIEME: 2, DEUXIÈME: 2, TROISIEME: 3, TROISIÈME: 3,
  QUATRIEME: 4, QUATRIÈME: 4, CINQUIEME: 5, CINQUIÈME: 5,
  SIXIEME: 6, SIXIÈME: 6, SEPTIEME: 7, SEPTIÈME: 7,
  HUITIEME: 8, HUITIÈME: 8, NEUVIEME: 9, NEUVIÈME: 9,
  DIXIEME: 10, DIXIÈME: 10,
};

function getBookOrder(book: string | null | undefined): number | null {
  if (!book) return null;
  for (const [word, num] of Object.entries(ARABIC_ORDINALS)) {
    if (book.includes(word)) return num;
  }
  const upper = book.toUpperCase();
  for (const [word, num] of Object.entries(FRENCH_ORDINALS)) {
    if (upper.includes(word)) return num;
  }
  const m = book.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

// ─── Local embeddings (deterministic, no API key required) ──────────────────

const EMBED_DIM = Math.max(
  32,
  parseInt(process.env.LOCAL_EMBEDDINGS_DIM ?? "256", 10),
);

function hashToken(token: string): number {
  let h = 2166136261;
  for (let i = 0; i < token.length; i++) {
    h ^= token.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return Math.abs(h);
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^A-Za-z0-9\u0600-\u06FF]+/)
    .filter(Boolean);
}

function createLocalEmbedding(text: string): number[] {
  const vec = new Float64Array(EMBED_DIM);
  for (const tok of tokenize(text)) vec[hashToken(tok) % EMBED_DIM] += 1;
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
  return norm ? Array.from(vec, (v) => v / norm) : Array.from(vec);
}

// ─── File discovery ─────────────────────────────────────────────────────────

function discoverJsonFiles(): string[] {
  const files: string[] = [];
  if (!fs.existsSync(LAWS_DIR)) {
    console.error(`  ✗ Laws directory not found: ${LAWS_DIR}`);
    return files;
  }
  for (const codeDir of fs.readdirSync(LAWS_DIR, { withFileTypes: true })) {
    if (!codeDir.isDirectory()) continue;
    const codePath = path.join(LAWS_DIR, codeDir.name);
    for (const langDir of fs.readdirSync(codePath, { withFileTypes: true })) {
      if (!langDir.isDirectory()) continue;
      const langPath = path.join(codePath, langDir.name);
      const allFiles = fs.readdirSync(langPath).filter((f) => f.endsWith(".json"));

      // Prefer language-suffixed files (*_ar.json, *_fr.json) over plain *.json duplicates.
      // Both sets contain the same code+language; the suffixed files are the curated versions.
      const langSuffix = `_${langDir.name}.json`;
      const hasSuffixed = allFiles.some((f) => f.endsWith(langSuffix));

      for (const file of allFiles) {
        if (hasSuffixed && !file.endsWith(langSuffix)) continue; // skip plain duplicate
        files.push(path.join(langPath, file));
      }
    }
  }
  return files.sort();
}

// ─── Parsing ────────────────────────────────────────────────────────────────

function parseDocument(filePath: string): ExtractedDocument | null {
  const raw = fs.readFileSync(filePath, "utf-8");
  if (!raw.trim()) {
    console.warn(`  ⚠ Skipping empty file: ${path.basename(filePath)}`);
    return null;
  }
  try {
    return JSON.parse(raw) as ExtractedDocument;
  } catch (err) {
    console.error(`  ✗ Failed to parse ${path.basename(filePath)}:`, err);
    return null;
  }
}

// ─── Upsert helpers ─────────────────────────────────────────────────────────

function buildArticleRow(
  doc: ExtractedDocument,
  art: ExtractedArticle,
): Prisma.LawArticleCreateInput {
  const artNum = String(art.article_number);
  const version = Math.round(parseFloat(doc.version)) || 1;
  const h = art.hierarchy ?? {};
  return {
    code: doc.code,
    articleNumber: artNum,
    language: doc.language,
    text: art.content,
    source: doc.source,
    effectiveDate: doc.effective_date ? new Date(doc.effective_date) : null,
    version,
    book: h.book ?? null,
    bookOrder: getBookOrder(h.book),
    part: h.part ?? null,
    title: h.title ?? null,
    chapter: h.chapter ?? null,
    section: h.section ?? null,
  };
}

async function upsertBatch(
  rows: Prisma.LawArticleCreateInput[],
): Promise<string[]> {
  const ids: string[] = [];
  for (const row of rows) {
    const article = await prisma.lawArticle.upsert({
      where: {
        code_articleNumber_language_version: {
          code: row.code,
          articleNumber: row.articleNumber,
          language: row.language,
          version: row.version,
        },
      },
      update: {
        text: row.text,
        source: row.source,
        effectiveDate: row.effectiveDate,
        book: row.book,
        bookOrder: row.bookOrder,
        part: row.part,
        title: row.title,
        chapter: row.chapter,
        section: row.section,
      },
      create: row,
      select: { id: true },
    });
    ids.push(article.id);
  }
  return ids;
}

async function createEmbeddings(
  articleIds: string[],
  rows: Prisma.LawArticleCreateInput[],
): Promise<number> {
  let count = 0;
  for (let i = 0; i < articleIds.length; i++) {
    const row = rows[i];
    const embedding = createLocalEmbedding(
      `${row.code} ${row.chapter ?? ""} ${row.text}`,
    );
    await prisma.lawEmbedding.upsert({
      where: { articleId: articleIds[i] },
      update: { embedding },
      create: {
        id: crypto.randomUUID(),
        articleId: articleIds[i],
        embedding,
      },
    });
    count++;
  }
  return count;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║        AI-Mizan  ·  Database Seeder         ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  // 1. Discover JSON files
  const files = discoverJsonFiles();
  if (files.length === 0) {
    console.error("No JSON files found. Run extract_law.py --batch first.");
    process.exit(1);
  }
  console.log(`Found ${files.length} JSON files under data/laws/\n`);

  // 2. Parse all documents
  const documents: ExtractedDocument[] = [];
  for (const f of files) {
    const doc = parseDocument(f);
    if (doc && doc.articles.length > 0) documents.push(doc);
  }
  const totalArticles = documents.reduce((s, d) => s + d.articles.length, 0);
  console.log(
    `Parsed ${documents.length} documents · ${totalArticles.toLocaleString()} articles total\n`,
  );

  // 3. Upsert articles in batches
  let seeded = 0;
  let embeddingsCreated = 0;

  for (const doc of documents) {
    const label = `${doc.code}/${doc.language}`;
    const rows = doc.articles.map((a) => buildArticleRow(doc, a));
    const chunks = chunkArray(rows, BATCH_SIZE);
    let docSeeded = 0;

    for (const chunk of chunks) {
      const ids = await upsertBatch(chunk);
      docSeeded += ids.length;

      if (!SKIP_EMBEDDINGS) {
        embeddingsCreated += await createEmbeddings(ids, chunk);
      }
    }

    seeded += docSeeded;
    const embLabel = SKIP_EMBEDDINGS ? "" : ` · ${docSeeded} embeddings`;
    console.log(
      `  ✓ ${label.padEnd(32)} ${String(docSeeded).padStart(5)} articles${embLabel}`,
    );
  }

  console.log("\n──────────────────────────────────────────────");
  console.log(`  Total articles seeded:    ${seeded.toLocaleString()}`);
  if (!SKIP_EMBEDDINGS) {
    console.log(`  Total embeddings created: ${embeddingsCreated.toLocaleString()}`);
  }
  console.log("──────────────────────────────────────────────\n");
  console.log("✓ Seed complete.");
}

// ─── Utilities ──────────────────────────────────────────────────────────────

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ─── Entry point ────────────────────────────────────────────────────────────

main()
  .catch((err) => {
    console.error("\n✗ Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
