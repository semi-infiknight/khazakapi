/**
 * Infer capability atoms from catalogue fields (shared by runtime fallback + build script).
 */

import { matchCapabilitiesInText } from "./capabilityVocabulary.js";

function normalize(text = "") {
  return String(text).toLowerCase().replace(/ё/g, "е");
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

/**
 * @param {object} api
 * @returns {string[]}
 */
export function inferCapabilitiesFromCatalogue(api) {
  return matchCapabilitiesInText(catalogueBlob(api));
}

/**
 * @param {string} docText — scavenged HTML/plain docs
 * @returns {string[]}
 */
export function inferCapabilitiesFromDocs(docText) {
  return matchCapabilitiesInText(docText);
}

export function stripHtml(html = "") {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
