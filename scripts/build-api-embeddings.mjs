#!/usr/bin/env node
/**
 * Precompute catalogue embeddings for local semantic search.
 * Run when APIs change: npm run embed:build
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pipeline, env } from "@huggingface/transformers";
import { KZ_APIS } from "../server/data/apis.js";
import { apiDocumentId, apiDocumentText } from "../server/lib/catalogText.js";
import { EMBED_MODEL } from "../server/lib/queryEmbedder.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, "../server/data/api-embeddings.json");

env.cacheDir = process.env.TRANSFORMERS_CACHE || "./.cache/transformers";
env.allowLocalModels = true;

async function main() {
  console.log(`Embedding ${KZ_APIS.length} catalogue entries with ${EMBED_MODEL}…`);

  const embedder = await pipeline("feature-extraction", EMBED_MODEL, {
    dtype: "q8",
    device: "cpu",
  });

  const ids = [];
  const vectors = [];

  for (let i = 0; i < KZ_APIS.length; i++) {
    const api = KZ_APIS[i];
    const id = apiDocumentId(api);
    const text = apiDocumentText(api);
    const output = await embedder(text, { pooling: "mean", normalize: true });
    ids.push(id);
    vectors.push(Array.from(output.data));

    if ((i + 1) % 50 === 0 || i === KZ_APIS.length - 1) {
      console.log(`  ${i + 1}/${KZ_APIS.length}`);
    }
  }

  const payload = {
    model: EMBED_MODEL,
    dimensions: vectors[0]?.length || 384,
    count: ids.length,
    ids,
    vectors,
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(payload));

  const mb = (fs.statSync(OUT_PATH).size / (1024 * 1024)).toFixed(2);
  console.log(`Wrote ${OUT_PATH} (${mb} MB, ${payload.dimensions}d × ${payload.count})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
