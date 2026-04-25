// app/api/admin/login/route.ts
// Admin authentication endpoint — secured
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { checkRateLimit } from "../../../../lib/rateLimit";
import crypto from "crypto";

/** Timing-safe string comparison to prevent timing attacks */
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still do a comparison to keep constant-ish time, then return false
    crypto.timingSafeEqual(Buffer.from(a), Buffer.from(a));
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export const POST = async (request: Request) => {
  // Rate-limit login attempts
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const allowed = await checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);

  if (!body?.token || typeof body.token !== "string" || body.token.length > 256) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return NextResponse.json({ error: "Admin access not configured" }, { status: 503 });
  }

  if (!safeCompare(body.token, adminSecret)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Generate a deterministic HMAC-signed session token.
  // This avoids in-memory session stores that break on Vercel serverless
  // (each invocation may be a fresh process with no shared memory).
  // Security: only someone who knows ADMIN_SECRET can produce a valid token.
  const sessionToken = crypto
    .createHmac("sha256", adminSecret)
    .update("ai-mizan-admin-session-v1")
    .digest("hex");

  const response = NextResponse.json({ success: true });

  // httpOnly cookie for server-side auth verification
  response.cookies.set("admin_token", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 86400,
    path: "/",
  });

  // Separate non-httpOnly flag cookie so client JS knows user is logged in
  // This does NOT contain the secret — just a flag
  response.cookies.set("admin_logged_in", "1", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 86400,
    path: "/",
  });

  return response;
};
