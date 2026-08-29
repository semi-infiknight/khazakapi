import { useState } from "react";
import { logoHue, providerInitials } from "../lib/categoryStyle.js";
import { providerBrandColor, resolveCompanySlug, resolveProviderLogo } from "../lib/providerLogos.js";

export default function ApiLogo({ api, size = 44 }) {
  const [failed, setFailed] = useState(false);
  const logo = resolveProviderLogo(api);
  const slug = resolveCompanySlug(api);
  const brand = providerBrandColor(slug);
  const initials = providerInitials(api.companyName || api.provider, api.source);
  const hue = logoHue(api.id || api.title);

  if (logo && !failed) {
    return (
      <div
        className={`api-card-logo api-card-logo--image ${logo.kind === "remote" ? "api-card-logo--remote" : ""}`}
        style={{ width: size, height: size }}
      >
        <img
          src={logo.src}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  const bg = brand?.bg || `hsl(${hue} 42% 22%)`;
  const text = brand?.text || `hsl(${hue} 55% 88%)`;
  const border = brand?.bg || `hsl(${hue} 35% 32%)`;

  return (
    <div
      className="api-card-logo"
      style={{
        width: size,
        height: size,
        background: bg,
        color: text,
        borderColor: border,
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
