/**
 * Grounded API doc Q&A — templates first, then local SmolLM on catalogue facts only.
 */

import { generateFromMessages, isLocalLlmEnabled } from "./localLlm.js";

function lines(...parts) {
  return parts.filter(Boolean).join("\n");
}

export function buildApiContext(api) {
  const trySpec = api.trySpec;
  const setup = api.setup;
  const chunks = [
    `Title: ${api.title}`,
    `Provider: ${api.provider}`,
    `Category: ${api.category}`,
    `Auth: ${api.auth}`,
    api.pricing ? `Pricing: ${api.pricing}` : null,
    api.note ? `Description: ${api.note}` : null,
    setup?.summary ? `Setup: ${setup.summary}` : null,
  ];

  if (setup?.sections?.length) {
    for (const section of setup.sections) {
      chunks.push(`${section.title}: ${(section.items || []).join(" ")}`);
    }
  }

  if (trySpec?.available) {
    chunks.push(`HTTP: ${trySpec.method} ${trySpec.baseUrl}${trySpec.path}`);
    if (trySpec.auth) {
      chunks.push(
        `Auth detail: ${trySpec.auth.label} (${trySpec.auth.scheme || api.auth}), placement: ${trySpec.auth.placement || "see docs"}`,
      );
    }
    for (const param of trySpec.parameters || []) {
      chunks.push(
        `Parameter ${param.name}${param.required ? " (required)" : ""}: ${param.description}${param.example ? ` — example: ${param.example}` : ""}`,
      );
    }
    for (const note of trySpec.notes || []) chunks.push(`Try note: ${note}`);
  } else if (trySpec?.reason) {
    chunks.push(`Endpoint: ${trySpec.reason}`);
  }

  if (api.endpoint) chunks.push(`Sample URL: ${api.endpoint}`);
  if (api.docs) chunks.push(`Official docs: ${api.docs}`);
  if (api.trust?.caveat) chunks.push(`Caveat: ${api.trust.caveat}`);

  return chunks.filter(Boolean).join("\n");
}

export function answerFromTemplates(question, api) {
  const q = String(question || "").toLowerCase();
  const trySpec = api.trySpec;
  const setup = api.setup;

  if (/auth|api key|apikey|oauth|token|authenticate|credential|bearer/.test(q)) {
    if (trySpec?.auth) {
      return {
        answer: lines(
          `${trySpec.auth.label} is required for this API (${trySpec.auth.scheme || api.auth}).`,
          trySpec.auth.placement ? `Credential placement: ${trySpec.auth.placement}.` : null,
          setup?.summary || null,
          api.docs ? "Use the provider docs link below for registration steps." : null,
        ),
        source: "template",
      };
    }
    if (api.auth === "none") {
      return {
        answer: "No API key or OAuth is required — call this endpoint directly from your backend.",
        source: "template",
      };
    }
    return {
      answer: `This API uses ${api.auth}. Check the setup section and provider docs for credential details.`,
      source: "template",
    };
  }

  if (/param|query|parameter|request|url|endpoint|call|how do i (hit|call)/.test(q)) {
    if (!trySpec?.available) {
      return {
        answer: trySpec?.reason || "This catalogue entry has no live sample endpoint to test.",
        source: "template",
      };
    }
    const paramLines = (trySpec.parameters || []).map(
      (p) =>
        `• ${p.name}${p.required ? " (required)" : ""}: ${p.description}${p.example ? ` — e.g. ${p.example}` : ""}`,
    );
    return {
      answer: lines(
        `Call ${trySpec.method} ${trySpec.baseUrl}${trySpec.path}`,
        paramLines.length ? "Query parameters from the catalogue sample:\n" + paramLines.join("\n") : "No query params in the sample URL.",
        trySpec.notes?.length ? trySpec.notes.join(" ") : null,
      ),
      source: "template",
    };
  }

  if (/setup|start|get started|register|how (do|to) (i|we) (use|integrate)/.test(q) && setup) {
    const steps = (setup.sections || []).flatMap((s) => s.items || []).slice(0, 4);
    return {
      answer: lines(setup.summary, steps.length ? steps.join(" ") : null),
      source: "template",
    };
  }

  if (/what is|what does|used for|purpose|about this/.test(q) && api.note) {
    return { answer: api.note, source: "template" };
  }

  return null;
}

/**
 * @param {object} api — publicDetailEntry shape
 * @param {string} question
 */
export async function answerApiQuestion(api, question) {
  const q = String(question || "").trim();
  if (!q) {
    return { answer: "Ask a question about authentication, parameters, or how to get started.", source: "template" };
  }

  const templated = answerFromTemplates(q, api);
  if (templated) return { ...templated, docs: api.docs || null };

  if (!isLocalLlmEnabled()) {
    return {
      answer:
        "I can answer auth, parameters, setup, and overview questions from the catalogue. For anything else, open Provider docs ↗.",
      source: "template",
      docs: api.docs || null,
    };
  }

  const context = buildApiContext(api);
  const llm = await generateFromMessages(
    [
      {
        role: "system",
        content:
          "You are KazakhAPI doc assistant. Answer ONLY using the API facts provided. If the facts do not contain the answer, say you do not have that detail in the catalogue and point to official docs. Max 3 short sentences. Plain English. Do not invent parameters or URLs.",
      },
      {
        role: "user",
        content: `API facts:\n${context}\n\nQuestion: ${q}`,
      },
    ],
    { maxNewTokens: 90 },
  );

  if (llm?.text) {
    return { answer: llm.text, source: "llm", docs: api.docs || null };
  }

  return {
    answer:
      "I couldn't generate an answer — try asking about auth, query parameters, or setup steps, or open Provider docs ↗.",
    source: "template",
    docs: api.docs || null,
  };
}
