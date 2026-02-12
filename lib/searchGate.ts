import { generateDeepSeekResponse } from "./deepseek";

type Route = "chat" | "law";

const fastHeuristic = (q: string): Route | "ambiguous" => {
  const text = q.trim().toLowerCase();
  if (!text) return "chat";

  // obvious small talk / reaction
  if (text.length <= 12 && /^[a-z\u0600-\u06FF!?.,\s]+$/i.test(text)) return "chat";

  // obvious legal keywords (small list is fine)
  const legalHints = ["evict", "landlord", "tenant", "contrat", "loi", "article", "tribunal", "court", "licenciement", "expulsion", "قانون", "محكمة"];
  if (legalHints.some(k => text.includes(k))) return "law";

  // ambiguous
  return "ambiguous";
};

export const shouldSearchLawDbDynamic = async (question: string) => {
  const h = fastHeuristic(question);
  if (h !== "ambiguous") return h === "law";

  // DeepSeek classifier for ambiguous cases
  const raw = await generateDeepSeekResponse([
    { role: "system", content: "You are an intent router for AI-Mizan. Output ONLY valid JSON, nothing else." },
    {
      role: "user",
      content:
        'Decide whether the user message should trigger a legal database search.\n' +
        'Return JSON exactly like {"route":"law","confidence":0.0,"reason":"..."} or {"route":"chat","confidence":0.0,"reason":"..."}.\n' +
        'Rules: route="chat" for greetings, acknowledgements, small talk, reactions, short follow-ups (e.g., "hi", "really?", "ok", "thanks").\n' +
        'route="law" ONLY if asking about law, rights, procedures, obligations, eviction, employment, family law.\n' +
        'If ambiguous, choose "chat".\n' +
        `User message: """${question}"""`
    }
  ]);

  try {
    const parsed = JSON.parse(raw) as { route: Route; confidence?: number; reason?: string };
    return parsed.route === "law";
  } catch {
    // safest default
    return false;
  }
};

// Synchronous helper used by the chat route to quickly decide whether
// to run a DB search. This avoids calling the remote classifier and
// prevents runtime import/call mismatches when the route expects a
// sync function named `shouldSearchLawDb`.
export const shouldSearchLawDb = (message: string): boolean => {
  const h = fastHeuristic(message);
  if (h !== "ambiguous") return h === "law";
  return false;
};