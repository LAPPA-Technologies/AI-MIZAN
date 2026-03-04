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
  family: {
    code: 'family',
    name: {
      fr: 'Code de la Famille Marocain',
      ar: 'قانون الأسرة المغربي',
      en: 'Moroccan Family Code'
    },
    shortName: {
      fr: 'Moudawana',
      ar: 'المدونة',
      en: 'Moudawana'
    },
    description: {
      fr: 'Loi n° 70-03 relative au Code de la famille',
      ar: 'القانون رقم 70-03 المتعلق بمدونة الأسرة',
      en: 'Law No. 70-03 relating to the Family Code'
    },
    effectiveDate: '2004-02-05',
    version: '2004',
    source: 'Bulletin Officiel'
  },
  penal: {
    code: 'penal',
    name: {
      fr: 'Code Pénal Marocain',
      ar: 'القانون الجنائي المغربي',
      en: 'Moroccan Penal Code'
    },
    shortName: {
      fr: 'Code Pénal',
      ar: 'القانون الجنائي',
      en: 'Penal Code'
    },
    description: {
      fr: 'Dahir n° 1-59-413 du 26 novembre 1962 portant approbation du texte du Code Pénal',
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
    source: 'Bulletin Officiel'
  },
  obligations: {
    code: 'obligations',
    name: {
      fr: 'Dahir des Obligations et Contrats',
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
    source: 'Bulletin Officiel'
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