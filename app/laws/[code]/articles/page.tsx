import Link from "next/link";
import Container from "../../../../components/Container";
import { prisma } from "../../../../lib/prisma";
import { getDictionary, getLocale } from "../../../../lib/i18n";
import { getLawMetadata } from "../../../../lib/lawMetadata";
import ArticlesLanguageSelector from "./ArticlesLanguageSelector";

type Props = {
  params: { code: string };
  searchParams: { q?: string; article?: string; chapter?: string; lang?: string };
};

const ArticlesPage = async ({ params, searchParams }: Props) => {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const { code } = await params;
  const sp = await searchParams;
  const query = sp.q?.trim();
  const articleNumber = sp.article?.trim();
  const chapter = sp.chapter?.trim();
  const selectedLang = sp.lang || locale;

  const languageCounts = await prisma.lawArticle.groupBy({
    by: ["language"],
    where: { code },
    _count: { id: true },
  });

  // Always fetch ALL chapters for this code+language so the dropdown is never stale
  const allChapters = await prisma.lawArticle.findMany({
    where: { code, language: selectedLang },
    select: { chapter: true },
    distinct: ["chapter"],
    orderBy: { chapter: "asc" },
  });
  const chapterList = allChapters.map((c) => c.chapter).filter(Boolean) as string[];

  // Fetch filtered articles
  const articles = await prisma.lawArticle.findMany({
    where: {
      code,
      language: selectedLang,
      ...(chapter ? { chapter } : {}),
      ...(articleNumber ? { articleNumber } : {}),
      ...(query ? { text: { contains: query, mode: "insensitive" } } : {}),
    },
    orderBy: [{ articleNumber: "asc" }],
    take: 50,
  });

  const lawMetadata = getLawMetadata(code);
  const isRtl = selectedLang === "ar";

  return (
    <Container>
      <div className="section space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {lawMetadata
                  ? lawMetadata.name[locale as keyof typeof lawMetadata.name] || lawMetadata.name.fr
                  : code.toUpperCase()}{" "}
                — {dict.articlesTitleSuffix}
              </h1>
              {lawMetadata && (
                <p className="text-sm text-slate-500">
                  {lawMetadata.shortName[locale as keyof typeof lawMetadata.shortName] || lawMetadata.shortName.fr}
                  {" · "}
                  {dict.version}: {lawMetadata.version}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={"/laws/" + code + "?lang=" + selectedLang}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <svg className={"w-4 h-4" + (isRtl ? " rotate-180" : "")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {dict.backToIndex || "العودة إلى فهرس الفصول"}
              </Link>
              <ArticlesLanguageSelector code={code} selectedLang={selectedLang} languageCounts={languageCounts} />
            </div>
          </div>
        </div>

        {/* Search / Filter Form */}
        <form className="surface space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="q" className="block text-xs font-medium text-slate-500 mb-1">{dict.searchKeyword}</label>
              <input id="q" name="q" defaultValue={query} placeholder={dict.searchKeyword} className="input-shell" />
            </div>
            <div>
              <label htmlFor="article" className="block text-xs font-medium text-slate-500 mb-1">{dict.searchArticleNumber}</label>
              <input id="article" name="article" defaultValue={articleNumber} placeholder={dict.searchArticleNumber} className="input-shell" />
            </div>
            <div>
              <label htmlFor="chapter" className="block text-xs font-medium text-slate-500 mb-1">{dict.allChapters}</label>
              <select id="chapter" name="chapter" defaultValue={chapter || ""} className="input-shell">
                <option value="">{dict.allChapters}</option>
                {chapterList.map((ch) => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="lang" className="block text-xs font-medium text-slate-500 mb-1">{dict.languageLabel || "Language"}</label>
              <select id="lang" name="lang" defaultValue={selectedLang} className="input-shell">
                <option value="ar">{dict.languageArabic}</option>
                <option value="fr">{dict.languageFrench}</option>
                <option value="en">{dict.languageEnglish}</option>
              </select>
            </div>
          </div>
          <button className="btn-primary w-full sm:w-auto">{dict.searchButton}</button>
        </form>

        {/* Results */}
        {articles.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">
              {articles.length} {dict.articlesLower || "articles"}
              {query && <>{" · "}<span className="font-medium text-green-700">&quot;{query}&quot;</span></>}
              {chapter && <>{" · "}<span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">{chapter}</span></>}
            </p>
            <div className="grid gap-3">
              {articles.map((article) => (
                <Link
                  key={article.id + "-" + article.language}
                  href={"/laws/" + code + "/articles/" + article.articleNumber + "?lang=" + selectedLang}
                  className="card hover:border-green-200 hover:shadow-md transition-all group"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <h2 className="text-base font-semibold text-slate-900 group-hover:text-green-700 transition-colors">
                      {dict.articleLabel} {article.articleNumber}
                    </h2>
                    <div className="flex flex-wrap gap-1">
                      {(article as any).book && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{(article as any).book}</span>}
                      {article.chapter && <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">{article.chapter}</span>}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{article.text.slice(0, 250)}...</p>
                  <div className="mt-2 text-xs text-slate-400">{dict.sourceLabel}: {article.source}</div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="surface text-center py-16 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-700">{dict.noResults || "لا توجد نتائج"}</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {dict.noResultsHint || "حاول تغيير معايير البحث أو اختيار فصل آخر"}
            </p>
            <Link href={"/laws/" + code + "/articles?lang=" + selectedLang} className="btn-outline inline-flex">
              {dict.clearFilters || "مسح عوامل التصفية"}
            </Link>
          </div>
        )}
      </div>
    </Container>
  );
};

export default ArticlesPage;
