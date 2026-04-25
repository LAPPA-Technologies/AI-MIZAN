import Link from "next/link";
import Container from "../../../components/Container";
import Footer from "../../../components/Footer";
import { prisma } from "../../../lib/prisma";
import { getDictionary, getLocale } from "../../../lib/i18n";
import { getLawMetadata, getLawShortName, getLawName } from "../../../lib/lawMetadata";
import { expandQueryForLanguage, isEnglishQuery } from "../../../lib/crossLangSearch";

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

/** Numeric sort key for article numbers ("1" → 1, "1-1" → 1, "12 bis" → 12) */
function articleSortKey(num: string): number {
  const m = num.match(/^(\d+)/);
  return m ? parseInt(m[1], 10) : Infinity;
}

/** Strip Arabic diacritics (tashkeel) for search */
function stripDiacritics(text: string): string {
  // Arabic diacritics: fathah, dammah, kasrah, sukun, shadda, tanwin, etc.
  return text.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, "");
}

type Props = {
  searchParams: Promise<{ q?: string; lang?: string; article?: string }>;
};

const SearchPage = async ({ searchParams }: Props) => {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const sp = await searchParams;
  // Decode query to handle encoded Arabic characters
  const rawQuery = sp.q || "";
  const query = decodeURIComponent(rawQuery).trim();
  const articleNumber = sp.article?.trim() || "";
  const selectedLang = (() => {
    const raw = sp.lang || locale;
    return raw === 'en' ? 'fr' : raw;
  })();

  // Search across ALL codes — with cross-language expansion for English queries
  const buildWhereClause = () => {
    const base: Record<string, unknown> = { language: selectedLang };
    if (articleNumber) base.articleNumber = articleNumber;

    if (query) {
      const searchTerm = stripDiacritics(query);

      // If user typed English but is searching AR/FR articles, expand keywords
      if (isEnglishQuery(query) && (selectedLang === "ar" || selectedLang === "fr")) {
        const expanded = expandQueryForLanguage(query, selectedLang as "ar" | "fr");
        if (expanded.length > 0) {
          // Search with both the original term AND every expanded term (OR)
          const textConditions = [
            { text: { contains: searchTerm, mode: "insensitive" } },
            ...expanded.map((term) => ({
              text: { contains: stripDiacritics(term), mode: "insensitive" },
            })),
          ];
          return { ...base, OR: textConditions };
        }
      }

      // Default: plain text search
      base.text = { contains: searchTerm, mode: "insensitive" };
    }
    return base;
  };

  const whereClause = buildWhereClause();

  const rawArticles = query || articleNumber
    ? await prisma.lawArticle.findMany({
        where: whereClause,
        orderBy: [{ code: "asc" }],
        take: 200,
      })
    : [];

  // Sort articles numerically within each code
  const articles = rawArticles.sort((a, b) => {
    if (a.code !== b.code) return a.code.localeCompare(b.code);
    return articleSortKey(a.articleNumber) - articleSortKey(b.articleNumber);
  });

  // Group by code
  const groupedByCode = new Map<string, typeof articles>();
  for (const article of articles) {
    const list = groupedByCode.get(article.code) || [];
    list.push(article);
    groupedByCode.set(article.code, list);
  }

  const hasResults = articles.length > 0;
  const hasQuery = !!(query || articleNumber);

  return (
    <>
      <Container>
        <div className="section space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {dict.searchAllLaws || "Search All Laws"}
                </h1>
                <p className="text-sm text-slate-500">
                  {dict.searchAllLawsSubtitle || "Search across all Moroccan legal codes simultaneously."}
                </p>
              </div>
              <Link
                href="/laws"
                className="btn-secondary flex items-center gap-2 text-sm shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {dict.backToLawLibrary || "Back to library"}
              </Link>
            </div>
          </div>

          {/* Search Form */}
          <form className="surface space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor="q" className="block text-xs font-medium text-slate-500 mb-1">
                  {dict.searchKeyword || "Keyword"}
                </label>
                <input
                  id="q"
                  name="q"
                  defaultValue={query}
                  placeholder={dict.heroSearchPlaceholder || "Search by article, code, or topic"}
                  className="input-shell"
                />
              </div>
              <div>
                <label htmlFor="article" className="block text-xs font-medium text-slate-500 mb-1">
                  {dict.searchArticleNumber || "Article number"}
                </label>
                <input
                  id="article"
                  name="article"
                  defaultValue={articleNumber}
                  placeholder={dict.searchArticleNumber || "Article number"}
                  className="input-shell"
                />
              </div>
              <div>
                <label htmlFor="lang" className="block text-xs font-medium text-slate-500 mb-1">
                  {dict.languageLabel || "Language"}
                </label>
                <select id="lang" name="lang" defaultValue={selectedLang} className="input-shell">
                  <option value="ar">{dict.languageArabic || "Arabic"}</option>
                  <option value="fr">{dict.languageFrench || "French"}</option>
                </select>
              </div>
            </div>
            <button className="btn-primary w-full sm:w-auto">{dict.searchButton || "Search"}</button>
          </form>

          {/* Results grouped by code */}
          {hasQuery && hasResults && (
            <div className="space-y-8">
              <p className="text-sm text-slate-500">
                {articles.length} {dict.articlesLower || "articles"}{" "}
                {dict.foundAcross || "found across"}{" "}
                {groupedByCode.size} {dict.legalCodes || "codes"}
                {query && (
                  <>
                    {" · "}
                    <span className="font-medium text-green-700">&quot;{query}&quot;</span>
                  </>
                )}
                {articleNumber && (
                  <>
                    {" · "}
                    <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">
                      {dict.articleLabel || "Article"} {articleNumber}
                    </span>
                  </>
                )}
              </p>

              {[...groupedByCode.entries()].map(([code, codeArticles]) => {
                const meta = getLawMetadata(code);
                const shortName = getLawShortName(code, locale);
                const fullName = getLawName(code, locale);
                const icon = codeIcons[code] || "📄";

                return (
                  <section key={code} className="space-y-3">
                    {/* Code group header */}
                    <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-lg shrink-0">
                        {icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-lg font-bold text-slate-900">{shortName}</h2>
                        <p className="text-xs text-slate-500">{fullName}</p>
                      </div>
                      <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                        {codeArticles.length} {dict.articlesLower || "articles"}
                      </span>
                      {meta?.version && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                          v{meta.version}
                        </span>
                      )}
                    </div>

                    {/* Articles for this code */}
                    <div className="grid gap-3">
                      {codeArticles.slice(0, 20).map((article) => (
                        <Link
                          key={article.id}
                          href={`/laws/${code}/articles/${article.articleNumber}?lang=${selectedLang}`}
                          className="card hover:border-green-200 hover:shadow-md transition-all group"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <h3 className="text-base font-semibold text-slate-900 group-hover:text-green-700 transition-colors">
                              {dict.articleLabel || "Article"} {article.articleNumber}
                            </h3>
                            <div className="flex flex-wrap gap-1">
                              {article.book && (
                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                  {article.book}
                                </span>
                              )}
                              {article.chapter && (
                                <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">
                                  {article.chapter}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                            {article.text.slice(0, 250)}...
                          </p>
                          <div className="mt-2 text-xs text-slate-400">
                            {dict.sourceLabel || "Source"}: {article.source}
                          </div>
                        </Link>
                      ))}
                      {codeArticles.length > 20 && (
                        <Link
                          href={`/laws/${code}/articles?q=${encodeURIComponent(query)}&lang=${selectedLang}`}
                          className="text-sm text-green-700 hover:text-green-800 font-medium text-center py-2"
                        >
                          {dict.viewAllResultsIn || "View all"} {codeArticles.length} {dict.articlesLower || "articles"} {dict.inCode || "in"} {shortName} →
                        </Link>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          {/* No results */}
          {hasQuery && !hasResults && (
            <div className="surface text-center py-16 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-700">{dict.noResults || "No results found"}</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                {dict.noResultsHintGlobal || "Try different keywords or change the language."}
              </p>
            </div>
          )}

          {/* No query yet */}
          {!hasQuery && (
            <div className="surface text-center py-16 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-700">
                {dict.searchPrompt || "Enter a keyword or article number to search"}
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                {dict.searchPromptHint || "Results will be grouped by legal code."}
              </p>
            </div>
          )}
        </div>
      </Container>
      <Footer labels={dict} />
    </>
  );
};

export default SearchPage;
