/** Build a single-request Postman Collection v2.1 for import into Postman or Insomnia. */
export function buildPostmanCollection(api, spec, previewUrl, headers = {}) {
  const method = (spec?.method || "GET").toUpperCase();
  let parsed;
  try {
    parsed = new URL(previewUrl);
  } catch {
    parsed = null;
  }

  const headerRows = Object.entries(headers || {}).map(([key, value]) => ({
    key,
    value: String(value),
    type: "text",
  }));

  if (!headerRows.length) {
    headerRows.push({ key: "Accept", value: "application/json", type: "text" });
  }

  return {
    info: {
      name: api.title || api.id,
      description: api.note || api.description || "",
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      _postman_id: `qazaq-${api.id}`,
    },
    item: [
      {
        name: api.title || api.id,
        request: {
          method,
          header: headerRows,
          url: parsed
            ? {
                raw: previewUrl,
                protocol: parsed.protocol.replace(":", ""),
                host: parsed.hostname.split("."),
                path: parsed.pathname.split("/").filter(Boolean),
                query: [...parsed.searchParams.entries()].map(([key, value]) => ({
                  key,
                  value,
                })),
              }
            : previewUrl,
          description: api.note || api.description || "",
        },
        response: [],
      },
    ],
  };
}

export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function postmanImportUrl(collectionUrl) {
  return `https://www.postman.com/import/?url=${encodeURIComponent(collectionUrl)}`;
}
