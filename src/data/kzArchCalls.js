export const KZ_ARCH_AGENTS = ["/agents/cursor.svg", "/agents/claude.svg", "/agents/openclaw.svg"];

export const KZ_ARCH_ALLOWS = [
  {
    slug: "kaspi-kz",
    agent: "Cursor",
    method: "POST",
    path: "/pay/qr/create",
    status: "201",
    vendor: "Kaspi.kz",
    dur: "142ms",
  },
  {
    slug: "2gis",
    agent: "Claude",
    method: "GET",
    path: "/3.0/items/search",
    status: "200",
    vendor: "2GIS",
    dur: "98ms",
  },
  {
    slug: "yandex-maps",
    agent: "OpenClaw",
    method: "GET",
    path: "/v1/geocode",
    status: "200",
    vendor: "Yandex Maps",
    dur: "116ms",
  },
  {
    slug: "data-egov-kz",
    agent: "Cursor",
    method: "GET",
    path: "/datastore_search",
    status: "200",
    vendor: "data.egov.kz",
    dur: "204ms",
  },
  {
    slug: "halyk-bank",
    agent: "Claude",
    method: "POST",
    path: "/v1/transfers",
    status: "201",
    vendor: "Halyk Bank",
    dur: "178ms",
  },
];

export const KZ_ARCH_DENIES = [
  {
    slug: "nbk",
    agent: "OpenClaw",
    method: "DELETE",
    path: "/rates/base",
    rule: "writes not allowed",
    vendor: "NBK",
  },
  {
    slug: "egov-kz",
    agent: "Cursor",
    method: "PUT",
    path: "/citizen/profile",
    rule: "scope mismatch",
    vendor: "egov.kz",
  },
];
