"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getClientDictionary } from "../../lib/i18nClient";

export default function AdminLoginPage() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dict = getClientDictionary();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (res.ok) {
        router.push("/chat");
      } else {
        const data = await res.json();
        setError(data.error || dict.adminError);
      }
    } catch {
      setError(dict.adminNetworkError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="surface text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 border border-green-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">{dict.adminTitle}</h1>
            <p className="mt-2 text-sm text-slate-600">{dict.adminDescription}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-start">
            <div>
              <label htmlFor="admin-token" className="block text-sm font-medium text-slate-700 mb-1">
                {dict.adminTokenLabel}
              </label>
              <input
                id="admin-token"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder={dict.adminTokenPlaceholder}
                className="input-shell w-full"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !token}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? dict.adminAuthenticating : dict.adminSignIn}
            </button>
          </form>

          <p className="text-xs text-slate-400">{dict.adminRestricted}</p>
        </div>
      </div>
    </div>
  );
}
