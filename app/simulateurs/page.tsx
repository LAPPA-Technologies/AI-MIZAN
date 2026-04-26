import Link from "next/link";
import { getDictionary, getLocale } from "../../lib/i18n";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return {
    title: `${dict.simulatorsHubTitle} — AI-Mizan`,
    description: dict.simulatorsHubSubtitle,
  };
}

const SIM_CARDS = [
  {
    slug: "salaire",
    icon: "💰",
    titleKey: "simSalaryTitle",
    descKey: "simSalaryDescription",
    lawRef: "Art. 345-346 Code du Travail",
    ready: true,
  },
  {
    slug: "loyer",
    icon: "🏠",
    titleKey: "simRentTitle",
    descKey: "simRentDescription",
    lawRef: "Art. 627-636 D.O.C.",
    ready: true,
  },
  {
    slug: "licenciement",
    icon: "📋",
    titleKey: "simSeveranceTitle",
    descKey: "simSeveranceDescription",
    lawRef: "Art. 39-53 Code du Travail",
    ready: true,
  },
  {
    slug: "notaire",
    icon: "🏡",
    titleKey: "simNotaryTitle",
    descKey: "simNotaryDescription",
    lawRef: "Art. 2-443 D.O.C.",
    ready: true,
  },
  {
    slug: "auto-entrepreneur",
    icon: "🧑‍💼",
    titleKey: "simAutoEntTitle",
    descKey: "simAutoEntDescription",
    lawRef: "Loi 114-13",
    ready: true,
  },
  {
    slug: "heritage",
    icon: "📊",
    titleKey: "simInheritanceTitle",
    descKey: "simInheritanceDescription",
    lawRef: "Art. 329-393 Moudawana",
    ready: true,
  },
  {
    slug: "divorce",
    icon: "⚖️",
    titleKey: "simDivorceTitle",
    descKey: "simDivorceDescription",
    lawRef: "Art. 78-93 Moudawana",
    ready: false,
  },
];

export default async function SimulateursHubPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale) as Record<string, string>;
  const isRtl = locale === "ar";

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="space-y-10">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-green-600 to-emerald-700 px-8 py-10 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4.535 19.672A1.5 1.5 0 006 21h12a1.5 1.5 0 001.465-1.328L20.5 7H3.5l1.035 12.672z" />
            </svg>
            {dict.simPageBadge || "Legal Simulator"}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {dict.simHubHeroTitle || dict.simulatorsHubTitle}
          </h1>
          <p className="mt-2 text-green-100 leading-relaxed max-w-xl">
            {dict.simHubHeroSubtitle || dict.simulatorsHubSubtitle}
          </p>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-8 -end-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-12 -end-4 h-56 w-56 rounded-full bg-white/5" />
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SIM_CARDS.map((card) => {
          const title = dict[card.titleKey] ?? card.titleKey;
          const desc = dict[card.descKey] ?? card.descKey;

          if (!card.ready) {
            return (
              <div
                key={card.slug}
                className="relative flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 opacity-60"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-xl shrink-0">
                    {card.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-700">{title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{card.lawRef}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                    {dict.simComingSoon}
                  </span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            );
          }

          return (
            <Link
              key={card.slug}
              href={`/simulateurs/${card.slug}`}
              className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-green-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-xl shrink-0 group-hover:bg-green-100 transition-colors">
                  {card.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 group-hover:text-green-700 transition-colors leading-snug">
                    {title}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">{card.lawRef}</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              <span className="mt-auto text-xs font-semibold text-green-600 group-hover:text-green-700 flex items-center gap-1">
                {isRtl ? (
                  <>
                    <span>←</span>
                    <span>ابدأ الحساب</span>
                  </>
                ) : (
                  <>
                    <span>Start →</span>
                  </>
                )}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Trust footer */}
      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 text-green-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
        <p>{dict.simHubTrustFooter}</p>
      </div>
    </div>
  );
}
