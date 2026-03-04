/**
 * Form field configurations for every legal document type.
 * Each document config has multi-step structure with full i18n.
 */
import type { DocumentFormConfig } from "./types";

// ─── Shared property-type options ─────────────────────────────────
const propertyTypeOptions = [
  { value: "apartment", label: { ar: "شقة", fr: "Appartement", en: "Apartment" } },
  { value: "house",     label: { ar: "منزل", fr: "Maison", en: "House" } },
  { value: "commercial",label: { ar: "محل تجاري", fr: "Local commercial", en: "Commercial space" } },
  { value: "land",      label: { ar: "أرض", fr: "Terrain", en: "Land" } },
];

const paymentMethodOptions = [
  { value: "cash",     label: { ar: "نقداً", fr: "Espèces", en: "Cash" } },
  { value: "check",    label: { ar: "شيك", fr: "Chèque", en: "Check" } },
  { value: "transfer", label: { ar: "تحويل بنكي", fr: "Virement bancaire", en: "Bank transfer" } },
];

const relationshipOptions = [
  { value: "spouse",  label: { ar: "زوج / زوجة", fr: "Conjoint(e)", en: "Spouse" } },
  { value: "child",   label: { ar: "ابن / ابنة", fr: "Enfant", en: "Child" } },
  { value: "parent",  label: { ar: "أب / أم", fr: "Parent", en: "Parent" } },
];

const divorceGroundsOptions = [
  { value: "mutual",     label: { ar: "بالتراضي", fr: "Par consentement mutuel", en: "Mutual consent" } },
  { value: "discord",    label: { ar: "للشقاق", fr: "Pour discorde", en: "Discord" } },
  { value: "harm",       label: { ar: "للضرر", fr: "Pour préjudice", en: "Harm" } },
  { value: "absence",    label: { ar: "للغياب", fr: "Pour absence", en: "Absence" } },
  { value: "defect",     label: { ar: "للعيب", fr: "Pour vice rédhibitoire", en: "Defect" } },
  { value: "nonSupport", label: { ar: "لعدم الإنفاق", fr: "Pour défaut d'entretien", en: "Non-support" } },
];

// ═══════════════════════════════════════════════════════════════════
// ALL DOCUMENT CONFIGS
// ═══════════════════════════════════════════════════════════════════

export const documentFormConfigs: DocumentFormConfig[] = [

  // ───────────────────────────────────────────────────────────────
  // 1. CUSTODY REQUEST
  // ───────────────────────────────────────────────────────────────
  {
    id: "custody-request",
    slug: "custody-request",
    category: "family",
    serviceType: "guide",
    icon: "👨‍👩‍👧",
    title: { ar: "طلب الحضانة", fr: "Demande de Garde d'Enfants", en: "Child Custody Request" },
    description: { ar: "طلب الحصول على حق حضانة الأطفال بعد الطلاق", fr: "Demande de garde des enfants après divorce", en: "Request for child custody after divorce" },
    legalBasis: "Moudawana Art. 163-186",
    steps: [
      {
        id: "petitioner",
        title: { ar: "بيانات مقدم الطلب", fr: "Informations du Demandeur", en: "Petitioner Information" },
        fields: [
          { name: "fullName",       type: "text",  label: { ar: "الاسم الكامل", fr: "Nom complet", en: "Full name" }, required: true, half: true },
          { name: "idNumber",       type: "text",  label: { ar: "رقم البطاقة الوطنية", fr: "N° CIN", en: "ID Number" }, required: true, half: true },
          { name: "address",        type: "text",  label: { ar: "العنوان", fr: "Adresse", en: "Address" }, required: true },
          { name: "city",           type: "city",  label: { ar: "المدينة", fr: "Ville", en: "City" }, required: true, half: true },
          { name: "phone",          type: "text",  label: { ar: "رقم الهاتف", fr: "Téléphone", en: "Phone" }, half: true },
        ],
      },
      {
        id: "otherParent",
        title: { ar: "بيانات الطرف الآخر", fr: "Informations de l'Autre Parent", en: "Other Parent Information" },
        fields: [
          { name: "otherParentName",    type: "text",  label: { ar: "اسم الطرف الآخر", fr: "Nom de l'autre parent", en: "Other parent's name" }, required: true },
          { name: "otherParentAddress", type: "text",  label: { ar: "عنوان الطرف الآخر", fr: "Adresse de l'autre parent", en: "Other parent's address" }, required: true },
        ],
      },
      {
        id: "children",
        title: { ar: "بيانات الأطفال", fr: "Informations des Enfants", en: "Children Information" },
        fields: [
          { name: "childrenCount",  type: "number", label: { ar: "عدد الأطفال", fr: "Nombre d'enfants", en: "Number of children" }, required: true, half: true },
          { name: "childrenNames",  type: "array",  label: { ar: "أسماء الأطفال", fr: "Noms des enfants", en: "Children's names" }, arrayItemLabel: { ar: "اسم الطفل", fr: "Nom de l'enfant", en: "Child's name" }, arrayMin: 1, arrayMax: 10, required: true },
          { name: "childrenAges",   type: "array",  label: { ar: "أعمار الأطفال", fr: "Âges des enfants", en: "Children's ages" }, arrayItemLabel: { ar: "عمر الطفل", fr: "Âge de l'enfant", en: "Child's age" }, arrayMin: 1, arrayMax: 10, required: true },
        ],
      },
      {
        id: "details",
        title: { ar: "تفاصيل الطلب", fr: "Détails de la Demande", en: "Request Details" },
        fields: [
          { name: "marriageCertNumber",    type: "text", label: { ar: "رقم عقد الزواج", fr: "N° acte de mariage", en: "Marriage certificate number" }, required: true, half: true },
          { name: "divorceJudgmentNumber", type: "text", label: { ar: "رقم حكم الطلاق", fr: "N° jugement de divorce", en: "Divorce judgment number" }, half: true },
          { name: "divorceDate",           type: "date", label: { ar: "تاريخ الطلاق", fr: "Date du divorce", en: "Divorce date" }, half: true },
          { name: "court",                 type: "court", label: { ar: "المحكمة المختصة", fr: "Tribunal compétent", en: "Competent court" }, required: true, half: true },
          { name: "requestReason",         type: "textarea", label: { ar: "أسباب الطلب", fr: "Motifs de la demande", en: "Reasons for the request" }, required: true },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────
  // 2. LEASE CONTRACT
  // ───────────────────────────────────────────────────────────────
  {
    id: "lease-contract",
    slug: "lease-contract",
    category: "civil",
    serviceType: "form",
    icon: "🏠",
    title: { ar: "عقد الإيجار", fr: "Contrat de Location", en: "Lease Contract" },
    description: { ar: "عقد كراء سكني أو تجاري وفق القانون المغربي", fr: "Contrat de bail résidentiel ou commercial", en: "Residential or commercial lease agreement" },
    legalBasis: "Loi 67.12",
    steps: [
      {
        id: "landlord",
        title: { ar: "بيانات المؤجر", fr: "Informations du Bailleur", en: "Landlord Information" },
        fields: [
          { name: "landlordName",    type: "text",  label: { ar: "اسم المؤجر", fr: "Nom du bailleur", en: "Landlord's name" }, required: true, half: true },
          { name: "landlordId",      type: "text",  label: { ar: "رقم البطاقة الوطنية", fr: "N° CIN du bailleur", en: "Landlord's ID" }, required: true, half: true },
          { name: "landlordAddress", type: "text",  label: { ar: "عنوان المؤجر", fr: "Adresse du bailleur", en: "Landlord's address" }, required: true },
        ],
      },
      {
        id: "tenant",
        title: { ar: "بيانات المستأجر", fr: "Informations du Locataire", en: "Tenant Information" },
        fields: [
          { name: "tenantName",    type: "text",  label: { ar: "اسم المستأجر", fr: "Nom du locataire", en: "Tenant's name" }, required: true, half: true },
          { name: "tenantId",      type: "text",  label: { ar: "رقم البطاقة الوطنية", fr: "N° CIN du locataire", en: "Tenant's ID" }, required: true, half: true },
          { name: "tenantAddress", type: "text",  label: { ar: "عنوان المستأجر", fr: "Adresse du locataire", en: "Tenant's address" }, required: true },
        ],
      },
      {
        id: "property",
        title: { ar: "بيانات العقار", fr: "Informations du Bien", en: "Property Information" },
        fields: [
          { name: "propertyAddress",  type: "text",   label: { ar: "عنوان العقار", fr: "Adresse du bien", en: "Property address" }, required: true },
          { name: "propertyType",     type: "select", label: { ar: "نوع العقار", fr: "Type de bien", en: "Property type" }, options: propertyTypeOptions, required: true, half: true },
          { name: "propertySize",     type: "text",   label: { ar: "المساحة (م²)", fr: "Surface (m²)", en: "Size (m²)" }, half: true },
          { name: "propertyDescription", type: "textarea", label: { ar: "وصف العقار", fr: "Description du bien", en: "Property description" } },
        ],
      },
      {
        id: "terms",
        title: { ar: "شروط العقد", fr: "Conditions du Contrat", en: "Contract Terms" },
        fields: [
          { name: "monthlyRent",   type: "number", label: { ar: "الإيجار الشهري (درهم)", fr: "Loyer mensuel (MAD)", en: "Monthly rent (MAD)" }, required: true, half: true },
          { name: "depositAmount", type: "number", label: { ar: "مبلغ الضمان (درهم)", fr: "Dépôt de garantie (MAD)", en: "Deposit (MAD)" }, required: true, half: true },
          { name: "startDate",     type: "date",   label: { ar: "تاريخ البداية", fr: "Date de début", en: "Start date" }, required: true, half: true },
          { name: "duration",      type: "text",   label: { ar: "المدة", fr: "Durée", en: "Duration" }, placeholder: { ar: "12 شهراً", fr: "12 mois", en: "12 months" }, required: true, half: true },
          { name: "paymentDay",    type: "number", label: { ar: "يوم الأداء من كل شهر", fr: "Jour de paiement mensuel", en: "Monthly payment day" }, half: true },
          { name: "city",          type: "city",   label: { ar: "المدينة", fr: "Ville", en: "City" }, required: true, half: true },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────
  // 3. POWER OF ATTORNEY
  // ───────────────────────────────────────────────────────────────
  {
    id: "power-of-attorney",
    slug: "power-of-attorney",
    category: "civil",
    serviceType: "form",
    icon: "📝",
    title: { ar: "توكيل رسمي", fr: "Procuration Notariée", en: "Power of Attorney" },
    description: { ar: "توكيل شخص للتصرف نيابة عنك أمام الجهات الرسمية", fr: "Autorisation officielle d'agir pour le compte d'autrui", en: "Official authorization to act on someone's behalf" },
    legalBasis: "DOC Art. 879-943",
    steps: [
      {
        id: "mandator",
        title: { ar: "بيانات الموكل", fr: "Informations du Mandant", en: "Mandator Information" },
        fields: [
          { name: "mandatorName",    type: "text",  label: { ar: "اسم الموكل", fr: "Nom du mandant", en: "Mandator's name" }, required: true, half: true },
          { name: "mandatorId",      type: "text",  label: { ar: "رقم البطاقة الوطنية", fr: "N° CIN", en: "ID Number" }, required: true, half: true },
          { name: "mandatorDOB",     type: "date",  label: { ar: "تاريخ الازدياد", fr: "Date de naissance", en: "Date of birth" }, half: true },
          { name: "mandatorAddress", type: "text",  label: { ar: "العنوان", fr: "Adresse", en: "Address" }, required: true },
        ],
      },
      {
        id: "mandatory",
        title: { ar: "بيانات الوكيل", fr: "Informations du Mandataire", en: "Mandatory Information" },
        fields: [
          { name: "mandatoryName",    type: "text",  label: { ar: "اسم الوكيل", fr: "Nom du mandataire", en: "Mandatory's name" }, required: true, half: true },
          { name: "mandatoryId",      type: "text",  label: { ar: "رقم البطاقة الوطنية", fr: "N° CIN", en: "ID Number" }, required: true, half: true },
          { name: "mandatoryAddress", type: "text",  label: { ar: "العنوان", fr: "Adresse", en: "Address" }, required: true },
        ],
      },
      {
        id: "details",
        title: { ar: "تفاصيل التوكيل", fr: "Détails de la Procuration", en: "Proxy Details" },
        fields: [
          { name: "purposeOfProxy",  type: "textarea", label: { ar: "الغرض من التوكيل", fr: "Objet de la procuration", en: "Purpose of proxy" }, required: true },
          { name: "specificPowers",  type: "array",    label: { ar: "الصلاحيات", fr: "Pouvoirs spécifiques", en: "Specific powers" }, arrayItemLabel: { ar: "صلاحية", fr: "Pouvoir", en: "Power" }, arrayMin: 1, arrayMax: 10 },
          { name: "validityPeriod",  type: "text",     label: { ar: "مدة الصلاحية", fr: "Durée de validité", en: "Validity period" }, placeholder: { ar: "سنة واحدة", fr: "Un an", en: "One year" }, half: true },
          { name: "city",            type: "city",     label: { ar: "المدينة", fr: "Ville", en: "City" }, required: true, half: true },
          { name: "notaryCity",      type: "city",     label: { ar: "مدينة التوثيق", fr: "Ville du notaire", en: "Notary city" }, half: true },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────
  // 4. DIVORCE PETITION
  // ───────────────────────────────────────────────────────────────
  {
    id: "divorce-petition",
    slug: "divorce-petition",
    category: "family",
    serviceType: "guide",
    icon: "💔",
    title: { ar: "طلب تطليق", fr: "Demande de Divorce", en: "Divorce Petition" },
    description: { ar: "طلب التطليق القضائي وفق مدونة الأسرة المغربية", fr: "Requête de divorce judiciaire selon le Code de la famille", en: "Judicial divorce petition per Moroccan Family Code" },
    legalBasis: "Moudawana Art. 78-93",
    steps: [
      {
        id: "petitioner",
        title: { ar: "بيانات مقدم الطلب", fr: "Informations du Demandeur", en: "Petitioner Information" },
        fields: [
          { name: "petitionerName",    type: "text",  label: { ar: "الاسم الكامل", fr: "Nom complet", en: "Full name" }, required: true, half: true },
          { name: "petitionerId",      type: "text",  label: { ar: "رقم البطاقة الوطنية", fr: "N° CIN", en: "ID Number" }, required: true, half: true },
          { name: "petitionerAddress", type: "text",  label: { ar: "العنوان", fr: "Adresse", en: "Address" }, required: true },
          { name: "city",              type: "city",  label: { ar: "المدينة", fr: "Ville", en: "City" }, required: true, half: true },
        ],
      },
      {
        id: "respondent",
        title: { ar: "بيانات المدعى عليه", fr: "Informations du Défendeur", en: "Respondent Information" },
        fields: [
          { name: "respondentName",    type: "text",  label: { ar: "اسم المدعى عليه", fr: "Nom du défendeur", en: "Respondent's name" }, required: true, half: true },
          { name: "respondentId",      type: "text",  label: { ar: "رقم البطاقة الوطنية", fr: "N° CIN du défendeur", en: "Respondent's ID" }, half: true },
          { name: "respondentAddress", type: "text",  label: { ar: "العنوان", fr: "Adresse du défendeur", en: "Respondent's address" }, required: true },
        ],
      },
      {
        id: "marriage",
        title: { ar: "بيانات الزواج", fr: "Informations du Mariage", en: "Marriage Information" },
        fields: [
          { name: "marriageDate",       type: "date",   label: { ar: "تاريخ الزواج", fr: "Date du mariage", en: "Marriage date" }, required: true, half: true },
          { name: "marriageCity",       type: "city",   label: { ar: "مدينة الزواج", fr: "Ville du mariage", en: "Marriage city" }, half: true },
          { name: "marriageCertNumber", type: "text",   label: { ar: "رقم عقد الزواج", fr: "N° acte de mariage", en: "Marriage cert. number" }, required: true, half: true },
          { name: "childrenCount",      type: "number", label: { ar: "عدد الأطفال", fr: "Nombre d'enfants", en: "Number of children" }, half: true },
          { name: "childrenDetails",    type: "array",  label: { ar: "أسماء الأطفال وأعمارهم", fr: "Noms et âges des enfants", en: "Children names & ages" }, arrayItemLabel: { ar: "طفل (الاسم، العمر)", fr: "Enfant (nom, âge)", en: "Child (name, age)" }, arrayMin: 0, arrayMax: 10 },
        ],
      },
      {
        id: "details",
        title: { ar: "تفاصيل الطلب", fr: "Détails de la Demande", en: "Request Details" },
        fields: [
          { name: "divorceGrounds",   type: "select",   label: { ar: "سبب التطليق", fr: "Motif du divorce", en: "Grounds for divorce" }, options: divorceGroundsOptions, required: true },
          { name: "requestedCustody", type: "text",     label: { ar: "الحضانة المطلوبة", fr: "Garde demandée", en: "Requested custody" }, placeholder: { ar: "حضانة الأطفال", fr: "Garde des enfants", en: "Children custody" } },
          { name: "requestedAlimony", type: "number",   label: { ar: "النفقة المطلوبة (درهم)", fr: "Pension demandée (MAD)", en: "Requested alimony (MAD)" }, half: true },
          { name: "court",            type: "court",    label: { ar: "المحكمة", fr: "Tribunal", en: "Court" }, required: true, half: true },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────
  // 5. CRIMINAL COMPLAINT
  // ───────────────────────────────────────────────────────────────
  {
    id: "criminal-complaint",
    slug: "criminal-complaint",
    category: "criminal",
    serviceType: "guide",
    icon: "⚖️",
    title: { ar: "شكاية جنائية", fr: "Plainte Pénale", en: "Criminal Complaint" },
    description: { ar: "تقديم شكاية جنائية لدى النيابة العامة أو الشرطة", fr: "Déposer une plainte pénale auprès du parquet ou de la police", en: "File a criminal complaint with the prosecutor or police" },
    legalBasis: "Code Pénal / CPC Art. 40",
    steps: [
      {
        id: "plaintiff",
        title: { ar: "بيانات المشتكي", fr: "Informations du Plaignant", en: "Plaintiff Information" },
        fields: [
          { name: "plaintiffName",    type: "text",  label: { ar: "الاسم الكامل", fr: "Nom complet", en: "Full name" }, required: true, half: true },
          { name: "plaintiffId",      type: "text",  label: { ar: "رقم البطاقة الوطنية", fr: "N° CIN", en: "ID Number" }, required: true, half: true },
          { name: "plaintiffAddress", type: "text",  label: { ar: "العنوان", fr: "Adresse", en: "Address" }, required: true },
          { name: "plaintiffPhone",   type: "text",  label: { ar: "رقم الهاتف", fr: "Téléphone", en: "Phone" }, half: true },
          { name: "city",             type: "city",  label: { ar: "المدينة", fr: "Ville", en: "City" }, required: true, half: true },
        ],
      },
      {
        id: "accused",
        title: { ar: "بيانات المشتكى به", fr: "Informations de l'Accusé", en: "Accused Information" },
        description: { ar: "اختياري إذا كان المتهم مجهولاً", fr: "Optionnel si l'accusé est inconnu", en: "Optional if the accused is unknown" },
        fields: [
          { name: "accusedName",    type: "text",  label: { ar: "اسم المشتكى به", fr: "Nom de l'accusé", en: "Accused's name" } },
          { name: "accusedAddress", type: "text",  label: { ar: "عنوان المشتكى به", fr: "Adresse de l'accusé", en: "Accused's address" } },
        ],
      },
      {
        id: "incident",
        title: { ar: "تفاصيل الواقعة", fr: "Détails de l'Incident", en: "Incident Details" },
        fields: [
          { name: "incidentDate",        type: "date",     label: { ar: "تاريخ الواقعة", fr: "Date de l'incident", en: "Incident date" }, required: true, half: true },
          { name: "incidentLocation",    type: "text",     label: { ar: "مكان الواقعة", fr: "Lieu de l'incident", en: "Incident location" }, required: true, half: true },
          { name: "incidentDescription", type: "textarea", label: { ar: "وصف الواقعة", fr: "Description de l'incident", en: "Description of the incident" }, required: true },
          { name: "evidenceDescription", type: "textarea", label: { ar: "وصف الأدلة", fr: "Description des preuves", en: "Evidence description" } },
          { name: "witnessNames",        type: "array",    label: { ar: "أسماء الشهود", fr: "Noms des témoins", en: "Witness names" }, arrayItemLabel: { ar: "اسم الشاهد", fr: "Nom du témoin", en: "Witness name" }, arrayMin: 0, arrayMax: 5 },
        ],
      },
      {
        id: "request",
        title: { ar: "الطلبات", fr: "Demandes", en: "Requests" },
        fields: [
          { name: "damageDescription", type: "textarea", label: { ar: "وصف الأضرار", fr: "Description des dommages", en: "Damage description" } },
          { name: "requestedAction",   type: "textarea", label: { ar: "الإجراء المطلوب", fr: "Action demandée", en: "Requested action" }, required: true },
          { name: "policeStation",     type: "text",     label: { ar: "مركز الشرطة", fr: "Commissariat de police", en: "Police station" }, half: true },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────
  // 6. ALIMONY REQUEST
  // ───────────────────────────────────────────────────────────────
  {
    id: "alimony-request",
    slug: "alimony-request",
    category: "family",
    serviceType: "guide",
    icon: "💰",
    title: { ar: "طلب نفقة", fr: "Demande de Pension Alimentaire", en: "Alimony Request" },
    description: { ar: "طلب النفقة وفق مدونة الأسرة", fr: "Demande de pension alimentaire selon le Code de la famille", en: "Alimony request per Family Code" },
    legalBasis: "Moudawana Art. 187-205",
    steps: [
      {
        id: "petitioner",
        title: { ar: "بيانات مقدم الطلب", fr: "Informations du Demandeur", en: "Petitioner Information" },
        fields: [
          { name: "petitionerName",    type: "text",  label: { ar: "الاسم الكامل", fr: "Nom complet", en: "Full name" }, required: true, half: true },
          { name: "petitionerId",      type: "text",  label: { ar: "رقم البطاقة الوطنية", fr: "N° CIN", en: "ID Number" }, required: true, half: true },
          { name: "petitionerAddress", type: "text",  label: { ar: "العنوان", fr: "Adresse", en: "Address" }, required: true },
          { name: "city",              type: "city",  label: { ar: "المدينة", fr: "Ville", en: "City" }, required: true, half: true },
        ],
      },
      {
        id: "respondent",
        title: { ar: "بيانات المدعى عليه", fr: "Informations du Défendeur", en: "Respondent Information" },
        fields: [
          { name: "respondentName",    type: "text",  label: { ar: "اسم المدعى عليه", fr: "Nom du défendeur", en: "Respondent's name" }, required: true, half: true },
          { name: "respondentId",      type: "text",  label: { ar: "رقم البطاقة الوطنية", fr: "N° CIN du défendeur", en: "Respondent's ID" }, half: true },
          { name: "respondentAddress", type: "text",  label: { ar: "العنوان", fr: "Adresse du défendeur", en: "Respondent's address" }, required: true },
        ],
      },
      {
        id: "details",
        title: { ar: "تفاصيل الطلب", fr: "Détails de la Demande", en: "Request Details" },
        fields: [
          { name: "relationshipType",  type: "select", label: { ar: "صلة القرابة", fr: "Lien de parenté", en: "Relationship" }, options: relationshipOptions, required: true, half: true },
          { name: "childrenNames",     type: "array",  label: { ar: "أسماء الأطفال", fr: "Noms des enfants", en: "Children's names" }, arrayItemLabel: { ar: "اسم الطفل", fr: "Nom de l'enfant", en: "Child's name" }, arrayMin: 0, arrayMax: 10 },
          { name: "childrenAges",      type: "array",  label: { ar: "أعمار الأطفال", fr: "Âges des enfants", en: "Children's ages" }, arrayItemLabel: { ar: "عمر الطفل", fr: "Âge de l'enfant", en: "Child's age" }, arrayMin: 0, arrayMax: 10 },
          { name: "currentIncome",     type: "number", label: { ar: "الدخل الحالي (درهم)", fr: "Revenu actuel (MAD)", en: "Current income (MAD)" }, half: true },
          { name: "requestedAmount",   type: "number", label: { ar: "المبلغ المطلوب (درهم)", fr: "Montant demandé (MAD)", en: "Requested amount (MAD)" }, required: true, half: true },
          { name: "justification",     type: "textarea", label: { ar: "المبررات", fr: "Justification", en: "Justification" }, required: true },
          { name: "court",             type: "court",  label: { ar: "المحكمة", fr: "Tribunal", en: "Court" }, required: true, half: true },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────
  // 7. SALE CONTRACT
  // ───────────────────────────────────────────────────────────────
  {
    id: "sale-contract",
    slug: "sale-contract",
    category: "commercial",
    serviceType: "form",
    icon: "🏗️",
    title: { ar: "عقد البيع", fr: "Contrat de Vente", en: "Sale Contract" },
    description: { ar: "عقد بيع عقار أو ملكية وفق القانون المغربي", fr: "Contrat de vente immobilière conforme au droit marocain", en: "Property or real-estate sale contract per Moroccan law" },
    legalBasis: "DOC Art. 478-618",
    steps: [
      {
        id: "seller",
        title: { ar: "بيانات البائع", fr: "Informations du Vendeur", en: "Seller Information" },
        fields: [
          { name: "sellerName",    type: "text",  label: { ar: "اسم البائع", fr: "Nom du vendeur", en: "Seller's name" }, required: true, half: true },
          { name: "sellerId",      type: "text",  label: { ar: "رقم البطاقة الوطنية", fr: "N° CIN", en: "ID Number" }, required: true, half: true },
          { name: "sellerAddress", type: "text",  label: { ar: "العنوان", fr: "Adresse", en: "Address" }, required: true },
        ],
      },
      {
        id: "buyer",
        title: { ar: "بيانات المشتري", fr: "Informations de l'Acheteur", en: "Buyer Information" },
        fields: [
          { name: "buyerName",    type: "text",  label: { ar: "اسم المشتري", fr: "Nom de l'acheteur", en: "Buyer's name" }, required: true, half: true },
          { name: "buyerId",      type: "text",  label: { ar: "رقم البطاقة الوطنية", fr: "N° CIN", en: "ID Number" }, required: true, half: true },
          { name: "buyerAddress", type: "text",  label: { ar: "العنوان", fr: "Adresse", en: "Address" }, required: true },
        ],
      },
      {
        id: "property",
        title: { ar: "بيانات العقار", fr: "Informations du Bien", en: "Property Information" },
        fields: [
          { name: "propertyDescription",     type: "textarea", label: { ar: "وصف العقار", fr: "Description du bien", en: "Property description" }, required: true },
          { name: "propertyAddress",         type: "text",     label: { ar: "عنوان العقار", fr: "Adresse du bien", en: "Property address" }, required: true },
          { name: "propertyRegistrationNum", type: "text",     label: { ar: "رقم الرسم العقاري", fr: "N° titre foncier", en: "Property reg. number" }, half: true },
          { name: "propertyType",            type: "select",   label: { ar: "نوع العقار", fr: "Type de bien", en: "Property type" }, options: propertyTypeOptions, half: true },
        ],
      },
      {
        id: "terms",
        title: { ar: "شروط البيع", fr: "Conditions de Vente", en: "Sale Terms" },
        fields: [
          { name: "salePrice",       type: "number", label: { ar: "ثمن البيع (درهم)", fr: "Prix de vente (MAD)", en: "Sale price (MAD)" }, required: true, half: true },
          { name: "paymentMethod",   type: "select", label: { ar: "طريقة الأداء", fr: "Mode de paiement", en: "Payment method" }, options: paymentMethodOptions, required: true, half: true },
          { name: "paymentSchedule", type: "text",   label: { ar: "جدول الأداء", fr: "Échéancier de paiement", en: "Payment schedule" }, placeholder: { ar: "دفعة واحدة", fr: "Paiement unique", en: "Single payment" } },
          { name: "handoverDate",    type: "date",   label: { ar: "تاريخ التسليم", fr: "Date de remise", en: "Handover date" }, half: true },
          { name: "city",            type: "city",   label: { ar: "المدينة", fr: "Ville", en: "City" }, required: true, half: true },
          { name: "notaryCity",      type: "city",   label: { ar: "مدينة التوثيق", fr: "Ville du notaire", en: "Notary city" }, half: true },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────
  // 8. CUSTOMARY MARRIAGE (FATIHA)
  // ───────────────────────────────────────────────────────────────
  {
    id: "marriage-fatiha",
    slug: "marriage-fatiha",
    category: "family",
    serviceType: "guide",
    icon: "💍",
    title: { ar: "طلب إثبات الزواج (الفاتحة)", fr: "Demande de Mariage Coutumier", en: "Customary Marriage (Fatiha)" },
    description: { ar: "طلب إثبات زواج تم بالطريقة التقليدية (الفاتحة)", fr: "Demande de reconnaissance de mariage coutumier (Fatiha)", en: "Request for recognition of customary marriage" },
    legalBasis: "Moudawana Art. 16",
    steps: [
      {
        id: "husband",
        title: { ar: "بيانات الزوج", fr: "Informations du Mari", en: "Husband Information" },
        fields: [
          { name: "husbandName",    type: "text",  label: { ar: "اسم الزوج", fr: "Nom du mari", en: "Husband's name" }, required: true, half: true },
          { name: "husbandId",      type: "text",  label: { ar: "رقم البطاقة الوطنية", fr: "N° CIN", en: "ID Number" }, required: true, half: true },
          { name: "husbandDOB",     type: "date",  label: { ar: "تاريخ الازدياد", fr: "Date de naissance", en: "Date of birth" }, half: true },
          { name: "husbandAddress", type: "text",  label: { ar: "العنوان", fr: "Adresse", en: "Address" }, required: true },
        ],
      },
      {
        id: "wife",
        title: { ar: "بيانات الزوجة", fr: "Informations de l'Épouse", en: "Wife Information" },
        fields: [
          { name: "wifeName",    type: "text",  label: { ar: "اسم الزوجة", fr: "Nom de l'épouse", en: "Wife's name" }, required: true, half: true },
          { name: "wifeId",      type: "text",  label: { ar: "رقم البطاقة الوطنية", fr: "N° CIN", en: "ID Number" }, required: true, half: true },
          { name: "wifeDOB",     type: "date",  label: { ar: "تاريخ الازدياد", fr: "Date de naissance", en: "Date of birth" }, half: true },
          { name: "wifeAddress", type: "text",  label: { ar: "العنوان", fr: "Adresse", en: "Address" }, required: true },
        ],
      },
      {
        id: "details",
        title: { ar: "تفاصيل الزواج", fr: "Détails du Mariage", en: "Marriage Details" },
        fields: [
          { name: "marriageDate",  type: "date",  label: { ar: "تاريخ الزواج", fr: "Date du mariage", en: "Marriage date" }, required: true, half: true },
          { name: "marriageCity",  type: "city",  label: { ar: "مدينة الزواج", fr: "Ville du mariage", en: "Marriage city" }, required: true, half: true },
          { name: "maazounName",   type: "text",  label: { ar: "اسم المأذون", fr: "Nom du Maazoune", en: "Maazoune's name" }, half: true },
          { name: "court",         type: "court", label: { ar: "المحكمة", fr: "Tribunal", en: "Court" }, required: true, half: true },
        ],
      },
      {
        id: "witnesses",
        title: { ar: "الشهود", fr: "Témoins", en: "Witnesses" },
        fields: [
          { name: "witnessNames", type: "array", label: { ar: "أسماء الشهود", fr: "Noms des témoins", en: "Witness names" }, arrayItemLabel: { ar: "اسم الشاهد", fr: "Nom du témoin", en: "Witness name" }, arrayMin: 2, arrayMax: 4, required: true },
          { name: "witnessIds",   type: "array", label: { ar: "أرقام بطائق الشهود", fr: "N° CIN des témoins", en: "Witness ID numbers" }, arrayItemLabel: { ar: "رقم البطاقة", fr: "N° CIN", en: "ID number" }, arrayMin: 2, arrayMax: 4 },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────
  // 9. FORMAL DEMAND LETTER (Mise en Demeure)
  // ───────────────────────────────────────────────────────────────
  {
    id: "formal-demand",
    slug: "formal-demand",
    category: "civil",
    serviceType: "form",
    icon: "📨",
    title: { ar: "إنذار بالأداء", fr: "Mise en Demeure", en: "Formal Demand Letter" },
    description: { ar: "إنذار رسمي قبل اللجوء إلى القضاء", fr: "Lettre de mise en demeure avant action judiciaire", en: "Formal demand letter before legal proceedings" },
    legalBasis: "DOC Art. 254-255",
    steps: [
      {
        id: "sender",
        title: { ar: "بيانات المرسل", fr: "Informations de l'Expéditeur", en: "Sender Information" },
        fields: [
          { name: "senderName",    type: "text",  label: { ar: "الاسم الكامل", fr: "Nom complet", en: "Full name" }, required: true, half: true },
          { name: "senderId",      type: "text",  label: { ar: "رقم البطاقة الوطنية", fr: "N° CIN", en: "ID Number" }, required: true, half: true },
          { name: "senderAddress", type: "text",  label: { ar: "العنوان", fr: "Adresse", en: "Address" }, required: true },
          { name: "senderPhone",   type: "text",  label: { ar: "رقم الهاتف", fr: "Téléphone", en: "Phone" }, half: true },
          { name: "city",          type: "city",  label: { ar: "المدينة", fr: "Ville", en: "City" }, required: true, half: true },
        ],
      },
      {
        id: "recipient",
        title: { ar: "بيانات المرسل إليه", fr: "Informations du Destinataire", en: "Recipient Information" },
        fields: [
          { name: "recipientName",    type: "text",  label: { ar: "اسم المرسل إليه", fr: "Nom du destinataire", en: "Recipient's name" }, required: true },
          { name: "recipientAddress", type: "text",  label: { ar: "عنوان المرسل إليه", fr: "Adresse du destinataire", en: "Recipient's address" }, required: true },
        ],
      },
      {
        id: "details",
        title: { ar: "تفاصيل الإنذار", fr: "Détails de la Mise en Demeure", en: "Demand Details" },
        fields: [
          { name: "demandAmount",      type: "number",   label: { ar: "المبلغ المطلوب (درهم)", fr: "Montant demandé (MAD)", en: "Amount demanded (MAD)" }, half: true },
          { name: "demandReason",      type: "textarea", label: { ar: "سبب الإنذار", fr: "Motif de la mise en demeure", en: "Reason for demand" }, required: true },
          { name: "deadlineDays",      type: "number",   label: { ar: "مهلة الامتثال (أيام)", fr: "Délai de conformité (jours)", en: "Compliance deadline (days)" }, required: true, half: true },
          { name: "consequenceIfIgnored", type: "textarea", label: { ar: "الإجراءات في حالة عدم الاستجابة", fr: "Conséquences en cas de non-conformité", en: "Consequences if ignored" } },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────
  // 10. RESIDENCE CERTIFICATE REQUEST
  // ───────────────────────────────────────────────────────────────
  {
    id: "residence-certificate",
    slug: "residence-certificate",
    category: "administrative",
    serviceType: "guide",
    icon: "🏛️",
    title: { ar: "شهادة السكنى", fr: "Certificat de Résidence", en: "Residence Certificate" },
    description: { ar: "طلب شهادة السكنى من السلطات المحلية", fr: "Demande de certificat de résidence auprès des autorités locales", en: "Request for residence certificate from local authorities" },
    legalBasis: "Dahir du 29/02/1956",
    steps: [
      {
        id: "applicant",
        title: { ar: "بيانات مقدم الطلب", fr: "Informations du Demandeur", en: "Applicant Information" },
        fields: [
          { name: "fullName",      type: "text",  label: { ar: "الاسم الكامل", fr: "Nom complet", en: "Full name" }, required: true, half: true },
          { name: "idNumber",      type: "text",  label: { ar: "رقم البطاقة الوطنية", fr: "N° CIN", en: "ID Number" }, required: true, half: true },
          { name: "dateOfBirth",   type: "date",  label: { ar: "تاريخ الازدياد", fr: "Date de naissance", en: "Date of birth" }, half: true },
          { name: "nationality",   type: "text",  label: { ar: "الجنسية", fr: "Nationalité", en: "Nationality" }, placeholder: { ar: "مغربية", fr: "Marocaine", en: "Moroccan" }, half: true },
          { name: "currentAddress", type: "text", label: { ar: "العنوان الحالي", fr: "Adresse actuelle", en: "Current address" }, required: true },
          { name: "city",          type: "city",  label: { ar: "المدينة", fr: "Ville", en: "City" }, required: true, half: true },
          { name: "residenceSince", type: "date", label: { ar: "مقيم منذ", fr: "Résident depuis", en: "Resident since" }, half: true },
        ],
      },
      {
        id: "purpose",
        title: { ar: "الغرض من الطلب", fr: "Objet de la Demande", en: "Purpose of Request" },
        fields: [
          { name: "purpose",       type: "textarea", label: { ar: "الغرض من الشهادة", fr: "Objet du certificat", en: "Purpose of the certificate" }, required: true },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────
  // 11. ADMINISTRATIVE COMPLAINT
  // ───────────────────────────────────────────────────────────────
  {
    id: "admin-complaint",
    slug: "admin-complaint",
    category: "administrative",
    serviceType: "guide",
    icon: "📋",
    title: { ar: "شكوى إدارية", fr: "Recours Administratif", en: "Administrative Complaint" },
    description: { ar: "تقديم شكوى أو تظلم إداري ضد جهة حكومية", fr: "Recours gracieux ou hiérarchique contre une administration", en: "Administrative complaint against a government body" },
    legalBasis: "Loi 41-90",
    steps: [
      {
        id: "complainant",
        title: { ar: "بيانات المشتكي", fr: "Informations du Requérant", en: "Complainant Information" },
        fields: [
          { name: "fullName",  type: "text",  label: { ar: "الاسم الكامل", fr: "Nom complet", en: "Full name" }, required: true, half: true },
          { name: "idNumber",  type: "text",  label: { ar: "رقم البطاقة الوطنية", fr: "N° CIN", en: "ID Number" }, required: true, half: true },
          { name: "address",   type: "text",  label: { ar: "العنوان", fr: "Adresse", en: "Address" }, required: true },
          { name: "phone",     type: "text",  label: { ar: "رقم الهاتف", fr: "Téléphone", en: "Phone" }, half: true },
          { name: "city",      type: "city",  label: { ar: "المدينة", fr: "Ville", en: "City" }, required: true, half: true },
        ],
      },
      {
        id: "administration",
        title: { ar: "الجهة الإدارية المعنية", fr: "Administration Concernée", en: "Concerned Administration" },
        fields: [
          { name: "adminBody",     type: "text", label: { ar: "اسم الجهة الإدارية", fr: "Nom de l'administration", en: "Administration name" }, required: true },
          { name: "adminAddress",  type: "text", label: { ar: "عنوان الجهة", fr: "Adresse de l'administration", en: "Administration address" } },
          { name: "decisionRef",   type: "text", label: { ar: "مرجع القرار المطعون فيه", fr: "Référence de la décision contestée", en: "Reference of contested decision" }, half: true },
          { name: "decisionDate",  type: "date", label: { ar: "تاريخ القرار", fr: "Date de la décision", en: "Decision date" }, half: true },
        ],
      },
      {
        id: "details",
        title: { ar: "تفاصيل الشكوى", fr: "Détails du Recours", en: "Complaint Details" },
        fields: [
          { name: "complaintDescription", type: "textarea", label: { ar: "موضوع الشكوى", fr: "Objet du recours", en: "Subject of complaint" }, required: true },
          { name: "requestedRemedy",      type: "textarea", label: { ar: "الإجراء المطلوب", fr: "Mesure demandée", en: "Requested remedy" }, required: true },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // CATEGORY A — NEW SAFE FORMS (private agreements)
  // ═══════════════════════════════════════════════════════════════

  // 12. RENT RECEIPT
  {
    id: "rent-receipt",
    slug: "rent-receipt",
    category: "civil",
    serviceType: "form",
    icon: "🧾",
    title: { ar: "وصل الإيجار", fr: "Quittance de Loyer", en: "Rent Receipt" },
    description: { ar: "وصل شهري لإثبات دفع الإيجار", fr: "Reçu mensuel de paiement du loyer", en: "Monthly rent payment receipt" },
    legalBasis: "Loi 67.12",
    steps: [
      {
        id: "parties",
        title: { ar: "الأطراف", fr: "Parties", en: "Parties" },
        fields: [
          { name: "landlordName", type: "text", label: { ar: "اسم المؤجر", fr: "Nom du bailleur", en: "Landlord's name" }, required: true, half: true },
          { name: "tenantName",   type: "text", label: { ar: "اسم المستأجر", fr: "Nom du locataire", en: "Tenant's name" }, required: true, half: true },
          { name: "propertyAddress", type: "text", label: { ar: "عنوان العقار", fr: "Adresse du bien", en: "Property address" }, required: true },
        ],
      },
      {
        id: "payment",
        title: { ar: "تفاصيل الأداء", fr: "Détails du Paiement", en: "Payment Details" },
        fields: [
          { name: "rentAmount",   type: "number", label: { ar: "مبلغ الإيجار (درهم)", fr: "Montant du loyer (MAD)", en: "Rent amount (MAD)" }, required: true, half: true },
          { name: "paymentMonth", type: "text",   label: { ar: "شهر الأداء", fr: "Mois de paiement", en: "Payment month" }, placeholder: { ar: "يناير 2025", fr: "Janvier 2025", en: "January 2025" }, required: true, half: true },
          { name: "paymentDate",  type: "date",   label: { ar: "تاريخ الأداء", fr: "Date de paiement", en: "Payment date" }, required: true, half: true },
          { name: "paymentMethod",type: "select", label: { ar: "طريقة الأداء", fr: "Mode de paiement", en: "Payment method" }, options: paymentMethodOptions, half: true },
          { name: "city",         type: "city",   label: { ar: "المدينة", fr: "Ville", en: "City" }, required: true, half: true },
        ],
      },
    ],
  },

  // 13. LOAN AGREEMENT
  {
    id: "loan-agreement",
    slug: "loan-agreement",
    category: "civil",
    serviceType: "form",
    icon: "🤝",
    title: { ar: "عقد قرض بين أفراد", fr: "Contrat de Prêt entre Particuliers", en: "Personal Loan Agreement" },
    description: { ar: "اتفاقية قرض خاصة بين أفراد", fr: "Contrat de prêt d'argent entre particuliers", en: "Private money loan agreement between individuals" },
    legalBasis: "DOC Art. 856-878",
    steps: [
      {
        id: "lender",
        title: { ar: "بيانات المقرض", fr: "Informations du Prêteur", en: "Lender Information" },
        fields: [
          { name: "lenderName",    type: "text", label: { ar: "اسم المقرض", fr: "Nom du prêteur", en: "Lender's name" }, required: true, half: true },
          { name: "lenderId",      type: "text", label: { ar: "رقم البطاقة الوطنية", fr: "N° CIN", en: "ID Number" }, required: true, half: true },
          { name: "lenderAddress", type: "text", label: { ar: "العنوان", fr: "Adresse", en: "Address" }, required: true },
        ],
      },
      {
        id: "borrower",
        title: { ar: "بيانات المقترض", fr: "Informations de l'Emprunteur", en: "Borrower Information" },
        fields: [
          { name: "borrowerName",    type: "text", label: { ar: "اسم المقترض", fr: "Nom de l'emprunteur", en: "Borrower's name" }, required: true, half: true },
          { name: "borrowerId",      type: "text", label: { ar: "رقم البطاقة الوطنية", fr: "N° CIN", en: "ID Number" }, required: true, half: true },
          { name: "borrowerAddress", type: "text", label: { ar: "العنوان", fr: "Adresse", en: "Address" }, required: true },
        ],
      },
      {
        id: "terms",
        title: { ar: "شروط القرض", fr: "Conditions du Prêt", en: "Loan Terms" },
        fields: [
          { name: "loanAmount",      type: "number", label: { ar: "مبلغ القرض (درهم)", fr: "Montant du prêt (MAD)", en: "Loan amount (MAD)" }, required: true, half: true },
          { name: "repaymentDate",   type: "date",   label: { ar: "تاريخ السداد", fr: "Date de remboursement", en: "Repayment date" }, required: true, half: true },
          { name: "interestRate",    type: "text",   label: { ar: "نسبة الفائدة", fr: "Taux d'intérêt", en: "Interest rate" }, placeholder: { ar: "0% (بدون فائدة)", fr: "0% (sans intérêt)", en: "0% (interest-free)" }, half: true },
          { name: "paymentMethod",   type: "select", label: { ar: "طريقة الأداء", fr: "Mode de paiement", en: "Payment method" }, options: paymentMethodOptions, half: true },
          { name: "city",            type: "city",   label: { ar: "المدينة", fr: "Ville", en: "City" }, required: true, half: true },
        ],
      },
    ],
  },

  // 14. DEBT ACKNOWLEDGMENT
  {
    id: "debt-acknowledgment",
    slug: "debt-acknowledgment",
    category: "civil",
    serviceType: "form",
    icon: "📋",
    title: { ar: "اعتراف بالدين", fr: "Reconnaissance de Dette", en: "Debt Acknowledgment" },
    description: { ar: "وثيقة اعتراف بدين مالي", fr: "Document de reconnaissance de dette", en: "Written acknowledgment of financial debt" },
    legalBasis: "DOC Art. 443",
    steps: [
      {
        id: "debtor",
        title: { ar: "بيانات المدين", fr: "Informations du Débiteur", en: "Debtor Information" },
        fields: [
          { name: "debtorName",    type: "text", label: { ar: "الاسم الكامل", fr: "Nom complet", en: "Full name" }, required: true, half: true },
          { name: "debtorId",      type: "text", label: { ar: "رقم البطاقة الوطنية", fr: "N° CIN", en: "ID Number" }, required: true, half: true },
          { name: "debtorAddress", type: "text", label: { ar: "العنوان", fr: "Adresse", en: "Address" }, required: true },
        ],
      },
      {
        id: "creditor",
        title: { ar: "بيانات الدائن", fr: "Informations du Créancier", en: "Creditor Information" },
        fields: [
          { name: "creditorName",    type: "text", label: { ar: "اسم الدائن", fr: "Nom du créancier", en: "Creditor's name" }, required: true, half: true },
          { name: "creditorId",      type: "text", label: { ar: "رقم البطاقة الوطنية", fr: "N° CIN", en: "ID Number" }, required: true, half: true },
        ],
      },
      {
        id: "details",
        title: { ar: "تفاصيل الدين", fr: "Détails de la Dette", en: "Debt Details" },
        fields: [
          { name: "debtAmount",    type: "number",   label: { ar: "مبلغ الدين (درهم)", fr: "Montant de la dette (MAD)", en: "Debt amount (MAD)" }, required: true, half: true },
          { name: "debtReason",    type: "textarea", label: { ar: "سبب الدين", fr: "Motif de la dette", en: "Reason for debt" }, required: true },
          { name: "repaymentDate", type: "date",     label: { ar: "تاريخ السداد المتفق عليه", fr: "Date de remboursement convenue", en: "Agreed repayment date" }, half: true },
          { name: "city",          type: "city",     label: { ar: "المدينة", fr: "Ville", en: "City" }, required: true, half: true },
        ],
      },
    ],
  },

  // 15. VEHICLE SALE
  {
    id: "vehicle-sale",
    slug: "vehicle-sale",
    category: "commercial",
    serviceType: "form",
    icon: "🚗",
    title: { ar: "عقد بيع سيارة", fr: "Contrat de Vente de Véhicule", en: "Vehicle Sale Contract" },
    description: { ar: "عقد بيع سيارة أو مركبة بين أفراد", fr: "Contrat de vente de véhicule entre particuliers", en: "Vehicle sale contract between individuals" },
    legalBasis: "DOC Art. 478-618",
    steps: [
      {
        id: "seller",
        title: { ar: "بيانات البائع", fr: "Informations du Vendeur", en: "Seller Information" },
        fields: [
          { name: "sellerName",    type: "text", label: { ar: "اسم البائع", fr: "Nom du vendeur", en: "Seller's name" }, required: true, half: true },
          { name: "sellerId",      type: "text", label: { ar: "رقم البطاقة الوطنية", fr: "N° CIN", en: "ID Number" }, required: true, half: true },
          { name: "sellerAddress", type: "text", label: { ar: "العنوان", fr: "Adresse", en: "Address" }, required: true },
        ],
      },
      {
        id: "buyer",
        title: { ar: "بيانات المشتري", fr: "Informations de l'Acheteur", en: "Buyer Information" },
        fields: [
          { name: "buyerName",    type: "text", label: { ar: "اسم المشتري", fr: "Nom de l'acheteur", en: "Buyer's name" }, required: true, half: true },
          { name: "buyerId",      type: "text", label: { ar: "رقم البطاقة الوطنية", fr: "N° CIN", en: "ID Number" }, required: true, half: true },
          { name: "buyerAddress", type: "text", label: { ar: "العنوان", fr: "Adresse", en: "Address" }, required: true },
        ],
      },
      {
        id: "vehicle",
        title: { ar: "بيانات المركبة", fr: "Informations du Véhicule", en: "Vehicle Information" },
        fields: [
          { name: "vehicleBrand", type: "text", label: { ar: "الماركة والنوع", fr: "Marque et modèle", en: "Make and model" }, required: true, half: true },
          { name: "vehicleYear",  type: "text", label: { ar: "سنة الصنع", fr: "Année", en: "Year" }, half: true },
          { name: "vehiclePlate", type: "text", label: { ar: "رقم اللوحة", fr: "N° d'immatriculation", en: "License plate" }, required: true, half: true },
          { name: "vehicleVin",   type: "text", label: { ar: "رقم الهيكل", fr: "N° de châssis", en: "VIN number" }, half: true },
          { name: "vehicleKm",    type: "number", label: { ar: "عدد الكيلومترات", fr: "Kilométrage", en: "Mileage (km)" }, half: true },
        ],
      },
      {
        id: "terms",
        title: { ar: "شروط البيع", fr: "Conditions de Vente", en: "Sale Terms" },
        fields: [
          { name: "salePrice",     type: "number", label: { ar: "ثمن البيع (درهم)", fr: "Prix de vente (MAD)", en: "Sale price (MAD)" }, required: true, half: true },
          { name: "paymentMethod", type: "select", label: { ar: "طريقة الأداء", fr: "Mode de paiement", en: "Payment method" }, options: paymentMethodOptions, half: true },
          { name: "city",          type: "city",   label: { ar: "المدينة", fr: "Ville", en: "City" }, required: true, half: true },
        ],
      },
    ],
  },

  // 16. SERVICE CONTRACT
  {
    id: "service-contract",
    slug: "service-contract",
    category: "civil",
    serviceType: "form",
    icon: "💼",
    title: { ar: "عقد خدمات", fr: "Contrat de Prestation de Services", en: "Service Contract" },
    description: { ar: "عقد تقديم خدمات بين طرفين", fr: "Contrat de prestation de services entre deux parties", en: "Service agreement between two parties" },
    legalBasis: "DOC Art. 723-780",
    steps: [
      {
        id: "provider",
        title: { ar: "بيانات مقدم الخدمة", fr: "Informations du Prestataire", en: "Service Provider" },
        fields: [
          { name: "providerName",    type: "text", label: { ar: "الاسم الكامل أو اسم الشركة", fr: "Nom complet ou raison sociale", en: "Full name or company name" }, required: true },
          { name: "providerId",      type: "text", label: { ar: "رقم البطاقة / السجل التجاري", fr: "N° CIN / RC", en: "ID / Business reg. number" }, required: true, half: true },
          { name: "providerAddress", type: "text", label: { ar: "العنوان", fr: "Adresse", en: "Address" }, required: true },
        ],
      },
      {
        id: "client",
        title: { ar: "بيانات العميل", fr: "Informations du Client", en: "Client Information" },
        fields: [
          { name: "clientName",    type: "text", label: { ar: "اسم العميل", fr: "Nom du client", en: "Client's name" }, required: true, half: true },
          { name: "clientId",      type: "text", label: { ar: "رقم البطاقة الوطنية", fr: "N° CIN", en: "ID Number" }, required: true, half: true },
          { name: "clientAddress", type: "text", label: { ar: "العنوان", fr: "Adresse", en: "Address" }, required: true },
        ],
      },
      {
        id: "terms",
        title: { ar: "شروط العقد", fr: "Conditions du Contrat", en: "Contract Terms" },
        fields: [
          { name: "serviceDescription", type: "textarea", label: { ar: "وصف الخدمة", fr: "Description du service", en: "Service description" }, required: true },
          { name: "totalPrice",         type: "number",   label: { ar: "المبلغ الإجمالي (درهم)", fr: "Montant total (MAD)", en: "Total price (MAD)" }, required: true, half: true },
          { name: "startDate",          type: "date",     label: { ar: "تاريخ البداية", fr: "Date de début", en: "Start date" }, required: true, half: true },
          { name: "endDate",            type: "date",     label: { ar: "تاريخ الانتهاء", fr: "Date de fin", en: "End date" }, half: true },
          { name: "paymentMethod",      type: "select",   label: { ar: "طريقة الأداء", fr: "Mode de paiement", en: "Payment method" }, options: paymentMethodOptions, half: true },
          { name: "city",               type: "city",     label: { ar: "المدينة", fr: "Ville", en: "City" }, required: true, half: true },
        ],
      },
    ],
  },

  // 17. WORK CERTIFICATE REQUEST
  {
    id: "work-certificate",
    slug: "work-certificate",
    category: "civil",
    serviceType: "form",
    icon: "📄",
    title: { ar: "طلب شهادة العمل", fr: "Demande d'Attestation de Travail", en: "Work Certificate Request" },
    description: { ar: "طلب شهادة عمل من المشغل", fr: "Demande d'attestation de travail à l'employeur", en: "Request for work certificate from employer" },
    legalBasis: "Code du Travail Art. 72",
    steps: [
      {
        id: "employee",
        title: { ar: "بيانات الموظف", fr: "Informations de l'Employé", en: "Employee Information" },
        fields: [
          { name: "employeeName",  type: "text", label: { ar: "الاسم الكامل", fr: "Nom complet", en: "Full name" }, required: true, half: true },
          { name: "employeeId",    type: "text", label: { ar: "رقم البطاقة الوطنية", fr: "N° CIN", en: "ID Number" }, required: true, half: true },
          { name: "position",      type: "text", label: { ar: "المنصب", fr: "Poste occupé", en: "Position" }, required: true, half: true },
          { name: "startDate",     type: "date", label: { ar: "تاريخ الالتحاق", fr: "Date d'entrée", en: "Start date" }, required: true, half: true },
        ],
      },
      {
        id: "employer",
        title: { ar: "بيانات المشغل", fr: "Informations de l'Employeur", en: "Employer Information" },
        fields: [
          { name: "companyName",    type: "text", label: { ar: "اسم الشركة", fr: "Raison sociale", en: "Company name" }, required: true },
          { name: "companyAddress", type: "text", label: { ar: "عنوان الشركة", fr: "Adresse de l'entreprise", en: "Company address" }, required: true },
          { name: "city",           type: "city", label: { ar: "المدينة", fr: "Ville", en: "City" }, required: true, half: true },
        ],
      },
    ],
  },

  // 18. HANDOVER CHECKLIST
  {
    id: "handover-checklist",
    slug: "handover-checklist",
    category: "civil",
    serviceType: "form",
    icon: "📝",
    title: { ar: "محضر تسليم العقار", fr: "État des Lieux", en: "Property Handover Checklist" },
    description: { ar: "محضر تسليم أو استرجاع عقار مستأجر", fr: "État des lieux d'entrée ou de sortie", en: "Property condition report at move-in or move-out" },
    legalBasis: "Loi 67.12 Art. 8",
    steps: [
      {
        id: "parties",
        title: { ar: "الأطراف", fr: "Parties", en: "Parties" },
        fields: [
          { name: "landlordName", type: "text", label: { ar: "اسم المؤجر", fr: "Nom du bailleur", en: "Landlord's name" }, required: true, half: true },
          { name: "tenantName",   type: "text", label: { ar: "اسم المستأجر", fr: "Nom du locataire", en: "Tenant's name" }, required: true, half: true },
          { name: "propertyAddress", type: "text", label: { ar: "عنوان العقار", fr: "Adresse du bien", en: "Property address" }, required: true },
          { name: "handoverDate", type: "date", label: { ar: "تاريخ التسليم", fr: "Date de l'état", en: "Handover date" }, required: true, half: true },
          { name: "handoverType", type: "select", label: { ar: "نوع التسليم", fr: "Type d'état", en: "Handover type" }, options: [
            { value: "entry", label: { ar: "تسليم دخول", fr: "État d'entrée", en: "Move-in" } },
            { value: "exit",  label: { ar: "تسليم خروج", fr: "État de sortie", en: "Move-out" } },
          ], required: true, half: true },
        ],
      },
      {
        id: "condition",
        title: { ar: "حالة العقار", fr: "État du Bien", en: "Property Condition" },
        fields: [
          { name: "generalCondition",  type: "textarea", label: { ar: "الحالة العامة", fr: "État général", en: "General condition" }, required: true },
          { name: "meterReadings",     type: "text",     label: { ar: "قراءة العدادات (ماء/كهرباء)", fr: "Relevés compteurs (eau/élec.)", en: "Meter readings (water/elec.)" } },
          { name: "keysCount",         type: "number",   label: { ar: "عدد المفاتيح", fr: "Nombre de clés", en: "Number of keys" }, half: true },
          { name: "damages",           type: "textarea", label: { ar: "الأضرار الملاحظة", fr: "Dommages constatés", en: "Observed damages" } },
          { name: "city",              type: "city",     label: { ar: "المدينة", fr: "Ville", en: "City" }, required: true, half: true },
        ],
      },
    ],
  },
];

/** Look up a config by slug */
export function getDocumentFormConfig(slug: string): DocumentFormConfig | undefined {
  return documentFormConfigs.find((c) => c.slug === slug);
}

/** Get only fillable forms (Category A) */
export function getFormConfigs(): DocumentFormConfig[] {
  return documentFormConfigs.filter((c) => c.serviceType === "form");
}

/** Get only procedure guides (Category B) */
export function getGuideConfigs(): DocumentFormConfig[] {
  return documentFormConfigs.filter((c) => c.serviceType === "guide");
}
