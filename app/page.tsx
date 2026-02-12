import Link from "next/link";
import DisclaimerBanner from "../components/DisclaimerBanner";
import { prisma } from "../lib/prisma";
import { getDictionary, getLocale, localeDateMap } from "../lib/i18n";

const HomePage = async () => {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const updates = await prisma.lawArticle.findMany({
    orderBy: { updatedAt: "desc" },
    take: 3
  });

  return (
    <div className="section space-y-12">
      <section className="surface grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-6">
          <h1 className="text-4xl font-semibold text-slate-900">
            <span className="block">{dict.heroTitlePrimary}</span>
            <span className="mt-2 block text-emerald-700">
              {dict.heroTitleSecondary}
            </span>
          </h1>
          <p className="max-w-2xl text-lg text-slate-600">
            {dict.heroSubtitle}
          </p>
          <form action="/laws" className="flex flex-wrap gap-3">
            <input
              name="q"
              placeholder={dict.heroSearchPlaceholder}
              className="input-shell min-w-[240px] flex-1"
            />
            <button type="submit" className="btn-primary">
              {dict.searchButton}
            </button>
          </form>
          <div className="flex flex-wrap gap-3">
            <Link className="btn-primary" href="/chat">
              {dict.heroCtaChat}
            </Link>
            <Link className="btn-outline" href="/laws">
              {dict.heroCtaLaws}
            </Link>
          </div>
        </div>
        <div className="space-y-4">
          <div className="surface">
            <h2 className="section-title">{dict.quickTitle}</h2>
            <div className="mt-4 grid gap-3">
              {[
                dict.quickRent,
                dict.quickWork,
                dict.quickFamily,
                dict.quickAccidents
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="surface">
            <h2 className="section-title">{dict.howTitle}</h2>
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              {[
                {
                  title: dict.howStep1Title,
                  body: dict.howStep1Body
                },
                {
                  title: dict.howStep2Title,
                  body: dict.howStep2Body
                },
                {
                  title: dict.howStep3Title,
                  body: dict.howStep3Body
                }
              ].map((step, index) => (
                <div key={step.title} className="flex gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800">
                      {step.title}
                    </p>
                    <p className="text-slate-600">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <DisclaimerBanner text={dict.disclaimer} />

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="section-title">{dict.latestTitle}</h2>
          <Link href="/updates" className="text-sm font-semibold text-emerald-700">
            {dict.latestCta}
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {updates.map((article) => (
            <div key={article.id} className="card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">
                  {article.code.toUpperCase()} · {dict.articleLabel} {article.articleNumber}
                </p>
                <span className="text-xs text-slate-500">
                  {dict.updatedLabel} {article.updatedAt.toLocaleDateString(localeDateMap[locale])}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                {article.text.slice(0, 140)}...
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
