"use client";

import { useEffect, useState, useCallback } from "react";
import type { Locale } from "../lib/i18nData";

const options: Array<{ value: Locale; label: string; flag: string }> = [
  { value: "ar", label: "عربية", flag: "🇲🇦" },
  { value: "fr", label: "FR", flag: "🇫🇷" },
  { value: "en", label: "EN", flag: "🇬🇧" },
];

type LanguageToggleProps = {
  variant?: "light" | "dark";
};

const LanguageToggle = ({ variant = "light" }: LanguageToggleProps) => {
  const [locale, setLocale] = useState<Locale>("ar");

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )locale=([^;]+)/);
    if (match?.[1]) {
      const value = decodeURIComponent(match[1]) as Locale;
      if (options.some((option) => option.value === value)) {
        setLocale(value);
      }
    }
  }, []);

  const updateLocale = useCallback((value: Locale) => {
    document.cookie = `locale=${value}; path=/; max-age=31536000; SameSite=Lax`;
    setLocale(value);
    document.documentElement.lang = value;
    document.documentElement.dir = value === "ar" ? "rtl" : "ltr";
    window.dispatchEvent(new Event("locale-change"));
    // Use Next.js router refresh instead of full reload for smoother transition
    window.location.reload();
  }, []);

  const isDark = variant === "dark";

  return (
    <div className={`flex items-center gap-1 rounded-full px-1 py-0.5 text-xs ${
      isDark
        ? "bg-green-900/50 border border-green-700/50"
        : "border border-slate-200 bg-white"
    }`}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => updateLocale(option.value)}
          className={`rounded-full px-2.5 py-1 font-semibold transition-colors ${
            locale === option.value
              ? isDark
                ? "bg-white text-green-800"
                : "bg-green-600 text-white"
              : isDark
                ? "text-green-100 hover:text-white"
                : "text-slate-500 hover:text-slate-700"
          }`}
          aria-label={`Switch to ${option.label}`}
          aria-pressed={locale === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageToggle;
