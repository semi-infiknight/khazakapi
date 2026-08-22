import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CATALOGUE_META, KZ_APIS } from "./data/apis.js";
import {
  freshnessReport,
  listCategories,
  publicDetailEntry,
  publicListEntry,
  searchApis,
} from "./lib/search.js";
import { checkHealth } from "./lib/health.js";
import { openApiToPostman } from "./lib/postman.js";
import { validateDataEgovKey, DATA_EGOV_LINKS } from "./lib/egov.js";
import { proxyRequest, resolveTryRequest } from "./lib/proxy.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8787;
const isProd = process.env.NODE_ENV === "production";

const openApiSpec = JSON.parse(fs.readFileSync(path.join(__dirname, "openapi.json"), "utf8"));

function publicBaseUrl(req) {
  if (process.env.RAILWAY_PUBLIC_DOMAIN) return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  const host = req.get("host");
  return host ? `${req.protocol}://${host}` : `http://localhost:${PORT}`;
}

app.use(express.json());

app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/api/catalogue", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 200, 200);
  const offset = Number(req.query.offset) || 0;
  const apis = KZ_APIS.slice(offset, offset + limit).map(publicListEntry);
  res.json({
    ...CATALOGUE_META,
    count: apis.length,
    apis,
  });
});

app.get("/api/search", (req, res) => {
  res.json(searchApis(KZ_APIS, req.query));
});

app.get("/api/categories", (_req, res) => {
  res.json({ count: listCategories(KZ_APIS).length, categories: listCategories(KZ_APIS) });
});

app.get("/api/freshness", (req, res) => {
  const days = Number(req.query.days) || 90;
  res.json(freshnessReport(KZ_APIS, days));
});

app.get("/api/apis/:id", async (req, res) => {
  const entry = KZ_APIS.find((a) => a.id === req.params.id || a.slug === req.params.id);
  if (!entry) return res.status(404).json({ error: `no API with id '${req.params.id}'` });

  const detail = publicDetailEntry(entry);
  detail.health = await checkHealth(entry);
  res.json(detail);
});

app.post("/api/apis/:id/try", async (req, res) => {
  const entry = KZ_APIS.find((a) => a.id === req.params.id || a.slug === req.params.id);
  if (!entry) return res.status(404).json({ error: `no API with id '${req.params.id}'` });

  const resolved = resolveTryRequest(entry, req.body || {});
  if (resolved.error) return res.status(400).json({ error: resolved.error });

  const response = await proxyRequest(resolved.method, resolved.url, resolved.headers);
  res.json({
    request: {
      method: resolved.method,
      url: resolved.url,
      headers: resolved.headers,
      curl: resolved.curl,
    },
    response,
  });
});

app.options("/api/apis/:id/try", (_req, res) => {
  res.sendStatus(204);
});

app.post("/api/providers/data-egov/validate-key", async (req, res) => {
  const apiKey = req.body?.apiKey;
  const result = await validateDataEgovKey(apiKey);
  if (result.valid) {
    return res.json({ ...result, links: DATA_EGOV_LINKS });
  }
  res.status(400).json({ ...result, links: DATA_EGOV_LINKS });
});

app.options("/api/providers/data-egov/validate-key", (_req, res) => {
  res.sendStatus(204);
});

app.get("/openapi.json", (req, res) => {
  res.json({
    ...openApiSpec,
    info: { ...openApiSpec.info, version: CATALOGUE_META.version },
    servers: [{ url: publicBaseUrl(req), description: isProd ? "Production" : "Current host" }],
  });
});

app.get("/postman.json", (req, res) => {
  const spec = {
    ...openApiSpec,
    info: { ...openApiSpec.info, version: CATALOGUE_META.version },
  };
  const collection = openApiToPostman(spec, publicBaseUrl(req));
  res.setHeader("Content-Disposition", 'attachment; filename="khazakapi.postman_collection.json"');
  res.json(collection);
});

app.get("/api-docs", (_req, res) => {
  res.redirect(301, "/api-docs.html");
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
  res.json({ ok: true, apis: KZ_APIS.length, updated: CATALOGUE_META.updated });
});

const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));

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
  console.log(`Khazak API server on http://localhost:${PORT} (${KZ_APIS.length} KZ APIs)`);
});
