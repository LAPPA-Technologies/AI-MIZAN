import { prisma } from "./prisma";

const MAX_REQUESTS = 5;
const WINDOW_MS = 60_000;

export const checkRateLimit = async (ip: string) => {
  const now = new Date();
  const windowStart = new Date(Math.floor(now.getTime() / WINDOW_MS) * WINDOW_MS);

  const record = await prisma.rateLimit.upsert({
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
