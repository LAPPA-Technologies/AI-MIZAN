import Link from "next/link";
import { prisma } from "../../../../lib/prisma";
import { getDictionary, getLocale } from "../../../../lib/i18n";

type Props = {
  params: { code: string };
  searchParams: { q?: string; article?: string; chapter?: string };
};

const ArticlesPage = async ({ params, searchParams }: Props) => {
  const dict = getDictionary(await getLocale());
  const { code } = params;
  const query = searchParams.q?.trim();
  const articleNumber = searchParams.article?.trim();
  const chapter = searchParams.chapter?.trim();

  const articles = await prisma.lawArticle.findMany({
    where: {
      code,
      ...(chapter ? { chapter } : {}),
      ...(articleNumber ? { articleNumber } : {}),
      ...(query
        ? {
            text: {
              contains: query,
              mode: "insensitive"
            }
          }
        : {})
    },
    orderBy: [{ articleNumber: "asc" }],
    take: 50
  });

  return (
    <div className="section space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">
          {code.toUpperCase()} {dict.articlesTitleSuffix}
        </h1>
        <p className="text-slate-600">{dict.articlesSubtitle}</p>
      </div>

      <form className="surface grid gap-4 md:grid-cols-3">
        <input
          name="q"
          defaultValue={query}
          placeholder={dict.searchKeyword}
          className="input-shell"
        />
        <input
          name="article"
          defaultValue={articleNumber}
          placeholder={dict.searchArticleNumber}
          className="input-shell"
        />
        <button className="btn-primary">
          {dict.searchButton}
        </button>
      </form>

      <div className="grid gap-4">
        {articles.map((article) => (
          <Link
            key={`${article.id}-${article.language}`}
            href={`/laws/${code}/articles/${article.articleNumber}`}
            className="card"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">
                {dict.articleLabel} {article.articleNumber}
              </h2>
              <span className="text-xs text-slate-500">
                {article.language === "ar"
                  ? dict.languageArabic
                  : dict.languageFrench}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {article.text.slice(0, 160)}...
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ArticlesPage;
