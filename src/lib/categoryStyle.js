const CATEGORY_STYLES = {
  Demography: { bg: "#dbeafe", text: "#1d4ed8" },
  "Financial Markets": { bg: "#dbeafe", text: "#1d4ed8" },
  Finance: { bg: "#dbeafe", text: "#1d4ed8" },
  Banking: { bg: "#dbeafe", text: "#1d4ed8" },
  "Government data": { bg: "#dcfce7", text: "#15803d" },
  "Government services": { bg: "#dcfce7", text: "#15803d" },
  Environment: { bg: "#dcfce7", text: "#15803d" },
  "Environment & climate": { bg: "#dcfce7", text: "#15803d" },
  Health: { bg: "#fce7f3", text: "#be185d" },
  Healthcare: { bg: "#fce7f3", text: "#be185d" },
  "Maps & location": { bg: "#ffedd5", text: "#c2410c" },
  Transport: { bg: "#ffedd5", text: "#c2410c" },
  Transportation: { bg: "#ffedd5", text: "#c2410c" },
  "Travel & mobility": { bg: "#ffedd5", text: "#c2410c" },
  "E-commerce": { bg: "#ede9fe", text: "#6d28d9" },
  Payments: { bg: "#ede9fe", text: "#6d28d9" },
  AI: { bg: "#ede9fe", text: "#6d28d9" },
  Communications: { bg: "#fef9c3", text: "#a16207" },
  Education: { bg: "#fef9c3", text: "#a16207" },
  Crypto: { bg: "#fef3c7", text: "#b45309" },
};

const FALLBACKS = [
  { bg: "#dbeafe", text: "#1d4ed8" },
  { bg: "#ede9fe", text: "#6d28d9" },
  { bg: "#dcfce7", text: "#15803d" },
  { bg: "#ffedd5", text: "#c2410c" },
  { bg: "#fce7f3", text: "#be185d" },
  { bg: "#e0e7ff", text: "#4338ca" },
];

export function categoryStyle(name) {
  if (CATEGORY_STYLES[name]) return CATEGORY_STYLES[name];
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash + name.charCodeAt(i) * (i + 1)) % FALLBACKS.length;
  return FALLBACKS[hash];
}

export function categoryLabel(name) {
  if (!name) return "Data";
  if (name.length <= 14) return name;
  return name.split(/[&/]/)[0].trim().slice(0, 14);
}

export function apiDescription(api) {
  if (api.note) return api.note;
  const auth =
    api.auth === "none" ? "No authentication required." : `${api.auth === "apiKey" ? "API key" : api.auth} required.`;
  return `${api.provider} · ${auth}`;
}

export function providerInitials(provider, source) {
  const text = (provider || source || "API").replace(/[^a-zA-Z0-9\s]/g, " ").trim();
  const parts = text.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return text.slice(0, 2).toUpperCase() || "API";
}

export function logoHue(id = "") {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
}

function relativeUpdated(isoDate) {
  const then = new Date(isoDate);
  if (Number.isNaN(then.getTime())) return null;

  const days = Math.floor((Date.now() - then.getTime()) / 86400000);
  if (days < 1) return "Updated today";
  if (days === 1) return "Updated yesterday";
  if (days < 30) return `Updated ${days} days ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `Updated ${months} month${months === 1 ? "" : "s"} ago`;

  const years = Math.floor(months / 12);
  return `Updated ${years} year${years === 1 ? "" : "s"} ago`;
}

export function updatedLabel(freshness, lastChecked) {
  const relative = lastChecked ? relativeUpdated(lastChecked) : null;
  if (relative) return relative;

  if (!freshness?.label) return "In catalogue";
  const label = freshness.label;
  if (/^SEE DOCS$/i.test(label)) return null;
  if (/^CURRENT/i.test(label)) {
    const year = label.match(/\d{4}/)?.[0];
    return year ? `Updated ${year}` : "Updated recently";
  }
  if (freshness.tone === "stale") return "May need review";
  return label.replace(/^CURRENT\s·\s*/i, "Updated ");
}

export function cardMetricAuth(api) {
  if (api.auth === "none") return "Keyless";
  if (api.auth === "apiKey") return "API key";
  if (api.auth === "oauth") return "OAuth";
  if (api.auth === "token") return "Token";
  return api.trust?.authLabel || api.auth || "Auth";
}

export function cardMetricReady(api) {
  if (api.copyable) return "Copy-paste";
  if (api.trust?.label === "Copy-paste ready") return "Copy-paste";
  return "Setup";
}
