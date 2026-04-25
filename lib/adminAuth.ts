// lib/adminAuth.ts
// Admin-only access gate for protected features (e.g., Chat)
// V2: Session-based auth — cookie stores opaque session token, not raw secret

const ADMIN_COOKIE_NAME = "admin_token";
const ADMIN_FLAG_COOKIE = "admin_logged_in";

/**
 * Server-side: Check if the current request has valid admin session.
 * Verifies the HMAC-signed token from the httpOnly cookie.
 * This approach is safe on Vercel serverless (no in-memory state required).
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) return false;

  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return false;

    // Verify the HMAC-derived session token (constant-time comparison)
    const crypto = await import("crypto");
    const expected = crypto
      .createHmac("sha256", adminSecret)
      .update("ai-mizan-admin-session-v1")
      .digest("hex");

    if (token.length !== expected.length) return false;
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

/**
 * Client-side: Check if admin flag cookie exists (non-httpOnly).
 */
export function isAdminClient(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.includes(`${ADMIN_FLAG_COOKIE}=1`);
}

/**
 * Client-side: Clear admin cookies.
 */
export function clearAdminToken(): void {
  document.cookie = `${ADMIN_FLAG_COOKIE}=; path=/; max-age=0`;
  // The httpOnly cookie can only be cleared server-side via /api/admin/logout
}

export { ADMIN_COOKIE_NAME, ADMIN_FLAG_COOKIE };
