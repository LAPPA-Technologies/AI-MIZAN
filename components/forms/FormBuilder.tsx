"use client";

import { useState, useCallback, useEffect } from "react";
import type { DocumentFormConfig, FormField, FormStep, Locale } from "../../lib/forms/types";
import { moroccanCities, getCourtsForCity } from "../../lib/forms/geodata";
import { t as tr } from "../../lib/forms/translations";

/* ─── Props ─────────────────────────────────────────────────── */
interface FormBuilderProps {
  config: DocumentFormConfig;
  locale: Locale;
  data: Record<string, unknown>;
  // Accept either a full new data object or a functional updater to avoid
  // stale-closure issues when multiple updates are applied in sequence.
  onChange: (
    data: Record<string, unknown> | ((prev: Record<string, unknown>) => Record<string, unknown>)
  ) => void;
  onComplete: () => void;
}

/* ─── Component ─────────────────────────────────────────────── */
export default function FormBuilder({ config, locale, data, onChange, onComplete }: FormBuilderProps) {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isRTL = locale === "ar";
  const totalSteps = config.steps.length;
  const currentStep = config.steps[step];

  // ── Field value getter/setter ──
  const getValue = useCallback(
    (name: string) => data[name] ?? "",
    [data],
  );

  const setValue = useCallback(
    (name: string, value: unknown) => {
      // Use functional update to avoid stale-closure races when multiple fields
      // are updated in the same handler (e.g., changing city and resetting court).
      try {
        onChange((prev: Record<string, unknown>) => ({ ...(prev ?? {}), [name]: value }));
      } catch {
        // fallback to direct update if parent doesn't accept functional updater
        onChange({ ...data, [name]: value });
      }
      // clear error on change
      setErrors((prev) => {
        if (!prev[name]) return prev;
        const next = { ...prev };
        delete next[name];
        return next;
      });
    },
    [data, onChange],
  );

  // ── Validation ──
  const validateStep = useCallback((): boolean => {
    const errs: Record<string, string> = {};
    for (const field of currentStep.fields) {
      if (field.dependsOn && !data[field.dependsOn]) continue;
      if (field.required) {
        const v = data[field.name];
        if (v === undefined || v === null || v === "" || (Array.isArray(v) && v.filter(Boolean).length === 0)) {
          errs[field.name] = tr("validationRequired", locale);
        }
      }
      // custom validation: paymentDay must be a valid day-in-month
      if (field.name === "paymentDay") {
        const v = data[field.name];
        if (v !== undefined && v !== null && v !== "") {
          const n = Number(v);
          if (!Number.isInteger(n) || n < 1 || n > 31) {
            errs[field.name] = tr("paymentDayInvalid", locale);
          } else if (data.startDate) {
            // if startDate provided, ensure day exists in that month
            try {
              const dt = new Date(String(data.startDate));
              if (!isNaN(dt.getTime())) {
                const year = dt.getFullYear();
                const month = dt.getMonth();
                // days in month
                const max = new Date(year, month + 1, 0).getDate();
                if (n > max) {
                  errs[field.name] = tr("paymentDayInvalid", locale);
                }
              }
            } catch {}
          }
        }
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [currentStep, data, locale]);

  const goNext = useCallback(() => {
    if (!validateStep()) return;
    if (step < totalSteps - 1) setStep(step + 1);
    else onComplete();
  }, [step, totalSteps, validateStep, onComplete]);

  const goPrev = useCallback(() => {
    if (step > 0) setStep(step - 1);
  }, [step]);

  // ── Auto-save to localStorage ──
  useEffect(() => {
    const key = `mizan-draft-${config.slug}`;
    const timer = setTimeout(() => {
      try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
    }, 1500);
    return () => clearTimeout(timer);
  }, [data, config.slug]);

  // ── Restore draft on mount ──
  useEffect(() => {
    const key = `mizan-draft-${config.slug}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === "object" && parsed !== null && Object.keys(parsed).length > 0 && Object.keys(data).length === 0) {
          onChange(parsed);
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.slug]);

  /* ─────────────────────────────────────────────────────────── */
  /* FIELD RENDERERS                                            */
  /* ─────────────────────────────────────────────────────────── */

  const fieldClass = (name: string) =>
    `w-full rounded-lg border ${errors[name] ? "border-red-400 ring-2 ring-red-100" : "border-slate-200"} bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-100`;

  const renderField = (field: FormField) => {
    if (field.dependsOn && !data[field.dependsOn]) return null;

    const label = field.label[locale];
    const placeholder = field.placeholder?.[locale] ?? "";
    const v = getValue(field.name);

    switch (field.type) {
      // ── Text ──
      case "text":
        // Render phone fields LTR to keep numbers aligned correctly on RTL locales
        const inputDir = field.name.toLowerCase().includes("phone") ? "ltr" : (isRTL ? "rtl" : "ltr");
        return (
          <input
            type="text"
            value={String(v)}
            placeholder={placeholder}
            onChange={(e) => setValue(field.name, e.target.value)}
            className={fieldClass(field.name)}
            dir={inputDir}
          />
        );

      // ── Number ──
      case "number":
        return (
          <input
            type="number"
            value={v === "" ? "" : Number(v)}
            placeholder={placeholder}
            onChange={(e) => setValue(field.name, e.target.value)}
            className={fieldClass(field.name)}
            dir="ltr"
          />
        );

      // ── Date ──
      case "date":
        return (
          <input
            type="date"
            value={String(v)}
            onChange={(e) => setValue(field.name, e.target.value)}
            className={fieldClass(field.name)}
            dir="ltr"
          />
        );

      // ── Textarea ──
      case "textarea":
        return (
          <textarea
            value={String(v)}
            placeholder={placeholder}
            onChange={(e) => setValue(field.name, e.target.value)}
            rows={4}
            className={fieldClass(field.name) + " resize-y"}
            dir={isRTL ? "rtl" : "ltr"}
          />
        );

      // ── Select ──
      case "select":
        return (
          <select
            value={String(v)}
            onChange={(e) => setValue(field.name, e.target.value)}
            className={fieldClass(field.name)}
          >
            <option value="">{tr("selectPlaceholder", locale)}</option>
            {(field.options ?? []).map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label[locale]}</option>
            ))}
          </select>
        );

      // ── City ──
      case "city":
        return (
          <select
            value={String(v)}
            onChange={(e) => {
              setValue(field.name, e.target.value);
              // reset court when city changes
              setValue("court", "");
            }}
            className={fieldClass(field.name)}
          >
            <option value="">{tr("selectPlaceholder", locale)}</option>
            {moroccanCities.map((c) => (
              <option key={c.value} value={c.value}>{c.label[locale]}</option>
            ))}
          </select>
        );

      // ── Court (linked to selected city) ──
      case "court": {
        const cityVal = String(data.city ?? "");
        const courts = cityVal ? getCourtsForCity(cityVal) : [];
        return (
          <select
            value={String(v)}
            onChange={(e) => setValue(field.name, e.target.value)}
            className={fieldClass(field.name)}
            disabled={!cityVal}
          >
            <option value="">{cityVal ? tr("selectPlaceholder", locale) : tr("selectCityFirst", locale)}</option>
            {courts.map((c) => (
              <option key={c.value} value={c.value}>{c.label[locale]}</option>
            ))}
          </select>
        );
      }

      // ── Array (dynamic list) ──
      case "array": {
        const items: string[] = Array.isArray(v) ? (v as string[]) : [""];
        const itemLabel = field.arrayItemLabel?.[locale] ?? "";
        const max = field.arrayMax ?? 10;
        return (
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="text-xs text-slate-400 min-w-[24px] text-center">{i + 1}.</span>
                <input
                  type="text"
                  value={item}
                  placeholder={`${itemLabel} ${i + 1}`}
                  onChange={(e) => {
                    const updated = [...items];
                    updated[i] = e.target.value;
                    setValue(field.name, updated);
                  }}
                  className={fieldClass(field.name) + " flex-1"}
                  dir={isRTL ? "rtl" : "ltr"}
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const updated = items.filter((_, j) => j !== i);
                      setValue(field.name, updated);
                    }}
                    className="shrink-0 text-red-400 hover:text-red-600 transition-colors p-1"
                    title={tr("remove", locale)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            {items.length < max && (
              <button
                type="button"
                onClick={() => setValue(field.name, [...items, ""])}
                className="text-xs text-green-600 hover:text-green-700 font-medium transition-colors flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {tr("addItem", locale)}
              </button>
            )}
          </div>
        );
      }

      default:
        return <input type="text" value={String(v)} onChange={(e) => setValue(field.name, e.target.value)} className={fieldClass(field.name)} />;
    }
  };

  /* ─────────────────────────────────────────────────────────── */
  /* RENDER                                                     */
  /* ─────────────────────────────────────────────────────────── */

  return (
    <div className="flex flex-col h-full" dir={isRTL ? "rtl" : "ltr"}>
      {/* ── Step progress bar ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {config.steps.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => i < step && setStep(i)} // only allow going back by clicking
              className={`flex items-center gap-2 text-xs font-medium transition-colors ${
                i === step ? "text-green-700" : i < step ? "text-green-500 cursor-pointer" : "text-slate-400 cursor-default"
              }`}
            >
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i === step ? "bg-green-600 text-white shadow-md shadow-green-200" :
                i < step ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"
              }`}>
                {i < step ? "✓" : i + 1}
              </span>
              <span className="hidden sm:inline">{s.title[locale]}</span>
            </button>
          ))}
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          {tr("stepOf", locale).replace("{current}", String(step + 1)).replace("{total}", String(totalSteps))}
        </p>
      </div>

      {/* ── Step title ── */}
      <div className="mb-5">
        <h3 className="text-lg font-bold text-slate-900">{currentStep.title[locale]}</h3>
        {currentStep.description && (
          <p className="text-sm text-slate-500 mt-0.5">{currentStep.description[locale]}</p>
        )}
      </div>

      {/* ── Fields grid ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
          {currentStep.fields.map((field) => {
            if (field.dependsOn && !data[field.dependsOn]) return null;
            return (
              <div key={field.name} className={field.half ? "col-span-1" : "col-span-1 md:col-span-2"}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {field.label[locale]}
                  {field.required && <span className="text-red-500 ms-0.5">*</span>}
                </label>
                {renderField(field)}
                {errors[field.name] && (
                  <p className="text-xs text-red-500 mt-1">{errors[field.name]}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Navigation buttons ── */}
      <div className="flex items-center justify-between pt-5 mt-5 border-t border-slate-100">
        {step > 0 ? (
          <button
            type="button"
            onClick={goPrev}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <svg className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {tr("previous", locale)}
          </button>
        ) : <div />}

        <button
          type="button"
          onClick={goNext}
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 shadow-md shadow-green-200 transition-all"
        >
          {step < totalSteps - 1 ? tr("next", locale) : tr("generateDocument", locale)}
          <svg className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
