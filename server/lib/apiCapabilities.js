/**
 * API capability tags + per-API why/where overrides for feature-based suggest.
 */

/** @type {Record<string, string[]>} */
export const API_CAPABILITY_OVERRIDES = {
  "kz-2gis-geocoder": ["geocode", "forward-geocode", "reverse-geocode"],
  "kz-2gis-suggest": ["address-autocomplete", "geocode"],
  "yandex-geocoder": ["geocode", "forward-geocode", "reverse-geocode"],
  "yandex-geosuggest": ["address-autocomplete", "geocode"],
  "yandex-id-mobile-sdk": ["user-auth", "oauth"],
  "yandex-id-oauth": ["user-auth", "oauth"],
  "kz-2gis-distance-matrix": ["distance-matrix", "delivery-eta"],
  "yandex-distance-matrix": ["distance-matrix", "delivery-eta"],
  "kz-2gis-routing": ["routing", "route-planning", "delivery-eta"],
  "yandex-router": ["routing", "route-planning"],
  "kz-2gis-isochrone": ["isochrone", "delivery-zones"],
  "kz-2gis-catalog": ["poi-search", "places"],
  "yandex-org-search": ["poi-search", "places"],
  "kz-2gis-public-transport": ["routing", "route-planning", "travel-booking"],
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
};

const TITLE_PATTERNS = [
  { re: /\bgeosuggest\b|\bautocomplete\b|\bsuggest\b.*\baddress\b/i, tags: ["address-autocomplete"] },
  { re: /\bgeocoder\b|\bgeocod/i, tags: ["geocode", "forward-geocode", "reverse-geocode"] },
  { re: /\bdistance matrix\b|\bdist_matrix\b|\bget_dist_matrix\b/i, tags: ["distance-matrix", "delivery-eta"] },
  { re: /\brouting\b|\brouter\b|\bnavigation\b/i, tags: ["routing", "route-planning"] },
  { re: /\bisochrone\b|\breachable\b/i, tags: ["isochrone", "delivery-zones"] },
  { re: /\bplaces\b|\bpoi\b|\borganization search\b|\bcatalog\b.*\bitems\b/i, tags: ["poi-search", "places"] },
  { re: /\bpublic transport\b|\bmultimodal\b/i, tags: ["routing", "travel-booking"] },
  { re: /\bkaspi\b|\bfreedompay\b|\bwooppay\b|\bpaybox\b|\bqiwi\b|\bpayment\b|\bqr pay\b|\bacquiring\b/i, tags: ["checkout-payment"] },
  { re: /\bpayout\b|\btransfer\b|\bimps\b|\bwallet\b/i, tags: ["wallet-payout", "bank-transfer"] },
  { re: /\boauth\b|\blogin\b|\bidentity\b|\bfinid\b|\byandex id\b/i, tags: ["user-auth", "oauth"] },
  { re: /\bsigex\b|\be-sign\b|\bsignature\b|\beds\b/i, tags: ["esignature", "eds"] },
  { re: /\bsms\b|\botp\b|\btext message\b/i, tags: ["sms-otp", "sms"] },
  { re: /\bexchange rate\b|\bfx\b|\bcurrency\b|\bnbk\b/i, tags: ["fx-rates", "exchange-rates"] },
  { re: /\bopen banking\b|\baccount aggreg\b|\b\/accounts\b/i, tags: ["bank-accounts", "open-banking"] },
  { re: /\bweather\b|\bforecast\b|\bkazhydromet\b/i, tags: ["weather-forecast"] },
  { re: /\bflight\b|\bairline\b|\btrain\b|\brailway\b|\baviata\b|\bticket\b/i, tags: ["travel-booking"] },
  { re: /\bwildberries\b|\bozon\b|\bmarketplace\b|\bseller\b/i, tags: ["marketplace-sync"] },
  { re: /\bcdek\b|\bkazpost\b|\bparcel\b|\bshipping\b/i, tags: ["parcel-shipping", "tracking"] },
  { re: /\bglovo\b|\bwolt\b|\bfood delivery\b/i, tags: ["food-delivery"] },
  { re: /\byandexgpt\b|\bllm\b|\bgpt\b|\bchatbot\b|\bai assistant\b/i, tags: ["ai-assistant", "llm"] },
  { re: /\bmetrica\b|\bappmetrica\b|\banalytics\b/i, tags: ["analytics-tracking"] },
  { re: /\bdirect\b|\badvertis\b|\bcampaign\b/i, tags: ["ads-campaigns"] },
  { re: /\besf\b|\be-invoice\b|\btax\b|\bvat\b|\bkgd\b/i, tags: ["tax-invoicing", "e-invoice"] },
  { re: /\bcloud\b|\bhosting\b|\bstorage\b/i, tags: ["cloud-hosting"] },
  { re: /\bpopulation\b|\bdemograph\b|\bbirths\b|\bstatistics\b|\bopen data\b|\bdata\.egov\b|\bstat\.gov\b/i, tags: ["gov-open-data", "statistics"] },
];

const CATEGORY_TAGS = {
  Payments: ["checkout-payment"],
  "Maps & location": ["geocode"],
  "Auth & identity": ["user-auth"],
  AI: ["ai-assistant"],
  "Environment & climate": ["weather-forecast"],
  "Government data": ["gov-open-data"],
  Demography: ["gov-open-data", "statistics"],
  "Travel & mobility": ["travel-booking", "routing"],
  "Logistics & delivery": ["parcel-shipping", "delivery-eta"],
  "E-commerce": ["marketplace-sync"],
  Communications: ["sms-otp"],
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
  const caps = new Set(API_CAPABILITY_OVERRIDES[id] || api.capabilities || []);

  const blob = normalize([api.title, api.note, api.category, api.provider].filter(Boolean).join(" "));
  for (const tag of inferFromText(blob)) caps.add(tag);

  for (const tag of CATEGORY_TAGS[api.category] || []) caps.add(tag);

  return caps;
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
  const overlap = capabilityOverlap(caps, feature.capabilityTags);
  if (overlap > 0) {
    if (feature.id === "sms-otp" && caps.has("user-auth") && !caps.has("sms")) {
      return { ok: false, overlap: 0, caps };
    }
    return { ok: true, overlap, caps };
  }

  const categoryOk =
    !feature.categories?.length || feature.categories.includes(api.category || "");
  const provider = normalize(`${api.provider || ""} ${api.companyName || ""}`);
  const providerOk = feature.providers?.some((p) => provider.includes(p));

  if (categoryOk && providerOk) return { ok: true, overlap: 0.15, caps };
  if (categoryOk && feature.capabilityTags?.every((t) => t.includes("gov") || t.includes("stat"))) {
    return { ok: true, overlap: 0.1, caps };
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
