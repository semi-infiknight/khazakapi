import { publicListEntry, tokenize } from "./search.js";
import { createVectorIndex } from "./vectorIndex.js";

/**
 * Product-intent recipes: label semantic hits into stack layers when they fit.
 */
const INTENTS = [
  {
    id: "payments",
    label: "Accept payments",
    role: "Checkout & payouts",
    where: "At checkout — charge the customer before confirming the order",
    keywords: [
      "pay", "payment", "payments", "checkout", "billing", "invoice", "kaspi", "freedompay",
      "wooppay", "paybox", "qiwi", "wallet", "card", "acquiring", "merchant", "pos",
    ],
    categories: ["Payments", "Banking & finance", "Banking", "Finance"],
    providers: ["kaspi", "freedompay", "wooppay", "paybox", "qiwi", "halyk", "asiapay", "apipay"],
  },
  {
    id: "maps",
    label: "Maps & addresses",
    role: "Geocoding, maps & place search",
    where: "Wherever users enter an address, pick a pin, or browse nearby places",
    keywords: [
      "map", "maps", "address", "geocode", "geocoder", "location", "poi", "2gis", "yandex maps",
      "coordinates", "lat", "lng", "nearby", "places", "autocomplete", "suggest",
    ],
    categories: ["Maps & location"],
    providers: ["2gis", "yandex"],
  },
  {
    id: "mobility",
    label: "Rides & routing",
    role: "Routing, ETA & mobility",
    where: "When estimating delivery time, dispatching a courier, or showing a route",
    keywords: [
      "taxi", "ride", "routing", "route", "eta", "distance", "matrix", "courier", "driver",
      "indriver", "yandex go", "mobility", "fleet", "navigation",
    ],
    categories: ["Travel & mobility", "Transport", "Transportation"],
    providers: ["yandex", "indriver", "2gis"],
  },
  {
    id: "delivery",
    label: "Food & parcel delivery",
    role: "Delivery partners & logistics",
    where: "After checkout — hand the order to a delivery network or track a parcel",
    keywords: [
      "delivery", "food", "restaurant", "glovo", "wolt", "cdek", "kazpost", "parcel", "shipping",
      "logistics", "courier", "last mile", "order food",
    ],
    categories: ["Food & delivery", "Logistics & delivery", "E-commerce"],
    providers: ["glovo", "wolt", "cdek", "kazpost", "chocofamily"],
  },
  {
    id: "ecommerce",
    label: "Marketplace & commerce",
    role: "Catalog, sellers & orders",
    where: "Product sync, seller onboarding, and order status between your app and a marketplace",
    keywords: [
      "marketplace", "ecommerce", "e-commerce", "shop", "store", "seller", "catalog", "product",
      "wildberries", "ozon", "yandex market", "inventory", "sku",
    ],
    categories: ["E-commerce"],
    providers: ["wildberries", "ozon", "yandex market", "chocofamily"],
  },
  {
    id: "banking",
    label: "Banking & finance data",
    role: "Rates, banks & finance APIs",
    where: "Dashboards, FX conversion, or showing bank details to users",
    keywords: [
      "bank", "banking", "finance", "fintech", "fx", "exchange", "rate", "nbk", "halyk", "forte",
      "rbk", "bereke", "eurasian", "swift", "iban", "currency",
    ],
    categories: ["Banking & finance", "Banking", "Finance", "Financial Markets", "National Accounts", "Prices"],
    providers: ["halyk", "nbk", "nationalbank", "forte", "rbk", "bereke", "kaspi"],
  },
  {
    id: "gov",
    label: "Government & open data",
    role: "Official KZ datasets & services",
    where: "When you need verified public data, eGov services, or statistical indicators",
    keywords: [
      "government", "gov", "egov", "open data", "statistics", "stat", "kato", "population",
      "demography", "public", "ministry", "dataset", "data.egov",
    ],
    categories: [
      "Government data",
      "Government services",
      "Public Administration",
      "Demography",
      "Population & society",
      "Statistical Indicators",
      "Data Dictionaries",
      "Metadata",
    ],
    providers: ["egov", "stat.gov", "data.egov", "nbk"],
  },
  {
    id: "identity",
    label: "Auth & digital identity",
    role: "Sign-in & e-signature",
    where: "At registration / login — verify the user or sign documents",
    keywords: [
      "auth", "login", "signup", "identity", "oauth", "yandex id", "sigex", "eds", "signature",
      "iin", "bin", "kyc", "verify",
    ],
    categories: ["Auth & identity", "Government services"],
    providers: ["yandex", "sigex", "egov"],
  },
  {
    id: "ai",
    label: "AI & language",
    role: "LLM, search & AI features",
    where: "Chat assistants, search ranking, or content generation inside the product",
    keywords: ["ai", "llm", "gpt", "yandexgpt", "chatbot", "assistant", "nlp", "embedding", "ml"],
    categories: ["AI"],
    providers: ["yandex"],
  },
  {
    id: "travel",
    label: "Travel booking",
    role: "Flights, trains & tickets",
    where: "Search → book flow for transport tickets",
    keywords: [
      "flight", "airline", "train", "ticket", "aviata", "air astana", "flyarystan", "scat",
      "railways", "ktz", "booking", "travel",
    ],
    categories: ["Travel & mobility", "Transport"],
    providers: ["aviata", "air astana", "flyarystan", "scat", "tickets", "ktz", "railways"],
  },
  {
    id: "telecom",
    label: "Telecom & messaging",
    role: "SMS, numbers & operator APIs",
    where: "OTP SMS, number lookup, or operator-specific features",
    keywords: ["sms", "otp", "telecom", "beeline", "kcell", "tele2", "altel", "phone", "mobile"],
    categories: ["Communications"],
    providers: ["beeline", "kcell", "tele2", "altel"],
  },
  {
    id: "weather",
    label: "Weather & climate",
    role: "Forecasts & environment data",
    where: "Home screens, logistics planning, or agriculture features that need weather",
    keywords: ["weather", "forecast", "climate", "kazhydromet", "temperature", "rain"],
    categories: ["Environment & climate", "Environment"],
    providers: ["kazhydromet"],
  },
  {
    id: "health",
    label: "Health data",
    role: "Healthcare & public health datasets",
    where: "Health dashboards or services that consume official medical statistics",
    keywords: ["health", "hospital", "clinic", "medical", "pharmacy", "covid"],
    categories: ["Health", "Healthcare"],
    providers: [],
  },
  {
    id: "property",
    label: "Housing & property",
    role: "Real estate & cadastral data",
    where: "Property listings, valuation tools, or address-linked housing records",
    keywords: ["property", "housing", "real estate", "apartment", "cadastr", "rent", "mortgage"],
    categories: ["Housing & property", "Property"],
    providers: [],
  },
  {
    id: "analytics",
    label: "Product analytics & ads",
    role: "Traffic, ads & measurement",
    where: "After launch — measure traffic, run ads, or attribute installs",
    keywords: [
      "analytics", "metrica", "ads", "advertising", "campaign", "yandex direct", "appmetrica",
      "marketing",
    ],
    categories: ["Communications"],
    providers: ["yandex"],
  },
  {
    id: "cloud",
    label: "Cloud & infrastructure",
    role: "Hosting, storage & cloud APIs",
    where: "Backend infra — object storage, compute, or managed cloud services",
    keywords: ["cloud", "infrastructure", "hosting", "storage", "ps.kz", "yandex cloud", "server"],
    categories: ["Cloud & infrastructure"],
    providers: ["yandex", "ps"],
  },
  {
    id: "tax",
    label: "Tax & e-invoicing",
    role: "ESF / tax document APIs",
    where: "When issuing electronic invoices or syncing with tax systems",
    keywords: ["tax", "esf", "invoice", "kgd", "einvoice", "e-invoice", "vat"],
    categories: ["E-invoicing & tax"],
    providers: ["kgd", "esf"],
  },
];

const EXAMPLE_PROMPTS = [
  "Food delivery app for Almaty with Kaspi pay and courier ETAs",
  "Fintech wallet that shows NBK rates and accepts FreedomPay",
  "Marketplace for local sellers with maps and address autocomplete",
  "Travel planner with flights, trains, and hotel maps in Astana",
  "Gov dashboard using open data, population, and weather",
];

/** Minimum cosine similarity to treat a hit as a real fit. */
const MIN_SCORE = 0.2;
/** Absolute floor — below this we declare no catalogue fit. */
const NO_FIT_SCORE = 0.18;

let cachedIndex = null;
let cachedApiCount = 0;

function getIndex(apis) {
  if (!cachedIndex || cachedApiCount !== apis.length) {
    cachedIndex = createVectorIndex(apis);
    cachedApiCount = apis.length;
  }
  return cachedIndex;
}

function normalize(text = "") {
  return text.toLowerCase().replace(/ё/g, "е");
}

function scoreIntent(intent, hay, tokens) {
  let score = 0;
  for (const kw of intent.keywords) {
    if (hay.includes(kw)) score += kw.includes(" ") ? 8 : 4;
  }
  for (const t of tokens) {
    if (t.length < 4) {
      if (intent.keywords.some((kw) => kw === t)) score += 2;
      continue;
    }
    if (intent.keywords.some((kw) => kw === t || kw.includes(t) || t.includes(kw))) score += 2;
  }
  return score;
}

function intentForApi(api, rankedIntents) {
  for (const { intent, score } of rankedIntents) {
    if (score < 4) continue;
    if (intent.categories.includes(api.category || "")) return intent;
    const provider = normalize(`${api.provider || ""} ${api.companyName || ""}`);
    if (intent.providers.some((p) => provider.includes(p))) return intent;
  }
  return null;
}

function authGuidance(api) {
  if (api.auth === "none") return "No API key — call the endpoint directly from your backend.";
  if (api.auth === "apiKey") {
    return `Get an API key from ${api.provider}, store it server-side, and send it on each request.`;
  }
  if (api.auth === "oauth") {
    return `Register an OAuth app with ${api.provider}, complete the auth redirect, then call with a bearer token.`;
  }
  return `Authenticate with ${api.provider} (${api.auth}) before calling this endpoint.`;
}

function plugInSteps(api, intent) {
  const role = intent?.role || api.category || "this capability";
  const where = intent?.where || `Use when your product needs ${api.category || "this data"}.`;
  const steps = [`Use this for: ${String(role).toLowerCase()}.`, where, authGuidance(api)];
  if (api.docs || api.sourceUrl) {
    steps.push("Open the official docs linked on the API page, then try a live request in the tester.");
  } else {
    steps.push("Open the API page and use the built-in tester with a sample request.");
  }
  return steps;
}

function enrichApi(api, score, intent) {
  const where = intent?.where || `Relevant when your product needs ${api.category || "this capability"}.`;
  return {
    ...publicListEntry(api),
    matchScore: Number(score.toFixed(4)),
    role: intent?.role || api.category || "Catalogue match",
    plugIn: {
      where,
      auth: authGuidance(api),
      steps: plugInSteps(api, intent),
      docs: api.docs || api.sourceUrl || null,
      href:
        api.hubPath ||
        (api.companyHub && api.categorySlug && api.companySlug
          ? `/browse/${api.categorySlug}/${api.companySlug}/${api.slug || api.id}`
          : `/apis/${api.slug || api.id}`),
    },
  };
}

function buildSummary(query, intents, { fit, bestScore }) {
  if (!fit) {
    return `We don’t have a good API fit for “${query}” in the Kazakhstan catalogue (best similarity ${bestScore.toFixed(2)}). Try payments, maps, delivery, banking, travel, weather, or government open data — or browse categories.`;
  }
  const labels = intents.slice(0, 3).map((i) => i.label.toLowerCase());
  if (labels.length === 1) {
    return `For what you described, start with ${labels[0]} — here is where each API plugs into your stack.`;
  }
  if (labels.length === 2) {
    return `Your build likely needs ${labels[0]} and ${labels[1]}. Suggested APIs and where to wire them in:`;
  }
  if (labels.length >= 3) {
    return `Your build maps to ${labels.slice(0, -1).join(", ")}, and ${labels.at(-1)}. Suggested APIs and where to wire them in:`;
  }
  return `Here are the closest Kazakhstan APIs for “${query}”, grouped by how they plug into a product.`;
}

function noFitSuggestions(query) {
  return {
    query,
    fit: false,
    bestScore: 0,
    summary: `We don’t have a good API fit for “${query}” in this catalogue. KhazakAPI focuses on Kazakhstan payments, maps, delivery, banking, travel, weather, telecom, and government open data.`,
    reason: "no_semantic_fit",
    examples: EXAMPLE_PROMPTS,
    intents: [],
    apis: [],
    total: 0,
  };
}

export function suggestApis(apis, query = "", { limit = 24 } = {}) {
  const text = String(query || "").trim();
  if (!text) {
    return {
      query: null,
      fit: null,
      bestScore: 0,
      summary: "Describe the product you are building to get a stack of Kazakhstan APIs and where each one plugs in.",
      examples: EXAMPLE_PROMPTS,
      intents: [],
      apis: [],
      total: 0,
    };
  }

  const index = getIndex(apis);
  const { hits, bestScore, fit } = index.search(text, { limit, minScore: NO_FIT_SCORE });

  if (!fit || !hits.length) {
    return {
      ...noFitSuggestions(text),
      bestScore,
    };
  }

  // Drop marginal hits far below the best score so weak neighbours don't pollute the stack.
  const cutoff = Math.max(MIN_SCORE, bestScore * 0.72);
  const strongHits = hits.filter((h) => h.score >= cutoff).slice(0, limit);

  if (!strongHits.length) {
    return {
      ...noFitSuggestions(text),
      bestScore,
    };
  }

  const hay = normalize(text);
  const tokens = tokenize(text);
  const rankedIntents = INTENTS.map((intent) => ({
    intent,
    score: scoreIntent(intent, hay, tokens),
  })).sort((a, b) => b.score - a.score);

  const layers = new Map();

  for (const { api, score } of strongHits) {
    const intent = intentForApi(api, rankedIntents);
    const layerId = intent?.id || `cat-${(api.categorySlug || api.category || "other").toString()}`;
    const label = intent?.label || api.category || "Related APIs";
    const role = intent?.role || api.category || "Related APIs";
    const where =
      intent?.where || `Use when your product needs ${api.category || "this capability"}.`;

    if (!layers.has(layerId)) {
      layers.set(layerId, {
        id: layerId,
        label,
        role,
        where,
        score: score,
        apis: [],
      });
    }
    const layer = layers.get(layerId);
    layer.score = Math.max(layer.score, score);
    if (layer.apis.length < 6) {
      layer.apis.push(enrichApi(api, score, intent));
    }
  }

  const intentBlocks = [...layers.values()].sort((a, b) => b.score - a.score);
  const merged = intentBlocks.flatMap((block) => block.apis);

  return {
    query: text,
    fit: true,
    bestScore,
    summary: buildSummary(text, intentBlocks, { fit: true, bestScore }),
    examples: EXAMPLE_PROMPTS,
    intents: intentBlocks,
    apis: merged,
    total: merged.length,
  };
}

export function suggestExamples() {
  return EXAMPLE_PROMPTS;
}
