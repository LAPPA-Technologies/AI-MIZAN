"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Row } from "./Row";
import { fmt } from "../../lib/simulatorHelpers";
import CalculatorArticlesStrip from "./CalculatorArticlesStrip";
import ArticleModal from "../laws/ArticleModal";
import { CALCULATOR_ARTICLES, RELATED_CALCULATORS, type ArticleRef } from "../../lib/calculatorArticles";
import ShareButtons from "./ShareButtons";

function calcRent(monthlyRent: number) {
  return { maxDeposit: monthlyRent * 2, noticePeriod: monthlyRent > 4000 ? 3 : 2 };
}

interface LoyerCalculatorProps {
  dict: Record<string, string>;
  lang: string;
  initialRent?: number;
}

export default function LoyerCalculator({ dict, lang, initialRent }: LoyerCalculatorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [rent, setRent] = useState(initialRent ? String(initialRent) : "");
  const [result, setResult] = useState<ReturnType<typeof calcRent> | null>(
    initialRent && initialRent > 0 ? calcRent(initialRent) : null
  );
  const [error, setError] = useState("");
  const [modalArticle, setModalArticle] = useState<ArticleRef | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRtl = lang === "ar";

  useEffect(() => {
    if (rent) router.replace(`${pathname}?loyer=${rent}`, { scroll: false });
  }, [rent]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const val = parseFloat(rent);
      if (!isNaN(val) && val > 0) { setError(""); setResult(calcRent(val)); }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [rent]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rent) { setError(dict.simErrorRequired || "Please enter a value"); return; }
    const val = parseFloat(rent);
    if (isNaN(val) || val <= 0) { setError(dict.simErrorPositive || "Please enter a positive number"); return; }
    setError(""); setResult(calcRent(val));
  };

  return (
    <div className="space-y-5" dir={isRtl ? "rtl" : "ltr"}>
      {/* Zone 2: Input Card */}
      <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <label htmlFor="rent-monthly" className="block text-sm font-semibold text-slate-700 mb-1.5">
            {dict.simRentMonthly}
          </label>
          <input
            id="rent-monthly" type="number" min="0"
            value={rent}
            onChange={(e) => { setRent(e.target.value); setResult(null); setError(""); }}
            placeholder="5000"
            className="input-shell w-full"
          />
          {error && <p className="text-red-600 text-sm mt-1.5">{error}</p>}
        </div>
        <button type="submit" className="btn-primary w-full py-2.5">
          {dict.simSalaryCalculate}
        </button>
      </form>

      {/* Zone 3: Result Card */}
      {result && (
        <div style={{ animation: "simSlideUp 0.3s ease forwards" }}>
          <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-6 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
              {dict.simYourResult || "Your Result"}
            </p>
            {/* Humanized explanation */}
            <p className="text-sm text-slate-700 bg-white rounded-xl px-4 py-3 border border-green-100 leading-relaxed font-medium">
              {(dict.simLoyerExplain || "Max deposit: {amount} MAD").replace("{amount}", fmt(result.maxDeposit))}
            </p>
            <div className="space-y-2">
              <Row label={dict.simRentDeposit} value={`${fmt(result.maxDeposit)} MAD`} color="green" bold large />
              <Row label={dict.simRentNotice} value={`${result.noticePeriod} ${dict.simRentMonths}`} color="amber" />
              <p className="text-xs text-slate-400 pt-1">{dict.simRentLegalRef}</p>
            </div>
            <ShareButtons
              title={dict.simRentTitle}
              slug="loyer"
              shareParams={rent ? { loyer: rent } : undefined}
              dict={dict}
            />
            {/* Reset */}
            <button
              type="button"
              onClick={() => { setRent(""); setResult(null); setError(""); }}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              ↺ {dict.simReset || "Reset"}
            </button>
          </div>

          {/* Zone 4: Articles Strip */}
          <CalculatorArticlesStrip
            articles={CALCULATOR_ARTICLES.loyer}
            lang={lang}
            dict={dict}
            onArticleClick={setModalArticle}
          />

          {/* Zone 5: Related Calculators */}
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              {dict.simRelatedCalcs || "Related Calculators"}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {RELATED_CALCULATORS.loyer.map((rel) => (
                <a
                  key={rel.slug}
                  href={`/simulateurs/${rel.slug}`}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:border-green-300 hover:bg-green-50 hover:text-green-700 transition-colors shadow-sm"
                >
                  <span>{rel.icon}</span>
                  <span>{dict[rel.titleKey] || rel.titleKey}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Article Modal */}
      <ArticleModal articleRef={modalArticle} lang={lang} dict={dict} onClose={() => setModalArticle(null)} />

      <style jsx global>{`
        @keyframes simSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
