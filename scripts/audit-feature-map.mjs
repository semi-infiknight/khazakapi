#!/usr/bin/env node
/**
 * Sense-making audit for feature ontology, capability map, and per-API matrix.
 * Run: npm run cap:audit
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { KZ_APIS } from "../server/data/apis.js";
import { FEATURES, getFeature } from "../server/lib/features.js";
import {
  buildCapabilityToFeatureMap,
  capabilitiesToFeatureIds,
  capabilitiesToPrimaryFeatureIds,
} from "../server/lib/capabilityMap.js";
import { CAPABILITY_VOCABULARY } from "../server/lib/capabilityVocabulary.js";
import { expandApiFeatures } from "../server/lib/expandApiFeatures.js";
import {
  GOV_STAT_CATEGORIES,
  MIN_FEATURES_PER_API,
  NON_BUILDABLE_MATRIX_FEATURES,
  profileForCategory,
} from "../server/lib/categoryFeatureProfiles.js";
import { API_CAPABILITY_OVERRIDES } from "../server/lib/apiCapabilities.js";
import { inferCapabilitiesFromCatalogue } from "../server/lib/inferCapabilities.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MATRIX_PATH = path.join(__dirname, "../server/data/api-capability-matrix.json");
const AUDIT_PATH = path.join(__dirname, "../server/data/feature-map-audit.json");

const MIN_BUILDABLE_FEATURES = 1;
const COMMERCIAL_LEAK_IDS = [
  "apple-pay-integration",
  "kaspi-merchant",
  "google-pay-integration",
  "freedompay-checkout",
  "arbuz-integration",
];
const COMMERCIAL_LEAK_PATTERNS = COMMERCIAL_LEAK_IDS.map((id) => ({ id, label: id }));

const GOV_CATEGORIES = GOV_STAT_CATEGORIES;

function percentile(sorted, p) {
  if (!sorted.length) return 0;
  const idx = Math.floor(sorted.length * p);
  return sorted[Math.min(idx, sorted.length - 1)];
}

function auditOntology() {
  const ids = new Set();
  const duplicates = [];
  const orphanParents = [];
  const noCapabilityTags = [];
  const genericGovTags = [];

  for (const f of FEATURES) {
    if (ids.has(f.id)) duplicates.push(f.id);
    ids.add(f.id);
    if (f.parentId && !ids.has(f.parentId) && !FEATURES.some((x) => x.id === f.parentId)) {
      orphanParents.push({ id: f.id, parentId: f.parentId });
    }
    if (!f.capabilityTags?.length) noCapabilityTags.push(f.id);
    if (
      f.capabilityTags?.includes("gov-open-data") &&
      f.capabilityTags?.includes("statistics") &&
      f.capabilityTags.length === 2
    ) {
      genericGovTags.push(f.id);
    }
  }

  return {
    featureCount: FEATURES.length,
    vocabularyAtoms: CAPABILITY_VOCABULARY.length,
    duplicates,
    orphanParents: orphanParents.slice(0, 20),
    featuresWithoutCapabilityTags: noCapabilityTags.length,
    genericGovTagPairs: genericGovTags.length,
  };
}

function loadMatrixEntries() {
  if (fs.existsSync(MATRIX_PATH)) {
    const raw = JSON.parse(fs.readFileSync(MATRIX_PATH, "utf8"));
    return raw.entries || raw;
  }
  return null;
}

function buildFreshSample(ids) {
  const out = {};
  for (const api of KZ_APIS) {
    const id = String(api.id || api.slug || "");
    if (ids && !ids.includes(id)) continue;
    const caps =
      API_CAPABILITY_OVERRIDES[id] ||
      inferCapabilitiesFromCatalogue(api);
    out[id] = expandApiFeatures(api, caps);
  }
  return out;
}

function auditMatrix(entries) {
  const total = Object.keys(entries).length;
  const primarySizes = [];
  const featureSizes = [];
  const universalFeatures = new Map();
  const primaryPollution = [];
  const govLeakage = [];
  const profileOnlyPrimary = [];

  for (const [id, entry] of Object.entries(entries)) {
    const primary = entry.primaryFeatures || [];
    const features = entry.features || [];
    primarySizes.push(primary.length);
    featureSizes.push(features.length);

    for (const fid of features) {
      universalFeatures.set(fid, (universalFeatures.get(fid) || 0) + 1);
    }

    const caps = entry.capabilities || [];
    const strictPrimary = capabilitiesToPrimaryFeatureIds(caps);
    const legacyPrimary = capabilitiesToFeatureIds(caps);
    if (primary.length !== strictPrimary.length) {
      profileOnlyPrimary.push({ id, stored: primary.length, expected: strictPrimary.length });
    }
    if (legacyPrimary.length > primary.length * 3 && primary.length < 30) {
      primaryPollution.push({
        id,
        title: entry.title,
        category: entry.category,
        primary: primary.length,
        legacyPrimary: legacyPrimary.length,
        sampleLegacy: legacyPrimary.filter((f) => !primary.includes(f)).slice(0, 5),
      });
    }

    if (GOV_CATEGORIES.has(entry.category)) {
      for (const leak of COMMERCIAL_LEAK_PATTERNS) {
        if (primary.includes(leak.id)) {
          govLeakage.push({
            id,
            category: entry.category,
            feature: leak.id,
            via: "primary",
          });
        } else if (features.includes(leak.id)) {
          govLeakage.push({
            id,
            category: entry.category,
            feature: leak.id,
            via: "expanded",
          });
        }
      }
    }
  }

  primarySizes.sort((a, b) => a - b);
  featureSizes.sort((a, b) => a - b);

  const universal = [...universalFeatures.entries()]
    .filter(([, count]) => count === total)
    .map(([id, count]) => ({
      id,
      label: getFeature(id)?.label || id,
      apis: count,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const topExpanded = [...universalFeatures.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([id, count]) => ({
      id,
      label: getFeature(id)?.label || id,
      apis: count,
      pct: Number(((count / total) * 100).toFixed(1)),
    }));

  const belowMin = Object.values(entries).filter((e) => (e.features || []).length < MIN_BUILDABLE_FEATURES);

  const categoryPrimaryMax = {};
  for (const entry of Object.values(entries)) {
    const cat = entry.category || "Unknown";
    categoryPrimaryMax[cat] = Math.max(categoryPrimaryMax[cat] || 0, (entry.primaryFeatures || []).length);
  }

  return {
    apis: total,
    primarySize: {
      min: primarySizes[0] ?? 0,
      p10: percentile(primarySizes, 0.1),
      median: percentile(primarySizes, 0.5),
      p90: percentile(primarySizes, 0.9),
      max: primarySizes[primarySizes.length - 1] ?? 0,
    },
    featureSize: {
      min: featureSizes[0] ?? 0,
      p10: percentile(featureSizes, 0.1),
      median: percentile(featureSizes, 0.5),
      max: featureSizes[featureSizes.length - 1] ?? 0,
      belowMin: belowMin.length,
    },
    universalFeatures: universal,
    topFeaturesByApiCount: topExpanded,
    primaryPollutionSamples: primaryPollution.slice(0, 8),
    govCategoryCommercialLeakage: govLeakage.slice(0, 20),
    govCommercialLeakageCount: govLeakage.length,
    universalPlumbingFeatures: [...NON_BUILDABLE_MATRIX_FEATURES].filter((id) => universalFeatures.get(id) === total)
      .length,
    primaryDriftFromStrict: profileOnlyPrimary.slice(0, 5),
    categoryPrimaryMax: Object.fromEntries(
      Object.entries(categoryPrimaryMax).sort((a, b) => b[1] - a[1]).slice(0, 12),
    ),
  };
}

function auditProfiles() {
  const shortProfiles = [];
  for (const api of KZ_APIS) {
    const cat = api.category || "Unknown";
    const size = profileForCategory(cat).length;
    if (size < MIN_FEATURES_PER_API && !shortProfiles.some((r) => r.category === cat)) {
      shortProfiles.push({ category: cat, profileSize: size });
    }
  }
  return { categoriesBelowMinProfile: shortProfiles };
}

function auditCapabilityMap() {
  const map = buildCapabilityToFeatureMap();
  const bloatedCaps = [...map.entries()]
    .map(([cap, set]) => ({ cap, features: set.size }))
    .filter((r) => r.features > 50)
    .sort((a, b) => b.features - a.features)
    .slice(0, 10);

  const births = KZ_APIS.find((a) => a.id === "births" || String(a.title || "").toLowerCase().includes("birth"));
  let birthsSample = null;
  if (births) {
    const caps = API_CAPABILITY_OVERRIDES[births.id] || inferCapabilitiesFromCatalogue(births);
    birthsSample = {
      id: births.id,
      title: births.title,
      capabilities: caps,
      strictPrimary: capabilitiesToPrimaryFeatureIds(caps),
      legacyPrimary: capabilitiesToFeatureIds(caps).length,
    };
  }

  return { bloatedCapabilityAtoms: bloatedCaps, birthsReference: birthsSample };
}

function printReport(audit) {
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  Qazaq Stack Feature Map Sense-Making Audit");
  console.log("═══════════════════════════════════════════════════════\n");
  console.log(`Ontology features:     ${audit.ontology.featureCount}`);
  console.log(`Vocabulary atoms:      ${audit.ontology.vocabularyAtoms}`);
  console.log(`Generic gov tag pairs: ${audit.ontology.genericGovTagPairs} (should trend ↓ after wave-2 fix)`);
  console.log(`No capabilityTags:     ${audit.ontology.featuresWithoutCapabilityTags}`);
  console.log("");
  console.log("── Primary features (suggest eligibility) ──");
  console.log(`  min ${audit.matrix.primarySize.min} · p10 ${audit.matrix.primarySize.p10} · median ${audit.matrix.primarySize.median} · max ${audit.matrix.primarySize.max}`);
  console.log("");
  console.log("── Expanded features (internal matrix) ──");
  console.log(`  min ${audit.matrix.featureSize.min} · p10 ${audit.matrix.featureSize.p10} · median ${audit.matrix.featureSize.median} · max ${audit.matrix.featureSize.max}`);
  console.log(`  below buildable min (${MIN_BUILDABLE_FEATURES}): ${audit.matrix.featureSize.belowMin} APIs`);
  console.log(`  universal plumbing on all APIs: ${audit.matrix.universalPlumbingFeatures ?? 0}`);
  console.log("");

  if (audit.reference.birthsReference) {
    const b = audit.reference.birthsReference;
    console.log("── Reference: births API primary strictness ──");
    console.log(`  ${b.id}: ${b.strictPrimary.length} strict primary (legacy reverse-index would be ${b.legacyPrimary})`);
    console.log(`  tags: ${b.strictPrimary.join(", ")}`);
    console.log("");
  }

  if (audit.matrix.universalFeatures.length) {
    console.log("── Universal features (on every API — suspect) ──");
    for (const f of audit.matrix.universalFeatures.slice(0, 8)) {
      console.log(`  ${f.apis}/${audit.matrix.apis}  ${f.label}`);
    }
    console.log("");
  }

  if (audit.matrix.govCategoryCommercialLeakage.length) {
    console.log("── Gov-category commercial leakage samples ──");
    for (const row of audit.matrix.govCategoryCommercialLeakage.slice(0, 8)) {
      console.log(`  ${row.id} (${row.category}) ← ${row.feature} [${row.via}]`);
    }
    console.log("");
  } else {
    console.log("── Gov-category commercial leakage: none in primary/expanded samples checked ──");
    console.log("");
  }

  if (audit.capabilityMap.bloatedCapabilityAtoms.length) {
    console.log("── Bloated capability reverse-index (legacy map only) ──");
    for (const row of audit.capabilityMap.bloatedCapabilityAtoms.slice(0, 6)) {
      console.log(`  ${row.cap}: ${row.features} features`);
    }
    console.log("");
  }

  console.log("── Top features by API coverage ──");
  for (const f of audit.matrix.topFeaturesByApiCount.slice(0, 8)) {
    console.log(`  ${String(f.apis).padStart(4)} (${String(f.pct).padStart(5)}%)  ${f.label}`);
  }
  console.log("");
  console.log(`Full JSON: ${AUDIT_PATH}\n`);
}

function main() {
  const entries = loadMatrixEntries();
  if (!entries) {
    console.error("Matrix missing — run npm run cap:build first");
    process.exit(1);
  }

  const audit = {
    builtAt: new Date().toISOString(),
    ontology: auditOntology(),
    profiles: auditProfiles(),
    capabilityMap: auditCapabilityMap(),
    matrix: auditMatrix(entries),
    reference: auditCapabilityMap(),
  };

  fs.writeFileSync(AUDIT_PATH, JSON.stringify(audit, null, 2));
  printReport(audit);

  const issues = [];
  if (audit.matrix.featureSize.belowMin > 0) {
    issues.push(`${audit.matrix.featureSize.belowMin} APIs below buildable min`);
  }
  if (audit.matrix.primarySize.max > 40) issues.push(`primary max ${audit.matrix.primarySize.max} still high`);
  if (audit.matrix.govCommercialLeakageCount > 0) {
    issues.push(`${audit.matrix.govCommercialLeakageCount} gov APIs with commercial feature leakage`);
  }
  if (audit.matrix.universalPlumbingFeatures > 0) {
    issues.push(`${audit.matrix.universalPlumbingFeatures} plumbing features on all APIs`);
  }
  if (audit.matrix.govCategoryCommercialLeakage.some((r) => r.via === "primary")) {
    issues.push("commercial features in gov primary sets");
  }
  if (audit.ontology.duplicates.length) issues.push("duplicate feature IDs");

  if (issues.length) {
    console.log("⚠ Issues:", issues.join("; "));
    process.exitCode = 1;
  } else {
    console.log("✓ Sense-making checks passed at current thresholds");
  }
}

main();
