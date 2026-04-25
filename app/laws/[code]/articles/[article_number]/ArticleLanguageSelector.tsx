"use client";

import { useRouter } from "next/navigation";

type ArticleLanguageSelectorProps = {
  code: string;
  articleNumber: string;
  currentLang: string;
  languageFrench: string;
  languageArabic: string;
};

const ArticleLanguageSelector = ({
  code,
  articleNumber,
  currentLang,
  languageFrench,
  languageArabic,
}: ArticleLanguageSelectorProps) => {
  const router = useRouter();

  const updateLanguage = (lang: string) => {
    router.push(`/laws/${code}/articles/${articleNumber}?lang=${lang}`);
  };

  const langs = [
    { code: 'ar', label: languageArabic },
    { code: 'fr', label: languageFrench },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {langs.map(l => (
        <button
          key={l.code}
          onClick={() => updateLanguage(l.code)}
          className={`rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm transition-colors whitespace-nowrap ${
            currentLang === l.code
              ? 'bg-green-100 border-green-300 text-green-800 font-medium'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
};

export default ArticleLanguageSelector;