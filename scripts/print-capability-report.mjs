#!/usr/bin/env node
/**
 * Pretty-print capability matrix completeness report.
 * Run: npm run cap:report
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORT_PATH = path.join(__dirname, "../server/data/capability-completeness-report.json");

if (!fs.existsSync(REPORT_PATH)) {
  console.error("No report found. Run: npm run cap:build");
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(REPORT_PATH, "utf8"));
const s = report.summary || {};
const stats = report.stats || s;

console.log("\n═══════════════════════════════════════════════════════");
console.log("  Qazaq Stack Capability → Feature Completeness Report");
console.log("═══════════════════════════════════════════════════════\n");
console.log(`Built:              ${report.builtAt || "unknown"}`);
console.log(`APIs in catalogue:  ${s.totalApis ?? stats.totalApis}`);
console.log(`Feature ontology:   ${s.ontologyFeatures ?? stats.ontologyFeatures ?? stats.featureCount}`);
console.log(`Buildable min/API:  ${s.minBuildableFeatures ?? stats.minBuildableFeatures ?? 3} inferred features`);
console.log(`Category ontology:  ${s.categoryOntologyTarget ?? stats.categoryOntologyTarget ?? "100+"} features/category pool`);
console.log("");
console.log("── Buildable feature coverage (inference-only) ──");
console.log(`Minimum observed:     ${s.minFeaturesPerApi ?? stats.minFeaturesObserved} features/API`);
console.log(`10th percentile:      ${s.p10FeaturesPerApi ?? stats.p10FeaturesPerApi} features/API`);
console.log(`Median:               ${s.medianFeaturesPerApi ?? stats.medianFeaturesPerApi} features/API`);
console.log(`Maximum observed:     ${s.maxFeaturesPerApi ?? stats.maxFeaturesObserved} features/API`);
console.log(`Below buildable min:  ${s.apisBelowBuildableMin ?? stats.apisBelowMinFeatures} APIs`);
console.log(`Gov commercial leak:  ${s.govCommercialLeakage ?? stats.govCommercialLeakage ?? 0} APIs`);
console.log(`Universal plumbing:   ${s.universalPlumbingFeatures ?? stats.universalPlumbingFeatures ?? 0} features on all APIs`);
console.log(`Commercial covered:   ${s.commercialCoverage ?? `${stats.commercialWithFeatures}/${stats.commercialTotal}`}`);
console.log(`Capabilities mapped:  ${stats.withCapabilities}/${stats.totalApis}`);
console.log(`Orphan capabilities:  ${stats.orphanCapabilities?.length ? stats.orphanCapabilities.join(", ") : "none"}`);

if (stats.worstApis?.length) {
  console.log("");
  console.log("── Lowest buildable feature counts ──");
  for (const row of stats.worstApis.slice(0, 8)) {
    console.log(`  ${String(row.features).padStart(3)}  ${row.id} (${row.category})`);
  }
}

if (stats.featureCountHistogram) {
  console.log("");
  console.log("── Feature count distribution ──");
  for (const [bucket, count] of Object.entries(stats.featureCountHistogram).sort()) {
    console.log(`  ${bucket.padEnd(8)} ${count} APIs`);
  }
}

if (stats.expansionSourceTotals) {
  console.log("");
  console.log("── Expansion sources (capability / keyword / provider inference) ──");
  for (const [src, total] of Object.entries(stats.expansionSourceTotals).sort((a, b) => b[1] - a[1])) {
    if (total > 0) console.log(`  ${src.padEnd(12)} ${total}`);
  }
}

if (stats.topFeatures?.length) {
  console.log("");
  console.log("── Top features (by API count) ──");
  for (const f of stats.topFeatures.slice(0, 8)) {
    console.log(`  ${String(f.apis).padStart(4)}  ${f.label}`);
  }
}

console.log("\nFull JSON: server/data/capability-completeness-report.json\n");

const belowMin = s.apisBelowBuildableMin ?? stats.apisBelowMinFeatures ?? 0;
const govLeak = s.govCommercialLeakage ?? stats.govCommercialLeakage ?? 0;
const plumbing = s.universalPlumbingFeatures ?? stats.universalPlumbingFeatures ?? 0;
if (belowMin > 0 || govLeak > 0 || plumbing > 0) process.exit(1);
