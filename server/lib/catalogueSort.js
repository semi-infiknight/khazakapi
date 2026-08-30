import { isCommercialCatalogueEntry } from "./kzCommercial.js";

/** Highest-impact KZ providers for app builders (substring match on provider/company). */
const PROVIDER_IMPACT = [
  ["kaspi", 100],
  ["2gis", 96],
  ["yandex", 92],
  ["halyk", 88],
  ["npck", 86],
  ["freedom", 84],
  ["wooppay", 82],
  ["woopkassa", 81],
  ["paybox", 80],
  ["glovo", 78],
  ["wolt", 77],
  ["chocofamily", 76],
  ["arbuz", 75],
  ["cdek", 74],
  ["kazpost", 72],
  ["wildberries", 70],
  ["ozon", 69],
  ["indriver", 68],
  ["beeline", 66],
  ["kcell", 65],
  ["tele2", 64],
  ["altel", 63],
  ["aviata", 62],
  ["air astana", 61],
  ["flyarystan", 60],
  ["scat", 59],
  ["ktz", 58],
  ["kazhydromet", 55],
  ["sigex", 54],
  ["forte", 52],
  ["bereke", 51],
  ["nbk", 45],
  ["national bank", 45],
  ["egov", 40],
  ["bureau", 38],
  ["stat.gov", 36],
  ["data.egov", 35],
];

const COMMERCIAL_CATEGORY_IMPACT = {
  Payments: 100,
  "Maps & location": 96,
  "Food & delivery": 92,
  "Travel & mobility": 88,
  "E-commerce": 86,
  "Logistics & delivery": 84,
  "Banking & finance": 82,
  "Communications": 78,
  AI: 76,
  "Cloud & infrastructure": 74,
  "Auth & identity": 72,
  "Government services": 68,
  "E-invoicing & tax": 66,
  Realtime: 64,
};

const OPEN_CATEGORY_IMPACT = {
  "Financial Markets": 40,
  Prices: 38,
  Demography: 36,
  "Government data": 34,
  "Population & society": 32,
  Metadata: 28,
  "Data Dictionaries": 26,
};

function providerBlob(entry) {
  return `${entry.provider || ""} ${entry.companyName || ""} ${entry.source || ""}`.toLowerCase();
}

function providerImpact(entry) {
  const blob = providerBlob(entry);
  for (const [needle, score] of PROVIDER_IMPACT) {
    if (blob.includes(needle)) return score;
  }
  return 0;
}

function categoryImpact(entry, commercial) {
  const map = commercial ? COMMERCIAL_CATEGORY_IMPACT : OPEN_CATEGORY_IMPACT;
  return map[entry.category] || (commercial ? 50 : 10);
}

/** Higher score = show earlier on the homepage catalogue. */
export function commercialImpactScore(entry) {
  const commercial = isCommercialCatalogueEntry(entry);
  let score = commercial ? 10_000 : 0;

  score += providerImpact(entry) * (commercial ? 1 : 0.35);
  score += categoryImpact(entry, commercial);

  if (commercial && entry.pricing === "freemium") score += 4;
  if (!commercial && entry.copyable && entry.auth === "none") score += 12;
  if (!commercial && entry.pricing === "free") score += 8;

  return score;
}

export function compareCatalogueByImpact(a, b) {
  const diff = commercialImpactScore(b) - commercialImpactScore(a);
  if (diff !== 0) return diff;
  return a.title.localeCompare(b.title);
}

export function sortCatalogueByImpact(apis) {
  return [...apis].sort(compareCatalogueByImpact);
}
