/** Legacy Pasar ids rebadged as KZ commercial — not real Kazakhstan providers. */
export const KZ_COMMERCIAL_BLOCKLIST = new Set([
  // Duplicate / superseded
  "onemap-sg",

  // Malaysia & SEA payment gateways mislabeled as Halyk / Freedom Pay / Kaspi
  "billplz",
  "toyyibpay",
  "senangpay",
  "fiuu",
  "grabpay",
  "midtrans",
  "doku",
  "ipay88",
  "xendit",
  "hitpay",
  "revenue-monster",
  "2c2p-payment-gateway",
  "bizappay",
  "bayarcash",
  "opn-payments-omise",

  // Malaysia logistics mislabeled as Kazpost
  "pos-malaysia-api",
  "malaysia-postcodes",

  // Singapore eGov mislabeled
  "singpass-myinfo",
  "singpass-myinfo-business",
  "singpass-login",
  "singpass-face-verification",

  // Global SaaS mislabeled under Bureau of National Statistics
  "ip-api",
  "blockchain-com-data-api",
  "invoice-ninja-api",
  "openrouteservice",
  "weaviate",
  "qdrant-cloud",
  "opendosm",
  "thailand-geography-json",
  "thailandformats-holidays",
  "emsifa-wilayah-indonesia",
  "kodepos-indonesia",
  "libur-indonesia",
  "equran-id",

  // Superseded by kz-aladhan-prayer
  "jakim-esolat",
  "waktusolat-app",
]);

export function isCommercialCatalogueEntry(entry) {
  return entry.tier === "commercial" || entry.kind === "commercial";
}

/** Real KZ commercial = curated kz-* / yandex-* modules only. */
export function isLegitimateKzCommercial(entry) {
  const id = entry.id || entry.slug || "";
  if (KZ_COMMERCIAL_BLOCKLIST.has(id)) return false;
  if (id.startsWith("kz-") || id.startsWith("yandex-") || id.startsWith("yandex_")) return true;
  return false;
}
