/**
 * Extended product-feature catalog — granular build/integration/use-case atoms.
 * Merged into FEATURES in features.js for matrix expansion (not all used in suggest extract).
 */

/** @typedef {import('./features.js').Feature} Feature */

/** @param {Partial<Feature> & { id: string, label: string }} f */
function feat(f) {
  return {
    parentId: null,
    why: `Support ${f.label.toLowerCase()} in Kazakhstan product flows`,
    where: "Backend integration, admin tools, or customer-facing screens",
    keywords: [f.label.toLowerCase(), ...(f.keywords || [])],
    capabilityTags: f.capabilityTags || [],
    categories: f.categories || [],
    providers: f.providers || [],
    ...f,
  };
}

/** @type {Feature[]} */
export const EXTENDED_FEATURES = [
  // ── Integration & API plumbing ──
  feat({ id: "rest-api", label: "REST HTTP API", keywords: ["rest api", "http api", "get request", "post request"], capabilityTags: ["webhooks"], categories: ["Cloud & infrastructure", "Data & enrichment"] }),
  feat({ id: "graphql-api", label: "GraphQL API", keywords: ["graphql", "query mutation"], categories: ["Cloud & infrastructure"] }),
  feat({ id: "webhook-callbacks", label: "Webhook callbacks", keywords: ["webhook", "callback url", "event notification"], capabilityTags: ["webhooks"], categories: ["Payments", "E-commerce", "Cloud & infrastructure"] }),
  feat({ id: "oauth-flow", label: "OAuth authorization flow", keywords: ["oauth flow", "authorization code", "refresh token"], capabilityTags: ["oauth", "user-auth"], categories: ["Auth & identity", "Banking & finance"] }),
  feat({ id: "api-key-auth", label: "API key authentication", keywords: ["api key", "apikey", "x-api-key"], categories: ["Cloud & infrastructure", "Government data"] }),
  feat({ id: "bearer-token-auth", label: "Bearer token auth", keywords: ["bearer token", "jwt token"], capabilityTags: ["oauth"], categories: ["Auth & identity"] }),
  feat({ id: "rate-limit-handling", label: "Rate limit handling", keywords: ["rate limit", "throttle", "429"], categories: ["Cloud & infrastructure"] }),
  feat({ id: "retry-backoff", label: "Retry with backoff", keywords: ["retry", "exponential backoff", "resilience"], categories: ["Cloud & infrastructure"] }),
  feat({ id: "idempotent-requests", label: "Idempotent requests", keywords: ["idempotency", "idempotent"], categories: ["Payments", "Cloud & infrastructure"] }),
  feat({ id: "pagination", label: "Paginated results", keywords: ["pagination", "page size", "offset limit"], capabilityTags: ["statistics"], categories: ["Government data", "E-commerce"] }),
  feat({ id: "cursor-pagination", label: "Cursor pagination", keywords: ["cursor pagination", "next page token"], categories: ["Cloud & infrastructure"] }),
  feat({ id: "filtering", label: "Query filtering", keywords: ["filter", "query params", "search filter"], categories: ["Government data", "Maps & location"] }),
  feat({ id: "sorting", label: "Result sorting", keywords: ["sort", "order by", "ascending descending"], categories: ["Government data", "E-commerce"] }),
  feat({ id: "field-selection", label: "Sparse field selection", keywords: ["fields param", "sparse fieldset", "partial response"], categories: ["Cloud & infrastructure"] }),
  feat({ id: "bulk-read", label: "Bulk data reads", keywords: ["bulk read", "batch get", "multi fetch"], categories: ["Government data", "Cloud & infrastructure"] }),
  feat({ id: "sandbox-testing", label: "Sandbox / test mode", keywords: ["sandbox", "test mode", "staging api"], categories: ["Payments", "Banking & finance"] }),
  feat({ id: "production-keys", label: "Production credentials", keywords: ["production key", "live credentials"], categories: ["Payments", "Cloud & infrastructure"] }),
  feat({ id: "api-versioning", label: "Versioned endpoints", keywords: ["api version", "v1 v2", "deprecated"], categories: ["Cloud & infrastructure"] }),
  feat({ id: "error-handling", label: "Structured error handling", keywords: ["error code", "error response", "status code"], categories: ["Cloud & infrastructure"] }),
  feat({ id: "request-logging", label: "Request logging", keywords: ["request log", "audit log", "api log"], categories: ["Cloud & infrastructure"] }),
  feat({ id: "monitoring-alerts", label: "Monitoring & alerts", keywords: ["monitoring", "alert", "uptime", "health check"], categories: ["Cloud & infrastructure", "Realtime"] }),
  feat({ id: "cache-responses", label: "Response caching", keywords: ["cache", "etag", "cache-control"], categories: ["Cloud & infrastructure", "Maps & location"] }),

  // ── Data export & analytics surfaces ──
  feat({ id: "csv-export", label: "CSV export", keywords: ["csv export", "download csv"], capabilityTags: ["gov-open-data"], categories: ["Government data"] }),
  feat({ id: "json-export", label: "JSON export", keywords: ["json export", "json download"], categories: ["Government data", "Cloud & infrastructure"] }),
  feat({ id: "xml-export", label: "XML export", keywords: ["xml export", "xml feed"], categories: ["Government data", "Communications"] }),
  feat({ id: "excel-export", label: "Excel / XLSX export", keywords: ["excel export", "xlsx", "spreadsheet"], categories: ["Government data"] }),
  feat({ id: "pdf-reports", label: "PDF report generation", keywords: ["pdf report", "printable report"], categories: ["Government data", "E-invoicing & tax"] }),
  feat({ id: "etl-pipeline", label: "ETL data pipelines", keywords: ["etl", "data pipeline", "warehouse sync"], categories: ["Government data", "Cloud & infrastructure"] }),
  feat({ id: "data-warehouse", label: "Data warehouse loads", keywords: ["data warehouse", "bigquery", "clickhouse load"], categories: ["Cloud & infrastructure"] }),
  feat({ id: "kpi-dashboard", label: "KPI dashboards", keywords: ["kpi", "key performance", "executive dashboard"], categories: ["Government data", "Banking & finance"] }),
  feat({ id: "time-series-chart", label: "Time-series charts", keywords: ["time series chart", "line chart trend"], parentId: "historical-data", categories: ["Government data", "Financial Markets"] }),
  feat({ id: "year-over-year", label: "Year-over-year comparison", keywords: ["year over year", "yoy", "annual compare"], parentId: "historical-data", categories: ["Government data", "National Accounts"] }),
  feat({ id: "quarter-compare", label: "Quarterly comparison", keywords: ["quarterly", "q1 q2", "quarter compare"], parentId: "historical-data", categories: ["National Accounts", "Financial Markets"] }),
  feat({ id: "map-choropleth", label: "Regional map charts", keywords: ["choropleth", "heatmap map", "regional map"], parentId: "regional-analytics", categories: ["Government data", "Maps & location"] }),
  feat({ id: "embed-widget", label: "Embeddable widgets", keywords: ["embed widget", "iframe embed", "widget"], categories: ["Maps & location", "Government data"] }),
  feat({ id: "mobile-app-backend", label: "Mobile app backend", keywords: ["mobile app", "ios android backend"], categories: ["Payments", "Maps & location", "Travel & mobility"] }),
  feat({ id: "web-app-backend", label: "Web app backend", keywords: ["web app", "spa backend"], categories: ["Cloud & infrastructure"] }),
  feat({ id: "admin-panel", label: "Admin panel integration", keywords: ["admin panel", "back office", "ops console"], categories: ["E-commerce", "Payments"] }),

  // ── Gov / open-data granularity ──
  feat({ id: "oblast-filter", label: "Oblast / region filter", keywords: ["oblast", "region filter", "by region"], parentId: "regional-analytics", categories: ["Government data", "Demography"] }),
  feat({ id: "city-filter", label: "City-level filter", keywords: ["city filter", "almaty", "astana", "by city"], parentId: "regional-analytics", categories: ["Government data", "Population & society"] }),
  feat({ id: "district-filter", label: "District breakdown", keywords: ["district", "rayon", "microregion"], parentId: "regional-analytics", categories: ["Government data"] }),
  feat({ id: "year-filter", label: "Year selector", keywords: ["by year", "annual filter", "year selector"], parentId: "historical-data", categories: ["Government data"] }),
  feat({ id: "gender-breakdown", label: "Gender breakdown", keywords: ["gender", "male female stat"], parentId: "population-stats", categories: ["Demography", "Population & society"] }),
  feat({ id: "age-breakdown", label: "Age cohort analysis", keywords: ["age group", "age cohort", "age breakdown"], parentId: "population-stats", categories: ["Demography", "Population & society"] }),
  feat({ id: "ethnicity-breakdown", label: "Ethnicity breakdown", keywords: ["ethnicity", "ethnic group"], parentId: "population-stats", categories: ["Demography", "Population & society"] }),
  feat({ id: "migration-stats", label: "Migration statistics", keywords: ["migration", "immigration", "emigration"], parentId: "population-stats", categories: ["Demography", "Population & society"] }),
  feat({ id: "birth-death-stats", label: "Births & mortality", keywords: ["birth rate", "mortality", "death rate"], parentId: "health-stats", categories: ["Health", "Demography"] }),
  feat({ id: "marriage-stats", label: "Marriage & family stats", keywords: ["marriage", "divorce", "family stat"], parentId: "population-stats", categories: ["Population & society"] }),
  feat({ id: "survey-microdata", label: "Survey microdata", keywords: ["microdata", "survey data", "sample survey"], parentId: "gov-open-data", categories: ["Households", "Government data"] }),
  feat({ id: "indicator-definitions", label: "Indicator definitions", keywords: ["indicator definition", "methodology", "metadata field"], parentId: "metadata-catalog", categories: ["Metadata", "Statistical Indicators"] }),
  feat({ id: "dataset-revisions", label: "Dataset revision history", keywords: ["revision", "dataset update", "changelog"], parentId: "metadata-catalog", categories: ["Metadata", "Government data"] }),
  feat({ id: "update-schedule", label: "Publication schedule", keywords: ["update frequency", "publication schedule", "release calendar"], parentId: "metadata-catalog", categories: ["Metadata", "Government data"] }),

  // ── Maps & mobility depth ──
  feat({ id: "geofencing", label: "Geofencing", keywords: ["geofence", "geo fence", "enter exit zone"], parentId: "logistics-routing", categories: ["Maps & location"] }),
  feat({ id: "multi-stop-routing", label: "Multi-stop routing", keywords: ["multi stop", "waypoints route", "vrp"], parentId: "route-planning", categories: ["Maps & location", "Logistics & delivery"] }),
  feat({ id: "traffic-aware-routing", label: "Traffic-aware routing", keywords: ["traffic routing", "jam aware", "live traffic"], parentId: "route-planning", categories: ["Maps & location", "Travel & mobility"] }),
  feat({ id: "geocoding-batch", label: "Batch geocoding", keywords: ["batch geocode", "bulk geocode"], parentId: "address-geocoding", categories: ["Maps & location"] }),
  feat({ id: "address-validation", label: "Address validation", keywords: ["address validation", "validate address", "standardize address"], parentId: "address-geocoding", categories: ["Maps & location", "Logistics & delivery"] }),
  feat({ id: "postal-code-lookup", label: "Postal code lookup", keywords: ["postal code", "zip code", "postcode"], parentId: "address-geocoding", categories: ["Maps & location"] }),
  feat({ id: "map-clustering", label: "Map marker clustering", keywords: ["marker cluster", "map cluster"], parentId: "map-display", categories: ["Maps & location"] }),
  feat({ id: "custom-map-markers", label: "Custom map markers", keywords: ["custom marker", "map pin style"], parentId: "map-display", categories: ["Maps & location"] }),
  feat({ id: "static-map-images", label: "Static map images", keywords: ["static map image", "map snapshot"], parentId: "map-display", capabilityTags: ["static-maps"], categories: ["Maps & location"] }),
  feat({ id: "panorama-streetview", label: "Street panorama", keywords: ["panorama", "street view", "photomap"], parentId: "map-display", categories: ["Maps & location"] }),
  feat({ id: "nearby-search", label: "Nearby search", keywords: ["nearby", "near me search", "radius search"], parentId: "poi-search", categories: ["Maps & location"] }),
  feat({ id: "store-locator", label: "Store locator", keywords: ["store locator", "branch finder"], parentId: "poi-search", categories: ["Maps & location", "E-commerce"] }),
  feat({ id: "courier-tracking", label: "Courier live tracking", keywords: ["courier track", "live tracking map"], parentId: "delivery-eta", categories: ["Logistics & delivery", "Food & delivery"] }),
  feat({ id: "delivery-slot-booking", label: "Delivery slot booking", keywords: ["delivery slot", "time window booking"], parentId: "delivery-eta", categories: ["Food & delivery", "Grocery delivery"] }),

  // ── Payments & fintech depth ──
  feat({ id: "payment-links", label: "Payment links", keywords: ["payment link", "pay by link"], parentId: "checkout-payment", categories: ["Payments"] }),
  feat({ id: "qr-checkout", label: "QR checkout flow", keywords: ["qr checkout", "scan to pay"], parentId: "checkout-payment", capabilityTags: ["qr-payment"], categories: ["Payments"] }),
  feat({ id: "recurring-billing", label: "Recurring billing", keywords: ["recurring billing", "subscription billing"], parentId: "checkout-payment", capabilityTags: ["subscriptions"], categories: ["Payments"] }),
  feat({ id: "split-payments", label: "Split payments", keywords: ["split payment", "split bill"], parentId: "checkout-payment", categories: ["Payments", "Food & delivery"] }),
  feat({ id: "refund-flow", label: "Refund processing", keywords: ["refund process", "money back"], parentId: "checkout-payment", capabilityTags: ["refunds"], categories: ["Payments", "E-commerce"] }),
  feat({ id: "payment-status", label: "Payment status polling", keywords: ["payment status", "transaction status"], parentId: "checkout-payment", categories: ["Payments"] }),
  feat({ id: "transaction-history", label: "Transaction history", keywords: ["transaction history", "payment history"], parentId: "bank-accounts", categories: ["Banking & finance", "Payments"] }),
  feat({ id: "merchant-dashboard", label: "Merchant dashboard", keywords: ["merchant dashboard", "seller dashboard"], parentId: "checkout-payment", categories: ["Payments", "E-commerce"] }),
  feat({ id: "invoice-generation", label: "Invoice generation", keywords: ["invoice generate", "billing invoice"], parentId: "tax-invoicing", categories: ["E-invoicing & tax", "Payments"] }),
  feat({ id: "vat-calculation", label: "VAT calculation", keywords: ["vat calc", "tax amount"], parentId: "tax-invoicing", categories: ["E-invoicing & tax"] }),
  feat({ id: "currency-converter", label: "Currency converter UI", keywords: ["currency converter", "convert kzt"], parentId: "fx-rates", categories: ["Finance", "Financial Markets"] }),
  feat({ id: "loan-calculator", label: "Loan calculators", keywords: ["loan calculator", "mortgage calc"], parentId: "interest-rates", categories: ["Banking & finance", "Financial Markets"] }),
  feat({ id: "kyc-verification", label: "KYC verification", keywords: ["kyc", "know your customer", "identity verify"], parentId: "user-auth", categories: ["Banking & finance", "Auth & identity"] }),
  feat({ id: "consent-management", label: "Open banking consent", keywords: ["consent management", "account consent"], parentId: "bank-accounts", capabilityTags: ["open-banking"], categories: ["Banking & finance"] }),

  // ── Commerce & delivery ──
  feat({ id: "product-catalog", label: "Product catalog", keywords: ["product catalog", "sku list"], parentId: "marketplace-sync", categories: ["E-commerce"] }),
  feat({ id: "inventory-sync", label: "Inventory sync", keywords: ["inventory sync", "stock level"], parentId: "marketplace-sync", capabilityTags: ["catalog-sync"], categories: ["E-commerce"] }),
  feat({ id: "order-status", label: "Order status tracking", keywords: ["order status", "order tracking"], parentId: "food-delivery-partner", categories: ["E-commerce", "Food & delivery"] }),
  feat({ id: "order-cancellation", label: "Order cancellation", keywords: ["cancel order", "order cancel"], parentId: "food-delivery-partner", categories: ["Food & delivery", "E-commerce"] }),
  feat({ id: "promo-codes", label: "Promo codes & discounts", keywords: ["promo code", "discount code", "coupon"], parentId: "marketplace-sync", categories: ["E-commerce", "Food & delivery"] }),
  feat({ id: "loyalty-points", label: "Loyalty points", keywords: ["loyalty points", "rewards program"], parentId: "marketplace-sync", categories: ["E-commerce"] }),
  feat({ id: "restaurant-menu", label: "Restaurant menu sync", keywords: ["restaurant menu", "menu catalog"], parentId: "food-delivery-partner", categories: ["Food & delivery"] }),
  feat({ id: "kitchen-display", label: "Kitchen / dispatch display", keywords: ["kitchen display", "kds", "dispatch screen"], parentId: "food-delivery-partner", categories: ["Food & delivery"] }),
  feat({ id: "shipping-labels", label: "Shipping label print", keywords: ["shipping label", "label print"], parentId: "parcel-shipping", categories: ["Logistics & delivery", "E-commerce"] }),
  feat({ id: "return-parcels", label: "Return shipments", keywords: ["return shipment", "reverse logistics"], parentId: "parcel-shipping", categories: ["Logistics & delivery", "E-commerce"] }),

  // ── Travel & ride depth ──
  feat({ id: "flight-search", label: "Flight search", keywords: ["flight search", "search flights"], parentId: "travel-booking", capabilityTags: ["flights"], categories: ["Travel & mobility"] }),
  feat({ id: "train-search", label: "Train search", keywords: ["train search", "rail ticket search"], parentId: "travel-booking", capabilityTags: ["trains"], categories: ["Travel & mobility", "Transport"] }),
  feat({ id: "seat-selection", label: "Seat selection", keywords: ["seat selection", "choose seat"], parentId: "travel-booking", categories: ["Travel & mobility"] }),
  feat({ id: "boarding-pass", label: "Boarding pass wallet", keywords: ["boarding pass", "mobile ticket"], parentId: "travel-booking", categories: ["Travel & mobility"] }),
  feat({ id: "ride-estimate", label: "Ride price estimate", keywords: ["ride estimate", "fare estimate", "trip price"], parentId: "ride-hailing", categories: ["Travel & mobility"] }),
  feat({ id: "driver-tracking", label: "Driver live tracking", keywords: ["driver tracking", "driver location"], parentId: "ride-hailing", categories: ["Travel & mobility"] }),
  feat({ id: "trip-history", label: "Trip history", keywords: ["trip history", "ride history"], parentId: "ride-hailing", categories: ["Travel & mobility"] }),

  // ── AI & comms depth ──
  feat({ id: "text-generation", label: "Text generation", keywords: ["text generation", "generate text"], parentId: "ai-assistant", capabilityTags: ["llm"], categories: ["AI"] }),
  feat({ id: "text-summarization", label: "Text summarization", keywords: ["summarize text", "summary api"], parentId: "ai-assistant", categories: ["AI"] }),
  feat({ id: "chat-completion", label: "Chat completions", keywords: ["chat completion", "conversation api"], parentId: "ai-assistant", capabilityTags: ["llm"], categories: ["AI"] }),
  feat({ id: "embeddings-search", label: "Embedding search", keywords: ["embedding", "semantic search vector"], parentId: "ai-assistant", categories: ["AI", "Data & enrichment"] }),
  feat({ id: "content-moderation", label: "Content moderation", keywords: ["moderation", "toxicity filter"], parentId: "ai-assistant", categories: ["AI"] }),
  feat({ id: "voice-input", label: "Voice input (STT)", keywords: ["voice input", "voice to text"], parentId: "speech-ai", capabilityTags: ["speech-to-text"], categories: ["AI"] }),
  feat({ id: "voice-output", label: "Voice output (TTS)", keywords: ["voice output", "read aloud"], parentId: "speech-ai", capabilityTags: ["text-to-speech"], categories: ["AI"] }),
  feat({ id: "document-ocr", label: "Document OCR", keywords: ["document ocr", "scan document"], parentId: "computer-vision", capabilityTags: ["computer-vision"], categories: ["AI", "Government services"] }),
  feat({ id: "email-delivery", label: "Transactional email", keywords: ["transactional email", "send email"], parentId: "workplace-productivity", categories: ["Communications"] }),
  feat({ id: "campaign-analytics", label: "Campaign analytics", keywords: ["campaign analytics", "ad performance"], parentId: "ads-campaigns", categories: ["Communications"] }),
  feat({ id: "conversion-tracking", label: "Conversion tracking", keywords: ["conversion tracking", "goal tracking"], parentId: "analytics-tracking", categories: ["Communications"] }),
  feat({ id: "funnel-analysis", label: "Funnel analysis", keywords: ["funnel analysis", "conversion funnel"], parentId: "analytics-tracking", categories: ["Communications"] }),

  // ── Cloud & workplace ──
  feat({ id: "object-storage-upload", label: "File upload to cloud", keywords: ["file upload", "upload bucket"], parentId: "cloud-hosting", capabilityTags: ["object-storage"], categories: ["Cloud & infrastructure"] }),
  feat({ id: "cdn-delivery", label: "CDN asset delivery", keywords: ["cdn", "asset delivery"], parentId: "cloud-hosting", categories: ["Cloud & infrastructure"] }),
  feat({ id: "serverless-functions", label: "Serverless functions", keywords: ["cloud function", "serverless handler"], parentId: "cloud-hosting", capabilityTags: ["serverless"], categories: ["Cloud & infrastructure"] }),
  feat({ id: "managed-database", label: "Managed database", keywords: ["managed db", "postgresql cloud"], parentId: "cloud-hosting", capabilityTags: ["managed-db"], categories: ["Cloud & infrastructure"] }),
  feat({ id: "team-calendar", label: "Team calendar sync", keywords: ["team calendar", "shared calendar"], parentId: "workplace-productivity", capabilityTags: ["calendar-scheduling"], categories: ["Communications"] }),
  feat({ id: "issue-tracking", label: "Issue tracking", keywords: ["issue tracker", "bug tracking"], parentId: "workplace-productivity", capabilityTags: ["project-tracking"], categories: ["Communications"] }),
  feat({ id: "online-forms", label: "Online forms", keywords: ["online form", "form builder"], parentId: "workplace-productivity", capabilityTags: ["forms-surveys"], categories: ["Communications"] }),

  // ── Health, education, welfare ──
  feat({ id: "hospital-capacity", label: "Hospital capacity stats", keywords: ["hospital capacity", "bed occupancy"], parentId: "health-stats", categories: ["Health", "Healthcare"] }),
  feat({ id: "disease-surveillance", label: "Disease surveillance", keywords: ["disease surveillance", "epidemic monitor"], parentId: "health-stats", categories: ["Health", "Healthcare"] }),
  feat({ id: "school-enrollment", label: "School enrollment data", keywords: ["school enrollment", "pupil count"], parentId: "education-stats", categories: ["Education"], negativeKeywords: ["student app", "homework app", "horse"] }),
  feat({ id: "university-stats", label: "Higher education stats", keywords: ["university stat", "higher ed enrollment"], parentId: "education-stats", categories: ["Education"], negativeKeywords: ["student app", "homework app", "horse"] }),
  feat({ id: "pension-data", label: "Pension statistics", keywords: ["pension data", "retirement stat"], parentId: "welfare-benefits", categories: ["Public Welfare"] }),
  feat({ id: "social-allowances", label: "Social allowances", keywords: ["social allowance", "benefit payment stat"], parentId: "welfare-benefits", categories: ["Public Welfare"] }),

  // ── Localization & KZ context ──
  feat({ id: "kazakh-language", label: "Kazakh language support", keywords: ["kazakh language", "kk locale", "qazaq"], categories: ["Government data", "Communications"] }),
  feat({ id: "russian-language", label: "Russian language support", keywords: ["russian language", "ru locale"], categories: ["Government data", "Communications"] }),
  feat({ id: "multi-language", label: "Multilingual UI", keywords: ["multilingual", "i18n", "localization"], categories: ["Communications", "Travel & mobility"] }),
  feat({ id: "tenge-pricing", label: "KZT / tenge pricing", keywords: ["tenge", "kzt price", "kazakhstan tenge"], categories: ["Payments", "Finance", "Prices"] }),
  feat({ id: "astana-hub", label: "Astana / capital region", keywords: ["astana", "capital region", "nursultan"], categories: ["Government data", "Maps & location"] }),
  feat({ id: "almaty-region", label: "Almaty region data", keywords: ["almaty region", "almaty data"], categories: ["Government data", "Maps & location"] }),
];
