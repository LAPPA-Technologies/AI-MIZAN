import { cookies, headers } from "next/headers";
import {
  dictionaries,
  localeDateMap,
  locales,
  type Locale
} from "./i18nData";

const DEFAULT_LOCALE: Locale = "ar";

export const getLocale = async () => {
  const cookieStore = await cookies();
  const value = cookieStore.get("locale")?.value;
  if (value && locales.includes(value as Locale)) {
    return value as Locale;
  }

  // Fallback to browser language detection
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");
  if (acceptLanguage) {
    const browserLang = acceptLanguage.split(",")[0].split("-")[0];
    if (locales.includes(browserLang as Locale)) {
      return browserLang as Locale;
    }
  }

  return DEFAULT_LOCALE;
};

export const getLocaleMeta = (locale: Locale) => ({
  dir: locale === "ar" ? "rtl" : "ltr",
  lang: locale
});

export { locales, localeDateMap };

export const getDictionary = (locale: Locale) => dictionaries[locale];
