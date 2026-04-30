"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Row } from "./Row";
import { fmt, rnd } from "../../lib/simulatorHelpers";
import CalculatorArticlesStrip from "./CalculatorArticlesStrip";
import ArticleModal from "../laws/ArticleModal";
import { CALCULATOR_ARTICLES, RELATED_CALCULATORS, type ArticleRef } from "../../lib/calculatorArticles";
import ShareButtons from "./ShareButtons";

function calcSeverance(grossMonthly: number, years: number) {
  const hourlyRate = grossMonthly / 191.0;
  let totalHours = 0;
  if (years <= 5) {
    totalHours = years * 96;
  } else if (years <= 10) {
    totalHours = 5 * 96 + (years - 5) * 144;
  } else if (years <= 15) {
    totalHours = 5 * 96 + 5 * 144 + (years - 10) * 192;
  } else {
    totalHours = 5 * 96 + 5 * 144 + 5 * 192 + (years - 15) * 240;
  }
  return { amount: rnd(hourlyRate * totalHours), hours: totalHours };
}

interface LicenciementCalculatorProps {
  dict: Record<string, string>;
  lang: string;
  initialGross?: number;
  initialYears?: number;
}

export default function LicenciementCalculator({ dict, lang, initialGross, initialYears }: LicenciementCalculatorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [gross, setGross] = useState(initialGross ? String(initialGross) : "");
  const [years, setYears] = useState(initialYears ? String(initialYears) : "");
  const [result, setResult] = useState<ReturnType<typeof calcSeverance> | null>(
    initialGross && initialGross > 0 && initialYears && initialYears > 0
      ? calcSeverance(initialGross, initialYears)
      : null
  );
  const [error, setError] = useState("");
  const [modalArticle, setModalArticle] = useState<ArticleRef | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRtl = lang === "ar";

  useEffect(() => {
    const parts: string[] = [];
    if (gross) parts.push(`salaire=${gross}`);
    if (years) parts.push(`annees=${years}`);
    if (parts.length) router.replace(`${pathname}?${parts.join("&")}`, { scroll: false });
  }, [gross, years]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const g = parseFloat(gross);
      const y = parseFloat(years);
      if (!isNaN(g) && g > 0 && !isNaN(y) && y > 0) { setError(""); setResult(calcSeverance(g, y)); }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [gross, years]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gross || !years) { setError(dict.simErrorRequired || "Please enter a value"); return; }
    const g = parseFloat(gross);
    const y = parseFloat(years);
    if (isNaN(g) || g <= 0 || isNaN(y) || y <= 0) {
      setError(dict.simErrorPositive || "Please enter a positive number");
      return;
    }
    setError(""); setResult(calcSeverance(g, y));
  };

  return (
    <div className="space-y-5" dir={isRtl ? "rtl" : "ltr"}>
      {/* Zone 2: Input Card */}
      <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="sev-gross" className="block text-sm font-semibold text-slate-700 mb-1.5">
              {dict.simSeveranceGross}
            </label>
            <input
              id="sev-gross" type="number" min="0"
              value={gross}
              onChange={(e) => { setGross(e.target.value); setResult(null); setError(""); }}
              placeholder="8000"
              className="input-shell w-full"
            />
          </div>
          <div>
            <label htmlFor="sev-years" className="block text-sm font-semibold text-slate-700 mb-1.5">
              {dict.simSeveranceYears}
            </label>
            <input
              id="sev-years" type="number" min="0"
              value={years}
              onChange={(e) => { setYears(e.target.value); setResult(null); setError(""); }}
              placeholder="10"
              className="input-shell w-full"
            />
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
              {(dict.simLicenciementExplain || "Severance: {amount} MAD").replace("{amount}", fmt(result.amount))}
            </p>
            <div className="space-y-2">
              <Row label={dict.simSeveranceResult} value={`${fmt(result.amount)} MAD`} color="green" bold large />
              <p className="text-xs text-slate-400 pt-1">{dict.simSeveranceLegalRef}</p>
            </div>
            <ShareButtons
              title={dict.simSeveranceTitle}
              slug="licenciement"
              shareParams={gross && years ? { salaire: gross, annees: years } : undefined}
              dict={dict}
            />
            <button
              type="button"
              onClick={() => { setGross(""); setYears(""); setResult(null); setError(""); }}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              ↺ {dict.simReset || "Reset"}
            </button>
          </div>

          {/* Zone 4: Articles Strip */}
          <CalculatorArticlesStrip
            articles={CALCULATOR_ARTICLES.licenciement}
            lang={lang}
            dict={dict}
            onArticleClick={setModalArticle}
          />
          <a
            href="/guides/droits-licenciement-maroc"
            className="text-sm text-green-700 hover:underline block mt-3"
          >
            📖 اقرأ دليلنا الشامل حول حقوق الفصل ←
          </a>

          {/* Zone 5: Related Calculators */}
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              {dict.simRelatedCalcs || "Related Calculators"}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {RELATED_CALCULATORS.licenciement.map((rel) => (
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
