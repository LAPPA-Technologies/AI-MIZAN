import { getDictionary, getLocale } from "../../../lib/i18n";
import AutoEntrepreneurCalculator from "../../../components/simulators/AutoEntrepreneurCalculator";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return {
    title: `${dict.simAutoEntTitle} — AI-Mizan`,
    description: dict.simAutoEntDescription,
  };
}

export default async function AutoEntrepreneurPage({
  searchParams,
}: {
  searchParams: Promise<{ ca?: string; type?: string }>;
}) {
  const params = await searchParams;
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const initialRevenue = params.ca ? parseFloat(params.ca) : undefined;
  const initialType = params.type === "service" ? "service" : params.type === "commerce" ? "commerce" : undefined;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">{dict.simAutoEntTitle}</h1>
      <p className="text-sm text-slate-500">{dict.simAutoEntDescription}</p>
      <AutoEntrepreneurCalculator dict={dict} lang={locale} initialRevenue={initialRevenue} initialType={initialType} />
    </div>
  );
}
