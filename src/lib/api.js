export async function fetchSearch(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, v);
  });
  const res = await fetch(`/api/search?${qs}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export async function fetchApi(id) {
  const res = await fetch(`/api/apis/${id}`);
  if (!res.ok) throw new Error("API not found");
  return res.json();
}

export async function tryApi(id, { url, params, headers, apiKey } = {}) {
  const res = await fetch(`/api/apis/${id}/try`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, params, headers, apiKey }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export async function fetchCategories() {
  const res = await fetch("/api/categories");
  if (!res.ok) throw new Error("Categories failed");
  return res.json();
}

export async function fetchCatalogue() {
  const res = await fetch("/api/catalogue?limit=200");
  if (!res.ok) throw new Error("Catalogue failed");
  return res.json();
}

export async function fetchCatalog() {
  const res = await fetch("/api/catalog");
  if (!res.ok) throw new Error("Catalog failed");
  return res.json();
}

export async function fetchCategory(slug) {
  const res = await fetch(`/api/catalog/${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error("Category not found");
  return res.json();
}

export async function fetchCompanyHub(categorySlug, companySlug) {
  const res = await fetch(`/api/catalog/${encodeURIComponent(categorySlug)}/${encodeURIComponent(companySlug)}`);
  if (!res.ok) throw new Error("Company hub not found");
  return res.json();
}

export async function fetchServices() {
  const res = await fetch("/api/services");
  if (!res.ok) throw new Error("Services failed");
  return res.json();
}

export async function fetchService(slug) {
  const res = await fetch(`/api/services/${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error("Service not found");
  return res.json();
}

export async function validateDataEgovKey(apiKey) {
  const res = await fetch("/api/providers/data-egov/validate-key", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Validation failed");
  return data;
}
