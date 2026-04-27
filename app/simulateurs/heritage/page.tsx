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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          {dict.simPageBadge || "Legal Simulator"}
        </span>
        <h1 className="text-3xl font-bold text-slate-900 leading-tight">{dict.simInheritanceTitle}</h1>
        <p className="mt-2 text-slate-500 leading-relaxed">{dict.simInheritanceDescription}</p>
      </div>
      <HeritageCalculator dict={dict} lang={locale} />
    </div>
  );
}
