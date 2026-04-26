import Link from "next/link";
import DisclaimerBanner from "../components/DisclaimerBanner";
import Container from "../components/Container";
import Footer from "../components/Footer";
import { prisma } from "../lib/prisma";
import { getDictionary, getLocale, localeDateMap } from "../lib/i18n";

const HomePage = async () => {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const updates = await prisma.lawArticle.findMany({
    where: { code: { in: ["family_code", "labor_code"] } },
    orderBy: { updatedAt: "desc" },
    take: 3
  });

  // Get total article count for stats
  const totalArticles = await prisma.lawArticle.count();
  const uniqueLaws = await prisma.lawArticle.findMany({
    distinct: ["code"],
    select: { code: true },
  });

  return (
    <>
    <Container>
      <div className="section space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-700 via-emerald-700 to-emerald-900 text-white p-6 sm:p-8 md:p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative space-y-6 lg:grid lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-8">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm border border-white/20">
              <img src="https://flagcdn.com/ma.svg" alt="Morocco" width="20" height="15" className="rounded-sm inline-block" />
              <span>{dict.headerTagline || "Moroccan Law Engine"}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              {locale === "ar"
                ? "اعرف حقوقك. مجاناً."
                : locale === "fr"
                ? "Connaissez vos droits. Gratuitement."
                : "Know Your Rights. For Free."}
            </h1>
            <p className="max-w-2xl text-base sm:text-lg text-green-100/90">
              {locale === "ar"
                ? "أدوات قانونية مغربية مجانية — احسب إرثك، راتبك، تعويضك. مبني على القانون المغربي الرسمي."
                : locale === "fr"
                ? "Outils juridiques marocains gratuits — calculez votre héritage, salaire, indemnité. Basé sur le droit marocain officiel."
                : "Free Moroccan legal tools — calculate your inheritance, salary, severance. Based on official Moroccan law."}
            </p>
            <form action="/laws" className="flex flex-col sm:flex-row gap-3">
              <input
                name="q"
                placeholder={dict.heroSearchPlaceholder}
                className="flex-1 rounded-lg border-2 border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-green-200/60 backdrop-blur-sm focus:border-white/50 focus:ring-4 focus:ring-white/10 transition-all"
              />
              <button type="submit" className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-green-800 shadow-sm hover:bg-green-50 transition-colors whitespace-nowrap">
                {dict.searchButton}
              </button>
            </form>
            <div className="flex flex-wrap gap-3">
              <Link className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-green-800 shadow-sm hover:bg-green-50 transition-colors" href="/simulateurs/heritage">
                {locale === "ar" ? "احسب إرثك" : locale === "fr" ? "Calculez votre héritage" : "Calculate Inheritance"}
              </Link>
              <Link className="rounded-lg border-2 border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors" href="/laws">
                {dict.heroCtaLaws}
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 p-4 text-center">
                <div className="text-2xl font-bold">{totalArticles}</div>
                <div className="text-xs text-green-200 mt-1">{dict.officialArticles || "Official Articles"}</div>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 p-4 text-center">
                <div className="text-2xl font-bold">{uniqueLaws.length}</div>
                <div className="text-xs text-green-200 mt-1">{dict.otherLegalCodes || "Legal Codes"}</div>
              </div>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 p-5 text-center space-y-2">
              <div className="flex justify-center">
                <img src="https://flagcdn.com/ma.svg" alt="Morocco" width="40" height="30" className="rounded-sm" />
              </div>
              <p className="text-sm font-semibold text-white">
                {locale === "ar" ? "مجاني للمواطنين دائماً" : locale === "fr" ? "Gratuit pour toujours" : "Always free for citizens"}
              </p>
              <p className="text-xs text-green-200/80">
                {locale === "ar" ? "لا تسجيل، لا رسوم، لا إعلانات" : locale === "fr" ? "Sans inscription, sans frais" : "No signup, no fees, no ads"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <DisclaimerBanner text={dict.disclaimer} />

      {/* Trust bar */}
      <section className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 py-2 text-center">
        <div className="flex items-center gap-2 text-slate-700">
          <span className="text-xl">📚</span>
          <span className="text-sm font-semibold">
            +{totalArticles} {locale === "ar" ? "مادة قانونية رسمية" : locale === "fr" ? "articles juridiques officiels" : "official legal articles"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <span className="text-xl">⚖️</span>
          <span className="text-sm font-semibold">
            {uniqueLaws.length} {locale === "ar" ? "قوانين مغربية" : locale === "fr" ? "codes marocains" : "Moroccan law codes"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <img src="https://flagcdn.com/ma.svg" alt="Morocco" width="20" height="15" className="rounded-sm inline-block" />
          <span className="text-sm font-semibold">
            {locale === "ar" ? "مجاني للمواطنين دائماً" : locale === "fr" ? "Gratuit pour toujours" : "Always free for citizens"}
          </span>
        </div>
      </section>

      {/* Quick topics */}
      <section className="space-y-6">
        <h2 className="section-title">{dict.quickTitle}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: "👨‍👩‍👧",
              text: locale === "ar" ? "الأسرة والطلاق" : locale === "fr" ? "Famille et divorce" : "Family & Divorce",
              href: "/simulateurs/divorce",
            },
            {
              icon: "💼",
              text: locale === "ar" ? "حقوق الشغل" : locale === "fr" ? "Droits du travail" : "Labor Rights",
              href: "/simulateurs/licenciement",
            },
            {
              icon: "📊",
              text: locale === "ar" ? "الإرث والتركة" : locale === "fr" ? "Héritage et succession" : "Inheritance",
              href: "/simulateurs/heritage",
            },
            {
              icon: "🏠",
              text: locale === "ar" ? "السكن والكراء" : locale === "fr" ? "Logement et location" : "Housing & Rent",
              href: "/simulateurs/loyer",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-700 hover:border-green-300 hover:bg-green-50 transition-all shadow-soft"
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.text}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Moroccan-specific tools section */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="section-title">
            {locale === "ar" ? "أدوات قانونية مجانية" : locale === "fr" ? "Outils juridiques gratuits" : "Free Legal Tools"}
          </h2>
          <Link href="/simulateurs" className="text-sm font-semibold text-green-700 hover:text-green-800 transition-colors">
            {locale === "ar" ? "جميع الأدوات" : locale === "fr" ? "Tous les outils" : "All tools"} →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: "📊",
              title: locale === "ar" ? "حاسبة الإرث (الفرائض)" : locale === "fr" ? "Calculateur de succession" : "Inheritance Calculator",
              desc: locale === "ar" ? "وزع التركة وفق الشريعة والقانون المغربي" : locale === "fr" ? "Répartition selon la Moudawana" : "Distribute estate per Moroccan Moudawana",
              href: "/simulateurs/heritage",
              badge: locale === "ar" ? "الأكثر استخداماً" : locale === "fr" ? "Le plus utilisé" : "Most used",
            },
            {
              icon: "💰",
              title: locale === "ar" ? "حاسبة الراتب الصافي" : locale === "fr" ? "Calculateur de salaire net" : "Net Salary Calculator",
              desc: locale === "ar" ? "احسب CNSS وAMO والضريبة على الدخل" : locale === "fr" ? "Calculer CNSS, AMO et IR" : "Calculate CNSS, AMO, and income tax",
              href: "/simulateurs/salaire",
            },
            {
              icon: "📋",
              title: locale === "ar" ? "تعويض الفصل التعسفي" : locale === "fr" ? "Indemnité de licenciement" : "Severance Pay",
              desc: locale === "ar" ? "احسب تعويضك حسب مدة الخدمة" : locale === "fr" ? "Calculer selon l'ancienneté" : "Calculate based on years of service",
              href: "/simulateurs/licenciement",
            },
            {
              icon: "🏠",
              title: locale === "ar" ? "ضمان الإيجار" : locale === "fr" ? "Garantie de loyer" : "Rent Deposit",
              desc: locale === "ar" ? "الحد الأقصى القانوني لضمان الإيجار" : locale === "fr" ? "Plafond légal de la caution" : "Legal maximum for rental deposit",
              href: "/simulateurs/loyer",
            },
            {
              icon: "🏛️",
              title: locale === "ar" ? "رسوم الموثق" : locale === "fr" ? "Frais de notaire" : "Notary Fees",
              desc: locale === "ar" ? "تقدير رسوم التوثيق والتسجيل" : locale === "fr" ? "Estimation des frais de notaire" : "Estimate notary and registration fees",
              href: "/simulateurs/notaire",
            },
            {
              icon: "💼",
              title: locale === "ar" ? "المقاول الذاتي" : locale === "fr" ? "Auto-entrepreneur" : "Self-Employed",
              desc: locale === "ar" ? "احسب ضرائبك كمقاول ذاتي" : locale === "fr" ? "Calculez vos cotisations auto-entrepreneur" : "Calculate your self-employed taxes",
              href: "/simulateurs/auto-entrepreneur",
            },
          ].map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="card group hover:border-green-200 hover:shadow-md transition-all flex items-start gap-3"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-xl shrink-0">{tool.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-green-700 transition-colors">{tool.title}</h3>
                  {tool.badge && (
                    <span className="text-[10px] bg-green-100 text-green-700 border border-green-200 rounded-full px-2 py-0.5 font-bold">{tool.badge}</span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{tool.desc}</p>
              </div>
            </Link>
          ))}
        </div>
        <p className="text-center text-sm text-slate-500">
          {locale === "ar"
            ? "احسب نتيجتك وشاركها مباشرة على واتساب 📲"
            : locale === "fr"
            ? "Calculez votre résultat et partagez-le directement sur WhatsApp 📲"
            : "Calculate your result and share it directly on WhatsApp 📲"}
        </p>
      </section>

      {/* Featured codes */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="section-title">{dict.featuredCodes || "Featured Legal Codes"}</h2>
          <Link href="/laws" className="text-sm font-semibold text-green-700 hover:text-green-800 transition-colors">
            {dict.heroCtaLaws || "Browse All"} →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { code: "family_code", icon: "👨‍👩‍👧", label: dict.familyCodeTitle || "Family Code", desc: dict.familyCodeShort || "Marriage, divorce, custody, inheritance", color: "green" },
            { code: "penal_code", icon: "⚖️", label: dict.penalCodeTitle || "Penal Code", desc: dict.penalCodeShort || "Criminal offences and penalties", color: "red" },
            { code: "obligations_contracts", icon: "📜", label: dict.obligationsCodeTitle || "DOC", desc: dict.obligationsCodeShort || "Contracts, obligations, liability", color: "blue" },
            { code: "civil_procedure", icon: "🏛️", label: dict.civilProcedureCodeTitle || "Civil Procedure", desc: dict.civilProcedureCodeShort || "Court procedures, appeals, enforcement", color: "amber" },
          ].map((item) => (
            <Link
              key={item.code}
              href={`/laws/${item.code}`}
              className="card group hover:border-green-200 hover:shadow-md transition-all text-center space-y-2 py-5"
            >
              <span className="text-2xl">{item.icon}</span>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-green-700 transition-colors">{item.label}</h3>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Services teaser */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="section-title">{dict.servicesTitle || "Legal Services"}</h2>
          <Link href="/services" className="text-sm font-semibold text-green-700 hover:text-green-800 transition-colors">
            {dict.viewAll || "View All"} →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: "🏛️", title: dict.serviceCourts || "Courts Directory", desc: dict.serviceCourtsDesc || "Find courts by city and type across Morocco", href: "/services#courts" },
            { icon: "📚", title: dict.serviceResources || "Legal Resources", desc: dict.serviceResourcesDesc || "Official portals: Bulletin Officiel, Adala, Bar Association", href: "/services#resources" },
            { icon: "🚨", title: dict.serviceContacts || "Emergency Contacts", desc: dict.serviceContactsDesc || "Police, legal aid hotlines, anti-corruption", href: "/services#contacts" },
          ].map((s) => (
            <Link key={s.title} href={s.href} className="card group hover:border-green-200 hover:shadow-md transition-all flex items-start gap-3">
              <span className="text-xl mt-0.5">{s.icon}</span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-green-700 transition-colors">{s.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{s.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest updates */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="section-title">{dict.latestTitle}</h2>
          <Link href="/updates" className="text-sm font-semibold text-green-700 hover:text-green-800 transition-colors">
            {dict.latestCta} →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {updates.map((article) => (
            <Link
              key={article.id}
              href={`/laws/${article.code}/articles/${article.articleNumber}?lang=${locale}`}
              className="card hover:border-green-200 hover:shadow-md transition-all group"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800 group-hover:text-green-700 transition-colors">
                  {article.code.toUpperCase()} &middot; {dict.articleLabel} {article.articleNumber}
                </p>
                <span className="text-xs text-slate-500">
                  {dict.updatedLabel} {article.updatedAt.toLocaleDateString(localeDateMap[locale])}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-600 line-clamp-3">
                {article.text.slice(0, 140)}...
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
    </Container>
    <Footer labels={dict} />
    </>
  );
};

export default HomePage;
