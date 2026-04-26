"use client";

import { useEffect, useState } from "react";
import type { ArticleRef } from "../../lib/calculatorArticles";

type ArticleModalProps = {
  articleRef: ArticleRef | null;
  lang: string;
  dict: Record<string, string>;
  onClose: () => void;
};

export default function ArticleModal({ articleRef, lang, dict, onClose }: ArticleModalProps) {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const isRtl = lang === "ar";
  const isOpen = !!articleRef;

  useEffect(() => {
    if (!articleRef) { setText(null); setNotFound(false); return; }
    setLoading(true); setText(null); setNotFound(false);
    fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        citations: [{ code: articleRef.code, articleNumber: articleRef.articleNumber }],
        language: lang,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        const article = data.articles?.[0];
        if (article?.text) setText(article.text);
        else setNotFound(true);
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [articleRef?.code, articleRef?.articleNumber, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const desc = lang === "ar" ? articleRef.descAr : lang === "fr" ? articleRef.descFr : articleRef.descEn;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel — bottom sheet on all screen sizes, centered on desktop */}
      <div
        className="relative w-full md:max-w-2xl bg-white rounded-t-2xl shadow-2xl flex flex-col max-h-[80vh] md:max-h-[70vh]"
        style={{ animation: "modalSlideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1)" }}
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 md:px-8 flex items-start justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-green-700 mb-1">
              {dict.articleLabel || "Article"}
            </p>
            <p className="text-2xl font-bold text-slate-900 leading-tight">
              {articleRef.articleNumber}
            </p>
            {desc && <p className="text-sm text-slate-500 mt-1 leading-snug">{desc}</p>}
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 transition-colors shrink-0 mt-1"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 md:px-8 md:py-6">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-green-600" />
              <span className="text-sm">{dict.simArticleLoading || "Loading..."}</span>
            </div>
          )}
          {notFound && (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-slate-500">{dict.simArticleNotFound || "Article not available"}</p>
            </div>
          )}
          {text && (
            <p className="text-base text-slate-700 leading-8 whitespace-pre-wrap">{text}</p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-5 py-4 md:px-8 shrink-0">
          <a
            href={`/laws/${articleRef.code}/articles/${articleRef.articleNumber}?lang=${lang}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-900 transition-colors"
          >
            <span>{dict.simOpenFullPage || "Open full article"}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      <style jsx global>{`
        @keyframes modalSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
