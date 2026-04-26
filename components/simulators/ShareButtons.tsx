"use client";

import { useState } from "react";

type ShareButtonsProps = {
  title: string;
  slug: string;
  shareParams?: Record<string, string>;
  dict: Record<string, string>;
};

export default function ShareButtons({ title, slug, shareParams, dict }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

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
      // clipboard not available — silent fail
    }
  }

  return (
    <div className="border-t border-green-200 pt-4 mt-2 space-y-2">
      {/* WhatsApp — full width */}
      <button
        type="button"
        onClick={handleWhatsApp}
        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-lg py-3 font-bold transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 1.869.43 3.637 1.19 5.208L0 24l6.986-1.168A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.371l-.36-.214-3.732.623.633-3.648-.235-.374A9.818 9.818 0 1112 21.818z" />
        </svg>
        <span>{dict.simShareWhatsApp || "مشاركة على واتساب"} 📲</span>
      </button>

      {/* Copy + Print — side by side */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
            copied
              ? "border-green-300 bg-green-50 text-green-700"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          {copied ? (dict.simCopied || "تم النسخ!") : (dict.simCopyLink || "نسخ الرابط") + " 🔗"}
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex-1 rounded-lg border border-slate-200 bg-white py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          {dict.simDownloadPDF || "طباعة PDF"} 🖨️
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-amber-800 pt-1">
        {dict.simResultDisclaimer}
      </p>
    </div>
  );
}
