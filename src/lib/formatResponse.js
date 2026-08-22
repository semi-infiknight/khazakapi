export function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024;
    return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDuration(ms) {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export function statusLabel(status, statusText) {
  if (!status) return statusText || "No response";
  return `${status} ${statusText || ""}`.trim();
}

export function statusClass(status, ok) {
  if (!status) return "http-status-neutral";
  if (ok) return "http-status-ok";
  if (status >= 500) return "http-status-error";
  if (status >= 400) return "http-status-client";
  return "http-status-info";
}

export function bodyViewOptions(format, parsed) {
  const options = [{ id: "pretty", label: "Pretty" }];
  options.push({ id: "raw", label: "Raw" });
  if (format === "html") options.push({ id: "preview", label: "Preview" });
  if (format === "xml") options.push({ id: "preview", label: "Preview" });
  return options;
}

export function parseSetCookie(headers = {}) {
  const raw = headers["set-cookie"] || headers["Set-Cookie"];
  if (!raw) return [];
  const lines = Array.isArray(raw) ? raw : [raw];
  return lines.map((line) => {
    const [pair, ...attrs] = line.split(";").map((s) => s.trim());
    const eq = pair.indexOf("=");
    const name = eq >= 0 ? pair.slice(0, eq) : pair;
    const value = eq >= 0 ? pair.slice(eq + 1) : "";
    const attributes = {};
    for (const attr of attrs) {
      const idx = attr.indexOf("=");
      if (idx >= 0) attributes[attr.slice(0, idx).toLowerCase()] = attr.slice(idx + 1);
      else attributes[attr.toLowerCase()] = true;
    }
    return { name, value, attributes, raw: line };
  });
}

export function filterJsonTree(node, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  try {
    return JSON.stringify(node).toLowerCase().includes(q);
  } catch {
    return String(node).toLowerCase().includes(q);
  }
}
