import Link from "next/link";
import Container from "../../components/Container";
import Footer from "../../components/Footer";
import { getDictionary, getLocale } from "../../lib/i18n";

const ServicesPage = async () => {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  // ── Moroccan Court System ──
  const courts = [
    {
      name: dict.courtFirstInstance || "Tribunaux de Première Instance",
      nameAr: "المحاكم الابتدائية",
      description: dict.courtFirstInstanceDesc || "Handle civil, commercial, criminal, and social cases at first level. Present in all major cities.",
      icon: "🏛️",
      cities: ["Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir", "Oujda", "Meknès"],
    },
    {
      name: dict.courtAppeal || "Cours d'Appel",
      nameAr: "محاكم الاستئناف",
      description: dict.courtAppealDesc || "Second-degree jurisdiction reviewing decisions of First Instance Courts. Located in regional capitals.",
      icon: "⚖️",
      cities: ["Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir"],
    },
    {
      name: dict.courtCassation || "Cour de Cassation",
      nameAr: "محكمة النقض",
      description: dict.courtCassationDesc || "Highest court in Morocco. Reviews legal (not factual) correctness of lower court decisions.",
      icon: "🏛️",
      cities: ["Rabat"],
    },
    {
      name: dict.courtCommercial || "Tribunaux de Commerce",
      nameAr: "المحاكم التجارية",
      description: dict.courtCommercialDesc || "Specialized courts for commercial disputes, bankruptcy, and business litigation.",
      icon: "💼",
      cities: ["Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir", "Oujda", "Meknès"],
    },
    {
      name: dict.courtAdmin || "Tribunaux Administratifs",
      nameAr: "المحاكم الإدارية",
      description: dict.courtAdminDesc || "Handle disputes between citizens and public administration, tax matters.",
      icon: "📋",
      cities: ["Rabat", "Casablanca", "Marrakech", "Fès", "Agadir", "Oujda", "Meknès"],
    },
  ];

  // ── Essential Legal Resources ──
  const resources = [
    {
      title: dict.resourceBarAssociation || "Barreau du Maroc",
      description: dict.resourceBarDesc || "Find a licensed lawyer through your regional bar association. All practicing lawyers must be registered.",
      icon: "👨‍⚖️",
      link: "https://www.barreaumaroc.ma",
      linkLabel: "barreaumaroc.ma",
    },
    {
      title: dict.resourceBO || "Bulletin Officiel",
      description: dict.resourceBODesc || "Official gazette where all Moroccan laws, decrees, and regulations are published.",
      icon: "📰",
      link: "http://www.sgg.gov.ma/BulletinOfficiel.aspx",
      linkLabel: "sgg.gov.ma",
    },
    {
      title: dict.resourceMinJustice || "Ministère de la Justice",
      description: dict.resourceMinJusticeDesc || "Official portal for justice services, court information, and legal aid applications.",
      icon: "🏛️",
      link: "https://www.justice.gov.ma",
      linkLabel: "justice.gov.ma",
    },
    {
      title: dict.resourceAdala || "Portail Adala",
      description: dict.resourceAdalaDesc || "Digital platform for accessing Moroccan legislation, case law, and legal information.",
      icon: "📚",
      link: "http://adala.justice.gov.ma",
      linkLabel: "adala.justice.gov.ma",
    },
    {
      title: dict.resourceCNDH || "CNDH",
      description: dict.resourceCNDHDesc || "Conseil National des Droits de l'Homme — protects and promotes human rights in Morocco.",
      icon: "🤝",
      link: "https://www.cndh.ma",
      linkLabel: "cndh.ma",
    },
    {
      title: dict.resourceMediator || "Médiateur du Royaume",
      description: dict.resourceMediatorDesc || "Independent institution handling complaints against public administration.",
      icon: "🕊️",
      link: "https://www.mediateur.ma",
      linkLabel: "mediateur.ma",
    },
  ];

  // ── Emergency & Legal Contacts ──
  const contacts = [
    { name: dict.contactPolice || "Police", number: "19", icon: "🚔" },
    { name: dict.contactGendarmerie || "Gendarmerie Royale", number: "177", icon: "🛡️" },
    { name: dict.contactFire || "Pompiers / Ambulance", number: "15", icon: "🚒" },
    { name: dict.contactWomen || "Ligne d'écoute Femmes", number: "0801 00 08 88", icon: "📞" },
    { name: dict.contactChildren || "Protection de l'Enfance", number: "0801 00 09 00", icon: "👶" },
    { name: dict.contactAnticorruption || "Lutte Anticorruption", number: "0537 57 86 00", icon: "🔍" },
  ];

  return (
    <>
    <Container>
      <div className="section space-y-12">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-4 py-1.5 text-xs font-semibold text-green-700">
            🏛️ {dict.servicesTitle || "Legal Services"}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            {dict.servicesHeading || "Services Juridiques"}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            {dict.servicesSubtitle || "Courts, lawyers, legal resources, and essential contacts for navigating Moroccan law."}
          </p>
        </div>

        {/* ── Emergency Contacts Strip ── */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            🚨 {dict.emergencyTitle || "Emergency & Legal Contacts"}
          </h2>
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {contacts.map((c) => (
              <div key={c.number} className="card text-center py-3 px-2 space-y-1 hover:border-green-200 transition-colors">
                <span className="text-xl">{c.icon}</span>
                <p className="text-xs font-medium text-slate-700 leading-tight">{c.name}</p>
                <p className="text-sm font-bold text-green-700 tracking-wide" dir="ltr">{c.number}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Court System ── */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              🏛️ {dict.courtSystemTitle || "Moroccan Court System"}
            </h2>
            <Link href="/services/courts" className="btn-primary text-xs py-1.5 px-4 inline-flex items-center gap-2">
              📍 {dict.serviceCourts || "Full Courts Directory"}
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courts.map((court) => (
              <div key={court.name} className="card space-y-2.5 hover:border-green-200 hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{court.icon}</span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">{court.name}</h3>
                    {locale === "ar" && <p className="text-xs text-slate-500">{court.nameAr}</p>}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{court.description}</p>
                <div className="flex flex-wrap gap-1">
                  {court.cities.map((city) => (
                    <span key={city} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">{city}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Court Hierarchy Diagram */}
          <div className="surface bg-slate-50 text-center space-y-2 py-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">{dict.courtHierarchy || "Court Hierarchy"}</p>
            <div className="flex flex-col items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-lg bg-green-600 text-white px-4 py-2 text-sm font-bold shadow-sm">
                🏛️ {dict.courtCassation || "Cour de Cassation"}
              </span>
              <span className="text-slate-300">▼</span>
              <span className="inline-flex items-center gap-2 rounded-lg bg-green-500 text-white px-4 py-2 text-sm font-semibold shadow-sm">
                ⚖️ {dict.courtAppeal || "Cours d'Appel"}
              </span>
              <span className="text-slate-300">▼</span>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-lg bg-green-100 text-green-800 px-3 py-1.5 text-xs font-semibold border border-green-200">
                  🏛️ {dict.courtFirstInstance || "Tribunaux de 1ère Instance"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg bg-blue-100 text-blue-800 px-3 py-1.5 text-xs font-semibold border border-blue-200">
                  💼 {dict.courtCommercial || "Tribunaux de Commerce"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-100 text-amber-800 px-3 py-1.5 text-xs font-semibold border border-amber-200">
                  📋 {dict.courtAdmin || "Tribunaux Administratifs"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Legal Resources ── */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            📚 {dict.resourcesTitle || "Essential Legal Resources"}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((r) => (
              <a
                key={r.title}
                href={r.link}
                target="_blank"
                rel="noopener noreferrer"
                className="card group hover:border-green-200 hover:shadow-md transition-all space-y-2"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{r.icon}</span>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-green-700 transition-colors">{r.title}</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{r.description}</p>
                <div className="flex items-center gap-1 text-xs text-green-700 font-medium">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.556a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.25 8.707" />
                  </svg>
                  {r.linkLabel}
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ── Document Templates ── */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              📄 {dict.documentsTitle || "Legal Document Templates"}
            </h2>
            <Link href="/services/documents" className="btn-primary text-xs py-1.5 px-4 inline-flex items-center gap-2">
              📝 {dict.documentsBrowse || "Browse & Download Templates"}
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Category A: Fillable Forms */}
            <Link href="/services/documents?tab=forms" className="card space-y-2 hover:border-green-200 hover:shadow-md transition-all group p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-700 text-lg">📝</span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-green-700 transition-colors">
                    {dict.categoryFillableForms || "Fillable Forms"}
                  </h3>
                  <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-semibold">
                    {dict.badgeForm || "Form"} — PDF
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {dict.fillableFormsBanner || "Fill, preview, and download PDF forms for private agreements. No court filing needed."}
              </p>
            </Link>
            {/* Category B: Procedure Guides */}
            <Link href="/services/documents?tab=guides" className="card space-y-2 hover:border-blue-200 hover:shadow-md transition-all group p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 text-lg">📋</span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {dict.categoryProcedureGuides || "Procedure Guides"}
                  </h3>
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-semibold">
                    {dict.badgeGuide || "Guide"}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {dict.procedureGuidesBanner || "Prepare documents for court, notary, or administration filing."}
              </p>
            </Link>
          </div>
        </section>

        {/* ── CTA ── */}
        <div className="surface bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-center space-y-3 py-8">
          <h3 className="text-lg font-bold text-slate-900">
            {dict.servicesCta || "Need legal guidance?"}
          </h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            {dict.servicesCtaBody || "Ask AI-Mizan about your legal situation and get article-backed answers in Arabic, French, or English."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/chat" className="btn-primary inline-flex items-center gap-2">
              {dict.navAsk || "Ask AI-Mizan"}
            </Link>
            <Link href="/laws" className="btn-outline inline-flex items-center gap-2">
              {dict.heroCtaLaws || "Browse Laws"}
            </Link>
          </div>
        </div>
      </div>
    </Container>
    <Footer labels={dict} />
    </>
  );
};

export default ServicesPage;
