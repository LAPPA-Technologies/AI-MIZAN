import { getDictionary, getLocale } from "../../lib/i18n";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return {
    title: `${dict.simulatorsHubTitle} — AI-Mizan`,
    description: dict.simulatorsHubSubtitle,
  };
}

export default async function SimulateursHubPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">{dict.simulatorsHubTitle}</h1>
      <p className="text-slate-600">{dict.simulatorsHubSubtitle}</p>
      {/* Hub grid — wired in Task 5 */}
    </div>
  );
}
