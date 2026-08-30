/**
 * Expand per-API product feature lists using curated category profiles.
 * Primary features (capability-derived) drive suggest matching only.
 * Expanded features use domain profiles — no generic unrelated floor padding.
 */

import { FEATURES, getFeature } from "./features.js";
import { capabilitiesToPrimaryFeatureIds } from "./capabilityMap.js";
import { getCapabilityAtom } from "./capabilityVocabulary.js";
import {
  MIN_FEATURES_PER_API,
  INTEGRATION_CORE,
  profileForCategory,
  GOV_STAT_CATEGORIES,
  featureAllowedInGovProfile,
  RELATED_CATEGORIES,
} from "./categoryFeatureProfiles.js";

export { MIN_FEATURES_PER_API };

const VALID_FEATURE_IDS = new Set(FEATURES.map((f) => f.id));

const COMMERCIAL_CATEGORIES = new Set([
  "Maps & location",
  "Payments",
  "Banking & finance",
  "Banking",
  "Finance",
  "E-commerce",
  "Food & delivery",
  "Logistics & delivery",
  "Travel & mobility",
  "AI",
  "Cloud & infrastructure",
  "Communications",
  "Auth & identity",
  "E-invoicing & tax",
  "Crypto",
  "Data & enrichment",
  "Realtime",
]);

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
  if (!VALID_FEATURE_IDS.has(id)) return;
  if (GOV_STAT_CATEGORIES.has(api?.category) && !featureAllowedInGovProfile(getFeature(id))) return;
  if (!set.has(id)) sources[bucket].push(id);
  set.add(id);
}

function addParents(expanded, sources, ids, api) {
  for (const id of ids) {
    let cur = getFeature(id);
    while (cur?.parentId) {
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
    if (!VALID_FEATURE_IDS.has(id)) return;
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

/** Domain-safe top-up: only from category profile + integration core. */
function topUpFromProfile(expanded, sources, api) {
  if (expanded.size >= MIN_FEATURES_PER_API) return;
  const profile = profileForCategory(api.category);
  for (const id of profile) {
    if (expanded.size >= MIN_FEATURES_PER_API) break;
    addFeature(expanded, sources, "profile", id, api);
  }
  if (expanded.size < MIN_FEATURES_PER_API) {
    for (const id of INTEGRATION_CORE) {
      if (expanded.size >= MIN_FEATURES_PER_API) break;
      addFeature(expanded, sources, "profile", id, api);
    }
  }
}

/**
 * @param {object} api
 * @param {string[]} capabilities
 * @param {{ docText?: string }} [options]
 */
export function expandApiFeatures(api, capabilities = [], options = {}) {
  const docText = options.docText || "";
  const primary = new Set(capabilitiesToPrimaryFeatureIds(capabilities));
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

  // 1. Curated domain profile (authoritative coverage)
  for (const id of profileForCategory(api.category)) {
    addFeature(expanded, sources, "profile", id, api);
  }

  // 2. Capability-derived closure
  capabilityClosure(expanded, sources, capabilities, api);

  // 3. Provider ecosystem
  providerClosure(expanded, sources, api);

  // 4. Catalogue / doc keyword signals
  keywordClosure(expanded, sources, api, docText);

  // 5. Parent roll-up for hierarchy
  addParents(expanded, sources, [...expanded], api);

  // 6. Hard minimum from profile only (never unrelated globals)
  topUpFromProfile(expanded, sources, api);

  return {
    primaryFeatures: [...primary].sort(),
    features: [...expanded].sort(),
    sources,
    coverageMeta: {
      profileSize: profileForCategory(api.category).length,
      fromProfile: sources.profile.length,
      fromCapability: sources.capability.length,
      fromKeyword: sources.keyword.length + sources.doc.length,
    },
  };
}

/** @deprecated kept for imports — use categoryFeatureProfiles instead */
export const CATEGORY_FEATURE_BUNDLES = {};
