const CAVEAT =
  "Still handle empty rows, schema changes, pagination, stale coverage, and temporary upstream failures.";

export function openTrust(source, sourceUrl, lastChecked = null) {
  return {
    level: "copy-paste",
    label: "Copy-paste ready",
    source,
    sourceUrl,
    sourceType: "Official open-data catalogue",
    endpointType: "Open-data catalogue JSON",
    auth: "none",
    authLabel: "No auth",
    lastChecked,
    rateLimit: null,
    caveat: CAVEAT,
  };
}

export function apiKeyTrust(source, sourceUrl, lastChecked = null) {
  return {
    level: "setup",
    label: "API key required",
    source,
    sourceUrl,
    sourceType: "Official open-data portal",
    endpointType: "REST JSON API",
    auth: "apiKey",
    authLabel: "API key",
    lastChecked,
    rateLimit: "Per key limits apply",
    caveat: "Register for a free API key on the portal. Handle key rotation and upstream rate limits.",
  };
}

export function commercialTrust(source, sourceUrl, auth = "apiKey") {
  return {
    level: "docs",
    label: "See provider docs",
    source,
    sourceUrl,
    sourceType: "Commercial provider",
    endpointType: "Provider REST API",
    auth,
    authLabel: auth === "oauth" ? "OAuth" : auth === "token" ? "Token" : "API key",
    lastChecked: null,
    rateLimit: "Provider-specific",
    caveat: "Commercial API — register with the provider, review pricing and terms before shipping.",
  };
}

export function copySetup(endpoint, docs, sourceLabel) {
  return {
    level: "copy-paste",
    label: "COPY-PASTE SETUP",
    summary: "No auth needed. You can call this directly and iterate from the live response.",
    docs,
    docsLabel: "Docs",
    sections: [
      {
        title: "Call it",
        items: [
          "GET " + endpoint,
          "Start with a small limit or narrow filter before loading large tables.",
          "Open the official source (" + sourceLabel + ") for field definitions and coverage.",
          "Use the live preview to confirm response shape.",
        ],
      },
      {
        title: "Ship it",
        items: [
          "Handle empty rows, schema changes, and temporary upstream failures.",
          "Cache responses when the data does not need to be live.",
        ],
      },
    ],
  };
}

export const DATA_EGOV_PORTAL = "https://data.egov.kz/profile/apikeylist";
export const DATA_EGOV_REGISTER = "https://idp.egov.kz/idp/register.jsp";

export function keySetup(docs, portalUrl = DATA_EGOV_PORTAL) {
  return {
    level: "setup",
    label: "API KEY SETUP",
    summary: "Register for a free API key on the Open Data portal, then pass it on every request.",
    docs,
    docsLabel: "Docs",
    portalUrl,
    registerUrl: DATA_EGOV_REGISTER,
    sections: [
      {
        title: "Get a key",
        items: [
          "Register at " + DATA_EGOV_REGISTER + " (or sign in on data.egov.kz).",
          "Open Developer Cabinet at " + portalUrl + " and copy your API key.",
          "Use Qazaq Stack's key setup to validate and save the key in your browser for all ~140 datasets.",
        ],
      },
      {
        title: "Ship it",
        items: [
          "Never expose production keys in client-side code.",
          "Cache responses and respect rate limits.",
        ],
      },
    ],
  };
}

export const YANDEX_DEV_PORTAL = "https://developer.tech.yandex.com/";
export const YANDEX_OAUTH = "https://oauth.yandex.com/";

export function yandexKeySetup(docs, product = "Maps API") {
  return {
    level: "setup",
    label: "API KEY SETUP",
    summary: `Register in the Yandex Developer Dashboard, connect ${product}, and copy your API key.`,
    docs,
    docsLabel: "Docs",
    portalUrl: YANDEX_DEV_PORTAL,
    registerUrl: YANDEX_DEV_PORTAL,
    sections: [
      {
        title: "Get a key",
        items: [
          "Sign in at developer.tech.yandex.com and create a project.",
          "Connect the product you need (Geocoder, Router, Static API, etc.).",
          "Copy the API key — it activates within about 15 minutes.",
        ],
      },
      {
        title: "Ship it",
        items: [
          "Never expose production keys in client-side code without request signing.",
          "Yandex Maps APIs require TLS with SNI on server-side callers.",
        ],
      },
    ],
  };
}

export function yandexOAuthSetup(docs, scopes = "metrika:read") {
  return {
    level: "setup",
    label: "OAUTH SETUP",
    summary: "Create a Yandex OAuth app, grant the required scopes, and pass the token in Authorization headers.",
    docs,
    docsLabel: "Docs",
    portalUrl: YANDEX_OAUTH,
    registerUrl: `${YANDEX_OAUTH}?dialog=create-client-entry`,
    sections: [
      {
        title: "Get a token",
        items: [
          `Create an OAuth app at oauth.yandex.com with scopes: ${scopes}.`,
          "Authorize and copy the OAuth token for server-side API calls.",
          "Pass Authorization: OAuth <token> on every request.",
        ],
      },
      {
        title: "Ship it",
        items: [
          "Refresh or rotate tokens before expiry.",
          "Scope tokens to the minimum counters/apps you need.",
        ],
      },
    ],
  };
}

export function yandexCloudSetup(docs, service = "Yandex Cloud") {
  return {
    level: "setup",
    label: "CLOUD IAM SETUP",
    summary: `Create a Yandex Cloud folder, service account, and IAM credentials for ${service}.`,
    docs,
    docsLabel: "Docs",
    portalUrl: "https://console.cloud.yandex.com/",
    registerUrl: "https://console.cloud.yandex.com/",
    sections: [
      {
        title: "Get credentials",
        items: [
          "Create a folder in the Yandex Cloud console.",
          "Create a service account with the minimum role for this service.",
          "Issue an IAM token or authorized key for API calls.",
        ],
      },
      {
        title: "Ship it",
        items: [
          "Rotate service account keys on a schedule.",
          "Use separate folders for staging and production.",
        ],
      },
    ],
  };
}

export function yandexPaySetup(docs) {
  return {
    level: "setup",
    label: "YANDEX PAY SETUP",
    summary: "Register in the Yandex Pay console, obtain API keys, and implement Merchant API endpoints on your backend.",
    docs,
    docsLabel: "Docs",
    portalUrl: "https://console.pay.yandex.ru/",
    registerUrl: "https://console.pay.yandex.ru/",
    sections: [
      {
        title: "Get started",
        items: [
          "Register your shop in the Yandex Pay developer console.",
          "Copy the API key and configure Callback URL with your public backend IP.",
          "Implement /v1/order/render, /v1/order/create, and /v1/webhook on your server.",
        ],
      },
      {
        title: "Ship it",
        items: [
          "Verify JWT signatures on incoming Merchant API requests.",
          "Test in sandbox before going live with KZT checkout.",
        ],
      },
    ],
  };
}

export function snippets(endpoint) {
  const safe = endpoint.replace(/'/g, "\\'");
  return {
    curl: "curl '" + safe + "'",
    python:
      'import requests\n\nurl = "' +
      endpoint +
      '"\ndata = requests.get(url).json()\nprint(data)',
    js:
      'const res = await fetch("' +
      endpoint +
      '");\nconst data = await res.json();\nconsole.log(data);',
    prompt:
      "I'm building an app using a free Kazakhstan API (no auth needed).\n\nEndpoint: GET " +
      endpoint +
      "\nIt returns JSON.\n\nHelp me fetch this and build a simple page that displays it nicely. Include basic production safeguards for errors, empty responses, schema changes, caching, and rate limits.",
  };
}
