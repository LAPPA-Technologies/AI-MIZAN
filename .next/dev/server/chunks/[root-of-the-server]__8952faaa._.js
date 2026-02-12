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
const createEmbedding = async (text)=>{
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
        return [];
    }
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
    if (!response.ok) {
        return [];
    }
    const data = await response.json();
    return data.data[0]?.embedding ?? [];
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
const retrieveRelevantArticles = async (embedding, limit = 4)=>{
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
        })).filter((item)=>item.score > 0).sort((a, b)=>b.score - a.score).slice(0, limit).map(({ article })=>({
            id: article.id,
            code: article.code,
            chapter: article.chapter,
            articleNumber: article.articleNumber,
            language: article.language,
            text: article.text,
            source: article.source,
            updatedAt: article.updatedAt
        }));
    return scored;
};
const keywordFallback = async (question, limit = 4)=>{
    const results = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].lawArticle.findMany({
        where: {
            text: {
                contains: question,
                mode: "insensitive"
            }
        },
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
            updatedAt: article.updatedAt
        }));
};
}),
"[project]/lib/openai.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateResponse",
    ()=>generateResponse
]);
const generateResponse = async (messages)=>{
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
        throw new Error("OPENAI_API_KEY is not configured");
    }
    const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`
        },
        body: JSON.stringify({
            model: "gpt-4.1-mini",
            input: messages.map((message)=>({
                    role: message.role,
                    content: message.content
                }))
        })
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI error: ${error}`);
    }
    const data = await response.json();
    if (data.output_text) {
        return data.output_text;
    }
    const outputText = (data.output ?? []).flatMap((item)=>item.content ?? []).map((item)=>item.text ?? "").join("\n").trim();
    return outputText || "";
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$validators$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/validators.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$embeddings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/embeddings.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$search$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/search.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$openai$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/openai.ts [app-route] (ecmascript)");
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
    const ip = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["headers"])().get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const allowed = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rateLimit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkRateLimit"])(ip);
    if (!allowed) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Rate limit exceeded"
        }, {
            status: 429
        });
    }
    const { question, context } = parsed.data;
    const embedding = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$embeddings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEmbedding"])(question);
    let articles = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$search$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["retrieveRelevantArticles"])(embedding);
    if (articles.length === 0) {
        articles = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$search$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keywordFallback"])(question);
    }
    if (articles.length === 0) {
        const declined = "I cannot answer reliably because I could not find relevant law articles. " + "Please consult a licensed lawyer.";
        const query = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].chatQuery.create({
            data: {
                question,
                answer: declined,
                grounded: false,
                ip,
                userAgent: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["headers"])().get("user-agent") || undefined
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            answer: declined,
            citations: [],
            grounded: false,
            queryId: query.id
        });
    }
    const lawContext = articles.map((article, index)=>`(${index + 1}) ${article.code} Article ${article.articleNumber} [${article.language}]\n${article.text}`).join("\n\n");
    const systemPrompt = "You are AI-Mizan, a Moroccan legal guidance assistant. " + "Always answer with: legal explanation, relevant articles, practical next steps, and when to consult a lawyer. " + "If you do not have enough context, say so clearly. " + "Cite articles using their code and article number.";
    const userPrompt = `Question: ${question}\n\n` + (context ? `Context: ${context}\n\n` : "") + `Relevant law articles:\n${lawContext}`;
    try {
        const answer = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$openai$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateResponse"])([
            {
                role: "system",
                content: systemPrompt
            },
            {
                role: "user",
                content: userPrompt
            }
        ]);
        const query = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].chatQuery.create({
            data: {
                question,
                answer,
                grounded: true,
                ip,
                userAgent: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["headers"])().get("user-agent") || undefined
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
                    articleNumber: article.articleNumber
                })),
            grounded: true,
            queryId: query.id
        });
    } catch (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to generate response"
        }, {
            status: 500
        });
    }
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__8952faaa._.js.map