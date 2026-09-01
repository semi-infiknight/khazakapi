import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProviderKeyCard from "../components/ProviderKeyCard.jsx";
import { countSavedKeys, listKeyProviderGroups, listKeyProviders } from "../lib/providerKeys.js";

export default function KeysPage() {
  const [params] = useSearchParams();
  const focus = params.get("provider") || params.get("focus");
  const savedCount = countSavedKeys();
  const totalProviders = listKeyProviders().length;
  const groups = useMemo(() => listKeyProviderGroups(), []);

  useEffect(() => {
    if (!focus) return undefined;
    const node = document.getElementById(`key-${focus}`);
    if (!node) return undefined;
    node.scrollIntoView({ behavior: "smooth", block: "center" });
    return undefined;
  }, [focus]);

  return (
    <div className="keys-page">
      <div className="container-main keys-page-inner">
        <Link to="/" className="keys-back">
          ← Directory
        </Link>

        <header className="keys-hero panel">
          <div className="keys-hero-copy">
            <p className="keys-kicker">Local key manager</p>
            <h1 className="keys-title">API keys</h1>
            <p className="keys-lead">
              Store provider credentials once in this browser. Qazaq Stack auto-imports them into the API tester — no
              account, no server-side vault, no login.
            </p>
          </div>
          <div className="keys-summary">
            <div className="keys-summary-stat">
              <span className="keys-summary-value">{savedCount}</span>
              <span className="keys-summary-label">saved</span>
            </div>
            <div className="keys-summary-stat">
              <span className="keys-summary-value">{totalProviders}</span>
              <span className="keys-summary-label">providers</span>
            </div>
          </div>
        </header>

        <section className="keys-privacy panel">
          <h2 className="keys-section-title">How storage works</h2>
          <ul className="keys-privacy-list">
            <li>Keys live in your browser&apos;s localStorage only — they never sync to Qazaq Stack accounts.</li>
            <li>When you run &ldquo;Try it out&rdquo;, the key is sent with that single proxy request to the provider.</li>
            <li>data.egov.kz keys are validated once against a live portal request when you save.</li>
            <li>Clear a key any time; other users on shared machines should use a private browser profile.</li>
          </ul>
        </section>

        {groups.map((group) => (
          <section key={group.name} className="keys-group">
            <div className="keys-group-head">
              <h2 className="keys-section-title">{group.name}</h2>
              <span className="keys-group-count">{group.providers.length} slots</span>
            </div>
            <div className="keys-grid">
              {group.providers.map((provider) => (
                <ProviderKeyCard
                  key={provider.id}
                  providerId={provider.id}
                  focused={focus === provider.id}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
