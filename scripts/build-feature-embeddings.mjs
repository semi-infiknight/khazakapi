#!/usr/bin/env node
/**
 * Precompute feature vectors for intent extraction.
 * Run when features change: npm run embed:features
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pipeline, env } from "@huggingface/transformers";
import { FEATURES, featureSearchText } from "../server/lib/features.js";
import { NON_BUILDABLE_MATRIX_FEATURES } from "../server/lib/categoryFeatureProfiles.js";
import { EMBED_MODEL } from "../server/lib/queryEmbedder.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, "../server/data/feature-embeddings.json");

const EXTRACT_FEATURES = FEATURES.filter((f) => !NON_BUILDABLE_MATRIX_FEATURES.has(f.id));

env.cacheDir = process.env.TRANSFORMERS_CACHE || "./.cache/transformers";
env.allowLocalModels = true;

async function main() {
  console.log(`Embedding ${EXTRACT_FEATURES.length} feature rows with ${EMBED_MODEL}…`);

  const embedder = await pipeline("feature-extraction", EMBED_MODEL, {
    dtype: "q8",
    device: "cpu",
  });

  const ids = [];
  const vectors = [];

  for (let i = 0; i < EXTRACT_FEATURES.length; i++) {
    const feature = EXTRACT_FEATURES[i];
    const text = featureSearchText(feature);
    const output = await embedder(text, { pooling: "mean", normalize: true });
    ids.push(feature.id);
    vectors.push(Array.from(output.data));

    if ((i + 1) % 50 === 0 || i === EXTRACT_FEATURES.length - 1) {
      console.log(`  ${i + 1}/${EXTRACT_FEATURES.length}`);
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
