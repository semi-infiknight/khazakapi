const MAX_BODY = 256 * 1024;
const TIMEOUT_MS = 8000;

export function resolveTryUrl(entry, requestedUrl, apiKey) {
  const base = entry.endpoint;
  if (!base) return { error: "This catalogue entry has no testable endpoint." };

  const url = (requestedUrl || base).trim();
  if (!url) return { error: "URL is required." };

  let baseParsed;
  let urlParsed;
  try {
    baseParsed = new URL(base);
    urlParsed = new URL(url);
  } catch {
    return { error: "Invalid URL." };
  }

  if (urlParsed.protocol !== "https:" && urlParsed.protocol !== "http:") {
    return { error: "Only http(s) URLs are allowed." };
  }

  if (urlParsed.host !== baseParsed.host) {
    return { error: "URL must stay on the same host as the catalogue entry." };
  }

  let finalUrl = url;
  if (apiKey) {
    finalUrl = finalUrl.replace(/YOUR_KEY/g, encodeURIComponent(apiKey));
  }

  if (finalUrl.includes("YOUR_KEY")) {
    return { error: "Replace YOUR_KEY with your API key before sending." };
  }

  return { url: finalUrl };
}

export async function proxyRequest(url) {
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json, text/plain, */*" },
      redirect: "follow",
    });

    const contentType = response.headers.get("content-type") || "";
    const buffer = await response.arrayBuffer();
    clearTimeout(timer);

    const truncated = buffer.byteLength > MAX_BODY;
    const slice = truncated ? buffer.slice(0, MAX_BODY) : buffer;
    const text = new TextDecoder().decode(slice);

    let body = text;
    let parsed = null;
    if (contentType.includes("json") || text.trim().startsWith("{") || text.trim().startsWith("[")) {
      try {
        parsed = JSON.parse(text);
        body = JSON.stringify(parsed, null, 2);
      } catch {
        // keep raw text
      }
    } else if (text.length > 4000) {
      body = `${text.slice(0, 4000)}\n\n… (${text.length.toLocaleString()} chars total, showing first 4,000)`;
    }

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      ms: Date.now() - start,
      contentType,
      body,
      parsed,
      truncated,
      size: buffer.byteLength,
      checkedAt: new Date().toISOString(),
    };
  } catch (err) {
    clearTimeout(timer);
    const aborted = err.name === "AbortError";
    return {
      ok: false,
      status: 0,
      statusText: aborted ? "Timeout" : "Network error",
      ms: Date.now() - start,
      contentType: null,
      body: aborted ? `Request timed out after ${TIMEOUT_MS / 1000}s.` : String(err.message || err),
      parsed: null,
      truncated: false,
      size: 0,
      checkedAt: new Date().toISOString(),
    };
  }
}
