/**
 * Extract product features from a user prompt (whole product or feature list).
 */

import { tokenize } from "./search.js";
import { embedQuery } from "./queryEmbedder.js";
import { FEATURES, PRODUCT_RECIPES, featureSearchText, getFeature } from "./features.js";

const MAX_FEATURES = 4;
const KEYWORD_FLOOR = 4;
const SEMANTIC_FLOOR = 0.38;
const RECIPE_BOOST = 12;

let cachedFeatureVectors = null;

function normalize(text = "") {
  return text.toLowerCase().replace(/ё/g, "е");
}

function cosine(a, b) {
  if (!a?.length || !b?.length || a.length !== b.length) return 0;
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

async function loadFeatureVectors() {
  if (cachedFeatureVectors) return cachedFeatureVectors;
  cachedFeatureVectors = await Promise.all(
    FEATURES.map(async (feature) => ({
      feature,
      vec: await embedQuery(featureSearchText(feature)),
    })),
  );
  return cachedFeatureVectors;
}

function scoreFeatureKeywords(feature, hay, tokens) {
  let score = 0;
  for (const kw of feature.keywords || []) {
    if (hay.includes(kw)) score += kw.includes(" ") ? 8 : 4;
  }
  for (const neg of feature.negativeKeywords || []) {
    if (hay.includes(neg)) score -= 6;
  }
  for (const t of tokens) {
    if (t.length < 3) continue;
    if (feature.keywords?.some((kw) => kw === t || kw.includes(t) || t.includes(kw))) score += 2;
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

  const scored = FEATURES.map((feature) => {
    let keywordScore = scoreFeatureKeywords(feature, hay, tokens);
    if (recipeFeatureIds.has(feature.id)) keywordScore += RECIPE_BOOST;

    let semanticScore = 0;
    if (queryVec) {
      const row = featureVectors.find((fv) => fv.feature.id === feature.id);
      if (row?.vec) semanticScore = cosine(queryVec, row.vec);
    }

    const keywordHit = keywordScore >= KEYWORD_FLOOR;
    const semanticHit = semanticScore >= SEMANTIC_FLOOR;
    const recipeHit = recipeFeatureIds.has(feature.id);

    if (!keywordHit && !semanticHit && !recipeHit) return null;

    const combined =
      (recipeHit ? 1 : 0) * 2 +
      Math.min(keywordScore / 16, 1) * 0.45 +
      semanticScore * 0.55;

    let source = "keyword";
    if (recipeHit) source = "recipe";
    else if (semanticHit && !keywordHit) source = "semantic";
    else if (semanticHit && keywordHit) source = "hybrid";

    return { feature, keywordScore, semanticScore, combined, source };
  }).filter(Boolean);

  const features = dedupeFeatures(scored);

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
