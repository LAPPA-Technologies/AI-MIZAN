import { getDictionary, getLocale } from "../../../lib/i18n";
import LicenciementCalculator from "../../../components/simulators/LicenciementCalculator";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return {
    title: `${dict.simSeveranceTitle} — AI-Mizan`,
    description: dict.simSeveranceDescription,
  };
}

export default async function LicenciementPage({
  searchParams,
}: {
  searchParams: Promise<{ salaire?: string; annees?: string }>;
}) {
  const params = await searchParams;
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const initialGross = params.salaire ? parseFloat(params.salaire) : undefined;
  const initialYears = params.annees ? parseFloat(params.annees) : undefined;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">{dict.simSeveranceTitle}</h1>
      <p className="text-sm text-slate-500">{dict.simSeveranceDescription}</p>
      <LicenciementCalculator dict={dict} lang={locale} initialGross={initialGross} initialYears={initialYears} />
    </div>
  );
}
