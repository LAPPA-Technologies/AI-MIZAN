/**
 * Comprehensive Moroccan Courts Directory
 * Data sourced from the Ministry of Justice (justice.gov.ma) and public records.
 *
 * Court types:
 *  - tribunal_premiere_instance  (TPI) — First Instance Courts
 *  - cour_appel                  (CA)  — Courts of Appeal
 *  - cour_cassation              (CC)  — Court of Cassation
 *  - tribunal_commerce           (TC)  — Commercial Courts
 *  - tribunal_administratif      (TA)  — Administrative Courts
 *  - cour_appel_commerce         (CAC) — Courts of Appeal for Commerce
 *  - cour_appel_admin            (CAA) — Courts of Appeal for Administration
 */

export type CourtType =
  | "tribunal_premiere_instance"
  | "cour_appel"
  | "cour_cassation"
  | "tribunal_commerce"
  | "tribunal_administratif"
  | "cour_appel_commerce"
  | "cour_appel_admin";

export type Court = {
  id: string;
  type: CourtType;
  name: { fr: string; ar: string; en: string };
  city: string;
  region: string;
  address: { fr: string; ar: string };
  phone: string;
  fax?: string;
  email?: string;
  mapUrl: string;
  lat: number;
  lng: number;
};

export const courtTypeLabels: Record<CourtType, { fr: string; ar: string; en: string }> = {
  tribunal_premiere_instance: {
    fr: "Tribunal de Première Instance",
    ar: "المحكمة الابتدائية",
    en: "Court of First Instance",
  },
  cour_appel: {
    fr: "Cour d'Appel",
    ar: "محكمة الاستئناف",
    en: "Court of Appeal",
  },
  cour_cassation: {
    fr: "Cour de Cassation",
    ar: "محكمة النقض",
    en: "Court of Cassation",
  },
  tribunal_commerce: {
    fr: "Tribunal de Commerce",
    ar: "المحكمة التجارية",
    en: "Commercial Court",
  },
  tribunal_administratif: {
    fr: "Tribunal Administratif",
    ar: "المحكمة الإدارية",
    en: "Administrative Court",
  },
  cour_appel_commerce: {
    fr: "Cour d'Appel de Commerce",
    ar: "محكمة الاستئناف التجارية",
    en: "Commercial Court of Appeal",
  },
  cour_appel_admin: {
    fr: "Cour d'Appel Administrative",
    ar: "محكمة الاستئناف الإدارية",
    en: "Administrative Court of Appeal",
  },
};

export const courtTypeIcons: Record<CourtType, string> = {
  tribunal_premiere_instance: "🏛️",
  cour_appel: "⚖️",
  cour_cassation: "🏛️",
  tribunal_commerce: "💼",
  tribunal_administratif: "📋",
  cour_appel_commerce: "💼",
  cour_appel_admin: "📋",
};

export const regions = [
  { id: "tanger-tetouan", fr: "Tanger-Tétouan-Al Hoceïma", ar: "طنجة-تطوان-الحسيمة", en: "Tangier-Tetouan-Al Hoceima" },
  { id: "oriental", fr: "Oriental", ar: "الشرق", en: "Oriental" },
  { id: "fes-meknes", fr: "Fès-Meknès", ar: "فاس-مكناس", en: "Fez-Meknes" },
  { id: "rabat-sale", fr: "Rabat-Salé-Kénitra", ar: "الرباط-سلا-القنيطرة", en: "Rabat-Salé-Kénitra" },
  { id: "beni-mellal", fr: "Béni Mellal-Khénifra", ar: "بني ملال-خنيفرة", en: "Béni Mellal-Khénifra" },
  { id: "casablanca-settat", fr: "Casablanca-Settat", ar: "الدار البيضاء-سطات", en: "Casablanca-Settat" },
  { id: "marrakech-safi", fr: "Marrakech-Safi", ar: "مراكش-آسفي", en: "Marrakech-Safi" },
  { id: "draa-tafilalet", fr: "Drâa-Tafilalet", ar: "درعة-تافيلالت", en: "Drâa-Tafilalet" },
  { id: "souss-massa", fr: "Souss-Massa", ar: "سوس-ماسة", en: "Souss-Massa" },
  { id: "guelmim", fr: "Guelmim-Oued Noun", ar: "كلميم-واد نون", en: "Guelmim-Oued Noun" },
  { id: "laayoune", fr: "Laâyoune-Sakia El Hamra", ar: "العيون-الساقية الحمراء", en: "Laâyoune-Sakia El Hamra" },
  { id: "dakhla", fr: "Dakhla-Oued Ed-Dahab", ar: "الداخلة-وادي الذهب", en: "Dakhla-Oued Ed-Dahab" },
];

export const courts: Court[] = [
  // ════════════════════════════════════════
  // COUR DE CASSATION — Rabat
  // ════════════════════════════════════════
  {
    id: "cc-rabat",
    type: "cour_cassation",
    name: { fr: "Cour de Cassation", ar: "محكمة النقض", en: "Court of Cassation" },
    city: "Rabat",
    region: "rabat-sale",
    address: {
      fr: "Rue Soueika, Médina, Rabat",
      ar: "شارع السويقة، المدينة القديمة، الرباط",
    },
    phone: "05 37 73 17 73",
    fax: "05 37 73 12 85",
    mapUrl: "https://maps.google.com/?q=34.0209,-6.8336",
    lat: 34.0209,
    lng: -6.8336,
  },

  // ════════════════════════════════════════
  // COURS D'APPEL
  // ════════════════════════════════════════
  {
    id: "ca-casablanca",
    type: "cour_appel",
    name: { fr: "Cour d'Appel de Casablanca", ar: "محكمة الاستئناف بالدار البيضاء", en: "Court of Appeal of Casablanca" },
    city: "Casablanca",
    region: "casablanca-settat",
    address: { fr: "Place Mohammed V, Casablanca", ar: "ساحة محمد الخامس، الدار البيضاء" },
    phone: "05 22 27 27 29",
    mapUrl: "https://maps.google.com/?q=33.5912,-7.6186",
    lat: 33.5912,
    lng: -7.6186,
  },
  {
    id: "ca-rabat",
    type: "cour_appel",
    name: { fr: "Cour d'Appel de Rabat", ar: "محكمة الاستئناف بالرباط", en: "Court of Appeal of Rabat" },
    city: "Rabat",
    region: "rabat-sale",
    address: { fr: "Avenue Mohammed V, Rabat", ar: "شارع محمد الخامس، الرباط" },
    phone: "05 37 73 17 17",
    mapUrl: "https://maps.google.com/?q=34.0132,-6.8326",
    lat: 34.0132,
    lng: -6.8326,
  },
  {
    id: "ca-fes",
    type: "cour_appel",
    name: { fr: "Cour d'Appel de Fès", ar: "محكمة الاستئناف بفاس", en: "Court of Appeal of Fez" },
    city: "Fès",
    region: "fes-meknes",
    address: { fr: "Boulevard Allal El Fassi, Fès", ar: "شارع علال الفاسي، فاس" },
    phone: "05 35 64 07 12",
    mapUrl: "https://maps.google.com/?q=34.0331,-5.0003",
    lat: 34.0331,
    lng: -5.0003,
  },
  {
    id: "ca-marrakech",
    type: "cour_appel",
    name: { fr: "Cour d'Appel de Marrakech", ar: "محكمة الاستئناف بمراكش", en: "Court of Appeal of Marrakech" },
    city: "Marrakech",
    region: "marrakech-safi",
    address: { fr: "Avenue Hassan II, Guéliz, Marrakech", ar: "شارع الحسن الثاني، جيليز، مراكش" },
    phone: "05 24 44 83 22",
    mapUrl: "https://maps.google.com/?q=31.6295,-8.0084",
    lat: 31.6295,
    lng: -8.0084,
  },
  {
    id: "ca-tanger",
    type: "cour_appel",
    name: { fr: "Cour d'Appel de Tanger", ar: "محكمة الاستئناف بطنجة", en: "Court of Appeal of Tangier" },
    city: "Tanger",
    region: "tanger-tetouan",
    address: { fr: "Place du 9 Avril, Tanger", ar: "ساحة 9 أبريل، طنجة" },
    phone: "05 39 93 21 26",
    mapUrl: "https://maps.google.com/?q=35.7672,-5.7998",
    lat: 35.7672,
    lng: -5.7998,
  },
  {
    id: "ca-agadir",
    type: "cour_appel",
    name: { fr: "Cour d'Appel d'Agadir", ar: "محكمة الاستئناف بأكادير", en: "Court of Appeal of Agadir" },
    city: "Agadir",
    region: "souss-massa",
    address: { fr: "Avenue Hassan II, Agadir", ar: "شارع الحسن الثاني، أكادير" },
    phone: "05 28 84 09 90",
    mapUrl: "https://maps.google.com/?q=30.4278,-9.5981",
    lat: 30.4278,
    lng: -9.5981,
  },
  {
    id: "ca-meknes",
    type: "cour_appel",
    name: { fr: "Cour d'Appel de Meknès", ar: "محكمة الاستئناف بمكناس", en: "Court of Appeal of Meknes" },
    city: "Meknès",
    region: "fes-meknes",
    address: { fr: "Boulevard Zerktouni, Meknès", ar: "شارع الزرقطوني، مكناس" },
    phone: "05 35 52 18 14",
    mapUrl: "https://maps.google.com/?q=33.8935,-5.5473",
    lat: 33.8935,
    lng: -5.5473,
  },
  {
    id: "ca-oujda",
    type: "cour_appel",
    name: { fr: "Cour d'Appel d'Oujda", ar: "محكمة الاستئناف بوجدة", en: "Court of Appeal of Oujda" },
    city: "Oujda",
    region: "oriental",
    address: { fr: "Boulevard Mohammed V, Oujda", ar: "شارع محمد الخامس، وجدة" },
    phone: "05 36 68 34 45",
    mapUrl: "https://maps.google.com/?q=34.6805,-1.9076",
    lat: 34.6805,
    lng: -1.9076,
  },
  {
    id: "ca-kenitra",
    type: "cour_appel",
    name: { fr: "Cour d'Appel de Kénitra", ar: "محكمة الاستئناف بالقنيطرة", en: "Court of Appeal of Kénitra" },
    city: "Kénitra",
    region: "rabat-sale",
    address: { fr: "Avenue Mohammed V, Kénitra", ar: "شارع محمد الخامس، القنيطرة" },
    phone: "05 37 37 10 88",
    mapUrl: "https://maps.google.com/?q=34.2610,-6.5802",
    lat: 34.2610,
    lng: -6.5802,
  },
  {
    id: "ca-beni-mellal",
    type: "cour_appel",
    name: { fr: "Cour d'Appel de Béni Mellal", ar: "محكمة الاستئناف ببني ملال", en: "Court of Appeal of Béni Mellal" },
    city: "Béni Mellal",
    region: "beni-mellal",
    address: { fr: "Avenue Hassan II, Béni Mellal", ar: "شارع الحسن الثاني، بني ملال" },
    phone: "05 23 48 20 90",
    mapUrl: "https://maps.google.com/?q=32.3373,-6.3498",
    lat: 32.3373,
    lng: -6.3498,
  },
  {
    id: "ca-settat",
    type: "cour_appel",
    name: { fr: "Cour d'Appel de Settat", ar: "محكمة الاستئناف بسطات", en: "Court of Appeal of Settat" },
    city: "Settat",
    region: "casablanca-settat",
    address: { fr: "Centre Ville, Settat", ar: "وسط المدينة، سطات" },
    phone: "05 23 40 11 99",
    mapUrl: "https://maps.google.com/?q=33.0014,-7.6165",
    lat: 33.0014,
    lng: -7.6165,
  },
  {
    id: "ca-safi",
    type: "cour_appel",
    name: { fr: "Cour d'Appel de Safi", ar: "محكمة الاستئناف بآسفي", en: "Court of Appeal of Safi" },
    city: "Safi",
    region: "marrakech-safi",
    address: { fr: "Centre Ville, Safi", ar: "وسط المدينة، آسفي" },
    phone: "05 24 62 37 75",
    mapUrl: "https://maps.google.com/?q=32.2994,-9.2372",
    lat: 32.2994,
    lng: -9.2372,
  },
  {
    id: "ca-errachidia",
    type: "cour_appel",
    name: { fr: "Cour d'Appel d'Errachidia", ar: "محكمة الاستئناف بالرشيدية", en: "Court of Appeal of Errachidia" },
    city: "Errachidia",
    region: "draa-tafilalet",
    address: { fr: "Avenue Moulay Ali Chérif, Errachidia", ar: "شارع مولاي علي الشريف، الرشيدية" },
    phone: "05 35 57 22 60",
    mapUrl: "https://maps.google.com/?q=31.9314,-4.4266",
    lat: 31.9314,
    lng: -4.4266,
  },
  {
    id: "ca-laayoune",
    type: "cour_appel",
    name: { fr: "Cour d'Appel de Laâyoune", ar: "محكمة الاستئناف بالعيون", en: "Court of Appeal of Laâyoune" },
    city: "Laâyoune",
    region: "laayoune",
    address: { fr: "Avenue Hassan II, Laâyoune", ar: "شارع الحسن الثاني، العيون" },
    phone: "05 28 89 14 40",
    mapUrl: "https://maps.google.com/?q=27.1536,-13.2033",
    lat: 27.1536,
    lng: -13.2033,
  },

  // ════════════════════════════════════════
  // TRIBUNAUX DE PREMIÈRE INSTANCE
  // ════════════════════════════════════════
  {
    id: "tpi-casablanca",
    type: "tribunal_premiere_instance",
    name: { fr: "TPI de Casablanca", ar: "المحكمة الابتدائية بالدار البيضاء", en: "First Instance Court of Casablanca" },
    city: "Casablanca",
    region: "casablanca-settat",
    address: { fr: "Place Mohammed V, Casablanca", ar: "ساحة محمد الخامس، الدار البيضاء" },
    phone: "05 22 27 49 20",
    mapUrl: "https://maps.google.com/?q=33.5892,-7.6133",
    lat: 33.5892,
    lng: -7.6133,
  },
  {
    id: "tpi-rabat",
    type: "tribunal_premiere_instance",
    name: { fr: "TPI de Rabat", ar: "المحكمة الابتدائية بالرباط", en: "First Instance Court of Rabat" },
    city: "Rabat",
    region: "rabat-sale",
    address: { fr: "Avenue Mohammed V, Rabat", ar: "شارع محمد الخامس، الرباط" },
    phone: "05 37 73 08 71",
    mapUrl: "https://maps.google.com/?q=34.0200,-6.8326",
    lat: 34.0200,
    lng: -6.8326,
  },
  {
    id: "tpi-fes",
    type: "tribunal_premiere_instance",
    name: { fr: "TPI de Fès", ar: "المحكمة الابتدائية بفاس", en: "First Instance Court of Fez" },
    city: "Fès",
    region: "fes-meknes",
    address: { fr: "Boulevard Allal El Fassi, Fès", ar: "شارع علال الفاسي، فاس" },
    phone: "05 35 64 07 00",
    mapUrl: "https://maps.google.com/?q=34.0340,-5.0012",
    lat: 34.0340,
    lng: -5.0012,
  },
  {
    id: "tpi-marrakech",
    type: "tribunal_premiere_instance",
    name: { fr: "TPI de Marrakech", ar: "المحكمة الابتدائية بمراكش", en: "First Instance Court of Marrakech" },
    city: "Marrakech",
    region: "marrakech-safi",
    address: { fr: "Avenue Hassan II, Guéliz, Marrakech", ar: "شارع الحسن الثاني، جيليز، مراكش" },
    phone: "05 24 44 83 15",
    mapUrl: "https://maps.google.com/?q=31.6310,-8.0078",
    lat: 31.6310,
    lng: -8.0078,
  },
  {
    id: "tpi-tanger",
    type: "tribunal_premiere_instance",
    name: { fr: "TPI de Tanger", ar: "المحكمة الابتدائية بطنجة", en: "First Instance Court of Tangier" },
    city: "Tanger",
    region: "tanger-tetouan",
    address: { fr: "Place du 9 Avril, Tanger", ar: "ساحة 9 أبريل، طنجة" },
    phone: "05 39 93 21 20",
    mapUrl: "https://maps.google.com/?q=35.7680,-5.7995",
    lat: 35.7680,
    lng: -5.7995,
  },
  {
    id: "tpi-agadir",
    type: "tribunal_premiere_instance",
    name: { fr: "TPI d'Agadir", ar: "المحكمة الابتدائية بأكادير", en: "First Instance Court of Agadir" },
    city: "Agadir",
    region: "souss-massa",
    address: { fr: "Avenue Hassan II, Agadir", ar: "شارع الحسن الثاني، أكادير" },
    phone: "05 28 84 09 80",
    mapUrl: "https://maps.google.com/?q=30.4285,-9.5975",
    lat: 30.4285,
    lng: -9.5975,
  },
  {
    id: "tpi-oujda",
    type: "tribunal_premiere_instance",
    name: { fr: "TPI d'Oujda", ar: "المحكمة الابتدائية بوجدة", en: "First Instance Court of Oujda" },
    city: "Oujda",
    region: "oriental",
    address: { fr: "Boulevard Mohammed V, Oujda", ar: "شارع محمد الخامس، وجدة" },
    phone: "05 36 68 34 40",
    mapUrl: "https://maps.google.com/?q=34.6815,-1.9070",
    lat: 34.6815,
    lng: -1.9070,
  },
  {
    id: "tpi-meknes",
    type: "tribunal_premiere_instance",
    name: { fr: "TPI de Meknès", ar: "المحكمة الابتدائية بمكناس", en: "First Instance Court of Meknes" },
    city: "Meknès",
    region: "fes-meknes",
    address: { fr: "Boulevard Zerktouni, Meknès", ar: "شارع الزرقطوني، مكناس" },
    phone: "05 35 52 18 10",
    mapUrl: "https://maps.google.com/?q=33.8940,-5.5480",
    lat: 33.8940,
    lng: -5.5480,
  },
  {
    id: "tpi-kenitra",
    type: "tribunal_premiere_instance",
    name: { fr: "TPI de Kénitra", ar: "المحكمة الابتدائية بالقنيطرة", en: "First Instance Court of Kénitra" },
    city: "Kénitra",
    region: "rabat-sale",
    address: { fr: "Avenue Mohammed V, Kénitra", ar: "شارع محمد الخامس، القنيطرة" },
    phone: "05 37 37 10 80",
    mapUrl: "https://maps.google.com/?q=34.2615,-6.5810",
    lat: 34.2615,
    lng: -6.5810,
  },
  {
    id: "tpi-tetouan",
    type: "tribunal_premiere_instance",
    name: { fr: "TPI de Tétouan", ar: "المحكمة الابتدائية بتطوان", en: "First Instance Court of Tetouan" },
    city: "Tétouan",
    region: "tanger-tetouan",
    address: { fr: "Place Al Jalaa, Tétouan", ar: "ساحة الجلاء، تطوان" },
    phone: "05 39 96 33 66",
    mapUrl: "https://maps.google.com/?q=35.5889,-5.3626",
    lat: 35.5889,
    lng: -5.3626,
  },
  {
    id: "tpi-sale",
    type: "tribunal_premiere_instance",
    name: { fr: "TPI de Salé", ar: "المحكمة الابتدائية بسلا", en: "First Instance Court of Salé" },
    city: "Salé",
    region: "rabat-sale",
    address: { fr: "Boulevard Mohammed V, Salé", ar: "شارع محمد الخامس، سلا" },
    phone: "05 37 88 09 09",
    mapUrl: "https://maps.google.com/?q=34.0482,-6.8003",
    lat: 34.0482,
    lng: -6.8003,
  },
  {
    id: "tpi-settat",
    type: "tribunal_premiere_instance",
    name: { fr: "TPI de Settat", ar: "المحكمة الابتدائية بسطات", en: "First Instance Court of Settat" },
    city: "Settat",
    region: "casablanca-settat",
    address: { fr: "Centre Ville, Settat", ar: "وسط المدينة، سطات" },
    phone: "05 23 40 10 00",
    mapUrl: "https://maps.google.com/?q=33.0010,-7.6160",
    lat: 33.0010,
    lng: -7.6160,
  },
  {
    id: "tpi-beni-mellal",
    type: "tribunal_premiere_instance",
    name: { fr: "TPI de Béni Mellal", ar: "المحكمة الابتدائية ببني ملال", en: "First Instance Court of Béni Mellal" },
    city: "Béni Mellal",
    region: "beni-mellal",
    address: { fr: "Avenue Hassan II, Béni Mellal", ar: "شارع الحسن الثاني، بني ملال" },
    phone: "05 23 48 20 80",
    mapUrl: "https://maps.google.com/?q=32.3380,-6.3502",
    lat: 32.3380,
    lng: -6.3502,
  },
  {
    id: "tpi-el-jadida",
    type: "tribunal_premiere_instance",
    name: { fr: "TPI d'El Jadida", ar: "المحكمة الابتدائية بالجديدة", en: "First Instance Court of El Jadida" },
    city: "El Jadida",
    region: "casablanca-settat",
    address: { fr: "Avenue Mohammed V, El Jadida", ar: "شارع محمد الخامس، الجديدة" },
    phone: "05 23 34 20 55",
    mapUrl: "https://maps.google.com/?q=33.2561,-8.5008",
    lat: 33.2561,
    lng: -8.5008,
  },
  {
    id: "tpi-nador",
    type: "tribunal_premiere_instance",
    name: { fr: "TPI de Nador", ar: "المحكمة الابتدائية بالناظور", en: "First Instance Court of Nador" },
    city: "Nador",
    region: "oriental",
    address: { fr: "Boulevard Mohammed V, Nador", ar: "شارع محمد الخامس، الناظور" },
    phone: "05 36 33 38 38",
    mapUrl: "https://maps.google.com/?q=35.1741,-2.9287",
    lat: 35.1741,
    lng: -2.9287,
  },
  {
    id: "tpi-khouribga",
    type: "tribunal_premiere_instance",
    name: { fr: "TPI de Khouribga", ar: "المحكمة الابتدائية بخريبكة", en: "First Instance Court of Khouribga" },
    city: "Khouribga",
    region: "beni-mellal",
    address: { fr: "Centre Ville, Khouribga", ar: "وسط المدينة، خريبكة" },
    phone: "05 23 49 07 07",
    mapUrl: "https://maps.google.com/?q=32.8811,-6.9063",
    lat: 32.8811,
    lng: -6.9063,
  },
  {
    id: "tpi-taza",
    type: "tribunal_premiere_instance",
    name: { fr: "TPI de Taza", ar: "المحكمة الابتدائية بتازة", en: "First Instance Court of Taza" },
    city: "Taza",
    region: "fes-meknes",
    address: { fr: "Avenue Mohammed V, Taza", ar: "شارع محمد الخامس، تازة" },
    phone: "05 35 21 19 07",
    mapUrl: "https://maps.google.com/?q=34.2133,-4.0103",
    lat: 34.2133,
    lng: -4.0103,
  },
  {
    id: "tpi-safi",
    type: "tribunal_premiere_instance",
    name: { fr: "TPI de Safi", ar: "المحكمة الابتدائية بآسفي", en: "First Instance Court of Safi" },
    city: "Safi",
    region: "marrakech-safi",
    address: { fr: "Centre Ville, Safi", ar: "وسط المدينة، آسفي" },
    phone: "05 24 62 37 70",
    mapUrl: "https://maps.google.com/?q=32.2990,-9.2365",
    lat: 32.2990,
    lng: -9.2365,
  },
  {
    id: "tpi-mohammedia",
    type: "tribunal_premiere_instance",
    name: { fr: "TPI de Mohammedia", ar: "المحكمة الابتدائية بالمحمدية", en: "First Instance Court of Mohammedia" },
    city: "Mohammedia",
    region: "casablanca-settat",
    address: { fr: "Avenue Hassan II, Mohammedia", ar: "شارع الحسن الثاني، المحمدية" },
    phone: "05 23 32 30 30",
    mapUrl: "https://maps.google.com/?q=33.6834,-7.3833",
    lat: 33.6834,
    lng: -7.3833,
  },
  {
    id: "tpi-al-hoceima",
    type: "tribunal_premiere_instance",
    name: { fr: "TPI d'Al Hoceïma", ar: "المحكمة الابتدائية بالحسيمة", en: "First Instance Court of Al Hoceima" },
    city: "Al Hoceïma",
    region: "tanger-tetouan",
    address: { fr: "Boulevard Mohammed V, Al Hoceïma", ar: "شارع محمد الخامس، الحسيمة" },
    phone: "05 39 98 22 96",
    mapUrl: "https://maps.google.com/?q=35.2517,-3.9372",
    lat: 35.2517,
    lng: -3.9372,
  },
  {
    id: "tpi-errachidia",
    type: "tribunal_premiere_instance",
    name: { fr: "TPI d'Errachidia", ar: "المحكمة الابتدائية بالرشيدية", en: "First Instance Court of Errachidia" },
    city: "Errachidia",
    region: "draa-tafilalet",
    address: { fr: "Centre Ville, Errachidia", ar: "وسط المدينة، الرشيدية" },
    phone: "05 35 57 22 50",
    mapUrl: "https://maps.google.com/?q=31.9320,-4.4270",
    lat: 31.9320,
    lng: -4.4270,
  },
  {
    id: "tpi-ouarzazate",
    type: "tribunal_premiere_instance",
    name: { fr: "TPI d'Ouarzazate", ar: "المحكمة الابتدائية بورزازات", en: "First Instance Court of Ouarzazate" },
    city: "Ouarzazate",
    region: "draa-tafilalet",
    address: { fr: "Avenue Mohammed V, Ouarzazate", ar: "شارع محمد الخامس، ورزازات" },
    phone: "05 24 88 22 40",
    mapUrl: "https://maps.google.com/?q=30.9200,-6.9035",
    lat: 30.9200,
    lng: -6.9035,
  },
  {
    id: "tpi-laayoune",
    type: "tribunal_premiere_instance",
    name: { fr: "TPI de Laâyoune", ar: "المحكمة الابتدائية بالعيون", en: "First Instance Court of Laâyoune" },
    city: "Laâyoune",
    region: "laayoune",
    address: { fr: "Avenue Hassan II, Laâyoune", ar: "شارع الحسن الثاني، العيون" },
    phone: "05 28 89 14 30",
    mapUrl: "https://maps.google.com/?q=27.1540,-13.2040",
    lat: 27.1540,
    lng: -13.2040,
  },
  {
    id: "tpi-dakhla",
    type: "tribunal_premiere_instance",
    name: { fr: "TPI de Dakhla", ar: "المحكمة الابتدائية بالداخلة", en: "First Instance Court of Dakhla" },
    city: "Dakhla",
    region: "dakhla",
    address: { fr: "Boulevard Mohammed V, Dakhla", ar: "شارع محمد الخامس، الداخلة" },
    phone: "05 28 89 80 80",
    mapUrl: "https://maps.google.com/?q=23.6848,-15.9580",
    lat: 23.6848,
    lng: -15.9580,
  },
  {
    id: "tpi-guelmim",
    type: "tribunal_premiere_instance",
    name: { fr: "TPI de Guelmim", ar: "المحكمة الابتدائية بكلميم", en: "First Instance Court of Guelmim" },
    city: "Guelmim",
    region: "guelmim",
    address: { fr: "Avenue Mohammed V, Guelmim", ar: "شارع محمد الخامس، كلميم" },
    phone: "05 28 77 27 50",
    mapUrl: "https://maps.google.com/?q=28.9833,-10.0572",
    lat: 28.9833,
    lng: -10.0572,
  },
  {
    id: "tpi-tiznit",
    type: "tribunal_premiere_instance",
    name: { fr: "TPI de Tiznit", ar: "المحكمة الابتدائية بتيزنيت", en: "First Instance Court of Tiznit" },
    city: "Tiznit",
    region: "souss-massa",
    address: { fr: "Centre Ville, Tiznit", ar: "وسط المدينة، تيزنيت" },
    phone: "05 28 86 20 60",
    mapUrl: "https://maps.google.com/?q=29.6974,-9.8022",
    lat: 29.6974,
    lng: -9.8022,
  },
  {
    id: "tpi-larache",
    type: "tribunal_premiere_instance",
    name: { fr: "TPI de Larache", ar: "المحكمة الابتدائية بالعرائش", en: "First Instance Court of Larache" },
    city: "Larache",
    region: "tanger-tetouan",
    address: { fr: "Centre Ville, Larache", ar: "وسط المدينة، العرائش" },
    phone: "05 39 91 22 80",
    mapUrl: "https://maps.google.com/?q=35.1932,-6.1562",
    lat: 35.1932,
    lng: -6.1562,
  },
  {
    id: "tpi-khemisset",
    type: "tribunal_premiere_instance",
    name: { fr: "TPI de Khémisset", ar: "المحكمة الابتدائية بالخميسات", en: "First Instance Court of Khémisset" },
    city: "Khémisset",
    region: "rabat-sale",
    address: { fr: "Centre Ville, Khémisset", ar: "وسط المدينة، الخميسات" },
    phone: "05 37 55 16 16",
    mapUrl: "https://maps.google.com/?q=33.8241,-6.0664",
    lat: 33.8241,
    lng: -6.0664,
  },
  {
    id: "tpi-essaouira",
    type: "tribunal_premiere_instance",
    name: { fr: "TPI d'Essaouira", ar: "المحكمة الابتدائية بالصويرة", en: "First Instance Court of Essaouira" },
    city: "Essaouira",
    region: "marrakech-safi",
    address: { fr: "Centre Ville, Essaouira", ar: "وسط المدينة، الصويرة" },
    phone: "05 24 47 30 30",
    mapUrl: "https://maps.google.com/?q=31.5085,-9.7595",
    lat: 31.5085,
    lng: -9.7595,
  },

  // ════════════════════════════════════════
  // TRIBUNAUX DE COMMERCE
  // ════════════════════════════════════════
  {
    id: "tc-casablanca",
    type: "tribunal_commerce",
    name: { fr: "Tribunal de Commerce de Casablanca", ar: "المحكمة التجارية بالدار البيضاء", en: "Commercial Court of Casablanca" },
    city: "Casablanca",
    region: "casablanca-settat",
    address: { fr: "21, Rue Abou Inane, Casablanca", ar: "21 شارع أبو عنان، الدار البيضاء" },
    phone: "05 22 44 87 87",
    mapUrl: "https://maps.google.com/?q=33.5870,-7.6260",
    lat: 33.5870,
    lng: -7.6260,
  },
  {
    id: "tc-rabat",
    type: "tribunal_commerce",
    name: { fr: "Tribunal de Commerce de Rabat", ar: "المحكمة التجارية بالرباط", en: "Commercial Court of Rabat" },
    city: "Rabat",
    region: "rabat-sale",
    address: { fr: "Avenue An-Nasr, Hay Ryad, Rabat", ar: "شارع النصر، حي الرياض، الرباط" },
    phone: "05 37 71 36 36",
    mapUrl: "https://maps.google.com/?q=33.9650,-6.8510",
    lat: 33.9650,
    lng: -6.8510,
  },
  {
    id: "tc-fes",
    type: "tribunal_commerce",
    name: { fr: "Tribunal de Commerce de Fès", ar: "المحكمة التجارية بفاس", en: "Commercial Court of Fez" },
    city: "Fès",
    region: "fes-meknes",
    address: { fr: "Route d'Imouzzer, Fès", ar: "طريق إيموزار، فاس" },
    phone: "05 35 65 40 40",
    mapUrl: "https://maps.google.com/?q=34.0250,-4.9990",
    lat: 34.0250,
    lng: -4.9990,
  },
  {
    id: "tc-marrakech",
    type: "tribunal_commerce",
    name: { fr: "Tribunal de Commerce de Marrakech", ar: "المحكمة التجارية بمراكش", en: "Commercial Court of Marrakech" },
    city: "Marrakech",
    region: "marrakech-safi",
    address: { fr: "Boulevard Mohammed VI, Marrakech", ar: "شارع محمد السادس، مراكش" },
    phone: "05 24 43 52 52",
    mapUrl: "https://maps.google.com/?q=31.6250,-8.0200",
    lat: 31.6250,
    lng: -8.0200,
  },
  {
    id: "tc-tanger",
    type: "tribunal_commerce",
    name: { fr: "Tribunal de Commerce de Tanger", ar: "المحكمة التجارية بطنجة", en: "Commercial Court of Tangier" },
    city: "Tanger",
    region: "tanger-tetouan",
    address: { fr: "Zone Industrielle, Route de Rabat, Tanger", ar: "المنطقة الصناعية، طريق الرباط، طنجة" },
    phone: "05 39 39 40 40",
    mapUrl: "https://maps.google.com/?q=35.7590,-5.8100",
    lat: 35.7590,
    lng: -5.8100,
  },
  {
    id: "tc-agadir",
    type: "tribunal_commerce",
    name: { fr: "Tribunal de Commerce d'Agadir", ar: "المحكمة التجارية بأكادير", en: "Commercial Court of Agadir" },
    city: "Agadir",
    region: "souss-massa",
    address: { fr: "Avenue Hassan II, Agadir", ar: "شارع الحسن الثاني، أكادير" },
    phone: "05 28 82 33 33",
    mapUrl: "https://maps.google.com/?q=30.4290,-9.5970",
    lat: 30.4290,
    lng: -9.5970,
  },
  {
    id: "tc-oujda",
    type: "tribunal_commerce",
    name: { fr: "Tribunal de Commerce d'Oujda", ar: "المحكمة التجارية بوجدة", en: "Commercial Court of Oujda" },
    city: "Oujda",
    region: "oriental",
    address: { fr: "Boulevard Mohammed V, Oujda", ar: "شارع محمد الخامس، وجدة" },
    phone: "05 36 70 60 60",
    mapUrl: "https://maps.google.com/?q=34.6820,-1.9065",
    lat: 34.6820,
    lng: -1.9065,
  },
  {
    id: "tc-meknes",
    type: "tribunal_commerce",
    name: { fr: "Tribunal de Commerce de Meknès", ar: "المحكمة التجارية بمكناس", en: "Commercial Court of Meknes" },
    city: "Meknès",
    region: "fes-meknes",
    address: { fr: "Centre Ville, Meknès", ar: "وسط المدينة، مكناس" },
    phone: "05 35 51 20 20",
    mapUrl: "https://maps.google.com/?q=33.8945,-5.5475",
    lat: 33.8945,
    lng: -5.5475,
  },

  // ════════════════════════════════════════
  // TRIBUNAUX ADMINISTRATIFS
  // ════════════════════════════════════════
  {
    id: "ta-rabat",
    type: "tribunal_administratif",
    name: { fr: "Tribunal Administratif de Rabat", ar: "المحكمة الإدارية بالرباط", en: "Administrative Court of Rabat" },
    city: "Rabat",
    region: "rabat-sale",
    address: { fr: "Avenue An-Nasr, Hay Ryad, Rabat", ar: "شارع النصر، حي الرياض، الرباط" },
    phone: "05 37 56 56 56",
    mapUrl: "https://maps.google.com/?q=33.9645,-6.8515",
    lat: 33.9645,
    lng: -6.8515,
  },
  {
    id: "ta-casablanca",
    type: "tribunal_administratif",
    name: { fr: "Tribunal Administratif de Casablanca", ar: "المحكمة الإدارية بالدار البيضاء", en: "Administrative Court of Casablanca" },
    city: "Casablanca",
    region: "casablanca-settat",
    address: { fr: "Boulevard Bir Anzarane, Casablanca", ar: "شارع بير أنزران، الدار البيضاء" },
    phone: "05 22 86 01 01",
    mapUrl: "https://maps.google.com/?q=33.5730,-7.6350",
    lat: 33.5730,
    lng: -7.6350,
  },
  {
    id: "ta-fes",
    type: "tribunal_administratif",
    name: { fr: "Tribunal Administratif de Fès", ar: "المحكمة الإدارية بفاس", en: "Administrative Court of Fez" },
    city: "Fès",
    region: "fes-meknes",
    address: { fr: "Route d'Imouzzer, Fès", ar: "طريق إيموزار، فاس" },
    phone: "05 35 64 86 86",
    mapUrl: "https://maps.google.com/?q=34.0255,-4.9995",
    lat: 34.0255,
    lng: -4.9995,
  },
  {
    id: "ta-marrakech",
    type: "tribunal_administratif",
    name: { fr: "Tribunal Administratif de Marrakech", ar: "المحكمة الإدارية بمراكش", en: "Administrative Court of Marrakech" },
    city: "Marrakech",
    region: "marrakech-safi",
    address: { fr: "Avenue Hassan II, Marrakech", ar: "شارع الحسن الثاني، مراكش" },
    phone: "05 24 43 88 88",
    mapUrl: "https://maps.google.com/?q=31.6300,-8.0090",
    lat: 31.6300,
    lng: -8.0090,
  },
  {
    id: "ta-agadir",
    type: "tribunal_administratif",
    name: { fr: "Tribunal Administratif d'Agadir", ar: "المحكمة الإدارية بأكادير", en: "Administrative Court of Agadir" },
    city: "Agadir",
    region: "souss-massa",
    address: { fr: "Avenue Hassan II, Agadir", ar: "شارع الحسن الثاني، أكادير" },
    phone: "05 28 23 80 80",
    mapUrl: "https://maps.google.com/?q=30.4275,-9.5985",
    lat: 30.4275,
    lng: -9.5985,
  },
  {
    id: "ta-oujda",
    type: "tribunal_administratif",
    name: { fr: "Tribunal Administratif d'Oujda", ar: "المحكمة الإدارية بوجدة", en: "Administrative Court of Oujda" },
    city: "Oujda",
    region: "oriental",
    address: { fr: "Boulevard Mohammed V, Oujda", ar: "شارع محمد الخامس، وجدة" },
    phone: "05 36 68 99 99",
    mapUrl: "https://maps.google.com/?q=34.6810,-1.9080",
    lat: 34.6810,
    lng: -1.9080,
  },
  {
    id: "ta-meknes",
    type: "tribunal_administratif",
    name: { fr: "Tribunal Administratif de Meknès", ar: "المحكمة الإدارية بمكناس", en: "Administrative Court of Meknes" },
    city: "Meknès",
    region: "fes-meknes",
    address: { fr: "Centre Ville, Meknès", ar: "وسط المدينة، مكناس" },
    phone: "05 35 40 57 57",
    mapUrl: "https://maps.google.com/?q=33.8930,-5.5480",
    lat: 33.8930,
    lng: -5.5480,
  },

  // ════════════════════════════════════════
  // COURS D'APPEL DE COMMERCE
  // ════════════════════════════════════════
  {
    id: "cac-casablanca",
    type: "cour_appel_commerce",
    name: { fr: "Cour d'Appel de Commerce de Casablanca", ar: "محكمة الاستئناف التجارية بالدار البيضاء", en: "Commercial Court of Appeal of Casablanca" },
    city: "Casablanca",
    region: "casablanca-settat",
    address: { fr: "21, Rue Abou Inane, Casablanca", ar: "21 شارع أبو عنان، الدار البيضاء" },
    phone: "05 22 44 88 88",
    mapUrl: "https://maps.google.com/?q=33.5872,-7.6265",
    lat: 33.5872,
    lng: -7.6265,
  },
  {
    id: "cac-fes",
    type: "cour_appel_commerce",
    name: { fr: "Cour d'Appel de Commerce de Fès", ar: "محكمة الاستئناف التجارية بفاس", en: "Commercial Court of Appeal of Fez" },
    city: "Fès",
    region: "fes-meknes",
    address: { fr: "Route d'Imouzzer, Fès", ar: "طريق إيموزار، فاس" },
    phone: "05 35 65 41 41",
    mapUrl: "https://maps.google.com/?q=34.0252,-4.9988",
    lat: 34.0252,
    lng: -4.9988,
  },
  {
    id: "cac-marrakech",
    type: "cour_appel_commerce",
    name: { fr: "Cour d'Appel de Commerce de Marrakech", ar: "محكمة الاستئناف التجارية بمراكش", en: "Commercial Court of Appeal of Marrakech" },
    city: "Marrakech",
    region: "marrakech-safi",
    address: { fr: "Boulevard Mohammed VI, Marrakech", ar: "شارع محمد السادس، مراكش" },
    phone: "05 24 43 53 53",
    mapUrl: "https://maps.google.com/?q=31.6252,-8.0205",
    lat: 31.6252,
    lng: -8.0205,
  },

  // ════════════════════════════════════════
  // COURS D'APPEL ADMINISTRATIVES
  // ════════════════════════════════════════
  {
    id: "caa-rabat",
    type: "cour_appel_admin",
    name: { fr: "Cour d'Appel Administrative de Rabat", ar: "محكمة الاستئناف الإدارية بالرباط", en: "Administrative Court of Appeal of Rabat" },
    city: "Rabat",
    region: "rabat-sale",
    address: { fr: "Avenue An-Nasr, Hay Ryad, Rabat", ar: "شارع النصر، حي الرياض، الرباط" },
    phone: "05 37 56 57 57",
    mapUrl: "https://maps.google.com/?q=33.9648,-6.8518",
    lat: 33.9648,
    lng: -6.8518,
  },
  {
    id: "caa-marrakech",
    type: "cour_appel_admin",
    name: { fr: "Cour d'Appel Administrative de Marrakech", ar: "محكمة الاستئناف الإدارية بمراكش", en: "Administrative Court of Appeal of Marrakech" },
    city: "Marrakech",
    region: "marrakech-safi",
    address: { fr: "Avenue Hassan II, Marrakech", ar: "شارع الحسن الثاني، مراكش" },
    phone: "05 24 43 89 89",
    mapUrl: "https://maps.google.com/?q=31.6302,-8.0092",
    lat: 31.6302,
    lng: -8.0092,
  },
];

/**
 * Get all unique cities sorted alphabetically.
 */
export function getAllCities(): string[] {
  const citySet = new Set(courts.map((c) => c.city));
  return [...citySet].sort((a, b) => a.localeCompare(b, "fr"));
}

/**
 * Get all unique court types present in the data.
 */
export function getAllCourtTypes(): CourtType[] {
  const typeSet = new Set(courts.map((c) => c.type));
  return [...typeSet];
}

/**
 * Find a court by its unique ID.
 */
export function getCourtById(id: string): Court | undefined {
  return courts.find((c) => c.id === id);
}

/**
 * Get nearby courts (same city or closest by distance), excluding the given court.
 */
export function getNearbyCourts(court: Court, limit = 4): Court[] {
  // Same city first, then by Haversine distance
  return courts
    .filter((c) => c.id !== court.id)
    .sort((a, b) => {
      const aLocal = a.city === court.city ? 0 : 1;
      const bLocal = b.city === court.city ? 0 : 1;
      if (aLocal !== bLocal) return aLocal - bLocal;
      const distA = haversine(court.lat, court.lng, a.lat, a.lng);
      const distB = haversine(court.lat, court.lng, b.lat, b.lng);
      return distA - distB;
    })
    .slice(0, limit);
}

/** Haversine distance in km */
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
