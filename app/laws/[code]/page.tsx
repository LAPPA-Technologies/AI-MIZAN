import Link from "next/link";
import Container from "../../../components/Container";
import { prisma } from "../../../lib/prisma";
import { getDictionary, getLocale } from "../../../lib/i18n";
import { getLawMetadata } from "../../../lib/lawMetadata";
import LawsLanguageSelector from "./LawsLanguageSelector";

const LawChaptersPage = async ({
  params,
  searchParams
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ lang?: string }>;
}) => {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const { code } = await params;
  const searchParamsResolved = await searchParams;
  // Map 'en' → 'fr' since articles only exist in ar/fr
  const rawLang = searchParamsResolved.lang || locale;
  const selectedLang = rawLang === 'en' ? 'fr' : rawLang;

  // Get language counts for this code
  const languageCounts = await prisma.lawArticle.groupBy({
    by: ['language'],
    where: { code },
    _count: { id: true }
  });

  // Get hierarchical structure: books -> titles -> chapters
  const hierarchy = await prisma.lawArticle.findMany({
    where: { 
      code,
      language: selectedLang
    },
    select: { 
      book: true, 
      bookOrder: true,
      title: true, 
      chapter: true,
      articleNumber: true
    },
    orderBy: [
      { bookOrder: "asc" },
      { title: "asc" }, 
      { chapter: "asc" },
      { articleNumber: "asc" }
    ]
  });

  // Separate preliminary articles (no book) from regular books
  const preliminaryArticles = hierarchy.filter(article => !article.book);
  const regularArticles = hierarchy.filter(article => article.book);

  // Group regular articles by book -> title -> chapter
  const groupedHierarchy = regularArticles.reduce((acc, article) => {
    const book = article.book!;
    const title = article.title || 'No Title';
    const chapter = article.chapter || dict.generalProvisions;

    if (!acc[book]) acc[book] = {};
    if (!acc[book][title]) acc[book][title] = {};
    if (!acc[book][title][chapter]) acc[book][title][chapter] = [];

    acc[book][title][chapter].push(article.articleNumber);
    return acc;
  }, {} as Record<string, Record<string, Record<string, string[]>>>);

  // Group preliminary articles by chapter
  const preliminaryChapters = preliminaryArticles.reduce((acc, article) => {
    const chapter = article.chapter || dict.generalProvisions;
    if (!acc[chapter]) acc[chapter] = [];
    acc[chapter].push(article.articleNumber);
    return acc;
  }, {} as Record<string, string[]>);

  const lawMetadata = getLawMetadata(code);

  return (
    <Container>
      <div className="section space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-semibold">
              {lawMetadata ? lawMetadata.name[locale as keyof typeof lawMetadata.name] || lawMetadata.name.fr : code.toUpperCase()}
            </h1>
            {lawMetadata && (
              <div className="text-sm text-slate-600 space-y-1 mt-2">
                <p className="font-medium">{lawMetadata.shortName[locale as keyof typeof lawMetadata.shortName] || lawMetadata.shortName.fr}</p>
                {lawMetadata.description && (
                  <p>{lawMetadata.description[locale as keyof typeof lawMetadata.description] || lawMetadata.description.fr}</p>
                )}
                <p>
                  {dict.effectiveDate}: {new Date(lawMetadata.effectiveDate).toLocaleDateString(locale)} •
                  {dict.version}: {lawMetadata.version} •
                  {dict.source}: {lawMetadata.source}
                </p>
              </div>
            )}
            <p className="text-slate-600 mt-2">{dict.chaptersSubtitle}</p>
          </div>
          <LawsLanguageSelector code={code} selectedLang={selectedLang} languageCounts={languageCounts} />
        </div>
      </div>

      <div className="space-y-6">
        {/* Preliminary Articles Section */}
        {Object.keys(preliminaryChapters).length > 0 && (
          <div className="surface">
            <h2 className="text-xl font-semibold mb-4 text-green-800">
              {dict.preliminaryChapter || 'Dispositions Préliminaires'}
            </h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(preliminaryChapters).map(([chapter, articles]) => (
                <div key={chapter} className="card">
                  <h4 className="font-medium text-slate-900 mb-2">{chapter}</h4>
                  <div className="text-sm text-slate-600 mb-3">
                    {articles.length} {dict.articlesLower}
                  </div>
                  <Link
                    href={`/laws/${code}/articles?chapter=${encodeURIComponent(chapter)}&lang=${selectedLang}`}
                    className="text-sm font-medium text-green-700 hover:text-green-800"
                  >
                    {dict.viewArticles}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Books */}
        {Object.entries(groupedHierarchy).map(([book, titles]) => (
          <div key={book} className="surface">
            <h2 className="text-xl font-semibold mb-4 text-green-800">{book}</h2>
            <div className="space-y-4">
              {Object.keys(titles).length === 1 && Object.keys(titles)[0] === 'No Title' ? (
                // If only "No Title", show chapters directly
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(Object.values(titles)[0]).map(([chapter, articles]) => (
                    <div key={chapter} className="card">
                      <h4 className="font-medium text-slate-900 mb-2">{chapter}</h4>
                      <div className="text-sm text-slate-600 mb-3">
                        {articles.length} {dict.articlesLower}
                      </div>
                      <Link
                        href={`/laws/${code}/articles?chapter=${encodeURIComponent(chapter)}&lang=${selectedLang}`}
                        className="text-sm font-medium text-green-700 hover:text-green-800"
                      >
                        {dict.viewArticles}
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                // Show titles with chapters
                Object.entries(titles).map(([title, chapters]) => (
                  <div key={title} className="ltr:ml-4 rtl:mr-4">
                    {title !== 'No Title' && (
                      <h3 className="text-lg font-medium mb-2 text-slate-700">{title}</h3>
                    )}
                    <div className={`${title !== 'No Title' ? 'ltr:ml-4 rtl:mr-4' : ''} grid gap-3 md:grid-cols-2 lg:grid-cols-3`}>
                      {Object.entries(chapters).map(([chapter, articles]) => (
                        <div key={chapter} className="card">
                          <h4 className="font-medium text-slate-900 mb-2">{chapter}</h4>
                          <div className="text-sm text-slate-600 mb-3">
                            {articles.length} {dict.articlesLower}
                          </div>
                          <Link
                            href={`/laws/${code}/articles?chapter=${encodeURIComponent(chapter)}&lang=${selectedLang}`}
                            className="text-sm font-medium text-green-700 hover:text-green-800"
                          >
                            {dict.viewArticles}
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
    </Container>
  );
};

export default LawChaptersPage;
