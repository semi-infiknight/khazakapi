/**
 * Curated per-category feature profiles — proper domain coverage (≥100 each).
 */

import { FEATURES, getFeature } from "./features.js";

export const MIN_FEATURES_PER_API = 100;

const ALL_IDS = new Set(FEATURES.map((f) => f.id));

export const INTEGRATION_CORE = [
  "api-integration",
  "rest-api",
  "webhook-callbacks",
  "oauth-flow",
  "api-key-auth",
  "bearer-token-auth",
  "pagination",
  "cursor-pagination",
  "filtering",
  "sorting",
  "field-selection",
  "error-handling",
  "rate-limit-handling",
  "retry-backoff",
  "idempotent-requests",
  "cache-responses",
  "monitoring-alerts",
  "request-logging",
  "api-versioning",
  "sandbox-testing",
  "production-keys",
  "bulk-read",
  "json-export",
  "batch-export",
  "mobile-app-backend",
  "web-app-backend",
  "admin-panel",
  "embed-widget",
  "data-visualization",
  "kpi-dashboard",
];

/** Generic API plumbing — not buildable product features; never assigned in per-API matrix. */
export const NON_BUILDABLE_MATRIX_FEATURES = new Set([
  ...INTEGRATION_CORE,
  "graphql-api",
]);

export const GOV_DATA_CORE = [
  "gov-open-data",
  "open-data-export",
  "regional-analytics",
  "historical-data",
  "metadata-catalog",
  "indicator-definitions",
  "dataset-revisions",
  "update-schedule",
  "csv-export",
  "excel-export",
  "pdf-reports",
  "etl-pipeline",
  "data-warehouse",
  "time-series-chart",
  "year-over-year",
  "quarter-compare",
  "map-choropleth",
  "oblast-filter",
  "city-filter",
  "district-filter",
  "year-filter",
  "gender-breakdown",
  "age-breakdown",
  "ethnicity-breakdown",
  "migration-stats",
  "birth-death-stats",
  "marriage-stats",
  "survey-microdata",
  "national-accounts",
  "population-stats",
  "gov-digital-services",
  "kazakh-language",
  "russian-language",
  "multi-language",
  "astana-hub",
  "almaty-region",
  "tenge-pricing",
  "api-catalogue",
  "schema-documentation",
  "data-quality-scores",
  "statistical-methodology",
  "benchmark-revisions",
  "statgov-indicators",
  "dataegov-datasets",
];

export const MAPS_MOBILITY_CORE = [
  "address-geocoding",
  "forward-geocode",
  "reverse-geocode",
  "address-autocomplete",
  "address-validation",
  "postal-code-lookup",
  "geocoding-batch",
  "poi-search",
  "nearby-search",
  "store-locator",
  "map-display",
  "static-map-images",
  "map-clustering",
  "custom-map-markers",
  "panorama-streetview",
  "device-location",
  "route-planning",
  "multi-stop-routing",
  "traffic-aware-routing",
  "delivery-eta",
  "delivery-zones",
  "logistics-routing",
  "geofencing",
  "courier-tracking",
  "delivery-slot-booking",
  "map-geofence-alerts",
  "fleet-telematics",
  "route-optimization",
  "isochrone-analysis",
  "matrix-routing",
  "2gis-routing",
  "2gis-places",
];

export const PAYMENTS_CORE = [
  "checkout-payment",
  "wallet-payout",
  "qr-checkout",
  "payment-links",
  "recurring-billing",
  "split-payments",
  "refund-flow",
  "payment-status",
  "transaction-history",
  "merchant-dashboard",
  "bank-accounts",
  "fx-rates",
  "interest-rates",
  "currency-converter",
  "loan-calculator",
  "kyc-verification",
  "consent-management",
  "invoice-generation",
  "vat-calculation",
  "tax-invoicing",
  "user-auth",
  "sms-otp",
  "pci-compliance",
  "fraud-detection",
  "3ds-authentication",
  "apple-pay-integration",
  "google-pay-integration",
  "terminal-pos",
  "escrow-payments",
  "tip-payments",
  "chargeback-management",
  "open-banking-ais",
  "open-banking-pis",
  "freedompay-checkout",
  "kaspi-merchant",
  "nbk-rates-feed",
  "esf-invoicing",
];

export const COMMERCE_CORE = [
  "marketplace-sync",
  "product-catalog",
  "inventory-sync",
  "order-status",
  "order-cancellation",
  "promo-codes",
  "loyalty-points",
  "food-delivery-partner",
  "grocery-delivery",
  "restaurant-menu",
  "kitchen-display",
  "parcel-shipping",
  "shipping-labels",
  "return-parcels",
  "wildberries-seller",
  "ozon-seller",
  "yandex-market-seller",
  "cdek-tracking",
  "kazpost-tracking",
  "arbuz-integration",
];

export const AI_CORE = [
  "ai-assistant",
  "text-generation",
  "text-summarization",
  "chat-completion",
  "embeddings-search",
  "content-moderation",
  "speech-ai",
  "voice-input",
  "voice-output",
  "computer-vision",
  "document-ocr",
  "site-search",
  "analytics-tracking",
  "conversion-tracking",
  "funnel-analysis",
  "ads-campaigns",
  "campaign-analytics",
  "seo-webmaster",
  "cloud-hosting",
  "serverless-functions",
  "alice-voice-skill",
  "yandexgpt-prompts",
  "image-generation",
  "sentiment-analysis",
  "named-entity-extraction",
  "rag-retrieval",
  "yandex-metrica-events",
  "yandex-direct-campaigns",
];

export const CLOUD_CORE = [
  "cloud-hosting",
  "object-storage-upload",
  "cdn-delivery",
  "serverless-functions",
  "managed-database",
  "monitoring-alerts",
  "data-warehouse",
  "etl-pipeline",
  "realtime-streams",
  "webhook-callbacks",
  "yandex-cloud-compute",
  "yandex-cloud-storage",
  "graphql-subscriptions",
  "sse-streaming",
  "ip-allowlisting",
  "live-dashboard",
  "ops-alerting",
];

export const TRAVEL_CORE = [
  "travel-booking",
  "flight-search",
  "train-search",
  "seat-selection",
  "boarding-pass",
  "ride-hailing",
  "ride-estimate",
  "driver-tracking",
  "trip-history",
  "indriver-api",
  "tourism-arrivals",
  "hotel-occupancy",
];

export const GOV_STAT_CATEGORIES = new Set([
  "Government data",
  "Demography",
  "Population & society",
  "Households",
  "Housing & property",
  "Property",
  "Education",
  "Health",
  "Healthcare",
  "Labour Markets",
  "Work & income",
  "National Accounts",
  "Prices",
  "Financial Markets",
  "Finance",
  "Economic Sectors",
  "Economy & business",
  "Environment",
  "Environment & climate",
  "Transport",
  "Transportation",
  "Public Safety",
  "Public Welfare",
  "Public Administration",
  "Statistical Indicators",
  "Metadata",
  "Data Dictionaries",
  "Commodities & metals",
]);

/** Commercial product categories — excluded from gov/stat expanded profiles. */
const COMMERCIAL_PRODUCT_CATEGORIES = new Set([
  "Payments",
  "E-commerce",
  "Food & delivery",
  "Logistics & delivery",
  "Maps & location",
  "Travel & mobility",
  "Auth & identity",
  "Communications",
  "AI",
  "Cloud & infrastructure",
  "Crypto",
  "Realtime",
  "Banking",
  "Banking & finance",
]);

function relatedCategoriesForProfile(category) {
  const related = RELATED_CATEGORIES[category] || [];
  if (!GOV_STAT_CATEGORIES.has(category)) return related;
  return related.filter((c) => GOV_STAT_CATEGORIES.has(c));
}

export function featureAllowedInGovProfile(feature) {
  if (!feature) return false;
  if (GOV_DATA_CORE.includes(feature.id)) return true;
  const cats = feature.categories || [];
  if (!cats.length) return true;
  if (cats.some((c) => GOV_STAT_CATEGORIES.has(c))) return true;
  if (cats.every((c) => COMMERCIAL_PRODUCT_CATEGORIES.has(c))) return false;
  return true;
}

export const RELATED_CATEGORIES = {
  Prices: ["National Accounts", "Financial Markets", "Finance", "Commodities & metals"],
  "Financial Markets": ["Prices", "Finance", "National Accounts", "Banking & finance"],
  Finance: ["Financial Markets", "Prices", "Banking & finance", "Payments"],
  Demography: ["Population & society", "Households", "Health"],
  "Population & society": ["Demography", "Households", "Education", "Health"],
  Households: ["Population & society", "Prices", "Labour Markets"],
  "Housing & property": ["Property", "Maps & location", "Population & society"],
  Property: ["Housing & property", "Maps & location"],
  Education: ["Population & society", "Demography", "Labour Markets"],
  Health: ["Healthcare", "Population & society", "Public Safety"],
  Healthcare: ["Health", "Government services"],
  "Labour Markets": ["Work & income", "Education", "Households"],
  "Work & income": ["Labour Markets", "Households", "Prices"],
  "National Accounts": ["Prices", "Financial Markets", "Economic Sectors"],
  "Economic Sectors": ["National Accounts", "Economy & business"],
  "Economy & business": ["National Accounts", "Economic Sectors", "Prices"],
  Environment: ["Environment & climate", "Government data"],
  "Environment & climate": ["Environment", "Government data"],
  Transport: ["Transportation", "Travel & mobility"],
  Transportation: ["Transport", "Logistics & delivery", "Travel & mobility"],
  "Maps & location": ["Logistics & delivery", "Travel & mobility", "E-commerce"],
  "Logistics & delivery": ["Maps & location", "Food & delivery", "E-commerce"],
  "Food & delivery": ["E-commerce", "Logistics & delivery", "Payments"],
  "E-commerce": ["Payments", "Logistics & delivery", "Food & delivery"],
  Payments: ["Banking & finance", "E-commerce", "Auth & identity"],
  "Banking & finance": ["Payments", "Finance", "Auth & identity"],
  Banking: ["Banking & finance", "Payments", "Finance"],
  AI: ["Cloud & infrastructure", "Communications", "Data & enrichment"],
  Communications: ["AI", "Auth & identity", "Cloud & infrastructure"],
  "Cloud & infrastructure": ["AI", "Communications", "Data & enrichment"],
  "Travel & mobility": ["Transport", "Maps & location", "Payments"],
  "Auth & identity": ["Government services", "Banking & finance", "Payments"],
  "Government services": ["Auth & identity", "Government data", "Public Administration"],
  "E-invoicing & tax": ["Payments", "Banking & finance", "Auth & identity", "Public Administration"],
  Crypto: ["Finance", "Payments", "Banking & finance"],
  "Data & enrichment": ["Cloud & infrastructure", "Auth & identity", "AI"],
  Realtime: ["Cloud & infrastructure", "Communications", "Maps & location"],
  "Other portals": ["Communications", "Realtime", "Environment & climate"],
};

function uniq(list) {
  const out = [];
  const seen = new Set();
  for (const id of list) {
    if (!ALL_IDS.has(id) || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

function featuresTaggedCategory(category) {
  return FEATURES.filter((f) => (f.categories || []).includes(category)).map((f) => f.id);
}

function featuresTaggedCategories(categories) {
  return uniq(categories.flatMap((c) => featuresTaggedCategory(c)));
}

function allGovTaggedFeatures() {
  return FEATURES.filter(
    (f) =>
      (f.categories || []).some((c) => GOV_STAT_CATEGORIES.has(c)) ||
      f.parentId === "gov-open-data" ||
      f.capabilityTags?.some((t) => /gov|stat/i.test(t)),
  ).map((f) => f.id);
}

function domainBlockForCategory(category) {
  if (category === "E-invoicing & tax") {
    return [
      ...PAYMENTS_CORE,
      "tax-invoicing",
      "invoice-generation",
      "vat-calculation",
      "esf-invoicing",
      "gov-digital-services",
      "esignature",
      "sigex-signing",
      "user-auth",
      "pdf-reports",
    ];
  }
  if (GOV_STAT_CATEGORIES.has(category)) return [GOV_DATA_CORE, allGovTaggedFeatures()];
  if (["Maps & location", "Logistics & delivery", "Travel & mobility", "Transport", "Transportation"].includes(category)) {
    return [MAPS_MOBILITY_CORE, TRAVEL_CORE];
  }
  if (["Payments", "Banking & finance", "Banking", "Finance", "Financial Markets"].includes(category)) {
    return [PAYMENTS_CORE];
  }
  if (["E-commerce", "Food & delivery"].includes(category)) {
    return [COMMERCE_CORE, PAYMENTS_CORE.slice(0, 15)];
  }
  if (category === "AI" || category === "Communications") {
    return [...AI_CORE, ...CLOUD_CORE, ...featuresTaggedCategory("Data & enrichment")];
  }
  if (["Cloud & infrastructure", "Data & enrichment", "Realtime"].includes(category)) {
    return [...CLOUD_CORE, ...AI_CORE, ...featuresTaggedCategory("Communications")];
  }
  if (category === "Crypto") {
    return [...PAYMENTS_CORE.slice(0, 15), "crypto-trading", "crypto-wallet", "crypto-price-feed"];
  }
  if (category === "Auth & identity" || category === "Government services") {
    return [
      ...PAYMENTS_CORE.filter((id) =>
        ["user-auth", "kyc-verification", "esignature", "sms-otp", "oauth-flow", "bearer-token-auth", "api-key-auth"].includes(id),
      ),
      "sigex-signing",
      "gov-digital-services",
      "identity-verification",
      "mTLS-auth",
    ];
  }
  if (category === "Other portals") {
    return uniq([
      "prayer-times",
      "prayer-notifications",
      "islamic-calendar",
      "weather-forecast",
      "weather-extremes",
      "climate-data",
      "embed-widget",
      "notifications-push",
      "analytics-tracking",
      "site-search",
      "seo-webmaster",
      "multi-language",
      "kazakh-language",
      "russian-language",
      "mobile-app-backend",
      "web-app-backend",
      "realtime-streams",
      "live-dashboard",
      "ops-alerting",
      "map-display",
      "device-location",
      ...AI_CORE,
      ...featuresTaggedCategories(["Communications", "Realtime", "Environment & climate"]),
    ]);
  }
  return [];
}

function categoryUnionFeatures(category) {
  const cats = new Set([category, ...relatedCategoriesForProfile(category)]);
  for (const r of [...cats]) {
    for (const rr of relatedCategoriesForProfile(r)) cats.add(rr);
  }
  return FEATURES.filter((f) => {
    if (!f.categories?.some((c) => cats.has(c))) return false;
    if (GOV_STAT_CATEGORIES.has(category) && !featureAllowedInGovProfile(f)) return false;
    return true;
  }).map((f) => f.id);
}

function fillProfileToMin(profile, category) {
  const allowedCats = new Set([category, ...relatedCategoriesForProfile(category)]);
  for (const r of [...allowedCats]) {
    for (const rr of relatedCategoriesForProfile(r)) allowedCats.add(rr);
  }
  const isGov = GOV_STAT_CATEGORIES.has(category);

  const pools = [
    domainBlockForCategory(category).flat(),
    categoryUnionFeatures(category),
    isGov ? allGovTaggedFeatures() : [],
  ];

  for (const pool of pools) {
    for (const id of pool) {
      if (profile.length >= MIN_FEATURES_PER_API) return profile;
      if (!profile.includes(id) && ALL_IDS.has(id)) {
        if (isGov) {
          const f = getFeature(id);
          if (f && !featureAllowedInGovProfile(f)) continue;
        }
        profile.push(id);
      }
    }
  }

  for (const f of FEATURES) {
    if (profile.length >= MIN_FEATURES_PER_API) break;
    if (isGov && !featureAllowedInGovProfile(f)) continue;
    if (f.categories?.some((c) => allowedCats.has(c)) && !profile.includes(f.id)) profile.push(f.id);
  }

  return profile;
}

export function buildCategoryProfile(category) {
  const related = relatedCategoriesForProfile(category);
  const isGov = GOV_STAT_CATEGORIES.has(category);

  function filterGov(ids) {
    if (!isGov) return ids;
    return ids.filter((id) => {
      const f = getFeature(id);
      return !f || featureAllowedInGovProfile(f);
    });
  }

  const blocks = [
    featuresTaggedCategory(category),
    filterGov(featuresTaggedCategories(related)),
    categoryUnionFeatures(category),
    domainBlockForCategory(category),
  ];

  let profile = uniq(blocks.flat());

  const overflow = uniq([
    ...categoryUnionFeatures(category),
    ...domainBlockForCategory(category),
    ...(isGov ? allGovTaggedFeatures() : []),
  ]);

  for (const id of filterGov(overflow)) {
    if (profile.length >= MIN_FEATURES_PER_API) break;
    if (!profile.includes(id)) profile.push(id);
  }

  profile = fillProfileToMin(profile, category);

  return profile;
}

import { KZ_APIS } from "../data/apis.js";

export const CATEGORY_FEATURE_PROFILES = Object.fromEntries(
  [...new Set(KZ_APIS.map((a) => a.category))].map((cat) => [cat, buildCategoryProfile(cat)]),
);

export function profileForCategory(category) {
  return CATEGORY_FEATURE_PROFILES[category] || buildCategoryProfile(category);
}

export function validateProfiles(min = MIN_FEATURES_PER_API) {
  return Object.entries(CATEGORY_FEATURE_PROFILES)
    .filter(([, profile]) => profile.length < min)
    .map(([category, profile]) => ({ category, count: profile.length }));
}

const shortProfiles = validateProfiles();
if (shortProfiles.length) {
  console.warn(
    `[categoryFeatureProfiles] ${shortProfiles.length} categories below ${MIN_FEATURES_PER_API}:`,
    shortProfiles.map((r) => `${r.category}(${r.count})`).join(", "),
  );
}
