#!/usr/bin/env node
/**
 * Benchmark intent extraction / suggest against ~10k common startup product queries.
 *
 *   node scripts/benchmark-startup-intents.mjs
 *   node scripts/benchmark-startup-intents.mjs --full   # run suggestApis (slower)
 *   node scripts/benchmark-startup-intents.mjs --limit 500
 */

import { KZ_APIS } from "../server/data/apis.js";
import { extractFeatures } from "../server/lib/featureExtract.js";
import { suggestApis } from "../server/lib/suggest.js";

const STARTUP_NOUNS = [
  "food delivery", "grocery", "restaurant", "meal kit", "cloud kitchen", "dark kitchen",
  "ride hailing", "taxi", "carpool", "fleet management", "logistics", "courier", "last mile",
  "ecommerce", "marketplace", "online store", "retail", "fashion", "secondhand", "auction",
  "fintech", "neobank", "digital wallet", "payments", "checkout", "lending", "microfinance",
  "loan", "mortgage", "insurance", "investment", "trading", "crypto", "defi", "remittance",
  "banking", "open banking", "payroll", "accounting", "invoicing", "expense management",
  "maps", "navigation", "geocoding", "fleet tracking", "delivery routing", "store locator",
  "travel", "hotel booking", "flight booking", "tourism", "visa", "immigration",
  "healthcare", "telemedicine", "pharmacy", "fitness", "wellness", "mental health",
  "education", "edtech", "lms", "tutoring", "language learning", "coding bootcamp",
  "real estate", "property", "rental", "coworking", "proptech", "construction",
  "hr", "recruiting", "ats", "workforce", "staff scheduling", "gig economy",
  "crm", "sales", "marketing", "email", "sms marketing", "analytics", "attribution",
  "social network", "dating", "community", "forum", "messaging", "chat",
  "ai assistant", "chatbot", "llm", "voice assistant", "speech recognition",
  "video streaming", "podcast", "music", "gaming", "esports", "nft",
  "saas", "devtools", "api platform", "monitoring", "observability", "security",
  "identity", "auth", "sso", "kyc", "fraud detection", "compliance",
  "weather", "news", "media", "publishing", "blog", "newsletter",
  "government", "civic tech", "open data", "statistics", "dashboard", "bi",
  "agriculture", "agtech", "mining", "oil and gas", "energy", "sustainability",
  "legal tech", "contract", "notary", "esignature", "document management",
  "iot", "smart home", "hardware", "robotics", "drone", "3d printing",
  "beauty", "salon", "booking", "events", "ticketing", "venue",
  "pet care", "veterinary", "childcare", "elder care", "nonprofit",
  "automotive", "car rental", "parking", "ev charging", "insurance telematics",
  "warehouse", "inventory", "erp", "supply chain", "procurement", "b2b marketplace",
  "creator economy", "subscription", "membership", "loyalty", "rewards",
  "prayer times", "halal", "islamic finance", "migration", "population analytics",
  "kaspi", "yandex maps", "2gis", "halyk bank", "arbuz", "indriver", "freedompay",
  "food delivery almaty", "taxi astana", "gov open data", "nbk rates", "kaspi pay",
  "sms otp signup", "address autocomplete", "parcel tracking", "ride estimate",
  "population dashboard", "health statistics", "housing market", "wage statistics",
  "crypto exchange", "merchant payments", "qr payments", "wallet topup",
  "cloud hosting", "cdn", "push notifications", "webhook platform",
  "ocr", "document scan", "translation", "localization", "multilingual",
  "survey", "forms", "polls", "feedback", "nps", "customer support",
  "helpdesk", "ticketing system", "live chat", "call center", "ivr",
  "blockchain", "smart contract", "tokenization", "carbon credits",
  "biometrics", "face recognition", "liveness", "digital id", "egov",
  "tax reporting", "vat", "e-invoice", "fiscal receipt", "cash register",
  "route optimization", "isochrone", "traffic routing", "public transport",
  "bike sharing", "scooter rental", "micromobility", "parking payment",
  "hotel channel manager", "property management", "tenant screening",
  "loan app", "credit app", "bank app", "insurance app", "investment app",
  "delivery app", "taxi app", "maps app", "weather app", "news app",
  "student app", "teacher app", "parent app", "school management",
  "horse riding", "yacht rental", "space tourism", "quantum computing",
];

const TEMPLATES = [
  (n) => n,
  (n) => `${n} app`,
  (n) => `${n} platform`,
  (n) => `${n} startup`,
  (n) => `build a ${n}`,
  (n) => `${n} for kazakhstan`,
  (n) => `${n} product`,
  (n) => `${n} service`,
  (n) => `${n} saas`,
  (n) => `${n} marketplace`,
  (n) => `mobile ${n}`,
  (n) => `${n} integration`,
  (n) => `${n} api stack`,
  (n) => `kz ${n}`,
  (n) => `${n} almaty`,
  (n) => `${n} astana`,
  (n) => `launch ${n}`,
  (n) => `${n} MVP`,
  (n) => `${n} prototype`,
  (n) => `${n} software`,
  (n) => `${n} tool`,
  (n) => `${n} solution`,
  (n) => `${n} business`,
  (n) => `${n} company`,
  (n) => `b2b ${n}`,
  (n) => `${n} b2c`,
  (n) => `${n} web app`,
  (n) => `${n} mobile app`,
  (n) => `I need ${n}`,
  (n) => `startup idea ${n}`,
  (n) => `${n} with kaspi pay`,
  (n) => `${n} with maps`,
  (n) => `${n} with sms otp`,
  (n) => `${n} with open data`,
  (n) => `${n} shymkent`,
  (n) => `build ${n} in kz`,
  (n) => `${n} api`,
  (n) => `${n} backend`,
  (n) => `${n} portal`,
  (n) => `${n} dashboard`,
];

function generateQueries(limit = 10000) {
  const out = [];
  const seen = new Set();
  for (const noun of STARTUP_NOUNS) {
    for (const tpl of TEMPLATES) {
      const q = tpl(noun).trim();
      if (!q || seen.has(q)) continue;
      seen.add(q);
      out.push(q);
      if (out.length >= limit) return out;
    }
  }
  return out;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const full = args.includes("--full");
  const limitIdx = args.indexOf("--limit");
  const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) : 10000;
  return { full, limit: Number.isFinite(limit) ? limit : 10000 };
}

async function benchmarkFeatures(queries) {
  let withFeatures = 0;
  let semanticOnly = 0;
  const failures = [];

  for (let i = 0; i < queries.length; i++) {
    const q = queries[i];
    const ext = await extractFeatures(q);
    if (ext.features.length) {
      withFeatures += 1;
      if (ext.features.every((f) => f.source === "semantic")) semanticOnly += 1;
    } else if (failures.length < 40) {
      failures.push(q);
    }
    if ((i + 1) % 500 === 0) {
      process.stderr.write(`  features ${i + 1}/${queries.length}\n`);
    }
  }

  return { withFeatures, semanticOnly, failures };
}

async function benchmarkSuggest(queries) {
  let fit = 0;
  let noFeature = 0;
  let noApis = 0;
  let lowScore = 0;
  const failures = [];

  for (let i = 0; i < queries.length; i++) {
    const q = queries[i];
    const res = await suggestApis(KZ_APIS, q);
    if (res.fit) fit += 1;
    else if (res.reason === "no_apis_matched") noApis += 1;
    else if (res.reason === "no_feature_fit" && (res.bestScore || 0) > 0) lowScore += 1;
    else noFeature += 1;

    if (!res.fit && failures.length < 40) failures.push({ q, reason: res.reason, bestScore: res.bestScore });
    if ((i + 1) % 200 === 0) process.stderr.write(`  suggest ${i + 1}/${queries.length}\n`);
  }

  return { fit, noFeature, noApis, lowScore, failures };
}

const { full, limit } = parseArgs();
const queries = generateQueries(limit);
console.log(`Benchmarking ${queries.length} startup intents (${full ? "full suggest" : "feature extract only"})…\n`);

const t0 = Date.now();
const featureStats = await benchmarkFeatures(queries);

console.log("Feature extraction");
console.log(`  queries:        ${queries.length}`);
console.log(`  with features:  ${featureStats.withFeatures} (${((featureStats.withFeatures / queries.length) * 100).toFixed(1)}%)`);
console.log(`  semantic-only:  ${featureStats.semanticOnly} (${((featureStats.semanticOnly / queries.length) * 100).toFixed(1)}%)`);
console.log(`  no features:    ${queries.length - featureStats.withFeatures} (${(((queries.length - featureStats.withFeatures) / queries.length) * 100).toFixed(1)}%)`);

if (featureStats.failures.length) {
  console.log("\nSample no-feature queries:");
  featureStats.failures.slice(0, 20).forEach((q) => console.log(`  - ${q}`));
}

if (full) {
  console.log("\nFull suggest pipeline…");
  const suggestStats = await benchmarkSuggest(queries);
  console.log("\nSuggest API");
  console.log(`  fit:            ${suggestStats.fit} (${((suggestStats.fit / queries.length) * 100).toFixed(1)}%)`);
  console.log(`  no_feature_fit: ${suggestStats.noFeature + suggestStats.lowScore}`);
  console.log(`  no_apis_matched:${suggestStats.noApis}`);
  if (suggestStats.failures.length) {
    console.log("\nSample no-fit queries:");
    suggestStats.failures.slice(0, 15).forEach(({ q, reason, bestScore }) =>
      console.log(`  - [${reason}${bestScore ? ` ${bestScore}` : ""}] ${q}`),
    );
  }
}

console.log(`\nDone in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
