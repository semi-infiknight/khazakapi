#!/usr/bin/env node
/**
 * Build per-API capability + feature matrix from catalogue, overrides, and optional doc scavenging.
 *
 *   npm run cap:build
 *   SCAVENGE_DOCS=1 npm run cap:build   # fetch provider docs (cached)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { KZ_APIS } from "../server/data/apis.js";
import { API_CAPABILITY_OVERRIDES } from "../server/lib/apiCapabilities.js";
import {
  buildCapabilityToFeatureMap,
  capabilitiesToFeatureIds,
  orphanCapabilities,
} from "../server/lib/capabilityMap.js";
import { expandApiFeatures, MIN_FEATURES_PER_API } from "../server/lib/expandApiFeatures.js";
import { FEATURES } from "../server/lib/features.js";
import {
  catalogueBlob,
  inferCapabilitiesFromCatalogue,
  inferCapabilitiesFromDocs,
  stripHtml,
} from "../server/lib/inferCapabilities.js";
import { matchCapabilitiesInText } from "../server/lib/capabilityVocabulary.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../server/data");
const MATRIX_PATH = path.join(DATA_DIR, "api-capability-matrix.json");
const REPORT_PATH = path.join(DATA_DIR, "capability-completeness-report.json");
const CACHE_PATH = path.join(DATA_DIR, "doc-scavenge-cache.json");

const SCAVENGE = String(process.env.SCAVENGE_DOCS ?? "1") !== "0";
const FETCH_TIMEOUT_MS = 12_000;
const MAX_DOC_CHARS = 80_000;
const CONCURRENCY = 5;

function apiId(api) {
  return String(api.id || api.slug || "");
}

function shouldScavengeDocs(api) {
  if (!api.docs && !api.sourceUrl) return false;
  if (api.tier === "commercial") return true;
  const p = `${api.provider || ""} ${api.companyName || ""}`.toLowerCase();
  return /yandex|2gis|kaspi|freedom|npck|sigex|cdek|glovo|wolt/.test(p);
}

async function fetchDocText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "KhazakAPI-capability-builder/1.0 (+https://khazakapi-production.up.railway.app)",
        Accept: "text/html,application/xhtml+xml,text/plain",
      },
      redirect: "follow",
    });
    if (!res.ok) return { text: "", error: `HTTP ${res.status}` };
    const raw = (await res.text()).slice(0, MAX_DOC_CHARS);
    return { text: stripHtml(raw), error: null };
  } catch (err) {
    return { text: "", error: err.message || String(err) };
  } finally {
    clearTimeout(timer);
  }
}

async function loadDocCache() {
  try {
    if (fs.existsSync(CACHE_PATH)) return JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
  } catch {
    /* ignore */
  }
  return {};
}

async function scavengeDocs(apis) {
  const cache = await loadDocCache();
  const targets = apis.filter(shouldScavengeDocs);
  let fetched = 0;
  let hits = 0;

  async function work(api) {
    const id = apiId(api);
    const url = api.docs || api.sourceUrl;
    if (!url) return;

    const cached = cache[id];
    if (cached?.url === url && cached?.text) {
      hits += 1;
      return;
    }

    if (!SCAVENGE) return;

    const { text, error } = await fetchDocText(url);
    fetched += 1;
    cache[id] = {
      url,
      fetchedAt: new Date().toISOString(),
      text: text.slice(0, MAX_DOC_CHARS),
      error,
      capabilityHits: matchCapabilitiesInText(text),
    };
  }

  for (let i = 0; i < targets.length; i += CONCURRENCY) {
    const batch = targets.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(work));
    if ((i + CONCURRENCY) % 25 === 0 || i + CONCURRENCY >= targets.length) {
      console.log(`  docs ${Math.min(i + CONCURRENCY, targets.length)}/${targets.length} (fetched ${fetched}, cache hits ${hits})`);
    }
  }

  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 0));
  return cache;
}

function buildEntry(api, docCache) {
  const id = apiId(api);
  const sources = { override: [], catalogue: [], docs: [] };
  const caps = new Set();
  let docHits = [];

  if (API_CAPABILITY_OVERRIDES[id]) {
    for (const c of API_CAPABILITY_OVERRIDES[id]) {
      caps.add(c);
      sources.override.push(c);
    }
  } else {
    for (const c of inferCapabilitiesFromCatalogue(api)) {
      if (!caps.has(c)) {
        caps.add(c);
        sources.catalogue.push(c);
      }
    }

    const cached = docCache[id];
    if (cached?.text) {
      docHits = inferCapabilitiesFromDocs(cached.text);
      for (const c of docHits) {
        if (!caps.has(c)) {
          caps.add(c);
          sources.docs.push(c);
        }
      }
    }
  }

  const capabilities = [...caps].sort();
  const docText = docCache[id]?.text || "";
  const { primaryFeatures, features, sources: featureSources } = expandApiFeatures(api, capabilities, {
    docText,
  });

  return {
    id,
    title: api.title,
    tier: api.tier,
    category: api.category,
    provider: api.provider,
    capabilities,
    primaryFeatures,
    features,
    featureSources,
    sources,
    docHits,
    docsUrl: api.docs || api.sourceUrl || null,
    docScavenged: Boolean(docCache[id]?.text),
  };
}

async function main() {
  console.log(`Building capability matrix for ${KZ_APIS.length} APIs…`);
  console.log(`Doc scavenging: ${SCAVENGE ? "on (cached)" : "off"}`);

  const docCache = await scavengeDocs(KZ_APIS);
  const entries = {};
  const allCapsUsed = new Set();

  for (const api of KZ_APIS) {
    const entry = buildEntry(api, docCache);
    entries[entry.id] = entry;
    entry.capabilities.forEach((c) => allCapsUsed.add(c));
  }

  const capToFeature = buildCapabilityToFeatureMap();
  const orphans = orphanCapabilities(allCapsUsed);
  const featureApiCounts = new Map(FEATURES.map((f) => [f.id, 0]));
  const commercialNoFeatures = [];
  let commercialWithFeatures = 0;
  let docEnriched = 0;
  let docScavengedWithHits = 0;

  for (const entry of Object.values(entries)) {
    for (const f of entry.features) {
      featureApiCounts.set(f, (featureApiCounts.get(f) || 0) + 1);
    }
    if (entry.sources.docs.length) docEnriched += 1;
    if (entry.docHits?.length) docScavengedWithHits += 1;
    if (entry.tier === "commercial") {
      if (entry.features.length) commercialWithFeatures += 1;
      else commercialNoFeatures.push(entry.id);
    }
  }

  const featuresWithZeroApis = FEATURES.filter((f) => !featureApiCounts.get(f.id)).map((f) => f.id);
  const unmappedCapsInVocab = [...allCapsUsed].filter((c) => !capToFeature.has(c) || capToFeature.get(c).size === 0);

  const stats = {
    totalApis: KZ_APIS.length,
    withCapabilities: Object.values(entries).filter((e) => e.capabilities.length).length,
    withFeatures: Object.values(entries).filter((e) => e.features.length).length,
    minFeaturesPerApi: MIN_FEATURES_PER_API,
    apisBelowMinFeatures: Object.values(entries).filter((e) => e.features.length < MIN_FEATURES_PER_API).length,
    avgFeaturesPerApi: Number(
      (Object.values(entries).reduce((sum, e) => sum + e.features.length, 0) / KZ_APIS.length).toFixed(2),
    ),
    commercialTotal: KZ_APIS.filter((a) => a.tier === "commercial").length,
    commercialWithFeatures,
    commercialNoFeatures: commercialNoFeatures.length,
    docScavengeTargets: KZ_APIS.filter(shouldScavengeDocs).length,
    docEnrichedApis: docEnriched,
    docScavengedWithHits,
    uniqueCapabilities: allCapsUsed.size,
    orphanCapabilities: orphans,
    unmappedCapabilities: unmappedCapsInVocab,
    featuresWithZeroApis,
    vocabularySize: (await import("../server/lib/capabilityVocabulary.js")).CAPABILITY_VOCABULARY.length,
    featureCount: FEATURES.length,
  };

  const payload = {
    version: new Date().toISOString().slice(0, 10),
    builtAt: new Date().toISOString(),
    scavengeDocs: SCAVENGE,
    stats,
    entries,
  };

  fs.writeFileSync(MATRIX_PATH, JSON.stringify(payload));
  fs.writeFileSync(REPORT_PATH, JSON.stringify({ builtAt: payload.builtAt, stats }, null, 2));

  const mb = (fs.statSync(MATRIX_PATH).size / (1024 * 1024)).toFixed(2);
  console.log(`\nWrote ${MATRIX_PATH} (${mb} MB)`);
  console.log(`Wrote ${REPORT_PATH}`);
  console.log("\n--- Completeness ---");
  console.log(`APIs with capabilities: ${stats.withCapabilities}/${stats.totalApis}`);
  console.log(`APIs with features:     ${stats.withFeatures}/${stats.totalApis}`);
  console.log(`Avg features / API:     ${stats.avgFeaturesPerApi} (min target ${stats.minFeaturesPerApi})`);
  console.log(`Below min features:     ${stats.apisBelowMinFeatures}`);
  console.log(`Commercial w/ features: ${stats.commercialWithFeatures}/${stats.commercialTotal}`);
  console.log(`Doc-enriched APIs:      ${stats.docEnrichedApis}`);
  console.log(`Orphan capabilities:    ${stats.orphanCapabilities.length ? stats.orphanCapabilities.join(", ") : "none"}`);
  console.log(`Features w/ 0 APIs:     ${stats.featuresWithZeroApis.length ? stats.featuresWithZeroApis.join(", ") : "none"}`);
  if (commercialNoFeatures.length) {
    console.log(`Commercial missing features (${commercialNoFeatures.length}):`, commercialNoFeatures.slice(0, 8).join(", "));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
