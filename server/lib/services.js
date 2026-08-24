function slugify(text = "") {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function categorySlug(category = "General") {
  return slugify(category) || "general";
}

const YANDEX_FAMILIES = [
  { test: (id) => id.startsWith("yandex-cloud-"), slug: "yandex-cloud", name: "Yandex Cloud" },
  { test: (id) => id.startsWith("yandex-metrica") || id === "yandex-appmetrica", slug: "yandex-metrica", name: "Yandex Metrica" },
  { test: (id) => id.startsWith("yandex-pay"), slug: "yandex-pay", name: "Yandex Pay" },
  { test: (id) => id.startsWith("yandex-direct"), slug: "yandex-direct", name: "Yandex Direct" },
  { test: (id) => id.startsWith("yandex-market"), slug: "yandex-market", name: "Yandex Market" },
  {
    test: (id) =>
      id.startsWith("yandex-go") ||
      id.startsWith("yandex-delivery") ||
      id.startsWith("yandex-eda") ||
      id.startsWith("yandex-lavka") ||
      id.startsWith("yandex-routing"),
    slug: "yandex-go",
    name: "Yandex Go & Delivery",
  },
  {
    test: (id) =>
      id.startsWith("yandex-geocoder") ||
      id.startsWith("yandex-geosuggest") ||
      id.startsWith("yandex-static") ||
      id.startsWith("yandex-maps") ||
      id.startsWith("yandex-tiles") ||
      id.startsWith("yandex-org") ||
      id.startsWith("yandex-mapkit") ||
      id.startsWith("yandex-navikit") ||
      id.startsWith("yandex-locator") ||
      id.startsWith("yandex-router") ||
      id.startsWith("yandex-distance"),
    slug: "yandex-maps",
    name: "Yandex Maps & Location",
  },
  {
    test: (id) =>
      id.startsWith("yandex-disk") ||
      id.startsWith("yandex-connect") ||
      id.startsWith("yandex-calendar") ||
      id.startsWith("yandex-tracker") ||
      id.startsWith("yandex-forms") ||
      id.startsWith("yandex-mail"),
    slug: "yandex-360",
    name: "Yandex 360 & Productivity",
  },
  {
    test: (id) =>
      id.startsWith("yandex-webmaster") ||
      id.startsWith("yandex-site") ||
      id.startsWith("yandex-xml") ||
      id.startsWith("yandex-turbo") ||
      id.startsWith("yandex-structured") ||
      id.startsWith("yandex-browser") ||
      id.startsWith("yandex-safe") ||
      id.startsWith("yandex-partner") ||
      id.startsWith("yandex-mobile-ads"),
    slug: "yandex-search-ads",
    name: "Yandex Search & Ads",
  },
  {
    test: (id) =>
      id.startsWith("yandex-speechkit") ||
      id.startsWith("yandex-translate") ||
      id.startsWith("yandex-vision") ||
      id.startsWith("yandex-gpt") ||
      id.startsWith("yandex-alice") ||
      id.startsWith("yandex-toloka") ||
      id.startsWith("yandex-clickhouse") ||
      id.startsWith("yandex-catboost"),
    slug: "yandex-ai",
    name: "Yandex AI & ML",
  },
  { test: (id) => id.startsWith("yandex-id"), slug: "yandex-id", name: "Yandex ID" },
  { test: (id) => id.startsWith("yandex-"), slug: "yandex-platform", name: "Yandex Platform" },
];

const PROVIDER_PREFIXES = [
  "Yandex",
  "2GIS",
  "Kaspi.kz",
  "Kaspi",
  "NPCK",
  "Wolt",
  "Glovo",
  "Wildberries",
  "Ozon",
  "CDEK",
  "SIGEX",
  "eGov",
  "Halyk",
  "Freedom Pay",
  "ForteBank",
  "Bereke Bank",
  "Paybox",
  "Wooppay",
  "Air Astana",
  "FlyArystan",
  "SCAT Airlines",
  "Aviata.kz",
  "Kcell",
  "Beeline",
  "Tele2",
];

function stripProviderPrefix(text = "") {
  let head = text.trim();
  for (const prefix of PROVIDER_PREFIXES) {
    const re = new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+`, "i");
    if (re.test(head)) {
      head = head.replace(re, "").trim();
      break;
    }
  }
  return head;
}

function titleCase(text = "") {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function companyFromProvider(provider = "Other") {
  return {
    slug: slugify(provider) || "other",
    name: provider,
    provider,
    brand: provider,
  };
}

export function resolveCompany(api) {
  const id = api.id || api.slug || "";

  for (const family of YANDEX_FAMILIES) {
    if (family.test(id)) {
      return {
        slug: family.slug,
        name: family.name,
        provider: "Yandex",
        brand: "Yandex",
      };
    }
  }

  if (api.source === "data.egov.kz" || id.startsWith("d_") || api.endpoint?.includes("data.egov.kz")) {
    return {
      slug: "data-egov-kz",
      name: "data.egov.kz Open Data",
      provider: "eGov",
      brand: "data.egov.kz",
    };
  }

  if (api.provider === "Bureau of National Statistics") {
    return {
      slug: "stat-gov-kz",
      name: "stat.gov.kz · Bureau of National Statistics",
      provider: api.provider,
      brand: "stat.gov.kz",
    };
  }

  if (api.provider === "eGov" && api.source !== "data.egov.kz") {
    return {
      slug: "egov-kz",
      name: "eGov Kazakhstan",
      provider: "eGov",
      brand: "eGov",
    };
  }

  if (api.provider === "Kazhydromet") {
    return { slug: "kazhydromet", name: "Kazhydromet", provider: api.provider, brand: "Kazhydromet" };
  }

  if (api.provider === "NBK" || api.source?.includes("nationalbank")) {
    return { slug: "nbk", name: "National Bank of Kazakhstan", provider: "NBK", brand: "NBK" };
  }

  if (id.startsWith("kz-2gis-") || api.provider === "2GIS") {
    return { slug: "2gis", name: "2GIS", provider: "2GIS", brand: "2GIS" };
  }

  if (id.startsWith("kz-npck-") || api.provider === "NPCK") {
    return { slug: "npck", name: "NPCK · Open Banking", provider: "NPCK", brand: "NPCK" };
  }

  if (id.startsWith("kz-sigex-") || api.provider === "SIGEX") {
    return { slug: "sigex", name: "SIGEX", provider: "SIGEX", brand: "SIGEX" };
  }

  if (id.startsWith("kz-egov-mobile-")) {
    return { slug: "egov-mobile-id", name: "eGov Mobile ID", provider: "eGov", brand: "eGov" };
  }

  if (id.startsWith("kz-esf-") || api.provider === "KGD") {
    return { slug: "esf-kgd", name: "IS ESF · Tax & E-invoicing", provider: "KGD", brand: "KGD" };
  }

  if (id.startsWith("kz-wolt-") || api.provider === "Wolt") {
    return { slug: "wolt", name: "Wolt", provider: "Wolt", brand: "Wolt" };
  }

  if (id.startsWith("kz-glovo-") || api.provider === "Glovo") {
    return { slug: "glovo", name: "Glovo", provider: "Glovo", brand: "Glovo" };
  }

  if (id.startsWith("kz-chocofood-") || id.startsWith("kz-arbuz-") || api.provider === "Chocofamily") {
    return { slug: "chocofamily", name: "Chocofamily", provider: "Chocofamily", brand: "Chocofamily" };
  }

  if (id.startsWith("kz-wildberries-") || api.provider === "Wildberries") {
    return { slug: "wildberries", name: "Wildberries", provider: "Wildberries", brand: "Wildberries" };
  }

  if (id.startsWith("kz-ozon-") || api.provider === "Ozon") {
    return { slug: "ozon", name: "Ozon", provider: "Ozon", brand: "Ozon" };
  }

  if (id.startsWith("kz-cdek-") || api.provider === "CDEK") {
    return { slug: "cdek", name: "CDEK", provider: "CDEK", brand: "CDEK" };
  }

  if (id.startsWith("kz-paybot-") || api.provider === "PayBot.kz") {
    return companyFromProvider("PayBot.kz");
  }

  if (id.startsWith("kz-apipay-") || api.provider === "ApiPay.kz") {
    return companyFromProvider("ApiPay.kz");
  }

  if (id.startsWith("kz-asiapay-") || api.provider === "AsiaPay") {
    return companyFromProvider("AsiaPay");
  }

  if (id.startsWith("kz-qiwi-") || api.provider === "Qiwi Kazakhstan") {
    return companyFromProvider("Qiwi Kazakhstan");
  }

  if (id.startsWith("kz-ps-cloud-") || api.provider === "PS Cloud") {
    return companyFromProvider("PS Cloud");
  }

  if (id.startsWith("kz-beeline-cloud")) {
    return companyFromProvider("Beeline Cloud");
  }

  if (id.startsWith("kz-eurasian-") || api.provider === "Eurasian Bank") {
    return companyFromProvider("Eurasian Bank");
  }

  if (id.startsWith("kz-rbk-") || api.provider === "Bank RBK") {
    return companyFromProvider("Bank RBK");
  }

  if (id.startsWith("kz-homebank-") || (api.provider === "Halyk Bank" && api.tier === "commercial")) {
    return companyFromProvider("Halyk Bank");
  }

  if (id.startsWith("kz-freedompay-") || api.provider === "Freedom Pay KZ") {
    return { slug: "freedompay-kz", name: "Freedom Pay KZ", provider: "Freedom Pay KZ", brand: "Freedom Pay" };
  }

  if (id.startsWith("kz-halyk-epay-") || api.provider === "Halyk ePay" || api.provider === "Halyk Bank ePay") {
    return { slug: "halyk-epay", name: "Halyk ePay", provider: "Halyk ePay", brand: "Halyk Bank" };
  }

  if (id.startsWith("kz-bereke-") || api.provider === "Bereke Bank") {
    return { slug: "bereke-bank", name: "Bereke Bank", provider: "Bereke Bank", brand: "Bereke Bank" };
  }

  if (id.startsWith("kz-fortebank-") || api.provider === "ForteBank") {
    return { slug: "fortebank", name: "ForteBank", provider: "ForteBank", brand: "ForteBank" };
  }

  if (id.startsWith("kz-woop") || api.provider === "Wooppay" || api.provider === "Woopkassa") {
    return { slug: "wooppay", name: "Wooppay & Woopkassa", provider: "Wooppay", brand: "Wooppay" };
  }

  if (id.startsWith("kz-paybox-") || api.provider === "Paybox") {
    return { slug: "paybox", name: "Paybox", provider: "Paybox", brand: "Paybox" };
  }

  if (id.startsWith("kz-alatau-") || api.provider === "Alatau City Bank") {
    return { slug: "alatau-city-bank", name: "Alatau City Bank", provider: "Alatau City Bank", brand: "Alatau City Bank" };
  }

  if (id.startsWith("kz-kaspi-") || (api.provider === "Kaspi.kz" && api.tier === "commercial")) {
    return { slug: "kaspi-kz", name: "Kaspi.kz", provider: "Kaspi.kz", brand: "Kaspi" };
  }

  if (id.startsWith("kz-kazpost-") || (api.provider === "Kazpost" && api.tier === "commercial")) {
    return { slug: "kazpost", name: "Kazpost", provider: "Kazpost", brand: "Kazpost" };
  }

  if (id.startsWith("kz-air-astana-") || api.provider === "Air Astana") {
    return companyFromProvider("Air Astana");
  }

  if (id.startsWith("kz-flyarystan-") || api.provider === "FlyArystan") {
    return companyFromProvider("FlyArystan");
  }

  if (id.startsWith("kz-scat-") || api.provider === "SCAT Airlines") {
    return companyFromProvider("SCAT Airlines");
  }

  if (id.startsWith("kz-aviata-") || api.provider === "Aviata.kz") {
    return companyFromProvider("Aviata.kz");
  }

  if (id.startsWith("kz-ktz-") || api.provider === "KTZ") {
    return companyFromProvider("KTZ");
  }

  if (id.startsWith("kz-indriver-") || api.provider === "inDriver") {
    return companyFromProvider("inDriver");
  }

  if (id.startsWith("kz-ttn-") || api.provider === "Tickets.kz") {
    return companyFromProvider("Tickets.kz");
  }

  if (id.startsWith("kz-kcell-") || api.provider === "Kcell") {
    return companyFromProvider("Kcell");
  }

  if (id.startsWith("kz-beeline-") || api.provider === "Beeline Kazakhstan") {
    return companyFromProvider("Beeline Kazakhstan");
  }

  if (id.startsWith("kz-tele2-") || api.provider === "Tele2 Kazakhstan") {
    return companyFromProvider("Tele2 Kazakhstan");
  }

  if (id.startsWith("kz-aladhan-") || api.provider === "Aladhan") {
    return { slug: "aladhan", name: "Aladhan", provider: "Aladhan", brand: "Aladhan" };
  }

  const slug = slugify(api.provider || api.source || id);
  return {
    slug: slug || "other",
    name: api.provider || api.source || "Other",
    provider: api.provider || api.source || "Other",
    brand: api.provider || api.source || "API",
  };
}

/** @deprecated use resolveCompany */
export const resolveService = resolveCompany;

export function resolveApiType(api) {
  const title = api.title || api.id || "";
  const parts = title.split("~");

  if (parts.length >= 2) {
    const name = stripProviderPrefix(parts[0]);
    return { slug: slugify(name) || "general", name: name || "General" };
  }

  const id = api.id || "";
  if (id.startsWith("kz-")) {
    const rest = id.replace(/^kz-/, "");
    const segments = rest.split("-");
    const knownRoots = new Set([
      "2gis",
      "npck",
      "sigex",
      "egov",
      "esf",
      "wolt",
      "glovo",
      "wildberries",
      "ozon",
      "cdek",
      "paybot",
      "apipay",
      "asiapay",
      "qiwi",
      "ps",
      "beeline",
      "eurasian",
      "rbk",
      "homebank",
      "freedompay",
      "halyk",
      "bereke",
      "fortebank",
      "woop",
      "paybox",
      "alatau",
      "kaspi",
      "kazpost",
      "air",
      "flyarystan",
      "scat",
      "aviata",
      "ktz",
      "indriver",
      "ttn",
      "kcell",
      "tele2",
      "chocofood",
      "arbuz",
      "aladhan",
    ]);
    let start = 0;
    if (segments[0] === "ps" && segments[1] === "cloud") start = 2;
    else if (segments[0] === "air" && segments[1] === "astana") start = 2;
    else if (segments[0] === "egov" && segments[1] === "mobile") start = 2;
    else if (knownRoots.has(segments[0])) start = 1;
    const product = segments.slice(start).join(" ");
    const name = product ? titleCase(product) : stripProviderPrefix(parts[0]) || "General";
    return { slug: slugify(name) || "general", name };
  }

  if (id.startsWith("yandex-")) {
    const fromTitle = stripProviderPrefix(parts[0]);
    if (fromTitle && fromTitle !== title.trim()) {
      return { slug: slugify(fromTitle) || "general", name: fromTitle };
    }
    const product = id.replace(/^yandex-/, "").replace(/-/g, " ");
    const name = titleCase(product);
    return { slug: slugify(name) || "general", name };
  }

  const head = stripProviderPrefix(parts[0]) || "General";
  return { slug: slugify(head) || "general", name: head };
}

export function endpointLabel(api) {
  const title = api.title || api.id;
  const parts = title.split("~");
  let head = parts[0].trim();
  head = head.replace(/^Yandex\s+/i, "").trim();
  if (parts[1]) return `${head} · ${parts[1].trim()}`;
  return head;
}

export function endpointMethod(api) {
  if (api.trySpec?.method) return api.trySpec.method;
  return "GET";
}

function publicEndpoint(api) {
  return {
    id: api.id,
    slug: api.slug || api.id,
    title: api.title,
    label: endpointLabel(api),
    method: endpointMethod(api),
    category: api.category,
    apiType: api.apiType,
    auth: api.auth,
    copyable: api.copyable,
  };
}

function hubKey(category, companySlug) {
  return `${categorySlug(category)}::${companySlug}`;
}

export function buildCatalogIndex(apis) {
  const categories = new Map();

  for (const api of apis) {
    const category = api.category || "General";
    const catSlug = categorySlug(category);
    const company = resolveCompany(api);
    const apiType = resolveApiType(api);

    if (!categories.has(catSlug)) {
      categories.set(catSlug, {
        slug: catSlug,
        name: category,
        count: 0,
        companies: new Map(),
        typeCount: new Set(),
      });
    }

    const row = categories.get(catSlug);
    row.count += 1;
    row.typeCount.add(apiType.slug);

    if (!row.companies.has(company.slug)) {
      row.companies.set(company.slug, {
        slug: company.slug,
        name: company.name,
        provider: company.provider,
        brand: company.brand,
        count: 0,
        typeCount: new Set(),
      });
    }

    const companyRow = row.companies.get(company.slug);
    companyRow.count += 1;
    companyRow.typeCount.add(apiType.slug);
  }

  return [...categories.values()]
    .map((cat) => ({
      slug: cat.slug,
      name: cat.name,
      count: cat.count,
      companyCount: cat.companies.size,
      typeCount: cat.typeCount.size,
      companies: [...cat.companies.values()]
        .map((company) => ({
          slug: company.slug,
          name: company.name,
          provider: company.provider,
          brand: company.brand,
          count: company.count,
          typeCount: company.typeCount.size,
        }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function buildCategoryCompanies(apis, catSlug) {
  const index = buildCatalogIndex(apis);
  return index.find((c) => c.slug === catSlug) || null;
}

export function buildCompanyHub(apis, catSlug, companySlug) {
  const members = apis.filter((api) => {
    const category = api.category || "General";
    return categorySlug(category) === catSlug && resolveCompany(api).slug === companySlug;
  });

  if (!members.length) return null;

  const categoryName = members[0].category || "General";
  const company = resolveCompany(members[0]);
  const groupsMap = new Map();

  for (const api of members) {
    const apiType = resolveApiType(api);
    if (!groupsMap.has(apiType.slug)) {
      groupsMap.set(apiType.slug, { slug: apiType.slug, name: apiType.name, count: 0, endpoints: [] });
    }
    const group = groupsMap.get(apiType.slug);
    group.count += 1;
    group.endpoints.push(publicEndpoint(api));
  }

  const groups = [...groupsMap.values()]
    .map((g) => ({
      ...g,
      endpoints: g.endpoints.sort((a, b) => a.label.localeCompare(b.label)),
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return {
    category: {
      slug: catSlug,
      name: categoryName,
    },
    company: {
      slug: company.slug,
      name: company.name,
      provider: company.provider,
      brand: company.brand,
    },
    count: members.length,
    groupCount: groups.length,
    groups,
  };
}

export function buildHubCounts(apis) {
  const counts = new Map();
  for (const api of apis) {
    const company = resolveCompany(api);
    const key = hubKey(api.category, company.slug);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
}

export function findHubForApi(apis, apiId) {
  const api = apis.find((a) => a.id === apiId || a.slug === apiId);
  if (!api) return null;
  const company = resolveCompany(api);
  const catSlug = categorySlug(api.category);
  const hub = buildCompanyHub(apis, catSlug, company.slug);
  if (!hub || hub.count < 2) return null;
  return { hub, apiId: api.id };
}

/** Legacy service index — grouped by company only (all categories merged). */
export function buildServiceIndex(apis) {
  const map = new Map();

  for (const api of apis) {
    const company = resolveCompany(api);
    if (!map.has(company.slug)) {
      map.set(company.slug, {
        slug: company.slug,
        name: company.name,
        provider: company.provider,
        brand: company.brand,
        count: 0,
        categories: new Set(),
      });
    }
    const row = map.get(company.slug);
    row.count += 1;
    row.categories.add(api.category);
  }

  return [...map.values()]
    .map((s) => ({
      slug: s.slug,
      name: s.name,
      provider: s.provider,
      brand: s.brand,
      count: s.count,
      categoryCount: s.categories.size,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** Legacy service tree — first category slice for a company slug. */
export function buildServiceTree(apis, serviceSlug) {
  const members = apis.filter((api) => resolveCompany(api).slug === serviceSlug);
  if (!members.length) return null;

  const categories = [...new Set(members.map((a) => categorySlug(a.category)))];
  return buildCompanyHub(apis, categories[0], serviceSlug);
}

export function findServiceForApi(apis, apiId) {
  const match = findHubForApi(apis, apiId);
  if (!match) return null;
  return { service: match.hub, apiId: match.apiId };
}
