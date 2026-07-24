import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { APIS, CATALOGUE_META } from "./data/apis.js";
import {
  freshnessReport,
  listCategories,
  publicDetailEntry,
  publicListEntry,
  searchApis,
} from "./lib/search.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8787;
const isProd = process.env.NODE_ENV === "production";

app.use(express.json());

app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/api/catalogue", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 200, 200);
  const offset = Number(req.query.offset) || 0;
  const apis = APIS.slice(offset, offset + limit).map(publicListEntry);
  res.json({
    ...CATALOGUE_META,
    count: apis.length,
    apis,
  });
});

app.get("/api/search", (req, res) => {
  res.json(searchApis(APIS, req.query));
});

app.get("/api/categories", (_req, res) => {
  res.json({ count: listCategories(APIS).length, categories: listCategories(APIS) });
});

app.get("/api/freshness", (req, res) => {
  const days = Number(req.query.days) || 90;
  res.json(freshnessReport(APIS, days));
});

app.get("/api/apis/:id", async (req, res) => {
  const entry = APIS.find((a) => a.id === req.params.id || a.slug === req.params.id);
  if (!entry) return res.status(404).json({ error: `no API with id '${req.params.id}'` });

  const detail = publicDetailEntry(entry);
  detail.health = await checkHealth(entry);
  res.json(detail);
});

async function checkHealth(entry) {
  if (!entry.endpoint || entry.auth !== "none" || entry.copyable === false) {
    return { ok: null, status: null, ms: null, checkedAt: new Date().toISOString(), skipped: true };
  }
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(entry.endpoint, {
      signal: controller.signal,
      headers: { Accept: "*/*" },
    });
    clearTimeout(timer);
    return {
      ok: response.ok,
      status: response.status,
      ms: Date.now() - start,
      checkedAt: new Date().toISOString(),
    };
  } catch {
    return {
      ok: false,
      status: 0,
      ms: Date.now() - start,
      checkedAt: new Date().toISOString(),
    };
  }
}

app.get("/openapi.json", (_req, res) => {
  res.json({
    openapi: "3.1.0",
    info: {
      title: "Khazak API",
      version: CATALOGUE_META.version,
      description: "Public REST API for the Khazak API Kazakhstan API directory.",
    },
    servers: [{ url: process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : `http://localhost:${PORT}` }],
    paths: {
      "/api/catalogue": { get: { summary: "Full catalogue" } },
      "/api/search": { get: { summary: "Search with facets" } },
      "/api/apis/{id}": { get: { summary: "Single API detail" } },
      "/api/categories": { get: { summary: "Category list" } },
      "/api/freshness": { get: { summary: "Stale entries" } },
    },
  });
});

// MCP stub — documents-compatible response
app.get("/mcp", (_req, res) => {
  res.json({
    name: "khazak-api",
    version: "1.0.0",
    description: "Remote MCP server for Kazakhstan APIs (Streamable HTTP stub for local dev).",
    tools: [
      { name: "search_kz_apis", description: "Search Khazak API catalogue" },
      { name: "get_kz_api", description: "Get one API by id" },
      { name: "list_api_categories", description: "List categories with counts" },
    ],
    url: "/mcp",
  });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, apis: APIS.length, updated: CATALOGUE_META.updated });
});

if (isProd) {
  const dist = path.join(__dirname, "..", "dist");
  app.use(express.static(dist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(dist, "index.html"));
  });
}

app.use((_req, res) => {
  res.status(404).json({
    error: "not found",
    endpoints: ["/api/catalogue", "/api/search", "/api/categories", "/api/apis/:id", "/api/freshness"],
  });
});

app.listen(PORT, () => {
  console.log(`Khazak API server on http://localhost:${PORT} (${APIS.length} APIs)`);
});
