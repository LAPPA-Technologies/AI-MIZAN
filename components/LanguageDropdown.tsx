"use client";

import { useEffect, useRef, useState } from "react";

type Locale = "ar" | "fr" | "en";

const OPTIONS: { value: Locale; label: string; flag: string }[] = [
  { value: "ar", label: "العربية", flag: "🇲🇦" },
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "en", label: "English", flag: "🇬🇧" },
];

export default function LanguageDropdown() {
  const [open, setOpen] = useState(false);
  const [locale, setLocale] = useState<Locale>("ar");
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )locale=([^;]+)/);
    if (match?.[1]) setLocale(decodeURIComponent(match[1]) as Locale);
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const setCookieAndReload = (value: Locale) => {
    document.cookie = `locale=${value}; path=/; max-age=31536000; SameSite=Lax`;
    setLocale(value);
    document.documentElement.lang = value;
    document.documentElement.dir = value === "ar" ? "rtl" : "ltr";
    // small UX: close dropdown then reload to apply locale-based content
    setOpen(false);
    setTimeout(() => window.location.reload(), 120);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm hover:shadow-md transition"
      >
        <span className="text-sm">{OPTIONS.find((o) => o.value === locale)?.flag}</span>
        <span className="hidden sm:inline-block">{OPTIONS.find((o) => o.value === locale)?.label}</span>
        <svg className="w-3 h-3 text-slate-400" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-44 rounded-lg bg-white border border-slate-100 shadow-lg py-1 z-50">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setCookieAndReload(opt.value)}
              className={`w-full text-left px-3 py-2 text-sm flex items-center gap-3 hover:bg-slate-50 transition ${locale === opt.value ? "bg-slate-50 font-semibold" : "text-slate-700"}`}
            >
              <span className="w-5 text-lg">{opt.flag}</span>
              <span className="truncate">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
