"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import SimulatorResultCard from "./SimulatorResultCard";
import { Row } from "./Row";
import { fmt } from "../../lib/simulatorHelpers";

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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (rent) {
      router.replace(`${pathname}?loyer=${rent}`, { scroll: false });
    }
  }, [rent]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const val = parseFloat(rent);
      if (!isNaN(val) && val > 0) {
        setError("");
        setResult(calcRent(val));
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [rent]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rent) { setError(dict.simErrorRequired || "Please enter a value"); return; }
    const val = parseFloat(rent);
    if (isNaN(val) || val <= 0) { setError(dict.simErrorPositive || "Please enter a positive number"); return; }
    setError("");
    setResult(calcRent(val));
  };

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label htmlFor="rent-monthly" className="block text-sm font-medium text-slate-700 mb-1">
            {dict.simRentMonthly}
          </label>
          <input
            id="rent-monthly" type="number" min="0"
            value={rent}
            onChange={(e) => { setRent(e.target.value); setResult(null); setError(""); }}
            placeholder="5000"
            className="input-shell w-full"
          />
          {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </div>
        <button type="submit" className="btn-primary self-end px-6 py-2">
          {dict.simSalaryCalculate}
        </button>
      </form>
      {result && (
        <SimulatorResultCard
          title={dict.simRentTitle}
          slug="loyer"
          lang={lang}
          dict={dict}
          shareParams={rent ? { loyer: rent } : undefined}
          onReset={() => { setRent(""); setResult(null); setError(""); }}
        >
          <div className="space-y-2">
            <Row label={dict.simRentDeposit} value={`${fmt(result.maxDeposit)} MAD`} color="green" bold large />
            <Row label={dict.simRentNotice} value={`${result.noticePeriod} ${dict.simRentMonths}`} color="amber" />
            <p className="text-xs text-slate-400 mt-2">{dict.simRentLegalRef}</p>
          </div>
        </SimulatorResultCard>
      )}
    </div>
  );
}
