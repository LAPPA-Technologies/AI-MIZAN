/**
 * All UI strings for the form generator — trilingual (ar/fr/en).
 */
import type { I18nString } from "./types";

type TranslationKey =
  | "pageTitle" | "pageSubtitle" | "disclaimer"
  | "stepOf" | "next" | "previous" | "generate" | "generating" | "generateDocument"
  | "preview" | "hidePreview" | "downloadPdf" | "downloadTxt" | "print"
  | "required" | "fillRequired" | "fieldRequired" | "validationRequired"
  | "step" | "review" | "reviewDescription"
  | "documentRef" | "generatedOn" | "pdfDisclaimer"
  | "selectDocument" | "selectDocumentDesc"
  | "backToDocuments" | "formSaved" | "autoSaved"
  | "history" | "noHistory" | "clearHistory" | "lastGenerated"
  | "exampleData" | "clearForm"
  | "legalBasis" | "category" | "filterAll"
  | "share" | "shareWhatsApp" | "copy"
  | "cityPlaceholder" | "courtPlaceholder" | "selectPlaceholder" | "selectCityFirst"
  | "addItem" | "removeItem" | "remove"
  | "reviewConfirmTitle" | "reviewConfirmDesc"
  | "pdfTitle" | "pdfSubtitle" | "pdfPage" | "pdfSignature"
  | "today" | "livePreview" | "documentGenerated" | "startForm" | "serviceCta" | "serviceCtaBody" | "paymentDayInvalid";

export const formTranslations: Record<TranslationKey, I18nString> = {
  pageTitle:           { ar: "مولّد الوثائق القانونية", fr: "Générateur de Documents Juridiques", en: "Legal Document Generator" },
  pageSubtitle:        { ar: "أنشئ وثائق قانونية مهنية جاهزة للتقديم بجميع اللغات", fr: "Créez des documents juridiques professionnels prêts à soumettre", en: "Create professional legal documents ready for submission" },
  disclaimer:          { ar: "⚠️ هذه الوثائق نموذجية فقط ولا تغني عن استشارة محامٍ مرخص. Al-Mizan غير مسؤول عن استخدام هذه النماذج.", fr: "⚠️ Ces documents sont des modèles uniquement. Consultez un avocat agréé avant toute soumission. Al-Mizan décline toute responsabilité.", en: "⚠️ These are template documents only. Consult a licensed lawyer before submission. Al-Mizan is not liable for their use." },

  stepOf:              { ar: "الخطوة {current} من {total}", fr: "Étape {current} sur {total}", en: "Step {current} of {total}" },
  next:                { ar: "التالي", fr: "Suivant", en: "Next" },
  previous:            { ar: "السابق", fr: "Précédent", en: "Previous" },
  generate:            { ar: "توليد الوثيقة PDF", fr: "Générer le document PDF", en: "Generate PDF Document" },
  generating:          { ar: "جاري التوليد...", fr: "Génération en cours...", en: "Generating..." },
  preview:             { ar: "معاينة الوثيقة", fr: "Aperçu du Document", en: "Document Preview" },
  hidePreview:         { ar: "إخفاء المعاينة", fr: "Masquer l'aperçu", en: "Hide Preview" },
  downloadPdf:         { ar: "تحميل PDF", fr: "Télécharger PDF", en: "Download PDF" },
  print:               { ar: "طباعة", fr: "Imprimer", en: "Print" },

  required:            { ar: "مطلوب", fr: "Requis", en: "Required" },
  fillRequired:        { ar: "يرجى ملء جميع الحقول المطلوبة", fr: "Veuillez remplir tous les champs obligatoires", en: "Please fill in all required fields" },
  fieldRequired:       { ar: "هذا الحقل مطلوب", fr: "Ce champ est obligatoire", en: "This field is required" },

  step:                { ar: "الخطوة", fr: "Étape", en: "Step" },
  review:              { ar: "مراجعة وتوليد", fr: "Révision et Génération", en: "Review & Generate" },
  reviewDescription:   { ar: "راجع معلوماتك قبل توليد الوثيقة النهائية", fr: "Vérifiez vos informations avant de générer le document final", en: "Review your information before generating the final document" },

  documentRef:         { ar: "المرجع", fr: "Référence", en: "Reference" },
  generatedOn:         { ar: "أُنشئ بتاريخ", fr: "Créé le", en: "Generated on" },
  pdfDisclaimer:       { ar: "هذه الوثيقة نموذجية فقط، يرجى استشارة محامٍ مرخص قبل أي استعمال قانوني", fr: "Ce document est un modèle uniquement. Consultez un avocat agréé avant tout usage juridique.", en: "This document is a template only. Consult a licensed lawyer before any legal use." },

  selectDocument:      { ar: "اختر نوع الوثيقة", fr: "Choisissez un type de document", en: "Select a document type" },
  selectDocumentDesc:  { ar: "اختر الوثيقة التي تريد إنشاءها من القائمة أدناه", fr: "Sélectionnez le document à créer dans la liste ci-dessous", en: "Select the document to create from the list below" },
  backToDocuments:     { ar: "العودة للوثائق", fr: "Retour aux documents", en: "Back to documents" },
  formSaved:           { ar: "تم حفظ النموذج", fr: "Formulaire sauvegardé", en: "Form saved" },
  autoSaved:           { ar: "حفظ تلقائي", fr: "Sauvegarde automatique", en: "Auto-saved" },

  history:             { ar: "السجل", fr: "Historique", en: "History" },
  noHistory:           { ar: "لا يوجد سجل بعد", fr: "Pas d'historique", en: "No history yet" },
  clearHistory:        { ar: "مسح السجل", fr: "Effacer l'historique", en: "Clear history" },
  lastGenerated:       { ar: "آخر وثيقة مولّدة", fr: "Dernier document généré", en: "Last generated document" },

  exampleData:         { ar: "ملء بيانات تجريبية", fr: "Remplir avec des données exemple", en: "Fill with example data" },
  clearForm:           { ar: "مسح النموذج", fr: "Effacer le formulaire", en: "Clear form" },

  legalBasis:          { ar: "الأساس القانوني", fr: "Base juridique", en: "Legal basis" },
  category:            { ar: "الفئة", fr: "Catégorie", en: "Category" },

  share:               { ar: "مشاركة", fr: "Partager", en: "Share" },
  shareWhatsApp:       { ar: "مشاركة عبر واتساب", fr: "Partager sur WhatsApp", en: "Share via WhatsApp" },

  cityPlaceholder:     { ar: "اختر المدينة...", fr: "Sélectionnez une ville...", en: "Select a city..." },
  courtPlaceholder:    { ar: "اختر المحكمة...", fr: "Sélectionnez un tribunal...", en: "Select a court..." },
  selectPlaceholder:   { ar: "اختر...", fr: "Sélectionnez...", en: "Select..." },

  addItem:             { ar: "إضافة", fr: "Ajouter", en: "Add" },
  removeItem:          { ar: "حذف", fr: "Supprimer", en: "Remove" },

  reviewConfirmTitle:  { ar: "تأكيد المعلومات", fr: "Confirmation des informations", en: "Confirm Information" },
  reviewConfirmDesc:   { ar: "يرجى مراجعة جميع المعلومات المدخلة والتأكد من صحتها قبل توليد الوثيقة.", fr: "Veuillez vérifier toutes les informations saisies avant de générer le document.", en: "Please verify all entered information before generating the document." },

  pdfTitle:            { ar: "المملكة المغربية", fr: "Royaume du Maroc", en: "Kingdom of Morocco" },
  pdfSubtitle:         { ar: "وزارة العدل", fr: "Ministère de la Justice", en: "Ministry of Justice" },
  pdfPage:             { ar: "صفحة", fr: "Page", en: "Page" },
  pdfSignature:        { ar: "التوقيع", fr: "Signature", en: "Signature" },

  today:               { ar: "اليوم", fr: "Aujourd'hui", en: "Today" },
  livePreview:         { ar: "معاينة مباشرة", fr: "Aperçu en direct", en: "Live preview" },
  generateDocument:    { ar: "توليد الوثيقة", fr: "Générer le document", en: "Generate Document" },
  validationRequired:  { ar: "هذا الحقل مطلوب", fr: "Ce champ est obligatoire", en: "This field is required" },
  selectCityFirst:     { ar: "اختر المدينة أولاً...", fr: "Sélectionnez d'abord une ville...", en: "Select a city first..." },
  remove:              { ar: "حذف", fr: "Supprimer", en: "Remove" },
  copy:                { ar: "نسخ", fr: "Copier", en: "Copy" },
  downloadTxt:         { ar: "تحميل TXT", fr: "Télécharger TXT", en: "Download TXT" },
  filterAll:           { ar: "الكل", fr: "Tous", en: "All" },
  documentGenerated:   { ar: "تم توليد الوثيقة بنجاح!", fr: "Document généré avec succès !", en: "Document generated successfully!" },
  startForm:           { ar: "ابدأ الإنشاء", fr: "Commencer", en: "Start" },
  serviceCta:          { ar: "تحتاج استشارة قانونية؟", fr: "Besoin d'aide juridique ?", en: "Need legal guidance?" },
  serviceCtaBody:      { ar: "اسأل الميزان عن وضعيتك القانونية واحصل على أجوبة مسندة بالمواد.", fr: "Posez vos questions juridiques et obtenez des réponses fondées sur les articles de loi.", en: "Ask AI-Mizan about your legal situation and get article-backed answers." },
  paymentDayInvalid:   { ar: "يرجى إدخال يوم صالح (1-31).", fr: "Veuillez entrer un jour valide (1-31).", en: "Please enter a valid day (1-31)." },
};

/** Category labels */
export const categoryLabels: Record<string, I18nString> = {
  family:         { ar: "قانون الأسرة", fr: "Droit de la Famille", en: "Family Law" },
  civil:          { ar: "القانون المدني", fr: "Droit Civil", en: "Civil Law" },
  commercial:     { ar: "القانون التجاري", fr: "Droit Commercial", en: "Commercial Law" },
  criminal:       { ar: "القانون الجنائي", fr: "Droit Pénal", en: "Criminal Law" },
  administrative: { ar: "القانون الإداري", fr: "Droit Administratif", en: "Administrative Law" },
};

/** Helper: get translated string with replacements */
export function t(key: TranslationKey, locale: "ar" | "fr" | "en", replacements?: Record<string, string | number>): string {
  let text = formTranslations[key]?.[locale] ?? formTranslations[key]?.fr ?? key;
  if (replacements) {
    for (const [k, v] of Object.entries(replacements)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}
