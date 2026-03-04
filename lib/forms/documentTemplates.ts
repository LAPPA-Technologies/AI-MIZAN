/**
 * Document body text templates with {{placeholder}} substitution.
 * Each document type has a template in ar/fr/en.
 */
import type { Locale } from "./types";
import { moroccanCities, courtTypes } from "./geodata";

/* ─── Helpers ─────────────────────────────────────────────────── */

function cityLabel(value: string, locale: Locale): string {
  return moroccanCities.find((c) => c.value === value)?.label[locale] ?? value;
}
function courtLabel(value: string, locale: Locale): string {
  return courtTypes.find((c) => c.value === value)?.label[locale] ?? value;
}
function formatDate(dateStr: string, locale: Locale): string {
  if (!dateStr) return "___________";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(locale === "ar" ? "ar-MA" : locale === "fr" ? "fr-FR" : "en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
  } catch { return dateStr; }
}
function arr(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter(Boolean) as string[];
  return [];
}
function val(v: unknown): string {
  if (v === undefined || v === null || v === "") return "___________";
  return String(v);
}
function num(v: unknown): string {
  if (v === undefined || v === null || v === "") return "___________";
  return Number(v).toLocaleString();
}

/* ─── Generate reference number ───────────────────────────────── */
export function generateRefNumber(): string {
  const y = new Date().getFullYear();
  const n = Math.floor(10000 + Math.random() * 90000);
  return `MIZAN-${y}-${n}`;
}

/* ─── Main renderer ───────────────────────────────────────────── */

export function renderDocumentText(
  docId: string,
  locale: Locale,
  data: Record<string, unknown>,
  refNumber: string,
): string {
  const today = formatDate(new Date().toISOString(), locale);
  const city = typeof data.city === "string" ? cityLabel(data.city, locale) : val(data.city);
  const court = typeof data.court === "string" ? courtLabel(data.court, locale) : "";

  switch (docId) {
    // ═════════════════════════════════════════════════════════════
    // 1. CUSTODY REQUEST
    // ═════════════════════════════════════════════════════════════
    case "custody-request": {
      if (locale === "ar") return `المملكة المغربية
وزارة العدل
${court ? court + " ب" + city : "المحكمة الابتدائية ب" + city}
قسم قضاء الأسرة

المرجع: ${refNumber}
التاريخ: ${today}

طلب حضانة الأطفال

المدعي(ة): ${val(data.fullName)}
رقم البطاقة الوطنية: ${val(data.idNumber)}
العنوان: ${val(data.address)}
الهاتف: ${val(data.phone)}

المدعى عليه(ها): ${val(data.otherParentName)}
العنوان: ${val(data.otherParentAddress)}

الموضوع: طلب الحصول على حق حضانة الأطفال

السيد(ة) رئيس(ة) المحكمة المحترم(ة)،

يتشرف(تتشرف) المدعي(ة) الموقع(ة) أدناه ${val(data.fullName)}، الحامل(ة) للبطاقة الوطنية رقم ${val(data.idNumber)}، بأن يتقدم(تتقدم) إلى محكمتكم الموقرة بطلب الحصول على حق حضانة الأطفال التالية أسماؤهم:

${arr(data.childrenNames).map((name, i) => `${i + 1}. ${name} — العمر: ${arr(data.childrenAges)[i] || "___"} سنة`).join("\n")}

وذلك بناءً على عقد الزواج رقم ${val(data.marriageCertNumber)} وحكم الطلاق رقم ${val(data.divorceJudgmentNumber)} الصادر بتاريخ ${formatDate(String(data.divorceDate), locale)}.

أسباب الطلب:
${val(data.requestReason)}

لهذه الأسباب، يلتمس(تلتمس) المدعي(ة) من محكمتكم الموقرة الحكم بمنحه(ها) حق حضانة الأطفال المذكورين أعلاه.

وتفضلوا بقبول فائق التقدير والاحترام.

${city}، في ${today}

التوقيع: ____________________

---
${refNumber}
هذه الوثيقة نموذجية فقط، يرجى استشارة محامٍ مرخص — Al-Mizan`;

      if (locale === "fr") return `ROYAUME DU MAROC
MINISTÈRE DE LA JUSTICE
${court ? court.toUpperCase() + " DE " + city.toUpperCase() : "TRIBUNAL DE PREMIÈRE INSTANCE DE " + city.toUpperCase()}
SECTION DE LA FAMILLE

Réf: ${refNumber}
Date: ${today}

DEMANDE DE GARDE D'ENFANTS

Demandeur(eresse): ${val(data.fullName)}
CIN: ${val(data.idNumber)}
Adresse: ${val(data.address)}
Téléphone: ${val(data.phone)}

Défendeur(eresse): ${val(data.otherParentName)}
Adresse: ${val(data.otherParentAddress)}

Objet: Demande de garde des enfants

Monsieur/Madame le/la Président(e) du Tribunal,

Je soussigné(e) ${val(data.fullName)}, titulaire de la CIN n° ${val(data.idNumber)}, ai l'honneur de soumettre à votre honorable tribunal une demande de garde des enfants suivants:

${arr(data.childrenNames).map((name, i) => `${i + 1}. ${name} — Âge: ${arr(data.childrenAges)[i] || "___"} ans`).join("\n")}

Conformément à l'acte de mariage n° ${val(data.marriageCertNumber)} et au jugement de divorce n° ${val(data.divorceJudgmentNumber)} en date du ${formatDate(String(data.divorceDate), locale)}.

Motifs de la demande:
${val(data.requestReason)}

Pour ces raisons, je demande respectueusement à votre tribunal de bien vouloir m'accorder la garde des enfants susmentionnés.

Fait à ${city}, le ${today}

Signature: ____________________

---
${refNumber}
Ce document est un modèle uniquement. Consultez un avocat agréé — Al-Mizan`;

      return `KINGDOM OF MOROCCO
MINISTRY OF JUSTICE
${court ? court.toUpperCase() + " OF " + city.toUpperCase() : "COURT OF FIRST INSTANCE OF " + city.toUpperCase()}
FAMILY SECTION

Ref: ${refNumber}
Date: ${today}

CHILD CUSTODY REQUEST

Petitioner: ${val(data.fullName)}
ID: ${val(data.idNumber)}
Address: ${val(data.address)}
Phone: ${val(data.phone)}

Respondent: ${val(data.otherParentName)}
Address: ${val(data.otherParentAddress)}

Subject: Request for Child Custody

Honorable President of the Court,

I, the undersigned ${val(data.fullName)}, holder of national ID n° ${val(data.idNumber)}, respectfully submit to your honorable court a request for custody of the following children:

${arr(data.childrenNames).map((name, i) => `${i + 1}. ${name} — Age: ${arr(data.childrenAges)[i] || "___"} years`).join("\n")}

Pursuant to marriage certificate n° ${val(data.marriageCertNumber)} and divorce judgment n° ${val(data.divorceJudgmentNumber)} dated ${formatDate(String(data.divorceDate), locale)}.

Grounds for the request:
${val(data.requestReason)}

For the above reasons, I respectfully request that your court grant me custody of the aforementioned children.

Done at ${city}, on ${today}

Signature: ____________________

---
${refNumber}
This document is a template only. Consult a licensed lawyer — Al-Mizan`;
    }

    // ═════════════════════════════════════════════════════════════
    // 2. LEASE CONTRACT
    // ═════════════════════════════════════════════════════════════
    case "lease-contract": {
      const propType = typeof data.propertyType === "string" ?
        (locale === "ar" ? ({apartment:"شقة",house:"منزل",commercial:"محل تجاري",land:"أرض"} as Record<string,string>)[data.propertyType] || data.propertyType :
         locale === "fr" ? ({apartment:"Appartement",house:"Maison",commercial:"Local commercial",land:"Terrain"} as Record<string,string>)[data.propertyType] || data.propertyType :
         ({apartment:"Apartment",house:"House",commercial:"Commercial space",land:"Land"} as Record<string,string>)[data.propertyType] || data.propertyType) : "___________";

      if (locale === "ar") return `المملكة المغربية

عقد إيجار سكني / تجاري

المرجع: ${refNumber}
التاريخ: ${today}

الطرف الأول (المؤجر):
الاسم: ${val(data.landlordName)}
رقم البطاقة الوطنية: ${val(data.landlordId)}
العنوان: ${val(data.landlordAddress)}

الطرف الثاني (المستأجر):
الاسم: ${val(data.tenantName)}
رقم البطاقة الوطنية: ${val(data.tenantId)}
العنوان: ${val(data.tenantAddress)}

تم الاتفاق بين الطرفين على ما يلي:

المادة 1 — موضوع العقد:
يؤجر الطرف الأول للطرف الثاني ${propType} الكائن(ة) في العنوان التالي:
${val(data.propertyAddress)}
المساحة: ${val(data.propertySize)} م²
${data.propertyDescription ? "الوصف: " + val(data.propertyDescription) : ""}

المادة 2 — مدة الإيجار:
يبدأ هذا العقد من تاريخ ${formatDate(String(data.startDate), locale)} لمدة ${val(data.duration)}.

المادة 3 — مبلغ الإيجار:
الإيجار الشهري: ${num(data.monthlyRent)} درهم
يؤدى في اليوم ${val(data.paymentDay)} من كل شهر.

المادة 4 — مبلغ الضمان:
مبلغ الضمان: ${num(data.depositAmount)} درهم
يسترد عند انتهاء العقد وإرجاع المفاتيح بعد خصم أي مستحقات.

المادة 5 — التزامات المستأجر:
- المحافظة على العين المؤجرة واستعمالها بشكل حسن
- أداء واجبات الإيجار في موعدها
- عدم إجراء أي تعديل دون موافقة المؤجر
- إرجاع العين المؤجرة في حالتها الأصلية عند انتهاء العقد

المادة 6 — التزامات المؤجر:
- تسليم العين المؤجرة في حالة صالحة للاستعمال
- القيام بالإصلاحات الكبرى
- ضمان الانتفاع الهادئ للمستأجر

حرر في ${city}، بتاريخ ${today}

توقيع المؤجر: ____________________     توقيع المستأجر: ____________________

---
${refNumber}
هذه الوثيقة نموذجية فقط، يرجى استشارة محامٍ مرخص — Al-Mizan`;

    if (locale === "fr") return `ROYAUME DU MAROC

CONTRAT DE LOCATION

Réf: ${refNumber}
Date: ${today}

PREMIÈRE PARTIE (BAILLEUR):
Nom: ${val(data.landlordName)}
CIN: ${val(data.landlordId)}
Adresse: ${val(data.landlordAddress)}

DEUXIÈME PARTIE (LOCATAIRE):
Nom: ${val(data.tenantName)}
CIN: ${val(data.tenantId)}
Adresse: ${val(data.tenantAddress)}

IL A ÉTÉ CONVENU CE QUI SUIT:

Article 1 — Objet du contrat:
Le bailleur loue au locataire un(e) ${propType} situé(e) à l'adresse suivante:
${val(data.propertyAddress)}
Surface: ${val(data.propertySize)} m²
${data.propertyDescription ? "Description: " + val(data.propertyDescription) : ""}

Article 2 — Durée du bail:
Le présent contrat prend effet à compter du ${formatDate(String(data.startDate), locale)} pour une durée de ${val(data.duration)}.

Article 3 — Montant du loyer:
Loyer mensuel: ${num(data.monthlyRent)} MAD
Payable le ${val(data.paymentDay)} de chaque mois.

Article 4 — Dépôt de garantie:
Montant du dépôt: ${num(data.depositAmount)} MAD
Restituable à la fin du bail après déduction de toute somme due.

Article 5 — Obligations du locataire:
- Maintenir le bien en bon état
- Payer le loyer à temps
- Ne pas effectuer de modifications sans accord du bailleur
- Restituer le bien dans son état d'origine à l'expiration du bail

Article 6 — Obligations du bailleur:
- Remettre le bien en état d'usage
- Effectuer les grosses réparations
- Assurer la jouissance paisible du locataire

Fait à ${city}, le ${today}

Signature du bailleur: ____________________     Signature du locataire: ____________________

---
${refNumber}
Ce document est un modèle uniquement. Consultez un avocat agréé — Al-Mizan`;

      return `KINGDOM OF MOROCCO

LEASE CONTRACT

Ref: ${refNumber}
Date: ${today}

FIRST PARTY (LANDLORD):
Name: ${val(data.landlordName)}
ID: ${val(data.landlordId)}
Address: ${val(data.landlordAddress)}

SECOND PARTY (TENANT):
Name: ${val(data.tenantName)}
ID: ${val(data.tenantId)}
Address: ${val(data.tenantAddress)}

THE PARTIES HAVE AGREED AS FOLLOWS:

Article 1 — Subject of the Contract:
The landlord rents to the tenant a ${propType} located at:
${val(data.propertyAddress)}
Size: ${val(data.propertySize)} m²
${data.propertyDescription ? "Description: " + val(data.propertyDescription) : ""}

Article 2 — Duration:
This contract takes effect from ${formatDate(String(data.startDate), locale)} for a period of ${val(data.duration)}.

Article 3 — Rent:
Monthly rent: ${num(data.monthlyRent)} MAD
Payable on the ${val(data.paymentDay)}th of each month.

Article 4 — Security Deposit:
Deposit amount: ${num(data.depositAmount)} MAD
Refundable at the end of the lease after deduction of any amounts due.

Article 5 — Tenant's Obligations:
- Maintain the property in good condition
- Pay rent on time
- Not make modifications without the landlord's consent
- Return the property in its original state upon lease expiry

Article 6 — Landlord's Obligations:
- Deliver the property in usable condition
- Carry out major repairs
- Ensure the tenant's peaceful enjoyment

Done at ${city}, on ${today}

Landlord's Signature: ____________________     Tenant's Signature: ____________________

---
${refNumber}
This document is a template only. Consult a licensed lawyer — Al-Mizan`;
    }

    // ═════════════════════════════════════════════════════════════
    // 3. POWER OF ATTORNEY
    // ═════════════════════════════════════════════════════════════
    case "power-of-attorney": {
      const nCity = typeof data.notaryCity === "string" ? cityLabel(data.notaryCity, locale) : city;

      if (locale === "ar") return `المملكة المغربية

توكيل رسمي

المرجع: ${refNumber}
التاريخ: ${today}

أنا الموقع أدناه:
الاسم: ${val(data.mandatorName)}
رقم البطاقة الوطنية: ${val(data.mandatorId)}
المولود(ة) بتاريخ: ${formatDate(String(data.mandatorDOB), locale)}
العنوان: ${val(data.mandatorAddress)}

أوكل بموجب هذا التوكيل السيد(ة):
الاسم: ${val(data.mandatoryName)}
رقم البطاقة الوطنية: ${val(data.mandatoryId)}
العنوان: ${val(data.mandatoryAddress)}

الغرض من التوكيل:
${val(data.purposeOfProxy)}

الصلاحيات الممنوحة:
${arr(data.specificPowers).map((p, i) => `${i + 1}. ${p}`).join("\n") || "جميع الصلاحيات المتعلقة بالغرض المذكور أعلاه"}

مدة الصلاحية: ${val(data.validityPeriod)}

حرر في ${nCity}، بتاريخ ${today}

توقيع الموكل: ____________________

---
${refNumber}
هذه الوثيقة نموذجية فقط، يرجى استشارة محامٍ مرخص — Al-Mizan`;

      if (locale === "fr") return `ROYAUME DU MAROC

PROCURATION

Réf: ${refNumber}
Date: ${today}

Je soussigné(e):
Nom: ${val(data.mandatorName)}
CIN: ${val(data.mandatorId)}
Né(e) le: ${formatDate(String(data.mandatorDOB), locale)}
Adresse: ${val(data.mandatorAddress)}

Donne par la présente procuration à:
Nom: ${val(data.mandatoryName)}
CIN: ${val(data.mandatoryId)}
Adresse: ${val(data.mandatoryAddress)}

Objet de la procuration:
${val(data.purposeOfProxy)}

Pouvoirs accordés:
${arr(data.specificPowers).map((p, i) => `${i + 1}. ${p}`).join("\n") || "Tous les pouvoirs relatifs à l'objet susmentionné"}

Durée de validité: ${val(data.validityPeriod)}

Fait à ${nCity}, le ${today}

Signature du mandant: ____________________

---
${refNumber}
Ce document est un modèle uniquement. Consultez un avocat agréé — Al-Mizan`;

      return `KINGDOM OF MOROCCO

POWER OF ATTORNEY

Ref: ${refNumber}
Date: ${today}

I, the undersigned:
Name: ${val(data.mandatorName)}
ID: ${val(data.mandatorId)}
Born on: ${formatDate(String(data.mandatorDOB), locale)}
Address: ${val(data.mandatorAddress)}

Hereby authorize:
Name: ${val(data.mandatoryName)}
ID: ${val(data.mandatoryId)}
Address: ${val(data.mandatoryAddress)}

Purpose:
${val(data.purposeOfProxy)}

Powers granted:
${arr(data.specificPowers).map((p, i) => `${i + 1}. ${p}`).join("\n") || "All powers related to the above-mentioned purpose"}

Validity period: ${val(data.validityPeriod)}

Done at ${nCity}, on ${today}

Mandator's Signature: ____________________

---
${refNumber}
This document is a template only. Consult a licensed lawyer — Al-Mizan`;
    }

    // ═════════════════════════════════════════════════════════════
    // 4. DIVORCE PETITION
    // ═════════════════════════════════════════════════════════════
    case "divorce-petition": {
      const mCity = typeof data.marriageCity === "string" ? cityLabel(data.marriageCity, locale) : "___________";
      const grounds: Record<string, Record<Locale, string>> = {
        mutual:     { ar: "بالتراضي", fr: "par consentement mutuel", en: "by mutual consent" },
        discord:    { ar: "للشقاق", fr: "pour discorde", en: "for discord" },
        harm:       { ar: "للضرر", fr: "pour préjudice", en: "for harm" },
        absence:    { ar: "للغياب", fr: "pour absence", en: "for absence" },
        defect:     { ar: "للعيب", fr: "pour vice rédhibitoire", en: "for defect" },
        nonSupport: { ar: "لعدم الإنفاق", fr: "pour défaut d'entretien", en: "for non-support" },
      };
      const g = typeof data.divorceGrounds === "string" ? (grounds[data.divorceGrounds]?.[locale] ?? val(data.divorceGrounds)) : "___________";

      if (locale === "ar") return `المملكة المغربية
وزارة العدل
${court ? court + " ب" + city : "المحكمة الابتدائية ب" + city}
قسم قضاء الأسرة

المرجع: ${refNumber}
التاريخ: ${today}

طلب تطليق ${g}

المدعي(ة): ${val(data.petitionerName)}
رقم البطاقة الوطنية: ${val(data.petitionerId)}
العنوان: ${val(data.petitionerAddress)}

المدعى عليه(ها): ${val(data.respondentName)}
رقم البطاقة الوطنية: ${val(data.respondentId)}
العنوان: ${val(data.respondentAddress)}

بيانات الزواج:
- تاريخ الزواج: ${formatDate(String(data.marriageDate), locale)}
- مدينة الزواج: ${mCity}
- رقم عقد الزواج: ${val(data.marriageCertNumber)}
- عدد الأطفال: ${val(data.childrenCount)}
${arr(data.childrenDetails).length > 0 ? "- الأطفال:\n" + arr(data.childrenDetails).map((c, i) => `  ${i + 1}. ${c}`).join("\n") : ""}

السيد(ة) رئيس(ة) المحكمة المحترم(ة)،

يتشرف(تتشرف) المدعي(ة) بأن يتقدم(تتقدم) بطلب التطليق ${g} وفقاً لمقتضيات المواد 78 إلى 93 من مدونة الأسرة.

${data.requestedCustody ? "الحضانة المطلوبة: " + val(data.requestedCustody) : ""}
${data.requestedAlimony ? "النفقة المطلوبة: " + num(data.requestedAlimony) + " درهم شهرياً" : ""}

وتفضلوا بقبول فائق التقدير والاحترام.

${city}، في ${today}

التوقيع: ____________________

---
${refNumber}
هذه الوثيقة نموذجية فقط — Al-Mizan`;

      if (locale === "fr") return `ROYAUME DU MAROC
MINISTÈRE DE LA JUSTICE
${court ? court.toUpperCase() + " DE " + city.toUpperCase() : "TRIBUNAL DE PREMIÈRE INSTANCE DE " + city.toUpperCase()}
SECTION DE LA FAMILLE

Réf: ${refNumber}
Date: ${today}

REQUÊTE DE DIVORCE ${g.toUpperCase()}

Demandeur(eresse): ${val(data.petitionerName)}
CIN: ${val(data.petitionerId)}
Adresse: ${val(data.petitionerAddress)}

Défendeur(eresse): ${val(data.respondentName)}
CIN: ${val(data.respondentId)}
Adresse: ${val(data.respondentAddress)}

Informations du mariage:
- Date du mariage: ${formatDate(String(data.marriageDate), locale)}
- Ville du mariage: ${mCity}
- N° acte de mariage: ${val(data.marriageCertNumber)}
- Nombre d'enfants: ${val(data.childrenCount)}
${arr(data.childrenDetails).length > 0 ? "- Enfants:\n" + arr(data.childrenDetails).map((c, i) => `  ${i + 1}. ${c}`).join("\n") : ""}

Monsieur/Madame le/la Président(e),

Le/la demandeur(eresse) a l'honneur de présenter une requête de divorce ${g} conformément aux articles 78 à 93 du Code de la Famille.

${data.requestedCustody ? "Garde demandée: " + val(data.requestedCustody) : ""}
${data.requestedAlimony ? "Pension demandée: " + num(data.requestedAlimony) + " MAD/mois" : ""}

Fait à ${city}, le ${today}

Signature: ____________________

---
${refNumber}
Ce document est un modèle uniquement — Al-Mizan`;

      return `KINGDOM OF MOROCCO
MINISTRY OF JUSTICE
${court ? court.toUpperCase() + " OF " + city.toUpperCase() : "COURT OF FIRST INSTANCE OF " + city.toUpperCase()}
FAMILY SECTION

Ref: ${refNumber}
Date: ${today}

DIVORCE PETITION (${g.toUpperCase()})

Petitioner: ${val(data.petitionerName)}
ID: ${val(data.petitionerId)}
Address: ${val(data.petitionerAddress)}

Respondent: ${val(data.respondentName)}
ID: ${val(data.respondentId)}
Address: ${val(data.respondentAddress)}

Marriage information:
- Marriage date: ${formatDate(String(data.marriageDate), locale)}
- Marriage city: ${mCity}
- Marriage cert. number: ${val(data.marriageCertNumber)}
- Number of children: ${val(data.childrenCount)}
${arr(data.childrenDetails).length > 0 ? "- Children:\n" + arr(data.childrenDetails).map((c, i) => `  ${i + 1}. ${c}`).join("\n") : ""}

Honorable President of the Court,

The petitioner respectfully submits a divorce petition ${g} pursuant to Articles 78 to 93 of the Family Code.

${data.requestedCustody ? "Requested custody: " + val(data.requestedCustody) : ""}
${data.requestedAlimony ? "Requested alimony: " + num(data.requestedAlimony) + " MAD/month" : ""}

Done at ${city}, on ${today}

Signature: ____________________

---
${refNumber}
This document is a template only — Al-Mizan`;
    }

    // ═════════════════════════════════════════════════════════════
    // FALLBACK — generic template for all other docs
    // ═════════════════════════════════════════════════════════════
    default: {
      // Build a generic formal document from all data fields
      const header = locale === "ar"
        ? `المملكة المغربية\n\nالمرجع: ${refNumber}\nالتاريخ: ${today}\n${city ? "المدينة: " + city : ""}`
        : locale === "fr"
        ? `ROYAUME DU MAROC\n\nRéf: ${refNumber}\nDate: ${today}\n${city ? "Ville: " + city : ""}`
        : `KINGDOM OF MOROCCO\n\nRef: ${refNumber}\nDate: ${today}\n${city ? "City: " + city : ""}`;

      const entries = Object.entries(data)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => {
          if (Array.isArray(v)) return `${k}: ${v.filter(Boolean).join(", ")}`;
          return `${k}: ${v}`;
        })
        .join("\n");

      const footer = locale === "ar"
        ? `\n\nالتوقيع: ____________________\n\n---\n${refNumber}\nهذه الوثيقة نموذجية فقط — Al-Mizan`
        : locale === "fr"
        ? `\n\nSignature: ____________________\n\n---\n${refNumber}\nCe document est un modèle uniquement — Al-Mizan`
        : `\n\nSignature: ____________________\n\n---\n${refNumber}\nThis document is a template only — Al-Mizan`;

      return `${header}\n\n${entries}${footer}`;
    }
  }
}
