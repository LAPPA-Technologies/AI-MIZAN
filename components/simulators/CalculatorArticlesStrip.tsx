"use client";

import type { ArticleRef } from "../../lib/calculatorArticles";

type CalculatorArticlesStripProps = {
  articles: ArticleRef[];
  lang: string;
  dict: Record<string, string>;
  onArticleClick: (ref: ArticleRef) => void;
};

export default function CalculatorArticlesStrip({ articles, lang, dict, onArticleClick }: CalculatorArticlesStripProps) {
  const isRtl = lang === "ar";

  return (
    <div className="mt-5" dir={isRtl ? "rtl" : "ltr"}>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
        {dict.simLegalRefsTitle || "Legal References"}
      </p>
      <div className="flex flex-wrap gap-2">
        {articles.map((ref) => {
          const desc = lang === "ar" ? ref.descAr : lang === "fr" ? ref.descFr : ref.descEn;
          const docIcon = (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c.621 0 1.125.504 1.125 1.125v17.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V3.375c0-.621.504-1.125 1.125-1.125z" />
            </svg>
          );

          // External law not in DB — non-clickable, honest display
          if (ref.inDb === false) {
            return (
              <span
                key={`${ref.code}-${ref.articleNumber}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-slate-300 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 cursor-default"
                title={lang === "ar" ? "هذا القانون غير متوفر في قاعدة البيانات بعد" : lang === "fr" ? "Cette loi n'est pas encore dans la base de données" : "This law is not yet in the database"}
              >
                {docIcon}
                <span className="max-w-[260px] truncate">{desc}</span>
              </span>
            );
          }

          return (
            <button
              key={`${ref.code}-${ref.articleNumber}`}
              type="button"
              onClick={() => onArticleClick(ref)}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-green-300 hover:bg-green-50 hover:text-green-700 transition-colors shadow-sm"
            >
              {docIcon}
              <span className="font-semibold">{dict.simReadArticle || "Art."} {ref.articleNumber}</span>
              <span className="text-slate-400 max-w-[140px] truncate">— {desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
