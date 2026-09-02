import { commercialTrust, keySetup } from "../helpers.js";

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
  auth = "apiKey",
  authDetails = {
    scheme: "apiKey",
    type: "header",
    header: "Authorization",
    credential: "API key or token",
  },
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
    trust: trust ?? commercialTrust(provider, sourceUrl, auth === "oauth" ? "oauth" : auth === "token" ? "token" : "apiKey"),
    setup: setup ?? keySetup(docs, sourceUrl),
    endpoint,
  };
}

const KCELL_BULK_DOCS = "https://b2b.kcell.kz/inform_plus/";
const KCELL_JSONV2_DOCS =
  "https://guides.altcraft.com/en/assets/files/sbermobile-75573f455e784659fa619d5703d88602.pdf";
const KCELL_API_BASE = "https://api-cpa.kcell.kz";
const KCELL_SMS_SETUP = keySetup(KCELL_BULK_DOCS, "mailto:partners_sms@kcell.kz");

const kcellSmsAuth = {
  auth: "apiKey",
  authDetails: {
    scheme: "http",
    type: "basic",
    credential: "HTTP Basic credentials (client_id + password from Kcell)",
  },
};

const BEELINE_SMS_DOCS = "https://business.beeline.kz/sms-info";
const BEELINE_SMS_SETUP = keySetup(BEELINE_SMS_DOCS, "mailto:smsivr@beeline.kz");
const beelineSmsAuth = {
  auth: "apiKey",
  authDetails: {
    scheme: "apiKey",
    type: "header",
    credential: "Partner credentials (issued after contract)",
  },
};

const KEMPAY_DOCS = "https://kempay.kz/ru/razrab";
const KEMPAY_BASE = "https://api.kempay.kz/merchant-api/v1";
const kempayAuth = {
  auth: "apiKey",
  authDetails: {
    scheme: "apiKey",
    type: "header",
    header: "Signature",
    credential: "Api-Name + HMAC-SHA256 Signature header",
  },
};
const kempaySetup = keySetup(KEMPAY_DOCS, KEMPAY_DOCS);

const TELE2_PARTNERS = "https://altel.kz/partners";
const TELE2_BUSINESS = "https://business.altel.kz/";
const tele2Setup = keySetup(TELE2_PARTNERS, "mailto:a2p_vas@tele2.kz");

/** @type {import('../../types.js').CatalogueEntry[]} */
export const TELECOM_KZ_APIS = [
  // —— Kcell ~ JSONv2 SMS (Inform Plus / BulkSMS) ——
  // kz-kcell-sms overview lives in kz-commercial-apis.js
  kz({
    id: "kz-kcell-sms-simple",
    title: "Kcell JSONv2 ~ single SMS send (KZ)",
    category: "Communications",
    provider: "Kcell",
    source: "Kcell Inform Plus",
    sourceUrl: KCELL_BULK_DOCS,
    docs: KCELL_JSONV2_DOCS,
    baseUrl: KCELL_API_BASE,
    endpoint: "https://api-cpa.kcell.kz/{client_id}/json2/simple",
    note:
      "Send one transactional or OTP SMS — POST JSON with phone_number, extra_id, text, alpha_name and optional callback_url for delivery reports. Ideal for signup verification codes.",
    ...kcellSmsAuth,
    setup: KCELL_SMS_SETUP,
    trust: commercialTrust("Kcell", KCELL_BULK_DOCS, "apiKey"),
  }),
  kz({
    id: "kz-kcell-sms-batch-sync",
    title: "Kcell JSONv2 ~ batch SMS with sync IDs (KZ)",
    category: "Communications",
    provider: "Kcell",
    source: "Kcell Inform Plus",
    sourceUrl: KCELL_BULK_DOCS,
    docs: KCELL_JSONV2_DOCS,
    baseUrl: KCELL_API_BASE,
    endpoint: "https://api-cpa.kcell.kz/{client_id}/json2/batch/sync",
    note:
      "Bulk SMS up to 50,000 recipients per request — /batch/sync returns message_id per recipient immediately (vs async job id on /batch). Per-recipient text for OTP campaigns.",
    ...kcellSmsAuth,
    setup: KCELL_SMS_SETUP,
  }),
  kz({
    id: "kz-kcell-sms-broadcast",
    title: "Kcell JSONv2 ~ broadcast SMS (KZ)",
    category: "Communications",
    provider: "Kcell",
    source: "Kcell Inform Plus",
    sourceUrl: KCELL_BULK_DOCS,
    docs: KCELL_JSONV2_DOCS,
    baseUrl: KCELL_API_BASE,
    endpoint: "https://api-cpa.kcell.kz/{client_id}/json2/broadcast",
    note:
      "One shared text to many Kcell/Activ subscribers — POST with phone list + single message body. Supports scheduled start_time, alpha_name and SMS TTL.",
    ...kcellSmsAuth,
    setup: KCELL_SMS_SETUP,
  }),
  kz({
    id: "kz-kcell-sms-broadcast-sync",
    title: "Kcell JSONv2 ~ broadcast SMS sync response (KZ)",
    category: "Communications",
    provider: "Kcell",
    source: "Kcell Inform Plus",
    sourceUrl: KCELL_BULK_DOCS,
    docs: KCELL_JSONV2_DOCS,
    baseUrl: KCELL_API_BASE,
    endpoint: "https://api-cpa.kcell.kz/{client_id}/json2/broadcast/sync",
    note:
      "Same as broadcast but returns per-recipient message_id in the HTTP response — use for OTP flows needing immediate message tracking.",
    ...kcellSmsAuth,
    setup: KCELL_SMS_SETUP,
  }),
  kz({
    id: "kz-kcell-sms-job-status",
    title: "Kcell JSONv2 ~ SMS job delivery status (KZ)",
    category: "Communications",
    provider: "Kcell",
    source: "Kcell Inform Plus",
    sourceUrl: KCELL_BULK_DOCS,
    docs: KCELL_JSONV2_DOCS,
    baseUrl: KCELL_API_BASE,
    endpoint: "https://api-cpa.kcell.kz/{client_id}/json2/job/status/{job_id}",
    note:
      "Poll async batch/broadcast job — GET returns delivery status per message (delivered, expired, error_code). Pair with callback_url webhooks for production OTP pipelines.",
    ...kcellSmsAuth,
    setup: KCELL_SMS_SETUP,
  }),
  kz({
    id: "kz-kcell-sms-delivery-report",
    title: "Kcell JSONv2 ~ SMS delivery report query (KZ)",
    category: "Communications",
    provider: "Kcell",
    source: "Kcell Inform Plus",
    sourceUrl: KCELL_BULK_DOCS,
    docs: KCELL_JSONV2_DOCS,
    baseUrl: KCELL_API_BASE,
    endpoint: "https://api-cpa.kcell.kz/{client_id}/dr/{message_id}/simple",
    note:
      "GET final delivery status by message_id or extra_id — confirms OTP SMS reached the handset. Advanced DR at /dr/{message_id}/advanced adds operator timestamps.",
    ...kcellSmsAuth,
    setup: KCELL_SMS_SETUP,
  }),
  kz({
    id: "kz-kcell-sms-otp-templates",
    title: "Kcell ~ verification SMS template registration (KZ)",
    category: "Communications",
    provider: "Kcell",
    source: "Kcell BulkSMS",
    sourceUrl: KCELL_BULK_DOCS,
    docs: "https://static.kcell.kz/page/legal/Contract_template_ENG.pdf",
    baseUrl: null,
    endpoint: null,
    note:
      "OTP and service SMS require pre-approved message templates — email partners_sms@kcell.kz with BIN, company name and Excel template file. Verification SMS classified separately from marketing traffic.",
    ...kcellSmsAuth,
    setup: KCELL_SMS_SETUP,
  }),
  kz({
    id: "kz-kcell-subscriber-api",
    title: "Kcell ~ corporate subscriber self-service API (KZ)",
    category: "Communications",
    provider: "Kcell",
    source: "Kcell B2B",
    sourceUrl: "https://static.kcell.kz/b2b/files/cabinet/regulation_api_en.pdf",
    docs: "https://static.kcell.kz/b2b/files/cabinet/regulation_api_en.pdf",
    baseUrl: null,
    endpoint: null,
    note:
      "Technological access for telecom apps — SIM lock/unlock, eSIM swap, service connect/disconnect on corporate subscriber numbers. Apply via Kcell B2B with allocated credentials.",
    auth: "token",
    authDetails: {
      scheme: "oauth2",
      type: "header",
      header: "Authorization",
      credential: "Operator-issued credentials per regulation",
    },
    setup: keySetup(
      "https://static.kcell.kz/b2b/files/cabinet/regulation_api_en.pdf",
      "mailto:email@kcell.kz",
    ),
  }),

  // —— Beeline Kazakhstan ~ SMS informing & KemPay OTP ——
  // kz-beeline-sms overview lives in kz-commercial-apis.js
  kz({
    id: "kz-beeline-sms-bulk",
    title: "Beeline KZ ~ bulk SMS gateway (KZ)",
    category: "Communications",
    provider: "Beeline Kazakhstan",
    source: "Beeline Business",
    sourceUrl: BEELINE_SMS_DOCS,
    docs: BEELINE_SMS_DOCS,
    baseUrl: null,
    endpoint: null,
    note:
      "Bulk and transactional SMS gateway to Beeline subscribers — order status, service alerts and marketing. Dedicated alpha-name; micro-business tier up to 500 SMS/month at 14.5 ₸/SMS.",
    ...beelineSmsAuth,
    setup: BEELINE_SMS_SETUP,
    trust: commercialTrust("Beeline Kazakhstan", BEELINE_SMS_DOCS, "apiKey"),
  }),
  kz({
    id: "kz-beeline-sms-verification",
    title: "Beeline KZ ~ OTP verification SMS (KZ)",
    category: "Communications",
    provider: "Beeline Kazakhstan",
    source: "Beeline SMS-informing",
    sourceUrl: BEELINE_SMS_DOCS,
    docs: BEELINE_SMS_DOCS,
    baseUrl: null,
    endpoint: null,
    note:
      "Signup and login OTP codes via Beeline SMS-informing — confirmation codes, 2FA and password reset to Beeline/Kar-Tel subscribers. Onboarding via smsivr@beeline.kz.",
    ...beelineSmsAuth,
    setup: BEELINE_SMS_SETUP,
  }),
  kz({
    id: "kz-beeline-kempay-create-payment",
    title: "Beeline KemPay ~ mobile balance payment + OTP (KZ)",
    category: "Communications",
    provider: "Beeline Kazakhstan",
    source: "KemPay",
    sourceUrl: KEMPAY_DOCS,
    docs: KEMPAY_DOCS,
    baseUrl: KEMPAY_BASE,
    endpoint: "https://api.kempay.kz/merchant-api/v1/create-payment",
    note:
      "Charge Beeline prepaid balance for digital goods — POST create-payment returns otpConfirm=true when a 5-digit SMS OTP is sent to payerPhone. Merchant domain assigned on onboarding.",
    ...kempayAuth,
    setup: kempaySetup,
  }),
  kz({
    id: "kz-beeline-kempay-resend-otp",
    title: "Beeline KemPay ~ resend payment OTP SMS (KZ)",
    category: "Communications",
    provider: "Beeline Kazakhstan",
    source: "KemPay",
    sourceUrl: KEMPAY_DOCS,
    docs: KEMPAY_DOCS,
    baseUrl: KEMPAY_BASE,
    endpoint: "https://api.kempay.kz/merchant-api/v1/resend-otp",
    note:
      "Resend OTP SMS for balance top-up confirmation — POST with paymentId; canResend=false when subscriber exceeded SMS retry limit.",
    ...kempayAuth,
    setup: kempaySetup,
  }),
  kz({
    id: "kz-beeline-kempay-confirm-payment",
    title: "Beeline KemPay ~ confirm payment with OTP (KZ)",
    category: "Payments",
    provider: "Beeline Kazakhstan",
    source: "KemPay",
    sourceUrl: KEMPAY_DOCS,
    docs: KEMPAY_DOCS,
    baseUrl: KEMPAY_BASE,
    endpoint: "https://api.kempay.kz/merchant-api/v1/confirm-payment",
    note:
      "Complete mobile balance debit after user enters OTP — POST paymentId + otp (5 digits). Returns e-money and payment receipts for telecom wallet top-up flows.",
    ...kempayAuth,
    setup: kempaySetup,
  }),
  kz({
    id: "kz-beeline-m2m",
    title: "Beeline KZ ~ M2M SIM & IoT connectivity (KZ)",
    category: "Communications",
    provider: "Beeline Kazakhstan",
    source: "Beeline Business",
    sourceUrl: "https://business.beeline.kz/m2m",
    docs: "https://business.beeline.kz/m2m",
    baseUrl: null,
    endpoint: null,
    note:
      "Machine-to-machine tariffs and data packages for IoT, telematics and smart devices on Beeline/Kar-Tel network — telecom app hardware connectivity in Kazakhstan.",
    auth: "apiKey",
    authDetails: {
      scheme: "apiKey",
      type: "header",
      credential: "Corporate contract credentials",
    },
    setup: keySetup("https://business.beeline.kz/m2m", "https://business.beeline.kz/"),
  }),

  // —— Tele2 / Altel ~ A2P SMS ecosystem ——
  // kz-tele2-sms overview lives in kz-commercial-apis.js
  kz({
    id: "kz-tele2-a2p-verification",
    title: "Tele2/Altel ~ verification A2P SMS (KZ)",
    category: "Communications",
    provider: "Tele2 Kazakhstan",
    source: "Tele2 A2P",
    sourceUrl: TELE2_PARTNERS,
    docs: TELE2_PARTNERS,
    baseUrl: null,
    endpoint: null,
    note:
      "OTP and signup verification SMS on Tele2/Altel network — 9.40 ₸/SMS national A2P rate. Alpha-name pre-registration required; onboarding via a2p_vas@tele2.kz.",
    auth: "apiKey",
    authDetails: {
      scheme: "apiKey",
      type: "header",
      credential: "Aggregator SMPP/HTTP credentials",
    },
    setup: tele2Setup,
    trust: commercialTrust("Tele2 Kazakhstan", TELE2_PARTNERS, "apiKey"),
  }),
  kz({
    id: "kz-tele2-a2p-transactional",
    title: "Tele2/Altel ~ transactional A2P SMS (KZ)",
    category: "Communications",
    provider: "Tele2 Kazakhstan",
    source: "Tele2 A2P",
    sourceUrl: TELE2_PARTNERS,
    docs: TELE2_PARTNERS,
    baseUrl: null,
    endpoint: null,
    note:
      "Order confirmations, payment receipts and account alerts — 10.40 ₸/SMS transactional A2P tariff on Tele2/Altel. HTTP REST, JSON or SMPP gateway after aggregator contract.",
    auth: "apiKey",
    authDetails: {
      scheme: "apiKey",
      type: "header",
      credential: "Aggregator credentials",
    },
    setup: tele2Setup,
  }),
  kz({
    id: "kz-tele2-a2p-service",
    title: "Tele2/Altel ~ service A2P SMS (KZ)",
    category: "Communications",
    provider: "Tele2 Kazakhstan",
    source: "Tele2 A2P",
    sourceUrl: TELE2_PARTNERS,
    docs: TELE2_PARTNERS,
    baseUrl: null,
    endpoint: null,
    note:
      "Service and notification SMS to Tele2/Altel subscribers — 15.6 ₸/SMS. No marketing between 22:00–09:00 Almaty time; subscriber consent required for promo traffic.",
    auth: "apiKey",
    authDetails: {
      scheme: "apiKey",
      type: "header",
      credential: "Aggregator credentials",
    },
    setup: tele2Setup,
  }),
  kz({
    id: "kz-tele2-business-cabinet",
    title: "Tele2/Altel ~ corporate self-service portal (KZ)",
    category: "Communications",
    provider: "Tele2 Kazakhstan",
    source: "Tele2 Business",
    sourceUrl: TELE2_BUSINESS,
    docs: TELE2_BUSINESS,
    baseUrl: "https://business.altel.kz",
    endpoint: "https://business.altel.kz/",
    note:
      "Corporate telecom app back-office — manage SIM fleet, tariffs, documents and A2P services for Tele2/Altel B2B clients. Same ecosystem as consumer Altel brand.",
    auth: "apiKey",
    authDetails: {
      scheme: "oauth2",
      type: "bearer",
      credential: "Corporate account login",
    },
    setup: keySetup(TELE2_BUSINESS, "https://tele2.kz/"),
  }),
  kz({
    id: "kz-altel-a2p-partners",
    title: "Altel ~ A2P SMS aggregator onboarding (KZ)",
    category: "Communications",
    provider: "Tele2 Kazakhstan",
    source: "Altel",
    sourceUrl: TELE2_PARTNERS,
    docs: TELE2_PARTNERS,
    baseUrl: null,
    endpoint: null,
    note:
      "Altel shares Tele2 A2P infrastructure — SMS aggregators and VAS providers submit commercial proposals to a2p_vas@tele2.kz for verification, transactional and service SMS termination.",
    auth: "apiKey",
    authDetails: {
      scheme: "apiKey",
      type: "header",
      credential: "Partner contract credentials",
    },
    setup: tele2Setup,
  }),
];
