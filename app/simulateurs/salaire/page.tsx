import { getDictionary, getLocale } from "../../../lib/i18n";
import SalaireCalculator from "../../../components/simulators/SalaireCalculator";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return {
    title: `${dict.simSalaryTitle} — AI-Mizan`,
    description: dict.simSalaryDescription,
  };
}

export default async function SalairePage({
  searchParams,
}: {
  searchParams: Promise<{ brut?: string }>;
}) {
  const params = await searchParams;
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const initialGross = params.brut ? parseFloat(params.brut) : undefined;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">{dict.simSalaryTitle}</h1>
      <p className="text-sm text-slate-500">{dict.simSalaryDescription}</p>
      <SalaireCalculator dict={dict} lang={locale} initialGross={initialGross} />
    </div>
  );
}
