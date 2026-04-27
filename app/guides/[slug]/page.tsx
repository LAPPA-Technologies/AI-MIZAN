import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary, getLocale } from "../../../lib/i18n";
import { getGuide, GUIDES } from "../../../lib/guidesData";
import GuideArticle from "../../../components/guides/GuideArticle";
import Container from "../../../components/Container";
import Footer from "../../../components/Footer";

export async function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};

  return {
    title: `${guide.titleAr} | AI-Mizan`,
    description: guide.descriptionAr,
    alternates: {
      canonical: `/guides/${guide.slug}`,
      languages: {
        ar: `/guides/${guide.slug}?lang=ar`,
        fr: `/guides/${guide.slug}?lang=fr`,
      },
    },
    openGraph: {
      title: guide.titleAr,
      description: guide.descriptionAr,
      type: "article",
      publishedTime: guide.publishedAt,
      modifiedTime: guide.updatedAt,
      locale: "ar_MA",
      alternateLocale: ["fr_MA"],
    },
  };
}

function buildJsonLd(guide: ReturnType<typeof getGuide>, baseUrl: string) {
  if (!guide) return null;

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.titleAr,
    description: guide.descriptionAr,
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    inLanguage: "ar",
    url: `${baseUrl}/guides/${guide.slug}`,
    publisher: {
      "@type": "Organization",
      name: "AI-Mizan",
      url: baseUrl,
    },
    about: {
      "@type": "LegalTopic",
      name: guide.titleAr,
    },
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.questionAr,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answerAr,
      },
    })),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "الرئيسية",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "الأدلة القانونية",
        item: `${baseUrl}/guides`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: guide.titleAr,
        item: `${baseUrl}/guides/${guide.slug}`,
      },
    ],
  };

  return { article, faqPage, breadcrumb };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const locale = await getLocale();
  const dict = getDictionary(locale);

  const baseUrl = "https://ai-mizan.com";
  const jsonLd = buildJsonLd(guide, baseUrl);

  return (
    <>
      {jsonLd && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.article) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.faqPage) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.breadcrumb) }}
          />
        </>
      )}
      <Container>
        <GuideArticle guide={guide} lang={locale} dict={dict} />
      </Container>
      <Footer labels={dict} />
    </>
  );
}
