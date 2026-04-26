"use client";

import { useState } from "react";
import Container from "../../components/Container";
import Footer from "../../components/Footer";
import { getClientDictionary } from "../../lib/i18nClient";
import { fmt, rnd } from "../../lib/simulatorHelpers";
import { Row } from "../../components/simulators/Row";

// ═══════════════════════════════════════════════════════
// Moroccan 2024 IR Tax Brackets (annual)
// CGI Art. 73 — Loi de Finances 2023/2024
// ═══════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════
// Rent Deposit — Loi 67-12
// ═══════════════════════════════════════════════════════
function calcRent(monthlyRent: number) {
  return { maxDeposit: monthlyRent * 2, noticePeriod: monthlyRent > 4000 ? 3 : 2 };
}

// ═══════════════════════════════════════════════════════
// Severance Pay — Labor Code Art. 52-53
// Brackets: 96h/yr (0-5), 144h/yr (6-10), 192h/yr (11-15), 240h/yr (15+)
// ═══════════════════════════════════════════════════════
function calcSeverance(grossMonthly: number, years: number) {
  const hourlyRate = grossMonthly / 191.0; // ~44h/week average
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

// ═══════════════════════════════════════════════════════
// Notary Fees — Real estate transaction
// Registration 4%, stamp 1.5%, conservation 1%, notary ~1% (min 2500)
// ═══════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════
// Auto-Entrepreneur — Loi 114-13
// Commerce/Industry/Artisan: ceiling 500k, tax 1%
// Service/Liberal: ceiling 200k, tax 2%
// ═══════════════════════════════════════════════════════
function calcAutoEnt(revenue: number, type: "commerce" | "service") {
  const threshold = type === "commerce" ? 500000 : 200000;
  const taxRate = type === "commerce" ? 0.01 : 0.02;
  return {
    eligible: revenue <= threshold,
    threshold,
    tax: rnd(revenue * taxRate),
  };
}

// ── Helpers (imported from lib/simulatorHelpers and components/simulators/Row) ──

// ═══════════════════════════════════════════════════════
// Simulator Card Definitions
// ═══════════════════════════════════════════════════════
type SimId = "salary" | "rent" | "severance" | "notary" | "autoent" | "divorce" | "inheritance";

const SIM_CARDS: { id: SimId; icon: string; titleKey: string; descKey: string; ready: boolean }[] = [
  { id: "salary",      icon: "💰", titleKey: "simSalaryTitle",      descKey: "simSalaryDescription",      ready: true },
  { id: "rent",        icon: "🏠", titleKey: "simRentTitle",        descKey: "simRentDescription",        ready: true },
  { id: "severance",   icon: "📋", titleKey: "simSeveranceTitle",   descKey: "simSeveranceDescription",   ready: true },
  { id: "notary",      icon: "🏡", titleKey: "simNotaryTitle",      descKey: "simNotaryDescription",      ready: true },
  { id: "autoent",     icon: "🧑‍💼", titleKey: "simAutoEntTitle",     descKey: "simAutoEntDescription",     ready: true },
  { id: "divorce",     icon: "⚖️", titleKey: "simDivorceTitle",     descKey: "simDivorceDescription",     ready: false },
  { id: "inheritance", icon: "📊", titleKey: "simInheritanceTitle", descKey: "simInheritanceDescription", ready: true },
];

// ═══════════════════════════════════════════════════════
// Page Component
// ═══════════════════════════════════════════════════════
export default function SimulatorsPage() {
  const dict = getClientDictionary();
  const d = dict as Record<string, string>;
  const [active, setActive] = useState<SimId | null>(null);

  return (
    <>
      <Container>
        <div className="section space-y-8">
          {/* Hero */}
          <div className="text-center space-y-3">
            <span className="badge">⚖️ {d.navSimulators}</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {d.simulatorsTitle}
            </h1>
            <p className="text-base text-slate-600 max-w-2xl mx-auto">
              {d.simulatorsSubtitle}
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-sm">
              <span className="bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1 font-medium">
                {SIM_CARDS.filter((s) => s.ready).length}{" "}
                {d.simSalaryCalculate === "احسب" ? "أدوات متاحة" : d.simSalaryCalculate === "Calculer" ? "outils disponibles" : "tools available"}
              </span>
              <span className="bg-slate-100 text-slate-600 rounded-full px-3 py-1">
                {SIM_CARDS.filter((s) => !s.ready).length} {d.simComingSoon}
              </span>
            </div>
          </div>

          {/* Card Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SIM_CARDS.map((sim) => {
              const isActive = active === sim.id;
              return (
                <div
                  key={sim.id}
                  className={`card flex flex-col transition-all duration-200 ${
                    isActive
                      ? "border-green-300 shadow-lg ring-2 ring-green-100 sm:col-span-2 lg:col-span-3"
                      : sim.ready
                      ? "hover:border-green-200 hover:shadow-md cursor-pointer"
                      : "opacity-60"
                  }`}
                >
                  {/* Card header — always visible */}
                  <div
                    className={`flex items-start gap-3 ${sim.ready && !isActive ? "cursor-pointer" : ""}`}
                    onClick={() => sim.ready && setActive(isActive ? null : sim.id)}
                    role={sim.ready ? "button" : undefined}
                    tabIndex={sim.ready ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (sim.ready && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        setActive(isActive ? null : sim.id);
                      }
                    }}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-xl shrink-0">
                      {sim.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900 leading-tight">
                          {d[sim.titleKey]}
                        </h3>
                        {!sim.ready && (
                          <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                            {d.simComingSoon}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-1 leading-snug">
                        {d[sim.descKey]}
                      </p>
                    </div>
                    {sim.ready && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActive(isActive ? null : sim.id);
                        }}
                        className="shrink-0 text-green-700 hover:text-green-800 transition-colors mt-1"
                        aria-label={isActive ? "Close" : "Open"}
                      >
                        <svg
                          className={`h-5 w-5 transition-transform duration-200 ${isActive ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Expanded calculator */}
                  {isActive && (
                    <div className="mt-4 pt-4 border-t border-slate-200 animate-in fade-in slide-in-from-top-2">
                      {sim.id === "salary" && <SalaryCalc dict={d} />}
                      {sim.id === "rent" && <RentCalc dict={d} />}
                      {sim.id === "severance" && <SeveranceCalc dict={d} />}
                      {sim.id === "notary" && <NotaryCalc dict={d} />}
                      {sim.id === "autoent" && <AutoEntCalc dict={d} />}
                      {sim.id === "inheritance" && <InheritanceCalc dict={d} />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Global Disclaimer */}
          <p className="text-xs text-center text-slate-400 max-w-xl mx-auto leading-relaxed">
            {d.simSalaryCalculate === "احسب"
              ? "هذه الحاسبات تقدم تقديرات مبنية على التشريع المغربي الحالي ولا تشكل استشارة قانونية أو مالية."
              : d.simSalaryCalculate === "Calculer"
              ? "Ces calculateurs fournissent des estimations basées sur la législation marocaine en vigueur. Ils ne constituent pas un avis juridique ou financier."
              : "These calculators provide estimates based on current Moroccan legislation. They do not constitute legal or financial advice."}
          </p>
        </div>
      </Container>
      <Footer labels={dict} />
    </>
  );
}

// ═══════════════════════════════════════════════════════
// Individual Calculator Components
// ═══════════════════════════════════════════════════════

function SalaryCalc({ dict }: { dict: Record<string, string> }) {
  const [gross, setGross] = useState("");
  const [result, setResult] = useState<ReturnType<typeof calcSalary> | null>(null);
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const g = parseFloat(gross);
    if (!isNaN(g) && g > 0) setResult(calcSalary(g));
  };
  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label htmlFor="salary-gross" className="block text-sm font-medium text-slate-700 mb-1">
            {dict.simSalaryGross}
          </label>
          <input
            id="salary-gross" type="number" min="0" step="100"
            value={gross}
            onChange={(e) => { setGross(e.target.value); setResult(null); }}
            placeholder="10000"
            className="input-shell w-full"
            required
          />
        </div>
        <button type="submit" className="btn-primary self-end px-6 py-2">
          {dict.simSalaryCalculate}
        </button>
      </form>
      {result && (
        <div className="space-y-2 border-t border-slate-200 pt-3">
          <Row label={dict.simSalaryCNSS} value={`-${fmt(result.cnss)} MAD`} color="amber" />
          <Row label={dict.simSalaryAMO} value={`-${fmt(result.amo)} MAD`} color="amber" />
          <Row label={dict.simSalaryIR} value={`-${fmt(result.ir)} MAD`} color="red" />
          <div className="border-t border-slate-200 pt-2">
            <Row label={dict.simSalaryTotal} value={`-${fmt(result.totalDeductions)} MAD`} color="red" bold />
          </div>
          <div className="border-t-2 border-green-200 pt-3">
            <Row label={dict.simSalaryNet} value={`${fmt(result.net)} MAD`} color="green" bold large />
          </div>
          <p className="text-xs text-slate-400 mt-2">{dict.simSalaryLegalRef}</p>
        </div>
      )}
    </div>
  );
}

function RentCalc({ dict }: { dict: Record<string, string> }) {
  const [rent, setRent] = useState("");
  const [result, setResult] = useState<ReturnType<typeof calcRent> | null>(null);
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(rent);
    if (!isNaN(val) && val > 0) setResult(calcRent(val));
  };
  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label htmlFor="rent-monthly" className="block text-sm font-medium text-slate-700 mb-1">
            {dict.simRentMonthly}
          </label>
          <input
            id="rent-monthly" type="number" min="0" step="100"
            value={rent}
            onChange={(e) => { setRent(e.target.value); setResult(null); }}
            placeholder="5000"
            className="input-shell w-full"
            required
          />
        </div>
        <button type="submit" className="btn-primary self-end px-6 py-2">
          {dict.simSalaryCalculate}
        </button>
      </form>
      {result && (
        <div className="space-y-2 border-t border-slate-200 pt-3">
          <Row label={dict.simRentDeposit} value={`${fmt(result.maxDeposit)} MAD`} color="green" bold large />
          <Row label={dict.simRentNotice} value={`${result.noticePeriod} ${dict.simRentMonths}`} color="amber" />
          <p className="text-xs text-slate-400 mt-2">{dict.simRentLegalRef}</p>
        </div>
      )}
    </div>
  );
}

function SeveranceCalc({ dict }: { dict: Record<string, string> }) {
  const [gross, setGross] = useState("");
  const [years, setYears] = useState("");
  const [result, setResult] = useState<ReturnType<typeof calcSeverance> | null>(null);
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const g = parseFloat(gross);
    const y = parseFloat(years);
    if (!isNaN(g) && g > 0 && !isNaN(y) && y > 0) setResult(calcSeverance(g, y));
  };
  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label htmlFor="sev-gross" className="block text-sm font-medium text-slate-700 mb-1">
            {dict.simSeveranceGross}
          </label>
          <input
            id="sev-gross" type="number" min="0" step="100"
            value={gross}
            onChange={(e) => { setGross(e.target.value); setResult(null); }}
            placeholder="8000"
            className="input-shell w-full"
            required
          />
        </div>
        <div>
          <label htmlFor="sev-years" className="block text-sm font-medium text-slate-700 mb-1">
            {dict.simSeveranceYears}
          </label>
          <input
            id="sev-years" type="number" min="0.5" step="0.5"
            value={years}
            onChange={(e) => { setYears(e.target.value); setResult(null); }}
            placeholder="10"
            className="input-shell w-full"
            required
          />
        </div>
        <button type="submit" className="btn-primary self-end px-6 py-2">
          {dict.simSalaryCalculate}
        </button>
      </form>
      {result && (
        <div className="space-y-2 border-t border-slate-200 pt-3">
          <Row label={dict.simSeveranceResult} value={`${fmt(result.amount)} MAD`} color="green" bold large />
          <p className="text-xs text-slate-400 mt-2">{dict.simSeveranceLegalRef}</p>
        </div>
      )}
    </div>
  );
}

function NotaryCalc({ dict }: { dict: Record<string, string> }) {
  const [price, setPrice] = useState("");
  const [result, setResult] = useState<ReturnType<typeof calcNotary> | null>(null);
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(price);
    if (!isNaN(p) && p > 0) setResult(calcNotary(p));
  };
  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label htmlFor="notary-price" className="block text-sm font-medium text-slate-700 mb-1">
            {dict.simNotaryPrice}
          </label>
          <input
            id="notary-price" type="number" min="0" step="10000"
            value={price}
            onChange={(e) => { setPrice(e.target.value); setResult(null); }}
            placeholder="1000000"
            className="input-shell w-full"
            required
          />
        </div>
        <button type="submit" className="btn-primary self-end px-6 py-2">
          {dict.simSalaryCalculate}
        </button>
      </form>
      {result && (
        <div className="space-y-2 border-t border-slate-200 pt-3">
          <Row label={dict.simNotaryRegistration} value={`${fmt(result.registration)} MAD`} color="amber" />
          <Row label={dict.simNotaryStamp} value={`${fmt(result.stamp)} MAD`} color="amber" />
          <Row label={dict.simNotaryConservation} value={`${fmt(result.conservation)} MAD`} color="amber" />
          <Row label={dict.simNotaryHonoraires} value={`${fmt(result.honoraires)} MAD`} color="amber" />
          <div className="border-t-2 border-green-200 pt-3">
            <Row label={dict.simNotaryTotal} value={`${fmt(result.total)} MAD`} color="green" bold large />
          </div>
          <p className="text-xs text-slate-400 mt-2">{dict.simNotaryLegalRef}</p>
        </div>
      )}
    </div>
  );
}

function AutoEntCalc({ dict }: { dict: Record<string, string> }) {
  const [revenue, setRevenue] = useState("");
  const [type, setType] = useState<"commerce" | "service">("commerce");
  const [result, setResult] = useState<ReturnType<typeof calcAutoEnt> | null>(null);
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rev = parseFloat(revenue);
    if (!isNaN(rev) && rev > 0) setResult(calcAutoEnt(rev, type));
  };
  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label htmlFor="ae-revenue" className="block text-sm font-medium text-slate-700 mb-1">
            {dict.simAutoEntRevenue}
          </label>
          <input
            id="ae-revenue" type="number" min="0" step="10000"
            value={revenue}
            onChange={(e) => { setRevenue(e.target.value); setResult(null); }}
            placeholder="300000"
            className="input-shell w-full"
            required
          />
        </div>
        <div>
          <label htmlFor="ae-type" className="block text-sm font-medium text-slate-700 mb-1">
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
        <button type="submit" className="btn-primary self-end px-6 py-2">
          {dict.simSalaryCalculate}
        </button>
      </form>
      {result && (
        <div className="space-y-2 border-t border-slate-200 pt-3">
          <Row
            label={dict.simAutoEntStatus}
            value={result.eligible ? dict.simAutoEntEligible : dict.simAutoEntExceeded}
            color={result.eligible ? "green" : "red"}
            bold
          />
          <Row label={dict.simAutoEntThreshold} value={`${fmt(result.threshold)} MAD`} color="slate" />
          <Row label={dict.simAutoEntTax} value={`${fmt(result.tax)} MAD`} color="amber" bold />
          <p className="text-xs text-slate-400 mt-2">{dict.simAutoEntLegalRef}</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Islamic Inheritance Calculator (فرائض) — Moudawana Art. 325-393
// ═══════════════════════════════════════════════════════

type Frac = { n: number; d: number };

function frac(n: number, d: number): Frac {
  if (d === 0 || n === 0) return { n: 0, d: 1 };
  const g = gcdCalc(Math.abs(n), Math.abs(d));
  return { n: (d < 0 ? -n : n) / g, d: Math.abs(d) / g };
}

function gcdCalc(a: number, b: number): number {
  return b === 0 ? a : gcdCalc(b, a % b);
}

function addFrac(a: Frac, b: Frac): Frac { return frac(a.n * b.d + b.n * a.d, a.d * b.d); }
function subFrac(a: Frac, b: Frac): Frac { return frac(a.n * b.d - b.n * a.d, a.d * b.d); }

function fracStr(f: Frac): string {
  if (f.n <= 0) return "0";
  if (f.d === 1) return `${f.n}`;
  return `${f.n}/${f.d}`;
}

function fracGt(a: Frac, b: Frac): boolean { return a.n * b.d > b.n * a.d; }
function fracEq(a: Frac, _b: Frac): boolean { return a.n * _b.d === _b.n * a.d; }

interface InheritanceInput {
  estate: number;
  husband: number;
  wife: number;
  son: number;
  daughter: number;
  father: number;
  mother: number;
  paternalGrandfather: number;
  paternalGrandmother: number;
  maternalGrandmother: number;
  fullBrother: number;
  fullSister: number;
  halfBrotherPat: number;
  halfSisterPat: number;
  uterineSibling: number;
}

interface HeirResult {
  labelAr: string;
  labelFr: string;
  labelEn: string;
  count: number;
  shareFrac: Frac;
  perPersonFrac: Frac;
  totalAmount: number;
  perPersonAmount: number;
  note?: string;
  blocked?: boolean;
}

function calcInheritance(inp: InheritanceInput): HeirResult[] {
  const hasDescendant = inp.son + inp.daughter > 0;
  const hasSon = inp.son > 0;
  const hasFather = inp.father > 0;
  const hasMother = inp.mother > 0;
  const hasGrandfather = inp.paternalGrandfather > 0 && !hasFather;
  const hasGrandmother = (inp.paternalGrandmother > 0 || inp.maternalGrandmother > 0) && !hasMother;
  const pluralSiblings = (inp.fullBrother + inp.fullSister + inp.halfBrotherPat + inp.halfSisterPat + inp.uterineSibling) >= 2;

  // Blocking rules (حجب حرمان)
  const blockedByFather = !hasFather && !hasGrandfather;
  const fullSibsBlock = hasSon || hasFather || hasGrandfather;
  const halfSibsPatBlock = hasSon || hasFather || hasGrandfather || inp.fullBrother > 0;
  const uterineBlock = hasDescendant || hasFather || hasGrandfather;

  // ─── Fixed Shares ────────────────────────────────────
  const shares: Array<{ key: string; labelAr: string; labelFr: string; labelEn: string; count: number; frac: Frac; blocked: boolean; note?: string }> = [];

  const add = (key: string, ar: string, fr: string, en: string, count: number, f: Frac, blocked = false, note?: string) =>
    shares.push({ key, labelAr: ar, labelFr: fr, labelEn: en, count, frac: f, blocked, note });

  if (inp.husband > 0)
    add("husband", "زوج", "Mari", "Husband", 1, hasDescendant ? frac(1, 4) : frac(1, 2));

  if (inp.wife > 0)
    add("wife", "زوجة", "Épouse", "Wife", inp.wife, hasDescendant ? frac(1, 8) : frac(1, 4));

  if (hasMother) {
    const motherFrac = (hasDescendant || pluralSiblings) ? frac(1, 6) : frac(1, 3);
    add("mother", "أم", "Mère", "Mother", 1, motherFrac);
  }

  if (hasFather) {
    add("father_fixed", "أب (فرض)", "Père (quote-part)", "Father (fixed)", 1,
      hasDescendant ? frac(1, 6) : frac(0, 1),
      false,
      hasDescendant ? undefined : "يرث بالتعصيب"
    );
  }

  if (hasGrandfather) {
    add("grandfather_fixed", "جد لأب (فرض)", "Grand-père paternel", "Paternal Grandfather", 1,
      hasDescendant ? frac(1, 6) : frac(0, 1),
      false,
      hasDescendant ? undefined : "يرث بالتعصيب"
    );
  }

  const patGrandmother = inp.paternalGrandmother > 0 ? 1 : 0;
  const matGrandmother = inp.maternalGrandmother > 0 ? 1 : 0;
  const grandmotherCount = Math.min(2, patGrandmother + matGrandmother);
  if (grandmotherCount > 0) {
    add("grandmother", "جدة", "Grand-mère", "Grandmother", grandmotherCount,
      hasGrandmother ? frac(1, 6) : frac(0, 1),
      !hasGrandmother,
      !hasGrandmother ? "محجوبة بالأم" : undefined
    );
  }

  // Daughters without sons
  if (!hasSon && inp.daughter > 0) {
    const df = inp.daughter === 1 ? frac(1, 2) : frac(2, 3);
    add("daughter_fixed", "بنت/بنات", "Fille(s)", "Daughter(s)", inp.daughter, df);
  }

  // Full sisters (no son, no father, no grandfather, no brother)
  if (!fullSibsBlock && inp.fullSister > 0 && inp.fullBrother === 0 && !hasSon && inp.daughter === 0) {
    const sf = inp.fullSister === 1 ? frac(1, 2) : frac(2, 3);
    add("full_sister", "أخت شقيقة", "Sœur germaine", "Full Sister", inp.fullSister, sf);
  } else if (inp.fullSister > 0 && fullSibsBlock) {
    add("full_sister", "أخت شقيقة", "Sœur germaine", "Full Sister", inp.fullSister, frac(0, 1), true, "محجوبة");
  }

  // Half sisters paternal (no son, no father, no grandfather, no full sibling)
  if (!halfSibsPatBlock && inp.halfSisterPat > 0 && inp.halfBrotherPat === 0) {
    const hsf = inp.halfSisterPat === 1 ? frac(1, 2) : frac(2, 3);
    add("half_sister_pat", "أخت لأب", "Demi-sœur paternelle", "Half-Sister (pat.)", inp.halfSisterPat, hsf);
  } else if (inp.halfSisterPat > 0 && halfSibsPatBlock) {
    add("half_sister_pat", "أخت لأب", "Demi-sœur paternelle", "Half-Sister (pat.)", inp.halfSisterPat, frac(0, 1), true, "محجوبة");
  }

  // Uterine siblings
  if (!uterineBlock && inp.uterineSibling > 0) {
    const uf = inp.uterineSibling === 1 ? frac(1, 6) : frac(1, 3);
    add("uterine", "أخ/أخت لأم", "Frère/sœur utérin(e)", "Uterine Sibling", inp.uterineSibling, uf);
  } else if (inp.uterineSibling > 0 && uterineBlock) {
    add("uterine", "أخ/أخت لأم", "Frère/sœur utérin(e)", "Uterine Sibling", inp.uterineSibling, frac(0, 1), true, "محجوب بالفرع/الأصل");
  }

  // ─── Sum fixed shares ────────────────────────────────
  let totalFixed = frac(0, 1);
  for (const s of shares) {
    if (!s.blocked) totalFixed = addFrac(totalFixed, s.frac);
  }

  // ─── Apply aul (عول) if total > 1 ───────────────────
  const needsAul = fracGt(totalFixed, frac(1, 1));

  // ─── Residual (عصبة) ────────────────────────────────
  let residual = needsAul ? frac(0, 1) : subFrac(frac(1, 1), totalFixed);
  if (residual.n < 0) residual = frac(0, 1);

  const residualHeirs: typeof shares = [];

  // Sons + daughters together
  if (hasSon && inp.daughter > 0) {
    const units = inp.son * 2 + inp.daughter; // son = 2 shares, daughter = 1
    add("son_daughter", "أبناء وبنات (تعصيب)", "Fils + Filles (résidu)", "Son(s)+Daughter(s) (residual)", inp.son + inp.daughter,
      frac(0, 1), false, `${inp.son} ابن + ${inp.daughter} بنت (للذكر مثل حظ الأنثيين)`);
    residualHeirs.push({ key: "son_daughter", labelAr: "", labelFr: "", labelEn: "", count: units, frac: residual, blocked: false });
  } else if (hasSon) {
    add("son", "ابن/أبناء", "Fils", "Son(s)", inp.son, frac(0, 1), false, "يرث بالتعصيب");
    residualHeirs.push({ key: "son", labelAr: "", labelFr: "", labelEn: "", count: inp.son, frac: residual, blocked: false });
  } else if (hasFather && !hasDescendant) {
    // Father takes residual if no descendants
    residualHeirs.push({ key: "father_fixed", labelAr: "", labelFr: "", labelEn: "", count: 1, frac: residual, blocked: false });
  } else if (hasGrandfather && !hasDescendant) {
    residualHeirs.push({ key: "grandfather_fixed", labelAr: "", labelFr: "", labelEn: "", count: 1, frac: residual, blocked: false });
  } else if (!fullSibsBlock && inp.fullBrother > 0) {
    if (inp.fullSister > 0) {
      const units = inp.fullBrother * 2 + inp.fullSister;
      add("full_sibling_res", "إخوة وأخوات أشقاء", "Frères/sœurs germain(e)s", "Full Siblings (residual)", inp.fullBrother + inp.fullSister,
        frac(0, 1), false, "للذكر مثل حظ الأنثيين");
      residualHeirs.push({ key: "full_sibling_res", labelAr: "", labelFr: "", labelEn: "", count: units, frac: residual, blocked: false });
    } else {
      add("full_brother", "أخ شقيق", "Frère germain", "Full Brother(s)", inp.fullBrother, frac(0, 1), false, "يرث بالتعصيب");
      residualHeirs.push({ key: "full_brother", labelAr: "", labelFr: "", labelEn: "", count: inp.fullBrother, frac: residual, blocked: false });
    }
  } else if (!halfSibsPatBlock && inp.halfBrotherPat > 0) {
    if (inp.halfSisterPat > 0) {
      const units = inp.halfBrotherPat * 2 + inp.halfSisterPat;
      add("half_sib_pat_res", "إخوة وأخوات لأب", "Demi-frères/sœurs pat.", "Half Siblings (pat.) residual", inp.halfBrotherPat + inp.halfSisterPat,
        frac(0, 1), false, "للذكر مثل حظ الأنثيين");
      residualHeirs.push({ key: "half_sib_pat_res", labelAr: "", labelFr: "", labelEn: "", count: units, frac: residual, blocked: false });
    } else {
      add("half_brother_pat", "أخ لأب", "Demi-frère paternel", "Half-Brother (pat.)", inp.halfBrotherPat, frac(0, 1), false, "يرث بالتعصيب");
      residualHeirs.push({ key: "half_brother_pat", labelAr: "", labelFr: "", labelEn: "", count: inp.halfBrotherPat, frac: residual, blocked: false });
    }
  } else if (hasFather && hasDescendant) {
    // Father already has 1/6 - nothing extra unless daughters only
    const hasDaughtersOnly = inp.daughter > 0 && !hasSon;
    if (hasDaughtersOnly && residual.n > 0) {
      residualHeirs.push({ key: "father_fixed", labelAr: "", labelFr: "", labelEn: "", count: 1, frac: residual, blocked: false });
    }
  }

  // ─── Apply aul if needed ─────────────────────────────
  let aulFactor = frac(1, 1);
  if (needsAul) {
    // Calculate raw sum as fraction to find aul denominator
    // Aul: divide each share by total sum
    aulFactor = totalFixed; // divide everything by totalFixed
  }

  // ─── Build results ───────────────────────────────────
  const results: HeirResult[] = [];

  const processedKeys = new Set<string>();

  for (const s of shares) {
    if (processedKeys.has(s.key)) continue;
    processedKeys.add(s.key);

    if (s.blocked) {
      results.push({
        labelAr: s.labelAr, labelFr: s.labelFr, labelEn: s.labelEn,
        count: s.count,
        shareFrac: frac(0, 1),
        perPersonFrac: frac(0, 1),
        totalAmount: 0, perPersonAmount: 0,
        blocked: true,
        note: s.note,
      });
      continue;
    }

    // Check if this key has a residual component
    const residualEntry = residualHeirs.find(r => r.key === s.key);

    let totalFrac = s.frac;
    if (residualEntry) {
      totalFrac = addFrac(s.frac, residualEntry.frac);
    }

    // Apply aul if needed
    if (needsAul && s.frac.n > 0) {
      totalFrac = frac(s.frac.n * aulFactor.d, s.frac.d * aulFactor.n);
    }

    // For residual-only entries
    if (fracEq(s.frac, frac(0, 1)) && residualEntry) {
      totalFrac = residualEntry.frac;
    }

    const totalAmount = Math.round((inp.estate * totalFrac.n) / totalFrac.d);
    const perPersonFrac = s.count > 1 ? frac(totalFrac.n, totalFrac.d * s.count) : totalFrac;
    const perPersonAmount = s.count > 0 ? Math.round(totalAmount / s.count) : 0;

    results.push({
      labelAr: s.labelAr, labelFr: s.labelFr, labelEn: s.labelEn,
      count: s.count,
      shareFrac: totalFrac,
      perPersonFrac,
      totalAmount, perPersonAmount,
      note: s.note,
    });
  }

  // Handle pure residual heirs not already in shares
  for (const r of residualHeirs) {
    if (!processedKeys.has(r.key)) {
      processedKeys.add(r.key);
      const s = shares.find(sh => sh.key === r.key);
      if (!s) continue;
      const totalAmount = Math.round((inp.estate * r.frac.n) / r.frac.d);
      const perPersonFrac = s.count > 1 ? frac(r.frac.n, r.frac.d * s.count) : r.frac;
      const perPersonAmount = s.count > 0 ? Math.round(totalAmount / s.count) : 0;
      results.push({
        labelAr: s.labelAr, labelFr: s.labelFr, labelEn: s.labelEn,
        count: s.count,
        shareFrac: r.frac,
        perPersonFrac, totalAmount, perPersonAmount,
        note: s.note,
      });
    }
  }

  return results.filter(r => r.count > 0);
}

function InheritanceCalc({ dict }: { dict: Record<string, string> }) {
  const lang = dict.simSalaryCalculate === "احسب" ? "ar" : dict.simSalaryCalculate === "Calculer" ? "fr" : "en";
  const t = (ar: string, fr: string, en: string) => lang === "ar" ? ar : lang === "fr" ? fr : en;

  const [estate, setEstate] = useState("");
  const [inp, setInp] = useState<Omit<InheritanceInput, "estate">>({
    husband: 0, wife: 0, son: 0, daughter: 0, father: 0, mother: 0,
    paternalGrandfather: 0, paternalGrandmother: 0, maternalGrandmother: 0,
    fullBrother: 0, fullSister: 0, halfBrotherPat: 0, halfSisterPat: 0, uterineSibling: 0,
  });
  const [results, setResults] = useState<HeirResult[] | null>(null);

  const heirFields: Array<{ key: keyof typeof inp; ar: string; fr: string; en: string; max?: number }> = [
    { key: "husband", ar: "زوج", fr: "Mari", en: "Husband", max: 1 },
    { key: "wife", ar: "زوجة / زوجات", fr: "Épouse(s)", en: "Wife / Wives", max: 4 },
    { key: "son", ar: "ابن / أبناء", fr: "Fils", en: "Son(s)" },
    { key: "daughter", ar: "ابنة / بنات", fr: "Fille(s)", en: "Daughter(s)" },
    { key: "father", ar: "أب", fr: "Père", en: "Father", max: 1 },
    { key: "mother", ar: "أم", fr: "Mère", en: "Mother", max: 1 },
    { key: "paternalGrandfather", ar: "جد لأب", fr: "Grand-père paternel", en: "Paternal Grandfather", max: 1 },
    { key: "paternalGrandmother", ar: "جدة لأب", fr: "Grand-mère paternelle", en: "Paternal Grandmother", max: 1 },
    { key: "maternalGrandmother", ar: "جدة لأم", fr: "Grand-mère maternelle", en: "Maternal Grandmother", max: 1 },
    { key: "fullBrother", ar: "أخ شقيق", fr: "Frère germain", en: "Full Brother(s)" },
    { key: "fullSister", ar: "أخت شقيقة", fr: "Sœur germaine", en: "Full Sister(s)" },
    { key: "halfBrotherPat", ar: "أخ لأب", fr: "Demi-frère paternel", en: "Half-Brother (pat.)" },
    { key: "halfSisterPat", ar: "أخت لأب", fr: "Demi-sœur paternelle", en: "Half-Sister (pat.)" },
    { key: "uterineSibling", ar: "أخ/أخت لأم", fr: "Frère/sœur utérin(e)", en: "Uterine Sibling(s)" },
  ];

  const onCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const estVal = parseFloat(estate);
    if (isNaN(estVal) || estVal <= 0) return;
    const result = calcInheritance({ estate: estVal, ...inp });
    setResults(result);
  };

  const hasAnyHeir = Object.values(inp).some(v => v > 0);

  return (
    <div className="space-y-5" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
        ⚠️ {t(
          "حاسبة تقريبية للفرائض وفق المدونة المغربية. استشر عدلاً أو محامياً للمواقف المعقدة.",
          "Calculateur approximatif de successions selon la Moudawana. Consultez un notaire/avocat pour les cas complexes.",
          "Approximate inheritance calculator per Moroccan Moudawana. Consult a notary/lawyer for complex cases."
        )}
      </div>

      <form onSubmit={onCalculate} className="space-y-4">
        {/* Estate Value */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1">
            {t("قيمة التركة الصافية (درهم)", "Valeur nette de la succession (MAD)", "Net Estate Value (MAD)")}
          </label>
          <input type="number" min="1" step="1000"
            value={estate}
            onChange={(e) => { setEstate(e.target.value); setResults(null); }}
            placeholder={t("مثال: 500000", "ex: 500000", "e.g. 500000")}
            className="input-shell"
            required
          />
        </div>

        {/* Heir Counts */}
        <div>
          <p className="text-sm font-semibold text-slate-800 mb-3">
            {t("الورثة (أدخل الأعداد)", "Héritiers (saisir les effectifs)", "Heirs (enter counts)")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {heirFields.map((f) => (
              <div key={f.key} className="space-y-1">
                <label className="block text-xs font-medium text-slate-600">
                  {t(f.ar, f.fr, f.en)}
                </label>
                <input
                  type="number"
                  min="0"
                  max={f.max ?? 20}
                  step="1"
                  value={inp[f.key] || ""}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setInp(prev => ({ ...prev, [f.key]: val }));
                    setResults(null);
                  }}
                  placeholder="0"
                  className="input-shell py-2 text-center"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!estate || !hasAnyHeir}
          className="btn-primary w-full py-3 text-base"
        >
          {t("احسب التركة", "Calculer la succession", "Calculate Inheritance")}
        </button>
      </form>

      {results && results.length > 0 && (
        <div className="space-y-3 border-t border-slate-200 pt-4">
          <h4 className="font-bold text-slate-900">
            {t("توزيع الميراث", "Répartition de la succession", "Inheritance Distribution")}
          </h4>
          <div className="space-y-2">
            {results.map((r, i) => (
              <div
                key={i}
                className={`heir-row ${r.blocked ? "opacity-50 bg-red-50 border-red-100" : r.totalAmount > 0 ? "" : "opacity-60"}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {t(r.labelAr, r.labelFr, r.labelEn)}
                    {r.count > 1 && <span className="text-slate-500 font-normal"> ×{r.count}</span>}
                  </p>
                  {r.note && <p className="text-xs text-slate-500">{r.note}</p>}
                  {r.blocked && <p className="text-xs text-red-600">{t("محجوب/ة", "Exclu(e)", "Excluded")}</p>}
                </div>
                <div className="text-right shrink-0">
                  {!r.blocked && r.totalAmount > 0 ? (
                    <>
                      <p className="heir-share">{fracStr(r.shareFrac)} = {fmt(r.totalAmount)} MAD</p>
                      {r.count > 1 && (
                        <p className="heir-amount">
                          {t("للفرد", "/ personne", "/ person")}: {fmt(r.perPersonAmount)} MAD
                        </p>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-slate-400">{t("لا يرث", "Exclu", "No share")}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 border-t border-slate-100 pt-3">
            {t(
              "المراجع: مدونة الأسرة المغربية، المواد 325-393 | القانون المغربي للإرث (الفرائض)",
              "Réf. : Moudawana marocaine Art. 325-393 | Loi marocaine des successions",
              "Ref: Moroccan Moudawana Art. 325-393 | Moroccan Inheritance Law (Faraid)"
            )}
          </p>
        </div>
      )}
    </div>
  );
}

// Row is imported from components/simulators/Row
