"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getClientDictionary } from "../lib/i18nClient";

/**
 * ChatAccessGate — Wraps the chat page.
 * If NEXT_PUBLIC_CHAT_PUBLIC=true, chat is open to everyone.
 * Otherwise, requires admin_logged_in flag cookie.
 */
export default function ChatAccessGate({ children }: { children: React.ReactNode }) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const dict = getClientDictionary();

  useEffect(() => {
    const isPublic = process.env.NEXT_PUBLIC_CHAT_PUBLIC === "true";
    if (isPublic) {
      setHasAccess(true);
      return;
    }
    // Check the non-httpOnly flag cookie (doesn't contain the secret)
    setHasAccess(document.cookie.includes("admin_logged_in=1"));
  }, []);

  if (hasAccess === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 text-slate-500">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm">{dict.chatCheckingAccess}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-lg text-center space-y-6">
          <div className="surface space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 border border-slate-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">{dict.chatAdminOnly}</h1>
              <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                {dict.chatAdminDescription}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/admin" className="btn-primary">
                {dict.chatAdminLogin}
              </Link>
              <Link href="/laws" className="btn-outline">
                {dict.chatBrowseLaws}
              </Link>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <p className="text-xs text-slate-400">
                {dict.chatAccessNeedHelp}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
