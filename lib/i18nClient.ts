"use client";

import type { Locale } from "./i18nData";
import { dictionaries, locales } from "./i18nData";

export const getClientLocale = (): Locale => {
  if (typeof document === "undefined") {
    return "ar";
  }

  const match = document.cookie.match(/(?:^|; )locale=([^;]+)/);
  const value = match?.[1];
  if (value && locales.includes(value as Locale)) {
    return value as Locale;
  }

  return "ar";
};

export const getClientDictionary = (): Record<string, string> & { language: Locale } => {
  const locale = getClientLocale();
  return {
    ...dictionaries[locale],
    language: locale
  };
};
