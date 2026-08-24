import { isCommercialCatalogueEntry, isLegitimateKzCommercial } from "./kzCommercial.js";

/** Providers that belong in the Kazakhstan catalogue (non-commercial open data & gov). */
const KZ_PROVIDERS = new Set([
  "2GIS",
  "Air Astana",
  "Aladhan",
  "Alatau City Bank",
  "Beeline Kazakhstan",
  "Bereke Bank",
  "Bureau of National Statistics",
  "eGov",
  "ForteBank",
  "Freedom Pay KZ",
  "Halyk ePay",
  "Kaspi.kz",
  "Kazhydromet",
  "Kazpost",
  "Kazpost / MoD",
  "Kcell",
  "MoD RK",
  "MoE RK",
  "MoH RK",
  "NBK",
  "Paybox",
  "Tickets.kz",
  "Tele2 Kazakhstan",
  "Wooppay",
  "Woopkassa",
  "Yandex",
  "Yandex Go",
  "Yandex Market",
  "inDriver",
]);

/**
 * Kazakhstan catalogue = allowlisted providers, data.egov dataset ids, kz-* / yandex-* modules.
 * Commercial entries must come from curated kz-* or yandex-* ids (blocks Malaysia→KZ rebrand junk).
 */
export function isKzCatalogueEntry(entry) {
  const countries = entry.country || [];
  if (!countries.includes("KZ")) return false;

  if (isCommercialCatalogueEntry(entry)) {
    return isLegitimateKzCommercial(entry);
  }

  if (entry.id?.startsWith("d_")) return true;
  if (entry.id?.startsWith("kz-")) return true;
  if (entry.id?.startsWith("yandex-") || entry.id?.startsWith("yandex_")) return true;
  if (KZ_PROVIDERS.has(entry.provider)) return true;

  return false;
}

export function filterKzCatalogue(apis) {
  return apis.filter(isKzCatalogueEntry);
}
