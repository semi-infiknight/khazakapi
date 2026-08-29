#!/usr/bin/env node
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { KZ_APIS } from "../server/data/apis.js";
import { resolveCompany } from "../server/lib/services.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const logosManifest = JSON.parse(readFileSync(resolve(__dirname, "../src/lib/logosManifest.json"), "utf8"));

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

const slugs = new Map();
for (const api of KZ_APIS) {
  const c = resolveCompany(api);
  if (!slugs.has(c.slug)) slugs.set(c.slug, { name: c.name, apis: [] });
  slugs.get(c.slug).apis.push(api.id);
}

const missingLocal = [];
const hasLocal = [];
const hasRemote = [];
const noLogo = [];

for (const [slug, info] of slugs) {
  if (logosManifest[slug]) {
    hasLocal.push(slug);
  } else if (DOMAIN_BY_SLUG[slug]) {
    hasRemote.push(slug);
  } else {
    const sample = KZ_APIS.find((a) => resolveCompany(a).slug === slug);
    const domain = extractDomain(sample);
    if (domain) hasRemote.push(`${slug} (${domain})`);
    else {
      noLogo.push({ slug, name: info.name });
      missingLocal.push(slug);
    }
  }
}

console.log("Companies:", slugs.size);
console.log("Local manifest:", hasLocal.length);
console.log("Remote fallback only:", hasRemote.length, hasRemote);
console.log("No logo at all:", noLogo.length);
if (noLogo.length) console.log(noLogo);
