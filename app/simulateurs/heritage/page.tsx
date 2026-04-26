import { getDictionary, getLocale } from "../../../lib/i18n";
import HeritageCalculator from "../../../components/simulators/HeritageCalculator";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return {
    title: `${dict.simInheritanceTitle} — AI-Mizan`,
    description: dict.simInheritanceDescription,
  };
}

export default async function HeritagePage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">{dict.simInheritanceTitle}</h1>
      <p className="text-sm text-slate-500">{dict.simInheritanceDescription}</p>
      <HeritageCalculator dict={dict} lang={locale} />
    </div>
  );
}
