import { getDictionary, getLocale } from "../../lib/i18n";
import Container from "../../components/Container";
import Footer from "../../components/Footer";

const AboutPage = async () => {
  const dict = getDictionary(await getLocale());

  return (
    <>
    <Container>
      <div className="section space-y-10 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-4 py-1.5 text-xs font-semibold text-green-700">
          ⚖️ AI-Mizan
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{dict.aboutTitle}</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">{dict.aboutSubtitle}</p>
      </div>

      {/* Three pillars */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="card text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold">{dict.aboutMissionTitle}</h2>
          <p className="text-sm text-slate-600">{dict.aboutMissionBody}</p>
        </div>
        <div className="card text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold">{dict.aboutSourcesTitle}</h2>
          <p className="text-sm text-slate-600">{dict.aboutSourcesBody}</p>
        </div>
        <div className="card text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold">{dict.aboutTransparencyTitle}</h2>
          <p className="text-sm text-slate-600">{dict.aboutTransparencyBody}</p>
        </div>
      </div>

      {/* Disclaimer banner */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-sm text-slate-600 font-medium">{dict.disclaimer}</p>
      </div>
    </div>
    </Container>
    <Footer labels={dict} />
    </>
  );
};

export default AboutPage;
