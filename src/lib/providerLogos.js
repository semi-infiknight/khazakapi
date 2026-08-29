const LOCAL_LOGOS = {
  "2gis": "/logos/2gis.svg",
  "air-astana": "/logos/air-astana.svg",
  "aviata-kz": "/logos/aviata-kz.svg",
  "bank-rbk": "/logos/bank-rbk.svg",
  "beeline-kazakhstan": "/logos/beeline-kazakhstan.svg",
  "bereke-bank": "/logos/bereke-bank.svg",
  "data-egov-kz": "/logos/data-egov-kz.svg",
  "egov-kz": "/logos/egov-kz.svg",
  "esf-kgd": "/logos/esf-kgd.svg",
  "flyarystan": "/logos/flyarystan.svg",
  "fortebank": "/logos/fortebank.svg",
  "freedompay-kz": "/logos/freedompay-kz.svg",
  "halyk-bank": "/logos/halyk-bank.svg",
  "halyk-epay": "/logos/halyk-bank.svg",
  "kaspi-kz": "/logos/kaspi-kz.svg",
  "kazhydromet": "/logos/kazhydromet.svg",
  "kazpost": "/logos/kazpost.svg",
  "kcell": "/logos/kcell.svg",
  "ktz": "/logos/ktz.svg",
  "nbk": "/logos/nbk.svg",
  "npck": "/logos/npck.svg",
  "paybox": "/logos/paybox.svg",
  "scat-airlines": "/logos/scat-airlines.svg",
  "sigex": "/logos/sigex.svg",
  "stat-gov-kz": "/logos/stat-gov-kz.svg",
  "tele2-kazakhstan": "/logos/tele2-kazakhstan.svg",
  "wooppay": "/logos/wooppay.svg",
  "yandex": "/logos/yandex.svg",
};

const SIMPLE_ICONS = {
  cdek: "00B33C",
  glovo: "F2672A",
  indriver: "7BD042",
  ozon: "005BFF",
  wildberries: "CB11AB",
  wolt: "00C2E8",
};

const DOMAIN_BY_SLUG = {
  "2gis": "2gis.kz",
  "air-astana": "airastana.com",
  aladhan: "aladhan.com",
  "alatau-city-bank": "alataubank.kz",
  "apipay-kz": "apipay.kz",
  asiapay: "asiapay.kz",
  "aviata-kz": "aviata.kz",
  "bank-rbk": "bankrbk.kz",
  "beeline-cloud": "beeline.kz",
  "beeline-kazakhstan": "beeline.kz",
  "bereke-bank": "berekebank.kz",
  cdek: "cdek.ru",
  chocofamily: "choco.kz",
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
  "yandex-360": "yandex.kz",
  "yandex-ai": "yandex.cloud",
  "yandex-cloud": "yandex.cloud",
  "yandex-direct": "yandex.kz",
  "yandex-go": "yandex.kz",
  "yandex-id": "yandex.kz",
  "yandex-maps": "yandex.kz",
  "yandex-market": "market.yandex.kz",
  "yandex-metrica": "metrika.yandex.kz",
  "yandex-pay": "pay.yandex.ru",
  "yandex-search-ads": "yandex.kz",
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

export function resolveCompanySlug(api) {
  if (api.companySlug) return api.companySlug;
  if (api.provider) return slugify(api.provider);
  if (api.source) return slugify(api.source);
  return "api";
}

export function resolveProviderLogo(api) {
  const slug = resolveCompanySlug(api);

  if (LOCAL_LOGOS[slug]) {
    return { src: LOCAL_LOGOS[slug], kind: "local", label: api.companyName || api.provider };
  }

  if (slug.startsWith("yandex-")) {
    return { src: LOCAL_LOGOS.yandex, kind: "local", label: "Yandex" };
  }

  const simpleIcon = SIMPLE_ICONS[slug];
  if (simpleIcon) {
    return {
      src: `https://cdn.simpleicons.org/${slug}/${simpleIcon}`,
      kind: "remote",
      label: api.companyName || api.provider,
    };
  }

  const domain = DOMAIN_BY_SLUG[slug] || extractDomain(api);
  if (domain) {
    return {
      src: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`,
      kind: "remote",
      label: api.companyName || api.provider,
    };
  }

  return null;
}

export function providerBrandColor(slug) {
  const colors = {
    "2gis": { bg: "#1dc866", text: "#ffffff" },
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
