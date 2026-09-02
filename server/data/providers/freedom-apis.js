import { commercialTrust, keySetup } from "../helpers.js";

const FREEDOM_DOCS = "https://freedompay.kz/docs-en/";
const FREEDOM_DOCS_API = "https://docs.freedompay.kz/";
const FREEDOM_BASE = "https://api.freedompay.kz";
const FREEDOM_TEST = "https://test-api.freedompay.kz";

const FREEDOM_AUTH = {
  auth: "apiKey",
  authDetails: {
    scheme: "apiKey",
    type: "form",
    credential: "Merchant ID + secret key (pg_sig)",
  },
};

const freedomSetup = keySetup(
  "https://freedompay.kz/docs-en/merchant-api/intro",
  FREEDOM_DOCS_API,
);

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
  auth = FREEDOM_AUTH.auth,
  authDetails = FREEDOM_AUTH.authDetails,
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
    setup: setup ?? freedomSetup,
    endpoint,
  };
}

/** @type {import('../../types.js').CatalogueEntry[]} */
export const FREEDOM_APIS = [
  // —— Core payment APIs ——
  kz({
    id: "kz-freedompay-merchant",
    title: "Freedom Pay Merchant API ~ init payments & payouts (KZ)",
    category: "Payments",
    provider: "Freedom Pay KZ",
    source: "Freedom Pay",
    sourceUrl: FREEDOM_DOCS,
    docs: "https://freedompay.kz/docs-en/merchant-api/intro",
    baseUrl: FREEDOM_BASE,
    endpoint: `${FREEDOM_BASE}/init_payment.php`,
    note: "Kazakhstan payment aggregator — cards, wallets, payouts and saved cards. MD5-signed pg_sig on every request. Test server: test-api.freedompay.kz.",
  }),
  kz({
    id: "kz-freedompay-gateway",
    title: "Freedom Pay Gateway API ~ direct card processing (KZ)",
    category: "Payments",
    provider: "Freedom Pay KZ",
    source: "Freedom Pay",
    sourceUrl: "https://freedompay.kz/docs-en/gateway-api/intro",
    docs: "https://freedompay.kz/docs-en/gateway-api/pay",
    baseUrl: `${FREEDOM_BASE}/g2g`,
    endpoint: `${FREEDOM_BASE}/g2g/payment`,
    note: "Host-to-host card payments (PCI DSS required). Test server: test-api.freedompay.kz.",
  }),

  // —— Payouts ——
  kz({
    id: "kz-freedompay-payout-card",
    title: "Freedom Pay Payout ~ transfer to bank card (KZ)",
    category: "Payments",
    provider: "Freedom Pay KZ",
    source: "Freedom Pay",
    sourceUrl: "https://freedompay.kz/docs-en/merchant-api/payout",
    docs: "https://freedompay.kz/docs-en/merchant-api/payout",
    baseUrl: `${FREEDOM_BASE}/api`,
    endpoint: `${FREEDOM_BASE}/api/reg2reg`,
    note: "Payout to saved card via pg_card_token_to (reg2reg) or unsaved card page via reg2nonreg. Requires manager approval — payouts cannot be tested in sandbox.",
  }),

  // —— Card tokenization / saved cards ——
  kz({
    id: "kz-freedompay-card-storage",
    title: "Freedom Pay Card Storage ~ tokenize & saved cards (KZ)",
    category: "Payments",
    provider: "Freedom Pay KZ",
    source: "Freedom Pay",
    sourceUrl: "https://freedompay.kz/docs-en/merchant-api/savecard",
    docs: "https://freedompay.kz/docs-en/merchant-api/savecard",
    baseUrl: `${FREEDOM_BASE}/v1/merchant`,
    endpoint: `${FREEDOM_BASE}/v1/merchant/{merchant_id}/cardstorage/add`,
    note: "Iframe card save for payments (cardstorage/add) or payouts-only (cardstoragepayout/add). Returns pg_card_token for reg2reg payouts and non-acceptance charges.",
  }),

  // —— Recurring / subscriptions ——
  kz({
    id: "kz-freedompay-recurring",
    title: "Freedom Pay Recurring ~ subscriptions via pg_recurring_profile (KZ)",
    category: "Payments",
    provider: "Freedom Pay KZ",
    source: "Freedom Pay",
    sourceUrl: FREEDOM_DOCS_API,
    docs: "https://docs.freedompay.kz/reccuring-payment-21166426e0",
    baseUrl: FREEDOM_BASE,
    endpoint: `${FREEDOM_BASE}/make_recurring_payment`,
    note: "Create profile with pg_recurring_start + pg_recurring_lifetime on init_payment; charge later via make_recurring_payment with pg_recurring_profile from Result URL. Also supported on Apple Pay / Google Pay.",
  }),

  // —— Refunds / revoke ——
  kz({
    id: "kz-freedompay-refund",
    title: "Freedom Pay Refund ~ revoke payment & partial refunds (KZ)",
    category: "Payments",
    provider: "Freedom Pay KZ",
    source: "Freedom Pay",
    sourceUrl: "https://freedompay.kz/docs-en/merchant-api/after-pay",
    docs: "https://freedompay.kz/docs-en/merchant-api/after-pay",
    baseUrl: FREEDOM_BASE,
    endpoint: `${FREEDOM_BASE}/revoke.php`,
    note: "Full or partial refund on successful card payments via revoke.php (pg_refund_amount). Cancel unpaid invoices with cancel.php; pre-capture void via g2g/cancel on Gateway API.",
  }),

  // —— JS / Web Mobile SDK ——
  kz({
    id: "kz-freedompay-js-sdk",
    title: "Freedom Pay JS SDK ~ Web/Mobile card tokenization & charge (KZ)",
    category: "Payments",
    provider: "Freedom Pay KZ",
    source: "Freedom Pay",
    sourceUrl: "https://freedompay.kz/docs-en/web-mobile-sdk/js-sdk",
    docs: "https://freedompay.kz/docs-en/web-mobile-sdk/js-sdk",
    baseUrl: "https://cdn.freedompay.kz/sdk",
    endpoint: "https://cdn.freedompay.kz/sdk/js-sdk-1.0.0.js",
    note: "Browser SDK — FreedomPaySDK.setup(publickey, token), tokenize(), charge(), confirmInIframe() for 3DS. Keeps card data off your server; publickey and token issued by manager.",
    auth: "token",
    authDetails: {
      scheme: "bearer",
      type: "bearer",
      credential: "SDK publickey + token from Freedom Pay manager",
    },
    setup: keySetup(
      "https://freedompay.kz/docs-en/web-mobile-sdk/js-sdk",
      FREEDOM_DOCS_API,
    ),
  }),

  // —— Payment status / polling ——
  kz({
    id: "kz-freedompay-status",
    title: "Freedom Pay Status ~ payment polling & reconciliation (KZ)",
    category: "Payments",
    provider: "Freedom Pay KZ",
    source: "Freedom Pay",
    sourceUrl: "https://freedompay.kz/docs-en/merchant-api/after-pay",
    docs: "https://docs.freedompay.kz/api-11620963",
    baseUrl: FREEDOM_BASE,
    endpoint: `${FREEDOM_BASE}/get_status3.php`,
    note: "Poll payment status by pg_payment_id or pg_order_id when Result URL was missed. Payouts use get_status2.php. Healthcheck: /status/healthcheck.",
  }),

  // —— Regular autopayment service ——
  kz({
    id: "kz-freedompay-autopayment",
    title: "Freedom Pay Autopayment ~ scheduled recurring debits (KZ)",
    category: "Payments",
    provider: "Freedom Pay KZ",
    source: "Freedom Pay",
    sourceUrl: "https://freedompay.kz/en/largebusiness/services/regular-payment-service",
    docs: "https://docs.freedompay.kz/create-payment-11620859e0",
    baseUrl: `${FREEDOM_BASE}/g2g`,
    endpoint: `${FREEDOM_BASE}/g2g/recurrent`,
    note: "Regular autopayment service — one-time card consent, then automated debits on schedule until cancelled or profile expires. Gateway sync charge via g2g/recurrent with pg_recurring_profile; Merchant API via make_recurring_payment.",
  }),
];
