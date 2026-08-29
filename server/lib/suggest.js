import { publicListEntry, searchApis, tokenize } from "./search.js";

/**
 * Product-intent recipes: map “what I’m building” language → API roles + catalogue matches.
 * Scores are additive; higher = stronger match for that use-case.
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

function scoreApiForIntent(api, intent, tokens) {
  let score = 0;
  const category = api.category || "";
  const provider = normalize(`${api.provider || ""} ${api.companyName || ""} ${api.source || ""}`);
  const title = normalize(api.title || "");
  const note = normalize(api.note || "");

  if (intent.categories.includes(category)) score += 12;
  for (const p of intent.providers) {
    if (provider.includes(p) || title.includes(p)) score += 10;
  }
  for (const t of tokens) {
    if (title.includes(t)) score += 3;
    if (note.includes(t)) score += 1;
    if (provider.includes(t)) score += 2;
  }
  if (api.pricing === "free") score += 1;
  if (api.auth === "none") score += 1;
  if (api.copyable) score += 1;
  if (api.tier === "commercial") score += 0.5;
  return score;
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
  const steps = [
    `Use this for: ${intent.role.toLowerCase()}.`,
    intent.where,
    authGuidance(api),
  ];
  if (api.docs || api.sourceUrl) {
    steps.push("Open the official docs linked on the API page, then try a live request in the tester.");
  } else {
    steps.push("Open the API page and use the built-in tester with a sample request.");
  }
  return steps;
}

function buildSummary(query, intents) {
  if (!intents.length) {
    return `No strong product match for “${query}”. Showing the closest catalogue hits — try naming payments, maps, delivery, or government data.`;
  }
  const labels = intents.slice(0, 3).map((i) => i.label.toLowerCase());
  if (labels.length === 1) {
    return `For what you described, start with ${labels[0]} — here is where each API plugs into your stack.`;
  }
  if (labels.length === 2) {
    return `Your build likely needs ${labels[0]} and ${labels[1]}. Suggested APIs and where to wire them in:`;
  }
  return `Your build maps to ${labels.slice(0, -1).join(", ")}, and ${labels.at(-1)}. Suggested APIs and where to wire them in:`;
}

function uniqueById(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function suggestApis(apis, query = "", { limit = 24 } = {}) {
  const text = String(query || "").trim();
  if (!text) {
    return {
      query: null,
      summary: "Describe the product you are building to get a stack of Kazakhstan APIs and where each one plugs in.",
      examples: EXAMPLE_PROMPTS,
      intents: [],
      apis: [],
      total: 0,
    };
  }

  const hay = normalize(text);
  const tokens = tokenize(text);

  const rankedIntents = INTENTS.map((intent) => ({
    intent,
    score: scoreIntent(intent, hay, tokens),
  }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score);

  const topIntents = rankedIntents.slice(0, 5);
  const usedIds = new Set();
  const intentBlocks = [];

  for (const { intent } of topIntents) {
    const matches = apis
      .map((api) => ({ api, score: scoreApiForIntent(api, intent, tokens) }))
      .filter((row) => row.score >= 10)
      .sort((a, b) => b.score - a.score || a.api.title.localeCompare(b.api.title))
      .slice(0, 6)
      .filter((row) => !usedIds.has(row.api.id));

    if (!matches.length) continue;

    for (const row of matches) usedIds.add(row.api.id);

    intentBlocks.push({
      id: intent.id,
      label: intent.label,
      role: intent.role,
      where: intent.where,
      score: matches[0].score,
      apis: matches.map(({ api, score }) => ({
        ...publicListEntry(api),
        matchScore: score,
        role: intent.role,
        plugIn: {
          where: intent.where,
          auth: authGuidance(api),
          steps: plugInSteps(api, intent),
          docs: api.docs || api.sourceUrl || null,
          href:
            api.hubPath ||
            (api.companyHub && api.categorySlug && api.companySlug
              ? `/browse/${api.categorySlug}/${api.companySlug}/${api.slug || api.id}`
              : `/apis/${api.slug || api.id}`),
        },
      })),
    });
  }

  // Fill gaps with classic catalogue search so free-form wording still returns something useful.
  const searchFallback = searchApis(apis, { q: text, limit: limit }).apis;
  const flatFromIntents = intentBlocks.flatMap((block) => block.apis);
  const merged = uniqueById([
    ...flatFromIntents,
    ...searchFallback.map((api) => ({
      ...api,
      role: api.category || "Catalogue match",
      plugIn: {
        where: `Relevant to “${text}” based on catalogue search`,
        auth: authGuidance(api),
        steps: [
          `Matched your description via keywords in ${api.category}.`,
          authGuidance(api),
          "Open the API page to inspect the endpoint and try a live request.",
        ],
        docs: api.docs || api.sourceUrl || null,
        href:
          api.hubPath ||
          (api.companyHub && api.categorySlug && api.companySlug
            ? `/browse/${api.categorySlug}/${api.companySlug}/${api.slug || api.id}`
            : `/apis/${api.slug || api.id}`),
      },
    })),
  ]).slice(0, limit);

  // If no intents fired but search found hits, synthesize a single “Closest matches” block.
  if (!intentBlocks.length && merged.length) {
    intentBlocks.push({
      id: "closest",
      label: "Closest catalogue matches",
      role: "Keyword matches",
      where: "Review these endpoints and open the ones that fit your product flow",
      score: 1,
      apis: merged.slice(0, 8),
    });
  }

  return {
    query: text,
    summary: buildSummary(text, intentBlocks),
    examples: EXAMPLE_PROMPTS,
    intents: intentBlocks,
    apis: merged,
    total: merged.length,
  };
}

export function suggestExamples() {
  return EXAMPLE_PROMPTS;
}
