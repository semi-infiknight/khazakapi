/**
 * Semantic vector index: precomputed catalogue embeddings + local query embedder.
 * Falls back to TF–IDF when embeddings file or model is unavailable.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { apiDocumentTextWithHints } from "./catalogText.js";
import { embedQuery, warmQueryEmbedder } from "./queryEmbedder.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EMBEDDINGS_PATH = path.join(__dirname, "../data/api-embeddings.json");

const STOP = new Set([
  "a", "an", "the", "and", "or", "for", "to", "of", "in", "on", "at", "by", "with", "from", "is", "are",
  "be", "as", "this", "that", "it", "its", "you", "your", "we", "our", "i", "my", "me", "app", "apps",
  "application", "applications", "api", "apis", "kz", "kazakhstan", "using", "use", "need", "needs",
  "want", "build", "building", "make", "making", "get", "got", "into", "via",
]);

function tokenize(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/ё/g, "е")
    .split(/[^a-z0-9а-я]+/i)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

function buildTf(tokens) {
  const tf = new Map();
  for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
  const len = Math.sqrt([...tf.values()].reduce((s, v) => s + v * v, 0)) || 1;
  for (const [k, v] of tf) tf.set(k, v / len);
  return tf;
}

function cosineFloat(a, b) {
  if (!a?.length || !b?.length || a.length !== b.length) return 0;
  let score = 0;
  for (let i = 0; i < a.length; i++) score += a[i] * b[i];
  return score;
}

function cosineSparse(a, b) {
  if (!a.size || !b.size) return 0;
  let score = 0;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  for (const [t, v] of small) {
    const u = large.get(t);
    if (u) score += v * u;
  }
  return score;
}

function loadEmbeddingStore() {
  try {
    if (!fs.existsSync(EMBEDDINGS_PATH)) return null;
    const raw = JSON.parse(fs.readFileSync(EMBEDDINGS_PATH, "utf8"));
    if (!raw?.ids?.length || !raw?.vectors?.length) return null;
    return {
      model: raw.model,
      dimensions: raw.dimensions,
      byId: new Map(raw.ids.map((id, i) => [id, Float32Array.from(raw.vectors[i])])),
    };
  } catch {
    return null;
  }
}

function createTfidfFallback(apis) {
  const docs = apis.map((api) => {
    const tokens = tokenize(apiDocumentTextWithHints(api));
    return { api, tokens, tf: buildTf(tokens) };
  });

  const df = new Map();
  for (const doc of docs) {
    const seen = new Set(doc.tokens);
    for (const t of seen) df.set(t, (df.get(t) || 0) + 1);
  }

  const n = docs.length || 1;
  const idf = new Map();
  for (const [t, count] of df) {
    idf.set(t, Math.log(1 + n / (1 + count)) + 1);
  }

  const vectors = docs.map((doc) => {
    const vec = new Map();
    for (const [t, tf] of doc.tf) vec.set(t, tf * (idf.get(t) || 0));
    const norm = Math.sqrt([...vec.values()].reduce((s, v) => s + v * v, 0)) || 1;
    for (const [t, v] of vec) vec.set(t, v / norm);
    return { api: doc.api, vec };
  });

  function encode(query) {
    const tokens = tokenize(query);
    if (!tokens.length) return new Map();
    const tf = buildTf(tokens);
    const vec = new Map();
    for (const [t, v] of tf) {
      if (!idf.has(t)) continue;
      vec.set(t, v * idf.get(t));
    }
    const norm = Math.sqrt([...vec.values()].reduce((s, v) => s + v * v, 0)) || 1;
    for (const [t, v] of vec) vec.set(t, v / norm);
    return vec;
  }

  return {
    mode: "tfidf",
    minScore: 0.18,
    vectors,
    encode,
    cosine: cosineSparse,
  };
}

function createSemanticIndex(apis, store) {
  const vectors = apis
    .map((api) => {
      const id = String(api.id || api.slug || api.title || "");
      const vec = store.byId.get(id);
      return vec ? { api, vec } : null;
    })
    .filter(Boolean);

  if (vectors.length < apis.length * 0.9) {
    console.warn(
      `[vectorIndex] Embedding coverage ${vectors.length}/${apis.length} — rebuild with npm run embed:build`,
    );
  }

  warmQueryEmbedder();

  return {
    mode: "semantic",
    minScore: 0.32,
    vectors,
    async encode(query) {
      return embedQuery(query);
    },
    cosine: cosineFloat,
  };
}

export function createVectorIndex(apis) {
  const store = loadEmbeddingStore();
  const index = store ? createSemanticIndex(apis, store) : createTfidfFallback(apis);

  async function search(query, { limit = 24, minScore } = {}) {
    const floor = minScore ?? index.minScore;
    const qv = await index.encode(query);
    if (!qv || (qv instanceof Map && !qv.size) || (qv instanceof Float32Array && !qv.length)) {
      return { hits: [], bestScore: 0, fit: false, mode: index.mode };
    }

    const allScored = index.vectors
      .map(({ api, vec }) => ({ api, score: index.cosine(qv, vec) }))
      .sort((a, b) => b.score - a.score || a.api.title.localeCompare(b.api.title));

    const bestScore = allScored[0]?.score || 0;
    const scored = allScored.filter((row) => row.score >= floor).slice(0, limit);

    return {
      hits: scored,
      bestScore,
      fit: scored.length > 0 && bestScore >= floor,
      mode: index.mode,
    };
  }

  return { search, size: index.vectors.length, mode: index.mode };
}
