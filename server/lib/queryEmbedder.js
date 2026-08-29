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

  const embedder = await getEmbedder();
  const output = await embedder(input, { pooling: "mean", normalize: true });
  return Float32Array.from(output.data);
}

/** Warm model in background so first suggest is faster. */
export function warmQueryEmbedder() {
  getEmbedder().catch(() => {});
}
