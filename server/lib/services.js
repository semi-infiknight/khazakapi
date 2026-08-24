function slugify(text = "") {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
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

export function resolveService(api) {
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

  if (id.startsWith("kz-sigex-") || id.startsWith("kz-egov-mobile-") || api.provider === "SIGEX") {
    return { slug: "sigex-egov", name: "SIGEX & eGov Identity", provider: api.provider, brand: "SIGEX" };
  }

  if (id.startsWith("kz-esf-") || api.provider === "KGD") {
    return { slug: "esf-kgd", name: "IS ESF · Tax & E-invoicing", provider: "KGD", brand: "KGD" };
  }

  if (id.startsWith("kz-wolt-") || api.provider === "Wolt") {
    return { slug: "wolt-kz", name: "Wolt", provider: "Wolt", brand: "Wolt" };
  }

  if (id.startsWith("kz-glovo-") || api.provider === "Glovo") {
    return { slug: "glovo-kz", name: "Glovo", provider: "Glovo", brand: "Glovo" };
  }

  if (
    id.startsWith("kz-chocofood-") ||
    id.startsWith("kz-arbuz-") ||
    api.provider === "Chocofamily"
  ) {
    return { slug: "chocofamily", name: "Chocofamily", provider: "Chocofamily", brand: "Chocofamily" };
  }

  if (id.startsWith("kz-wildberries-") || api.provider === "Wildberries") {
    return { slug: "wildberries-kz", name: "Wildberries", provider: "Wildberries", brand: "Wildberries" };
  }

  if (id.startsWith("kz-ozon-") || api.provider === "Ozon") {
    return { slug: "ozon-kz", name: "Ozon", provider: "Ozon", brand: "Ozon" };
  }

  if (id.startsWith("kz-cdek-") || api.provider === "CDEK") {
    return { slug: "cdek-kz", name: "CDEK", provider: "CDEK", brand: "CDEK" };
  }

  if (
    id.startsWith("kz-paybot-") ||
    id.startsWith("kz-apipay-") ||
    id.startsWith("kz-asiapay-") ||
    id.startsWith("kz-qiwi-") ||
    api.provider === "PayBot.kz" ||
    api.provider === "ApiPay.kz" ||
    api.provider === "AsiaPay" ||
    api.provider === "Qiwi Kazakhstan"
  ) {
    return { slug: "payment-aggregators-kz", name: "Payment Aggregators (KZ)", provider: api.provider, brand: api.provider };
  }

  if (id.startsWith("kz-ps-cloud-") || id.startsWith("kz-beeline-cloud") || api.provider === "PS Cloud") {
    return { slug: "cloud-kz", name: "Cloud & Infrastructure (KZ)", provider: api.provider, brand: api.provider };
  }

  if (
    id.startsWith("kz-eurasian-") ||
    id.startsWith("kz-rbk-") ||
    id.startsWith("kz-homebank-") ||
    api.provider === "Eurasian Bank" ||
    api.provider === "Bank RBK" ||
    (api.provider === "Halyk Bank" && api.tier === "commercial")
  ) {
    return { slug: "banks-kz", name: "Banks & Acquiring (KZ)", provider: api.provider, brand: api.provider };
  }

  if (id.startsWith("kz-freedompay-") || api.provider === "Freedom Pay KZ") {
    return { slug: "freedompay-kz", name: "Freedom Pay KZ", provider: "Freedom Pay KZ", brand: "Freedom Pay" };
  }

  if (
    id.startsWith("kz-halyk-epay-") ||
    api.provider === "Halyk ePay" ||
    api.provider === "Halyk Bank ePay"
  ) {
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

  if (
    id.startsWith("kz-ttn-") ||
    id.startsWith("kz-air-astana-") ||
    id.startsWith("kz-flyarystan-") ||
    id.startsWith("kz-scat-") ||
    id.startsWith("kz-aviata-") ||
    id.startsWith("kz-ktz-") ||
    id.startsWith("kz-indriver-") ||
    api.provider === "Tickets.kz" ||
    api.provider === "Air Astana" ||
    api.provider === "FlyArystan" ||
    api.provider === "SCAT Airlines" ||
    api.provider === "Aviata.kz" ||
    api.provider === "KTZ" ||
    api.provider === "inDriver"
  ) {
    return { slug: "travel-kz", name: "Travel & Mobility (KZ)", provider: api.provider, brand: api.provider };
  }

  if (
    id.startsWith("kz-kcell-") ||
    id.startsWith("kz-beeline-") ||
    id.startsWith("kz-tele2-") ||
    api.provider === "Kcell" ||
    api.provider === "Beeline Kazakhstan" ||
    api.provider === "Tele2 Kazakhstan"
  ) {
    return { slug: "telecom-kz", name: "Telecom & SMS (KZ)", provider: api.provider, brand: api.provider };
  }

  if (id.startsWith("kz-aladhan-") || api.provider === "Aladhan") {
    return { slug: "aladhan", name: "Aladhan", provider: "Aladhan", brand: "Aladhan" };
  }

  // kz-indriver handled in travel-kz group above

  const slug = slugify(api.provider || api.source || id);
  return {
    slug: slug || "other",
    name: api.provider || api.source || "Other",
    provider: api.provider || api.source || "Other",
    brand: api.provider || api.source || "API",
  };
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
    auth: api.auth,
    copyable: api.copyable,
  };
}

export function buildServiceIndex(apis) {
  const map = new Map();

  for (const api of apis) {
    const service = resolveService(api);
    if (!map.has(service.slug)) {
      map.set(service.slug, {
        slug: service.slug,
        name: service.name,
        provider: service.provider,
        brand: service.brand,
        count: 0,
        categories: new Set(),
      });
    }
    const row = map.get(service.slug);
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

export function buildServiceTree(apis, serviceSlug) {
  const members = apis.filter((api) => resolveService(api).slug === serviceSlug);
  if (!members.length) return null;

  const meta = resolveService(members[0]);
  const groupsMap = new Map();

  for (const api of members) {
    const groupName = api.category || "General";
    if (!groupsMap.has(groupName)) {
      groupsMap.set(groupName, { name: groupName, count: 0, endpoints: [] });
    }
    const group = groupsMap.get(groupName);
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
    slug: meta.slug,
    name: meta.name,
    provider: meta.provider,
    brand: meta.brand,
    count: members.length,
    groupCount: groups.length,
    groups,
  };
}

export function findServiceForApi(apis, apiId) {
  const api = apis.find((a) => a.id === apiId || a.slug === apiId);
  if (!api) return null;
  const service = resolveService(api);
  const tree = buildServiceTree(apis, service.slug);
  if (!tree || tree.count < 2) return null;
  return { service: tree, apiId: api.id };
}
