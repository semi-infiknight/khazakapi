import { buildTrySpec } from "./requestSpec.js";

const STOP = new Set([
  "a", "an", "the", "and", "or", "for", "to", "of", "in", "on", "at", "by", "with", "from", "is", "are",
]);

export function tokenize(q) {
  if (!q) return [];
  return q
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

function scoreEntry(entry, tokens) {
  if (!tokens.length) return 1;
  const hay = [
    entry.id,
    entry.title,
    entry.category,
    entry.group,
    entry.provider,
    entry.source,
    ...(entry.country || []),
  ]
    .join(" ")
    .toLowerCase();
  let score = 0;
  for (const t of tokens) {
    if (hay.includes(t)) score += t.length;
    if (entry.id === t) score += 20;
    if (entry.title.toLowerCase().includes(t)) score += 10;
  }
  return score;
}

function matchesFilters(entry, filters) {
  if (filters.category && entry.category !== filters.category) return false;
  if (filters.tier && entry.tier !== filters.tier) return false;
  if (filters.pricing && entry.pricing !== filters.pricing) return false;
  if (filters.auth && entry.auth !== filters.auth) return false;
  if (filters.country) {
    const countries = entry.country || [];
    if (!countries.includes(filters.country)) {
      if (filters.country !== "global" || !countries.includes("global")) return false;
    }
    if (filters.country === "global" && !countries.includes("global")) return false;
  }
  if (filters.free === "true" && entry.pricing !== "free") return false;
  if (filters.no_auth === "true" && entry.auth !== "none") return false;
  if (filters.group && entry.group !== filters.group) return false;
  return true;
}

const FACET_KEYS = ["category", "country", "auth", "pricing", "tier", "group"];

function activeFilters(query = {}) {
  const filters = {};
  for (const key of FACET_KEYS) {
    if (query[key]) filters[key] = query[key];
  }
  if (query.free === "true") filters.free = "true";
  if (query.no_auth === "true") filters.no_auth = "true";
  return filters;
}

function filterPool(apis, filters, { excludeKey, tokens = [] } = {}) {
  const scoped = { ...filters };
  if (excludeKey) delete scoped[excludeKey];

  let pool = apis.filter((entry) => matchesFilters(entry, scoped));
  if (tokens.length) {
    pool = pool.filter((entry) => scoreEntry(entry, tokens) > 0);
  }
  return pool;
}

/** Facet counts per dimension, ignoring that dimension's active filter so options stay visible. */
export function buildDisjunctiveFacets(apis, query = {}) {
  const tokens = tokenize(query.q);
  const filters = activeFilters(query);

  return {
    category: buildFacets(filterPool(apis, filters, { excludeKey: "category", tokens })).category,
    country: buildFacets(filterPool(apis, filters, { excludeKey: "country", tokens })).country,
    auth: buildFacets(filterPool(apis, filters, { excludeKey: "auth", tokens })).auth,
    pricing: buildFacets(filterPool(apis, filters, { excludeKey: "pricing", tokens })).pricing,
  };
}

export function buildFacets(apis) {
  const facets = { category: {}, country: {}, auth: {}, pricing: {} };
  for (const a of apis) {
    facets.category[a.category] = (facets.category[a.category] || 0) + 1;
    for (const c of a.country || []) {
      facets.country[c] = (facets.country[c] || 0) + 1;
    }
    facets.auth[a.auth] = (facets.auth[a.auth] || 0) + 1;
    facets.pricing[a.pricing] = (facets.pricing[a.pricing] || 0) + 1;
  }
  return facets;
}

export function searchApis(apis, query = {}) {
  const tokens = tokenize(query.q);
  const filters = activeFilters(query);
  let results = filterPool(apis, filters, { tokens });

  if (tokens.length) {
    results = results
      .map((entry) => ({ entry, score: scoreEntry(entry, tokens) }))
      .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
      .map(({ entry }) => entry);
  } else {
    results = [...results].sort((a, b) => a.title.localeCompare(b.title));
  }

  const total = results.length;
  const catalogueTotal = filterPool(apis, {}, { tokens }).length;
  const limit = Math.min(Number(query.limit) || 200, 200);
  const offset = Number(query.offset) || 0;
  const page = results.slice(offset, offset + limit);

  return {
    query: query.q || null,
    count: page.length,
    total,
    catalogueTotal,
    limit,
    offset,
    next_offset: offset + limit < total ? offset + limit : null,
    facets: buildDisjunctiveFacets(apis, query),
    apis: page.map(publicListEntry),
  };
}

export function publicListEntry(entry) {
  const { endpoint, ...rest } = entry;
  return {
    ...rest,
    serviceSlug: entry.serviceSlug,
    serviceName: entry.serviceName,
    serviceHub: entry.serviceHub,
  };
}

export function publicDetailEntry(entry) {
  const detail = { ...entry };
  if (entry.endpoint && !detail.curl) {
    Object.assign(detail, snippetsFromEndpoint(entry));
  }
  detail.trySpec = buildTrySpec(entry);
  return detail;
}

function snippetsFromEndpoint(entry) {
  const endpoint = entry.endpoint;
  return {
    curl: `curl '${endpoint.replace(/'/g, "\\'")}'`,
    python: `import requests\n\nurl = "${endpoint}"\ndata = requests.get(url).json()\nprint(data)`,
    js: `const res = await fetch("${endpoint}");\nconst data = await res.json();\nconsole.log(data);`,
    prompt: `I'm building an app using the Kazakhstan API "${entry.title}".\n\nProvider: ${entry.provider}\nEndpoint: GET ${endpoint}\n\nHelp me integrate this with error handling, caching, and production safeguards.`,
  };
}

export function listCategories(apis) {
  const map = new Map();
  for (const a of apis) {
    const key = a.category;
    if (!map.has(key)) map.set(key, { category: key, count: 0, group: a.group });
    map.get(key).count += 1;
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

export function freshnessReport(apis, days = 90) {
  const stale = apis.filter((a) => a.freshness?.tone === "stale" || a.tier === "commercial");
  return {
    version: "2026-07-23",
    days,
    total: apis.length,
    stale: stale.length,
    apis: stale.map(publicListEntry),
  };
}
