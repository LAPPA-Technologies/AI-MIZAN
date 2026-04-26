"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Row } from "./Row";
import { fmt, rnd } from "../../lib/simulatorHelpers";
import CalculatorArticlesStrip from "./CalculatorArticlesStrip";
import ArticleModal from "../laws/ArticleModal";
import { CALCULATOR_ARTICLES, RELATED_CALCULATORS, type ArticleRef } from "../../lib/calculatorArticles";
import ShareButtons from "./ShareButtons";

function calcNotary(price: number) {
  const registration = price * 0.04;
  const stamp = price * 0.015;
  const conservation = price * 0.01;
  const honoraires = Math.max(2500, price * 0.01);
  return {
    registration: rnd(registration), stamp: rnd(stamp),
    conservation: rnd(conservation), honoraires: rnd(honoraires),
    total: rnd(registration + stamp + conservation + honoraires),
  };
}

interface NotaireCalculatorProps {
  dict: Record<string, string>;
  lang: string;
  initialPrice?: number;
}

export default function NotaireCalculator({ dict, lang, initialPrice }: NotaireCalculatorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [price, setPrice] = useState(initialPrice ? String(initialPrice) : "");
  const [result, setResult] = useState<ReturnType<typeof calcNotary> | null>(
    initialPrice && initialPrice > 0 ? calcNotary(initialPrice) : null
  );
  const [error, setError] = useState("");
  const [modalArticle, setModalArticle] = useState<ArticleRef | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRtl = lang === "ar";

  useEffect(() => {
    if (price) router.replace(`${pathname}?prix=${price}`, { scroll: false });
  }, [price]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const p = parseFloat(price);
      if (!isNaN(p) && p > 0) { setError(""); setResult(calcNotary(p)); }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [price]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!price) { setError(dict.simErrorRequired || "Please enter a value"); return; }
    const p = parseFloat(price);
    if (isNaN(p) || p <= 0) { setError(dict.simErrorPositive || "Please enter a positive number"); return; }
    setError(""); setResult(calcNotary(p));
  };

  return (
    <div className="space-y-5" dir={isRtl ? "rtl" : "ltr"}>
      {/* Zone 2: Input Card */}
      <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <label htmlFor="notary-price" className="block text-sm font-semibold text-slate-700 mb-1.5">
            {dict.simNotaryPrice}
          </label>
          <input
            id="notary-price" type="number" min="0"
            value={price}
            onChange={(e) => { setPrice(e.target.value); setResult(null); setError(""); }}
            placeholder="500000"
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
              {(dict.simNotaireExplain || "Total fees: {amount} MAD").replace("{amount}", fmt(result.total))}
            </p>
            <div className="space-y-2">
              <Row label={dict.simNotaryRegistration} value={`${fmt(result.registration)} MAD`} color="amber" />
              <Row label={dict.simNotaryStamp} value={`${fmt(result.stamp)} MAD`} color="amber" />
              <Row label={dict.simNotaryConservation} value={`${fmt(result.conservation)} MAD`} color="amber" />
              <Row label={dict.simNotaryHonoraires} value={`${fmt(result.honoraires)} MAD`} color="amber" />
              <div className="border-t-2 border-green-200 pt-3">
                <Row label={dict.simNotaryTotal} value={`${fmt(result.total)} MAD`} color="green" bold large />
              </div>
              <p className="text-xs text-slate-400 pt-1">{dict.simNotaryLegalRef}</p>
            </div>
            <ShareButtons
              title={dict.simNotaryTitle}
              slug="notaire"
              shareParams={price ? { prix: price } : undefined}
              dict={dict}
            />
            <button
              type="button"
              onClick={() => { setPrice(""); setResult(null); setError(""); }}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              ↺ {dict.simReset || "Reset"}
            </button>
          </div>

          {/* Zone 4: Articles Strip */}
          <CalculatorArticlesStrip
            articles={CALCULATOR_ARTICLES.notaire}
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
              {RELATED_CALCULATORS.notaire.map((rel) => (
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
