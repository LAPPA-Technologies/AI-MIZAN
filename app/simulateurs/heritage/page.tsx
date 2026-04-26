import { getDictionary, getLocale } from "../../../lib/i18n";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return {
    title: `${dict.simInheritanceTitle} — AI-Mizan`,
    description: dict.simInheritanceDescription,
  };
}

export default async function HeritagePage() {
  const dict = getDictionary(await getLocale());
  return <div>{dict.simInheritanceTitle}</div>;
}
