"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Row } from "./Row";
import { fmt, rnd } from "../../lib/simulatorHelpers";
import CalculatorArticlesStrip from "./CalculatorArticlesStrip";
import ArticleModal from "../laws/ArticleModal";
import { CALCULATOR_ARTICLES, RELATED_CALCULATORS, type ArticleRef } from "../../lib/calculatorArticles";

const IR_BRACKETS = [
  { min: 0, max: 30000, rate: 0, deduction: 0 },
  { min: 30001, max: 50000, rate: 0.1, deduction: 3000 },
  { min: 50001, max: 60000, rate: 0.2, deduction: 8000 },
  { min: 60001, max: 80000, rate: 0.3, deduction: 14000 },
  { min: 80001, max: 180000, rate: 0.34, deduction: 17200 },
  { min: 180001, max: Infinity, rate: 0.38, deduction: 24400 },
];
const CNSS_RATE = 0.0448;
const CNSS_CEILING = 6000;
const AMO_RATE = 0.0226;
const PROF_EXPENSE_RATE = 0.2;
const PROF_EXPENSE_CAP_MONTHLY = 2500;

function calcSalary(grossMonthly: number) {
  const cnssBase = Math.min(grossMonthly, CNSS_CEILING);
  const cnss = cnssBase * CNSS_RATE;
  const amo = grossMonthly * AMO_RATE;
  const profExpense = Math.min(grossMonthly * PROF_EXPENSE_RATE, PROF_EXPENSE_CAP_MONTHLY);
  const annualGross = grossMonthly * 12;
  const netImposable = Math.max(0, annualGross - cnss * 12 - amo * 12 - profExpense * 12);
  let irAnnual = 0;
  for (const b of IR_BRACKETS) {
    if (netImposable >= b.min) irAnnual = netImposable * b.rate - b.deduction;
  }
  irAnnual = Math.max(0, irAnnual);
  const irMonthly = irAnnual / 12;
  const totalDeductions = cnss + amo + irMonthly;
  return {
    cnss: rnd(cnss), amo: rnd(amo), ir: rnd(irMonthly),
    totalDeductions: rnd(totalDeductions), net: rnd(grossMonthly - totalDeductions),
    netImposable: rnd(netImposable / 12),
  };
}

interface SalaireCalculatorProps {
  dict: Record<string, string>;
  lang: string;
  initialGross?: number;
}

export default function SalaireCalculator({ dict, lang, initialGross }: SalaireCalculatorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [gross, setGross] = useState(initialGross ? String(initialGross) : "");
  const [result, setResult] = useState<ReturnType<typeof calcSalary> | null>(
    initialGross && initialGross > 0 ? calcSalary(initialGross) : null
  );
  const [error, setError] = useState("");
  const [modalArticle, setModalArticle] = useState<ArticleRef | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRtl = lang === "ar";

  useEffect(() => {
    if (gross) router.replace(`${pathname}?brut=${gross}`, { scroll: false });
  }, [gross]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const g = parseFloat(gross);
      if (!isNaN(g) && g > 0) { setError(""); setResult(calcSalary(g)); }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [gross]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gross) { setError(dict.simErrorRequired || "Please enter a value"); return; }
    const g = parseFloat(gross);
    if (isNaN(g) || g <= 0) { setError(dict.simErrorPositive || "Please enter a positive number"); return; }
    setError(""); setResult(calcSalary(g));
  };

  return (
    <div className="space-y-5" dir={isRtl ? "rtl" : "ltr"}>
      {/* Zone 2: Input Card */}
      <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <label htmlFor="salary-gross" className="block text-sm font-semibold text-slate-700 mb-1.5">
            {dict.simSalaryGross}
          </label>
          <input
            id="salary-gross" type="number" min="0"
            value={gross}
            onChange={(e) => { setGross(e.target.value); setResult(null); setError(""); }}
            placeholder="10000"
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
              {(dict.simSalaireExplain || "Net salary: {amount} MAD").replace("{amount}", fmt(result.net))}
            </p>
            <div className="space-y-2">
              <Row label={dict.simSalaryCNSS} value={`-${fmt(result.cnss)} MAD`} color="amber" />
              <Row label={dict.simSalaryAMO} value={`-${fmt(result.amo)} MAD`} color="amber" />
              <Row label={dict.simSalaryIR} value={`-${fmt(result.ir)} MAD`} color="red" />
              <div className="border-t border-slate-200 pt-2">
                <Row label={dict.simSalaryTotal} value={`-${fmt(result.totalDeductions)} MAD`} color="red" bold />
              </div>
              <div className="border-t-2 border-green-200 pt-3">
                <Row label={dict.simSalaryNet} value={`${fmt(result.net)} MAD`} color="green" bold large />
              </div>
              <p className="text-xs text-slate-400 pt-1">{dict.simSalaryLegalRef}</p>
            </div>
            <button
              type="button"
              onClick={() => { setGross(""); setResult(null); setError(""); }}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              ↺ {dict.simReset || "Reset"}
            </button>
          </div>

          {/* Zone 4: Articles Strip */}
          <CalculatorArticlesStrip
            articles={CALCULATOR_ARTICLES.salaire}
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
              {RELATED_CALCULATORS.salaire.map((rel) => (
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
