import { getDictionary, getLocale } from "../../lib/i18n";

const AboutPage = async () => {
  const dict = getDictionary(await getLocale());

  return (
    <div className="section space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">{dict.aboutTitle}</h1>
        <p className="text-slate-600">{dict.aboutSubtitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card">
          <h2 className="text-lg font-semibold">{dict.aboutMissionTitle}</h2>
          <p className="mt-2 text-sm text-slate-600">{dict.aboutMissionBody}</p>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold">{dict.aboutSourcesTitle}</h2>
          <p className="mt-2 text-sm text-slate-600">{dict.aboutSourcesBody}</p>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold">{dict.aboutTransparencyTitle}</h2>
          <p className="mt-2 text-sm text-slate-600">
            {dict.aboutTransparencyBody}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
