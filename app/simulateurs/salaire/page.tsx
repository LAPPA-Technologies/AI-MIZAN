import { getDictionary, getLocale } from "../../../lib/i18n";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return {
    title: `${dict.simSalaryTitle} — AI-Mizan`,
    description: dict.simSalaryDescription,
  };
}

export default async function SalairePage() {
  const dict = getDictionary(await getLocale());
  return <div>{dict.simSalaryTitle}</div>;
}
