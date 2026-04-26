"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import SimulatorResultCard from "./SimulatorResultCard";
import { Row } from "./Row";
import { fmt, rnd } from "../../lib/simulatorHelpers";

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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      if (!isNaN(g) && g > 0 && !isNaN(y) && y > 0) {
        setError("");
        setResult(calcSeverance(g, y));
      }
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
    setError("");
    setResult(calcSeverance(g, y));
  };

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label htmlFor="sev-gross" className="block text-sm font-medium text-slate-700 mb-1">
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
          <label htmlFor="sev-years" className="block text-sm font-medium text-slate-700 mb-1">
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
        <div className="flex flex-col justify-end gap-1">
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" className="btn-primary px-6 py-2">
            {dict.simSalaryCalculate}
          </button>
        </div>
      </form>
      {result && (
        <SimulatorResultCard
          title={dict.simSeveranceTitle}
          slug="licenciement"
          lang={lang}
          dict={dict}
          shareParams={gross && years ? { salaire: gross, annees: years } : undefined}
          onReset={() => { setGross(""); setYears(""); setResult(null); setError(""); }}
        >
          <div className="space-y-2">
            <Row label={dict.simSeveranceResult} value={`${fmt(result.amount)} MAD`} color="green" bold large />
            <p className="text-xs text-slate-400 mt-2">{dict.simSeveranceLegalRef}</p>
          </div>
        </SimulatorResultCard>
      )}
    </div>
  );
}
