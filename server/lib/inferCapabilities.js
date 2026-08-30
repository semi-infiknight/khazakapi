/**
 * Infer capability atoms from catalogue fields (shared by runtime fallback + build script).
 */

import { GOV_STAT_CATEGORIES } from "./categoryFeatureProfiles.js";
import { matchCapabilitiesInText } from "./capabilityVocabulary.js";

function normalize(text = "") {
  return String(text).toLowerCase().replace(/ё/g, "е");
}

/** Catalogue text for capability regexes — excludes setup how-to prose (false auth signals). */
export function catalogueBlobForCapabilities(api) {
  return normalize(
    [api.title, api.note, api.category, api.provider, api.companyName, api.apiType, api.group]
      .filter(Boolean)
      .join(" "),
  );
}

export function catalogueBlob(api) {
  const setup = api.setup;
  const setupText = setup
    ? [
        setup.summary,
        ...(setup.sections || []).flatMap((s) => [s.title, ...(s.items || [])]),
      ].join(" ")
    : "";

  return normalize(
    [
      api.title,
      api.note,
      api.category,
      api.provider,
      api.companyName,
      api.apiType,
      api.group,
      api.endpoint,
      api.docs,
      setupText,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

const AUTH_API_SIGNAL =
  /\boauth2?\b|\bauthorization code\b|\bbearer token\b|\bapi key\b|\blogin api\b|\bauth api\b|\bidentity api\b|\bmobile.?id api\b/i;

/** Strip inference noise from regex hits (portal copy, generic metadata, wrong domain). */
export function filterInferredCapabilities(capabilities, api, blob = "") {
  const caps = new Set(capabilities);
  const hay = normalize(blob);
  const isGovStat = GOV_STAT_CATEGORIES.has(api?.category || "");

  if (isGovStat) {
    caps.delete("user-auth");
    caps.delete("oauth");
    caps.delete("webhooks");
    caps.delete("checkout-payment");
    caps.delete("qr-payment");
  }

  if (caps.has("user-auth") && !AUTH_API_SIGNAL.test(hay)) {
    caps.delete("user-auth");
    caps.delete("oauth");
  }

  if (caps.has("statistics") && !/\bstatistics\b|\bstat\.gov\b|\bstatistical\b/i.test(hay)) {
    caps.delete("statistics");
  }

  if (caps.has("gov-open-data") && !/\bopen data\b|\bdata\.egov\b|\bstat\.gov\b|\bgovernment data\b/i.test(hay)) {
    caps.delete("gov-open-data");
  }

  if (caps.has("tracking") && !/\bshipment\b|\bparcel\b|\bawb\b|\blogistics\b/i.test(hay)) {
    caps.delete("tracking");
  }

  return [...caps].sort();
}

/**
 * @param {object} api
 * @returns {string[]}
 */
export function inferCapabilitiesFromCatalogue(api) {
  const blob = catalogueBlobForCapabilities(api);
  return filterInferredCapabilities(matchCapabilitiesInText(blob), api, blob);
}

/**
 * @param {string} docText — scavenged HTML/plain docs
 * @param {object} [api] — catalogue row for domain filtering
 * @returns {string[]}
 */
export function inferCapabilitiesFromDocs(docText, api = null) {
  return filterInferredCapabilities(matchCapabilitiesInText(docText), api, docText);
}

export function stripHtml(html = "") {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
