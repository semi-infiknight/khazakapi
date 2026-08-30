/**
 * Expand per-API product feature lists beyond strict capability atoms.
 * Primary features (capability-derived) drive suggest matching; expanded features
 * power catalogue detail pages and completeness reporting.
 */

import { FEATURES, getFeature } from "./features.js";
import { capabilitiesToFeatureIds } from "./capabilityMap.js";

export const MIN_FEATURES_PER_API = 100;

/** Default bundles for categories with thin ontology coverage. */
export const CATEGORY_FEATURE_BUNDLES = {
  AI: [
    "ai-assistant",
    "speech-ai",
    "computer-vision",
    "site-search",
    "analytics-tracking",
    "cloud-hosting",
    "user-auth",
    "data-visualization",
    "api-integration",
    "batch-export",
  ],
  "Auth & identity": [
    "user-auth",
    "esignature",
    "sms-otp",
    "checkout-payment",
    "bank-accounts",
    "gov-digital-services",
    "api-integration",
    "data-visualization",
    "analytics-tracking",
    "batch-export",
  ],
  Banking: [
    "bank-accounts",
    "checkout-payment",
    "wallet-payout",
    "fx-rates",
    "interest-rates",
    "user-auth",
    "open-data-export",
    "data-visualization",
    "api-integration",
    "batch-export",
  ],
  "Banking & finance": [
    "bank-accounts",
    "checkout-payment",
    "wallet-payout",
    "fx-rates",
    "interest-rates",
    "price-indices",
    "user-auth",
    "analytics-tracking",
    "data-visualization",
    "api-integration",
  ],
  "Cloud & infrastructure": [
    "cloud-hosting",
    "api-integration",
    "analytics-tracking",
    "user-auth",
    "data-visualization",
    "batch-export",
    "realtime-streams",
    "site-search",
    "checkout-payment",
    "map-display",
  ],
  "Commodities & metals": [
    "commodity-prices",
    "price-indices",
    "fx-rates",
    "trade-statistics",
    "gov-open-data",
    "national-accounts",
    "data-visualization",
    "regional-analytics",
    "open-data-export",
    "batch-export",
  ],
  Communications: [
    "sms-otp",
    "workplace-productivity",
    "analytics-tracking",
    "ads-campaigns",
    "site-search",
    "seo-webmaster",
    "user-auth",
    "notifications-push",
    "api-integration",
    "data-visualization",
  ],
  Crypto: [
    "crypto-trading",
    "fx-rates",
    "checkout-payment",
    "wallet-payout",
    "user-auth",
    "analytics-tracking",
    "realtime-streams",
    "api-integration",
    "data-visualization",
    "batch-export",
  ],
  "Data & enrichment": [
    "data-enrichment",
    "address-geocoding",
    "user-auth",
    "analytics-tracking",
    "site-search",
    "api-integration",
    "data-visualization",
    "batch-export",
    "realtime-streams",
    "gov-open-data",
  ],
  "Data Dictionaries": [
    "metadata-catalog",
    "gov-open-data",
    "open-data-export",
    "data-visualization",
    "regional-analytics",
    "historical-data",
    "batch-export",
    "api-integration",
    "population-stats",
    "national-accounts",
  ],
  Demography: [
    "population-stats",
    "gov-open-data",
    "household-stats",
    "data-visualization",
    "regional-analytics",
    "historical-data",
    "open-data-export",
    "batch-export",
    "api-integration",
    "national-accounts",
  ],
  "E-commerce": [
    "marketplace-sync",
    "checkout-payment",
    "parcel-shipping",
    "food-delivery-partner",
    "grocery-delivery",
    "address-autocomplete",
    "delivery-eta",
    "user-auth",
    "analytics-tracking",
    "api-integration",
  ],
  "E-invoicing & tax": [
    "tax-invoicing",
    "checkout-payment",
    "esignature",
    "gov-digital-services",
    "user-auth",
    "analytics-tracking",
    "batch-export",
    "api-integration",
    "data-visualization",
    "wallet-payout",
  ],
  "Economic Sectors": [
    "industry-sectors",
    "national-accounts",
    "trade-statistics",
    "gov-open-data",
    "price-indices",
    "data-visualization",
    "regional-analytics",
    "historical-data",
    "open-data-export",
    "batch-export",
  ],
  "Economy & business": [
    "national-accounts",
    "trade-statistics",
    "industry-sectors",
    "gov-open-data",
    "price-indices",
    "labour-stats",
    "data-visualization",
    "regional-analytics",
    "open-data-export",
    "batch-export",
  ],
  Education: [
    "education-stats",
    "gov-open-data",
    "population-stats",
    "data-visualization",
    "regional-analytics",
    "historical-data",
    "open-data-export",
    "batch-export",
    "api-integration",
    "national-accounts",
  ],
  Environment: [
    "environment-stats",
    "climate-data",
    "weather-forecast",
    "gov-open-data",
    "data-visualization",
    "regional-analytics",
    "historical-data",
    "open-data-export",
    "batch-export",
    "map-display",
  ],
  "Environment & climate": [
    "climate-data",
    "environment-stats",
    "weather-forecast",
    "gov-open-data",
    "data-visualization",
    "regional-analytics",
    "historical-data",
    "open-data-export",
    "batch-export",
    "map-display",
  ],
  Finance: [
    "fx-rates",
    "interest-rates",
    "bank-accounts",
    "checkout-payment",
    "price-indices",
    "national-accounts",
    "data-visualization",
    "analytics-tracking",
    "api-integration",
    "batch-export",
  ],
  "Financial Markets": [
    "fx-rates",
    "interest-rates",
    "price-indices",
    "national-accounts",
    "gov-open-data",
    "bank-accounts",
    "data-visualization",
    "historical-data",
    "open-data-export",
    "batch-export",
  ],
  "Food & delivery": [
    "food-delivery-partner",
    "grocery-delivery",
    "delivery-eta",
    "route-planning",
    "address-autocomplete",
    "checkout-payment",
    "map-display",
    "analytics-tracking",
    "api-integration",
    "parcel-shipping",
  ],
  "Government data": [
    "gov-open-data",
    "population-stats",
    "national-accounts",
    "data-visualization",
    "regional-analytics",
    "historical-data",
    "open-data-export",
    "batch-export",
    "api-integration",
    "metadata-catalog",
  ],
  "Government services": [
    "gov-digital-services",
    "user-auth",
    "esignature",
    "gov-open-data",
    "sms-otp",
    "checkout-payment",
    "data-visualization",
    "api-integration",
    "batch-export",
    "analytics-tracking",
  ],
  Health: [
    "health-stats",
    "gov-open-data",
    "population-stats",
    "data-visualization",
    "regional-analytics",
    "historical-data",
    "open-data-export",
    "batch-export",
    "api-integration",
    "public-safety",
  ],
  Healthcare: [
    "health-stats",
    "gov-open-data",
    "user-auth",
    "sms-otp",
    "data-visualization",
    "regional-analytics",
    "historical-data",
    "open-data-export",
    "api-integration",
    "analytics-tracking",
  ],
  Households: [
    "household-stats",
    "population-stats",
    "gov-open-data",
    "price-indices",
    "data-visualization",
    "regional-analytics",
    "historical-data",
    "open-data-export",
    "batch-export",
    "national-accounts",
  ],
  "Housing & property": [
    "housing-stats",
    "address-geocoding",
    "map-display",
    "forward-geocode",
    "gov-open-data",
    "data-visualization",
    "regional-analytics",
    "historical-data",
    "open-data-export",
    "batch-export",
  ],
  "Labour Markets": [
    "labour-stats",
    "gov-open-data",
    "population-stats",
    "education-stats",
    "data-visualization",
    "regional-analytics",
    "historical-data",
    "open-data-export",
    "batch-export",
    "national-accounts",
  ],
  "Logistics & delivery": [
    "parcel-shipping",
    "delivery-eta",
    "route-planning",
    "logistics-routing",
    "address-autocomplete",
    "map-display",
    "checkout-payment",
    "analytics-tracking",
    "api-integration",
    "food-delivery-partner",
  ],
  "Maps & location": [
    "address-geocoding",
    "forward-geocode",
    "reverse-geocode",
    "address-autocomplete",
    "poi-search",
    "map-display",
    "route-planning",
    "delivery-eta",
    "device-location",
    "logistics-routing",
  ],
  Metadata: [
    "metadata-catalog",
    "gov-open-data",
    "open-data-export",
    "data-visualization",
    "batch-export",
    "api-integration",
    "historical-data",
    "regional-analytics",
    "population-stats",
    "national-accounts",
  ],
  "National Accounts": [
    "national-accounts",
    "gov-open-data",
    "price-indices",
    "fx-rates",
    "trade-statistics",
    "data-visualization",
    "regional-analytics",
    "historical-data",
    "open-data-export",
    "batch-export",
  ],
  "Other portals": [
    "prayer-times",
    "map-display",
    "weather-forecast",
    "user-auth",
    "analytics-tracking",
    "api-integration",
    "data-visualization",
    "notifications-push",
    "site-search",
    "batch-export",
  ],
  Payments: [
    "checkout-payment",
    "wallet-payout",
    "user-auth",
    "sms-otp",
    "bank-accounts",
    "fx-rates",
    "analytics-tracking",
    "api-integration",
    "data-visualization",
    "batch-export",
  ],
  "Population & society": [
    "population-stats",
    "gov-open-data",
    "household-stats",
    "education-stats",
    "health-stats",
    "data-visualization",
    "regional-analytics",
    "historical-data",
    "open-data-export",
    "batch-export",
  ],
  Prices: [
    "price-indices",
    "fx-rates",
    "fuel-prices",
    "commodity-prices",
    "gov-open-data",
    "data-visualization",
    "regional-analytics",
    "historical-data",
    "open-data-export",
    "batch-export",
  ],
  Property: [
    "housing-stats",
    "address-geocoding",
    "map-display",
    "forward-geocode",
    "gov-open-data",
    "data-visualization",
    "regional-analytics",
    "historical-data",
    "open-data-export",
    "checkout-payment",
  ],
  "Public Administration": [
    "gov-open-data",
    "gov-digital-services",
    "user-auth",
    "esignature",
    "population-stats",
    "data-visualization",
    "regional-analytics",
    "open-data-export",
    "batch-export",
    "api-integration",
  ],
  "Public Safety": [
    "public-safety",
    "gov-open-data",
    "map-display",
    "health-stats",
    "data-visualization",
    "regional-analytics",
    "historical-data",
    "open-data-export",
    "batch-export",
    "analytics-tracking",
  ],
  "Public Welfare": [
    "welfare-benefits",
    "gov-open-data",
    "population-stats",
    "household-stats",
    "health-stats",
    "data-visualization",
    "regional-analytics",
    "open-data-export",
    "batch-export",
    "national-accounts",
  ],
  Realtime: [
    "realtime-streams",
    "analytics-tracking",
    "notifications-push",
    "api-integration",
    "map-display",
    "device-location",
    "data-visualization",
    "checkout-payment",
    "user-auth",
    "batch-export",
  ],
  "Statistical Indicators": [
    "gov-open-data",
    "national-accounts",
    "population-stats",
    "price-indices",
    "data-visualization",
    "regional-analytics",
    "historical-data",
    "open-data-export",
    "batch-export",
    "metadata-catalog",
  ],
  Transport: [
    "transport-stats",
    "travel-booking",
    "route-planning",
    "map-display",
    "gov-open-data",
    "data-visualization",
    "regional-analytics",
    "historical-data",
    "open-data-export",
    "batch-export",
  ],
  Transportation: [
    "transport-stats",
    "route-planning",
    "logistics-routing",
    "delivery-eta",
    "map-display",
    "ride-hailing",
    "gov-open-data",
    "data-visualization",
    "open-data-export",
    "batch-export",
  ],
  "Travel & mobility": [
    "travel-booking",
    "ride-hailing",
    "route-planning",
    "delivery-eta",
    "map-display",
    "address-autocomplete",
    "checkout-payment",
    "analytics-tracking",
    "api-integration",
    "device-location",
  ],
  "Work & income": [
    "labour-stats",
    "household-stats",
    "gov-open-data",
    "price-indices",
    "data-visualization",
    "regional-analytics",
    "historical-data",
    "open-data-export",
    "batch-export",
    "national-accounts",
  ],
};

const GROUP_BUNDLE = {
  "Government & open data": [
    "gov-open-data",
    "open-data-export",
    "data-visualization",
    "regional-analytics",
    "historical-data",
    "batch-export",
    "api-integration",
    "metadata-catalog",
    "csv-export",
    "json-export",
    "oblast-filter",
    "year-filter",
    "indicator-definitions",
  ],
  Build: [
    "api-integration",
    "rest-api",
    "webhook-callbacks",
    "error-handling",
    "rate-limit-handling",
    "cache-responses",
    "mobile-app-backend",
    "monitoring-alerts",
  ],
};

const COMMERCIAL_CATEGORIES = new Set([
  "Maps & location",
  "Payments",
  "Banking & finance",
  "Banking",
  "Finance",
  "E-commerce",
  "Food & delivery",
  "Logistics & delivery",
  "Travel & mobility",
  "AI",
  "Cloud & infrastructure",
  "Communications",
  "Auth & identity",
  "E-invoicing & tax",
]);

function scoreFeatureForApi(feature, api, primaryCaps, providerBlob) {
  let score = 0;
  if ((feature.categories || []).includes(api.category)) score += 6;
  if (api.tier === "commercial" && (feature.categories || []).some((c) => COMMERCIAL_CATEGORIES.has(c))) score += 2;
  if (api.group === "Government & open data") {
    if (feature.capabilityTags?.some((t) => /gov|stat/i.test(t))) score += 4;
    if (feature.parentId === "gov-open-data" || feature.id === "gov-open-data") score += 3;
  }
  if (feature.capabilityTags?.some((t) => primaryCaps.has(t))) score += 5;
  if ((feature.providers || []).some((p) => providerBlob.includes(p.toLowerCase()))) score += 4;
  if (feature.parentId && primaryCaps.size === 0) score += 1;
  return score;
}

function addSiblings(expanded, sources, seedIds) {
  for (const id of seedIds) {
    const f = getFeature(id);
    if (!f) continue;
    for (const sibling of FEATURES) {
      if (sibling.id === id) continue;
      if (sibling.parentId && f.parentId && sibling.parentId === f.parentId) {
        addFeature(expanded, sources, "sibling", sibling.id);
      }
      if (sibling.parentId === id) addFeature(expanded, sources, "sibling", sibling.id);
    }
  }
}

function padToMinimum(expanded, sources, api, primaryCaps, providerBlob) {
  if (expanded.size >= MIN_FEATURES_PER_API) return;

  const ranked = FEATURES.map((f) => ({
    id: f.id,
    score: scoreFeatureForApi(f, api, primaryCaps, providerBlob),
  }))
    .filter((row) => !expanded.has(row.id))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));

  for (const row of ranked) {
    if (expanded.size >= MIN_FEATURES_PER_API) break;
    addFeature(expanded, sources, "floor", row.id);
  }
}

const VALID_FEATURE_IDS = new Set(FEATURES.map((f) => f.id));

function normalize(text = "") {
  return String(text).toLowerCase().replace(/ё/g, "е");
}

function featureMatchBlob(api) {
  const fields = [api.title, api.note, api.category, api.provider, api.companyName, api.apiType];
  if (api.tier !== "commercial") fields.push(api.setup?.summary);
  return normalize(fields.filter(Boolean).join(" "));
}

function keywordMatches(blob, kw) {
  const k = String(kw).toLowerCase();
  if (k.length < 4) {
    return new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(blob);
  }
  if (k.includes(" ")) return blob.includes(k);
  return new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(blob);
}

function addFeature(set, sources, bucket, id) {
  if (!VALID_FEATURE_IDS.has(id)) return;
  if (!set.has(id)) sources[bucket].push(id);
  set.add(id);
}

/**
 * @param {object} api
 * @param {string[]} capabilities
 * @param {{ docText?: string }} [options]
 */
export function expandApiFeatures(api, capabilities = [], options = {}) {
  const docText = options.docText || "";
  const blob = featureMatchBlob(api);
  const docBlob = normalize(docText);
  const providerBlob = normalize(`${api.provider || ""} ${api.companyName || ""}`);

  const primary = new Set(capabilitiesToFeatureIds(capabilities));
  const expanded = new Set(primary);
  const sources = {
    primary: [...primary],
    category: [],
    keyword: [],
    provider: [],
    parent: [],
    bundle: [],
    group: [],
    doc: [],
    sibling: [],
    floor: [],
  };

  const primaryCaps = new Set(capabilities);

  for (const f of FEATURES) {
    if ((f.categories || []).includes(api.category)) {
      addFeature(expanded, sources, "category", f.id);
    }
  }

  for (const f of FEATURES) {
    const hitBlob = (f.keywords || []).some((kw) => keywordMatches(blob, kw));
    const hitDoc = docBlob && (f.keywords || []).some((kw) => keywordMatches(docBlob, kw));
    if (hitBlob) addFeature(expanded, sources, "keyword", f.id);
    else if (hitDoc) addFeature(expanded, sources, "doc", f.id);
  }

  for (const f of FEATURES) {
    const hit = (f.providers || []).some((p) => providerBlob.includes(p.toLowerCase()));
    if (hit) addFeature(expanded, sources, "provider", f.id);
  }

  for (const id of [...expanded]) {
    const parentId = getFeature(id)?.parentId;
    if (parentId) addFeature(expanded, sources, "parent", parentId);
  }

  for (const id of CATEGORY_FEATURE_BUNDLES[api.category] || []) {
    addFeature(expanded, sources, "bundle", id);
  }

  for (const id of GROUP_BUNDLE[api.group] || []) {
    addFeature(expanded, sources, "group", id);
  }

  addSiblings(expanded, sources, [...expanded]);
  for (const id of [...expanded]) {
    const parentId = getFeature(id)?.parentId;
    if (parentId) addFeature(expanded, sources, "parent", parentId);
  }

  padToMinimum(expanded, sources, api, primaryCaps, providerBlob);

  return {
    primaryFeatures: [...primary].sort(),
    features: [...expanded].sort(),
    sources,
  };
}
