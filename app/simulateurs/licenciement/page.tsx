import { getDictionary, getLocale } from "../../../lib/i18n";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return {
    title: `${dict.simSeveranceTitle} — AI-Mizan`,
    description: dict.simSeveranceDescription,
  };
}

export default async function LicenciementPage() {
  const dict = getDictionary(await getLocale());
  return <div>{dict.simSeveranceTitle}</div>;
}
