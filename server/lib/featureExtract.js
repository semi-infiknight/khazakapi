/**
 * Extract product features from a user prompt (whole product or feature list).
 */

import { tokenize } from "./search.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { embedQuery } from "./queryEmbedder.js";
import { FEATURES, PRODUCT_RECIPES, featureSearchText, getFeature } from "./features.js";
import { NON_BUILDABLE_MATRIX_FEATURES } from "./categoryFeatureProfiles.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MAX_FEATURES = 5;
const KEYWORD_FLOOR = 4;
const SEMANTIC_FLOOR = 0.38;
const RECIPE_BOOST = 12;

/** Exclude plumbing; allow extended depth when keyword/recipe hits. */
const EXTRACT_FEATURES = FEATURES.filter((f) => !NON_BUILDABLE_MATRIX_FEATURES.has(f.id));

let cachedFeatureVectors = null;

function normalize(text = "") {
  return text.toLowerCase().replace(/ё/g, "е");
}

function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function keywordInHay(hay, kw) {
  const k = String(kw).toLowerCase();
  if (k.length < 4) {
    return new RegExp(`\\b${escapeRegExp(k)}\\b`, "i").test(hay);
  }
  if (k.includes(" ")) return hay.includes(k);
  return new RegExp(`\\b${escapeRegExp(k)}\\b`, "i").test(hay);
}

function cosine(a, b) {
  if (!a?.length || !b?.length || a.length !== b.length) return 0;
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

async function loadFeatureVectors() {
  if (cachedFeatureVectors) return cachedFeatureVectors;

  const store = loadFeatureEmbeddingStore();
  if (store) {
    cachedFeatureVectors = EXTRACT_FEATURES.map((feature) => {
      const vec = store.byId.get(feature.id);
      return vec ? { feature, vec } : null;
    }).filter(Boolean);
    return cachedFeatureVectors;
  }

  cachedFeatureVectors = await Promise.all(
    EXTRACT_FEATURES.map(async (feature) => ({
      feature,
      vec: await embedQuery(featureSearchText(feature)),
    })),
  );
  return cachedFeatureVectors;
}

function loadFeatureEmbeddingStore() {
  try {
    const filePath = path.join(__dirname, "../data/feature-embeddings.json");
    if (!fs.existsSync(filePath)) return null;
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (!raw?.ids?.length || !raw?.vectors?.length) return null;
    return {
      model: raw.model,
      byId: new Map(raw.ids.map((id, i) => [id, Float32Array.from(raw.vectors[i])])),
    };
  } catch {
    return null;
  }
}

export function warmFeatureVectors() {
  loadFeatureVectors().catch(() => {});
}

function scoreFeatureKeywords(feature, hay, tokens) {
  let score = 0;
  for (const kw of feature.keywords || []) {
    if (keywordInHay(hay, kw)) score += kw.includes(" ") ? 8 : 4;
  }
  for (const neg of feature.negativeKeywords || []) {
    if (keywordInHay(hay, neg)) score -= 6;
  }
  for (const t of tokens) {
    if (t.length < 3) continue;
    if (feature.keywords?.some((kw) => keywordInHay(t, kw) || keywordInHay(kw, t))) score += 2;
  }
  return score;
}

function matchRecipes(hay) {
  const hits = [];
  for (const recipe of PRODUCT_RECIPES) {
    if (recipe.match.some((phrase) => hay.includes(phrase))) {
      hits.push(recipe);
    }
  }
  return hits;
}

/** Single-word or short category intents that keyword scoring misses. */
const INTENT_SHORTCUTS = [
  {
    test: (hay) => /^(banking|banks?|fintech|finance)$/.test(hay.trim()),
    featureIds: ["bank-accounts", "checkout-payment", "fx-rates", "user-auth"],
  },
  {
    test: (hay) => /^(payments?|checkout|pay)$/.test(hay.trim()),
    featureIds: ["checkout-payment", "wallet-payout"],
  },
  {
    test: (hay) => /^(maps?|geocod(?:e|ing)?|location)$/.test(hay.trim()),
    featureIds: ["address-autocomplete", "forward-geocode", "poi-search"],
  },
  {
    test: (hay) => /^(delivery|logistics|shipping)$/.test(hay.trim()),
    featureIds: ["delivery-eta", "route-planning", "parcel-shipping"],
  },
  {
    test: (hay) => /^(weather|forecast)$/.test(hay.trim()),
    featureIds: ["weather-forecast"],
  },
  {
    test: (hay) => /^(travel|flights?|taxi)$/.test(hay.trim()),
    featureIds: ["travel-booking", "ride-hailing", "route-planning"],
  },
  {
    test: (hay) => /^(sms|otp|telecom)$/.test(hay.trim()),
    featureIds: ["sms-otp", "user-auth"],
  },
  {
    test: (hay) => /^(gov|government|open data)$/.test(hay.trim()),
    featureIds: ["gov-open-data", "population-stats"],
  },
];

function matchIntentShortcuts(hay) {
  const hit = INTENT_SHORTCUTS.find((row) => row.test(hay));
  if (!hit) return [];

  return hit.featureIds
    .map((id) => getFeature(id))
    .filter(Boolean)
    .map((feature) => ({
      feature,
      keywordScore: 16,
      semanticScore: 0,
      combined: 2.2,
      source: "shortcut",
    }));
}

function dedupeFeatures(scored) {
  const byId = new Map();
  for (const row of scored) {
    const prev = byId.get(row.feature.id);
    if (!prev || row.combined > prev.combined) byId.set(row.feature.id, row);
  }

  const list = [...byId.values()].sort((a, b) => b.combined - a.combined);
  const chosen = [];
  const chosenIds = new Set();

  for (const row of list) {
    if (chosen.length >= MAX_FEATURES) break;
    const parentId = row.feature.parentId;
    if (parentId && chosenIds.has(parentId)) {
      const parentIdx = chosen.findIndex((c) => c.feature.id === parentId);
      if (parentIdx >= 0 && row.combined > chosen[parentIdx].combined * 1.05) {
        chosen.splice(parentIdx, 1);
        chosenIds.delete(parentId);
      } else if (parentIdx >= 0) {
        continue;
      }
    }
    if (chosenIds.has(row.feature.id)) continue;
    chosen.push(row);
    chosenIds.add(row.feature.id);
  }

  return chosen;
}

/**
 * @param {string} query
 * @returns {Promise<{ features: Array<{ feature: object, keywordScore: number, semanticScore: number, combined: number, source: string }>, recipes: string[] }>}
 */
export async function extractFeatures(query) {
  const text = String(query || "").trim();
  const hay = normalize(text);
  const tokens = tokenize(text);
  if (!text) return { features: [], recipes: [] };

  const recipes = matchRecipes(hay);
  const recipeFeatureIds = new Set(recipes.flatMap((r) => r.features));

  let queryVec = null;
  try {
    queryVec = await embedQuery(text);
  } catch {
    queryVec = null;
  }

  const featureVectors = queryVec ? await loadFeatureVectors() : [];

  const scored = EXTRACT_FEATURES.map((feature) => {
    if ((feature.negativeKeywords || []).some((neg) => keywordInHay(hay, neg))) return null;

    let keywordScore = scoreFeatureKeywords(feature, hay, tokens);
    if (recipeFeatureIds.has(feature.id)) keywordScore += RECIPE_BOOST;

    let semanticScore = 0;
    if (queryVec) {
      const row = featureVectors.find((fv) => fv.feature.id === feature.id);
      if (row?.vec) semanticScore = cosine(queryVec, row.vec);
    }

    const keywordHit = keywordScore >= KEYWORD_FLOOR;
    const recipeHit = recipeFeatureIds.has(feature.id);

    // Semantic-only hits caused Yandex/extended false positives — require keyword or recipe.
    if (!keywordHit && !recipeHit) return null;

    const combined =
      (recipeHit ? 1 : 0) * 2 +
      Math.min(keywordScore / 16, 1) * 0.55 +
      semanticScore * 0.45;

    let source = "keyword";
    if (recipeHit) source = "recipe";
    else if (semanticScore >= SEMANTIC_FLOOR && keywordHit) source = "hybrid";

    return { feature, keywordScore, semanticScore, combined, source };
  }).filter(Boolean);

  const features = dedupeFeatures(scored);

  if (!features.length) {
    const shortcutFeatures = dedupeFeatures(matchIntentShortcuts(hay));
    if (shortcutFeatures.length) {
      return { features: shortcutFeatures, recipes: [] };
    }
  }

  return {
    features,
    recipes: recipes.map((r) => r.id),
  };
}

export function featureBlocksFromExtraction(extracted) {
  return extracted.features.map(({ feature, keywordScore, semanticScore, combined, source }) => {
    const parent = feature.parentId ? getFeature(feature.parentId) : null;
    return {
      id: feature.id,
      label: feature.label,
      parentId: feature.parentId,
      parentLabel: parent?.label || null,
      why: feature.why,
      where: feature.where,
      score: Number(combined.toFixed(4)),
      keywordScore,
      semanticScore: Number(semanticScore.toFixed(4)),
      source,
      apis: [],
    };
  });
}
