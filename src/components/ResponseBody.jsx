import { useMemo, useState } from "react";

function JsonScalar({ value }) {
  if (value === null) return <span className="json-null">null</span>;
  if (typeof value === "boolean") return <span className="json-bool">{String(value)}</span>;
  if (typeof value === "number") return <span className="json-num">{value}</span>;
  return <span className="json-str">&quot;{value}&quot;</span>;
}

function JsonNode({ name, value, depth = 0, defaultOpen = true, search = "" }) {
  const [open, setOpen] = useState(defaultOpen && depth < 2);
  const isArray = Array.isArray(value);
  const isObject = value && typeof value === "object" && !isArray;
  const entries = isArray ? value.map((v, i) => [String(i), v]) : isObject ? Object.entries(value) : [];

  const visibleEntries = useMemo(() => {
    if (!search) return entries;
    const q = search.toLowerCase();
    return entries.filter(([k, v]) => {
      if (k.toLowerCase().includes(q)) return true;
      if (v == null) return String(v).includes(q);
      if (typeof v !== "object") return String(v).toLowerCase().includes(q);
      try {
        return JSON.stringify(v).toLowerCase().includes(q);
      } catch {
        return false;
      }
    });
  }, [entries, search]);

  if (!isArray && !isObject) {
    return (
      <div className="json-row" style={{ paddingLeft: depth * 16 }}>
        {name != null && (
          <>
            <span className="json-key">&quot;{name}&quot;</span>
            <span className="json-punct">: </span>
          </>
        )}
        <JsonScalar value={value} />
      </div>
    );
  }

  const sizeLabel = isArray ? `[${value.length}]` : `{${Object.keys(value).length}}`;
  const preview = isArray
    ? `[${value.length} item${value.length === 1 ? "" : "s"}]`
    : `{${Object.keys(value).length} key${Object.keys(value).length === 1 ? "" : "s"}}`;

  return (
    <div className="json-branch">
      <button
        type="button"
        className="json-row json-toggle"
        style={{ paddingLeft: depth * 16 }}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="json-chevron">{open ? "▾" : "▸"}</span>
        {name != null && (
          <>
            <span className="json-key">&quot;{name}&quot;</span>
            <span className="json-punct">: </span>
          </>
        )}
        <span className="json-meta">{open ? sizeLabel : preview}</span>
      </button>
      {open && (
        <div className="json-children">
          {(search ? visibleEntries : entries).map(([k, v]) => (
            <JsonNode key={`${depth}-${k}`} name={k} value={v} depth={depth + 1} search={search} />
          ))}
          {search && visibleEntries.length === 0 && (
            <div className="json-row json-empty" style={{ paddingLeft: (depth + 1) * 16 }}>
              No matches in this branch
            </div>
          )}
          <div className="json-row json-punct" style={{ paddingLeft: depth * 16 }}>
            {isArray ? "]" : "}"}
          </div>
        </div>
      )}
    </div>
  );
}

export function JsonTree({ parsed, search = "" }) {
  if (parsed == null) {
    return <p className="http-empty-note">No JSON to explore in tree view.</p>;
  }
  return (
    <div className="json-tree">
      <JsonNode value={parsed} depth={0} name={null} search={search} />
    </div>
  );
}

function highlightJson(text) {
  const escaped = String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return escaped.replace(
    /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g,
    (match, str, colon, keyword) => {
      if (keyword) {
        const cls = keyword === "null" ? "json-null" : "json-bool";
        return `<span class="${cls}">${keyword}</span>`;
      }
      if (colon) return `<span class="json-key">${str}</span><span class="json-punct">:</span>`;
      if (/^"/.test(match)) return `<span class="json-str">${match}</span>`;
      return `<span class="json-num">${match}</span>`;
    }
  );
}

export function HighlightedCode({ text, language = "text" }) {
  const content = text || "(empty body)";
  if (language === "json") {
    return (
      <pre className="response-raw">
        <code dangerouslySetInnerHTML={{ __html: highlightJson(content) }} />
      </pre>
    );
  }
  return (
    <pre className="response-raw">
      <code>{content}</code>
    </pre>
  );
}

export function RawCode({ text }) {
  return (
    <pre className="response-raw">
      <code>{text || "(empty body)"}</code>
    </pre>
  );
}

export default function ResponseBody({ response, bodyMode, search = "" }) {
  const raw = response.rawBody ?? response.body ?? "";
  const formatted = response.body ?? raw;
  const format = response.format || "text";

  if (bodyMode === "raw") {
    return <RawCode text={raw} />;
  }

  if (bodyMode === "preview") {
    if (format === "html") {
      return (
        <iframe
          title="HTML preview"
          className="http-html-preview"
          sandbox=""
          srcDoc={raw}
        />
      );
    }
    if (format === "json" && response.parsed != null) {
      return <JsonTree parsed={response.parsed} search={search} />;
    }
    return <HighlightedCode text={formatted} language={format === "json" ? "json" : "text"} />;
  }

  // Pretty — Postman-style formatted view (syntax highlighted flat text)
  if (format === "json") {
    return <HighlightedCode text={formatted} language="json" />;
  }

  return <HighlightedCode text={formatted} language="text" />;
}
