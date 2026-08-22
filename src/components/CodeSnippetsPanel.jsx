import { useEffect, useMemo, useState } from "react";

const LANGUAGES = [
  { id: "curl", label: "cURL" },
  { id: "js", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "prompt", label: "AI prompt" },
];

export default function CodeSnippetsPanel({ api }) {
  const snippets = useMemo(() => {
    const map = {};
    if (api.curl) map.curl = api.curl;
    if (api.js) map.js = api.js;
    if (api.python) map.python = api.python;
    if (api.prompt) map.prompt = api.prompt;
    return map;
  }, [api]);

  const options = useMemo(
    () => LANGUAGES.filter((lang) => snippets[lang.id]),
    [snippets]
  );

  const [lang, setLang] = useState(options[0]?.id || "curl");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLang(options[0]?.id || "curl");
    setCopied(false);
  }, [api.id, options]);

  const active = options.find((opt) => opt.id === lang) || options[0];
  const code = active ? snippets[active.id] : "";

  if (!options.length) return null;

  const copy = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="snippet-panel mt-6">
      <div className="snippet-toolbar">
        <p className="snippet-title">{api.title}</p>
        <div className="snippet-actions">
          <label className="snippet-select-wrap">
            <span className="sr-only">Code language</span>
            <select
              className="snippet-select"
              value={active?.id || lang}
              onChange={(e) => setLang(e.target.value)}
            >
              {options.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="snippet-copy" onClick={copy} aria-label="Copy code">
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      <pre className="snippet-code">
        <code>{code}</code>
      </pre>
    </div>
  );
}
