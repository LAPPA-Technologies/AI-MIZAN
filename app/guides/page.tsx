import Link from "next/link";
import { getDictionary, getLocale } from "../../lib/i18n";
import Container from "../../components/Container";
import Footer from "../../components/Footer";

const GuidesPage = async () => {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const legalGuides = [
    {
      icon: "💼",
      title: dict.guidesCard1Title,
      body: dict.guidesCard1Body,
      color: "blue",
      steps: [
        dict.guideWorkStep1 || "Check if dismissal is justified under Labour Code Art. 39",
        dict.guideWorkStep2 || "Gather employment contract and pay slips",
        dict.guideWorkStep3 || "File complaint with Labour Inspector within 90 days",
        dict.guideWorkStep4 || "If unresolved, file case at Labour Court",
      ],
      laws: ["obligations"],
      cta: { href: "/laws/obligations/articles?lang=" + locale, label: dict.guideViewCode || "View related articles" },
    },
    {
      icon: "🏠",
      title: dict.guidesCard2Title,
      body: dict.guidesCard2Body,
      color: "amber",
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
      steps: [
        dict.guideFamilyStep1 || "Marriage requires minimum age of 18 (Art. 19)",
        dict.guideFamilyStep2 || "Divorce can be initiated by either spouse (Art. 78-93)",
        dict.guideFamilyStep3 || "Custody goes to mother, then father (Art. 171)",
        dict.guideFamilyStep4 || "Alimony calculated based on both parties' means (Art. 84-85)",
      ],
      laws: ["family"],
      cta: { href: "/laws/family/articles?lang=" + locale, label: dict.guideViewCode || "View related articles" },
    },
    {
      icon: "⚖️",
      title: dict.guidePenalTitle || "Criminal Procedures",
      body: dict.guidePenalBody || "Understanding criminal law, penalties, and legal proceedings in Morocco.",
      color: "red",
      steps: [
        dict.guidePenalStep1 || "File complaint at police station or prosecutor's office",
        dict.guidePenalStep2 || "Criminal investigation conducted by judicial police",
        dict.guidePenalStep3 || "Arraignment before competent court",
        dict.guidePenalStep4 || "Right to appeal within 10 days of verdict",
      ],
      laws: ["penal"],
      cta: { href: "/laws/penal/articles?lang=" + locale, label: dict.guideViewCode || "View related articles" },
    },
    {
      icon: "📜",
      title: dict.guideContractTitle || "Contracts and Obligations",
      body: dict.guideContractBody || "Learn about contract formation, validity, and enforcement under Moroccan law.",
      color: "purple",
      steps: [
        dict.guideContractStep1 || "Agreement requires offer, acceptance, and lawful cause (Art. 2 DOC)",
        dict.guideContractStep2 || "Contracts can be verbal or written (Art. 443 DOC)",
        dict.guideContractStep3 || "Breach entitles injured party to damages (Art. 263 DOC)",
        dict.guideContractStep4 || "Limitation period: 15 years for civil obligations (Art. 387 DOC)",
      ],
      laws: ["obligations"],
      cta: { href: "/laws/obligations/articles?lang=" + locale, label: dict.guideViewCode || "View related articles" },
    },
    {
      icon: "🏛️",
      title: dict.guideCourtTitle || "Court System",
      body: dict.guideCourtBody || "How to navigate the Moroccan court system and file legal procedures.",
      color: "slate",
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

      {/* Guide cards — 2-column responsive grid */}
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
                    <p className="text-sm text-slate-700 leading-snug">{step}</p>
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

      {/* AI Assistant promo */}
      <div className="surface bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-center space-y-3 py-8">
        <div className="text-3xl">🤖</div>
        <h3 className="text-lg font-bold text-slate-900">{dict.guidesAiTitle || "Need personalized guidance?"}</h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          {dict.guidesAiBody || "Describe your legal situation and AI-Mizan will find the relevant articles and explain your options."}
        </p>
        <Link href="/chat" className="btn-primary inline-flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
          {dict.navAsk || "Ask AI-Mizan"}
        </Link>
      </div>
    </div>
    </Container>
    <Footer labels={dict} />
    </>
  );
};

export default GuidesPage;
