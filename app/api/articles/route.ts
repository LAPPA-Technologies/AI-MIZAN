import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

const FALLBACK_LANG_ORDER = ["fr", "ar", "en"] as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const incoming = Array.isArray(body?.citations) ? body.citations : [];
    if (!incoming.length) {
      return NextResponse.json({ articles: [] });
    }

    const preferredLanguage = typeof body?.language === "string" ? body.language : undefined;
    const priority = Array.from(
      new Set([
        preferredLanguage?.toLowerCase(),
        ...FALLBACK_LANG_ORDER
      ].filter(Boolean))
    ) as string[];

    type NormalizedCitation = { code: string; articleNumber: string };

    const normalized: NormalizedCitation[] = [];
    for (const raw of incoming as Array<Record<string, unknown>>) {
      const code = typeof raw?.code === "string" ? raw.code.toLowerCase().trim() : "";
      const articleNumber =
        typeof raw?.articleNumber === "string" || typeof raw?.articleNumber === "number"
          ? String(raw.articleNumber).trim()
          : "";

      if (code && articleNumber) {
        normalized.push({ code, articleNumber });
      }
    }

    if (!normalized.length) {
      return NextResponse.json({ articles: [] });
    }

    const unique = new Map<string, NormalizedCitation>();
    normalized.forEach((item) => {
      unique.set(`${item.code}|${item.articleNumber}`, item);
    });

    const results = await Promise.all(
      Array.from(unique.values()).map(async ({ code, articleNumber }) => {
        const articles = await prisma.lawArticle.findMany({
          where: {
            code,
            articleNumber,
            language: { in: priority }
          }
        });

        if (!articles.length) {
          return {
            code,
            articleNumber,
            language: null,
            text: null,
            source: null,
            effectiveDate: null,
            metadata: {}
          };
        }

        const chosen = priority
          .map((lang) => articles.find((article) => article.language === lang))
          .find((article): article is (typeof articles)[number] => Boolean(article)) || articles[0];

        const metadata: Record<string, string> = {};
        const maybeFields: Array<keyof typeof chosen> = ["book", "title", "chapter", "section"];
        for (const field of maybeFields) {
          const value = (chosen as any)[field];
          if (typeof value === "string" && value.trim()) {
            metadata[field] = value.trim();
          }
        }

        return {
          code,
          articleNumber,
          language: chosen.language,
          text: chosen.text,
          source: chosen.source ?? null,
          effectiveDate: chosen.effectiveDate ?? null,
          metadata
        };
      })
    );

    return NextResponse.json({ articles: results }, { status: 200 });
  } catch (error) {
    console.error("[api/articles] Failed to load article texts", error);
    return NextResponse.json({ error: "Failed to load article texts" }, { status: 500 });
  }
}
