// app/api/admin/logout/route.ts
import { NextResponse } from "next/server";

export const POST = async () => {
  const response = NextResponse.json({ success: true });
  // Clear both cookies — the HMAC token is stateless so no server-side cleanup needed
  response.cookies.set("admin_token", "", { maxAge: 0, path: "/" });
  response.cookies.set("admin_logged_in", "", { maxAge: 0, path: "/" });
  return response;
};
