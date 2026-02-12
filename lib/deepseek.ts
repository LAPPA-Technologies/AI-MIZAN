type DeepSeekMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type DeepSeekResponse = {
  choices?: Array<{
    message?: { content?: string };
  }>;
};

export const generateDeepSeekResponse = async (
  messages: DeepSeekMessage[],
  modelOverride?: string
) => {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) {
    throw new Error("DEEPSEEK_API_KEY is not configured");
  }

  const baseUrl = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/$/, "");
  const model = modelOverride || process.env.DEEPSEEK_MODEL || "deepseek-chat";

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({
        model,
        messages,
        // Small talk is short: keep it stable + cheap
        temperature: 0.2,
        max_tokens: 200
      })
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

  // ✅ IMPORTANT: do not return empty content silently
  if (!content) {
    console.warn("[deepseek] empty content in response", data);
    throw new Error("DeepSeek returned empty content");
  }

  return content;
};