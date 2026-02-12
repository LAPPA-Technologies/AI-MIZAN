type ResponsesMessage = {
  role: "system" | "user";
  content: string;
};

export const generateResponse = async (messages: ResponsesMessage[]) => {
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
      input: messages.map((message) => ({
        role: message.role,
        content: message.content
      }))
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI error: ${error}`);
  }

  const data = (await response.json()) as {
    output_text?: string;
    output?: Array<{ content?: Array<{ text?: string }> }>;
  };

  if (data.output_text) {
    return data.output_text;
  }

  const outputText = (data.output ?? [])
    .flatMap((item) => item.content ?? [])
    .map((item) => item.text ?? "")
    .join("\n")
    .trim();

  return outputText || "";
};
