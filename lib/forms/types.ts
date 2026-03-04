/**
 * Core type definitions for the legal document generator.
 */

export type Locale = "ar" | "fr" | "en";
export type I18nString = Record<Locale, string>;

/* ─── Field types ─────────────────────────────────────────────── */

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "city"      // special: Moroccan cities dropdown
  | "court"     // special: court type dropdown (auto-linked to city)
  | "array";    // dynamic list (children names, witness names, etc.)

export interface FieldOption {
  value: string;
  label: I18nString;
}

export interface FormField {
  name: string;
  type: FieldType;
  label: I18nString;
  placeholder?: I18nString;
  required?: boolean;
  options?: FieldOption[];      // for select fields
  arrayItemLabel?: I18nString;  // for array fields — label for each item
  arrayMin?: number;
  arrayMax?: number;
  half?: boolean;               // render at 50% width (side by side)
  dependsOn?: string;           // conditional visibility
}

/* ─── Step definition ─────────────────────────────────────────── */

export interface FormStep {
  id: string;
  title: I18nString;
  description?: I18nString;
  fields: FormField[];
}

/* ─── Document configuration ──────────────────────────────────── */

export type DocumentCategory = "family" | "civil" | "commercial" | "criminal" | "administrative";

/**
 * serviceType:
 *  - "form"  → Category A: safe fillable form (private agreements, no court filing)
 *  - "guide" → Category B: procedure guide (requires court / notary / administration)
 */
export type ServiceType = "form" | "guide";

/** A guide step — plain text instructions (no fillable fields) */
export interface GuideStep {
  id: string;
  title: I18nString;
  description: I18nString;
  documents?: I18nString[];   // list of required documents for this step
  tips?: I18nString[];        // practical tips
  estimatedTime?: I18nString; // e.g. "2-3 days"
}

export interface DocumentFormConfig {
  id: string;
  slug: string;
  category: DocumentCategory;
  serviceType: ServiceType;
  icon: string;
  title: I18nString;
  description: I18nString;
  legalBasis: string;
  /** Fillable form steps (serviceType = "form") */
  steps: FormStep[];
  /** Procedure guide steps (serviceType = "guide") — informational only */
  guideSteps?: GuideStep[];
}

/* ─── Moroccan cities ─────────────────────────────────────────── */

export interface MoroccanCity {
  value: string;
  label: I18nString;
  hasCommercialCourt?: boolean;
  hasAdminCourt?: boolean;
  hasAppealCourt?: boolean;
}

/* ─── Court types ─────────────────────────────────────────────── */

export interface CourtType {
  value: string;
  label: I18nString;
}
