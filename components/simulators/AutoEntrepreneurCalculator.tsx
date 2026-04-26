"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Row } from "./Row";
import { fmt, rnd } from "../../lib/simulatorHelpers";
import CalculatorArticlesStrip from "./CalculatorArticlesStrip";
import ArticleModal from "../laws/ArticleModal";
import { CALCULATOR_ARTICLES, RELATED_CALCULATORS, type ArticleRef } from "../../lib/calculatorArticles";
import ShareButtons from "./ShareButtons";

function calcAutoEnt(revenue: number, type: "commerce" | "service") {
  const threshold = type === "commerce" ? 500000 : 200000;
  const taxRate = type === "commerce" ? 0.01 : 0.02;
  return {
    eligible: revenue <= threshold,
    threshold,
    tax: rnd(revenue * taxRate),
  };
}

interface AutoEntrepreneurCalculatorProps {
  dict: Record<string, string>;
  lang: string;
  initialRevenue?: number;
  initialType?: "commerce" | "service";
}

export default function AutoEntrepreneurCalculator({ dict, lang, initialRevenue, initialType }: AutoEntrepreneurCalculatorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [revenue, setRevenue] = useState(initialRevenue ? String(initialRevenue) : "");
  const [type, setType] = useState<"commerce" | "service">(initialType ?? "commerce");
  const [result, setResult] = useState<ReturnType<typeof calcAutoEnt> | null>(
    initialRevenue && initialRevenue > 0 ? calcAutoEnt(initialRevenue, initialType ?? "commerce") : null
  );
  const [error, setError] = useState("");
  const [modalArticle, setModalArticle] = useState<ArticleRef | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRtl = lang === "ar";

  useEffect(() => {
    const parts: string[] = [];
    if (revenue) parts.push(`ca=${revenue}`);
    parts.push(`type=${type}`);
    router.replace(`${pathname}?${parts.join("&")}`, { scroll: false });
  }, [revenue, type]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const rev = parseFloat(revenue);
      if (!isNaN(rev) && rev > 0) { setError(""); setResult(calcAutoEnt(rev, type)); }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [revenue, type]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revenue) { setError(dict.simErrorRequired || "Please enter a value"); return; }
    const rev = parseFloat(revenue);
    if (isNaN(rev) || rev <= 0) { setError(dict.simErrorPositive || "Please enter a positive number"); return; }
    setError(""); setResult(calcAutoEnt(rev, type));
  };

  return (
    <div className="space-y-5" dir={isRtl ? "rtl" : "ltr"}>
      {/* Zone 2: Input Card */}
      <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="ae-revenue" className="block text-sm font-semibold text-slate-700 mb-1.5">
              {dict.simAutoEntRevenue}
            </label>
            <input
              id="ae-revenue" type="number" min="0"
              value={revenue}
              onChange={(e) => { setRevenue(e.target.value); setResult(null); setError(""); }}
              placeholder="180000"
              className="input-shell w-full"
            />
          </div>
          <div>
            <label htmlFor="ae-type" className="block text-sm font-semibold text-slate-700 mb-1.5">
              {dict.simAutoEntType}
            </label>
            <select
              id="ae-type"
              value={type}
              onChange={(e) => { setType(e.target.value as "commerce" | "service"); setResult(null); }}
              className="input-shell w-full"
            >
              <option value="commerce">{dict.simAutoEntTypeCommerce}</option>
              <option value="service">{dict.simAutoEntTypeService}</option>
            </select>
          </div>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
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
              {(dict.simAutoEntExplain || "Annual tax: {amount} MAD").replace("{amount}", fmt(result.tax))}
            </p>
            <div className="space-y-2">
              <Row
                label={dict.simAutoEntStatus}
                value={result.eligible ? dict.simAutoEntEligible : dict.simAutoEntExceeded}
                color={result.eligible ? "green" : "red"}
                bold
              />
              <Row label={dict.simAutoEntThreshold} value={`${fmt(result.threshold)} MAD`} color="slate" />
              <Row label={dict.simAutoEntTax} value={`${fmt(result.tax)} MAD`} color="amber" bold />
              <p className="text-xs text-slate-400 pt-1">{dict.simAutoEntLegalRef}</p>
            </div>
            <ShareButtons
              title={dict.simAutoEntTitle}
              slug="auto-entrepreneur"
              shareParams={revenue ? { ca: revenue, type } : undefined}
              dict={dict}
            />
            <button
              type="button"
              onClick={() => { setRevenue(""); setResult(null); setError(""); }}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              ↺ {dict.simReset || "Reset"}
            </button>
          </div>

          {/* Zone 4: Articles Strip */}
          <CalculatorArticlesStrip
            articles={CALCULATOR_ARTICLES["auto-entrepreneur"]}
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
              {RELATED_CALCULATORS["auto-entrepreneur"].map((rel) => (
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
