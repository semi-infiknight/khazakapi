/**
 * Load precomputed per-API capability + feature matrix (built by npm run cap:build).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { capabilitiesToFeatureIds } from "./capabilityMap.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MATRIX_PATH = path.join(__dirname, "../data/api-capability-matrix.json");

let matrix = null;

function loadMatrix() {
  if (matrix) return matrix;
  try {
    if (!fs.existsSync(MATRIX_PATH)) {
      matrix = { entries: {} };
      return matrix;
    }
    matrix = JSON.parse(fs.readFileSync(MATRIX_PATH, "utf8"));
    return matrix;
  } catch {
    matrix = { entries: {} };
    return matrix;
  }
}

export function getMatrixEntry(apiId) {
  const id = String(apiId || "");
  return loadMatrix().entries?.[id] || null;
}

export function getMatrixCapabilities(apiId) {
  const entry = getMatrixEntry(apiId);
  return entry?.capabilities?.length ? entry.capabilities : null;
}

export function getMatrixPrimaryFeatures(apiId) {
  const entry = getMatrixEntry(apiId);
  if (entry?.primaryFeatures?.length) return entry.primaryFeatures;
  if (entry?.capabilities?.length) return capabilitiesToFeatureIds(entry.capabilities);
  return null;
}

export function getMatrixFeatures(apiId) {
  const entry = getMatrixEntry(apiId);
  if (entry?.features?.length) return entry.features;
  if (entry?.primaryFeatures?.length) return entry.primaryFeatures;
  if (entry?.capabilities?.length) return capabilitiesToFeatureIds(entry.capabilities);
  return null;
}

export function matrixLoaded() {
  return Boolean(loadMatrix().entries && Object.keys(loadMatrix().entries).length);
}

export function matrixStats() {
  const data = loadMatrix();
  return data.stats || null;
}
