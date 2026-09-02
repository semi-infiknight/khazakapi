import { capabilitiesToPrimaryFeatureIds } from "./capabilityMap.js";
import { expandApiFeatures } from "./expandApiFeatures.js";
import { GOV_STAT_CATEGORIES } from "./categoryFeatureProfiles.js";
import { getMatrixCapabilities, getMatrixFeatures, getMatrixPrimaryFeatures } from "./apiCapabilityMatrix.js";

/** @type {Record<string, string[]>} */
export const API_CAPABILITY_OVERRIDES = {
  // —— 2GIS ——
  "kz-2gis-geocoder": ["geocode", "forward-geocode", "reverse-geocode"],
  "kz-2gis-suggest": ["address-autocomplete", "geocode"],
  "kz-2gis-distance-matrix": ["distance-matrix", "delivery-eta"],
  "kz-2gis-routing": ["routing", "route-planning", "delivery-eta"],
  "kz-2gis-isochrone": ["isochrone", "delivery-zones"],
  "kz-2gis-catalog": ["poi-search", "places"],
  "kz-2gis-public-transport": ["routing", "route-planning", "public-transport"],
  "kz-2gis-regions": ["geocode", "admin-regions"],

  // —— Yandex Maps ——
  "yandex-geocoder": ["geocode", "forward-geocode", "reverse-geocode"],
  "yandex-geosuggest": ["address-autocomplete", "geocode"],
  "yandex-org-search": ["poi-search", "places"],
  "yandex-static-maps": ["static-maps", "map-display"],
  "yandex-maps-js": ["map-display", "routing"],
  "yandex-tiles": ["map-display"],
  "yandex-router": ["routing", "route-planning"],
  "yandex-distance-matrix": ["distance-matrix", "delivery-eta"],
  "yandex-locator": ["device-location"],
  "yandex-mapkit-sdk": ["map-display", "routing"],
  "yandex-navikit-sdk": ["routing", "route-planning"],
  "yandex-maps-js-plugins": ["map-display"],
  "yandex-panorama": ["panorama-streetview", "map-display"],

  // —— Identity ——
  "yandex-id-mobile-sdk": ["user-auth", "oauth"],
  "yandex-id-oauth": ["user-auth", "oauth"],
  "kz-egov-mobile-id": ["user-auth", "identity", "mobile-id"],
  "kz-npck-openapi-auth": ["user-auth", "oauth", "open-banking"],
  "kz-sigex-egov-qr": ["esignature", "eds"],
  "kz-sigex-egov-qr-simple": ["esignature", "eds"],
  "kz-sigex-documents": ["esignature", "eds"],
  "kz-npck-esign": ["esignature", "eds"],

  // —— Payments ——
  "kz-kaspi-merchant": ["checkout-payment", "marketplace-sync"],
  "kz-kaspi-pay-qr": ["checkout-payment", "qr-payment"],
  "kz-kaspi-pay-invoice": ["checkout-payment"],
  "kz-paybot-kaspi": ["checkout-payment"],
  "kz-apipay-kaspi": ["checkout-payment"],
  "kz-freedompay-merchant": ["checkout-payment"],
  "kz-freedompay-gateway": ["checkout-payment"],
  "kz-paybox-init": ["checkout-payment"],
  "kz-wooppay-invoice": ["checkout-payment"],
  "kz-woopkassa": ["checkout-payment"],
  "kz-halyk-epay-oauth": ["checkout-payment", "oauth"],
  "kz-halyk-epay-payment": ["checkout-payment"],
  "kz-bereke-register": ["checkout-payment"],
  "kz-bereke-business": ["checkout-payment", "bank-accounts"],
  "kz-fortebank-payment": ["checkout-payment"],
  "kz-alatau-openapi": ["checkout-payment", "open-banking"],
  "kz-asiapay-mobile": ["checkout-payment"],
  "kz-eurasian-acquiring": ["checkout-payment"],
  "kz-rbk-acquiring": ["checkout-payment"],
  "kz-qiwi-kz": ["checkout-payment", "wallet-payout"],
  "kz-npck-qr-c2b": ["checkout-payment", "qr-payment"],
  "kz-npck-openapi-transfers": ["wallet-payout", "bank-transfer"],
  "kz-npck-openapi-accounts": ["bank-accounts", "open-banking"],
  "kz-homebank-api": ["bank-accounts", "open-banking"],
  "yandex-pay-merchant": ["checkout-payment"],
  "yandex-pay-api": ["checkout-payment"],

  // —— Delivery / food ——
  "kz-wolt-marketplace": ["food-delivery", "delivery-partner"],
  "kz-wolt-drive": ["food-delivery", "delivery-eta", "routing"],
  "kz-glovo-partner-orders": ["food-delivery", "delivery-partner"],
  "kz-glovo-catalog": ["food-delivery", "catalog-sync"],
  "kz-chocofood-partner": ["food-delivery"],
  "kz-arbuz-partner": ["grocery-delivery", "food-delivery"],
  "yandex-eda-partner": ["food-delivery"],
  "yandex-lavka-partner": ["grocery-delivery"],
  "yandex-delivery": ["parcel-shipping", "delivery-eta", "routing"],
  "yandex-routing-fleet": ["routing", "route-planning", "delivery-eta", "fleet"],

  // —— Logistics ——
  "kz-kazpost-tracking": ["parcel-shipping", "tracking"],
  "kz-kazpost-tariff": ["parcel-shipping", "shipping-rates"],
  "kz-cdek-calculator": ["parcel-shipping", "shipping-rates"],
  "kz-cdek-orders": ["parcel-shipping", "tracking"],
  "kz-cdek-pickup-points": ["parcel-shipping", "pickup-points"],
  "kz-ttn-octo": ["parcel-shipping", "tracking"],

  // —— Marketplace ——
  "kz-wildberries-seller": ["marketplace-sync", "catalog-sync"],
  "kz-ozon-seller": ["marketplace-sync", "catalog-sync"],
  "yandex-market-partner": ["marketplace-sync"],
  "yandex-market-content": ["marketplace-sync", "catalog-sync"],
  "yandex-market-adv": ["ads-campaigns", "marketplace-sync"],

  // —— Travel / mobility ——
  "kz-air-astana-gds": ["travel-booking", "flights"],
  "kz-flyarystan-partner": ["travel-booking", "flights"],
  "kz-scat-airlines-partner": ["travel-booking", "flights"],
  "kz-aviata-partner": ["travel-booking", "flights", "trains"],
  "kz-ktz-railways-partner": ["travel-booking", "trains"],
  "kz-indriver-partner": ["ride-hailing", "routing"],
  "yandex-go-taxi-info": ["ride-hailing", "routing"],

  // —— Telecom ——
  "kz-kcell-sms": ["sms-otp", "sms"],
  "kz-kcell-sms-simple": ["sms-otp", "sms"],
  "kz-kcell-sms-batch-sync": ["sms-otp", "sms"],
  "kz-kcell-sms-broadcast-sync": ["sms-otp", "sms"],
  "kz-kcell-sms-otp-templates": ["sms-otp"],
  "kz-beeline-sms": ["sms-otp", "sms"],
  "kz-beeline-sms-bulk": ["sms-otp", "sms"],
  "kz-beeline-sms-verification": ["sms-otp"],
  "kz-beeline-kempay-create-payment": ["sms-otp", "checkout-payment"],
  "kz-beeline-kempay-resend-otp": ["sms-otp"],
  "kz-tele2-sms": ["sms-otp", "sms"],
  "kz-tele2-a2p-verification": ["sms-otp"],
  "kz-tele2-a2p-transactional": ["sms-otp", "sms"],
  "kz-altel-a2p-partners": ["sms-otp", "sms"],

  // —— Tax / cloud ——
  "kz-esf-invoicing": ["tax-invoicing", "e-invoice"],
  "kz-esf-virtual-warehouse": ["tax-invoicing", "e-invoice"],
  "kz-ps-cloud": ["cloud-hosting"],
  "kz-beeline-cloud": ["cloud-hosting"],

  // —— Analytics / ads ——
  "yandex-metrica-management": ["analytics-tracking"],
  "yandex-metrica-reports": ["analytics-tracking"],
  "yandex-metrica-logs": ["analytics-tracking"],
  "yandex-metrica-data-import": ["analytics-tracking"],
  "yandex-appmetrica": ["analytics-tracking"],
  "yandex-direct-v5": ["ads-campaigns"],
  "yandex-direct-reports": ["ads-campaigns"],
  "yandex-partner-network": ["ads-campaigns"],
  "yandex-mobile-ads": ["ads-campaigns"],

  // —— AI / speech ——
  "yandex-gpt": ["ai-assistant", "llm"],
  "yandex-speechkit-stt": ["speech-to-text", "ai-assistant"],
  "yandex-speechkit-tts": ["text-to-speech", "ai-assistant"],
  "yandex-translate": ["translation", "ai-assistant"],
  "yandex-vision": ["computer-vision", "ai-assistant"],
  "yandex-alice-skills": ["ai-assistant", "voice-assistant"],
  "yandex-toloka": ["ai-assistant", "crowdsourcing"],
  "yandex-catboost": ["ml-models", "ai-assistant"],
  "yandex-cloud-datasphere": ["ml-models", "ai-assistant", "cloud-hosting"],
  "yandex-cloud-datalens": ["analytics-tracking", "cloud-hosting"],

  // —— Yandex Cloud ——
  "yandex-cloud-compute": ["cloud-hosting"],
  "yandex-cloud-object-storage": ["cloud-hosting", "object-storage"],
  "yandex-cloud-managed-postgresql": ["cloud-hosting", "managed-db"],
  "yandex-cloud-functions": ["cloud-hosting", "serverless"],
  "yandex-cloud-serverless-containers": ["cloud-hosting", "serverless"],
  "yandex-cloud-api-gateway": ["cloud-hosting"],
  "yandex-cloud-vpc": ["cloud-hosting"],
  "yandex-cloud-dns": ["cloud-hosting"],
  "yandex-cloud-kms": ["cloud-hosting"],
  "yandex-cloud-logging": ["cloud-hosting"],
  "yandex-cloud-monitoring": ["cloud-hosting"],
  "yandex-cloud-iam": ["cloud-hosting", "user-auth"],
  "yandex-cloud-container-registry": ["cloud-hosting"],
  "yandex-cloud-message-queue": ["cloud-hosting"],
  "yandex-cloud-data-streams": ["cloud-hosting"],
  "yandex-cloud-load-balancer": ["cloud-hosting"],
  "yandex-cloud-managed-kubernetes": ["cloud-hosting"],
  "yandex-clickhouse": ["cloud-hosting", "managed-db"],

  // —— Niche ——
  "kz-aladhan-prayer": ["prayer-times"],
  fuelprice: ["fuel-prices", "price-indices"],

  // —— Yandex productivity / search ——
  "yandex-disk": ["cloud-hosting", "object-storage"],
  "yandex-connect": ["user-auth", "org-directory"],
  "yandex-calendar": ["calendar-scheduling"],
  "yandex-tracker": ["project-tracking"],
  "yandex-forms": ["forms-surveys"],
  "yandex-mail-domain": ["business-email"],
  "yandex-webmaster": ["seo-webmaster"],
  "yandex-site-search": ["site-search"],
  "yandex-xml-search": ["web-search"],
  "yandex-turbo-pages": ["seo-webmaster"],
  "yandex-structured-data-validator": ["seo-webmaster"],
  "yandex-browser-api": ["browser-api"],
  "yandex-safe-browsing": ["url-safety"],
};

/** @type {Record<string, { why?: string, where?: string }>} */
export const API_PLUG_IN_OVERRIDES = {
  "kz-2gis-geocoder": {
    why: "Convert KZ street addresses to lat/lng (and back) for maps and routing.",
    where: "Address input on checkout, saved addresses, map pin confirmation.",
  },
  "yandex-geocoder": {
    why: "Geocode Astana, Almaty and nationwide KZ addresses to coordinates.",
    where: "Delivery address form, location picker, batch geocoding jobs.",
  },
  "kz-2gis-suggest": {
    why: "Typeahead so users pick valid addresses without typos.",
    where: "Address autocomplete field during checkout or signup.",
  },
  "yandex-geosuggest": {
    why: "Autocomplete streets and org names while the user types.",
    where: "Search-as-you-type address bar on order forms.",
  },
  "kz-2gis-distance-matrix": {
    why: "Batch travel time and distance for up to 25 origin/destination pairs.",
    where: "Delivery fee calculator, courier ETA at checkout, dispatch ranking.",
  },
  "yandex-distance-matrix": {
    why: "Matrix ETAs for fleet routing and delivery pricing.",
    where: "Multi-stop delivery quote, courier assignment screen.",
  },
  "kz-2gis-routing": {
    why: "Car, walk and bike routes with traffic-aware ETAs.",
    where: "Courier navigation, driver app turn-by-turn preview.",
  },
  "kz-2gis-isochrone": {
    why: "Draw reachable-area polygons for delivery or service coverage.",
    where: "Admin delivery zone editor, “can we deliver here?” map.",
  },
  "kz-2gis-catalog": {
    why: "Search POIs, businesses and landmarks across Kazakhstan.",
    where: "Store locator, nearby restaurants map, org lookup.",
  },
  "kz-kaspi-pay-qr": {
    why: "Accept in-store or online payments via Kaspi QR.",
    where: "Checkout pay button and POS confirmation screen.",
  },
  "kz-kaspi-pay-invoice": {
    why: "Push a Kaspi payment request to the customer’s phone.",
    where: "Order confirmation and “pay in Kaspi” deep link.",
  },
  "yandex-gpt": {
    why: "Generate replies and content with YandexGPT in Russian/Kazakh contexts.",
    where: "In-app assistant, help bot, content draft panel.",
  },
  "kz-indriver-partner": {
    why: "Integrate ride-hailing for on-demand trips.",
    where: "Ride request screen and driver ETA tracking.",
  },
};

const TITLE_PATTERNS = [
  { re: /\bgeosuggest\b|\bautocomplete\b|\bsuggest\b.*\baddress\b/i, tags: ["address-autocomplete"] },
  { re: /\bgeocoder\b|\bgeocod(?:e|ing)\b/i, tags: ["geocode", "forward-geocode", "reverse-geocode"] },
  { re: /\bdistance matrix\b|\bdist_matrix\b|\bget_dist_matrix\b/i, tags: ["distance-matrix", "delivery-eta"] },
  { re: /\brouting\b|\brouter\b|\bnavigation\b/i, tags: ["routing", "route-planning"] },
  { re: /\bisochrone\b|\breachable\b/i, tags: ["isochrone", "delivery-zones"] },
  { re: /\bplaces\b|\bpoi\b|\borganization search\b/i, tags: ["poi-search", "places"] },
  { re: /\bstatic maps?\b|\bmap tiles?\b|\bmapkit\b/i, tags: ["static-maps", "map-display"] },
  { re: /\blocator\b|\bdevice location\b|\bgps position\b/i, tags: ["device-location"] },
  { re: /\bpublic transport\b|\bmultimodal\b/i, tags: ["routing", "public-transport"] },
  { re: /\bkaspi\b|\bfreedompay\b|\bwooppay\b|\bpaybox\b|\bqiwi\b|\byandex pay\b|\bacquiring\b|\be-?pay\b/i, tags: ["checkout-payment"] },
  { re: /\bqr (?:code )?pay|\binterbank qr\b/i, tags: ["checkout-payment", "qr-payment"] },
  { re: /\bpayout\b|\bimps\b|\bdisbursement\b/i, tags: ["wallet-payout", "bank-transfer"] },
  { re: /\byandex id\b|\bmobile.?id\b|\bfinid\b|\boauth2?\b.*\bauth\b/i, tags: ["user-auth", "oauth"] },
  { re: /\bsigex\b|\be-?sign(?:ature)?\b|\beds\b/i, tags: ["esignature", "eds"] },
  { re: /\bsms\b|\botp\b|\btext message\b/i, tags: ["sms-otp", "sms"] },
  { re: /\bexchange rates?\b|\bforex\b|\bnational bank.*rate/i, tags: ["fx-rates", "exchange-rates"] },
  { re: /\bopen banking\b|\baccount aggreg/i, tags: ["bank-accounts", "open-banking"] },
  { re: /\bweather\b|\bforecast\b|\bkazhydromet\b/i, tags: ["weather-forecast"] },
  { re: /\bflight\b|\bairline\b|\baviata\b|\bflyarystan\b|\bair astana\b/i, tags: ["travel-booking", "flights"] },
  { re: /\brailway\b|\bktz\b|\btrain ticket/i, tags: ["travel-booking", "trains"] },
  { re: /\btaxi\b|\bride.?hail|\bindriver\b|\byandex go\b/i, tags: ["ride-hailing"] },
  { re: /\bwildberries\b|\bozon\b|\byandex market\b|\bseller api\b/i, tags: ["marketplace-sync"] },
  { re: /\bcdek\b|\bkazpost\b|\bparcel\b|\bshipping\b|\btracking\b/i, tags: ["parcel-shipping", "tracking"] },
  { re: /\bglovo\b|\bwolt\b|\bchocofood\b|\byandex eda\b|\bfood delivery\b/i, tags: ["food-delivery"] },
  { re: /\barbuz\b|\blavka\b|\bgrocery\b/i, tags: ["grocery-delivery"] },
  { re: /\byandexgpt\b|\b\bllm\b|\bgpt\b|\bchatbot\b/i, tags: ["ai-assistant", "llm"] },
  { re: /\bspeechkit\b|\bstt\b|\btts\b|\bspeech.to.text\b|\btext.to.speech\b/i, tags: ["speech-to-text", "ai-assistant"] },
  { re: /\btranslate\b|\btranslation\b/i, tags: ["translation", "ai-assistant"] },
  { re: /\bvision\b|\bocr\b|\bcomputer vision\b/i, tags: ["computer-vision", "ai-assistant"] },
  { re: /\bmetrica\b|\bappmetrica\b/i, tags: ["analytics-tracking"] },
  { re: /\byandex direct\b|\bmobile ads\b|\badvertis/i, tags: ["ads-campaigns"] },
  { re: /\besf\b|\be-invoice\b|\belectronic invoice\b/i, tags: ["tax-invoicing", "e-invoice"] },
  { re: /\byandex cloud\b|\bps\.kz\b|\bobject storage\b|\bkubernetes\b/i, tags: ["cloud-hosting"] },
  { re: /\bpopulation\b|\bdemograph|\bbirths\b|\bcensus\b/i, tags: ["population-stats", "gov-open-data"] },
  { re: /\bhousing\b|\bapartment\b|\breal estate\b|\bcadastr/i, tags: ["housing-stats"] },
  { re: /\beducation\b|\bschool\b|\buniversity\b|\bstudent enrollment\b/i, tags: ["education-stats"] },
  { re: /\bhospital\b|\bclinic\b|\bcovid\b|\bblood donation\b|\bhealth (?:care|stats)\b/i, tags: ["health-stats"] },
  { re: /\blabour\b|\blabor\b|\bunemployment\b|\bwage\b|\bworkforce\b/i, tags: ["labour-stats"] },
  { re: /\bcpi\b|\bppi\b|\binflation\b|\bfuel price\b|\bconsumer price\b/i, tags: ["price-indices"] },
  { re: /\bcrime\b|\bpublic safety\b|\bpolice\b|\bfire\b/i, tags: ["public-safety"] },
  { re: /\bprayer\b|\bsalah\b|\baladhan\b|\bnamaz\b/i, tags: ["prayer-times"] },
  { re: /\bgdp\b|\bnational accounts\b|\beconomic indicator/i, tags: ["national-accounts", "gov-open-data"] },
  { re: /\bhousehold\b|\bincome survey\b|\bhies\b/i, tags: ["household-stats"] },
  { re: /\bopen data\b|\bdata\.egov\b|\bstat\.gov\b|\bstatistical indicator/i, tags: ["gov-open-data", "statistics"] },
];

/** Soft category priors — never alone enough for commercial mismatch. */
const CATEGORY_TAGS = {
  Payments: ["checkout-payment"],
  "Maps & location": ["geocode"],
  "Auth & identity": ["user-auth"],
  AI: ["ai-assistant"],
  "Environment & climate": ["weather-forecast"],
  Environment: ["weather-forecast"],
  "Government data": ["gov-open-data"],
  "Government services": ["gov-open-data", "user-auth"],
  Demography: ["population-stats", "gov-open-data"],
  "Population & society": ["population-stats", "gov-open-data"],
  "Housing & property": ["housing-stats"],
  Property: ["housing-stats"],
  Education: ["education-stats"],
  Health: ["health-stats"],
  Healthcare: ["health-stats"],
  "Labour Markets": ["labour-stats"],
  Households: ["household-stats"],
  "National Accounts": ["national-accounts", "gov-open-data"],
  Prices: ["price-indices"],
  "Public Safety": ["public-safety"],
  "Statistical Indicators": ["gov-open-data", "statistics"],
  "Public Administration": ["gov-open-data"],
  "Data Dictionaries": ["gov-open-data"],
  Metadata: ["gov-open-data"],
  "Travel & mobility": ["travel-booking"],
  Transport: ["travel-booking"],
  Transportation: ["travel-booking"],
  "Logistics & delivery": ["parcel-shipping"],
  "Food & delivery": ["food-delivery"],
  "E-commerce": ["marketplace-sync"],
  "E-invoicing & tax": ["tax-invoicing"],
  "Cloud & infrastructure": ["cloud-hosting"],
  "Banking & finance": ["bank-accounts"],
  Banking: ["bank-accounts"],
  Finance: ["fx-rates"],
  "Financial Markets": ["fx-rates"],
  // Communications intentionally omitted — too mixed (SMS vs ads vs analytics)
};

function normalize(text = "") {
  return String(text).toLowerCase().replace(/ё/g, "е");
}

function inferFromText(text) {
  const tags = new Set();
  for (const { re, tags: found } of TITLE_PATTERNS) {
    if (re.test(text)) found.forEach((t) => tags.add(t));
  }
  return tags;
}

/**
 * @param {object} api
 * @returns {Set<string>}
 */
export function getApiCapabilities(api) {
  const id = String(api.id || api.slug || "");

  const matrixCaps = getMatrixCapabilities(id);
  if (matrixCaps?.length) return new Set(matrixCaps);

  // Explicit overrides are authoritative — no heuristic merge.
  if (API_CAPABILITY_OVERRIDES[id]) {
    return new Set(API_CAPABILITY_OVERRIDES[id]);
  }
  if (Array.isArray(api.capabilities) && api.capabilities.length) {
    return new Set(api.capabilities);
  }

  const caps = new Set();
  const blob = normalize([api.title, api.note, api.category, api.provider].filter(Boolean).join(" "));
  for (const tag of inferFromText(blob)) caps.add(tag);
  for (const tag of CATEGORY_TAGS[api.category] || []) caps.add(tag);

  return caps;
}

/** Product features this API supports (expanded list — internal matrix only). */
export function getApiFeatures(api) {
  const id = String(api.id || api.slug || "");
  const matrixFeatures = getMatrixFeatures(id);
  if (matrixFeatures?.length) return matrixFeatures;
  const caps = [...getApiCapabilities(api)];
  return expandApiFeatures(api, caps).features;
}

/** Strict capability-derived features — used for suggest matching only. */
export function getApiPrimaryFeatures(api) {
  const id = String(api.id || api.slug || "");
  const primary = getMatrixPrimaryFeatures(id);
  if (primary?.length) return primary;
  return capabilitiesToPrimaryFeatureIds([...getApiCapabilities(api)]);
}

export function capabilityOverlap(apiCaps, featureTags = []) {
  if (!featureTags.length) return 0;
  let hit = 0;
  for (const tag of featureTags) {
    if (apiCaps.has(tag)) hit += 1;
  }
  return hit / featureTags.length;
}

export function apiMatchesFeature(api, feature) {
  const caps = getApiCapabilities(api);
  const primaryFeatures = getApiPrimaryFeatures(api);

  if (primaryFeatures.includes(feature.id)) {
    const overlap = capabilityOverlap(caps, feature.capabilityTags);
    if (
      feature.id === "user-auth" &&
      GOV_STAT_CATEGORIES.has(api.category || "") &&
      !caps.has("oauth") &&
      !caps.has("mobile-id")
    ) {
      return { ok: false, overlap: 0, caps };
    }
    if (feature.capabilityTags?.length && overlap <= 0) {
      return { ok: false, overlap: 0, caps };
    }
    return { ok: true, overlap: overlap > 0 ? overlap : 0.25, caps };
  }

  const overlap = capabilityOverlap(caps, feature.capabilityTags);
  if (overlap > 0) {
    if (feature.id === "sms-otp" && caps.has("user-auth") && !caps.has("sms")) {
      return { ok: false, overlap: 0, caps };
    }
    if (
      feature.capabilityTags?.some((t) => t.includes("stats") || t === "gov-open-data") &&
      api.tier === "commercial" &&
      overlap < 0.34
    ) {
      return { ok: false, overlap: 0, caps };
    }
    return { ok: true, overlap, caps };
  }

  return { ok: false, overlap: 0, caps };
}

/**
 * @param {object} api
 * @param {object} feature
 * @param {string} [userHay]
 */
export function buildPlugInContext(api, feature, userHay = "") {
  const id = String(api.id || api.slug || "");
  const override = API_PLUG_IN_OVERRIDES[id];
  const hay = normalize(userHay);

  let why = override?.why || feature.why;
  let where = override?.where || feature.where;

  if (!override && hay.includes("checkout") && feature.id.includes("geocod")) {
    where = "Checkout delivery address field and order confirmation.";
  }
  if (!override && hay.includes("dispatch") && feature.id.includes("eta")) {
    where = "Courier dispatch board and live order tracking.";
  }

  return { why, where };
}

export function capabilitiesDocumentText(api) {
  return [...getApiCapabilities(api)].join(" ");
}
