// app/api/chat/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { chatRequestSchema } from "../../../lib/validators";
import { createEmbedding } from "../../../lib/embeddings";
import { keywordFallback, retrieveWithExpansions, generateQueryExpansions } from "../../../lib/search";
import { generateDeepSeekResponse } from "../../../lib/deepseek";
import { prisma } from "../../../lib/prisma";
import { checkRateLimit } from "../../../lib/rateLimit";
import { classifyQuestion, HistoryMessage } from "../../../lib/classifier";
import { fastRoute } from "../../../lib/fastRouter";
import { detectLanguage, SupportedLanguage } from "../../../lib/language";

type Lang = SupportedLanguage;
type Decision = "LEGAL" | "NEEDS_CLARIFICATION" | "NON_LEGAL" | "UNSAFE";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const CODE_NAMES: Record<string, string> = {
  family: "Family Code (Moudawana)",
  penal: "Penal Code",
  obligations: "Obligations & Contracts (DOC)",
  civil_procedure: "Civil Procedure Code",
};

const preferLanguage = <T extends { language?: string }>(items: T[], lang: Lang) => {
  const preferred = items.filter((x) => x.language === lang);
  return preferred.length >= 3 ? preferred : items;
};

const isSmalltalk = (q: string) => {
  const t = q.trim().toLowerCase();
  return (
    /^(hi|hello|hey|bonjour|salut|salam|السلام عليكم|مرحبا|أهلا)$/i.test(t) ||
    /^(how are you|ça va|comment ça va|kif dayr|labas|bikhir|كيف حالك)$/i.test(t) ||
    /^(thanks|merci|شكرا|chokran|thx)$/i.test(t)
  );
};

const smalltalkReply = (lang: Lang) => {
  const r: Record<Lang, string> = {
    fr: "Bonjour 👋 Je suis AI-Mizan, votre assistant juridique marocain. Posez-moi une question sur le droit marocain (famille, pénal, obligations, procédure civile…).",
    en: "Hi 👋 I'm AI-Mizan, your Moroccan law assistant. Ask me about Moroccan law (family, penal, obligations, civil procedure…).",
    ar: "مرحبًا 👋 أنا AI-Mizan، مساعدك القانوني المغربي. اطرح سؤالك حول القانون المغربي (أسرة، جنائي، التزامات، مسطرة مدنية...).",
    darija: "سلام 👋 أنا AI-Mizan، المساعد ديالك فالقانون المغربي. سَوّلني على أي حاجة فالقانون المغربي (أسرة، جنائي، عقود، مسطرة مدنية...)."
  };
  return r[lang] ?? r.fr;
};

const buildLegalOnlyMessage = (lang: Lang) => {
  const m: Record<Lang, string> = {
    fr: "AI-Mizan répond uniquement aux questions de droit marocain (famille, pénal, obligations, procédure civile). Reformulez votre question en lien avec le droit marocain.",
    en: "AI-Mizan answers only Moroccan law questions (family, penal, obligations, civil procedure). Please rephrase your question in relation to Moroccan law.",
    ar: "AI-Mizan يجيب فقط عن أسئلة القانون المغربي (أسرة، جنائي، التزامات، مسطرة مدنية). أعد صياغة سؤالك في إطار القانون المغربي.",
    darija: "AI-Mizan يجاوب غي على أسئلة القانون المغربي (أسرة، جنائي، عقود، مسطرة مدنية). عاود صوّغ السؤال ديالك باش يكون فالقانون المغربي."
  };
  return m[lang] ?? m.fr;
};

const buildUnsafeMessage = (lang: Lang) => {
  const m: Record<Lang, string> = {
    fr: "Désolé, je ne peux pas aider pour des demandes illégales ou frauduleuses.",
    ar: "عذرًا، لا أستطيع المساعدة في طلبات غير قانونية أو احتيالية.",
    en: "Sorry — I cannot assist with illegal or fraudulent requests.",
    darija: "سمح ليا، ما نقدرش نعاون فطلبات غير قانونية ولا احتيالية."
  };
  return m[lang] ?? m.fr;
};

const buildClarifyPrompts = (lang: Lang) => {
  const prompts: Record<Lang, string[]> = {
    fr: [
      "Votre question concerne-t-elle le droit marocain (famille, pénal, obligations, procédure civile) ?",
      "Pouvez-vous préciser les parties concernées et les faits ?",
      "Quel résultat souhaitez-vous obtenir ?"
    ],
    ar: [
      "هل سؤالك يخص القانون المغربي (أسرة/جنائي/التزامات/مسطرة مدنية)؟",
      "هل يمكنك توضيح الأطراف والوقائع؟",
      "ما النتيجة التي تريد الوصول إليها؟"
    ],
    en: [
      "Does your question relate to Moroccan law (family, penal, obligations, civil procedure)?",
      "Can you clarify the parties and facts involved?",
      "What outcome are you looking for?"
    ],
    darija: [
      "واش السؤال ديالك على القانون المغربي (أسرة/جنائي/عقود/مسطرة مدنية)؟",
      "واش تقدر توضح الأطراف والوقائع؟",
      "شنو النتيجة لي باغي توصل ليها؟"
    ]
  };
  return prompts[lang] ?? prompts.fr;
};

/* ------------------------------------------------------------------ */
/*  Classification (fast-route first, then LLM with history context)   */
/* ------------------------------------------------------------------ */
const classifyWithApi = async (
  question: string,
  lang: Lang,
  history: HistoryMessage[] = [],
): Promise<{ decision: Decision; confidence: number; reason?: string }> => {
  // Fast route catches obvious smalltalk / unsafe / non-legal
  const fastResult = fastRoute(question);
  if (fastResult === "SMALLTALK") {
    return { decision: "NEEDS_CLARIFICATION", confidence: 1.0, reason: "smalltalk" };
  }
  if (fastResult === "UNSAFE") {
    return { decision: "UNSAFE", confidence: 1.0, reason: "unsafe" };
  }
  if (fastResult === "NON_LEGAL") {
    // If this is a follow-up in a legal conversation, don't flag as non-legal
    if (history.length > 0) {
      return { decision: "LEGAL", confidence: 0.6, reason: "follow-up-override" };
    }
    return { decision: "NON_LEGAL", confidence: 0.9, reason: "obviously non-legal" };
  }

  // Short follow-up answers (≤ 4 words) in an ongoing conversation → skip classifier
  const wordCount = question.trim().split(/\s+/).length;
  if (history.length > 0 && wordCount <= 4) {
    return { decision: "LEGAL", confidence: 0.75, reason: "short-follow-up" };
  }

  // LLM classification with conversation history
  try {
    const result = await classifyQuestion(question, lang, history);
    let decision: Decision;
    if (result.isLegal) {
      decision = "LEGAL";
    } else if (result.confidence < 0.5) {
      decision = "NEEDS_CLARIFICATION";
    } else {
      decision = "NON_LEGAL";
    }
    return { decision, confidence: result.confidence, reason: result.intent };
  } catch (error) {
    console.error("Classification error:", error);
    // On failure, if there's history, assume legal follow-up
    if (history.length > 0) {
      return { decision: "LEGAL", confidence: 0.5, reason: "classification_failed_follow_up" };
    }
    return { decision: "NEEDS_CLARIFICATION", confidence: 0.0, reason: "classification_failed" };
  }
};

/* ------------------------------------------------------------------ */
/*  System prompts (all Moroccan law, not just family)                 */
/* ------------------------------------------------------------------ */
const buildSystemPrompt = (lang: Lang, hasHistory: boolean): string => {
  const historyNote = hasHistory
    ? "\nThis is an ongoing conversation. The user may be answering your follow-up questions or providing additional details. Interpret their messages in the context of the conversation.\n"
    : "";

  const base: Record<Lang, string> = {
    fr:
      "Vous êtes AI-Mizan, assistant expert en droit marocain.\n" +
      "Vous couvrez : Code de la Famille (Moudawana), Code Pénal, Dahir des Obligations et Contrats (DOC), Code de Procédure Civile.\n" +
      historyNote +
      "\nRÈGLES CRITIQUES :\n" +
      "1. Répondez UNIQUEMENT à partir des articles fournis dans le contexte juridique. NE JAMAIS inventer d'article ou de loi.\n" +
      "2. Si le contexte est insuffisant, dites-le et posez 1 à 2 questions de clarification.\n" +
      "3. Citez TOUJOURS les articles spécifiques que vous utilisez.\n" +
      "\nFORMAT (texte brut, pas de Markdown) :\n" +
      "Résumé : phrase synthétique.\n" +
      "Fondements juridiques :\n- ...\n" +
      "Droits et obligations :\n- ...\n" +
      "Étapes suivantes :\n- ...\n" +
      "Citations: CODE Art N (Source, YYYY-MM-DD); CODE Art N (...)\n" +
      "\nREMPLACEZ CODE par le nom du code (family, penal, obligations, civil_procedure).\n" +
      "LANGUE : Répondez en français.",
    en:
      "You are AI-Mizan, an expert Moroccan law assistant.\n" +
      "You cover: Family Code (Moudawana), Penal Code, Obligations & Contracts (DOC), Civil Procedure Code.\n" +
      historyNote +
      "\nCRITICAL RULES:\n" +
      "1. Answer ONLY using the articles provided in the legal context below. NEVER invent articles or laws.\n" +
      "2. If the context is insufficient, say so and ask 1–2 clarifying questions.\n" +
      "3. ALWAYS cite the specific articles you reference.\n" +
      "\nFORMAT (plain text, no Markdown):\n" +
      "Summary: one-sentence overview.\n" +
      "Legal Grounds:\n- ...\n" +
      "Rights & Obligations:\n- ...\n" +
      "Next Steps:\n- ...\n" +
      "Citations: CODE Art N (Source, YYYY-MM-DD); CODE Art N (...)\n" +
      "\nREPLACE CODE with the law code name (family, penal, obligations, civil_procedure).\n" +
      "LANGUAGE: Respond in English.",
    ar:
      "أنت AI-Mizan، مساعد خبير في القانون المغربي.\n" +
      "تغطي: مدونة الأسرة، القانون الجنائي، قانون الالتزامات والعقود، قانون المسطرة المدنية.\n" +
      historyNote +
      "\nقواعد حرجة:\n" +
      "1. أجب حصراً من المواد القانونية المزوّدة في السياق. لا تخترع مواد أو قوانين أبداً.\n" +
      "2. إذا كان السياق غير كافٍ، قل ذلك واطرح سؤالاً أو سؤالين للتوضيح.\n" +
      "3. استشهد دائماً بالمواد المحددة.\n" +
      "\nالتنسيق (نص عادي بدون Markdown):\n" +
      "الخلاصة: جملة موجزة.\n" +
      "الأسس القانونية:\n- ...\n" +
      "الحقوق والالتزامات:\n- ...\n" +
      "الخطوات التالية:\n- ...\n" +
      "Citations: CODE Art N (Source, YYYY-MM-DD); CODE Art N (...)\n" +
      "\nاستبدل CODE باسم القانون (family, penal, obligations, civil_procedure).\n" +
      "اللغة: أجب بالعربية.",
    darija:
      "نتا AI-Mizan، مساعد خبير فالقانون المغربي.\n" +
      "تغطي: مدونة الأسرة، القانون الجنائي، قانون الالتزامات والعقود، المسطرة المدنية.\n" +
      historyNote +
      "\nقواعد مهمة بزاف:\n" +
      "1. جاوب غير من المواد القانونية لي عندك فالسياق. ما تخترعش مواد ولا قوانين.\n" +
      "2. إلا ماكانش السياق كافي، قول هادشي و سَوّل 1 ولا 2 ديال الأسئلة.\n" +
      "3. ديما استشهد بالمواد المحددة.\n" +
      "\nالتنسيق (نص عادي بلا Markdown):\n" +
      "الملخص: جملة قصيرة.\n" +
      "الأسس القانونية:\n- ...\n" +
      "الحقوق والواجبات:\n- ...\n" +
      "الخطوات الجاية:\n- ...\n" +
      "Citations: CODE Art N (Source, YYYY-MM-DD); CODE Art N (...)\n" +
      "\nبدل CODE باسم القانون (family, penal, obligations, civil_procedure).\n" +
      "اللغة: جاوب بالدارجة (حروف عربية)، خلي المصطلحات القانونية واضحة."
  };

  return base[lang] ?? base.fr;
};

/* ------------------------------------------------------------------ */
/*  Main handler                                                       */
/* ------------------------------------------------------------------ */
export const POST = async (request: Request) => {
  const body = await request.json().catch(() => null);
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  const allowed = await checkRateLimit(ip);
  if (!allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const { question, context, language: requestedLanguage, history: rawHistory } = parsed.data;
  const history: HistoryMessage[] = (rawHistory ?? []).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));
  const isFollowUp = history.length > 0;

  // Detect language from the question itself
  const questionLang = detectLanguage(question);
  const userLang = questionLang !== "fr" ? questionLang : (requestedLanguage as Lang) || "fr";

  console.log(`[AI-Mizan] Q: "${question.slice(0, 60)}…" | Lang: ${userLang} | Follow-up: ${isFollowUp} | History: ${history.length} msgs`);

  // 1) Exact smalltalk match — skip for follow-ups (could be a real answer)
  if (!isFollowUp && isSmalltalk(question)) {
    const answer = smalltalkReply(userLang);
    try {
      await prisma.chatQuery.create({
        data: { question, answer, grounded: false, ip, userAgent: hdrs.get("user-agent") || undefined }
      });
    } catch { /* ignore */ }
    return NextResponse.json({ answer, citations: [], grounded: false, model_used: "smalltalk", retrieved_count: 0, language: userLang });
  }

  // 2) Classify (fast-route + LLM with conversation history)
  const cls = await classifyWithApi(question, userLang, history);
  const lowConfidence = cls.confidence < Number(process.env.GATE_LOW_CONFIDENCE || "0.55");

  if (cls.decision === "UNSAFE") {
    return NextResponse.json({
      answer: buildUnsafeMessage(userLang),
      citations: [],
      grounded: false,
      model_used: "gate-unsafe",
      question_type: "UNSAFE",
      classifier: cls,
      language: userLang
    });
  }

  if (cls.decision === "NON_LEGAL" && !lowConfidence) {
    const answer = buildLegalOnlyMessage(userLang);
    try {
      await prisma.chatQuery.create({
        data: { question, answer, grounded: false, ip, userAgent: hdrs.get("user-agent") || undefined }
      });
    } catch { /* ignore */ }
    return NextResponse.json({
      answer,
      citations: [],
      grounded: false,
      error: "non_legal_question",
      model_used: "gate-non-legal",
      question_type: "NON_LEGAL",
      classifier: cls,
      language: userLang
    });
  }

  if (cls.decision === "NEEDS_CLARIFICATION" || (cls.decision === "NON_LEGAL" && lowConfidence)) {
    const prompts = buildClarifyPrompts(userLang);
    try {
      await prisma.chatQuery.create({
        data: { question, answer: prompts.join("\n"), grounded: false, ip, userAgent: hdrs.get("user-agent") || undefined }
      });
    } catch { /* ignore */ }
    return NextResponse.json({
      clarify: true,
      prompts,
      grounded: false,
      model_used: "gate-clarify",
      question_type: "NEEDS_CLARIFICATION",
      classifier: cls,
      language: userLang
    });
  }

  // 3) LEGAL → Retrieval (search ALL codes, not just family)
  const TOP_K = Number.parseInt(process.env.RETRIEVE_TOP_K || "8", 10) || 8;

  // Build augmented search query for follow-ups
  let searchQuery = question;
  if (isFollowUp) {
    // Combine recent user questions + current question for better embedding context
    const recentContext = history
      .slice(-4)
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join(" ");
    searchQuery = `${recentContext} ${question}`.trim();
  }

  // Query expansion (cached for 7 days — amortized cost is low)
  const expansions = await generateQueryExpansions(searchQuery, userLang);

  let embedding: number[] | null = null;
  try {
    embedding = await createEmbedding(searchQuery);
  } catch {
    embedding = null;
  }

  let articles: any[] = [];
  if (embedding) {
    try {
      articles = await retrieveWithExpansions(embedding, expansions, createEmbedding, TOP_K);

      // Prefer articles in the user's language when we have enough
      const sameLanguageArticles = articles.filter((a) => a.language === userLang);
      if (sameLanguageArticles.length >= 3) {
        articles = sameLanguageArticles;
      }

      console.log(`[AI-Mizan] Vector search: ${articles.length} articles across codes: ${[...new Set(articles.map((a: any) => a.code))].join(", ")}`);
    } catch (error) {
      console.error("Retrieval error:", error);
      articles = [];
    }
  }

  // 4) Keyword fallback if vector search returned nothing
  if (articles.length === 0) {
    console.log(`[AI-Mizan] Vector search returned 0, trying keyword fallback…`);
    try {
      articles = await keywordFallback([searchQuery, ...expansions], TOP_K);
      articles = preferLanguage(articles, userLang)
        .sort((a, b) => Number(a.articleNumber) - Number(b.articleNumber))
        .slice(0, TOP_K)
        .map((a: any) => ({ ...a, score: a.score ?? 1 }));
    } catch {
      articles = [];
    }
  }

  console.log(
    `[AI-Mizan] Final: ${articles.length} articles: ${articles.map((a: any) => `${a.code} Art.${a.articleNumber}`).join(", ")}`
  );

  if (articles.length === 0) {
    const prompts = buildClarifyPrompts(userLang);
    return NextResponse.json({
      clarify: true,
      prompts,
      grounded: false,
      model_used: "no-articles-clarify",
      question_type: "NEEDS_CLARIFICATION",
      classifier: cls,
      retrieved_count: 0,
      language: userLang
    });
  }

  // 5) Build context and call LLM (single response call)
  const lawContext = articles
    .map((article, index) => {
      const eff = article.effectiveDate
        ? new Date(article.effectiveDate).toISOString().slice(0, 10)
        : "unknown";
      const codeName = CODE_NAMES[article.code] || article.code;
      return (
        `(${index + 1}) ${article.code} Article ${article.articleNumber} ` +
        `[${codeName}] [${article.language}] Source: ${article.source} Effective: ${eff}\n` +
        `${String(article.text || "").slice(0, 700)}`
      );
    })
    .join("\n\n");

  const systemPrompt = buildSystemPrompt(userLang, isFollowUp);

  // Build LLM messages with conversation history
  const llmMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemPrompt },
  ];

  // Include recent conversation history (last 10 messages max)
  if (isFollowUp) {
    const recentHistory = history.slice(-10);
    for (const msg of recentHistory) {
      llmMessages.push({ role: msg.role, content: msg.content });
    }
  }

  // Current user message with legal context
  const userPrompt =
    `User question: ${question}\n\n` +
    (context ? `User context: ${context}\n\n` : "") +
    `Legal context (articles from the database — answer ONLY from these):\n${lawContext}`;

  llmMessages.push({ role: "user", content: userPrompt });

  let answer = "";
  let modelUsed: string = process.env.DEEPSEEK_MODEL || "deepseek-chat";

  try {
    answer = await generateDeepSeekResponse(llmMessages);

    if (!answer || answer.trim() === "") throw new Error("Empty model response");
    // Strip markdown formatting
    answer = answer.replace(/\*\*(.*?)\*\*/g, "$1").replace(/^#+\s*/gm, "").trim();
  } catch {
    // Fallback: citation-only response
    const citeLine = articles
      .slice(0, 3)
      .map((a) => {
        const eff = a.effectiveDate ? new Date(a.effectiveDate).toISOString().slice(0, 10) : "unknown";
        return `${a.code} Art ${a.articleNumber} (${a.source}, ${eff})`;
      })
      .join("; ");

    answer =
      "Model temporarily unavailable.\n" +
      "Citations: " + citeLine + "\n" +
      "This information is for general legal guidance only and does not constitute legal advice.";
    modelUsed = "local-extractive-fallback";
  }

  // 6) Extract citations from response → match to retrieved articles
  // Match patterns like: family Art 123, penal Art 456, etc.
  const citedNumbers: Array<{ code: string; num: string }> = [];
  const citeRegex = /(family|penal|obligations|civil_procedure)\s*Art(?:icle)?\s*(\d+)/gi;
  let match: RegExpExecArray | null;
  while ((match = citeRegex.exec(answer)) !== null) {
    citedNumbers.push({ code: match[1].toLowerCase(), num: match[2] });
  }
  // Also match generic "Article N" and associate with retrieved articles
  const genericArtRegex = /(?<![\w])Art(?:icle)?\s+(\d+)(?!\d)/gi;
  while ((match = genericArtRegex.exec(answer)) !== null) {
    const num = match[1];
    // If not already captured via code-prefixed pattern, add from retrieved articles
    if (!citedNumbers.some((c) => c.num === num)) {
      const found = articles.find((a) => String(a.articleNumber) === num);
      if (found) {
        citedNumbers.push({ code: found.code, num });
      }
    }
  }

  const finalCitations =
    citedNumbers.length > 0
      ? articles.filter((a) =>
          citedNumbers.some((c) => c.num === String(a.articleNumber) && c.code === a.code)
        )
      : articles.slice(0, 3);

  // 7) Log to database
  let queryId: string | null = null;
  try {
    const qrow = await prisma.chatQuery.create({
      data: { question, answer, grounded: true, ip, userAgent: hdrs.get("user-agent") || undefined }
    });
    queryId = qrow.id;

    if (finalCitations.length > 0) {
      await prisma.chatCitation.createMany({
        data: finalCitations.map((a: any) => ({
          chatQueryId: qrow.id,
          articleId: a.id,
          code: a.code,
          articleNumber: a.articleNumber
        }))
      });
    }
  } catch (dbErr) {
    console.error("[AI-Mizan] DB logging failed:", dbErr);
  }

  return NextResponse.json({
    answer,
    citations: finalCitations.map((a: any) => ({
      code: a.code,
      articleNumber: a.articleNumber,
      source: a.source,
      effectiveDate: a.effectiveDate ? new Date(a.effectiveDate).toISOString().slice(0, 10) : null,
      language: a.language,
      score: a.score ?? null
    })),
    grounded: true,
    queryId,
    model_used: modelUsed,
    retrieved_count: articles.length,
    classifier: cls,
    question_type: cls.decision,
    language: userLang
  });
};
