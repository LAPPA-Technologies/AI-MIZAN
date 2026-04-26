"use client";

import { useState } from "react";
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
  const [gross, setGross] = useState(initialGross ? String(initialGross) : "");
  const [years, setYears] = useState(initialYears ? String(initialYears) : "");
  const [result, setResult] = useState<ReturnType<typeof calcSeverance> | null>(
    initialGross && initialGross > 0 && initialYears && initialYears > 0
      ? calcSeverance(initialGross, initialYears)
      : null
  );

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
        <SimulatorResultCard
          title={dict.simSeveranceTitle}
          slug="licenciement"
          lang={lang}
          dict={dict}
          shareParams={gross && years ? { salaire: gross, annees: years } : undefined}
          onReset={() => { setGross(""); setYears(""); setResult(null); }}
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
