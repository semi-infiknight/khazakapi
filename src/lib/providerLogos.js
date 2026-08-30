import logosManifest from "./logosManifest.json";

/** Canonical domains for logo fetch fallbacks (matches scripts/fetch-provider-logos.mjs) */
const DOMAIN_BY_SLUG = {
  "2gis": "2gis.kz",
  "air-astana": "airastana.com",
  aladhan: "aladhan.com",
  "alatau-city-bank": "jusan.kz",
  "apipay-kz": "apipay.kz",
  asiapay: "asiapay.kz",
  "aviata-kz": "aviata.kz",
  "bank-rbk": "bankrbk.kz",
  "beeline-cloud": "beeline.kz",
  "beeline-kazakhstan": "beeline.kz",
  "bereke-bank": "berekebank.kz",
  cdek: "cdek.ru",
  chocofamily: "chocofamily.kz",
  "data-egov-kz": "data.egov.kz",
  "egov-kz": "egov.kz",
  "esf-kgd": "kgd.gov.kz",
  "eurasian-bank": "eubank.kz",
  flyarystan: "flyarystan.com",
  fortebank: "fortebank.com",
  "freedompay-kz": "freedompay.kz",
  glovo: "glovoapp.com",
  "halyk-bank": "halykbank.kz",
  "halyk-epay": "epayment.kz",
  indriver: "indriver.com",
  "kaspi-kz": "kaspi.kz",
  kazhydromet: "kazhydromet.kz",
  kazpost: "kazpost.kz",
  kcell: "kcell.kz",
  ktz: "railways.kz",
  nbk: "nationalbank.kz",
  npck: "npck.kz",
  ozon: "ozon.kz",
  "paybot-kz": "paybot.kz",
  paybox: "paybox.kz",
  "ps-cloud": "ps.kz",
  "qiwi-kazakhstan": "qiwi.kz",
  "scat-airlines": "scat.kz",
  sigex: "sigex.kz",
  "stat-gov-kz": "stat.gov.kz",
  "tele2-kazakhstan": "altel.kz",
  "tickets-kz": "tickets.kz",
  wildberries: "wildberries.ru",
  wolt: "wolt.com",
  wooppay: "wooppay.com",
  "yandex-360": "yandex.ru",
  "yandex-ai": "yandex.cloud",
  "yandex-cloud": "yandex.cloud",
  "yandex-direct": "yandex.ru",
  "yandex-go": "yandex.ru",
  "yandex-id": "yandex.ru",
  "yandex-maps": "yandex.ru",
  "yandex-market": "market.yandex.ru",
  "yandex-metrica": "metrika.yandex.ru",
  "yandex-pay": "pay.yandex.ru",
  "yandex-search-ads": "yandex.ru",
};

function extractDomain(api) {
  const url = api.sourceUrl || api.docs || api.baseUrl || api.endpoint;
  if (!url || typeof url !== "string") return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function slugify(text = "") {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function googleFaviconUrl(domain, size = 128) {
  return `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(`https://${domain}`)}&size=${size}`;
}

function remoteLogoUrls(domain) {
  return [
    googleFaviconUrl(domain, 128),
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`,
  ];
}

function manifestPathForSlug(slug) {
  if (logosManifest[slug]) return logosManifest[slug];
  if (slug.startsWith("yandex-")) {
    return (
      logosManifest[slug] ||
      logosManifest["yandex-cloud"] ||
      logosManifest["yandex-maps"] ||
      null
    );
  }
  if (slug === "halyk-epay") return logosManifest["halyk-epay"] || logosManifest["halyk-bank"];
  return null;
}

export function resolveCompanySlug(api) {
  if (api.companySlug) return api.companySlug;
  if (api.provider) return slugify(api.provider);
  if (api.source) return slugify(api.source);
  return "api";
}

export function resolveProviderLogo(api) {
  const slug = resolveCompanySlug(api);
  const label = api.companyName || api.provider || "API";
  const local = manifestPathForSlug(slug);
  const domain = DOMAIN_BY_SLUG[slug] || extractDomain(api);
  const remote = domain ? remoteLogoUrls(domain) : [];

  if (local) {
    return { src: local, fallbacks: remote, kind: "local", label };
  }

  if (!domain) return null;

  return {
    src: remote[0],
    fallbacks: remote.slice(1),
    kind: "remote",
    label,
  };
}

export function providerBrandColor(slug) {
  const colors = {
    "2gis": { bg: "#1db93d", text: "#ffffff" },
    "data-egov-kz": { bg: "#0b4f9c", text: "#ffffff" },
    "egov-kz": { bg: "#0b4f9c", text: "#ffffff" },
    "kaspi-kz": { bg: "#f03b2d", text: "#ffffff" },
    nbk: { bg: "#0a3d7a", text: "#f5d67a" },
    kazhydromet: { bg: "#1a6fb5", text: "#ffffff" },
    yandex: { bg: "#fc3f1d", text: "#ffffff" },
    npck: { bg: "#1f3b8f", text: "#ffffff" },
    sigex: { bg: "#2f855a", text: "#ffffff" },
    "halyk-bank": { bg: "#00843d", text: "#ffffff" },
    "halyk-epay": { bg: "#00843d", text: "#ffffff" },
    kcell: { bg: "#7b2d8e", text: "#ffffff" },
    "beeline-kazakhstan": { bg: "#ffc800", text: "#111111" },
  };
  if (slug.startsWith("yandex-")) return colors.yandex;
  return colors[slug] || null;
}
