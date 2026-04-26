import { getDictionary, getLocale } from "../../../lib/i18n";
import LoyerCalculator from "../../../components/simulators/LoyerCalculator";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return {
    title: `${dict.simRentTitle} — AI-Mizan`,
    description: dict.simRentDescription,
  };
}

export default async function LoyerPage({
  searchParams,
}: {
  searchParams: Promise<{ loyer?: string }>;
}) {
  const params = await searchParams;
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const initialRent = params.loyer ? parseFloat(params.loyer) : undefined;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">{dict.simRentTitle}</h1>
      <p className="text-sm text-slate-500">{dict.simRentDescription}</p>
      <LoyerCalculator dict={dict} lang={locale} initialRent={initialRent} />
    </div>
  );
}
