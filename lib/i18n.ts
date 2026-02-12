import { cookies } from "next/headers";
import {
  dictionaries,
  localeDateMap,
  locales,
  type Locale
} from "./i18nData";

const DEFAULT_LOCALE: Locale = "en";

export const getLocale = async () => {
  const cookieStore = await cookies();
  const value = cookieStore.get("locale")?.value;
  if (value && locales.includes(value as Locale)) {
    return value as Locale;
  }
  return DEFAULT_LOCALE;
};

export const getLocaleMeta = (locale: Locale) => ({
  dir: locale === "ar" ? "rtl" : "ltr",
  lang: locale
});

export { locales, localeDateMap };

export const getDictionary = (locale: Locale) => dictionaries[locale];
