import Link from "next/link";
import { getDictionary, getLocale } from "../../lib/i18n";
import { makeArticleLinksClickable } from "../../lib/articleLinks";
import { GUIDES } from "../../lib/guidesData";
import Container from "../../components/Container";
import Footer from "../../components/Footer";

const GuidesPage = async () => {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const isAr = locale === "ar";

  // Guides published within the last 30 days get a "new" badge
  const now = Date.now();
  const featuredGuides = GUIDES.map((g) => ({
    ...g,
    isNew: now - new Date(g.publishedAt).getTime() < 30 * 24 * 60 * 60 * 1000,
  }));

  const legalGuides = [
    {
      icon: "💼",
      title: dict.guidesCard1Title,
      body: dict.guidesCard1Body,
      color: "blue",
      codeKey: "labor_code",
      steps: [
        dict.guideWorkStep1 || "Check if dismissal is justified under Labour Code Art. 39",
        dict.guideWorkStep2 || "Gather employment contract and pay slips",
        dict.guideWorkStep3 || "File complaint with Labour Inspector within 90 days",
        dict.guideWorkStep4 || "If unresolved, file case at Labour Court",
      ],
      laws: ["labor_code"],
      cta: { href: "/laws/labor_code/articles?lang=" + locale, label: dict.guideViewCode || "View related articles" },
    },
    {
      icon: "🏠",
      title: dict.guidesCard2Title,
      body: dict.guidesCard2Body,
      color: "amber",
      codeKey: "civil_procedure",
      steps: [
        dict.guideRentStep1 || "Review your lease contract terms and duration",
        dict.guideRentStep2 || "Deposit cannot exceed 2 months' rent (Law 67-12)",
        dict.guideRentStep3 || "Landlord must give written notice before eviction",
        dict.guideRentStep4 || "Dispute? File at First Instance Court",
      ],
      laws: ["civil_procedure"],
      cta: { href: "/laws/civil_procedure/articles?lang=" + locale, label: dict.guideViewCode || "View related articles" },
    },
    {
      icon: "👨‍👩‍👧",
      title: dict.guidesCard3Title,
      body: dict.guidesCard3Body,
      color: "green",
      codeKey: "family_code",
      steps: [
        dict.guideFamilyStep1 || "Marriage requires minimum age of 18 (Art. 19)",
        dict.guideFamilyStep2 || "Divorce can be initiated by either spouse (Art. 78-93)",
        dict.guideFamilyStep3 || "Custody goes to mother, then father (Art. 171)",
        dict.guideFamilyStep4 || "Alimony calculated based on both parties' means (Art. 84-85)",
      ],
      laws: ["family_code"],
      cta: { href: "/laws/family_code/articles?lang=" + locale, label: dict.guideViewCode || "View related articles" },
    },
    {
      icon: "⚖️",
      title: dict.guidePenalTitle || "Criminal Procedures",
      body: dict.guidePenalBody || "Understanding criminal law, penalties, and legal proceedings in Morocco.",
      color: "red",
      codeKey: "criminal_procedure",
      steps: [
        dict.guidePenalStep1 || "File complaint at police station or prosecutor's office",
        dict.guidePenalStep2 || "Criminal investigation conducted by judicial police",
        dict.guidePenalStep3 || "Arraignment before competent court",
        dict.guidePenalStep4 || "Right to appeal within 10 days of verdict",
      ],
      laws: ["criminal_procedure"],
      cta: { href: "/laws/criminal_procedure/articles?lang=" + locale, label: dict.guideViewCode || "View related articles" },
    },
    {
      icon: "📜",
      title: dict.guideContractTitle || "Contracts and Obligations",
      body: dict.guideContractBody || "Learn about contract formation, validity, and enforcement under Moroccan law.",
      color: "purple",
      codeKey: "obligations_contracts",
      steps: [
        dict.guideContractStep1 || "Agreement requires offer, acceptance, and lawful cause (Art. 2 DOC)",
        dict.guideContractStep2 || "Contracts can be verbal or written (Art. 443 DOC)",
        dict.guideContractStep3 || "Breach entitles injured party to damages (Art. 263 DOC)",
        dict.guideContractStep4 || "Limitation period: 15 years for civil obligations (Art. 387 DOC)",
      ],
      laws: ["obligations_contracts"],
      cta: { href: "/laws/obligations_contracts/articles?lang=" + locale, label: dict.guideViewCode || "View related articles" },
    },
    {
      icon: "🏛️",
      title: dict.guideCourtTitle || "Court System",
      body: dict.guideCourtBody || "How to navigate the Moroccan court system and file legal procedures.",
      color: "slate",
      codeKey: "civil_procedure",
      steps: [
        dict.guideCourtStep1 || "First Instance Courts handle most civil and criminal matters",
        dict.guideCourtStep2 || "Court of Appeal for second-degree review",
        dict.guideCourtStep3 || "Court of Cassation for legal (not factual) review",
        dict.guideCourtStep4 || "Administrative Tribunals for disputes with the state",
      ],
      laws: ["civil_procedure"],
      cta: { href: "/laws/civil_procedure/articles?lang=" + locale, label: dict.guideViewCode || "View related articles" },
    },
  ];

  const colors: Record<string, { bg: string; border: string; iconBg: string; accent: string; step: string }> = {
    blue:   { bg: "bg-blue-50/50",   border: "border-blue-200",   iconBg: "bg-blue-100",   accent: "text-blue-700",   step: "bg-blue-600"  },
    amber:  { bg: "bg-amber-50/50",  border: "border-amber-200",  iconBg: "bg-amber-100",  accent: "text-amber-700",  step: "bg-amber-600" },
    green:  { bg: "bg-green-50/50",  border: "border-green-200",  iconBg: "bg-green-100",  accent: "text-green-700",  step: "bg-green-600" },
    red:    { bg: "bg-red-50/50",    border: "border-red-200",    iconBg: "bg-red-100",    accent: "text-red-700",    step: "bg-red-600"   },
    purple: { bg: "bg-purple-50/50", border: "border-purple-200", iconBg: "bg-purple-100", accent: "text-purple-700", step: "bg-purple-600"},
    slate:  { bg: "bg-slate-50",     border: "border-slate-200",  iconBg: "bg-slate-100",  accent: "text-slate-700",  step: "bg-slate-600" },
  };

  return (
    <>
    <Container>
      <div className="section space-y-10">
      {/* Page header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-4 py-1.5 text-xs font-semibold text-green-700">
          📋 {dict.guidesHeaderBadge || "Legal Guides"}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{dict.guidesTitle}</h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">{dict.guidesSubtitle}</p>
      </div>

      {/* Featured deep-dive guides */}
      {featuredGuides.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            {isAr ? "أدلة شاملة" : "Guides complets"}
          </h2>
          <div className="grid gap-4">
            {featuredGuides.map((guide) => {
              const title = isAr ? guide.titleAr : guide.titleFr;
              const desc  = isAr ? guide.descriptionAr : guide.descriptionFr;
              return (
                <Link
                  key={guide.slug}
                  href={`/guides/${guide.slug}`}
                  className="group flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50/40 p-5 hover:border-green-400 hover:shadow-md transition-all"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white text-xl">
                    📜
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-green-300 bg-green-100 px-2.5 py-0.5 text-[11px] font-bold text-green-800">
                        {isAr ? "دليل شامل" : "Guide complet"}
                      </span>
                      {guide.isNew && (
                        <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-[11px] font-bold text-white">
                          {isAr ? "جديد" : "Nouveau"}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        {isAr ? `${guide.readingTimeMinutes} دقائق` : `${guide.readingTimeMinutes} min`}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 leading-snug group-hover:text-green-800 transition-colors">
                      {title}
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{desc}</p>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 shrink-0 text-green-600 ltr:rotate-0 rtl:rotate-180 opacity-60 group-hover:opacity-100 transition-opacity"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Guide cards — 2-column responsive grid */}
      <div className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
        {isAr ? "مسارات إجرائية" : "Guides procéduraux"}
      </h2>
      <div className="grid gap-5 md:grid-cols-2">
        {legalGuides.map((guide) => {
          const c = colors[guide.color] || colors.slate;
          return (
            <div
              key={guide.title}
              className={`rounded-xl border ${c.border} ${c.bg} p-5 sm:p-6 space-y-4 transition-all hover:shadow-md`}
            >
              {/* Title */}
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.iconBg} text-lg shrink-0`}>
                  {guide.icon}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">{guide.title}</h2>
                  <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">{guide.body}</p>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-2">
                {guide.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full ${c.step} text-white text-[10px] font-bold shrink-0 mt-0.5`}>
                      {i + 1}
                    </span>
                    {/* Text from own i18n files — dangerouslySetInnerHTML is safe here */}
                    <p
                      className="text-sm text-slate-700 leading-snug"
                      dangerouslySetInnerHTML={{ __html: makeArticleLinksClickable(step, guide.codeKey, locale) }}
                    />
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Link
                href={guide.cta.href}
                className={`inline-flex items-center gap-1.5 text-sm font-semibold ${c.accent} hover:underline transition-colors`}
              >
                {guide.cta.label}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 ltr:rotate-0 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          );
        })}
      </div>
      </div>

    </div>
    </Container>
    <Footer labels={dict} />
    </>
  );
};

export default GuidesPage;
