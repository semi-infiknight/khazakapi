/**
 * In-memory TF–IDF vector index for catalogue semantic search.
 * No external embedding API required — works offline at suggest time.
 */

const STOP = new Set([
  "a", "an", "the", "and", "or", "for", "to", "of", "in", "on", "at", "by", "with", "from", "is", "are",
  "be", "as", "this", "that", "it", "its", "you", "your", "we", "our", "i", "my", "me", "app", "apps",
  "application", "applications", "api", "apis", "kz", "kazakhstan", "using", "use", "need", "needs",
  "want", "build", "building", "make", "making", "get", "got", "into", "via",
]);

const CATEGORY_HINTS = {
  Payments: "checkout payments wallet billing invoice pay card acquiring merchant",
  "Maps & location": "maps address geocode location nearby places poi autocomplete coordinates",
  "Travel & mobility": "taxi ride routing eta courier fleet navigation mobility transit",
  "Food & delivery": "food delivery restaurant grocery courier last mile order",
  "Logistics & delivery": "parcel shipping logistics courier tracking tariff delivery",
  "E-commerce": "marketplace shop store seller catalog product inventory ecommerce",
  "Banking & finance": "bank banking finance fintech fx exchange rates currency iban",
  Banking: "bank banking finance rates accounts",
  Finance: "finance rates currency markets",
  "Financial Markets": "markets exchange rates securities finance",
  "Government data": "government open data statistics dataset egov public",
  "Government services": "government egov services identity documents",
  "Auth & identity": "login signup auth oauth identity signature verify kyc",
  AI: "ai llm chatbot assistant nlp machine learning gpt",
  Communications: "sms otp telecom analytics ads marketing metrica",
  "Environment & climate": "weather forecast climate temperature environment",
  Environment: "weather climate environment ecology",
  Health: "health hospital clinic medical pharmacy",
  Healthcare: "healthcare hospital medical clinic",
  "Housing & property": "housing property apartment real estate rent cadastral",
  Property: "property real estate housing",
  Transport: "transport trains buses flights tickets railways",
  Transportation: "transportation trains buses flights",
  "Cloud & infrastructure": "cloud hosting storage infrastructure server",
  "E-invoicing & tax": "tax invoice esf einvoice vat kgd",
  Education: "education school university students",
  Demography: "population demography census society",
  "Population & society": "population society demographics households",
  Prices: "prices inflation consumer goods",
  Realtime: "realtime live streaming websocket",
  "Data & enrichment": "enrichment validation lookup data quality",
};

function tokenize(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/ё/g, "е")
    .split(/[^a-z0-9а-я]+/i)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

function apiDocumentText(api) {
  const hints = CATEGORY_HINTS[api.category] || "";
  return [
    api.title || "",
    api.category || "",
    api.provider || "",
    api.companyName || "",
    api.source || "",
    api.note || "",
    api.apiType || "",
    api.group || "",
    hints,
  ].join(" ");
}

function buildTf(tokens) {
  const tf = new Map();
  for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
  // length-normalize
  const len = Math.sqrt([...tf.values()].reduce((s, v) => s + v * v, 0)) || 1;
  for (const [k, v] of tf) tf.set(k, v / len);
  return tf;
}

export function createVectorIndex(apis) {
  const docs = apis.map((api) => {
    const tokens = tokenize(apiDocumentText(api));
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
    for (const [t, tf] of doc.tf) {
      vec.set(t, tf * (idf.get(t) || 0));
    }
    // re-normalize after idf
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

  function cosine(a, b) {
    if (!a.size || !b.size) return 0;
    let score = 0;
    // iterate smaller
    const [small, large] = a.size <= b.size ? [a, b] : [b, a];
    for (const [t, v] of small) {
      const u = large.get(t);
      if (u) score += v * u;
    }
    return score;
  }

  function search(query, { limit = 24, minScore = 0.18 } = {}) {
    const qv = encode(query);
    if (!qv.size) return { hits: [], bestScore: 0, fit: false };

    const scored = vectors
      .map(({ api, vec }) => ({ api, score: cosine(qv, vec) }))
      .filter((row) => row.score >= minScore)
      .sort((a, b) => b.score - a.score || a.api.title.localeCompare(b.api.title))
      .slice(0, limit);

    const bestScore = scored[0]?.score || 0;
    return {
      hits: scored,
      bestScore,
      fit: scored.length > 0 && bestScore >= minScore,
    };
  }

  return { search, size: vectors.length };
}
