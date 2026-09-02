import { commercialTrust, keySetup } from "../helpers.js";

const NPCK_DOCS = "https://docs.npck.kz/";
const NPCK_OPEN_BANKING = "https://npck.kz/en/open-banking-open-api-2/";
const NPCK_TRANSFERS_DOCS =
  "https://docs.npck.kz/mezhbankovskaya-sistema-perevodov-i-platezhei/inicializaciya-perevodov-denezhnykh-sredstv/inicializaciya-perevoda-deneg-ot-yul-na-schet-fl-b2c2u";

const AUTH_BASE = "https://auth-openapi.npck.kz";
const ACCOUNTS_BASE = "https://accounts-openapi.npck.kz";
const TRANSFERS_BASE = "https://transfers-openapi.npck.kz";

const npckSetup = keySetup(NPCK_DOCS, NPCK_OPEN_BANKING);

const oauthAuth = {
  auth: "oauth",
  authDetails: { scheme: "oauth2", type: "bearer", credential: "OAuth access token" },
};

function kz({
  id,
  title,
  category,
  provider,
  source,
  sourceUrl,
  docs,
  baseUrl = null,
  endpoint = null,
  note,
  auth = oauthAuth.auth,
  authDetails = oauthAuth.authDetails,
  setup = null,
  trust = null,
  pricing = "paid",
  coverage = "KZ",
}) {
  return {
    id,
    slug: id,
    title,
    category,
    group: "Build",
    country: ["KZ"],
    provider,
    source,
    sourceUrl,
    tier: "commercial",
    kind: "commercial",
    auth,
    authDetails,
    copyable: false,
    pricing,
    docs,
    baseUrl,
    frequency: null,
    coverage,
    freshness: { label: "SEE DOCS", tone: "none" },
    likes: 0,
    note,
    trust:
      trust ??
      commercialTrust(provider, sourceUrl, auth === "oauth" ? "oauth" : auth === "token" ? "token" : "apiKey"),
    setup: setup ?? npckSetup,
    endpoint,
  };
}

/** @type {import('../../types.js').CatalogueEntry[]} */
export const NPCK_APIS = [
  // —— Payment Initiation (PIS) ——
  // kz-npck-openapi-transfers covers pacs.008 interbank transfers
  kz({
    id: "kz-npck-pis-init",
    title: "NPCK Open API ~ payment initiation request (KZ)",
    category: "Payments",
    provider: "NPCK",
    source: "National Payment Corporation",
    sourceUrl: TRANSFERS_BASE,
    docs: NPCK_TRANSFERS_DOCS,
    baseUrl: TRANSFERS_BASE,
    endpoint: "https://transfers-openapi.npck.kz/v1/transfers/iso20022/pain.013.001.11",
    note:
      "Initiate a payment or Request-to-Pay (C2B2_RTP, C2CR_RTP) — POST ISO 20022 pain.013 XML with end-to-end-id header and bank participant EDS signature. Related: kz-npck-openapi-transfers (pacs.008 credit transfers).",
    authDetails: {
      scheme: "oauth2",
      type: "bearer",
      credential: "Bank participant credentials + EDS-signed XML",
    },
  }),
  kz({
    id: "kz-npck-pis-status",
    title: "NPCK Open API ~ payment status polling (KZ)",
    category: "Payments",
    provider: "NPCK",
    source: "National Payment Corporation",
    sourceUrl: TRANSFERS_BASE,
    docs: "https://docs.npck.kz/mezhbankovskaya-sistema-mobilnykh-platezhei-msmp/mezhbankovskaya-sistema-mobilnykh-platezhei-msmp/servis-polucheniya-statusa-obrabotki-tranzakcii",
    baseUrl: TRANSFERS_BASE,
    endpoint: "https://transfers-openapi.npck.kz/v1/transfers/iso20022/pacs.028.001.05",
    note:
      "Poll transfer/payment outcome when pacs.002 final status (ACSC/RJCT) is delayed — POST ISO 20022 pacs.028 with original end-to-end-id; retry from ~5s per NPCK timeout rules. Status values: PDNG, ACSC, RJCT.",
  }),

  // —— Consent / AIS depth ——
  // kz-npck-openapi-auth covers OAuth2 FinID entry; kz-npck-openapi-accounts covers account list
  kz({
    id: "kz-npck-consent-create",
    title: "NPCK Open API ~ open banking consent creation (KZ)",
    category: "Banking & finance",
    provider: "NPCK",
    source: "National Payment Corporation",
    sourceUrl: AUTH_BASE,
    docs: NPCK_DOCS,
    baseUrl: AUTH_BASE,
    endpoint: "https://auth-openapi.npck.kz/v1/auth/generate-user-url",
    note:
      "Start AIS/PIS consent — POST generate-user-url with scopes (accounts, account_balance, account_transactions); redirect user through FinID biometric + SMS; exchange code for 30-day access_token. Consent IDs returned in id_token consents claim.",
  }),
  kz({
    id: "kz-npck-consent-revoke",
    title: "NPCK Open API ~ consent revocation (KZ)",
    category: "Banking & finance",
    provider: "NPCK",
    source: "National Payment Corporation",
    sourceUrl: AUTH_BASE,
    docs: "https://auth-openapi.npck.kz/",
    baseUrl: AUTH_BASE,
    endpoint: "https://auth-openapi.npck.kz/v1/oauth/users/revoke-access",
    note:
      "Revoke previously granted open-banking access — POST revoke-access with userConsentHistoryId from consent-history; sets accessRevoked=true. Pair with GET /v1/oauth/users/consent-history for audit.",
  }),
  kz({
    id: "kz-npck-ais-transactions",
    title: "NPCK Open API ~ account transaction history (AIS) (KZ)",
    category: "Banking & finance",
    provider: "NPCK",
    source: "National Payment Corporation",
    sourceUrl: ACCOUNTS_BASE,
    docs: "https://accounts-openapi.npck.kz/",
    baseUrl: ACCOUNTS_BASE,
    endpoint: "https://accounts-openapi.npck.kz/v3/accounts/{accountId}/transactions",
    note:
      "Fetch paginated transaction history after user consent — GET /v3/accounts/{accountId}/transactions with pageNumber, pageSize, from/to date filters; accountId is UUID (convert IBAN via obid-openapi.npck.kz). Requires account_transactions scope.",
  }),
];
