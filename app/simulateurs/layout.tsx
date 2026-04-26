import { getDictionary, getLocale } from "../../lib/i18n";
import DisclaimerBanner from "../../components/DisclaimerBanner";
import Container from "../../components/Container";

export default async function SimulateursLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <Container>
      <div className="section space-y-6">
        <DisclaimerBanner text={dict.simResultDisclaimer} />
        {children}
      </div>
    </Container>
  );
}
