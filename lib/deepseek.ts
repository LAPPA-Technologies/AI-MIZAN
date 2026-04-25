export type DeepSeekMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type DeepSeekResponse = {
  choices?: Array<{
    message?: { content?: string };
    delta?: { content?: string };
    finish_reason?: string | null;
  }>;
};

const getDeepSeekConfig = () => {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error("DEEPSEEK_API_KEY is not configured");
  const baseUrl = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/$/, "");
  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";
  return { key, baseUrl, model };
};

/** Non-streaming: returns full response as a string. */
export const generateDeepSeekResponse = async (
  messages: DeepSeekMessage[],
  modelOverride?: string
): Promise<string> => {
  const { key, baseUrl, model } = getDeepSeekConfig();
  const resolvedModel = modelOverride || model;

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: resolvedModel, messages, temperature: 0.1, max_tokens: 1200 }),
    });
  } catch (err) {
    console.error("[deepseek] network error:", err);
    throw err;
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => "<no body>");
    console.error("[deepseek] API error", response.status, errorText);
    throw new Error(`DeepSeek error: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as DeepSeekResponse;
  const content = data.choices?.[0]?.message?.content?.trim() ?? "";
  if (!content) throw new Error("DeepSeek returned empty content");
  return content;
};

/**
 * Streaming generator — yields text chunks as they arrive from DeepSeek.
 * Uses the OpenAI-compatible SSE format (data: {...}\n\n).
 */
export async function* streamDeepSeek(
  messages: DeepSeekMessage[],
  modelOverride?: string,
  signal?: AbortSignal
): AsyncGenerator<string, void, unknown> {
  const { key, baseUrl, model } = getDeepSeekConfig();
  const resolvedModel = modelOverride || model;

  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: resolvedModel,
      messages,
      temperature: 0.1,
      max_tokens: 1200,
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    const err = await response.text().catch(() => "");
    throw new Error(`DeepSeek streaming error ${response.status}: ${err}`);
  }
  if (!response.body) throw new Error("DeepSeek: no response body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") return;
        try {
          const parsed = JSON.parse(payload) as DeepSeekResponse;
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch {
          // ignore malformed SSE chunks
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}