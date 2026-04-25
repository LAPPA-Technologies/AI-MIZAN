// app/api/chat/route.ts
//
// Pipeline (max 2 API calls):
//   1. FastRouter (free, regex only) → instant reject for UNSAFE / NON_LEGAL / SMALLTALK
//   2. createEmbedding (1 API call OR free local hash)
//   3. Vector search + keyword fallback (local DB only)
//   4. streamDeepSeek answer (1 API call, real SSE streaming to client)
//
// Removed: LLM classifier (was call #1), LLM query expansion (was call #2 + 5 embedding calls)

import { headers } from "next/headers";
import { chatRequestSchema } from "../../../lib/validators";
import { createEmbedding } from "../../../lib/embeddings";
import { keywordFallback, getTopicKeywords, retrieveRelevantArticles } from "../../../lib/search";
import { streamDeepSeek, DeepSeekMessage } from "../../../lib/deepseek";
import { prisma } from "../../../lib/prisma";
import { checkRateLimit } from "../../../lib/rateLimit";
import { fastRoute } from "../../../lib/fastRouter";
import { detectLanguage, SupportedLanguage } from "../../../lib/language";

type Lang = SupportedLanguage;
export const runtime = "nodejs";

/* ------------------------------------------------------------------ */
/*  Static response helpers                                            */
/* ------------------------------------------------------------------ */

const LEGAL_CODES = "مدونة الأسرة (Moudawana), القانون الجنائي, قانون الالتزامات والعقود (DOC), قانون المسطرة المدنية, قانون الشغل, قانون التجارة, قانون التعمير";

const INSTANT: Record<string, Record<Lang, string>> = {
  smalltalk: {
    fr: "Bonjour 👋 Je suis AI-Mizan, votre assistant d'information juridique marocain. Posez-moi une question sur le droit marocain.",
    en: "Hi 👋 I'm AI-Mizan, your Moroccan legal information assistant. Ask me about Moroccan law.",
    ar: "مرحبًا 👋 أنا AI-Mizan، مساعدك للمعلومات القانونية المغربية. اطرح سؤالك حول القانون المغربي.",
    darija: "سلام 👋 أنا AI-Mizan، المساعد ديالك للمعلومات القانونية المغربية. سَوّلني على القانون المغربي.",
  },
  nonLegal: {
    fr: "AI-Mizan fournit uniquement des informations sur le droit marocain (famille, pénal, obligations, travail, commerce). Veuillez poser une question juridique.",
    en: "AI-Mizan provides information about Moroccan law only (family, penal, obligations, labor, commerce). Please ask a legal question.",
    ar: "AI-Mizan يقدم معلومات عن القانون المغربي فقط (أسرة، جنائي، التزامات، شغل، تجارة). يرجى طرح سؤال قانوني.",
    darija: "AI-Mizan كيعطي غير معلومات على القانون المغربي (أسرة، جنائي، عقود، شغل). سوّل سؤال قانوني.",
  },
  unsafe: {
    fr: "Je ne peux pas aider pour des demandes illégales ou frauduleuses.",
    en: "I cannot assist with illegal or fraudulent requests.",
    ar: "لا أستطيع المساعدة في طلبات غير قانونية أو احتيالية.",
    darija: "ما نقدرش نعاون فطلبات غير قانونية.",
  },
  clarify: {
    fr: "Aucun article de loi correspondant n'a été trouvé. Pouvez-vous préciser votre question en indiquant le domaine juridique concerné (famille, travail, pénal, contrats…) ?",
    en: "No matching law article was found. Could you clarify your question and specify the legal domain (family, labor, penal, contracts…)?",
    ar: "لم يُعثر على مادة قانونية مطابقة. هل يمكنك توضيح سؤالك وتحديد المجال القانوني (أسرة، شغل، جنائي، عقود…)؟",
    darija: "ما تلقيناش مادة قانونية مناسبة. واش تقدر توضح السؤال ديالك وتحدد المجال (أسرة، شغل، جنائي، عقود…)؟",
  },
};

const instant = (type: keyof typeof INSTANT, lang: Lang) =>
  INSTANT[type]?.[lang] ?? INSTANT[type]?.fr ?? "";

/* ------------------------------------------------------------------ */
/*  System prompt — information only, no legal advice                  */
/* ------------------------------------------------------------------ */

const buildSystemPrompt = (lang: Lang, isFollowUp: boolean): string => {
  const historyNote = isFollowUp
    ? (lang === "ar" || lang === "darija"
        ? "\nهذه محادثة مستمرة. فسّر رسالة المستخدم في سياق التبادل السابق.\n"
        : "\nThis is an ongoing conversation. Interpret the user's message in the context of the previous exchange.\n")
    : "";

  const disclaimer: Record<Lang, string> = {
    fr: "IMPORTANT : Vous fournissez des INFORMATIONS JURIDIQUES uniquement — ce que dit la loi — et NON des conseils juridiques. Terminez toujours votre réponse par : « ⚠️ Ces informations sont à titre informatif uniquement et ne constituent pas un conseil juridique. Consultez un avocat agréé pour votre situation. »",
    en: "IMPORTANT: You provide LEGAL INFORMATION only — what the law says — and NOT legal advice. Always end your response with: « ⚠️ This information is for informational purposes only and does not constitute legal advice. Consult a licensed lawyer for your specific situation. »",
    ar: "مهم: أنت تقدم معلومات قانونية فقط — ما تنص عليه القوانين — وليس استشارة قانونية. أنهِ دائماً ردّك بـ: « ⚠️ هذه المعلومات للتثقيف القانوني فقط ولا تُغني عن استشارة محامٍ مرخص. »",
    darija: "مهم: كتعطي غير معلومات قانونية — شنو كيقول القانون — مشي استشارة قانونية. دائماً سالي الجواب ديالك بـ: « ⚠️ هاد المعلومات للتثقيف القانوني فقط وما تغنيش على مشاورة محامي. »",
  };

  const format: Record<Lang, string> = {
    fr:
      "FORMAT OBLIGATOIRE (texte brut, AUCUN Markdown, AUCUNE étoile) :\n" +
      "Résumé: [réponse directe en 1-2 phrases]\n\n" +
      "Fondements juridiques:\n- [numéro d'article exact et ce qu'il dit]\n- ...\n\n" +
      "Droits et obligations:\n- ...\n\n" +
      "Étapes suivantes:\n1. ...\n2. ...\n\n" +
      "Citations: CODE Art N; CODE Art N\n\n" +
      "(CODE = family | penal | obligations | civil_procedure | labor_code | commerce_code | urbanism_code)",
    en:
      "MANDATORY FORMAT (plain text, NO Markdown, NO asterisks):\n" +
      "Summary: [direct answer in 1-2 sentences]\n\n" +
      "Legal Grounds:\n- [exact article number and what it says]\n- ...\n\n" +
      "Rights & Obligations:\n- ...\n\n" +
      "Next Steps:\n1. ...\n2. ...\n\n" +
      "Citations: CODE Art N; CODE Art N\n\n" +
      "(CODE = family | penal | obligations | civil_procedure | labor_code | commerce_code | urbanism_code)",
    ar:
      "التنسيق الإلزامي (نص عادي، بدون Markdown، بدون نجوم):\n" +
      "الخلاصة: [جواب مباشر في جملة أو جملتين]\n\n" +
      "الأسس القانونية:\n- [رقم المادة بالضبط وما تنص عليه]\n- ...\n\n" +
      "الحقوق والالتزامات:\n- ...\n\n" +
      "الخطوات التالية:\n1. ...\n2. ...\n\n" +
      "Citations: CODE Art N; CODE Art N\n\n" +
      "(CODE = family | penal | obligations | civil_procedure | labor_code | commerce_code | urbanism_code)",
    darija:
      "التنسيق الإلزامي (نص عادي، بلا Markdown، بلا نجوم):\n" +
      "الملخص: [جواب مباشر فجملة ولا جملتين]\n\n" +
      "الأسس القانونية:\n- [رقم المادة بالضبط وشنو كتقول]\n- ...\n\n" +
      "الحقوق والواجبات:\n- ...\n\n" +
      "الخطوات الجاية:\n1. ...\n2. ...\n\n" +
      "Citations: CODE Art N; CODE Art N\n\n" +
      "(CODE = family | penal | obligations | civil_procedure | labor_code | commerce_code | urbanism_code)",
  };

  const rules: Record<Lang, string> = {
    fr:
      `Vous êtes AI-Mizan, un assistant d'information juridique spécialisé dans le droit marocain (${LEGAL_CODES}).${historyNote}\n` +
      "RÈGLES STRICTES :\n" +
      "1. Répondez UNIQUEMENT en vous basant sur les articles fournis dans le contexte ci-dessous. NE JAMAIS inventer ou extrapoler des articles ou numéros qui ne figurent pas dans le contexte.\n" +
      "2. Si les articles fournis ne couvrent pas la question, dites-le explicitement : « Les articles disponibles ne traitent pas directement de ce cas. »\n" +
      "3. Citez toujours les numéros d'articles exacts.\n" +
      "4. Mentionnez les délais légaux si présents dans les articles (prescription, recours).\n" +
      "5. " + disclaimer.fr + "\n\n" + format.fr,
    en:
      `You are AI-Mizan, a legal information assistant specializing in Moroccan law (${LEGAL_CODES}).${historyNote}\n` +
      "STRICT RULES:\n" +
      "1. Answer ONLY based on the articles provided in the context below. NEVER invent or extrapolate articles or numbers not present in the context.\n" +
      "2. If the provided articles do not cover the question, state explicitly: « The available articles do not directly address this case. »\n" +
      "3. Always cite exact article numbers.\n" +
      "4. Mention legal deadlines if present in the articles (prescription, appeals).\n" +
      "5. " + disclaimer.en + "\n\n" + format.en,
    ar:
      `أنت AI-Mizan، مساعد للمعلومات القانونية متخصص في القانون المغربي (${LEGAL_CODES}).${historyNote}\n` +
      "قواعد صارمة:\n" +
      "1. أجب حصراً بناءً على المواد المقدمة في السياق أدناه. لا تخترع أبداً مواداً أو أرقاماً غير موجودة في السياق.\n" +
      "2. إذا لم تغطِّ المواد المتاحة السؤالَ، صرّح بذلك صراحةً: « المواد المتاحة لا تتناول هذه الحالة مباشرةً. »\n" +
      "3. استشهد دائماً بأرقام المواد الدقيقة.\n" +
      "4. اذكر المواعيد القانونية إذا وردت في المواد (تقادم، طعن).\n" +
      "5. " + disclaimer.ar + "\n\n" + format.ar,
    darija:
      `نتا AI-Mizan، مساعد للمعلومات القانونية متخصص فالقانون المغربي (${LEGAL_CODES}).${historyNote}\n` +
      "قواعد صارمة:\n" +
      "1. جاوب غير من المواد لي عندك فالسياق. ما تخترعش أبداً مواد ولا أرقام ماكاينش فالسياق.\n" +
      "2. إلا المواد المتاحة ما كتغطيش السؤال، قول بصراحة: « المواد المتاحة ما كتتكلمش بشكل مباشر على هاد الحالة. »\n" +
      "3. ديما استشهد بأرقام المواد الصحيحة.\n" +
      "4. ذكر المواعيد القانونية إلا كانت فالمواد.\n" +
      "5. " + disclaimer.darija + "\n\n" + format.darija,
  };

  return rules[lang] ?? rules.fr;
};

/* ------------------------------------------------------------------ */
/*  Citation extraction                                                */
/* ------------------------------------------------------------------ */

const extractCitations = (answer: string, articles: any[]): any[] => {
  const found: Array<{ code: string; num: string }> = [];

  // Match "CODE Art N" or "CODE Article N"
  const codeRegex = /(family|penal|obligations|civil_procedure|labor_code|commerce_code|urbanism_code)\s*Art(?:icle)?\s*(\d+)/gi;
  let m: RegExpExecArray | null;
  while ((m = codeRegex.exec(answer)) !== null) {
    found.push({ code: m[1].toLowerCase(), num: m[2] });
  }

  // Match generic "Article N" or "Art N" → associate with retrieved articles
  const genericRegex = /(?<![A-Za-z])Art(?:icle)?\s+(\d+)(?!\d)/gi;
  while ((m = genericRegex.exec(answer)) !== null) {
    const num = m[1];
    if (!found.some((c) => c.num === num)) {
      const match = articles.find((a) => String(a.articleNumber) === num);
      if (match) found.push({ code: match.code, num });
    }
  }

  const finalCitations = found.length > 0
    ? articles.filter((a) =>
        found.some((c) => c.num === String(a.articleNumber) && c.code === a.code)
      )
    : articles.slice(0, 3);

  return finalCitations.map((a: any) => ({
    code: a.code,
    articleNumber: a.articleNumber,
    source: a.source,
    effectiveDate: a.effectiveDate ? new Date(a.effectiveDate).toISOString().slice(0, 10) : null,
    language: a.language,
    score: a.score ?? null,
  }));
};

/* ------------------------------------------------------------------ */
/*  SSE helpers                                                        */
/* ------------------------------------------------------------------ */

const enc = new TextEncoder();

const sseEvent = (data: Record<string, unknown>) =>
  enc.encode(`data: ${JSON.stringify(data)}\n\n`);

/** Returns a JSON response for instant (non-streaming) cases. */
const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/* ------------------------------------------------------------------ */
/*  Main handler                                                       */
/* ------------------------------------------------------------------ */

export const POST = async (request: Request) => {
  const body = await request.json().catch(() => null);
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success)
    return jsonResponse({ error: "Invalid request" }, 400);

  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  const allowed = await checkRateLimit(ip);
  if (!allowed)
    return jsonResponse({ error: "Rate limit exceeded. Please wait a moment." }, 429);

  const { question, context, language: requestedLanguage, history: rawHistory } = parsed.data;
  const history = (rawHistory ?? []).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));
  const isFollowUp = history.length > 0;

  // Detect language
  const questionLang = detectLanguage(question);
  const userLang: Lang =
    questionLang !== "fr" ? questionLang : ((requestedLanguage as Lang) || "fr");

  console.log(
    `[AI-Mizan] Q: "${question.slice(0, 60)}…" | lang=${userLang} | followUp=${isFollowUp}`
  );

  // ── Step 1: Fast classification (zero API calls) ─────────────────
  const fastResult = fastRoute(question);

  if (fastResult === "UNSAFE")
    return jsonResponse({ answer: instant("unsafe", userLang), citations: [], grounded: false, question_type: "UNSAFE", language: userLang });

  if (fastResult === "SMALLTALK" && !isFollowUp)
    return jsonResponse({ answer: instant("smalltalk", userLang), citations: [], grounded: false, question_type: "SMALLTALK", language: userLang });

  if (fastResult === "NON_LEGAL" && !isFollowUp)
    return jsonResponse({ answer: instant("nonLegal", userLang), citations: [], grounded: false, question_type: "NON_LEGAL", language: userLang });

  // ── Step 2: Retrieval (embedding + vector + keyword fallback) ─────
  const TOP_K = Number.parseInt(process.env.RETRIEVE_TOP_K || "8", 10) || 8;

  // For follow-ups, augment the query with recent context
  let searchQuery = question;
  if (isFollowUp) {
    const recentUserMsgs = history
      .slice(-4)
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join(" ");
    searchQuery = `${recentUserMsgs} ${question}`.trim();
  }

  // Topic keywords (rule-based, free)
  const topicKeywords = getTopicKeywords(searchQuery);

  // Embedding (1 API call or free local hash)
  let embedding: number[] = [];
  try {
    embedding = await createEmbedding(searchQuery);
  } catch {
    embedding = [];
  }

  // Vector search
  let articles: any[] = [];
  if (embedding.length) {
    try {
      articles = await retrieveRelevantArticles(embedding, TOP_K);
      // Prefer user's language if enough results
      const sameLang = articles.filter((a) => a.language === userLang);
      if (sameLang.length >= 3) articles = sameLang;
    } catch {
      articles = [];
    }
  }

  // Keyword fallback if vector search found nothing
  if (articles.length === 0) {
    try {
      const fallback = await keywordFallback([searchQuery, ...topicKeywords], TOP_K);
      const sameLang = fallback.filter((a: any) => a.language === userLang);
      articles = (sameLang.length >= 3 ? sameLang : fallback).slice(0, TOP_K);
    } catch {
      articles = [];
    }
  }

  console.log(
    `[AI-Mizan] Retrieved ${articles.length} articles: ${articles.map((a: any) => `${a.code} Art.${a.articleNumber}`).join(", ")}`
  );

  // If still nothing found, return clarification request
  if (articles.length === 0) {
    return jsonResponse({
      answer: instant("clarify", userLang),
      clarify: true,
      citations: [],
      grounded: false,
      question_type: "NO_RESULTS",
      language: userLang,
    });
  }

  // ── Step 3: Build LLM messages ────────────────────────────────────
  const lawContext = articles
    .map((article, i) => {
      const eff = article.effectiveDate
        ? new Date(article.effectiveDate).toISOString().slice(0, 10)
        : "N/A";
      return (
        `(${i + 1}) ${article.code} Article ${article.articleNumber} ` +
        `[lang:${article.language}] [source:${article.source}] [date:${eff}]\n` +
        String(article.text || "").slice(0, 600)
      );
    })
    .join("\n\n---\n\n");

  const systemPrompt = buildSystemPrompt(userLang, isFollowUp);
  const llmMessages: DeepSeekMessage[] = [{ role: "system", content: systemPrompt }];

  // Include recent conversation history (last 6 messages)
  if (isFollowUp) {
    for (const msg of history.slice(-6)) {
      llmMessages.push({ role: msg.role, content: msg.content });
    }
  }

  const userPrompt =
    `Question: ${question}\n\n` +
    (context ? `Additional context: ${context}\n\n` : "") +
    `Legal context (answer ONLY from these articles — do not use any other source):\n${lawContext}`;

  llmMessages.push({ role: "user", content: userPrompt });

  // ── Step 4: Stream the answer ─────────────────────────────────────
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();

  // Fire streaming in background (don't await — response is already returned)
  (async () => {
    let fullAnswer = "";
    try {
      for await (const chunk of streamDeepSeek(llmMessages)) {
        // Strip stray markdown bold (**) and headings (#) as they stream
        const clean = chunk.replace(/\*\*/g, "").replace(/^#+\s*/gm, "");
        fullAnswer += clean;
        await writer.write(sseEvent({ type: "chunk", text: clean }));
      }

      // Extract citations from completed answer
      const citations = extractCitations(fullAnswer, articles);

      // Persist to DB (fire and forget)
      prisma.chatQuery
        .create({
          data: {
            question,
            answer: fullAnswer,
            grounded: true,
            ip,
            userAgent: hdrs.get("user-agent") || undefined,
          },
        })
        .then(async (qrow) => {
          if (citations.length > 0) {
            await prisma.chatCitation.createMany({
              data: citations.map((c: any) => ({
                chatQueryId: qrow.id,
                articleId: articles.find(
                  (a: any) => a.code === c.code && String(a.articleNumber) === String(c.articleNumber)
                )?.id ?? "",
                code: c.code,
                articleNumber: c.articleNumber,
              })),
            });
          }
        })
        .catch((e) => console.error("[AI-Mizan] DB log failed:", e));

      // Done event — send citations and metadata
      await writer.write(
        sseEvent({
          type: "done",
          citations,
          grounded: true,
          question_type: "LEGAL",
          language: userLang,
          retrieved_count: articles.length,
        })
      );
    } catch (err) {
      console.error("[AI-Mizan] Streaming error:", err);
      // Send a fallback answer with the retrieved articles' article numbers
      const fallbackText = instant("clarify", userLang);
      await writer.write(sseEvent({ type: "chunk", text: fullAnswer || fallbackText }));
      await writer.write(sseEvent({ type: "done", citations: [], grounded: false, language: userLang }));
    } finally {
      await writer.close();
    }
  })();

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
};
