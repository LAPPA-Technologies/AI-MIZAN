export type ArticleRef = {
  code: string;
  articleNumber: string;
  descAr: string;
  descFr: string;
  descEn: string;
};

export const CALCULATOR_ARTICLES: Record<string, ArticleRef[]> = {
  loyer: [
    { code: "obligations_contracts", articleNumber: "627", descAr: "عقد الكراء", descFr: "Contrat de bail", descEn: "Lease contract" },
    { code: "obligations_contracts", articleNumber: "636", descAr: "الضمان الكرائي", descFr: "Garantie locative", descEn: "Rental guarantee" },
    { code: "obligations_contracts", articleNumber: "690", descAr: "إنهاء عقد الكراء", descFr: "Résiliation du bail", descEn: "Lease termination" },
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
