"use client";

import { useState, useEffect, useRef } from "react";
import SimulatorResultCard from "./SimulatorResultCard";
import { fmt } from "../../lib/simulatorHelpers";

// ── Fraction arithmetic for Faraid calculations ──
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

  const blockedByFather = !hasFather && !hasGrandfather;
  void blockedByFather;
  const fullSibsBlock = hasSon || hasFather || hasGrandfather;
  const halfSibsPatBlock = hasSon || hasFather || hasGrandfather || inp.fullBrother > 0;
  const uterineBlock = hasDescendant || hasFather || hasGrandfather;

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

  if (!hasSon && inp.daughter > 0) {
    const df = inp.daughter === 1 ? frac(1, 2) : frac(2, 3);
    add("daughter_fixed", "بنت/بنات", "Fille(s)", "Daughter(s)", inp.daughter, df);
  }

  if (!fullSibsBlock && inp.fullSister > 0 && inp.fullBrother === 0 && !hasSon && inp.daughter === 0) {
    const sf = inp.fullSister === 1 ? frac(1, 2) : frac(2, 3);
    add("full_sister", "أخت شقيقة", "Sœur germaine", "Full Sister", inp.fullSister, sf);
  } else if (inp.fullSister > 0 && fullSibsBlock) {
    add("full_sister", "أخت شقيقة", "Sœur germaine", "Full Sister", inp.fullSister, frac(0, 1), true, "محجوبة");
  }

  if (!halfSibsPatBlock && inp.halfSisterPat > 0 && inp.halfBrotherPat === 0) {
    const hsf = inp.halfSisterPat === 1 ? frac(1, 2) : frac(2, 3);
    add("half_sister_pat", "أخت لأب", "Demi-sœur paternelle", "Half-Sister (pat.)", inp.halfSisterPat, hsf);
  } else if (inp.halfSisterPat > 0 && halfSibsPatBlock) {
    add("half_sister_pat", "أخت لأب", "Demi-sœur paternelle", "Half-Sister (pat.)", inp.halfSisterPat, frac(0, 1), true, "محجوبة");
  }

  if (!uterineBlock && inp.uterineSibling > 0) {
    const uf = inp.uterineSibling === 1 ? frac(1, 6) : frac(1, 3);
    add("uterine", "أخ/أخت لأم", "Frère/sœur utérin(e)", "Uterine Sibling", inp.uterineSibling, uf);
  } else if (inp.uterineSibling > 0 && uterineBlock) {
    add("uterine", "أخ/أخت لأم", "Frère/sœur utérin(e)", "Uterine Sibling", inp.uterineSibling, frac(0, 1), true, "محجوب بالفرع/الأصل");
  }

  let totalFixed = frac(0, 1);
  for (const s of shares) {
    if (!s.blocked) totalFixed = addFrac(totalFixed, s.frac);
  }

  const needsAul = fracGt(totalFixed, frac(1, 1));
  let residual = needsAul ? frac(0, 1) : subFrac(frac(1, 1), totalFixed);
  if (residual.n < 0) residual = frac(0, 1);

  const residualHeirs: typeof shares = [];

  if (hasSon && inp.daughter > 0) {
    // Split residue between sons and daughters at 2:1 — compute fractions directly
    // so perPersonAmount reflects the correct ratio, not an equal head-count split.
    const units = inp.son * 2 + inp.daughter;
    const sonFrac = frac(residual.n * inp.son * 2, residual.d * units);
    const dauFrac = frac(residual.n * inp.daughter, residual.d * units);
    add("son_residual", "ابن (تعصيب)", "Fils (résidu)", "Son(s) (residual)", inp.son, sonFrac, false, "للذكر مثل حظ الأنثيين");
    add("daughter_residual", "بنت (تعصيب)", "Fille(s) (résidu)", "Daughter(s) (residual)", inp.daughter, dauFrac, false, "للذكر مثل حظ الأنثيين");
  } else if (hasSon) {
    add("son", "ابن/أبناء", "Fils", "Son(s)", inp.son, frac(0, 1), false, "يرث بالتعصيب");
    residualHeirs.push({ key: "son", labelAr: "", labelFr: "", labelEn: "", count: inp.son, frac: residual, blocked: false });
  } else if (hasFather && !hasDescendant) {
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
    const hasDaughtersOnly = inp.daughter > 0 && !hasSon;
    if (hasDaughtersOnly && residual.n > 0) {
      residualHeirs.push({ key: "father_fixed", labelAr: "", labelFr: "", labelEn: "", count: 1, frac: residual, blocked: false });
    }
  }

  let aulFactor = frac(1, 1);
  if (needsAul) {
    aulFactor = totalFixed;
  }

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

    const residualEntry = residualHeirs.find(r => r.key === s.key);
    let totalFrac = s.frac;
    if (residualEntry) {
      totalFrac = addFrac(s.frac, residualEntry.frac);
    }
    if (needsAul && s.frac.n > 0) {
      totalFrac = frac(s.frac.n * aulFactor.d, s.frac.d * aulFactor.n);
    }
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

// ── Component ──

type DeceasedGender = "male" | "female";

interface HeritageCalculatorProps {
  dict: Record<string, string>;
  lang: string;
}

const BLANK_INP = {
  husband: 0, wife: 0, son: 0, daughter: 0, father: 0, mother: 0,
  paternalGrandfather: 0, paternalGrandmother: 0, maternalGrandmother: 0,
  fullBrother: 0, fullSister: 0, halfBrotherPat: 0, halfSisterPat: 0, uterineSibling: 0,
};

export default function HeritageCalculator({ dict, lang }: HeritageCalculatorProps) {
  const t = (ar: string, fr: string, en: string) => lang === "ar" ? ar : lang === "fr" ? fr : en;

  const [deceasedGender, setDeceasedGender] = useState<DeceasedGender | null>(null);
  const [estate, setEstate] = useState("");
  const [inp, setInp] = useState<Omit<InheritanceInput, "estate">>(BLANK_INP);
  const [results, setResults] = useState<HeirResult[] | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const estVal = parseFloat(estate);
      if (!isNaN(estVal) && estVal > 0) {
        setResults(calcInheritance({ estate: estVal, ...inp }));
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [estate, inp]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleGenderSelect(g: DeceasedGender) {
    setDeceasedGender(g);
    // Reset spouse fields when switching gender to prevent illegal state
    setInp(prev => ({ ...prev, husband: 0, wife: 0 }));
    setResults(null);
  }

  const otherHeirFields: Array<{ key: keyof typeof inp; ar: string; fr: string; en: string; max?: number }> = [
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
    setResults(calcInheritance({ estate: estVal, ...inp }));
  };

  const hasAnyHeir = Object.values(inp).some(v => v > 0);

  function doReset() {
    setResults(null);
    setEstate("");
    setDeceasedGender(null);
    setInp(BLANK_INP);
  }

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
        {/* Gender selector — must be first */}
        <div>
          <p className="text-sm font-semibold text-slate-800 mb-3">
            {t("من المتوفى؟", "Qui est le défunt ?", "Who passed away?")}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleGenderSelect("male")}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 py-5 font-semibold text-sm transition-all ${
                deceasedGender === "male"
                  ? "border-green-500 bg-green-50 text-green-800"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <span className="text-3xl" role="img" aria-label="male">👤</span>
              <span>{t("رجل", "Homme", "Man")}</span>
            </button>
            <button
              type="button"
              onClick={() => handleGenderSelect("female")}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 py-5 font-semibold text-sm transition-all ${
                deceasedGender === "female"
                  ? "border-green-500 bg-green-50 text-green-800"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <span className="text-3xl" role="img" aria-label="female">👤</span>
              <span>{t("امرأة", "Femme", "Woman")}</span>
            </button>
          </div>
        </div>

        {/* Gate all other fields behind gender selection */}
        {!deceasedGender ? (
          <p className="text-sm text-slate-400 text-center py-5 border border-dashed border-slate-200 rounded-xl">
            {t("اختر أولاً من المتوفى", "Choisissez d'abord le défunt", "Select who passed away first")}
          </p>
        ) : (
          <>
            {/* Estate value */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                {t("قيمة التركة الصافية (درهم)", "Valeur nette de la succession (MAD)", "Net Estate Value (MAD)")}
              </label>
              <input type="number" min="1"
                value={estate}
                onChange={(e) => { setEstate(e.target.value); setResults(null); }}
                placeholder={t("مثال: 500000", "ex: 500000", "e.g. 500000")}
                className="input-shell"
              />
            </div>

            {/* Spouse field — gender-conditional */}
            <div>
              <p className="text-sm font-semibold text-slate-800 mb-3">
                {t("الزوج / الزوجة", "Conjoint(e)", "Spouse")}
              </p>
              {deceasedGender === "male" ? (
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-600">
                    {t("عدد الزوجات (حتى 4)", "Nombre d'épouses (max 4)", "Number of wives (max 4)")}
                  </label>
                  <input
                    type="number" min="0" max="4"
                    value={inp.wife || ""}
                    onChange={(e) => { setInp(prev => ({ ...prev, wife: parseInt(e.target.value) || 0 })); setResults(null); }}
                    placeholder="0"
                    className="input-shell py-2 text-center w-32"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium text-slate-600">
                    {t("هل تركت زوجاً؟", "A-t-elle laissé un mari ?", "Did she leave a husband?")}
                  </label>
                  <button
                    type="button"
                    onClick={() => { setInp(prev => ({ ...prev, husband: prev.husband > 0 ? 0 : 1 })); setResults(null); }}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold border-2 transition-colors ${
                      inp.husband > 0
                        ? "border-green-500 bg-green-50 text-green-800"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {inp.husband > 0 ? t("نعم", "Oui", "Yes") : t("لا", "Non", "No")}
                  </button>
                </div>
              )}
            </div>

            {/* Other heirs */}
            <div>
              <p className="text-sm font-semibold text-slate-800 mb-3">
                {t("باقي الورثة", "Autres héritiers", "Other heirs")}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {otherHeirFields.map((f) => (
                  <div key={f.key} className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">
                      {t(f.ar, f.fr, f.en)}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={f.max ?? 20}
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
          </>
        )}
      </form>

      {results && results.length > 0 && (
        <SimulatorResultCard
          title={t("توزيع الميراث", "Répartition de la succession", "Inheritance Distribution")}
          slug="heritage"
          lang={lang}
          dict={dict}
          onReset={doReset}
        >
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
            <p className="text-xs text-slate-400 border-t border-slate-100 pt-3">
              {t(
                "المراجع: مدونة الأسرة المغربية، المواد 325-393 | القانون المغربي للإرث (الفرائض)",
                "Réf. : Moudawana marocaine Art. 325-393 | Loi marocaine des successions",
                "Ref: Moroccan Moudawana Art. 325-393 | Moroccan Inheritance Law (Faraid)"
              )}
            </p>
          </div>
        </SimulatorResultCard>
      )}
    </div>
  );
}
