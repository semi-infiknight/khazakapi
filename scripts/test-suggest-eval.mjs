#!/usr/bin/env node
/**
 * Smoke-test feature-based suggest against expected outcomes.
 * Run: node scripts/test-suggest-eval.mjs
 */

import { KZ_APIS } from "../server/data/apis.js";
import { suggestApis } from "../server/lib/suggest.js";
import { getApiCapabilities } from "../server/lib/apiCapabilities.js";

const CASES = [
  {
    q: "Geocoordinator",
    expectFit: true,
    expectFeatures: ["forward-geocode", "reverse-geocode"],
    expectApiIds: ["kz-2gis-geocoder", "yandex-geocoder"],
    rejectApiIds: ["kz-2gis-distance-matrix"],
  },
  {
    q: "horse riding app",
    expectFit: false,
  },
  {
    q: "student app",
    expectFit: false,
  },
  {
    q: "address autocomplete, kaspi checkout, courier ETA",
    expectFit: true,
    expectFeatures: ["address-autocomplete", "checkout-payment", "delivery-eta"],
  },
  {
    q: "Food delivery app for Almaty with Kaspi pay and courier ETAs",
    expectFit: true,
    expectFeatures: ["checkout-payment", "delivery-eta"],
    expectRecipes: ["food-delivery"],
  },
  {
    q: "Kaspi checkout and SMS OTP",
    expectFit: true,
    expectFeatures: ["checkout-payment", "sms-otp"],
  },
  {
    q: "population dashboard with open data",
    expectFit: true,
    expectFeatures: ["population-stats", "gov-open-data"],
  },
  {
    q: "taxi app with ride hailing",
    expectFit: true,
    expectFeatures: ["ride-hailing"],
    expectApiIds: ["kz-indriver-partner", "yandex-go-taxi-info"],
  },
  {
    q: "YandexGPT chatbot with speech",
    expectFit: true,
    expectFeatures: ["ai-assistant", "speech-ai"],
  },
  {
    q: "real estate app with maps",
    expectFit: true,
    expectFeatures: ["housing-stats", "map-display", "address-autocomplete", "forward-geocode"],
  },
  {
    q: "health dashboard covid hospital stats",
    expectFit: true,
    expectFeatures: ["health-stats"],
  },
  {
    q: "grocery delivery with Arbuz",
    expectFit: true,
    expectFeatures: ["grocery-delivery"],
  },
];

const CAP_CHECKS = [
  { id: "yandex-appmetrica", must: ["analytics-tracking"], mustNot: ["sms-otp", "checkout-payment"] },
  { id: "yandex-direct-v5", must: ["ads-campaigns"], mustNot: ["sms-otp"] },
  { id: "yandex-cloud-compute", must: ["cloud-hosting"], mustNot: ["ai-assistant"] },
  { id: "yandex-gpt", must: ["ai-assistant", "llm"] },
  { id: "kz-kaspi-pay-qr", must: ["checkout-payment"], mustNot: ["poi-search"] },
];

let passed = 0;
let failed = 0;

for (const check of CAP_CHECKS) {
  const api = KZ_APIS.find((a) => a.id === check.id);
  const caps = getApiCapabilities(api);
  const errors = [];
  for (const t of check.must || []) if (!caps.has(t)) errors.push(`missing cap ${t}`);
  for (const t of check.mustNot || []) if (caps.has(t)) errors.push(`unexpected cap ${t}`);
  if (errors.length) {
    failed += 1;
    console.log(`FAIL  caps ${check.id}: ${errors.join("; ")} (got ${[...caps].join(",")})`);
  } else {
    passed += 1;
    console.log(`OK    caps ${check.id}`);
  }
}

for (const tc of CASES) {
  const res = await suggestApis(KZ_APIS, tc.q);
  const errors = [];

  if (Boolean(res.fit) !== tc.expectFit) {
    errors.push(`fit expected ${tc.expectFit}, got ${res.fit} (reason: ${res.reason})`);
  }

  if (tc.expectFit && tc.expectFeatures?.length) {
    const ids = (res.features || []).map((f) => f.id);
    const hit = tc.expectFeatures.some((id) => ids.includes(id));
    if (!hit) errors.push(`expected one of features [${tc.expectFeatures.join(", ")}] (got ${ids.join(", ")})`);
  }

  if (tc.expectApiIds?.length) {
    const apiIds = (res.apis || []).map((a) => a.id);
    const hit = tc.expectApiIds.some((id) => apiIds.includes(id));
    if (!hit) errors.push(`expected one of APIs [${tc.expectApiIds.join(", ")}] (got ${apiIds.join(", ")})`);
  }

  if (tc.rejectApiIds?.length) {
    const apiIds = (res.apis || []).map((a) => a.id);
    for (const id of tc.rejectApiIds) {
      if (apiIds.includes(id)) errors.push(`should not include API ${id}`);
    }
  }

  if (tc.expectRecipes?.length) {
    const missing = tc.expectRecipes.filter((id) => !(res.recipes || []).includes(id));
    if (missing.length) errors.push(`missing recipes: ${missing.join(", ")}`);
  }

  if (errors.length) {
    failed += 1;
    console.log(`FAIL  "${tc.q}"`);
    errors.forEach((e) => console.log(`      ${e}`));
  } else {
    passed += 1;
    console.log(`OK    "${tc.q}" → ${res.features?.map((f) => f.label).join(", ") || "no fit"}`);
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
