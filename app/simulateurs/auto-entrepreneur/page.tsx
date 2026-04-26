import { getDictionary, getLocale } from "../../../lib/i18n";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return {
    title: `${dict.simAutoEntTitle} — AI-Mizan`,
    description: dict.simAutoEntDescription,
  };
}

export default async function AutoEntrepreneurPage() {
  const dict = getDictionary(await getLocale());
  return <div>{dict.simAutoEntTitle}</div>;
}
