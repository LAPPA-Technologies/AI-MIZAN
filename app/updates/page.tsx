import Link from "next/link";
import Container from "../../components/Container";
import Footer from "../../components/Footer";
import { prisma } from "../../lib/prisma";
import { getDictionary, getLocale, localeDateMap } from "../../lib/i18n";

const UpdatesPage = async () => {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const updates = await prisma.lawArticle.findMany({
    orderBy: { updatedAt: "desc" },
    take: 30,
    select: {
      id: true,
      code: true,
      articleNumber: true,
      language: true,
      text: true,
      updatedAt: true,
      book: true,
      chapter: true,
    },
  });

  return (
    <>
    <Container>
      <div className="section space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{dict.updatesTitle}</h1>
        <p className="text-lg text-slate-600">{dict.updatesSubtitle}</p>
      </div>
      <div className="space-y-3">
        {updates.map((article) => (
          <Link
            key={article.id}
            href={`/laws/${article.code}/articles/${article.articleNumber}?lang=${locale}`}
            className="block card hover:border-green-200 hover:shadow-md transition-all group"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-700 border border-green-200">
                  {article.code.toUpperCase()}
                </span>
                <h2 className="text-base font-semibold text-slate-800 group-hover:text-green-700 transition-colors">
                  {dict.articleLabel} {article.articleNumber}
                </h2>
              </div>
              <span className="text-xs text-slate-500">
                {dict.updatedLabel} {article.updatedAt.toLocaleDateString(localeDateMap[locale])}
              </span>
            </div>
            {article.book && (
              <p className="mt-1 text-xs text-slate-400">{article.book}</p>
            )}
            <p className="mt-2 text-sm text-slate-600 line-clamp-2">
              {article.text.slice(0, 200)}...
            </p>
          </Link>
        ))}
      </div>
    </div>
    </Container>
    <Footer labels={dict} />
    </>
  );
};

export default UpdatesPage;
