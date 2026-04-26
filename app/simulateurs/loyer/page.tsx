import { getDictionary, getLocale } from "../../../lib/i18n";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return {
    title: `${dict.simRentTitle} — AI-Mizan`,
    description: dict.simRentDescription,
  };
}

export default async function LoyerPage() {
  const dict = getDictionary(await getLocale());
  return <div>{dict.simRentTitle}</div>;
}
