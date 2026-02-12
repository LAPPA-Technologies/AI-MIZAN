import type { ReactNode } from "react";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getDictionary, getLocale, getLocaleMeta } from "../lib/i18n";

export const metadata = {
  title: "AI-Mizan",
  description: "Bilingual Moroccan legal guidance with grounded AI chat."
};

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const locale = await getLocale();
  const { dir, lang } = getLocaleMeta(locale);
  const dict = getDictionary(locale);

  return (
    <html lang={lang} dir={dir}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        <Header labels={dict} />
        <main className="container pb-16 pt-10">{children}</main>
        <Footer labels={dict} />
      </body>
    </html>
  );
};

export default RootLayout;
