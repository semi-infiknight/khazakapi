import { Link } from "react-router-dom";
import { getProviderIdForApi, getProviderKey, providerInfo } from "../lib/providerKeys.js";

export default function ApiKeyBanner({ api }) {
  const providerId = getProviderIdForApi(api);
  if (!providerId) return null;

  const saved = getProviderKey(providerId);
  const info = providerInfo(providerId);

  return (
    <div className="keys-banner panel mt-4 p-4">
      <div className="keys-banner-row">
        <div>
          <p className="keys-kicker">{info.group}</p>
          <h2 className="keys-banner-title">{info.label} credential</h2>
          <p className="keys-banner-copy">
            {saved
              ? "A key is saved in this browser and will auto-fill in the tester below."
              : "Save your key once in the local key manager to unlock live testing for this provider."}
          </p>
        </div>
        <Link to={`/keys?provider=${encodeURIComponent(providerId)}`} className="btn-metal keys-banner-btn">
          {saved ? "Manage key" : "Add key"}
        </Link>
      </div>
    </div>
  );
}
