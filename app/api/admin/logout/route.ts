// app/api/admin/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const POST = async () => {
  // Remove session from store
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (token && globalThis.__adminSessions) {
    (globalThis.__adminSessions as Set<string>).delete(token);
  }

  const response = NextResponse.json({ success: true });
  // Clear both cookies
  response.cookies.set("admin_token", "", { maxAge: 0, path: "/" });
  response.cookies.set("admin_logged_in", "", { maxAge: 0, path: "/" });
  return response;
};
