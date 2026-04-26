import { getDictionary, getLocale } from "../../../lib/i18n";
import DivorceComingSoon from "../../../components/simulators/DivorceComingSoon";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return {
    title: `${dict.simDivorceTitle} — AI-Mizan`,
    description: dict.simDivorceDescription,
  };
}

export default async function DivorcePage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">{dict.simDivorceTitle}</h1>
      <DivorceComingSoon dict={dict} lang={locale} />
    </div>
  );
}
