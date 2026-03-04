// lib/adminAuth.ts
// Admin-only access gate for protected features (e.g., Chat)
// V2: Session-based auth — cookie stores opaque session token, not raw secret

const ADMIN_COOKIE_NAME = "admin_token";
const ADMIN_FLAG_COOKIE = "admin_logged_in";

// Declare global session store type
declare global {
  // eslint-disable-next-line no-var
  var __adminSessions: Set<string> | undefined;
}

/**
 * Server-side: Check if the current request has valid admin session.
 * Reads opaque session token from httpOnly cookie.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) return false;

  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return false;

    // Check against session store
    const sessions = globalThis.__adminSessions;
    if (sessions?.has(token)) return true;

    // Fallback: also accept the raw secret for backward compat during transition
    // This allows existing logged-in users to remain authenticated
    const crypto = await import("crypto");
    if (token.length === adminSecret.length) {
      const equal = crypto.timingSafeEqual(
        Buffer.from(token),
        Buffer.from(adminSecret)
      );
      if (equal) return true;
    }

    return false;
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
