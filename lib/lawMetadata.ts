export interface LawMetadata {
  code: string;
  name: {
    fr: string;
    ar: string;
    en: string;
  };
  shortName: {
    fr: string;
    ar: string;
    en: string;
  };
  description?: {
    fr: string;
    ar: string;
    en: string;
  };
  effectiveDate: string;
  version: string;
  source: string;
}

export const lawMetadata: Record<string, LawMetadata> = {
  family_code: {
    code: 'family_code',
    name: {
      fr: 'Code de la Famille Marocain',
      ar: 'مدونة الأسرة المغربية',
      en: 'Moroccan Family Code'
    },
    shortName: {
      fr: 'Moudawana',
      ar: 'مدونة الأسرة',
      en: 'Moudawana'
    },
    description: {
      fr: 'Loi n° 70-03 relative au Code de la famille',
      ar: 'القانون رقم 70-03 المتعلق بمدونة الأسرة',
      en: 'Law No. 70-03 relating to the Family Code'
    },
    effectiveDate: '2004-02-05',
    version: '2004',
    source: 'Bulletin Officiel n° 5184 du 5 février 2004'
  },
  penal_code: {
    code: 'penal_code',
    name: {
      fr: 'Code Pénal Marocain',
      ar: 'مجموعة القانون الجنائي',
      en: 'Moroccan Penal Code'
    },
    shortName: {
      fr: 'Code Pénal',
      ar: 'القانون الجنائي',
      en: 'Penal Code'
    },
    description: {
      fr: 'Dahir n° 1-59-413 du 26 novembre 1962 portant approbation du Code Pénal',
      ar: 'ظهير رقم 1-59-413 بتاريخ 26 نونبر 1962 بالمصادقة على مجموعة القانون الجنائي',
      en: 'Dahir No. 1-59-413 of November 26, 1962 approving the Penal Code'
    },
    effectiveDate: '2019-01-01',
    version: '2019',
    source: 'Bulletin Officiel'
  },
  civil_procedure: {
    code: 'civil_procedure',
    name: {
      fr: 'Code de Procédure Civile',
      ar: 'قانون المسطرة المدنية',
      en: 'Code of Civil Procedure'
    },
    shortName: {
      fr: 'Procédure Civile',
      ar: 'المسطرة المدنية',
      en: 'Civil Procedure'
    },
    description: {
      fr: 'Dahir portant loi n° 1-74-447 approuvant le code de procédure civile',
      ar: 'ظهير بمثابة قانون رقم 1-74-447 بالمصادقة على قانون المسطرة المدنية',
      en: 'Dahir approving the Code of Civil Procedure'
    },
    effectiveDate: '1974-09-28',
    version: '1974',
    source: 'Bulletin Officiel n° 3230 du 30 septembre 1974'
  },
  obligations_contracts: {
    code: 'obligations_contracts',
    name: {
      fr: 'Code des Obligations et Contrats',
      ar: 'قانون الالتزامات والعقود',
      en: 'Code of Obligations and Contracts'
    },
    shortName: {
      fr: 'DOC',
      ar: 'ق.ل.ع',
      en: 'DOC'
    },
    description: {
      fr: 'Dahir du 12 août 1913 formant Code des obligations et contrats',
      ar: 'ظهير 12 غشت 1913 المتعلق بقانون الالتزامات والعقود',
      en: 'Dahir of August 12, 1913 forming the Code of Obligations and Contracts'
    },
    effectiveDate: '1913-08-12',
    version: '1913',
    source: 'Bulletin Officiel du 12 septembre 1913'
  },
  commerce_code: {
    code: 'commerce_code',
    name: {
      fr: 'Code de Commerce',
      ar: 'مدونة التجارة',
      en: 'Commercial Code'
    },
    shortName: {
      fr: 'Code de Commerce',
      ar: 'مدونة التجارة',
      en: 'Commercial Code'
    },
    description: {
      fr: 'Loi n° 15-95 formant Code de Commerce',
      ar: 'القانون رقم 15-95 المتعلق بمدونة التجارة',
      en: 'Law No. 15-95 forming the Commercial Code'
    },
    effectiveDate: '1997-08-01',
    version: '1996',
    source: 'Bulletin Officiel n° 4418 du 3 octobre 1996'
  },
  criminal_procedure: {
    code: 'criminal_procedure',
    name: {
      fr: 'Code de Procédure Pénale',
      ar: 'قانون المسطرة الجنائية',
      en: 'Code of Criminal Procedure'
    },
    shortName: {
      fr: 'Procédure Pénale',
      ar: 'المسطرة الجنائية',
      en: 'Criminal Procedure'
    },
    description: {
      fr: 'Dahir n° 1-02-255 du 3 octobre 2002 portant promulgation du Code de procédure pénale',
      ar: 'ظهير رقم 1-02-255 بتاريخ 3 أكتوبر 2002 بتنفيذ قانون المسطرة الجنائية',
      en: 'Dahir No. 1-02-255 of October 3, 2002 promulgating the Code of Criminal Procedure'
    },
    effectiveDate: '2003-10-01',
    version: '2002',
    source: 'Bulletin Officiel n° 5078 du 30 janvier 2003'
  },
  labor_code: {
    code: 'labor_code',
    name: {
      fr: 'Code du Travail',
      ar: 'مدونة الشغل',
      en: 'Labor Code'
    },
    shortName: {
      fr: 'Code du Travail',
      ar: 'مدونة الشغل',
      en: 'Labor Code'
    },
    description: {
      fr: 'Loi n° 65-99 relative au Code du travail',
      ar: 'القانون رقم 65-99 المتعلق بمدونة الشغل',
      en: 'Law No. 65-99 relating to the Labor Code'
    },
    effectiveDate: '2004-06-08',
    version: '2004',
    source: 'Bulletin Officiel n° 5210 du 8 juin 2004'
  },
  urbanism_code: {
    code: 'urbanism_code',
    name: {
      fr: "Code de l'Urbanisme",
      ar: 'قانون التعمير',
      en: 'Urban Planning Code'
    },
    shortName: {
      fr: 'Urbanisme',
      ar: 'التعمير',
      en: 'Urbanism'
    },
    description: {
      fr: "Loi n° 12-90 relative à l'urbanisme",
      ar: 'القانون رقم 12-90 المتعلق بالتعمير',
      en: 'Law No. 12-90 relating to Urban Planning'
    },
    effectiveDate: '1992-06-17',
    version: '1992',
    source: 'Bulletin Officiel n° 4159 du 15 juillet 1992'
  }
};

export function getLawMetadata(code: string): LawMetadata | null {
  return lawMetadata[code] || null;
}

export function getLawName(code: string, locale: string = 'fr'): string {
  const metadata = getLawMetadata(code);
  if (!metadata) return code.toUpperCase();

  const localeKey = locale as keyof LawMetadata['name'];
  return metadata.name[localeKey] || metadata.name.fr;
}

export function getLawShortName(code: string, locale: string = 'fr'): string {
  const metadata = getLawMetadata(code);
  if (!metadata) return code.toUpperCase();

  const localeKey = locale as keyof LawMetadata['shortName'];
  return metadata.shortName[localeKey] || metadata.shortName.fr;
}