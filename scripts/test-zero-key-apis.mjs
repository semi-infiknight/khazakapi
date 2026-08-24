import { KZ_APIS } from "../server/data/apis.js";
import { resolveTryRequest, proxyRequest } from "../server/lib/proxy.js";

const CONCURRENCY = 8;
const targets = KZ_APIS.filter((a) => a.auth === "none" && a.copyable);

function classify(result) {
  if (result?.error) return { outcome: "build_error", detail: result.error };

  const status = result?.status ?? 0;
  const body = (result?.rawBody || result?.body || "").trim();

  if (!status) return { outcome: "network", detail: result?.statusText || "Network error" };
  if (status >= 400) return { outcome: "http_error", detail: `HTTP ${status}` };

  if (result?.format === "json" || body.startsWith("{") || body.startsWith("[")) {
    try {
      JSON.parse(body);
      return { outcome: "live_json", detail: `HTTP ${status}` };
    } catch {
      /* fall through */
    }
  }

  if (body.startsWith("<?xml") || body.startsWith("<rss") || body.startsWith("<feed")) {
    return { outcome: "live_xml", detail: `HTTP ${status}` };
  }

  if (body.startsWith("<!") || result?.format === "html") {
    return { outcome: "html_shell", detail: `HTTP ${status} — HTML page, not data` };
  }

  if (status >= 200 && status < 400) {
    return { outcome: "reachable", detail: `HTTP ${status} ${result?.format || "text"}` };
  }

  return { outcome: "unknown", detail: `HTTP ${status}` };
}

async function testOne(api) {
  const started = Date.now();
  const req = resolveTryRequest(api, {
    headers: { Accept: "application/json, text/plain, application/xml, */*" },
  });
  if (req.error) {
    return {
      id: api.id,
      title: api.title,
      provider: api.provider,
      category: api.category,
      ms: Date.now() - started,
      ...classify({ error: req.error }),
    };
  }

  const result = await proxyRequest("GET", req.url, req.headers);
  const bucket = classify(result);
  return {
    id: api.id,
    title: api.title,
    provider: api.provider,
    category: api.category,
    endpoint: req.url.slice(0, 140),
    ms: result.ms ?? Date.now() - started,
    status: result.status,
    ...bucket,
  };
}

async function runPool(items, worker, limit) {
  const results = new Array(items.length);
  let index = 0;

  async function next() {
    while (index < items.length) {
      const i = index++;
      results[i] = await worker(items[i]);
      if ((i + 1) % 30 === 0 || i + 1 === items.length) {
        process.stderr.write(`\rTested ${i + 1}/${items.length}…`);
      }
    }
  }

  await Promise.all(Array.from({ length: limit }, next));
  process.stderr.write("\n");
  return results;
}

console.error(`Testing ${targets.length} zero-key APIs…`);
const results = await runPool(targets, testOne, CONCURRENCY);

const summary = {};
for (const r of results) summary[r.outcome] = (summary[r.outcome] || 0) + 1;

const byProvider = {};
for (const r of results) {
  if (!byProvider[r.provider]) byProvider[r.provider] = {};
  byProvider[r.provider][r.outcome] = (byProvider[r.provider][r.outcome] || 0) + 1;
}

const usable = results.filter((r) => r.outcome === "live_json" || r.outcome === "live_xml");
const broken = results.filter((r) => ["html_shell", "http_error", "network", "build_error"].includes(r.outcome));

console.log(
  JSON.stringify(
    {
      total: targets.length,
      summary,
      usable: usable.length,
      broken: broken.length,
      byProvider,
      usableSamples: usable.slice(0, 12).map((r) => ({ title: r.title, provider: r.provider, outcome: r.outcome, ms: r.ms })),
      htmlShell: broken.filter((r) => r.outcome === "html_shell").slice(0, 8).map((r) => ({ title: r.title, provider: r.provider })),
      httpErrors: broken.filter((r) => r.outcome === "http_error"),
      networkErrors: broken.filter((r) => r.outcome === "network"),
      avgMs: Math.round(results.reduce((s, r) => s + r.ms, 0) / results.length),
    },
    null,
    2
  )
);
