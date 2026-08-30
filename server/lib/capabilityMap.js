/**
 * Capability atoms → product feature IDs (derived from ontology + vocabulary).
 */

import { FEATURES } from "./features.js";
import { CAPABILITY_VOCABULARY } from "./capabilityVocabulary.js";

function getCapabilityAtom(id) {
  return CAPABILITY_VOCABULARY.find((a) => a.id === id) || null;
}

/** @type {Map<string, Set<string>>} */
let capabilityToFeatures = null;

export function buildCapabilityToFeatureMap() {
  const map = new Map();

  function add(cap, featureId) {
    if (!cap || !featureId) return;
    if (!map.has(cap)) map.set(cap, new Set());
    map.get(cap).add(featureId);
  }

  for (const feature of FEATURES) {
    for (const cap of feature.capabilityTags || []) {
      add(cap, feature.id);
      if (feature.parentId) add(cap, feature.parentId);
    }
  }

  for (const atom of CAPABILITY_VOCABULARY) {
    for (const featureId of atom.featureIds || []) {
      add(atom.id, featureId);
    }
  }

  return map;
}

export function getCapabilityToFeatureMap() {
  if (!capabilityToFeatures) {
    capabilityToFeatures = buildCapabilityToFeatureMap();
  }
  return capabilityToFeatures;
}

/** Strict suggest/eligibility mapping — vocabulary atoms only (not ontology reverse-index). */
export function capabilitiesToPrimaryFeatureIds(capabilities) {
  const out = new Set();
  for (const cap of capabilities) {
    const atom = getCapabilityAtom(cap);
    for (const fid of atom?.featureIds || []) out.add(fid);
  }
  return [...out].sort();
}

/**
 * Broad ontology reverse-index (legacy). Avoid for suggest primary matching.
 * @param {Iterable<string>} capabilities
 * @returns {string[]}
 */
export function capabilitiesToFeatureIds(capabilities) {
  const map = getCapabilityToFeatureMap();
  const out = new Set();
  for (const cap of capabilities) {
    for (const fid of map.get(cap) || []) out.add(fid);
  }
  return [...out].sort();
}

export function allVocabularyCapabilityIds() {
  return CAPABILITY_VOCABULARY.map((a) => a.id);
}

export function orphanCapabilities(usedCaps) {
  const map = getCapabilityToFeatureMap();
  const orphans = [];
  for (const cap of usedCaps) {
    if (!map.has(cap) || map.get(cap).size === 0) orphans.push(cap);
  }
  return orphans;
}
