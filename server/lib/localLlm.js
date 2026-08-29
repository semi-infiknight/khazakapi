/**
 * Tiny local LLM for grounded suggest summaries — no external API, no rate limits.
 * Uses SmolLM2-135M-Instruct (~400–500 MB RAM, q4).
 */

import { pipeline, env } from "@huggingface/transformers";

export const LLM_MODEL = "onnx-community/SmolLM2-135M-Instruct-ONNX-MHA";

env.cacheDir = process.env.TRANSFORMERS_CACHE || "./.cache/transformers";
env.allowLocalModels = true;

const LLM_TIMEOUT_MS = Number(process.env.LOCAL_LLM_TIMEOUT_MS || 12000);
const MAX_NEW_TOKENS = Number(process.env.LOCAL_LLM_MAX_TOKENS || 110);

let generatorPromise = null;

export function isLocalLlmEnabled() {
  const flag = String(process.env.LOCAL_LLM ?? "1").toLowerCase();
  return flag !== "0" && flag !== "false" && flag !== "off";
}

async function getGenerator() {
  if (!generatorPromise) {
    generatorPromise = pipeline("text-generation", LLM_MODEL, {
      dtype: "q4",
      device: "cpu",
    }).catch((err) => {
      generatorPromise = null;
      throw err;
    });
  }
  return generatorPromise;
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("local LLM timeout")), ms);
    }),
  ]);
}

function shortTitle(title = "") {
  return String(title).split("~")[0].trim().slice(0, 72);
}

function buildFitPrompt(query, intentBlocks) {
  const layers = intentBlocks
    .slice(0, 4)
    .map((block) => {
      const apis = block.apis
        .slice(0, 4)
        .map((api) => `${shortTitle(api.title)} (${block.label.toLowerCase()})`)
        .join("; ");
      return `- ${block.label}: ${block.where} APIs: ${apis}`;
    })
    .join("\n");

  return [
    `Product idea: "${query}"`,
    "",
    "Matched Kazakhstan API stack (use ONLY these — do not invent others):",
    layers,
    "",
    "Write 2-3 short sentences in plain prose (no lists, no dashes) explaining where these APIs plug into the product.",
  ].join("\n");
}

function buildNoFitPrompt(query, bestScore) {
  return [
    `Product idea: "${query}"`,
    `Best catalogue similarity: ${Number(bestScore || 0).toFixed(2)} (too low — no good fit).`,
    "",
    "Write 2 short sentences in plain prose (no lists). Say this catalogue has no good match for the idea, then mention it covers KZ payments, maps, delivery, banking, travel, weather, telecom, and government open data. Do not name specific APIs.",
  ].join("\n");
}

function extractReply(output) {
  const row = output?.[0];
  if (!row) return "";

  const chat = row.generated_text;
  if (Array.isArray(chat)) {
    const last = chat.at(-1);
    if (last?.role === "assistant" && last.content) return String(last.content).trim();
    const assistant = [...chat].reverse().find((m) => m.role === "assistant" && m.content);
    if (assistant?.content) return String(assistant.content).trim();
  }

  if (typeof row.generated_text === "string") {
    return row.generated_text.trim();
  }

  return "";
}

function cleanSummary(text) {
  let t = String(text || "")
    .replace(/^assistant:\s*/i, "")
    .trim();

  if (/^\s*-\s/m.test(t)) {
    t = t
      .split(/\n+/)
      .map((line) => line.replace(/^\s*[-*]\s*/, "").trim())
      .filter(Boolean)
      .join(" ");
  }

  t = t.replace(/\s+/g, " ").trim();
  if (t.length > 420) t = `${t.slice(0, 417).trim()}…`;
  return t;
}

/**
 * @param {{ query: string, fit: boolean, intentBlocks?: object[], bestScore?: number }} ctx
 * @returns {Promise<{ text: string, source: 'llm'|'template' }|null>}
 */
export async function generateSuggestSummary(ctx) {
  if (!isLocalLlmEnabled()) return null;

  const { query, fit, intentBlocks = [], bestScore = 0 } = ctx;
  const userContent = fit ? buildFitPrompt(query, intentBlocks) : buildNoFitPrompt(query, bestScore);

  const messages = [
    {
      role: "system",
      content:
        "You are KhazakAPI, a concise assistant for Kazakhstan developer APIs. Answer in English. Be brief and practical. Never invent API names not provided in the prompt.",
    },
    { role: "user", content: userContent },
  ];

  try {
    const generator = await getGenerator();
    const output = await withTimeout(
      generator(messages, {
        max_new_tokens: MAX_NEW_TOKENS,
        do_sample: false,
        return_full_text: false,
      }),
      LLM_TIMEOUT_MS,
    );

    const text = cleanSummary(extractReply(output));
    if (text.length < 20) return null;
    return { text, source: "llm" };
  } catch (err) {
    console.warn("[localLlm]", err.message || err);
    return null;
  }
}

/** Warm model in background after server boot. */
export function warmLocalLlm() {
  if (!isLocalLlmEnabled()) return;
  getGenerator().catch(() => {});
}
