import { getDictionary, getLocale } from "../../lib/i18n";

const GuidesPage = async () => {
  const dict = getDictionary(await getLocale());

  return (
    <div className="section space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">{dict.guidesTitle}</h1>
        <p className="text-slate-600">{dict.guidesSubtitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: dict.guidesCard1Title,
            body: dict.guidesCard1Body
          },
          {
            title: dict.guidesCard2Title,
            body: dict.guidesCard2Body
          },
          {
            title: dict.guidesCard3Title,
            body: dict.guidesCard3Body
          }
        ].map((card) => (
          <div key={card.title} className="card">
            <h2 className="text-lg font-semibold">{card.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{card.body}</p>
            <button type="button" className="mt-4 btn-outline">
              {dict.guidesCta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuidesPage;
