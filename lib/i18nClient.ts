"use client";

import type { Locale } from "./i18nData";
import { dictionaries, locales } from "./i18nData";

export const getClientLocale = (): Locale => {
  if (typeof document === "undefined") {
    return "en";
  }

  const match = document.cookie.match(/(?:^|; )locale=([^;]+)/);
  const value = match?.[1];
  if (value && locales.includes(value as Locale)) {
    return value as Locale;
  }

  return "en";
};

export const getClientDictionary = () => {
  return dictionaries[getClientLocale()];
};
