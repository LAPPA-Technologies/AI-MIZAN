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
  { slug: "salaire",           icon: "💰", titleKey: "simSalaryTitle",      descKey: "simSalaryDescription",      ready: true },
  { slug: "loyer",             icon: "🏠", titleKey: "simRentTitle",        descKey: "simRentDescription",        ready: true },
  { slug: "licenciement",      icon: "📋", titleKey: "simSeveranceTitle",   descKey: "simSeveranceDescription",   ready: true },
  { slug: "notaire",           icon: "🏡", titleKey: "simNotaryTitle",      descKey: "simNotaryDescription",      ready: true },
  { slug: "auto-entrepreneur", icon: "🧑‍💼", titleKey: "simAutoEntTitle",     descKey: "simAutoEntDescription",     ready: true },
  { slug: "heritage",          icon: "📊", titleKey: "simInheritanceTitle", descKey: "simInheritanceDescription", ready: true },
  { slug: "divorce",           icon: "⚖️", titleKey: "simDivorceTitle",     descKey: "simDivorceDescription",     ready: false },
];

export default async function SimulateursHubPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale) as Record<string, string>;
  const isRtl = locale === "ar";

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{dict.simulatorsHubTitle}</h1>
        <p className="mt-2 text-slate-600">{dict.simulatorsHubSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SIM_CARDS.map((card) => {
          const title = dict[card.titleKey] ?? card.titleKey;
          const desc = dict[card.descKey] ?? card.descKey;

          if (!card.ready) {
            return (
              <div
                key={card.slug}
                className="relative flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-5 opacity-70"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{card.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-700">{title}</p>
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
              className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{card.icon}</span>
                <p className="font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">{title}</p>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              <span className="mt-auto text-xs font-medium text-emerald-600 group-hover:text-emerald-700">
                {isRtl ? "← ابدأ" : "Start →"}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
