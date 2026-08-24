/** Providers that belong in the Kazakhstan catalogue. */
const KZ_PROVIDERS = new Set([
  "Aladhan",
  "Bureau of National Statistics",
  "eGov",
  "Freedom Pay",
  "Freedom Pay (GoTo Financial)",
  "Halyk Bank",
  "Halyk Bank ePay",
  "Kaspi.kz",
  "Kazhydromet",
  "Kazpost",
  "Kazpost / MoD",
  "MoD RK",
  "MoE RK",
  "MoH RK",
  "NBK",
  "Yandex",
  "Yandex Go",
  "Yandex Market",
]);

/**
 * Kazakhstan catalogue = allowlisted providers, data.egov dataset ids, and Yandex APIs.
 * Everything else tagged country: ["KZ"] during the Malaysia→KZ rebrand is excluded.
 */
export function isKzCatalogueEntry(entry) {
  const countries = entry.country || [];
  if (!countries.includes("KZ")) return false;

  if (entry.id?.startsWith("d_")) return true;
  if (entry.id?.startsWith("yandex-") || entry.id?.startsWith("yandex_")) return true;
  if (KZ_PROVIDERS.has(entry.provider)) return true;

  return false;
}

export function filterKzCatalogue(apis) {
  return apis.filter(isKzCatalogueEntry);
}
