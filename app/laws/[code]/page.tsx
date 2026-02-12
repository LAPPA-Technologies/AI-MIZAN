import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { getDictionary, getLocale } from "../../../lib/i18n";

const LawChaptersPage = async ({ params }: { params: { code: string } }) => {
  const dict = getDictionary(await getLocale());
  const { code } = params;
  const chapters = await prisma.lawArticle.findMany({
    where: { code },
    distinct: ["chapter"],
    select: { chapter: true },
    orderBy: { chapter: "asc" }
  });

  return (
    <div className="section space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">{code.toUpperCase()}</h1>
        <p className="text-slate-600">{dict.chaptersSubtitle}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {chapters.map((chapter) => (
          <div key={chapter.chapter} className="card">
            <h2 className="text-lg font-semibold">{chapter.chapter}</h2>
            <Link
              href={`/laws/${code}/articles?chapter=${encodeURIComponent(
                chapter.chapter
              )}`}
              className="mt-3 inline-flex text-sm font-medium text-emerald-700"
            >
              {dict.viewArticles}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LawChaptersPage;
