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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Zone 1: Page Header */}
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4.535 19.672A1.5 1.5 0 006 21h12a1.5 1.5 0 001.465-1.328L20.5 7H3.5l1.035 12.672z" />
          </svg>
          {dict.simPageBadge || "Legal Simulator"}
        </span>
        <h1 className="text-3xl font-bold text-slate-900 leading-tight">{dict.simNotaryTitle}</h1>
        <p className="mt-2 text-slate-500 leading-relaxed">{dict.simNotaryDescription}</p>
      </div>
      <NotaireCalculator dict={dict} lang={locale} initialPrice={initialPrice} />
    </div>
  );
}
