const createDeepSeekEmbedding = async (text: string) => {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) {
    return [] as number[];
  }
  const baseUrl = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/$/, "");
  const model = process.env.DEEPSEEK_EMBEDDING_MODEL || "deepseek-embedding";
  let response: Response;
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
    if (process.env.NODE_ENV === "production" && (process.env.EMBEDDINGS_MODE || "").toLowerCase() === "deepseek") {
      throw new Error("DeepSeek embedding request failed: " + String(err));
    }
    return [] as number[];
  }
  if (!response.ok) {
    const txt = await response.text().catch(() => "<no body>");
    console.error("[embeddings] DeepSeek embedding error", response.status, txt);
    if (process.env.NODE_ENV === "production" && (process.env.EMBEDDINGS_MODE || "").toLowerCase() === "deepseek") {
      throw new Error(`DeepSeek embedding error ${response.status}: ${txt}`);
    }
    return [] as number[];
  }
  const data = (await response.json()) as {
    data: Array<{ embedding: number[] }>;
  };
  const emb = data.data[0]?.embedding ?? [];
  return emb.length ? normalizeVector(emb) : [];
};
const DEFAULT_DIM = 256;

const normalizeVector = (vector: number[]) => {
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (!norm) {
    return vector;
  }
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

const createOpenAiEmbedding = async (text: string) => {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return [] as number[];
  }
  let response: Response;
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
    if (process.env.NODE_ENV === "production" && (process.env.EMBEDDINGS_MODE || "").toLowerCase() === "openai") {
      throw new Error("OpenAI embedding request failed: " + String(err));
    }
    return [] as number[];
  }
  if (!response.ok) {
    const txt = await response.text().catch(() => "<no body>");
    console.error("[embeddings] OpenAI error", response.status, txt);
    if (process.env.NODE_ENV === "production" && (process.env.EMBEDDINGS_MODE || "").toLowerCase() === "openai") {
      throw new Error(`OpenAI embedding error ${response.status}: ${txt}`);
    }
    return [] as number[];
  }
  const data = (await response.json()) as {
    data: Array<{ embedding: number[] }>;
  };
  const emb = data.data[0]?.embedding ?? [];
  return emb.length ? normalizeVector(emb) : [];
};

export const createEmbedding = async (text: string) => {
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

  // auto mode: try deepseek, fall back to local hash embeddings
  const deepSeekEmbedding = await createDeepSeekEmbedding(text);
  if (deepSeekEmbedding.length) {
    return deepSeekEmbedding;
  }
  return createLocalEmbedding(text);
};
