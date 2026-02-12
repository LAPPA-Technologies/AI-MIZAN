"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "../lib/i18nData";

const options: Array<{ value: Locale; label: string }> = [
  { value: "en", label: "EN" },
  { value: "fr", label: "FR" },
  { value: "ar", label: "AR" }
];

const LanguageToggle = () => {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )locale=([^;]+)/);
    if (match?.[1]) {
      const value = decodeURIComponent(match[1]) as Locale;
      if (options.some((option) => option.value === value)) {
        setLocale(value);
      }
    }
  }, []);

  const updateLocale = (value: Locale) => {
    document.cookie = `locale=${value}; path=/; max-age=31536000`;
    setLocale(value);
    document.documentElement.lang = value;
    document.documentElement.dir = value === "ar" ? "rtl" : "ltr";
    window.dispatchEvent(new Event("locale-change"));
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => updateLocale(option.value)}
          className={`rounded-full px-3 py-1 font-semibold ${
            locale === option.value
              ? "bg-emerald-600 text-white"
              : "text-slate-600"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageToggle;
