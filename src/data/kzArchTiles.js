import logosManifest from "../lib/logosManifest.json";

const VENDOR_LABELS = {
  "2gis": "2GIS",
  "air-astana": "Air Astana",
  "alatau-city-bank": "Alatau City Bank",
  "apipay-kz": "Apipay",
  "asiapay": "Asiapay",
  "aviata-kz": "Aviata",
  "bank-rbk": "Bank RBK",
  "beeline-cloud": "Beeline Cloud",
  "beeline-kazakhstan": "Beeline",
  "bereke-bank": "Bereke Bank",
  cdek: "CDEK",
  chocofamily: "Chocofamily",
  "data-egov-kz": "data.egov.kz",
  "egov-kz": "egov.kz",
  "esf-kgd": "ESF KGD",
  "eurasian-bank": "Eurasian Bank",
  flyarystan: "FlyArystan",
  fortebank: "ForteBank",
  "freedompay-kz": "Freedom Pay",
  glovo: "Glovo",
  "halyk-bank": "Halyk Bank",
  "halyk-epay": "Halyk ePay",
  indriver: "inDriver",
  "kaspi-kz": "Kaspi.kz",
  kazhydromet: "Kazhydromet",
  kazpost: "Kazpost",
  kcell: "Kcell",
  ktz: "KTZ",
  nbk: "NBK",
  npck: "NPCK",
  ozon: "Ozon",
  "paybot-kz": "Paybot",
  paybox: "Paybox",
  "ps-cloud": "PS Cloud",
  "qiwi-kazakhstan": "QIWI",
  "scat-airlines": "SCAT",
  sigex: "Sigex",
  "stat-gov-kz": "stat.gov.kz",
  "tele2-kazakhstan": "Tele2",
  "tickets-kz": "Tickets.kz",
  wildberries: "Wildberries",
  wolt: "Wolt",
  wooppay: "Wooppay",
  "yandex-360": "Yandex 360",
  "yandex-ai": "Yandex AI",
  "yandex-cloud": "Yandex Cloud",
  "yandex-direct": "Yandex Direct",
  "yandex-go": "Yandex Go",
  "yandex-id": "Yandex ID",
  "yandex-maps": "Yandex Maps",
  "yandex-market": "Yandex Market",
  "yandex-metrica": "Yandex Metrica",
  "yandex-pay": "Yandex Pay",
  "yandex-search-ads": "Yandex Ads",
};

/** Prefer slugs used in hero beam targets and distinct product marks. */
const ARCH_TILE_SLUG_PRIORITY = {
  "yandex-maps": 0,
  "yandex-market": 1,
  "yandex-cloud": 2,
  "yandex-ai": 3,
  "kaspi-kz": 0,
  "2gis": 0,
  "halyk-bank": 0,
  "halyk-epay": 1,
  "beeline-kazakhstan": 0,
  "beeline-cloud": 1,
  "data-egov-kz": 0,
  "egov-kz": 1,
};

function archTilePriority(slug) {
  if (ARCH_TILE_SLUG_PRIORITY[slug] != null) return ARCH_TILE_SLUG_PRIORITY[slug];
  if (slug.startsWith("yandex-")) return 10;
  return 50;
}

/** Keep one tile per logo asset so the scrolling wall does not repeat identical marks. */
export function uniqueArchTiles(tiles) {
  const bySrc = new Map();

  for (const tile of tiles) {
    if (!tile.src) continue;
    const existing = bySrc.get(tile.src);
    if (!existing || archTilePriority(tile.slug) < archTilePriority(existing.slug)) {
      bySrc.set(tile.src, tile);
    }
  }

  return [...bySrc.values()];
}

const ALL_ARCH_TILES = Object.entries(logosManifest)
  .filter(([, src]) => src)
  .map(([slug, src]) => ({
    slug,
    src,
    vendor: VENDOR_LABELS[slug] || slug.replace(/-/g, " "),
  }));

/** Integrated provider logos for the hero API field grid (deduped by image). */
export const KZ_ARCH_TILES = uniqueArchTiles(ALL_ARCH_TILES);

/** Full slug list for bloom targeting — includes aliases sharing the same PNG. */
export const KZ_ARCH_TILES_BY_SLUG = Object.fromEntries(ALL_ARCH_TILES.map((tile) => [tile.slug, tile]));
