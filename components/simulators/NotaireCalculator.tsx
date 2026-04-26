"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import SimulatorResultCard from "./SimulatorResultCard";
import { Row } from "./Row";
import { fmt, rnd } from "../../lib/simulatorHelpers";

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

interface NotaireCalculatorProps {
  dict: Record<string, string>;
  lang: string;
  initialPrice?: number;
}

export default function NotaireCalculator({ dict, lang, initialPrice }: NotaireCalculatorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [price, setPrice] = useState(initialPrice ? String(initialPrice) : "");
  const [result, setResult] = useState<ReturnType<typeof calcNotary> | null>(
    initialPrice && initialPrice > 0 ? calcNotary(initialPrice) : null
  );
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (price) {
      router.replace(`${pathname}?prix=${price}`, { scroll: false });
    }
  }, [price]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const p = parseFloat(price);
      if (!isNaN(p) && p > 0) {
        setError("");
        setResult(calcNotary(p));
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [price]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!price) { setError(dict.simErrorRequired || "Please enter a value"); return; }
    const p = parseFloat(price);
    if (isNaN(p) || p <= 0) { setError(dict.simErrorPositive || "Please enter a positive number"); return; }
    setError("");
    setResult(calcNotary(p));
  };

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label htmlFor="notary-price" className="block text-sm font-medium text-slate-700 mb-1">
            {dict.simNotaryPrice}
          </label>
          <input
            id="notary-price" type="number" min="0"
            value={price}
            onChange={(e) => { setPrice(e.target.value); setResult(null); setError(""); }}
            placeholder="1000000"
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
          title={dict.simNotaryTitle}
          slug="notaire"
          lang={lang}
          dict={dict}
          shareParams={price ? { prix: price } : undefined}
          onReset={() => { setPrice(""); setResult(null); setError(""); }}
        >
          <div className="space-y-2">
            <Row label={dict.simNotaryRegistration} value={`${fmt(result.registration)} MAD`} color="amber" />
            <Row label={dict.simNotaryStamp} value={`${fmt(result.stamp)} MAD`} color="amber" />
            <Row label={dict.simNotaryConservation} value={`${fmt(result.conservation)} MAD`} color="amber" />
            <Row label={dict.simNotaryHonoraires} value={`${fmt(result.honoraires)} MAD`} color="amber" />
            <div className="border-t-2 border-green-200 pt-3">
              <Row label={dict.simNotaryTotal} value={`${fmt(result.total)} MAD`} color="green" bold large />
            </div>
            <p className="text-xs text-slate-400 mt-2">{dict.simNotaryLegalRef}</p>
          </div>
        </SimulatorResultCard>
      )}
    </div>
  );
}
