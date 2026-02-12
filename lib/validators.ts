import { z } from "zod";

export const chatRequestSchema = z.object({
  question: z.string().trim().min(1).max(2000),
  context: z.string().max(2000).optional(),
  // Optional language hint: only allow these four locales
  language: z.enum(["en", "fr", "ar", "darija"]).optional()
});