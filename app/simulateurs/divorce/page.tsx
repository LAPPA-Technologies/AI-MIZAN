import { getDictionary, getLocale } from "../../../lib/i18n";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return {
    title: `${dict.simDivorceTitle} — AI-Mizan`,
    description: dict.simDivorceDescription,
  };
}

export default async function DivorcePage() {
  const dict = getDictionary(await getLocale());
  return <div>{dict.simDivorceTitle} — {dict.simComingSoon}</div>;
}
