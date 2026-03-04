import type { ReactNode } from "react";
import "./globals.css";
import Header from "../components/Header";
import { getDictionary, getLocale, getLocaleMeta } from "../lib/i18n";

export const metadata = {
  title: "AI-Mizan | Moroccan Law Engine",
  description: "Search and browse Moroccan law codes with AI-powered guidance. Trilingual legal database (Arabic, French, English) covering family, penal, civil and commercial law.",
  keywords: ["Moroccan law", "Moudawana", "family code", "penal code", "legal", "Morocco", "قانون الأسرة", "المدونة", "droit marocain", "code p\u00e9nal"],
  openGraph: {
    title: "AI-Mizan \u2014 Moroccan Law Engine",
    description: "Browse and search Moroccan legal codes with official article citations.",
    type: "website",
    locale: "ar_MA",
    alternateLocale: ["fr_MA", "en_US"],
  },
};

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const locale = await getLocale();
  const { dir, lang } = getLocaleMeta(locale);
  const dict = getDictionary(locale);

  return (
    <html lang={lang} dir={dir}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#16a34a" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&family=Noto+Serif+Arabic:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen font-arabic bg-white text-slate-800 flex flex-col antialiased">
        <Header labels={dict} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </body>
    </html>
  );
};

export default RootLayout;