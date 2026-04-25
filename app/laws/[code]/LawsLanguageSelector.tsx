"use client";

import { useRouter } from "next/navigation";

type LawsLanguageSelectorProps = {
  code: string;
  selectedLang: string;
  languageCounts: Array<{ language: string; _count: { id: number } }>;
};

const LawsLanguageSelector = ({ code, selectedLang, languageCounts }: LawsLanguageSelectorProps) => {
  const router = useRouter();

  const getCount = (lang: string) => {
    const count = languageCounts.find(c => c.language === lang)?._count.id || 0;
    return count;
  };

  const filterByLanguage = (lang: string) => {
    // Just navigate to filter content by language, don't change global locale
    router.push(`/laws/${code}?lang=${lang}`);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => filterByLanguage('fr')}
        className={`px-3 py-1 rounded text-sm ${selectedLang === 'fr' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}
      >
        FR ({getCount('fr')})
      </button>
      <button
        onClick={() => filterByLanguage('ar')}
        className={`px-3 py-1 rounded text-sm ${selectedLang === 'ar' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}
      >
        AR ({getCount('ar')})
      </button>
    </div>
  );
};

export default LawsLanguageSelector;