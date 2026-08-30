/**
 * Atomic capability vocabulary — matched in catalogue text and scavenged provider docs.
 * Each atom maps to one or more product feature IDs in capabilityMap.js.
 */

/** @typedef {{ id: string, label: string, featureIds: string[], patterns: RegExp[] }} CapabilityAtom */

/** @type {CapabilityAtom[]} */
export const CAPABILITY_VOCABULARY = [
  { id: "geocode", label: "Geocoding", featureIds: ["forward-geocode", "reverse-geocode", "address-geocoding"], patterns: [/\bgeocod/i, /\bcoordinates?\b/i, /\blat(?:itude)?\b.*\blng\b/i] },
  { id: "forward-geocode", label: "Forward geocode", featureIds: ["forward-geocode"], patterns: [/\bforward geocod/i, /\baddress to coord/i] },
  { id: "reverse-geocode", label: "Reverse geocode", featureIds: ["reverse-geocode"], patterns: [/\breverse geocod/i, /\bcoord.*to address/i] },
  { id: "address-autocomplete", label: "Address autocomplete", featureIds: ["address-autocomplete"], patterns: [/\bautocomplete\b/i, /\bgeosuggest\b/i, /\btypeahead\b/i, /\bsuggest.*address/i] },
  { id: "poi-search", label: "POI search", featureIds: ["poi-search"], patterns: [/\bpoi\b/i, /\bplaces?\b/i, /\borganization search\b/i, /\bstore locator\b/i] },
  { id: "distance-matrix", label: "Distance matrix", featureIds: ["delivery-eta"], patterns: [/\bdistance matrix\b/i, /\bdist_matrix\b/i, /\bget_dist_matrix\b/i, /\btravel time matrix\b/i] },
  { id: "delivery-eta", label: "Delivery ETA", featureIds: ["delivery-eta"], patterns: [/\beta\b/i, /\barrival time\b/i, /\bdelivery time\b/i] },
  { id: "routing", label: "Routing", featureIds: ["route-planning", "logistics-routing"], patterns: [/\brouting\b/i, /\brouter\b/i, /\bnavigation\b/i, /\bturn.by.turn\b/i] },
  { id: "route-planning", label: "Route planning", featureIds: ["route-planning"], patterns: [/\broute planning\b/i, /\bdirections\b/i, /\bdrive route\b/i] },
  { id: "isochrone", label: "Isochrone", featureIds: ["delivery-zones"], patterns: [/\bisochrone\b/i, /\breachable area\b/i, /\bservice area\b/i] },
  { id: "delivery-zones", label: "Delivery zones", featureIds: ["delivery-zones"], patterns: [/\bdelivery zone\b/i, /\bcoverage (?:area|map)\b/i] },
  { id: "map-display", label: "Map display", featureIds: ["map-display"], patterns: [/\bstatic map\b/i, /\bmap tiles?\b/i, /\bmapkit\b/i, /\bmap widget\b/i, /\brender map\b/i] },
  { id: "static-maps", label: "Static maps", featureIds: ["map-display"], patterns: [/\bstatic maps?\b/i] },
  { id: "device-location", label: "Device location", featureIds: ["device-location"], patterns: [/\blocator\b/i, /\bdevice location\b/i, /\bgps position\b/i, /\bgeolocation\b/i] },
  { id: "public-transport", label: "Public transport", featureIds: ["route-planning", "travel-booking"], patterns: [/\bpublic transport\b/i, /\bmultimodal\b/i, /\bbus route\b/i, /\bmetro\b/i] },
  { id: "admin-regions", label: "Admin regions", featureIds: ["address-geocoding"], patterns: [/\bregion search\b/i, /\bcity id\b/i, /\badmin boundary\b/i] },

  { id: "checkout-payment", label: "Checkout payment", featureIds: ["checkout-payment"], patterns: [/\bpayment gateway\b/i, /\bcheckout\b/i, /\bacquiring\b/i, /\bmerchant api\b/i, /\baccept payment\b/i] },
  { id: "qr-payment", label: "QR payment", featureIds: ["checkout-payment"], patterns: [/\bqr (?:code )?pay/i, /\binterbank qr\b/i, /\bkaspi qr\b/i] },
  { id: "wallet-payout", label: "Wallet payout", featureIds: ["wallet-payout"], patterns: [/\bpayout\b/i, /\bdisbursement\b/i, /\bwallet transfer\b/i] },
  { id: "bank-transfer", label: "Bank transfer", featureIds: ["wallet-payout"], patterns: [/\bbank transfer\b/i, /\bimps\b/i, /\biso.?20022\b/i, /\binterbank transfer\b/i] },
  { id: "bank-accounts", label: "Bank accounts", featureIds: ["bank-accounts"], patterns: [/\baccount aggreg/i, /\bopen banking\b/i, /\baccount balance\b/i, /\b\/accounts\b/i] },
  { id: "open-banking", label: "Open banking", featureIds: ["bank-accounts", "user-auth"], patterns: [/\bopen banking\b/i, /\bconsent flow\b/i, /\bfinid\b/i] },
  { id: "fx-rates", label: "FX rates", featureIds: ["fx-rates"], patterns: [/\bexchange rates?\b/i, /\bforex\b/i, /\bnational bank rate\b/i, /\bcurrency rates?\b/i] },
  { id: "refunds", label: "Refunds", featureIds: ["checkout-payment"], patterns: [/\brefund\b/i, /\bchargeback\b/i, /\breversal\b/i] },
  { id: "subscriptions", label: "Subscriptions", featureIds: ["checkout-payment"], patterns: [/\bsubscription\b/i, /\brecurring payment\b/i] },

  { id: "user-auth", label: "User authentication", featureIds: ["user-auth"], patterns: [/\boauth\b/i, /\blogin\b/i, /\bsign.?in\b/i, /\bidentity\b/i, /\byandex id\b/i] },
  { id: "oauth", label: "OAuth", featureIds: ["user-auth"], patterns: [/\boauth2?\b/i, /\bauthorization code\b/i, /\bbearer token\b/i] },
  { id: "mobile-id", label: "Mobile ID", featureIds: ["user-auth"], patterns: [/\bmobile.?id\b/i, /\be.?gov mobile\b/i, /\bbiometric auth\b/i] },
  { id: "esignature", label: "E-signature", featureIds: ["esignature"], patterns: [/\be.?sign/i, /\bsigex\b/i, /\bdigital signature\b/i, /\beds\b/i] },
  { id: "eds", label: "EDS", featureIds: ["esignature"], patterns: [/\belectronic document\b/i, /\beds\b/i] },

  { id: "sms", label: "SMS", featureIds: ["sms-otp"], patterns: [/\bsms\b/i, /\btext message\b/i, /\bbulk sms\b/i] },
  { id: "sms-otp", label: "SMS OTP", featureIds: ["sms-otp"], patterns: [/\botp\b/i, /\bone.?time password\b/i, /\bverification code\b/i] },

  { id: "food-delivery", label: "Food delivery", featureIds: ["food-delivery-partner"], patterns: [/\bfood delivery\b/i, /\brestaurant order\b/i, /\bglovo\b/i, /\bwolt\b/i, /\byandex eda\b/i] },
  { id: "grocery-delivery", label: "Grocery delivery", featureIds: ["grocery-delivery"], patterns: [/\bgrocery\b/i, /\barbuz\b/i, /\blavka\b/i, /\bquick commerce\b/i] },
  { id: "delivery-partner", label: "Delivery partner", featureIds: ["food-delivery-partner"], patterns: [/\bdelivery partner\b/i, /\bcourier network\b/i, /\blast mile\b/i] },
  { id: "parcel-shipping", label: "Parcel shipping", featureIds: ["parcel-shipping"], patterns: [/\bparcel\b/i, /\bshipping\b/i, /\blogistics api\b/i] },
  { id: "tracking", label: "Shipment tracking", featureIds: ["parcel-shipping"], patterns: [/\btrack(?:ing)?\b/i, /\bshipment status\b/i, /\bawb\b/i] },
  { id: "shipping-rates", label: "Shipping rates", featureIds: ["parcel-shipping"], patterns: [/\btariff\b/i, /\bshipping rate\b/i, /\bcalculator\b/i] },
  { id: "pickup-points", label: "Pickup points", featureIds: ["parcel-shipping"], patterns: [/\bpickup point\b/i, /\bparcel locker\b/i, /\bпвз\b/i] },
  { id: "fleet", label: "Fleet management", featureIds: ["logistics-routing"], patterns: [/\bfleet\b/i, /\bdispatch\b/i, /\bcourier management\b/i] },

  { id: "marketplace-sync", label: "Marketplace sync", featureIds: ["marketplace-sync"], patterns: [/\bmarketplace\b/i, /\bseller api\b/i, /\bwildberries\b/i, /\bozon\b/i] },
  { id: "catalog-sync", label: "Catalog sync", featureIds: ["marketplace-sync"], patterns: [/\bcatalog sync\b/i, /\bproduct feed\b/i, /\binventory sync\b/i] },
  { id: "webhooks", label: "Webhooks", featureIds: ["marketplace-sync", "checkout-payment", "food-delivery-partner"], patterns: [/\bwebhook\b/i, /\bcallback url\b/i, /\bpush notification\b/i] },

  { id: "travel-booking", label: "Travel booking", featureIds: ["travel-booking"], patterns: [/\bbook(?:ing)?\b.*\b(flight|train|ticket)\b/i, /\bgds\b/i] },
  { id: "flights", label: "Flights", featureIds: ["travel-booking"], patterns: [/\bflight\b/i, /\bairline\b/i, /\baviata\b/i] },
  { id: "trains", label: "Trains", featureIds: ["travel-booking"], patterns: [/\btrain\b/i, /\brailway\b/i, /\bktz\b/i] },
  { id: "ride-hailing", label: "Ride-hailing", featureIds: ["ride-hailing"], patterns: [/\btaxi\b/i, /\bride.?hail/i, /\bindriver\b/i, /\byandex go\b/i] },

  { id: "weather-forecast", label: "Weather", featureIds: ["weather-forecast"], patterns: [/\bweather\b/i, /\bforecast\b/i, /\bkazhydromet\b/i] },
  { id: "gov-open-data", label: "Open government data", featureIds: ["gov-open-data"], patterns: [/\bopen data\b/i, /\bdata\.egov\b/i, /\bstat\.gov\b/i, /\bdataset\b/i] },
  { id: "statistics", label: "Statistics", featureIds: ["gov-open-data"], patterns: [/\bstatistics\b/i, /\bindicator\b/i, /\btime series\b/i] },
  { id: "population-stats", label: "Population stats", featureIds: ["population-stats"], patterns: [/\bpopulation\b/i, /\bdemograph/i, /\bbirths\b/i, /\bcensus\b/i] },
  { id: "housing-stats", label: "Housing stats", featureIds: ["housing-stats"], patterns: [/\bhousing\b/i, /\bapartment\b/i, /\breal estate stat/i, /\bcadastr/i] },
  { id: "education-stats", label: "Education stats", featureIds: ["education-stats"], patterns: [/\beducation stat/i, /\bschool enrollment\b/i, /\buniversity\b/i] },
  { id: "health-stats", label: "Health stats", featureIds: ["health-stats"], patterns: [/\bhealth stat/i, /\bhospital\b/i, /\bcovid\b/i, /\bmedical stat/i] },
  { id: "labour-stats", label: "Labour stats", featureIds: ["labour-stats"], patterns: [/\blabou?r\b/i, /\bunemployment\b/i, /\bwage\b/i, /\bworkforce\b/i] },
  { id: "household-stats", label: "Household stats", featureIds: ["household-stats"], patterns: [/\bhousehold\b/i, /\bhies\b/i, /\bincome survey\b/i] },
  { id: "price-indices", label: "Price indices", featureIds: ["price-indices"], patterns: [/\bcpi\b/i, /\bppi\b/i, /\binflation\b/i, /\bconsumer price\b/i] },
  { id: "fuel-prices", label: "Fuel prices", featureIds: ["price-indices"], patterns: [/\bfuel price\b/i, /\bpetrol price\b/i] },
  { id: "public-safety", label: "Public safety", featureIds: ["public-safety"], patterns: [/\bcrime\b/i, /\bpublic safety\b/i, /\bpolice stat/i] },
  { id: "national-accounts", label: "National accounts", featureIds: ["national-accounts"], patterns: [/\bgdp\b/i, /\bnational accounts\b/i, /\bmacroeconomic\b/i] },

  { id: "ai-assistant", label: "AI assistant", featureIds: ["ai-assistant"], patterns: [/\bllm\b/i, /\bgpt\b/i, /\bchatbot\b/i, /\byandexgpt\b/i, /\bgenerative ai\b/i] },
  { id: "llm", label: "LLM", featureIds: ["ai-assistant"], patterns: [/\blarge language model\b/i, /\bcompletion api\b/i] },
  { id: "speech-to-text", label: "Speech to text", featureIds: ["speech-ai"], patterns: [/\bspeechkit\b/i, /\bspeech.to.text\b/i, /\bstt\b/i, /\btranscri(?:be|ption)\b/i] },
  { id: "text-to-speech", label: "Text to speech", featureIds: ["speech-ai"], patterns: [/\btext.to.speech\b/i, /\btts\b/i, /\bspeech synthesis\b/i] },
  { id: "translation", label: "Translation", featureIds: ["speech-ai"], patterns: [/\btranslate\b/i, /\btranslation api\b/i] },
  { id: "computer-vision", label: "Computer vision", featureIds: ["computer-vision"], patterns: [/\bvision api\b/i, /\bocr\b/i, /\bimage recognition\b/i] },
  { id: "voice-assistant", label: "Voice assistant", featureIds: ["ai-assistant"], patterns: [/\balice skill\b/i, /\bvoice assistant\b/i] },
  { id: "ml-models", label: "ML models", featureIds: ["ai-assistant"], patterns: [/\bmachine learning\b/i, /\bcatboost\b/i, /\bdatasphere\b/i, /\bmodel training\b/i] },
  { id: "crowdsourcing", label: "Crowdsourcing", featureIds: ["ai-assistant"], patterns: [/\btoloka\b/i, /\bcrowdsourc/i] },

  { id: "analytics-tracking", label: "Analytics", featureIds: ["analytics-tracking"], patterns: [/\bmetrica\b/i, /\bappmetrica\b/i, /\banalytics\b/i, /\bconversion funnel\b/i] },
  { id: "ads-campaigns", label: "Advertising", featureIds: ["ads-campaigns"], patterns: [/\byandex direct\b/i, /\badvertis/i, /\bcampaign management\b/i, /\bmobile ads\b/i] },
  { id: "tax-invoicing", label: "Tax invoicing", featureIds: ["tax-invoicing"], patterns: [/\besf\b/i, /\be-?invoice\b/i, /\belectronic invoice\b/i, /\bvat report\b/i] },
  { id: "e-invoice", label: "E-invoice", featureIds: ["tax-invoicing"], patterns: [/\be-?invoice\b/i, /\bvirtual warehouse\b/i] },

  { id: "cloud-hosting", label: "Cloud hosting", featureIds: ["cloud-hosting"], patterns: [/\bcloud compute\b/i, /\bvirtual machine\b/i, /\byandex cloud\b/i, /\bps\.kz\b/i] },
  { id: "object-storage", label: "Object storage", featureIds: ["cloud-hosting"], patterns: [/\bobject storage\b/i, /\bs3\b/i, /\bbucket\b/i, /\byandex disk\b/i] },
  { id: "serverless", label: "Serverless", featureIds: ["cloud-hosting"], patterns: [/\bserverless\b/i, /\bcloud functions\b/i, /\blambda\b/i] },
  { id: "managed-db", label: "Managed database", featureIds: ["cloud-hosting"], patterns: [/\bmanaged postgresql\b/i, /\bclickhouse\b/i, /\bmanaged database\b/i] },

  { id: "site-search", label: "Site search", featureIds: ["site-search"], patterns: [/\bsite search\b/i, /\bon-site search\b/i, /\bsearch widget\b/i] },
  { id: "web-search", label: "Web search", featureIds: ["site-search"], patterns: [/\byandex\.xml\b/i, /\bweb search api\b/i, /\bprogrammatic search\b/i] },
  { id: "seo-webmaster", label: "SEO webmaster", featureIds: ["seo-webmaster"], patterns: [/\bwebmaster\b/i, /\bindexing api\b/i, /\bturbo pages\b/i, /\bstructured data validator\b/i] },
  { id: "url-safety", label: "URL safety", featureIds: ["seo-webmaster"], patterns: [/\bsafe browsing\b/i, /\burl reputation\b/i, /\bphishing check\b/i] },
  { id: "browser-api", label: "Browser API", featureIds: ["seo-webmaster"], patterns: [/\bbrowser api\b/i, /\bextension api\b/i] },

  { id: "calendar-scheduling", label: "Calendar", featureIds: ["workplace-productivity"], patterns: [/\bcalendar api\b/i, /\bevents?\b.*\bschedul/i] },
  { id: "project-tracking", label: "Project tracking", featureIds: ["workplace-productivity"], patterns: [/\btracker api\b/i, /\bissue tracking\b/i, /\bproject management\b/i] },
  { id: "forms-surveys", label: "Forms", featureIds: ["workplace-productivity"], patterns: [/\bforms api\b/i, /\bsurvey\b/i, /\blead capture\b/i] },
  { id: "business-email", label: "Business email", featureIds: ["workplace-productivity"], patterns: [/\bmail for domain\b/i, /\bbusiness email\b/i] },
  { id: "org-directory", label: "Org directory", featureIds: ["workplace-productivity", "user-auth"], patterns: [/\borg directory\b/i, /\bemployee directory\b/i, /\byandex 360 connect\b/i] },

  { id: "prayer-times", label: "Prayer times", featureIds: ["prayer-times"], patterns: [/\bprayer time\b/i, /\bsalah\b/i, /\bnamaz\b/i, /\baladhan\b/i] },

  { id: "interest-rates", label: "Interest rates", featureIds: ["interest-rates"], patterns: [/\binterest rate\b/i, /\bdeposit rate\b/i, /\blending rate\b/i, /\byield\b/i, /\bbond yield\b/i] },
  { id: "environment-stats", label: "Environment stats", featureIds: ["environment-stats"], patterns: [/\benvironment stat/i, /\bforest reserve\b/i, /\bemissions\b/i, /\becolog/i] },
  { id: "climate-data", label: "Climate data", featureIds: ["climate-data"], patterns: [/\bclimate\b/i, /\bdrought\b/i, /\btemperature anomaly\b/i] },
  { id: "transport-stats", label: "Transport stats", featureIds: ["transport-stats"], patterns: [/\btransport stat/i, /\bpassenger flow\b/i, /\bfreight stat/i, /\brail stat/i] },
  { id: "trade-statistics", label: "Trade statistics", featureIds: ["trade-statistics"], patterns: [/\bforeign trade\b/i, /\bexport stat/i, /\bimport stat/i, /\btrade balance\b/i] },
  { id: "industry-sectors", label: "Industry sectors", featureIds: ["industry-sectors"], patterns: [/\bindustry output\b/i, /\beconomic sector\b/i, /\bmanufacturing stat/i] },
  { id: "welfare-benefits", label: "Welfare benefits", featureIds: ["welfare-benefits"], patterns: [/\bwelfare\b/i, /\bsocial protection\b/i, /\bpension stat/i, /\bbenefits\b/i] },
  { id: "commodity-prices", label: "Commodity prices", featureIds: ["commodity-prices"], patterns: [/\bcommodity price\b/i, /\bmetal price\b/i, /\bgold price\b/i] },
  { id: "crypto-trading", label: "Crypto trading", featureIds: ["crypto-trading"], patterns: [/\bcrypto\b/i, /\bbitcoin\b/i, /\bblockchain\b/i, /\bdigital asset\b/i] },
  { id: "data-enrichment", label: "Data enrichment", featureIds: ["data-enrichment"], patterns: [/\benrichment\b/i, /\bdata append\b/i, /\bcompany lookup\b/i] },
  { id: "metadata-catalog", label: "Metadata catalog", featureIds: ["metadata-catalog"], patterns: [/\bmetadata catalog\b/i, /\bdataset schema\b/i, /\bdata dictionary\b/i] },
  { id: "realtime-streams", label: "Realtime streams", featureIds: ["realtime-streams"], patterns: [/\brealtime\b/i, /\blive feed\b/i, /\bwebsocket\b/i, /\bstream api\b/i] },
  { id: "gov-digital-services", label: "Gov digital services", featureIds: ["gov-digital-services"], patterns: [/\be.?gov\b/i, /\bgovernment service\b/i, /\bdigital gov\b/i, /\bpublic service api\b/i] },
];

const byId = new Map(CAPABILITY_VOCABULARY.map((a) => [a.id, a]));

export function getCapabilityAtom(id) {
  return byId.get(id) || null;
}

/**
 * Match vocabulary atoms against free text (catalogue note or scavenged docs).
 * @param {string} text
 * @returns {string[]}
 */
export function matchCapabilitiesInText(text) {
  const hay = String(text || "");
  if (!hay.trim()) return [];
  const found = [];
  for (const atom of CAPABILITY_VOCABULARY) {
    if (atom.patterns.some((re) => re.test(hay))) found.push(atom.id);
  }
  return found;
}
