/**
 * Lazy local query embedder — no external API, no rate limits.
 * Catalogue vectors are precomputed at build time; only the user query is embedded here.
 */

import { pipeline, env } from "@huggingface/transformers";

export const EMBED_MODEL = "Xenova/all-MiniLM-L6-v2";

// Avoid writing outside the project on Railway/containers.
env.cacheDir = process.env.TRANSFORMERS_CACHE || "./.cache/transformers";
env.allowLocalModels = true;

let embedderPromise = null;
const queryCache = new Map();
const QUERY_CACHE_MAX = 128;

async function getEmbedder() {
  if (!embedderPromise) {
    embedderPromise = pipeline("feature-extraction", EMBED_MODEL, {
      dtype: "q8",
      device: "cpu",
    }).catch((err) => {
      embedderPromise = null;
      throw err;
    });
  }
  return embedderPromise;
}

/**
 * @param {string} text
 * @returns {Promise<Float32Array|null>}
 */
export async function embedQuery(text) {
  const input = String(text || "").trim();
  if (!input) return null;

  const cached = queryCache.get(input);
  if (cached) return cached;

  const embedder = await getEmbedder();
  const output = await embedder(input, { pooling: "mean", normalize: true });
  const vec = Float32Array.from(output.data);

  if (queryCache.size >= QUERY_CACHE_MAX) {
    const oldest = queryCache.keys().next().value;
    queryCache.delete(oldest);
  }
  queryCache.set(input, vec);

  return vec;
}

/** Warm model in background so first suggest is faster. */
export function warmQueryEmbedder() {
  getEmbedder().catch(() => {});
}
