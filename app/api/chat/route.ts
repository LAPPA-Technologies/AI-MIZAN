// app/api/chat/route.ts  (or wherever your route.ts lives)
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { chatRequestSchema } from "../../../lib/validators";
import { createEmbedding } from "../../../lib/embeddings";
import { keywordFallback, retrieveRelevantArticles } from "../../../lib/search";
import { shouldSearchLawDbDynamic } from "../../../lib/searchGate";
import { generateDeepSeekResponse } from "../../../lib/deepseek";
import { prisma } from "../../../lib/prisma";
import { checkRateLimit } from "../../../lib/rateLimit";

type Lang = "fr" | "en" | "ar" | "darija";

const preferLanguage = <T extends { language?: string }>(items: T[], lang: Lang) => {
  const preferred = items.filter((x) => x.language === lang);
  return preferred.length ? preferred : items; // fallback to any language
};

export const POST = async (request: Request) => {
  const body = await request.json();
  const parsed = chatRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const allowed = await checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { question, context, language: requestedLanguage } = parsed.data;

  const MIN_RELEVANCE = Number.parseFloat(process.env.MIN_RELEVANCE || "0.78");
  const TOP_K = Number.parseInt(process.env.RETRIEVE_TOP_K || "5", 10) || 5;

  const needsSearch = await shouldSearchLawDbDynamic(question);

  // Simple language detection: Arabic if contains Arabic letters, English if contains common English words, else French
  const detectLang = (text: string): Lang => {
    if (/\p{Script=Arabic}/u.test(text)) return "ar";
    if (/\b(the|is|are|can|landlord|tenant|evict|rent)\b/i.test(text)) return "en";
    return "fr";
  };

  const userLang = (requestedLanguage as "fr" | "en" | "ar" | "darija") || detectLang(question);

  /*if (!needsSearch) {
    let answer = "";
    let modelUsed: string | null = process.env.DEEPSEEK_MODEL || "deepseek-chat";

    try {
      answer = await generateDeepSeekResponse([
        { role: "system", content: "AI-Mizan, friendly assistant. Reply conversationally." },
        { role: "user", content: question }
      ]);

      if (!answer || answer.trim() === "") {
        throw new Error("Empty DeepSeek response");
      }
    } catch (err) {
      console.error("[ai-mizan] Small-talk fallback triggered:", err);

      if (/\b(salam|مرحبا|أهلا)\b/i.test(question)) {
        answer = "سلام — كيف أستطيع مساعدتك اليوم؟";
      } else {
        answer = "Hello — how can I assist you today?";
      }

      modelUsed = "local-fallback";
    }

    // ✅ DO NOT LET DB LOGGING BREAK RESPONSE
    try {
      const userAgent = hdrs.get("user-agent") || undefined;
      await prisma.chatQuery.create({
        data: { question, answer, grounded: false, ip, userAgent }
      });
    } catch (dbErr) {
      console.error("[ai-mizan] chatQuery log failed:", dbErr);
    }

    return NextResponse.json({
      answer,
      citations: [],
      grounded: false,
      model_used: modelUsed,
      retrieved_count: 0
    });
  }
  */
  if (!needsSearch) {
    // Small-talk handling: prefer DeepSeek when available, otherwise use safe local replies
    let answer = "";
    let modelUsed: string | null = process.env.DEEPSEEK_MODEL || "deepseek-chat";

    const localReplies: Record<string, string> = {
      en: "Hello — AI-Mizan is specialized in Moroccan legal questions. How can I help?",
      fr: "Bonjour — AI-Mizan est spécialisé dans les questions juridiques marocaines. Comment puis-je aider?",
      ar: "سلام — AI-Mizan متخصص في المعلومات القانونية المغربية. كيف أستطيع مساعدتك؟",
      darija: "سلام — AI‑Mizan متخصص فالقانون المغربي. كيف نقدر نعاونك؟"
    };

    try {
      if (!process.env.DEEPSEEK_API_KEY) throw new Error("no-deepseek-key");

      const system = `AI-Mizan, friendly assistant. Reply conversationally in the user's language (en/fr/ar/darija). Keep responses short.`;
      const dsResp = await generateDeepSeekResponse([
        { role: "system", content: system },
        { role: "user", content: question }
      ]);

      if (!dsResp || dsResp.trim() === "") {
        throw new Error("Empty DeepSeek response");
      }

      answer = dsResp;
    } catch (err) {
      console.error("[ai-mizan] small-talk DeepSeek failed or unavailable:", err?.message ?? err);
      // safe local fallback in user's language
      const langKey = (userLang as string) in localReplies ? (userLang as string) : "en";
      answer = localReplies[langKey];
      modelUsed = "local-fallback";
    }

    // Log query but don't let DB errors break response
    try {
      const userAgent = hdrs.get("user-agent") || undefined;
      await prisma.chatQuery.create({ data: { question, answer, grounded: false, ip, userAgent } });
    } catch (dbErr) {
      console.error("[ai-mizan] chatQuery log failed:", dbErr);
    }

    return NextResponse.json({ answer, citations: [], grounded: false, model_used: modelUsed, retrieved_count: 0 });
  }
  // Else: legal/question-like message -> do retrieval
  const embedding = await createEmbedding(question);

  let retrievalMode: "vector" | "keyword" = "vector";
  let articles = await retrieveRelevantArticles(embedding, TOP_K);
  if (userLang) {
    articles = preferLanguage(articles, userLang);
  }

  // If no results after retrieval, try keyword fallback
  if (articles.length === 0) {
    retrievalMode = "keyword";
    let fallbackArticles = await keywordFallback(question, TOP_K);
    if (userLang) {
      fallbackArticles = preferLanguage(fallbackArticles, userLang);
    }
    // keywordFallback now returns score=1, but keep this as a guard
    articles = fallbackArticles.map((a) => ({ ...a, score: a.score ?? 1 }));
  }

  // If still empty, return generic response (but don't claim DB is empty)
  if (articles.length === 0) {
    const fallbackPhraseFr =
      "Je n’ai pas trouvé d’article pertinent dans la base de données pour cette question.";
    const fallbackPhraseAr = "لم أجد مادة قانونية ذات صلة في قاعدة البيانات لهذا السؤال.";
    const fallbackPhraseEn =
      "I did not find a relevant law article in the database for this question.";

    const briefGeneralFr =
      "Voici une réponse générale basée sur les informations disponibles :\n\n(Je ne suis pas un avocat; pour un avis personnalisé, consultez un professionnel.)";
    const briefGeneralAr =
      "إليك إجابة عامة بناءً على المعلومات المتاحة:\n\n(لست محاميًا؛ للحصول على رأي مخصص، استشر مختصًا).";
    const briefGeneralEn =
      "Here is a general answer based on available information:\n\n(I'm not a lawyer; for tailored advice consult a licensed professional.)";

    const combined =
      userLang === "fr"
        ? `${fallbackPhraseFr}\n\n${briefGeneralFr}`
        : userLang === "ar"
          ? `${fallbackPhraseAr}\n\n${briefGeneralAr}`
          : `${fallbackPhraseEn}\n\n${briefGeneralEn}`;

    const userAgent = hdrs.get("user-agent") || undefined;
    const query = await prisma.chatQuery.create({
      data: { question, answer: combined, grounded: false, ip, userAgent }
    });

    return NextResponse.json({
      answer: combined,
      citations: [],
      grounded: false,
      queryId: query.id,
      model_used: "local-extractive",
      retrieved_count: 0
    });
  }

  const lawContext = articles
    .map(
      (article, index) =>
        `(${index + 1}) ${article.code} Article ${article.articleNumber} ` +
        `[${article.language}] Source: ${article.source} ` +
        `Effective: ${article.effectiveDate?.toISOString().slice(0, 10) ?? "unknown"}\n` +
        `${article.text}`
    )
    .join("\n\n");

  // Detect greetings/basic messages
  const isGreeting = /^(hi|hello|bonjour|salam|hey|مرحبا|أهلا|good morning|good evening)/i.test(
    question.trim()
  );

  let systemPrompt = "";
  let userPrompt = "";

  // Note: if we are here, we already "needSearch", so treat as legal.
  // We'll still answer conversationally if the user mixed a greeting + question.
  systemPrompt =
  "You are AI-Mizan, a professional Moroccan legal advisor. " +
  "You provide structured, precise, and authoritative legal explanations based strictly on the provided legal context.\n\n" +

  "RESPONSE STRUCTURE:\n" +
  "1) Short Legal Answer – clear and direct conclusion.\n" +
  "2) Legal Basis – cite relevant law_code, article_number, source_ref, and effective_date exactly as provided.\n" +
  "3) Practical Implication – explain what this means for the user in real life.\n" +
  "4) If relevant, briefly mention exceptions or conditions.\n\n" +

  "CITATION RULES:\n" +
  "- Only cite articles included in the provided context.\n" +
  "- Never invent laws, articles, or legal procedures.\n" +
  "- If no relevant article is found, clearly state that and provide a general explanation without fabricating legal authority.\n\n" +

  "TONE:\n" +
  "- Professional, neutral, and confident.\n" +
  "- Avoid casual phrases.\n" +
  "- Avoid emotional language.\n" +
  "- No emojis.\n" +
  "- No exaggerated claims.\n\n" +

  "LANGUAGE:\n" +
  "- Match the user's language.\n" +
  "- If user writes in Darija, explain in clear Moroccan Darija while keeping legal precision.\n\n" +

  "IMPORTANT:\n" +
  "- Do not provide personalized legal representation.\n" +
  "- Add a brief professional disclaimer at the end: 'This information is provided for general legal guidance and does not constitute legal advice.'"
  "The style of the answer should be concise and structured, suitable for a user seeking legal information based on the cited articles. and should not include any information that is not directly supported by the cited articles.\n\n" +
  "If the question is a simple greeting or does not require legal information, respond conversationally without citing articles, but still maintain a professional tone.";

  userPrompt =
    (isGreeting ? `Greeting: ${question}\n\n` : `Question: ${question}\n\n`) +
    (context ? `Context: ${context}\n\n` : "") +
    `Relevant law articles:\n${lawContext}`;

  const buildLocalAnswer = () => {
    const lines = articles.map((article) => {
      const effective = article.effectiveDate
        ? article.effectiveDate.toISOString().slice(0, 10)
        : "unknown";
      return (
        `- ${article.code} Article ${article.articleNumber} ` +
        `(${article.source}, ${effective})\n` +
        `${article.text}`
      );
    });

    return (
      "Based on the retrieved legal articles, here is the relevant context:\n\n" +
      `${lines.join("\n\n")}\n\n` +
      "If you need a tailored legal opinion, please consult a licensed lawyer."
    );
  };

  console.log(
    "[ai-mizan] retrieved",
    articles.map((article) => article.id),
    "retrievalMode",
    retrievalMode,
    "model",
    process.env.DEEPSEEK_MODEL || "deepseek-chat"
  );

  let answer = "";
  let modelUsed: string | null = process.env.DEEPSEEK_MODEL || "deepseek-chat";

  // Local fallback: if no DeepSeek API key, always use local extractive answer
  if (!process.env.DEEPSEEK_API_KEY) {
    answer = buildLocalAnswer();
    modelUsed = "local-extractive";
  } else {
    try {
      answer = await generateDeepSeekResponse([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]);
      if (!answer) {
        throw new Error("Empty response from DeepSeek");
      }
    } catch (error) {
      console.error("[ai-mizan] DeepSeek error:", error);
      // If DeepSeek fails for a legal question, fallback to extractive context
      answer = buildLocalAnswer();
      modelUsed = "local-extractive";
    }
  }

  // Grounding logic:
  // - for vector retrieval, require threshold
  // - for keyword fallback, treat as grounded (it explicitly matched terms)
  const topScore = Math.max(...articles.map((a) => a.score ?? 0));
  const grounded = retrievalMode === "keyword" ? true : topScore >= MIN_RELEVANCE;

  // If vector score is low, don't throw away citations; just reduce certainty
  // (We keep grounded=false but still return the best matching articles as citations.)
  const userAgent = hdrs.get("user-agent") || undefined;

  let queryId: string | null = null;

  try {
    const query = await prisma.chatQuery.create({
      data: {
        question,
        answer,
        grounded,
        ip,
        userAgent
      }
    });

    queryId = query.id;

    await prisma.chatCitation.createMany({
      data: articles.map((article) => ({
        chatQueryId: query.id,
        articleId: article.id,
        code: article.code,
        articleNumber: article.articleNumber
      }))
    });
  } catch (dbErr) {
    console.error("[ai-mizan] DB logging failed:", dbErr);
  }

  return NextResponse.json({
    answer,
    citations: articles.map((article) => ({
      code: article.code,
      articleNumber: article.articleNumber,
      source: article.source,
      effectiveDate: article.effectiveDate ? article.effectiveDate.toISOString().slice(0, 10) : null,
      language: article.language,
      score: article.score ?? null
    })),
    grounded,
    queryId, // <-- now can be null if DB logging failed
    model_used: modelUsed,
    retrieved_count: articles.length,
    top_score: topScore
  });
};