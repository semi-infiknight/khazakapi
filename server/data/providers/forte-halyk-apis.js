import { commercialTrust, keySetup } from "../helpers.js";

const FORTE_DOCS = "https://docs.fortebank.com/en/";
const FORTE_BASE = "https://gateway.fortebank.com";

const HALYK_DOCS = "https://epayment.kz/en-US/docs/api";
const HALYK_PORTAL = "https://halykbank.kz/business/payment/epay";
const HALYK_API = "https://epay-api.homebank.kz";
const HALYK_TEST = "https://test-epay-api.homebank.kz";

const FORTE_AUTH = {
  auth: "apiKey",
  authDetails: {
    scheme: "http",
    type: "basic",
    credential: "Shop ID + Secret Key (HTTP Basic); add X-API-Version: 3 header",
  },
};

const HALYK_AUTH = {
  auth: "oauth",
  authDetails: {
    scheme: "oauth2",
    type: "bearer",
    credential: "OAuth access token from kz-halyk-epay-oauth",
  },
};

const forteSetup = keySetup(
  `${FORTE_DOCS}integration/card_api/transactions/payment/`,
  FORTE_DOCS,
);
const halykSetup = keySetup(HALYK_DOCS, HALYK_PORTAL);

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
  auth = FORTE_AUTH.auth,
  authDetails = FORTE_AUTH.authDetails,
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
      commercialTrust(
        provider,
        sourceUrl,
        auth === "oauth" ? "oauth" : auth === "token" ? "token" : "apiKey",
      ),
    setup: setup ?? (auth === "oauth" ? halykSetup : forteSetup),
    endpoint,
  };
}

/** @type {import('../../types.js').CatalogueEntry[]} */
export const FORTE_HALYK_APIS = [
  // kz-fortebank-payment lives in kz-commercial-apis.js (one-step POST /transactions/payments)

  // —— ForteBank ~ two-step card flows ——
  kz({
    id: "kz-fortebank-authorizations",
    title: "ForteBank ~ two-step authorization hold (KZ)",
    category: "Payments",
    provider: "ForteBank",
    source: "ForteBank",
    sourceUrl: FORTE_DOCS,
    docs: `${FORTE_DOCS}integration/card_api/transactions/authorization/`,
    baseUrl: FORTE_BASE,
    endpoint: `${FORTE_BASE}/transactions/authorizations`,
    note:
      "Hold funds before capture — POST JSON with amount, currency and card token; returns transaction uid for capture or void. Sandbox test cards documented at docs.fortebank.com.",
  }),
  kz({
    id: "kz-fortebank-captures",
    title: "ForteBank ~ capture authorized payment (KZ)",
    category: "Payments",
    provider: "ForteBank",
    source: "ForteBank",
    sourceUrl: FORTE_DOCS,
    docs: `${FORTE_DOCS}integration/card_api/transactions/capture/`,
    baseUrl: FORTE_BASE,
    endpoint: `${FORTE_BASE}/transactions/captures`,
    note:
      "Complete a two-step payment after goods ship or service delivers — POST parent authorization uid and optional partial amount.",
  }),
  kz({
    id: "kz-fortebank-voids",
    title: "ForteBank ~ void authorization (KZ)",
    category: "Payments",
    provider: "ForteBank",
    source: "ForteBank",
    sourceUrl: FORTE_DOCS,
    docs: `${FORTE_DOCS}integration/card_api/transactions/void/`,
    baseUrl: FORTE_BASE,
    endpoint: `${FORTE_BASE}/transactions/voids`,
    note:
      "Cancel an uncaptured authorization without charging the card — POST parent authorization uid before capture window expires.",
  }),

  // —— ForteBank ~ refunds & disbursements ——
  kz({
    id: "kz-fortebank-refunds",
    title: "ForteBank ~ refunds (KZ)",
    category: "Payments",
    provider: "ForteBank",
    source: "ForteBank",
    sourceUrl: FORTE_DOCS,
    docs: `${FORTE_DOCS}integration/card_api/transactions/refund/`,
    baseUrl: FORTE_BASE,
    endpoint: `${FORTE_BASE}/transactions/refunds`,
    note:
      "Full or partial refund on settled ForteBank e-commerce transactions — POST parent payment uid and refund amount.",
  }),
  kz({
    id: "kz-fortebank-payouts",
    title: "ForteBank ~ payouts to cards (KZ)",
    category: "Payments",
    provider: "ForteBank",
    source: "ForteBank",
    sourceUrl: FORTE_DOCS,
    docs: `${FORTE_DOCS}integration/card_api/transactions/payout/`,
    baseUrl: FORTE_BASE,
    endpoint: `${FORTE_BASE}/transactions/payouts`,
    note:
      "Disburse funds to customer cards — marketplace seller payouts and gig-economy transfers via POST /transactions/payouts.",
  }),

  // —— ForteBank ~ tokenization & P2P ——
  kz({
    id: "kz-fortebank-tokenizations",
    title: "ForteBank ~ card tokenization (KZ)",
    category: "Payments",
    provider: "ForteBank",
    source: "ForteBank",
    sourceUrl: FORTE_DOCS,
    docs: `${FORTE_DOCS}integration/card_api/transactions/tokenization/`,
    baseUrl: FORTE_BASE,
    endpoint: `${FORTE_BASE}/transactions/tokenizations`,
    note:
      "Store cards for one-click checkout and subscription renewals — returns card token for subsequent payment or authorization calls.",
  }),
  kz({
    id: "kz-fortebank-p2p",
    title: "ForteBank ~ P2P card transfers (KZ)",
    category: "Payments",
    provider: "ForteBank",
    source: "ForteBank",
    sourceUrl: FORTE_DOCS,
    docs: `${FORTE_DOCS}integration/card_api/transactions/p2p/`,
    baseUrl: FORTE_BASE,
    endpoint: `${FORTE_BASE}/transactions/p2p`,
    note:
      "Peer-to-peer transfers between cards via ForteBank gateway — card-to-card disbursement for wallets and remittance apps.",
  }),

  // —— ForteBank ~ status, hosted checkout & subscriptions ——
  kz({
    id: "kz-fortebank-transaction-status",
    title: "ForteBank ~ transaction status query (KZ)",
    category: "Payments",
    provider: "ForteBank",
    source: "ForteBank",
    sourceUrl: FORTE_DOCS,
    docs: `${FORTE_DOCS}integration/card_api/transactions/query/`,
    baseUrl: FORTE_BASE,
    endpoint: `${FORTE_BASE}/transactions/{uid}`,
    note:
      "GET transaction by uid — poll when webhook delivery fails; ForteBank also sends server-to-server notifications on status change.",
  }),
  kz({
    id: "kz-fortebank-pay-by-link",
    title: "ForteBank ~ pay-by-link checkout (KZ)",
    category: "Payments",
    provider: "ForteBank",
    source: "ForteBank",
    sourceUrl: FORTE_DOCS,
    docs: `${FORTE_DOCS}integration/payment_page/`,
    baseUrl: FORTE_BASE,
    endpoint: `${FORTE_BASE}/checkouts`,
    note:
      "Generate hosted payment links without building your own checkout UI — POST checkout session and redirect buyer to ForteBank payment page.",
  }),
  kz({
    id: "kz-fortebank-subscriptions",
    title: "ForteBank ~ subscription billing (KZ)",
    category: "Payments",
    provider: "ForteBank",
    source: "ForteBank",
    sourceUrl: FORTE_DOCS,
    docs: `${FORTE_DOCS}integration/subscriptions/`,
    baseUrl: FORTE_BASE,
    endpoint: `${FORTE_BASE}/subscriptions`,
    note:
      "Recurring charges on tokenized cards — SaaS and membership billing with schedule and retry rules via /subscriptions API.",
  }),

  // kz-halyk-epay-oauth and kz-halyk-epay-payment live in kz-commercial-apis.js

  // —— Halyk ePay ~ refunds & saved cards ——
  kz({
    id: "kz-halyk-epay-refund",
    title: "Halyk ePay ~ refund & cancel (KZ)",
    category: "Payments",
    provider: "Halyk ePay",
    source: "Halyk Bank",
    sourceUrl: HALYK_DOCS,
    docs: HALYK_DOCS,
    baseUrl: HALYK_API,
    endpoint: `${HALYK_API}/operation/{id}/refund`,
    note:
      "Reverse settled ePay transactions — POST /operation/{id}/refund for full/partial refund; confirm/cancel endpoints for two-step cryptopay flows.",
    auth: HALYK_AUTH.auth,
    authDetails: HALYK_AUTH.authDetails,
    setup: halykSetup,
    trust: commercialTrust("Halyk ePay", HALYK_DOCS, "oauth"),
  }),
  kz({
    id: "kz-halyk-epay-saved-cards",
    title: "Halyk ePay ~ saved cards management (KZ)",
    category: "Payments",
    provider: "Halyk ePay",
    source: "Halyk Bank",
    sourceUrl: HALYK_DOCS,
    docs: HALYK_DOCS,
    baseUrl: HALYK_API,
    endpoint: `${HALYK_API}/cards`,
    note:
      "List, bind and charge tokenized cards for returning customers — GET/POST /cards after OAuth token from kz-halyk-epay-oauth.",
    auth: HALYK_AUTH.auth,
    authDetails: HALYK_AUTH.authDetails,
    setup: halykSetup,
    trust: commercialTrust("Halyk ePay", HALYK_DOCS, "oauth"),
  }),

  // —— Halyk ePay ~ QR, wallets & invoice links ——
  kz({
    id: "kz-halyk-epay-qr",
    title: "Halyk ePay ~ Halyk QR payments (KZ)",
    category: "Payments",
    provider: "Halyk ePay",
    source: "Halyk Bank",
    sourceUrl: HALYK_DOCS,
    docs: HALYK_DOCS,
    baseUrl: HALYK_API,
    endpoint: `${HALYK_API}/payment/qr`,
    note:
      "Generate Halyk QR for in-app and POS checkout — POST payment/qr with amount; customer scans with Homebank app to pay.",
    auth: HALYK_AUTH.auth,
    authDetails: HALYK_AUTH.authDetails,
    setup: halykSetup,
    trust: commercialTrust("Halyk ePay", HALYK_DOCS, "oauth"),
  }),
  kz({
    id: "kz-halyk-epay-wallet-pay",
    title: "Halyk ePay ~ Apple Pay & Google Pay (KZ)",
    category: "Payments",
    provider: "Halyk ePay",
    source: "Halyk Bank",
    sourceUrl: HALYK_DOCS,
    docs: "https://epayment.kz/en-US/docs/mobile_sdk_documentation",
    baseUrl: HALYK_API,
    endpoint: `${HALYK_API}/payment/wallet`,
    note:
      "Wallet cryptogram payments — iOS/Android SDK or server-side cryptopay flow with Apple Pay / Google Pay token.",
    auth: HALYK_AUTH.auth,
    authDetails: HALYK_AUTH.authDetails,
    setup: halykSetup,
    trust: commercialTrust("Halyk ePay", HALYK_DOCS, "oauth"),
  }),
  kz({
    id: "kz-halyk-epay-invoice-link",
    title: "Halyk ePay ~ invoice payment links (KZ)",
    category: "Payments",
    provider: "Halyk ePay",
    source: "Halyk Bank",
    sourceUrl: HALYK_DOCS,
    docs: HALYK_DOCS,
    baseUrl: HALYK_API,
    endpoint: `${HALYK_API}/invoice`,
    note:
      "Send payable invoice URLs to customers — POST /invoice with amount and description; used by 65%+ of KZ online stores.",
    auth: HALYK_AUTH.auth,
    authDetails: HALYK_AUTH.authDetails,
    setup: halykSetup,
    trust: commercialTrust("Halyk ePay", HALYK_DOCS, "oauth"),
  }),

  // —— Halyk ePay ~ P2P & sandbox ——
  kz({
    id: "kz-halyk-epay-p2p",
    title: "Halyk ePay ~ P2P transfers (KZ)",
    category: "Payments",
    provider: "Halyk ePay",
    source: "Halyk Bank",
    sourceUrl: HALYK_DOCS,
    docs: HALYK_DOCS,
    baseUrl: HALYK_API,
    endpoint: `${HALYK_API}/p2p/transfer`,
    note:
      "Card-to-card and account P2P via Halyk ePay merchant terminal — POST /p2p/transfer with recipient card or account details.",
    auth: HALYK_AUTH.auth,
    authDetails: HALYK_AUTH.authDetails,
    setup: halykSetup,
    trust: commercialTrust("Halyk ePay", HALYK_DOCS, "oauth"),
  }),
  kz({
    id: "kz-halyk-epay-sandbox",
    title: "Halyk ePay ~ sandbox test credentials (KZ)",
    category: "Payments",
    provider: "Halyk ePay",
    source: "Halyk Bank",
    sourceUrl: "https://epayment.kz/en-US/docs/Test%20credentials",
    docs: "https://epayment.kz/en-US/docs/Test%20credentials",
    baseUrl: HALYK_TEST,
    endpoint: `${HALYK_TEST}/payment/cryptopay`,
    note:
      "Full test terminal credentials at epayment.kz — base URL test-epay-api.homebank.kz; OAuth against test-epay-oauth.homebank.kz before production go-live.",
    auth: HALYK_AUTH.auth,
    authDetails: HALYK_AUTH.authDetails,
    setup: halykSetup,
    trust: commercialTrust("Halyk ePay", HALYK_DOCS, "oauth"),
    pricing: "freemium",
  }),
];
