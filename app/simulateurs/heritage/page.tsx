import Link from "next/link";
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

      {/* Guide cross-link */}
      <Link
        href="/guides/calcul-heritage-maroc"
        className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 hover:bg-green-100 hover:border-green-300 transition-all group"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-600 text-white text-base">
          📖
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 group-hover:text-green-800 transition-colors leading-snug">
            {locale === "ar"
              ? "اقرأ دليلنا الشامل: كيف يُحسب الإرث في المغرب؟"
              : "Lire notre guide complet: Comment calculer l'héritage au Maroc ?"}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {locale === "ar"
              ? "جدول الفرائض، أمثلة عملية، الأسئلة الشائعة"
              : "Tableau des Farâ'id, exemples pratiques, FAQ"}
          </p>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 shrink-0 text-green-600 ltr:rotate-0 rtl:rotate-180"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </Link>
    </div>
  );
}
