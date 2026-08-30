/**
 * Tiny local LLM for grounded API Q&A — no external API, no rate limits.
 * Uses SmolLM2-135M-Instruct (~400–500 MB RAM, q4).
 */

import { pipeline, env } from "@huggingface/transformers";

export const LLM_MODEL = "onnx-community/SmolLM2-135M-Instruct-ONNX-MHA";

env.cacheDir = process.env.TRANSFORMERS_CACHE || "./.cache/transformers";
env.allowLocalModels = true;

const LLM_TIMEOUT_MS = Number(process.env.LOCAL_LLM_TIMEOUT_MS || 12000);

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

function cleanAnswer(text, maxLen = 480) {
  let t = String(text || "")
    .replace(/^assistant:\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (t.length > maxLen) t = `${t.slice(0, maxLen - 1).trim()}…`;
  return t;
}

/**
 * @param {import('../tokenization_utils.js').Message[]} messages
 * @param {{ maxNewTokens?: number }} opts
 */
export async function generateFromMessages(messages, { maxNewTokens = 90 } = {}) {
  if (!isLocalLlmEnabled()) return null;

  try {
    const generator = await getGenerator();
    const output = await withTimeout(
      generator(messages, {
        max_new_tokens: maxNewTokens,
        do_sample: false,
        return_full_text: false,
      }),
      LLM_TIMEOUT_MS,
    );

    const text = cleanAnswer(extractReply(output));
    if (text.length < 8) return null;
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
