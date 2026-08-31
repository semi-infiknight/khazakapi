export function shortApiLabel(title = "") {
  const base = title.split("~")[0].trim();
  return base.length > 26 ? `${base.slice(0, 24)}…` : base || "API";
}

export function mermaidSafeId(value) {
  const id = String(value || "n")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return id || "n";
}

function escapeMermaidLabel(text) {
  return String(text || "")
    .replace(/"/g, "'")
    .replace(/[\[\]]/g, "")
    .replace(/\n/g, " ");
}

export function featureBlocks(suggestion) {
  return suggestion?.features?.length ? suggestion.features : suggestion?.intents || [];
}

/** Build a stack flowchart from matched features (TB on mobile, LR on desktop). */
export function buildStackMermaid(suggestion, { direction = "LR" } = {}) {
  const blocks = featureBlocks(suggestion);
  if (!blocks.length) return "";

  const flow = direction === "TB" ? "flowchart TB" : "flowchart LR";
  const lines = [
    flow,
    '  App["Your product"]',
    "  classDef app fill:#1a1030,stroke:#9c88fa,color:#f4f0ff,stroke-width:1.5px",
    "  classDef layer fill:#12101c,stroke:#5b4d8a,color:#e8e4f5,stroke-width:1px",
    "  classDef api fill:#0d1520,stroke:#3d5a80,color:#dce8f5,stroke-width:1px",
    "  class App app",
  ];

  blocks.forEach((block, index) => {
    const layerId = `F_${mermaidSafeId(block.id)}`;
    const layerLabel = escapeMermaidLabel(block.label);
    lines.push(`  ${layerId}["${layerLabel}"]`);
    lines.push(`  class ${layerId} layer`);
    lines.push(`  App --> ${layerId}`);

    block.apis.slice(0, 4).forEach((api) => {
      const apiId = `A_${mermaidSafeId(api.id)}_${index}`;
      const apiLabel = escapeMermaidLabel(shortApiLabel(api.title));
      lines.push(`  ${apiId}["${apiLabel}"]`);
      lines.push(`  class ${apiId} api`);
      lines.push(`  ${layerId} --> ${apiId}`);
    });
  });

  return lines.join("\n");
}

export const INTENT_VIEW_MODES = [
  { id: "timeline", label: "Timeline", hint: "Diagram + numbered steps" },
  { id: "flows", label: "Flows", hint: "Postman-style canvas" },
  { id: "stack", label: "Stack", hint: "Zapier-style flow" },
];

export const INTENT_VIEW_STORAGE_KEY = "khazak-intent-view";

export function readStoredIntentView() {
  if (typeof window === "undefined") return "timeline";
  const stored = window.localStorage.getItem(INTENT_VIEW_STORAGE_KEY);
  return INTENT_VIEW_MODES.some((m) => m.id === stored) ? stored : "timeline";
}

export function apiHref(api) {
  return (
    api.plugIn?.href ||
    api.hubPath ||
    (api.companyHub && api.categorySlug && api.companySlug
      ? `/browse/${api.categorySlug}/${api.companySlug}/${api.slug || api.id}`
      : `/apis/${api.slug || api.id}`)
  );
}
