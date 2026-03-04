"use client";

import { useState } from "react";
import Container from "../../components/Container";
import { getClientDictionary } from "../../lib/i18nClient";

// ═══════════════════════════════════════════════════════
// Moroccan 2024 IR Tax Brackets (annual)
// CGI Art. 73 — Loi de Finances 2023/2024
// ═══════════════════════════════════════════════════════
const IR_BRACKETS = [
  { min: 0,       max: 30000,   rate: 0,    deduction: 0 },
  { min: 30001,   max: 50000,   rate: 0.10, deduction: 3000 },
  { min: 50001,   max: 60000,   rate: 0.20, deduction: 8000 },
  { min: 60001,   max: 80000,   rate: 0.30, deduction: 14000 },
  { min: 80001,   max: 180000,  rate: 0.34, deduction: 17200 },
  { min: 180001,  max: Infinity, rate: 0.38, deduction: 24400 },
];

// CNSS: 4.48% on gross, capped at 6000 MAD/month ceiling
const CNSS_RATE = 0.0448;
const CNSS_CEILING = 6000;

// AMO: 2.26% on gross (no ceiling)
const AMO_RATE = 0.0226;

// Professional expense deduction: 20% of gross, capped at 2500/month = 30000/year
const PROF_EXPENSE_RATE = 0.20;
const PROF_EXPENSE_CAP_MONTHLY = 2500;

function calcSalary(grossMonthly: number) {
  // Monthly CNSS
  const cnssBase = Math.min(grossMonthly, CNSS_CEILING);
  const cnss = cnssBase * CNSS_RATE;

  // Monthly AMO
  const amo = grossMonthly * AMO_RATE;

  // Professional expenses deduction
  const profExpense = Math.min(grossMonthly * PROF_EXPENSE_RATE, PROF_EXPENSE_CAP_MONTHLY);

  // Net imposable (annual)
  const annualGross = grossMonthly * 12;
  const annualCnss = cnss * 12;
  const annualAmo = amo * 12;
  const annualProfExpense = profExpense * 12;
  const netImposable = Math.max(0, annualGross - annualCnss - annualAmo - annualProfExpense);

  // IR calculation
  let irAnnual = 0;
  for (const bracket of IR_BRACKETS) {
    if (netImposable >= bracket.min) {
      irAnnual = netImposable * bracket.rate - bracket.deduction;
    }
  }
  irAnnual = Math.max(0, irAnnual);
  const irMonthly = irAnnual / 12;

  const totalDeductions = cnss + amo + irMonthly;
  const netSalary = grossMonthly - totalDeductions;

  return {
    cnss: Math.round(cnss * 100) / 100,
    amo: Math.round(amo * 100) / 100,
    ir: Math.round(irMonthly * 100) / 100,
    totalDeductions: Math.round(totalDeductions * 100) / 100,
    net: Math.round(netSalary * 100) / 100,
    netImposable: Math.round(netImposable / 12 * 100) / 100,
  };
}

// ═══════════════════════════════════════════════════════
// Rent Deposit — Dahir of 23/11/2015 (Loi 67-12)
// Max deposit = 2 months rent, notice = varies
// ═══════════════════════════════════════════════════════
function calcRent(monthlyRent: number) {
  return {
    maxDeposit: monthlyRent * 2,
    noticePeriod: monthlyRent > 4000 ? 3 : 2, // residential vs commercial estimate
  };
}

// ═══════════════════════════════════════════════════════
// Simulator Page
// ═══════════════════════════════════════════════════════
export default function SimulatorsPage() {
  const dict = getClientDictionary();
  const [activeTab, setActiveTab] = useState<"salary" | "rent" | "divorce" | "inheritance">("salary");

  return (
    <Container>
      <div className="section space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <span className="badge">⚖️ {dict.navSimulators}</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {dict.simulatorsTitle}
          </h1>
          <p className="text-base text-slate-600 max-w-2xl mx-auto">
            {dict.simulatorsSubtitle}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 justify-center">
          {(["salary", "rent", "divorce", "inheritance"] as const).map((tab) => {
            const labels = {
              salary: dict.simSalaryTitle,
              rent: dict.simRentTitle,
              divorce: dict.simDivorceTitle,
              inheritance: dict.simInheritanceTitle,
            };
            const icons = { salary: "💰", rent: "🏠", divorce: "📋", inheritance: "📊" };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent"
                }`}
              >
                <span className="mr-1.5">{icons[tab]}</span>
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto">
          {activeTab === "salary" && <SalaryCalculator dict={dict} />}
          {activeTab === "rent" && <RentCalculator dict={dict} />}
          {activeTab === "divorce" && <ComingSoonCard title={dict.simDivorceTitle} description={dict.simDivorceDescription} dict={dict} />}
          {activeTab === "inheritance" && <ComingSoonCard title={dict.simInheritanceTitle} description={dict.simInheritanceDescription} dict={dict} />}
        </div>
      </div>
    </Container>
  );
}

// ─── Salary Calculator ───────────────────────────────
function SalaryCalculator({ dict }: { dict: Record<string, string> }) {
  const [gross, setGross] = useState("");
  const [result, setResult] = useState<ReturnType<typeof calcSalary> | null>(null);

  const handleCalc = (e: React.FormEvent) => {
    e.preventDefault();
    const g = parseFloat(gross);
    if (isNaN(g) || g <= 0) return;
    setResult(calcSalary(g));
  };

  const fmt = (n: number) => n.toLocaleString("fr-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="surface space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          💰 {dict.simSalaryTitle}
        </h2>
        <p className="text-sm text-slate-600 mt-1">{dict.simSalaryDescription}</p>
      </div>

      <form onSubmit={handleCalc} className="space-y-4">
        <div>
          <label htmlFor="gross" className="block text-sm font-medium text-slate-700 mb-1">
            {dict.simSalaryGross}
          </label>
          <input
            id="gross"
            type="number"
            min="0"
            step="100"
            value={gross}
            onChange={(e) => { setGross(e.target.value); setResult(null); }}
            placeholder="10000"
            className="input-shell w-full"
            required
          />
        </div>
        <button type="submit" className="btn-primary w-full">
          {dict.simSalaryCalculate}
        </button>
      </form>

      {result && (
        <div className="space-y-3 animate-in fade-in">
          <div className="border-t border-slate-200 pt-4 space-y-2">
            <ResultRow label={dict.simSalaryCNSS} value={`-${fmt(result.cnss)} MAD`} color="amber" />
            <ResultRow label={dict.simSalaryAMO} value={`-${fmt(result.amo)} MAD`} color="amber" />
            <ResultRow label={dict.simSalaryIR} value={`-${fmt(result.ir)} MAD`} color="red" />
            <div className="border-t border-slate-200 pt-2">
              <ResultRow label={dict.simSalaryTotal} value={`-${fmt(result.totalDeductions)} MAD`} color="red" bold />
            </div>
            <div className="border-t-2 border-green-200 pt-3 mt-2">
              <ResultRow label={dict.simSalaryNet} value={`${fmt(result.net)} MAD`} color="green" bold large />
            </div>
          </div>

          {/* Legal reference */}
          <p className="text-xs text-slate-400 mt-4">
            {dict.simSalaryLegalRef}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Rent Deposit Calculator ─────────────────────────
function RentCalculator({ dict }: { dict: Record<string, string> }) {
  const [rent, setRent] = useState("");
  const [result, setResult] = useState<ReturnType<typeof calcRent> | null>(null);

  const handleCalc = (e: React.FormEvent) => {
    e.preventDefault();
    const r = parseFloat(rent);
    if (isNaN(r) || r <= 0) return;
    setResult(calcRent(r));
  };

  const fmt = (n: number) => n.toLocaleString("fr-MA", { minimumFractionDigits: 2 });

  return (
    <div className="surface space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          🏠 {dict.simRentTitle}
        </h2>
        <p className="text-sm text-slate-600 mt-1">{dict.simRentDescription}</p>
      </div>

      <form onSubmit={handleCalc} className="space-y-4">
        <div>
          <label htmlFor="rent" className="block text-sm font-medium text-slate-700 mb-1">
            {dict.simRentMonthly}
          </label>
          <input
            id="rent"
            type="number"
            min="0"
            step="100"
            value={rent}
            onChange={(e) => { setRent(e.target.value); setResult(null); }}
            placeholder="5000"
            className="input-shell w-full"
            required
          />
        </div>
        <button type="submit" className="btn-primary w-full">
          {dict.simSalaryCalculate}
        </button>
      </form>

      {result && (
        <div className="space-y-3 animate-in fade-in border-t border-slate-200 pt-4">
          <ResultRow label={dict.simRentDeposit} value={`${fmt(result.maxDeposit)} MAD`} color="green" bold large />
          <ResultRow
            label={dict.simRentNotice}
            value={`${result.noticePeriod} ${dict.simRentMonths}`}
            color="amber"
          />
          <p className="text-xs text-slate-400 mt-4">
            {dict.simRentLegalRef}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Coming Soon Card ────────────────────────────────
function ComingSoonCard({ title, description, dict }: { title: string; description: string; dict: Record<string, string> }) {
  return (
    <div className="surface text-center space-y-4 py-12">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <p className="text-sm text-slate-600 max-w-md mx-auto">{description}</p>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700">
        🔜 {dict.simComingSoon}
      </span>
    </div>
  );
}

// ─── Result Row Component ────────────────────────────
function ResultRow({
  label,
  value,
  color = "slate",
  bold = false,
  large = false,
}: {
  label: string;
  value: string;
  color?: "green" | "red" | "amber" | "slate";
  bold?: boolean;
  large?: boolean;
}) {
  const colors = {
    green: "text-green-700",
    red: "text-red-600",
    amber: "text-amber-700",
    slate: "text-slate-700",
  };
  return (
    <div className={`flex items-center justify-between ${large ? "py-1" : ""}`}>
      <span className={`text-sm ${bold ? "font-semibold" : ""} text-slate-700`}>{label}</span>
      <span className={`${large ? "text-lg" : "text-sm"} ${bold ? "font-bold" : "font-medium"} ${colors[color]}`}>
        {value}
      </span>
    </div>
  );
}
