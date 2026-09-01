#!/usr/bin/env node
/**
 * Download official provider favicons into public/logos/{slug}.png
 * Run: node scripts/fetch-provider-logos.mjs
 */
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { KZ_APIS } from "../server/data/apis.js";
import { resolveCompany } from "../server/lib/services.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const logosDir = resolve(__dirname, "../public/logos");
const manifestPath = resolve(__dirname, "../src/lib/logosManifest.json");

/** Direct high-res logo URLs when favicon scrapers return tiny assets. */
const SLUG_URL_OVERRIDES = {
  "beeline-cloud": [
    "https://icon.horse/icon/beeline.ru",
    "https://static.beeline.ru/upload/images/logo.png",
  ],
  "beeline-kazakhstan": [
    "https://icon.horse/icon/beeline.ru",
    "https://static.beeline.ru/upload/images/logo.png",
  ],
  chocofamily: ["https://icon.horse/icon/chocofamily.kz"],
  "data-egov-kz": ["https://icon.horse/icon/egov.kz", "https://icon.horse/icon/npck.kz"],
  "esf-kgd": ["https://icon.horse/icon/esf.kgd.gov.kz"],
  fortebank: ["https://icon.horse/icon/fortebank.com"],
  indriver: ["https://icon.horse/icon/indriver.com"],
  paybox: ["https://icon.horse/icon/paybox.money"],
  "qiwi-kazakhstan": ["https://icon.horse/icon/qiwi.com"],
  "tele2-kazakhstan": ["https://icon.horse/icon/tele2.ru", "https://icon.horse/icon/altel.kz"],
  wildberries: ["https://icon.horse/icon/wildberries.ru"],
  "yandex-360": ["https://yastatic.net/s3/home/logos/share/share-logo-ru.png"],
  "yandex-ai": [
    "https://yandex.cloud/favicon.ico",
    "https://console.cloud.yandex.ru/favicon.ico",
    "https://yastatic.net/s3/home/logos/share/share-logo-ru.png",
  ],
  "yandex-cloud": [
    "https://yandex.cloud/favicon.ico",
    "https://console.cloud.yandex.ru/favicon.ico",
    "https://yastatic.net/s3/home/logos/share/share-logo-ru.png",
  ],
  "yandex-direct": ["https://yastatic.net/s3/home/logos/share/share-logo-ru.png"],
  "yandex-go": ["https://yastatic.net/s3/home/logos/share/share-logo-ru.png"],
  "yandex-id": ["https://yastatic.net/s3/home/logos/share/share-logo-ru.png"],
  "yandex-maps": ["https://yastatic.net/s3/home/logos/share/share-logo-ru.png"],
  "yandex-market": ["https://icon.horse/icon/market.yandex.ru"],
  "yandex-metrica": ["https://yastatic.net/s3/home/logos/share/share-logo-ru.png"],
  "yandex-pay": ["https://yastatic.net/s3/home/logos/share/share-logo-ru.png"],
  "yandex-search-ads": ["https://yastatic.net/s3/home/logos/share/share-logo-ru.png"],
};

const DOMAIN_OVERRIDES = {
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
  paybox: "paybox.money",
  "ps-cloud": "ps.kz",
  "qiwi-kazakhstan": "qiwi.kz",
  "scat-airlines": "scat.kz",
  sigex: "sigex.kz",
  "stat-gov-kz": "stat.gov.kz",
  "tele2-kazakhstan": "tele2.ru",
  "tickets-kz": "tickets.kz",
  wildberries: "wildberries.ru",
  wolt: "wolt.com",
  wooppay: "wooppay.com",
  yandex: "yandex.ru",
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

function slugDomainMap() {
  const slugs = new Map();
  for (const api of KZ_APIS) {
    const company = resolveCompany(api);
    if (slugs.has(company.slug)) continue;
    const domain = DOMAIN_OVERRIDES[company.slug] || extractDomain(api);
    if (domain) slugs.set(company.slug, domain);
  }
  return slugs;
}

function isImage(buf) {
  if (!buf || buf.length < 12) return false;
  const head = buf.slice(0, 64).toString("utf8").trimStart().toLowerCase();
  if (head.startsWith("<!doctype") || head.startsWith("<html") || head.startsWith("<head")) {
    return false;
  }
  if (buf[0] === 0x89 && buf[1] === 0x50) return true; // png
  if (buf[0] === 0xff && buf[1] === 0xd8) return true; // jpeg
  if (buf[0] === 0x47 && buf[1] === 0x49) return true; // gif
  // ICO / CUR — common for favicons saved with a .png extension
  if (buf[0] === 0x00 && buf[1] === 0x00 && (buf[2] === 0x01 || buf[2] === 0x02)) return true;
  return false;
}

function pngDimensions(buf) {
  if (!buf || buf.length < 24 || buf[0] !== 0x89 || buf[1] !== 0x50) return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

function jpegDimensions(buf) {
  if (!buf || buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < buf.length) {
    if (buf[offset] !== 0xff) break;
    const marker = buf[offset + 1];
    const length = buf.readUInt16BE(offset + 2);
    if (marker === 0xc0 || marker === 0xc2) {
      return { w: buf.readUInt16BE(offset + 7), h: buf.readUInt16BE(offset + 9) };
    }
    offset += 2 + length;
  }
  return null;
}

function imageArea(buf) {
  const png = pngDimensions(buf);
  if (png) return png.w * png.h;
  const jpeg = jpegDimensions(buf);
  if (jpeg) return jpeg.w * jpeg.h;
  return buf?.length ?? 0;
}

function googleFaviconUrl(domain, size = 256) {
  return `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(`https://${domain}`)}&size=${size}`;
}

async function fetchBuffer(url) {
  const res = await fetch(url, {
    redirect: "follow",
    headers: { "User-Agent": "QazaqStack/1.0 (logo fetch)" },
  });
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  return isImage(buf) ? buf : null;
}

async function downloadLogo(slug, domain) {
  const candidates = [
    ...(SLUG_URL_OVERRIDES[slug] ?? []),
    `https://icon.horse/icon/${domain}`,
    `https://logo.clearbit.com/${domain}?size=256`,
    `https://logo.clearbit.com/${domain}?size=128`,
    googleFaviconUrl(domain, 256),
    googleFaviconUrl(domain, 128),
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=256`,
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`,
    `https://${domain}/apple-touch-icon.png`,
    `https://${domain}/favicon.ico`,
  ];

  let best = null;
  let bestArea = 0;
  for (const url of candidates) {
    try {
      const buf = await fetchBuffer(url);
      if (!buf) continue;
      const area = imageArea(buf);
      if (area > bestArea) {
        best = buf;
        bestArea = area;
      }
      if (area >= 128 * 128) return buf;
    } catch {
      // try next source
    }
  }
  return best;
}

mkdirSync(logosDir, { recursive: true });

const slugs = slugDomainMap();
const manifest = {};
let ok = 0;
let fail = 0;

for (const [slug, domain] of [...slugs.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  process.stdout.write(`fetching ${slug} (${domain})... `);
  const buf = await downloadLogo(slug, domain);
  if (buf) {
    const out = resolve(logosDir, `${slug}.png`);
    writeFileSync(out, buf);
    manifest[slug] = `/logos/${slug}.png`;
    ok += 1;
    console.log("ok");
  } else {
    manifest[slug] = null;
    fail += 1;
    console.log("miss");
  }
}

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`\nDone: ${ok} saved, ${fail} missing → ${manifestPath}`);
