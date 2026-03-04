/**
 * Moroccan Legal Document Templates
 * Standard templates for common legal procedures in fr/ar/en.
 */

export type DocumentCategory = "family" | "civil" | "commercial" | "criminal" | "administrative";

export type DocumentTemplate = {
  id: string;
  category: DocumentCategory;
  title: { fr: string; ar: string; en: string };
  description: { fr: string; ar: string; en: string };
  legalBasis: string;
  icon: string;
  templates: {
    fr: string;
    ar: string;
    en: string;
  };
};

export const categoryLabels: Record<DocumentCategory, { fr: string; ar: string; en: string }> = {
  family: { fr: "Droit de la Famille", ar: "قانون الأسرة", en: "Family Law" },
  civil: { fr: "Droit Civil", ar: "القانون المدني", en: "Civil Law" },
  commercial: { fr: "Droit Commercial", ar: "القانون التجاري", en: "Commercial Law" },
  criminal: { fr: "Droit Pénal", ar: "القانون الجنائي", en: "Criminal Law" },
  administrative: { fr: "Droit Administratif", ar: "القانون الإداري", en: "Administrative Law" },
};

export const categoryIcons: Record<DocumentCategory, string> = {
  family: "👨‍👩‍👧",
  civil: "📜",
  commercial: "💼",
  criminal: "⚖️",
  administrative: "🏛️",
};

export const documents: DocumentTemplate[] = [
  // ═══════════════════════════════
  // FAMILY LAW
  // ═══════════════════════════════
  {
    id: "divorce-petition",
    category: "family",
    title: {
      fr: "Requête de Divorce",
      ar: "طلب الطلاق",
      en: "Divorce Petition",
    },
    description: {
      fr: "Requête de divorce judiciaire conformément aux articles 78-93 du Code de la Famille.",
      ar: "طلب الطلاق القضائي وفقاً للمواد 78-93 من مدونة الأسرة.",
      en: "Judicial divorce petition pursuant to Articles 78-93 of the Family Code.",
    },
    legalBasis: "Moudawana Art. 78-93",
    icon: "👨‍👩‍👧",
    templates: {
      fr: `TRIBUNAL DE PREMIÈRE INSTANCE DE [VILLE]
SECTION DE LA FAMILLE

REQUÊTE DE DIVORCE PAR CONSENTEMENT MUTUEL

Demandeur(euse): [NOM COMPLET]
CIN: [NUMÉRO]
Adresse: [ADRESSE COMPLÈTE]

Défendeur(euse): [NOM COMPLET]
CIN: [NUMÉRO]
Adresse: [ADRESSE COMPLÈTE]

OBJET: Requête de divorce par consentement mutuel (Art. 114 du Code de la Famille)

Monsieur/Madame le/la Président(e),

Les soussignés, mariés en date du [DATE] à [LIEU], acte de mariage n° [NUMÉRO], 
ont l'honneur de soumettre à votre honorable tribunal la présente requête de divorce 
par consentement mutuel, conformément aux dispositions de l'article 114 de la 
Moudawana (Loi n° 70-03).

FAITS:
1. Les parties ont contracté mariage le [DATE] à [LIEU].
2. De cette union sont issus [NOMBRE] enfants: [NOMS ET DATES DE NAISSANCE].
3. Les parties sont convenues d'un commun accord de mettre fin à leur union conjugale.

ACCORD SUR LES EFFETS DU DIVORCE:
- Garde des enfants: [DÉTAILS]
- Pension alimentaire (Nafaqa): [MONTANT] MAD/mois
- Logement conjugal: [DÉTAILS]
- Partage des biens: [DÉTAILS]
- Droit de visite: [DÉTAILS]

FONDEMENT JURIDIQUE:
- Article 114 du Code de la Famille (Moudawana)
- Articles 78 à 93 du Code de la Famille

PAR CES MOTIFS,

Plaise au tribunal de:
1. Déclarer la requête recevable
2. Homologuer l'accord des parties
3. Prononcer le divorce par consentement mutuel
4. Ordonner la transcription du jugement sur les registres d'état civil

Fait à [VILLE], le [DATE]

Signature du demandeur          Signature du défendeur
_______________                 _______________`,

      ar: `المحكمة الابتدائية ب[المدينة]
قسم قضاء الأسرة

طلب الطلاق بالاتفاق

المدعي(ة): [الاسم الكامل]
رقم البطاقة الوطنية: [الرقم]
العنوان: [العنوان الكامل]

المدعى عليه(ا): [الاسم الكامل]
رقم البطاقة الوطنية: [الرقم]
العنوان: [العنوان الكامل]

الموضوع: طلب الطلاق بالتراضي (المادة 114 من مدونة الأسرة)

السيد(ة) رئيس(ة) المحكمة المحترم(ة)،

يتشرف الموقعان أدناه، المتزوجان بتاريخ [التاريخ] ب[المكان]، 
عقد الزواج رقم [الرقم]، بتقديم هذا الطلب إلى محكمتكم الموقرة 
لإنهاء العلاقة الزوجية بالتراضي، وفقاً لأحكام المادة 114 
من مدونة الأسرة (القانون رقم 70-03).

الوقائع:
1. تم عقد الزواج بتاريخ [التاريخ] ب[المكان].
2. أثمر هذا الزواج عن [العدد] أطفال: [الأسماء وتواريخ الميلاد].
3. اتفق الطرفان بشكل مشترك على إنهاء الرابطة الزوجية.

الاتفاق حول آثار الطلاق:
- حضانة الأطفال: [التفاصيل]
- النفقة: [المبلغ] درهم/شهرياً
- السكن الزوجي: [التفاصيل]
- تقسيم الممتلكات: [التفاصيل]
- حق الزيارة: [التفاصيل]

السند القانوني:
- المادة 114 من مدونة الأسرة
- المواد 78 إلى 93 من مدونة الأسرة

لهذه الأسباب:

نلتمس من المحكمة الموقرة:
1. قبول الطلب شكلاً
2. المصادقة على اتفاق الطرفين
3. الحكم بالطلاق بالتراضي
4. الأمر بتسجيل الحكم في سجلات الحالة المدنية

حرر ب[المدينة]، بتاريخ [التاريخ]

توقيع المدعي(ة)          توقيع المدعى عليه(ا)
_______________           _______________`,

      en: `COURT OF FIRST INSTANCE OF [CITY]
FAMILY LAW DIVISION

MUTUAL CONSENT DIVORCE PETITION

Petitioner: [FULL NAME]
National ID: [NUMBER]
Address: [FULL ADDRESS]

Respondent: [FULL NAME]
National ID: [NUMBER]
Address: [FULL ADDRESS]

RE: Mutual Consent Divorce Petition (Art. 114 of the Family Code)

To the Honorable President of the Court,

The undersigned, married on [DATE] in [LOCATION], marriage certificate 
no. [NUMBER], respectfully submit this petition to your court for 
dissolution of marriage by mutual consent, pursuant to Article 114 of 
the Moudawana (Law No. 70-03).

FACTS:
1. The parties were married on [DATE] in [LOCATION].
2. The marriage produced [NUMBER] children: [NAMES AND DATES OF BIRTH].
3. The parties have mutually agreed to dissolve their marriage.

AGREEMENT ON DIVORCE EFFECTS:
- Child custody: [DETAILS]
- Alimony (Nafaqa): [AMOUNT] MAD/month
- Marital home: [DETAILS]
- Property division: [DETAILS]
- Visitation rights: [DETAILS]

LEGAL BASIS:
- Article 114 of the Family Code (Moudawana)
- Articles 78 to 93 of the Family Code

WHEREFORE, the parties respectfully request the Court to:
1. Accept this petition
2. Ratify the parties' agreement
3. Grant the mutual consent divorce
4. Order transcription of the judgment in civil registry records

Done in [CITY], on [DATE]

Petitioner's Signature          Respondent's Signature
_______________                 _______________`,
    },
  },
  {
    id: "custody-request",
    category: "family",
    title: {
      fr: "Demande de Garde d'Enfants (Hadana)",
      ar: "طلب الحضانة",
      en: "Child Custody Request (Hadana)",
    },
    description: {
      fr: "Demande de droit de garde conformément aux articles 163-186 du Code de la Famille.",
      ar: "طلب حق الحضانة وفقاً للمواد 163-186 من مدونة الأسرة.",
      en: "Custody right request pursuant to Articles 163-186 of the Family Code.",
    },
    legalBasis: "Moudawana Art. 163-186",
    icon: "👶",
    templates: {
      fr: `TRIBUNAL DE PREMIÈRE INSTANCE DE [VILLE]
SECTION DE LA FAMILLE

REQUÊTE DE GARDE D'ENFANTS (HADANA)

Demandeur(euse): [NOM COMPLET]
CIN: [NUMÉRO]
Adresse: [ADRESSE COMPLÈTE]

Défendeur(euse): [NOM COMPLET]
CIN: [NUMÉRO]
Adresse: [ADRESSE COMPLÈTE]

OBJET: Attribution du droit de garde des enfants

FAITS:
Le/La soussigné(e) expose respectueusement que:
1. Un jugement de divorce a été prononcé en date du [DATE], jugement n° [NUMÉRO].
2. Les enfants issus du mariage sont: [NOMS, DATES DE NAISSANCE].
3. Conformément à l'article 171 du Code de la Famille, la garde est confiée 
   en premier lieu à la mère, puis au père, puis à la grand-mère maternelle.

DEMANDE:
- Attribution de la garde des enfants au/à la demandeur(euse)
- Fixation de la pension alimentaire à [MONTANT] MAD/mois (Art. 168)
- Organisation du droit de visite (Art. 180-186)
- Désignation du logement des enfants (Art. 168)

Fait à [VILLE], le [DATE]
Signature: _______________`,

      ar: `المحكمة الابتدائية ب[المدينة]
قسم قضاء الأسرة

طلب إسناد الحضانة

المدعي(ة): [الاسم الكامل]
رقم البطاقة الوطنية: [الرقم]
العنوان: [العنوان الكامل]

المدعى عليه(ا): [الاسم الكامل]
رقم البطاقة الوطنية: [الرقم]
العنوان: [العنوان الكامل]

الموضوع: إسناد حق حضانة الأطفال

الوقائع:
يعرض الموقع(ة) أدناه باحترام ما يلي:
1. صدر حكم بالطلاق بتاريخ [التاريخ]، حكم رقم [الرقم].
2. الأطفال الناتجون عن الزواج هم: [الأسماء، تواريخ الميلاد].
3. وفقاً للمادة 171 من مدونة الأسرة، تُسند الحضانة أولاً 
   للأم، ثم للأب، ثم للجدة لأم.

الطلب:
- إسناد حضانة الأطفال للمدعي(ة)
- تحديد النفقة في مبلغ [المبلغ] درهم/شهرياً (المادة 168)
- تنظيم حق الزيارة (المواد 180-186)
- تعيين سكن الأطفال (المادة 168)

حرر ب[المدينة]، بتاريخ [التاريخ]
التوقيع: _______________`,

      en: `COURT OF FIRST INSTANCE OF [CITY]
FAMILY LAW DIVISION

CHILD CUSTODY REQUEST (HADANA)

Petitioner: [FULL NAME]
National ID: [NUMBER]
Address: [FULL ADDRESS]

Respondent: [FULL NAME]
National ID: [NUMBER]
Address: [FULL ADDRESS]

RE: Attribution of child custody rights

FACTS:
The undersigned respectfully states that:
1. A divorce judgment was rendered on [DATE], judgment no. [NUMBER].
2. The children of the marriage are: [NAMES, DATES OF BIRTH].
3. Pursuant to Article 171 of the Family Code, custody is attributed 
   first to the mother, then to the father, then to the maternal grandmother.

REQUEST:
- Grant custody of the children to the petitioner
- Set child support at [AMOUNT] MAD/month (Art. 168)
- Organize visitation rights (Art. 180-186)
- Designate children's residence (Art. 168)

Done in [CITY], on [DATE]
Signature: _______________`,
    },
  },
  {
    id: "nafaqa-claim",
    category: "family",
    title: {
      fr: "Demande de Pension Alimentaire (Nafaqa)",
      ar: "طلب النفقة",
      en: "Alimony Claim (Nafaqa)",
    },
    description: {
      fr: "Demande de pension alimentaire conformément aux articles 187-205 du Code de la Famille.",
      ar: "طلب النفقة وفقاً للمواد 187-205 من مدونة الأسرة.",
      en: "Alimony claim pursuant to Articles 187-205 of the Family Code.",
    },
    legalBasis: "Moudawana Art. 187-205",
    icon: "💰",
    templates: {
      fr: `TRIBUNAL DE PREMIÈRE INSTANCE DE [VILLE]
SECTION DE LA FAMILLE

DEMANDE DE PENSION ALIMENTAIRE (NAFAQA)

Demandeur(euse): [NOM COMPLET]
CIN: [NUMÉRO] | Adresse: [ADRESSE]

Défendeur(euse): [NOM COMPLET]
CIN: [NUMÉRO] | Adresse: [ADRESSE]

OBJET: Demande de pension alimentaire (Nafaqa)

Le/La requérant(e) sollicite du tribunal la fixation d'une pension alimentaire 
conformément aux articles 187 à 205 du Code de la Famille:

1. Pension pour l'épouse: [MONTANT] MAD/mois
2. Pension pour les enfants: [MONTANT] MAD/mois par enfant
3. Logement: [MONTANT] MAD/mois ou attribution du logement conjugal
4. Frais de scolarité: [MONTANT] MAD/an
5. Frais médicaux: à la charge du père

FONDEMENT: Articles 187-205 de la Moudawana
PIÈCES JOINTES: Acte de mariage, jugement de divorce, fiches de paie du défendeur

Fait à [VILLE], le [DATE]
Signature: _______________`,

      ar: `المحكمة الابتدائية ب[المدينة]
قسم قضاء الأسرة

طلب النفقة

المدعي(ة): [الاسم الكامل]
رقم ب.و: [الرقم] | العنوان: [العنوان]

المدعى عليه(ا): [الاسم الكامل]
رقم ب.و: [الرقم] | العنوان: [العنوان]

الموضوع: طلب تحديد النفقة

يلتمس(تلتمس) المدعي(ة) من المحكمة الموقرة تحديد النفقة 
وفقاً للمواد 187 إلى 205 من مدونة الأسرة:

1. نفقة الزوجة: [المبلغ] درهم/شهرياً
2. نفقة الأطفال: [المبلغ] درهم/شهرياً لكل طفل
3. السكن: [المبلغ] درهم/شهرياً أو تخصيص السكن الزوجي
4. مصاريف التعليم: [المبلغ] درهم/سنوياً
5. المصاريف الطبية: على عاتق الأب

السند: المواد 187-205 من مدونة الأسرة
المرفقات: عقد الزواج، حكم الطلاق، بيانات أجور المدعى عليه

حرر ب[المدينة]، بتاريخ [التاريخ]
التوقيع: _______________`,

      en: `COURT OF FIRST INSTANCE OF [CITY]
FAMILY LAW DIVISION

ALIMONY CLAIM (NAFAQA)

Petitioner: [FULL NAME]
National ID: [NUMBER] | Address: [ADDRESS]

Respondent: [FULL NAME]
National ID: [NUMBER] | Address: [ADDRESS]

RE: Alimony (Nafaqa) Determination Request

The petitioner respectfully requests the court to determine alimony 
pursuant to Articles 187 to 205 of the Family Code:

1. Spousal support: [AMOUNT] MAD/month
2. Child support: [AMOUNT] MAD/month per child
3. Housing: [AMOUNT] MAD/month or attribution of marital home
4. Education costs: [AMOUNT] MAD/year
5. Medical expenses: father's responsibility

LEGAL BASIS: Articles 187-205 of the Moudawana
ATTACHMENTS: Marriage certificate, divorce judgment, respondent's pay slips

Done in [CITY], on [DATE]
Signature: _______________`,
    },
  },

  // ═══════════════════════════════
  // CIVIL LAW
  // ═══════════════════════════════
  {
    id: "lease-contract",
    category: "civil",
    title: {
      fr: "Contrat de Bail d'Habitation",
      ar: "عقد كراء سكني",
      en: "Residential Lease Agreement",
    },
    description: {
      fr: "Contrat de bail résidentiel conforme à la Loi 67-12 relative aux baux d'habitation.",
      ar: "عقد كراء سكني وفقاً للقانون 67-12 المتعلق بعقود الكراء السكني.",
      en: "Residential lease agreement per Law 67-12 on residential tenancies.",
    },
    legalBasis: "Loi 67-12 (Dahir 1-13-111)",
    icon: "🏠",
    templates: {
      fr: `CONTRAT DE BAIL D'HABITATION
(Conformément à la Loi n° 67-12)

Entre les soussignés:

LE BAILLEUR:
Nom: [NOM COMPLET]
CIN: [NUMÉRO]
Adresse: [ADRESSE]

LE LOCATAIRE:
Nom: [NOM COMPLET]
CIN: [NUMÉRO]
Adresse: [ADRESSE]

IL A ÉTÉ CONVENU CE QUI SUIT:

Article 1 — Objet
Le bailleur loue au locataire un logement situé à: [ADRESSE DU BIEN]
Superficie: [SURFACE] m² | Étage: [ÉTAGE] | Nombre de pièces: [NOMBRE]

Article 2 — Durée
Le présent bail est consenti pour une durée de [DURÉE] mois/ans,
à compter du [DATE DÉBUT] jusqu'au [DATE FIN], renouvelable par tacite reconduction.

Article 3 — Loyer
Le loyer mensuel est fixé à [MONTANT] MAD, payable avant le [JOUR] de chaque mois.

Article 4 — Dépôt de garantie
Le locataire verse un dépôt de garantie de [MONTANT] MAD (maximum 2 mois de loyer 
conformément à la Loi 67-12), restituable en fin de bail déduction faite des réparations.

Article 5 — Charges
Les charges locatives comprennent: [EAU, ÉLECTRICITÉ, SYNDIC, etc.]

Article 6 — Obligations du bailleur
- Délivrer le logement en bon état
- Assurer la jouissance paisible du logement
- Effectuer les grosses réparations

Article 7 — Obligations du locataire
- Payer le loyer aux échéances convenues
- User du logement en bon père de famille
- Ne pas sous-louer sans accord écrit du bailleur
- Restituer le logement en bon état

Article 8 — Résiliation
Le préavis de résiliation est de [3] mois minimum (Art. 17 de la Loi 67-12).

Fait en deux exemplaires à [VILLE], le [DATE]

Le Bailleur                     Le Locataire
_______________                 _______________`,

      ar: `عقد كراء سكني
(وفقاً للقانون رقم 67-12)

بين الموقعين أدناه:

المُكري:
الاسم: [الاسم الكامل]
رقم ب.و: [الرقم]
العنوان: [العنوان]

المُكتري:
الاسم: [الاسم الكامل]
رقم ب.و: [الرقم]
العنوان: [العنوان]

تم الاتفاق على ما يلي:

المادة 1 — الموضوع
يكري المكري للمكتري سكناً كائناً ب: [عنوان العقار]
المساحة: [المساحة] متر مربع | الطابق: [الطابق] | عدد الغرف: [العدد]

المادة 2 — المدة
أُبرم هذا العقد لمدة [المدة] أشهر/سنوات
ابتداءً من [تاريخ البداية] إلى [تاريخ النهاية]، قابل للتجديد ضمنياً.

المادة 3 — واجب الكراء
حُدد واجب الكراء الشهري في مبلغ [المبلغ] درهم، يُؤدى قبل يوم [اليوم] من كل شهر.

المادة 4 — الضمانة
يدفع المكتري ضمانة قدرها [المبلغ] درهم (بحد أقصى شهرين من الكراء 
وفقاً للقانون 67-12)، تُرجع عند نهاية العقد مع خصم الإصلاحات.

المادة 5 — التكاليف
تشمل تكاليف الكراء: [الماء، الكهرباء، السنديك، إلخ]

المادة 6 — التزامات المكري
- تسليم السكن في حالة جيدة
- ضمان الانتفاع الهادئ بالسكن
- القيام بالإصلاحات الكبرى

المادة 7 — التزامات المكتري
- أداء واجب الكراء في مواعيده
- استعمال السكن بشكل حسن
- عدم الكراء من الباطن دون موافقة كتابية
- إرجاع السكن في حالة جيدة

المادة 8 — الفسخ
مدة الإشعار بالفسخ [3] أشهر كحد أدنى (المادة 17 من القانون 67-12).

حُرر من نسختين ب[المدينة]، بتاريخ [التاريخ]

المُكري                     المُكتري
_______________             _______________`,

      en: `RESIDENTIAL LEASE AGREEMENT
(Pursuant to Law No. 67-12)

Between the undersigned:

THE LANDLORD:
Name: [FULL NAME]
National ID: [NUMBER]
Address: [ADDRESS]

THE TENANT:
Name: [FULL NAME]
National ID: [NUMBER]
Address: [ADDRESS]

THE FOLLOWING HAS BEEN AGREED:

Article 1 — Subject
The landlord leases to the tenant a dwelling located at: [PROPERTY ADDRESS]
Area: [SIZE] sq.m | Floor: [FLOOR] | Number of rooms: [NUMBER]

Article 2 — Duration
This lease is granted for a period of [DURATION] months/years,
from [START DATE] to [END DATE], renewable by tacit renewal.

Article 3 — Rent
Monthly rent is set at [AMOUNT] MAD, payable before the [DAY] of each month.

Article 4 — Security Deposit
The tenant pays a security deposit of [AMOUNT] MAD (maximum 2 months' rent 
per Law 67-12), refundable at the end of the lease minus repair costs.

Article 5 — Service Charges
Service charges include: [WATER, ELECTRICITY, BUILDING FEES, etc.]

Article 6 — Landlord's Obligations
- Deliver the dwelling in good condition
- Ensure peaceful enjoyment of the dwelling
- Perform major repairs

Article 7 — Tenant's Obligations
- Pay rent on agreed dates
- Use the dwelling responsibly
- Not sublet without written consent of the landlord
- Return the dwelling in good condition

Article 8 — Termination
Notice period for termination is [3] months minimum (Art. 17 of Law 67-12).

Done in two copies in [CITY], on [DATE]

The Landlord                    The Tenant
_______________                 _______________`,
    },
  },
  {
    id: "mise-en-demeure",
    category: "civil",
    title: {
      fr: "Mise en Demeure",
      ar: "إنذار قانوني",
      en: "Formal Notice / Demand Letter",
    },
    description: {
      fr: "Lettre de mise en demeure avant toute action en justice (DOC Art. 254-259).",
      ar: "خطاب إنذار رسمي قبل اللجوء إلى القضاء (ق.ل.ع المواد 254-259).",
      en: "Formal demand letter prior to legal action (DOC Art. 254-259).",
    },
    legalBasis: "DOC Art. 254-259",
    icon: "📨",
    templates: {
      fr: `MISE EN DEMEURE
(Envoi recommandé avec accusé de réception)

[VILLE], le [DATE]

De: [NOM DU CRÉANCIER]
    [ADRESSE COMPLÈTE]
    CIN: [NUMÉRO]

À: [NOM DU DÉBITEUR]
   [ADRESSE COMPLÈTE]

Objet: Mise en demeure de payer / d'exécuter

Madame/Monsieur,

Par la présente, je vous mets en demeure de:

[DESCRIPTION PRÉCISE DE L'OBLIGATION NON EXÉCUTÉE]

Montant dû: [MONTANT] MAD
Échéance initiale: [DATE]
Objet de l'obligation: [CONTRAT/ACCORD DU DATE]

Conformément aux articles 254 à 259 du Dahir des Obligations et Contrats (DOC),
je vous accorde un délai de [15/30] jours à compter de la réception de la présente
pour vous acquitter de votre obligation.

À défaut d'exécution dans le délai imparti, je me réserve le droit de saisir
la juridiction compétente pour obtenir l'exécution forcée ainsi que des 
dommages-intérêts pour le préjudice subi.

La présente vaut mise en demeure au sens des articles 254 et suivants du DOC.

Veuillez agréer, Madame/Monsieur, l'expression de mes salutations distinguées.

Signature: _______________
Nom: [NOM]`,

      ar: `إنذار قانوني
(يُرسل بالبريد المضمون مع الإشعار بالتوصل)

[المدينة]، بتاريخ [التاريخ]

من: [اسم الدائن]
    [العنوان الكامل]
    رقم ب.و: [الرقم]

إلى: [اسم المدين]
     [العنوان الكامل]

الموضوع: إنذار بالأداء / بالتنفيذ

السيد(ة) المحترم(ة)،

بموجب هذا الإنذار، أطلب منكم:

[وصف دقيق للالتزام غير المنفذ]

المبلغ المستحق: [المبلغ] درهم
تاريخ الاستحقاق الأصلي: [التاريخ]
موضوع الالتزام: [العقد/الاتفاق المؤرخ في]

وفقاً للمواد 254 إلى 259 من قانون الالتزامات والعقود (ق.ل.ع)،
أمنحكم أجل [15/30] يوماً ابتداءً من تاريخ توصلكم بهذا الإنذار
لتنفيذ التزامكم.

في حالة عدم التنفيذ في الأجل المحدد، أحتفظ بحق اللجوء إلى 
القضاء المختص للحصول على التنفيذ الجبري والتعويض عن الضرر.

يُعتبر هذا الإنذار بمثابة إنذار قانوني حسب المواد 254 وما يليها من ق.ل.ع.

وتقبلوا فائق التقدير والاحترام.

التوقيع: _______________
الاسم: [الاسم]`,

      en: `FORMAL NOTICE / DEMAND LETTER
(Sent by registered mail with return receipt)

[CITY], [DATE]

From: [CREDITOR'S NAME]
      [FULL ADDRESS]
      National ID: [NUMBER]

To:   [DEBTOR'S NAME]
      [FULL ADDRESS]

RE: Formal demand for payment / performance

Dear Sir/Madam,

By means of this letter, I hereby formally demand that you:

[PRECISE DESCRIPTION OF THE UNFULFILLED OBLIGATION]

Amount due: [AMOUNT] MAD
Original due date: [DATE]
Subject of obligation: [CONTRACT/AGREEMENT DATED]

Pursuant to Articles 254 to 259 of the Dahir of Obligations and Contracts (DOC),
I grant you a period of [15/30] days from receipt of this notice to fulfill 
your obligation.

Failure to perform within the stated period will result in legal proceedings 
before the competent court to obtain forced execution and damages for 
the harm suffered.

This letter constitutes formal notice within the meaning of Articles 254 
and following of the DOC.

Yours faithfully,

Signature: _______________
Name: [NAME]`,
    },
  },
  {
    id: "power-of-attorney",
    category: "civil",
    title: {
      fr: "Procuration (Wakala)",
      ar: "وكالة (توكيل)",
      en: "Power of Attorney (Wakala)",
    },
    description: {
      fr: "Procuration générale ou spéciale pour agir au nom d'autrui (DOC Art. 879-943).",
      ar: "توكيل عام أو خاص للتصرف باسم الغير (ق.ل.ع المواد 879-943).",
      en: "General or special power of attorney to act on behalf of another (DOC Art. 879-943).",
    },
    legalBasis: "DOC Art. 879-943",
    icon: "📝",
    templates: {
      fr: `PROCURATION SPÉCIALE

Je soussigné(e):
Nom: [NOM COMPLET]
CIN: [NUMÉRO]
Adresse: [ADRESSE COMPLÈTE]

Donne par la présente procuration spéciale à:
Nom: [NOM DU MANDATAIRE]
CIN: [NUMÉRO]
Adresse: [ADRESSE COMPLÈTE]

Aux fins de: [DESCRIPTION PRÉCISE DE L'OBJET DE LA PROCURATION]

Le/La mandataire est autorisé(e) à:
- [ACTION 1]
- [ACTION 2]
- [ACTION 3]
- Signer tout document nécessaire à l'exécution de la présente procuration

La présente procuration est valable du [DATE DÉBUT] au [DATE FIN].
Elle est établie conformément aux articles 879 à 943 du DOC.

Fait à [VILLE], le [DATE]

Signature du mandant (légalisée): _______________`,

      ar: `وكالة خاصة

أنا الموقع(ة) أدناه:
الاسم: [الاسم الكامل]
رقم ب.و: [الرقم]
العنوان: [العنوان الكامل]

أُوكل بموجب هذا:
الاسم: [اسم الوكيل]
رقم ب.و: [الرقم]
العنوان: [العنوان الكامل]

من أجل: [وصف دقيق لموضوع التوكيل]

يُخوَّل الوكيل بما يلي:
- [الإجراء 1]
- [الإجراء 2]
- [الإجراء 3]
- التوقيع على أي وثيقة ضرورية لتنفيذ هذا التوكيل

هذا التوكيل صالح من [تاريخ البداية] إلى [تاريخ النهاية].
أُعد وفقاً للمواد 879 إلى 943 من قانون الالتزامات والعقود.

حُرر ب[المدينة]، بتاريخ [التاريخ]

توقيع الموكل (مصادق عليه): _______________`,

      en: `SPECIAL POWER OF ATTORNEY

I, the undersigned:
Name: [FULL NAME]
National ID: [NUMBER]
Address: [FULL ADDRESS]

Hereby grant special power of attorney to:
Name: [AGENT'S FULL NAME]
National ID: [NUMBER]
Address: [FULL ADDRESS]

For the purpose of: [PRECISE DESCRIPTION OF THE PURPOSE]

The agent is authorized to:
- [ACTION 1]
- [ACTION 2]
- [ACTION 3]
- Sign any documents necessary for the execution of this power of attorney

This power of attorney is valid from [START DATE] to [END DATE].
It is established pursuant to Articles 879 to 943 of the DOC.

Done in [CITY], on [DATE]

Principal's Signature (legalized): _______________`,
    },
  },

  // ═══════════════════════════════
  // CRIMINAL LAW
  // ═══════════════════════════════
  {
    id: "criminal-complaint",
    category: "criminal",
    title: {
      fr: "Plainte Pénale",
      ar: "شكاية جنائية",
      en: "Criminal Complaint",
    },
    description: {
      fr: "Modèle de plainte pénale auprès du Procureur du Roi (CPC Art. 40).",
      ar: "نموذج شكاية جنائية لدى وكيل الملك (م.ج المادة 40).",
      en: "Criminal complaint template to the King's Prosecutor (CPC Art. 40).",
    },
    legalBasis: "CPC Art. 40 | Penal Code",
    icon: "⚖️",
    templates: {
      fr: `À Monsieur le Procureur du Roi
Près le Tribunal de Première Instance de [VILLE]

PLAINTE PÉNALE

Plaignant(e):
Nom: [NOM COMPLET]
CIN: [NUMÉRO]
Adresse: [ADRESSE COMPLÈTE]
Téléphone: [NUMÉRO]

Mis(e) en cause:
Nom: [NOM COMPLET] (ou inconnu)
Adresse: [ADRESSE SI CONNUE]

OBJET: Plainte pour [INFRACTION: vol / agression / escroquerie / abus de confiance / etc.]

Monsieur le Procureur,

J'ai l'honneur de porter plainte contre [NOM OU INCONNU] pour les faits suivants:

FAITS:
Le [DATE], à [LIEU], [DESCRIPTION DÉTAILLÉE DES FAITS].

QUALIFICATION PÉNALE:
Les faits constituent l'infraction de [NOM DE L'INFRACTION] prévue et réprimée
par l'article [NUMÉRO] du Code Pénal marocain.

PRÉJUDICE:
[DESCRIPTION DU PRÉJUDICE SUBI: physique, matériel, moral]

PREUVES:
- [CERTIFICAT MÉDICAL]
- [TÉMOINS: noms et coordonnées]
- [PHOTOS/VIDÉOS]
- [AUTRES PIÈCES]

Par conséquent, je sollicite qu'il plaise à Monsieur le Procureur du Roi de:
1. Ouvrir une enquête
2. Poursuivre le/la mis(e) en cause
3. Me constituer partie civile pour obtenir réparation

Fait à [VILLE], le [DATE]
Signature: _______________`,

      ar: `إلى السيد وكيل الملك
لدى المحكمة الابتدائية ب[المدينة]

شكاية جنائية

المشتكي(ة):
الاسم: [الاسم الكامل]
رقم ب.و: [الرقم]
العنوان: [العنوان الكامل]
الهاتف: [الرقم]

المشتكى به(ا):
الاسم: [الاسم الكامل] (أو مجهول)
العنوان: [العنوان إن كان معروفاً]

الموضوع: شكاية من أجل [الجريمة: سرقة / اعتداء / نصب / خيانة أمانة / إلخ]

السيد وكيل الملك المحترم،

يشرفني أن أتقدم بشكايتي ضد [الاسم أو مجهول] بخصوص الوقائع التالية:

الوقائع:
بتاريخ [التاريخ]، ب[المكان]، [وصف مفصل للوقائع].

التكييف القانوني:
تشكل الوقائع جريمة [اسم الجريمة] المنصوص عليها والمعاقب عنها
بموجب المادة [الرقم] من القانون الجنائي المغربي.

الضرر:
[وصف الضرر: جسدي، مادي، معنوي]

الأدلة:
- [شهادة طبية]
- [شهود: الأسماء والعناوين]
- [صور/فيديوهات]
- [وثائق أخرى]

بناءً عليه، ألتمس من السيد وكيل الملك:
1. فتح تحقيق
2. متابعة المشتكى به
3. تمكيني من التنصيب كطرف مدني للحصول على التعويض

حرر ب[المدينة]، بتاريخ [التاريخ]
التوقيع: _______________`,

      en: `To the King's Prosecutor
At the Court of First Instance of [CITY]

CRIMINAL COMPLAINT

Complainant:
Name: [FULL NAME]
National ID: [NUMBER]
Address: [FULL ADDRESS]
Phone: [NUMBER]

Accused:
Name: [FULL NAME] (or unknown)
Address: [ADDRESS IF KNOWN]

RE: Complaint for [OFFENCE: theft / assault / fraud / breach of trust / etc.]

Dear Prosecutor,

I have the honor of filing a criminal complaint against [NAME OR UNKNOWN] 
for the following facts:

FACTS:
On [DATE], at [LOCATION], [DETAILED DESCRIPTION OF EVENTS].

CRIMINAL CLASSIFICATION:
The facts constitute the offence of [OFFENCE NAME] as provided and punished
by Article [NUMBER] of the Moroccan Penal Code.

DAMAGES:
[DESCRIPTION OF HARM SUFFERED: physical, material, moral]

EVIDENCE:
- [MEDICAL CERTIFICATE]
- [WITNESSES: names and contact details]
- [PHOTOS/VIDEOS]
- [OTHER DOCUMENTS]

Therefore, I respectfully request the King's Prosecutor to:
1. Open an investigation
2. Prosecute the accused
3. Allow me to join as a civil party for compensation

Done in [CITY], on [DATE]
Signature: _______________`,
    },
  },

  // ═══════════════════════════════
  // COMMERCIAL LAW
  // ═══════════════════════════════
  {
    id: "employment-contract",
    category: "commercial",
    title: {
      fr: "Contrat de Travail (CDI)",
      ar: "عقد شغل (غير محدد المدة)",
      en: "Employment Contract (Permanent)",
    },
    description: {
      fr: "Contrat de travail à durée indéterminée conforme au Code du Travail (Loi 65-99).",
      ar: "عقد شغل غير محدد المدة وفقاً لقانون الشغل (القانون 65-99).",
      en: "Permanent employment contract per Labour Code (Law 65-99).",
    },
    legalBasis: "Code du Travail (Loi 65-99)",
    icon: "💼",
    templates: {
      fr: `CONTRAT DE TRAVAIL À DURÉE INDÉTERMINÉE
(Conformément à la Loi n° 65-99 — Code du Travail)

Entre:

L'EMPLOYEUR:
Raison sociale: [NOM DE L'ENTREPRISE]
RC: [NUMÉRO] | ICE: [NUMÉRO]
Adresse: [ADRESSE DU SIÈGE]
Représenté par: [NOM DU REPRÉSENTANT], en qualité de [FONCTION]

LE SALARIÉ:
Nom: [NOM COMPLET]
CIN: [NUMÉRO] | CNSS: [NUMÉRO]
Adresse: [ADRESSE]

IL A ÉTÉ CONVENU CE QUI SUIT:

Article 1 — Engagement
L'employeur engage le salarié en qualité de [POSTE], classification [NIVEAU].

Article 2 — Période d'essai
La période d'essai est fixée à [DURÉE] jours/mois, renouvelable une fois.
(Art. 13-14 du Code du Travail)

Article 3 — Rémunération
Le salaire mensuel brut est de [MONTANT] MAD.
Le SMIG applicable est de 3111,39 MAD/mois (2024).

Article 4 — Durée du travail
La durée hebdomadaire est de 44 heures (Art. 184 du Code du Travail).

Article 5 — Congés
Le salarié bénéficie de 1,5 jour ouvrable de congé par mois de service (Art. 231).

Article 6 — Obligations
Le salarié s'engage à respecter le règlement intérieur de l'entreprise.

Article 7 — Résiliation
Le préavis de résiliation est conforme aux articles 43 à 52 du Code du Travail.

Fait en deux exemplaires à [VILLE], le [DATE]

L'Employeur                     Le Salarié
_______________                 _______________`,

      ar: `عقد شغل غير محدد المدة
(وفقاً للقانون رقم 65-99 — مدونة الشغل)

بين:

المشغل:
الاسم التجاري: [اسم الشركة]
السجل التجاري: [الرقم] | المعرف المشترك: [الرقم]
العنوان: [عنوان المقر]
يمثله: [اسم الممثل]، بصفته [الوظيفة]

الأجير:
الاسم: [الاسم الكامل]
رقم ب.و: [الرقم] | رقم CNSS: [الرقم]
العنوان: [العنوان]

تم الاتفاق على ما يلي:

المادة 1 — التشغيل
يشغل المشغل الأجير بصفة [المنصب]، تصنيف [المستوى].

المادة 2 — فترة الاختبار
حُددت فترة الاختبار في [المدة] أيام/أشهر، قابلة للتجديد مرة واحدة.
(المادتان 13-14 من مدونة الشغل)

المادة 3 — الأجر
الأجر الشهري الإجمالي هو [المبلغ] درهم.
الحد الأدنى المطبق هو 3111,39 درهم/شهر (2024).

المادة 4 — مدة الشغل
مدة الشغل الأسبوعية 44 ساعة (المادة 184 من مدونة الشغل).

المادة 5 — العطل
يستفيد الأجير من 1,5 يوم عمل إجازة عن كل شهر خدمة (المادة 231).

المادة 6 — الالتزامات
يلتزم الأجير باحترام النظام الداخلي للشركة.

المادة 7 — الإنهاء
مدة الإشعار بالإنهاء طبقاً للمواد 43 إلى 52 من مدونة الشغل.

حُرر من نسختين ب[المدينة]، بتاريخ [التاريخ]

المشغل                         الأجير
_______________                 _______________`,

      en: `PERMANENT EMPLOYMENT CONTRACT
(Pursuant to Law No. 65-99 — Labour Code)

Between:

THE EMPLOYER:
Company name: [COMPANY NAME]
Trade Register: [NUMBER] | ICE: [NUMBER]
Address: [HEAD OFFICE ADDRESS]
Represented by: [REPRESENTATIVE NAME], as [POSITION]

THE EMPLOYEE:
Name: [FULL NAME]
National ID: [NUMBER] | CNSS: [NUMBER]
Address: [ADDRESS]

THE FOLLOWING HAS BEEN AGREED:

Article 1 — Employment
The employer hires the employee as [POSITION], classification [LEVEL].

Article 2 — Probationary Period
The probationary period is set at [DURATION] days/months, renewable once.
(Art. 13-14 of the Labour Code)

Article 3 — Compensation
Monthly gross salary is [AMOUNT] MAD.
Applicable minimum wage (SMIG) is 3,111.39 MAD/month (2024).

Article 4 — Working Hours
Weekly working time is 44 hours (Art. 184 of the Labour Code).

Article 5 — Leave
The employee is entitled to 1.5 working days of leave per month of service (Art. 231).

Article 6 — Obligations
The employee agrees to comply with the company's internal regulations.

Article 7 — Termination
Notice period for termination is per articles 43 to 52 of the Labour Code.

Done in two copies in [CITY], on [DATE]

The Employer                    The Employee
_______________                 _______________`,
    },
  },

  // ═══════════════════════════════
  // ADMINISTRATIVE LAW
  // ═══════════════════════════════
  {
    id: "admin-recourse",
    category: "administrative",
    title: {
      fr: "Recours Gracieux Administratif",
      ar: "طعن إداري رضائي",
      en: "Administrative Gracious Appeal",
    },
    description: {
      fr: "Recours gracieux auprès de l'administration avant saisine du tribunal administratif.",
      ar: "طعن رضائي لدى الإدارة قبل اللجوء إلى المحكمة الإدارية.",
      en: "Gracious appeal to the administration before filing at the administrative court.",
    },
    legalBasis: "Loi 41-90 | CPC Art. 360",
    icon: "🏛️",
    templates: {
      fr: `[VILLE], le [DATE]

De: [NOM COMPLET]
    CIN: [NUMÉRO]
    [ADRESSE COMPLÈTE]

À: Monsieur/Madame [TITRE ET NOM DU RESPONSABLE]
   [NOM DE L'ADMINISTRATION]
   [ADRESSE DE L'ADMINISTRATION]

Objet: Recours gracieux contre la décision n° [NUMÉRO] du [DATE]

Monsieur/Madame,

Par la présente, j'ai l'honneur de former un recours gracieux à l'encontre
de la décision n° [NUMÉRO] prise le [DATE] par [SERVICE/ADMINISTRATION],
portant [OBJET DE LA DÉCISION].

MOTIFS DU RECOURS:
1. [MOTIF 1: erreur de fait, de droit, etc.]
2. [MOTIF 2]
3. [MOTIF 3]

DEMANDE:
Je sollicite le réexamen de cette décision et son annulation/modification
pour les motifs exposés ci-dessus.

En l'absence de réponse dans un délai de 60 jours, je me réserve le droit
de saisir le Tribunal Administratif compétent (Loi 41-90).

PIÈCES JOINTES:
- Copie de la décision contestée
- [AUTRES PIÈCES]

Veuillez agréer mes salutations respectueuses.

Signature: _______________`,

      ar: `[المدينة]، بتاريخ [التاريخ]

من: [الاسم الكامل]
    رقم ب.و: [الرقم]
    [العنوان الكامل]

إلى: السيد(ة) [لقب واسم المسؤول]
     [اسم الإدارة]
     [عنوان الإدارة]

الموضوع: طعن رضائي ضد القرار رقم [الرقم] بتاريخ [التاريخ]

السيد(ة) المحترم(ة)،

يشرفني أن أتقدم بطعن رضائي ضد القرار رقم [الرقم] الصادر
بتاريخ [التاريخ] عن [المصلحة/الإدارة]،
والمتعلق ب[موضوع القرار].

أسباب الطعن:
1. [السبب 1: خطأ في الوقائع، في القانون، إلخ]
2. [السبب 2]
3. [السبب 3]

الطلب:
ألتمس إعادة النظر في هذا القرار وإلغاءه/تعديله
للأسباب المذكورة أعلاه.

في حالة عدم الرد في أجل 60 يوماً، أحتفظ بحق
اللجوء إلى المحكمة الإدارية المختصة (القانون 41-90).

المرفقات:
- نسخة من القرار المطعون فيه
- [وثائق أخرى]

وتقبلوا فائق التقدير والاحترام.

التوقيع: _______________`,

      en: `[CITY], [DATE]

From: [FULL NAME]
      National ID: [NUMBER]
      [FULL ADDRESS]

To:   [TITLE AND NAME OF OFFICIAL]
      [NAME OF ADMINISTRATION]
      [ADDRESS OF ADMINISTRATION]

RE: Gracious appeal against decision no. [NUMBER] dated [DATE]

Dear Sir/Madam,

I hereby respectfully submit a gracious appeal against decision 
no. [NUMBER] issued on [DATE] by [DEPARTMENT/ADMINISTRATION],
concerning [SUBJECT OF THE DECISION].

GROUNDS FOR APPEAL:
1. [GROUND 1: factual error, legal error, etc.]
2. [GROUND 2]
3. [GROUND 3]

REQUEST:
I request the re-examination and annulment/modification of this 
decision for the reasons stated above.

In the absence of a response within 60 days, I reserve the right 
to file before the competent Administrative Court (Law 41-90).

ATTACHMENTS:
- Copy of the contested decision
- [OTHER DOCUMENTS]

Yours respectfully,

Signature: _______________`,
    },
  },
];

export function getDocumentsByCategory(): Map<DocumentCategory, DocumentTemplate[]> {
  const map = new Map<DocumentCategory, DocumentTemplate[]>();
  for (const doc of documents) {
    const list = map.get(doc.category) || [];
    list.push(doc);
    map.set(doc.category, list);
  }
  return map;
}
