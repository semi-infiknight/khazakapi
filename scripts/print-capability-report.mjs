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
const s = report.summary || report.stats || {};
const stats = report.stats || s;

console.log("\n═══════════════════════════════════════════════════════");
console.log("  KhazakAPI Capability → Feature Completeness Report");
console.log("═══════════════════════════════════════════════════════\n");
console.log(`Built:              ${report.builtAt || "unknown"}`);
console.log(`APIs in catalogue:  ${s.totalApis ?? stats.totalApis}`);
console.log(`Feature ontology:   ${s.ontologyFeatures ?? stats.featureCount} product features`);
console.log(`Target per API:     ${s.targetFeaturesPerApi ?? stats.minFeaturesPerApi}+ features`);
console.log("");
console.log("── Coverage ──");
console.log(`Avg features/API:     ${s.avgFeaturesPerApi ?? stats.avgFeaturesPerApi}`);
console.log(`Median features/API:  ${s.medianFeaturesPerApi ?? stats.medianFeaturesPerApi}`);
console.log(`Min / max observed:   ${s.minObserved ?? stats.minFeaturesObserved} / ${s.maxObserved ?? stats.maxFeaturesObserved}`);
console.log(`Below target:         ${s.apisBelowTarget ?? stats.apisBelowMinFeatures}`);
console.log(`Commercial covered:   ${s.commercialCoverage ?? `${stats.commercialWithFeatures}/${stats.commercialTotal}`}`);
console.log(`Capabilities mapped:  ${stats.withCapabilities}/${stats.totalApis}`);
console.log(`Orphan capabilities:  ${stats.orphanCapabilities?.length ? stats.orphanCapabilities.join(", ") : "none"}`);
console.log("");

if (stats.featureCountHistogram) {
  console.log("── Feature count distribution ──");
  for (const [bucket, count] of Object.entries(stats.featureCountHistogram).sort()) {
    console.log(`  ${bucket.padEnd(8)} ${count} APIs`);
  }
  console.log("");
}

if (stats.topFeatures?.length) {
  console.log("── Top features (by API count) ──");
  for (const f of stats.topFeatures.slice(0, 10)) {
    console.log(`  ${String(f.apis).padStart(4)}  ${f.label} (${f.id})`);
  }
  console.log("");
}

if (stats.categoryAvgFeatures) {
  console.log("── Avg features by category (top 10) ──");
  const rows = Object.entries(stats.categoryAvgFeatures).slice(0, 10);
  for (const [cat, avg] of rows) {
    console.log(`  ${String(avg).padStart(5)}  ${cat}`);
  }
  console.log("");
}

if (stats.expansionSourceTotals) {
  console.log("── Expansion source totals ──");
  for (const [src, total] of Object.entries(stats.expansionSourceTotals).sort((a, b) => b[1] - a[1])) {
    if (total > 0) console.log(`  ${src.padEnd(10)} ${total}`);
  }
  console.log("");
}

console.log("Full JSON: server/data/capability-completeness-report.json\n");
