import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { getDictionary, getLocale } from "../../lib/i18n";

const LawsPage = async () => {
  const dict = getDictionary(await getLocale());
  const codes = await prisma.lawArticle.findMany({
    distinct: ["code"],
    select: {
      code: true
    },
    orderBy: {
      code: "asc"
    }
  });

  return (
    <div className="section space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">{dict.lawsTitle}</h1>
        <p className="text-slate-600">{dict.lawsSubtitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {codes.map((code) => (
          <Link
            key={code.code}
            href={`/laws/${code.code}`}
            className="card hover:border-emerald-200"
          >
            <h2 className="text-lg font-semibold uppercase">{code.code}</h2>
            <p className="text-sm text-slate-500">{dict.lawsCardCta}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LawsPage;
