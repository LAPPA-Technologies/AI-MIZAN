import Link from "next/link";
import { prisma } from "../../../../../lib/prisma";
import { getDictionary, getLocale } from "../../../../../lib/i18n";

type Props = {
  params: { code: string; article_number: string };
  searchParams: { lang?: string };
};

const ArticleDetailPage = async ({ params, searchParams }: Props) => {
  const dict = getDictionary(await getLocale());
  const { code, article_number } = params;
  const lang = searchParams.lang;

  const articles = await prisma.lawArticle.findMany({
    where: {
      code,
      articleNumber: article_number
    },
    orderBy: { language: "asc" }
  });

  const related = await prisma.lawArticle.findMany({
    where: {
      code,
      NOT: { articleNumber: article_number }
    },
    select: {
      id: true,
      articleNumber: true
    },
    orderBy: { articleNumber: "asc" },
    take: 3
  });

  const active = lang
    ? articles.find((article) => article.language === lang)
    : undefined;

  const activeArticle = active ?? articles[0];

  return (
    <div className="section space-y-8">
      <Link href={`/laws/${code}/articles`} className="text-sm text-emerald-700">
        ← {dict.backToArticles}
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">
          {dict.articleLabel} {article_number}
        </h1>
        <div className="flex gap-3">
          <Link
            href={`/laws/${code}/articles/${article_number}?lang=fr`}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm"
          >
            {dict.languageFrench}
          </Link>
          <Link
            href={`/laws/${code}/articles/${article_number}?lang=ar`}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm"
          >
            {dict.languageArabic}
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div
            className={`surface ${
              activeArticle?.language === "ar" ? "rtl" : ""
            }`}
          >
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              {dict.articleOfficial}
            </h2>
            {activeArticle ? (
              <>
                <p className="mt-2 text-sm text-slate-500">
                  {activeArticle.source}
                </p>
                <p className="mt-4 whitespace-pre-line text-lg">
                  {activeArticle.text}
                </p>
              </>
            ) : (
              <p className="mt-4 text-sm text-slate-500">{dict.citationsEmpty}</p>
            )}
          </div>

          <div className="surface">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              {dict.articleSimplified}
            </h2>
            <p className="mt-4 text-sm text-slate-600">
              {dict.articleSimplifiedBody}
            </p>
          </div>
        </div>

        <aside className="space-y-6">
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
                    href={`/laws/${code}/articles/${item.articleNumber}`}
                    className="block rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    {dict.articleLabel} {item.articleNumber}
                  </Link>
                ))
              )}
            </div>
          </div>
          <Link href="/chat" className="btn-primary text-center">
            {dict.askAbout}
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default ArticleDetailPage;
