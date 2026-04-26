"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import SimulatorResultCard from "./SimulatorResultCard";
import { Row } from "./Row";
import { fmt, rnd } from "../../lib/simulatorHelpers";

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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      if (!isNaN(rev) && rev > 0) {
        setError("");
        setResult(calcAutoEnt(rev, type));
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [revenue, type]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revenue) { setError(dict.simErrorRequired || "Please enter a value"); return; }
    const rev = parseFloat(revenue);
    if (isNaN(rev) || rev <= 0) { setError(dict.simErrorPositive || "Please enter a positive number"); return; }
    setError("");
    setResult(calcAutoEnt(rev, type));
  };

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label htmlFor="ae-revenue" className="block text-sm font-medium text-slate-700 mb-1">
            {dict.simAutoEntRevenue}
          </label>
          <input
            id="ae-revenue" type="number" min="0"
            value={revenue}
            onChange={(e) => { setRevenue(e.target.value); setResult(null); setError(""); }}
            placeholder="300000"
            className="input-shell w-full"
          />
          {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
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
        <SimulatorResultCard
          title={dict.simAutoEntTitle}
          slug="auto-entrepreneur"
          lang={lang}
          dict={dict}
          shareParams={revenue ? { ca: revenue, type } : undefined}
          onReset={() => { setRevenue(""); setResult(null); setError(""); }}
        >
          <div className="space-y-2">
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
        </SimulatorResultCard>
      )}
    </div>
  );
}
