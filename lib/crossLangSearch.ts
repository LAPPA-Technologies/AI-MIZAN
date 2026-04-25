/**
 * Cross-language keyword expansion for search.
 *
 * Maps common English legal terms to their Arabic and French equivalents
 * so that an English-language query can match AR/FR article text.
 */

type Translation = { ar: string[]; fr: string[] };

const LEGAL_TERM_MAP: Record<string, Translation> = {
  // Family / Personal Status
  divorce:      { ar: ["طلاق", "تطليق", "مطلقة"],          fr: ["divorce", "répudiation"] },
  marriage:     { ar: ["زواج", "عقد الزواج", "نكاح"],       fr: ["mariage", "contrat de mariage"] },
  custody:      { ar: ["حضانة"],                             fr: ["garde", "garde des enfants"] },
  alimony:      { ar: ["نفقة"],                              fr: ["pension alimentaire", "nafaqa"] },
  dowry:        { ar: ["صداق", "الصداق"],                    fr: ["dot", "sadaq", "douaire"] },
  child:        { ar: ["طفل", "أطفال", "ولد"],              fr: ["enfant", "mineur"] },
  wife:         { ar: ["زوجة"],                              fr: ["épouse", "femme"] },
  husband:      { ar: ["زوج"],                               fr: ["époux", "mari"] },
  inheritance:  { ar: ["إرث", "ميراث", "تركة", "ورثة"],     fr: ["héritage", "succession"] },
  guardian:     { ar: ["ولي", "ولاية", "وصي"],              fr: ["tuteur", "tutelle"] },
  reconciliation: { ar: ["صلح", "الصلح"],                   fr: ["conciliation", "réconciliation"] },

  // Penal / Criminal
  crime:        { ar: ["جريمة", "جناية"],                   fr: ["crime", "infraction"] },
  penalty:      { ar: ["عقوبة"],                             fr: ["peine", "sanction"] },
  prison:       { ar: ["سجن", "حبس"],                       fr: ["prison", "emprisonnement", "détention"] },
  murder:       { ar: ["قتل"],                               fr: ["meurtre", "homicide"] },
  theft:        { ar: ["سرقة"],                              fr: ["vol"] },
  fraud:        { ar: ["نصب", "احتيال", "تزوير"],           fr: ["fraude", "escroquerie", "abus de confiance"] },
  assault:      { ar: ["ضرب", "إيذاء", "عنف"],              fr: ["agression", "violence", "coups et blessures"] },
  judge:        { ar: ["قاضي", "قاض"],                      fr: ["juge", "magistrat"] },
  court:        { ar: ["محكمة"],                             fr: ["tribunal", "cour"] },
  prosecution:  { ar: ["نيابة عامة", "متابعة"],             fr: ["poursuite", "ministère public"] },
  defendant:    { ar: ["متهم"],                              fr: ["accusé", "prévenu", "défendeur"] },
  witness:      { ar: ["شاهد", "شهادة"],                    fr: ["témoin", "témoignage"] },
  bail:         { ar: ["كفالة", "سراح مؤقت"],               fr: ["caution", "liberté provisoire"] },
  appeal:       { ar: ["استئناف", "طعن"],                   fr: ["appel", "recours"] },
  arrest:       { ar: ["اعتقال", "توقيف"],                  fr: ["arrestation", "détention"] },

  // Obligations / Contracts
  contract:     { ar: ["عقد", "اتفاق"],                     fr: ["contrat", "convention"] },
  obligation:   { ar: ["التزام"],                            fr: ["obligation"] },
  liability:    { ar: ["مسؤولية"],                           fr: ["responsabilité"] },
  damages:      { ar: ["تعويض", "ضرر"],                     fr: ["dommages", "indemnisation", "préjudice"] },
  compensation: { ar: ["تعويض"],                             fr: ["indemnité", "compensation"] },
  lease:        { ar: ["إيجار", "كراء"],                    fr: ["bail", "location", "loyer"] },
  sale:         { ar: ["بيع"],                               fr: ["vente"] },
  guarantee:    { ar: ["ضمان", "كفالة"],                    fr: ["garantie", "caution"] },
  debt:         { ar: ["دين"],                               fr: ["dette", "créance"] },
  payment:      { ar: ["أداء", "وفاء"],                     fr: ["paiement", "règlement"] },

  // Commerce
  company:      { ar: ["شركة"],                              fr: ["société", "entreprise"] },
  commercial:   { ar: ["تجاري"],                             fr: ["commercial"] },
  bankruptcy:   { ar: ["إفلاس"],                             fr: ["faillite", "liquidation"] },
  merchant:     { ar: ["تاجر"],                              fr: ["commerçant", "marchand"] },

  // Civil Procedure
  lawsuit:      { ar: ["دعوى"],                              fr: ["action en justice", "procès"] },
  procedure:    { ar: ["مسطرة", "إجراء"],                   fr: ["procédure"] },
  execution:    { ar: ["تنفيذ"],                             fr: ["exécution"] },
  notification: { ar: ["تبليغ"],                             fr: ["notification", "signification"] },
  evidence:     { ar: ["إثبات", "دليل", "حجة"],            fr: ["preuve", "pièce"] },
  hearing:      { ar: ["جلسة"],                              fr: ["audience"] },
  judgment:     { ar: ["حكم"],                               fr: ["jugement", "décision"] },
  prescription: { ar: ["تقادم"],                             fr: ["prescription"] },

  // Labor
  employment:   { ar: ["شغل", "عمل", "تشغيل"],              fr: ["travail", "emploi"] },
  worker:       { ar: ["أجير", "عامل"],                     fr: ["salarié", "travailleur", "employé"] },
  employer:     { ar: ["مشغل"],                              fr: ["employeur"] },
  salary:       { ar: ["أجر", "أجرة"],                      fr: ["salaire", "rémunération"] },
  dismissal:    { ar: ["فصل", "طرد"],                       fr: ["licenciement", "congédiement"] },
  strike:       { ar: ["إضراب"],                             fr: ["grève"] },

  // General legal terms
  law:          { ar: ["قانون"],                             fr: ["loi", "droit"] },
  article:      { ar: ["مادة", "فصل"],                      fr: ["article"] },
  right:        { ar: ["حق"],                                fr: ["droit"] },
  property:     { ar: ["ملكية", "عقار"],                    fr: ["propriété", "bien", "immeuble"] },
  nationality:  { ar: ["جنسية"],                             fr: ["nationalité"] },
  residence:    { ar: ["إقامة", "سكن"],                     fr: ["résidence", "domicile"] },
  age:          { ar: ["سن", "عمر"],                         fr: ["âge", "majorité"] },
  minor:        { ar: ["قاصر"],                              fr: ["mineur"] },
  consent:      { ar: ["موافقة", "رضا"],                    fr: ["consentement"] },
  permit:       { ar: ["رخصة", "إذن"],                      fr: ["permis", "autorisation"] },
  urbanism:     { ar: ["تعمير"],                             fr: ["urbanisme"] },
};

/**
 * Expand an English query into terms for the target language.
 *
 * Tokenises the query, looks up each token in the legal term map,
 * and returns an array of target-language search terms.
 * If no matches are found, returns the original query.
 */
export function expandQueryForLanguage(
  query: string,
  targetLang: "ar" | "fr"
): string[] {
  const tokens = query
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 3);

  const expansions: string[] = [];

  for (const token of tokens) {
    const mapping = LEGAL_TERM_MAP[token];
    if (mapping) {
      expansions.push(...mapping[targetLang]);
    }
  }

  // If no mapping hits, return original query (unchanged)
  if (expansions.length === 0) {
    return [query];
  }

  return [...new Set(expansions)];
}

/**
 * Detect if a query is primarily in English (Latin script).
 */
export function isEnglishQuery(query: string): boolean {
  const cleaned = query.replace(/[\s\d.,!?;:()\-"']/g, "");
  if (!cleaned) return false;
  const latin = (cleaned.match(/[a-zA-Z]/g) || []).length;
  return latin / cleaned.length > 0.7;
}
