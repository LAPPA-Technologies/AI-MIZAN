/**
 * Moroccan cities and court types — trilingual.
 */
import type { MoroccanCity, CourtType } from "./types";

export const moroccanCities: MoroccanCity[] = [
  { value: "casablanca",  label: { ar: "الدار البيضاء", fr: "Casablanca",   en: "Casablanca"  }, hasCommercialCourt: true,  hasAdminCourt: true,  hasAppealCourt: true  },
  { value: "rabat",       label: { ar: "الرباط",        fr: "Rabat",         en: "Rabat"       }, hasCommercialCourt: true,  hasAdminCourt: true,  hasAppealCourt: true  },
  { value: "fes",         label: { ar: "فاس",           fr: "Fès",           en: "Fez"         }, hasCommercialCourt: true,  hasAdminCourt: true,  hasAppealCourt: true  },
  { value: "marrakech",   label: { ar: "مراكش",         fr: "Marrakech",     en: "Marrakech"   }, hasCommercialCourt: true,  hasAdminCourt: true,  hasAppealCourt: true  },
  { value: "tanger",      label: { ar: "طنجة",          fr: "Tanger",        en: "Tangier"     }, hasCommercialCourt: true,  hasAdminCourt: false, hasAppealCourt: true  },
  { value: "agadir",      label: { ar: "أكادير",        fr: "Agadir",        en: "Agadir"      }, hasCommercialCourt: true,  hasAdminCourt: true,  hasAppealCourt: true  },
  { value: "meknes",      label: { ar: "مكناس",         fr: "Meknès",        en: "Meknes"      }, hasCommercialCourt: true,  hasAdminCourt: true,  hasAppealCourt: false },
  { value: "oujda",       label: { ar: "وجدة",          fr: "Oujda",         en: "Oujda"       }, hasCommercialCourt: true,  hasAdminCourt: true,  hasAppealCourt: true  },
  { value: "kenitra",     label: { ar: "القنيطرة",      fr: "Kénitra",       en: "Kenitra"     }, hasCommercialCourt: false, hasAdminCourt: false, hasAppealCourt: false },
  { value: "tetouan",     label: { ar: "تطوان",         fr: "Tétouan",       en: "Tetouan"     }, hasCommercialCourt: false, hasAdminCourt: false, hasAppealCourt: false },
  { value: "sale",        label: { ar: "سلا",           fr: "Salé",          en: "Sale"        }, hasCommercialCourt: false, hasAdminCourt: false, hasAppealCourt: false },
  { value: "eljadida",    label: { ar: "الجديدة",       fr: "El Jadida",     en: "El Jadida"   }, hasCommercialCourt: false, hasAdminCourt: false, hasAppealCourt: false },
  { value: "beniMellal",  label: { ar: "بني ملال",      fr: "Béni Mellal",   en: "Beni Mellal" }, hasCommercialCourt: false, hasAdminCourt: false, hasAppealCourt: false },
  { value: "khouribga",   label: { ar: "خريبكة",        fr: "Khouribga",     en: "Khouribga"   }, hasCommercialCourt: false, hasAdminCourt: false, hasAppealCourt: false },
  { value: "nador",       label: { ar: "الناظور",       fr: "Nador",         en: "Nador"       }, hasCommercialCourt: false, hasAdminCourt: false, hasAppealCourt: false },
  { value: "larache",     label: { ar: "العرائش",       fr: "Larache",       en: "Larache"     }, hasCommercialCourt: false, hasAdminCourt: false, hasAppealCourt: false },
  { value: "settat",      label: { ar: "سطات",          fr: "Settat",        en: "Settat"      }, hasCommercialCourt: false, hasAdminCourt: false, hasAppealCourt: false },
  { value: "errachidia",  label: { ar: "الراشيدية",     fr: "Errachidia",    en: "Errachidia"  }, hasCommercialCourt: false, hasAdminCourt: false, hasAppealCourt: false },
  { value: "zagora",      label: { ar: "زاكورة",        fr: "Zagora",        en: "Zagora"      }, hasCommercialCourt: false, hasAdminCourt: false, hasAppealCourt: false },
  { value: "ouarzazate",  label: { ar: "ورزازات",       fr: "Ouarzazate",    en: "Ouarzazate"  }, hasCommercialCourt: false, hasAdminCourt: false, hasAppealCourt: false },
  { value: "taza",        label: { ar: "تازة",          fr: "Taza",          en: "Taza"        }, hasCommercialCourt: false, hasAdminCourt: false, hasAppealCourt: false },
  { value: "mohammedia",  label: { ar: "المحمدية",      fr: "Mohammedia",    en: "Mohammedia"  }, hasCommercialCourt: false, hasAdminCourt: false, hasAppealCourt: false },
  { value: "khemisset",   label: { ar: "الخميسات",      fr: "Khemisset",     en: "Khemisset"   }, hasCommercialCourt: false, hasAdminCourt: false, hasAppealCourt: false },
  { value: "safi",        label: { ar: "آسفي",          fr: "Safi",          en: "Safi"        }, hasCommercialCourt: false, hasAdminCourt: false, hasAppealCourt: false },
];

export const courtTypes: CourtType[] = [
  { value: "firstInstance",  label: { ar: "المحكمة الابتدائية",   fr: "Tribunal de Première Instance", en: "Court of First Instance" } },
  { value: "appeal",         label: { ar: "محكمة الاستئناف",      fr: "Cour d'Appel",                  en: "Court of Appeal"         } },
  { value: "commercial",     label: { ar: "المحكمة التجارية",     fr: "Tribunal de Commerce",          en: "Commercial Court"        } },
  { value: "administrative", label: { ar: "المحكمة الإدارية",     fr: "Tribunal Administratif",        en: "Administrative Court"    } },
  { value: "family",         label: { ar: "قسم قضاء الأسرة",     fr: "Section de la Famille",         en: "Family Section"          } },
];

/** Get courts available for a given city */
export function getCourtsForCity(cityValue: string): CourtType[] {
  const city = moroccanCities.find((c) => c.value === cityValue);
  if (!city) return [courtTypes[0]]; // fallback to first instance
  const available: CourtType[] = [courtTypes[0], courtTypes[4]]; // first instance + family always
  if (city.hasAppealCourt) available.push(courtTypes[1]);
  if (city.hasCommercialCourt) available.push(courtTypes[2]);
  if (city.hasAdminCourt) available.push(courtTypes[3]);
  return available;
}
