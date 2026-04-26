export type ArticleRef = {
  code: string;
  articleNumber: string;
  descAr: string;
  descFr: string;
  descEn: string;
  inDb?: boolean; // false = display as non-clickable external law reference
};

export const CALCULATOR_ARTICLES: Record<string, ArticleRef[]> = {
  loyer: [
    // القانون رقم 67.12 (residential tenancy law) is the correct source for rent deposit
    // and eviction rules in Morocco. It is NOT yet ingested into our law_articles DB table
    // (confirmed: only 8 codes exist — see lib/calculatorArticles.ts comment).
    // These entries are intentionally marked inDb: false so CalculatorArticlesStrip
    // renders them as non-clickable informational pills rather than opening the modal.
    // TODO: ingest القانون 67.12 into the DB in a future data session, then set inDb: true
    // and update the code field to the correct slug (e.g. "residential_tenancy").
    { code: "law_67_12", articleNumber: "6", descAr: "القانون 67.12 — الضمان الكرائي: لا يتجاوز شهرين", descFr: "Loi 67-12 — Dépôt de garantie: max 2 mois de loyer", descEn: "Law 67-12 — Security deposit: max 2 months' rent", inDb: false },
    { code: "law_67_12", articleNumber: "19", descAr: "القانون 67.12 — مدة الإخلاء وإشعار المغادرة", descFr: "Loi 67-12 — Délai d'expulsion et préavis de départ", descEn: "Law 67-12 — Eviction timeline and departure notice", inDb: false },
  ],
  salaire: [
    { code: "labor_code", articleNumber: "345", descAr: "اشتراكات CNSS", descFr: "Cotisations CNSS", descEn: "CNSS contributions" },
    { code: "labor_code", articleNumber: "346", descAr: "نسبة الاشتراكات", descFr: "Taux de cotisations", descEn: "Contribution rate" },
    { code: "labor_code", articleNumber: "356", descAr: "التأمين الإجباري عن المرض", descFr: "Assurance maladie obligatoire", descEn: "Mandatory health insurance" },
  ],
  licenciement: [
    { code: "labor_code", articleNumber: "39", descAr: "الفصل التأديبي", descFr: "Licenciement disciplinaire", descEn: "Disciplinary dismissal" },
    { code: "labor_code", articleNumber: "41", descAr: "تعويض الفصل", descFr: "Indemnité de licenciement", descEn: "Severance pay" },
    { code: "labor_code", articleNumber: "53", descAr: "مدة الإشعار", descFr: "Délai de préavis", descEn: "Notice period" },
  ],
  notaire: [
    { code: "obligations_contracts", articleNumber: "2", descAr: "أركان العقد", descFr: "Éléments du contrat", descEn: "Contract elements" },
    { code: "obligations_contracts", articleNumber: "443", descAr: "الشكل الكتابي للعقود", descFr: "Forme écrite des contrats", descEn: "Written form of contracts" },
  ],
  "auto-entrepreneur": [
    { code: "labor_code", articleNumber: "1", descAr: "نطاق تطبيق مدونة الشغل", descFr: "Champ d'application du Code du Travail", descEn: "Scope of the Labour Code" },
    { code: "labor_code", articleNumber: "9", descAr: "الحرية النقابية", descFr: "Liberté syndicale", descEn: "Trade union freedom" },
  ],
};

export const RELATED_CALCULATORS: Record<string, { slug: string; titleKey: string; icon: string }[]> = {
  loyer: [
    { slug: "notaire", titleKey: "simNotaryTitle", icon: "🏡" },
    { slug: "licenciement", titleKey: "simSeveranceTitle", icon: "📋" },
  ],
  salaire: [
    { slug: "licenciement", titleKey: "simSeveranceTitle", icon: "📋" },
    { slug: "auto-entrepreneur", titleKey: "simAutoEntTitle", icon: "🧑‍💼" },
  ],
  licenciement: [
    { slug: "salaire", titleKey: "simSalaryTitle", icon: "💰" },
    { slug: "notaire", titleKey: "simNotaryTitle", icon: "🏡" },
  ],
  notaire: [
    { slug: "loyer", titleKey: "simRentTitle", icon: "🏠" },
    { slug: "licenciement", titleKey: "simSeveranceTitle", icon: "📋" },
  ],
  "auto-entrepreneur": [
    { slug: "salaire", titleKey: "simSalaryTitle", icon: "💰" },
    { slug: "notaire", titleKey: "simNotaryTitle", icon: "🏡" },
  ],
};
