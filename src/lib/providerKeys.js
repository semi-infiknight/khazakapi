const STORAGE_KEY = "khazak.providerKeys.v1";

const PROVIDERS = {
  "data.egov.kz": {
    label: "data.egov.kz",
    description: "Free Open Data portal key — works for all 140 datasets.",
  },
};

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function listProviderKeys() {
  return { ...readStore() };
}

export function getProviderKey(providerId) {
  const entry = readStore()[providerId];
  return entry?.key || "";
}

export function getProviderKeyMeta(providerId) {
  return readStore()[providerId] || null;
}

export function saveProviderKey(providerId, key, meta = {}) {
  const store = readStore();
  store[providerId] = {
    key,
    savedAt: new Date().toISOString(),
    validated: Boolean(meta.validated),
    ...meta,
  };
  writeStore(store);
  window.dispatchEvent(new CustomEvent("khazak:provider-key", { detail: { providerId, key } }));
  return store[providerId];
}

export function clearProviderKey(providerId) {
  const store = readStore();
  delete store[providerId];
  writeStore(store);
  window.dispatchEvent(new CustomEvent("khazak:provider-key", { detail: { providerId, key: "" } }));
}

export function providerInfo(providerId) {
  return PROVIDERS[providerId] || { label: providerId };
}

export function isDataEgovApi(api) {
  if (!api) return false;
  return api.source === "data.egov.kz" || api.trust?.source === "data.egov.kz";
}
