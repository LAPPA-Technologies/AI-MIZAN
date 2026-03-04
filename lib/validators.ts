import { z } from "zod";

const historyMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(4000),
});

export const chatRequestSchema = z.object({
  question: z.string().trim().min(1).max(2000),
  context: z.string().max(2000).optional(),
  /** Recent conversation messages for follow-up context. */
  history: z.array(historyMessageSchema).max(20).optional(),
  // Optional language hint: only allow these four locales
  language: z.enum(["en", "fr", "ar", "darija"]).optional()
});