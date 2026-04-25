"use client";

import { useState } from "react";

interface SimulatorResultCardProps {
  title: string;
  slug: string;
  children: React.ReactNode;
  lang: string;
  shareParams?: Record<string, string>;
  disclaimer?: string;
  dict: Record<string, string>;
  onReset?: () => void;
}

export default function SimulatorResultCard({
  title,
  slug,
  children,
  lang,
  shareParams,
  disclaimer,
  dict,
  onReset,
}: SimulatorResultCardProps) {
  const [copied, setCopied] = useState(false);
  const isRtl = lang === "ar";

  function buildShareUrl() {
    if (typeof window === "undefined") return "";
    const params = shareParams ? "?" + new URLSearchParams(shareParams).toString() : "";
    return window.location.origin + "/simulateurs/" + slug + params;
  }

  function handleWhatsApp() {
    const url = buildShareUrl();
    const text = title + " — AI-Mizan\n" + url;
    window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank", "noopener");
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing silently
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 p-5"
    >
      {/* Result title + action buttons */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-semibold text-emerald-900">{dict.simResultTitle || title}</h3>
        <div className="flex flex-col gap-2 sm:flex-row">
          {/* WhatsApp */}
          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#1ebe5d] transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 1.869.43 3.637 1.19 5.208L0 24l6.986-1.168A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.371l-.36-.214-3.732.623.633-3.648-.235-.374A9.818 9.818 0 1112 21.818z" />
            </svg>
            <span>{dict.simShareWhatsApp}</span>
          </button>

          {/* Copy link */}
          <button
            onClick={handleCopy}
            className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              copied
                ? "bg-emerald-600 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            <span>{copied ? dict.simCopied : dict.simCopyLink}</span>
          </button>

          {/* Download PDF */}
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            <span>{dict.simDownloadPDF}</span>
          </button>
        </div>
      </div>

      {/* Calculator results */}
      {children}

      {/* Disclaimer */}
      <p className="mt-4 border-t border-emerald-100 pt-3 text-xs text-amber-800">
        {disclaimer ?? dict.simResultDisclaimer}
      </p>

      {/* Reset */}
      {onReset && (
        <button
          onClick={onReset}
          className="mt-3 text-sm text-emerald-700 hover:text-emerald-900 hover:underline"
        >
          {isRtl ? dict.simNewCalculation + " →" : "← " + dict.simNewCalculation}
        </button>
      )}
    </div>
  );
}
