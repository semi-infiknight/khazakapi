const STORAGE_KEY = "khazak.providerKeys.v1";

/** @typedef {{ id: string, label: string, group: string, description: string, credentialLabel?: string, validate?: string, links?: { label: string, href: string }[] }} KeyProvider */

/** @type {Record<string, KeyProvider>} */
export const KEY_PROVIDERS = {
  "data.egov.kz": {
    id: "data.egov.kz",
    label: "data.egov.kz",
    group: "Government",
    description: "Free Open Data portal key for ~140 official Kazakhstan datasets.",
    credentialLabel: "API key",
    validate: "data-egov",
    links: [
      { label: "Register on eGov ID", href: "https://idp.egov.kz/idp/register.jsp" },
      { label: "Developer cabinet", href: "https://data.egov.kz/profile/apikeylist" },
      { label: "API samples", href: "https://data.egov.kz/pages/samples" },
    ],
  },
  "2gis": {
    id: "2gis",
    label: "2GIS",
    group: "Maps & location",
    description: "Catalog, geocoding, routing, and suggest APIs — replaces YOUR_KEY in query params.",
    credentialLabel: "API key",
    links: [{ label: "2GIS Developer", href: "https://dev.2gis.com/" }],
  },
  "yandex-maps": {
    id: "yandex-maps",
    label: "Yandex Maps & Location",
    group: "Maps & location",
    description: "Geocoder, static maps, routing, suggest, and MapKit — apikey query parameter.",
    credentialLabel: "API key",
    links: [{ label: "Yandex Developer", href: "https://developer.tech.yandex.ru/" }],
  },
  "yandex-cloud": {
    id: "yandex-cloud",
    label: "Yandex Cloud",
    group: "Yandex platform",
    description: "IAM tokens and service account keys for Yandex Cloud APIs.",
    credentialLabel: "IAM token or API key",
    links: [{ label: "Yandex Cloud console", href: "https://console.cloud.yandex.ru/" }],
  },
  "yandex-ai": {
    id: "yandex-ai",
    label: "Yandex AI",
    group: "Yandex platform",
    description: "SpeechKit, Translate, Vision, YandexGPT, and related AI services.",
    credentialLabel: "API key or IAM token",
    links: [{ label: "Yandex Cloud AI", href: "https://yandex.cloud/en/docs/foundation-models/" }],
  },
  "yandex-direct": {
    id: "yandex-direct",
    label: "Yandex Direct & Ads",
    group: "Yandex platform",
    description: "Direct, Metrica, and advertising platform credentials.",
    credentialLabel: "OAuth token or API key",
    links: [{ label: "Yandex Direct API", href: "https://yandex.ru/dev/direct/" }],
  },
  "yandex-market": {
    id: "yandex-market",
    label: "Yandex Market",
    group: "Commerce",
    description: "Partner and seller API credentials for Yandex Market.",
    credentialLabel: "OAuth token or API key",
    links: [{ label: "Yandex Market API", href: "https://yandex.ru/dev/market/" }],
  },
  ozon: {
    id: "ozon",
    label: "Ozon",
    group: "Commerce",
    description: "Seller API Client-Id and Api-Key pair for Ozon marketplace integrations.",
    credentialLabel: "Seller API key",
    links: [{ label: "Ozon Seller API", href: "https://docs.ozon.ru/api/seller/" }],
  },
  wildberries: {
    id: "wildberries",
    label: "Wildberries",
    group: "Commerce",
    description: "Statistics and marketplace API token from the Wildberries seller portal.",
    credentialLabel: "API token",
    links: [{ label: "Wildberries API docs", href: "https://openapi.wildberries.ru/" }],
  },
  sigex: {
    id: "sigex",
    label: "SIGEX",
    group: "Government",
    description: "Electronic signature and document verification for Kazakhstan eGov flows.",
    credentialLabel: "API key or subscription token",
    links: [{ label: "SIGEX portal", href: "https://sigex.kz/" }],
  },
};

const GROUP_ORDER = ["Government", "Maps & location", "Yandex platform", "Commerce"];

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function listProviderKeys() {
  return { ...readStore() };
}

export function getProviderKey(providerId) {
  const entry = readStore()[providerId];
  return entry?.key || "";
}

export function getProviderKeyMeta(providerId) {
  return readStore()[providerId] || null;
}

export function saveProviderKey(providerId, key, meta = {}) {
  const store = readStore();
  store[providerId] = {
    key,
    savedAt: new Date().toISOString(),
    validated: Boolean(meta.validated),
    ...meta,
  };
  writeStore(store);
  window.dispatchEvent(new CustomEvent("khazak:provider-key", { detail: { providerId, key } }));
  return store[providerId];
}

export function clearProviderKey(providerId) {
  const store = readStore();
  delete store[providerId];
  writeStore(store);
  window.dispatchEvent(new CustomEvent("khazak:provider-key", { detail: { providerId, key: "" } }));
}

export function providerInfo(providerId) {
  return KEY_PROVIDERS[providerId] || { id: providerId, label: providerId, group: "Other", description: "" };
}

export function listKeyProviders() {
  return Object.values(KEY_PROVIDERS);
}

export function listKeyProviderGroups() {
  const groups = new Map();
  for (const provider of listKeyProviders()) {
    if (!groups.has(provider.group)) groups.set(provider.group, []);
    groups.get(provider.group).push(provider);
  }
  return GROUP_ORDER.filter((name) => groups.has(name)).map((name) => ({
    name,
    providers: groups.get(name),
  }));
}

export function countSavedKeys() {
  return Object.keys(readStore()).filter((id) => getProviderKey(id)).length;
}

export function maskKey(key) {
  if (!key) return "";
  if (key.length <= 8) return "••••••••";
  return `${key.slice(0, 4)}…${key.slice(-4)}`;
}

export function isDataEgovApi(api) {
  if (!api) return false;
  return (
    api.source === "data.egov.kz" ||
    api.trust?.source === "data.egov.kz" ||
    api.endpoint?.includes("data.egov.kz") ||
    api.sourceUrl?.includes("data.egov.kz") ||
    api.docs?.includes("data.egov.kz")
  );
}

function matchesYandexFamily(apiId, prefixes) {
  return prefixes.some((prefix) => apiId.startsWith(prefix));
}

export function getProviderIdForApi(api) {
  if (!api) return null;
  if (isDataEgovApi(api)) return "data.egov.kz";

  const endpoint = api.endpoint || "";
  const apiId = api.id || "";
  const provider = String(api.provider || "").toLowerCase();

  if (endpoint.includes("2gis.com") || provider.includes("2gis")) return "2gis";

  if (
    endpoint.includes("apikey=YOUR_KEY") ||
    endpoint.includes("geocode-maps.yandex") ||
    endpoint.includes("suggest-maps.yandex") ||
    endpoint.includes("static-maps.yandex") ||
    endpoint.includes("api.routing.yandex") ||
    matchesYandexFamily(apiId, [
      "yandex-geocoder",
      "yandex-geosuggest",
      "yandex-static",
      "yandex-maps",
      "yandex-tiles",
      "yandex-org",
      "yandex-mapkit",
      "yandex-navikit",
      "yandex-locator",
      "yandex-router",
      "yandex-distance",
    ])
  ) {
    return "yandex-maps";
  }

  if (apiId.startsWith("yandex-cloud-") || endpoint.includes("api.cloud.yandex")) return "yandex-cloud";

  if (
    matchesYandexFamily(apiId, [
      "yandex-speechkit",
      "yandex-translate",
      "yandex-vision",
      "yandex-gpt",
      "yandex-alice",
      "yandex-toloka",
      "yandex-clickhouse",
      "yandex-catboost",
    ])
  ) {
    return "yandex-ai";
  }

  if (
    matchesYandexFamily(apiId, ["yandex-direct", "yandex-metrica", "yandex-appmetrica", "yandex-search-ads"])
  ) {
    return "yandex-direct";
  }

  if (matchesYandexFamily(apiId, ["yandex-market"])) return "yandex-market";

  if (provider.includes("ozon") || apiId.includes("ozon")) return "ozon";
  if (provider.includes("wildberries") || apiId.includes("wildberries")) return "wildberries";
  if (provider.includes("sigex") || apiId.includes("sigex")) return "sigex";

  if (api.auth === "apiKey" && endpoint.includes("YOUR_KEY")) {
    return null;
  }

  return null;
}
