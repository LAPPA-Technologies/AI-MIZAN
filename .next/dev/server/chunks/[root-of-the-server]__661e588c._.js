module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/validators.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "chatRequestSchema",
    ()=>chatRequestSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
;
const chatRequestSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    question: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(10).max(2000),
    context: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(2000).optional()
});
}),
"[project]/lib/embeddings.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createEmbedding",
    ()=>createEmbedding
]);
const createDeepSeekEmbedding = async (text)=>{
    const key = process.env.DEEPSEEK_API_KEY;
    if (!key) {
        return [];
    }
    const baseUrl = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/$/, "");
    const model = process.env.DEEPSEEK_EMBEDDING_MODEL || "deepseek-embedding";
    let response;
    try {
        response = await fetch(`${baseUrl}/v1/embeddings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${key}`
            },
            body: JSON.stringify({
                model,
                input: text
            })
        });
    } catch (err) {
        console.error("[embeddings] DeepSeek embedding request failed:", err);
        if (("TURBOPACK compile-time value", "development") === "production" && (process.env.EMBEDDINGS_MODE || "").toLowerCase() === "deepseek") //TURBOPACK unreachable
        ;
        return [];
    }
    if (!response.ok) {
        const txt = await response.text().catch(()=>"<no body>");
        console.error("[embeddings] DeepSeek embedding error", response.status, txt);
        if (("TURBOPACK compile-time value", "development") === "production" && (process.env.EMBEDDINGS_MODE || "").toLowerCase() === "deepseek") //TURBOPACK unreachable
        ;
        return [];
    }
    const data = await response.json();
    const emb = data.data[0]?.embedding ?? [];
    return emb.length ? normalizeVector(emb) : [];
};
const DEFAULT_DIM = 256;
const normalizeVector = (vector)=>{
    const norm = Math.sqrt(vector.reduce((sum, value)=>sum + value * value, 0));
    if (!norm) {
        return vector;
    }
    return vector.map((value)=>value / norm);
};
const hashToken = (token)=>{
    let hash = 2166136261;
    for(let i = 0; i < token.length; i += 1){
        hash ^= token.charCodeAt(i);
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return Math.abs(hash);
};
const tokenize = (text)=>{
    return text.toLowerCase().split(/[^A-Za-z0-9\u0600-\u06FF]+/).filter(Boolean);
};
const createLocalEmbedding = (text)=>{
    const dim = Math.max(32, Number.parseInt(process.env.LOCAL_EMBEDDINGS_DIM || "", 10) || DEFAULT_DIM);
    const vector = Array.from({
        length: dim
    }, ()=>0);
    const tokens = tokenize(text);
    tokens.forEach((token)=>{
        const index = hashToken(token) % dim;
        vector[index] += 1;
    });
    return normalizeVector(vector);
};
const createOpenAiEmbedding = async (text)=>{
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
        return [];
    }
    let response;
    try {
        response = await fetch("https://api.openai.com/v1/embeddings", {
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
    } catch (err) {
        console.error("[embeddings] OpenAI request failed:", err);
        if (("TURBOPACK compile-time value", "development") === "production" && (process.env.EMBEDDINGS_MODE || "").toLowerCase() === "openai") //TURBOPACK unreachable
        ;
        return [];
    }
    if (!response.ok) {
        const txt = await response.text().catch(()=>"<no body>");
        console.error("[embeddings] OpenAI error", response.status, txt);
        if (("TURBOPACK compile-time value", "development") === "production" && (process.env.EMBEDDINGS_MODE || "").toLowerCase() === "openai") //TURBOPACK unreachable
        ;
        return [];
    }
    const data = await response.json();
    const emb = data.data[0]?.embedding ?? [];
    return emb.length ? normalizeVector(emb) : [];
};
const createEmbedding = async (text)=>{
    const mode = (process.env.EMBEDDINGS_MODE || "auto").toLowerCase();
    if (mode === "local") {
        return createLocalEmbedding(text);
    }
    if (mode === "openai") {
        return createOpenAiEmbedding(text);
    }
    if (mode === "deepseek") {
        return createDeepSeekEmbedding(text);
    }
    // auto mode: try openai, then deepseek, then local
    const openAiEmbedding = await createOpenAiEmbedding(text);
    if (openAiEmbedding.length) {
        return openAiEmbedding;
    }
    const deepSeekEmbedding = await createDeepSeekEmbedding(text);
    if (deepSeekEmbedding.length) {
        return deepSeekEmbedding;
    }
    return createLocalEmbedding(text);
};
}),
"[project]/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
;
const globalForPrisma = /*TURBOPACK member replacement*/ __turbopack_context__.g;
const prisma = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
    log: [
        "error",
        "warn"
    ]
});
if ("TURBOPACK compile-time truthy", 1) {
    globalForPrisma.prisma = prisma;
}
}),
"[project]/lib/search.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "keywordFallback",
    ()=>keywordFallback,
    "retrieveRelevantArticles",
    ()=>retrieveRelevantArticles
]);
// lib/search.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
;
const cosineSimilarity = (a, b)=>{
    if (a.length !== b.length || a.length === 0) {
        return 0;
    }
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for(let i = 0; i < a.length; i += 1){
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) {
        return 0;
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};
const retrieveRelevantArticles = async (embedding, limit = 5)=>{
    if (!embedding.length) {
        return [];
    }
    const stored = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].lawEmbedding.findMany({
        include: {
            article: true
        }
    });
    const scored = stored.map((item)=>({
            score: cosineSimilarity(embedding, item.embedding),
            article: item.article
        })).filter((item)=>item.score > 0).sort((a, b)=>b.score - a.score).slice(0, limit).map(({ article, score })=>({
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
const keywordFallback = async (question, limit = 4)=>{
    const cleaned = question.trim();
    if (!cleaned) return [];
    // Tokenize into useful terms (avoid tiny/common words)
    const tokens = cleaned.toLowerCase().split(/[^a-z0-9\u0600-\u06FF]+/i).filter(Boolean).filter((t)=>t.length >= 3).slice(0, 8);
    // If tokenization yields nothing (e.g., "??"), fallback to original contains
    const where = tokens.length > 0 ? {
        OR: tokens.map((t)=>({
                text: {
                    contains: t,
                    mode: "insensitive"
                }
            }))
    } : {
        text: {
            contains: cleaned,
            mode: "insensitive"
        }
    };
    const results = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].lawArticle.findMany({
        where,
        orderBy: {
            updatedAt: "desc"
        },
        take: limit
    });
    return results.map((article)=>({
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
}),
"[project]/lib/deepseek.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateDeepSeekResponse",
    ()=>generateDeepSeekResponse
]);
const generateDeepSeekResponse = async (messages, modelOverride)=>{
    const key = process.env.DEEPSEEK_API_KEY;
    if (!key) {
        throw new Error("DEEPSEEK_API_KEY is not configured");
    }
    const baseUrl = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/$/, "");
    const model = modelOverride || process.env.DEEPSEEK_MODEL || "deepseek-chat";
    let response;
    try {
        response = await fetch(`${baseUrl}/v1/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${key}`
            },
            body: JSON.stringify({
                model,
                messages
            })
        });
    } catch (err) {
        console.error("[deepseek] network error:", err);
        throw err;
    }
    if (!response.ok) {
        const errorText = await response.text().catch(()=>"<no body>");
        console.error("[deepseek] API error", response.status, errorText);
        throw new Error(`DeepSeek error: ${response.status} ${errorText}`);
    }
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() ?? "";
    if (!content) {
        console.warn("[deepseek] empty content in response", data);
    }
    return content;
};
}),
"[project]/lib/rateLimit.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkRateLimit",
    ()=>checkRateLimit
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
;
const MAX_REQUESTS = 5;
const WINDOW_MS = 60_000;
const checkRateLimit = async (ip)=>{
    const now = new Date();
    const windowStart = new Date(Math.floor(now.getTime() / WINDOW_MS) * WINDOW_MS);
    const record = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].rateLimit.upsert({
        where: {
            ip_windowStart: {
                ip,
                windowStart
            }
        },
        update: {
            count: {
                increment: 1
            }
        },
        create: {
            ip,
            windowStart,
            count: 1
        }
    });
    return record.count <= MAX_REQUESTS;
};
}),
"[project]/app/api/chat/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
// app/api/chat/route.ts  (or wherever your route.ts lives)
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$validators$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/validators.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$embeddings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/embeddings.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$search$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/search.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$deepseek$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/deepseek.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rateLimit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/rateLimit.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
const preferLanguage = (items, lang)=>{
    const preferred = items.filter((x)=>x.language === lang);
    return preferred.length ? preferred : items; // fallback to any language
};
const POST = async (request)=>{
    const body = await request.json();
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$validators$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["chatRequestSchema"].safeParse(body);
    if (!parsed.success) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Invalid request"
        }, {
            status: 400
        });
    }
    const hdrs = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["headers"])();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const allowed = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rateLimit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkRateLimit"])(ip);
    if (!allowed) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Rate limit exceeded"
        }, {
            status: 429
        });
    }
    const { question, context } = parsed.data;
    const MIN_RELEVANCE = Number.parseFloat(process.env.MIN_RELEVANCE || "0.78");
    const TOP_K = Number.parseInt(process.env.RETRIEVE_TOP_K || "5", 10) || 5;
    const needsSearch = await shouldSearchLawDbDynamic(question);
    // Simple language detection: Arabic if contains Arabic letters, English if contains common English words, else French
    const detectLang = (text)=>{
        if (/\p{Script=Arabic}/u.test(text)) return "ar";
        if (/\b(the|is|are|can|landlord|tenant|evict|rent)\b/i.test(text)) return "en";
        return "fr";
    };
    const userLang = detectLang(question);
    if (!needsSearch) {
        // Small talk: route to DeepSeek directly
        let answer = "";
        let modelUsed = process.env.DEEPSEEK_MODEL || "deepseek-chat";
        try {
            answer = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$deepseek$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateDeepSeekResponse"])([
                {
                    role: "system",
                    content: "AI-Mizan, friendly assistant. Reply conversationally."
                },
                {
                    role: "user",
                    content: question
                }
            ]);
        } catch (err) {
            console.error("[ai-mizan] DeepSeek small-talk error:", err);
            // friendly local fallback
            if (/\b(salam|مرحبا|أهلا)\b/i.test(question)) {
                answer = "سلام — كيف أستطيع مساعدتك اليوم؟";
            } else {
                answer = "Hello — how can I help you today?";
            }
            modelUsed = "local-fallback";
        }
        const userAgent = hdrs.get("user-agent") || undefined;
        const query = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].chatQuery.create({
            data: {
                question,
                answer,
                grounded: false,
                ip,
                userAgent
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            answer,
            citations: [],
            grounded: false,
            queryId: query.id,
            model_used: modelUsed,
            retrieved_count: 0
        });
    }
    // Else: legal/question-like message -> do retrieval
    const embedding = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$embeddings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEmbedding"])(question);
    let retrievalMode = "vector";
    let articles = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$search$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["retrieveRelevantArticles"])(embedding, TOP_K);
    if ("TURBOPACK compile-time truthy", 1) {
        articles = preferLanguage(articles, userLang);
    }
    // If no results after retrieval, try keyword fallback
    if (articles.length === 0) {
        retrievalMode = "keyword";
        let fallbackArticles = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$search$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keywordFallback"])(question, TOP_K);
        if ("TURBOPACK compile-time truthy", 1) {
            fallbackArticles = preferLanguage(fallbackArticles, userLang);
        }
        // keywordFallback now returns score=1, but keep this as a guard
        articles = fallbackArticles.map((a)=>({
                ...a,
                score: a.score ?? 1
            }));
    }
    // If still empty, return generic response (but don't claim DB is empty)
    if (articles.length === 0) {
        const fallbackPhraseFr = "Je n’ai pas trouvé d’article pertinent dans la base de données pour cette question.";
        const fallbackPhraseAr = "لم أجد مادة قانونية ذات صلة في قاعدة البيانات لهذا السؤال.";
        const fallbackPhraseEn = "I did not find a relevant law article in the database for this question.";
        const briefGeneralFr = "Voici une réponse générale basée sur les informations disponibles :\n\n(Je ne suis pas un avocat; pour un avis personnalisé, consultez un professionnel.)";
        const briefGeneralAr = "إليك إجابة عامة بناءً على المعلومات المتاحة:\n\n(لست محاميًا؛ للحصول على رأي مخصص، استشر مختصًا).";
        const briefGeneralEn = "Here is a general answer based on available information:\n\n(I'm not a lawyer; for tailored advice consult a licensed professional.)";
        const combined = userLang === "fr" ? `${fallbackPhraseFr}\n\n${briefGeneralFr}` : userLang === "ar" ? `${fallbackPhraseAr}\n\n${briefGeneralAr}` : `${fallbackPhraseEn}\n\n${briefGeneralEn}`;
        const userAgent = hdrs.get("user-agent") || undefined;
        const query = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].chatQuery.create({
            data: {
                question,
                answer: combined,
                grounded: false,
                ip,
                userAgent
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            answer: combined,
            citations: [],
            grounded: false,
            queryId: query.id,
            model_used: "local-extractive",
            retrieved_count: 0
        });
    }
    const lawContext = articles.map((article, index)=>`(${index + 1}) ${article.code} Article ${article.articleNumber} ` + `[${article.language}] Source: ${article.source} ` + `Effective: ${article.effectiveDate?.toISOString().slice(0, 10) ?? "unknown"}\n` + `${article.text}`).join("\n\n");
    // Detect greetings/basic messages
    const isGreeting = /^(hi|hello|bonjour|salam|hey|مرحبا|أهلا|good morning|good evening)/i.test(question.trim());
    let systemPrompt = "";
    let userPrompt = "";
    // Note: if we are here, we already "needSearch", so treat as legal.
    // We'll still answer conversationally if the user mixed a greeting + question.
    systemPrompt = "You are AI-Mizan, a professional Moroccan legal advisor. " + "You provide structured, precise, and authoritative legal explanations based strictly on the provided legal context.\n\n" + "RESPONSE STRUCTURE:\n" + "1) Short Legal Answer – clear and direct conclusion.\n" + "2) Legal Basis – cite relevant law_code, article_number, source_ref, and effective_date exactly as provided.\n" + "3) Practical Implication – explain what this means for the user in real life.\n" + "4) If relevant, briefly mention exceptions or conditions.\n\n" + "CITATION RULES:\n" + "- Only cite articles included in the provided context.\n" + "- Never invent laws, articles, or legal procedures.\n" + "- If no relevant article is found, clearly state that and provide a general explanation without fabricating legal authority.\n\n" + "TONE:\n" + "- Professional, neutral, and confident.\n" + "- Avoid casual phrases.\n" + "- Avoid emotional language.\n" + "- No emojis.\n" + "- No exaggerated claims.\n\n" + "LANGUAGE:\n" + "- Match the user's language.\n" + "- If user writes in Darija, explain in clear Moroccan Darija while keeping legal precision.\n\n" + "IMPORTANT:\n" + "- Do not provide personalized legal representation.\n" + "- Add a brief professional disclaimer at the end: 'This information is provided for general legal guidance and does not constitute legal advice.'";
    "The style of the answer should be concise and structured, suitable for a user seeking legal information based on the cited articles. and should not include any information that is not directly supported by the cited articles.\n\n" + "If the question is a simple greeting or does not require legal information, respond conversationally without citing articles, but still maintain a professional tone.";
    userPrompt = (isGreeting ? `Greeting: ${question}\n\n` : `Question: ${question}\n\n`) + (context ? `Context: ${context}\n\n` : "") + `Relevant law articles:\n${lawContext}`;
    const buildLocalAnswer = ()=>{
        const lines = articles.map((article)=>{
            const effective = article.effectiveDate ? article.effectiveDate.toISOString().slice(0, 10) : "unknown";
            return `- ${article.code} Article ${article.articleNumber} ` + `(${article.source}, ${effective})\n` + `${article.text}`;
        });
        return "Based on the retrieved legal articles, here is the relevant context:\n\n" + `${lines.join("\n\n")}\n\n` + "If you need a tailored legal opinion, please consult a licensed lawyer.";
    };
    console.log("[ai-mizan] retrieved", articles.map((article)=>article.id), "retrievalMode", retrievalMode, "model", process.env.DEEPSEEK_MODEL || "deepseek-chat");
    let answer = "";
    let modelUsed = process.env.DEEPSEEK_MODEL || "deepseek-chat";
    // Local fallback: if no DeepSeek API key, always use local extractive answer
    if (!process.env.DEEPSEEK_API_KEY) {
        answer = buildLocalAnswer();
        modelUsed = "local-extractive";
    } else {
        try {
            answer = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$deepseek$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateDeepSeekResponse"])([
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: userPrompt
                }
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
    const topScore = Math.max(...articles.map((a)=>a.score ?? 0));
    const grounded = retrievalMode === "keyword" ? true : topScore >= MIN_RELEVANCE;
    // If vector score is low, don't throw away citations; just reduce certainty
    // (We keep grounded=false but still return the best matching articles as citations.)
    const userAgent = hdrs.get("user-agent") || undefined;
    const query = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].chatQuery.create({
        data: {
            question,
            answer,
            grounded,
            ip,
            userAgent
        }
    });
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].chatCitation.createMany({
        data: articles.map((article)=>({
                chatQueryId: query.id,
                articleId: article.id,
                code: article.code,
                articleNumber: article.articleNumber
            }))
    });
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        answer,
        citations: articles.map((article)=>({
                code: article.code,
                articleNumber: article.articleNumber,
                source: article.source,
                effectiveDate: article.effectiveDate ? article.effectiveDate.toISOString().slice(0, 10) : null,
                language: article.language,
                score: article.score ?? null
            })),
        grounded,
        queryId: query.id,
        model_used: modelUsed,
        retrieved_count: articles.length,
        top_score: topScore
    });
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__661e588c._.js.map