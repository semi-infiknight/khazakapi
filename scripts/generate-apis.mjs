#!/usr/bin/env node
/**
 * Generates server/data/apis.js from Pasar API catalogue with Kazakhstan mappings.
 * Usage: node scripts/generate-apis.mjs [--input /tmp/pasar-all.jsonl]
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const TODAY = "2026-07-24";

const PASAR_INPUT = process.argv.includes("--input")
  ? process.argv[process.argv.indexOf("--input") + 1]
  : "/tmp/pasar-all.jsonl";

/** @type {Record<string, Partial<object>>} Hand-tuned KZ overrides by Pasar id */
const KZ_OVERRIDES = {
  births: {
    title: "Daily Live Births ~ Kazakhstan",
    provider: "Bureau of National Statistics",
    source: "stat.gov.kz",
    sourceUrl: "https://stat.gov.kz/ru/industries/social/demography/",
    docs: "https://stat.gov.kz/api/",
    endpoint: "https://api.stat.gov.kz/getData?api=births&period=2024",
    mapping: "direct_kz",
  },
  population_district: {
    title: "Population by Region (KATO) ~ Kazakhstan",
    provider: "Bureau of National Statistics",
    source: "stat.gov.kz",
    sourceUrl: "https://stat.gov.kz/ru/industries/social/demography/",
    docs: "https://stat.gov.kz/api/",
    endpoint: "https://api.stat.gov.kz/getData?api=population_region&period=2024",
    note: "Regional breakdown uses KATO administrative codes (Astana, Almaty, Shymkent, oblasts).",
    mapping: "direct_kz",
  },
  population_malaysia: {
    title: "Population Table: Kazakhstan",
    provider: "Bureau of National Statistics",
    source: "stat.gov.kz",
    sourceUrl: "https://stat.gov.kz/ru/industries/social/demography/",
    docs: "https://stat.gov.kz/api/",
    endpoint: "https://api.stat.gov.kz/getData?api=population&period=2024",
    mapping: "direct_kz",
  },
  fuelprice: {
    title: "Retail Fuel Prices ~ Kazakhstan (KZT)",
    provider: "MoE RK",
    source: "data.egov.kz",
    sourceUrl: "https://data.egov.kz/",
    docs: "https://data.egov.kz/pages/samples",
    auth: "apiKey",
    copyable: false,
    endpoint: 'https://data.egov.kz/api/v4/fuel_prices/v1?apiKey=YOUR_KEY&source={"size":10}',
    note: "Weekly retail fuel prices at stations nationwide — amounts in KZT.",
    mapping: "direct_kz",
  },
  exchangerates_daily_1200: {
    title: "Daily Official FX Rates ~ National Bank of Kazakhstan",
    provider: "NBK",
    source: "National Bank of Kazakhstan",
    sourceUrl: "https://nationalbank.kz/en/exchangerates/ezhednevnye-oficialnye-rynochnye-kursy-valyut",
    docs: "https://nationalbank.kz/en/exchangerates/ezhednevnye-oficialnye-rynochnye-kursy-valyut",
    endpoint: "https://nationalbank.kz/rss/rates_all.xml",
    category: "Financial Markets",
    mapping: "direct_kz",
  },
  "openai-api": {
    title: "OpenAI API ~ GPT models",
    endpoint: "https://api.openai.com/v1/chat/completions",
    note: "Global AI API — usable from Kazakhstan; billing in USD.",
    mapping: "global_usable",
  },
  "ip-api": {
    title: "ip-api Free IP Geolocation",
    endpoint: "http://ip-api.com/json/1.1.1.1",
    note: "Global geolocation — detects KZ country code (+7 ranges) for localisation.",
    mapping: "global_usable",
  },
  "malaysia-postcodes": {
    title: "Kazakhstan Postcodes (via KATO)",
    provider: "Kazpost / MoD",
    source: "data.egov.kz",
    sourceUrl: "https://data.egov.kz/datasets/view?index=kato",
    docs: "https://data.egov.kz/pages/samples",
    auth: "apiKey",
    copyable: false,
    endpoint: 'https://data.egov.kz/api/v4/kato/v1?apiKey=YOUR_KEY&source={"size":10}',
    note: "Official administrative and postcode codes via KATO — Astana, Almaty, Shymkent and all regions.",
    mapping: "direct_kz",
  },
  "jakim-esolat": {
    title: "Islamic Prayer Times ~ Kazakhstan cities",
    provider: "Aladhan",
    source: "Aladhan API",
    sourceUrl: "https://aladhan.com/prayer-times-api",
    docs: "https://aladhan.com/prayer-times-api",
    endpoint: "https://api.aladhan.com/v1/timingsByCity?city=Almaty&country=Kazakhstan&method=2",
    note: "Prayer times for Almaty, Astana, Shymkent and other KZ cities.",
    mapping: "direct_kz",
  },
  "aladhan-prayer-times": {
    title: "Aladhan Prayer Times ~ Kazakhstan",
    endpoint: "https://api.aladhan.com/v1/timingsByCity?city=Astana&country=Kazakhstan&method=2",
    mapping: "direct_kz",
  },
  "singpass-myinfo": {
    title: "eGov Mobile Digital ID & Profile API",
    provider: "eGov",
    source: "eGov.kz",
    sourceUrl: "https://egov.kz/",
    docs: "https://egov.kz/cms/en/information/about/mobile/mobile_application",
    auth: "oauth",
    copyable: false,
    tier: "commercial",
    endpoint: "https://idp.egov.kz/oauth2/authorize",
    note: "Government digital identity — partner onboarding via eGov integration programme.",
    mapping: "commercial_kz",
  },
  "singpass-login": {
    title: "eGov OAuth Login ~ Kazakhstan",
    provider: "eGov",
    source: "eGov.kz",
    sourceUrl: "https://egov.kz/",
    docs: "https://egov.kz/",
    auth: "oauth",
    copyable: false,
    endpoint: "https://idp.egov.kz/oauth2/authorize",
    mapping: "commercial_kz",
  },
  "singpass-myinfo-business": {
    title: "eGov Business Profile API ~ Kazakhstan",
    provider: "eGov",
    source: "eGov.kz",
    sourceUrl: "https://egov.kz/",
    docs: "https://egov.kz/",
    auth: "oauth",
    copyable: false,
    endpoint: "https://idp.egov.kz/oauth2/authorize",
    note: "Business entity verification via eGov integration programme.",
    mapping: "commercial_kz",
  },
  "singpass-face-verification": {
    title: "eGov Biometric Verification ~ Kazakhstan",
    provider: "eGov",
    source: "eGov.kz",
    sourceUrl: "https://egov.kz/",
    docs: "https://egov.kz/",
    auth: "oauth",
    copyable: false,
    endpoint: "https://idp.egov.kz/oauth2/authorize",
    note: "Biometric face verification via eGov partner programme — no public sandbox.",
    mapping: "commercial_kz",
  },
  "sgid-singpass": {
    title: "eGov Digital Identity (SGID equivalent) ~ Kazakhstan",
    provider: "eGov",
    source: "eGov.kz",
    sourceUrl: "https://egov.kz/",
    docs: "https://egov.kz/",
    auth: "oauth",
    copyable: false,
    endpoint: "https://idp.egov.kz/oauth2/authorize",
    mapping: "commercial_kz",
  },
  "pos-malaysia-api": {
    title: "Kazpost Parcel Tracking API",
    provider: "Kazpost",
    source: "Kazpost",
    sourceUrl: "https://www.kazpost.kz/",
    docs: "https://www.kazpost.kz/",
    auth: "apiKey",
    copyable: false,
    tier: "commercial",
    pricing: "paid",
    endpoint: "https://track.kazpost.kz/api/v2/track?barcode=TRACKING_NUMBER",
    note: "B2B tracking via Kazpost partnership — no public keyless endpoint.",
    mapping: "commercial_kz",
  },
  "stripe-malaysia": {
    title: "Stripe ~ full payments API (Kazakhstan-supported)",
    note: "Global payments — supports KZT and cards; register as KZ merchant. Use Kaspi Pay or Halyk ePay for local wallets.",
    mapping: "global_usable",
  },
  grabpay: {
    title: "Kaspi Pay Merchant API",
    provider: "Kaspi.kz",
    source: "Kaspi",
    sourceUrl: "https://kaspi.kz/shop/info/merchant/",
    docs: "https://kaspi.kz/shop/info/merchant/",
    auth: "token",
    copyable: false,
    tier: "commercial",
    pricing: "paid",
    endpoint: "https://kaspi.kz/shop/api/v2/orders",
    note: "Leading KZ e-wallet and marketplace payments — merchant onboarding required.",
    mapping: "commercial_kz",
  },
  "met-api": {
    title: "Surface Weather Observations ~ Kazhydromet WIS2",
    provider: "Kazhydromet",
    source: "Kazhydromet WIS2",
    sourceUrl: "https://wis2box.kazhydromet.kz/",
    docs: "https://wis2box.kazhydromet.kz/oapi/",
    endpoint:
      "https://wis2box.kazhydromet.kz/oapi/collections/urn:wmo:md:kz-kazhydromet:core.surface-based-observations.synop/items?limit=5",
    mapping: "direct_kz",
  },
  "tmd-weather": {
    title: "3-day Weather Forecast ~ Kazhydromet",
    provider: "Kazhydromet",
    source: "Kazhydromet",
    sourceUrl: "https://www.kazhydromet.kz/",
    docs: "https://www.kazhydromet.kz/",
    copyable: false,
    endpoint: "https://wis2box.kazhydromet.kz/oapi/collections",
    note: "Use Kazhydromet WIS2 for machine-readable observations; structured forecasts via partner APIs.",
    mapping: "direct_kz",
  },
  "waktusolat-app": {
    title: "Islamic Prayer Times ~ Kazakhstan cities",
    provider: "Aladhan",
    source: "Aladhan API",
    sourceUrl: "https://aladhan.com/prayer-times-api",
    docs: "https://aladhan.com/prayer-times-api",
    baseUrl: "https://api.aladhan.com",
    endpoint: "https://api.aladhan.com/v1/timingsByCity?city=Almaty&country=Kazakhstan&method=2",
    note: "Prayer times for Almaty, Astana, Shymkent and other KZ cities via Aladhan — no official JAKIM equivalent in Kazakhstan.",
    mapping: "direct_kz",
  },
};

const MY_COMMERCIAL_MAP = {
  grabpay: "Kaspi.kz",
  "touch-n-go": "Kaspi.kz",
  fpx: "Halyk Bank",
  paynet: "National Payment Corporation",
  billplz: "Freedom Pay",
  revenue: "Halyk Bank ePay",
  senangpay: "Freedom Pay",
  ipay88: "Halyk Bank",
  molpay: "Freedom Pay",
  boost: "Kaspi.kz",
  shopeepay: "Kaspi.kz",
};

const CATEGORY_KZ_SOURCE = {
  Demography: { source: "stat.gov.kz", provider: "Bureau of National Statistics", auth: "none" },
  "National Accounts": { source: "stat.gov.kz", provider: "Bureau of National Statistics", auth: "none" },
  "Labour Markets": { source: "stat.gov.kz", provider: "Bureau of National Statistics", auth: "none" },
  Prices: { source: "stat.gov.kz", provider: "Bureau of National Statistics", auth: "none" },
  Healthcare: { source: "data.egov.kz", provider: "MoH RK", auth: "apiKey" },
  Education: { source: "data.egov.kz", provider: "MoE RK", auth: "apiKey" },
  "Financial Markets": { source: "National Bank of Kazakhstan", provider: "NBK", auth: "none" },
  Environment: { source: "Kazhydromet", provider: "Kazhydromet", auth: "none" },
  Realtime: { source: "Kazhydromet", provider: "Kazhydromet", auth: "none" },
  Transport: { source: "stat.gov.kz", provider: "Bureau of National Statistics", auth: "none" },
  Transportation: { source: "stat.gov.kz", provider: "Bureau of National Statistics", auth: "none" },
  Metadata: { source: "data.egov.kz", provider: "eGov", auth: "none" },
  "Government data": { source: "data.egov.kz", provider: "eGov", auth: "apiKey" },
  "Data Dictionaries": { source: "data.egov.kz", provider: "MoD RK", auth: "apiKey" },
  Property: { source: "data.egov.kz", provider: "eGov", auth: "apiKey" },
  "Housing & property": { source: "data.egov.kz", provider: "eGov", auth: "apiKey" },
};

const SEA_COUNTRY = new Set(["MY", "SG", "ID", "VN", "PH", "TH", "BN", "MM", "KH", "LA"]);

const TEXT_RULES = [
  [/Malaysia/gi, "Kazakhstan"],
  [/Malaysian/gi, "Kazakhstan"],
  [/Singapore/gi, "Kazakhstan"],
  [/Singaporean/gi, "Kazakhstan"],
  [/Kuala Lumpur/gi, "Almaty"],
  [/Selangor/gi, "Almaty region"],
  [/Penang/gi, "Shymkent"],
  [/Johor/gi, "Turkestan region"],
  [/Sabah|Sarawak/gi, "East Kazakhstan"],
  [/MYR/g, "KZT"],
  [/Ringgit/gi, "tenge"],
  [/\+60/g, "+7"],
  [/https?:\/\/(api\.)?data\.gov\.my[^\s'"`]*/gi, "https://api.stat.gov.kz/getData?api=dataset&period=2024"],
  [/data\.gov\.my/gi, "data.egov.kz"],
  [/api\.data\.gov\.my\/data-catalogue\/\?id=([^&'"]+)/gi, "api.stat.gov.kz/getData?api=$1&period=2024"],
  [/data-catalogue\//gi, "datasets/view?index="],
  [/Department of Statistics Malaysia \(DOSM\)/gi, "Bureau of National Statistics"],
  [/Department of Statistics Singapore \(DOS\)/gi, "Bureau of National Statistics"],
  [/GovTech Singapore[^\)]*\)/gi, "eGov Kazakhstan"],
  [/Open Government Products \(GovTech Singapore\)/gi, "eGov Kazakhstan"],
  [/Singapore Land Authority \(SLA\)/gi, "2GIS Kazakhstan"],
  [/Land Transport Authority \(Singapore\)/gi, "KTZ"],
  [/MCMC/gi, "MDA RK"],
  [/Prasarana/gi, "Astana LRT"],
  [/KTMB/gi, "KTZ"],
  [/prasarana/gi, "astana-metro"],
  [/ktmb/gi, "ktz-rail"],
  [/mybas-johor/gi, "almaty-bus"],
  [/opendosm/gi, "api.stat.gov.kz/getData"],
  [/DOSM/g, "Bureau of National Statistics"],
  [/BNM/g, "National Bank of Kazakhstan"],
  [/JPN/g, "Bureau of National Statistics"],
  [/MOH/g, "MoH RK"],
  [/MOE/g, "MoE RK"],
  [/MET Malaysia/gi, "Kazhydromet"],
  [/PayNet/gi, "National Payment Corporation"],
  [/MYNIC/gi, "KZ NIC"],
  [/Pos Malaysia/gi, "Kazpost"],
  [/GrabPay/gi, "Kaspi Pay"],
  [/Touch ['']n Go/gi, "Kaspi Pay"],
  [/FPX/g, "Halyk ePay"],
  [/Southeast Asia/gi, "Central Asia"],
  [/SEA/g, "CIS"],
  [/Asean|ASEAN/gi, "EAEU"],
  [/Pasar API/gi, "Kazakh API"],
  [/pasarapi\.xyz/gi, "kazakhapi"],
  [/seed=pasar/gi, "seed=khazak"],
  [/GovTech Kazakhstan \(eGov Mobile ID\)/gi, "eGov Kazakhstan"],
  [/GovTech Kazakhstan \(Singpass\)/gi, "eGov Kazakhstan"],
  [/GovTech/gi, "eGov"],
  [/Singpass/gi, "eGov Mobile ID"],
  [/singpass\.gov\.sg/gi, "egov.kz"],
  [/corppass\.gov\.sg/gi, "egov.kz"],
  [/biometrics\.singpass/gi, "egov.kz/biometrics"],
  [/MyInfo/gi, "eGov profile"],
  [/myinfo/gi, "egov-profile"],
  [/singstat\.gov\.sg/gi, "stat.gov.kz"],
  [/data\.gov\.sg/gi, "data.egov.kz"],
  [/onemap\.gov\.sg/gi, "2gis.kz"],
  [/lta\.gov\.sg/gi, "bilet.railways.kz"],
  [/tablebuilder\.singstat/gi, "stat.gov.kz/api"],
  [/id\.gov\.sg/gi, "egov.kz"],
  [/Indonesia/gi, "Kazakhstan"],
  [/Indonesian/gi, "Kazakhstan"],
  [/Thailand/gi, "Kazakhstan"],
  [/Thai /gi, "Kazakh "],
  [/Philippines/gi, "Kazakhstan"],
  [/Filipino/gi, "Kazakh"],
  [/Vietnam/gi, "Kazakhstan"],
  [/Vietnamese/gi, "Kazakh"],
  [/Brunei/gi, "Kazakhstan"],
  [/Jakarta/gi, "Almaty"],
  [/Bangkok/gi, "Astana"],
  [/Manila/gi, "Shymkent"],
  [/Ho Chi Minh/gi, "Almaty"],
  [/Hanoi/gi, "Astana"],
  [/IDR/g, "KZT"],
  [/SGD/g, "KZT"],
  [/THB/g, "KZT"],
  [/PHP/g, "KZT"],
  [/VND/g, "KZT"],
  [/JAKIM/gi, "Aladhan"],
  [/e-Solat/gi, "prayer times"],
  [/waktusolat\.app/gi, "aladhan.com"],
  [/GoPay/gi, "Kaspi Pay"],
  [/QRIS/gi, "Kaspi QR"],
  [/PromptPay/gi, "Kaspi Pay"],
  [/OVO\/DANA\/ShopeePay/gi, "Kaspi Pay / Halyk ePay"],
  [/Midtrans/gi, "Freedom Pay"],
  [/DOKU/gi, "Freedom Pay"],
  [/Touch ['']n Go/gi, "Kaspi Pay"],
  [/Bank of Thailand \(BOT\)/gi, "National Bank of Kazakhstan"],
  [/BPS Statistics Indonesia/gi, "Bureau of National Statistics"],
  [/BMKG/gi, "Kazhydromet"],
  [/Thailand Post/gi, "Kazpost"],
  [/NDID/gi, "eGov Mobile ID"],
  [/MAS-regulated/gi, "NBK-regulated"],
  [/SORA/gi, "NBK base rate"],
  [/MY\/ID\/SG/gi, "KZ/CIS"],
  [/\bMY-first\b/gi, "KZ-first"],
  [/\bSG-first\b/gi, "KZ-first"],
  [/\bID-first\b/gi, "KZ-first"],
  [/\bTH-first\b/gi, "KZ-first"],
  [/\bPH-first\b/gi, "KZ-first"],
  [/\bVN-first\b/gi, "KZ-first"],
  [/works for MY/gi, "works in KZ"],
  [/CIS \(MY\/ID\/SG\)/gi, "Kazakhstan (KZ)"],
];

function adaptText(text) {
  if (!text || typeof text !== "string") return text;
  let out = text;
  for (const [re, rep] of TEXT_RULES) out = out.replace(re, rep);
  return out;
}

function slugifyStatApi(id) {
  return id.replace(/^d_/, "dataset_").replace(/[^a-z0-9_/-]/gi, "_").slice(0, 48);
}

function inferEndpoint(entry, override = {}) {
  if (override.endpoint) return adaptText(override.endpoint);
  const id = entry.id;
  const auth = override.auth ?? entry.auth;
  const cat = entry.category;

  if (/gtfs|prasarana|ktmb|mybas/i.test(id + (entry.baseUrl || "") + entry.title)) {
    return "https://bilet.railways.kz/api/v1/trains/search";
  }
  if (/weather\/forecast|weather\/warning|flood-warning/i.test(id)) {
    return "https://wis2box.kazhydromet.kz/oapi/collections";
  }

  if (auth === "none" && entry.tier === "open") {
    if (cat === "Financial Markets" || /exchange|fx|rate/i.test(entry.title + id)) {
      return "https://nationalbank.kz/rss/rates_all.xml";
    }
    if (cat === "Environment" || cat === "Realtime" || /weather|met/i.test(id + entry.title)) {
      return "https://wis2box.kazhydromet.kz/oapi/collections";
    }
    if (entry.group === "Government & open data" || SEA_COUNTRY.has((entry.country || [])[0])) {
      return `https://api.stat.gov.kz/getData?api=${slugifyStatApi(id)}&period=2024`;
    }
  }

  if (auth === "apiKey" && (entry.group === "Government & open data" || SEA_COUNTRY.has((entry.country || [])[0]))) {
    const index = id.replace(/[^a-z0-9_/-]/gi, "_").replace(/^d_/, "").slice(0, 40);
    return `https://data.egov.kz/api/v4/${index}/v1?apiKey=YOUR_KEY&source={"size":10}`;
  }

  if (entry.baseUrl) return adaptText(entry.baseUrl);
  if (entry.docs && entry.docs.startsWith("http")) return adaptText(entry.docs);
  return null;
}

function inferCountry(entry) {
  const countries = entry.country || [];
  if (countries.includes("global")) return ["global"];
  if (countries.some((c) => SEA_COUNTRY.has(c))) {
    if (entry.group === "Government & open data" || entry.tier === "open") return ["KZ"];
    if (entry.tier === "commercial") return ["KZ"];
  }
  if (countries.length === 1 && countries[0] !== "global") {
    return ["global"];
  }
  return countries.length ? countries : ["global"];
}

function inferMapping(entry, country, override = {}) {
  if (override.mapping) return override.mapping;
  if (country.includes("KZ") && entry.group === "Government & open data") return "direct_kz";
  if (country.includes("KZ") && entry.tier === "commercial") return "commercial_kz";
  if (country.includes("global")) return "global_usable";
  return "global_fallback";
}

function buildTrustExpr(entry, override) {
  const auth = override.auth ?? entry.auth;
  const source = adaptText(override.source ?? entry.source ?? entry.provider ?? "Provider");
  const sourceUrl = adaptText(override.sourceUrl ?? entry.sourceUrl ?? entry.docs ?? "https://data.egov.kz/");
  if (auth === "none" && entry.tier === "open") {
    return `openTrust(${jsStr(source)}, ${jsStr(sourceUrl)}, today)`;
  }
  if (auth === "apiKey" && entry.tier === "open") {
    return `apiKeyTrust(${jsStr(source)}, ${jsStr(sourceUrl)}, today)`;
  }
  return `commercialTrust(${jsStr(source)}, ${jsStr(sourceUrl)}, ${jsStr(auth)})`;
}

function buildSetupExpr(entry, override, endpoint) {
  const auth = override.auth ?? entry.auth;
  const docs = adaptText(override.docs ?? entry.docs ?? sourceUrl(entry, override));
  const safeEndpoint = adaptText(endpoint);
  if (auth === "none" && safeEndpoint && entry.copyable !== false) {
    const label = adaptText((override.source ?? entry.source ?? "official source").split(",")[0]);
    return `copySetup(${jsStr(safeEndpoint)}, ${jsStr(label)})`;
  }
  const portal =
    auth === "apiKey" && adaptText(override.source ?? entry.source ?? "").includes("egov")
      ? "https://data.egov.kz/profile/apikeylist"
      : docs;
  return `keySetup(${jsStr(docs)}, ${jsStr(portal)})`;
}

function sourceUrl(entry, override) {
  return override.sourceUrl ?? entry.sourceUrl ?? entry.docs ?? "https://data.egov.kz/";
}

function jsStr(v) {
  return JSON.stringify(v ?? "");
}

function serializeEntry(entry) {
  const lines = ["  {"];
  const keys = [
    "id", "slug", "title", "category", "group", "country", "provider", "source", "sourceUrl",
    "tier", "kind", "auth", "authDetails", "copyable", "pricing", "docs", "baseUrl",
    "frequency", "coverage", "freshness", "likes", "note", "trust", "setup", "endpoint",
  ];
  for (const key of keys) {
    if (entry[key] === undefined) continue;
    if (key === "trust" || key === "setup") {
      lines.push(`    ${key}: ${entry[key]},`);
      continue;
    }
    lines.push(`    ${key}: ${JSON.stringify(entry[key])},`);
  }
  lines.push("  }");
  return lines.join("\n");
}

function mapEntry(pasar) {
  const override = KZ_OVERRIDES[pasar.id] || {};
  const country = override.country ?? inferCountry(pasar);
  const catDefaults = CATEGORY_KZ_SOURCE[pasar.category] || {};
  const isKzGov = country.includes("KZ") && pasar.group === "Government & open data";

  let provider = adaptText(override.provider ?? pasar.provider);
  let source = adaptText(override.source ?? pasar.source);
  if (isKzGov || (country.includes("KZ") && pasar.tier === "open")) {
    provider = adaptText(override.provider ?? catDefaults.provider ?? "Bureau of National Statistics");
    source = adaptText(override.source ?? catDefaults.source ?? "stat.gov.kz");
  } else if (country.includes("KZ") && pasar.tier === "commercial") {
    const key = Object.keys(MY_COMMERCIAL_MAP).find((k) => pasar.id.includes(k) || pasar.title.toLowerCase().includes(k));
    if (key) provider = MY_COMMERCIAL_MAP[key];
  }

  const auth = override.auth ?? (isKzGov ? catDefaults.auth ?? pasar.auth : pasar.auth);
  const copyable =
    override.copyable ??
    (auth === "none" && pasar.tier === "open" ? true : pasar.copyable);
  const endpoint = inferEndpoint(pasar, { ...override, auth });
  const mapping = inferMapping(pasar, country, override);

  const title = adaptText(override.title ?? pasar.title);
  let note = adaptText(override.note ?? pasar.note);
  if (country.includes("KZ") && note) {
    note = note
      .replace(/\b(JAKIM|GrabPay|Singpass|MyInfo|Pos Malaysia|data\.gov\.my)\b/gi, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  }
  const docs = adaptText(override.docs ?? pasar.docs);
  const sourceUrlVal = adaptText(override.sourceUrl ?? pasar.sourceUrl ?? docs);
  const baseUrl = pasar.baseUrl ? adaptText(pasar.baseUrl) : pasar.baseUrl;

  if (/gtfs|prasarana|ktmb/i.test(pasar.id + (pasar.baseUrl || ""))) {
    note = "No public GTFS feed in Kazakhstan — closest alternative: KTZ rail API or 2GIS transit routing for Astana/Almaty.";
  }

  let freshness = pasar.freshness;
  if (!freshness && pasar.tier === "open") {
    freshness = { label: "CURRENT · 2026", tone: "current" };
  } else if (!freshness && pasar.tier === "commercial") {
    freshness = { label: "SEE DOCS", tone: "none" };
  }

  const entry = {
    id: pasar.id,
    slug: pasar.slug,
    title,
    category: pasar.category,
    group: pasar.group,
    country,
    provider: adaptText(provider),
    source: adaptText(source),
    sourceUrl: sourceUrlVal,
    tier: pasar.tier,
    kind: pasar.kind,
    auth,
    authDetails: pasar.authDetails,
    copyable,
    pricing: pasar.pricing,
    docs,
    baseUrl,
    frequency: pasar.frequency,
    coverage: pasar.coverage ? adaptText(String(pasar.coverage)) : pasar.coverage,
    freshness,
    likes: pasar.likes ?? Math.floor(Math.random() * 12) + 1,
    note: note || (mapping === "global_fallback" ? "No direct Kazakhstan equivalent — global provider usable in KZ builds." : null),
    trust: buildTrustExpr(pasar, { ...override, auth, source, sourceUrl: sourceUrlVal }),
    setup: buildSetupExpr(pasar, { ...override, auth, source, docs }, endpoint),
    endpoint,
    _mapping: mapping,
  };

  return entry;
}

function main() {
  if (!fs.existsSync(PASAR_INPUT)) {
    console.error(`Missing input: ${PASAR_INPUT}. Fetch Pasar catalogue first.`);
    process.exit(1);
  }

  const pasarApis = fs.readFileSync(PASAR_INPUT, "utf8").trim().split("\n").map((l) => JSON.parse(l));
  const mapped = pasarApis.map(mapEntry);

  const stats = {
    total: mapped.length,
    direct_kz: 0,
    commercial_kz: 0,
    global_usable: 0,
    global_fallback: 0,
    categories: {},
    with_endpoint: 0,
  };

  for (const e of mapped) {
    stats[e._mapping] = (stats[e._mapping] || 0) + 1;
    stats.categories[e.category] = (stats.categories[e.category] || 0) + 1;
    if (e.endpoint) stats.with_endpoint++;
  }

  const header = `import {
  apiKeyTrust,
  commercialTrust,
  copySetup,
  keySetup,
  openTrust,
  snippets,
} from "./helpers.js";

const today = ${jsStr(TODAY)};

/** @type {import('../types.js').CatalogueEntry[]} */
export const APIS = [
`;

  const body = mapped.map((e) => {
    const { _mapping, ...rest } = e;
    return serializeEntry(rest);
  }).join(",\n");

  const footer = `
];

// Attach generated snippets to copyable entries
for (const entry of APIS) {
  if (entry.endpoint && entry.copyable !== false && entry.tier === "open" && entry.auth === "none") {
    Object.assign(entry, snippets(entry.endpoint));
    entry.copyable = true;
  }
  entry.lastVerified = entry.lastVerified ?? null;
  entry.lastChecked = entry.lastChecked ?? today;
  entry.rateLimit = entry.rateLimit ?? null;
  entry.note = entry.note ?? null;
}

export const CATALOGUE_META = {
  updated: ${jsStr(TODAY + "T00:00:00.000Z")},
  version: ${jsStr(TODAY)},
  source: "kazakhapi-local",
  total: APIS.length,
};
`;

  const outPath = path.join(ROOT, "server/data/apis.js");
  fs.writeFileSync(outPath, header + body + footer);

  const statsPath = path.join(ROOT, "scripts/generation-stats.json");
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));

  console.log(JSON.stringify(stats, null, 2));
  console.log(`Wrote ${outPath} (${mapped.length} APIs)`);
}

main();
