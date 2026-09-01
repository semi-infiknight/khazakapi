export function openApiToPostman(spec, baseUrl) {
  const items = [];

  for (const [path, methods] of Object.entries(spec.paths || {})) {
    for (const [method, op] of Object.entries(methods)) {
      if (method === "parameters") continue;

      const samplePath = path.replace(/\{([^}]+)\}/g, (_, name) => {
        const param = op.parameters?.find((p) => p.name === name && p.in === "path");
        return param?.example || param?.schema?.example || name;
      });

      const query = [];
      for (const param of op.parameters || []) {
        if (param.in !== "query") continue;
        query.push({
          key: param.name,
          value: String(param.example ?? param.schema?.default ?? ""),
          description: param.description,
          disabled: !param.required,
        });
      }

      const url = `${baseUrl.replace(/\/$/, "")}${samplePath}`;
      const parsed = new URL(url);

      items.push({
        name: op.summary || `${method.toUpperCase()} ${path}`,
        request: {
          method: method.toUpperCase(),
          header: [{ key: "Accept", value: "application/json" }],
          url: {
            raw: url,
            protocol: parsed.protocol.replace(":", ""),
            host: parsed.hostname.split("."),
            path: parsed.pathname.split("/").filter(Boolean),
            query: query.length ? query : undefined,
          },
          description: op.description || spec.info?.description,
        },
        response: [],
      });
    }
  }

  return {
    info: {
      name: spec.info?.title || "API",
      description: spec.info?.description,
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      _postman_id: "qazaq-stack-collection",
    },
    item: items,
  };
}
