/**
 * Local LLM integration disabled — template fallback active.
 */

export function isLocalLlmEnabled() {
  return false;
}

export async function generateFromMessages() {
  return null;
}

export function warmLocalLlm() {
  // no-op
}
