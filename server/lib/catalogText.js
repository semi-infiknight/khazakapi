/**
 * Shared catalogue document text for embedding / TF–IDF indexing.
 */

import { capabilitiesDocumentText } from "./apiCapabilities.js";

export const CATEGORY_HINTS = {
  Payments: "checkout payments wallet billing invoice pay card acquiring merchant",
  "Maps & location": "maps address geocode location nearby places poi autocomplete coordinates",
  "Travel & mobility": "taxi ride routing eta courier fleet navigation mobility transit",
  "Food & delivery": "food delivery restaurant grocery courier last mile order",
  "Logistics & delivery": "parcel shipping logistics courier tracking tariff delivery",
  "E-commerce": "marketplace shop store seller catalog product inventory ecommerce",
  "Banking & finance": "bank banking finance fintech fx exchange rates currency iban",
  Banking: "bank banking finance rates accounts",
  Finance: "finance rates currency markets",
  "Financial Markets": "markets exchange rates securities finance",
  "Government data": "government open data statistics dataset egov public",
  "Government services": "government egov services identity documents",
  "Auth & identity": "login signup auth oauth identity signature verify kyc",
  AI: "ai llm chatbot assistant nlp machine learning gpt",
  Communications: "sms otp telecom analytics ads marketing metrica",
  "Environment & climate": "weather forecast climate temperature environment",
  Environment: "weather climate environment ecology",
  Health: "health hospital clinic medical pharmacy",
  Healthcare: "healthcare hospital medical clinic",
  "Housing & property": "housing property apartment real estate rent cadastral",
  Property: "property real estate housing",
  Transport: "transport trains buses flights tickets railways",
  Transportation: "transportation trains buses flights",
  "Cloud & infrastructure": "cloud hosting storage infrastructure server",
  "E-invoicing & tax": "tax invoice esf einvoice vat kgd",
  Education: "education school university students enrollment literacy",
  Demography: "population demography census society births residents",
  "Population & society": "population society demographics households residents",
  "Housing & property": "housing property apartment real estate rent cadastral construction",
  Property: "property real estate housing",
  Health: "health hospital clinic medical pharmacy covid blood donation",
  Healthcare: "healthcare hospital medical clinic covid",
  "Labour Markets": "labour labor unemployment wages workforce employment jobs",
  Households: "households income survey expenditure living",
  "National Accounts": "gdp national accounts macroeconomic indicators",
  Prices: "prices inflation consumer goods cpi ppi fuel",
  "Public Safety": "crime public safety police fire emergency",
  "Work & income": "income wages employment work",
  Realtime: "realtime live streaming websocket",
  "Data & enrichment": "enrichment validation lookup data quality",
  "Economic Sectors": "economic sectors industry gdp production",
  "Economy & business": "economy business enterprise trade",
};

export function apiDocumentText(api) {
  const caps = capabilitiesDocumentText(api);
  return [
    api.title || "",
    api.category || "",
    api.provider || "",
    api.companyName || "",
    api.source || "",
    api.note || "",
    api.apiType || "",
    api.group || "",
    caps,
  ]
    .filter(Boolean)
    .join(" ");
}

/** TF–IDF fallback only — category hints help sparse lexical match without polluting embeddings. */
export function apiDocumentTextWithHints(api) {
  const hints = CATEGORY_HINTS[api.category] || "";
  return [apiDocumentText(api), hints].filter(Boolean).join(" ");
}

export function apiDocumentId(api) {
  return String(api.id || api.slug || api.title || "");
}
