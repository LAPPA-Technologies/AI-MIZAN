export type CourtType =
  | "cour_cassation"
  | "cour_appel"
  | "cour_appel_commerce"
  | "cour_appel_admin"
  | "tribunal_premiere_instance"
  | "tribunal_commerce"
  | "tribunal_administratif";

export type LocalizedString = { fr: string; ar: string; en?: string };

export type Court = {
  id: string;
  name: LocalizedString;
  address: { fr: string; ar: string };
  city: string;
  region: string;
  phone: string;
  fax?: string;
  email?: string;
  mapUrl?: string;
  lat: number;
  lng: number;
  type: CourtType;
};

// Minimal icons for UI
export const courtTypeIcons: Record<CourtType, string> = {
  cour_cassation: "🏛️",
  cour_appel: "⚖️",
  cour_appel_commerce: "💼",
  cour_appel_admin: "📋",
  tribunal_premiere_instance: "🏛️",
  tribunal_commerce: "💼",
  tribunal_administratif: "📋",
};

// Labels for each court type (fr/ar/en)
export const courtTypeLabels: Record<CourtType, { fr: string; ar: string; en: string }> = {
  cour_cassation: { fr: "Cour de cassation", ar: "محكمة النقض", en: "Court of Cassation" },
  cour_appel: { fr: "Cour d'appel", ar: "محكمة الاستئناف", en: "Court of Appeal" },
  cour_appel_commerce: { fr: "Cour d'appel (Commerce)", ar: "محكمة الاستئناف - التجارة", en: "Court of Appeal (Commercial)" },
  cour_appel_admin: { fr: "Cour d'appel (Admin)", ar: "محكمة الاستئناف - إدارية", en: "Court of Appeal (Admin)" },
  tribunal_premiere_instance: { fr: "Tribunal de première instance", ar: "محكمة الدرجة الأولى", en: "First Instance Court" },
  tribunal_commerce: { fr: "Tribunal de commerce", ar: "محكمة التجارة", en: "Commercial Court" },
  tribunal_administratif: { fr: "Tribunal administratif", ar: "المحكمة الإدارية", en: "Administrative Tribunal" },
};

// Regions (id + localized labels)
export const regions: Array<{ id: string; fr: string; ar: string; en?: string }> = [
  { id: "casablanca_settat", fr: "Casablanca-Settat", ar: "الدار البيضاء-سطات", en: "Casablanca-Settat" },
  { id: "rabat_sale", fr: "Rabat-Salé-Kénitra", ar: "الرباط-سلا-القنيطرة", en: "Rabat-Salé-Kénitra" },
  { id: "fes_meknes", fr: "Fès-Meknès", ar: "فاس-مكناس", en: "Fès-Meknès" },
];

// Small sample dataset — add or replace with authoritative source later
export const courts: Court[] = [
  {
    id: "casablanca_tribunal_1",
    name: { fr: "Tribunal de première instance de Casablanca", ar: "محكمة الدار البيضاء الابتدائية", en: "Casablanca First Instance Court" },
    address: { fr: "Av. des FAR, Casablanca", ar: "شارع القوات المسلحة الملكية، الدار البيضاء" },
    city: "Casablanca",
    region: "casablanca_settat",
    phone: "+212 5222 12345",
    lat: 33.5731,
    lng: -7.5898,
    type: "tribunal_premiere_instance",
    mapUrl: "https://www.google.com/maps/place/Casablanca",
  },
  {
    id: "rabat_tribunal_1",
    name: { fr: "Tribunal de première instance de Rabat", ar: "محكمة الرباط الابتدائية", en: "Rabat First Instance Court" },
    address: { fr: "Av. Mohammed V, Rabat", ar: "شارع محمد الخامس، الرباط" },
    city: "Rabat",
    region: "rabat_sale",
    phone: "+212 5377 54321",
    lat: 34.0209,
    lng: -6.8416,
    type: "tribunal_premiere_instance",
    mapUrl: "https://www.google.com/maps/place/Rabat",
  },
  {
    id: "casablanca_commerce",
    name: { fr: "Tribunal de commerce de Casablanca", ar: "محكمة التجارة بالدار البيضاء", en: "Casablanca Commercial Court" },
    address: { fr: "Rue du Commerce, Casablanca", ar: "شارع التجارة، الدار البيضاء" },
    city: "Casablanca",
    region: "casablanca_settat",
    phone: "+212 5222 67890",
    lat: 33.5899,
    lng: -7.6035,
    type: "tribunal_commerce",
    mapUrl: "https://www.google.com/maps/place/Casablanca+Commercial+Court",
  },
  {
    id: "fes_appel",
    name: { fr: "Cour d'appel de Fès", ar: "محكمة الاستئناف فاس", en: "Fès Court of Appeal" },
    address: { fr: "Bd Mohammed V, Fès", ar: "شارع محمد الخامس، فاس" },
    city: "Fès",
    region: "fes_meknes",
    phone: "+212 5355 98765",
    lat: 34.0181,
    lng: -5.0078,
    type: "cour_appel",
    mapUrl: "https://www.google.com/maps/place/Fes",
  },
];

export function getAllCities(): string[] {
  return Array.from(new Set(courts.map((c) => c.city))).sort((a, b) => a.localeCompare(b, "fr"));
}

export function getAllCourtTypes(): CourtType[] {
  return Array.from(new Set(courts.map((c) => c.type))) as CourtType[];
}

export function getCourtById(id: string): Court | undefined {
  return courts.find((c) => c.id === id);
}

function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2) * Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon), Math.sqrt(1 - (sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon)));
  return R * c;
}

export function getNearbyCourts(base: Court, maxResults = 5): Court[] {
  return courts
    .filter((c) => c.id !== base.id && typeof c.lat === "number" && typeof c.lng === "number")
    .map((c) => ({ c, d: haversine({ lat: base.lat, lng: base.lng }, { lat: c.lat, lng: c.lng }) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, maxResults)
    .map((x) => x.c);
}

export function getCourtTypesMap() {
  return courtTypeLabels;
}

export default courts;
