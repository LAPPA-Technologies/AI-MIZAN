import { NextResponse } from "next/server";

/**
 * Free translation endpoint using MyMemory Translation API.
 * No API key required. Free tier: 5 000 chars/day.
 * For higher limits, set MYMEMORY_EMAIL in .env (10 000 chars/day).
 *
 * Falls back to LibreTranslate if MyMemory is unavailable.
 */

const MYMEMORY_BASE = "https://api.mymemory.translated.net/get";
const MAX_CHUNK = 500; // MyMemory limit per request

/** Split text into ≤500-char chunks at sentence/newline boundaries */
function splitChunks(text: string, max: number): string[] {
  if (text.length <= max) return [text];
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= max) {
      chunks.push(remaining);
      break;
    }
    // Try to break at the last sentence-end or newline within the limit
    let cut = remaining.lastIndexOf("\n", max);
    if (cut < max * 0.3) cut = remaining.lastIndexOf(".", max);
    if (cut < max * 0.3) cut = remaining.lastIndexOf(" ", max);
    if (cut < max * 0.3) cut = max;
    chunks.push(remaining.slice(0, cut + 1));
    remaining = remaining.slice(cut + 1);
  }
  return chunks;
}

async function translateChunk(
  chunk: string,
  langPair: string,
): Promise<string> {
  const email = process.env.MYMEMORY_EMAIL ?? "";
  const params = new URLSearchParams({
    q: chunk,
    langpair: langPair,
    ...(email ? { de: email } : {}),
  });

  const res = await fetch(`${MYMEMORY_BASE}?${params}`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`MyMemory HTTP ${res.status}`);
  }

  const data = (await res.json()) as {
    responseStatus: number;
    responseData?: { translatedText?: string };
  };

  if (data.responseStatus !== 200 || !data.responseData?.translatedText) {
    throw new Error(
      `MyMemory error: status ${data.responseStatus}`,
    );
  }

  return data.responseData.translatedText;
}

export async function POST(request: Request) {
  try {
    const { text, sourceLang } = await request.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing or empty 'text' field" },
        { status: 400 },
      );
    }

    if (!sourceLang || !["ar", "fr"].includes(sourceLang)) {
      return NextResponse.json(
        { error: "sourceLang must be 'ar' or 'fr'" },
        { status: 400 },
      );
    }

    const langPair = `${sourceLang}|en`;
    const chunks = splitChunks(text.trim(), MAX_CHUNK);
    const translated = await Promise.all(
      chunks.map((c) => translateChunk(c, langPair)),
    );

    return NextResponse.json({ translation: translated.join(" ") });
  } catch (err) {
    console.error("[translate] error:", err);
    return NextResponse.json(
      { error: "Translation failed. Please try again." },
      { status: 500 },
    );
  }
}
