import { prisma } from "../../lib/prisma";
import { getDictionary, getLocale, localeDateMap } from "../../lib/i18n";

const UpdatesPage = async () => {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const updates = await prisma.lawArticle.findMany({
    orderBy: { updatedAt: "desc" },
    take: 20
  });

  return (
    <div className="section space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">{dict.updatesTitle}</h1>
        <p className="text-slate-600">{dict.updatesSubtitle}</p>
      </div>
      <div className="grid gap-4">
        {updates.map((article) => (
          <div key={article.id} className="card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">
                {article.code.toUpperCase()} · {dict.articleLabel} {article.articleNumber}
              </h2>
              <span className="text-xs text-slate-500">
                {dict.updatedLabel} {article.updatedAt.toLocaleDateString(localeDateMap[locale])}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {article.text.slice(0, 180)}...
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpdatesPage;
