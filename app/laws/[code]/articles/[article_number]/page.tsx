import Link from "next/link";
import { prisma } from "../../../../../lib/prisma";
import { getDictionary, getLocale } from "../../../../../lib/i18n";
import { getLawShortName } from "../../../../../lib/lawMetadata";
import ArticleLanguageSelector from "./ArticleLanguageSelector";

/** Parse article number for numeric sorting (handles "1", "1-1", "1 bis", etc.) */
function articleSortKey(num: string): number {
  const match = num.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : Infinity;
}

type Props = {
  params: { code: string; article_number: string };
  searchParams: { lang?: string };
};

const ArticleDetailPage = async ({ params, searchParams }: Props) => {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const { code, article_number } = await params;
  const searchParamsResolved = await searchParams;
  const lang = searchParamsResolved.lang || locale;
  const isRTL = lang === "ar";

  // Fetch all language versions of this article
  const articles = await prisma.lawArticle.findMany({
    where: { code, articleNumber: article_number },
    orderBy: { language: "asc" },
  });

  const active = lang
    ? articles.find((a) => a.language === lang)
    : undefined;
  const activeArticle = active ?? articles[0];

  // ── Related articles: same chapter, numerically sorted ──
  const relatedWhere: Record<string, unknown> = {
    code,
    NOT: { articleNumber: article_number },
    language: lang,
  };
  if (activeArticle?.chapter) {
    relatedWhere.chapter = activeArticle.chapter;
  }
  const relatedRaw = await prisma.lawArticle.findMany({
    where: relatedWhere,
    select: { id: true, articleNumber: true, chapter: true },
    distinct: ["articleNumber"],
  });
  // Numeric sort + take closest 5
  const currentNum = articleSortKey(article_number);
  const related = relatedRaw
    .sort((a, b) => {
      const da = Math.abs(articleSortKey(a.articleNumber) - currentNum);
      const db = Math.abs(articleSortKey(b.articleNumber) - currentNum);
      return da - db;
    })
    .slice(0, 5);

  // ── Prev / Next article navigation ──
  const allArticleNumbers = await prisma.lawArticle.findMany({
    where: { code, language: lang },
    select: { articleNumber: true },
    distinct: ["articleNumber"],
  });
  const sorted = [...new Set(allArticleNumbers.map((a) => a.articleNumber))]
    .sort((a, b) => articleSortKey(a) - articleSortKey(b));
  const currentIdx = sorted.indexOf(article_number);
  const prevArticle = currentIdx > 0 ? sorted[currentIdx - 1] : null;
  const nextArticle = currentIdx < sorted.length - 1 ? sorted[currentIdx + 1] : null;

  // Law short name for breadcrumb
  const lawName = getLawShortName(code, locale);

  return (
    <div className="section space-y-6">
      {/* ── Breadcrumb ── */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        <Link href="/laws" className="hover:text-green-700 transition-colors">
          {dict.navLaws || "Laws"}
        </Link>
        <span className="text-slate-300">/</span>
        <Link href={`/laws/${code}?lang=${lang}`} className="hover:text-green-700 transition-colors">
          {lawName}
        </Link>
        <span className="text-slate-300">/</span>
        <Link href={`/laws/${code}/articles?lang=${lang}`} className="hover:text-green-700 transition-colors">
          {dict.articlesLabel || "Articles"}
        </Link>
        <span className="text-slate-300">/</span>
        <span className="font-medium text-slate-700">
          {dict.articleLabel} {article_number}
        </span>
      </nav>

      {/* ── Title row ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          {dict.articleLabel} {article_number}
        </h1>
        <ArticleLanguageSelector
          code={code}
          articleNumber={article_number}
          currentLang={lang}
          languageFrench={dict.languageFrench}
          languageArabic={dict.languageArabic}
          languageEnglish={dict.languageEnglish}
        />
      </div>

      {/* ── Main content grid ── */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {/* Official text */}
          <div
            className="surface"
            dir={isRTL ? "rtl" : "ltr"}
          >
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              {dict.articleOfficial}
            </h2>
            {activeArticle ? (
              <>
                <p className="mt-2 text-sm text-slate-500">
                  {activeArticle.source}
                </p>

                {/* Hierarchy tags */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {activeArticle.book && (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {activeArticle.book}
                    </span>
                  )}
                  {activeArticle.title && (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {activeArticle.title}
                    </span>
                  )}
                  {activeArticle.chapter && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                      {activeArticle.chapter}
                    </span>
                  )}
                  {activeArticle.section && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                      {activeArticle.section}
                    </span>
                  )}
                </div>

                <p className="mt-4 whitespace-pre-line text-lg leading-relaxed">
                  {activeArticle.text}
                </p>
              </>
            ) : (
              <p className="mt-4 text-sm text-slate-500">{dict.citationsEmpty}</p>
            )}
          </div>

          {/* Simplified explanation — only shown if real content exists */}
          {activeArticle?.text && (
            <div className="surface border-l-4 border-green-200 bg-green-50/40">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                {dict.articleSimplified}
              </h2>
              <p className="mt-3 text-sm text-slate-600 italic">
                {dict.articleSimplifiedBody}
              </p>
            </div>
          )}

          {/* ── Prev / Next navigation ── */}
          <div className="flex items-center justify-between gap-4 pt-2">
            {prevArticle ? (
              <Link
                href={`/laws/${code}/articles/${prevArticle}?lang=${lang}`}
                className="btn-outline inline-flex items-center gap-2 text-sm"
              >
                <svg className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {dict.articleLabel} {prevArticle}
              </Link>
            ) : (
              <span />
            )}
            {nextArticle ? (
              <Link
                href={`/laws/${code}/articles/${nextArticle}?lang=${lang}`}
                className="btn-outline inline-flex items-center gap-2 text-sm"
              >
                {dict.articleLabel} {nextArticle}
                <svg className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <aside className="space-y-6">
          {/* Related articles */}
          <div className="surface">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              {dict.articleRelated}
            </h2>
            <div className="mt-4 space-y-2">
              {related.length === 0 ? (
                <p className="text-sm text-slate-500">{dict.citationsEmpty}</p>
              ) : (
                related.map((item) => (
                  <Link
                    key={item.id}
                    href={`/laws/${code}/articles/${item.articleNumber}?lang=${lang}`}
                    className="block rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:border-green-200 hover:bg-green-50/50 transition-colors"
                  >
                    {dict.articleLabel} {item.articleNumber}
                    {item.chapter && (
                      <span className="ms-2 text-xs text-slate-400">{item.chapter}</span>
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Ask about this article */}
          <Link href="/chat" className="btn-primary w-full text-center block">
            {dict.askAbout}
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default ArticleDetailPage;
