/** Long-form prompt hints for the homepage intent box, inspired by solana.new.
 *  Each hint has a short title + description for the cards, and a full natural-language
 *  prompt that populates the input when clicked or cycles as ghost text.
 */
export const INTENT_PROMPT_HINTS = [
  {
    title: "wise on kaspi",
    description: "cross-border remittance with KZT rails and local bank off-ramps",
    prompt:
      "Build a Wise-style remittance app for Kazakhstan where users send KZT across borders using local bank integrations, with built-in on-ramps via Kaspi and Halyk cards, NBK daily FX rates for transparent pricing, and off-ramps to Kazakh bank accounts through FreedomPay.",
  },
  {
    title: "agent wallet",
    description: "AI agent wallet with spending limits and KZ identity verification",
    prompt:
      "Build an AI agent wallet for Kazakhstan that can hold KZT balance, make programmatic payments via Kaspi Pay, enforce spending limits and guardrails, and verify agent identity using eGov IIN lookup and EDS digital signature.",
  },
  {
    title: "food delivery",
    description: "last-mile delivery with maps, address autocomplete, and QR checkout",
    prompt:
      "Build a food delivery app for Almaty with 2GIS address autocomplete and geocoding, courier route ETAs via Yandex Maps, delivery zone polygons, and Kaspi QR settlement at the customer's door.",
  },
  {
    title: "city dashboard",
    description: "Astana city dashboard with open data, weather, and maps",
    prompt:
      "Build a city dashboard for Astana that visualizes data.egov.kz population and demographic statistics, Kazhydromet weather forecasts and air quality, 2GIS places search, and Yandex Maps static tiles for location context.",
  },
  {
    title: "marketplace onboarding",
    description: "merchant KYC with eGov, e-signature, and Halyk payouts",
    prompt:
      "Build a marketplace merchant onboarding flow for Kazakhstan with eGov IIN verification, EDS e-signature for contracts, Halyk ePay seller payouts, and Kazakh/Russian locale support for the storefront.",
  },
  {
    title: "mobile banking",
    description: "personal finance app with NBK rates, FX alerts, and card payments",
    prompt:
      "Build a mobile banking app for Kazakhstan showing NBK daily KZT foreign exchange rates, FX rate alerts, card payments via Kaspi Pay, and account balance summaries using open banking APIs.",
  },
  {
    title: "travel planner",
    description: "intercity travel with KTZ trains, Aviata flights, and weather",
    prompt:
      "Build a Kazakhstan travel planner that combines KTZ train schedules, Aviata.kz flight search, Air Astana routes, and Kazhydromet weather forecasts for each destination so travelers can plan door-to-door trips.",
  },
  {
    title: "gov data explorer",
    description: "explore data.egov.kz datasets with search, charts, and filters",
    prompt:
      "Build an open data explorer for Kazakhstan that searches data.egov.kz datasets, filters by category and region, renders charts from stat.gov.kz indicators, and exports downloadable data tables.",
  },
];

/** Convenience array of the long prompts, for the typewriter ghost text. */
export const INTENT_PROMPT_LINES = INTENT_PROMPT_HINTS.map((h) => h.prompt);
