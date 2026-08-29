import { useState } from "react";
import { logoHue, providerInitials } from "../lib/categoryStyle.js";
import { providerBrandColor, resolveCompanySlug, resolveProviderLogo } from "../lib/providerLogos.js";

export default function ApiLogo({ api, size = 44 }) {
  const logo = resolveProviderLogo(api);
  const slug = resolveCompanySlug(api);
  const brand = providerBrandColor(slug);
  const initials = providerInitials(api.companyName || api.provider, api.source);
  const hue = logoHue(api.id || api.title);

  const sources = logo ? [logo.src, ...(logo.fallbacks || [])] : [];
  const [sourceIndex, setSourceIndex] = useState(0);
  const failed = !logo || sourceIndex >= sources.length;
  const src = sources[sourceIndex];

  if (!failed) {
    return (
      <div className="api-card-logo api-card-logo--image" style={{ width: size, height: size }}>
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setSourceIndex((i) => i + 1)}
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
