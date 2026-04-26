import { getDictionary, getLocale } from "../../../lib/i18n";
import NotaireCalculator from "../../../components/simulators/NotaireCalculator";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return {
    title: `${dict.simNotaryTitle} — AI-Mizan`,
    description: dict.simNotaryDescription,
  };
}

export default async function NotairePage({
  searchParams,
}: {
  searchParams: Promise<{ prix?: string }>;
}) {
  const params = await searchParams;
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const initialPrice = params.prix ? parseFloat(params.prix) : undefined;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">{dict.simNotaryTitle}</h1>
      <p className="text-sm text-slate-500">{dict.simNotaryDescription}</p>
      <NotaireCalculator dict={dict} lang={locale} initialPrice={initialPrice} />
    </div>
  );
}
