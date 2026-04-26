import { getDictionary, getLocale } from "../../../lib/i18n";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return {
    title: `${dict.simNotaryTitle} — AI-Mizan`,
    description: dict.simNotaryDescription,
  };
}

export default async function NotairePage() {
  const dict = getDictionary(await getLocale());
  return <div>{dict.simNotaryTitle}</div>;
}
