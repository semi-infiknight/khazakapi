/**
 * Expand per-API product feature lists from inferable signals only.
 * Features = things you can build using that API (not generic plumbing).
 * Primary features (capability-derived) drive suggest matching only.
 */

import { FEATURES, getFeature } from "./features.js";
import { capabilitiesToPrimaryFeatureIds } from "./capabilityMap.js";
import { getCapabilityAtom } from "./capabilityVocabulary.js";
import {
  NON_BUILDABLE_MATRIX_FEATURES,
  GOV_STAT_CATEGORIES,
  featureAllowedInGovProfile,
  RELATED_CATEGORIES,
} from "./categoryFeatureProfiles.js";

function normalize(text = "") {
  return String(text).toLowerCase().replace(/ё/g, "е");
}

function featureMatchBlob(api) {
  const fields = [api.title, api.note, api.category, api.provider, api.companyName, api.apiType];
  if (api.tier !== "commercial") fields.push(api.setup?.summary);
  return normalize(fields.filter(Boolean).join(" "));
}

function keywordMatches(blob, kw) {
  const k = String(kw).toLowerCase();
  if (k.length < 4) {
    return new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(blob);
  }
  if (k.includes(" ")) return blob.includes(k);
  return new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(blob);
}

function addFeature(set, sources, bucket, id, api) {
  if (!getFeature(id)) return;
  if (NON_BUILDABLE_MATRIX_FEATURES.has(id)) return;
  if (GOV_STAT_CATEGORIES.has(api?.category) && !featureAllowedInGovProfile(getFeature(id))) return;
  if (!set.has(id)) sources[bucket].push(id);
  set.add(id);
}

function addParents(expanded, sources, ids, api) {
  for (const id of ids) {
    let cur = getFeature(id);
    while (cur?.parentId) {
      if (NON_BUILDABLE_MATRIX_FEATURES.has(cur.parentId)) break;
      addFeature(expanded, sources, "parent", cur.parentId, api);
      cur = getFeature(cur.parentId);
    }
  }
}

function providerSlugMatches(blob, slug) {
  const p = String(slug).toLowerCase();
  if (p.length < 4) {
    return new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(blob);
  }
  return blob.includes(p);
}

function categoryAllowsFeature(feature, apiCategory) {
  const cats = feature.categories || [];
  if (!cats.length || !apiCategory) return true;
  if (cats.includes(apiCategory)) return true;
  const related = RELATED_CATEGORIES[apiCategory] || [];
  return cats.some((c) => related.includes(c));
}

/** Vocabulary-mapped features + direct descendants only (not full ontology reverse-index). */
function capabilityClosure(expanded, sources, capabilities, api) {
  const seeds = new Set();
  for (const cap of capabilities) {
    for (const fid of getCapabilityAtom(cap)?.featureIds || []) seeds.add(fid);
  }

  function addSubtree(id) {
    if (!getFeature(id) || NON_BUILDABLE_MATRIX_FEATURES.has(id)) return;
    addFeature(expanded, sources, "capability", id, api);
    for (const f of FEATURES) {
      if (f.parentId === id) addSubtree(f.id);
    }
  }

  for (const id of seeds) addSubtree(id);
}

function providerClosure(expanded, sources, api) {
  const providerBlob = normalize(`${api.provider || ""} ${api.companyName || ""}`);
  const apiCategory = api.category || "";
  for (const f of FEATURES) {
    if (!(f.providers || []).some((p) => providerSlugMatches(providerBlob, p))) continue;
    if (!categoryAllowsFeature(f, apiCategory)) continue;
    addFeature(expanded, sources, "provider", f.id, api);
  }
}

function keywordClosure(expanded, sources, api, docText = "") {
  const blob = featureMatchBlob(api);
  const docBlob = normalize(docText);
  for (const f of FEATURES) {
    const hitBlob = (f.keywords || []).some((kw) => keywordMatches(blob, kw));
    const hitDoc = docBlob && (f.keywords || []).some((kw) => keywordMatches(docBlob, kw));
    if (hitBlob) addFeature(expanded, sources, "keyword", f.id, api);
    else if (hitDoc) addFeature(expanded, sources, "doc", f.id, api);
  }
}

/**
 * @param {object} api
 * @param {string[]} capabilities
 * @param {{ docText?: string }} [options]
 */
export function expandApiFeatures(api, capabilities = [], options = {}) {
  const docText = options.docText || "";
  const primary = capabilitiesToPrimaryFeatureIds(capabilities).filter(
    (id) => getFeature(id) && !NON_BUILDABLE_MATRIX_FEATURES.has(id),
  );
  const expanded = new Set(primary);
  const sources = {
    primary: [...primary],
    profile: [],
    capability: [],
    provider: [],
    keyword: [],
    doc: [],
    parent: [],
  };

  // Infer buildable features from this API's capabilities, provider, and catalogue text only.
  capabilityClosure(expanded, sources, capabilities, api);
  providerClosure(expanded, sources, api);
  keywordClosure(expanded, sources, api, docText);
  addParents(expanded, sources, [...expanded], api);

  return {
    primaryFeatures: [...primary].sort(),
    features: [...expanded].sort(),
    sources,
    coverageMeta: {
      fromCapability: sources.capability.length,
      fromKeyword: sources.keyword.length + sources.doc.length,
      fromProvider: sources.provider.length,
    },
  };
}

/** @deprecated kept for imports — use categoryFeatureProfiles instead */
export const CATEGORY_FEATURE_BUNDLES = {};
