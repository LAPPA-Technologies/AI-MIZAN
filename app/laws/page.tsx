import Link from "next/link";
import Container from "../../components/Container";
import Footer from "../../components/Footer";
import { prisma } from "../../lib/prisma";
import { getDictionary, getLocale } from "../../lib/i18n";
import { getLawName, getLawShortName, getLawMetadata } from "../../lib/lawMetadata";

const codeIcons: Record<string, string> = {
  family_code: "👨‍👩‍👧‍👦",
  penal_code: "⚖️",
  obligations_contracts: "📜",
  civil_procedure: "🏛️",
  commerce_code: "🏪",
  criminal_procedure: "🔍",
  labor_code: "👷",
  urbanism_code: "🏗️",
};

const LawsPage = async () => {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  // Content language: map 'en' → 'fr' since articles only exist in ar/fr
  const contentLang = locale === 'en' ? 'fr' : locale;

  // Get all codes with counts per language
  const codeStats = await prisma.lawArticle.groupBy({
    by: ["code", "language"],
    _count: { id: true },
  });

  // Build a map: code -> { total, langs: { fr: N, ar: N, en: N } }
  const codeMap = new Map<string, { total: number; langs: Record<string, number> }>();
  for (const row of codeStats) {
    if (!codeMap.has(row.code)) codeMap.set(row.code, { total: 0, langs: {} });
    const entry = codeMap.get(row.code)!;
    entry.total += row._count.id;
    entry.langs[row.language] = row._count.id;
  }

  const totalArticles = [...codeMap.values()].reduce((s, v) => s + v.total, 0);
  const codes = [...codeMap.keys()].sort();

  return (
    <>
    <Container>
      <div className="section space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">{dict.lawsTitle}</h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto">{dict.lawsSubtitle}</p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <span className="bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1 font-medium">
              {codes.length} {dict.legalCodes || "codes"}
            </span>
            <span className="bg-slate-100 text-slate-600 rounded-full px-3 py-1">
              {totalArticles.toLocaleString()} {dict.articlesLower || "articles"}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="surface">
          <form action="/laws/search" className="flex flex-col sm:flex-row gap-3">
            <input
              name="q"
              placeholder={dict.heroSearchPlaceholder}
              className="input-shell flex-1"
              required
            />
            <input type="hidden" name="lang" value={contentLang} />
            <button className="btn-primary whitespace-nowrap">{dict.searchAllLaws || "Search All Laws"}</button>
          </form>
        </div>

        {/* Code Cards — equal grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {codes.map((code) => {
            const meta = getLawMetadata(code);
            const name = getLawName(code, locale);
            const shortName = getLawShortName(code, locale);
            const description = meta?.description?.[locale as "fr" | "ar" | "en"] || "";
            const stats = codeMap.get(code)!;
            const icon = codeIcons[code] || "📄";

            return (
              <div key={code} className="card flex flex-col h-full space-y-3 hover:border-green-200 hover:shadow-md transition-all">
                {/* Top: Icon + Name + Version */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-xl shrink-0">{icon}</span>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-slate-900 leading-tight">{shortName}</h3>
                      <p className="text-sm text-slate-600 leading-snug">{name}</p>
                    </div>
                  </div>
                  {meta?.version && (
                    <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full shrink-0 font-semibold">
                      v{meta.version}
                    </span>
                  )}
                </div>

                {/* Description — the full legal reference */}
                {description && <p className="text-xs text-slate-500 leading-relaxed">{description}</p>}

                {/* Source */}
                {meta?.source && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <svg className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.556a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.25 8.707" />
                    </svg>
                    {dict.source || "Source"}: {meta.source}
                    {meta.effectiveDate && ` · ${meta.effectiveDate}`}
                  </div>
                )}

                {/* Language badges */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {Object.entries(stats.langs)
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([lang, count]) => (
                      <span key={lang} className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                        {lang.toUpperCase()} {count}
                      </span>
                    ))}
                  <span className="text-[11px] font-bold text-green-700 ltr:ml-auto rtl:mr-auto">
                    {stats.total} {dict.articlesLower || "total"}
                  </span>
                </div>

                {/* Actions — generic labels, pinned to card bottom for consistent alignment */}
                <div className="flex gap-2 pt-4 mt-auto">
                  <Link href={`/laws/${code}?lang=${contentLang}`} className="btn-primary text-xs flex-1 text-center py-2">
                    {dict.lawsCardCta || "View chapters"}
                  </Link>
                  <Link href={`/laws/${code}/articles?lang=${contentLang}`} className="btn-outline text-xs flex-1 text-center py-2">
                    {dict.searchArticles || "Search"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Container>
    <Footer labels={dict} />
    </>
  );
};

export default LawsPage;
