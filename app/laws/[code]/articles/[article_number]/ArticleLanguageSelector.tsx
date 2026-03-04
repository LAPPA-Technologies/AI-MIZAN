"use client";

import { useRouter } from "next/navigation";

type ArticleLanguageSelectorProps = {
  code: string;
  articleNumber: string;
  currentLang: string;
  languageFrench: string;
  languageArabic: string;
  languageEnglish: string;
};

const ArticleLanguageSelector = ({
  code,
  articleNumber,
  currentLang,
  languageFrench,
  languageArabic,
  languageEnglish
}: ArticleLanguageSelectorProps) => {
  const router = useRouter();

  const updateLanguage = (lang: string) => {
    router.push(`/laws/${code}/articles/${articleNumber}?lang=${lang}`);
  };

  const langs = [
    { code: 'ar', label: languageArabic },
    { code: 'fr', label: languageFrench },
    { code: 'en', label: languageEnglish },
  ];

  return (
    <div className="flex gap-2">
      {langs.map(l => (
        <button
          key={l.code}
          onClick={() => updateLanguage(l.code)}
          className={`rounded-full border px-4 py-2 text-sm transition-colors ${
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